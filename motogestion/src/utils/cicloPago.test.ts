import { describe, it, expect } from "vitest";
import {
  prorrateoExigibleHoy,
  estadoCarteraV2,
  valorPeriodoReal,
  cajasExigidasHasta,
  huecoCuotasHoy,
  calcularEstadoCartera,
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
