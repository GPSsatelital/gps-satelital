import { describe, it, expect } from "vitest";
import { totalesPorCuenta, faltaElegirCuenta } from "./cuentasDelDia";

const BANCOL = "cta-bancolombia";
const NEQUI = "cta-nequi";
const HOY = "2026-09-15";

const pago = (v: Partial<{ metodo: string; estado: string; valor: number; cuenta_id: string | null }> = {}) => ({
  metodo: "Transferencia", estado: "Confirmado", valor: 100000, cuenta_id: BANCOL, ...v,
});
const base = (v: Partial<{ tipo: string; monto: number; metodo: string; fecha: string; cuenta_id: string | null }> = {}) => ({
  tipo: "abono", monto: 50000, metodo: "Transferencia", fecha: HOY, cuenta_id: BANCOL, ...v,
});
const ni = (v: Partial<{ monto: number; fecha_banco: string; cuenta_id: string | null }> = {}) => ({
  monto: 30000, fecha_banco: HOY, cuenta_id: BANCOL, ...v,
});

const vacio = { pagos: [], bases: [], sinDuenio: [], fecha: HOY };

describe("totalesPorCuenta — cuánto tiene que decir cada extracto", () => {
  it("separa las dos cuentas de COSTA, que era el problema original", () => {
    const r = totalesPorCuenta({
      ...vacio,
      pagos: [pago({ valor: 820000 }), pago({ valor: 310000, cuenta_id: NEQUI })],
    });
    expect(r).toEqual([
      { cuentaId: BANCOL, total: 820000, movimientos: 1 },
      { cuentaId: NEQUI, total: 310000, movimientos: 1 },
    ]);
  });

  it("suma las tres fuentes en la misma cuenta: transferencias + bases + plata sin dueño", () => {
    const r = totalesPorCuenta({
      pagos: [pago({ valor: 100000 })], bases: [base({ monto: 50000 })], sinDuenio: [ni({ monto: 30000 })],
      fecha: HOY,
    });
    expect(r).toEqual([{ cuentaId: BANCOL, total: 180000, movimientos: 3 }]);
  });

  it("el EFECTIVO nunca entra — llega a la mano, no a una cuenta", () => {
    const r = totalesPorCuenta({
      ...vacio,
      pagos: [pago({ metodo: "Efectivo", valor: 900000, cuenta_id: null })],
      bases: [base({ metodo: "Efectivo", monto: 500000 })],
    });
    expect(r).toEqual([]);
  });

  it("un pago pendiente de confirmar todavía no cuenta", () => {
    expect(totalesPorCuenta({ ...vacio, pagos: [pago({ estado: "Pendiente" })] })).toEqual([]);
  });

  it("la devolución de una base RESTA del extracto", () => {
    const r = totalesPorCuenta({
      ...vacio,
      bases: [base({ monto: 500000 }), base({ tipo: "devolucion", monto: 200000 })],
    });
    expect(r).toEqual([{ cuentaId: BANCOL, total: 300000, movimientos: 2 }]);
  });

  it("la retención no mueve plata en el banco: no aparece", () => {
    expect(totalesPorCuenta({ ...vacio, bases: [base({ tipo: "retencion", monto: 80000 })] })).toEqual([]);
  });

  it("solo cuenta el día pedido", () => {
    const r = totalesPorCuenta({
      ...vacio,
      bases: [base({ fecha: "2026-09-14", monto: 999 })],
      sinDuenio: [ni({ fecha_banco: "2026-09-14", monto: 999 })],
    });
    expect(r).toEqual([]);
  });

  it("lo que quedó sin cuenta marcada se agrupa aparte y va de ÚLTIMO, aunque sea el más grande", () => {
    const r = totalesPorCuenta({
      ...vacio,
      pagos: [pago({ valor: 1000000, cuenta_id: null }), pago({ valor: 10000 })],
    });
    expect(r.map(x => x.cuentaId)).toEqual([BANCOL, null]);
    expect(r[1]).toEqual({ cuentaId: null, total: 1000000, movimientos: 1 });
  });

  it("un día sin nada devuelve lista vacía, no una fila en cero", () => {
    expect(totalesPorCuenta(vacio)).toEqual([]);
  });
});

describe("faltaElegirCuenta — solo estorba donde hay que decidir", () => {
  const una = [{ id: BANCOL }];
  const dos = [{ id: BANCOL }, { id: NEQUI }];

  it("con DOS cuentas (COSTA) y ninguna marcada, falta", () => {
    expect(faltaElegirCuenta(dos, "Transferencia", null)).toBe(true);
  });

  it("con dos cuentas pero ya elegida, no falta", () => {
    expect(faltaElegirCuenta(dos, "Transferencia", NEQUI)).toBe(false);
  });

  it("con UNA sola cuenta nunca falta — el selector la elige solo", () => {
    expect(faltaElegirCuenta(una, "Transferencia", null)).toBe(false);
  });

  it("sin cuentas registradas no se bloquea a nadie", () => {
    expect(faltaElegirCuenta([], "Transferencia", null)).toBe(false);
  });

  it("el efectivo nunca pide cuenta", () => {
    expect(faltaElegirCuenta(dos, "Efectivo", null)).toBe(false);
  });
});
