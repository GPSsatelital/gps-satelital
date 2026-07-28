import { describe, it, expect } from "vitest";
import { razonParaInmovilizar, motivoNoInmovilizable } from "./inmovilizacion";

// Reglas de CUÁNDO se le puede quitar la moto a un cliente. Es lo más delicado del sistema:
// abrirlo de más es quitarle la herramienta de trabajo a alguien que está cumpliendo; cerrarlo
// de más deja motos retenidas en la calle que el sistema cree rodando (pasó el 28-jul con
// ISMAEL GAMARRA / RLZ94H y con toda la flota COSTA recién migrada).

describe("razonParaInmovilizar", () => {
  it("cliente al día y sin deudas: NO se puede — es el caso que hay que proteger", () => {
    expect(razonParaInmovilizar("al-dia", 0)).toBeNull();
  });

  it("en mora: se puede, por mora", () => {
    expect(razonParaInmovilizar("mora", 0)).toBe("mora");
  });

  // El caso que originó todo: el motor de cajas necesita 2 días para llamarlo mora, así que
  // durante el día de gracia vencido la moto era irregistrable aunque ya estuviera retenida.
  it("en gabela sin deuda: se puede, por gabela", () => {
    expect(razonParaInmovilizar("gabela", 0)).toBe("gabela");
  });

  // Decisión del dueño: sin monto mínimo. Una multa vieja de $20.000 ya habilita.
  it("al día pero debe algo, así sea poco: se puede, por deuda", () => {
    expect(razonParaInmovilizar("al-dia", 1000)).toBe("deuda");
    expect(razonParaInmovilizar("al-dia", 20000)).toBe("deuda");
  });

  // La deuda 'en_convenio' NUNCA llega a este cálculo (quien lo llama filtra estado='pendiente'),
  // así que quien financió su deuda y está cumpliendo el convenio entra acá con 0 y queda protegido.
  it("deuda financiada en convenio vigente (llega como 0): NO se puede", () => {
    expect(razonParaInmovilizar("al-dia", 0)).toBeNull();
  });

  it("la mora manda sobre las demás razones", () => {
    expect(razonParaInmovilizar("mora", 500000)).toBe("mora");
    expect(razonParaInmovilizar("gabela", 500000)).toBe("gabela");
  });

  it("una deuda negativa o rara no habilita nada", () => {
    expect(razonParaInmovilizar("al-dia", -5000)).toBeNull();
  });
});

describe("motivoNoInmovilizable", () => {
  it("cuando SÍ se puede, no hay motivo que mostrar", () => {
    expect(motivoNoInmovilizable("mora", 0)).toBe("");
    expect(motivoNoInmovilizable("al-dia", 1000)).toBe("");
  });

  it("cuando no se puede, explica por qué en vez de decir solo 'no está en mora'", () => {
    expect(motivoNoInmovilizable("al-dia", 0)).toContain("al día");
  });
});
