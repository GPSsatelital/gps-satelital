import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx-js-style";
import { estilarSeccionesWS, type SeccionesOpts } from "./exportar";

// 5-oct-2026: el dueño abrió "Lo que se debe hoy" y los títulos salían cortados ("otas del contra",
// "Deud", "To") y "Cómo va" decía "para recoger la mot". Estas pruebas cuidan que no vuelva a pasar.
const base = (extra: Partial<SeccionesOpts> = {}): SeccionesOpts => ({
  titulo: "Lo que se debe hoy", periodo: "Al 5 de octubre de 2026",
  columnas: [
    { label: "Cliente", ancho: 220 }, { label: "Cómo va", ancho: 200 },
    { label: "Cuotas del contrato", align: "right", ancho: 110 }, { label: "Total", align: "right", ancho: 110 },
  ],
  secciones: [{ titulo: "COSTA — 2 clientes", filas: [
    ["GABRIEL ENRIQUE ESQUIAQUI PEREA", "27 días en mora · para recoger la moto", { num: 2020000 }, { num: 2050000 }],
    [{ v: "SIN UN SOLO ABONO desde que se firmó (hace 69 días)" }, "", "", ""],
  ] }],
  totalGeneral: [{ v: "TOTAL: 2 clientes", bold: true }, "", { num: 2020000 }, { num: 2050000 }],
  ...extra,
});
const filaDe = (ws: XLSX.WorkSheet, texto: string) =>
  Object.keys(ws).filter(k => !k.startsWith("!")).find(k => (ws[k] as { v?: unknown }).v === texto);

describe("Excel: nada sale cortado", () => {
  it("cada columna cabe su título (con la flechita del filtro) y su dato más largo", () => {
    const ws = estilarSeccionesWS(base());
    const anchos = (ws["!cols"] ?? []).map(c => c.wch ?? 0);
    expect(anchos[2]).toBeGreaterThanOrEqual(Math.ceil("Cuotas del contrato".length * 1.2) + 4);
    expect(anchos[1]).toBeGreaterThanOrEqual("27 días en mora · para recoger la moto".length + 2);
    expect(anchos[0]).toBeGreaterThanOrEqual("GABRIEL ENRIQUE ESQUIAQUI PEREA".length + 2);
  });

  it("los títulos de las columnas de plata van centrados, no debajo de la flechita", () => {
    const ws = estilarSeccionesWS(base());
    const celda = ws[filaDe(ws, "Cuotas del contrato")!] as { s?: { alignment?: { horizontal?: string } } };
    expect(celda.s?.alignment?.horizontal).toBe("center");
  });

  it("una nota de una sola celda va de lado a lado y no ensancha la primera columna", () => {
    const ws = estilarSeccionesWS(base());
    const fila = XLSX.utils.decode_cell(filaDe(ws, "SIN UN SOLO ABONO desde que se firmó (hace 69 días)")!).r;
    expect(ws["!merges"]).toContainEqual({ s: { r: fila, c: 0 }, e: { r: fila, c: 3 } });
    // Sin la nota, la primera columna mide lo mismo.
    const sinNota = estilarSeccionesWS(base({ secciones: [{ titulo: "COSTA", filas: [base().secciones[0].filas[0]] }] }));
    expect(ws["!cols"]![0].wch).toBe(sinNota["!cols"]![0].wch);
  });

  it("la etiqueta del TOTAL ocupa las celdas vacías que la siguen", () => {
    const ws = estilarSeccionesWS(base());
    const fila = XLSX.utils.decode_cell(filaDe(ws, "TOTAL: 2 clientes")!).r;
    expect(ws["!merges"]).toContainEqual({ s: { r: fila, c: 0 }, e: { r: fila, c: 1 } });
  });

  it("una fila de datos con celdas vacías al final NO se une (no es una nota)", () => {
    const ws = estilarSeccionesWS(base({ secciones: [{ titulo: "COSTA", filas: [["ANA PEREZ", "al día", "", ""]] }] }));
    const fila = XLSX.utils.decode_cell(filaDe(ws, "ANA PEREZ")!).r;
    expect((ws["!merges"] ?? []).some(m => m.s.r === fila)).toBe(false);
  });
});
