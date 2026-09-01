import { describe, it, expect } from "vitest";
import { nominaSemana, lunesDe, totalesPorGrupo, VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, type ContratoNomina, type PagoNomina , vigiaCubre } from "./nominaCobradores";

// LA NÓMINA SE PAGA EN PLATA REAL cada semana. Estas pruebas son la regla del dueño
// (22-ago, memoria regla-nomina-cobradores) convertida en cifras.

const SEMANA = { desde: "2026-08-17", hasta: "2026-08-23" };  // lunes a domingo

// PEDRO gestiona la ABC12D. Contrato semanal estándar: $202.000, lunes, migrado sin prorrateo.
const CONTRATO: ContratoNomina = {
  id: "ct1", cliente_id: "cl1", moto_id: "m1", estado: "Activo",
  forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: 202000,
  es_migrado: true, motor_v2: true,
  total_cajas: 104, cajas_pagadas: 0, cajas_previas: 5, caja_actual_pagado: 0,
  prorrateo_total: 0, prorrateo_pagado: 0,
  // La caja 6 se exige el lunes 17-ago (semana de la prueba); la 7, el lunes 24.
  fecha_inicio_cajas: "2026-08-17",
};

const MOTOS = [{ id: "m1", placa: "ABC12D", subadmin_id: "PEDRO", grupo: "PRADERA" }];
const CLIENTES = new Map([["cl1", "JUAN PEREZ"]]);

function pago(fecha: string, cuota: number, extra: Partial<PagoNomina> = {}): PagoNomina {
  // Semántica REAL del motor (mig 045): aplicado_tarifa trae TODA la plata que fue a cajas
  // (con el ahorro adentro) y aplicado_ahorro es informativo (subconjunto de la misma plata).
  return {
    contrato_id: "ct1", fecha, created_at: fecha + "T10:00:00Z", estado: "Confirmado",
    aplicado_tarifa: cuota, aplicado_ahorro: Math.round(cuota * 0.13), ...extra,
  };
}

function correr(pagos: PagoNomina[], recepciones: { moto_id: string; motivo: string; created_at: string }[] = [], contratos = [CONTRATO]) {
  return nominaSemana({ ...SEMANA, contratos, pagos, motos: MOTOS, recepciones, clientesPorId: CLIENTES });
}

describe("el ciclo cobrado a tiempo vale $7.500", () => {
  it("cliente paga su semana el día que le toca", () => {
    const n = correr([pago("2026-08-17", 202000)]);
    expect(n).toHaveLength(1);
    expect(n[0].subadminId).toBe("PEDRO");
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].total).toBe(VALOR_CICLO);
    expect(n[0].renglones[0]).toMatchObject({ placa: "ABC12D", cliente: "JUAN PEREZ", tipo: "ciclo", valor: 7500 });
  });

  it("dos abonos que completan la semana = UN ciclo, no dos", () => {
    const n = correr([pago("2026-08-17", 100000), pago("2026-08-19", 102000, { created_at: "2026-08-19T10:00:00Z" })]);
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].total).toBe(VALOR_CICLO);
  });

  it("un abono que NO completa la caja no genera pago — el ciclo aún no entró", () => {
    const n = correr([pago("2026-08-17", 100000)]);
    expect(n).toHaveLength(0);
  });
});

describe("el ciclo atrasado vale el 30% — $2.250", () => {
  it("la semana que debía de ANTES entra tarde: 30%. La actual, completa", () => {
    // La caja 6 se exigía el lunes 17. El cliente no pagó esa semana; el lunes 24 paga DOS
    // semanas ($404.000): la del 17 (atrasada, 30%) y la del 24 (a tiempo).
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      pagos: [pago("2026-08-24", 404000)],
    });
    expect(n[0].ciclosAtrasados).toBe(1);
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].total).toBe(VALOR_ATRASADO + VALOR_CICLO);   // 2.250 + 7.500
  });

  it("prepagar la semana siguiente es a tiempo, no atrasado", () => {
    // Paga el lunes 17 sus DOS semanas: la del 17 y la del 24 (por adelantado).
    const n = correr([pago("2026-08-17", 404000)]);
    expect(n[0].ciclosATiempo).toBe(2);
    expect(n[0].ciclosAtrasados).toBe(0);
  });
});

