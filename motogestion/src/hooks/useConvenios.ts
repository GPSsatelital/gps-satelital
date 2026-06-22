import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  created_at: string;
};

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchConvenios() {
    const { data, error } = await supabase.from("convenios").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setConvenios((data ?? []) as Convenio[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchConvenios();
    const channel = supabase.channel(`convenios-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "convenios" }, fetchConvenios)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function convenioActivoDelContrato(contratoId: string): Convenio | null {
    return convenios.find(c => c.contrato_id === contratoId && c.estado === "activo") ?? null;
  }

  function totalConveniosDelContrato(contratoId: string): number {
    return convenios.filter(c => c.contrato_id === contratoId && c.estado !== "renovado").length;
  }

  async function crearConvenio(contratoId: string, deudaTotal: number, cuotaPorPeriodo: number, numeroCuotas: number, fechaLimite: string, concepto: string, aprobadoPor: string) {
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
    });
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

  async function marcarIncumplido(convenioId: string) {
    const { error } = await supabase.from("convenios").update({ estado: "incumplido" }).eq("id", convenioId);
    return { error: error?.message ?? null };
  }

  return { convenios, loading, error, convenioActivoDelContrato, totalConveniosDelContrato, crearConvenio, renovarConvenio, abonarCuotaConvenio, marcarIncumplido };
}
