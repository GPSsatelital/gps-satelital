import { describe, it, expect } from "vitest";
import { tiempoGuardadoSinResolver, tiempoGuardadoPendiente } from "./tiempoGuardado";

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
