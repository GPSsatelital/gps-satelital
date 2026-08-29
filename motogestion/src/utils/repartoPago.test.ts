import { describe, it, expect } from "vitest";
import { repartirPagoV2, fechaConGraciaPrepago } from "./repartoPago";

// ═══════════════════════════════════════════════════════════════════════════════════════════
// PASO 1 DEL TOPE DEL PAQUETE: la FOTOGRAFÍA de cómo reparte el motor HOY.
//
// Método que fijó el dueño el 24-ago para tocar `aplicar_pago_confirmado` (la función que
// reparte cada peso que entra): "batería de pruebas del comportamiento ACTUAL primero, función
// leída VIVA, espejo SQL↔TS. NO es parche de una noche."
//
// Estas pruebas describen lo que el motor hace HOY — DEFECTO INCLUIDO. No son el objetivo; son
// la red. Cuando en el paso 2 se ponga el freno al convenio, las marcadas 🔴 tienen que cambiar
// y TODAS LAS DEMÁS deben quedar exactamente igual. Si alguna otra se mueve, el cambio rompió
// algo que hoy funciona.
//
// Contrato de referencia: DANIEL JOSÉ MILLÁN (RLT87H), verificado contra producción el 29-ago.
//   semana $195.000 (ahorro $26.000) · convenio $542.000 en 16 cuotas de $35.000 · paga LUNES
//   → su PAQUETE semanal es $230.000.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const CAJA = 195_000;
const AHORRO_CAJA = 26_000;   // 6×$4.000 + $2.000 del domingo
const CUOTA_CONV = 35_000;
const PAQUETE = CAJA + CUOTA_CONV;

/** El contrato de DANIEL. `cajasExigidas` es lo que devuelve el motor para la fecha del pago. */
function daniel(over: Partial<Parameters<typeof repartirPagoV2>[0]> = {}) {
  return {
    monto: PAQUETE,
    cajaValor: CAJA,
    cajaAhorro: AHORRO_CAJA,
    cajasPagadas: 56,
    cajaActualPagado: 0,
    totalCajas: 104,
    cajasExigidas: 57,          // le toca la semana en curso
    convenioPendiente: 411_000, // lo que le falta al convenio
    convenioExigido: 105_000,   // 3 cuotas exigidas al 29-ago (verificado contra producción)
    convenioAbonado: 70_000,    // 2 cuotas ya abonadas → puede recibir 1 más
    ...over,
  };
}

describe("orden del reparto — la columna vertebral, esto NO puede cambiar", () => {
  it("prorrateo → cajas → deudas → convenio → saldo", () => {
    const r = repartirPagoV2(daniel({
      monto: 1_000_000,
      prorrateoTotal: 50_000, prorrateoPagado: 0, prorrateoAhorro: 6_000,
      deudas: [{ montoPendiente: 100_000 }],
      cajasExigidas: 58,        // dos cajas exigidas
    }));
    expect(r.prorrateo).toBe(50_000);
    expect(r.tarifa).toBe(390_000);              // 2 cajas
    expect(r.deuda).toBe(100_000);
    expect(r.prorrateo + r.tarifa + r.deuda + r.convenio + r.saldo).toBe(1_000_000);
  });

  it("con la semana descubierta, ni un peso llega al convenio", () => {
    const r = repartirPagoV2(daniel({ monto: 100_000 }));
    expect(r.tarifa).toBe(100_000);
    expect(r.convenio).toBe(0);
  });

  it("la deuda se cobra ANTES que el convenio", () => {
    const r = repartirPagoV2(daniel({ monto: 300_000, deudas: [{ montoPendiente: 80_000 }] }));
    expect(r.tarifa).toBe(195_000);
    expect(r.deuda).toBe(80_000);
    expect(r.convenio).toBe(25_000);
  });

  it("con el contrato suspendido, la multa de recolección va de PRIMERAS", () => {
    const r = repartirPagoV2(daniel({
      monto: 100_000, contratoSuspendido: true,
      deudas: [{ montoPendiente: 300_000 }, { montoPendiente: 20_000, esMulta: true }],
    }));
    expect(r.deuda).toBe(20_000);   // solo la multa
    expect(r.tarifa).toBe(80_000);  // el resto sí entra a la semana
  });

  it("nunca se reparte más de lo que entró", () => {
    for (const monto of [1, 35_000, 195_000, 230_000, 460_000, 999_999]) {
      const r = repartirPagoV2(daniel({ monto }));
      expect(r.prorrateo + r.tarifa + r.deuda + r.convenio + r.saldo).toBe(monto);
    }
  });
});

