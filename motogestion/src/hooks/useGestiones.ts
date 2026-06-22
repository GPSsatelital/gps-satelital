import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type TipoGestion =
  | "mensaje_recordatorio"
  | "llamada"
  | "whatsapp"
  | "sirena"
  | "visita"
  | "plazo_extra"
  | "recoleccion"
  | "cobro_campo"
  | "otro";

export type Gestion = {
  id: string;
  contrato_id: string;
  tipo: TipoGestion;
  resultado: string | null;
  plazo_extra_dias: number | null;
  plazo_extra_motivo: string | null;
  plazo_extra_fecha_limite: string | null;
  registrado_por: string | null;
  fecha: string;
  created_at: string;
};

export function useGestiones() {
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGestiones() {
    const { data } = await supabase.from("gestiones_cobro").select("*").order("created_at", { ascending: false });
    setGestiones((data ?? []) as Gestion[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchGestiones();
    const channel = supabase.channel(`gestiones-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "gestiones_cobro" }, fetchGestiones)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function registrarGestion(
    contratoId: string,
    tipo: TipoGestion,
    resultado: string,
    registradoPor: string,
    extras?: { plazo_extra_dias?: number; plazo_extra_motivo?: string; plazo_extra_fecha_limite?: string },
  ) {
    const { error } = await supabase.from("gestiones_cobro").insert({
      contrato_id: contratoId,
      tipo,
      resultado,
      registrado_por: registradoPor,
      fecha: new Date().toISOString().slice(0, 10),
      plazo_extra_dias: extras?.plazo_extra_dias ?? null,
      plazo_extra_motivo: extras?.plazo_extra_motivo ?? null,
      plazo_extra_fecha_limite: extras?.plazo_extra_fecha_limite ?? null,
    });
    return { error: error?.message ?? null };
  }

  return { gestiones, loading, registrarGestion };
}
