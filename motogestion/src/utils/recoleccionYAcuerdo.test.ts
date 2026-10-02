import { describe, it, expect } from "vitest";
import {
  calcularEstadoCartera, diasEnMora, diasDelConjunto, cuotaConvenioDelPeriodo, loQueDebe, vaARecoleccion,
  type ContratoCiclo,
} from "./cicloPago";

// LAS DECISIONES DEL DUEÑO (docs/REVISION-29SEP.md, tanda 2, y la del 1-oct), con las cifras REALES
// del miércoles 30-sep:
//   · Moto guardada sin moto prestada → no entra a recolección (REGINALDO IEW53I, en garantía).
//   · Con acuerdo, los días de mora se cuentan sobre el CONJUNTO (semana + cuota del acuerdo, la misma
//     idea de D-022, decisión del 1-oct): desde lo más viejo que le falta.
//   · A recolección SIN mínimo de plata (decisión del 2-oct): lo que lleve más de 3 días de mora va,
//     sean $2.000 o $200.000. "Si le faltaron $2.000 no pagó completo, y tienen que cobrárselo o
//     guardar la moto".

const D = (s: string) => new Date(s + "T00:00:00");

// ── REINEL CASTRO GARCIA (XYZ53H) — 5 cuotas del acuerdo sin pagar ──────────────
// Semanal de miércoles, $195.000. Acuerdo de $475.000 en cuotas de $55.000 desde el 22-jul.
const REINEL: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 195000,
  tarifa_diaria: 26000, tarifa_domingo: 13000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: true, motor_v2: true, fecha_entrega: "2025-12-16",
  total_cajas: 104, cajas_pagadas: 41, caja_actual_pagado: 0, cajas_previas: 28, cajas_exoneradas: 0,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-01",
};
const CONV_REINEL = {
  cuota_por_periodo: 55000, deuda_total: 475000, created_at: "2026-07-17T22:03:22.352358+00:00",
  cubre_periodo_hasta: "2026-07-22", periodos_exonerados: 0,
};
const p = (fecha: string, created_at: string, aplicado_convenio: number) => ({ fecha, created_at, valor: aplicado_convenio, aplicado_convenio });
const PAGOS_REINEL = [
  p("2026-07-23", "2026-07-23T21:31:52Z", 5000), p("2026-07-28", "2026-07-28T20:38:55Z", 55000),
  p("2026-07-31", "2026-07-31T21:22:26Z", 55000), p("2026-08-08", "2026-08-08T17:18:32Z", 5000),
  p("2026-08-15", "2026-08-15T16:40:34Z", 55000), p("2026-08-24", "2026-08-24T19:30:15Z", 5000),
  p("2026-08-27", "2026-08-27T22:25:53Z", 5000), p("2026-09-05", "2026-09-05T19:30:44Z", 5000),
  p("2026-09-11", "2026-09-11T21:14:24Z", 5000),
];

// ── NORMA GELIS OCHOA (YAW70H) — $2.000 de una cuota vieja ──────────────────────
// Semanal de miércoles, $202.000. Acuerdo de $308.000 en cuotas de $45.000 desde el 9-sep.
const NORMA: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 202000,
  tarifa_diaria: 27000, tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: false, motor_v2: true, fecha_entrega: "2026-08-29",
  total_cajas: 91, cajas_pagadas: 4, caja_actual_pagado: 0, cajas_previas: 0, cajas_exoneradas: 0,
  prorrateo_total: 109000, prorrateo_pagado: 109000, fecha_inicio_cajas: "2026-09-02",
};
const CONV_NORMA = {
  cuota_por_periodo: 45000, deuda_total: 308000, created_at: "2026-08-29T16:53:00.969872+00:00",
  cubre_periodo_hasta: null, periodos_exonerados: 0,
};
const PAGOS_NORMA = [
  p("2026-09-09", "2026-09-10T21:03:01Z", 44000), p("2026-09-13", "2026-09-14T19:19:04Z", 1000),
  p("2026-09-16", "2026-09-17T22:00:13Z", 44000), p("2026-09-23", "2026-09-24T18:55:37Z", 44000),
];

