import { describe, it, expect } from "vitest";
import { rastroSaldoFavor, destinosDelUso, type PagoSaldo } from "./saldoFavor";

// Las cifras de LUIS ALEJANDRO GUTIERREZ (IEW57I) están COPIADAS DE PRODUCCIÓN el 23-sep-2026.
// Si alguien le cambia la cuenta al rastro, esta prueba lo caza antes de que llegue a la pantalla.
const p = (o: Partial<PagoSaldo> & { id: string; created_at: string; valor: number }): PagoSaldo => ({
  fecha: o.created_at.slice(0, 10), tipo_registro: "normal", ...o,
});

const LUIS: PagoSaldo[] = [
  p({ id: "a", created_at: "2026-08-06T23:01:00Z", valor: 202000, tipo_registro: "adelanto_base", aplicado_tarifa: 202000 }),
  p({ id: "b", created_at: "2026-08-10T16:48:00Z", valor: 160000, aplicado_prorrateo: 109000, aplicado_saldo_favor: 51000 }),
  p({ id: "c", created_at: "2026-08-18T15:50:00Z", valor: 252000, aplicado_tarifa: 202000, aplicado_convenio: 50000 }),
  p({ id: "d", created_at: "2026-08-24T22:00:00Z", valor: 252000, aplicado_tarifa: 202000, aplicado_convenio: 50000 }),
  p({ id: "e", created_at: "2026-09-01T15:54:00Z", fecha: "2026-08-31", valor: 252000, aplicado_tarifa: 202000, aplicado_convenio: 50000 }),
  p({ id: "f", created_at: "2026-09-09T16:50:00Z", fecha: "2026-09-08", valor: 252000, aplicado_tarifa: 202000, aplicado_convenio: 50000 }),
  p({ id: "g", created_at: "2026-09-15T19:42:00Z", valor: 51000, tipo_registro: "saldo_favor", aplicado_tarifa: 51000, aplicado_saldo_favor: -51000 }),
  p({ id: "h", created_at: "2026-09-15T19:44:00Z", valor: 260000, aplicado_tarifa: 151000, aplicado_convenio: 50000, aplicado_saldo_favor: 59000 }),
  p({ id: "i", created_at: "2026-09-23T21:20:00Z", valor: 59000, tipo_registro: "saldo_favor", aplicado_convenio: 50000, aplicado_saldo_favor: -50000 }),
];

describe("rastroSaldoFavor — la película de LUIS (IEW57I), cifras reales", () => {
  const r = rastroSaldoFavor({ saldo_favor_apertura: 0 }, LUIS);

  it("el saldo de hoy son $9.000", () => {
    expect(r.saldoHoy).toBe(9000);
  });

  it("el uso del 23-sep dice las TRES cifras, no una sola", () => {
    expect(r.usos.i).toMatchObject({ seMando: 59000, seUso: 50000, volvioAGuardarse: 9000, quedaDespues: 9000 });
  });

  it("y dice de qué pago salió esa plata", () => {
    expect(r.usos.i.vieneDe).toEqual([{ fecha: "2026-09-15", valorPago: 260000, monto: 50000 }]);
  });

  it("el uso del 15-sep salió del pago más viejo (FIFO), no del más nuevo", () => {
    // Ese día había $51.000 del 10-ago; el pago de $260.000 entró DESPUÉS (19:44 vs 19:42).
    expect(r.usos.g.vieneDe).toEqual([{ fecha: "2026-08-10", valorPago: 160000, monto: 51000 }]);
    expect(r.usos.g.quedaDespues).toBe(0);
  });

  it("el pago que generó el saldo sabe qué pasó después con su plata", () => {
    expect(r.generadores.h).toEqual({ guardo: 59000, usos: [{ fecha: "2026-09-23", monto: 50000 }], sigueGuardado: 9000 });
    expect(r.generadores.b).toEqual({ guardo: 51000, usos: [{ fecha: "2026-09-15", monto: 51000 }], sigueGuardado: 0 });
  });

  it("el total cuadra con la cuenta de usePagos (apertura + suma de los aplicado_saldo_favor)", () => {
    const comoUsePagos = LUIS.reduce((s, x) => s + (x.aplicado_saldo_favor ?? 0), 0);
    expect(r.saldoHoy).toBe(comoUsePagos);
  });
});