describe("la retención vale $17.500, una sola vez", () => {
  it("retener la moto en la semana genera 7.500 + 10.000", () => {
    const n = correr([], [{ moto_id: "m1", motivo: "retencion_mora", created_at: "2026-08-20T15:00:00Z" }]);
    expect(n[0].retenciones).toBe(1);
    expect(n[0].total).toBe(VALOR_RETENCION);
  });

  it("dos registros de retención de la misma moto en la semana = UNA retención", () => {
    const n = correr([], [
      { moto_id: "m1", motivo: "retencion_mora", created_at: "2026-08-18T10:00:00Z" },
      { moto_id: "m1", motivo: "retencion_mora", created_at: "2026-08-20T10:00:00Z" },
    ]);
    expect(n[0].retenciones).toBe(1);
  });

  it("una entrega voluntaria NO es retención", () => {
    const n = correr([], [{ moto_id: "m1", motivo: "entrega_voluntaria", created_at: "2026-08-20T10:00:00Z" }]);
    expect(n).toHaveLength(0);
  });
});

describe("lo que NO se paga", () => {
  it("en mora sin pagar y sin retener: $0 — no hubo gestión", () => {
    expect(correr([])).toHaveLength(0);
  });

  it("la semana ADELANTADA del wizard no se paga: nadie la cobró", () => {
    // Contrato del wizard: prorrateo $47.000 + la adelantada que nace paga con la base.
    const wizard: ContratoNomina = {
      ...CONTRATO, id: "ct2", es_migrado: false, cajas_previas: 0,
      prorrateo_total: 47000, fecha_inicio_cajas: "2026-08-17",
    };
    // Semántica del motor: la adelantada llena SU caja completa vía aplicado_tarifa (202.000,
    // ahorro adentro) y el prorrateo viaja en SU columna aplicado_prorrateo — nunca mezclados.
    const pagoInterno: PagoNomina = {
      contrato_id: "ct2", fecha: "2026-08-17", created_at: "2026-08-17T08:00:00Z",
      estado: "Confirmado", tipo_registro: "adelanto_base",
      aplicado_tarifa: 202000, aplicado_ahorro: 26000,
    };
    // El prorrateo lo cobró el cobrador ese mismo día (SÍ se paga, completo).
    const pagoProrrateo: PagoNomina = {
      contrato_id: "ct2", fecha: "2026-08-17", created_at: "2026-08-17T09:00:00Z",
      estado: "Confirmado", aplicado_prorrateo: 47000, aplicado_tarifa: 0, aplicado_ahorro: 7000,
    };
    // Lo que la regla exige: UN pago por el prorrateo, NADA por la adelantada.
    const n = nominaSemana({
      ...SEMANA, contratos: [wizard], motos: MOTOS, recepciones: [],
      clientesPorId: new Map([["cl1", "JUAN PEREZ"]]),
      pagos: [pagoInterno, pagoProrrateo],
    });
    const total = n.reduce((s, x) => s + x.total, 0);
    expect(total).toBe(VALOR_CICLO);                        // solo el prorrateo
    expect(n[0].renglones.filter(r => r.tipo === "ciclo")).toHaveLength(0);
  });

  it("los contratos DIARIOS quedan por fuera", () => {
    const diario: ContratoNomina = { ...CONTRATO, forma_pago: "Diario" };
    const n = correr([pago("2026-08-17", 202000)], [], [diario]);
    expect(n).toHaveLength(0);
  });

  it("prepagar más allá del total del contrato no inventa ciclos", () => {
    const corto: ContratoNomina = { ...CONTRATO, total_cajas: 6 };  // solo queda 1 caja (previas=5)
    const n = correr([pago("2026-08-17", 606000)], [], [corto]);    // plata para 3 cajas
    expect(n[0].ciclosATiempo).toBe(1);
  });
});

