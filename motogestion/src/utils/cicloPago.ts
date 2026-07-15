// Ciclo de pago de un contrato — única fuente de verdad para "cuándo le toca pagar".
// Semanal/Diario: día de la semana (dia_pago) — sin cambios respecto al código anterior.
// Quincenal/Mensual: fechas de calendario (dias_pago_mes), pactadas libremente con el cliente
// (ej. 15 y 30, o 10 y 25) — ya no se fuerza a Lunes/Miércoles como si pagaran cada semana.

export type ContratoCiclo = {
  forma_pago: string;
  dia_pago: string;
  dias_pago_mes?: number[] | null;
  fecha_entrega?: string | null;
  tarifa_diaria?: number;
  ahorro_diario?: number;
  tarifa_domingo?: number;
  ahorro_domingo?: number;
  valor_semanal?: number;
  es_migrado?: boolean;
  // Motor v2 — Libro de cajas (mig 045). Espejo de los acumuladores de la BD.
  motor_v2?: boolean;
  total_cajas?: number | null;
  cajas_pagadas?: number;
  caja_actual_pagado?: number;
  cajas_previas?: number; // cuotas pagadas ANTES del corte (migrados) + financiadas por convenio
  prorrateo_total?: number;
  prorrateo_pagado?: number;
  prorrateo_ahorro?: number;
  fecha_inicio_cajas?: string | null;
};

export type EstadoCartera = "al-dia" | "gabela" | "mora";

const DIAS_SEMANA: Record<string, number> = {
  Lunes: 1, Martes: 2, Miercoles: 3, Miércoles: 3, Jueves: 4, Viernes: 5, Sabado: 6, Sábado: 6, Domingo: 0,
};

function esCalendario(contrato: ContratoCiclo): boolean {
  return contrato.forma_pago === "Quincenal" || contrato.forma_pago === "Mensual";
}

function targetDiaSemana(diaPago: string): number {
  return DIAS_SEMANA[diaPago] ?? 1;
}

function diasPagoMes(contrato: ContratoCiclo): number[] {
  return contrato.dias_pago_mes && contrato.dias_pago_mes.length > 0 ? contrato.dias_pago_mes : [1];
}

// Ajusta un día de mes elegido (ej. 30) al último día real del mes si no existe (ej. febrero).
function clampDiaMes(fecha: Date, dia: number): number {
  const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
  return Math.min(dia, ultimoDiaMes);
}

// ¿Es `fecha` un día de pago para este contrato? (día de semana o fecha de calendario, según modalidad)
export function esDiaDePago(contrato: ContratoCiclo, fecha: Date): boolean {
  if (esCalendario(contrato)) {
    const dia = fecha.getDate();
    return diasPagoMes(contrato).some(dm => clampDiaMes(fecha, dm) === dia);
  }
  return fecha.getDay() === targetDiaSemana(contrato.dia_pago);
}

// Fecha (Date, hora 00:00) del día de pago más reciente <= hoy.
export function inicioPeriodoActual(contrato: ContratoCiclo, hoy: Date): Date {
  const d = new Date(hoy);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < 31; i++) {
    if (esDiaDePago(contrato, d)) return d;
    d.setDate(d.getDate() - 1);
  }
  return d;
}

