import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type PagoEstado = "Confirmado" | "Pendiente" | "Rechazado";
export type MetodoPago = "Efectivo" | "Transferencia";
export type TipoRegistroPago = "normal" | "campo" | "transferencia";

export type AplicadoPago = {
  tarifa: number;
  baseInicial: number; // cuota de base inicial pendiente (entre cuota pactada y deuda)
  deuda: number;
  convenio: number;
  ahorro: number;
  saldo: number;
};

// Legacy shape kept for compatibility with existing pagos stored as jsonb
export type Aplicado = {
  deuda: number;
  semana: number;
  ahorro: number;
  convenio: number;
  saldo: number;
};

export type Pago = {
  id: string;
  contrato_id: string;
  valor: number;
  metodo: MetodoPago;
  estado: PagoEstado;
  tipo_registro: TipoRegistroPago;
  registrado_por: string | null;
  comprobante_url: string | null;
  aplicado: Aplicado;
  aplicado_tarifa: number;
  aplicado_deuda: number;
  aplicado_convenio: number;
  aplicado_ahorro: number;
  aplicado_saldo_favor: number;
  convenio_id: string | null;
  entregado_caja: boolean;
  folio: string | null;
  ubicacion: { lat: number; lng: number } | null;
  fecha: string;
  created_at: string;
};

