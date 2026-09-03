import { describe, it, expect } from "vitest";
import { tiempoGuardadoSinResolver, tiempoGuardadoPendiente, tramosDePrestamos, tramoDeRetencion } from "./tiempoGuardado";

// El caso real (24-ago): el SUBADMIN entregó la moto de JUAN CARLOS (YAL68H) y el tiempo
// guardado quedó sin resolver — el admin solo se enteró porque se lo contaron. Esta detección
// derivada es la que lo deja VISIBLE sin que nadie tenga que marcar nada.

const CT = "contrato-1";
const MOTO = "moto-1";
const rec = (destino: string, fecha: string, contrato: string | null = CT) =>
  ({ contrato_id: contrato, moto_id: MOTO, ubicacion_destino: destino, created_at: fecha + "T10:00:00Z" });
const acu = (fecha: string) => ({ contrato_id: CT, created_at: fecha + "T12:00:00Z" });

describe("el tiempo guardado que nadie resolvió queda visible solo", () => {
  it("guardada y entregada SIN acuerdo → pendiente con sus fechas y días (caso JUAN CARLOS)", () => {
    const p = tiempoGuardadoSinResolver(
      [rec("bodega", "2026-08-05"), rec("con_cliente", "2026-08-24")], [], CT, MOTO);
    expect(p).toEqual({ desde: "2026-08-05", hasta: "2026-08-24", dias: 19 });
  });

  it("con un acuerdo posterior al guardado (cobrar O rodar), ya no hay pendiente", () => {
    const p = tiempoGuardadoSinResolver(
      [rec("bodega", "2026-08-05"), rec("con_cliente", "2026-08-24")],
      [acu("2026-08-24")], CT, MOTO);
    expect(p).toBeNull();
  });

  it("si la moto SIGUE guardada, no es pendiente: se resuelve al entregarla", () => {
    const p = tiempoGuardadoSinResolver([rec("bodega", "2026-08-05")], [], CT, MOTO);
    expect(p).toBeNull();
  });

  it("un acuerdo viejo de OTRO tramo no tapa el tramo nuevo", () => {
    const p = tiempoGuardadoSinResolver(
      [rec("bodega", "2026-07-01"), rec("con_cliente", "2026-07-10"),
       rec("taller", "2026-08-05"), rec("con_cliente", "2026-08-24")],
      [acu("2026-07-10")], CT, MOTO);
    expect(p).toEqual({ desde: "2026-08-05", hasta: "2026-08-24", dias: 19 });
  });

  it("las recepciones viejas sin contrato se enganchan por la moto", () => {
    const p = tiempoGuardadoSinResolver(
      [rec("bodega", "2026-08-05", null), rec("con_cliente", "2026-08-24", null)], [], CT, MOTO);
    expect(p).not.toBeNull();
  });

  it("sin recepciones no hay nada que resolver", () => {
    expect(tiempoGuardadoSinResolver([], [], CT, MOTO)).toBeNull();
  });
});

