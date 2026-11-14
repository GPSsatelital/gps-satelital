import { describe, it, expect, vi, beforeEach } from "vitest";

// «Aplicar saldo a favor» y las deudas que el motor NO puede bajar (P0 del 10-nov, medido de nuevo el 14-nov).
// El motor, con reparto explícito, solo baja deudas en estado 'pendiente'. Si el botón cuenta también las que
// están dentro de un acuerdo ('en_convenio') o rodadas, manda plata «a la deuda» que nunca llega a ninguna:
// el saldo sale del cliente y no entra a ninguna parte. Le pasó a YULIETH JIMENEZ (XZI17H) el 5-nov con $28.000.
// La base falsa de abajo aplica los filtros de la consulta como lo haría Postgres, para que la prueba mire
// el COMPORTAMIENTO (qué pagos se crean), no cómo está escrita la consulta.

type Deuda = { contrato_id: string; estado: string; monto_pendiente: number };
type Insert = Record<string, unknown>;

const base = vi.hoisted(() => ({
  deudas: [] as Deuda[],
  inserts: [] as Insert[],
  excedenteDelMotor: 0,
}));

vi.mock("../lib/supabase", () => {
  function consultaDeudas() {
    const filtros: ((d: Deuda) => boolean)[] = [];
    const q = {
      select: () => q,
      eq: (c: keyof Deuda, v: unknown) => { filtros.push(d => d[c] === v); return q; },
      neq: (c: keyof Deuda, v: unknown) => { filtros.push(d => d[c] !== v); return q; },
      gt: (c: keyof Deuda, v: number) => { filtros.push(d => Number(d[c]) > v); return q; },
      in: (c: keyof Deuda, vs: unknown[]) => { filtros.push(d => vs.includes(d[c])); return q; },
      then: (ok: (r: { data: Deuda[]; error: null }) => unknown) =>
        Promise.resolve({ data: base.deudas.filter(d => filtros.every(f => f(d))), error: null }).then(ok),
    };
    return q;
  }
  function consultaPagos() {
    return {
      insert: (fila: Insert) => {
        base.inserts.push(fila);
        const r = { error: null };
        return {
          select: () => ({ single: async () => ({ data: { id: `pago-${base.inserts.length}` }, error: null }) }),
          then: (ok: (x: typeof r) => unknown) => Promise.resolve(r).then(ok),
        };
      },
      // Relee el pago ya repartido por el motor.
      select: () => ({ eq: () => ({ single: async () => ({ data: { aplicado: null, aplicado_saldo_favor: base.excedenteDelMotor }, error: null }) }) }),
      update: () => ({ eq: async () => ({ error: null }) }),
    };
  }
  return { supabase: { from: (t: string) => (t === "deudas" ? consultaDeudas() : consultaPagos()) } };
});
vi.mock("./createTableStore", () => ({
  createTableStore: () => ({ useStore: () => ({ data: [], loading: false, error: null }), refetch: async () => {} }),
}));

import { usePagos } from "./usePagos";

const C = "contrato-manuel-castro";
const aDeudas = () => base.inserts.filter(f => Number(f.aplicado_deuda) > 0);
const alMotor = () => base.inserts.filter(f => Number(f.aplicado_deuda) === 0);

beforeEach(() => {
  base.deudas = [];
  base.inserts = [];
  base.excedenteDelMotor = 0;
});

describe("aplicarSaldoFavor: solo cuenta las deudas que el motor puede bajar", () => {
  it("MANUEL CASTRO (YAL63H): su única deuda está dentro de un acuerdo → los $202.000 van a la semana, no se pierden", async () => {
    base.deudas = [{ contrato_id: C, estado: "en_convenio", monto_pendiente: 443000 }];
    const { error } = await usePagos().aplicarSaldoFavor(C, 202000, 202000);
    expect(error).toBeNull();
    expect(aDeudas()).toHaveLength(0);
    expect(alMotor()).toHaveLength(1);
    expect(alMotor()[0].valor).toBe(202000);
  });

  it("una deuda suelta y otra dentro del acuerdo → a deudas va solo lo de la suelta, el resto sigue al motor", async () => {
    base.deudas = [
      { contrato_id: C, estado: "pendiente", monto_pendiente: 30000 },
      { contrato_id: C, estado: "en_convenio", monto_pendiente: 443000 },
    ];
    await usePagos().aplicarSaldoFavor(C, 202000, 202000);
    expect(aDeudas()).toHaveLength(1);
    expect(aDeudas()[0].aplicado_deuda).toBe(30000);
    expect(alMotor()[0].valor).toBe(172000);
  });

  it("una deuda rodada tampoco la baja el motor → no se cuenta", async () => {
    base.deudas = [{ contrato_id: C, estado: "rodada", monto_pendiente: 60000 }];
    await usePagos().aplicarSaldoFavor(C, 50000, 50000);
    expect(aDeudas()).toHaveLength(0);
    expect(alMotor()[0].valor).toBe(50000);
  });

  it("lo que ya funcionaba sigue igual: una deuda suelta más grande que el saldo se lleva todo el saldo", async () => {
    base.deudas = [{ contrato_id: C, estado: "pendiente", monto_pendiente: 100000 }];
    await usePagos().aplicarSaldoFavor(C, 50000, 150000);
    expect(aDeudas()).toHaveLength(1);
    expect(aDeudas()[0].aplicado_deuda).toBe(50000);
    expect(aDeudas()[0].aplicado_saldo_favor).toBe(-50000);
    expect(alMotor()).toHaveLength(0);
  });

  it("las deudas pagadas o en $0 no cuentan", async () => {
    base.deudas = [
      { contrato_id: C, estado: "pagada", monto_pendiente: 0 },
      { contrato_id: C, estado: "pendiente", monto_pendiente: 0 },
    ];
    await usePagos().aplicarSaldoFavor(C, 40000, 40000);
    expect(aDeudas()).toHaveLength(0);
    expect(alMotor()[0].valor).toBe(40000);
  });

  it("dirigido a un acuerdo puntual (convenioId): no mira deudas, como antes", async () => {
    base.deudas = [{ contrato_id: C, estado: "pendiente", monto_pendiente: 30000 }];
    await usePagos().aplicarSaldoFavor(C, 100000, 100000, { convenioId: "acuerdo-1" });
    expect(aDeudas()).toHaveLength(0);
    expect(alMotor()).toHaveLength(1);
    expect(alMotor()[0].convenio_id).toBe("acuerdo-1");
  });

  it("si no debe nada hoy, no crea ningún pago (el candado del 23-sep sigue)", async () => {
    base.deudas = [{ contrato_id: C, estado: "pendiente", monto_pendiente: 30000 }];
    const { error } = await usePagos().aplicarSaldoFavor(C, 100000, 0);
    expect(error).toMatch(/No hay nada pendiente/);
    expect(base.inserts).toHaveLength(0);
  });
});
