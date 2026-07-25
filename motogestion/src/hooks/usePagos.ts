import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import { hoyISO } from "../utils/fecha";

export type PagoEstado = "Confirmado" | "Pendiente" | "Rechazado";
export type MetodoPago = "Efectivo" | "Transferencia";
// 'adelanto_base': la semana adelantada de la base inicial (LIBRO DE CAJAS, mig 045).
// Pago INTERNO visible en el historial del contrato, pero EXCLUIDO de caja diaria y
// recaudo — esa plata ya entró como base, sumarla otra vez inflaría la caja.
// 'alquiler_reemplazo': el $27.000/día por usar una moto prestada mientras la propia está
// en taller (TEMA B). SÍ cuenta en caja diaria como ingreso, pero el trigger del motor de
// cajas lo IGNORA (mig 053) — no es cuota, no toca el ledger del contrato.
export type TipoRegistroPago = "normal" | "campo" | "transferencia" | "adelanto_base" | "alquiler_reemplazo" | "saldo_favor";

// ¿Este pago cuenta para caja diaria / recaudo del día? (los internos no)
// - adelanto_base: la semana adelantada de la base inicial (ya venía en la base, no es plata del día)
// - saldo_favor: aplicar un saldo a favor existente a una cuota — es crédito viejo, NO entra plata nueva
/**
 * Fecha con la que un pago cuenta para la CAJA del día: el día en que se DIGITÓ.
 * No usar `p.fecha` para caja — esa es la fecha en que el cliente pagó y puede ser anterior
 * (transfirió el domingo, se digitó el lunes). Si la caja usara la fecha real, el dinero
 * digitado hoy se iría a un día ya cerrado y el arqueo de hoy no cuadraría con la plata en mano.
 * Los pagos viejos (antes de la mig 064) tienen fecha_registro = fecha, así que no cambian.
 */
export function fechaDeCaja(p: { fecha: string; fecha_registro?: string | null }): string {
  return p.fecha_registro || p.fecha;
}

export function esPagoDeCaja(p: { tipo_registro?: string | null }): boolean {
  return p.tipo_registro !== "adelanto_base" && p.tipo_registro !== "saldo_favor";
}

// LIBRO DE CAJAS (motor v2): el reparto lo hace LA BASE DE DATOS al confirmar.
// Los puntos de cobro envían este aplicado vacío y el trigger reparte (prorrateo →
// cajas FIFO → deuda → convenio → saldo). Así una pestaña vieja jamás vuelve a
// repartir mal — hay un solo cerebro. El desglose local queda solo como VISTA PREVIA.
export const APLICADO_LO_REPARTE_LA_BD: AplicadoPago = {
  tarifa: 0, baseInicial: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0,
};

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
  // Existen en la BD (mig 013 y 045) y el insert las escribe, pero faltaban en el tipo: sin
  // ellas, un pago que fue al prorrateo (caja 0) o a la base inicial salía "sin desglose".
  aplicado_prorrateo?: number | null;
  aplicado_base_inicial?: number | null;
  convenio_id: string | null;
  entregado_caja: boolean;
  folio: string | null;
  ubicacion: { lat: number; lng: number } | null;
  referencia?: string | null;      // n° de la transferencia (mig 064)
  /** Cuándo PAGÓ el cliente (puede ser anterior a hoy si reportó tarde). Manda para mora e historial. */
  fecha: string;
  /** Cuándo se DIGITÓ el pago. Manda para la caja del día. (mig 064) */
  fecha_registro?: string | null;
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

const pagosStore = createTableStore<Pago>("pagos");

export function usePagos() {
  const { data: pagos, loading, error } = pagosStore.useStore();

  async function registrarPago(
    contratoId: string,
    valor: number,
    metodo: MetodoPago,
    aplicado: AplicadoPago,
    opts?: { convenioId?: string; tipoRegistro?: TipoRegistroPago; registradoPor?: string; comprobanteUrl?: string; folio?: string; forzarPendiente?: boolean; ubicacion?: { lat: number; lng: number } | null; fecha?: string; referencia?: string },
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
      referencia: opts?.referencia ?? null,
      // DOS fechas distintas (mig 064):
      //  · `fecha` = cuándo PAGÓ el cliente. Puede ser anterior a hoy cuando reporta tarde
      //    (transfirió el domingo y avisó el lunes). Manda para mora, historial y recibo.
      //  · `fecha_registro` = cuándo se DIGITÓ. Manda para la caja del día, así el arqueo
      //    cuadra con la plata que hoy está en la mano y ningún cierre anterior se descuadra.
      // Ambas en hora de Colombia: con current_date (UTC) los pagos de noche caían al día siguiente.
      fecha: opts?.fecha || hoyISO(),
      fecha_registro: hoyISO(),
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

  // Aplica un SALDO A FAVOR existente a las cuotas del contrato (motor v2):
  //   1) registra un movimiento INTERNO (tipo saldo_favor → NO cuenta en caja diaria) por el
  //      monto del saldo; el motor lo reparte llenando cajas/deuda/convenio (avanza la cuota).
  //   2) DESCUENTA ese saldo del acumulado (aplicado_saldo_favor negativo), restando el excedente
  //      que el motor haya devuelto a saldo si sobró. No re-dispara el motor (no toca `estado`).
  // Así el saldo baja de verdad y la caja del día no se infla con plata que no entró.
  async function aplicarSaldoFavor(contratoId: string, saldo: number, opts?: { convenioId?: string }) {
    if (saldo <= 0) return { error: "No hay saldo a favor para aplicar." };
    const { data: ins, error: e1 } = await supabase.from("pagos").insert({
      contrato_id: contratoId,
      valor: saldo,
      metodo: "Efectivo",
      estado: "Confirmado",
      tipo_registro: "saldo_favor",
      aplicado: { deuda: 0, semana: 0, ahorro: 0, convenio: 0, saldo: 0 },
      aplicado_tarifa: 0, aplicado_base_inicial: 0, aplicado_deuda: 0, aplicado_convenio: 0,
      aplicado_ahorro: 0, aplicado_saldo_favor: 0, aplicado_prorrateo: 0,
      convenio_id: opts?.convenioId ?? null,
      fecha: hoyISO(),
      fecha_registro: hoyISO(),
    }).select("id").single();
    if (e1 || !ins) return { error: e1?.message ?? "No se pudo aplicar el saldo a favor." };
    // Releer el pago YA repartido por el motor (RETURNING no refleja los triggers AFTER).
    const { data: post } = await supabase.from("pagos")
      .select("aplicado, aplicado_saldo_favor").eq("id", ins.id).single();
    const excedente = post?.aplicado_saldo_favor ?? 0;   // lo que el motor devolvió a saldo si sobró
    const nuevoSaldo = excedente - saldo;                 // consumo neto del crédito
    const legacy = { ...(post?.aplicado ?? { deuda: 0, semana: 0, ahorro: 0, convenio: 0, saldo: 0 }), saldo: nuevoSaldo };
    const { error: e2 } = await supabase.from("pagos")
      .update({ aplicado_saldo_favor: nuevoSaldo, aplicado: legacy }).eq("id", ins.id);
    return { error: e2?.message ?? null };
  }

  return {
    pagos,
    loading,
    error,
    registrarPago,
    aplicarSaldoFavor,
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
