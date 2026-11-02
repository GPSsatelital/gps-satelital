import { describe, it, expect } from "vitest";
import { nominaSemanaDetallada, libroDeAsignaciones, VALOR_CICLO, VALOR_RETENCION, type ContratoNomina, type PagoNomina, type TramoAsignacion } from "./nominaCobradores";
import { porConfirmarPorCobrador } from "./corteNomina";

// EL LIBRO DE ASIGNACIONES (2-nov-2026, D-061). Pedido del dueño el día en que entró WILINTON MORA y
// se le empezaron a pasar motos con la semana del 26-oct sin cerrar: que las cuentas no se pierdan.
// Decidido: «Libro de asignaciones» · «Del que la recibe» (el día del cambio cuenta para el que la
// recibe). Cada pago es de quien tenía la moto el día en que pagó el cliente.

// PEDRO tenía la ABC12D; el miércoles 4-nov a las 3 de la tarde (8 p.m. en Londres) pasó a LUIS.
const PASO = "2026-11-04T20:00:00+00:00";
const LIBRO: TramoAsignacion[] = [
  { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: PASO },
  { moto_id: "m1", subadmin_id: "LUIS", desde: PASO, hasta: null },
];

describe("qué dice el libro", () => {
  const libro = libroDeAsignaciones(LIBRO);

  it("el día del cambio cuenta para el que la RECIBE", () => {
    expect(libro.elDia("m1", "2026-11-03")).toBe("PEDRO");
    expect(libro.elDia("m1", "2026-11-04")).toBe("LUIS");
    expect(libro.elDia("m1", "2026-11-05")).toBe("LUIS");
  });

  it("se mira el día de Colombia: a las 11 de la noche de aquí, en Londres ya es otro día", () => {
    const l = libroDeAsignaciones([
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: "2026-11-05T04:00:00Z" },   // miércoles 4, 11 p.m. aquí
      { moto_id: "m1", subadmin_id: "LUIS", desde: "2026-11-05T04:00:00Z", hasta: null },
    ]);
    expect(l.elDia("m1", "2026-11-04")).toBe("LUIS");
    expect(l.elDia("m1", "2026-11-03")).toBe("PEDRO");
    // A las 12 de la noche en punto ya es el día siguiente.
    const m = libroDeAsignaciones([
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: "2026-11-05T05:00:00Z" },
      { moto_id: "m1", subadmin_id: "LUIS", desde: "2026-11-05T05:00:00Z", hasta: null },
    ]);
    expect(m.elDia("m1", "2026-11-04")).toBe("PEDRO");
    expect(m.elDia("m1", "2026-11-05")).toBe("LUIS");
  });

  it("dos cambios el mismo día: cuenta el último que la recibió", () => {
    const l = libroDeAsignaciones([
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: "2026-11-04T15:00:00Z" },
      { moto_id: "m1", subadmin_id: "LUIS", desde: "2026-11-04T15:00:00Z", hasta: "2026-11-04T18:00:00Z" },
      { moto_id: "m1", subadmin_id: "ANA", desde: "2026-11-04T18:00:00Z", hasta: null },
    ]);
    expect(l.elDia("m1", "2026-11-04")).toBe("ANA");
  });

  it("antes del primer tramo con fecha el libro no sabe; para pagar se usa el primero que conoce", () => {
    const l = libroDeAsignaciones([{ moto_id: "m1", subadmin_id: "LUIS", desde: PASO, hasta: null }]);
    expect(l.elDia("m1", "2026-11-02")).toBeUndefined();
    expect(l.aQuienEl("m1", "2026-11-02")).toBe("LUIS");
    expect(l.aQuienEl("otra", "2026-11-02")).toBeUndefined();   // no está en el libro: se le paga al de hoy
  });

  it("sin supervisor también es un tramo: es «nadie», no «no se sabe»", () => {
    const l = libroDeAsignaciones([
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: PASO },
      { moto_id: "m1", subadmin_id: null, desde: PASO, hasta: null },
    ]);
    expect(l.elDia("m1", "2026-11-05")).toBeNull();
    expect(l.aQuienEl("m1", "2026-11-05")).toBeNull();
  });

  it("con la hora exacta (la retención): antes de las 3 de la tarde era de PEDRO", () => {
    expect(libro.aQuienEn("m1", "2026-11-04T15:00:00Z")).toBe("PEDRO");   // 10 a.m. aquí
    expect(libro.aQuienEn("m1", "2026-11-04T21:00:00Z")).toBe("LUIS");
  });

  it("cambio dentro de la semana: el miércoles sí; el lunes no; el primer tramo de una moto tampoco", () => {
    expect(libro.cambioEntre("m1", "2026-11-02", "2026-11-08")).toBe("2026-11-04");
    expect(libro.cambioEntre("m1", "2026-11-09", "2026-11-15")).toBeNull();
    const lunes = libroDeAsignaciones([
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: "2026-11-02T20:00:00Z" },
      { moto_id: "m1", subadmin_id: "LUIS", desde: "2026-11-02T20:00:00Z", hasta: null },
    ]);
    expect(lunes.cambioEntre("m1", "2026-11-02", "2026-11-08")).toBeNull();
    const nueva = libroDeAsignaciones([{ moto_id: "m1", subadmin_id: "LUIS", desde: PASO, hasta: null }]);
    expect(nueva.cambioEntre("m1", "2026-11-02", "2026-11-08")).toBeNull();
  });
});

