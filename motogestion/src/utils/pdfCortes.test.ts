import { describe, it, expect } from "vitest";
import { calcularCortes } from "./pdf";

// 5-oct-2026: el PDF de Reportes partía filas por la mitad entre una hoja y otra (no se leía la
// cifra). Con cortes seguros, el corte se sube al comienzo de la fila que quedaba partida.
describe("PDF: dónde se corta cada hoja", () => {
  it("si el corte cae dentro de una fila, la fila pasa entera a la hoja siguiente", () => {
    const filas: Array<[number, number]> = Array.from({ length: 50 }, (_, i) => [i * 30, i * 30 + 30]);
    // Hoja de 1000: la fila 33 va de 990 a 1020 → se corta en 990.
    expect(calcularCortes(1500, 1000, filas, [])).toEqual([990]);
  });

  it("si cabe en una hoja, no se corta", () => {
    expect(calcularCortes(900, 1000, [[880, 920]], [])).toEqual([]);
  });

  it("una sección que pide hoja nueva corta ahí aunque sobre espacio", () => {
    expect(calcularCortes(1800, 1000, [], [400])).toEqual([400, 1400]);
  });

  it("un bloque más alto que una hoja sí se parte (no se queda dando vueltas)", () => {
    expect(calcularCortes(2500, 1000, [[100, 2400]], [])).toEqual([1000, 2000]);
  });

  it("nunca deja una hoja con menos de un cuarto de contenido por correr un corte", () => {
    // El bloque empieza en 200 (menos de un cuarto de hoja): se parte en 1000 en vez de dejar la hoja casi vacía.
    expect(calcularCortes(1500, 1000, [[200, 1100]], [])).toEqual([1000]);
  });
});
