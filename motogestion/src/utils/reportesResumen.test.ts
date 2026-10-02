import { describe, it, expect } from "vitest";
import { desgloseRecaudo, baseDeAcuerdosDeBase, pagosSinRepartir, tramosMora, serieRecaudo, estadoAlCierre, verificarCifras, plataSinProducir, CONCEPTO_ACUERDO_DE_BASE } from "./reportesResumen";
import type { ContratoCiclo } from "./cicloPago";

const fecha = (p: { fecha: string }) => p.fecha;

describe("lo que entró, y de quién es", () => {
  it("separa lo de la empresa del ahorro, la base y el saldo a favor de los clientes", () => {
    const d = desgloseRecaudo([
      // Una semana completa: $176.000 de tarifa + $26.000 de ahorro (el ahorro viene DENTRO de aplicado_tarifa).
      { contrato_id: "a", fecha: "2026-09-02", valor: 202000, metodo: "Transferencia", aplicado_tarifa: 202000, aplicado_ahorro: 26000 },
      // Una multa en efectivo, cobrada en campo.
      { contrato_id: "b", fecha: "2026-09-03", valor: 30000, metodo: "Efectivo", tipo_registro: "campo", aplicado_deuda: 30000 },
      // Un abono a la base y un sobrante que quedó a favor.
      { contrato_id: "c", fecha: "2026-09-04", valor: 150000, metodo: "Efectivo", aplicado_base_inicial: 100000, aplicado_saldo_favor: 50000 },
    ]);
    expect(d).toEqual({ total: 382000, efectivo: 180000, transferencia: 202000, campo: 30000, ahorro: 26000, baseYSaldo: 150000, empresa: 206000 });
  });

  it("lo que se paga del acuerdo de base va a la base del cliente, no a la empresa (D-023)", () => {
    const pagos = [{ id: "p1", contrato_id: "a", fecha: "2026-09-02", valor: 100000, metodo: "Efectivo", aplicado_convenio: 100000 }];
    expect(desgloseRecaudo(pagos).empresa).toBe(100000);
    const d = desgloseRecaudo(pagos, new Map([["p1", 100000]]));
    expect(d.baseYSaldo).toBe(100000);
    expect(d.empresa).toBe(0);
  });
});

describe("lo abonado al acuerdo de base (misma cuenta que la base de datos, migs 177-178)", () => {
  const cv = (over: object = {}) => ({ id: "cv", contrato_id: "a", concepto: CONCEPTO_ACUERDO_DE_BASE, deuda_total: 308000, created_at: "2026-09-01T10:00:00+00:00", ...over });
  const pago = (id: string, conv: number, creado: string, estado = "Confirmado") =>
    ({ id, contrato_id: "a", estado, created_at: creado, aplicado_convenio: conv });

  it("cada abono es base, en el orden en que entró, hasta el tope del acuerdo", () => {
    const m = baseDeAcuerdosDeBase([
      pago("p2", 200000, "2026-09-10T10:00:00+00:00"),
      pago("p1", 100000, "2026-09-03T10:00:00+00:00"),
      pago("p3", 50000, "2026-09-17T10:00:00+00:00"),
    ], [cv()], () => 202000);
    // 100.000 + 200.000 = 300.000; del tercero solo caben 8.000 (el tope es 308.000).
    expect([...m.entries()].sort()).toEqual([["p1", 100000], ["p2", 200000], ["p3", 8000]]);
  });

  it("la tarifa vieja tiene piso de $305.000", () => {
    const m = baseDeAcuerdosDeBase([pago("p1", 400000, "2026-09-03T10:00:00+00:00")], [cv({ deuda_total: 400000 })], () => 195000);
    expect(m.get("p1")).toBe(305000);
  });

  it("no cuenta pagos sin confirmar, ni anteriores al acuerdo, ni contratos con otro acuerdo al lado", () => {
    expect(baseDeAcuerdosDeBase([pago("p1", 50000, "2026-09-03T10:00:00+00:00", "Pendiente")], [cv()], () => 202000).size).toBe(0);
    expect(baseDeAcuerdosDeBase([pago("p1", 50000, "2026-08-30T10:00:00+00:00")], [cv()], () => 202000).size).toBe(0);
    expect(baseDeAcuerdosDeBase([pago("p1", 50000, "2026-09-03T10:00:00+00:00")],
      [cv(), { id: "otro", contrato_id: "a", concepto: "Semanas atrasadas", deuda_total: 400000, created_at: "2026-09-02T10:00:00+00:00" }], () => 202000).size).toBe(0);
  });
});

describe("cada peso tiene dicho a dónde fue", () => {
  it("cuadra la semana con el ahorro adentro, el diario con el ahorro por fuera, y avisa el que no cuadra", () => {
    const r = pagosSinRepartir([
      { contrato_id: "a", fecha: "2026-09-02", valor: 202000, aplicado_tarifa: 202000, aplicado_ahorro: 26000 },
      { contrato_id: "b", fecha: "2026-09-02", valor: 50000, aplicado_tarifa: 27000, aplicado_ahorro: 23000 },
      { contrato_id: "c", fecha: "2026-09-02", valor: 90000, aplicado_prorrateo: 60000, aplicado_convenio: 30000 },
      { contrato_id: "d", fecha: "2026-09-02", valor: 100000, aplicado_tarifa: 40000 },
      { contrato_id: "e", fecha: "2026-09-02", valor: 27000, tipo_registro: "alquiler_reemplazo" },
    ]);
    expect(r).toEqual({ n: 1, plata: 60000 });
  });
});

