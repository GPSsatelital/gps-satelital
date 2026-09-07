import { describe, it, expect } from "vitest";
import { cajasExigidasHasta, diasEnMoraV2, huecoCuotasHoy, type ContratoCiclo } from "./cicloPago";

// EL CASO (medido el 7-sep-2026): DANIEL DIAZ CARDONA, RNG53H. La moto se le entregó a MARLON el
// 10 de agosto, pero su contrato seguía exigiendo cajas cada semana. Eran 12 clientes y
// $9.082.000 cobrados de más.
const DANIEL: ContratoCiclo = {
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 195000,
  motor_v2: true, fecha_inicio_cajas: "2026-07-01",
  cajas_previas: 35, cajas_pagadas: 35, caja_actual_pagado: 0, total_cajas: 104,
  es_migrado: true,
};
const HOY = new Date("2026-09-07T00:00:00");
const ENTREGADA_A_OTRO = "2026-08-10";

describe("el contador para cuando la moto ya es de otro", () => {
  it("sin freno, sigue exigiendo cajas hasta hoy", () => {
    expect(cajasExigidasHasta(DANIEL, HOY)).toBe(45);
  });

  it("con freno, no cuenta ni un día después de que la moto pasó a otro", () => {
    const parado = { ...DANIEL, fecha_fin_cobro: ENTREGADA_A_OTRO };
    expect(cajasExigidasHasta(parado, HOY)).toBe(41);
  });

  it("da igual cuánto tiempo pase: el número ya no crece", () => {
    const parado = { ...DANIEL, fecha_fin_cobro: ENTREGADA_A_OTRO };
    const enUnAño = cajasExigidasHasta(parado, new Date("2027-09-07T00:00:00"));
    expect(enUnAño).toBe(cajasExigidasHasta(parado, HOY));
  });

  it("antes de esa fecha cuenta igual que siempre: el tiempo guardado sí se le cobra", () => {
    const parado = { ...DANIEL, fecha_fin_cobro: ENTREGADA_A_OTRO };
    const antes = new Date("2026-08-03T00:00:00");
    expect(cajasExigidasHasta(parado, antes)).toBe(cajasExigidasHasta(DANIEL, antes));
  });

  it("lo que se le cobra de cuotas deja de crecer", () => {
    const parado = { ...DANIEL, fecha_fin_cobro: ENTREGADA_A_OTRO };
    const hueco = huecoCuotasHoy(parado, HOY);
    expect(hueco).toBe((41 - 35) * 195000);
    expect(huecoCuotasHoy(parado, new Date("2027-01-01T00:00:00"))).toBe(hueco);
  });

  it("los días de mora también dejan de crecer", () => {
    const parado = { ...DANIEL, fecha_fin_cobro: ENTREGADA_A_OTRO };
    const d1 = diasEnMoraV2(parado, HOY);
    const d2 = diasEnMoraV2(parado, new Date("2026-12-07T00:00:00"));
    expect(d2).toBe(d1);
  });

  it("un contrato normal (sin freno) no cambia en nada", () => {
    expect(cajasExigidasHasta({ ...DANIEL, fecha_fin_cobro: null }, HOY)).toBe(45);
    expect(cajasExigidasHasta({ ...DANIEL, fecha_fin_cobro: undefined }, HOY)).toBe(45);
  });

  it("un freno con fecha futura no adelanta nada", () => {
    const futuro = { ...DANIEL, fecha_fin_cobro: "2027-01-01" };
    expect(cajasExigidasHasta(futuro, HOY)).toBe(45);
  });
});
