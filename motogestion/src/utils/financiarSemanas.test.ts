import { describe, it, expect } from "vitest";
import { financiarSemanas, type ContratoCiclo } from "./cicloPago";

// Cuánto arriendo entra a un convenio cuando se financian semanas — y cuánto AHORRO viaja adentro.
//
// Estas pruebas existen por un defecto real de producción: la cuenta usaba
// `Math.min(hueco, cuotaDelPeriodo)`, que solo descontaba el abono a medias cuando el cliente
// debía MENOS de una semana. Con dos o más atrasadas se quedaba con la semana entera y el abono
// se volvía invisible: se le cobraba dos veces.

const D = (iso: string) => new Date(iso + "T12:00:00");

// ── NESTOR MORENO (YAL67H) — el caso que lo destapó ────────────────────────────
// El 12-ago debía DOS semanas y llevaba $14.000 abonados a la más vieja (la del 3-ago).
// Su convenio se firmó por $202.000 cuando de esa semana solo faltaban $188.000.
const NESTOR: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  tarifa_diaria: 27000, tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: true, motor_v2: true,
  total_cajas: 100, cajas_pagadas: 6, caja_actual_pagado: 14000, cajas_previas: 2,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-06",
};

describe("NESTOR — la semana más vieja trae $14.000 abonados", () => {
  it("🔴 EL DEFECTO: financiar 1 semana cuesta $188.000, no $202.000", () => {
    expect(financiarSemanas(NESTOR, D("2026-08-12"), 1).total).toBe(188000);
  });

  it("financiar las 2 lo deja exactamente al día", () => {
    // Debía $390.000 (2 semanas menos los $14.000 ya abonados).
    expect(financiarSemanas(NESTOR, D("2026-08-12"), 2).total).toBe(390000);
  });

  it("el ahorro que viaja adentro son $26.000 — sus $14.000 eran toda tarifa", () => {
    expect(financiarSemanas(NESTOR, D("2026-08-12"), 1).ahorro).toBe(26000);
  });

  it("con 2 semanas, el ahorro es el de las dos", () => {
    expect(financiarSemanas(NESTOR, D("2026-08-12"), 2).ahorro).toBe(52000);
  });
});

// ── ALBERT DEL CRISTO (YAL59H) — financiar hacia ADELANTE ─────────────────────
// El 31-jul acababa de pagar su semana: no debía nada. Financió la semana que venía.
const ALBERT: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  tarifa_diaria: 27000, tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 25, caja_actual_pagado: 0, cajas_previas: 24,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};

describe("ALBERT — sin nada vencido, se financia la semana que viene", () => {
  it("entra la semana COMPLETA", () => {
    expect(financiarSemanas(ALBERT, D("2026-07-31"), 1).total).toBe(202000);
  });

  it("con su ahorro completo adentro", () => {
    expect(financiarSemanas(ALBERT, D("2026-07-31"), 1).ahorro).toBe(26000);
  });
});

describe("lo que NO puede cambiar (comportamiento de siempre)", () => {
  it("debiendo menos de una semana, se financia solo lo que falta", () => {
    // Este caso YA funcionaba bien antes del arreglo: no puede moverse.
    const c = { ...NESTOR, cajas_pagadas: 7 };   // exigidas 8 → debe una sola, con $14.000 puestos
    expect(financiarSemanas(c, D("2026-08-12"), 1).total).toBe(188000);
  });

  it("sin abono a medias, la semana vencida entra completa", () => {
    const c = { ...NESTOR, cajas_pagadas: 7, caja_actual_pagado: 0 };
    expect(financiarSemanas(c, D("2026-08-12"), 1).total).toBe(202000);
    expect(financiarSemanas(c, D("2026-08-12"), 1).ahorro).toBe(26000);
  });

  it("financiar 0 semanas no mete nada", () => {
    expect(financiarSemanas(NESTOR, D("2026-08-12"), 0)).toEqual({ primera: 0, total: 0, ahorro: 0 });
  });

  it("los contratos Diario quedan fuera", () => {
    const diario = { ...NESTOR, forma_pago: "Diario" as const };
    expect(financiarSemanas(diario, D("2026-08-12"), 1).total).toBe(0);
  });
});

describe("el abono grande — cuando ya había ahorro ganado en esa semana", () => {
  // Si abonó $190.000 de los $202.000, ya cubrió la tarifa ($176.000) y ganó $14.000 de ahorro.
  // Lo que se financia son los $12.000 que faltan, y solo llevan los $12.000 de ahorro restantes.
  const casi = { ...NESTOR, cajas_pagadas: 7, caja_actual_pagado: 190000 };

  it("se financia solo lo que falta", () => {
    expect(financiarSemanas(casi, D("2026-08-12"), 1).total).toBe(12000);
  });

  it("y el ahorro no se cuenta dos veces", () => {
    expect(financiarSemanas(casi, D("2026-08-12"), 1).ahorro).toBe(12000);
  });

  it("nunca sale negativo", () => {
    const raro = { ...NESTOR, cajas_pagadas: 7, caja_actual_pagado: 202000 };
    const r = financiarSemanas(raro, D("2026-08-12"), 1);
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.ahorro).toBeGreaterThanOrEqual(0);
  });
});
