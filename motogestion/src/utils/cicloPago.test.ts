import { describe, it, expect } from "vitest";
import {
  prorrateoExigibleHoy,
  estadoCarteraV2,
  valorPeriodoReal,
  cajasExigidasHasta,
  huecoCuotasHoy,
  calcularEstadoCartera,
  cuotaConvenioDelPeriodo,
  fechaCubrePeriodo,
  type ContratoCiclo,
} from "./cicloPago";

// Batería de pruebas del MOTOR DE DINERO (cicloPago.ts). Cada caso es una situación REAL que
// ya diagnosticamos y arreglamos; su "respuesta correcta" es conocida. Si un cambio futuro
// rompe cualquiera de estas cuentas, `npm test` lo grita ANTES de desplegar a producción.
//
// Julio 2026: 11=Sáb, 13=Lun, 14=Mar, 15=Mié, 20=Lun, 21=Mar, 22=Mié, 27=Lun.
const D = (dia: number) => new Date(2026, 6, dia); // mes 6 = julio (0-indexed)

// ── ESMEIRO (IGC50I) — contrato nuevo bien nacido ──────────────────────────────
// Semanal, paga lunes, entregado el mar 14. La semana adelantada de la base ya está
// pagada (caja 1). El prorrateo ($171.000, Caja 0) se paga el PRIMER día de pago = lun 20.
const ESMEIRO: ContratoCiclo = {
  forma_pago: "Semanal",
  dia_pago: "Lunes",
  fecha_entrega: "2026-07-14",
  valor_semanal: 202000,
  motor_v2: true,
  total_cajas: 104,
  cajas_pagadas: 1,
  caja_actual_pagado: 0,
  cajas_previas: 0,
  prorrateo_total: 171000,
  prorrateo_pagado: 0,
  fecha_inicio_cajas: "2026-07-20",
};

// ── SERAFIN (IGC39I) — igual pero su primer día de pago ya pasó (lun 13) ────────
const SERAFIN: ContratoCiclo = {
  ...ESMEIRO,
  fecha_entrega: "2026-07-11",
  prorrateo_total: 47000,
  fecha_inicio_cajas: "2026-07-13",
};

describe("prorrateoExigibleHoy — el prorrateo (Caja 0) no se exige ANTES de fecha_inicio_cajas", () => {
  it("antes del primer día de pago (mié 15) → 0 (no debe nada aún)", () => {
    expect(prorrateoExigibleHoy(ESMEIRO, D(15))).toBe(0);
  });
  it("el primer día de pago (lun 20) → se exige $171.000", () => {
    expect(prorrateoExigibleHoy(ESMEIRO, D(20))).toBe(171000);
  });
  it("después del primer día (mar 21) → sigue exigible $171.000", () => {
    expect(prorrateoExigibleHoy(ESMEIRO, D(21))).toBe(171000);
  });
  it("si ya pagó el prorrateo → 0", () => {
    expect(prorrateoExigibleHoy({ ...ESMEIRO, prorrateo_pagado: 171000 }, D(20))).toBe(0);
  });
});

describe("estadoCarteraV2 — secuencia día de pago → gabela → mora (bug del 'gabela día-0')", () => {
  it("antes del primer día de pago (mié 15) → al-dia", () => {
    expect(estadoCarteraV2(ESMEIRO, D(15))).toBe("al-dia");
  });
  it("EL DÍA de pago (lun 20) → al-dia / 'paga hoy' (NUNCA gabela el mismo día)", () => {
    expect(estadoCarteraV2(ESMEIRO, D(20))).toBe("al-dia");
  });
  it("un día después (mar 21) → gabela", () => {
    expect(estadoCarteraV2(ESMEIRO, D(21))).toBe("gabela");
  });
  it("dos días después (mié 22) → mora", () => {
    expect(estadoCarteraV2(ESMEIRO, D(22))).toBe("mora");
  });
  it("SERAFIN (su lunes 13 ya pasó, hoy mié 15) → mora", () => {
    expect(estadoCarteraV2(SERAFIN, D(15))).toBe("mora");
  });
});

