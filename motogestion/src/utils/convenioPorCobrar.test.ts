import { describe, it, expect } from "vitest";
import { elegirConvenioVigente, elegirConvenioPorCobrar } from "./convenioPorCobrar";

// Estas pruebas son el candado de la regla del 17-sep-2026: un acuerdo VENCIDO se sigue cobrando.
// Si alguna se pone en rojo, alguien le volvió a borrar la cuenta al cliente que no paga.

const cv = (estado: string, created_at: string, contrato_id = "c1") => ({ contrato_id, estado, created_at });

describe("la pregunta de siempre — ¿tiene acuerdo VIGENTE? (NO cambia)", () => {
  it("encuentra el activo", () => {
    expect(elegirConvenioVigente([cv("activo", "2026-09-12")], "c1")?.estado).toBe("activo");
  });

  it("🔒 un incumplido NO es vigente: no se le puede crear otro encima ni ampliarlo", () => {
    expect(elegirConvenioVigente([cv("incumplido", "2026-09-12")], "c1")).toBeNull();
  });

  it("cumplido y renovado tampoco", () => {
    expect(elegirConvenioVigente([cv("cumplido", "2026-08-01"), cv("renovado", "2026-07-01")], "c1")).toBeNull();
  });

  it("no se cruza de contrato", () => {
    expect(elegirConvenioVigente([cv("activo", "2026-09-12", "otro")], "c1")).toBeNull();
  });
});

describe("la pregunta nueva — ¿hay acuerdo QUE COBRAR?", () => {
  it("BRAYAN (RLZ79H): su acuerdo venció el lunes 14 y quedó incumplido — igual hay que cobrarlo", () => {
    const brayan = cv("incumplido", "2026-09-12T19:31:21Z");
    expect(elegirConvenioPorCobrar([brayan], "c1")).toBe(brayan);
  });

  it("el activo se cobra como siempre", () => {
    expect(elegirConvenioPorCobrar([cv("activo", "2026-09-12")], "c1")?.estado).toBe("activo");
  });

  it("un acuerdo CUMPLIDO ya no se cobra: está pago", () => {
    expect(elegirConvenioPorCobrar([cv("cumplido", "2026-08-01")], "c1")).toBeNull();
  });

  it("un RENOVADO tampoco: lo reemplazó otro", () => {
    expect(elegirConvenioPorCobrar([cv("renovado", "2026-07-01")], "c1")).toBeNull();
  });

  it("sin acuerdos, no hay nada que cobrar", () => {
    expect(elegirConvenioPorCobrar([], "c1")).toBeNull();
  });

  it("no se cruza de contrato", () => {
    expect(elegirConvenioPorCobrar([cv("incumplido", "2026-09-12", "otro")], "c1")).toBeNull();
  });
});

describe("🔴 cuando hay DOS, la plata no se puede ir al muerto", () => {
  // El candado de la BD solo impide dos ACTIVOS: un incumplido viejo + un activo nuevo es un
  // estado posible hoy. Si se eligiera cualquiera, el cliente pagaría el acuerdo equivocado.
  it("manda el ACTIVO aunque el incumplido sea más viejo", () => {
    const viejoMuerto = cv("incumplido", "2026-07-01");
    const nuevoVivo = cv("activo", "2026-09-12");
    expect(elegirConvenioPorCobrar([viejoMuerto, nuevoVivo], "c1")).toBe(nuevoVivo);
    expect(elegirConvenioPorCobrar([nuevoVivo, viejoMuerto], "c1")).toBe(nuevoVivo);
  });

  it("entre dos incumplidos se salda el MÁS VIEJO primero (FIFO, igual que las cajas)", () => {
    const primero = cv("incumplido", "2026-07-01");
    const segundo = cv("incumplido", "2026-08-15");
    expect(elegirConvenioPorCobrar([segundo, primero], "c1")).toBe(primero);
  });

  it("elegir no reordena la lista que vino del store", () => {
    const lista = [cv("incumplido", "2026-07-01"), cv("activo", "2026-09-12")];
    const antes = [...lista];
    elegirConvenioPorCobrar(lista, "c1");
    expect(lista).toEqual(antes);
  });
});
