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
// Usa el ahorro y la cuota EXACTOS del período que se está pagando: un pago completo
// da el ahorro exacto ($14.000 en prorrateo, $26.000 en semana llena); un pago parcial
// se reparte proporcional dentro de ese mismo período y al completarlo cierra exacto.
export function calcularAhorroAplicado(
  contrato: ContratoCiclo,
  aplicadoTarifa: number,
  enProrrateo: boolean,
): number {
  if (aplicadoTarifa <= 0 || contrato.forma_pago === "Diario") return 0;
  const cuota = enProrrateo ? calcularProrrateoInicial(contrato) : valorPeriodoReal(contrato);
  const ahorroCuota = ahorroPeriodoExacto(contrato, enProrrateo);
  if (cuota <= 0 || ahorroCuota <= 0) return 0;
  return Math.min(Math.round((aplicadoTarifa * ahorroCuota) / cuota), ahorroCuota);
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
