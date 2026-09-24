import { describe, it, expect } from "vitest";
import { rastroDeCubrimiento, fechasDeLaSemana, fraseDeFechas } from "./cubrimientoPago";
import type { ContratoCiclo } from "./cicloPago";

// Un contrato semanal de lunes, como el de la mayoría. `fecha_inicio_cajas` es un LUNES.
const contrato = (p: Partial<ContratoCiclo> & Record<string, unknown> = {}) => ({
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  fecha_inicio_cajas: "2026-07-27", cajas_previas: 0,
  cajas_pagadas: 0, caja_actual_pagado: 0, total_cajas: 104,
  ...p,
}) as ContratoCiclo & Record<string, unknown>;

const pago = (id: string, creado: string, tarifa: number, prorrateo = 0) =>
  ({ id, created_at: creado, estado: "Confirmado", aplicado_tarifa: tarifa, aplicado_prorrateo: prorrateo });

describe("fechasDeLaSemana — de qué fecha a qué fecha va cada semana", () => {
  it("la primera semana arranca el día en que arrancó el libro", () => {
    expect(fechasDeLaSemana(contrato(), 1)).toEqual({ desde: "2026-07-27", hasta: "2026-08-02" });
  });

  it("la tercera semana son dos lunes después", () => {
    expect(fechasDeLaSemana(contrato(), 3)).toEqual({ desde: "2026-08-10", hasta: "2026-08-16" });
  });

  it("las semanas que el contrato ya traía al migrar NO tienen fecha en nuestro calendario", () => {
    // Con 3 semanas previas, la 1, la 2 y la 3 son de antes del sistema: no se inventa una fecha.
    const c = contrato({ cajas_previas: 3 });
    expect(fechasDeLaSemana(c, 2)).toBeNull();
    expect(fechasDeLaSemana(c, 4)).toEqual({ desde: "2026-07-27", hasta: "2026-08-02" });
  });
});

describe("rastroDeCubrimiento — qué semanas tapó cada pago", () => {
  it("un pago exacto tapa una semana completa", () => {
    const c = contrato({ cajas_pagadas: 1, caja_actual_pagado: 0 });
    const r = rastroDeCubrimiento(c, [pago("p1", "2026-07-27T10:00:00Z", 202000)]);
    expect(r.confiable).toBe(true);
    expect(r.porPago.p1.semanas).toEqual([
      { numero: 1, desde: "2026-07-27", hasta: "2026-08-02", monto: 202000, completa: true },
    ]);
  });

  it("un pago grande tapa varias semanas y dice cuánto fue a cada una", () => {
    const c = contrato({ cajas_pagadas: 2, caja_actual_pagado: 50000 });
    const r = rastroDeCubrimiento(c, [pago("p1", "2026-07-27T10:00:00Z", 454000)]);
    expect(r.confiable).toBe(true);
    expect(r.porPago.p1.semanas.map(s => [s.numero, s.monto, s.completa])).toEqual([
      [1, 202000, true], [2, 202000, true], [3, 50000, false],
    ]);
  });

  it("un abono parcial no completa la semana, y el siguiente pago la termina", () => {
    const c = contrato({ cajas_pagadas: 1, caja_actual_pagado: 0 });
    const r = rastroDeCubrimiento(c, [
      pago("p1", "2026-07-27T10:00:00Z", 100000),
      pago("p2", "2026-07-29T10:00:00Z", 102000),
    ]);
    expect(r.porPago.p1.semanas[0]).toMatchObject({ numero: 1, monto: 100000, completa: false });
    expect(r.porPago.p2.semanas[0]).toMatchObject({ numero: 1, monto: 102000, completa: true });
  });

  it("las semanas previas se respetan: el primer pago tapa la que sigue, no la primera", () => {
    const c = contrato({ cajas_previas: 3, cajas_pagadas: 4 });
    const r = rastroDeCubrimiento(c, [pago("p1", "2026-08-05T10:00:00Z", 202000)]);
    expect(r.porPago.p1.semanas[0]).toMatchObject({ numero: 4, desde: "2026-07-27" });
  });

  it("el prorrateo se muestra aparte: no es una semana", () => {
    const c = contrato({ cajas_pagadas: 0, caja_actual_pagado: 0 });
    const r = rastroDeCubrimiento(c, [pago("p1", "2026-07-20T10:00:00Z", 0, 109000)]);
    expect(r.porPago.p1).toEqual({ semanas: [], prorrateo: 109000 });
  });

  // 🔴 LA PARTE MÁS IMPORTANTE: preferir callarse a decir una fecha equivocada.
  it("si el rebobinado NO cierra contra el contrato, NO devuelve fechas", () => {
    // El caso real de IEW50I: el libro dice más semanas de las que la plata explica.
    const c = contrato({ cajas_previas: 3, cajas_pagadas: 9, caja_actual_pagado: 78000 });
    const r = rastroDeCubrimiento(c, [pago("p1", "2026-08-05T10:00:00Z", 1066000)]);
    expect(r.confiable).toBe(false);
    expect(r.porPago).toEqual({});          // se calla
    expect(r.descuadre).toBeLessThan(0);    // y dice cuánto no cerró
  });

  it("el orden es por cuándo se DIGITÓ, no por la fecha del pago", () => {
    const c = contrato({ cajas_pagadas: 2 });
    const r = rastroDeCubrimiento(c, [
      pago("tarde", "2026-08-20T10:00:00Z", 202000),
      pago("temprano", "2026-08-01T10:00:00Z", 202000),
    ]);
    expect(r.porPago.temprano.semanas[0].numero).toBe(1);
    expect(r.porPago.tarde.semanas[0].numero).toBe(2);
  });
});

describe("fraseDeFechas — cómo se lee en pantalla", () => {
  it("dentro del mismo mes no repite el mes", () => {
    expect(fraseDeFechas("2026-09-08", "2026-09-14")).toBe("del 8 al 14 de septiembre");
  });

  it("cuando cruza de mes lo dice completo", () => {
    expect(fraseDeFechas("2026-09-29", "2026-10-05")).toBe("del 29 de septiembre al 5 de octubre");
  });

  it("sin fechas no inventa nada", () => {
    expect(fraseDeFechas("", "")).toBe("");
  });
});
