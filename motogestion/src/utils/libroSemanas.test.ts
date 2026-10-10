import { describe, it, expect } from "vitest";
import { construirLibro, calendarioDelLibro, origenDelPago, moraDelLibro, type ContratoLibro, type PagoLibro, type SemanaDelLibro } from "./libroSemanas";

const HOY = new Date("2026-10-09T00:00:00"); // viernes

// Contrato hecho en la app: paga los miércoles, el libro arranca el miércoles 9-sep.
const base: ContratoLibro = {
  forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 202000, motor_v2: true,
  fecha_entrega: "2026-09-02", fecha_inicio_cajas: "2026-09-09", total_cajas: 104,
  cajas_previas: 0, cajas_pagadas: 3, caja_actual_pagado: 100000, cajas_exoneradas: 0,
  prorrateo_total: 0, prorrateo_pagado: 0, es_migrado: false,
};
const pago = (id: string, fecha: string, tarifa: number, extra: Partial<PagoLibro> = {}): PagoLibro => ({
  id, fecha, created_at: fecha + "T15:00:00Z", estado: "Confirmado", valor: tarifa, metodo: "Efectivo",
  tipo_registro: "normal", aplicado_tarifa: tarifa, aplicado_prorrateo: 0, ...extra,
});
const semanas = (l: ReturnType<typeof construirLibro>) => l.filas.filter((f): f is SemanaDelLibro => f.tipo === "semana");

describe("libro de semanas — contrato hecho en la app", () => {
  const pagos = [
    pago("p1", "2026-09-02", 202000, { tipo_registro: "adelanto_base" }),
    pago("p2", "2026-09-16", 202000, { metodo: "Transferencia" }),
    pago("p3", "2026-09-23", 302000),
  ];
  const libro = construirLibro(base, pagos, HOY);
  const s = semanas(libro);

  it("las semanas pagadas son las que cuenta el contrato, con sus fechas y sus pagos", () => {
    expect(s.filter(x => x.estado === "pagada").map(x => x.numero)).toEqual([1, 2, 3]);
    expect(s[0]).toMatchObject({ desde: "2026-09-09", hasta: "2026-09-15", completadaEl: "2026-09-02" });
    expect(s[0].pagos?.[0].origen).toBe("Semana adelantada de la base");
    expect(s[1].pagos?.[0].origen).toBe("Transferencia");
    expect(s[2]).toMatchObject({ desde: "2026-09-23", hasta: "2026-09-29" });
  });

  it("la que está a medias lleva exactamente lo abonado y desde cuándo se le exige", () => {
    const m = s.find(x => x.estado === "a_medias")!;
    expect(m).toMatchObject({ numero: 4, pagado: 100000, seExige: "2026-09-30", diasVencida: 9 });
    expect(m.pagos?.map(p => p.monto)).toEqual([100000]);
  });

  it("la que debe, la de hoy y la próxima usan la misma fecha de Cartera", () => {
    expect(s.find(x => x.numero === 5)).toMatchObject({ estado: "debe", seExige: "2026-10-07", diasVencida: 2, actual: true });
    expect(s.find(x => x.numero === 6)).toMatchObject({ estado: "proxima", seExige: "2026-10-14" });
    expect(libro.vaEn).toBe(5);
    expect(libro.detallePagos).toBe(true);
    expect(libro.filas.at(-1)).toMatchObject({ tipo: "resto", semanas: 98 });
  });

  it("el calendario pinta cada período con el estado de su semana", () => {
    const p = libro.periodos.find(x => x.desde === "2026-09-30")!;
    expect(p).toMatchObject({ numero: 4, estado: "a_medias", hasta: "2026-10-06" });
    expect(libro.pagosPorDia["2026-09-23"].map(x => x.id)).toEqual(["p3"]);
  });
});

describe("libro de semanas — contrato migrado", () => {
  const migrado: ContratoLibro = {
    ...base, dia_pago: "Lunes", fecha_entrega: "2025-12-01", fecha_inicio_cajas: "2026-07-06", es_migrado: true,
    cajas_previas: 30, cajas_pagadas: 32, caja_actual_pagado: 0,
  };
  it("las semanas del cuaderno van juntas y las de la app con su fecha", () => {
    const l = construirLibro(migrado, [pago("a", "2026-07-06", 202000), pago("b", "2026-07-13", 202000)], HOY);
    expect(l.filas[0]).toMatchObject({ tipo: "antes", semanas: 30 });
    expect(semanas(l)[0]).toMatchObject({ numero: 31, desde: "2026-07-06", hasta: "2026-07-12", estado: "pagada" });
    expect(l.enAppDesde).toBe("2026-07-06");
    expect(l.entregada).toBe("2025-12-01");
  });
  it("si los pagos no cierran contra el contrato, no inventa con qué pago se llenó", () => {
    const l = construirLibro(migrado, [pago("a", "2026-07-06", 150000)], HOY);
    expect(l.detallePagos).toBe(false);
    expect(semanas(l)[0].pagos).toBeNull();
    expect(semanas(l)[0].estado).toBe("pagada");
    expect(l.avisos.join(" ")).toMatch(/no tiene el detalle/);
  });
});