describe("cajasExigidasHasta — cuántas cajas se exigen a una fecha", () => {
  it("antes de fecha_inicio_cajas → 0", () => {
    expect(cajasExigidasHasta(ESMEIRO, D(15))).toBe(0);
  });
  it("el primer día de pago → 1", () => {
    expect(cajasExigidasHasta(ESMEIRO, D(20))).toBe(1);
  });
  it("una semana después → 2", () => {
    expect(cajasExigidasHasta(ESMEIRO, D(27))).toBe(2);
  });
  it("migrado sin fecha_inicio_cajas → devuelve cajas_previas", () => {
    const migrado: ContratoCiclo = { ...ESMEIRO, fecha_inicio_cajas: null, cajas_previas: 30 };
    expect(cajasExigidasHasta(migrado, D(20))).toBe(30);
  });
});

// RODAR TIEMPO (mig 078). Antes "rodar" solo movía `fecha_fin_contrato`, que es informativa:
// las cajas se le seguían exigiendo igual, o sea que el botón NO HACÍA NADA. Ahora se exoneran
// cajas enteras de la exigencia — se corren al final, no se perdonan.
describe("cajasExigidasHasta — rodar tiempo al final (cajas_exoneradas)", () => {
  it("sin rodar nada → el resultado no cambia (los contratos vivos siguen igual)", () => {
    expect(cajasExigidasHasta({ ...ESMEIRO, cajas_exoneradas: 0 }, D(27))).toBe(2);
  });
  it("con 1 período rodado → hoy se le exige una caja MENOS", () => {
    expect(cajasExigidasHasta({ ...ESMEIRO, cajas_exoneradas: 1 }, D(27))).toBe(1);
  });
  it("NO se perdonan: una semana más tarde vuelve al mismo número (se corrió, no se borró)", () => {
    const rodado: ContratoCiclo = { ...ESMEIRO, cajas_exoneradas: 1 };
    expect(cajasExigidasHasta(rodado, new Date("2026-08-03T00:00:00"))).toBe(2);
  });
  it("nunca da negativo aunque se ruede de más", () => {
    expect(cajasExigidasHasta({ ...ESMEIRO, cajas_exoneradas: 99 }, D(27))).toBe(0);
  });
  // EL CASO QUE PROTEGE EL DISEÑO: la resta va ANTES del tope de total_cajas. Si fuera después,
  // las exigidas nunca pasarían de (104 − 2) y el contrato NUNCA podría terminar.
  it("el contrato IGUAL puede completarse: a 2 años vista llega a las 104 cajas", () => {
    const rodado: ContratoCiclo = { ...ESMEIRO, cajas_exoneradas: 2 };
    expect(cajasExigidasHasta(rodado, new Date("2028-12-31T00:00:00"))).toBe(104);
  });
});

describe("huecoCuotasHoy — cuánto debe de CUOTAS hoy (prorrateo + cajas)", () => {
  it("ESMEIRO antes del primer pago → $0 (al día)", () => {
    expect(huecoCuotasHoy(ESMEIRO, D(15))).toBe(0);
  });
  it("ESMEIRO el día del prorrateo → $171.000", () => {
    expect(huecoCuotasHoy(ESMEIRO, D(20))).toBe(171000);
  });
  it("SERAFIN con su prorrateo vencido → $47.000", () => {
    expect(huecoCuotasHoy(SERAFIN, D(15))).toBe(47000);
  });
});

describe("valorPeriodoReal — el valor de una caja según la modalidad (NUNCA total/7)", () => {
  it("Semanal → el valor semanal tal cual", () => {
    expect(valorPeriodoReal({ forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000 })).toBe(202000);
  });
  it("Quincenal → 2 semanas + 1 día L-S = $435.000", () => {
    expect(valorPeriodoReal({ forma_pago: "Quincenal", dia_pago: "Lunes", valor_semanal: 202000, tarifa_diaria: 27000, ahorro_diario: 4000 })).toBe(435000);
  });
  it("Mensual → 4 semanas + 2 días L-S = $870.000", () => {
    expect(valorPeriodoReal({ forma_pago: "Mensual", dia_pago: "Lunes", valor_semanal: 202000, tarifa_diaria: 27000, ahorro_diario: 4000 })).toBe(870000);
  });
});

