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

  /** Marca la partida como asignada al pago que finalmente la reclamó. */
  async function asignarAPago(id: string, pagoId: string) {
    const { error } = await supabase
      .from("ingresos_no_identificados")
      .update({ estado: "asignado", pago_id: pagoId })
      .eq("id", id);
    return { error: error?.message ?? null };
  }

  async function eliminar(id: string) {
    const { error } = await supabase.from("ingresos_no_identificados").delete().eq("id", id);
    return { error: error?.message ?? null };
  }

  return { ingresos, pendientes, loading, buscarPorReferencia, registrar, asignarAPago, eliminar };
}