type Conv = typeof CONV_REINEL | typeof CONV_NORMA;
function cuenta(c: ContratoCiclo, cv: Conv, pagos: typeof PAGOS_REINEL, hoy: Date) {
  const cuotaConv = cuotaConvenioDelPeriodo(cv, c, hoy);
  const estado = calcularEstadoCartera(c, pagos, hoy, cuotaConv, false, cv, []);
  const dias = diasEnMora(c, pagos, hoy, cuotaConv, false, cv, []);
  const debe = loQueDebe(c, pagos, [], cv, hoy);
  const va = (o: { estadoMoto?: string; conPrestada?: boolean; plazoVigente?: boolean } = {}) => vaARecoleccion({
    estado, diasMora: dias, plazoVigente: o.plazoVigente ?? false,
    estadoMoto: o.estadoMoto ?? "Asignada", conPrestada: o.conPrestada ?? false,
  });
  return { estado, dias, debe, va };
}

describe("con acuerdo, los días de mora se cuentan sobre el CONJUNTO (semana + cuota)", () => {
  it("REINEL el 30-sep: debe $475.000; hacia atrás, sus semanas del 30 y del 23 y las del 16 lo cubren → 14 días", () => {
    // Lo que falta: semana del 30 ($195.000) + acuerdo ($280.000). Hacia atrás: semana del 30
    // ($195.000), semana del 23 ($390.000), última cuota del acuerdo del 16 ($35.000 → $425.000)
    // y semana del 16 ($620.000 ≥ $475.000). Lo más viejo que le falta es del 16-sep.
    expect(diasDelConjunto(CONV_REINEL, REINEL, PAGOS_REINEL, D("2026-09-30"))).toBe(14);
  });

  it("🔴 EL DEFECTO: cada día de pago REINEL amanecía 'al día' debiendo $280.000 del acuerdo. Ahora: en mora, 13 días", () => {
    const r = cuenta(REINEL, CONV_REINEL, PAGOS_REINEL, D("2026-09-30"));
    expect(r.debe.acuerdo?.falta).toBe(280000);
    expect(r.estado).toBe("mora");
    expect(r.dias).toBe(13);
  });

  it("NORMA el 30-sep: debe $249.000; la cuota y la semana del 30 suman $247.000 → lo más viejo es del 23 (7 días)", () => {
    expect(diasDelConjunto(CONV_NORMA, NORMA, PAGOS_NORMA, D("2026-09-30"))).toBe(7);
    const r = cuenta(NORMA, CONV_NORMA, PAGOS_NORMA, D("2026-09-30"));
    expect(r.estado).toBe("mora");
    expect(r.dias).toBe(6);
  });

  it("si paga lo que debe del acuerdo, solo le queda la semana de HOY → al día ('paga hoy')", () => {
    const pago = [...PAGOS_NORMA, p("2026-09-30", "2026-09-30T15:00:00Z", 47000)];
    expect(diasDelConjunto(CONV_NORMA, NORMA, pago, D("2026-09-30"))).toBe(0);
    expect(cuenta(NORMA, CONV_NORMA, pago, D("2026-09-30")).estado).toBe("al-dia");
  });

  it("si paga los $2.000 viejos, lo que debe es exactamente el conjunto de hoy → al día", () => {
    const pago = [...PAGOS_NORMA, p("2026-09-30", "2026-09-30T15:00:00Z", 2000)];
    expect(cuenta(NORMA, CONV_NORMA, pago, D("2026-09-30")).estado).toBe("al-dia");
  });

  it("NORMA el jueves 1-oct sin pagar nada: lo más viejo sigue siendo del 23 → en mora, 7 días", () => {
    const r = cuenta(NORMA, CONV_NORMA, PAGOS_NORMA, D("2026-10-01"));
    expect(r.estado).toBe("mora");
    expect(r.dias).toBe(7);
  });

  it("NORMA el 1-oct habiendo pagado su semana pero no el acuerdo: debe $47.000, todo del conjunto del 30 → gabela", () => {
    const r = cuenta({ ...NORMA, cajas_pagadas: 5 }, CONV_NORMA, PAGOS_NORMA, D("2026-10-01"));
    expect(r.estado).toBe("gabela");
  });

  it("las cuotas RODADAS corren la fecha, como las semanas (D-028): REINEL con 2 rodadas → 7 días", () => {
    const rodado = { ...CONV_REINEL, periodos_exonerados: 2 };
    expect(diasDelConjunto(rodado, REINEL, PAGOS_REINEL, D("2026-09-30"))).toBe(7);
  });

  it("sin acuerdo no aplica: manda la cuenta de las semanas", () => {
    expect(diasDelConjunto(null, REINEL, PAGOS_REINEL, D("2026-09-30"))).toBeNull();
  });

  it("sin pasarle el convenio, la cuenta vieja no se mueve (pantallas que todavía no lo pasan)", () => {
    const cuotaConv = cuotaConvenioDelPeriodo(CONV_REINEL, REINEL, D("2026-09-30"));
    expect(calcularEstadoCartera(REINEL, PAGOS_REINEL, D("2026-09-30"), cuotaConv)).toBe("al-dia");
  });
});

