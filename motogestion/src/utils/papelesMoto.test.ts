import { describe, it, expect } from "vitest";
import { papelesMoto, textoBloqueo, DIAS_AVISO, faltaParaExceptuar, ACCION_PAPELES_VENCIDOS } from "./papelesMoto";
import { calcularPuede, ACCION_KEYS } from "../lib/acciones";

// SIN PAPELES AL DÍA NO SE ENTREGA LA MOTO (dueño, 27/28-oct-2026): vencido, sin fecha o mal
// escrito bloquea y nadie se lo salta; si vence en pocos días, solo avisa.

const HOY = "2026-10-28";
const moto = (soat: string | null, tecno: string | null) => ({ fecha_seguro: soat, fecha_tecnomecanica: tecno });

describe("cuándo se puede entregar", () => {
  it("con los dos papeles lejos de vencer se entrega sin aviso", () => {
    const r = papelesMoto(moto("2027-08-05", "2027-08-05"), HOY);
    expect(r.puedeEntregar).toBe(true);
    expect(r.bloqueos).toEqual([]);
    expect(r.avisos).toEqual([]);
  });

  it("sin la fecha del SOAT no se entrega (RLY50H)", () => {
    const r = papelesMoto(moto(null, "2027-08-20"), HOY);
    expect(r.puedeEntregar).toBe(false);
    expect(r.bloqueos).toEqual(["Falta la fecha del SOAT"]);
  });

  it("sin la fecha de la tecnomecánica tampoco", () => {
    const r = papelesMoto(moto("2027-08-20", null), HOY);
    expect(r.puedeEntregar).toBe(false);
    expect(r.bloqueos).toEqual(["Falta la fecha de la tecnomecánica"]);
  });

  it("vencido ayer no se entrega", () => {
    const r = papelesMoto(moto("2026-10-27", "2027-10-27"), HOY);
    expect(r.puedeEntregar).toBe(false);
    expect(r.bloqueos).toEqual(["SOAT vencido el 27-oct-2026"]);
  });

  it("si vence HOY todavía está vigente: se entrega con aviso", () => {
    const r = papelesMoto(moto("2026-10-28", "2027-10-28"), HOY);
    expect(r.puedeEntregar).toBe(true);
    expect(r.avisos).toEqual(["El SOAT vence hoy (28-oct-2026)"]);
  });

  it(`a ${DIAS_AVISO} días avisa; a ${DIAS_AVISO + 1} ya no`, () => {
    const a15 = papelesMoto(moto("2027-05-01", "2026-11-12"), HOY);
    expect(a15.puedeEntregar).toBe(true);
    expect(a15.avisos).toEqual(["La tecnomecánica vence en 15 días (12-nov-2026)"]);
    const a16 = papelesMoto(moto("2027-05-01", "2026-11-13"), HOY);
    expect(a16.avisos).toEqual([]);
  });

  it("vence mañana", () => {
    expect(papelesMoto(moto("2026-10-29", "2027-10-29"), HOY).avisos).toEqual(["El SOAT vence mañana (29-oct-2026)"]);
  });

  it("el año mal escrito (0028, el de DQL79I) bloquea: no se puede saber si está al día", () => {
    const r = papelesMoto(moto("2027-03-24", "0028-03-25"), HOY);
    expect(r.puedeEntregar).toBe(false);
    expect(r.bloqueos).toEqual(["La fecha de la tecnomecánica está mal escrita (0028-03-25)"]);
  });

  it("los dos vencidos dan los dos motivos (EXT61H)", () => {
    const r = papelesMoto(moto("2026-10-21", "2026-10-20"), HOY);
    expect(r.bloqueos).toEqual(["SOAT vencido el 21-oct-2026", "Tecnomecánica vencida el 20-oct-2026"]);
  });

  it("uno vencido y el otro por vencer: bloquea y además avisa", () => {
    const r = papelesMoto(moto("2026-10-01", "2026-10-31"), HOY);
    expect(r.puedeEntregar).toBe(false);
    expect(r.avisos).toEqual(["La tecnomecánica vence en 3 días (31-oct-2026)"]);
  });

  it("el texto del bloqueo dice dónde arreglarlo", () => {
    const r = papelesMoto(moto("2026-09-26", "2027-09-26"), HOY);
    expect(textoBloqueo("RMU76H", r)).toBe(
      "No se puede entregar RMU76H: SOAT vencido el 26-sep-2026. Actualice la fecha en Motos › RMU76H › Editar.");
  });
});

// La única excepción (dueño, 14-nov-2026, D-088): devolver la retenida con papeles vencidos, con motivo y
// casilla. El ADMIN_PRINCIPAL siempre; a otro se le prende en Usuarios (CARLOS ALVAREZ, el mismo día).
// Caso que la pidió: ZHO35G (SOAT 27-sep, tecno 16-may).
describe("la excepción al devolver la moto retenida", () => {
  it("la acción existe en Usuarios", () => {
    expect(ACCION_KEYS).toContain(ACCION_PAPELES_VENCIDOS);
  });

  it("de entrada solo la tiene el ADMIN_PRINCIPAL; ningún rol la trae", () => {
    expect(calcularPuede("ADMIN_PRINCIPAL", null, ACCION_PAPELES_VENCIDOS)).toBe(true);
    for (const rol of ["ADMIN", "SUBADMIN", "SECRETARIA", "MECANICO", "SOCIO", "VISITADOR"] as const) {
      expect(calcularPuede(rol, null, ACCION_PAPELES_VENCIDOS)).toBe(false);
    }
  });

  it("prendida a una persona en Usuarios, esa persona sí puede (y se le puede volver a quitar)", () => {
    expect(calcularPuede("SUBADMIN", { [ACCION_PAPELES_VENCIDOS]: "permitir" }, ACCION_PAPELES_VENCIDOS)).toBe(true);
    expect(calcularPuede("SUBADMIN", { [ACCION_PAPELES_VENCIDOS]: "bloquear" }, ACCION_PAPELES_VENCIDOS)).toBe(false);
  });

  it("sin motivo no deja, aunque marque la casilla", () => {
    expect(faltaParaExceptuar("", true)).toBe("Escribe por qué se entrega con los papeles vencidos.");
    expect(faltaParaExceptuar("   ok     ", true)).toBe("Escribe por qué se entrega con los papeles vencidos.");
  });

  it("con motivo pero sin la casilla tampoco", () => {
    expect(faltaParaExceptuar("El SOAT se compra el lunes", false))
      .toBe("Marca la casilla: la entregas con los papeles vencidos bajo tu responsabilidad.");
  });

  it("con motivo y casilla queda completa", () => {
    expect(faltaParaExceptuar("El SOAT se compra el lunes", true)).toBeNull();
  });

  it("la excepción no cambia la regla: la moto sigue sin poder entregarse por papeles", () => {
    const r = papelesMoto(moto("2026-09-27", "2026-05-16"), "2026-11-14");
    expect(r.puedeEntregar).toBe(false);
    expect(r.bloqueos).toEqual(["SOAT vencido el 27-sep-2026", "Tecnomecánica vencida el 16-may-2026"]);
  });
});
