import { describe, it, expect } from "vitest";
import { cuentaLiquidacion } from "./cuentaLiquidacion";
import type { ContratoCiclo } from "./cicloPago";

// La cuenta que se FIRMA. Los contratos son reales, con las cifras de producción del 20-ago-2026.

// ── SERAFIN RODRIGUEZ (IGC39I) — su moto ya se le entregó a GERMAN ──
const SERAFIN: ContratoCiclo & { ahorro_acumulado: number; ahorro_apertura: number } = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: false, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 4, cajas_previas: 0, caja_actual_pagado: 0,
  prorrateo_total: 47000, prorrateo_pagado: 47000, fecha_inicio_cajas: "2026-07-13",
  ahorro_acumulado: 110000, ahorro_apertura: 308000,
};

describe("lo que se le devuelve al cliente", () => {
  it("cada plata sale con su nombre, sin mezclarse", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 3000, deudas: [], convenios: [],
    });
    const nombres = c.aFavor.renglones.map(r => r.concepto);
    expect(nombres).toContain("Saldo a favor");
    expect(c.aFavor.renglones.find(r => r.concepto === "Saldo a favor")!.monto).toBe(3000);
    // SERAFIN NO es migrado: su apertura es el remanente de su base, y lo ganado pagando va aparte.
    expect(c.aFavor.renglones.find(r => r.concepto === "Ahorro que viene de su base inicial")!.monto).toBe(308000);
    expect(c.aFavor.renglones.find(r => r.concepto === "Ahorro que ganó pagando")!.monto).toBe(110000);
  });
});

describe("la base y el ahorro son dos cosas distintas, y se guardan distinto", () => {
  // Regla del dueño (21-ago): «la base es la base y los ahorros acumulados son otros; solo se unen
  // en la liquidación». Y el arqueo de los migrados trajo en `ahorro_apertura` SOLO lo ganado
  // pagando — su base quedó aparte, en `ahorro_inicial`.

  // ANTONIO MONTERROZA (IEW65I): migrado, base del arqueo $510.000, ahorro del arqueo $148.000.
  const ANTONIO = {
    forma_pago: "Semanal" as const, dia_pago: "Lunes", valor_semanal: 202000,
    es_migrado: true, motor_v2: true,
    total_cajas: 104, cajas_pagadas: 5, cajas_previas: 5, caja_actual_pagado: 0,
    prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
    ahorro_acumulado: 0, ahorro_apertura: 148000, base_inicial: 510000,
  };

  it("al MIGRADO se le suma su base: sin eso se le devuelve menos de lo que es suyo", () => {
    const c = cuentaLiquidacion({
      contrato: ANTONIO, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [],
    });
    expect(c.aFavor.renglones.find(r => r.concepto === "Base inicial que entregó")!.monto).toBe(510000);
    expect(c.aFavor.renglones.find(r => r.concepto === "Ahorro que ganó pagando")!.monto).toBe(148000);
  });

  it("de la base se descuenta la semana que ella pagó: ya rodó y ya se consumió", () => {
    const c = cuentaLiquidacion({
      contrato: ANTONIO, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [],
    });
    expect(c.aFavor.renglones.find(r => r.concepto === "Menos la semana que esa base pagó")!.monto).toBe(-202000);
    // $510.000 − $202.000 = $308.000, que es el ahorro de apertura estándar. Es la prueba de que
    // la resta es la correcta y no un número inventado.
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(308000);
  });

  it("las cuentas VIEJAS de $195.000 salen bien solas, sin caso especial", () => {
    // JOSUE GRAU (RML59H): moto usada, base del arqueo $500.000.
    const josue = { ...ANTONIO, valor_semanal: 195000, base_inicial: 500000 };
    const c = cuentaLiquidacion({ contrato: josue, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.aFavor.renglones.find(r => r.concepto === "Menos la semana que esa base pagó")!.monto).toBe(-195000);
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(305000);   // el ahorro de apertura de las cuentas viejas
  });

  it("nunca se le resta más de lo que entregó: no se le inventa una deuda", () => {
    // Existe un migrado real con base de $202.000 exactos — igual a su semana.
    const chico = { ...ANTONIO, base_inicial: 202000, ahorro_apertura: 0 };
    const c = cuentaLiquidacion({ contrato: chico, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(0);
    expect(c.aFavor.total).toBeGreaterThanOrEqual(0);
  });

  it("NO se lee ahorro_inicial: ese campo está revuelto y 64 migrados lo tienen en cero", () => {
    // La migración de COSTA lo dejó en 0 y se llenó a medias después. Si el cálculo lo leyera,
    // a esos 64 no se les contaría NADA de base — perderían ~$500.000 cada uno.
    const revuelto = { ...ANTONIO, ahorro_inicial: 0 };
    const c = cuentaLiquidacion({ contrato: revuelto, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.aFavor.renglones.find(r => r.concepto === "Base inicial que entregó")!.monto).toBe(510000);
  });

  it("al del WIZARD no se le suma la base: ya está repartida adentro y sería contarla dos veces", () => {
    // SERAFIN entró por el wizard con $510.000: $202.000 pagaron su primera semana (Caja 1) y
    // $308.000 quedaron en apertura. Sumar la base otra vez le daría $818.000 de ahorro.
    const conBase = { ...SERAFIN, base_inicial: 510000, ahorro_inicial: 510000 };
    const c = cuentaLiquidacion({
      contrato: conBase, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [],
    });
    expect(c.aFavor.renglones.some(r => r.concepto === "Base inicial que entregó")).toBe(false);
    const sumaAhorro = c.aFavor.renglones
      .filter(r => r.concepto.startsWith("Ahorro"))
      .reduce((s, r) => s + r.monto, 0);
    expect(sumaAhorro).toBe(418000);
  });
});

describe("el convenio incumplido SÍ se cobra", () => {
  const CONVENIO_INCUMPLIDO = { deuda_total: 510000, cuota_por_periodo: 50000, cuotas_pagadas: 2, estado: "incumplido" };

  it("entra en la cuenta con su saldo restante", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [],
      convenios: [CONVENIO_INCUMPLIDO],
    });
    const r = c.enContra.renglones.find(x => x.concepto === "Saldo de convenio incumplido");
    expect(r?.monto).toBe(510000 - 2 * 50000);
  });

  it("sin él, se le devolvería todo el ahorro — este es el hueco que tapaba", () => {
    const sinConvenio = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [],
    });
    const conConvenio = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [],
      convenios: [CONVENIO_INCUMPLIDO],
    });
    expect(sinConvenio.saldoFinal - conConvenio.saldoFinal).toBe(410000);
  });

  it("un convenio ya cumplido no se cobra otra vez", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [],
      convenios: [{ deuda_total: 510000, cuota_por_periodo: 50000, cuotas_pagadas: 2, estado: "cumplido" }],
    });
    expect(c.enContra.renglones).toHaveLength(0);
  });
});