describe("calcularEstadoCartera — convenio que cubre el período NO cobra doble (caso JULIO)", () => {
  it("con periodoCubierto=true → al-dia aunque el ledger tenga hueco", () => {
    expect(calcularEstadoCartera(ESMEIRO, [], D(22), 0, true)).toBe("al-dia");
  });
  it("sin cubrir (periodoCubierto=false) → sí cae en mora el mié 22", () => {
    expect(calcularEstadoCartera(ESMEIRO, [], D(22), 0, false)).toBe("mora");
  });
});

// Bug real encontrado el 26-jul con DIEGO LOCIN SOTO (XZI10H): sus cuotas estaban al día,
// pero debía la cuota del convenio de $100.000 y el semáforo decía "Al día". La rama del
// motor v2 ignoraba `cuotaConvenio` por completo, así que quien dejaba de pagar su convenio
// nunca aparecía en mora ni en el panel del día — aunque la misma pantalla se lo cobrara.
describe("calcularEstadoCartera — el convenio también cuenta para la mora (motor v2)", () => {
  // Contrato con las cuotas al día: 2 cajas exigidas y 2 pagadas al mié 22.
  const AL_DIA: ContratoCiclo = {
    forma_pago: "Semanal",
    dia_pago: "Miércoles",
    fecha_entrega: "2026-07-01",
    valor_semanal: 202000,
    motor_v2: true,
    total_cajas: 104,
    cajas_pagadas: 4,
    caja_actual_pagado: 0,
    cajas_previas: 0,
    prorrateo_total: 0,
    prorrateo_pagado: 0,
    fecha_inicio_cajas: "2026-07-01",
  };

  it("sin convenio → al día", () => {
    expect(calcularEstadoCartera(AL_DIA, [], D(22))).toBe("al-dia");
  });

  it("con cuota de convenio SIN abonar → ya no dice 'al día'", () => {
    expect(calcularEstadoCartera(AL_DIA, [], D(24), 100000)).toBe("mora");
  });

  it("con la cuota del convenio ABONADA en el período → al día", () => {
    const pagos = [{ fecha: "2026-07-22", valor: 302000, aplicado_convenio: 100000 }];
    expect(calcularEstadoCartera(AL_DIA, pagos, D(24), 100000)).toBe("al-dia");
  });

  it("abono parcial del convenio → sigue sin estar al día", () => {
    const pagos = [{ fecha: "2026-07-22", valor: 252000, aplicado_convenio: 50000 }];
    expect(calcularEstadoCartera(AL_DIA, pagos, D(24), 100000)).toBe("mora");
  });

  it("el mismo día de pago con el convenio pendiente → 'paga hoy', no mora", () => {
    expect(calcularEstadoCartera(AL_DIA, [], D(22), 100000)).toBe("al-dia");
  });

  it("un día después → gabela", () => {
    expect(calcularEstadoCartera(AL_DIA, [], D(23), 100000)).toBe("gabela");
  });
});

// ── MARTHA ÁLVAREZ (RLT68H) — el convenio que se tragó semanas ────────────────
// Reportado por el dueño el 7-ago-2026: su convenio absorbió las semanas hasta el 17-ago,
// pero el sistema le seguía pidiendo los $50.000 de la cuota el 6-ago.
//
// REGLA DEL DUEÑO, textual: "que pague convenio cuando termine las semanas absorbidas — si se
// absorbe una, en esa semana no paga, sino hasta que se le vence".
//
// Semanal, paga LUNES. Agosto 2026: 3=Lun, 10=Lun, 17=Lun, 24=Lun.
const MARTHA: ContratoCiclo = {
  forma_pago: "Semanal",
  dia_pago: "Lunes",
  fecha_entrega: "2026-07-27",
  valor_semanal: 195000,
  motor_v2: true,
  total_cajas: 104,
  cajas_pagadas: 52,
  caja_actual_pagado: 0,
  cajas_previas: 51,
  fecha_inicio_cajas: "2026-07-27",
};
const CONV_MARTHA = { cuota_por_periodo: 50000, created_at: "2026-07-31T16:40:00Z", cubre_periodo_hasta: "2026-08-17" };
const A = (dia: number) => new Date(2026, 7, dia); // mes 7 = agosto