// Folio único legible para recibos: CMP-YYMMDD-HHMM
export function generarFolio(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `CMP-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

export type ResumenCobro = {
  cuotaPactadaPendiente: number;
  deudaPendiente: number;
  convenioPendiente: number;
  totalEsperado: number;
};

// Domingo = mitad de la tarifa L–S, redondeada al millar más cercano.
// Si el contrato tiene una tarifa de domingo explícita (tarifa_domingo), se usa esa.
// Ej: nuevo $27.000 → domingo $14.000 · antiguo $26.000 → domingo $13.000
export function calcularCuotaDia(tarifaBase: number, esDomingo: boolean, tarifaDomingo?: number): number {
  if (!esDomingo) return tarifaBase;
  if (tarifaDomingo && tarifaDomingo > 0) return tarifaDomingo;
  return Math.round(tarifaBase / 2 / 1000) * 1000;
}

// Orden estricto: cuota pactada → base inicial pendiente → deuda → convenio → saldo a favor
// baseInicialPendiente: cuota acordada de base inicial (solo si cliente semanal no la tenía completa al firmar)
// El saldo a favor se reserva; solo se aplica cuando el admin/secretaria lo decide manualmente, se devuelve en liquidación
export function calcularAplicacion(
  monto: number,
  cuotaPactada: number,
  baseInicialPendiente: number,
  deudaPendiente: number,
  cuotaConvenio: number,
): AplicadoPago {
  let resto = monto;

  const tarifa = Math.min(resto, cuotaPactada);
  resto -= tarifa;

  const baseInicial = Math.min(resto, baseInicialPendiente);
  resto -= baseInicial;

  const deuda = Math.min(resto, deudaPendiente);
  resto -= deuda;

  const convenio = Math.min(resto, cuotaConvenio);
  resto -= convenio;

  return { tarifa, baseInicial, deuda, convenio, ahorro: 0, saldo: resto };
}

// Calcula si un contrato está en gabela.
// Gabela se activa al finalizar el día de pago sin pago registrado.
// Para contratos diarios: gabela al día siguiente sin pago (1 día de gracia).
export function calcularEstadoMora(
  tipoCiclo: "diario" | "semanal" | "quincenal" | "mensual",
  ultimoPagoFecha: string | null,
  fechaEntrega: string,
  hoy: Date = new Date(),
): "al_dia" | "gabela" | "mora" {
  const inicio = new Date(ultimoPagoFecha ?? fechaEntrega);
  const diasSin = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

  if (tipoCiclo === "diario") {
    if (diasSin <= 1) return "al_dia";   // mismo día o día siguiente = gabela
    if (diasSin === 2) return "gabela";  // 1 día de gracia
    return "mora";
  }
  // semanal/quincenal/mensual: gabela al finalizar el día de pago sin pago
  const ciclo = tipoCiclo === "semanal" ? 7 : tipoCiclo === "quincenal" ? 15 : 30;
  if (diasSin <= ciclo) return "al_dia";
  if (diasSin <= ciclo + 1) return "gabela";
  return "mora";
}

export function calcularResumenCobro(
  cuotaPactada: number,
  deudaPendiente: number,
  cuotaConvenio: number,
  pagosConfirmadosPeriodo: number,
): ResumenCobro {
  const cuotaPactadaPendiente = Math.max(cuotaPactada - pagosConfirmadosPeriodo, 0);
  return {
    cuotaPactadaPendiente,
    deudaPendiente,
    convenioPendiente: cuotaConvenio,
    totalEsperado: cuotaPactadaPendiente + deudaPendiente + cuotaConvenio,
  };
}

export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    const { data, error } = await supabase
      .from("pagos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setPagos((data ?? []) as Pago[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPagos();
    const channel = supabase
      .channel(`pagos-realtime-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pagos" }, () => {
        fetchPagos();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPagos]);

  async function registrarPago(
    contratoId: string,
    valor: number,
    metodo: MetodoPago,
    aplicado: AplicadoPago,
    opts?: { convenioId?: string; tipoRegistro?: TipoRegistroPago; registradoPor?: string; comprobanteUrl?: string; folio?: string; forzarPendiente?: boolean; ubicacion?: { lat: number; lng: number } | null },
  ) {
    const tipoRegistro = opts?.tipoRegistro ?? (metodo === "Efectivo" ? "normal" : "transferencia");
    const estado: PagoEstado = (metodo === "Efectivo" && !opts?.forzarPendiente) ? "Confirmado" : "Pendiente";
    const aplicadoLegacy: Aplicado = {
      deuda: aplicado.deuda,
      semana: aplicado.tarifa,
      ahorro: aplicado.ahorro,
      convenio: aplicado.convenio,
      saldo: aplicado.saldo,
    };
    const aplicadoBaseInicial = aplicado.baseInicial ?? 0;
    const { error } = await supabase.from("pagos").insert({
      contrato_id: contratoId,
      valor,
      metodo,
      estado,
      tipo_registro: tipoRegistro,
      registrado_por: opts?.registradoPor ?? null,
      comprobante_url: opts?.comprobanteUrl ?? null,
      aplicado: aplicadoLegacy,
      aplicado_tarifa: aplicado.tarifa,
      aplicado_base_inicial: aplicadoBaseInicial,
      aplicado_deuda: aplicado.deuda,
      aplicado_convenio: aplicado.convenio,
      aplicado_ahorro: aplicado.ahorro,
      aplicado_saldo_favor: aplicado.saldo,
      convenio_id: opts?.convenioId ?? null,
      folio: opts?.folio ?? null,
      ubicacion: opts?.ubicacion ?? null,
    });
    return { error: error?.message ?? null };
  }

  // Sube la foto del comprobante de transferencia al bucket "comprobantes"
  async function subirComprobante(file: File, contratoId: string): Promise<{ url: string | null; error: string | null }> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${contratoId}/${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("comprobantes").upload(path, file, { upsert: true });
    if (up) return { url: null, error: up.message };
    const { data } = supabase.storage.from("comprobantes").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }

  // Cobro en campo: efectivo recuperado por un admin en la calle. Queda Pendiente (preaprobado)
  // hasta que la secretaria reciba el efectivo físico y lo confirme.
  async function registrarCobroCampo(
    contratoId: string,
    valor: number,
    aplicado: AplicadoPago,
    cobradoPorId: string,
    folio: string,
    extras?: { ubicacion?: { lat: number; lng: number } | null; comprobanteUrl?: string },
  ) {
    return registrarPago(contratoId, valor, "Efectivo", aplicado, {
      tipoRegistro: "campo",
      registradoPor: cobradoPorId,
      folio,
      forzarPendiente: true,
      ubicacion: extras?.ubicacion ?? null,
      comprobanteUrl: extras?.comprobanteUrl,
    });
  }

  // El admin marca que entregó físicamente el efectivo a la secretaria.
  async function marcarEntregadoCaja(id: string) {
    const { error } = await supabase.from("pagos").update({ entregado_caja: true }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function confirmarPago(id: string) {
    const { error } = await supabase.from("pagos").update({ estado: "Confirmado" }).eq("id", id);
    return { error: error?.message ?? null };
  }

  async function rechazarPago(id: string) {
    const { error } = await supabase.from("pagos").update({ estado: "Rechazado" }).eq("id", id);
    return { error: error?.message ?? null };
  }

  // Borrado real de un pago mal ingresado — exclusivo ADMIN_PRINCIPAL (validado también
  // en la UI). Antes de borrar la fila, deja registro en contratos_auditoria (quién, cuándo,
  // qué pago era) para no perder el rastro aunque la fila desaparezca de "pagos". El trigger
  // de BD (aplicar_pago_confirmado) resta automáticamente el ahorro/convenio que ese pago
  // ya le había sumado al contrato, si estaba Confirmado.
  async function eliminarPago(pago: Pago, eliminadoPor: string) {
    await supabase.from("contratos_auditoria").insert({
      contrato_id: pago.contrato_id,
      campo: "Pago eliminado",
      valor_anterior: `$${pago.valor.toLocaleString("es-CO")} · ${pago.metodo} · ${pago.estado} · ${pago.fecha}`,
      valor_nuevo: "(borrado)",
      editado_por: eliminadoPor,
    });
    const { error } = await supabase.from("pagos").delete().eq("id", pago.id);
    return { error: error?.message ?? null };
  }

  function pagosDelContrato(contratoId: string) {
    return pagos.filter(p => p.contrato_id === contratoId);
  }

  function pagosConfirmadosDelContrato(contratoId: string) {
    return pagos.filter(p => p.contrato_id === contratoId && p.estado === "Confirmado");
  }

  function totalAhorroAcumulado(contratoId: string) {
    return pagosConfirmadosDelContrato(contratoId).reduce((acc, p) => acc + (p.aplicado_ahorro ?? 0), 0);
  }

  function totalTarifaAcumulada(contratoId: string) {
    return pagosConfirmadosDelContrato(contratoId).reduce((acc, p) => acc + (p.aplicado_tarifa ?? 0), 0);
  }

  return {
    pagos,
    loading,
    error,
    registrarPago,
    subirComprobante,
    registrarCobroCampo,
    marcarEntregadoCaja,
    confirmarPago,
    rechazarPago,
    eliminarPago,
    pagosDelContrato,
    pagosConfirmadosDelContrato,
    totalAhorroAcumulado,
    totalTarifaAcumulada,
  };
}
