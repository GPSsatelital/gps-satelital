import { describe, it, expect } from "vitest";
import { loQueDebe, calcularEstadoCartera, cuotaConvenioDelPeriodo, type ContratoCiclo } from "./cicloPago";

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

// ── DANIEL MILLAN (RLT87H) — el estado y el monto decían cosas distintas ────────
// Visto EN PANTALLA el 14-ago: su fila mostraba "Al día · $0" y al lado "Mora · P4: RECOLECCIÓN
// FÍSICA". Estaba en la cola de recolección sin deber un peso.
// Causa: el monto usaba el arrastre (todo lo abonado desde que se firmó el acuerdo) y el estado
// miraba SOLO los pagos de la semana en curso. Él llevaba $61.000 abonados contra una cuota de
// $33.500, pero los pagó el 1 y el 8 de agosto — para el estado esos pagos no existían.
const DANIEL: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
  tarifa_diaria: 26000, tarifa_domingo: 13000, ahorro_diario: 4000, ahorro_domingo: 2000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 54, caja_actual_pagado: 0, cajas_previas: 51,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
};
const CONV_DANIEL = {
  cuota_por_periodo: 33500, deuda_total: 737000,
  created_at: "2026-08-01T19:02:00Z", cubre_periodo_hasta: "2026-08-10",
};
const PAGOS_DANIEL = [
  { fecha: "2026-08-01", valor: 26000, aplicado_convenio: 26000 },
  { fecha: "2026-08-08", valor: 230000, aplicado_convenio: 35000 },
];
const cuotaD = () => cuotaConvenioDelPeriodo(CONV_DANIEL, DANIEL, D("2026-08-14"));

describe("DANIEL — abonó su acuerdo en semanas anteriores", () => {
  it("no le falta nada del acuerdo: $61.000 abonados contra una cuota de $33.500", () => {
    const r = loQueDebe(DANIEL, PAGOS_DANIEL, [], CONV_DANIEL, D("2026-08-14"));
    expect(r.acuerdo?.falta).toBe(0);
    expect(r.totalFalta).toBe(0);
  });

  it("🔴 EL DEFECTO: el estado decía MORA con $0 de deuda", () => {
    expect(calcularEstadoCartera(DANIEL, PAGOS_DANIEL, D("2026-08-14"), cuotaD(), false, CONV_DANIEL))
      .toBe("al-dia");
  });

  it("quien SÍ debe el acuerdo sigue saliendo en mora", () => {
    const sinAbonos = [{ fecha: "2026-08-08", valor: 230000, aplicado_convenio: 0 }];
    expect(calcularEstadoCartera(DANIEL, sinAbonos, D("2026-08-14"), cuotaD(), false, CONV_DANIEL))
      .toBe("mora");
  });

  it("sin pasarle el convenio se conserva el comportamiento viejo", () => {
    expect(calcularEstadoCartera(DANIEL, PAGOS_DANIEL, D("2026-08-14"), cuotaD()))
      .toBe("mora");
  });
});

// ── MARLON MUÑOZ (RNG53H) — el desglose DEBE cuadrar con su propio total (25-ago) ──
// Lo cazó el dueño en pantalla: arriba decía "Cuota del período $202.000" y abajo "Le falta por
// pagar $404.000" (dos semanas vencidas). El total estaba bien; el renglón que lo explica, no.
const MARLON: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 202000,
  es_migrado: false, motor_v2: true,
  total_cajas: 83, cajas_pagadas: 1, caja_actual_pagado: 0, cajas_previas: 0,
  prorrateo_total: 62000, prorrateo_pagado: 62000, fecha_inicio_cajas: "2026-08-12",
};

describe("MARLON — lo que dice el desglose es lo que suma el total", () => {
  it("con DOS semanas vencidas, la cuota que se muestra son las dos ($404.000)", () => {
    const r = loQueDebe(MARLON, [], [], null, D("2026-08-27"));
    expect(r.cuota).toMatchObject({ toca: 404000, pagado: 0, falta: 404000 });
    expect(r.totalFalta).toBe(404000);
  });

  it("el renglón NUNCA puede ser menor que lo que falta — esa era la contradicción", () => {
    const r = loQueDebe(MARLON, [], [], null, D("2026-08-27"));
    expect(r.cuota.toca).toBeGreaterThanOrEqual(r.cuota.falta);
  });

  it("una caja a medias suma completa en 'toca' y solo el resto en 'falta'", () => {
    const conAbono = { ...MARLON, caja_actual_pagado: 150000 };
    const r = loQueDebe(conAbono, [], [], null, D("2026-08-27"));
    expect(r.cuota).toMatchObject({ toca: 404000, pagado: 150000, falta: 254000 });
  });

  it("al día, el renglón muestra la cuota del período como referencia", () => {
    const alDia = { ...MARLON, cajas_pagadas: 3 };
    const r = loQueDebe(alDia, [], [], null, D("2026-08-27"));
    expect(r.cuota).toMatchObject({ toca: 202000, falta: 0 });
  });
});

// ── JUAN CARLOS LEAL (YAL68H) — rodar el PAQUETE (mig 118, 24-ago) ─────────────
// Moto guardada por retención de mora del 5-ago al 24-ago = 2 semanas COMPLETAS de bodega
// (los 5 días sueltos se quedan en su semana — regla del dueño). Su convenio del 14-jul
// ($616.500, cuotas de $58.000) exigía 6 cuotas al 24-ago; al rodar 2, exige 4.
// "No es que se le perdona — es que se le rueda al final también."
const JUAN_CARLOS: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 14, caja_actual_pagado: 0, cajas_previas: 10,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-06",
};
const CONV_JC = {
  cuota_por_periodo: 58000, deuda_total: 616500,
  created_at: "2026-07-14T16:48:07Z", cubre_periodo_hasta: null as string | null,
};

describe("JUAN CARLOS — las cuotas del convenio de las semanas guardadas se corren, no se perdonan", () => {
  it("sin rodar, al 24-ago el arrastre exige 6 cuotas ($348.000) — la cifra real de la pantalla", () => {
    const r = loQueDebe(JUAN_CARLOS, [], [], CONV_JC, D("2026-08-24"));
    expect(r.acuerdo).toMatchObject({ toca: 348000, falta: 348000 });
  });

  it("con 2 períodos rodados, exige 4 cuotas ($232.000) — las otras 2 van al final", () => {
    const r = loQueDebe(JUAN_CARLOS, [], [], { ...CONV_JC, periodos_exonerados: 2 }, D("2026-08-24"));
    expect(r.acuerdo).toMatchObject({ toca: 232000, falta: 232000 });
  });

  it("rodar NO perdona: con el tiempo la exigencia igual alcanza el total del convenio", () => {
    // Meses después, el acumulado exigido llega al tope de deuda_total aunque haya exonerados
    // — la curva se corrió, el total se paga completo (mismo principio que la mig 078).
    const r = loQueDebe(JUAN_CARLOS, [], [], { ...CONV_JC, periodos_exonerados: 2 }, D("2027-01-25"));
    expect(r.acuerdo?.toca).toBe(616500);
  });

  it("exonerar más períodos de los exigidos deja la exigencia en cero, nunca negativa", () => {
    const r = loQueDebe(JUAN_CARLOS, [], [], { ...CONV_JC, periodos_exonerados: 50 }, D("2026-08-24"));
    expect(r.acuerdo).toMatchObject({ toca: 0, falta: 0 });
  });
});