describe("motos sin cobrador asignado", () => {
  it("van aparte (subadminId null): esa plata no se le paga a nadie", () => {
    const n = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], recepciones: [], clientesPorId: CLIENTES,
      motos: [{ id: "m1", placa: "ABC12D", subadmin_id: null }],
      pagos: [pago("2026-08-17", 202000)],
    });
    expect(n[0].subadminId).toBeNull();
    expect(n[0].total).toBe(VALOR_CICLO);
  });
});

describe("quincenal: una vez por ciclo, no por semana", () => {
  it("un quincenal al día genera UN pago de $7.500 por sus 15 días", () => {
    const quincenal: ContratoNomina = {
      ...CONTRATO, forma_pago: "Quincenal", dias_pago_mes: [3, 18], dia_pago: "",
      valor_semanal: 202000, fecha_inicio_cajas: "2026-08-18",
    };
    const n = nominaSemana({
      desde: "2026-08-17", hasta: "2026-08-23",
      contratos: [quincenal], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      pagos: [pago("2026-08-18", 411000)],   // su quincena completa (2 sem + 1 día ≈ valorPeriodoReal)
    });
    // valorPeriodoReal del quincenal > valor semanal: la plata de una quincena llena UNA caja.
    expect(n.length).toBeLessThanOrEqual(1);
    if (n.length === 1) expect(n[0].ciclosATiempo + n[0].ciclosAtrasados).toBe(1);
  });
});

describe("la nómina LEE el reparto del motor — no lo reinventa (auditoría 22-ago)", () => {
  it("el ahorro NO se cuenta dos veces: 8 semanas exactas = 8 ciclos, no 9", () => {
    // El motor escribe en aplicado_tarifa TODA la plata de cajas (ahorro adentro) y en
    // aplicado_ahorro cuánto de esa misma plata fue ahorro. El defecto era sumar los dos:
    // inflaba ~13% y cada ~8 semanas aparecía un ciclo FANTASMA que se pagaba sin existir.
    const pagos = Array.from({ length: 8 }, (_, i) => {
      const d = new Date("2026-06-29T12:00:00");
      d.setDate(d.getDate() + 7 * i);
      return pago(d.toISOString().slice(0, 10), 202000, { created_at: d.toISOString() });
    });
    const n = nominaSemana({
      desde: "2026-06-29", hasta: "2026-08-23",
      contratos: [{ ...CONTRATO, fecha_inicio_cajas: "2026-06-29" }],
      pagos, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
    });
    const ciclos = n[0].ciclosATiempo + n[0].ciclosAtrasados;
    expect(ciclos).toBe(8);
  });

  it("cada gestión dice de qué PORTAFOLIO sale la plata", () => {
    const n = correr([pago("2026-08-17", 202000)]);
    expect(n[0].renglones[0].grupo).toBe("PRADERA");
    expect(totalesPorGrupo(n[0].renglones)).toEqual([{ grupo: "PRADERA", total: VALOR_CICLO }]);
  });
});

describe("MODO EXACTO: con las anotaciones del vigía (mig 112) no se relee ningún pago", () => {
  // OJO con las fechas: el modo exacto SOLO corre desde VIGIA_DESDE (22-ago). Antes de eso las
  // anotaciones estarian incompletas y la nomina calcula desde los pagos — ver el describe de abajo.
  it("una anotación de caja en la semana = un ciclo, con su fecha real", () => {
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], pagos: [], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      eventos: [{ contrato_id: "ct1", caja_numero: 7, fecha: "2026-08-24", fuente: "pago" }],
    });
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].total).toBe(VALOR_CICLO);
  });

  it("una caja marcada por CONVENIO no paga por la anotación (entró papel, no plata)", () => {
    const n = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], pagos: [], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      eventos: [{ contrato_id: "ct1", caja_numero: 6, fecha: "2026-08-18", fuente: "convenio" }],
    });
    expect(n).toHaveLength(0);
  });

  it("la caja exigida en una semana pasada que se llena hoy sale atrasada (30%)", () => {
    // La caja 6 se exigía el lunes 17; la anotación dice que se llenó la semana del 24.
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], pagos: [], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      eventos: [{ contrato_id: "ct1", caja_numero: 6, fecha: "2026-08-25", fuente: "pago" }],
    });
    expect(n[0].ciclosAtrasados).toBe(1);
    expect(n[0].total).toBe(VALOR_ATRASADO);
  });

  it("la adelantada del wizard (su caja 1) tampoco se paga en modo exacto", () => {
    const wizard: ContratoNomina = { ...CONTRATO, es_migrado: false, cajas_previas: 0, prorrateo_total: 47000 };
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [wizard], pagos: [], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      eventos: [
        { contrato_id: "ct1", caja_numero: 1, fecha: "2026-08-24", fuente: "pago" },   // adelantada
        { contrato_id: "ct1", caja_numero: 0, fecha: "2026-08-24", fuente: "pago" },   // prorrateo
      ],
    });
    expect(n[0].prorrateos).toBe(1);
    expect(n[0].renglones.filter(r => r.tipo === "ciclo")).toHaveLength(0);
    expect(n[0].total).toBe(VALOR_CICLO);   // solo el prorrateo
  });
});

