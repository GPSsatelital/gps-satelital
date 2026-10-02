// LAS CUENTAS DEL RESUMEN DE REPORTES (rediseño del 2-oct-2026, docs/REDISENO-REPORTES.md).
//
// Puras a propósito: la pantalla solo pinta. Cada número del Resumen sale de acá, y al tocarlo se
// abre la lista de lo MISMO que se contó (las filas viajan junto al número), para que el total y su
// detalle no puedan contradecirse.

import {
  calcularEstadoCartera, diasEnMora, cuotaConvenioDelPeriodo, valorPeriodoReal, type ContratoCiclo, type EstadoCartera,
} from "./cicloPago";
import { exoneradasAlDia, type RodadaNomina } from "./nominaCobradores";

type PagoR = {
  contrato_id: string;
  fecha: string;
  created_at?: string | null;
  valor: number;
  metodo?: string | null;
  tipo_registro?: string | null;
  aplicado_tarifa?: number | null;
  aplicado_ahorro?: number | null;
  aplicado_prorrateo?: number | null;
  aplicado_convenio?: number | null;
  aplicado_deuda?: number | null;
  aplicado_saldo_favor?: number | null;
  aplicado_base_inicial?: number | null;
};

// ── 1. LO QUE ENTRÓ, Y DE QUIÉN ES ──────────────────────────────────────────────────────────────
// Medido el 2-oct: los 1.433 pagos de septiembre tienen cada peso anotado (semana, ahorro, acuerdo,
// deudas, base, saldo a favor) y la suma da el valor del pago. Por eso se puede separar exacto.
export type DesgloseRecaudo = {
  total: number;
  efectivo: number;
  transferencia: number;
  campo: number;
  /** Ahorro de las semanas: es del cliente, se le devuelve al terminar o se usa en su liquidación. */
  ahorro: number;
  /** Base inicial y saldo a favor: también plata del cliente, guardada. */
  baseYSaldo: number;
  /** Lo que es de la empresa: tarifa de las semanas, acuerdos, multas y demás deudas. */
  empresa: number;
};

export function desgloseRecaudo(pagos: PagoR[]): DesgloseRecaudo {
  const n = (v: number | null | undefined) => Number(v ?? 0);
  let total = 0, efectivo = 0, transferencia = 0, campo = 0, ahorro = 0, baseYSaldo = 0;
  for (const p of pagos) {
    total += n(p.valor);
    if (p.tipo_registro === "campo") campo += n(p.valor);
    if (p.metodo === "Efectivo") efectivo += n(p.valor); else transferencia += n(p.valor);
    ahorro += n(p.aplicado_ahorro);
    baseYSaldo += n(p.aplicado_base_inicial) + n(p.aplicado_saldo_favor);
  }
  return { total, efectivo, transferencia, campo, ahorro, baseYSaldo, empresa: total - ahorro - baseYSaldo };
}

// ── 2. ANTIGÜEDAD DE LA MORA ────────────────────────────────────────────────────────────────────
export type TramoMora<T> = { clave: string; etiqueta: string; desde: number; hasta: number; filas: T[]; debe: number };

export function tramosMora<T extends { diasMora: number; debeHoy: number }>(enMora: T[]): TramoMora<T>[] {
  const tramos: TramoMora<T>[] = [
    { clave: "1-7", etiqueta: "1 a 7 días", desde: 0, hasta: 7, filas: [], debe: 0 },
    { clave: "8-15", etiqueta: "8 a 15 días", desde: 8, hasta: 15, filas: [], debe: 0 },
    { clave: "16-30", etiqueta: "16 a 30 días", desde: 16, hasta: 30, filas: [], debe: 0 },
    { clave: "30+", etiqueta: "Más de 30 días", desde: 31, hasta: Infinity, filas: [], debe: 0 },
  ];
  for (const f of enMora) {
    const t = tramos.find(x => f.diasMora >= x.desde && f.diasMora <= x.hasta)!;
    t.filas.push(f);
    t.debe += f.debeHoy;
  }
  return tramos;
}

// ── 3. EL RECAUDO EN EL TIEMPO, DENTRO DEL PERÍODO ELEGIDO ──────────────────────────────────────
// Antes la gráfica mostraba siempre los últimos 14 días, eligiera lo que eligiera (2-oct). Ahora
// sigue al período: por día si son hasta 31 días, por semana hasta 4 meses, y por mes si es más.
export type PuntoSerie = { clave: string; etiqueta: string; desde: string; hasta: string; total: number };

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const aDia = (s: string) => new Date(s + "T12:00:00");