describe("cuotaConvenioDelPeriodo — el convenio no cobra mientras cubre semanas", () => {
  it("período del 3-ago (absorbido): NO cobra convenio", () => {
    expect(cuotaConvenioDelPeriodo(CONV_MARTHA, MARTHA, A(6))).toBe(0);
  });

  it("período del 10-ago (también absorbido): NO cobra convenio", () => {
    expect(cuotaConvenioDelPeriodo(CONV_MARTHA, MARTHA, A(12))).toBe(0);
  });

  it("período del 17-ago (primer día NO cubierto): ahí SÍ cobra los $50.000", () => {
    expect(cuotaConvenioDelPeriodo(CONV_MARTHA, MARTHA, A(17))).toBe(50000);
  });

  it("y sigue cobrando en los períodos siguientes", () => {
    expect(cuotaConvenioDelPeriodo(CONV_MARTHA, MARTHA, A(26))).toBe(50000);
  });

  // La regla vieja no se perdió: un convenio SIN semanas absorbidas se sigue cobrando desde el
  // período siguiente al que se creó, y nunca en uno que ya había arrancado antes.
  it("sin semanas absorbidas: cobra desde el período siguiente al que se creó", () => {
    const sinCubrir = { cuota_por_periodo: 50000, created_at: "2026-07-31T16:40:00Z", cubre_periodo_hasta: null };
    expect(cuotaConvenioDelPeriodo(sinCubrir, MARTHA, A(1))).toBe(0);   // período del 27-jul, ya había arrancado
    expect(cuotaConvenioDelPeriodo(sinCubrir, MARTHA, A(6))).toBe(50000); // período del 3-ago
  });

  it("sin convenio o con cuota en cero no cobra nada", () => {
    expect(cuotaConvenioDelPeriodo(null, MARTHA, A(20))).toBe(0);
    expect(cuotaConvenioDelPeriodo({ cuota_por_periodo: 0, created_at: "2026-07-01" }, MARTHA, A(20))).toBe(0);
  });
});

// ── JHEFERSON GARCIA SILVA (XYZ50H) — el convenio que regalaba una semana ──────
// Reportado por el dueño el 8-ago-2026: financiando 2 semanas ($404.000) la ventana ponía
// cubre_periodo_hasta = 19-ago, y CobrosView deja de exigir TODAS las cajas anteriores a esa
// fecha — o sea perdonaba TRES períodos ($606.000). Le regalaba $202.000.
//
// Paga MIÉRCOLES. Agosto 2026: 5=Mié, 12=Mié, 19=Mié, 26=Mié. Julio: 29=Mié.
// Períodos: 29jul→4ago (vencida) · 5→11ago (vencida) · 12→18ago · 19→25ago
const JHEFERSON: ContratoCiclo = {
  forma_pago: "Semanal",
  dia_pago: "Miércoles",
  fecha_entrega: "2026-07-01",
  valor_semanal: 202000,
  motor_v2: true,
  total_cajas: 104,
  cajas_pagadas: 0,
  caja_actual_pagado: 0,
  cajas_previas: 0,
  fecha_inicio_cajas: "2026-07-29",
};
const SAB_8_AGO = new Date(2026, 7, 8); // sábado, dentro del período 5→11 ago

describe("fechaCubrePeriodo — el convenio no puede perdonar más semanas de las que cobra", () => {
  it("2 vencidas y financia 2: cubre hasta el 12-ago (NO el 19 — eso regalaba una semana)", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 2, 2)).toBe("2026-08-12");
  });

  it("2 vencidas y financia 1: solo tapa la más vieja, la actual la sigue debiendo", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 1, 2)).toBe("2026-08-05");
  });

  it("cliente AL DÍA que financia 1: cubre el período que viene, como siempre", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 0 + 1, 0)).toBe("2026-08-19");
  });

  it("cliente al día que financia 2: cubre los dos que vienen", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 2, 0)).toBe("2026-08-26");
  });

  it("3 vencidas y financia 1: la cobertura queda en un período ya pasado", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 1, 3)).toBe("2026-07-29");
  });

  it("sin financiar nada no hay cobertura", () => {
    expect(fechaCubrePeriodo(JHEFERSON, SAB_8_AGO, 0, 2)).toBeNull();
  });
});