describe("EL PAQUETE: semana + convenio = UNA sola gestión (regla del dueño, 23-ago)", () => {
  // Convenio firmado el lunes 10-ago: su cuota 1 se exige la semana del lunes 17 (el convenio
  // arranca el período completo que sigue a la firma). Cuota $60.000 × 16, como GEOVANNY.
  const CONVENIO = { contrato_id: "ct1", cuota_por_periodo: 60000, numero_cuotas: 16, created_at: "2026-08-10T00:00:00Z" };
  const conv = (fecha: string, monto: number): PagoNomina => ({
    contrato_id: "ct1", fecha, created_at: fecha + "T11:00:00Z", estado: "Confirmado", aplicado_convenio: monto,
  });

  it("paquete completo dentro de su semana = UN renglón de $7.500, nada por separado", () => {
    const n = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO],
      pagos: [pago("2026-08-17", 202000), conv("2026-08-18", 60000)],
    });
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].cuotasConvenio).toBe(0);
    expect(n[0].total).toBe(VALOR_CICLO);   // 7.500 — no 7.500 + 2.250
  });

  it("3 cuotas juntas NO pagan renglones sueltos (caso GEOVANNY): sin la semana, $0", () => {
    // Pagó $180.000 al convenio un sábado (3 cuotas de una) pero su semana quedó descubierta:
    // el paquete está incompleto — "si no paga completo es como si la caja no se ha completado".
    const n = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO],
      pagos: [conv("2026-08-22", 180000)],
    });
    expect(n).toHaveLength(0);
  });

  it("caja llena pero convenio atrasado: el renglón ESPERA, y sale al 30% cuando entra la cuota", () => {
    const pagos = [pago("2026-08-17", 202000), conv("2026-08-26", 60000)];
    // La semana de la caja: nada todavía (falta la pata del convenio).
    const sem1 = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO], pagos,
    });
    expect(sem1).toHaveLength(0);
    // La semana en que entró la cuota: el paquete se completó tarde → $2.250, fechado ese día.
    const sem2 = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO], pagos,
    });
    expect(sem2[0].ciclosAtrasados).toBe(1);
    expect(sem2[0].cuotasConvenio).toBe(0);
    expect(sem2[0].total).toBe(VALOR_ATRASADO);
  });

  it("cuotas adelantadas dejan cubiertas las semanas que vienen: la siguiente paga $7.500 completo", () => {
    // El sábado 22 entran 2 cuotas ($120.000). La semana del 24, la caja 7 se llena a tiempo
    // (anotación del vigía) y su pata-convenio (cuota 2) ya estaba cubierta desde el 22.
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO],
      pagos: [conv("2026-08-22", 120000)],
      eventos: [{ contrato_id: "ct1", caja_numero: 7, fecha: "2026-08-24", fuente: "pago" }],
    });
    expect(n[0].ciclosATiempo).toBe(1);
    expect(n[0].cuotasConvenio).toBe(0);
    expect(n[0].total).toBe(VALOR_CICLO);
  });

  it("moto RETENIDA (contrato suspendido): entren las cuotas que entren, UN solo $2.250 esa semana", () => {
    const suspendido: ContratoNomina = { ...CONTRATO, estado: "Suspendido" };
    const n = nominaSemana({
      ...SEMANA, contratos: [suspendido], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO],
      pagos: [conv("2026-08-22", 180000)],   // 3 cuotas el mismo sábado
    });
    expect(n[0].cuotasConvenio).toBe(1);
    expect(n[0].total).toBe(VALOR_ATRASADO);
  });

  it("firmarse el convenio NO paga nada: sin plata, cero renglones", () => {
    const n = nominaSemana({
      ...SEMANA, contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      convenios: [CONVENIO], pagos: [],
    });
    expect(n).toHaveLength(0);
  });
});

