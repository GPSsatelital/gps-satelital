import { describe, it, expect } from "vitest";
import { textoDia, esCierreDeMes, opcionesDia, avisoDelDia, type FechaAnotada } from "./carteraDelDia";
import { informeSociosHTML, type DatosInforme } from "./informeSocios";

// La cartera de un día pasado (D-043, mig 190). Lo que estas pruebas cuidan: que un día pasado
// NUNCA se presente como "hoy", y que el selector solo ofrezca los días que de verdad tienen cuaderno.

const f = (fecha: string, como: FechaAnotada["como"] = "anotada"): FechaAnotada => ({ fecha, como, contratos: 338, anotada_el: fecha + "T23:55:00" });

describe("cómo se nombra un día", () => {
  it("sin el año si es el de hoy, con el año si es otro", () => {
    expect(textoDia("2026-09-30", "2026-10-08")).toBe("30 de septiembre");
    expect(textoDia("2025-12-31", "2026-10-08")).toBe("31 de diciembre de 2025");
  });

  it("el último día del mes es cierre de mes (también en febrero y en diciembre)", () => {
    expect(esCierreDeMes("2026-09-30")).toBe(true);
    expect(esCierreDeMes("2026-02-28")).toBe(true);
    expect(esCierreDeMes("2026-12-31")).toBe(true);
    expect(esCierreDeMes("2026-10-06")).toBe(false);
  });
});

describe("el selector de días", () => {
  it("primero hoy; después los días pasados, del más nuevo al más viejo", () => {
    const ops = opcionesDia([f("2026-10-06"), f("2026-10-07")], "2026-10-08");
    expect(ops.map(o => o.valor)).toEqual(["", "2026-10-07", "2026-10-06"]);
    expect(ops[0].etiqueta).toBe("Día: hoy");
    expect(ops[1].etiqueta).toBe("Día: miércoles 7 de octubre");
  });

  it("el de hoy no se ofrece como día pasado: ya se ve en vivo", () => {
    const ops = opcionesDia([f("2026-10-07"), f("2026-10-08")], "2026-10-08");
    expect(ops.map(o => o.valor)).toEqual(["", "2026-10-07"]);
  });

  it("marca el cierre de mes y lo calculado después", () => {
    const ops = opcionesDia([f("2026-09-30", "calculada_despues")], "2026-10-08");
    expect(ops[1].etiqueta).toBe("Día: miércoles 30 de septiembre · cierre de mes · calculado después");
  });

  it("sin días anotados todavía, avisa desde cuándo y no deja escoger nada", () => {
    const ops = opcionesDia([], "2026-10-06");
    expect(ops).toHaveLength(2);
    expect(ops[1].deshabilitada).toBe(true);
  });
});

describe("el aviso de arriba", () => {
  it("dice que es lo anotado esa noche, y cuántos diarios no entran", () => {
    expect(avisoDelDia("anotada", "2026-10-06", "2026-10-08", 0)).toContain("Anotado la noche del 6 de octubre");
    expect(avisoDelDia("anotada", "2026-10-06", "2026-10-08", 3)).toContain("No incluye 3 contratos diarios");
    expect(avisoDelDia("anotada", "2026-10-06", "2026-10-08", 1)).toContain("No incluye 1 contrato diario");
  });

  it("lo calculado después se presenta como aproximado", () => {
    expect(avisoDelDia("calculada_despues", "2026-09-30", "2026-10-08", 0)).toContain("aproximado");
  });
});

describe("el PDF de un día pasado no dice 'hoy' ni trae los acuerdos de hoy", () => {
  const cobranza: DatosInforme["cobranza"] = {
    debe: { total: 135322100, semanas: 100000000, acuerdo: 20000000, deudas: 15322100, clientes: 200 }, cobrable: { conMoto: 100000000, retenidas: 35322100 },
    estados: [{ etiqueta: "En mora", n: 60 }], porGrupo: [{ nombre: "COSTA", debe: 135322100, clientes: 200 }], porCobrador: [{ nombre: "Ana", debe: 135322100, clientes: 200 }],
    mayores: [{ cliente: "Pedro Pérez", placa: "ABC12D", grupo: "COSTA", detalle: "3 días en mora", debe: 200000 }], saldoFavor: { total: 5100000, clientes: 95 },
    acuerdos: { n: 78, pactado: 64400000, pagado: 1000000, falta: 63400000, atrasado: 500000, aldia: 0, atrasados: 1, vencidos: 0, sinAbono: 25, vencenPronto: 0, faltaPronto: 0 },
  };
  const datos = (dia: string | null) => ({ cobranza: { ...cobranza, dia } }) as unknown as DatosInforme;

  it("hoy: como siempre, con los acuerdos", () => {
    const html = informeSociosHTML(datos(null), { secciones: ["cobranza"], detalle: false, anexos: false } as never);
    expect(html).toContain("Lo que se debe hoy");
    expect(html).toContain("Acuerdos de pago");
  });

  it("6 de octubre: todo en pasado, el día escrito, y sin acuerdos", () => {
    const html = informeSociosHTML(datos("6 de octubre"), { secciones: ["cobranza"], detalle: false, anexos: false } as never);
    expect(html).toContain("Lo que se debía el 6 de octubre");
    expect(html).toContain("Cómo iban pagando ese día");
    expect(html).toContain("que más debían");
    expect(html).toContain("tenían");
    expect(html).not.toContain("Lo que se debe hoy");
    expect(html).not.toContain("Cómo van pagando hoy");
    expect(html).not.toContain("Acuerdos de pago");
  });
});
