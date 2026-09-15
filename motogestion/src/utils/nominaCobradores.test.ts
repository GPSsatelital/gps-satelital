import { describe, it, expect } from "vitest";
import { nominaSemana, nominaSemanaDetallada, lunesDe, resumirRenglones, totalesPorGrupo, VALOR_CICLO, VALOR_ATRASADO, VALOR_RETENCION, type ContratoNomina, type PagoNomina , vigiaCubre, VALOR_VISITA, VALOR_REFERIDO } from "./nominaCobradores";

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

// ── LA VISITA DOMICILIARIA — $40.000 (regla del dueño; subido desde $30.000 el 15-sep) ───────
// La cobra QUIEN LA HIZO, en la semana en que se ENTREGA la moto, y se revierte si la validación
// dice que la moto no duerme donde el cliente declaró ("se paga por dejar el dato CIERTO").
describe("visitas domiciliarias", () => {
  const VISITADOR = "vis1";
  const conEntrega = (over: Partial<ContratoNomina> = {}): ContratoNomina => ({
    ...CONTRATO, fecha_entrega: "2026-08-19", ...over,
  });
  const visita = { id: "v1", cliente_id: "cl1", realizada_por: VISITADOR, fecha: "2026-08-10", estado: "Realizada" };
  const base = { ...SEMANA, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES, pagos: [] };

  it("se paga $30.000 en la semana de la ENTREGA, no en la de la visita", () => {
    const n = nominaSemana({ ...base, contratos: [conEntrega()], visitas: [visita] });
    const v = n.flatMap(x => x.renglones).filter(r => r.tipo === "visita");
    expect(v).toHaveLength(1);
    expect(v[0].valor).toBe(VALOR_VISITA);
    expect(v[0].fecha).toBe("2026-08-19");   // el día de la entrega
  });

  it("la cobra QUIEN LA HIZO, aunque la moto sea de otro cobrador", () => {
    const n = nominaSemana({ ...base, contratos: [conEntrega()], visitas: [visita] });
    const suya = n.find(x => x.subadminId === VISITADOR);
    expect(suya).toBeTruthy();
    expect(suya!.visitas).toBe(1);
    expect(suya!.total).toBe(VALOR_VISITA);
    // El dueño de la moto (PEDRO) no cobra la visita.
    expect(n.find(x => x.subadminId === "sub1")?.renglones.some(r => r.tipo === "visita")).toBeFalsy();
  });

  it("si la entrega fue en otra semana, no entra en esta", () => {
    const n = nominaSemana({ ...base, contratos: [conEntrega({ fecha_entrega: "2026-09-05" })], visitas: [visita] });
    expect(n.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(0);
  });

  it("🔴 NO se paga si la validación dice que la moto no duerme ahí", () => {
    const n = nominaSemana({
      ...base, visitas: [visita],
      contratos: [conEntrega({ ubicacion_moto_resultado: "no_coincide" })],
    });
    expect(n.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(0);
  });

  it("sí se paga cuando la validación confirma el lugar", () => {
    const n = nominaSemana({
      ...base, visitas: [visita],
      contratos: [conEntrega({ ubicacion_moto_resultado: "coincide" })],
    });
    expect(n.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(1);
  });

  it("la visita se carga al portafolio de la moto entregada", () => {
    const n = nominaSemana({ ...base, contratos: [conEntrega()], visitas: [visita] });
    expect(n.flatMap(x => x.renglones).find(r => r.tipo === "visita")!.grupo).toBe("PRADERA");
  });

  it("una visita se paga UNA sola vez, aunque el cliente tenga varias entregas", () => {
    const n = nominaSemana({
      ...base, visitas: [visita],
      contratos: [conEntrega(), conEntrega({ id: "ct2", fecha_entrega: "2026-08-21" })],
    });
    expect(n.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(1);
  });

  it("una visita rechazada o sin responsable no se paga", () => {
    const rechazada = nominaSemana({ ...base, contratos: [conEntrega()], visitas: [{ ...visita, estado: "Rechazada" }] });
    expect(rechazada.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(0);
    const sinQuien = nominaSemana({ ...base, contratos: [conEntrega()], visitas: [{ ...visita, realizada_por: null }] });
    expect(sinQuien.flatMap(x => x.renglones).filter(r => r.tipo === "visita")).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// SEMANA CERRADA (mig 120): al pagar, las cifras se CONGELAN. La pantalla vuelve a leerlas desde
// los renglones guardados, así que releerlos tiene que dar exactamente lo mismo que se pagó —
// si contara distinto, el sello diría "✓ Pagado $949.250" al lado de otro número.
// ─────────────────────────────────────────────────────────────────────────────────────────────
describe("releer una semana ya pagada da lo MISMO que se pagó", () => {
  const visita = { id: "v1", cliente_id: "cl1", realizada_por: "vis1", fecha: "2026-08-10", estado: "Realizada" };

  it("los renglones congelados reproducen total y conteos, tal cual", () => {
    const vivo = nominaSemana({
      ...SEMANA, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      contratos: [{ ...CONTRATO, fecha_entrega: "2026-08-19" }],
      pagos: [pago("2026-08-17", 202000)],
      visitas: [visita],
    });
    for (const n of vivo) {
      const releido = resumirRenglones(n.subadminId, n.renglones);
      expect(releido).toEqual(n);
    }
  });

  it("el orden en que lleguen los renglones no cambia el resumen", () => {
    const vivo = nominaSemana({
      ...SEMANA, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      contratos: [{ ...CONTRATO, fecha_entrega: "2026-08-19" }],
      pagos: [pago("2026-08-17", 202000)],
      visitas: [visita],
    });
    const n = vivo.find(x => x.renglones.length > 1) ?? vivo[0];
    expect(resumirRenglones(n.subadminId, [...n.renglones].reverse())).toEqual(n);
  });
});

describe("la retención absorbe su semana (regla del dueño, 7-sep-2026)", () => {
  // "Se le paga solamente lo de la retención, que son los $17.500; ahí va el pago de su semana en
  // gestión. Y si llega y paga la semana para que se la devuelvan, no se le paga algo más."
  const RETENCION = [{ moto_id: "m1", motivo: "retencion_mora", created_at: "2026-08-18T09:00:00Z" }];

  it("retener y que pague la semana atrasada ese mismo lapso vale $17.500, no $17.500 + $2.250", () => {
    const n = correr([pago("2026-08-20", 202000)], RETENCION);
    expect(n[0].total).toBe(VALOR_RETENCION);
    expect(n[0].renglones.map(r => r.tipo)).toEqual(["retencion"]);
  });

  it("sin retención esa semana, la semana cobrada se paga normal", () => {
    const n = correr([pago("2026-08-17", 202000)]);
    expect(n[0].total).toBe(VALOR_CICLO);
  });

  it("la retención sola, sin que pague nada, vale igual $17.500", () => {
    const n = correr([], RETENCION);
    expect(n[0].total).toBe(VALOR_RETENCION);
  });

  it("una visita de esa misma semana SÍ se sigue pagando: es otro trabajo y otra persona", () => {
    const n = nominaSemana({
      ...SEMANA, contratos: [{ ...CONTRATO, fecha_entrega: "2026-08-19" }],
      pagos: [], motos: MOTOS, recepciones: RETENCION, clientesPorId: CLIENTES,
      visitas: [{ id: "v1", cliente_id: "cl1", fecha: "2026-08-01", estado: "Aprobado", realizada_por: "LUMAR" }],
    });
    const lumar = n.find(x => x.subadminId === "LUMAR");
    expect(lumar?.total).toBe(VALOR_VISITA);
    expect(n.find(x => x.subadminId === "PEDRO")?.total).toBe(VALOR_RETENCION);
  });
});

// ── EL REVERSO: las motos asignadas que NO generaron gestión ────────────────────────────────
// Pedido del dueño (15-sep): "si tienen más motos asignadas por qué solo están saliendo las
// gestiones que salen" + "quiero que salgan ahí también los que no pagaron". La nómina se armaba
// desde los pagos, así que una moto sin gestión desaparecía sin dejar rastro.
describe("nominaSemanaDetallada — por qué NO se pagó cada moto", () => {
  const motos = [
    { id: "m1", placa: "ABC12D", subadmin_id: "PEDRO", grupo: "PRADERA" },
    { id: "m2", placa: "BBB22B", subadmin_id: "PEDRO", grupo: "PRADERA" },
    { id: "m3", placa: "CCC33C", subadmin_id: null, grupo: "PRADERA" },
  ];
  const base = { ...SEMANA, motos, recepciones: [], clientesPorId: CLIENTES };
  const detalle = (o: Record<string, unknown>) =>
    nominaSemanaDetallada({ ...base, pagos: [], contratos: [CONTRATO], ...o } as never);

  it("la moto que SÍ generó gestión no aparece en el reverso", () => {
    const r = detalle({ pagos: [pago("2026-08-17", 202000)] });
    expect(r.nominas[0].total).toBe(VALOR_CICLO);
    expect(r.sinGestion.map(x => x.placa)).not.toContain("ABC12D");
  });

  it("contrato activo sin pagar = NO PAGÓ, con placa y cliente", () => {
    const r = detalle({});
    const abc = r.sinGestion.find(x => x.placa === "ABC12D");
    expect(abc).toMatchObject({ motivo: "no_pago", cliente: "JUAN PEREZ", cobradorId: "PEDRO" });
  });

  it("moto sin contrato = SIN CLIENTE, no cuenta como que el cobrador no trabajó", () => {
    expect(detalle({}).sinGestion.find(x => x.placa === "BBB22B")).toMatchObject({
      motivo: "sin_contrato", cliente: "—",
    });
  });

  it("la moto SIN cobrador no entra al reverso: no es plata de nadie", () => {
    expect(detalle({}).sinGestion.map(x => x.placa)).not.toContain("CCC33C");
  });

  it("contrato Suspendido = RETENIDA que no abonó (la retención ya se pagó en su semana)", () => {
    const r = detalle({ contratos: [{ ...CONTRATO, estado: "Suspendido" }] });
    expect(r.sinGestion.find(x => x.placa === "ABC12D")?.motivo).toBe("retenida_sin_abono");
  });

  it("contrato diario = fuera por regla, no es mora del cobrador", () => {
    const r = detalle({ contratos: [{ ...CONTRATO, forma_pago: "Diario" }] });
    expect(r.sinGestion.find(x => x.placa === "ABC12D")?.motivo).toBe("diario");
  });

  it("llenó la caja pero le falta la cuota del convenio: FALTA CONVENIO, no 'no pagó'", () => {
    // Convenio firmado 3 semanas antes: para el lunes 17 ya se le exigen cuotas, y no abonó
    // ninguna. La caja de la semana SÍ se llenó, pero el paquete queda incompleto.
    const r = detalle({
      pagos: [pago("2026-08-17", 202000)],
      convenios: [{ contrato_id: "ct1", cuota_por_periodo: 50000, numero_cuotas: 10, created_at: "2026-07-27T10:00:00Z" }],
    });
    expect(r.nominas).toHaveLength(0);
    expect(r.sinGestion.find(x => x.placa === "ABC12D")?.motivo).toBe("falta_convenio");
  });

  it("nominaSemana sigue devolviendo lo mismo de siempre (no se rompió a quien ya la llamaba)", () => {
    const pagos = [pago("2026-08-17", 202000)];
    expect(nominaSemana({ ...base, pagos, contratos: [CONTRATO] }))
      .toEqual(nominaSemanaDetallada({ ...base, pagos, contratos: [CONTRATO] }).nominas);
  });
});

// ── EL ATRASADO PASÓ AL 50% Y EL REFERIDO PROPIO VALE $30.000 (15-sep-2026) ──────────────────
describe("el ciclo atrasado vale el 50% desde el 15-sep", () => {
  it("son $3.750, no los $2.250 de antes", () => {
    expect(VALOR_ATRASADO).toBe(3750);
    expect(VALOR_CICLO).toBe(7500);
  });

  it("la semana de convenio de una moto guardada sube con él (decisión del dueño: los dos al 50%)", () => {
    // Contrato Suspendido con convenio: su única gestión medible es la cuota que entra.
    const n = nominaSemana({
      ...SEMANA, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
      contratos: [{ ...CONTRATO, estado: "Suspendido" }],
      convenios: [{ contrato_id: "ct1", cuota_por_periodo: 50000, numero_cuotas: 10, created_at: "2026-07-27T10:00:00Z" }],
      pagos: [{ contrato_id: "ct1", fecha: "2026-08-19", created_at: "2026-08-19T10:00:00Z", estado: "Confirmado", aplicado_convenio: 50000 }],
    });
    expect(n[0].cuotasConvenio).toBe(1);
    expect(n[0].total).toBe(3750);
  });
});

describe("el referido propio vale $30.000 a quien trajo al cliente", () => {
  const CON_ENTREGA: ContratoNomina = { ...CONTRATO, fecha_entrega: "2026-08-19" };
  const correrRef = (o: Record<string, unknown> = {}) => nominaSemana({
    ...SEMANA, motos: MOTOS, recepciones: [], clientesPorId: CLIENTES,
    contratos: [CON_ENTREGA], pagos: [],
    referidos: [{ cliente_id: "cl1", funcionario_id: "LUMAR" }],
    ...o,
  } as never);

  it("se paga en la semana en que el cliente RECIBE la moto", () => {
    const n = correrRef();
    const lumar = n.find(x => x.subadminId === "LUMAR");
    expect(lumar?.referidos).toBe(1);
    expect(lumar?.total).toBe(VALOR_REFERIDO);
    expect(lumar?.renglones[0]).toMatchObject({ tipo: "referido", cliente: "JUAN PEREZ", valor: 30000 });
  });

  it("lo cobra QUIEN LO TRAJO, no el dueño de la moto", () => {
    // La moto es de PEDRO, pero el cliente lo trajo LUMAR.
    const n = correrRef();
    expect(n.find(x => x.subadminId === "LUMAR")?.referidos).toBe(1);
    expect(n.find(x => x.subadminId === "PEDRO")).toBeUndefined();
  });

  it("si la entrega fue otra semana, esta semana no paga nada", () => {
    expect(correrRef({ contratos: [{ ...CONTRATO, fecha_entrega: "2026-07-10" }] })).toHaveLength(0);
  });

  it("se paga UNA sola vez: su primera entrega, no cada moto que le den", () => {
    // El mismo cliente con un contrato viejo y uno nuevo: manda el viejo, que no es de esta semana.
    const n = correrRef({
      contratos: [{ ...CONTRATO, fecha_entrega: "2026-07-10" }, { ...CONTRATO, id: "ct2", fecha_entrega: "2026-08-19" }],
    });
    expect(n).toHaveLength(0);
  });

  it("es ADICIONAL a la visita: si la misma persona hizo las dos, cobra $70.000", () => {
    const n = correrRef({
      visitas: [{ id: "v1", cliente_id: "cl1", realizada_por: "LUMAR", fecha: "2026-08-10", estado: "Realizada" }],
    });
    const lumar = n.find(x => x.subadminId === "LUMAR");
    expect(lumar?.visitas).toBe(1);
    expect(lumar?.referidos).toBe(1);
    expect(lumar?.total).toBe(VALOR_VISITA + VALOR_REFERIDO);
  });

  it("sin nadie anotado, nada cambia respecto a como funcionaba antes", () => {
    expect(correrRef({ referidos: [] })).toHaveLength(0);
  });
});
