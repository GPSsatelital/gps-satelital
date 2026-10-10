/**
 * EL LIBRO DE SEMANAS — cada semana del contrato, una por una: si está pagada, a medias o sin pagar,
 * con qué pagos se llenó y de qué fecha a qué fecha es.
 *
 * PEDIDO DEL DUEÑO (9-oct-2026): *"no saben identificar las cuentas"*. Querían ver cada pago y a
 * qué semana fue, y desde cuándo está el cliente en el sistema. Se ve en la ficha del cliente →
 * Pagos, en lista o en calendario.
 *
 * ── DE DÓNDE SALE CADA COSA (nada se inventa) ─────────────────────────────────────────────────
 * · CUÁNTAS semanas están pagadas y cuánto lleva la que está a medias: los contadores del contrato
 *   (`cajas_pagadas`, `caja_actual_pagado`), que son la verdad del motor. Nunca otra cuenta.
 * · CON QUÉ PAGO se llenó cada semana: el rebobinado de `rastroDeCubrimiento`. Si no cierra contra
 *   los contadores (pasa en contratos migrados), el libro lo dice y no muestra pagos por semana.
 * · LA FECHA de cada semana:
 *     – las que NO están pagadas (y la que viene): la MISMA fecha que usa Cartera para la mora —
 *       la semana n se exige en el período n − previas + rodadas (mig 078/180, `desgloseExigible`).
 *       Si el libro dijera otra fecha, contradiría los días de mora.
 *     – las pagadas: su semana real del calendario, saltando los períodos en que la moto estuvo
 *       guardada y se rodaron (`acuerdos_tiempo_rodado`) o que se corrieron por un rodado por deuda.
 *       Si las rodadas registradas no suman `cajas_exoneradas`, no se sabe dónde caen todas: las
 *       pagadas salen sin rango ("pagada el día X") y el libro avisa por qué.
 */
import {
  cajasExigidasHasta, valorPeriodoReal, calcularEstadoCartera, diasEnMora, diasDelConjunto, cuotaConvenioDelPeriodo,
  semanaDeCierre, type ContratoCiclo,
} from "./cicloPago";
import { rastroDeCubrimiento } from "./cubrimientoPago";

export type ContratoLibro = ContratoCiclo & {
  id?: string;
  fecha_entrega?: string | null;
  es_migrado?: boolean | null;
};

export type PagoLibro = {
  id: string;
  fecha: string;
  created_at: string;
  estado?: string | null;
  valor: number;
  metodo?: string | null;
  tipo_registro?: string | null;
  aplicado_tarifa?: number | null;
  aplicado_prorrateo?: number | null;
};

/** `acuerdos_tiempo_rodado` con decisión rodar_al_final. */
export type AcuerdoRodado = { fecha_entrada: string | null; fecha_salida: string | null; dias_en_empresa: number | null };
/** `rodados_por_deuda` (D-044). */
export type RodadoPorDeudaLibro = { numero: string; created_at: string; cajas_corridas: number; estado: string };
/** `cajas_llenadas` (mig 112): el día en que se llenó cada semana. Solo la ve la oficina. */
export type CajaLlenadaLibro = { caja_numero: number; fecha: string; created_at?: string | null };

export type PagoEnSemana = { pagoId: string; fecha: string; monto: number; origen: string; completo: boolean };

export type EstadoSemana = "pagada" | "a_medias" | "debe" | "proxima" | "falta";

export type SemanaDelLibro = {
  tipo: "semana";
  numero: number;
  /** null = no se sabe con certeza de qué fecha a qué fecha es. */
  desde: string | null;
  hasta: string | null;
  valor: number;
  pagado: number;
  estado: EstadoSemana;
  /** Las no pagadas: desde qué día se le exige (la misma fecha de Cartera). */
  seExige: string | null;
  /** Días desde que se le exige (0 = hoy). Solo para las que debe. */
  diasVencida: number;
  /** Día en que quedó completa (el del pago que la completó, o el que anotó la base). */
  completadaEl: string | null;
  /** null = el sistema no tiene el detalle de con qué pagos se llenó. */
  pagos: PagoEnSemana[] | null;
  /** Es la semana de hoy. */
  actual: boolean;
  /** Pagada antes de que se le exigiera. */
  adelantada: boolean;
};

