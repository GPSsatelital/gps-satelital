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

// Total confirmado dentro del período de cobro actual — para Semanal/Diario reproduce
// EXACTAMENTE el criterio anterior (semana calendario lunes-domingo, sin importar dia_pago)
// para no alterar contratos ya existentes; para Quincenal/Mensual usa el período real
// de calendario (desde la última fecha de pago pactada).
export function totalPagadoPeriodoActual(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
  hoy: Date,
): number {
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);

  if (esCalendario(contrato)) {
    const inicioISO = inicioPeriodoActual(contrato, hoyDia).toISOString().slice(0, 10);
    return pagosConfirmados.filter(p => p.fecha >= inicioISO).reduce((acc, p) => acc + p.valor, 0);
  }

  const dayOfWeek = hoyDia.getDay();
  const daysFromMon = (dayOfWeek + 6) % 7;
  const inicioSemana = new Date(hoyDia);
  inicioSemana.setDate(hoyDia.getDate() - daysFromMon);
  const inicioSemanaISO = inicioSemana.toISOString().slice(0, 10);
  return pagosConfirmados.filter(p => p.fecha >= inicioSemanaISO).reduce((acc, p) => acc + p.valor, 0);
}

// Estado de cartera (mora/gabela/al día) para contratos Semanal/Quincenal/Mensual.
// Semanal reproduce EXACTAMENTE el criterio anterior para no alterar contratos ya existentes.
// Quincenal/Mensual usan el período real de calendario.
export function calcularEstadoCartera(
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ fecha: string; valor: number }>,
  hoy: Date,
): EstadoCartera {
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  const fechaEntrega = contrato.fecha_entrega ?? null;
  const totalPagadoPeriodo = totalPagadoPeriodoActual(contrato, pagosConfirmados, hoyDia);

  if (esCalendario(contrato)) {
    const inicioPeriodo = inicioPeriodoActual(contrato, hoyDia);
    const inicioISO = inicioPeriodo.toISOString().slice(0, 10);
    if (totalPagadoPeriodo >= valorPeriodoReal(contrato)) return "al-dia";
    if (fechaEntrega && fechaEntrega >= inicioISO) return "al-dia";
    const diasDesde = Math.floor((hoyDia.getTime() - inicioPeriodo.getTime()) / 86400000);
    if (diasDesde <= 0) return "al-dia";
    if (diasDesde === 1) return "gabela";
    return "mora";
  }

  // Semanal/Diario — idéntico al criterio anterior (semana calendario lunes-domingo).
  if (totalPagadoPeriodo >= valorPeriodoReal(contrato)) return "al-dia";

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

// Un contrato está en prorrateo solo si fue entregado DESPUÉS del último día de pago
// y aún no registra pagos.
export function estaEnProrrateo(contrato: ContratoCiclo, sinPagosNunca: boolean): boolean {
  if (contrato.forma_pago === "Diario" || !contrato.fecha_entrega || !sinPagosNunca) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const d = inicioPeriodoActual(contrato, hoy);
  return contrato.fecha_entrega >= d.toISOString().slice(0, 10);
}
