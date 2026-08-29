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
  cajas_exoneradas?: number; // períodos completos rodados al final por tiempo fuera de servicio (mig 078)
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

// Los días en que la empresa cobra normalmente. El motor soporta cualquier día (cuenta cada 7
// desde `fecha_inicio_cajas`, nunca mira este texto), pero la regla del negocio es lunes o
// miércoles — así que un día distinto casi siempre significa un dato sin confirmar.
export const DIAS_PAGO_NORMALES = new Set(["Lunes", "Miércoles", "Miercoles"]);

// ¿El día de pago de este contrato hay que confirmarlo con el cliente?
// Nace de los 7 migrados de RASTREADOR (29-ago): sus días salieron de la planilla y al menos uno
// estaba mal (VICTOR figuraba sábado y en realidad es lunes). El funcionario los corrige a medida
// que los va viendo, así que la pantalla tiene que avisarle cuáles revisar.
export function diaPagoPorConfirmar(contrato: ContratoCiclo): boolean {
  if (contrato.forma_pago === "Diario" || esCalendario(contrato)) return false;
  return !DIAS_PAGO_NORMALES.has(contrato.dia_pago);
}

// Mueve una fecha al día de la semana pedido, DENTRO de su misma semana (de lunes a domingo).
//
// Para qué: el motor cuenta las cajas cada 7 días desde `fecha_inicio_cajas` y NUNCA mira el texto
// `dia_pago`. Así que cambiar el día en la ficha sin mover el arranque deja la pantalla diciendo
// "paga lunes" mientras el motor sigue exigiendo los sábados — la trampa de "una cosa dice la
// pantalla y otra el motor" que ya costó caro antes.
//
// Se mueve dentro de la MISMA semana a propósito: así no se le corre ni se le adelanta ninguna
// caja, solo se corrige el día. VICTOR (arranque sábado 29-ago) pasado a lunes → 24-ago, y las
// cajas exigidas hoy siguen siendo las mismas.
export function moverAlDiaDeLaSemana(fechaISO: string, diaPago: string): string {
  const target = DIAS_SEMANA[diaPago];
  if (target === undefined) return fechaISO;
  const d = new Date(fechaISO + "T00:00:00");
  const offsetActual = (d.getDay() + 6) % 7; // lunes = 0 … domingo = 6
  const offsetNuevo = (target + 6) % 7;
  d.setDate(d.getDate() + (offsetNuevo - offsetActual));
  return fechaAISO(d);
}

