import { describe, it, expect } from "vitest";
import { calcularPuede, ACCION_KEYS } from "./acciones";
import { VISTAS_AUXILIAR, ACCESOS_SUGERIDOS } from "./modulos";

// D-095 (mig 226): el auxiliar administrativo no tiene NINGUNA acción, ni aunque alguien se la marque
// a mano en Usuarios. Espejo de puede_accion() en la base: si se toca uno, tocar el otro.
describe("auxiliar administrativo: acciones", () => {
  it("no puede ninguna acción con su rol", () => {
    for (const a of ACCION_KEYS) expect(calcularPuede("AUXILIAR", null, a)).toBe(false);
  });

  it("un permiso marcado a mano no le sirve (Johan llega de SUBADMIN)", () => {
    const todas = Object.fromEntries(ACCION_KEYS.map(a => [a, "permitir" as const]));
    for (const a of ACCION_KEYS) expect(calcularPuede("AUXILIAR", todas, a)).toBe(false);
  });

  it("a los demás roles no les cambia nada: un permiso a mano sigue valiendo", () => {
    expect(calcularPuede("SUBADMIN", { registrar_efectivo: "permitir" }, "registrar_efectivo")).toBe(true);
    expect(calcularPuede("VISITADOR", { registrar_efectivo: "permitir" }, "registrar_efectivo")).toBe(true);
  });
});

describe("auxiliar administrativo: pantallas", () => {
  it("abre solo sus listas, sus visitas, confirmar ubicación y su cuenta", () => {
    expect([...VISTAS_AUXILIAR].sort()).toEqual(
      ["configuracion", "confirmar_ubicacion", "contratos", "mis_visitas", "motos", "taller"],
    );
  });

  it("no abre nada de plata ni de clientes", () => {
    for (const v of ["dashboard", "clientes", "cobros", "caja", "historial_pagos", "liquidaciones", "ficha_cliente", "ficha_moto", "mi_dia", "reportes", "usuarios"] as const) {
      expect(VISTAS_AUXILIAR).not.toContain(v);
    }
  });

  it("lo que se le guarda como accesos está dentro de lo que puede abrir", () => {
    for (const v of ACCESOS_SUGERIDOS.AUXILIAR) expect(VISTAS_AUXILIAR).toContain(v);
  });
});
