import { describe, it, expect } from "vitest";
import { fmtFechaLarga } from "./fecha";

// El día de la semana en la fecha de un pago NO es adorno: los días de pago son lunes o
// miércoles, así que verlo dice de una si el cliente pagó cuando le tocaba. Si algún día
// alguien "simplifica" este formato, estas pruebas avisan.
describe("fmtFechaLarga — fecha de pago en pantalla", () => {
  it("escribe el día de la semana, con mayúscula inicial y sin coma", () => {
    expect(fmtFechaLarga("2026-08-04")).toBe("Martes 4 de agosto de 2026");
  });

  it("acierta el día de la semana en otra fecha", () => {
    expect(fmtFechaLarga("2026-08-10")).toBe("Lunes 10 de agosto de 2026");
  });

  it("no se corre de día por la zona horaria (el bug de las 7pm)", () => {
    // "2026-08-04" es martes en Colombia. Si se parseara como UTC, después de las 7pm
    // caería en lunes 3 — el mismo defecto que ya se corrigió en hoyISO().
    expect(fmtFechaLarga("2026-08-04")).toContain("Martes");
    expect(fmtFechaLarga("2026-01-01")).toBe("Jueves 1 de enero de 2026");
  });

  it("también sirve con una marca de tiempo completa, no solo con la fecha", () => {
    expect(fmtFechaLarga("2026-08-04T15:30:00")).toBe("Martes 4 de agosto de 2026");
  });

  it("no revienta cuando no hay fecha", () => {
    expect(fmtFechaLarga(null)).toBe("—");
    expect(fmtFechaLarga(undefined)).toBe("—");
    expect(fmtFechaLarga("")).toBe("—");
    expect(fmtFechaLarga("no es una fecha")).toBe("—");
  });
});
