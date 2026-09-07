import { describe, it, expect } from "vitest";
import { contratoDeLaMoto, prestamoActivoDeOriginal, anotarTrabajo } from "./taller";

// Caso real que destapó esto (7-sep-2026): DQF56I en taller, su cliente JOSE anda en la YAT46H
// prestada, y el contrato de JOSE apunta a la YAT46H mientras dura el préstamo.
const DQF56I = "moto-dqf56i";
const YAT46H = "moto-yat46h";
const contratoJose = { id: "c-jose", moto_id: YAT46H, estado: "Activo" };

describe("¿de quién es la moto que está en el taller?", () => {
  it("con contrato activo apuntando a la placa, es ese", () => {
    const c = { id: "c1", moto_id: DQF56I, estado: "Activo" };
    expect(contratoDeLaMoto(DQF56I, [c], [])).toBe(c);
  });

  it("durante un préstamo de reemplazo, llega al cliente por el préstamo aunque su contrato apunte a la prestada", () => {
    const prest = { contrato_id: "c-jose", moto_original_id: DQF56I, estado: "activo" };
    expect(contratoDeLaMoto(DQF56I, [contratoJose], [prest])).toBe(contratoJose);
  });

  it("un préstamo ya cerrado no cuenta", () => {
    const prest = { contrato_id: "c-jose", moto_original_id: DQF56I, estado: "cerrado" };
    expect(contratoDeLaMoto(DQF56I, [contratoJose], [prest])).toBeNull();
  });

  it("una retenida (contrato Suspendido) también tiene dueño a quien cobrarle", () => {
    const c = { id: "c1", moto_id: DQF56I, estado: "Suspendido" };
    expect(contratoDeLaMoto(DQF56I, [c], [])).toBe(c);
  });

  it("si hay Activo y Suspendido sobre la misma placa, manda el Activo", () => {
    const viejo = { id: "c-viejo", moto_id: DQF56I, estado: "Suspendido" };
    const nuevo = { id: "c-nuevo", moto_id: DQF56I, estado: "Activo" };
    expect(contratoDeLaMoto(DQF56I, [viejo, nuevo], [])).toBe(nuevo);
  });

  it("un contrato cerrado no es dueño: moto sin cliente", () => {
    const c = { id: "c1", moto_id: DQF56I, estado: "Finalizado" };
    expect(contratoDeLaMoto(DQF56I, [c], [])).toBeNull();
  });

  it("prestamoActivoDeOriginal solo mira la moto ORIGINAL, no la prestada", () => {
    const prest = { contrato_id: "c-jose", moto_original_id: DQF56I, estado: "activo" };
    expect(prestamoActivoDeOriginal(DQF56I, [prest])).toBe(prest);
    expect(prestamoActivoDeOriginal(YAT46H, [prest])).toBeNull();
  });
});

describe("anotar qué se le hizo", () => {
  it("la primera anotación lleva la fecha en formato de la operación", () => {
    expect(anotarTrabajo(null, "Cambio de rodamientos", "2026-09-07")).toBe("[07/09/2026] Cambio de rodamientos");
  });

  it("la segunda va DEBAJO; lo anterior no se toca", () => {
    const previo = "[04/09/2026] Diagnóstico: ruido en el motor";
    expect(anotarTrabajo(previo, "Cambio de rodamientos", "2026-09-07"))
      .toBe("[04/09/2026] Diagnóstico: ruido en el motor\n[07/09/2026] Cambio de rodamientos");
  });

  it("texto vacío o solo espacios no agrega nada", () => {
    expect(anotarTrabajo("[04/09/2026] algo", "   ", "2026-09-07")).toBe("[04/09/2026] algo");
    expect(anotarTrabajo(null, "", "2026-09-07")).toBe("");
  });

  it("recorta espacios sobrantes del texto nuevo", () => {
    expect(anotarTrabajo(null, "  Ajuste de cadena  ", "2026-09-07")).toBe("[07/09/2026] Ajuste de cadena");
  });
});
