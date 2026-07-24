import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

// Préstamos de reemplazo (TEMA B): a un cliente se le vara la moto → se le presta otra del
// pool. El swap mueve el contrato del que pide a la placa prestada (GPS correcto) y se guarda
// la placa original para devolverla cuando su moto salga del taller.
export type PrestamoReemplazo = {
  id: string;
  contrato_id: string;
  moto_prestada_id: string;
  moto_original_id: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  tarifa_dia: number;
  estado: "activo" | "cerrado";
  creado_por: string | null;
  created_at: string;
  moto_prestada_estado_previo: string | null;
};

export function usePrestamos() {
  const [prestamos, setPrestamos] = useState<PrestamoReemplazo[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    const { data } = await supabase.from("prestamos_reemplazo").select("*").order("created_at", { ascending: false });
    setPrestamos((data ?? []) as PrestamoReemplazo[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel("prestamos_reemplazo_ch")
      .on("postgres_changes", { event: "*", schema: "public", table: "prestamos_reemplazo" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const prestamoActivoDeContrato = (contratoId: string) =>
    prestamos.find(p => p.contrato_id === contratoId && p.estado === "activo") ?? null;
  const prestamoActivoDeMoto = (motoId: string) =>
    prestamos.find(p => p.moto_prestada_id === motoId && p.estado === "activo") ?? null;

  // Prestar: el contrato del que pide (contratoId) pasa a andar en la placa prestada.
  // La moto original (la suya, en taller) queda guardada para devolverla. GPS/ubicación
  // quedan correctos porque el contrato Activo apunta a la placa que realmente usa.
  async function prestarReemplazo(
    contratoId: string, motoPrestadaId: string, motoOriginalId: string | null,
    creadoPor: string, tarifaDia = 27000,
  ) {
    // Estado previo de la prestada (Disponible o Recuperada) — se guarda para restaurarlo EXACTO
    // al devolverla; si no, una moto que salió del pool Disponible volvería mal como Recuperada.
    const { data: motoPrest } = await supabase.from("motos").select("estado").eq("id", motoPrestadaId).single();
    const estadoPrevio = motoPrest?.estado ?? "Disponible";
    // 1. Swap: el contrato apunta ahora a la placa prestada.
    const { error: errC } = await supabase.from("contratos").update({ moto_id: motoPrestadaId }).eq("id", contratoId);
    if (errC) return { error: errC.message };
    // 2. La prestada queda Asignada (en uso por el que pide).
    const { error: errM } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoPrestadaId);
    if (errM) return { error: errM.message };
    // 3. La suya (original) va/queda en Mantenimiento (taller).
    if (motoOriginalId) {
      const { error: errO } = await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", motoOriginalId);
      if (errO) return { error: errO.message };
    }
    // 4. Registro del préstamo (guarda el estado previo de la prestada).
    const { error: errP } = await supabase.from("prestamos_reemplazo").insert({
      contrato_id: contratoId, moto_prestada_id: motoPrestadaId, moto_original_id: motoOriginalId,
      tarifa_dia: tarifaDia, creado_por: creadoPor, moto_prestada_estado_previo: estadoPrevio,
    });
    return { error: errP?.message ?? null };
  }

  // Devolver: cuando la moto propia sale del taller. El contrato vuelve a su placa original,
  // la prestada regresa al pool (Recuperada) y se cierra el préstamo.
  async function devolverReemplazo(prestamoId: string) {
    const p = prestamos.find(x => x.id === prestamoId);
    if (!p) return { error: "Préstamo no encontrado." };
    if (p.moto_original_id) {
      const { error: e1 } = await supabase.from("contratos").update({ moto_id: p.moto_original_id }).eq("id", p.contrato_id);
      if (e1) return { error: e1.message };
      const { error: e2 } = await supabase.from("motos").update({ estado: "Asignada" }).eq("id", p.moto_original_id);
      if (e2) return { error: e2.message };
    }
    // La prestada vuelve a SU estado previo: Disponible si venía del pool disponible, Recuperada si
    // estaba retenida (desde ahí se resuelve su dueño). Fallback Recuperada para préstamos viejos.
    const estadoDestino = p.moto_prestada_estado_previo ?? "Recuperada";
    const { error: e3 } = await supabase.from("motos").update({ estado: estadoDestino }).eq("id", p.moto_prestada_id);
    if (e3) return { error: e3.message };
    const { error } = await supabase.from("prestamos_reemplazo")
      .update({ estado: "cerrado", fecha_fin: hoyISO() }).eq("id", prestamoId);
    return { error: error?.message ?? null };
  }

  return { prestamos, loading, prestamoActivoDeContrato, prestamoActivoDeMoto, prestarReemplazo, devolverReemplazo };
}
