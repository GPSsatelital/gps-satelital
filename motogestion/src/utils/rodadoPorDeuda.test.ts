import { describe, it, expect } from "vitest";
import { semanasACobrar, textoDeclaracion, htmlRodadoPorDeuda, type CalculoRodado } from "./rodadoPorDeuda";

describe("rodado por deuda — la regla de las semanas de más (D-044)", () => {
  it("hasta 4 semanas, una más", () => {
    expect(semanasACobrar(1)).toBe(2);
    expect(semanasACobrar(3)).toBe(4);
    expect(semanasACobrar(4)).toBe(5);
  });
  it("desde la 5ª, una más por cada 2 completas (el par incompleto no suma)", () => {
    expect(semanasACobrar(5)).toBe(6);
    expect(semanasACobrar(6)).toBe(8);
    expect(semanasACobrar(7)).toBe(9);
    expect(semanasACobrar(8)).toBe(11);
    expect(semanasACobrar(10)).toBe(14);
  });
  it("sin semanas no hay nada que cobrar", () => {
    expect(semanasACobrar(0)).toBe(0);
  });
});

const caso: CalculoRodado = {
  puede: true, razones: [], avisos: [], contrato_id: "x", cliente: "Luis Fernando Solano", cedula: "123",
  placa: "EXT59H", valor_semana: 195000, hoy: "2026-10-07",
  antes: { cuotas: 200000, acuerdo: 0, deudas: 1455200, total: 1655200, estado: "mora", dias_mora: 10 },
  tiempo_total: 1655200, semanas_rodadas: 8, semanas_extra: 3, semanas_a_cobrar: 11,
  monto_rodado: 1560000, monto_a_cobrar: 2145000, sobrante: 95200,
  despues: { cuotas: 5000, acuerdo: 0, deudas: 90200, total: 95200, estado: "gabela", dias_mora: 0 },
  fecha_fin_antes: "2027-06-01", fecha_fin_aprox: "2027-08-17", deudas_no_rodables: [],
};

describe("rodado por deuda — lo que dice el cliente y el papel", () => {
  it("el video empieza con la fecha del día y dice sus cifras", () => {
    const t = textoDeclaracion(caso, "2026-10-07");
    expect(t.startsWith("Hoy, 7 de octubre de 2026")).toBe(true);
    expect(t).toContain("LUIS FERNANDO SOLANO");
    expect(t).toContain("8 semanas");
    expect(t).toContain("11 semanas");
    expect(t).toContain("17 de agosto de 2027");
    expect(t).toContain("no cubre el SOAT ni la tecnomecánica");
  });
  it("el documento lleva la advertencia del SOAT y la tecnomecánica y las cifras", () => {
    const h = htmlRodadoPorDeuda(caso);
    expect(h).toContain("no cubre el SOAT ni la revisión tecnomecánica");
    expect(h).toContain("$1.655.200");
    expect(h).toContain("11 semanas");
    expect(h).toContain("$95.200");
  });
});