// Próximo día de pago > `desde` (estrictamente posterior).
export function proximoDiaPago(contrato: ContratoCiclo, desde: Date): Date {
  const d = new Date(desde);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  for (let i = 0; i < 31; i++) {
    if (esDiaDePago(contrato, d)) return d;
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// Valor total esperado en el período actual. `valor_semanal` en BD siempre guarda la
// tarifa SEMANAL (incluso para Quincenal/Mensual, ver WizardContrato) — para esos casos
// se deriva el valor real del período con la misma fórmula del wizard.
export function valorPeriodoReal(contrato: ContratoCiclo): number {
  const valorSemanal = contrato.valor_semanal ?? 0;
  if (!esCalendario(contrato)) return valorSemanal;
  const pagoDiaLS = (contrato.tarifa_diaria ?? 27000) + (contrato.ahorro_diario ?? 4000);
  if (contrato.forma_pago === "Quincenal") return 2 * valorSemanal + pagoDiaLS;
  return 4 * valorSemanal + 2 * pagoDiaLS; // Mensual
}

// Texto para mostrar en pantalla.
export function formatDiaPago(contrato: ContratoCiclo): string {
  if (contrato.forma_pago === "Diario") return "Diario";
  if (esCalendario(contrato)) {
    const dias = diasPagoMes(contrato);
    return dias.length > 1 ? `Días ${dias.join(" y ")}` : `Día ${dias[0]}`;
  }
  return contrato.dia_pago;
}

// Fecha ISO desde la cual cuentan los pagos del período actual: el último día de
// pago del contrato, menos 1 día de gracia para el prepago de víspera (el cliente
// que paga el martes en la noche su cuota del miércoles).
export function inicioVentanaPagosISO(contrato: ContratoCiclo, hoy: Date): string {
  const desde = inicioPeriodoActual(contrato, hoy);
  desde.setDate(desde.getDate() - 1);
  return desde.toISOString().slice(0, 10);
}

// Total confirmado dentro del período de cobro actual — SIEMPRE el período real del
// contrato (miércoles→miércoles, lunes→lunes, o las fechas del mes para
// Quincenal/Mensual), aceptando también el prepago de la víspera.
// ANTES el Semanal usaba la semana calendario lunes-domingo: un cliente con día de
// pago miércoles que pagó puntual (o el viernes) aparecía EN MORA todos los lunes y
// martes, porque su pago quedaba en la semana calendario anterior — 41 falsos
// positivos el primer martes con datos reales en producción.
export function totalPagadoPeriodoActual(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
  hoy: Date,
): number {
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  const desdeISO = inicioVentanaPagosISO(contrato, hoyDia);
  return pagosConfirmados.filter(p => p.fecha >= desdeISO).reduce((acc, p) => acc + p.valor, 0);
}

// Estado de cartera (mora/gabela/al día) para contratos Semanal/Quincenal/Mensual.
// TODOS usan el período real del contrato (ver totalPagadoPeriodoActual): Semanal por
// día de la semana, Quincenal/Mensual por fechas del mes.
// Cuota del convenio que se EXIGE en el período actual. Un convenio empieza a exigirse
// desde el período en que se creó en adelante — NO en un período ya vencido antes de
// hacerlo (ej. si el miércoles no pagó y el convenio se hizo el jueves, esa semana solo
// debe su cuota normal; el abono del convenio arranca el próximo día de pago).
export function cuotaConvenioDelPeriodo(
  convenio: { cuota_por_periodo?: number | null; created_at?: string | null } | null | undefined,
  contrato: ContratoCiclo,
  hoy: Date,
): number {
  const cuota = convenio?.cuota_por_periodo ?? 0;
  if (!convenio || cuota <= 0) return 0;
  const inicio = inicioPeriodoActual(contrato, hoy);
  const inicioISO = inicio.toISOString().slice(0, 10);
  const creadoISO = (convenio.created_at || "").slice(0, 10);
  return creadoISO && creadoISO <= inicioISO ? cuota : 0;
}

// cuotaConvenio: la cuota del convenio activo es OBLIGATORIA junto con el pago normal —
// si el cliente paga su cuota pero no la del convenio, entra en mora igual (antes el
// convenio sin pagar quedaba invisible y el cliente aparecía "al día").
export function calcularEstadoCartera(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
  hoy: Date,
  cuotaConvenio = 0,
  // periodoCubierto: al crear un convenio se puede meter la cuota de la semana actual DENTRO
  // del convenio (alivio único). Mientras ese período esté cubierto, no cuenta como mora ni
  // se cobra la cuota normal aparte — ya está financiada en el convenio.
  periodoCubierto = false,
): EstadoCartera {
  // MOTOR V2 (libro de cajas): el estado sale de los acumuladores del ledger —
  // en mora si existe una caja exigida sin llenar (FIFO estricto). Esta rama cubre
  // AUTOMÁTICAMENTE a todas las vistas que llaman esta función.
  if (contrato.motor_v2 && contrato.forma_pago !== "Diario") {
    if (periodoCubierto) return "al-dia";
    return estadoCarteraV2(contrato, hoy);
  }
  if (periodoCubierto) return "al-dia";
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  const fechaEntrega = contrato.fecha_entrega ?? null;
  const totalPagadoPeriodo = totalPagadoPeriodoActual(contrato, pagosConfirmados, hoyDia);
  const exigidoPeriodo = valorPeriodoReal(contrato) + cuotaConvenio;

  if (esCalendario(contrato)) {
    const inicioPeriodo = inicioPeriodoActual(contrato, hoyDia);
    const inicioISO = inicioPeriodo.toISOString().slice(0, 10);
    if (totalPagadoPeriodo >= exigidoPeriodo) return "al-dia";
    if (fechaEntrega && fechaEntrega >= inicioISO) return "al-dia";
    const diasDesde = Math.floor((hoyDia.getTime() - inicioPeriodo.getTime()) / 86400000);
    if (diasDesde <= 0) return "al-dia";
    if (diasDesde === 1) return "gabela";
    return "mora";
  }

  // Semanal/Diario — período real por día de la semana del contrato.
  if (totalPagadoPeriodo >= exigidoPeriodo) return "al-dia";

  const dayOfWeek = hoyDia.getDay();
  const diaPagoNum = targetDiaSemana(contrato.dia_pago);
  const diasDesde = (dayOfWeek - diaPagoNum + 7) % 7;

  if (fechaEntrega) {
    const inicioPeriodo = new Date(hoyDia);
    inicioPeriodo.setDate(hoyDia.getDate() - diasDesde);
    if (fechaEntrega >= inicioPeriodo.toISOString().slice(0, 10)) return "al-dia";
  }

  if (diasDesde === 0) return "al-dia";
  if (diasDesde === 1) return "gabela";
  return "mora";
}

// Días que el contrato lleva EN MORA (no "días sin pago"): cuántos días pasaron desde que
// entró en mora, que es el día siguiente a la gabela. Secuencia: día de pago (0) → gabela (1)
// → mora (2+). Devuelve 0 si el contrato no está en mora. Es la fuente única para el número
// que muestra Inmovilizaciones, para no confundir "días sin pago" (que crece aunque el
// cliente pague puntual) con "días de mora" real.
export function diasEnMora(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
  hoy: Date,
  cuotaConvenio = 0,
  periodoCubierto = false,
): number {
  if (calcularEstadoCartera(contrato, pagosConfirmados, hoy, cuotaConvenio, periodoCubierto) !== "mora") return 0;
  // MOTOR V2: días desde que se exigió la caja MÁS VIEJA sin llenar (FIFO), menos la gabela.
  if (contrato.motor_v2 && contrato.forma_pago !== "Diario") {
    return Math.max(diasEnMoraV2(contrato, hoy) - 1, 0);
  }
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  const inicio = inicioPeriodoActual(contrato, hoyDia);
  const diasDesde = Math.floor((hoyDia.getTime() - inicio.getTime()) / 86400000);
  return Math.max(diasDesde - 1, 0);
}

// Calcula el valor real del primer pago (prorrateo) para contratos nuevos — itera día a
// día detectando domingos, apuntando al próximo día de pago (semanal o de calendario).
export function calcularProrrateoInicial(contrato: ContratoCiclo): number {
  if (!contrato.fecha_entrega) return 0;
  const pagoDiaLS = (contrato.tarifa_diaria ?? 27000) + (contrato.ahorro_diario ?? 4000);
  const pagoDiaDom = (contrato.tarifa_domingo ?? 14000) + (contrato.ahorro_domingo ?? 2000);
  const base = new Date(contrato.fecha_entrega + "T00:00:00");
  const objetivo = proximoDiaPago(contrato, base);
  const dias = Math.round((objetivo.getTime() - base.getTime()) / 86400000);
  let total = 0;
  for (let i = 1; i <= dias; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    total += d.getDay() === 0 ? pagoDiaDom : pagoDiaLS;
  }
  return total;
}

// Ahorro EXACTO que compone la cuota del período actual — nunca el promedio semanal
// aplicado a un período distinto. El promedio generaba descuadres de pesos: un primer
// pago prorrateado de $109.000 (3 días L-S + 1 domingo) daba $14.030 de ahorro con la
// regla de tres semanal, cuando el valor real día por día es $14.000 (3×$4.000 + $2.000).
// - Prorrateo: se itera día a día (mismos días que calcularProrrateoInicial).
// - Semanal: 6×ahorro_ls + ahorro_dom.
// - Quincenal/Mensual: misma composición fija del negocio (2 sem + 1 día LS / 4 sem + 2 días LS).
// - Diario: 0 — el diario se maneja aparte (su ahorro no sale de una cuota fija).
export function ahorroPeriodoExacto(contrato: ContratoCiclo, enProrrateo: boolean): number {
  if (contrato.forma_pago === "Diario") return 0;
  const ahorroLS = contrato.ahorro_diario ?? 4000;
  const ahorroDom = contrato.ahorro_domingo ?? 2000;

  if (enProrrateo && contrato.fecha_entrega) {
    const base = new Date(contrato.fecha_entrega + "T00:00:00");
    const objetivo = proximoDiaPago(contrato, base);
    const dias = Math.round((objetivo.getTime() - base.getTime()) / 86400000);
    let total = 0;
    for (let i = 1; i <= dias; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      total += d.getDay() === 0 ? ahorroDom : ahorroLS;
    }
    return total;
  }

  const ahorroSemana = 6 * ahorroLS + ahorroDom;
  if (contrato.forma_pago === "Quincenal") return 2 * ahorroSemana + ahorroLS;
  if (contrato.forma_pago === "Mensual") return 4 * ahorroSemana + 2 * ahorroLS;
  return ahorroSemana; // Semanal
}

// Porción de ahorro contenida en lo que un pago aplica a la cuota del período.
// REGLA (decidida 10-jul-2026): "primero la tarifa de la empresa, el ahorro de último".
// Dentro del período, cada peso pagado a cuota cubre primero la parte de la empresa
// (cuota − ahorro del período) y SOLO los últimos pesos son ahorro del cliente.
// Así un abono parcial da $0 (o la cifra redonda que toque) — nunca proporciones
// torcidas tipo $13.333 — y al completar el período el ahorro cierra EXACTO.
// tarifaPagadaAntes = lo aplicado a cuota por pagos anteriores (no rechazados) de este
// mismo período; sin abonos previos es 0.
export function calcularAhorroAplicado(
  contrato: ContratoCiclo,
  aplicadoTarifa: number,
  enProrrateo: boolean,
  tarifaPagadaAntes = 0,
): number {
  if (aplicadoTarifa <= 0 || contrato.forma_pago === "Diario") return 0;
  const cuota = enProrrateo ? calcularProrrateoInicial(contrato) : valorPeriodoReal(contrato);
  const ahorroCuota = ahorroPeriodoExacto(contrato, enProrrateo);
  if (cuota <= 0 || ahorroCuota <= 0) return 0;
  const tarifaEmpresa = cuota - ahorroCuota;
  const ahorroAntes = Math.min(Math.max(tarifaPagadaAntes - tarifaEmpresa, 0), ahorroCuota);
  const ahorroDespues = Math.min(Math.max(tarifaPagadaAntes + aplicadoTarifa - tarifaEmpresa, 0), ahorroCuota);
  return ahorroDespues - ahorroAntes;
}

// Cuánto de la CUOTA del período actual ya está pagado por pagos anteriores (no
// rechazados — los Pendientes cuentan para no dar dos veces el mismo tramo de ahorro).
// Es el "tarifaPagadaAntes" que necesita calcularAhorroAplicado.
export function tarifaPagadaPeriodoActual(
  contrato: ContratoCiclo,
  pagos: Array<{ fecha: string; estado: string; aplicado_tarifa?: number | null }>,
  hoy: Date,
): number {
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  const desdeISO = inicioVentanaPagosISO(contrato, hoyDia);
  return pagos
    .filter(p => p.estado !== "Rechazado" && p.fecha >= desdeISO)
    .reduce((acc, p) => acc + (p.aplicado_tarifa ?? 0), 0);
}

// Un contrato está en prorrateo solo si fue entregado DESPUÉS del último día de pago
// y aún no registra pagos.
export function estaEnProrrateo(contrato: ContratoCiclo, sinPagosNunca: boolean): boolean {
  // Los contratos MIGRADOS nunca están en prorrateo: ya traían ciclos anteriores (su
  // arqueo capturó su estado), no es su "primera semana". El prorrateo solo aplica a
  // contratos genuinamente nuevos creados por el wizard.
  if (contrato.es_migrado) return false;
  if (contrato.forma_pago === "Diario" || !contrato.fecha_entrega || !sinPagosNunca) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const d = inicioPeriodoActual(contrato, hoy);
  return contrato.fecha_entrega >= d.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// MOTOR V2 — LIBRO DE CAJAS (spec 11-jul-2026, ver CLAUDE.md "🫀 LIBRO DE CAJAS")
// Funciones PURAS espejo del motor de la BD (mig 045). El reparto real lo hace
// la BD al confirmar; estas solo calculan fechas/estados para mostrar en pantalla.
// Solo rigen donde contrato.motor_v2 === true. Diario queda fuera.
// ═══════════════════════════════════════════════════════════════════════════

function fechaAISO(d: Date): string {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

// N total de cajas del contrato — CALENDARIO REAL (no mes=30 días):
// 12 meses = 52 semanas · 21 = 91 · 24 = 104. Quincenal = 2/mes · Mensual = 1/mes.
export function totalCajasContrato(forma_pago: string, meses: number): number {
  if (!meses || meses <= 0) return 0;
  if (forma_pago === "Quincenal") return meses * 2;
  if (forma_pago === "Mensual") return meses;
  if (forma_pago === "Semanal") return Math.round((meses * 365) / 12 / 7);
  return 0;
}

// Cajas EXIGIDAS a la fecha: la caja k se exige el día de pago que la INICIA
// ("paga hoy lo que consumes desde hoy"). fecha_inicio_cajas ES el día que inicia
// la caja 1. Espejo exacto de public.cajas_exigidas() de la mig 045.
export function cajasExigidasHasta(contrato: ContratoCiclo, hoy: Date): number {
  const previas = contrato.cajas_previas ?? 0;
  const inicio = contrato.fecha_inicio_cajas;
  if (!inicio) return Math.min(previas, contrato.total_cajas ?? previas);
  const hoyISO = fechaAISO(hoy);
  if (hoyISO < inicio) return Math.min(previas, contrato.total_cajas ?? previas);
  let n = 0;
  if (contrato.forma_pago === "Semanal") {
    const dIni = new Date(inicio + "T00:00:00");
    const dHoy = new Date(hoyISO + "T00:00:00");
    n = Math.floor((dHoy.getTime() - dIni.getTime()) / (7 * 86400000)) + 1;
  } else if (esCalendario(contrato)) {
    const dias = diasPagoMes(contrato);
    const dIni = new Date(inicio + "T00:00:00");
    const cursor = new Date(dIni.getFullYear(), dIni.getMonth(), 1);
    const dHoy = new Date(hoyISO + "T00:00:00");
    while (cursor <= dHoy) {
      for (const dia of dias) {
        const f = new Date(cursor.getFullYear(), cursor.getMonth(), clampDiaMes(cursor, dia));
        if (f >= dIni && f <= dHoy) n++;
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    return 0; // Diario fuera del libro
  }
  n += previas;
  if (contrato.total_cajas != null) n = Math.min(n, contrato.total_cajas);
  return Math.max(n, 0);
}

// El prorrateo (Caja 0) se paga el PRIMER día de pago = fecha_inicio_cajas. ANTES de esa
// fecha el cliente está en su período de prorrateo (usando la moto), NO es exigible todavía
// → aparece al día, con próximo pago = fecha_inicio_cajas. En/después de esa fecha sí se
// exige. (Sin esto, un contrato nuevo salía en "Gabela" y "debe $X" desde el día 1.)
export function prorrateoExigibleHoy(contrato: ContratoCiclo, hoy: Date): number {
  const pend = Math.max((contrato.prorrateo_total ?? 0) - (contrato.prorrateo_pagado ?? 0), 0);
  if (pend <= 0) return 0;
  const inicio = contrato.fecha_inicio_cajas;
  if (inicio && fechaAISO(hoy) < inicio) return 0;
  return pend;
}

// Hueco total exigible de CUOTAS a hoy (prorrateo pendiente + cajas exigidas sin llenar).
// Es el "debe de cuotas" del ledger — las deudas registradas y el convenio van aparte.
export function huecoCuotasHoy(contrato: ContratoCiclo, hoy: Date): number {
  const valorCaja = valorPeriodoReal(contrato);
  const prorPend = prorrateoExigibleHoy(contrato, hoy);
  const exigidas = cajasExigidasHasta(contrato, hoy);
  const pagadas = contrato.cajas_pagadas ?? 0;
  const enCurso = contrato.caja_actual_pagado ?? 0;
  const huecoCajas = Math.max((exigidas - pagadas) * valorCaja - enCurso, 0);
  return prorPend + huecoCajas;
}

// Fecha de EXIGENCIA de la caja `numero` (> previas). Espejo de cajas_exigidas().
function fechaCaja(contrato: ContratoCiclo, numero: number): string | null {
  const previas = contrato.cajas_previas ?? 0;
  const inicio = contrato.fecha_inicio_cajas;
  if (!inicio || numero <= previas) return null;
  const idx = numero - previas - 1; // 0-based desde fecha_inicio_cajas
  if (contrato.forma_pago === "Semanal") {
    const d = new Date(inicio + "T00:00:00");
    d.setDate(d.getDate() + idx * 7);
    return fechaAISO(d);
  }
  if (esCalendario(contrato)) {
    const dias = [...diasPagoMes(contrato)].sort((a, b) => a - b);
    const dIni = new Date(inicio + "T00:00:00");
    const cursor = new Date(dIni.getFullYear(), dIni.getMonth(), 1);
    let count = 0;
    for (let guard = 0; guard < 400; guard++) {
      for (const dia of dias) {
        const f = new Date(cursor.getFullYear(), cursor.getMonth(), clampDiaMes(cursor, dia));
        if (f >= dIni) {
          if (count === idx) return fechaAISO(f);
          count++;
        }
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  return null;
}

export type PeriodoExigible = { fecha: string; monto: number; diasVencida: number; parcial: boolean };
export type DesgloseExigible = {
  prorrateoPendiente: number;      // Caja 0 (prorrateo) sin pagar
  periodos: PeriodoExigible[];     // cajas exigidas sin llenar, MÁS VIEJA primero (FIFO)
  proximaFecha: string | null;     // próxima caja aún no exigida
  proximoMonto: number;
  totalCuotas: number;             // = huecoCuotasHoy (prorrateo + cajas)
};

// Desglose de lo EXIGIBLE hoy, caja por caja con su fecha — para que el funcionario vea
// qué períodos debe y de qué fecha es cada uno (motor de cajas, tiempo definido).
export function desgloseExigible(contrato: ContratoCiclo, hoy: Date): DesgloseExigible {
  const valorCaja = valorPeriodoReal(contrato);
  const pagadas = contrato.cajas_pagadas ?? 0;
  const enCurso = contrato.caja_actual_pagado ?? 0;
  const exigidas = cajasExigidasHasta(contrato, hoy);
  const prorrateoPendiente = prorrateoExigibleHoy(contrato, hoy);       // 0 si aún no llega fecha_inicio_cajas
  const prorrateoRestante = Math.max((contrato.prorrateo_total ?? 0) - (contrato.prorrateo_pagado ?? 0), 0);
  const prorrateoPorVenir = prorrateoRestante > 0 && prorrateoPendiente === 0; // pendiente pero aún no exigible
  const hoyMs = new Date(fechaAISO(hoy) + "T00:00:00").getTime();
  const periodos: PeriodoExigible[] = [];
  for (let j = pagadas + 1; j <= exigidas; j++) {
    const fecha = fechaCaja(contrato, j);
    if (!fecha) continue;
    const parcial = j === pagadas + 1 && enCurso > 0;
    const monto = parcial ? Math.max(valorCaja - enCurso, 0) : valorCaja;
    if (monto <= 0) continue;
    const diasVencida = Math.floor((hoyMs - new Date(fecha + "T00:00:00").getTime()) / 86400000);
    periodos.push({ fecha, monto, diasVencida, parcial });
  }
  // Próximo pago: si el prorrateo aún no vence, LO PRÓXIMO es ese prorrateo (en fecha_inicio_cajas),
  // no la caja siguiente — antes se saltaba el prorrateo y mostraba la caja 2.
  let proximaFecha: string | null;
  let proximoMonto: number;
  if (prorrateoPorVenir && contrato.fecha_inicio_cajas) {
    proximaFecha = contrato.fecha_inicio_cajas;
    proximoMonto = prorrateoRestante;
  } else {
    const proxNum = Math.max(exigidas, pagadas) + 1;
    proximaFecha = (contrato.total_cajas == null || proxNum <= contrato.total_cajas) ? fechaCaja(contrato, proxNum) : null;
    proximoMonto = (proxNum === pagadas + 1 && enCurso > 0) ? Math.max(valorCaja - enCurso, 0) : valorCaja;
  }
  const totalCuotas = prorrateoPendiente + periodos.reduce((s, p) => s + p.monto, 0);
  return { prorrateoPendiente, periodos, proximaFecha, proximoMonto, totalCuotas };
}

// Días desde que se exigió la caja MÁS VIEJA que sigue sin llenar (0 = hoy mismo).
export function diasEnMoraV2(contrato: ContratoCiclo, hoy: Date): number {
  const inicio = contrato.fecha_inicio_cajas;
  if (!inicio) return 0;
  const pagadas = contrato.cajas_pagadas ?? 0;
  const exigidas = cajasExigidasHasta(contrato, hoy);
  if (exigidas <= pagadas) {
    // Sin hueco de cajas — ¿prorrateo vencido? El prorrateo se exige el día inicio.
    const prorPend = Math.max((contrato.prorrateo_total ?? 0) - (contrato.prorrateo_pagado ?? 0), 0);
    if (prorPend <= 0) return 0;
    return Math.max(Math.floor((new Date(fechaAISO(hoy) + "T00:00:00").getTime() - new Date(inicio + "T00:00:00").getTime()) / 86400000), 0);
  }
  // Fecha de exigencia de la caja más vieja sin llenar (la pagadas+1), relativa al
  // inicio del ledger (las previas quedaron antes del inicio):
  const k = Math.max(pagadas - (contrato.cajas_previas ?? 0) + 1, 1);
  let fechaExigencia = new Date(inicio + "T00:00:00");
  if (contrato.forma_pago === "Semanal") {
    fechaExigencia.setDate(fechaExigencia.getDate() + (k - 1) * 7);
  } else {
    const dias = diasPagoMes(contrato).slice().sort((a, b) => a - b);
    const dIni = new Date(inicio + "T00:00:00");
    const cursor = new Date(dIni.getFullYear(), dIni.getMonth(), 1);
    let cont = 0;
    let encontrada = false;
    while (!encontrada) {
      for (const dia of dias) {
        const f = new Date(cursor.getFullYear(), cursor.getMonth(), clampDiaMes(cursor, dia));
        if (f >= dIni) {
          cont++;
          if (cont === k) { fechaExigencia = f; encontrada = true; break; }
        }
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }
  const dHoy = new Date(fechaAISO(hoy) + "T00:00:00");
  return Math.max(Math.floor((dHoy.getTime() - fechaExigencia.getTime()) / 86400000), 0);
}

// AJUSTE DE SALIDA (liquidación, spec regla 9): se cobra hasta el día en que el cliente
// entregó la moto — la caja en curso se prorratea día a día (domingos aparte) — y lo
// prepagado NO consumido se le devuelve (entra al saldo final de la liquidación).
// pagado = dinero real que entró al ledger desde el corte/inicio (las cajas previas del
// arqueo NO cuentan: su plata vive en apertura/deudas).
export function ajusteSalidaLedger(
  contrato: ContratoCiclo,
  fechaRetorno: Date,
): { pagado: number; consumido: number; aFavor: number; porCobrar: number } {
  const cero = { pagado: 0, consumido: 0, aFavor: 0, porCobrar: 0 };
  if (!contrato.motor_v2 || contrato.forma_pago === "Diario" || !contrato.fecha_inicio_cajas) return cero;
  const valor = valorPeriodoReal(contrato);
  if (valor <= 0) return cero;
  const previas = contrato.cajas_previas ?? 0;
  const pagado = Math.max((contrato.cajas_pagadas ?? 0) - previas, 0) * valor
    + (contrato.caja_actual_pagado ?? 0)
    + (contrato.prorrateo_pagado ?? 0);

  const inicio = new Date(contrato.fecha_inicio_cajas + "T00:00:00");
  const ret = new Date(fechaAISO(fechaRetorno) + "T00:00:00");
  let consumido = 0;
  if (ret >= inicio) {
    consumido += contrato.prorrateo_total ?? 0; // los días previos al inicio ya se consumieron
    const pagoLS = (contrato.tarifa_diaria ?? 27000) + (contrato.ahorro_diario ?? 4000);
    const pagoDom = (contrato.tarifa_domingo ?? 14000) + (contrato.ahorro_domingo ?? 2000);
    // Recorre las cajas por sus fechas de pago: período completo terminado antes del
    // retorno → valor completo; la caja en curso → día a día hasta el día de entrega.
    let inicioCaja = new Date(inicio);
    for (let k = 0; k < 400; k++) {
      const finCaja = proximoDiaPago(contrato, inicioCaja); // día que inicia la caja siguiente
      if (finCaja <= ret) {
        consumido += valor;
        inicioCaja = finCaja;
      } else {
        let d = new Date(inicioCaja);
        while (d <= ret) {
          consumido += d.getDay() === 0 ? pagoDom : pagoLS;
          d.setDate(d.getDate() + 1);
        }
        consumido = Math.min(consumido, (contrato.prorrateo_total ?? 0) + (k + 1) * valor);
        break;
      }
    }
  }
  return {
    pagado,
    consumido,
    aFavor: Math.max(pagado - consumido, 0),
    porCobrar: Math.max(consumido - pagado, 0),
  };
}

// Estado de cartera v2: en mora = existe una caja exigida sin llenar (o prorrateo vencido).
// Gabela = el hueco nació hoy o ayer (día de pago + 1 de gracia). Pagar la caja de esta
// semana con una vieja abierta NO saca de mora (FIFO estricto).
export function estadoCarteraV2(contrato: ContratoCiclo, hoy: Date): EstadoCartera {
  const hueco = huecoCuotasHoy(contrato, hoy);
  if (hueco <= 0) return "al-dia";
  const dias = diasEnMoraV2(contrato, hoy);
  if (dias <= 1) return "gabela"; // día de pago (0) y día de gabela (1)
  return "mora";
}
