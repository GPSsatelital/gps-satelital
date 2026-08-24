import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import type { RenglonPartitura } from "../utils/partituraConvenio";

export type EstadoConvenio = "activo" | "cumplido" | "incumplido" | "renovado";

export type Convenio = {
  id: string;
  contrato_id: string;
  numero_convenio: number;
  deuda_total: number;
  cuota_por_periodo: number;
  numero_cuotas: number;
  cuotas_pagadas: number;
  fecha_limite: string;
  estado: EstadoConvenio;
  concepto: string;
  aprobado_por: string | null;
  cubre_periodo_hasta: string | null; // si el convenio absorbió la cuota del período actual al crearse
  firma_url: string | null; // firma del acuerdo de pago (opcional)
  /** La PARTITURA (mig 116): qué financia este convenio, en pesos y en orden. null = convenio
   *  viejo sin lista — el dueño se la escribe desde el editor, contra el acuerdo firmado. */
  partitura: RenglonPartitura[] | null;
  created_at: string;
};

// Al arrancar, marca como "incumplido" los convenios vencidos sin completar (función de BD,
// mig 032). Fire-and-forget: si falla no bloquea. El realtime del store refresca al terminar.
const conveniosStore = createTableStore<Convenio>("convenios", {
  onStart: () => { supabase.rpc("marcar_convenios_vencidos").then(() => {}, () => {}); },
});

