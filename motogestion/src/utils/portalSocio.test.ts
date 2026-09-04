import { describe, it, expect } from "vitest";
import { resumenFlota, entregasRecientes, vencimientosProximos, recaudoPorMes } from "./portalSocio";

// El portal del socio muestra plata de un inversionista. Estas pruebas fijan lo que ve.

describe("cuántas motos producen y cuántas están quietas", () => {
  const flota = [
    { estado: "Asignada" }, { estado: "Asignada" }, { estado: "Asignada" },
    { estado: "Mantenimiento" }, { estado: "Mantenimiento" },
    { estado: "Disponible" },
    { estado: "Garantia" },
  ];

  it("produce la que está con un cliente; el resto es plata quieta", () => {
    const r = resumenFlota(flota);
    expect(r).toMatchObject({ total: 7, produciendo: 3, paradas: 4 });
  });

  it("dice POR QUÉ están quietas, de la razón más común a la menos", () => {
    expect(resumenFlota(flota).motivos).toEqual([
      { motivo: "en taller", cuantas: 2 },
      { motivo: "en garantía", cuantas: 1 },
      { motivo: "sin cliente", cuantas: 1 },
    ]);
  });

  it("lo dice en palabras del dueño de la plata, no en jerga del sistema", () => {
    expect(resumenFlota([{ estado: "Recuperada" }]).motivos[0].motivo).toBe("guardada");
    expect(resumenFlota([{ estado: "Fiscalia" }]).motivos[0].motivo).toBe("en fiscalía");
  });

  it("un grupo sin motos no revienta", () => {
    expect(resumenFlota([])).toEqual({ total: 0, produciendo: 0, paradas: 0, motivos: [] });
  });

  it("un estado que nadie previó no se pierde: sale como 'sin definir'", () => {
    expect(resumenFlota([{ estado: "InventadoMañana" }]).motivos).toEqual([{ motivo: "sin definir", cuantas: 1 }]);
  });
});

describe("las entregas recientes — la carta de presentación", () => {
  const c = (id: string, fecha: string | null, estado = "Activo", moto: string | null = "m") =>
    ({ id, cliente_id: "cl", moto_id: moto, fecha_entrega: fecha, estado });

  it("de la más nueva a la más vieja", () => {
    const r = entregasRecientes([c("a", "2026-06-01"), c("b", "2026-08-28"), c("c", "2026-07-15")]);
    expect(r.map(x => x.id)).toEqual(["b", "c", "a"]);
  });

  it("un contrato que nunca se entregó no es una entrega", () => {
    expect(entregasRecientes([c("sinfecha", null), c("enproceso", "2026-08-01", "En proceso")])).toEqual([]);
  });

  it("sin moto tampoco: no hay qué mostrar", () => {
    expect(entregasRecientes([c("x", "2026-08-01", "Activo", null)])).toEqual([]);
  });

  it("una entrega vieja ya liquidada SIGUE contando: pasó de verdad", () => {
    expect(entregasRecientes([c("liq", "2026-05-02", "Finalizado")]).map(x => x.id)).toEqual(["liq"]);
  });

  it("un contrato cancelado no: esa moto nunca se entregó", () => {
    expect(entregasRecientes([c("can", "2026-05-02", "Cancelado")])).toEqual([]);
  });

  it("respeta el límite", () => {
    const muchos = Array.from({ length: 30 }, (_, i) => c(`e${i}`, `2026-08-${String(i % 28 + 1).padStart(2, "0")}`));
    expect(entregasRecientes(muchos, 5)).toHaveLength(5);
  });
});

describe("seguros y tecnomecánicas por vencer", () => {
  const HOY = "2026-09-04";

  it("lo ya vencido va de primero, con días en negativo", () => {
    const r = vencimientosProximos([
      { placa: "AAA11A", fecha_seguro: "2026-09-20", fecha_tecnomecanica: null },
      { placa: "BBB22B", fecha_seguro: "2026-08-30", fecha_tecnomecanica: null },
    ], HOY);
    expect(r[0]).toMatchObject({ placa: "BBB22B", que: "SOAT", dias: -5 });
    expect(r[1]).toMatchObject({ placa: "AAA11A", dias: 16 });
  });

  it("lo que vence lejos no molesta al socio", () => {
    expect(vencimientosProximos([{ placa: "X", fecha_seguro: "2027-01-01", fecha_tecnomecanica: null }], HOY)).toEqual([]);
  });

  it("una moto puede tener las dos cosas por vencer", () => {
    const r = vencimientosProximos([{ placa: "X", fecha_seguro: "2026-09-10", fecha_tecnomecanica: "2026-09-05" }], HOY);
    expect(r.map(x => x.que)).toEqual(["Tecnomecánica", "SOAT"]);
  });

  it("sin fechas cargadas no inventa alertas", () => {
    expect(vencimientosProximos([{ placa: "X", fecha_seguro: null, fecha_tecnomecanica: null }], HOY)).toEqual([]);
  });
});

describe("la tendencia del recaudo", () => {
  it("devuelve los meses del más viejo al más nuevo, con ceros donde no entró nada", () => {
    const r = recaudoPorMes([{ fecha: "2026-09-02", valor: 100 }, { fecha: "2026-07-15", valor: 50 }], "2026-09-04", 3);
    expect(r).toEqual([
      { mes: "2026-07", total: 50 },
      { mes: "2026-08", total: 0 },
      { mes: "2026-09", total: 100 },
    ]);
  });

  it("suma varios pagos del mismo mes", () => {
    const r = recaudoPorMes([{ fecha: "2026-09-01", valor: 10 }, { fecha: "2026-09-30", valor: 5 }], "2026-09-04", 1);
    expect(r).toEqual([{ mes: "2026-09", total: 15 }]);
  });

  it("un pago fuera de la ventana no se cuela", () => {
    expect(recaudoPorMes([{ fecha: "2025-01-01", valor: 999 }], "2026-09-04", 2).every(x => x.total === 0)).toBe(true);
  });

  it("cruza bien el cambio de año", () => {
    expect(recaudoPorMes([], "2026-01-15", 3).map(x => x.mes)).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});
