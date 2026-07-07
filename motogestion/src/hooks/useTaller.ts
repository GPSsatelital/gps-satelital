import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { estadoMotoTrasLiberar } from "./useMotos";
import { hoyISO } from "../utils/fecha";

export type TallerEstado = "Pendiente" | "En diagnóstico" | "En reparación" | "Listo para salida" | "Finalizado";

export type TallerItem = {
  id: string;
  moto_id: string;
  estado_tecnico: TallerEstado;
  detalle: string;
  costo: number;
  repuestos: string | null;
  fecha_ingreso: string;
  fecha_salida: string | null;
  created_at: string;
};

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

  async function finalizarProceso(id: string, motoId: string) {
    const { error: errTaller } = await supabase
      .from("taller")
      .update({ estado_tecnico: "Finalizado", fecha_salida: hoyISO() })
      .eq("id", id);
    if (errTaller) return { error: errTaller.message };

    // La moto no siempre queda "Disponible" al salir del taller: si todavía tiene un
    // contrato Activo, vuelve a "Asignada" (el cliente la sigue esperando).
    const estadoMoto = await estadoMotoTrasLiberar(motoId);
    const { error: errMoto } = await supabase.from("motos").update({ estado: estadoMoto }).eq("id", motoId);
    return { error: errMoto?.message ?? null };
  }

  return { taller, loading, error, registrarIngreso, actualizarEstadoTaller, finalizarProceso };
}
