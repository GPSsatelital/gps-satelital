import { describe, it, expect } from "vitest";
import { cuentaLiquidacion, plataQueEsDelCliente, faltaParaCumplimiento, deudasYAcuerdos, CONCEPTO_PAGO_MOTO } from "./cuentaLiquidacion";
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

// ── YESID BARRAZA (RLT72H) — migrado, va 60 de 65, cifras de producción del 25-sep-2026 ──
// Regla del dueño D-023 (24-sep): el ahorro es de la empresa SOLO si el contrato termina bien;
// si liquida sin terminar, se le devuelve. Confirmada con su caso el 25-sep.
const YESID = {
  forma_pago: "Semanal" as const, dia_pago: "Lunes", valor_semanal: 235000,
  es_migrado: true, motor_v2: true,
  total_cajas: 65, cajas_pagadas: 60, cajas_previas: 51, caja_actual_pagado: 0,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  tarifa_diaria: 26000, tarifa_domingo: 13000, ahorro_diario: 10000, ahorro_domingo: 6000,
  ahorro_acumulado: 525000, ahorro_apertura: 3276000, ahorro_inicial: 800000,
};

describe("el que se va ANTES de terminar: se le devuelve todo su ahorro (D-023)", () => {
  it("YESID hoy: base $800.000 − semana $235.000 + ahorro $3.801.000 = $4.366.000", () => {
    const r = plataQueEsDelCliente(YESID);
    expect(r.map(x => [x.concepto, x.monto])).toEqual([
      ["Base inicial que entregó", 800000],
      ["Menos la semana adelantada de esa base", -235000],
      ["Ahorro que ganó pagando", 3801000],
    ]);
    expect(r.reduce((s, x) => s + x.monto, 0)).toBe(4366000);
  });
});

// Corte el 1-nov: el día en que se consume su caja 65 exacta. Antes le devuelve lo pagado de la
// semana que no usó; después le cobra días. Aquí se mide solo el ahorro, sin ese ajuste.
describe("el que TERMINA su contrato: su ahorro pagó la moto (D-023)", () => {
  it("YESID al pagar su semana 65: el ahorro se MUESTRA completo y se cierra con lo que pagó", () => {
    const r = plataQueEsDelCliente(YESID, "cumplimiento");
    expect(r.map(x => [x.concepto, x.monto])).toEqual([
      ["Base inicial que entregó", 800000],
      ["Menos la semana adelantada de esa base", -235000],
      ["Ahorro que ganó pagando", 3801000],
      [CONCEPTO_PAGO_MOTO, -4366000],
    ]);
    expect(r.reduce((s, x) => s + x.monto, 0)).toBe(0);
  });

  it("los otros dos motivos se van antes de terminar: se les devuelve todo, igual que siempre", () => {
    const antes = plataQueEsDelCliente(YESID);
    expect(plataQueEsDelCliente(YESID, "retiro_voluntario")).toEqual(antes);
    expect(plataQueEsDelCliente(YESID, "incumplimiento")).toEqual(antes);
  });

  it("el saldo a favor NO es ahorro: al que termina se le sigue devolviendo", () => {
    const c = cuentaLiquidacion({
      contrato: { ...YESID, cajas_pagadas: 65 }, fechaCorte: "2026-11-01", saldoFavor: 109000,
      deudas: [], convenios: [], motivo: "cumplimiento",
    });
    expect(c.aFavor.total).toBe(109000);
    expect(c.aFavor.renglones.find(r => r.concepto === "Saldo a favor")!.monto).toBe(109000);
  });

  it("lo que debe se le sigue cobrando: el acuerdo sin terminar queda en contra", () => {
    const c = cuentaLiquidacion({
      contrato: { ...YESID, cajas_pagadas: 65 }, fechaCorte: "2026-11-01", saldoFavor: 0,
      deudas: [], motivo: "cumplimiento",
      convenios: [{ estado: "activo", deuda_total: 300000, cuotas_pagadas: 4, cuota_por_periodo: 60000 }],
    });
    expect(c.aFavor.total).toBe(0);
    expect(c.enContra.total).toBe(60000);
    expect(c.saldoFinal).toBe(-60000);
  });

  it("también al del WIZARD: la apertura (resto de su base) y lo ganado pagando pagan la moto", () => {
    const r = plataQueEsDelCliente(SERAFIN, "cumplimiento");
    expect(r.at(-1)).toEqual({ concepto: CONCEPTO_PAGO_MOTO, monto: -418000 });
    expect(r.reduce((s, x) => s + x.monto, 0)).toBe(0);
  });

  it("sin ahorro no aparece el renglón: no hay nada que explicar", () => {
    const r = plataQueEsDelCliente({ ...SERAFIN, ahorro_acumulado: 0, ahorro_apertura: 0 }, "cumplimiento");
    expect(r).toEqual([]);
  });
});

