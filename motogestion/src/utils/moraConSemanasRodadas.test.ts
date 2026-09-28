import { describe, it, expect } from "vitest";
import {
  diasEnMoraV2, estadoCarteraV2, desgloseExigible, loQueDebe, calcularEstadoCartera, diasEnMora,
  type ContratoCiclo,
} from "./cicloPago";

// LOS DÍAS DE MORA CON SEMANAS RODADAS (28-sep-2026).
//
// Rodar corre la curva de exigencia N semanas (mig 078): el MONTO ya lo sabía, pero la cuenta de
// "desde cuándo debe" y las fechas de cada semana no restaban las rodadas. Resultado: 13 de los 16
// clientes con semanas rodadas salían con más días de mora de los reales, y 6 de ellos en mora
// cuando en realidad les tocaba pagar ese mismo día. A 4 les salió el mensaje de mora de ZALA.
// Los casos de abajo son los reales, con sus cifras de producción del 28-sep.

const D = (iso: string) => new Date(iso + "T12:00:00");

// ── ELKIN CARDALES (DPU43I) ────────────────────────────────────────────────────
// Retenido el 30-ago, se le devolvió la moto el 18-sep y se le rodaron las 2 semanas completas
// que estuvo guardada. El 21-sep completó su semana. El lunes 28 le toca la siguiente: está
// pagando hoy, no "13 días en mora" como decía la pantalla.
const ELKIN: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 25, caja_actual_pagado: 0, cajas_previas: 18,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  cajas_exoneradas: 2,
};
const EXCEL_VIEJO_ELKIN = [{ monto: 337000, monto_pendiente: 202000, created_at: "2026-07-31T23:55:02Z" }];

// ── KEVIN LUNA (RLY45H) ────────────────────────────────────────────────────────
// D-010: la empresa asumió su semana del 21 al 27 (exoneradas 0→1, total 100→99). La pantalla
// decía que estaba en mora justo DESDE el 21 — la semana que no se le iba a cobrar nunca.
const KEVIN: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
  es_migrado: true, motor_v2: true,
  total_cajas: 99, cajas_pagadas: 49, caja_actual_pagado: 0, cajas_previas: 41,
  prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-07-27",
  cajas_exoneradas: 1,
};

describe("ELKIN — con 2 semanas rodadas, el lunes 28 le toca pagar: no está en mora", () => {
  it("días desde la semana más vieja sin pagar: 0 (se le exige hoy), no 14", () => {
    expect(diasEnMoraV2(ELKIN, D("2026-09-28"))).toBe(0);
  });

  it("estado: paga hoy (al día), no mora", () => {
    expect(estadoCarteraV2(ELKIN, D("2026-09-28"))).toBe("al-dia");
    expect(calcularEstadoCartera(ELKIN, [], D("2026-09-28"), 0, false, null, EXCEL_VIEJO_ELKIN)).toBe("al-dia");
  });

  it("la semana que debe es la del 28-sep y la próxima la del 5-oct (antes decía 14-sep y 21-sep)", () => {
    const d = desgloseExigible(ELKIN, D("2026-09-28"));
    expect(d.periodos).toEqual([{ fecha: "2026-09-28", monto: 202000, diasVencida: 0, parcial: false }]);
    expect(d.proximaFecha).toBe("2026-10-05");
  });

  it("la secuencia de siempre sigue: martes gabela, miércoles mora con 1 día", () => {
    expect(estadoCarteraV2(ELKIN, D("2026-09-29"))).toBe("gabela");
    expect(estadoCarteraV2(ELKIN, D("2026-09-30"))).toBe("mora");
    expect(diasEnMora(ELKIN, [], D("2026-09-30"))).toBe(1);
  });

  it("el MONTO no cambia: su semana $202.000 + el Excel viejo $202.000 = $404.000", () => {
    const r = loQueDebe(ELKIN, [{ fecha: "2026-09-21", valor: 202000 }], EXCEL_VIEJO_ELKIN, null, D("2026-09-28"));
    expect(r.cuota).toEqual({ toca: 202000, pagado: 0, falta: 202000 });
    expect(r.deudas.falta).toBe(202000);
    expect(r.totalFalta).toBe(404000);
  });

  it("sin las semanas rodadas la cuenta vieja sigue igual: debería 3 semanas desde el 14-sep", () => {
    const sinRodar = { ...ELKIN, cajas_exoneradas: 0 };
    expect(diasEnMoraV2(sinRodar, D("2026-09-28"))).toBe(14);
    expect(desgloseExigible(sinRodar, D("2026-09-28")).periodos.map(p => p.fecha))
      .toEqual(["2026-09-14", "2026-09-21", "2026-09-28"]);
  });
});

describe("KEVIN — la semana que asumió la empresa no le cuenta como mora", () => {
  it("el lunes 28 le toca su semana: 0 días, paga hoy", () => {
    expect(diasEnMoraV2(KEVIN, D("2026-09-28"))).toBe(0);
    expect(estadoCarteraV2(KEVIN, D("2026-09-28"))).toBe("al-dia");
  });

  it("la semana que debe es la del 28-sep, por $195.000", () => {
    const d = desgloseExigible(KEVIN, D("2026-09-28"));
    expect(d.periodos).toEqual([{ fecha: "2026-09-28", monto: 195000, diasVencida: 0, parcial: false }]);
    expect(d.proximaFecha).toBe("2026-10-05");
  });

  it("el martes 22, con la semana del 21 asumida, estaba al día", () => {
    expect(estadoCarteraV2(KEVIN, D("2026-09-22"))).toBe("al-dia");
    expect(desgloseExigible(KEVIN, D("2026-09-22")).proximaFecha).toBe("2026-09-28");
  });
});
