import { describe, it, expect } from "vitest";
import { ajusteSalidaLedger, type ContratoCiclo } from "./cicloPago";

// LA CUENTA DE SALIDA DE UNA LIQUIDACIÓN — "¿hasta qué día se le cobra?"
//
// Regla del dueño (19-ago-2026, reconfirmada textualmente): «se liquida hasta el día en que se
// guardó o se retuvo el vehículo». Es la regla 9 del libro de cajas.
//
// El defecto que estas pruebas encierran: `LiquidacionesView` le pasaba `hoyDate()` a esta
// función en vez del día de la entrega. Como la moto puede pasar semanas en la bodega antes de
// que alguien abra la liquidación, al cliente se le cobraban días en los que la moto estaba en
// poder de la EMPRESA — y peor: la cifra cambiaba según el día en que se abriera la pantalla.
// Dos personas revisando la misma liquidación veían números distintos.
//
// Los contratos de abajo son REALES, con las cifras de producción del 20-ago-2026.

const D = (iso: string) => new Date(iso + "T12:00:00");

// ── ANTONIO MONTERROZA (IEW65I) — migrado de COSTA, sin un solo pago desde el corte ──
const ANTONIO: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 5, cajas_previas: 5, caja_actual_pagado: 0,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};

// ── SERAFIN RODRIGUEZ (IGC39I) — NO migrado. Su moto ya se le entregó a GERMAN ──
const SERAFIN: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: false, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 4, cajas_previas: 0, caja_actual_pagado: 0,
  prorrateo_total: 47000, prorrateo_pagado: 47000, fecha_inicio_cajas: "2026-07-13",
};

// ── JOSUE GRAU (RML59H) — migrado, con una caja a medio pagar ──
const JOSUE: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
  es_migrado: true, motor_v2: true,
  total_cajas: 91, cajas_pagadas: 14, cajas_previas: 11, caja_actual_pagado: 114000,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};

describe("la cuenta de salida depende del DÍA que se le pase", () => {
  // Esto es el defecto, escrito como prueba: mientras la liquidación duerme, la cifra crece.
  // Si algún día alguien "arregla" la función para que ignore la fecha, esto lo caza.
  it("cobra más entre más tarde se calcule — por eso la fecha NO puede ser hoy", () => {
    const alEntregar = ajusteSalidaLedger(ANTONIO, D("2026-08-03"));
    const dosSemanasDespues = ajusteSalidaLedger(ANTONIO, D("2026-08-17"));
    expect(dosSemanasDespues.consumido).toBeGreaterThan(alEntregar.consumido);
    expect(dosSemanasDespues.porCobrar).toBeGreaterThan(alEntregar.porCobrar);
  });

  it("las dos semanas de diferencia valen exactamente 2 cajas", () => {
    const a = ajusteSalidaLedger(ANTONIO, D("2026-08-03"));
    const b = ajusteSalidaLedger(ANTONIO, D("2026-08-17"));
    expect(b.consumido - a.consumido).toBe(2 * 202000);
  });
});

describe("lo prepagado que no se alcanzó a usar se devuelve", () => {
  it("SERAFIN: al día de arranque no ha consumido lo que ya pagó, así que queda a favor", () => {
    // Pagó su prorrateo completo ($47.000) + 4 cajas. Si entregara la moto el mismo día que
    // empieza su ledger, todo lo pagado está sin consumir.
    const r = ajusteSalidaLedger(SERAFIN, D("2026-07-13"));
    expect(r.pagado).toBe(47000 + 4 * 202000);
    expect(r.aFavor).toBeGreaterThan(0);
    expect(r.porCobrar).toBe(0);
  });

  it("nunca devuelve y cobra al mismo tiempo", () => {
    for (const c of [ANTONIO, SERAFIN, JOSUE]) {
      for (const dia of ["2026-07-20", "2026-08-03", "2026-08-20"]) {
        const r = ajusteSalidaLedger(c, D(dia));
        expect(Math.min(r.aFavor, r.porCobrar)).toBe(0);
      }
    }
  });
});

describe("lo pagado cuenta las cajas previas y lo abonado a la caja en curso", () => {
  it("JOSUE: las 11 cajas que traía de la migración NO se le cobran otra vez", () => {
    // pagado = (cajas_pagadas − cajas_previas) × valor + lo abonado a la caja en curso.
    // Las previas quedaron antes del corte: ya estaban pagadas en el sistema viejo.
    const r = ajusteSalidaLedger(JOSUE, D("2026-08-20"));
    expect(r.pagado).toBe((14 - 11) * 195000 + 114000);
  });

  it("ANTONIO no ha pagado nada desde el corte", () => {
    const r = ajusteSalidaLedger(ANTONIO, D("2026-08-20"));
    expect(r.pagado).toBe(0);
  });
});

describe("contratos que el motor de cajas no cubre", () => {
  it("un contrato Diario no tiene cuenta de salida", () => {
    const diario: ContratoCiclo = { ...ANTONIO, forma_pago: "Diario" };
    expect(ajusteSalidaLedger(diario, D("2026-08-20"))).toEqual({
      pagado: 0, consumido: 0, aFavor: 0, porCobrar: 0,
    });
  });

  it("un contrato del motor viejo tampoco — y por eso hay que avisarlo, no cobrar $0 en silencio", () => {
    const v1: ContratoCiclo = { ...ANTONIO, motor_v2: false };
    expect(ajusteSalidaLedger(v1, D("2026-08-20")).porCobrar).toBe(0);
  });
});
