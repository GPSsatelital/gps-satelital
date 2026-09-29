import { describe, it, expect } from "vitest";
import { cumplimientoDelPeriodo, estadoHoy, contratosConPlazoVigente, pctCumplimiento } from "./reportesCifras";
import type { ContratoCiclo } from "./cicloPago";

// Las cifras de Reportes con casos REALES de producción (29-sep-2026). Ver docs/AUDITORIA-REPORTES.md.

const D = (iso: string) => new Date(iso + "T12:00:00");
const fechaPago = (p: { fecha: string }) => p.fecha;

// ── KATIA GONZALES (RNK57H): contrato nuevo del 1-sep, base incompleta con acuerdo de $308.000 ──
const KATIA = {
  id: "katia", forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: false, motor_v2: true, fecha_entrega: "2026-09-01",
  total_cajas: 83, cajas_pagadas: 3, caja_actual_pagado: 0, cajas_previas: 0, cajas_exoneradas: 0,
  prorrateo_total: 171000, prorrateo_pagado: 171000, fecha_inicio_cajas: "2026-09-07",
} as ContratoCiclo & { id: string };
const PAGOS_KATIA = [
  { contrato_id: "katia", fecha: "2026-09-01", valor: 202000, created_at: "2026-09-01T21:53:00Z", aplicado_tarifa: 202000 },
  { contrato_id: "katia", fecha: "2026-09-08", valor: 175000, created_at: "2026-09-08T21:05:00Z", aplicado_tarifa: 0, aplicado_prorrateo: 171000, aplicado_saldo_favor: 4000 },
  { contrato_id: "katia", fecha: "2026-09-16", valor: 202000, created_at: "2026-09-17T19:13:00Z", aplicado_tarifa: 202000 },
  { contrato_id: "katia", fecha: "2026-09-17", valor: 40000, created_at: "2026-09-18T15:11:00Z", aplicado_convenio: 40000 },
  { contrato_id: "katia", fecha: "2026-09-24", valor: 202000, created_at: "2026-09-25T15:21:00Z", aplicado_tarifa: 202000 },
];
const ACUERDO_KATIA = {
  id: "cv-katia", estado: "activo", cuota_por_periodo: 40000, deuda_total: 308000,
  created_at: "2026-09-01T21:41:59Z", cubre_periodo_hasta: null, periodos_exonerados: 0, cajas_financiadas: 0,
};

// ── ELKIN CARDALES (DPU43I): migrado, 2 semanas rodadas, debe el Excel viejo ──
const ELKIN = {
  id: "elkin", forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 25, caja_actual_pagado: 0, cajas_previas: 18, cajas_exoneradas: 2,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
} as ContratoCiclo & { id: string };
const PAGOS_ELKIN = [
  { contrato_id: "elkin", fecha: "2026-08-21", valor: 820000, created_at: "2026-08-21T13:47:00Z", aplicado_tarifa: 808000, aplicado_deuda: 12000 },
  { contrato_id: "elkin", fecha: "2026-09-18", valor: 557000, created_at: "2026-09-18T20:34:00Z", aplicado_tarifa: 527000, aplicado_deuda: 30000 },
  { contrato_id: "elkin", fecha: "2026-09-21", valor: 202000, created_at: "2026-09-22T15:02:00Z", aplicado_tarifa: 79000, aplicado_deuda: 123000 },
];

describe("cumplimientoDelPeriodo — KATIA en septiembre", () => {
  const c = cumplimientoDelPeriodo(KATIA, PAGOS_KATIA, [ACUERDO_KATIA], "2026-09-01", "2026-09-28", fechaPago);

  it("vencía: 4 semanas + los días antes de su primer lunes + 3 cuotas del acuerdo = $1.099.000", () => {
    expect(c.debia).toBe(4 * 202000 + 171000 + 3 * 40000);
  });

  it("quedó cubierto: 3 semanas + los días + 1 cuota = $817.000", () => {
    expect(c.cubrio).toBe(3 * 202000 + 171000 + 40000);
  });

  it("lo que faltó ($282.000) es EXACTAMENTE lo que Cartera dice que debe hoy", () => {
    expect(c.falto).toBe(282000);
    const hoy = estadoHoy(KATIA, PAGOS_KATIA, [], ACUERDO_KATIA, D("2026-09-28"), "2026-09-28", new Set());
    expect(hoy.debeHoy).toBe(282000);
  });

  it("no recuperó atrasos: no traía nada viejo", () => {
    expect(c.recupero).toBe(0);
  });
});

