import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { estadoMotoTrasLiberar } from "./useMotos";
import { hoyISO } from "../utils/fecha";
import { anotarTrabajo } from "../utils/taller";

export type TallerEstado = "Pendiente" | "En diagnóstico" | "En reparación" | "Listo para salida" | "Finalizado";

export type TallerItem = {
  id: string;
  moto_id: string;
  estado_tecnico: TallerEstado;
  /** El problema con el que entró. */
  detalle: string;
  costo: number;
  repuestos: string | null;
  /** Qué se le hizo, una anotación por línea con su fecha (mig 125). */
  trabajo_realizado: string | null;
  /** La deuda que se le registró al cliente por este arreglo; null = no se le cobró (mig 125). */
  deuda_id: string | null;
  fecha_ingreso: string;
  fecha_salida: string | null;
  created_at: string;
};

/** A dónde fue la moto al cerrar la orden. `espera_devolucion` = su cliente anda en una prestada. */
export type DestinoAlFinalizar = "espera_devolucion" | "Asignada" | "Disponible" | "En traspaso";

export type NuevoTallerItem = {
  moto_id: string;
  estado_tecnico: TallerEstado;
  detalle: string;
  costo: number;
  repuestos: string | null;
  fecha_ingreso: string;
};

export function useTaller() {
  const [taller, setTaller] = useState<TallerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaller = useCallback(async () => {
    const { data, error } = await supabase
      .from("taller")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTaller((data ?? []) as TallerItem[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTaller();

    const channel = supabase
      .channel(`taller-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "taller" }, () => {
        fetchTaller();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTaller]);

  async function registrarIngreso(nuevo: NuevoTallerItem) {
    const { error: errTaller } = await supabase.from("taller").insert(nuevo);
    if (errTaller) return { error: errTaller.message };

    const { error: errMoto } = await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", nuevo.moto_id);
    return { error: errMoto?.message ?? null };
  }

  async function actualizarEstadoTaller(id: string, estado_tecnico: TallerEstado) {
    const { error } = await supabase.from("taller").update({ estado_tecnico }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function finalizarProceso(id: string, motoId: string): Promise<{ error: string | null; destino?: DestinoAlFinalizar }> {
    const { error: errTaller } = await supabase
      .from("taller")
      .update({ estado_tecnico: "Finalizado", fecha_salida: hoyISO() })
      .eq("id", id);
    if (errTaller) return { error: errTaller.message };

    // Si su cliente anda en una moto PRESTADA, esta NO vuelve a Disponible: es de él y está
    // esperando que se la devuelvan. Como el préstamo deja el contrato apuntando a la prestada,
    // `estadoMotoTrasLiberar` no encontraba contrato y la soltaba al pool — la moto de un cliente
    // quedaba libre para asignársela a otro (caso DQF56I / JOSE SANMARTIN, 7-sep-2026). Se deja
    // en Mantenimiento; la devolución (Inmovilizaciones → Préstamos activos → Devolver) es la
    // que la pone Asignada y regresa el contrato a su placa.
    const { data: prest } = await supabase
      .from("prestamos_reemplazo").select("id")
      .eq("moto_original_id", motoId).eq("estado", "activo").limit(1);
    if (prest && prest.length > 0) return { error: null, destino: "espera_devolucion" };

    // La moto no siempre queda "Disponible" al salir del taller: si todavía tiene un
    // contrato Activo, vuelve a "Asignada" (el cliente la sigue esperando).
    const estadoMoto = await estadoMotoTrasLiberar(motoId);
    const { error: errMoto } = await supabase.from("motos").update({ estado: estadoMoto }).eq("id", motoId);
    return { error: errMoto?.message ?? null, destino: estadoMoto };
  }

  /** Agrega una anotación de trabajo realizado (con fecha) debajo de las anteriores. */
  async function anotarTrabajoOrden(id: string, previo: string | null, texto: string) {
    const nuevo = anotarTrabajo(previo, texto, hoyISO());
    const { error } = await supabase.from("taller").update({ trabajo_realizado: nuevo }).eq("id", id);
    return { error: error?.message ?? null };
  }

  /** Deja ligada la orden a la deuda que se le registró al cliente por este arreglo. */
  async function vincularDeuda(id: string, deudaId: string) {
    const { error } = await supabase.from("taller").update({ deuda_id: deudaId }).eq("id", id);
    return { error: error?.message ?? null };
  }

  return { taller, loading, error, registrarIngreso, actualizarEstadoTaller, finalizarProceso, anotarTrabajoOrden, vincularDeuda };
}