describe("el freno de las cajas — este YA existe y debe seguir igual", () => {
  it("el excedente NO llena cajas futuras", () => {
    // Le exigen 1 caja y paga 3. Solo se llena la exigida.
    const r = repartirPagoV2(daniel({ monto: 585_000, cajasExigidas: 57, convenioPendiente: 0 }));
    expect(r.tarifa).toBe(195_000);
    expect(r.cajasPagadas).toBe(57);
    expect(r.saldo).toBe(390_000);
  });

  it("ponerse al día con varias semanas atrasadas SÍ se puede — no es adelanto", () => {
    const r = repartirPagoV2(daniel({ monto: 585_000, cajasExigidas: 59, convenioPendiente: 0 }));
    expect(r.tarifa).toBe(585_000);
    expect(r.cajasPagadas).toBe(59);
  });

  it("no pasa del total de cajas del contrato", () => {
    const r = repartirPagoV2(daniel({
      monto: 585_000, cajasPagadas: 103, totalCajas: 104, cajasExigidas: 110, convenioPendiente: 0,
    }));
    expect(r.cajasPagadas).toBe(104);
    expect(r.tarifa).toBe(195_000);
    expect(r.saldo).toBe(390_000);
  });

  it("el ahorro son los ÚLTIMOS pesos de la caja (tarifa primero), no una proporción", () => {
    expect(repartirPagoV2(daniel({ monto: 100_000, convenioPendiente: 0 })).ahorro).toBe(0);
    expect(repartirPagoV2(daniel({ monto: 169_000, convenioPendiente: 0 })).ahorro).toBe(0);
    expect(repartirPagoV2(daniel({ monto: 180_000, convenioPendiente: 0 })).ahorro).toBe(11_000);
    expect(repartirPagoV2(daniel({ monto: 195_000, convenioPendiente: 0 })).ahorro).toBe(26_000);
  });

  it("el adelanto de la base llena su caja aunque no esté exigida, y no paga prorrateo", () => {
    const r = repartirPagoV2(daniel({
      monto: 195_000, tipoRegistro: "adelanto_base",
      cajasExigidas: 56, prorrateoTotal: 50_000, prorrateoPagado: 0,
    }));
    expect(r.prorrateo).toBe(0);
    expect(r.tarifa).toBe(195_000);
    expect(r.cajasPagadas).toBe(57);
  });
});