export function useConvenios() {
  const { data: convenios, loading, error } = conveniosStore.useStore();

  function convenioActivoDelContrato(contratoId: string): Convenio | null {
    return convenios.find(c => c.contrato_id === contratoId && c.estado === "activo") ?? null;
  }

  function totalConveniosDelContrato(contratoId: string): number {
    return convenios.filter(c => c.contrato_id === contratoId && c.estado !== "renovado").length;
  }

  async function crearConvenio(contratoId: string, deudaTotal: number, cuotaPorPeriodo: number, numeroCuotas: number, fechaLimite: string, concepto: string, aprobadoPor: string, cubrePeriodoHasta: string | null = null, firmaUrl: string | null = null) {
    const convenioActivo = convenioActivoDelContrato(contratoId);
    if (convenioActivo) return { error: "Ya existe un convenio activo. Debe terminarse antes de crear uno nuevo." };

    const total = totalConveniosDelContrato(contratoId);
    if (total >= 3) return { error: "Este contrato ya alcanzó el máximo de 3 convenios permitidos." };

    const { error } = await supabase.from("convenios").insert({
      contrato_id: contratoId,
      numero_convenio: total + 1,
      deuda_total: deudaTotal,
      cuota_por_periodo: cuotaPorPeriodo,
      numero_cuotas: numeroCuotas,
      cuotas_pagadas: 0,
      fecha_limite: fechaLimite,
      estado: "activo",
      concepto,
      aprobado_por: aprobadoPor,
      cubre_periodo_hasta: cubrePeriodoHasta,
      firma_url: firmaUrl,
    });
    // 23505 = el candado único de la BD rechazó un 2º convenio activo (doble-clic/carrera).
    if (error) return { error: error.code === "23505" ? "Ya existe un convenio activo para este contrato." : error.message };
    return { error: null };
  }

  /**
   * AMPLIAR un convenio activo: le suma una deuda nueva sin tocar nada de lo ya acordado.
   *
   * EL CASO (8-ago-2026): un cliente con convenio activo al que le llega una deuda nueva —una
   * multa de recolección, por ejemplo, que se crea sola— no tenía dónde ponerla. Cartera no
   * ofrece crear un segundo convenio, la deuda `en_convenio` se excluye a propósito (mig 070), y
   * borrar el viejo para rehacerlo PIERDE los abonos (WILLINGTON iba 1/9). El funcionario se
   * quedaba sin salida y la deuda se acumulaba suelta. Son 37 clientes con convenio activo.
   *
   * REGLA DEL DUEÑO que esto cumple: *"los convenios que están hechos deberían quedar así, y
   * mejor sería buscar la forma de arreglarlos sin robarle y sin perder nada"*.
   *
   * POR QUÉ SE MANTIENE LA CUOTA Y SE EXTIENDEN LAS CUOTAS, y no al revés: `cuotas_pagadas` se
   * cuenta en CUOTAS, no en pesos (el trigger hace `floor(abonado / cuota_por_periodo)`). Si se
   * subiera la cuota, esas mismas "1 cuota pagada" pasarían a valer más y se le estaría
   * reescribiendo lo que ya pagó. Manteniendo la cuota, el cliente sigue pagando lo mismo por
   * período —lo que aceptó y firmó— solo que por más tiempo.
   */
  async function ampliarConvenio(
    convenio: Convenio,
    montoExtra: number,
    nuevoNumeroCuotas: number,
    nuevaFechaLimite: string,
    motivo: string,
    ampliadoPor: string,
  ) {
    if (montoExtra <= 0) return { error: "El monto a agregar debe ser mayor a cero." };
    if (convenio.estado !== "activo") return { error: "Solo se puede ampliar un convenio activo." };
    const nuevoTotal = Math.round(convenio.deuda_total + montoExtra);

    // Rastro ANTES de tocar nada: de cuánto a cuánto y por qué. Sin esto, mañana nadie sabría
    // por qué el convenio que el cliente firmó por $513.000 ahora dice $543.000.
    await supabase.from("contratos_auditoria").insert({
      contrato_id: convenio.contrato_id,
      campo: `Convenio #${convenio.numero_convenio}: deuda ampliada`,
      valor_anterior: `$${convenio.deuda_total.toLocaleString("es-CO")} en ${convenio.numero_cuotas} cuotas`,
      valor_nuevo: `$${nuevoTotal.toLocaleString("es-CO")} en ${nuevoNumeroCuotas} cuotas — ${motivo}`,
      editado_por: ampliadoPor,
    });

    const { error } = await supabase.from("convenios").update({
      deuda_total: nuevoTotal,
      numero_cuotas: nuevoNumeroCuotas,
      fecha_limite: nuevaFechaLimite,
      // `cuota_por_periodo` y `cuotas_pagadas` NO se tocan: es lo que protege lo ya pagado.
    }).eq("id", convenio.id).eq("estado", "activo");
    return { error: error?.message ?? null };
  }

  async function renovarConvenio(convenioId: string, contratoId: string, deudaTotal: number, cuotaPorPeriodo: number, numeroCuotas: number, fechaLimite: string, concepto: string, aprobadoPor: string) {
    await supabase.from("convenios").update({ estado: "renovado" }).eq("id", convenioId);
    const total = totalConveniosDelContrato(contratoId);
    const { error } = await supabase.from("convenios").insert({
      contrato_id: contratoId,
      numero_convenio: total,
      deuda_total: deudaTotal,
      cuota_por_periodo: cuotaPorPeriodo,
      numero_cuotas: numeroCuotas,
      cuotas_pagadas: 0,
      fecha_limite: fechaLimite,
      estado: "activo",
      concepto,
      aprobado_por: aprobadoPor,
    });
    return { error: error?.message ?? null };
  }

  async function abonarCuotaConvenio(convenioId: string, cuotasPagadas: number, numeroCuotas: number) {
    const cumplido = cuotasPagadas >= numeroCuotas;
    const { error } = await supabase.from("convenios").update({
      cuotas_pagadas: cuotasPagadas,
      estado: cumplido ? "cumplido" : "activo",
    }).eq("id", convenioId);
    return { error: error?.message ?? null };
  }

  // Elimina un convenio creado por error (solo debe llamarse para ADMIN/ADMIN_PRINCIPAL,
  // se controla en la UI). Sirve para corregir errores humanos — luego se recrea bien.
  async function eliminarConvenio(convenioId: string) {
    const { error } = await supabase.from("convenios").delete().eq("id", convenioId);
    if (!error) conveniosStore.refetch();
    return { error: error?.message ?? null };
  }

  async function marcarIncumplido(convenioId: string) {
    const { error } = await supabase.from("convenios").update({ estado: "incumplido" }).eq("id", convenioId);
    return { error: error?.message ?? null };
  }

  /** Escribe (o corrige) la partitura de un convenio — el editor de los viejos. Queda rastro
   *  completo en la auditoría del contrato: qué decía antes y qué quedó. */
  async function guardarPartitura(convenio: Convenio, partitura: RenglonPartitura[], editadoPor: string) {
    const { error } = await supabase.from("convenios").update({ partitura }).eq("id", convenio.id);
    if (error) return { error: error.message };
    await supabase.from("contratos_auditoria").insert({
      contrato_id: convenio.contrato_id,
      campo: `Partitura del convenio #${convenio.numero_convenio}`,
      valor_anterior: convenio.partitura ? JSON.stringify(convenio.partitura) : "sin partitura",
      valor_nuevo: JSON.stringify(partitura),
      editado_por: editadoPor,
    });
    // Amortización inmediata (mig 117): un convenio viejo con cuotas YA pagadas debe dejar sus
    // deudas envueltas al día AHORA — no cuando al cliente se le ocurra volver a pagar. Es un
    // recálculo idempotente; si el RPC aún no existe (117 sin correr), el próximo pago lo hace.
    await supabase.rpc("amortizar_convenio", { p_convenio_id: convenio.id }).then(() => {}, () => {});
    return { error: null };
  }

  return { convenios, loading, error, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio, ampliarConvenio, renovarConvenio, abonarCuotaConvenio, marcarIncumplido, eliminarConvenio, guardarPartitura };
}
