import { describe, it, expect } from "vitest";
import { repartirPagoV2 } from "./repartoPago";

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

describe("🔴 EL DEFECTO — el convenio no tiene freno (esto es lo que cambia en el paso 2)", () => {
  it("🔴 DANIEL, sábado 29-ago: pagó su PAQUETE y se fue COMPLETO al convenio", () => {
    // Paga los lunes. El sábado no hay caja exigida (la del lunes 24 ya está paga), así que el
    // motor manda los $230.000 enteros al convenio: 6 cuotas y media de un solo golpe, y el
    // lunes 31 aparece debiendo su semana habiendo pagado dos días antes.
    const r = repartirPagoV2(daniel({ monto: PAQUETE, cajasExigidas: 56 }));
    expect(r.tarifa).toBe(0);
    expect(r.convenio).toBe(230_000);
    expect(r.ahorro).toBe(0);       // no ahorra nada, aunque pagó su semana completa
    // Lo que DEBERÍA pasar tras el paso 2:  tarifa 195.000 · convenio 35.000 · ahorro 26.000
  });

  it("🔴 el saldo a favor aplicado cae en la misma trampa", () => {
    // El mismo día se le aplicaron $17.000 de saldo a favor: también se fueron al convenio.
    const r = repartirPagoV2(daniel({ monto: 17_000, cajasExigidas: 56 }));
    expect(r.convenio).toBe(17_000);
  });

  it("🔴 pagar DOBLE no adelanta el paquete siguiente: se traga el convenio", () => {
    // $460.000 = dos paquetes. Debería quedar con dos semanas y dos cuotas cubiertas.
    const r = repartirPagoV2(daniel({ monto: 2 * PAQUETE, cajasExigidas: 57 }));
    expect(r.tarifa).toBe(195_000);   // solo la exigida
    expect(r.convenio).toBe(265_000); // el resto entero al convenio ← el defecto
    expect(r.saldo).toBe(0);
    // Tras el paso 2:  tarifa 390.000 · convenio 70.000 (dos paquetes completos)
  });

  it("🔴 el convenio se traga hasta su saldo COMPLETO si el pago alcanza", () => {
    const r = repartirPagoV2(daniel({ monto: 700_000, cajasExigidas: 57, convenioPendiente: 411_000 }));
    expect(r.convenio).toBe(411_000);  // el convenio entero de un pago
    expect(r.saldo).toBe(94_000);
  });

  it("ponerse al día en el convenio SÍ es correcto y debe seguir funcionando", () => {
    // Le deben 3 cuotas atrasadas: cubrirlas NO es adelantar (regla del dueño, 24-ago).
    const r = repartirPagoV2(daniel({ monto: 195_000 + 3 * CUOTA_CONV, cajasExigidas: 57 }));
    expect(r.tarifa).toBe(195_000);
    expect(r.convenio).toBe(105_000);
  });
});

describe("DANIEL, sus pagos reales de agosto — así los repartió el motor", () => {
  it("8, 15 y 24-ago (lunes, su día): el paquete se repartió PAREJO", () => {
    // Estos tres están bien: pagó su día, había caja exigida, y salió 195.000 + 35.000.
    const r = repartirPagoV2(daniel({ monto: PAQUETE, cajasExigidas: 57 }));
    expect(r).toMatchObject({ tarifa: 195_000, convenio: 35_000, ahorro: 26_000, saldo: 0 });
  });

  it("1-ago ($169.000): a deuda y el resto a favor — ese día AÚN NO existía el convenio", () => {
    // Su convenio se creó ese mismo 1-ago a las 19:22 y este pago entró a las 14:41. Sin convenio
    // vivo, los $17.000 que sobraron quedaron a su favor. Con convenio se los habría tragado —
    // que es justamente el defecto: dos horas de diferencia cambian a dónde va la plata.
    const r = repartirPagoV2(daniel({
      monto: 169_000, cajasExigidas: 56, convenioPendiente: 0,
      deudas: [{ montoPendiente: 152_000 }],
    }));
    expect(r.deuda).toBe(152_000);
    expect(r.saldo).toBe(17_000);
  });
});
