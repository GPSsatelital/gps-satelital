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

describe("la base del migrado: el campo MANUAL manda, y se le resta la semana completa", () => {
  // Regla del dueño (22-ago, tarde): «el único valor que cuenta como base para los migrados es
  // el que se coloca manualmente en "Ahorro inicial"; lo del SQL eran proyecciones». Y sobre la
  // semana adelantada: «se le resta la semana completa, pero se le devuelve lo que le haya
  // sobrado» — lo sobrado lo devuelve el ajuste de salida por días, no este renglón.

  const MIGRADO = {
    forma_pago: "Semanal" as const, dia_pago: "Lunes", valor_semanal: 202000,
    es_migrado: true, motor_v2: true,
    total_cajas: 104, cajas_pagadas: 5, cajas_previas: 5, caja_actual_pagado: 0,
    prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
    ahorro_acumulado: 0, ahorro_apertura: 148000,
  };

  it("caso JAVIER (XYZ54H): dio $403.000 → base $403.000 − semana $202.000 = $201.000", () => {
    // Del dueño, con este caso exacto: «se le resta la semana completa, pero se le devuelve lo
    // que le haya sobrado». Los $107.000 que dejó de pagar reaparecen en el ajuste de días.
    const javier = { ...MIGRADO, ahorro_inicial: 403000, base_inicial: 150000 };
    const c = cuentaLiquidacion({ contrato: javier, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.aFavor.renglones.find(r => r.concepto === "Base inicial que entregó")!.monto).toBe(403000);
    expect(c.aFavor.renglones.find(r => r.concepto === "Menos la semana adelantada de esa base")!.monto).toBe(-202000);
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(201000);
  });

  it("la fuente es el campo MANUAL (ahorro_inicial), NO la proyección del SQL (base_inicial)", () => {
    const corregido = { ...MIGRADO, ahorro_inicial: 403000, base_inicial: 510000 };
    const c = cuentaLiquidacion({ contrato: corregido, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.aFavor.renglones.find(r => r.concepto === "Base inicial que entregó")!.monto).toBe(403000);
  });

  it("las cuentas VIEJAS de $195.000 restan SU semana, sin caso especial", () => {
    const viejo = { ...MIGRADO, valor_semanal: 195000, ahorro_inicial: 500000 };
    const c = cuentaLiquidacion({ contrato: viejo, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.aFavor.renglones.find(r => r.concepto === "Menos la semana adelantada de esa base")!.monto).toBe(-195000);
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(305000);
  });

  it("nunca se le resta más de lo que entregó: no se le inventa una deuda", () => {
    const chico = { ...MIGRADO, ahorro_inicial: 150000, ahorro_apertura: 0 };
    const c = cuentaLiquidacion({ contrato: chico, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    const base = c.aFavor.renglones.filter(r => /base/i.test(r.concepto)).reduce((s, r) => s + r.monto, 0);
    expect(base).toBe(0);
    expect(c.aFavor.total).toBeGreaterThanOrEqual(0);
  });

  it("base SIN CONFIRMAR (campo en cero): la cuenta lo AVISA y no inventa base", () => {
    // Los 64 de COSTA que la siembra dejó en cero: nadie los ha confirmado en el empalme.
    const sinConfirmar = { ...MIGRADO, ahorro_inicial: 0, base_inicial: 510000 };
    const c = cuentaLiquidacion({ contrato: sinConfirmar, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] });
    expect(c.baseSinConfirmar).toBe(true);
    expect(c.aFavor.renglones.some(r => r.concepto === "Base inicial que entregó")).toBe(false);
  });

  it("un migrado con base confirmada NO avisa; un contrato del wizard tampoco", () => {
    const ok = { ...MIGRADO, ahorro_inicial: 403000 };
    expect(cuentaLiquidacion({ contrato: ok, fechaCorte: "2026-07-30", saldoFavor: 0, deudas: [], convenios: [] }).baseSinConfirmar).toBe(false);
    expect(cuentaLiquidacion({ contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [] }).baseSinConfirmar).toBe(false);
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
