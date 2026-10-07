import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { CalculoRodado, RodadoPorDeuda } from "../utils/rodadoPorDeuda";

// RODAR POR DEUDA (D-044, mig 191). La cuenta y el guardado viven en la BASE: aquí solo se llaman.
// `calcular` = la vista previa (no guarda nada). `aplicar` = todo en una transacción con candado.

const num = (v: unknown) => Number(v ?? 0);

export function useRodadosPorDeuda(contratoIds: string[] | null) {
  const [rodados, setRodados] = useState<RodadoPorDeuda[]>([]);
  const clave = (contratoIds ?? []).slice().sort().join(",");

  const cargar = useCallback(async () => {
    if (contratoIds && contratoIds.length === 0) { setRodados([]); return; }
    let q = supabase.from("rodados_por_deuda").select("*").neq("estado", "anulado").order("created_at", { ascending: false });
    if (contratoIds) q = q.in("contrato_id", contratoIds);
    const { data, error } = await q;
    // Sin la mig 191 la tabla no existe: la pantalla sigue sin el módulo.
    if (!error) setRodados(((data ?? []) as RodadoPorDeuda[]).map(r => ({
      ...r, valor_semana: num(r.valor_semana), debia_total: num(r.debia_total), monto_rodado: num(r.monto_rodado),
      monto_a_cobrar: num(r.monto_a_cobrar), sobrante: num(r.sobrante), queda_debiendo: num(r.queda_debiendo),
      acuerdo_monto_corrido: num(r.acuerdo_monto_corrido),
    })));
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { cargar(); }, [cargar]);

  return { rodados, recargar: cargar };
}

export async function calcularRodado(contratoId: string): Promise<{ calculo: CalculoRodado | null; error: string | null }> {
  const { data, error } = await supabase.rpc("calcular_rodado_por_deuda", { p_contrato: contratoId });
  if (error) return { calculo: null, error: error.message };
  return { calculo: data as CalculoRodado, error: null };
}

export async function aplicarRodado(p: {
  contratoId: string; videoUrl: string; documentoUrl: string; firmaClienteUrl: string;
  firmaAcompananteUrl: string | null; semanasEsperadas: number;
}): Promise<{ rodado: RodadoPorDeuda | null; error: string | null }> {
  const { data, error } = await supabase.rpc("aplicar_rodado_por_deuda", {
    p_contrato: p.contratoId, p_video_url: p.videoUrl, p_documento_url: p.documentoUrl,
    p_firma_cliente_url: p.firmaClienteUrl, p_firma_acompanante_url: p.firmaAcompananteUrl,
    p_semanas_esperadas: p.semanasEsperadas,
  });
  if (error) return { rodado: null, error: error.message };
  return { rodado: data as RodadoPorDeuda, error: null };
}

/** Sube un archivo del rodado al bucket "documentos" (el mismo de los acuerdos de tiempo). */
export async function subirArchivoRodado(contratoId: string, nombre: string, archivo: Blob, tipo: string): Promise<{ url: string | null; error: string | null }> {
  const camino = `rodados/${contratoId}/${Date.now()}-${nombre}`;
  const { error } = await supabase.storage.from("documentos").upload(camino, archivo, { contentType: tipo, upsert: false });
  if (error) return { url: null, error: error.message };
  return { url: supabase.storage.from("documentos").getPublicUrl(camino).data.publicUrl, error: null };
}
