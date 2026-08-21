import { describe, it, expect } from "vitest";
import { recepcionDelContrato, type RecepcionMin, type ContratoMin } from "./recepcionDelContrato";

// Esta función decide la FECHA DE CORTE de una liquidación: hasta qué día se le cobra al cliente.
// Equivocarse acá es cobrarle semanas de más a uno o de menos a otro, así que va con pruebas.

const MOTO = "moto-iew65i";
const rec = (p: Partial<RecepcionMin> & { created_at: string }): RecepcionMin => ({
  contrato_id: null, cliente_id: null, moto_id: MOTO, ...p,
});

// ── ANTONIO MONTERROZA (IEW65I) — el caso real que lo destapó ──────────────────
// Su recepción del 30-jul quedó guardada SOLO con la moto: contrato_id y cliente_id en null.
const ANTONIO: ContratoMin = {
  id: "662f1dfa", cliente_id: "115c3e68", moto_id: MOTO, fecha_entrega: "2026-06-01",
};

describe("recepción huérfana (sin contrato ni cliente)", () => {
  it("se le asigna al contrato que tenía la moto ese día", () => {
    const r = rec({ created_at: "2026-07-30T13:24:46Z" });
    expect(recepcionDelContrato([r], ANTONIO, [ANTONIO])).toBe(r);
  });

  it("una recepción ANTERIOR a la entrega no es de ese contrato", () => {
    const r = rec({ created_at: "2026-05-01T10:00:00Z" });
    expect(recepcionDelContrato([r], ANTONIO, [ANTONIO])).toBeNull();
  });
});

describe("motos reasignadas — que no se le cuelgue la recepción al dueño equivocado", () => {
  // Las 4 motos que se le quitaron a un cliente y se le entregaron a otro. Una misma placa con
  // recepciones de dueños distintos: agarrar la del otro corre la fecha de corte.
  const VIEJO: ContratoMin = { id: "c-viejo", cliente_id: "cli-viejo", moto_id: MOTO, fecha_entrega: "2025-10-25" };
  const NUEVO: ContratoMin = { id: "c-nuevo", cliente_id: "cli-nuevo", moto_id: MOTO, fecha_entrega: "2026-08-10" };
  const TODOS = [VIEJO, NUEVO];

  it("una recepción de julio es del dueño VIEJO, no del nuevo", () => {
    const r = rec({ created_at: "2026-07-20T09:00:00Z" });
    expect(recepcionDelContrato([r], VIEJO, TODOS)).toBe(r);
    expect(recepcionDelContrato([r], NUEVO, TODOS)).toBeNull();
  });

  it("una recepción posterior a la reasignación es del dueño NUEVO", () => {
    const r = rec({ created_at: "2026-08-15T09:00:00Z" });
    expect(recepcionDelContrato([r], NUEVO, TODOS)).toBe(r);
    expect(recepcionDelContrato([r], VIEJO, TODOS)).toBeNull();
  });

  it("cada contrato se queda con la suya cuando hay varias", () => {
    const rVieja = rec({ created_at: "2026-07-20T09:00:00Z" });
    const rNueva = rec({ created_at: "2026-08-15T09:00:00Z" });
    expect(recepcionDelContrato([rVieja, rNueva], VIEJO, TODOS)).toBe(rVieja);
    expect(recepcionDelContrato([rVieja, rNueva], NUEVO, TODOS)).toBe(rNueva);
  });
});

describe("recepciones que sí dicen de quién son", () => {
  it("la enlazada al contrato manda", () => {
    const mia = rec({ created_at: "2026-07-01T09:00:00Z", contrato_id: ANTONIO.id });
    expect(recepcionDelContrato([mia], ANTONIO, [ANTONIO])).toBe(mia);
  });

  it("la enlazada a OTRO contrato no se toca, aunque sea la misma moto", () => {
    const ajena = rec({ created_at: "2026-07-30T09:00:00Z", contrato_id: "otro-contrato" });
    expect(recepcionDelContrato([ajena], ANTONIO, [ANTONIO])).toBeNull();
  });

  it("sin contrato pero con cliente, alcanza el cliente", () => {
    const mia = rec({ created_at: "2026-07-30T09:00:00Z", cliente_id: ANTONIO.cliente_id });
    const ajena = rec({ created_at: "2026-07-31T09:00:00Z", cliente_id: "otro-cliente" });
    expect(recepcionDelContrato([mia, ajena], ANTONIO, [ANTONIO])).toBe(mia);
  });
});

describe("casos borde", () => {
  it("sin recepciones devuelve null", () => {
    expect(recepcionDelContrato([], ANTONIO, [ANTONIO])).toBeNull();
  });

  it("un contrato sin moto no agarra ninguna", () => {
    const sinMoto: ContratoMin = { ...ANTONIO, moto_id: null };
    expect(recepcionDelContrato([rec({ created_at: "2026-07-30T09:00:00Z" })], sinMoto, [sinMoto])).toBeNull();
  });

  it("se queda con la MÁS RECIENTE cuando hay varias suyas", () => {
    const vieja = rec({ created_at: "2026-07-01T09:00:00Z", contrato_id: ANTONIO.id });
    const nueva = rec({ created_at: "2026-07-30T09:00:00Z", contrato_id: ANTONIO.id });
    expect(recepcionDelContrato([vieja, nueva], ANTONIO, [ANTONIO])).toBe(nueva);
  });
});
