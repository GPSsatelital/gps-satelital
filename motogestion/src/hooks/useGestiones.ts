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

// VENTANA DE 120 DÍAS. `gestiones_cobro` es la tabla que más crece (~36.000 filas al año con
// 1.000 motos, contra ~20.000 de `pagos`) y cinco de las siete pantallas que la usan solo miran
// lo de hoy: campana, alertas, cartera, panel e inmovilizaciones. Las dos que SÍ necesitan la
// historia completa —ficha del cliente y ficha de la moto— llaman `cargarHistorialCompleto()`.
// 120 días cubre de sobra el protocolo de mora, los plazos extra y los convenios en curso.
const gestionesStore = createTableStore<Gestion>("gestiones_cobro", { ventanaDias: 120 });

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

  // Las fichas (cliente y moto) muestran TODA la historia de gestiones, no solo la ventana.
  // Llamarla al montar; es idempotente y en el resto de pantallas no hace falta.
  return { gestiones, loading, registrarGestion, cargarHistorialCompleto: gestionesStore.cargarTodo };
}