// D-026 (25-sep): nadie termina debiendo. Si llenó sus semanas pero debe más de lo que tiene a
// favor, no se liquida por cumplimiento: sigue pagando su semana normal hasta quedar en $0.
describe("¿puede liquidarse por cumplimiento? (D-026)", () => {
  // El acuerdo real de YESID: $556.000 en cuotas de $60.000, lleva 5 pagadas.
  const ACUERDO_YESID = { estado: "activo", deuda_total: 556000, cuotas_pagadas: 5, cuota_por_periodo: 60000 };

  it("YESID hoy: debe $256.000, tiene $109.000 a favor → le faltan $147.000", () => {
    expect(faltaParaCumplimiento([], [ACUERDO_YESID], 109000)).toEqual({ debe: 256000, aFavor: 109000, falta: 147000 });
  });

  it("si paga lo que falta del acuerdo, queda en $0 y ya puede", () => {
    const pagado = { ...ACUERDO_YESID, cuotas_pagadas: 10 };
    expect(faltaParaCumplimiento([], [pagado], 109000).falta).toBe(0);
  });

  it("el saldo a favor que alcanza a cubrir lo que debe también lo deja en $0", () => {
    expect(faltaParaCumplimiento([], [ACUERDO_YESID], 300000).falta).toBe(0);
  });

  it("las deudas sueltas cuentan; las que están dentro de un acuerdo no se cuentan dos veces", () => {
    const deudas = [
      { estado: "pendiente", concepto: "multa_recoleccion", descripcion: "", monto_pendiente: 30000 },
      { estado: "en_convenio", concepto: "tarifa_atrasada", descripcion: "", monto_pendiente: 202000 },
      { estado: "pagada", concepto: "lavada", descripcion: "", monto_pendiente: 0 },
    ];
    expect(faltaParaCumplimiento(deudas, [], 0)).toEqual({ debe: 30000, aFavor: 0, falta: 30000 });
  });

  it("un saldo a favor negativo no le resta: se toma como cero", () => {
    expect(faltaParaCumplimiento([], [ACUERDO_YESID], -5000).falta).toBe(256000);
  });

  it("la liquidación cobra EXACTAMENTE las mismas deudas y acuerdos que mira el candado", () => {
    const c = cuentaLiquidacion({
      contrato: { ...YESID, cajas_pagadas: 65 }, fechaCorte: "2026-11-01", saldoFavor: 0,
      deudas: [], convenios: [ACUERDO_YESID], motivo: "cumplimiento",
    });
    expect(c.enContra.total).toBe(faltaParaCumplimiento([], [ACUERDO_YESID], 0).debe);
  });
});

// ── EL CONVENIO DE BASE (D-023, segunda cara) ──
// Casos reales del 26-sep: JESUS MARIA DE HORTA (LIQ-0011) y FRAIRON CASTILLA (LIQ-0070). Ninguno
// alcanzó a pagar un peso de su convenio "Base inicial incompleta al crear el contrato".
const CONTRATO_202 = { ...SERAFIN, ahorro_acumulado: 26000, ahorro_apertura: 0 };
const BASE_JESUS = { estado: "activo", deuda_total: 308000, cuotas_pagadas: 0, cuota_por_periodo: 30000, concepto: "Base inicial incompleta al crear el contrato" };
const BASE_FRAIRON = { estado: "activo", deuda_total: 410000, cuotas_pagadas: 0, cuota_por_periodo: 50000, concepto: "Base inicial incompleta al crear el contrato" };

describe("D-023 segunda cara: al que se va ANTES no se le cobra la base que no pagó", () => {
  // Antes de este cambio (26-sep) la liquidación le cobraba a JESUS MARIA los $308.000 completos.
  it("JESUS MARIA (retiro): su base de $308.000 sin pagar ya no se le cobra", () => {
    const c = cuentaLiquidacion({ contrato: CONTRATO_202, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [BASE_JESUS], motivo: "retiro_voluntario" });
    expect(c.enContra.renglones.some(r => /convenio|base/i.test(r.concepto))).toBe(false);
  });

  it("FRAIRON (incumplimiento): de sus $410.000 solo se cobra la primera semana, $102.000", () => {
    const c = cuentaLiquidacion({ contrato: CONTRATO_202, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [BASE_FRAIRON], motivo: "incumplimiento" });
    expect(c.enContra.renglones.find(r => r.concepto === "Primera semana de su base, sin pagar")?.monto).toBe(102000);
  });

  it("lo que abonó al convenio de base tapa primero la semana (tarifa primero)", () => {
    const abono100 = deudasYAcuerdos([], [{ ...BASE_FRAIRON, cuotas_pagadas: 2 }], { seVaAntes: true, pisoBase: 308000 });
    expect(abono100).toEqual([{ concepto: "Primera semana de su base, sin pagar", monto: 2000 }]);
    const abono150 = deudasYAcuerdos([], [{ ...BASE_FRAIRON, cuotas_pagadas: 3 }], { seVaAntes: true, pisoBase: 308000 });
    expect(abono150).toEqual([]);
  });

  it("tarifa vieja: el piso es $305.000, y lo que pase de ahí es semana", () => {
    const r = deudasYAcuerdos([], [{ ...BASE_FRAIRON, deuda_total: 400000 }], { seVaAntes: true, pisoBase: 305000 });
    expect(r).toEqual([{ concepto: "Primera semana de su base, sin pagar", monto: 95000 }]);
  });

  it("por CUMPLIMIENTO sí se cobra entera: la base es parte del precio de la moto (D-026)", () => {
    const c = cuentaLiquidacion({ contrato: { ...CONTRATO_202, cajas_pagadas: 104 }, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [BASE_JESUS], motivo: "cumplimiento" });
    expect(c.enContra.renglones.find(r => r.concepto === "Saldo pendiente de convenio")?.monto).toBe(308000);
  });

  it("el candado del cumplimiento la sigue contando: no se liquida por cumplimiento con la base sin pagar", () => {
    expect(faltaParaCumplimiento([], [BASE_JESUS], 0).falta).toBe(308000);
  });

  it("un acuerdo que NO es de base se sigue cobrando igual al que se va", () => {
    const acuerdo = { ...BASE_JESUS, concepto: "Por tarifas atrasadas" };
    const c = cuentaLiquidacion({ contrato: CONTRATO_202, fechaCorte: "2026-07-13", saldoFavor: 0, deudas: [], convenios: [acuerdo], motivo: "retiro_voluntario" });
    expect(c.enContra.renglones.find(r => r.concepto === "Saldo pendiente de convenio")?.monto).toBe(308000);
  });
});
