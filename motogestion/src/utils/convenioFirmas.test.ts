import { describe, it, expect } from "vitest";
import { quienFirmoConvenio, marcaDeFirma } from "./convenioFirmas";

describe("quién firmó el acuerdo de pago (12-sep-2026)", () => {
  const ella = { firma_acompanante_url: "https://x/ella.png", acompanante_nombre: "NOEMI PEDROZA" };

  it("solo el titular: no hay nada que aclarar", () => {
    expect(quienFirmoConvenio({ firma_url: "https://x/el.png" })).toBe("titular");
    expect(marcaDeFirma({ firma_url: "https://x/el.png" })).toBeNull();
  });

  it("solo la acompañante: se dice que firmó ella, en representación del titular", () => {
    expect(quienFirmoConvenio(ella)).toBe("acompanante");
    expect(marcaDeFirma(ella)).toBe("Firmado por NOEMI PEDROZA (codeudora, en representación del titular)");
  });

  it("los dos: se nombran los dos", () => {
    const cv = { firma_url: "https://x/el.png", ...ella };
    expect(quienFirmoConvenio(cv)).toBe("ambos");
    expect(marcaDeFirma(cv)).toBe("Firmado por el titular y NOEMI PEDROZA (codeudora)");
  });

  it("los acuerdos viejos, sin ninguna firma guardada, no inventan una marca", () => {
    expect(quienFirmoConvenio({})).toBe("ninguno");
    expect(quienFirmoConvenio(null)).toBe("ninguno");
    expect(marcaDeFirma(null)).toBeNull();
  });

  it("si firmó ella pero no quedó el nombre, la marca no sale vacía", () => {
    expect(marcaDeFirma({ firma_acompanante_url: "https://x/ella.png" }))
      .toBe("Firmado por la acompañante (codeudora, en representación del titular)");
  });
});
