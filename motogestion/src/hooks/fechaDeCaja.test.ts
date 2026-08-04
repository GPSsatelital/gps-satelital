import { describe, it, expect } from "vitest";
import { fechaDeCaja, esPagoDeCaja } from "./usePagos";

// EN QUÉ CAJA CAE CADA PESO. Las 7 pantallas que muestran plata del día (Caja Diaria, Cobro
// Diario, Cartera, Panel, Reportes, panel del Socio) preguntan por esta función, así que un
// error acá se ve en todas a la vez.
//
// La regla, decidida por el dueño el 4-ago-2026 con los números en la mano:
//   · EFECTIVO      → el día en que se DIGITÓ. Llega en la mano y se cuenta ese mismo día.
//   · TRANSFERENCIA → el día en que EL BANCO la recibió. Tiene fecha propia y verificable.
//
// Qué se estaba viendo antes del cambio: la secretaria digita en la mañana lo del día anterior,
// así que la caja del martes 4 tenía $5.983.000 de plata que el banco recibió el lunes 3 — el
// 97% de su total. Ningún arqueo contra el extracto podía cuadrar.

const efectivo = (fecha: string, fecha_registro: string | null) =>
  ({ fecha, fecha_registro, metodo: "Efectivo" as const });
const transferencia = (fecha: string, fecha_registro: string | null) =>
  ({ fecha, fecha_registro, metodo: "Transferencia" as const });

describe("fechaDeCaja — EFECTIVO (esto NO puede cambiar nunca)", () => {
  it("cuenta en el día en que se digitó", () => {
    // Cobrado en la calle el domingo, entregado y digitado el lunes: la plata entra a la caja
    // del lunes, que es el día en que de verdad está en el cajón.
    expect(fechaDeCaja(efectivo("2026-08-02", "2026-08-03"))).toBe("2026-08-03");
  });

  it("pago viejo sin fecha_registro (antes de la mig 064) → usa su fecha", () => {
    expect(fechaDeCaja(efectivo("2026-06-15", null))).toBe("2026-06-15");
  });

  it("el efectivo del mismo día cae donde siempre", () => {
    expect(fechaDeCaja(efectivo("2026-08-04", "2026-08-04"))).toBe("2026-08-04");
  });
});

describe("fechaDeCaja — TRANSFERENCIA (la regla nueva)", () => {
  it("el cliente transfirió el lunes y se digitó el martes → caja del LUNES", () => {
    // Este es el caso real de las 31 transferencias del 3-ago que caían en la caja del 4.
    expect(fechaDeCaja(transferencia("2026-08-03", "2026-08-04"))).toBe("2026-08-03");
  });

  it("da igual cuántos días después se digite", () => {
    expect(fechaDeCaja(transferencia("2026-07-25", "2026-08-04"))).toBe("2026-07-25");
  });

  it("una que ya cruzó con el extracto no se mueve (las dos fechas son la del banco)", () => {
    expect(fechaDeCaja(transferencia("2026-08-01", "2026-08-01"))).toBe("2026-08-01");
  });

  it("transferencia vieja sin fecha_registro → su fecha, igual que antes", () => {
    expect(fechaDeCaja(transferencia("2026-06-15", null))).toBe("2026-06-15");
  });
});

describe("esPagoDeCaja — los movimientos internos NO son plata que entró", () => {
  // adelanto_base = la semana adelantada que ya venía dentro de la base inicial.
  // saldo_favor   = aplicar un crédito viejo del cliente a su cuota; no entra dinero nuevo.
  // Contarlos como recaudo infla la caja con plata que nadie trajo ese día.
  it("adelanto_base no cuenta", () => {
    expect(esPagoDeCaja({ tipo_registro: "adelanto_base" })).toBe(false);
  });
  it("saldo_favor no cuenta", () => {
    expect(esPagoDeCaja({ tipo_registro: "saldo_favor" })).toBe(false);
  });
  it("el cobro en campo SÍ cuenta (es plata que el funcionario recogió)", () => {
    expect(esPagoDeCaja({ tipo_registro: "campo" })).toBe(true);
  });
  it("el alquiler de una moto prestada SÍ cuenta", () => {
    expect(esPagoDeCaja({ tipo_registro: "alquiler_reemplazo" })).toBe(true);
  });
  it("un pago normal cuenta", () => {
    expect(esPagoDeCaja({ tipo_registro: "normal" })).toBe(true);
  });
});
