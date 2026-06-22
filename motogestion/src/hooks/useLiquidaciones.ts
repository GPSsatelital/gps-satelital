import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type MotivoLiquidacion = "cumplimiento" | "retiro_voluntario" | "incumplimiento";
export type EstadoLiquidacion = "iniciada" | "en_taller" | "calculada" | "documento_generado" | "firmada" | "cerrada";

export type DetalleDano = { concepto: string; monto: number };
export type DetalleDeuda = { concepto: string; monto: number };

export type Liquidacion = {
  id: string;
  numero: string;
  contrato_id: string;
  cliente_id: string;
  moto_id: string | null;
  motivo: MotivoLiquidacion;
  estado: EstadoLiquidacion;
  ahorro_acumulado: number;
  total_deudas: number;
  costo_danos: number;
  saldo_final: number;
  detalle_deudas: DetalleDeuda[];
  detalle_danos: DetalleDano[];
  observaciones_taller: string | null;
  nombre_responsable: string | null;
  cargo_responsable: string | null;
  documento_firmado_url: string | null;
  iniciada_por: string | null;
  cerrada_por: string | null;
  created_at: string;
  updated_at: string;
};

async function generarNumero(): Promise<string> {
  const { count } = await supabase.from("liquidaciones").select("*", { count: "exact", head: true });
  const n = (count ?? 0) + 1;
  return `LIQ-${String(n).padStart(4, "0")}`;
}

export function useLiquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiquidaciones = useCallback(async () => {
    const { data } = await supabase
      .from("liquidaciones")
      .select("*")
      .order("created_at", { ascending: false });
    setLiquidaciones((data ?? []) as Liquidacion[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLiquidaciones();
    const channel = supabase
      .channel(`liquidaciones-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "liquidaciones" }, fetchLiquidaciones)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLiquidaciones]);

  async function iniciarLiquidacion(
    contratoId: string,
    clienteId: string,
    motoId: string | null,
    motivo: MotivoLiquidacion,
    iniciadaPor: string,
    ahorroAcumulado: number
  ) {
    const numero = await generarNumero();
    const { error } = await supabase.from("liquidaciones").insert({
      numero,
      contrato_id: contratoId,
      cliente_id: clienteId,
      moto_id: motoId,
      motivo,
      estado: "iniciada",
      ahorro_acumulado: ahorroAcumulado,
      iniciada_por: iniciadaPor,
    });
    if (error) return { error: error.message };

    if (motoId) {
      await supabase.from("motos").update({ estado: "En taller" }).eq("id", motoId);
    }

    return { error: null };
  }

  async function registrarRevisionTaller(
    liquidacionId: string,
    observaciones: string,
    detalleDanos: DetalleDano[],
    costoDanos: number,
    detalleDeudas: DetalleDeuda[],
    totalDeudas: number
  ) {
    const saldoFinal = 0; // se calcula aparte
    const { error } = await supabase.from("liquidaciones").update({
      estado: "calculada",
      observaciones_taller: observaciones,
      detalle_danos: detalleDanos,
      costo_danos: costoDanos,
      detalle_deudas: detalleDeudas,
      total_deudas: totalDeudas,
      saldo_final: saldoFinal,
    }).eq("id", liquidacionId);
    return { error: error?.message ?? null };
  }

  async function calcularSaldo(liquidacionId: string, ahorro: number, deudas: number, danos: number) {
    const saldo = ahorro - deudas - danos;
    const { error } = await supabase.from("liquidaciones").update({
      ahorro_acumulado: ahorro,
      total_deudas: deudas,
      costo_danos: danos,
      saldo_final: saldo,
      estado: "calculada",
    }).eq("id", liquidacionId);
    return { error: error?.message ?? null, saldo };
  }

  async function marcarDocumentoGenerado(liquidacionId: string, nombreResponsable: string, cargoResponsable: string) {
    const { error } = await supabase.from("liquidaciones").update({
      estado: "documento_generado",
      nombre_responsable: nombreResponsable,
      cargo_responsable: cargoResponsable,
    }).eq("id", liquidacionId);
    return { error: error?.message ?? null };
  }

  async function subirDocumentoFirmado(liquidacionId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `${liquidacionId}/firmado.${ext}`;
    const { error: uploadError } = await supabase.storage.from("liquidaciones").upload(path, file, { upsert: true });
    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from("liquidaciones").getPublicUrl(path);
    const { error } = await supabase.from("liquidaciones").update({
      estado: "firmada",
      documento_firmado_url: data.publicUrl,
    }).eq("id", liquidacionId);
    return { error: error?.message ?? null };
  }

  async function confirmarCierre(liquidacionId: string, cerradaPor: string) {
    const liq = liquidaciones.find((l) => l.id === liquidacionId);
    if (!liq) return { error: "Liquidación no encontrada" };

    const { error } = await supabase.from("liquidaciones").update({
      estado: "cerrada",
      cerrada_por: cerradaPor,
    }).eq("id", liquidacionId);
    if (error) return { error: error.message };

    await supabase.from("contratos").update({ estado: "Finalizado" }).eq("id", liq.contrato_id);

    if (liq.saldo_final < 0) {
      await supabase.from("clientes").update({
        lista_negra: true,
        motivo_lista_negra: `Liquidación ${liq.numero}: saldo pendiente $${Math.abs(liq.saldo_final).toLocaleString("es-CO")}`,
      }).eq("id", liq.cliente_id);
    }

    return { error: null };
  }

  return {
    liquidaciones,
    loading,
    iniciarLiquidacion,
    registrarRevisionTaller,
    calcularSaldo,
    marcarDocumentoGenerado,
    subirDocumentoFirmado,
    confirmarCierre,
  };
}
