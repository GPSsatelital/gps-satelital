// LAS CIFRAS DE REPORTES (auditoría del 29-sep-2026, docs/AUDITORIA-REPORTES.md).
//
// Reportes tenía sus propias copias de "en mora", "días" y "recaudado", distintas de las de Cartera:
// decía 187 en mora cuando eran 65, y el aviso de recolección contaba 50 cuando la cola real tenía 58.
// Acá viven las cuentas de Reportes, y cada una sale de las MISMAS funciones que usa Cartera
// (`calcularEstadoCartera`, `diasEnMora`, `loQueDebe`, `cajasExigidasHasta`, `faltaDelAcuerdo`).
// Este archivo es puro a propósito: la fecha de caja de cada pago entra desde afuera.

import {
  calcularEstadoCartera, diasEnMora, cuotaConvenioDelPeriodo, cajasExigidasHasta, valorPeriodoReal,
  faltaDelAcuerdo, loQueDebe, vaARecoleccion, type ContratoCiclo, type EstadoCartera,
} from "./cicloPago";

type PagoR = {
  contrato_id: string;
  fecha: string;
  valor: number;
  estado?: string;
  tipo_registro?: string | null;
  created_at?: string | null;
  aplicado_tarifa?: number | null;
  aplicado_prorrateo?: number | null;
  aplicado_convenio?: number | null;
  aplicado_deuda?: number | null;
  aplicado_saldo_favor?: number | null;
};
type DeudaR = { monto: number; monto_pendiente: number; created_at?: string | null };
type ConvenioR = {
  id?: string;
  estado?: string;
  cuota_por_periodo?: number | null;
  deuda_total?: number | null;
  created_at?: string | null;
  cubre_periodo_hasta?: string | null;
  periodos_exonerados?: number | null;
  cajas_financiadas?: number | null;
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dia = (s: string) => new Date(s + "T12:00:00");
const diaAntes = (s: string) => { const d = dia(s); d.setDate(d.getDate() - 1); return iso(d); };

/** Contratos con un plazo extra vigente: no van a recolección. Misma regla que el panel Hoy de Cartera. */
export function contratosConPlazoVigente(
  gestiones: Array<{ contrato_id: string; tipo: string; plazo_extra_fecha_limite?: string | null }>,
  hoyISO: string,
): Set<string> {
  const porContrato = new Map<string, string>();
  for (const g of gestiones) {
    if (g.tipo !== "plazo_extra" || !g.plazo_extra_fecha_limite) continue;
    const actual = porContrato.get(g.contrato_id);
    if (!actual || g.plazo_extra_fecha_limite > actual) porContrato.set(g.contrato_id, g.plazo_extra_fecha_limite);
  }
  const set = new Set<string>();
  porContrato.forEach((fecha, id) => { if (fecha >= hoyISO) set.add(id); });
  return set;
}

export type EstadoHoy = {
  estado: EstadoCartera;
  /** Días que lleva VENCIDA la cuota (la cuenta que manda). No la reinicia un abono. */
  diasMora: number;
  /** La misma regla de la cola de Cartera (`vaARecoleccion`): más de 3 días en mora, sin plazo
   *  extra vigente y con su moto en la calle (o en una prestada). */
  recoleccion: boolean;
  /** Todo lo que debe hoy: cuota + acuerdo + deudas. La misma cifra que Cartera. */
  debeHoy: number;
  /** Lo mismo, partido: semanas, cuota del acuerdo y deudas. Las tres suman `debeHoy` exacto (en
   *  semanas de más, lo que no es semana ni acuerdo va a deudas). */
  debe: { semanas: number; acuerdo: number; deudas: number };
  /** Plata del cliente a su favor (se muestra, nunca se resta). */
  saldoAFavor: number;
};

/**
 * El estado de HOY de un contrato, con exactamente los mismos argumentos que usa Cartera
 * (`CobrosView`, resumen por contrato). Si Cartera cambia cómo lo calcula, esto tiene que cambiar
 * igual — lo protege `reportesCifras.test.ts` y se comprueba contra `zala.cliente`.
 */
export function estadoHoy(
  contrato: ContratoCiclo & { id: string; saldo_favor_apertura?: number | null },
  pagosConfirmados: PagoR[],
  deudasPendientes: DeudaR[],
  convenioACobrar: ConvenioR | null,
  hoy: Date,
  hoyISO: string,
  conPlazoVigente: Set<string>,
  diario?: { toca: number; pagado: number },
  // La moto del contrato y si anda en una prestada: con la suya guardada y sin prestada no va a
  // recolección (decisión del dueño, 29-sep).
  moto: { estado?: string | null; conPrestada: boolean } = { conPrestada: false },
): EstadoHoy {
  const cuotaConvenio = cuotaConvenioDelPeriodo(convenioACobrar as never, contrato, hoy);
  const cubierto = !!(convenioACobrar?.cubre_periodo_hasta && convenioACobrar.cubre_periodo_hasta >= hoyISO);
  const estado = calcularEstadoCartera(contrato, pagosConfirmados as never, hoy, cuotaConvenio, cubierto, convenioACobrar as never, deudasPendientes as never);
  const dias = diasEnMora(contrato, pagosConfirmados as never, hoy, cuotaConvenio, cubierto, convenioACobrar as never, deudasPendientes as never);
  const lq = loQueDebe(contrato, pagosConfirmados as never, deudasPendientes as never, convenioACobrar as never, hoy, {
    sinPagosNunca: pagosConfirmados.length === 0,
    diario: contrato.forma_pago === "Diario" ? diario : undefined,
  });
  return {
    estado,
    diasMora: dias,
    recoleccion: vaARecoleccion({
      estado, diasMora: dias, plazoVigente: conPlazoVigente.has(contrato.id),
      estadoMoto: moto.estado, conPrestada: moto.conPrestada,
    }),
    debeHoy: lq.totalFalta,
    debe: {
      semanas: lq.cuota.falta,
      acuerdo: lq.acuerdo?.falta ?? 0,
      deudas: Math.max(lq.totalFalta - lq.cuota.falta - (lq.acuerdo?.falta ?? 0), 0),
    },
    saldoAFavor: Math.max(lq.saldoAFavor ?? 0, 0),
  };
}

export type Cumplimiento = {
  /** Lo que VENCÍA dentro del período: semanas + prorrateo + cuotas de acuerdo. */
  debia: number;
  /** De eso, lo que quedó pagado CON PLATA al cierre del período (aunque lo haya adelantado antes). */
  cubrio: number;
  /** De eso, las semanas que no se pagaron sino que pasaron a un acuerdo firmado en el período (D-032). */
  aAcuerdo: number;
  /** debia − cubrio − aAcuerdo: lo que quedó sin pagar y sin acuerdo. */
  falto: number;
  /** Lo que pagó en el período, con plata que entró en el período, de lo que YA venía atrasado: semanas y cuotas viejas + deudas. */
  recupero: number;
  /** Semanas que ya venían atrasadas y pasaron a un acuerdo firmado en el período (no entró plata). */
  atrasoAAcuerdo: number;
  /** false = no se puede medir con el libro de cajas (Diario o sin motor). */
  medible: boolean;
};

/**
 * CUÁNTO CUMPLIÓ UN CONTRATO EN UN PERÍODO (decisión del dueño, 29-sep-2026).
 *
 * "De lo que vencía en el período, cuánto quedó pagado al cierre." Se cuenta en CAJAS, no en plata
 * que entró: el que paga el domingo la semana del lunes la tiene cubierta el lunes, y el que abona
 * a una semana vieja no está cubriendo la de este período (el motor llena de la más vieja a la más
 * nueva). Lo que pagó de atrasos va aparte en `recupero`, para que un cliente que se pone al día no
 * tape a otro que no pagó.
 *
 * Cómo: las cajas LLENAS a una fecha se sacan hacia atrás desde el contador de hoy, restando lo que
 * entró a cajas después de esa fecha (y las cajas que marcó un convenio firmado después). Las
 * EXIGIDAS salen de `cajasExigidasHasta`, la misma cuenta del motor. El acuerdo igual, con
 * `faltaDelAcuerdo`.
 */
export function cumplimientoDelPeriodo(
  contrato: ContratoCiclo & { id: string; cajas_pagadas?: number | null; caja_actual_pagado?: number | null; prorrateo_total?: number | null; prorrateo_pagado?: number | null; fecha_inicio_cajas?: string | null; es_migrado?: boolean | null },
  pagosConfirmados: PagoR[],
  conveniosDelContrato: ConvenioR[],
  desde: string,
  hasta: string,
  fechaDeCaja: (p: PagoR) => string,
): Cumplimiento {
  // D-032: lo recuperado sale de la plata que ENTRÓ en el período. La semana que se pagó con la base
  // al entregar o con un saldo a favor ya se pagó con plata (cuenta como cubierta), pero esa plata no
  // entró en este período, así que no cuenta como atraso recuperado.
  const enRango = (p: PagoR) => { const f = fechaDeCaja(p); return f >= desde && f <= hasta; };
  const entroEnCaja = (p: PagoR) => p.tipo_registro !== "adelanto_base" && p.tipo_registro !== "saldo_favor";
  const deudasEnRango = pagosConfirmados
    .filter(p => enRango(p) && entroEnCaja(p))
    .reduce((s, p) => s + Math.max(p.aplicado_deuda ?? 0, 0), 0);
  if (!contrato.motor_v2 || contrato.forma_pago === "Diario") {
    return { debia: 0, cubrio: 0, aAcuerdo: 0, falto: 0, recupero: 0, atrasoAAcuerdo: 0, medible: false };
  }
  const antes = diaAntes(desde);
  const valor = valorPeriodoReal(contrato);

  // ── Semanas (cajas) ──
  let debia = 0, cubrio = 0, recupero = deudasEnRango, aAcuerdo = 0, atrasoAAcuerdo = 0;
  if (valor > 0) {
    const exAntes = cajasExigidasHasta(contrato, dia(antes));
    const exFin = cajasExigidasHasta(contrato, dia(hasta));
    const llenasHoy = (contrato.cajas_pagadas ?? 0) + (contrato.caja_actual_pagado ?? 0) / valor;
    const llenasA = (t: string) => {
      const despues = pagosConfirmados
        .filter(p => fechaDeCaja(p) > t)
        .reduce((s, p) => s + (p.aplicado_tarifa ?? 0), 0);
      const marcadasDespues = conveniosDelContrato
        .filter(cv => (cv.created_at ?? "").slice(0, 10) > t)
        .reduce((s, cv) => s + (cv.cajas_financiadas ?? 0), 0);
      return llenasHoy - despues / valor - marcadasDespues;
    };
    const llenasAntes = llenasA(antes);
    const llenasFin = llenasA(hasta);
    const vencian = Math.max(exFin - exAntes, 0);
    debia += vencian * valor;
    // D-032 (2-oct): una caja que marcó un acuerdo firmado en el período NO se pagó: se pasó al
    // acuerdo. Un acuerdo solo financia semanas ya exigidas y sin pagar (las más viejas abiertas), así
    // que se descuentan primero de las atrasadas y después de las que vencían en el período.
    const financiadas = conveniosDelContrato
      .filter(cv => { const f = (cv.created_at ?? "").slice(0, 10); return f > antes && f <= hasta; })
      .reduce((s, cv) => s + (cv.cajas_financiadas ?? 0), 0);
    const viejasLlenadas = Math.max(Math.min(llenasFin, exAntes) - llenasAntes, 0);
    const viejasAlAcuerdo = Math.min(financiadas, viejasLlenadas);
    const nuevasLlenadas = Math.min(Math.max(llenasFin - exAntes, 0), vencian);
    const nuevasAlAcuerdo = Math.min(financiadas - viejasAlAcuerdo, nuevasLlenadas);
    cubrio += (nuevasLlenadas - nuevasAlAcuerdo) * valor;
    aAcuerdo += nuevasAlAcuerdo * valor;
    atrasoAAcuerdo += viejasAlAcuerdo * valor;
    // Las semanas viejas que se llenaron con plata del período: nunca más que la plata que entró a
    // semanas en el período (el motor llena primero la más vieja).
    const plataASemanas = pagosConfirmados
      .filter(p => enRango(p) && entroEnCaja(p))
      .reduce((s, p) => s + Math.max(p.aplicado_tarifa ?? 0, 0), 0);
    recupero += Math.min((viejasLlenadas - viejasAlAcuerdo) * valor, plataASemanas);
  }

  // ── Prorrateo (la caja 0 se exige el día que arranca el libro) ──
  const inicio = contrato.fecha_inicio_cajas ?? null;
  const prorTotal = contrato.es_migrado ? 0 : (contrato.prorrateo_total ?? 0);
  if (inicio && prorTotal > 0 && inicio >= desde && inicio <= hasta) {
    const pagadoDespues = pagosConfirmados
      .filter(p => fechaDeCaja(p) > hasta)
      .reduce((s, p) => s + (p.aplicado_prorrateo ?? 0), 0);
    debia += prorTotal;
    cubrio += Math.min(Math.max((contrato.prorrateo_pagado ?? 0) - pagadoDespues, 0), prorTotal);
  }

  // ── Acuerdos: cada abono va al acuerdo firmado más reciente antes del pago (mismo corte que el motor) ──
  const convs = conveniosDelContrato
    .filter(cv => (cv.cuota_por_periodo ?? 0) > 0 && cv.created_at && cv.created_at.slice(0, 10) <= hasta)
    .slice()
    .sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
  convs.forEach((cv, i) => {
    const firma = cv.created_at!;
    const siguiente = convs[i + 1]?.created_at ?? null;
    const delAcuerdo = (p: PagoR) => {
      const c = p.created_at ?? p.fecha;
      return c >= firma && (!siguiente || c < siguiente);
    };
    const abonadoA = (t: string) => pagosConfirmados
      .filter(p => delAcuerdo(p) && fechaDeCaja(p) <= t)
      .reduce((s, p) => s + (p.aplicado_convenio ?? 0), 0);
    const exigidoA = (t: string) => (t < firma.slice(0, 10) ? 0 : (faltaDelAcuerdo(cv as never, contrato, [], dia(t))?.toca ?? 0));
    const exAntes = exigidoA(antes);
    const vencia = Math.max(exigidoA(hasta) - exAntes, 0);
    const abAntes = abonadoA(antes);
    const abFin = abonadoA(hasta);
    debia += vencia;
    cubrio += Math.min(Math.max(abFin - exAntes, 0), vencia);
    recupero += Math.max(Math.min(abFin, exAntes) - abAntes, 0);
  });

  debia = Math.round(debia);
  cubrio = Math.round(Math.min(cubrio, debia));
  aAcuerdo = Math.round(Math.min(aAcuerdo, debia - cubrio));
  return { debia, cubrio, aAcuerdo, falto: debia - cubrio - aAcuerdo, recupero: Math.round(recupero), atrasoAAcuerdo: Math.round(atrasoAAcuerdo), medible: true };
}

/** % de cumplimiento de un grupo de contratos: lo cubierto sobre lo que vencía. null = no vencía nada. */
export function pctCumplimiento(filas: Array<{ debia: number; cubrio: number }>): number | null {
  const debia = filas.reduce((s, f) => s + f.debia, 0);
  if (debia <= 0) return null;
  return Math.round((filas.reduce((s, f) => s + f.cubrio, 0) / debia) * 100);
}