describe("rastroSaldoFavor — casos borde", () => {
  it("el saldo que venía de las cuentas viejas se nombra aparte, sin inventarle un pago", () => {
    const r = rastroSaldoFavor({ saldo_favor_apertura: 80000 }, [
      p({ id: "x", created_at: "2026-09-01T10:00:00Z", valor: 30000, tipo_registro: "saldo_favor", aplicado_tarifa: 30000, aplicado_saldo_favor: -30000 }),
    ]);
    expect(r.usos.x.vieneDe).toEqual([{ fecha: null, valorPago: 80000, monto: 30000 }]);
    expect(r.saldoHoy).toBe(50000);
  });

  it("cuando un uso se reparte entre dos pagos, los nombra a los dos en orden", () => {
    const r = rastroSaldoFavor({ saldo_favor_apertura: 0 }, [
      p({ id: "v1", created_at: "2026-08-01T10:00:00Z", valor: 100000, aplicado_saldo_favor: 20000 }),
      p({ id: "v2", created_at: "2026-08-05T10:00:00Z", valor: 300000, aplicado_saldo_favor: 40000 }),
      p({ id: "u", created_at: "2026-08-09T10:00:00Z", valor: 50000, tipo_registro: "saldo_favor", aplicado_tarifa: 50000, aplicado_saldo_favor: -50000 }),
    ]);
    expect(r.usos.u.vieneDe).toEqual([
      { fecha: "2026-08-01", valorPago: 100000, monto: 20000 },
      { fecha: "2026-08-05", valorPago: 300000, monto: 30000 },
    ]);
    expect(r.saldoHoy).toBe(10000);
  });

  it("el orden es por cuándo se DIGITÓ, no por la fecha que el cliente pagó", () => {
    // Un pago con fecha vieja digitado tarde consumió el saldo el día que se digitó.
    const r = rastroSaldoFavor({ saldo_favor_apertura: 0 }, [
      p({ id: "tarde", created_at: "2026-09-20T10:00:00Z", fecha: "2026-08-01", valor: 90000, aplicado_saldo_favor: 15000 }),
      p({ id: "temprano", created_at: "2026-09-10T10:00:00Z", fecha: "2026-09-10", valor: 70000, aplicado_saldo_favor: 25000 }),
      p({ id: "gasta", created_at: "2026-09-25T10:00:00Z", valor: 30000, tipo_registro: "saldo_favor", aplicado_tarifa: 30000, aplicado_saldo_favor: -30000 }),
    ]);
    expect(r.usos.gasta.vieneDe[0].valorPago).toBe(70000);   // el del 10-sep entró primero
  });

  it("un movimiento viejo que no aplicó nada no rompe la cuenta", () => {
    // Las filas vacías de antes de la mig 167: se mandaron a aplicar y no cubrieron nada.
    const r = rastroSaldoFavor({ saldo_favor_apertura: 0 }, [
      p({ id: "gen", created_at: "2026-09-01T10:00:00Z", valor: 200000, aplicado_saldo_favor: 40000 }),
      p({ id: "vacia", created_at: "2026-09-02T10:00:00Z", valor: 40000, tipo_registro: "saldo_favor", aplicado_saldo_favor: 0 }),
    ]);
    expect(r.usos.vacia).toBeUndefined();
    expect(r.saldoHoy).toBe(40000);
  });

  it("sin saldo a favor no arma nada", () => {
    const r = rastroSaldoFavor({ saldo_favor_apertura: 0 }, [p({ id: "z", created_at: "2026-09-01T10:00:00Z", valor: 202000, aplicado_tarifa: 202000 })]);
    expect(r).toEqual({ usos: {}, generadores: {}, saldoHoy: 0 });
  });
});

describe("destinosDelUso — en qué se gastó, en el orden del motor", () => {
  it("nombra cada balde con su monto", () => {
    expect(destinosDelUso(LUIS[8])).toEqual([{ k: "Convenio", v: 50000 }]);
    expect(destinosDelUso(LUIS[6])).toEqual([{ k: "Cuota", v: 51000 }]);
  });

  it("los días rodados van primero, como reparte el motor", () => {
    const d = destinosDelUso(p({ id: "m", created_at: "2026-09-01T10:00:00Z", valor: 1, aplicado_prorrateo: 10, aplicado_tarifa: 20, aplicado_convenio: 30 }));
    expect(d.map(x => x.k)).toEqual(["Días rodados", "Cuota", "Convenio"]);
  });
});