describe("a recolección SIN mínimo: lo que lleve más de 3 días de mora va (decisión del 2-oct)", () => {
  it("REINEL: 13 días en mora → va a recolección", () => {
    expect(cuenta(REINEL, CONV_REINEL, PAGOS_REINEL, D("2026-09-30")).va()).toBe(true);
  });

  it("NORMA: los $2.000 del 23 llevan 6 días en mora → SÍ va (antes del 2-oct había un mínimo de una cuota)", () => {
    expect(cuenta(NORMA, CONV_NORMA, PAGOS_NORMA, D("2026-09-30")).va()).toBe(true);
  });

  it("NORMA el lunes 28-sep, debiendo solo los $2.000 del 23: 4 días en mora → ya iba, antes de su siguiente pago", () => {
    const r = cuenta(NORMA, CONV_NORMA, PAGOS_NORMA, D("2026-09-28"));
    expect(r.dias).toBe(4);
    expect(r.va()).toBe(true);
  });

  it("NORMA el 1-oct habiendo pagado su semana pero no el acuerdo: gabela → no va", () => {
    expect(cuenta({ ...NORMA, cajas_pagadas: 5 }, CONV_NORMA, PAGOS_NORMA, D("2026-10-01")).va()).toBe(false);
  });

  it("un pedazo de la última cuota (CESAR TORRES, IGJ90I: $10.000 de $55.000) con más de 3 días → SÍ va", () => {
    const cv = { cuota_por_periodo: 55000, deuda_total: 110000, created_at: "2026-07-01T12:00:00Z", cubre_periodo_hasta: null, periodos_exonerados: 0 };
    const pagos = [p("2026-07-15", "2026-07-15T12:00:00Z", 55000), p("2026-07-22", "2026-07-22T12:00:00Z", 45000)];
    const r = cuenta(REINEL, cv as never, pagos, D("2026-09-30"));
    expect(r.debe.acuerdo?.falta).toBe(10000);
    expect(r.estado).toBe("mora");
    expect(r.va()).toBe(true);
  });

  it("con 3 días o menos de mora no va, deba lo que deba", () => {
    // NORMA el sábado 26-sep debiendo los $2.000 del 23: 3 días desde el 23 → 2 de mora.
    expect(cuenta(NORMA, CONV_NORMA, PAGOS_NORMA, D("2026-09-26")).va()).toBe(false);
  });
});

describe("moto guardada en la empresa → no hay nada que recoger (REGINALDO, 29-sep)", () => {
  const r = cuenta(REINEL, CONV_REINEL, PAGOS_REINEL, D("2026-09-30"));

  it("en garantía, taller, fiscalía o tránsito y sin prestada: sigue en mora pero NO va a recolección", () => {
    for (const estadoMoto of ["Garantia", "Mantenimiento", "Fiscalia", "Transito"]) {
      expect(r.va({ estadoMoto })).toBe(false);
    }
    expect(r.estado).toBe("mora");
  });

  it("si anda en una moto prestada, sí va: esa es la que se recoge", () => {
    expect(r.va({ estadoMoto: "Garantia", conPrestada: true })).toBe(true);
  });

  it("con plazo extra vigente tampoco va (regla de siempre)", () => {
    expect(r.va({ plazoVigente: true })).toBe(false);
  });
});