describe("las deudas que ya están dentro de un convenio no se cobran dos veces", () => {
  it("solo entran las 'pendiente', no las 'en_convenio'", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0,
      deudas: [
        { concepto: "multa_recoleccion", descripcion: "", monto_pendiente: 20000, estado: "pendiente" },
        { concepto: "tarifa_atrasada", descripcion: "", monto_pendiente: 300000, estado: "en_convenio" },
      ],
      convenios: [],
    });
    expect(c.enContra.total).toBe(20000);
    expect(c.enContra.renglones[0].concepto).toBe("Multa por recolección");
  });
});

describe("la fecha de corte manda sobre toda la cuenta", () => {
  it("cortar más tarde le cobra más días", () => {
    const temprano = cuentaLiquidacion({ contrato: SERAFIN, fechaCorte: "2026-07-27", saldoFavor: 0, deudas: [], convenios: [] });
    const tarde = cuentaLiquidacion({ contrato: SERAFIN, fechaCorte: "2026-08-24", saldoFavor: 0, deudas: [], convenios: [] });
    expect(tarde.saldoFinal).toBeLessThan(temprano.saldoFinal);
  });

  it("la fecha usada queda escrita en la cuenta, para poder revisarla después", () => {
    const c = cuentaLiquidacion({ contrato: SERAFIN, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.fechaCorte).toBe("2026-07-30");
  });
});

describe("el total y su desglose no se pueden contradecir", () => {
  it("saldo final = suma de lo que está a favor − suma de lo que está en contra", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-08-24", saldoFavor: 3000,
      deudas: [{ concepto: "multa_recoleccion", descripcion: "", monto_pendiente: 20000, estado: "pendiente" }],
      convenios: [{ deuda_total: 300000, cuota_por_periodo: 50000, cuotas_pagadas: 1, estado: "activo" }],
      danos: [{ concepto: "Farol roto", monto: 50000 }],
    });
    const sumaFavor = c.aFavor.renglones.reduce((s, r) => s + r.monto, 0);
    const sumaContra = c.enContra.renglones.reduce((s, r) => s + r.monto, 0);
    expect(c.aFavor.total).toBe(sumaFavor);
    expect(c.enContra.total).toBe(sumaContra);
    expect(c.saldoFinal).toBe(sumaFavor - sumaContra);
  });

  it("los daños salen con su nombre, para que el cliente sepa qué se le cobró", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [],
      danos: [{ concepto: "Farol roto", monto: 50000 }],
    });
    expect(c.enContra.renglones.find(r => r.concepto === "Daño: Farol roto")?.monto).toBe(50000);
  });
});
