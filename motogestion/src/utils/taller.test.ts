import { describe, it, expect } from "vitest";
import { contratoDeLaMoto, prestamoActivoDeOriginal, anotarTrabajo, diasEnTaller } from "./taller";
import { fmtFechaCorta } from "./fecha";

describe("las fechas del taller no se corren un día", () => {
  // Caso real (7-sep-2026): DQF56I entró el 4 y la pantalla decía "3/9/2026" y "3 días".
  it("la orden que entró el 4 dice 4, no 3", () => {
    expect(fmtFechaCorta("2026-09-04")).toBe("4/9/2026");
  });

  it("sin fecha muestra un guion", () => {
    expect(fmtFechaCorta(null)).toBe("-");
    expect(fmtFechaCorta("")).toBe("-");
  });

  it("del 4 al 7 son 3 días si sigue adentro", () => {
    expect(diasEnTaller("2026-09-04", null, "2026-09-07")).toBe(3);
  });

  it("si ya salió, cuenta hasta la salida y no hasta hoy", () => {
    expect(diasEnTaller("2026-09-04", "2026-09-05", "2026-09-30")).toBe(1);
  });

  it("entró y salió el mismo día: 0", () => {
    expect(diasEnTaller("2026-09-04", "2026-09-04", "2026-09-04")).toBe(0);
  });

  it("sin fecha de ingreso no inventa días", () => {
    expect(diasEnTaller(null, null, "2026-09-07")).toBe(0);
  });

  it("acepta una marca de tiempo completa y se queda con el día", () => {
    expect(diasEnTaller("2026-09-04T16:17:23.027Z", null, "2026-09-07")).toBe(3);
  });
});

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