describe("✅ EL FRENO — el convenio solo recibe lo EXIGIDO, nunca se lo traga todo", () => {
  it("DANIEL, sábado 29-ago: con la ventana de prepago su paquete se reparte PAREJO", () => {
    // Antes: los $230.000 completos al convenio (6 cuotas y media de golpe), y el lunes 31
    // aparecía debiendo su semana habiendo pagado dos días antes.
    // Ahora: la ventana de gracia hace que el sábado cuente la caja del lunes (cajasExigidas 57),
    // y el freno impide que el convenio tome más de lo exigido.
    const r = repartirPagoV2(daniel({
      monto: PAQUETE,
      cajasExigidas: 57,                                   // con los 3 días de gracia
      convenioExigido: 140_000, convenioAbonado: 105_000,  // le falta 1 cuota
    }));
    expect(r.tarifa).toBe(195_000);
    expect(r.convenio).toBe(35_000);
    expect(r.ahorro).toBe(26_000);   // el ahorro que antes perdía
    expect(r.saldo).toBe(0);
  });

  it("el convenio YA NO se traga su saldo completo aunque el pago alcance", () => {
    const r = repartirPagoV2(daniel({
      monto: 700_000, cajasExigidas: 57, convenioPendiente: 411_000,
      convenioExigido: 105_000, convenioAbonado: 70_000,
    }));
    expect(r.tarifa).toBe(195_000);
    expect(r.convenio).toBe(35_000);   // solo la cuota que le faltaba, no los $411.000
    expect(r.saldo).toBe(470_000);     // el resto queda a favor, para aplicarlo a mano
  });

  it("ponerse al día en el convenio SÍ se puede — no es adelanto (regla del dueño, 24-ago)", () => {
    // Le deben 3 cuotas y no ha abonado ninguna: las cubre todas de una.
    const r = repartirPagoV2(daniel({
      monto: 195_000 + 3 * CUOTA_CONV, cajasExigidas: 57,
      convenioExigido: 105_000, convenioAbonado: 0,
    }));
    expect(r.tarifa).toBe(195_000);
    expect(r.convenio).toBe(105_000);
    expect(r.saldo).toBe(0);
  });

  it("con el convenio al día, lo que sobra NO se le mete: queda a favor", () => {
    const r = repartirPagoV2(daniel({
      monto: 500_000, cajasExigidas: 57,
      convenioExigido: 105_000, convenioAbonado: 105_000,   // ya está al día
    }));
    expect(r.tarifa).toBe(195_000);
    expect(r.convenio).toBe(0);
    expect(r.saldo).toBe(305_000);
  });

  it("el saldo a favor aplicado ya no se lo traga el convenio", () => {
    const r = repartirPagoV2(daniel({
      monto: 17_000, cajasExigidas: 57, convenioExigido: 105_000, convenioAbonado: 105_000,
    }));
    expect(r.convenio).toBe(0);
    expect(r.tarifa).toBe(17_000);   // abona a su semana, que es lo que el cliente espera
  });

  it("sin convenio no cambia nada: semana y después deuda", () => {
    const r = repartirPagoV2(daniel({
      monto: 300_000, cajasExigidas: 57, convenioPendiente: 0, convenioExigido: 0,
      deudas: [{ montoPendiente: 80_000 }],
    }));
    expect(r.tarifa).toBe(195_000);
    expect(r.deuda).toBe(80_000);
    expect(r.saldo).toBe(25_000);
  });
});

describe("la ventana de prepago — pagar unos días antes es pagar a tiempo", () => {
  it("suma los 3 días de gracia a la fecha del pago", () => {
    expect(fechaConGraciaPrepago("2026-08-29")).toBe("2026-09-01");  // sábado → cubre el lunes
    expect(fechaConGraciaPrepago("2026-08-31")).toBe("2026-09-03");
  });

  it("cubre el caso de DANIEL: sábado 29 alcanza su lunes 31", () => {
    expect(fechaConGraciaPrepago("2026-08-29") >= "2026-08-31").toBe(true);
  });

  it("NO alcanza a la semana subsiguiente: no adelanta de más", () => {
    expect(fechaConGraciaPrepago("2026-08-29") < "2026-09-07").toBe(true);
  });

  it("una fecha rara no revienta", () => {
    expect(fechaConGraciaPrepago("no-es-fecha")).toBe("no-es-fecha");
  });
});

describe("DANIEL, sus pagos reales de agosto — el reparto correcto", () => {
  it("8, 15 y 24-ago (lunes, su día): el paquete se repartió PAREJO", () => {
    const r = repartirPagoV2(daniel({
      monto: PAQUETE, cajasExigidas: 57, convenioExigido: 140_000, convenioAbonado: 105_000,
    }));
    expect(r).toMatchObject({ tarifa: 195_000, convenio: 35_000, ahorro: 26_000, saldo: 0 });
  });

  it("1-ago ($169.000): a deuda y el resto a favor — ese día AÚN NO existía el convenio", () => {
    // Su convenio se creó ese mismo 1-ago a las 19:22 y este pago entró a las 14:41. Sin convenio
    // vivo los $17.000 quedaron a su favor; con convenio y SIN freno se los habría tragado.
    const r = repartirPagoV2(daniel({
      monto: 169_000, cajasExigidas: 56, convenioPendiente: 0, convenioExigido: 0,
      deudas: [{ montoPendiente: 152_000 }],
    }));
    expect(r.deuda).toBe(152_000);
    expect(r.saldo).toBe(17_000);
  });
});