describe("libro de semanas — semanas rodadas", () => {
  // Pagó las semanas 1 y 2; la moto estuvo guardada del 17-sep al 1-oct (2 semanas rodadas).
  const rodado: ContratoLibro = { ...base, cajas_pagadas: 3, caja_actual_pagado: 0, cajas_exoneradas: 2 };
  const pagos = [pago("p1", "2026-09-09", 202000), pago("p2", "2026-09-16", 202000), pago("p3", "2026-10-07", 202000)];
  const acuerdos = [{ fecha_entrada: "2026-09-17", fecha_salida: "2026-10-01", dias_en_empresa: 14 }];

  it("las rodadas quedan en su fecha y las semanas siguientes se corren", () => {
    const l = construirLibro(rodado, pagos, HOY, { acuerdos });
    const s = semanas(l);
    expect(s.find(x => x.numero === 3)).toMatchObject({ desde: "2026-10-07", estado: "pagada", actual: true });
    expect(s.find(x => x.numero === 4)).toMatchObject({ estado: "proxima", seExige: "2026-10-14" });
    const r = l.filas.find(f => f.tipo === "rodada");
    expect(r).toMatchObject({ desde: "2026-09-23", hasta: "2026-10-06", semanas: 2 });
    // La rodada va entre la semana 2 y la 3.
    const orden = l.filas.map(f => f.tipo === "semana" ? f.numero : f.tipo);
    expect(orden.indexOf("rodada")).toBe(orden.indexOf(2) + 1);
    expect(l.fechasPagadas).toBe(true);
  });

  it("Cartera usa las mismas fechas para decir qué semana cubrió cada pago", () => {
    const cal = calendarioDelLibro(rodado, HOY, { acuerdos });
    expect(cal.fechaDe(3)).toEqual({ desde: "2026-10-07", hasta: "2026-10-13" });
  });

  it("el mismo tiempo guardado anotado dos veces: avisa y no inventa fechas", () => {
    const doble: ContratoLibro = { ...rodado, cajas_exoneradas: 4 };
    const l = construirLibro(doble, pagos, HOY, { acuerdos: [...acuerdos, ...acuerdos] });
    expect(l.fechasPagadas).toBe(false);
    expect(semanas(l)[0].desde).toBeNull();
    expect(l.avisos.join(" ")).toMatch(/anotado más de una vez/);
  });
});

describe("libro de semanas — casos raros", () => {
  it("más semanas del cuaderno que pagadas (JORGE LUIS TOVAR): no se rompe", () => {
    const c: ContratoLibro = { ...base, dia_pago: "Lunes", fecha_inicio_cajas: "2026-07-06", es_migrado: true,
      cajas_previas: 111, cajas_pagadas: 88, cajas_exoneradas: 28, total_cajas: 130, caja_actual_pagado: 0 };
    const l = construirLibro(c, [], HOY);
    expect(l.filas[0]).toMatchObject({ tipo: "antes", semanas: 88 });
    expect(l.fechasPagadas).toBe(false);
    expect(semanas(l).every(x => x.estado !== "pagada")).toBe(true);
  });
  it("el origen del pago se dice como lo entiende el funcionario", () => {
    expect(origenDelPago({ metodo: "Efectivo", tipo_registro: "campo" })).toBe("Efectivo (cobro en la calle)");
    expect(origenDelPago({ metodo: "Transferencia", tipo_registro: "saldo_favor" })).toBe("Saldo a favor");
  });
});