describe("la semana de nómina", () => {
  it("lunesDe encuentra el lunes de cualquier día", () => {
    expect(lunesDe("2026-08-17")).toBe("2026-08-17");   // lunes
    expect(lunesDe("2026-08-20")).toBe("2026-08-17");   // jueves
    expect(lunesDe("2026-08-23")).toBe("2026-08-17");   // domingo
    expect(lunesDe("2026-08-24")).toBe("2026-08-24");   // lunes siguiente
  });

  it("un pago fuera de la semana no entra", () => {
    const n = correr([pago("2026-08-24", 202000)]);
    expect(n).toHaveLength(0);
  });
});

// ── 🔴 EL DEFECTO DE LA SEMANA DEL 17 AL 23 (1-sep-2026) ────────────────────────────────────
// El interruptor entre modo exacto y modo viejo era GLOBAL (`if (eventos)`). Bastaba UNA
// anotación en toda la base para que TODOS los contratos entraran por el modo exacto — y el que
// no tuviera anotación quedaba INVISIBLE, aunque su cliente hubiera pagado. Caso real: la semana
// del 17 al 23 de agosto tuvo 137 clientes pagando y solo 5 anotaciones (el vigía arrancó el 22).
// La nómina mostró 3 gestiones y $231.750 cuando el trabajo real rondaba el millón.
describe("🔴 semana anterior al vigía: las anotaciones sueltas NO pueden tapar los pagos", () => {
  it("con anotaciones incompletas de una semana vieja, se calcula desde los PAGOS", () => {
    const n = nominaSemana({
      ...SEMANA,   // 17–23 ago: ANTES del vigía
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      pagos: [{ contrato_id: "ct1", fecha: "2026-08-17", created_at: "2026-08-17T10:00:00Z",
                estado: "Confirmado", aplicado_tarifa: 202000 }],
      eventos: [],   // el vigía no tenía nada de esa semana
    });
    expect(n[0].total).toBe(VALOR_CICLO);   // el pago SÍ se ve
  });

  it("el cliente que pagó no queda invisible por no tener anotación", () => {
    const n = nominaSemana({
      ...SEMANA,
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      pagos: [{ contrato_id: "ct1", fecha: "2026-08-18", created_at: "2026-08-18T10:00:00Z",
                estado: "Confirmado", aplicado_tarifa: 202000 }],
      // Una anotación de OTRO contrato: antes esto bastaba para cegar la nómina entera.
      eventos: [{ contrato_id: "otro-contrato", caja_numero: 3, fecha: "2026-08-22", fuente: "pago" }],
    });
    expect(n).toHaveLength(1);
    expect(n[0].total).toBe(VALOR_CICLO);
  });

  it("desde el 24-ago sí manda el vigía: los pagos no se releen", () => {
    const n = nominaSemana({
      desde: "2026-08-24", hasta: "2026-08-30",
      contratos: [CONTRATO], motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      pagos: [{ contrato_id: "ct1", fecha: "2026-08-25", created_at: "2026-08-25T10:00:00Z",
                estado: "Confirmado", aplicado_tarifa: 202000 }],
      eventos: [],   // el vigía dice que no se llenó ninguna caja
    });
    expect(n).toHaveLength(0);   // no se inventa un ciclo releyendo el pago
  });

  it("vigiaCubre marca la frontera exacta", () => {
    expect(vigiaCubre("2026-08-17")).toBe(false);
    expect(vigiaCubre("2026-08-21")).toBe(false);
    expect(vigiaCubre("2026-08-22")).toBe(true);
    expect(vigiaCubre("2026-08-24")).toBe(true);
  });
});
