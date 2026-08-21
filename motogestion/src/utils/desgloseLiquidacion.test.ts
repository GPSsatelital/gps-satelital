import { describe, it, expect } from "vitest";
import { desgloseDeudas } from "./desgloseLiquidacion";

// El documento de liquidación se FIRMA. Si el total y sus renglones no coinciden, el cliente
// firma una cuenta que no cuadra a la vista.

describe("el total nunca puede separarse de sus renglones", () => {
  it("la suma de los renglones ES el total", () => {
    const d = desgloseDeudas({
      manuales: [{ concepto: "Multa por recolección", monto: 20000 }],
      porCobrar: 118000,
      ahorroDeLosDias: 16000,
      prepagadoNoUsado: 14000,
    });
    expect(d.renglones.reduce((s, r) => s + r.monto, 0)).toBe(d.total);
    expect(d.total).toBe(20000 + 118000 - 16000 - 14000);
  });

  it("caso ANTONIO MONTERROZA (LIQ-0012): los $108.000 quedan explicados", () => {
    // Antes: total $108.000 con detalle vacío — el documento mostraba $448.000 − $10.000 = $330.000,
    // que no da. Ahora cada peso del neto sale con su nombre.
    const d = desgloseDeudas({
      manuales: [], porCobrar: 124000, ahorroDeLosDias: 16000, prepagadoNoUsado: 0,
    });
    expect(d.total).toBe(108000);
    expect(d.renglones).toHaveLength(2);
    expect(d.renglones.map(r => r.concepto)).toEqual([
      "Días que rodó y no pagó",
      "Ahorro que le corresponde de esos días",
    ]);
    // 448.000 (ahorro) − 108.000 (esto) − 10.000 (daño) = 330.000. La cuenta cuadra a la vista.
    expect(448000 - d.total - 10000).toBe(330000);
  });
});

describe("lo que el cliente recupera sale con signo de crédito", () => {
  it("su ahorro de los días cobrados es NEGATIVO: se le suma, no se le resta", () => {
    const d = desgloseDeudas({ manuales: [], porCobrar: 124000, ahorroDeLosDias: 16000, prepagadoNoUsado: 0 });
    expect(d.renglones.find(r => r.concepto.startsWith("Ahorro"))!.monto).toBe(-16000);
  });

  it("lo prepagado que no usó también es crédito suyo", () => {
    const d = desgloseDeudas({ manuales: [], porCobrar: 0, ahorroDeLosDias: 0, prepagadoNoUsado: 47000 });
    expect(d.total).toBe(-47000);
  });
});

describe("los renglones del cálculo van marcados, o se cobrarían dos veces", () => {
  it("lo que pone el sistema queda con auto; lo que escribe la persona no", () => {
    const d = desgloseDeudas({
      manuales: [{ concepto: "Multa por recolección", monto: 20000 }],
      porCobrar: 50000, ahorroDeLosDias: 0, prepagadoNoUsado: 0,
    });
    expect(d.renglones.filter(r => !r.auto).map(r => r.concepto)).toEqual(["Multa por recolección"]);
    expect(d.renglones.filter(r => r.auto)).toHaveLength(1);
  });

  it("recalcular sobre las manuales da lo mismo: no se duplica", () => {
    const entrada = { porCobrar: 118000, ahorroDeLosDias: 16000, prepagadoNoUsado: 0 };
    const manuales = [{ concepto: "Multa por recolección", monto: 20000 }];
    const primera = desgloseDeudas({ manuales, ...entrada });
    // Al reabrir, el formulario precarga SOLO las que no son auto (así lo hace deudasEditables).
    const segunda = desgloseDeudas({ manuales: primera.renglones.filter(r => !r.auto), ...entrada });
    expect(segunda.total).toBe(primera.total);
    expect(segunda.renglones).toHaveLength(primera.renglones.length);
  });

  it("si se precargaran TODAS, el cliente pagaría de más — esto es lo que se evita", () => {
    const entrada = { porCobrar: 118000, ahorroDeLosDias: 16000, prepagadoNoUsado: 0 };
    const primera = desgloseDeudas({ manuales: [], ...entrada });
    const malo = desgloseDeudas({ manuales: primera.renglones, ...entrada });
    expect(malo.total).toBe(primera.total * 2);
  });
});

describe("renglones vacíos", () => {
  it("una fila del formulario sin concepto no entra a la cuenta", () => {
    const d = desgloseDeudas({
      manuales: [{ concepto: "   ", monto: 99000 }],
      porCobrar: 0, ahorroDeLosDias: 0, prepagadoNoUsado: 0,
    });
    expect(d.renglones).toHaveLength(0);
    expect(d.total).toBe(0);
  });

  it("sin ajuste ni deudas, el total es cero y no hay renglones inventados", () => {
    const d = desgloseDeudas({ manuales: [], porCobrar: 0, ahorroDeLosDias: 0, prepagadoNoUsado: 0 });
    expect(d).toEqual({ renglones: [], total: 0 });
  });
});