describe("libro de semanas — el aviso de la moto guardada cuando ya debía", () => {
  const acuerdos = [{ fecha_entrada: "2026-09-17", fecha_salida: "2026-10-01", dias_en_empresa: 14 }];
  it("al día cuando la guardaron: no avisa", () => {
    const c: ContratoLibro = { ...base, cajas_pagadas: 2, caja_actual_pagado: 0, cajas_exoneradas: 2 };
    const l = construirLibro(c, [pago("p1", "2026-09-09", 202000), pago("p2", "2026-09-16", 202000)], HOY, { acuerdos });
    expect(l.avisos.join(" ")).not.toMatch(/ya debía/);
  });
  it("debía cuando la guardaron: avisa por qué la que debe sale después", () => {
    const c: ContratoLibro = { ...base, cajas_pagadas: 1, caja_actual_pagado: 0, cajas_exoneradas: 2 };
    const l = construirLibro(c, [pago("p1", "2026-09-09", 202000)], HOY, { acuerdos });
    expect(l.avisos.join(" ")).toMatch(/ya debía/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// 10-oct-2026 — lo que el dueño cazó en el libro (JOSE LUIS LOPEZ PONCE, RMZ68H): «¿por qué las
// rodadas están después de la actual?». Hoy caía DENTRO del tiempo rodado y el «esta» quedaba en la
// semana 43, de agosto; y la fila rodada decía las fechas del calendario de pagos como si fueran las
// de la moto guardada.
// ═══════════════════════════════════════════════════════════════════════════════════════════
describe("libro de semanas — hoy cae en el tiempo rodado (RMZ68H)", () => {
  const rmz: ContratoLibro = {
    forma_pago: "Semanal", dia_pago: "Miércoles", valor_semanal: 195000, motor_v2: true,
    fecha_entrega: "2025-08-01", fecha_inicio_cajas: "2026-07-01", total_cajas: 104,
    cajas_previas: 36, cajas_pagadas: 43, caja_actual_pagado: 30000, cajas_exoneradas: 8,
    prorrateo_total: 0, prorrateo_pagado: 0, es_migrado: true,
  };
  const extra = { acuerdos: [{ fecha_entrada: "2026-08-13", fecha_salida: "2026-10-09", dias_en_empresa: 57 }] };

  it("ninguna semana es «la de hoy»: hoy está en la fila rodada", () => {
    const l = construirLibro(rmz, [], HOY, extra);
    expect(l.hoyEnRodada).toBe(true);
    expect(l.vaEn).toBeNull();
    expect(semanas(l).filter(s => s.actual)).toEqual([]);
    expect(l.filas.find(f => f.tipo === "rodada")).toMatchObject({ hoy: true, semanas: 8 });
  });

  it("la fila rodada trae las fechas REALES de la moto guardada, y aparte las del calendario de pagos", () => {
    const r = construirLibro(rmz, [], HOY, extra).filas.find(f => f.tipo === "rodada");
    expect(r).toMatchObject({
      desde: "2026-08-19", hasta: "2026-10-13",
      real: { desde: "2026-08-13", hasta: "2026-10-09", dias: 57 },
    });
  });

  it("la semana 44 se cobra el miércoles 14-oct, la misma fecha de Cartera", () => {
    const s44 = semanas(construirLibro(rmz, [], HOY, extra)).find(s => s.numero === 44);
    expect(s44).toMatchObject({ estado: "a_medias", seExige: "2026-10-14" });
  });

  it("pasado el tiempo rodado, la de hoy vuelve a ser una semana (la 44)", () => {
    const l = construirLibro(rmz, [], new Date("2026-10-15T00:00:00"), extra);
    expect(l.hoyEnRodada).toBe(false);
    expect(l.vaEn).toBe(44);
    expect(semanas(l).find(s => s.actual)?.numero).toBe(44);
  });
});

// Un solo número de días en mora, el de Cartera, dicho de dónde sale (pedido del dueño, 10-oct).
describe("libro de semanas — los días en mora son los de Cartera", () => {
  const pagos = [
    pago("p1", "2026-09-02", 202000, { tipo_registro: "adelanto_base" }),
    pago("p2", "2026-09-16", 202000),
    pago("p3", "2026-09-23", 302000),
  ];
  it("sin acuerdo: la semana más vieja que debe y los días de Cartera (sin contar la gabela)", () => {
    const l = construirLibro(base, pagos, HOY);
    const m = moraDelLibro(base, pagos, null, [], HOY, l);
    // La 4 se exige el miércoles 30-sep: 9 días hasta el viernes 9-oct, menos el de gracia = 8.
    expect(m).toMatchObject({ estado: "mora", dias: 8, desde: "2026-09-30", semanaMasVieja: 4, conjunto: null });
  });

  it("al día: no hay número de días", () => {
    const alDia = { ...base, cajas_pagadas: 5, caja_actual_pagado: 0 };
    const l = construirLibro(alDia, pagos, HOY);
    expect(moraDelLibro(alDia, pagos, null, [], HOY, l).estado).toBe("al-dia");
  });
});
