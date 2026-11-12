import { describe, it, expect } from "vitest";
import { htmlDesprendibleNomina } from "./generarDesprendibleNomina";
import { resumirRenglones, type GestionNomina, type MotoSinGestion } from "./nominaCobradores";

// EL DESPRENDIBLE ES EL PAPEL QUE EL COBRADOR FIRMA. Si dice solo lo que se le paga, no puede
// reclamar lo que NO se le pagó — por eso el reverso va impreso, no solo en pantalla.

const gestion = (o: Partial<GestionNomina> = {}): GestionNomina => ({
  motoId: "m1", placa: "ABC12D", grupo: "PRADERA", cliente: "JUAN PEREZ",
  tipo: "ciclo", fecha: "2026-08-17", valor: 7500, ...o,
});

const falta = (o: Partial<MotoSinGestion> = {}): MotoSinGestion => ({
  motoId: "m9", placa: "XYZ99Z", grupo: "COSTA", cliente: "PEDRO MORA",
  cobradorId: "PEDRO", motivo: "no_pago", ...o,
});

const papel = (renglones: GestionNomina[], extra?: Parameters<typeof htmlDesprendibleNomina>[5]) =>
  htmlDesprendibleNomina(resumirRenglones("PEDRO", renglones), "PEDRO", "2026-08-17", "2026-08-23", "ANGELA", extra);

describe("el desprendible imprime también lo que NO se pagó", () => {
  it("sin el reverso, el papel sale igual que siempre", () => {
    const h = papel([gestion()]);
    expect(h).toContain("ABC12D");
    expect(h).not.toContain("No se pagó");
    expect(h).not.toContain("motos asignadas");
  });

  it("lista cada moto sin gestión con placa, cliente y motivo", () => {
    const h = papel([gestion()], {
      sinGestion: [falta()],
      motosAsignadas: 2,
    });
    expect(h).toContain("No se pagó — 1 moto");
    expect(h).toContain("XYZ99Z");
    expect(h).toContain("PEDRO MORA");
    expect(h).toContain("No pagó su semana");
  });

  it("el encabezado dice cuántas tiene y cuántas pagaron", () => {
    const h = papel([gestion()], { sinGestion: [falta(), falta({ motoId: "m8", placa: "QQQ11Q" })], motosAsignadas: 10 });
    expect(h).toContain("10 motos asignadas · 8 con gestión · 2 sin gestión");
  });

  it("agrupa por motivo y deja las que no tienen cliente de últimas", () => {
    const h = papel([gestion()], {
      motosAsignadas: 4,
      sinGestion: [
        falta({ motoId: "a", placa: "AAA11A", motivo: "sin_contrato", cliente: "—" }),
        falta({ motoId: "b", placa: "BBB22B", motivo: "no_pago" }),
        falta({ motoId: "c", placa: "CCC33C", motivo: "retenida_sin_abono" }),
      ],
    });
    const posNoPago = h.indexOf("1 · No pagó su semana");
    const posRetenida = h.indexOf("1 · Retenida");
    const posSinCliente = h.indexOf("1 · Sin cliente");
    expect(posNoPago).toBeGreaterThan(-1);
    expect(posRetenida).toBeGreaterThan(-1);
    // Lo que sí es gestión pendiente va ANTES de lo que no tiene nada que cobrar.
    expect(posSinCliente).toBeGreaterThan(posNoPago);
    expect(posSinCliente).toBeGreaterThan(posRetenida);
  });

  it("las que no se pagaron salen en $0, no en blanco: el papel no deja huecos", () => {
    const h = papel([gestion()], { sinGestion: [falta()], motosAsignadas: 2 });
    const bloque = h.slice(h.indexOf("No se pagó"));
    expect(bloque).toContain("$0");
  });

  it("el TOTAL A PAGAR no cambia por mostrar el reverso", () => {
    const solo = papel([gestion()]);
    const conReverso = papel([gestion()], { sinGestion: [falta()], motosAsignadas: 2 });
    const total = (h: string) => h.slice(h.indexOf("TOTAL A PAGAR"), h.indexOf("TOTAL A PAGAR") + 90);
    expect(total(conReverso)).toBe(total(solo));
  });
});

describe("el comprobante del pago del 15 y el 30", () => {
  it("lista cada semana cerrada con su valor, el total y la firma de recibido", async () => {
    const { htmlComprobantePagoNomina } = await import("./generarDesprendibleNomina");
    const html = htmlComprobantePagoNomina({
      cobradorNombre: "Carlos Ariza", fecha: "2026-11-15", total: 390000,
      semanas: [{ semana_lunes: "2026-11-02", total: 210000 }, { semana_lunes: "2026-10-26", total: 180000 }],
    }, "Fredy Mora");
    expect(html).toContain("CARLOS ARIZA");
    expect(html.indexOf("26 de oct")).toBeGreaterThan(-1);
    expect(html.indexOf("26 de oct")).toBeLessThan(html.indexOf("2 de nov"));   // en orden
    expect(html).toContain("$180.000");
    expect(html).toContain("$210.000");
    expect(html).toContain("$390.000");
    expect(html).toContain("recibí conforme");
  });
});

describe("el papel explica cada renglón (revisión del 11-nov-2026, D-084)", () => {
  it("la semana atrasada dice cuál era y por qué llegó tarde, debajo de la gestión", () => {
    const porque = "Semana del 5 al 11 de oct: la pagó el 9 de oct, pero la cuota del acuerdo llegó el 17 de oct.";
    const h = papel([gestion({ tipo: "ciclo_atrasado", valor: 3750, fecha: "2026-10-17", porque })]);
    expect(h).toContain(`Ciclo atrasado (50%)<div class="detalle">${porque}</div>`);
  });

  it("la que abonó sin completar dice cuánto, y la recién entregada cuándo es su primer cobro", () => {
    const h = papel([gestion()], {
      motosAsignadas: 3,
      sinGestion: [
        falta({ detalle: "Abonó $200.000 de $202.000: le faltaron $2.000." }),
        falta({ motoId: "m7", placa: "IGC44I", motivo: "no_tocaba", detalle: "Recién entregada el 29 de oct: su primer cobro es el lunes 2 de nov" }),
      ],
    });
    expect(h).toContain("Abonó $200.000 de $202.000: le faltaron $2.000.");
    expect(h).toContain("IGC44I");
    expect(h).toContain("Recién entregada el 29 de oct: su primer cobro es el lunes 2 de nov");
    expect(h).toContain("3 motos asignadas · 1 con gestión · 2 sin gestión");
  });

  it("un renglón de un cierre viejo, sin explicación, sale como siempre", () => {
    const h = papel([gestion({ tipo: "ciclo_atrasado", valor: 3750 })]);
    expect(h).toContain("<td>Ciclo atrasado (50%)</td>");
  });
});
