import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";

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

  return { convenios, loading, error, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio, renovarConvenio, abonarCuotaConvenio, marcarIncumplido, eliminarConvenio };
}
