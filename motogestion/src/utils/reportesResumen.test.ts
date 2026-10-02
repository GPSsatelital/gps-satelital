import { describe, it, expect } from "vitest";
import { desgloseRecaudo, tramosMora, serieRecaudo, estadoAlCierre, verificarCifras, plataSinProducir } from "./reportesResumen";
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
    const v = verificarCifras({ totalRecaudado: 1000, sumaGrupos: 1000, sumaCobradores: 900, sumaEstados: 175, totalClientes: 179 });
    expect(v.map(x => x.ok)).toEqual([true, false, false]);
    expect(v[1].texto).toBe("Los cobradores suman $900 y el total es $1.000");
    expect(v[2].texto).toBe("Los estados suman 175 y hay 179 clientes");
  });
});

describe("plata sin producir (estimación)", () => {
  it("días quietas × tarifa del día; las que no tienen fecha se cuentan aparte", () => {
    expect(plataSinProducir([{ dias: 10, tarifaDia: 27000 }, { dias: 3, tarifaDia: 26000 }, { dias: null, tarifaDia: 27000 }]))
      .toEqual({ motos: 3, dias: 13, estimado: 348000, sinFecha: 1 });
  });
});
