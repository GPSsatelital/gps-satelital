import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

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
  taller_id: string | null;
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

    // Deudas automáticas desde el sistema (solo las pendientes/sin pagar) +
    // saldo restante del convenio activo — el encargado NO las reescribe a mano.
    const { data: deudasPend } = await supabase
      .from("deudas")
      .select("concepto, descripcion, monto_pendiente")
      .eq("contrato_id", contratoId)
      .neq("estado", "pagada");
    const detalleDeudas: DetalleDeuda[] = (deudasPend ?? []).map(d => ({
      concepto: d.descripcion || d.concepto,
      monto: d.monto_pendiente,
    }));
    const { data: convenioActivo } = await supabase
      .from("convenios")
      .select("deuda_total, cuota_por_periodo, cuotas_pagadas")
      .eq("contrato_id", contratoId)
      .eq("estado", "activo")
      .limit(1);
    if (convenioActivo && convenioActivo.length > 0) {
      const cv = convenioActivo[0];
      const restante = Math.max(cv.deuda_total - cv.cuotas_pagadas * cv.cuota_por_periodo, 0);
      if (restante > 0) detalleDeudas.push({ concepto: "Saldo pendiente de convenio", monto: restante });
    }
    const totalDeudas = detalleDeudas.reduce((acc, d) => acc + d.monto, 0);

    // La revisión de taller es obligatoria en toda liquidación: se crea una orden
    // REAL en el módulo de Taller (la ve el mecánico en su lista de siempre) y se
    // vincula a la liquidación — ya no se escribe el estado inválido "En taller".
    let tallerId: string | null = null;
    if (motoId) {
      const { data: orden } = await supabase.from("taller").insert({
        moto_id: motoId,
        estado_tecnico: "Pendiente",
        detalle: `Revisión por liquidación ${numero} — evaluar estado y daños para calcular el saldo`,
        costo: 0,
        fecha_ingreso: hoyISO(),
      }).select("id").single();
      tallerId = orden?.id ?? null;
      await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", motoId);
    }

    const { error } = await supabase.from("liquidaciones").insert({
      numero,
      contrato_id: contratoId,
      cliente_id: clienteId,
      moto_id: motoId,
      motivo,
      estado: motoId ? "en_taller" : "iniciada",
      ahorro_acumulado: ahorroAcumulado,
      total_deudas: totalDeudas,
      detalle_deudas: detalleDeudas,
      taller_id: tallerId,
      iniciada_por: iniciadaPor,
    });
    if (error) return { error: error.message };

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

    // El estado final del contrato depende del MOTIVO: incumplimiento = fin anormal
    // (Cancelado); cumplimiento/retiro_voluntario = fin ordenado (Finalizado).
    const estadoContrato = liq.motivo === "incumplimiento" ? "Cancelado" : "Finalizado";
    await supabase.from("contratos").update({ estado: estadoContrato }).eq("id", liq.contrato_id);

    // Destino de la moto según el motivo: en cumplimiento la moto pasa a ser del
    // cliente ("En traspaso" hasta completar el cambio de titularidad ante tránsito);
    // en los demás casos vuelve a la flota como Disponible.
    if (liq.moto_id) {
      const estadoMoto = liq.motivo === "cumplimiento" ? "En traspaso" : "Disponible";
      await supabase.from("motos").update({ estado: estadoMoto }).eq("id", liq.moto_id);
    }

    // El cliente pasa a "Egresado" si cumplió su contrato (caso feliz — se lleva su moto),
    // o "Retirado" en incumplimiento/retiro voluntario. No se toca si tiene otro contrato
    // Activo (ej. graduación Diario→tiempo definido, donde continúa con el nuevo contrato).
    const { data: otroActivo } = await supabase
      .from("contratos")
      .select("id")
      .eq("cliente_id", liq.cliente_id)
      .in("estado", ["Activo", "En proceso"])
      .neq("id", liq.contrato_id)
      .limit(1);
    if (!otroActivo || otroActivo.length === 0) {
      const estadoCliente = liq.motivo === "cumplimiento" ? "Egresado" : "Retirado";
      await supabase.from("clientes").update({ estado: estadoCliente }).eq("id", liq.cliente_id);
    }

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
