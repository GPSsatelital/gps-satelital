import { describe, it, expect } from "vitest";
import { pisoAhorro, movibleDelAhorro, calcularMovimiento, PISO_AHORRO_NUEVO, PISO_AHORRO_VIEJO } from "./moverPlata";

// El caso real (12-sep-2026): entregó $600.000 de base en vez de $510.000. El wizard mandó
// $202.000 a la semana adelantada y los otros $398.000 al ahorro de inicio. Quiere usar los
// $90.000 que dio de más para completar una tarifa.
const nuevo = {
  forma_pago: "Semanal", valor_semanal: 202_000,
  ahorro_apertura: 398_000, ahorro_acumulado: 0, saldo_favor_apertura: 0,
};
const viejo = { ...nuevo, valor_semanal: 195_000, ahorro_apertura: 305_000 };

describe("el piso del ahorro (regla del dueño: nunca menos de 308, o 305 en los viejos)", () => {
  it("un contrato de semana $202.000 conserva $308.000", () => {
    expect(pisoAhorro(nuevo)).toBe(PISO_AHORRO_NUEVO);
  });
  it("uno viejo, de semana $195.000, conserva $305.000", () => {
    expect(pisoAhorro(viejo)).toBe(PISO_AHORRO_VIEJO);
  });
  it("en el diario no hay piso ni se puede mover: ese ahorro es la base que está juntando", () => {
    expect(pisoAhorro({ forma_pago: "Diario", valor_semanal: 27_000 })).toBeNull();
    expect(movibleDelAhorro({ ...nuevo, forma_pago: "Diario" })).toBe(0);
  });
  it("solo se puede mover lo que está POR ENCIMA del piso", () => {
    expect(movibleDelAhorro(nuevo)).toBe(90_000);
    expect(movibleDelAhorro(viejo)).toBe(0);
    expect(movibleDelAhorro({ ...nuevo, ahorro_apertura: 100_000 })).toBe(0);   // ya está por debajo
  });
});

describe("mover del ahorro al saldo a favor", () => {
  it("los $90.000 que entregó de más quedan disponibles para pagar", () => {
    const r = calcularMovimiento(nuevo, 90_000, "ahorro_a_saldo", 0);
    expect(r).toMatchObject({ ok: true, ahorro_apertura: 308_000, ahorro_acumulado: 0, saldo_favor_apertura: 90_000 });
  });

  it("no deja bajar del piso ni por un peso", () => {
    const r = calcularMovimiento(nuevo, 90_001, "ahorro_a_saldo", 0);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toContain("308.000");
  });

  it("si ya está en el piso, no hay nada que mover", () => {
    const r = calcularMovimiento({ ...nuevo, ahorro_apertura: 308_000 }, 1_000, "ahorro_a_saldo", 0);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toContain("No hay nada que se pueda mover");
  });

  it("saca primero del ahorro POR PAGOS y deja lo que entregó en la mano de último", () => {
    const conPagos = { ...nuevo, ahorro_apertura: 308_000, ahorro_acumulado: 130_000 };
    const r = calcularMovimiento(conPagos, 100_000, "ahorro_a_saldo", 0);
    expect(r).toMatchObject({ ok: true, ahorro_acumulado: 30_000, ahorro_apertura: 308_000 });
  });

  it("si lo de por pagos no alcanza, completa con lo de inicio — pero sin pasarse del piso", () => {
    const conPagos = { ...nuevo, ahorro_apertura: 398_000, ahorro_acumulado: 20_000 };
    // movible = 418.000 − 308.000 = 110.000
    const r = calcularMovimiento(conPagos, 110_000, "ahorro_a_saldo", 0);
    expect(r).toMatchObject({ ok: true, ahorro_acumulado: 0, ahorro_apertura: 308_000, saldo_favor_apertura: 110_000 });
  });

  it("en el diario no deja, y lo explica", () => {
    const r = calcularMovimiento({ ...nuevo, forma_pago: "Diario" }, 10_000, "ahorro_a_saldo", 0);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toContain("diario");
  });
});

describe("mover del saldo a favor al ahorro (el camino de vuelta)", () => {
  it("entra por el ahorro de inicio y sale de la bolsa del saldo", () => {
    const r = calcularMovimiento({ ...nuevo, saldo_favor_apertura: 50_000 }, 50_000, "saldo_a_ahorro", 50_000);
    expect(r).toMatchObject({ ok: true, ahorro_apertura: 448_000, saldo_favor_apertura: 0 });
  });

  it("no se puede mover más saldo del que tiene", () => {
    const r = calcularMovimiento(nuevo, 80_000, "saldo_a_ahorro", 50_000);
    expect(r.ok).toBe(false);
    expect((r as { error: string }).error).toContain("50.000");
  });

  it("el saldo que viene de los pagos también se puede guardar: la columna de apertura queda en negativo a propósito", () => {
    // apertura 0 pero la bolsa tiene $70.000 que dejaron los pagos.
    const r = calcularMovimiento(nuevo, 70_000, "saldo_a_ahorro", 70_000);
    expect(r).toMatchObject({ ok: true, saldo_favor_apertura: -70_000, ahorro_apertura: 468_000 });
  });

  it("subir el ahorro nunca choca con el piso", () => {
    const r = calcularMovimiento({ ...nuevo, ahorro_apertura: 0, ahorro_acumulado: 0 }, 10_000, "saldo_a_ahorro", 10_000);
    expect(r.ok).toBe(true);
  });
});

describe("lo que no se puede hacer nunca", () => {
  it("mover cero o negativo", () => {
    expect(calcularMovimiento(nuevo, 0, "ahorro_a_saldo", 0).ok).toBe(false);
    expect(calcularMovimiento(nuevo, -5_000, "ahorro_a_saldo", 0).ok).toBe(false);
    expect(calcularMovimiento(nuevo, NaN, "saldo_a_ahorro", 100_000).ok).toBe(false);
  });
});
