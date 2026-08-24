import { describe, it, expect } from "vitest";
import { tiempoGuardadoSinResolver } from "./tiempoGuardado";

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
