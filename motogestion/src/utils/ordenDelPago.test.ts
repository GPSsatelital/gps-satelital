import { describe, it, expect } from "vitest";
import { avisoOrdenDelPago, type PagoParaAviso } from "./ordenDelPago";

// El caso de PEDRO (IEW90I): las transferencias del 14 y el 15-oct se confirmaron DESPUÉS de las del
// 21 y el 23, y su plata cayó a saldo a favor. El aviso sale antes de confirmar, en los dos órdenes.

const t = (id: string, fecha: string, valor: number, estado: string, extra: Partial<PagoParaAviso> = {}): PagoParaAviso =>
  ({ id, fecha, valor, estado, metodo: "Transferencia", ...extra });

describe("aviso al confirmar una transferencia en desorden (D-059)", () => {
  it("caso A: hay otra transferencia más vieja sin confirmar", () => {
    const esta = t("b1", "2026-10-21", 70000, "Pendiente");
    const aviso = avisoOrdenDelPago(esta, [esta, t("a1", "2026-10-14", 100000, "Pendiente")]);
    expect(aviso).toBe(
      "Este cliente tiene otra transferencia más vieja sin confirmar: $100.000 del 14 de octubre.\n"
      + "Confirme primero la más vieja. Si confirma esta antes, la plata de la más vieja quedará como saldo a favor y las semanas pueden verse atrasadas.\n"
      + "¿Confirmar esta de todos modos?");
  });

  it("caso A con varias: las nombra todas, de la más vieja a la más nueva", () => {
    const esta = t("b1", "2026-10-21", 70000, "Pendiente");
    const aviso = avisoOrdenDelPago(esta, [t("a2", "2026-10-15", 102000, "Pendiente"), t("a1", "2026-10-14", 100000, "Pendiente")]);
    expect(aviso).toContain("tiene 2 transferencias más viejas sin confirmar: $100.000 del 14 de octubre y $102.000 del 15 de octubre.");
    expect(aviso).toContain("Confirme primero las más viejas.");
  });

  it("caso B: ya se confirmó un pago más nuevo que llenó semanas", () => {
    const esta = t("a1", "2026-10-15", 102000, "Pendiente");
    const aviso = avisoOrdenDelPago(esta, [
      t("b1", "2026-10-21", 70000, "Confirmado", { aplicado_tarifa: 70000 }),
      t("b2", "2026-10-23", 62000, "Confirmado", { aplicado_tarifa: 62000 }),
    ]);
    expect(aviso).toBe(
      "Este pago es del 15 de octubre, pero este cliente ya tiene confirmado uno más nuevo (del 23 de octubre).\n"
      + "Si las semanas de esa fecha ya están pagadas, esta plata quedará como saldo a favor.\n"
      + "Después de confirmarlo, aplique el saldo a favor desde el detalle del cliente, para que no aparezca debiendo.\n"
      + "¿Confirmar?");
  });

  it("si hay de los dos, manda el caso A: lo primero es confirmar la más vieja", () => {
    const esta = t("b2", "2026-10-23", 62000, "Pendiente");
    const aviso = avisoOrdenDelPago(esta, [
      t("a1", "2026-10-14", 100000, "Pendiente"),
      t("c1", "2026-10-28", 202000, "Confirmado", { aplicado_tarifa: 202000 }),
    ]);
    expect(aviso).toContain("otra transferencia más vieja sin confirmar");
  });

  it("el efectivo nunca muestra el aviso", () => {
    const esta = t("e1", "2026-10-15", 50000, "Pendiente", { metodo: "Efectivo", tipo_registro: "campo" });
    expect(avisoOrdenDelPago(esta, [
      t("a1", "2026-10-14", 100000, "Pendiente"),
      t("b1", "2026-10-21", 70000, "Confirmado", { aplicado_tarifa: 70000 }),
    ])).toBeNull();
  });

  it("no avisa por lo que no llenó semanas: aplicar saldo a favor, la semana adelantada o un pago solo a deudas", () => {
    const esta = t("a1", "2026-10-15", 102000, "Pendiente");
    expect(avisoOrdenDelPago(esta, [
      t("s1", "2026-10-27", 202000, "Confirmado", { tipo_registro: "saldo_favor", aplicado_tarifa: 202000 }),
      t("ad", "2026-10-30", 202000, "Confirmado", { tipo_registro: "adelanto_base", aplicado_tarifa: 202000 }),
      t("d1", "2026-10-21", 30000, "Confirmado", { aplicado_tarifa: 0 }),
    ])).toBeNull();
  });

  it("en orden no avisa: lo confirmado es más viejo, y lo pendiente es del mismo día o más nuevo", () => {
    const esta = t("b1", "2026-10-21", 70000, "Pendiente");
    expect(avisoOrdenDelPago(esta, [
      esta,
      t("a1", "2026-10-14", 100000, "Confirmado", { aplicado_tarifa: 100000 }),
      t("b2", "2026-10-21", 75000, "Pendiente"),
      t("b3", "2026-10-23", 62000, "Pendiente"),
      t("r1", "2026-10-10", 50000, "Rechazado"),
    ])).toBeNull();
  });
});
