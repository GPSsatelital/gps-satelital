import { describe, it, expect } from "vitest";
import { diaDeCorte, etapaCorte, porConfirmarPorCobrador } from "./corteNomina";

// EL PRECORTE Y EL CORTE DEL MIÉRCOLES (decisión del dueño, 27-oct-2026, D-057): "se hará un
// precorte los días actuales y se hará un corte definitivo semanalmente los miércoles dando plazo a
// lunes y martes para ingresar los pagos que hagan falta, así nadie pierde nada".

describe("el día del corte", () => {
  it("la semana del lunes 26-oct se cierra el miércoles 4-nov", () => {
    expect(diaDeCorte("2026-10-26")).toBe("2026-11-04");
  });
  it("cruza de mes y de año sin problema", () => {
    expect(diaDeCorte("2026-12-28")).toBe("2027-01-06");
  });
});

describe("en qué etapa está una semana", () => {
  const S = "2026-10-26";   // lunes 26-oct a domingo 1-nov
  it("mientras corre la semana: en curso", () => {
    expect(etapaCorte(S, "2026-10-27")).toBe("en_curso");
    expect(etapaCorte(S, "2026-11-01")).toBe("en_curso");
  });
  it("lunes y martes siguientes: precorte (se ve, no se cierra)", () => {
    expect(etapaCorte(S, "2026-11-02")).toBe("precorte");
    expect(etapaCorte(S, "2026-11-03")).toBe("precorte");
  });
  it("desde el miércoles: corte (ya se puede cerrar)", () => {
    expect(etapaCorte(S, "2026-11-04")).toBe("corte");
    expect(etapaCorte(S, "2026-11-20")).toBe("corte");
  });
  it("las semanas de antes del 26-oct se pagaron por fuera: no se cierran en la app", () => {
    expect(etapaCorte("2026-10-19", "2026-10-28")).toBe("anterior");
  });
});

describe("las transferencias que faltan por confirmar, por supervisor", () => {
  const contratos = [{ id: "c1", moto_id: "m1" }, { id: "c2", moto_id: "m2" }, { id: "c3", moto_id: "m3" }];
  const motos = [{ id: "m1", subadmin_id: "ANA" }, { id: "m2", subadmin_id: "ANA" }, { id: "m3", subadmin_id: null }];
  const p = (contrato_id: string, fecha: string, estado: string, valor: number, tipo_registro = "transferencia") => ({ contrato_id, fecha, estado, valor, tipo_registro });

  it("cuenta solo las pendientes pagadas dentro de la semana", () => {
    const r = porConfirmarPorCobrador([
      p("c1", "2026-10-30", "Pendiente", 202000),
      p("c2", "2026-11-01", "Pendiente", 100000),
      p("c1", "2026-10-29", "Confirmado", 202000),   // ya confirmada
      p("c2", "2026-11-02", "Pendiente", 50000),     // de la semana siguiente
      p("c1", "2026-10-28", "Rechazado", 30000),     // rechazada no cuenta
    ], contratos, motos, "2026-10-26", "2026-11-01");
    expect(r.get("ANA")).toEqual({ n: 2, total: 302000 });
  });

  it("las motos sin supervisor van aparte, y el alquiler de la prestada no entra", () => {
    const r = porConfirmarPorCobrador([
      p("c3", "2026-10-30", "Pendiente", 80000),
      p("c1", "2026-10-30", "Pendiente", 27000, "alquiler_reemplazo"),
    ], contratos, motos, "2026-10-26", "2026-11-01");
    expect(r.get(null)).toEqual({ n: 1, total: 80000 });
    expect(r.get("ANA")).toBeUndefined();
  });
});
