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
  // Rastro del mensaje (mig 133): qué plantilla se usó y qué pasó con él de verdad. NULL en las
  // gestiones que no son mensajes y en las anteriores a la migración.
  plantilla_usada?: string | null;
  variables_usadas?: unknown;
  mensaje_id?: string | null;
  mensaje_estado?: string | null;
  mensaje_motivo?: string | null;
  aprobado_por?: string | null;
};

export type ExtrasGestion = {
  plazo_extra_dias?: number; plazo_extra_motivo?: string; plazo_extra_fecha_limite?: string; fecha_compromiso?: string;
  plantilla_usada?: string | null; variables_usadas?: unknown; mensaje_id?: string | null;
  mensaje_estado?: string | null; mensaje_motivo?: string | null; aprobado_por?: string | null;
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
    extras?: ExtrasGestion,
  ) {
    // Las columnas del mensaje solo van si vienen: así una gestión normal (llamada, sirena…)
    // sigue insertando exactamente lo mismo que antes.
    const rastroMensaje = extras && (extras.plantilla_usada !== undefined || extras.mensaje_estado !== undefined)
      ? {
          plantilla_usada: extras.plantilla_usada ?? null,
          variables_usadas: extras.variables_usadas ?? null,
          mensaje_id: extras.mensaje_id ?? null,
          mensaje_estado: extras.mensaje_estado ?? null,
          mensaje_motivo: extras.mensaje_motivo ?? null,
          aprobado_por: extras.aprobado_por ?? null,
        }
      : {};
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
      ...rastroMensaje,
    });
    return { error: error?.message ?? null };
  }

  // Las fichas (cliente y moto) muestran TODA la historia de gestiones, no solo la ventana.
  // Llamarla al montar; es idempotente y en el resto de pantallas no hace falta.
  return { gestiones, loading, registrarGestion, cargarHistorialCompleto: gestionesStore.cargarTodo };
}
