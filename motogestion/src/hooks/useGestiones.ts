import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import { createTableStore } from "./createTableStore";

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
  fecha_compromiso: string | null;
  registrado_por: string | null;
  fecha: string;
  created_at: string;
};

const gestionesStore = createTableStore<Gestion>("gestiones_cobro");

export function useGestiones() {
  const { data: gestiones, loading } = gestionesStore.useStore();

  async function registrarGestion(
    contratoId: string,
    tipo: TipoGestion,
    resultado: string,
    registradoPor: string,
    extras?: { plazo_extra_dias?: number; plazo_extra_motivo?: string; plazo_extra_fecha_limite?: string; fecha_compromiso?: string },
  ) {
    const { error } = await supabase.from("gestiones_cobro").insert({
      contrato_id: contratoId,
      tipo,
      resultado,
      registrado_por: registradoPor,
      fecha: hoyISO(),
      plazo_extra_dias: extras?.plazo_extra_dias ?? null,
      plazo_extra_motivo: extras?.plazo_extra_motivo ?? null,
      plazo_extra_fecha_limite: extras?.plazo_extra_fecha_limite ?? null,
      fecha_compromiso: extras?.fecha_compromiso ?? null,
    });
    return { error: error?.message ?? null };
  }

  return { gestiones, loading, registrarGestion };
}
