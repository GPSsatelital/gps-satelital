import { describe, it, expect } from "vitest";
import { alEscogerDelEquipo, tarjetaLlenadaPorLaApp, ROLES_QUE_VEN_CEDULAS_EQUIPO } from "./referidoEquipo";

// La tarjeta «Referido por» cuando lo trajo alguien del equipo (pedido del dueño, 2-nov-2026, D-062).
const EQUIPO = [
  { id: "pedro", nombre: "Pedro Pérez" },
  { id: "luis", nombre: "Luis Gómez" },
];
const CEDULAS: ReadonlyMap<string, string> = new Map([["pedro", "1047000111"]]);

describe("al escoger en «¿Alguien del equipo lo trajo?»", () => {
  it("con cédula guardada: la tarjeta sale con su nombre en mayúscula y su cédula", () => {
    expect(alEscogerDelEquipo("pedro", EQUIPO, CEDULAS)).toEqual({
      referido_por_funcionario: "pedro", referido_por_nombre: "PEDRO PÉREZ", referido_por_cedula: "1047000111",
    });
  });

  it("sin cédula guardada: sale el nombre y la cédula queda para escribirla a mano", () => {
    expect(alEscogerDelEquipo("luis", EQUIPO, CEDULAS)).toEqual({
      referido_por_funcionario: "luis", referido_por_nombre: "LUIS GÓMEZ", referido_por_cedula: "",
    });
  });

  it("«Nadie»: la tarjeta queda vacía", () => {
    expect(alEscogerDelEquipo(null, EQUIPO, CEDULAS)).toEqual({
      referido_por_funcionario: null, referido_por_nombre: "", referido_por_cedula: "",
    });
  });
});

describe("¿la tarjeta la llenó la app? (entonces no se toca a mano)", () => {
  it("sí, recién escogida una persona con cédula guardada", () => {
    expect(tarjetaLlenadaPorLaApp(alEscogerDelEquipo("pedro", EQUIPO, CEDULAS), EQUIPO, CEDULAS)).toBe(true);
  });

  it("no, si la persona no tiene cédula guardada: se escribe a mano", () => {
    expect(tarjetaLlenadaPorLaApp(alEscogerDelEquipo("luis", EQUIPO, CEDULAS), EQUIPO, CEDULAS)).toBe(false);
  });

  it("no, con «Nadie» (el referido es otro cliente y se escribe a mano)", () => {
    expect(tarjetaLlenadaPorLaApp({ referido_por_funcionario: null, referido_por_nombre: "ANA RUIZ", referido_por_cedula: "1234567" }, EQUIPO, CEDULAS)).toBe(false);
  });

  it("no, en un cliente viejo escrito a mano con otra cédula: queda como estaba y se puede corregir", () => {
    expect(tarjetaLlenadaPorLaApp({ referido_por_funcionario: "pedro", referido_por_nombre: "PEDRO PÉREZ", referido_por_cedula: "1047000606" }, EQUIPO, CEDULAS)).toBe(false);
  });

  it("sí, en un cliente viejo que ya coincide (con puntos o en minúscula da igual)", () => {
    expect(tarjetaLlenadaPorLaApp({ referido_por_funcionario: "pedro", referido_por_nombre: "pedro pérez ", referido_por_cedula: "1.047.000.111" }, EQUIPO, CEDULAS)).toBe(true);
  });

  it("no, si la lista del equipo todavía no llegó", () => {
    expect(tarjetaLlenadaPorLaApp(alEscogerDelEquipo("pedro", EQUIPO, CEDULAS), [], CEDULAS)).toBe(false);
  });
});

describe("quién ve las cédulas del equipo (espejo de la mig 212)", () => {
  it("el dueño, el ADMIN y la secretaria; nadie más", () => {
    expect([...ROLES_QUE_VEN_CEDULAS_EQUIPO].sort()).toEqual(["ADMIN", "ADMIN_PRINCIPAL", "SECRETARIA"]);
    for (const r of ["SUBADMIN", "VISITADOR", "SOCIO", "MECANICO", "ANALISTA"]) expect(ROLES_QUE_VEN_CEDULAS_EQUIPO.has(r)).toBe(false);
  });
});