export function serieRecaudo(pagos: PagoR[], desde: string, hasta: string, fechaDeCaja: (p: PagoR) => string): { modo: "dia" | "semana" | "mes"; puntos: PuntoSerie[] } {
  const d1 = aDia(desde), d2 = aDia(hasta);
  const dias = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
  const modo: "dia" | "semana" | "mes" = dias <= 31 ? "dia" : dias <= 124 ? "semana" : "mes";
  const puntos: PuntoSerie[] = [];
  if (modo === "dia") {
    for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
      puntos.push({ clave: iso(d), etiqueta: `${DIAS[d.getDay()]} ${d.getDate()}`, desde: iso(d), hasta: iso(d), total: 0 });
    }
  } else if (modo === "semana") {
    const lunes = new Date(d1); lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
    for (let d = lunes; d <= d2; d.setDate(d.getDate() + 7)) {
      const fin = new Date(d); fin.setDate(fin.getDate() + 6);
      const a = iso(d) < desde ? desde : iso(d), b = iso(fin) > hasta ? hasta : iso(fin);
      puntos.push({ clave: a, etiqueta: `${aDia(a).getDate()} ${MESES[aDia(a).getMonth()]}`, desde: a, hasta: b, total: 0 });
    }
  } else {
    for (let d = new Date(d1.getFullYear(), d1.getMonth(), 1); d <= d2; d.setMonth(d.getMonth() + 1)) {
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const a = iso(d) < desde ? desde : iso(d), b = iso(fin) > hasta ? hasta : iso(fin);
      puntos.push({ clave: a, etiqueta: MESES[d.getMonth()], desde: a, hasta: b, total: 0 });
    }
  }
  for (const p of pagos) {
    const f = fechaDeCaja(p);
    const pt = puntos.find(x => f >= x.desde && f <= x.hasta);
    if (pt) pt.total += Number(p.valor ?? 0);
  }
  return { modo, puntos };
}

// ── 4. CÓMO ESTABA UN CONTRATO AL CIERRE DE UNA FECHA (reconstruido) ────────────────────────────
// Para comparar "hoy" con "al cierre del período" (decisión del dueño, 2-oct). Se reconstruye con
// la fecha de cada pago: las cajas llenas a esa fecha salen del contador de hoy menos lo que entró
// después (la misma cuenta de `cumplimientoDelPeriodo`). Medido el 2-oct contra las fotos reales de
// los contadores: 92-96 de cada 100 contratos salen exactos; la diferencia es casi siempre un pago
// registrado antes de la fecha y confirmado después, que para el reporte cuenta como pagado a tiempo.
export type ConvenioCierre = {
  id?: string;
  estado?: string;
  cuota_por_periodo?: number | null;
  deuda_total?: number | null;
  created_at?: string | null;
  cubre_periodo_hasta?: string | null;
  periodos_exonerados?: number | null;
  cajas_financiadas?: number | null;
};