describe("antigüedad de la mora", () => {
  it("reparte por días en 4 tramos y suma lo que deben", () => {
    const t = tramosMora([
      { diasMora: 1, debeHoy: 202000 }, { diasMora: 7, debeHoy: 100000 },
      { diasMora: 8, debeHoy: 50000 }, { diasMora: 30, debeHoy: 10000 }, { diasMora: 31, debeHoy: 900000 },
    ]);
    expect(t.map(x => [x.clave, x.filas.length, x.debe])).toEqual([["1-7", 2, 302000], ["8-15", 1, 50000], ["16-30", 1, 10000], ["30+", 1, 900000]]);
  });
});

describe("el recaudo en el tiempo sigue al período elegido", () => {
  const pagos = [
    { contrato_id: "a", fecha: "2026-09-01", valor: 100 },
    { contrato_id: "a", fecha: "2026-09-15", valor: 200 },
    { contrato_id: "a", fecha: "2026-10-01", valor: 400 },
  ];
  it("un mes: por día, y solo lo de adentro del período", () => {
    const s = serieRecaudo(pagos, "2026-09-01", "2026-09-30", fecha);
    expect(s.modo).toBe("dia");
    expect(s.puntos).toHaveLength(30);
    expect(s.puntos.reduce((a, p) => a + p.total, 0)).toBe(300);
  });
  it("hasta 4 meses: por semana", () => {
    expect(serieRecaudo(pagos, "2026-08-01", "2026-10-02", fecha).modo).toBe("semana");
  });
  it("el año: por mes", () => {
    const s = serieRecaudo(pagos, "2026-01-01", "2026-10-02", fecha);
    expect(s.modo).toBe("mes");
    expect(s.puntos.map(p => p.etiqueta)).toEqual(["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"]);
    expect(s.puntos.find(p => p.etiqueta === "Sep")!.total).toBe(300);
  });
});

describe("cómo estaba un contrato al cierre de una fecha (reconstruido)", () => {
  // Semanal de miércoles desde el 2-sep, $202.000. Hoy tiene 4 semanas llenas; la del 23 la pagó el 25.
  const C: ContratoCiclo & { id: string } = {
    id: "c1", forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 202000,
    motor_v2: true, es_migrado: false, total_cajas: 91, cajas_pagadas: 4, caja_actual_pagado: 0,
    cajas_previas: 0, cajas_exoneradas: 0, prorrateo_total: 0, prorrateo_pagado: 0, fecha_inicio_cajas: "2026-09-02",
  };
  const p = (f: string) => ({ contrato_id: "c1", fecha: f, valor: 202000, aplicado_tarifa: 202000 });
  const pagos = [p("2026-09-02"), p("2026-09-09"), p("2026-09-16"), p("2026-09-25")];

  it("el jueves 24 todavía no había pagado la semana del 23: gabela", () => {
    expect(estadoAlCierre(C as never, pagos, [], "2026-09-24", fecha, null)).toEqual({ estado: "gabela", diasMora: 0 });
  });
  it("el sábado 26, con el pago del 25: al día", () => {
    expect(estadoAlCierre(C as never, pagos, [], "2026-09-26", fecha, null)).toEqual({ estado: "al-dia", diasMora: 0 });
  });
  it("si nunca hubiera pagado la semana del 23, el viernes 25 estaría en mora", () => {
    const sinPagar = { ...C, cajas_pagadas: 3 };
    expect(estadoAlCierre(sinPagar as never, pagos.slice(0, 3), [], "2026-09-25", fecha, null)).toEqual({ estado: "mora", diasMora: 1 });
  });
  it("los Diarios no se reconstruyen (no tienen libro de cajas)", () => {
    expect(estadoAlCierre({ ...C, forma_pago: "Diario" } as never, pagos, [], "2026-09-24", fecha, null)).toBeNull();
  });
});

describe("el sello de cifras verificadas", () => {
  it("dice qué cuadra y, si algo no, cuánto da cada lado", () => {
    const v = verificarCifras({ totalRecaudado: 1000, sumaGrupos: 900, sinRepartir: { n: 2, plata: 60000 }, sumaEstados: 175, totalContratos: 179 });
    expect(v.map(x => x.ok)).toEqual([false, false, false]);
    expect(v[0].texto).toBe("Los grupos suman $900 y el total es $1.000");
    expect(v[1].texto).toBe("2 pagos por $60.000 sin decir a qué se aplicaron");
    expect(v[2].texto).toBe("Los estados suman 175 y hay 179 contratos vigentes");
    const bien = verificarCifras({ totalRecaudado: 1000, sumaGrupos: 1000, sinRepartir: { n: 0, plata: 0 }, sumaEstados: 179, totalContratos: 179 });
    expect(bien.every(x => x.ok)).toBe(true);
  });
});

describe("plata sin producir (estimación)", () => {
  it("días quietas × tarifa del día; las que no tienen fecha se cuentan aparte", () => {
    expect(plataSinProducir([{ dias: 10, tarifaDia: 27000 }, { dias: 3, tarifaDia: 26000 }, { dias: null, tarifaDia: 27000 }]))
      .toEqual({ motos: 3, dias: 13, estimado: 348000, sinFecha: 1 });
  });
});
