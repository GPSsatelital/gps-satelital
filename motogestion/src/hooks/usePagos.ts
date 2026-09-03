import { supabase } from "../lib/supabase";
import { createTableStore } from "./createTableStore";
import { normalizarRef } from "./useIngresosNoIdentificados";
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
 * Fecha con la que un pago cuenta para la CAJA del día. Las dos formas de pago se comportan
 * distinto porque son dinero distinto (regla del dueño, 4-ago-2026):
 *
 * · EFECTIVO → el día en que se DIGITÓ (`fecha_registro`). Llega a la mano y se cuenta ese mismo
 *   día: el arqueo de hoy tiene que cuadrar contra los billetes que hoy están en el cajón.
 * · TRANSFERENCIA → el día en que EL BANCO la recibió (`fecha`). Tiene fecha propia y verificable
 *   —comprobante y extracto—, independiente de cuándo alguien se sentó a digitarla.
 *
 * Por qué la transferencia no puede ir por el día de digitación: el arqueo compararía la plata
 * tecleada hoy contra el extracto de hoy, que son dos conjuntos distintos, y ningún día podría
 * cuadrar nunca. Medido el 4-ago-2026: 31 transferencias del lunes 3 ($5.983.000) caían en la
 * caja del martes, dejándola con el 97% de su plata prestada del día anterior.
 * El sistema ya hacía esto para las que cruzaban con el dinero sin dueño (ver
 * `cruzarConDineroSinDuenio`): esto extiende esa misma regla a todas.
 *
 * CONSECUENCIA ACEPTADA: una transferencia reportada tarde entra a un día que quizás ya se cerró.
 * Por eso el cierre debe poder recalcularse — nunca volver a la regla vieja para "proteger" un
 * cierre, porque eso es lo que descuadra el arqueo de todos los días.
 *
 * Los pagos viejos (antes de la mig 064) tienen fecha_registro = fecha, así que no se mueven.
 * Protegida por `fechaDeCaja.test.ts`.
 */
export function fechaDeCaja(p: { fecha: string; fecha_registro?: string | null; metodo: MetodoPago }): string {
  if (p.metodo === "Transferencia") return p.fecha;
  return p.fecha_registro || p.fecha;
}

/**
 * Saldo a favor de un contrato: plata que el cliente YA entregó y quedó guardada a su nombre.
 *
 * Sale de dos partes: lo que traía de las cuentas viejas (migrados, mig 079) más lo que fueron
 * dejando sus pagos. Al aplicarlo, el movimiento registra un `aplicado_saldo_favor` NEGATIVO, así
 * que el total baja solo — por eso es una suma y no hay que restar nada aparte.
 *
 * Vive acá y no dentro de una pantalla porque ya hay dos que lo necesitan (Cartera y la
 * liquidación). Es la lección de `loQueDebe()`: la misma cuenta escrita en dos sitios se separa
 * sola, y nadie se entera hasta que un cliente reclama en el mostrador.
 */
