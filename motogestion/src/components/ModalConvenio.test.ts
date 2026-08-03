import { describe, it, expect } from "vitest";
import { repartirConvenio } from "./ModalConvenio";

// LA REGLA DEL DUEÑO, dicha con sus palabras el 1-ago-2026:
//   "El cliente debía 345.000 y se le coloca que pague de a 55.000 en cada pago.
//    6 cuotas × 55k dan 330 y ya en la última solo tiene que pagar el restante."
//
// Se rompió una vez: al unificar el convenio de Cartera con el compartido, el compartido
// recalculaba la cuota dividiendo (345.000 ÷ 7 = 49.286) y salían montos ponderados en toda la
// cartera. Estas pruebas existen para que eso reviente en `npm test` y no en producción.

describe("repartirConvenio — fijando el VALOR de la cuota (la regla del dueño)", () => {
  it("debe 345.000 de a 55.000 → 7 cuotas: la cuota se respeta y la última es el resto", () => {
    const r = repartirConvenio(345000, "cuota", 55000);
    expect(r.cuotas).toBe(7);
    expect(r.cuota).toBe(55000);   // ← NUNCA un promedio: es lo que escribió el funcionario
    expect(r.ultima).toBe(15000);  // ← 345.000 − (55.000 × 6)
  });

  it("la suma da EXACTAMENTE la deuda: no se le cobra ni un peso de más", () => {
    const r = repartirConvenio(345000, "cuota", 55000);
    expect(r.cuota * (r.cuotas - 1) + r.ultima).toBe(345000);
    expect(r.total).toBe(345000);
  });

  it("si la deuda es múltiplo exacto de la cuota, todas quedan iguales", () => {
    const r = repartirConvenio(330000, "cuota", 55000);
    expect(r.cuotas).toBe(6);
    expect(r.cuota).toBe(55000);
    expect(r.ultima).toBe(55000);
  });

  it("cuota mayor que la deuda → una sola, y por lo que debe (no por lo tecleado)", () => {
    const r = repartirConvenio(345000, "cuota", 400000);
    expect(r.cuotas).toBe(1);
    expect(r.cuota).toBe(345000);
    expect(r.total).toBe(345000);
  });
});

describe("repartirConvenio — fijando el NÚMERO de cuotas", () => {
  it("reparte parejo y la última absorbe el redondeo", () => {
    const r = repartirConvenio(100000, "cuotas", 3);
    expect(r.cuotas).toBe(3);
    expect(r.cuota).toBe(33334);   // hacia arriba, para no quedar corto
    expect(r.ultima).toBe(33332);  // 100.000 − (33.334 × 2)
    expect(r.total).toBe(100000);
  });

  it("tampoco cobra de más al redondear", () => {
    for (const meta of [345000, 901500, 1079500, 77777]) {
      for (const n of [2, 3, 5, 7, 12, 24]) {
        const r = repartirConvenio(meta, "cuotas", n);
        expect(r.cuota * (r.cuotas - 1) + r.ultima).toBe(meta);
      }
    }
  });
});

describe("repartirConvenio — entradas inválidas no inventan nada", () => {
  it("sin deuda → todo en cero", () => {
    expect(repartirConvenio(0, "cuota", 55000)).toEqual({ cuotas: 0, cuota: 0, ultima: 0, total: 0 });
  });
  it("sin valor → todo en cero", () => {
    expect(repartirConvenio(345000, "cuotas", 0)).toEqual({ cuotas: 0, cuota: 0, ultima: 0, total: 0 });
  });
  it("valores negativos → todo en cero", () => {
    expect(repartirConvenio(-100, "cuota", -5)).toEqual({ cuotas: 0, cuota: 0, ultima: 0, total: 0 });
  });
});
