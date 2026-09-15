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
