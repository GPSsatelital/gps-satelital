import { describe, it, expect } from "vitest";
import { diaDeCorte, etapaCorte, porConfirmarPorCobrador, semanaCerradaSegun, semanasPorPagar, proximoPagoQuincenal } from "./corteNomina";

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

describe("qué semanas están cerradas para cada supervisor", () => {
  const cerrada = semanaCerradaSegun([
    { semana_lunes: "2026-10-26", subadmin_id: "ANA" },
    { semana_lunes: "2026-11-02", subadmin_id: "LUIS" },
  ]);
  it("la que se cerró y firmó está cerrada solo para ese supervisor", () => {
    expect(cerrada("ANA", "2026-10-26")).toBe(true);
    expect(cerrada("LUIS", "2026-10-26")).toBe(false);
    expect(cerrada("LUIS", "2026-11-02")).toBe(true);
  });
  it("las de antes del 26-oct cuentan como cerradas para todos (se pagaron por fuera)", () => {
    expect(cerrada("ANA", "2026-10-19")).toBe(true);
    expect(cerrada(null, "2026-10-19")).toBe(true);
  });
  it("una semana sin cierre sigue abierta", () => {
    expect(cerrada("ANA", "2026-11-02")).toBe(false);
  });
});

// EL PAGO DEL 15 Y EL 30 (decisión del dueño, 27-oct-2026): "cada 15 y 30 se pagan las semanas ya
// cerradas el miércoles que no se hayan pagado".
describe("qué semanas se le pagan a cada supervisor", () => {
  const ci = (id: string, sub: string, lunes: string, total: number) => ({ id, subadmin_id: sub, semana_lunes: lunes, total });
  const cierres = [
    ci("a1", "ANA", "2026-10-26", 180000),
    ci("a2", "ANA", "2026-11-02", 200000),
    ci("a0", "ANA", "2026-10-19", 150000),   // de antes del arranque: se pagó por fuera
    ci("l1", "LUIS", "2026-10-26", 90000),
  ];

  it("las cerradas que no se han pagado, con su total", () => {
    const r = semanasPorPagar(cierres, new Set());
    expect(r.get("ANA")).toEqual({ semanas: [cierres[0], cierres[1]], total: 380000 });
    expect(r.get("LUIS")?.total).toBe(90000);
  });

  it("una semana ya pagada no vuelve a salir", () => {
    const r = semanasPorPagar(cierres, new Set(["a1"]));
    expect(r.get("ANA")).toEqual({ semanas: [cierres[1]], total: 200000 });
  });

  it("las de antes del 26-oct nunca entran: ya se pagaron por fuera", () => {
    const r = semanasPorPagar([ci("a0", "ANA", "2026-10-19", 150000)], new Set());
    expect(r.size).toBe(0);
  });
});

describe("el próximo día de pago", () => {
  it("antes del 15: el 15 del mes", () => {
    expect(proximoPagoQuincenal("2026-11-03")).toBe("2026-11-15");
  });
  it("después del 15: el 30", () => {
    expect(proximoPagoQuincenal("2026-11-16")).toBe("2026-11-30");
  });
  it("en febrero, el de fin de mes es el último día", () => {
    expect(proximoPagoQuincenal("2027-02-20")).toBe("2027-02-28");
  });
  it("en un mes de 31, el de fin de mes sigue siendo el 30; el 31 ya mira al 15 siguiente", () => {
    expect(proximoPagoQuincenal("2026-12-29")).toBe("2026-12-30");
    expect(proximoPagoQuincenal("2026-12-31")).toBe("2027-01-15");
  });
  it("el mismo día de pago cuenta", () => {
    expect(proximoPagoQuincenal("2026-11-15")).toBe("2026-11-15");
  });
});