// El caso IGC46I (25-ago): le hicieron el convenio para recuperar la moto SIN rodarle antes
// los días de bodega — el convenio nació cobrando semanas que la moto pasó en la empresa.
// Desde Inmovilizaciones el pre-paso preguntaba; desde Cartera pasaba derecho.
describe("la moto que TODAVÍA está guardada (el convenio para recuperarla)", () => {
  it("cuenta el tramo hasta HOY y avisa que sigue guardada", () => {
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-15")], [], CT, MOTO, "2026-08-25");
    expect(p).toEqual({ desde: "2026-08-15", hasta: "2026-08-25", dias: 10, sigueGuardada: true });
  });

  it("ya entregada: el tramo cierra en la entrega, no en hoy", () => {
    const p = tiempoGuardadoPendiente(
      [rec("bodega", "2026-08-15"), rec("con_cliente", "2026-08-24")], [], CT, MOTO, "2026-09-30");
    expect(p).toMatchObject({ hasta: "2026-08-24", dias: 9, sigueGuardada: false });
  });

  it("con acuerdo posterior al guardado ya no pide nada", () => {
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-15")], [acu("2026-08-20")], CT, MOTO, "2026-08-25");
    expect(p).toBeNull();
  });

  it("el mismo día que se guarda no hay días que rodar todavía", () => {
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-25")], [], CT, MOTO, "2026-08-25");
    expect(p).toMatchObject({ dias: 0, sigueGuardada: true });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════════════
// AMPLIACIÓN 3-sep-2026 — EL CASO IEW64I (ARMANDO JIMENEZ PEÑA), verificado contra producción.
//
// Su moto estuvo guardada 7 días (27-ago → 3-sep) y NADA lo mostró como pendiente. El dueño lo
// reportó como "no me deja rodarle el tiempo de la garantía". No era garantía: fue un PRÉSTAMO DE
// REEMPLAZO, y un préstamo no escribe recepciones, así que esta red no lo veía.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const HOY = "2026-09-04";

describe("préstamo de reemplazo — mientras rueda en la prestada, SU moto está guardada", () => {
  const prestamoArmando = [{ contrato_id: CT, fecha_inicio: "2026-08-27", fecha_fin: "2026-09-03" }];

  it("🔴 el caso de ARMANDO: 7 días guardada, sin una sola recepción, y sale pendiente", () => {
    const extras = tramosDePrestamos(prestamoArmando, CT);
    const p = tiempoGuardadoPendiente([], [], CT, MOTO, HOY, extras);
    expect(p).toEqual({ desde: "2026-08-27", hasta: "2026-09-03", dias: 7, sigueGuardada: false });
  });

  it("también lo ve la lista de contratos (el tramo ya cerrado)", () => {
    const extras = tramosDePrestamos(prestamoArmando, CT);
    expect(tiempoGuardadoSinResolver([], [], CT, MOTO, extras)).toEqual({ desde: "2026-08-27", hasta: "2026-09-03", dias: 7 });
  });

  it("si el admin ya resolvió esos días, deja de aparecer", () => {
    const extras = tramosDePrestamos(prestamoArmando, CT);
    expect(tiempoGuardadoPendiente([], [acu("2026-09-03")], CT, MOTO, HOY, extras)).toBeNull();
  });

  it("un acuerdo ANTERIOR al guardado no lo tapa: es de otro ciclo", () => {
    const extras = tramosDePrestamos(prestamoArmando, CT);
    expect(tiempoGuardadoPendiente([], [acu("2026-08-01")], CT, MOTO, HOY, extras)?.dias).toBe(7);
  });

  it("préstamo todavía abierto: cuenta hasta hoy y avisa que sigue guardada", () => {
    const extras = tramosDePrestamos([{ contrato_id: CT, fecha_inicio: "2026-09-01", fecha_fin: null }], CT);
    expect(tiempoGuardadoPendiente([], [], CT, MOTO, HOY, extras)).toEqual({ desde: "2026-09-01", hasta: HOY, dias: 3, sigueGuardada: true });
  });

  it("el préstamo de OTRO contrato no se cuela", () => {
    expect(tramosDePrestamos([{ contrato_id: "otro", fecha_inicio: "2026-08-27", fecha_fin: null }], CT)).toEqual([]);
  });
});

describe("retención abierta (garantía / fiscalía / tránsito)", () => {
  it("una moto con retención abierta cuenta como guardada hasta hoy", () => {
    const extras = tramoDeRetencion({ retencion_fecha: "2026-08-30" });
    expect(tiempoGuardadoPendiente([], [], CT, MOTO, HOY, extras)).toEqual({ desde: "2026-08-30", hasta: HOY, dias: 5, sigueGuardada: true });
  });

  it("sin retención no aporta nada", () => {
    expect(tramoDeRetencion({ retencion_fecha: null })).toEqual([]);
    expect(tramoDeRetencion(null)).toEqual([]);
    expect(tramoDeRetencion(undefined)).toEqual([]);
  });
});

describe("cuando hay varias fuentes, manda el tramo MÁS RECIENTE", () => {
  it("un préstamo posterior a una recepción vieja gana", () => {
    const extras = tramosDePrestamos([{ contrato_id: CT, fecha_inicio: "2026-08-27", fecha_fin: "2026-09-03" }], CT);
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-07-01"), rec("con_cliente", "2026-07-05")], [], CT, MOTO, HOY, extras);
    expect(p?.desde).toBe("2026-08-27");
  });

  it("una recepción posterior al préstamo gana", () => {
    const extras = tramosDePrestamos([{ contrato_id: CT, fecha_inicio: "2026-07-01", fecha_fin: "2026-07-10" }], CT);
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-20")], [], CT, MOTO, HOY, extras);
    expect(p).toMatchObject({ desde: "2026-08-20", sigueGuardada: true });
  });

  it("con la misma fecha de inicio gana el que sigue abierto — es el que urge", () => {
    const extras = tramosDePrestamos([{ contrato_id: CT, fecha_inicio: "2026-08-20", fecha_fin: null }], CT);
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-20"), rec("con_cliente", "2026-08-25")], [], CT, MOTO, HOY, extras);
    expect(p?.sigueGuardada).toBe(true);
  });

  it("sin extras se comporta EXACTAMENTE como antes", () => {
    const p = tiempoGuardadoPendiente([rec("bodega", "2026-08-01"), rec("con_cliente", "2026-08-08")], [], CT, MOTO, HOY);
    expect(p).toEqual({ desde: "2026-08-01", hasta: "2026-08-08", dias: 7, sigueGuardada: false });
  });
});
