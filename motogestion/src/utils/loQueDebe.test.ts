import { describe, it, expect } from "vitest";
import { loQueDebe, type ContratoCiclo } from "./cicloPago";

// "¿Cuánto debe hoy?" — la cuenta que el funcionario le cobra al cliente.
//
// Estas pruebas existen porque esa cuenta estaba escrita en DIEZ lugares distintos que se
// fueron separando, y nadie se enteraba hasta que un cliente reclamaba en el mostrador.
// Acá están los casos REALES que lo destaparon, con sus cifras de producción: si alguien
// toca este cálculo y le cambia la cuenta a uno de ellos, `npm test` lo caza ANTES de que
// llegue a producción.

const D = (iso: string) => new Date(iso + "T12:00:00");

// ── LIBINTO PATERNINA (XZT89H) — el caso que destapó todo ──────────────────────
// Migrado de COSTA. Convenio del 5-ago por $1.082.000 en 11 cuotas de $100.000.
// El lunes 10 pagó $302.000: $202.000 su semana + $100.000 la cuota del acuerdo.
// La pantalla le seguía cobrando los mismos $100.000.
const LIBINTO: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 19, caja_actual_pagado: 0, cajas_previas: 16,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};
const CONV_LIBINTO = {
  cuota_por_periodo: 100000, deuda_total: 1082000,
  created_at: "2026-08-05T18:08:29Z", cubre_periodo_hasta: "2026-08-10",
};
const PAGOS_LIBINTO = [
  { fecha: "2026-08-03", valor: 202000, aplicado_convenio: 0 },
  { fecha: "2026-08-05", valor: 20000, aplicado_convenio: 0 },
  { fecha: "2026-08-10", valor: 302000, aplicado_convenio: 100000 },
];

describe("LIBINTO — pagó su semana y su cuota del acuerdo", () => {
  it("🔴 EL DEFECTO: ya no debe nada del acuerdo", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], CONV_LIBINTO, D("2026-08-12"));
    expect(r.acuerdo?.falta).toBe(0);
  });

  it("el total que se le cobra hoy es $0", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], CONV_LIBINTO, D("2026-08-12"));
    expect(r.totalFalta).toBe(0);
  });

  it("el desglose explica por qué: le tocaban $100.000 del acuerdo y los pagó", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], CONV_LIBINTO, D("2026-08-12"));
    expect(r.acuerdo).toMatchObject({ toca: 100000, pagado: 100000, falta: 0 });
  });

  it("antes de que el acuerdo empiece a correr no se le exige nada de él", () => {
    // El 6-ago el convenio ya existía, pero cubría su semana hasta el 10.
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO.slice(0, 2), [], CONV_LIBINTO, D("2026-08-06"));
    expect(r.acuerdo?.toca).toBe(0);
    expect(r.acuerdo?.falta).toBe(0);
  });
});

describe("el acuerdo se ARRASTRA — regla del dueño", () => {
  // "Si su cuota es $100.000 y abonó $40.000, la semana siguiente le tocan $160.000."
  const abonoParcial = [
    { fecha: "2026-08-10", valor: 242000, aplicado_convenio: 40000 },
  ];

  it("esta semana le falta lo que no abonó", () => {
    const r = loQueDebe(LIBINTO, abonoParcial, [], CONV_LIBINTO, D("2026-08-12"));
    expect(r.acuerdo?.falta).toBe(60000);
  });

  it("la semana siguiente arrastra: $60.000 viejos + $100.000 nuevos = $160.000", () => {
    const r = loQueDebe(LIBINTO, abonoParcial, [], CONV_LIBINTO, D("2026-08-19"));
    expect(r.acuerdo?.toca).toBe(200000);
    expect(r.acuerdo?.falta).toBe(160000);
  });

  it("nunca se le exige más de lo que pactó — la última cuota es el resto", () => {
    // 11 cuotas × $100.000 = $1.100.000, pero solo debe $1.082.000.
    const r = loQueDebe(LIBINTO, [], [], CONV_LIBINTO, D("2027-06-07"));
    expect(r.acuerdo?.toca).toBe(1082000);
  });
});

describe("las otras dos partes NO cambian de comportamiento", () => {
  it("un contrato al día, sin acuerdo ni deudas, debe $0", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], null, D("2026-08-12"));
    expect(r.totalFalta).toBe(0);
    expect(r.acuerdo).toBeNull();
  });

  it("la deuda suelta usa lo que FALTA, no el monto original", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [{ monto: 100000, monto_pendiente: 30000 }], null, D("2026-08-12"));
    expect(r.deudas).toMatchObject({ toca: 100000, pagado: 70000, falta: 30000 });
    expect(r.totalFalta).toBe(30000);
  });

  it("las tres partes se suman en el total", () => {
    const sinPagar = [{ fecha: "2026-08-03", valor: 202000, aplicado_convenio: 0 }];
    const r = loQueDebe(LIBINTO, sinPagar, [{ monto: 30000, monto_pendiente: 30000 }], CONV_LIBINTO, D("2026-08-12"));
    expect(r.totalFalta).toBe(r.cuota.falta + (r.acuerdo?.falta ?? 0) + r.deudas.falta);
    expect(r.acuerdo?.falta).toBe(100000);
    expect(r.deudas.falta).toBe(30000);
  });
});

describe("el saldo a favor se ve, pero NO se resta — regla del dueño", () => {
  it("aparece aparte sin tocar el total", () => {
    const conSaldo = { ...LIBINTO, saldo_favor_apertura: 50000 };
    const sinPagar = [{ fecha: "2026-08-03", valor: 202000, aplicado_convenio: 0 }];
    const r = loQueDebe(conSaldo, sinPagar, [], null, D("2026-08-12"));
    expect(r.saldoAFavor).toBe(50000);
    expect(r.totalFalta).toBe(r.cuota.falta);   // el saldo NO lo bajó
  });

  it("nunca sale negativo", () => {
    const usado = [{ fecha: "2026-08-10", valor: 202000, aplicado_saldo_favor: -80000 }];
    const r = loQueDebe({ ...LIBINTO, saldo_favor_apertura: 50000 }, usado, [], null, D("2026-08-12"));
    expect(r.saldoAFavor).toBe(0);
  });
});

describe("casos borde que no pueden reventar", () => {
  it("un contrato sin pagos nunca no revienta", () => {
    const r = loQueDebe(LIBINTO, [], [], null, D("2026-08-12"));
    expect(typeof r.totalFalta).toBe("number");
  });

  it("un convenio con cuota en cero se ignora", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], { cuota_por_periodo: 0, created_at: "2026-08-05" }, D("2026-08-12"));
    expect(r.acuerdo).toBeNull();
  });

  it("un convenio sin fecha de creación no exige nada", () => {
    const r = loQueDebe(LIBINTO, PAGOS_LIBINTO, [], { cuota_por_periodo: 100000, created_at: null }, D("2026-08-12"));
    expect(r.acuerdo?.toca).toBe(0);
  });

  it("el total nunca es negativo", () => {
    const pagoDeMas = [{ fecha: "2026-08-10", valor: 900000, aplicado_convenio: 900000 }];
    const r = loQueDebe(LIBINTO, pagoDeMas, [], CONV_LIBINTO, D("2026-08-12"));
    expect(r.totalFalta).toBeGreaterThanOrEqual(0);
    expect(r.acuerdo?.falta).toBe(0);
  });
});
