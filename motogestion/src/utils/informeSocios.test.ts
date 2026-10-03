import { describe, it, expect } from "vitest";
import { informeSociosHTML, type DatosInforme } from "./informeSocios";

const base: DatosInforme = {
  periodo: "1 al 30 de septiembre de 2026", filtros: "todos los grupos · todos los cobradores", generado: "2 de octubre de 2026",
  resumen: {
    recaudo: { total: 1000000, empresa: 800000, ahorro: 150000, baseYSaldo: 50000, anterior: 800000, textoAnterior: "agosto", antes: 0 },
    cumplimiento: { pct: 80, debia: 500000, cubrio: 400000, aAcuerdo: 0 },
    estados: [{ etiqueta: "Al día", hoy: 10, cierre: null }], cierreTexto: null,
    tramos: [{ etiqueta: "1 a 7 días", n: 2, debe: 300000 }], sinProducir: { motos: 1, dias: 5, estimado: 135000 },
  },
  cobranza: {
    debe: { total: 300000, semanas: 200000, acuerdo: 50000, deudas: 50000, clientes: 2 }, cobrable: { conMoto: 200000, retenidas: 100000 },
    estados: [{ etiqueta: "En mora", n: 2 }], porGrupo: [{ nombre: "COSTA", debe: 300000, clientes: 2 }], porCobrador: [{ nombre: "Ana", debe: 300000, clientes: 2 }],
    mayores: [{ cliente: "Pedro Pérez", placa: "ABC12D", grupo: "COSTA", detalle: "3 días en mora", debe: 200000 }], saldoFavor: { total: 0, clientes: 0 },
    acuerdos: { n: 1, pactado: 400000, pagado: 100000, falta: 300000, atrasado: 50000, aldia: 0, atrasados: 1, vencidos: 0, sinAbono: 0, vencenPronto: 0, faltaPronto: 0 },
  },
  portafolios: { grupos: [{ grupo: "COSTA", recaudo: 1000000, pctCum: 80, enMora: 2, trabajando: 10, contratos: 10 }], cobradores: [{ nombre: "Ana", recaudo: 900000, pctCum: 80, enMora: 2, motos: 10 }], antesDeAsignar: 100000 },
  equipo: {
    nomina: null,
    visitas: { total: 1, aprobadas: 0, esperando: 0, repetir: 0, rechazadas: 1, sinResultado: 0, pendientes: 0, conMoto: 0, mediana: null, maximo: null, hechas: 1, conGps: 1, conFoto: 1, personas: [{ nombre: "Ana", total: 1, aprobadas: 0 }] },
  },
  flota: { total: 10, lugares: [{ etiqueta: "Trabajando con cliente", n: 10 }], grupos: [{ grupo: "COSTA", total: 10, trabajando: 10 }], papeles: { vencidos: 0, porVencer: 0, sinSoat: 0 }, guardadas: { motos: 0, dias: 0 } },
  anexos: {
    matriz: { grupos: ["COSTA", "PRADERA"], filas: [{ nombre: "Ana", celdas: [600000, 300000], total: 900000 }], antes: 100000 },
    metodo: [{ nombre: "Ana", efectivo: 400000, transferencia: 500000 }, { nombre: "Antes de asignar", efectivo: 0, transferencia: 100000 }],
    sinAcuerdo: [],
  },
  detalle: { enMora: [], retenidas: [], acuerdos: [], guardadas: [] },
};

describe("el informe para los socios (Descargar, 2-oct)", () => {
  it("trae solo las secciones marcadas, y los anexos siempre", () => {
    const html = informeSociosHTML(base, { secciones: ["resumen"], detalle: false });
    expect(html).toContain("Resumen");
    expect(html).not.toContain(">Cobranza<");
    expect(html).not.toContain(">Flota<");
    expect(html).toContain("Anexos");
    expect(html).not.toContain("Listas completas");
  });

  it("los anexos suman: la matriz por columna y efectivo más transferencias con lo de antes de asignar", () => {
    const html = informeSociosHTML(base, { secciones: [], detalle: false });
    expect(html).toContain("$900.000");      // total de la matriz (Ana)
    expect(html).toContain("$1.000.000");    // efectivo + transferencias, con los $100.000 de antes
    expect(html).toContain("Antes de asignar: $100.000.");
  });

  it("dice las cosas en buen español y sin emojis", () => {
    const html = informeSociosHTML(base, { secciones: ["equipo"], detalle: true });
    expect(html).toContain("1 visita:");
    expect(html).toContain("1 rechazada.");
    expect(html).toContain("La nómina no se pudo incluir");
    expect(html).toContain("Listas completas");
    expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html)).toBe(false);
  });
});