export type FilaLibro =
  | SemanaDelLibro
  | { tipo: "antes"; semanas: number; desdeNumero: number; hastaNumero: number }
  | { tipo: "prorrateo"; desde: string | null; hasta: string | null; total: number; pagado: number; pagos: PagoEnSemana[] | null }
  | {
      tipo: "rodada";
      /** Las semanas del calendario de pagos que no se cobran ahora (se corrieron al final). */
      desde: string; hasta: string; semanas: number; motivo: "guardada" | "deuda"; texto: string;
      /** Moto guardada: las fechas en que DE VERDAD estuvo guardada (no las del calendario de pagos). */
      real: { desde: string; hasta: string | null; dias: number | null } | null;
      /** Hoy cae dentro de este tiempo rodado (la moto acaba de volver, o sigue guardada). */
      hoy: boolean;
    }
  | { tipo: "resto"; semanas: number; desdeNumero: number; hastaNumero: number; hasta: string | null };

/** Un período del calendario, ya con lo que pasó en él (para la vista de calendario). */
export type PeriodoCalendario = {
  desde: string;
  hasta: string;
  numero: number | null;
  estado: EstadoSemana | "rodada" | "sin_dato" | "dias_iniciales";
};

export type LibroSemanas = {
  unidad: "Semana" | "Quincena" | "Mes";
  valorCaja: number;
  totalCajas: number | null;
  pagadas: number;
  enCurso: number;
  exigidas: number;
  /** Número de la semana de hoy (la que se está usando). null si hoy cae en tiempo rodado. */
  vaEn: number | null;
  /** Hoy cae dentro de un tiempo rodado: ninguna semana es "la de hoy" (RMZ68H, 9-oct). */
  hoyEnRodada: boolean;
  entregada: string | null;
  enAppDesde: string | null;
  esMigrado: boolean;
  previas: number;
  rodadas: number;
  filas: FilaLibro[];
  /** ¿Se sabe con qué pago se llenó cada semana? */
  detallePagos: boolean;
  /** ¿Las semanas pagadas tienen su rango de fechas? */
  fechasPagadas: boolean;
  avisos: string[];
  periodos: PeriodoCalendario[];
  /** Pagos confirmados por día (para el calendario). */
  pagosPorDia: Record<string, PagoLibro[]>;
};