// 🔴 CANDADO DEL DUEÑO (29-ago): mover el arranque de cajas SOLO se permite en un contrato que
// acaba de migrarse y todavía no ha cobrado nada. A un cliente que lleva meses pagando NUNCA se le
// mueve: le correría TODAS sus cajas futuras y le descuadraría el conteo. Palabras suyas: "no vaya
// a ser que por algún motivo cambien el día de pago —cosa que no debería pasar, pero por si pasa—
// y se vaya a rodar también el cuándo inició la caja".
//
// La ventana es objetiva, sin placas escritas a mano: el arranque tiene que caer en la semana
// EN CURSO o en la SIGUIENTE. Los 7 recién migrados arrancan entre el 24-ago y el 5-sep (dentro);
// los 28 RASTREADOR viejos (6-jul), COSTA (27-jul) y PRADERA (1-jul) quedan fuera y no se tocan.
// Al pasar esa ventana el contrato ya arrancó a cobrar de verdad y su arranque queda sellado.
export function puedeMoverArranqueCajas(fechaInicioCajas: string | null | undefined, hoy: Date): boolean {
  if (!fechaInicioCajas) return false;
  const lunesDeEstaSemana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  lunesDeEstaSemana.setDate(lunesDeEstaSemana.getDate() - ((hoy.getDay() + 6) % 7));
  const domingoDeLaSiguiente = new Date(lunesDeEstaSemana);
  domingoDeLaSiguiente.setDate(domingoDeLaSiguiente.getDate() + 13);
  return fechaInicioCajas >= fechaAISO(lunesDeEstaSemana) && fechaInicioCajas <= fechaAISO(domingoDeLaSiguiente);
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
// Cuota del convenio que se EXIGE en el período actual. Dos reglas, en este orden:
//
// 1. Un convenio empieza a exigirse desde el período en que se creó en adelante — NO en uno ya
//    vencido antes de hacerlo (si el miércoles no pagó y el convenio se hizo el jueves, esa
//    semana solo debe su cuota normal).
//
// 2. Si el convenio ABSORBIÓ semanas (`cubre_periodo_hasta`), durante esas semanas el cliente no
//    paga NADA: ni cuota ni convenio. Empieza a abonar el convenio cuando esas semanas se vencen.
//    Regla del dueño (7-ago-2026), textual: "que pague convenio cuando termine las semanas
//    absorbidas — si se absorbe una, en esa semana no paga, sino hasta que se le vence".
//    Antes se le cobraba el convenio de una: MARTHA (RLT68H) tenía sus semanas cubiertas hasta el
//    17-ago y aun así le pedía $50.000 el 6-ago.
export function cuotaConvenioDelPeriodo(
  convenio: { cuota_por_periodo?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null } | null | undefined,
  contrato: ContratoCiclo,
  hoy: Date,
): number {
  const cuota = convenio?.cuota_por_periodo ?? 0;
  if (!convenio || cuota <= 0) return 0;
  const inicio = inicioPeriodoActual(contrato, hoy);
  const inicioISO = inicio.toISOString().slice(0, 10);
  const creadoISO = (convenio.created_at || "").slice(0, 10);
  if (!creadoISO || creadoISO > inicioISO) return 0;
  // El período que ARRANCA justo el día en que se vence la cobertura ya sí paga: `cubre_periodo_hasta`
  // marca el primer día NO cubierto (Martha: cubre hasta 17-ago = paga desde el período del 17).
  const cubreHasta = (convenio.cubre_periodo_hasta || "").slice(0, 10);
  if (cubreHasta && inicioISO < cubreHasta) return 0;

  // MIENTRAS EL CONTRATO ESTÉ EN SU PRORRATEO, el convenio todavía no se exige.
  //
  // Regla del dueño (12-ago-2026): "el primer día de pago se le cobran solo los días que rodó,
  // que es lo que llamamos prorrateo; lo que se pacte del convenio se empieza a cobrar el
  // siguiente lunes, que es donde le toca pagar su tarifa completa más lo del convenio".
  //
  // Antes se le exigían las dos cosas el MISMO día: el prorrateo y la cuota del convenio, sin
  // que hubiera pagado todavía una semana entera. Y como la cuota del convenio cuenta para la
  // mora, el cliente aparecía atrasado desde su primer pago.
  //
  // Solo aplica a quien TIENE prorrateo: un migrado o alguien que recibió la moto justo el día
  // de pago arranca con una semana completa desde el día uno, y ahí el convenio sí corre normal.
  const inicioCajas = (contrato.fecha_inicio_cajas || "").slice(0, 10);
  if ((contrato.prorrateo_total ?? 0) > 0 && inicioCajas && inicioISO <= inicioCajas) return 0;

  return cuota;
}

/**
 * Cuándo cae la PRÓXIMA cuota del convenio que el cliente tiene que pagar.
 *
 * No es simplemente "el siguiente día de pago": el convenio puede no exigirse todavía (contrato
 * en prorrateo, o semanas del arriendo financiadas dentro del propio convenio). Por eso avanza
 * día de pago a día de pago preguntándole a `cuotaConvenioDelPeriodo` — la MISMA función que
 * decide el cobro — hasta encontrar el primero que sí la exige.
 *
 * Preguntarle a la función en vez de reimplementar la regla es lo que evita que la pantalla
 * anuncie una fecha y el cobro haga otra cosa.
 */
export function proximaCuotaConvenio(
  convenio: { cuota_por_periodo?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null } | null | undefined,
  contrato: ContratoCiclo,
  hoy: Date,
): string | null {
  if (!convenio || (convenio.cuota_por_periodo ?? 0) <= 0) return null;
  let d = proximoDiaPago(contrato, hoy);
  // 8 períodos de margen: cubre el prorrateo y hasta 2 semanas financiadas con holgura.
  for (let i = 0; i < 8; i++) {
    if (cuotaConvenioDelPeriodo(convenio, contrato, d) > 0) return fechaAISO(d);
    d = proximoDiaPago(contrato, d);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ¿CUÁNTO DEBE HOY? — UNA sola fuente para todo el sistema.
//
// EL PROBLEMA QUE VIENE A RESOLVER (12-ago-2026, caso LIBINTO XZT89H): esta cuenta estaba
// escrita en DIEZ lugares distintos que se fueron separando. En nueve de ellos la cuota del
// convenio se sumaba COMPLETA sin descontar lo que el cliente ya había abonado ese período: pagó
// $302.000 (su semana + los $100.000 del acuerdo) y la pantalla le seguía cobrando los $100.000.
// El colmo es que el ESTADO (al día / mora) sí lo descontaba — la misma pantalla decía "al día"
// y "debe $100.000" al mismo tiempo.
//
// Por eso devuelve el DESGLOSE y no solo el total: el número grande y el recuadro que lo explica
// salen del MISMO objeto, así que no pueden contradecirse. Ese era el defecto de fondo.
//
// REGLAS DEL DUEÑO (12-ago-2026, cerradas — no re-preguntar):
//  1. "Le falta por pagar" es SOLO lo que falta. Si ya pagó todo, dice $0.
//  2. El acuerdo se ARRASTRA: si su cuota es $100.000 y abonó $40.000, la semana siguiente le
//     tocan $160.000. El acuerdo no se atrasa por abonar de a poco.
//  3. El saldo a favor se MUESTRA, nunca se resta solo (se aplica a mano).

export type ParteDebe = { toca: number; pagado: number; falta: number };

export type LoQueDebe = {
  cuota: ParteDebe;
  acuerdo: (ParteDebe & { cuotaDelPeriodo: number }) | null;
  deudas: ParteDebe;
  /** El número que el funcionario le cobra hoy. */
  totalFalta: number;
  /** Se muestra al lado, NUNCA se resta del total (regla 3). */
  saldoAFavor: number;
};

/**
 * Cuántas cuotas del convenio se le han EXIGIDO desde que empezó a correr hasta hoy.
 *
 * Le pregunta a `cuotaConvenioDelPeriodo` período por período en vez de reimplementar la regla:
 * ella ya sabe que el convenio no corre durante el prorrateo ni mientras cubre semanas
 * financiadas. Si esa regla cambia algún día, este conteo la sigue solo.
 */
function periodosConvenioExigidos(
  convenio: { cuota_por_periodo?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null; periodos_exonerados?: number | null },
  contrato: ContratoCiclo,
  hoy: Date,
): number {
  if (!convenio.created_at) return 0;
  const hoyIni = fechaAISO(inicioPeriodoActual(contrato, hoy));
  let d = inicioPeriodoActual(contrato, new Date(convenio.created_at.slice(0, 10) + "T12:00:00"));
  let n = 0;
  // Tope de seguridad: un convenio no puede tener más de 24 cuotas (MAX_CUOTAS del modal), y
  // sin tope un contrato con fechas raras colgaría la pantalla.
  for (let i = 0; i < 200 && fechaAISO(d) <= hoyIni; i++) {
    if (cuotaConvenioDelPeriodo(convenio, contrato, d) > 0) n++;
    d = proximoDiaPago(contrato, d);
  }
  // RODAR EL PAQUETE (mig 118, regla del dueño 24-ago): las cuotas del convenio de las semanas
  // en que la moto estuvo GUARDADA se corren al final — no se perdonan, se exigen más tarde
  // (mismo principio que cajas_exoneradas, mig 078: restar ANTES del tope de deuda_total hace
  // que la curva se corra y el total igual se pague completo).
  return Math.max(n - (convenio.periodos_exonerados ?? 0), 0);
}

/**
 * Todo lo que un contrato debe HOY, desglosado en sus tres partes.
 *
 * `pagosConfirmados` deben ser SOLO los confirmados: un pago pendiente todavía no bajó nada.
 * `deudasPendientes` son las de estado 'pendiente' — las 'en_convenio' NO van acá, ya se cobran
 * dentro de la cuota del acuerdo (si se sumaran, se cobrarían dos veces).
 */
export function loQueDebe(
  contrato: ContratoCiclo & { saldo_favor_apertura?: number | null },
  pagosConfirmados: Array<{ fecha: string; valor: number; aplicado_convenio?: number | null; aplicado_saldo_favor?: number | null }>,
  deudasPendientes: Array<{ monto: number; monto_pendiente: number }>,
  convenio: { cuota_por_periodo?: number | null; deuda_total?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null; periodos_exonerados?: number | null } | null | undefined,
  hoy: Date,
  // `diario`: los contratos Diario cobran la tarifa del DÍA (con domingo aparte) contra lo
  // recaudado HOY, no contra el período. Ese cálculo vive en usePagos (que arrastra Supabase),
  // y este archivo es puro a propósito — por eso el valor entra desde afuera en vez de
  // importarlo. Así los 2 contratos Diario se comportan exactamente igual que antes.
  opciones: { sinPagosNunca?: boolean; diario?: { toca: number; pagado: number } } = {},
): LoQueDebe {
  const sinPagosNunca = opciones.sinPagosNunca ?? pagosConfirmados.length === 0;
  // ── 1. La cuota del período ──
  // Con motor: sale del ledger real, que ya sabe qué cajas están llenas. Sin motor: la fórmula
  // vieja de ventana. Las dos YA descontaban lo pagado — no se tocan, solo se envuelven.
  let cuota: ParteDebe;
  if (contrato.motor_v2 && contrato.forma_pago !== "Diario") {
    const d = desgloseExigible(contrato, hoy);
    const cubre = convenio?.cubre_periodo_hasta ?? null;
    const cubierto = !!(cubre && cubre >= fechaAISO(hoy));
    const exigibles = d.periodos.filter(p => !cubierto || p.fecha >= cubre!);
    const falta = (cubierto ? 0 : d.prorrateoPendiente)
      + exigibles.reduce((s, p) => s + p.monto, 0);
    // 🔴 `toca` es TODO lo que se le exige hoy, no una sola cuota (25-ago-2026, caso MARLON
    // MUÑOZ RNG53H): con dos semanas vencidas la pantalla mostraba "Cuota del período $202.000"
    // arriba y "Le falta por pagar $404.000" abajo — el desglose no cuadraba con su propio
    // total, que es exactamente lo que la regla de las cifras prohíbe. Ahora `toca` cuenta las
    // cajas exigidas (una completa por cada una, aunque venga parcial) más el prorrateo, y
    // `pagado` sale de la resta: así el recuadro explica el número grande en vez de contradecirlo.
    const valorCaja = valorPeriodoReal(contrato);
    const prorrateoTotal = cubierto ? 0
      : (d.prorrateoPendiente > 0 ? Math.max(contrato.prorrateo_total ?? 0, d.prorrateoPendiente) : 0);
    const toca = exigibles.length > 0 || prorrateoTotal > 0
      ? prorrateoTotal + exigibles.length * valorCaja
      : valorCaja;   // al día: se muestra la cuota del período como referencia de lo que viene
    cuota = { toca, pagado: Math.max(toca - falta, 0), falta };
  } else if (contrato.forma_pago === "Diario" && opciones.diario) {
    const { toca, pagado } = opciones.diario;
    cuota = { toca, pagado, falta: Math.max(toca - pagado, 0) };
  } else {
    const enProrrateo = estaEnProrrateo(contrato, sinPagosNunca);
    const toca = enProrrateo ? calcularProrrateoInicial(contrato) : valorPeriodoReal(contrato);
    const pagado = totalPagadoPeriodoActual(contrato, pagosConfirmados, hoy);
    cuota = { toca, pagado, falta: Math.max(toca - pagado, 0) };
  }

  // ── 2. La cuota del acuerdo (con arrastre — regla 2) ──
  // Se compara lo EXIGIDO ACUMULADO contra lo ABONADO ACUMULADO. Así, quien abonó de menos
  // arrastra la diferencia sin que el acuerdo se atrase, y quien ya pagó queda en cero.
  const acuerdo = faltaDelAcuerdo(convenio, contrato, pagosConfirmados, hoy);

  // ── 3. Las deudas sueltas ──
  const deudaOriginal = deudasPendientes.reduce((s, d) => s + d.monto, 0);
  const deudaFalta = deudasPendientes.reduce((s, d) => s + d.monto_pendiente, 0);
  const deudas: ParteDebe = { toca: deudaOriginal, pagado: Math.max(deudaOriginal - deudaFalta, 0), falta: deudaFalta };

  const saldoAFavor = Math.max(
    (contrato.saldo_favor_apertura ?? 0) + pagosConfirmados.reduce((s, p) => s + (p.aplicado_saldo_favor ?? 0), 0),
    0,
  );

  return {
    cuota, acuerdo, deudas,
    totalFalta: cuota.falta + (acuerdo?.falta ?? 0) + deudas.falta,
    saldoAFavor,
  };
}

// cuotaConvenio: la cuota del convenio activo es OBLIGATORIA junto con el pago normal —
// si el cliente paga su cuota pero no la del convenio, entra en mora igual (antes el
// convenio sin pagar quedaba invisible y el cliente aparecía "al día").
/**
 * Cuánto le falta HOY de la cuota del acuerdo, con arrastre.
 *
 * 🔑 Es la ÚNICA cuenta del acuerdo en todo el sistema. La usan las dos cosas que antes se
 * separaban: el MONTO que se cobra (`loQueDebe`) y el ESTADO que se pinta (`calcularEstadoCartera`).
 *
 * 🔴 POR QUÉ EXISTE (14-ago-2026, visto en pantalla con DANIEL MILLAN, RLT87H): el monto usaba el
 * arrastre —todo lo abonado desde que se firmó el acuerdo— y el estado miraba SOLO los pagos de la
 * semana en curso. DANIEL llevaba $61.000 abonados contra una cuota de $33.500, pero los había
 * pagado el 1 y el 8 de agosto; para el estado esos pagos "no existían" y lo marcaba EN MORA con
 * $0 de deuda — y de paso en la cola de RECOLECCIÓN FÍSICA.
 *
 * Es el mismo defecto de LIBINTO del 13-ago pero al revés: allá mentía el monto, acá el estado.
 * Dos cuentas del mismo hecho SIEMPRE se separan. Por eso ahora hay una sola.
 *
 * La regla que implementa (regla 2 del dueño): se compara lo EXIGIDO ACUMULADO contra lo ABONADO
 * ACUMULADO. Quien abonó de menos arrastra la diferencia; quien ya pagó queda en cero. Y nunca se
 * le exige más de lo que pactó — la última cuota es el resto.
 */
export function faltaDelAcuerdo(
  convenio: { cuota_por_periodo?: number | null; deuda_total?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null; periodos_exonerados?: number | null } | null | undefined,
  contrato: ContratoCiclo,
  pagosConfirmados: Array<{ aplicado_convenio?: number | null }>,
  hoy: Date,
): (ParteDebe & { cuotaDelPeriodo: number }) | null {
  const cuotaPeriodo = convenio?.cuota_por_periodo ?? 0;
  if (!convenio || cuotaPeriodo <= 0) return null;
  const periodos = periodosConvenioExigidos(convenio, contrato, hoy);
  const exigido = Math.min(periodos * cuotaPeriodo, convenio.deuda_total ?? Infinity);
  const abonado = pagosConfirmados.reduce((s, p) => s + (p.aplicado_convenio ?? 0), 0);
  return {
    toca: exigido,
    pagado: Math.min(abonado, exigido),
    falta: Math.max(exigido - abonado, 0),
    cuotaDelPeriodo: cuotaConvenioDelPeriodo(convenio, contrato, hoy),
  };
}

export function calcularEstadoCartera(
  contrato: ContratoCiclo,
  // aplicado_convenio es opcional: solo lo usa la rama del motor v2, para saber si la cuota
  // del convenio de este período ya quedó abonada.
  pagosConfirmados: Array<{ fecha: string; valor: number; aplicado_convenio?: number | null }>,
  hoy: Date,
  cuotaConvenio = 0,
  // periodoCubierto: al crear un convenio se puede meter la cuota de la semana actual DENTRO
  // del convenio (alivio único). Mientras ese período esté cubierto, no cuenta como mora ni
  // se cobra la cuota normal aparte — ya está financiada en el convenio.
  periodoCubierto = false,
  // El convenio COMPLETO. Con él, el estado usa la misma cuenta que el monto (arrastre
  // acumulado) en vez de mirar solo los pagos de la semana en curso — ver `faltaDelAcuerdo`.
  // Es opcional para no cambiarle el estado de golpe a las pantallas que aún no lo pasan.
  convenio?: { cuota_por_periodo?: number | null; deuda_total?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null } | null,
): EstadoCartera {
  // MOTOR V2 (libro de cajas): el estado sale de los acumuladores del ledger —
  // en mora si existe una caja exigida sin llenar (FIFO estricto). Esta rama cubre
  // AUTOMÁTICAMENTE a todas las vistas que llaman esta función.
  const hoyDia = new Date(hoy);
  hoyDia.setHours(0, 0, 0, 0);
  if (contrato.motor_v2 && contrato.forma_pago !== "Diario") {
    if (periodoCubierto) return "al-dia";
    const estadoLedger = estadoCarteraV2(contrato, hoy);
    if (estadoLedger !== "al-dia") return estadoLedger;
    // El ledger de cuotas está al día — pero el convenio va ENCIMA de la cuota, no la
    // reemplaza. Esta rama lo ignoraba por completo: quien dejaba de pagar su convenio
    // nunca aparecía en mora ni en el panel del día, aunque la misma pantalla le dijera
    // "DEBE PAGAR AHORA: cuota del convenio". (Caso real: DIEGO LOCIN SOTO, XZI10H.)
    if (cuotaConvenio > 0) {
      // Con el convenio a la mano, la MISMA cuenta que usa el monto: arrastre acumulado. Sin él,
      // se conserva el comportamiento viejo (solo la ventana del período) para no moverle el
      // estado a las pantallas que todavía no lo pasan.
      const acuerdo = convenio ? faltaDelAcuerdo(convenio, contrato, pagosConfirmados, hoy) : null;
      const faltaAcuerdo = acuerdo ? acuerdo.falta : Math.max(
        cuotaConvenio - pagosConfirmados
          .filter(p => p.fecha >= inicioVentanaPagosISO(contrato, hoyDia))
          .reduce((s, p) => s + (p.aplicado_convenio ?? 0), 0), 0);
      if (faltaAcuerdo > 0) {
        const inicio = inicioPeriodoActual(contrato, hoyDia);
        const dias = Math.floor((hoyDia.getTime() - inicio.getTime()) / 86400000);
        if (dias <= 0) return "al-dia";   // le toca hoy: "paga hoy", no mora
        if (dias === 1) return "gabela";
        return "mora";
      }
    }
    return "al-dia";
  }
  if (periodoCubierto) return "al-dia";
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
  pagosConfirmados: Array<{ fecha: string; valor: number; aplicado_convenio?: number | null }>,
  hoy: Date,
  cuotaConvenio = 0,
  periodoCubierto = false,
  // Se pasa derecho al estado: sin esto, un cliente que abonó su acuerdo en semanas anteriores
  // seguiría contando días de mora y entraría a la cola de RECOLECCIÓN sin deber nada.
  convenio?: { cuota_por_periodo?: number | null; deuda_total?: number | null; created_at?: string | null; cubre_periodo_hasta?: string | null } | null,
): number {
  if (calcularEstadoCartera(contrato, pagosConfirmados, hoy, cuotaConvenio, periodoCubierto, convenio) !== "mora") return 0;
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
  // Cajas RODADAS al final por tiempo fuera de servicio (mig 078): se restan de la exigencia
  // pero NO se perdonan. La resta va ANTES del tope de total_cajas — si fuera después, las
  // exigidas nunca pasarían de (total − exoneradas) y el contrato jamás podría terminar.
  // Restando antes, la curva de exigencia se corre N períodos y con el tiempo vuelve a alcanzar
  // total_cajas: el cliente paga las mismas cajas, N períodos más tarde.
  const exoneradas = contrato.cajas_exoneradas ?? 0;
  const inicio = contrato.fecha_inicio_cajas;
  if (!inicio) return Math.max(Math.min(previas, contrato.total_cajas ?? previas) - exoneradas, 0);
  const hoyISO = fechaAISO(hoy);
  if (hoyISO < inicio) return Math.max(Math.min(previas, contrato.total_cajas ?? previas) - exoneradas, 0);
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
  n -= exoneradas;
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

/**
 * Hasta qué día queda cubierto un convenio que financia `nFinanciadas` semanas.
 * Es lo que se guarda en `convenios.cubre_periodo_hasta`, y de ahí sale algo muy sensible:
 * `CobrosView` deja de exigir TODAS las cajas anteriores a esa fecha.
 *
 * 🔴 EL DEFECTO QUE CORRIGE (8-ago-2026, JHEFERSON XYZ50H): antes se avanzaban N días de pago
 * desde HOY. Pero las semanas que se financian son las VENCIDAS —hacia atrás—, no las que vienen.
 * Con 2 semanas vencidas y financiando 2 entraban $404.000 al convenio y la fecha quedaba en
 * 19-ago, que perdonaba TRES períodos ($606.000): una semana regalada, y otra más por cada
 * semana de atraso.
 *
 * La cuenta correcta: las N semanas tapan desde la vencida MÁS VIEJA hacia adelante, así que la
 * fecha sale del período actual corrido `(N − vencidas + 1)` días de pago.
 */
export function fechaCubrePeriodo(
  contrato: ContratoCiclo,
  hoy: Date,
  nFinanciadas: number,
  semanasVencidas: number,
): string | null {
  if (nFinanciadas < 1) return null;
  const pasos = nFinanciadas - semanasVencidas + 1;
  if (pasos >= 0) {
    let d = inicioPeriodoActual(contrato, hoy);
    for (let i = 0; i < pasos; i++) d = proximoDiaPago(contrato, d);
    return fechaAISO(d);
  }
  // Financia MENOS semanas de las que debe: la cobertura queda en un período ya pasado. Se
  // retrocede parándose en una fecha vieja y preguntando cuál era el período de ese día.
  const dias = contrato.forma_pago === "Semanal" ? 7 : contrato.forma_pago === "Quincenal" ? 15 : 30;
  const atras = new Date(hoy);
  atras.setDate(atras.getDate() - Math.abs(pasos) * dias);
  return fechaAISO(inicioPeriodoActual(contrato, atras));
}

// Hueco total exigible de CUOTAS a hoy (prorrateo pendiente + cajas exigidas sin llenar).
// Es el "debe de cuotas" del ledger — las deudas registradas y el convenio van aparte.
/**
 * Cuánto arriendo entra a un convenio al financiar `n` semanas, y cuánto AHORRO viaja adentro.
 *
 * Dos reglas que parecen chiquitas y valen plata:
 *
 * 1. La semana MÁS VIEJA sin pagar puede traer un abono a medias. Financiarla completa le cobra
 *    otra vez lo que ya abonó. (NESTOR, YAL67H: debía 2 semanas con $14.000 abonados a la más
 *    vieja; el convenio se firmó por $202.000 cuando faltaban $188.000.)
 * 2. Cada semana lleva su ahorro del cliente adentro. Aunque la semana entre al convenio, esa
 *    plata sigue siendo SUYA — se congela acá para poder acreditársela cuando pague.
 *
 * El ahorro se reparte tarifa-primero, igual que en las cajas: solo el tramo final es ahorro.
 */
export type SemanasFinanciadas = { primera: number; total: number; ahorro: number };

export function financiarSemanas(contrato: ContratoCiclo, hoy: Date, n: number): SemanasFinanciadas {
  const vacio = { primera: 0, total: 0, ahorro: 0 };
  if (n < 1 || contrato.forma_pago === "Diario") return vacio;
  const cuota = valorPeriodoReal(contrato);
  if (cuota <= 0) return vacio;

  const hueco = huecoCuotasHoy(contrato, hoy);
  // Sin nada vencido se financia hacia ADELANTE: la semana que viene entra entera y el abono de
  // la caja en curso no cuenta (pertenece a otra semana).
  const abono = hueco > 0 ? (contrato.caja_actual_pagado ?? 0) : 0;
  const primera = hueco > 0 ? Math.max(Math.min(hueco, cuota - abono), 0) : cuota;

  const ahorroSemana = ahorroPeriodoExacto(contrato, false);
  const tarifa = Math.max(cuota - ahorroSemana, 0);
  const antes = Math.min(Math.max(abono - tarifa, 0), ahorroSemana);
  const despues = Math.min(Math.max(abono + primera - tarifa, 0), ahorroSemana);

  return {
    primera,
    total: primera + (n - 1) * cuota,
    ahorro: Math.max(despues - antes, 0) + (n - 1) * ahorroSemana,
  };
}

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
): { pagado: number; consumido: number; aFavor: number; porCobrar: number; ahorroPorCobrar: number } {
  const cero = { pagado: 0, consumido: 0, aFavor: 0, porCobrar: 0, ahorroPorCobrar: 0 };
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
  // Del pago diario, una parte es TARIFA (de la empresa) y otra es AHORRO (del cliente). Se lleva
  // aparte para no cobrarle al cliente su propio ahorro al liquidar — ver `ahorroPorCobrar` abajo.
  let ahorroConsumido = 0;
  const ahorroCaja = ahorroPeriodoExacto(contrato, false);
  if (ret >= inicio) {
    consumido += contrato.prorrateo_total ?? 0; // los días previos al inicio ya se consumieron
    const pagoLS = (contrato.tarifa_diaria ?? 27000) + (contrato.ahorro_diario ?? 4000);
    const pagoDom = (contrato.tarifa_domingo ?? 14000) + (contrato.ahorro_domingo ?? 2000);
    const ahLS = contrato.ahorro_diario ?? 4000;
    const ahDom = contrato.ahorro_domingo ?? 2000;
    // Recorre las cajas por sus fechas de pago: período completo terminado antes del
    // retorno → valor completo; la caja en curso → día a día hasta el día de entrega.
    let inicioCaja = new Date(inicio);
    for (let k = 0; k < 400; k++) {
      const finCaja = proximoDiaPago(contrato, inicioCaja); // día que inicia la caja siguiente
      if (finCaja <= ret) {
        consumido += valor;
        ahorroConsumido += ahorroCaja;
        inicioCaja = finCaja;
      } else {
        // La caja en curso se cuenta día a día hasta el día de entrega.
        let tramo = 0;
        let tramoAhorro = 0;
        let d = new Date(inicioCaja);
        while (d <= ret) {
          const esDom = d.getDay() === 0;
          tramo += esDom ? pagoDom : pagoLS;
          tramoAhorro += esDom ? ahDom : ahLS;
          d.setDate(d.getDate() + 1);
        }
        // Un tramo nunca puede valer más que la caja completa que representa (la suma día a día
        // se pasa por unos pesos por el redondeo del domingo). Si se recorta, su ahorro se recorta
        // al de la caja: si no, quedaría un ahorro mayor al del período entero.
        if (tramo > valor) { tramo = valor; tramoAhorro = ahorroCaja; }
        consumido += tramo;
        ahorroConsumido += tramoAhorro;
        break;
      }
    }
  }
  const porCobrar = Math.max(consumido - pagado, 0);
  // AHORRO QUE LE CORRESPONDE DE LO QUE SE LE COBRA (regla del dueño, 21-ago).
  //
  // De cada $31.000 diarios, $27.000 son tarifa de la empresa y $4.000 son ahorro DEL CLIENTE.
  // Al liquidar se le cobran los días completos, así que hay que devolverle aparte su parte de
  // ahorro — si no, la empresa se queda con plata que no es suya y el cliente PIERDE ahorro, que
  // es justo lo que la spec prohíbe ("nadie pierde ahorro como castigo").
  //
  // Se descuenta el ahorro que sus pagos YA le acreditaron: dentro de un período rige tarifa
  // primero, así que lo pagado cubre tarifa antes de generar ahorro, y ese ahorro ya está sumado
  // en `ahorro_acumulado`. Contarlo otra vez acá sería dárselo dos veces.
  const tarifaConsumida = consumido - ahorroConsumido;
  const ahorroYaGanado = Math.max(pagado - tarifaConsumida, 0);
  const ahorroPorCobrar = porCobrar > 0 ? Math.max(ahorroConsumido - ahorroYaGanado, 0) : 0;
  return {
    pagado,
    consumido,
    aFavor: Math.max(pagado - consumido, 0),
    porCobrar,
    ahorroPorCobrar,
  };
}

// Estado de cartera v2: en mora = existe una caja exigida sin llenar (o prorrateo vencido).
// Gabela = el hueco nació hoy o ayer (día de pago + 1 de gracia). Pagar la caja de esta
// semana con una vieja abierta NO saca de mora (FIFO estricto).
export function estadoCarteraV2(contrato: ContratoCiclo, hoy: Date): EstadoCartera {
  const hueco = huecoCuotasHoy(contrato, hoy);
  if (hueco <= 0) return "al-dia";
  const dias = diasEnMoraV2(contrato, hoy);
  // Secuencia clásica: día de pago (0) = al día / "paga hoy" · día siguiente (1) = gabela ·
  // después (2+) = mora. Antes el día 0 ya salía "gabela" — castigaba al cliente EL MISMO
  // día que le toca pagar (ej. prorrateo que vence hoy → debe verse "paga hoy", no gabela).
  if (dias === 0) return "al-dia";
  if (dias === 1) return "gabela";
  return "mora";
}
