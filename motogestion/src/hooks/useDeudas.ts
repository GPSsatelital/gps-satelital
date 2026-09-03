import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";

// 'migracion' (mig 090): saldo que el cliente traía del sistema viejo de Excel. Existe porque el
// funcionario no tenía dónde marcarlo y lo escribía en la descripción — se encontraron 19 formas
// distintas de decir lo mismo ("EXCEL VIEJO", "EXCELO VIEJO", "Viene del EXCEL SISTEMA VIEJO"...).
// Es una sola cifra ya calculada en el arqueo, NO una semana que se pueda partir en tarifa+ahorro.
export type ConceptoDeuda = "tarifa_atrasada" | "daño_vehiculo" | "prestamo_repuesto" | "prestamo_eventualidad" | "fotomulta" | "multa_recoleccion" | "migracion" | "lavada" | "otro";
export type EstadoDeuda = "pendiente" | "en_convenio" | "pagada";

export type Deuda = {
  id: string;
  contrato_id: string;
  concepto: ConceptoDeuda;
  descripcion: string;
  monto: number;
  monto_pendiente: number;
  estado: EstadoDeuda;
  registrado_por: string | null;
  /** A cuál convenio entró esta deuda (mig 124). Se conserva aunque el convenio termine: es el
   *  rastro, no el estado. null = nunca entró a ninguno. Lo escriben los disparadores de la BD. */
  convenio_id: string | null;
  created_at: string;
};

const deudasStore = createTableStore<Deuda>("deudas");

export function useDeudas() {
  const { data: deudas, loading, error } = deudasStore.useStore();

  async function registrarDeuda(contratoId: string, concepto: ConceptoDeuda, descripcion: string, monto: number, registradoPor: string) {
    const { error } = await supabase.from("deudas").insert({
      contrato_id: contratoId,
      concepto,
      descripcion,
      monto,
      monto_pendiente: monto,
      estado: "pendiente",
      registrado_por: registradoPor,
    });
    return { error: error?.message ?? null };
  }

  async function marcarDeudaPagada(id: string) {
    const { error } = await supabase.from("deudas").update({ estado: "pagada", monto_pendiente: 0 }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function actualizarMontoPendiente(id: string, montoPendiente: number) {
    const estado = montoPendiente <= 0 ? "pagada" : "en_convenio";
    const { error } = await supabase.from("deudas").update({ monto_pendiente: montoPendiente, estado }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function editarDeuda(
    deudaActual: Deuda,
    cambios: { concepto: ConceptoDeuda; descripcion: string; monto: number; monto_pendiente: number },
    editadoPor: string,
  ) {
    // Si el nuevo pendiente llega a 0, se marca pagada — igual que actualizarMontoPendiente.
    // Si ya estaba en convenio y sigue con saldo, conserva ese estado en vez de pisarlo con "pendiente".
    const estado = cambios.monto_pendiente <= 0
      ? "pagada"
      : deudaActual.estado === "en_convenio" ? "en_convenio" : "pendiente";

    const { error } = await supabase.from("deudas").update({ ...cambios, estado }).eq("id", deudaActual.id);
    if (error) return { error: error.message };

    const filas: { contrato_id: string; campo: string; valor_anterior: string; valor_nuevo: string; editado_por: string }[] = [];
    if (cambios.concepto !== deudaActual.concepto) {
      filas.push({ contrato_id: deudaActual.contrato_id, campo: "Deuda: concepto", valor_anterior: deudaActual.concepto, valor_nuevo: cambios.concepto, editado_por: editadoPor });
    }
    if (cambios.descripcion !== deudaActual.descripcion) {
      filas.push({ contrato_id: deudaActual.contrato_id, campo: "Deuda: descripción", valor_anterior: deudaActual.descripcion, valor_nuevo: cambios.descripcion, editado_por: editadoPor });
    }
    if (cambios.monto !== deudaActual.monto) {
      filas.push({ contrato_id: deudaActual.contrato_id, campo: "Deuda: monto original", valor_anterior: String(deudaActual.monto), valor_nuevo: String(cambios.monto), editado_por: editadoPor });
    }
    if (cambios.monto_pendiente !== deudaActual.monto_pendiente) {
      filas.push({ contrato_id: deudaActual.contrato_id, campo: "Deuda: monto pendiente", valor_anterior: String(deudaActual.monto_pendiente), valor_nuevo: String(cambios.monto_pendiente), editado_por: editadoPor });
    }
    if (filas.length > 0) await supabase.from("contratos_auditoria").insert(filas);

    return { error: null };
  }

  async function eliminarDeuda(id: string) {
    const { error } = await supabase.from("deudas").delete().eq("id", id);
    return { error: error?.message ?? null };
  }

  return { deudas, loading, error, registrarDeuda, marcarDeudaPagada, actualizarMontoPendiente, editarDeuda, eliminarDeuda };
}