export function estadoAlCierre(
  contrato: ContratoCiclo & { id: string; cajas_pagadas?: number | null; caja_actual_pagado?: number | null; prorrateo_pagado?: number | null },
  pagosConfirmados: PagoR[],
  convenios: ConvenioCierre[],
  fecha: string,
  fechaDeCaja: (p: PagoR) => string,
  rodadas: RodadaNomina[] | null,
): { estado: EstadoCartera; diasMora: number } | null {
  if (!contrato.motor_v2 || contrato.forma_pago === "Diario") return null;
  const valor = valorPeriodoReal(contrato);
  if (valor <= 0) return null;
  const despues = (p: PagoR) => fechaDeCaja(p) > fecha;
  const llenasHoy = (contrato.cajas_pagadas ?? 0) + (contrato.caja_actual_pagado ?? 0) / valor;
  const aCajasDespues = pagosConfirmados.filter(despues).reduce((s, p) => s + Number(p.aplicado_tarifa ?? 0), 0);
  const marcadasDespues = convenios
    .filter(cv => (cv.created_at ?? "").slice(0, 10) > fecha)
    .reduce((s, cv) => s + Number(cv.cajas_financiadas ?? 0), 0);
  const llenas = Math.max(llenasHoy - aCajasDespues / valor - marcadasDespues, 0);
  const pagadas = Math.floor(llenas + 1e-9);
  const prorrateoDespues = pagosConfirmados.filter(despues).reduce((s, p) => s + Number(p.aplicado_prorrateo ?? 0), 0);
  const rodadasC = rodadas?.filter(r => r.contrato_id === contrato.id) ?? null;
  const copia = {
    ...contrato,
    cajas_pagadas: pagadas,
    caja_actual_pagado: Math.round((llenas - pagadas) * valor),
    prorrateo_pagado: Math.max((contrato.prorrateo_pagado ?? 0) - prorrateoDespues, 0),
    cajas_exoneradas: rodadasC ? exoneradasAlDia(contrato.cajas_exoneradas ?? 0, rodadasC, fecha) : (contrato.cajas_exoneradas ?? 0),
  };
  // El acuerdo que corría esa fecha: el más reciente firmado hasta entonces (el mismo corte del motor).
  const cv = convenios
    .filter(c => (c.cuota_por_periodo ?? 0) > 0 && c.created_at && c.created_at.slice(0, 10) <= fecha)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))[0] ?? null;
  const cvAlDia = cv && rodadasC
    ? { ...cv, periodos_exonerados: exoneradasAlDia(cv.periodos_exonerados ?? 0, rodadasC.filter(r => r.corrioAcuerdo && r.creada > (cv.created_at ?? "")), fecha) }
    : cv;
  const hasta = pagosConfirmados.filter(p => !despues(p));
  const dia = new Date(fecha + "T00:00:00");
  const cuotaConv = cuotaConvenioDelPeriodo(cvAlDia as never, copia, dia);
  const cubierto = !!(cvAlDia?.cubre_periodo_hasta && cvAlDia.cubre_periodo_hasta >= fecha);
  const estado = calcularEstadoCartera(copia, hasta as never, dia, cuotaConv, cubierto, cvAlDia as never, []);
  const dias = diasEnMora(copia, hasta as never, dia, cuotaConv, cubierto, cvAlDia as never, []);
  return { estado, diasMora: dias };
}

// ── 5. EL SELLO DE CIFRAS VERIFICADAS ───────────────────────────────────────────────────────────
// El reporte se revisa a sí mismo y lo dice. Si algo no cuadra, lo muestra en vez de esconderlo.
export type Verificacion = { ok: boolean; texto: string };

export function verificarCifras(p: {
  totalRecaudado: number;
  sumaGrupos: number;
  sumaCobradores: number;
  /** Al día + gabela + en mora + retenidas… */
  sumaEstados: number;
  /** …contra los clientes con contrato vigente que cuenta el reporte. */
  totalClientes: number;
}): Verificacion[] {
  const plata = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");
  const igual = (a: number, b: number) => Math.round(a) === Math.round(b);
  return [
    {
      ok: igual(p.sumaGrupos, p.totalRecaudado),
      texto: igual(p.sumaGrupos, p.totalRecaudado)
        ? "Los grupos suman el total recaudado"
        : `Los grupos suman ${plata(p.sumaGrupos)} y el total es ${plata(p.totalRecaudado)}`,
    },
    {
      ok: igual(p.sumaCobradores, p.totalRecaudado),
      texto: igual(p.sumaCobradores, p.totalRecaudado)
        ? "Los cobradores suman el total recaudado"
        : `Los cobradores suman ${plata(p.sumaCobradores)} y el total es ${plata(p.totalRecaudado)}`,
    },
    {
      ok: p.sumaEstados === p.totalClientes,
      texto: p.sumaEstados === p.totalClientes
        ? "Al día, gabela, mora y retenidas suman todos los clientes"
        : `Los estados suman ${p.sumaEstados} y hay ${p.totalClientes} clientes`,
    },
  ];
}

// ── 6. PLATA SIN PRODUCIR ───────────────────────────────────────────────────────────────────────
// Motos guardadas: días quietas × la tarifa diaria de su contrato (o la de la flota si no hay). Es
// una ESTIMACIÓN de lo que dejó de facturar, y la pantalla lo dice así.
export function plataSinProducir<T extends { dias: number | null; tarifaDia: number }>(guardadas: T[]): { motos: number; dias: number; estimado: number; sinFecha: number } {
  let dias = 0, estimado = 0, sinFecha = 0;
  for (const g of guardadas) {
    if (g.dias == null) { sinFecha++; continue; }
    dias += g.dias;
    estimado += g.dias * g.tarifaDia;
  }
  return { motos: guardadas.length, dias, estimado, sinFecha };
}
