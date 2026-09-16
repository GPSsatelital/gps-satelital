import { describe, it, expect } from "vitest";
import { desglosarBase, excedenteDisponible, motivoNoSePuedeTrasladar, PISO_BASE, PISO_BASE_VIEJO } from "./excedenteBase";
import type { ContratoCiclo } from "./cicloPago";

// LA BASE ES SAGRADA. Estas pruebas son la regla del dueño en cifras: lo ÚNICO movible es lo que
// el cliente dio POR ENCIMA de lo exigido. Si alguna vez una de estas se pone en rojo, alguien
// está sacando plata de la base de un cliente.

const base = (o: Partial<ContratoCiclo & { ahorro_inicial: number }> = {}) => ({
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true, ahorro_inicial: 510000, ...o,
}) as ContratoCiclo & { ahorro_inicial: number };

describe("los dos casos reales que lo originaron", () => {
  it("INGRID URBINA (XZN82H): entregó $900.000 → dio de más $390.000", () => {
    const d = desglosarBase(base({ ahorro_inicial: 900000 }));
    expect(d.requerido).toBe(510000);          // $308.000 + su semana de $202.000
    expect(d.periodoAdelantado).toBe(202000);
    expect(d.guardadoIntocable).toBe(308000);
    expect(d.excedente).toBe(390000);
  });

  it("PEDRO FLOREZ (IEW90I): entregó $560.000 → dio de más $50.000", () => {
    expect(desglosarBase(base({ ahorro_inicial: 560000 })).excedente).toBe(50000);
  });

  it("los tres pedazos siempre suman lo entregado", () => {
    const d = desglosarBase(base({ ahorro_inicial: 900000 }));
    expect(d.periodoAdelantado + d.guardadoIntocable + d.excedente).toBe(d.entregado);
  });
});

describe("la base y el ahorro NO se tocan", () => {
  it("quien entregó justo lo exigido no tiene nada que mover", () => {
    expect(desglosarBase(base({ ahorro_inicial: 510000 })).excedente).toBe(0);
  });

  it("quien entregó de MENOS tampoco: el excedente nunca es negativo", () => {
    const d = desglosarBase(base({ ahorro_inicial: 300000 }));
    expect(d.excedente).toBe(0);
    expect(d.guardadoIntocable).toBe(98000);   // lo que alcanzó, no los $308.000 completos
  });

  it("un contrato sin base entregada da todo en cero, no un negativo", () => {
    const d = desglosarBase(base({ ahorro_inicial: 0 }));
    expect(d.excedente).toBe(0);
    expect(d.guardadoIntocable).toBe(0);
  });

  it("🔴 NO se calcula desde `ahorro_apertura`: PEDRO tiene $66.000 ahí y su excedente NO es negativo", () => {
    // La apertura de los migrados trae la mezcla del arqueo. Si la fórmula la mirara, a PEDRO le
    // daría 66.000 − 308.000 = −242.000. Este es el error que ya se cometió una vez.
    const d = desglosarBase(base({ ahorro_inicial: 560000, ahorro_apertura: 66000 } as never));
    expect(d.excedente).toBe(50000);
  });
});

describe("la tarifa vieja tiene su propio piso", () => {
  it("con $195.000/semana el piso es $305.000, no $308.000", () => {
    const d = desglosarBase(base({ valor_semanal: 195000, ahorro_inicial: 500000 }));
    expect(d.guardadoIntocable).toBe(PISO_BASE_VIEJO);
    expect(d.requerido).toBe(500000);
    expect(d.excedente).toBe(0);               // los $500.000 de la época vieja son EXACTOS
  });

  it("con la tarifa de hoy el piso son $308.000", () => {
    expect(desglosarBase(base({ ahorro_inicial: 600000 })).guardadoIntocable).toBe(PISO_BASE);
  });
});

describe("lo que ya se movió no se puede volver a mover", () => {
  it("descuenta los traslados anteriores", () => {
    const c = base({ ahorro_inicial: 900000 });
    expect(excedenteDisponible(c, 0)).toBe(390000);
    expect(excedenteDisponible(c, 202000)).toBe(188000);
    expect(excedenteDisponible(c, 390000)).toBe(0);
  });

  it("aunque alguien haya movido de más por otra vía, nunca queda negativo", () => {
    expect(excedenteDisponible(base({ ahorro_inicial: 900000 }), 999999)).toBe(0);
  });
});

describe("el candado dice POR QUÉ no se puede, no solo que no", () => {
  it("sin excedente avisa que la base no se usa", () => {
    expect(motivoNoSePuedeTrasladar(50000, 0)).toContain("no dio de más");
  });

  it("pasarse del disponible dice hasta cuánto se puede", () => {
    expect(motivoNoSePuedeTrasladar(400000, 390000)).toContain("390.000");
  });

  it("un monto en cero o sin escribir no pasa", () => {
    expect(motivoNoSePuedeTrasladar(0, 390000)).toContain("Escribe cuánto");
    expect(motivoNoSePuedeTrasladar(NaN, 390000)).toContain("Escribe cuánto");
  });

  it("dentro del disponible, deja", () => {
    expect(motivoNoSePuedeTrasladar(390000, 390000)).toBeNull();
    expect(motivoNoSePuedeTrasladar(1, 390000)).toBeNull();
  });
});
