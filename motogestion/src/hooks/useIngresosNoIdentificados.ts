import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";

// "Dinero sin dueño" (mig 064): plata que entró al banco y ningún cliente reportó como suya.
// Se detecta de dos formas: al cerrar la caja (el banco reporta más de lo registrado) o
// cuando la secretaria la ve en el extracto en cualquier momento. Cuando el cliente aparece
// después, se cruza por el NÚMERO DE REFERENCIA: eso prueba que el dinero sí entró y en qué
// fecha — ya no es "el cliente dice que pagó el lunes".
// En efectivo esto no pasa: se recibe en la mano y se confirma en el acto.
export type IngresoNoIdentificado = {
  id: string;
  fecha_banco: string;        // cuándo entró la plata al banco (la fecha REAL)
  monto: number;
  referencia: string;
  grupo: string | null;
  estado: "pendiente" | "asignado";
  pago_id: string | null;     // a qué pago se le asignó al aparecer el dueño
  registrado_por: string | null;
  nota: string | null;
  created_at: string;
};

const store = createTableStore<IngresoNoIdentificado>("ingresos_no_identificados");

/** Normaliza una referencia para comparar: sin espacios, guiones ni mayúsculas. */
export function normalizarRef(ref: string): string {
  return String(ref || "").replace(/[\s\-.]/g, "").toUpperCase();
}

export function useIngresosNoIdentificados() {
  const { data: ingresos, loading } = store.useStore();

  const pendientes = ingresos.filter(i => i.estado === "pendiente");

  /** Busca una partida sin dueño por su referencia (tolerante a espacios/guiones). */
  function buscarPorReferencia(ref: string): IngresoNoIdentificado | null {
    const r = normalizarRef(ref);
    if (r.length < 3) return null;
    return pendientes.find(i => normalizarRef(i.referencia) === r) ?? null;
  }

  async function registrar(datos: {
    fecha_banco: string;
    monto: number;
    referencia: string;
    grupo?: string | null;
    nota?: string;
    registrado_por?: string | null;
  }) {
    const { error } = await supabase.from("ingresos_no_identificados").insert({
      fecha_banco: datos.fecha_banco,
      monto: datos.monto,
      referencia: datos.referencia.trim(),
      grupo: datos.grupo ?? null,
      nota: datos.nota ?? null,
      registrado_por: datos.registrado_por ?? null,
      estado: "pendiente",
    });
    // 23505 = índice único parcial: esa referencia ya está esperando dueño.
    if (error?.code === "23505") return { error: "Ya hay una transferencia sin identificar con esa referencia." };
    return { error: error?.message ?? null };
  }

  /**
   * Marca la partida como asignada al pago que finalmente la reclamó.
   * El filtro `estado=pendiente` es el candado: si otro pago se le adelantó (o el store local
   * venía desactualizado), el update no toca nada y avisamos — así la misma plata del banco
   * no puede quedar respaldando dos pagos distintos.
   */
  async function asignarAPago(id: string, pagoId: string) {
    const { data, error } = await supabase
      .from("ingresos_no_identificados")
      .update({ estado: "asignado", pago_id: pagoId })
      .eq("id", id)
      .eq("estado", "pendiente")
      .is("pago_id", null)
      .select("id");
    if (error) return { error: error.message };
    if (!data || data.length === 0)
      return { error: "Esa transferencia del banco YA estaba asignada a otro pago. No la des por comprobada: revisa el extracto." };
    return { error: null };
  }

  /**
   * Consume una partida por el valor de un pago. Solo la cierra si el pago la cubre completa;
   * si el pago es menor, el remanente SIGUE en la bolsa esperando dueño (nunca desaparece
   * plata del rastro porque alguien reclamó una parte).
   */
  async function consumirPorPago(i: IngresoNoIdentificado, pagoId: string, valor: number) {
    const resto = Math.round(i.monto) - Math.round(valor);
    if (resto <= 0) return asignarAPago(i.id, pagoId);
    const { data, error } = await supabase
      .from("ingresos_no_identificados")
      .update({
        monto: resto,
        nota: `${i.nota ? i.nota + " | " : ""}Parcial: $${Math.round(valor)} asignados al pago ${pagoId}`,
      })
      .eq("id", i.id)
      .eq("estado", "pendiente")
      .select("id");
    if (error) return { error: error.message };
    if (!data || data.length === 0)
      return { error: "Esa transferencia del banco ya no estaba disponible. Revisa el extracto antes de confirmar el pago." };
    return { error: null };
  }

  async function eliminar(id: string) {
    const { error } = await supabase.from("ingresos_no_identificados").delete().eq("id", id);
    return { error: error?.message ?? null };
  }

  return { ingresos, pendientes, loading, buscarPorReferencia, registrar, asignarAPago, consumirPorPago, eliminar };
}