export function saldoAFavorDe(
  contrato: { saldo_favor_apertura?: number | null },
  pagosConfirmados: { aplicado_saldo_favor?: number | null }[],
): number {
  return (contrato.saldo_favor_apertura ?? 0)
    + pagosConfirmados.reduce((acc, p) => acc + (p.aplicado_saldo_favor ?? 0), 0);
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
  // De lo que fue a deudas, cuánto era una multa de recolección (mig 085). Solo para informar:
  // la caja lo muestra aparte porque no es plata del arriendo, es el costo de ir a buscar la moto.
  aplicado_multa?: number | null;
  /** De lo aplicado a deudas, cuánto fue a la lavada del vehículo (mig 123). Solo informativo. */
  aplicado_lavada?: number | null;
  // A qué cuenta de la empresa cayó la transferencia (mig 087). NULL en efectivo, en los
  // movimientos internos y en todo pago anterior a esa migración.
  cuenta_id?: string | null;
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
    opts?: { convenioId?: string; tipoRegistro?: TipoRegistroPago; registradoPor?: string; comprobanteUrl?: string; folio?: string; forzarPendiente?: boolean; ubicacion?: { lat: number; lng: number } | null; fecha?: string; fechaCaja?: string; referencia?: string; cuentaId?: string | null },
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
    // Devuelve el id del pago creado: quien registra una transferencia que cruzó con una
    // partida de dinero sin dueño lo necesita para ligar esa partida a este pago.
    const { data: creado, error } = await supabase.from("pagos").insert({
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
      // Solo la transferencia cae en una cuenta; el efectivo llega a la mano (mig 087).
      cuenta_id: metodo === "Transferencia" ? (opts?.cuentaId ?? null) : null,
      // DOS fechas distintas (mig 064):
      //  · `fecha` = cuándo PAGÓ el cliente. Puede ser anterior a hoy cuando reporta tarde
      //    (transfirió el domingo y avisó el lunes). Manda para mora, historial y recibo.
      //  · `fecha_registro` = cuándo se DIGITÓ. Manda para la caja del día, así el arqueo
      //    cuadra con la plata que hoy está en la mano y ningún cierre anterior se descuadra.
      // Ambas en hora de Colombia: con current_date (UTC) los pagos de noche caían al día siguiente.
      //
      // EXCEPCIÓN (`fechaCaja`): una transferencia que cruzó con el extracto del banco entra a la
      // caja del DÍA EN QUE EL BANCO LA RECIBIÓ, no a la de hoy. El arqueo de cada día se compara
      // contra el extracto de ESE día: si una plata que entró el 27 se cuenta el 28, el 28 sobra
      // contra su extracto y el 27 queda corto para siempre. Esto solo aplica cuando la fecha está
      // COMPROBADA contra NUESTRA cuenta. Cuando no cruza, el respaldo es la foto del comprobante
      // —que es prueba y por eso es obligatoria— pero la aporta el cliente y todavía no está
      // verificada contra el extracto: por eso el pago queda Pendiente y su plata espera en la
      // caja de hoy en vez de moverse al arqueo de un día que quizás ya se cerró.
      fecha: opts?.fecha || hoyISO(),
      fecha_registro: opts?.fechaCaja || hoyISO(),
    }).select("id").single();
    return { error: error?.message ?? null, id: creado?.id ?? null };
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

  /**
   * Cruza el pago contra la bolsa de dinero sin dueño. Vive AQUÍ y no en cada pantalla porque
   * confirmar es el único embudo por el que pasan TODAS las transferencias, sin importar dónde
   * se registraron (Cartera, Cobro Diario, o cualquier punto futuro), y siempre lo opera
   * SECRETARIA/ADMIN — que son los únicos con permiso RLS sobre esa tabla.
   * Regla del negocio: una referencia va casada a UN valor exacto. Si el monto no es idéntico,
   * NO se cruza — queda en la bolsa para que alguien lo valide, que es justo lo que se quiere.
   */
  async function cruzarConDineroSinDuenio(pagoId: string) {
    const { data: pago } = await supabase.from("pagos").select("referencia, valor").eq("id", pagoId).single();
    if (!pago?.referencia) return;
    const ref = normalizarRef(pago.referencia);
    if (ref.length < 3) return;
    const { data: partidas } = await supabase
      .from("ingresos_no_identificados").select("id, referencia, monto, fecha_banco, cuenta_id").eq("estado", "pendiente");
    // La referencia se guarda cruda: se compara normalizada en memoria.
    const match = (partidas ?? []).find(
      p => normalizarRef(p.referencia) === ref && Math.round(p.monto) === Math.round(pago.valor),
    );
    if (!match) return;
    const { error: errAsig } = await supabase.from("ingresos_no_identificados")
      .update({ estado: "asignado", pago_id: pagoId })
      .eq("id", match.id).eq("estado", "pendiente").is("pago_id", null);
    if (errAsig) return;
    // Al quedar comprobado contra el extracto, las dos fechas pasan a ser la del banco: la plata
    // entró ESE día y a la caja de ESE día pertenece. Sin esto, un pago registrado desde Cobro
    // Diario (donde el cruce solo ocurre acá, al confirmar) quedaba contado en la caja del día en
    // que se digitó, dejándola sobrando contra su extracto y al día real corto para siempre.
    // No afecta el reparto a cuota/deuda/convenio: el motor de cajas reparte por `created_at`.
    // Y la CUENTA que la partida traía leída del extracto se copia al pago (mig 087): en ese
    // instante es el dato más confiable que existe sobre a dónde cayó la plata — sale del
    // extracto, no de lo que dijo el cliente. Antes se perdía y el arqueo por cuenta quedaba
    // ciego justo en los casos ya comprobados.
    const cambios: Record<string, string> = {};
    if (match.fecha_banco) { cambios.fecha = match.fecha_banco; cambios.fecha_registro = match.fecha_banco; }
    if (match.cuenta_id) cambios.cuenta_id = match.cuenta_id;
    if (Object.keys(cambios).length > 0) {
      await supabase.from("pagos").update(cambios).eq("id", pagoId);
    }
  }

  /** Si un pago cruzado se cae, su plata vuelve a estar sin dueño (si no, quedaba invisible). */
  async function liberarDineroSinDuenio(pagoId: string) {
    await supabase.from("ingresos_no_identificados")
      .update({ estado: "pendiente", pago_id: null })
      .eq("pago_id", pagoId);
  }

  /**
   * Confirmar = la secretaria YA tiene la plata en la mano. Por eso un cobro de campo queda
   * también marcado como entregado: confirmarlo sin eso dejaba la MISMA plata contada dos veces
   * en la caja del día — "pendiente entregar por el funcionario" Y "efectivo recibido".
   *
   * 🔴 EL CASO (25-ago-2026, YERMIN RODRIGUEZ, XZN83H, $400.000): la secretaria confirmó desde
   * Caja Diaria antes de que el funcionario tocara "entregué a secretaria". Cartera sí tenía el
   * candado (solo muestra Confirmar si está entregado); Caja Diaria no. En vez de agregar otro
   * candado —que dejaría el mismo hueco abierto en la próxima pantalla que confirme pagos—, se
   * arregla en el embudo por donde pasan TODAS las confirmaciones.
   */
  async function confirmarPago(id: string) {
    // Se lee de la BD, no del store: el store puede no tener la fila (ventana de días) y acá
    // no se puede adivinar — de una adivinanza salió justamente este defecto.
    const { data: pago } = await supabase.from("pagos")
      .select("tipo_registro, entregado_caja").eq("id", id).single();
    const campoSinEntregar = pago?.tipo_registro === "campo" && !pago.entregado_caja;
    const { error } = await supabase.from("pagos")
      .update(campoSinEntregar ? { estado: "Confirmado", entregado_caja: true } : { estado: "Confirmado" })
      .eq("id", id);
    if (error) return { error: error.message };
    await cruzarConDineroSinDuenio(id);
    return { error: null };
  }

  async function rechazarPago(id: string) {
    const { error } = await supabase.from("pagos").update({ estado: "Rechazado" }).eq("id", id);
    if (error) return { error: error.message };
    await liberarDineroSinDuenio(id);
    return { error: null };
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
    await liberarDineroSinDuenio(pago.id);
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
  //
  // DEUDA PRIMERO (30-jul-2026, decisión del dueño). El motor reparte en su orden fijo
  // (prorrateo → cajas → deuda → convenio), así que el crédito guardado tapaba la SEMANA en
  // curso y la deuda vieja quedaba intacta. Caso real: los pagos que la secretaria digitó con
  // fecha anterior al corte de migración del 27-jul quedaron 100% en saldo a favor, y al
  // aplicarlos cubrían una semana que el cliente todavía no había pagado.
  // El crédito viejo debe saldar primero lo viejo. Se resuelve SIN tocar el motor: la mig 045
  // solo re-reparte cuando TODOS los aplicado_* vienen en cero, y su rama de reparto explícito
  // (líneas 264-293) igual baja las deudas de la más antigua a la más nueva.
  async function aplicarSaldoFavor(contratoId: string, saldo: number, opts?: { convenioId?: string }) {
    if (saldo <= 0) return { error: "No hay saldo a favor para aplicar." };

    // Con convenioId el funcionario está dirigiendo el crédito a un convenio puntual: ahí manda
    // su decisión, no la regla general.
    let restante = saldo;
    if (!opts?.convenioId) {
      const { data: deudasPend } = await supabase.from("deudas")
        .select("monto_pendiente")
        .eq("contrato_id", contratoId)
        .neq("estado", "pagada")
        .gt("monto_pendiente", 0);
      const deudaTotal = (deudasPend ?? []).reduce((s, d) => s + Number(d.monto_pendiente ?? 0), 0);
      const aDeuda = Math.min(saldo, deudaTotal);
      if (aDeuda > 0) {
        // Reparto EXPLÍCITO: el motor no lo recalcula y baja las deudas él mismo. No toca cajas.
        const { error: eD } = await supabase.from("pagos").insert({
          contrato_id: contratoId,
          valor: aDeuda,
          metodo: "Efectivo",
          estado: "Confirmado",
          tipo_registro: "saldo_favor",
          aplicado: { deuda: aDeuda, semana: 0, ahorro: 0, convenio: 0, saldo: -aDeuda },
          aplicado_tarifa: 0, aplicado_base_inicial: 0, aplicado_deuda: aDeuda, aplicado_convenio: 0,
          aplicado_ahorro: 0, aplicado_saldo_favor: -aDeuda, aplicado_prorrateo: 0,
          convenio_id: null,
          fecha: hoyISO(),
          fecha_registro: hoyISO(),
        });
        if (eD) return { error: eD.message };
        restante = saldo - aDeuda;
      }
    }
    if (restante <= 0) return { error: null };

    // Lo que sobra sigue el camino de siempre: el motor lo reparte (cajas → convenio → saldo).
    const { data: ins, error: e1 } = await supabase.from("pagos").insert({
      contrato_id: contratoId,
      valor: restante,
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
    const nuevoSaldo = excedente - restante;              // consumo neto del crédito (solo este tramo:
                                                          // lo que fue a la deuda ya se descontó arriba)
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