const DIAS_PERIODO: Record<string, number> = { Semanal: 7, Quincenal: 15, Mensual: 30 };

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function sumarDias(fecha: string, n: number): string {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** De dónde vino la plata de un pago, dicho como lo entiende el funcionario. */
export function origenDelPago(p: Pick<PagoLibro, "metodo" | "tipo_registro">): string {
  if (p.tipo_registro === "adelanto_base") return "Semana adelantada de la base";
  if (p.tipo_registro === "saldo_favor") return "Saldo a favor";
  const m = p.metodo === "Transferencia" ? "Transferencia" : "Efectivo";
  return p.tipo_registro === "campo" ? `${m} (cobro en la calle)` : m;
}

/**
 * Las fechas de inicio de los períodos 1..n del libro. EL MISMO calendario del motor
 * (`cajasExigidasHasta`, `fechaCaja`, `diasEnMoraV2`): semanal = cada 7 días desde
 * `fecha_inicio_cajas`, aunque ese día no sea su día de pago (contratos con el día cambiado o mal
 * migrado); quincenal/mensual = sus días del mes desde el inicio. Caminar con `proximoDiaPago`
 * daba otra fecha que la de Cartera en esos contratos (medido el 9-oct: 12 de 345).
 */
function inicioDePeriodos(c: ContratoLibro, n: number): string[] {
  const inicio = c.fecha_inicio_cajas;
  if (!inicio || n < 1) return [];
  const out: string[] = [];
  if (c.forma_pago === "Quincenal" || c.forma_pago === "Mensual") {
    const dias = [...(c.dias_pago_mes && c.dias_pago_mes.length > 0 ? c.dias_pago_mes : [1])].sort((a, b) => a - b);
    const dIni = new Date(inicio + "T00:00:00");
    const cursor = new Date(dIni.getFullYear(), dIni.getMonth(), 1);
    for (let guard = 0; out.length < n && guard < 400; guard++) {
      const ultimo = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
      for (const dia of dias) {
        const f = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(dia, ultimo));
        if (f >= dIni && out.length < n) out.push(iso(f));
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return out;
  }
  for (let i = 0; i < n; i++) out.push(sumarDias(inicio, i * 7));
  return out;
}

/**
 * Qué períodos del calendario se rodaron, cuando se puede saber.
 * · Moto guardada (`acuerdos_tiempo_rodado`): los períodos que arrancan dentro de lo que estuvo
 *   guardada, tantos como `floor(días / días del período)` — la misma cuenta de la nómina. Si no
 *   arrancan suficientes adentro, el que estaba corriendo el día que entró.
 * · Rodado por deuda: las semanas que se corrieron eran las más viejas sin pagar ese día; se ubican
 *   con las semanas que ya estaban llenas a la hora del rodado (`cajas_llenadas`).
 * `completas` = las ubicadas suman exactamente `cajas_exoneradas`.
 */
export function ubicarRodadas(
  c: ContratoLibro,
  inicios: string[],
  acuerdos: AcuerdoRodado[],
  rodadosDeuda: RodadoPorDeudaLibro[],
  llenadas: CajaLlenadaLibro[] | null,
): { indices: Set<number>; grupos: GrupoRodado[]; completas: boolean; repetidos: number } {
  const exo = c.cajas_exoneradas ?? 0;
  const indices = new Set<number>();
  const grupos: GrupoRodado[] = [];
  const largo = DIAS_PERIODO[c.forma_pago] ?? 7;

  // El mismo tiempo guardado anotado dos veces (doble toque, 9-oct) se cuenta una vez para ubicar;
  // `repetidos` lo deja ver.
  const vistos = new Set<string>();
  let repetidos = 0;
  for (const a of acuerdos) {
    if (!a.fecha_entrada) continue;
    const clave = `${a.fecha_entrada}|${a.fecha_salida ?? ""}`;
    if (vistos.has(clave)) { repetidos++; continue; }
    vistos.add(clave);
    const p = Math.floor((a.dias_en_empresa ?? 0) / largo);
    if (p <= 0) continue;
    const salida = a.fecha_salida ?? "9999-12-31";
    const dentro: number[] = [];
    inicios.forEach((f, i) => { if (f >= a.fecha_entrada! && f < salida && !indices.has(i + 1)) dentro.push(i + 1); });
    let tomados = dentro.slice(0, p);
    if (tomados.length < p) {
      const corriendo = inicios.findIndex((f, i) => f <= a.fecha_entrada! && (inicios[i + 1] ?? "9999-12-31") > a.fecha_entrada!) + 1;
      if (corriendo > 0 && !tomados.includes(corriendo) && !indices.has(corriendo)) tomados = [corriendo, ...tomados].slice(0, p);
    }
    tomados.forEach(i => indices.add(i));
    if (tomados.length > 0) {
      grupos.push({
        indices: tomados, motivo: "guardada", texto: `Moto guardada del ${a.fecha_entrada} al ${a.fecha_salida ?? "—"}`,
        real: { desde: a.fecha_entrada, hasta: a.fecha_salida, dias: a.dias_en_empresa },
      });
    }
  }

  for (const r of rodadosDeuda.filter(x => x.estado !== "anulado" && x.cajas_corridas > 0)) {
    if (!llenadas) continue;
    // Semanas llenas a la hora del rodado = las de hoy menos las que se llenaron después.
    const despues = llenadas.filter(l => l.caja_numero > 0 && (l.created_at ?? l.fecha) > r.created_at).length;
    const pagadasAlRodar = (c.cajas_pagadas ?? 0) - despues;
    // El período de la primera semana sin pagar ese día, caminando el calendario sin las ya rodadas.
    let n = c.cajas_previas ?? 0;
    let i = 0;
    while (n < pagadasAlRodar && i < inicios.length) { i++; if (!indices.has(i)) n++; }
    const tomados: number[] = [];
    while (tomados.length < r.cajas_corridas && i < inicios.length) { i++; if (!indices.has(i)) tomados.push(i); }
    tomados.forEach(x => indices.add(x));
    if (tomados.length > 0) grupos.push({ indices: tomados, motivo: "deuda", texto: `Rodado por deuda ${r.numero}`, real: null });
  }

  return { indices, grupos, completas: indices.size === exo, repetidos };
}

export type ExtraLibro = { acuerdos?: AcuerdoRodado[]; rodadosDeuda?: RodadoPorDeudaLibro[]; llenadas?: CajaLlenadaLibro[] | null };

type GrupoRodado = {
  indices: number[];
  motivo: "guardada" | "deuda";
  texto: string;
  real: { desde: string; hasta: string | null; dias: number | null } | null;
};

/**
 * El calendario del libro: de qué fecha a qué fecha es cada semana. Lo usan el libro y la frase
 * «Cubre la semana del X al Y» de los pagos en Cartera — las dos dicen lo mismo.
 */
export function calendarioDelLibro(c: ContratoLibro, hoy: Date, extra: ExtraLibro = {}) {
  const previas = c.cajas_previas ?? 0;
  const pagadas = c.cajas_pagadas ?? 0;
  const exo = c.cajas_exoneradas ?? 0;
  const total = c.total_cajas ?? null;
  const exigidas = cajasExigidasHasta(c, hoy);
  const valorCaja = valorPeriodoReal(c);
  const ultimaCaja = Math.max(total ?? 0, pagadas + 1, exigidas + 1);
  const inicios = inicioDePeriodos(c, Math.max(ultimaCaja - previas + exo + 2, 1));
  const periodo = (i: number) => (i >= 1 && i < inicios.length ? { desde: inicios[i - 1], hasta: sumarDias(inicios[i], -1) } : null);
  const rod = ubicarRodadas(c, inicios, extra.acuerdos ?? [], extra.rodadosDeuda ?? [], extra.llenadas ?? null);
  const fechasPagadas = exo === 0 || rod.completas;
  // Índice de período de cada semana pagada, caminando el calendario sin las rodadas.
  const indicePagada = new Map<number, number>();
  if (fechasPagadas) {
    let n = previas, i = 0;
    while (n < pagadas && i < inicios.length + 400) { i++; if (rod.indices.has(i)) continue; n++; indicePagada.set(n, i); }
  }
  const fechaDe = (n: number): { desde: string; hasta: string } | null => {
    if (n <= previas && n <= pagadas) return null;
    if (n <= pagadas) return fechasPagadas ? periodo(indicePagada.get(n) ?? -1) : null;
    return periodo(n - previas + exo);
  };
  return { valorCaja, exigidas, inicios, periodo, rod, fechasPagadas, indicePagada, fechaDe };
}

export function construirLibro(c: ContratoLibro, pagos: PagoLibro[], hoy: Date, extra: ExtraLibro = {}): LibroSemanas {
  const unidad = c.forma_pago === "Quincenal" ? "Quincena" : c.forma_pago === "Mensual" ? "Mes" : "Semana";
  const previas = c.cajas_previas ?? 0;
  const pagadas = c.cajas_pagadas ?? 0;
  const enCurso = c.caja_actual_pagado ?? 0;
  const exo = c.cajas_exoneradas ?? 0;
  const total = c.total_cajas ?? null;
  const hoyISO = iso(hoy);
  const avisos: string[] = [];

  const confirmados = pagos.filter(p => p.estado === "Confirmado");
  const pagosPorDia: Record<string, PagoLibro[]> = {};
  for (const p of confirmados) (pagosPorDia[p.fecha] ??= []).push(p);

  const { valorCaja, exigidas, inicios, periodo, rod, fechasPagadas, indicePagada, fechaDe } = calendarioDelLibro(c, hoy, extra);
  if (exo > 0 && !rod.completas) {
    avisos.push(`Tiene ${exo} ${exo === 1 ? unidad.toLowerCase() : unidad.toLowerCase() + "s"} rodadas al final y el sistema no tiene anotado cuándo fueron todas. Por eso las pagadas dicen el día en que se pagaron, sin su rango de fechas.`);
  }
  if (rod.repetidos > 0) {
    avisos.push("Ojo: el mismo tiempo de moto guardada está anotado más de una vez. Avísele al administrador.");
  }

  // Ya debía cuando le guardaron la moto: al rodar, la curva de cobro se corrió y lo que debía también
  // (mig 078). Por eso esa semana sale con fecha posterior a la moto guardada — igual que en Cartera.
  if (fechasPagadas && rod.indices.size > 0 && pagadas >= previas) {
    // Dónde caería la primera sin pagar caminando el calendario real, contra dónde la pone la mora.
    let real = indicePagada.get(pagadas) ?? 0;
    do { real++; } while (rod.indices.has(real));
    if (real !== pagadas + 1 - previas + exo) {
      avisos.push(`Cuando le guardaron la moto ya debía ${unidad === "Mes" ? "meses" : unidad.toLowerCase() + "s"}. Al rodar, lo que debía también se corrió: por eso la primera que debe sale con fecha después de la moto guardada, y los días de mora se cuentan desde ahí (igual que en Cartera).`);
    }
  }

  const rastro = rastroDeCubrimiento(c, confirmados.map(p => ({
    id: p.id, created_at: p.created_at, estado: p.estado, aplicado_tarifa: p.aplicado_tarifa, aplicado_prorrateo: p.aplicado_prorrateo,
  })), { fechaDe: n => fechaDe(n), valorCaja });
  const detallePagos = rastro.confiable;
  if (!detallePagos) {
    avisos.push("El sistema no tiene el detalle de con qué pago se llenó cada semana (pasa en contratos que vienen del cuaderno). El estado de cada semana sí es el correcto.");
  }
  const porCaja = new Map<number, PagoEnSemana[]>();
  let pagosProrrateo: PagoEnSemana[] = [];
  for (const p of confirmados) {
    const cub = rastro.porPago[p.id];
    if (!cub) continue;
    for (const s of cub.semanas) {
      const arr = porCaja.get(s.numero) ?? [];
      arr.push({ pagoId: p.id, fecha: p.fecha, monto: s.monto, origen: origenDelPago(p), completo: s.completa });
      porCaja.set(s.numero, arr);
    }
    if (cub.prorrateo > 0) pagosProrrateo.push({ pagoId: p.id, fecha: p.fecha, monto: cub.prorrateo, origen: origenDelPago(p), completo: false });
  }
  const llenadaEl = new Map((extra.llenadas ?? []).map(l => [l.caja_numero, l.fecha] as const));

  // La semana de hoy: la que se está usando, según el calendario del motor.
  let indiceHoy: number | null = null;
  for (let i = 1; i < inicios.length; i++) if (inicios[i - 1] <= hoyISO && inicios[i] > hoyISO) { indiceHoy = i; break; }
  const empezo = indiceHoy !== null && hoyISO >= (c.fecha_inicio_cajas ?? "9999");
  // Si se sabe dónde cayó cada rodada, hoy puede caer DENTRO de una (la moto acaba de volver o sigue
  // guardada): ahí ninguna semana es "la de hoy". Antes se restaban todas las rodadas como si ya
  // hubieran pasado, y el «esta» quedaba en una semana vieja (RMZ68H: la 43, de agosto; 9-oct).
  const hoyEnRodada = empezo && fechasPagadas && rod.indices.has(indiceHoy!);
  let vaEn: number | null = null;
  if (empezo && !hoyEnRodada) {
    if (fechasPagadas) {
      let n = 0;
      for (let i = 1; i <= indiceHoy!; i++) if (!rod.indices.has(i)) n++;
      vaEn = previas + n;
    } else {
      vaEn = indiceHoy! + previas - exo;
    }
  }

  const filas: FilaLibro[] = [];
  const antesHasta = Math.min(previas, pagadas);
  if (antesHasta > 0) filas.push({ tipo: "antes", semanas: antesHasta, desdeNumero: 1, hastaNumero: antesHasta });

  const prorTotal = c.prorrateo_total ?? 0;
  if (prorTotal > 0) {
    filas.push({
      tipo: "prorrateo",
      desde: c.fecha_entrega ? sumarDias(c.fecha_entrega, 1) : null,
      hasta: c.fecha_inicio_cajas ?? null,
      total: prorTotal,
      pagado: Math.min(c.prorrateo_pagado ?? 0, prorTotal),
      pagos: detallePagos ? pagosProrrateo : null,
    });
  }

  const proxima = Math.max(exigidas, pagadas) + 1;
  const tope = total ?? proxima;
  const semanas: SemanaDelLibro[] = [];
  for (let n = antesHasta + 1; n <= Math.min(tope, proxima); n++) {
    const f = fechaDe(n);
    const estado: EstadoSemana = n <= pagadas ? "pagada"
      : n === pagadas + 1 && enCurso > 0 ? "a_medias"
      : n <= exigidas ? "debe"
      : n === proxima ? "proxima" : "falta";
    const exigeIdx = n - previas + exo;
    const seExige = estado === "pagada" ? null : (periodo(exigeIdx)?.desde ?? null);
    // Si la moto ya es de otro (mig 129), los días se congelan ese día, igual que en la mora.
    const hasta = c.fecha_fin_cobro && hoyISO > c.fecha_fin_cobro ? c.fecha_fin_cobro : hoyISO;
    const diasVencida = seExige && (estado === "debe" || estado === "a_medias") && seExige <= hasta
      ? Math.floor((new Date(hasta + "T00:00:00").getTime() - new Date(seExige + "T00:00:00").getTime()) / 86400000) : 0;
    const pagosN = detallePagos ? (porCaja.get(n) ?? []) : null;
    const completo = pagosN?.find(p => p.completo);
    semanas.push({
      tipo: "semana", numero: n, desde: f?.desde ?? null, hasta: f?.hasta ?? null, valor: valorCaja,
      pagado: estado === "pagada" ? valorCaja : estado === "a_medias" ? enCurso : 0,
      estado, seExige, diasVencida,
      completadaEl: estado === "pagada" ? (completo?.fecha ?? llenadaEl.get(n) ?? null) : null,
      pagos: estado === "pagada" || estado === "a_medias" ? pagosN : null,
      actual: vaEn === n,
      adelantada: estado === "pagada" && n > exigidas,
    });
  }

  // Las rodadas, en su lugar del calendario (solo si se sabe dónde fueron).
  const rodadas: FilaLibro[] = fechasPagadas ? rod.grupos.map(g => {
    const orden = [...g.indices].sort((a, b) => a - b);
    const ini = periodo(orden[0]);
    const fin = periodo(orden[orden.length - 1]);
    const hoy = orden.some(i => { const p = periodo(i); return !!p && p.desde <= hoyISO && hoyISO <= p.hasta; });
    return { tipo: "rodada" as const, desde: ini?.desde ?? "", hasta: fin?.hasta ?? "", semanas: orden.length, motivo: g.motivo, texto: g.texto, real: g.real, hoy };
  }).filter(r => r.desde) : [];

  // Se intercalan por fecha: cada rodada antes de la primera semana que arranca después de ella.
  const conRodadas: FilaLibro[] = [];
  const pendientes = [...rodadas].sort((a, b) => (a as { desde: string }).desde.localeCompare((b as { desde: string }).desde));
  for (const s of semanas) {
    while (pendientes.length && s.desde && (pendientes[0] as { desde: string }).desde <= s.desde) conRodadas.push(pendientes.shift()!);
    conRodadas.push(s);
  }
  conRodadas.push(...pendientes);
  filas.push(...conRodadas);

  if (total !== null && proxima < total) {
    filas.push({ tipo: "resto", semanas: total - proxima, desdeNumero: proxima + 1, hastaNumero: total, hasta: periodo(total - previas + exo)?.hasta ?? null });
  }
  if (total !== null && pagadas >= total) {
    avisos.push(`Ya completó sus ${total} ${unidad.toLowerCase() === "mes" ? "meses" : unidad.toLowerCase() + "s"}. Si todavía debe algo, lo que paga ahora va a esa deuda (semanas de más).`);
  }

  // El calendario: cada período con lo que pasó en él.
  const periodos: PeriodoCalendario[] = [];
  if (prorTotal > 0 && c.fecha_entrega && c.fecha_inicio_cajas && c.fecha_entrega < c.fecha_inicio_cajas) {
    periodos.push({ desde: sumarDias(c.fecha_entrega, 1), hasta: sumarDias(c.fecha_inicio_cajas, -1), numero: null, estado: "dias_iniciales" });
  }
  const ocupados = new Map<number, SemanaDelLibro>();
  for (const s of semanas) {
    const idx = s.estado === "pagada" ? (fechasPagadas ? indicePagada.get(s.numero) : undefined) : s.numero - previas + exo;
    if (idx !== undefined && idx >= 1) ocupados.set(idx, s);
  }
  const ultimoIdx = Math.min(inicios.length - 1, (total ?? proxima) - previas + exo);
  for (let i = 1; i <= ultimoIdx; i++) {
    const p = periodo(i);
    if (!p) continue;
    const s = ocupados.get(i);
    if (s) periodos.push({ ...p, numero: s.numero, estado: s.estado });
    else if (rod.indices.has(i) && fechasPagadas) periodos.push({ ...p, numero: null, estado: "rodada" });
    else if (i > proxima - previas + exo) periodos.push({ ...p, numero: i + previas - exo, estado: "falta" });
    else periodos.push({ ...p, numero: null, estado: "sin_dato" });
  }

  return {
    unidad, valorCaja, totalCajas: total, pagadas, enCurso, exigidas, vaEn, hoyEnRodada,
    entregada: c.fecha_entrega ?? null,
    enAppDesde: c.es_migrado ? (c.fecha_inicio_cajas ?? null) : (c.fecha_entrega ?? null),
    esMigrado: !!c.es_migrado, previas, rodadas: exo,
    filas, detallePagos, fechasPagadas, avisos, periodos, pagosPorDia,
  };
}

type PagoCartera = Parameters<typeof calcularEstadoCartera>[1][number] & Parameters<typeof diasDelConjunto>[2][number];
type ConvenioCartera = Parameters<typeof diasDelConjunto>[0];
type DeudaCartera = { monto_pendiente: number; created_at?: string | null };

/** Los días en mora que muestra el libro, y de dónde salen. */
export type MoraDelLibro =
  | { estado: "al-dia" | "gabela" }
  | {
      estado: "mora";
      /** Los días en mora de Cartera, exactos. */
      dias: number;
      /** Con acuerdo: el pago de cada período es la semana + su cuota (D-030). */
      conjunto: { semana: number; cuota: number } | null;
      /** El día que le tocaba el pago más viejo que dejó incompleto. */
      desde: string | null;
      /** Con acuerdo, sus semanas están pagadas: lo que debe es solo el acuerdo. */
      soloAcuerdo: boolean;
      /** Sin acuerdo: la semana más vieja que debe. */
      semanaMasVieja: number | null;
      /** Ya llenó todas sus semanas y sigue debiendo (D-026). */
      semanasDeMas: boolean;
    };

/**
 * LOS DÍAS EN MORA DEL LIBRO (pedido del dueño, 10-oct-2026): un solo número, EL DE CARTERA, dicho
 * con palabras — *"porque enredarse con algo que se puede decir explícitamente"*. Antes cada semana
 * decía sus propios días ("venció el 5 oct (4 días)") y no coincidía con Cartera: uno de más siempre
 * (no le quitaba la gabela), y en los 66 con acuerdo, muy distinto (JUAN CARLOS LEAL: 3 contra 17),
 * porque Cartera cuenta la semana y la cuota del acuerdo como un solo pago (D-030).
 *
 * Usa `calcularEstadoCartera` y `diasEnMora` con los MISMOS argumentos que `CobrosView`; si Cartera
 * cambia su cuenta, esto la sigue sola. La fecha "desde" se deduce de la misma cuenta: con acuerdo,
 * `diasDelConjunto` (días desde lo más viejo que le falta al conjunto); sin acuerdo, la semana más
 * vieja que debe del libro.
 */
export function moraDelLibro(
  c: ContratoLibro,
  pagosConfirmados: PagoCartera[],
  convenio: ConvenioCartera,
  deudasPendientes: DeudaCartera[],
  hoy: Date,
  libro: Pick<LibroSemanas, "filas">,
): MoraDelLibro {
  const hoyISO = iso(hoy);
  const cuota = cuotaConvenioDelPeriodo(convenio, c, hoy);
  const cubierto = !!(convenio?.cubre_periodo_hasta && convenio.cubre_periodo_hasta >= hoyISO);
  const estado = calcularEstadoCartera(c, pagosConfirmados, hoy, cuota, cubierto, convenio, deudasPendientes);
  if (estado !== "mora") return { estado };
  const dias = diasEnMora(c, pagosConfirmados, hoy, cuota, cubierto, convenio, deudasPendientes);

  const debe = libro.filas
    .filter((f): f is SemanaDelLibro => f.tipo === "semana" && (f.estado === "debe" || f.estado === "a_medias") && !!f.seExige && f.seExige < hoyISO)
    .sort((a, b) => a.numero - b.numero);
  const vieja = debe[0] ?? null;
  const cierre = semanaDeCierre(c, pagosConfirmados, deudasPendientes, convenio, hoy);
  if (cierre) {
    return { estado: "mora", dias, conjunto: null, desde: sumarDias(hoyISO, -(dias + 1)), soloAcuerdo: false, semanaMasVieja: null, semanasDeMas: true };
  }
  const cuotaPeriodo = convenio?.cuota_por_periodo ?? 0;
  const conj = cuotaPeriodo > 0 ? diasDelConjunto(convenio, c, pagosConfirmados, hoy) : null;
  if (conj !== null) {
    return {
      estado: "mora", dias, conjunto: { semana: valorPeriodoReal(c), cuota: cuotaPeriodo },
      desde: sumarDias(hoyISO, -conj), soloAcuerdo: debe.length === 0, semanaMasVieja: vieja?.numero ?? null, semanasDeMas: false,
    };
  }
  return { estado: "mora", dias, conjunto: null, desde: vieja?.seExige ?? null, soloAcuerdo: false, semanaMasVieja: vieja?.numero ?? null, semanasDeMas: false };
}
