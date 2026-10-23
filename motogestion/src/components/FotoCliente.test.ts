import { describe, it, expect } from "vitest";
import { iniciales } from "./FotoCliente";

// Sin foto (127 de 373 activos el 23-oct-2026), el círculo muestra las iniciales del cliente.
describe("FotoCliente — las iniciales cuando no hay foto", () => {
  it("toma la primera letra de las dos primeras palabras", () => {
    expect(iniciales("Omar Agustin Rodriguez Busto")).toBe("OA");
    expect(iniciales("  moises   david ")).toBe("MD");
  });
  it("un solo nombre da una letra; sin nombre, un signo", () => {
    expect(iniciales("Emiro")).toBe("E");
    expect(iniciales(null)).toBe("?");
    expect(iniciales("")).toBe("?");
  });
});