describe("la nómina con el libro", () => {
  // Contrato semanal de los lunes, $202.000: la caja 6 se exige el lunes 2-nov. Hoy la moto es de LUIS.
  const C: ContratoNomina = {
    id: "ct1", cliente_id: "cl1", moto_id: "m1", estado: "Activo",
    forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
    es_migrado: true, motor_v2: true,
    total_cajas: 104, cajas_pagadas: 0, cajas_previas: 5, caja_actual_pagado: 0,
    prorrateo_total: 0, prorrateo_pagado: 0,
    fecha_inicio_cajas: "2026-11-02",
  };
  const MOTO_HOY = [{ id: "m1", placa: "ABC12D", subadmin_id: "LUIS", grupo: "PRADERA" }];
  const CLIENTES = new Map([["cl1", "JUAN PEREZ"]]);
  const pagoId = (id: string, fecha: string, anotado = fecha + "T15:00:00Z"): PagoNomina =>
    ({ id, contrato_id: "ct1", fecha, created_at: anotado, estado: "Confirmado", aplicado_tarifa: 202000 });
  const ev = (caja: number, fecha: string, pago_id: string) =>
    ({ contrato_id: "ct1", caja_numero: caja, fecha, fuente: "pago" as const, pago_id });
  type Caso = {
    desde?: string; hasta?: string; pagos?: PagoNomina[]; eventos?: ReturnType<typeof ev>[];
    recepciones?: { moto_id: string; motivo: string; created_at: string }[];
    asignaciones?: TramoAsignacion[] | null; semanaCerrada?: (c: string | null, l: string) => boolean;
  };
  const semana = (o: Caso) => nominaSemanaDetallada({
    desde: o.desde ?? "2026-11-02", hasta: o.hasta ?? "2026-11-08", contratos: [C], motos: MOTO_HOY,
    clientesPorId: CLIENTES, pagos: o.pagos ?? [], eventos: o.eventos ?? [], recepciones: o.recepciones ?? [],
    asignaciones: o.asignaciones === undefined ? LIBRO : o.asignaciones, semanaCerrada: o.semanaCerrada,
  });
  const de = (r: ReturnType<typeof semana>, quien: string | null) => r.nominas.find(n => n.subadminId === quien);

  it("pagó el martes, antes del cambio: es de PEDRO, aunque hoy la moto sea de LUIS", () => {
    const r = semana({ pagos: [pagoId("p1", "2026-11-03")], eventos: [ev(6, "2026-11-03", "p1")] });
    expect(de(r, "PEDRO")?.total).toBe(VALOR_CICLO);
    expect(de(r, "LUIS")).toBeUndefined();
    expect(r.sinGestion).toHaveLength(0);
  });

  it("pagó el jueves, después del cambio: es de LUIS, y a PEDRO se le dice por qué esa moto no le dio nada", () => {
    const r = semana({ pagos: [pagoId("p1", "2026-11-05")], eventos: [ev(6, "2026-11-05", "p1")] });
    expect(de(r, "LUIS")?.total).toBe(VALOR_CICLO);   // la semana de este lunes, pagada en su semana: a tiempo
    expect(de(r, "PEDRO")).toBeUndefined();
    expect(r.sinGestion).toEqual([expect.objectContaining({
      placa: "ABC12D", cobradorId: "PEDRO", motivo: "cambio_supervisor",
      detalle: "Pasó a otro supervisor el 4 de nov: lo que el cliente pagó desde ese día se le cuenta al nuevo",
    })]);
  });

  it("pagó el miércoles por la mañana, el mismo día del cambio: es del que la recibió", () => {
    const r = semana({ pagos: [pagoId("p1", "2026-11-04")], eventos: [ev(6, "2026-11-04", "p1")] });
    expect(de(r, "LUIS")?.renglones).toHaveLength(1);
    expect(de(r, "PEDRO")).toBeUndefined();
  });

  it("la retención es de quien tenía la moto a esa hora", () => {
    const r = semana({ recepciones: [{ moto_id: "m1", motivo: "retencion_mora", created_at: "2026-11-04T15:00:00Z" }] });
    expect(de(r, "PEDRO")?.retenciones).toBe(1);
    expect(de(r, "PEDRO")?.total).toBe(VALOR_RETENCION);
    expect(de(r, "LUIS")).toBeUndefined();
  });

  it("la moto que se pasó DESPUÉS de la semana: lo de esa semana sigue siendo de PEDRO (el caso del 2-nov)", () => {
    const despues: TramoAsignacion[] = [
      { moto_id: "m1", subadmin_id: "PEDRO", desde: null, hasta: "2026-11-10T20:00:00Z" },
      { moto_id: "m1", subadmin_id: "LUIS", desde: "2026-11-10T20:00:00Z", hasta: null },
    ];
    const conPago = semana({ asignaciones: despues, pagos: [pagoId("p1", "2026-11-03")], eventos: [ev(6, "2026-11-03", "p1")] });
    expect(de(conPago, "PEDRO")?.total).toBe(VALOR_CICLO);
    expect(de(conPago, "LUIS")).toBeUndefined();
    const sinPago = semana({ asignaciones: despues });
    expect(sinPago.sinGestion).toEqual([expect.objectContaining({ placa: "ABC12D", cobradorId: "PEDRO", motivo: "no_pago" })]);
  });

  it("con la semana de PEDRO cerrada, lo que pagó el martes y se confirmó el lunes siguiente pasa a la otra semana y sigue siendo de PEDRO", () => {
    const pagos = [pagoId("p1", "2026-11-03", "2026-11-09T15:00:00Z")];
    const eventos = [ev(6, "2026-11-09", "p1")];
    const cerrada = (c: string | null, l: string) => c === "PEDRO" && l <= "2026-11-02";
    expect(semana({ pagos, eventos, semanaCerrada: cerrada }).nominas).toHaveLength(0);
    const siguiente = semana({ desde: "2026-11-09", hasta: "2026-11-15", pagos, eventos, semanaCerrada: cerrada });
    expect(de(siguiente, "PEDRO")?.renglones[0]).toMatchObject({ tipo: "ciclo", fecha: "2026-11-09", pagadoEl: "2026-11-03" });
    expect(de(siguiente, "LUIS")).toBeUndefined();
  });

  it("sin libro, todo es del supervisor de hoy, como antes", () => {
    const r = semana({ asignaciones: null, pagos: [pagoId("p1", "2026-11-03")], eventos: [ev(6, "2026-11-03", "p1")] });
    expect(de(r, "LUIS")?.total).toBe(VALOR_CICLO);
    expect(de(r, "PEDRO")).toBeUndefined();
  });

  it("si la moto no cambió de manos, la nómina sale IDÉNTICA a la de antes, renglón por renglón", () => {
    const quieto: TramoAsignacion[] = [{ moto_id: "m1", subadmin_id: "LUIS", desde: "2026-07-28T15:01:00Z", hasta: null }];
    const casos: Caso[] = [
      { pagos: [pagoId("p1", "2026-11-03")], eventos: [ev(6, "2026-11-03", "p1")] },
      { pagos: [pagoId("p1", "2026-11-05")], eventos: [ev(6, "2026-11-05", "p1")] },
      { recepciones: [{ moto_id: "m1", motivo: "retencion_mora", created_at: "2026-11-04T15:00:00Z" }] },
      {},
    ];
    for (const caso of casos) {
      expect(semana({ ...caso, asignaciones: quieto })).toEqual(semana({ ...caso, asignaciones: null }));
    }
  });
});

describe("lo que falta por confirmar también se cuenta con el libro", () => {
  const contratos = [{ id: "ct1", moto_id: "m1" }];
  const motos = [{ id: "m1", subadmin_id: "LUIS" }];
  const p = (fecha: string) => ({ contrato_id: "ct1", fecha, estado: "Pendiente", valor: 202000, tipo_registro: "transferencia" });
  const libro = libroDeAsignaciones(LIBRO);

  it("la transferencia del martes es de PEDRO; la del jueves, de LUIS", () => {
    const r = porConfirmarPorCobrador([p("2026-11-03"), p("2026-11-05")], contratos, motos, "2026-11-02", "2026-11-08", libro.aQuienEl);
    expect(r.get("PEDRO")).toEqual({ n: 1, total: 202000 });
    expect(r.get("LUIS")).toEqual({ n: 1, total: 202000 });
  });

  it("sin libro, las dos del supervisor de hoy", () => {
    const r = porConfirmarPorCobrador([p("2026-11-03"), p("2026-11-05")], contratos, motos, "2026-11-02", "2026-11-08");
    expect(r.get("LUIS")).toEqual({ n: 2, total: 404000 });
    expect(r.get("PEDRO")).toBeUndefined();
  });
});
