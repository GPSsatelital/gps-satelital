import { describe, it, expect } from "vitest";
import { sumarLoQueEntra, deudasMarcadas, faltaParaCubrir } from "./convenioQueEntra";

// El caso que motivó esto: ESTARLIS CHIQUILLO, 7-sep-2026. Adentro había $563.000 y la
// etiqueta decía $368.000.
const SEMANAS_ESTARLIS = 55000 + 195000;   // semana 42 (lo que faltaba) + semana 43
const MIGRACION = 313000;

describe("el total del acuerdo se suma, no se escribe", () => {
  it("ESTARLIS: dos semanas + la deuda de migración = $563.000, no $368.000", () => {
    const r = sumarLoQueEntra({ deudas: [MIGRACION], semanas: SEMANAS_ESTARLIS });
    expect(r).toEqual({ base: 0, deudas: 313000, semanas: 250000, total: 563000 });
  });

  it("quitarle la casilla a la deuda baja el total a solo las semanas", () => {
    const r = sumarLoQueEntra({ deudas: [], semanas: SEMANAS_ESTARLIS });
    expect(r.total).toBe(250000);
  });

  it("la base inicial del wizard entra como monto del sistema, sin semanas ni deudas", () => {
    const r = sumarLoQueEntra({ base: 202000, deudas: [], semanas: 0 });
    expect(r).toEqual({ base: 202000, deudas: 0, semanas: 0, total: 202000 });
  });

  it("varias deudas marcadas se suman todas", () => {
    // JOSE SANMARTIN: taller $396.000 + migración $51.000 + alquiler $81.000, más 2 semanas.
    const r = sumarLoQueEntra({ deudas: [396000, 51000, 81000], semanas: 404000 });
    expect(r.total).toBe(932000);
  });

  it("no acepta negativos ni decimales sueltos", () => {
    const r = sumarLoQueEntra({ base: -5, deudas: [1000.4, -20], semanas: 0.6 });
    expect(r).toEqual({ base: 0, deudas: 1000, semanas: 1, total: 1001 });
  });
});

describe("las deudas marcadas", () => {
  const deudas = [{ id: "a", monto: 1 }, { id: "b", monto: 2 }, { id: "c", monto: 3 }];

  it("sin selección (todavía cargando) son todas", () => {
    expect(deudasMarcadas(deudas, null)).toEqual(deudas);
  });

  it("con selección, solo las marcadas y en el mismo orden de la base", () => {
    expect(deudasMarcadas(deudas, new Set(["c", "a"])).map(d => d.id)).toEqual(["a", "c"]);
  });

  it("selección vacía = ninguna entra", () => {
    expect(deudasMarcadas(deudas, new Set())).toEqual([]);
  });
});

describe("el cinturón: cuánto falta para cubrir lo envuelto", () => {
  it("ESTARLIS: faltaban $195.000", () => {
    expect(faltaParaCubrir(368000, 563000)).toBe(195000);
  });

  it("si alcanza o sobra, no falta nada", () => {
    expect(faltaParaCubrir(563000, 563000)).toBe(0);
    expect(faltaParaCubrir(600000, 563000)).toBe(0);
  });
});
