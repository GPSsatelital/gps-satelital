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

describe("el ahorro de los días cobrados es del CLIENTE, no de la empresa", () => {
  // Regla del dueño (21-ago): «si cobras los 31, sabes que tienes que colocar aparte los 4 mil de
  // ahorro que le corresponde». De cada $31.000 diarios, $27.000 son tarifa y $4.000 son su ahorro.
  // Antes se le descontaban los días completos de su ahorro sin devolverle su parte: perdía plata
  // suya, que es justo lo que la spec prohíbe ("nadie pierde ahorro como castigo").

  it("ANTONIO: 4 días cobrados traen $16.000 de ahorro suyo", () => {
    // Su ledger arranca el 27-jul y entregó el 30-jul: lun 27, mar 28, mié 29, jue 30.
    const r = ajusteSalidaLedger(ANTONIO, D("2026-07-30"));
    expect(r.porCobrar).toBe(4 * 31000);          // 4 días completos
    expect(r.ahorroPorCobrar).toBe(4 * 4000);     // su parte de ahorro
  });

  it("lo que la empresa se queda es SOLO la tarifa", () => {
    const r = ajusteSalidaLedger(ANTONIO, D("2026-07-30"));
    expect(r.porCobrar - r.ahorroPorCobrar).toBe(4 * 27000);
  });

  it("si no se le cobra nada, tampoco hay ahorro que devolver", () => {
    // Al día de arranque no ha consumido nada: no hay días cobrados, no hay ahorro que acreditar.
    const r = ajusteSalidaLedger(SERAFIN, D("2026-07-13"));
    expect(r.porCobrar).toBe(0);
    expect(r.ahorroPorCobrar).toBe(0);
  });

  it("nunca devuelve ni cobra montos negativos", () => {
    for (const c of [ANTONIO, SERAFIN, JOSUE]) {
      for (const dia of ["2026-07-20", "2026-08-03", "2026-08-20"]) {
        const r = ajusteSalidaLedger(c, D(dia));
        expect(r.ahorroPorCobrar).toBeGreaterThanOrEqual(0);
        expect(r.aFavor).toBeGreaterThanOrEqual(0);
        expect(r.porCobrar).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("JOSUE: la empresa se queda SOLO con la tarifa de lo que usó; el resto es suyo", () => {
    // 30-sep-2026: antes esta prueba decía "el ahorro devuelto nunca supera lo cobrado", que era
    // un efecto de la cuenta vieja, no una regla. La regla es la del dueño (21-ago): de lo que usó,
    // la empresa cobra la tarifa y el ahorro es del cliente.
    // JOSUE pagó 3 cajas + $114.000 = $699.000. Usó 3 semanas + lun-jue = $709.000, de los que
    // $94.000 son ahorro → tarifa $615.000. Le tocan $699.000 − $615.000 = $84.000. El libro le
    // acreditó $78.000 (3 cajas × $26.000; lo abonado a la caja en curso fue tarifa primero).
    const r = ajusteSalidaLedger(JOSUE, D("2026-08-20"));
    expect(r.porCobrar).toBe(10000);
    expect(r.ahorroPorCobrar).toBe(16000);
    const ahorroDelLibro = 3 * 26000;
    expect(ahorroDelLibro + r.aFavor + r.ahorroPorCobrar - r.porCobrar).toBe(84000);
  });
});

describe("el ahorro se cuenta CAJA POR CAJA, como lo acredita el libro (30-sep-2026)", () => {
  // Antes se sacaba "tarifa primero" sobre todo lo pagado junto, y eso no es lo que el libro
  // acredita: el libro acredita el ahorro de cada caja al llenarla. Casos reales del 30-sep.

  // ── ROGER VANEGAS (RMM68H) — migrado, 8 semanas pagadas en el libro, entregó el lunes 21-sep ──
  const ROGER: ContratoCiclo = {
    forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
    tarifa_diaria: 26000, tarifa_domingo: 13000, ahorro_diario: 4000, ahorro_domingo: 2000,
    es_migrado: true, motor_v2: true,
    total_cajas: 104, cajas_pagadas: 53, cajas_previas: 45, caja_actual_pagado: 0,
    prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  };

  it("ROGER: el lunes que no pagó se cobra ($30.000) y se le devuelven SOLO sus $4.000 de ahorro", () => {
    const r = ajusteSalidaLedger(ROGER, D("2026-09-21"));
    expect(r.porCobrar).toBe(30000);
    expect(r.ahorroPorCobrar).toBe(4000);   // antes daba $30.000: el día le salía gratis
    expect(r.aFavor).toBe(0);
  });

  // ── MELISSA BELLO (RMZ65H) — quincenal, entregó $404.000 de base y devolvió la moto el 11-sep ──
  const MELISSA: ContratoCiclo = {
    forma_pago: "Quincenal", dia_pago: "Quincenal", dias_pago_mes: [10, 25], valor_semanal: 202000,
    tarifa_diaria: 27000, tarifa_domingo: 14000, ahorro_diario: 4000, ahorro_domingo: 2000,
    es_migrado: false, motor_v2: true, fecha_entrega: "2026-09-03",
    total_cajas: 38, cajas_pagadas: 0, cajas_previas: 0, caja_actual_pagado: 404000,
    prorrateo_total: 202000, prorrateo_pagado: 0, prorrateo_ahorro: 26000, fecha_inicio_cajas: "2026-09-10",
  };

  it("MELISSA: se le devuelve todo lo que no es tarifa de lo que usó ($174.000)", () => {
    const r = ajusteSalidaLedger(MELISSA, D("2026-09-11"));
    expect(r.consumido).toBe(264000);        // prorrateo $202.000 + jueves y viernes $62.000
    expect(r.aFavor).toBe(140000);           // pagó y no alcanzó a usar
    expect(r.ahorroPorCobrar).toBe(9000);    // ahorro de los días usados que el libro no le acreditó
    // El libro le acreditó $25.000 (la cola de su quincena, tarifa primero). Tarifa de lo usado:
    // $264.000 − $34.000 de ahorro = $230.000. $404.000 − $230.000 = $174.000.
    expect(25000 + r.aFavor + r.ahorroPorCobrar - r.porCobrar).toBe(174000);
  });

  it("SERAFIN: si pagó por adelantado, el ahorro de esas semanas no se le devuelve dos veces", () => {
    // Entrega el mismo día que arranca el libro: usó su prorrateo y ese lunes. El libro ya le
    // acreditó el ahorro de las 4 cajas que pagó ($104.000, en "Ahorro que ganó pagando"); lo
    // adelantado que se le devuelve va SIN ese ahorro. Antes se lo devolvía dos veces y se
    // llevaba más de lo que había pagado.
    const r = ajusteSalidaLedger(SERAFIN, D("2026-07-13"));
    const ahorroDelLibro = 4 * 26000;
    const tarifaUsada = 47000 + 27000;       // prorrateo (sin ahorro registrado) + el lunes
    expect(ahorroDelLibro + r.aFavor + r.ahorroPorCobrar - r.porCobrar).toBe(r.pagado - tarifaUsada);
  });
});

describe("contratos que el motor de cajas no cubre", () => {
  it("un contrato Diario no tiene cuenta de salida", () => {
    const diario: ContratoCiclo = { ...ANTONIO, forma_pago: "Diario" };
    expect(ajusteSalidaLedger(diario, D("2026-08-20"))).toEqual({
      pagado: 0, consumido: 0, aFavor: 0, porCobrar: 0, ahorroPorCobrar: 0,
    });
  });

  it("un contrato del motor viejo tampoco — y por eso hay que avisarlo, no cobrar $0 en silencio", () => {
    const v1: ContratoCiclo = { ...ANTONIO, motor_v2: false };
    expect(ajusteSalidaLedger(v1, D("2026-08-20")).porCobrar).toBe(0);
  });
});
