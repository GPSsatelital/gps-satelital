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
  it("suma ahorro y saldo a favor por separado, cada uno con su nombre", () => {
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 3000, deudas: [], convenios: [],
    });
    const nombres = c.aFavor.renglones.map(r => r.concepto);
    expect(nombres).toContain("Ahorro acumulado");
    expect(nombres).toContain("Saldo a favor");
    // El ahorro son los $418.000 reales de SERAFIN: $110.000 por pagos + $308.000 de apertura.
    expect(c.aFavor.renglones.find(r => r.concepto === "Ahorro acumulado")!.monto).toBe(418000);
    expect(c.aFavor.renglones.find(r => r.concepto === "Saldo a favor")!.monto).toBe(3000);
  });

  it("el saldo a favor NO se disfraza de ahorro", () => {
    // Un número correcto con la etiqueta equivocada ya costó caro antes (caso LIBINTO).
    const c = cuentaLiquidacion({
      contrato: SERAFIN, fechaCorte: "2026-07-13", saldoFavor: 3000, deudas: [], convenios: [],
    });
    expect(c.aFavor.renglones.filter(r => r.concepto === "Ahorro acumulado")).toHaveLength(1);
    expect(c.aFavor.renglones.find(r => r.concepto === "Ahorro acumulado")!.monto).not.toBe(421000);
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