describe("cumplimientoDelPeriodo — ELKIN en septiembre (con 2 semanas rodadas)", () => {
  const c = cumplimientoDelPeriodo(ELKIN, PAGOS_ELKIN, [], "2026-09-01", "2026-09-28", fechaPago);

  it("vencían 4 semanas (7, 14, 21 y 28 de septiembre con la curva corrida)", () => {
    expect(c.debia).toBe(4 * 202000);
  });

  it("cubrió 3 y le falta la del 28, que es lo que paga hoy", () => {
    expect(c.cubrio).toBe(3 * 202000);
    expect(c.falto).toBe(202000);
  });

  it("lo que abonó a la multa y al Excel viejo va como recuperado, no como cumplimiento", () => {
    expect(c.recupero).toBe(30000 + 123000);
  });

  it("en agosto: vencían 5 semanas y quedaron las 5 cubiertas (la 18 ya venía pagada del Excel)", () => {
    const ago = cumplimientoDelPeriodo(ELKIN, PAGOS_ELKIN, [], "2026-08-01", "2026-08-31", fechaPago);
    // Exigidas al 31-jul: 1 + 18 − 2 = 17 → al 31-ago: 6 + 18 − 2 = 22, o sea las cajas 18 a 22.
    // Llenas: 18 (las previas) → 22 con las 4 del pago del 21. Las 5 cubiertas.
    expect(ago.debia).toBe(5 * 202000);
    expect(ago.cubrio).toBe(5 * 202000);
    expect(ago.recupero).toBe(12000);
  });
});

describe("cumplimientoDelPeriodo — el que paga antes no queda debiendo en la semana siguiente", () => {
  const C = {
    id: "x", forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
    es_migrado: true, motor_v2: true, total_cajas: 104, cajas_pagadas: 12, caja_actual_pagado: 0,
    cajas_previas: 10, cajas_exoneradas: 0, prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-09-07",
  } as ContratoCiclo & { id: string };
  // Pagó el domingo 6 la semana del lunes 7, y el domingo 13 la del lunes 14.
  const P = [
    { contrato_id: "x", fecha: "2026-09-06", valor: 202000, aplicado_tarifa: 202000 },
    { contrato_id: "x", fecha: "2026-09-13", valor: 202000, aplicado_tarifa: 202000 },
  ];

  it("la semana del 14 al 20 sale 100% cubierta aunque el pago entró el domingo anterior", () => {
    const c = cumplimientoDelPeriodo(C, P, [], "2026-09-14", "2026-09-20", fechaPago);
    expect(c.debia).toBe(202000);
    expect(c.cubrio).toBe(202000);
  });

  it("y la semana del 7 al 13 también, sin contar dos veces el pago adelantado", () => {
    const c = cumplimientoDelPeriodo(C, P, [], "2026-09-07", "2026-09-13", fechaPago);
    expect(c.debia).toBe(202000);
    expect(c.cubrio).toBe(202000);
    expect(c.recupero).toBe(0);
  });
});

describe("cumplimientoDelPeriodo — lo que no se puede medir con el libro", () => {
  it("un contrato Diario no se mide (no tiene semanas)", () => {
    const c = cumplimientoDelPeriodo({ ...KATIA, forma_pago: "Diario", motor_v2: false }, [], [], "2026-09-01", "2026-09-28", fechaPago);
    expect(c.medible).toBe(false);
  });
});

describe("estadoHoy — la misma cuenta de Cartera", () => {
  it("ELKIN el lunes 28: paga hoy, 0 días, debe su semana más el Excel viejo", () => {
    const e = estadoHoy(ELKIN, PAGOS_ELKIN, [{ monto: 337000, monto_pendiente: 202000 }], null, D("2026-09-28"), "2026-09-28", new Set());
    expect(e.estado).toBe("al-dia");
    expect(e.diasMora).toBe(0);
    expect(e.debeHoy).toBe(404000);
    expect(e.recoleccion).toBe(false);
  });

  it("recolección: más de 3 días con la cuota vencida, y NO si tiene plazo extra vigente", () => {
    const moroso = { ...ELKIN, cajas_pagadas: 22 };  // debe desde el 7-sep
    const sinPlazo = estadoHoy(moroso, PAGOS_ELKIN, [], null, D("2026-09-28"), "2026-09-28", new Set());
    expect(sinPlazo.estado).toBe("mora");
    expect(sinPlazo.diasMora).toBeGreaterThan(3);
    expect(sinPlazo.recoleccion).toBe(true);
    const conPlazo = estadoHoy(moroso, PAGOS_ELKIN, [], null, D("2026-09-28"), "2026-09-28", new Set(["elkin"]));
    expect(conPlazo.recoleccion).toBe(false);
  });
});

describe("contratosConPlazoVigente", () => {
  it("toma el plazo más reciente de cada contrato y solo si no ha vencido", () => {
    const s = contratosConPlazoVigente([
      { contrato_id: "a", tipo: "plazo_extra", plazo_extra_fecha_limite: "2026-09-20" },
      { contrato_id: "a", tipo: "plazo_extra", plazo_extra_fecha_limite: "2026-09-30" },
      { contrato_id: "b", tipo: "plazo_extra", plazo_extra_fecha_limite: "2026-09-27" },
      { contrato_id: "c", tipo: "llamada", plazo_extra_fecha_limite: null },
    ], "2026-09-28");
    expect([...s]).toEqual(["a"]);
  });
});

describe("pctCumplimiento", () => {
  it("suma lo cubierto sobre lo que vencía; sin nada que venciera no hay porcentaje", () => {
    expect(pctCumplimiento([{ debia: 1000, cubrio: 900 }, { debia: 1000, cubrio: 500 }])).toBe(70);
    expect(pctCumplimiento([{ debia: 0, cubrio: 0 }])).toBeNull();
  });
});
