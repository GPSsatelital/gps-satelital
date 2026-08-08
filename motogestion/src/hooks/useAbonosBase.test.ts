import { describe, it, expect } from "vitest";
import { basesDelDia, saldoBaseDeCliente, type AbonoBase } from "./useAbonosBase";

// La plata de las bases entra a la caja del día (Fase 1 del plan). Antes no entraba a ninguna
// parte: la secretaria terminaba con más efectivo en la gaveta del que el sistema decía.
//
// Lo que estas pruebas protegen es el reparto: qué suma, qué resta y qué NO se cuenta.

type Mov = Pick<AbonoBase, "tipo" | "monto" | "metodo" | "fecha" | "fecha_registro" | "grupo">;
const mov = (p: Partial<Mov>): Mov => ({
  tipo: "abono", monto: 200000, metodo: "Efectivo",
  fecha: "2026-08-08", fecha_registro: "2026-08-08", grupo: null, ...p,
});

describe("basesDelDia — la plata de bases que movió la caja", () => {
  it("un abono en efectivo suma al efectivo del día", () => {
    expect(basesDelDia([mov({})], "2026-08-08")).toEqual({ efectivo: 200000, transfer: 0, total: 200000 });
  });

  it("una devolución RESTA: esa plata salió de la gaveta", () => {
    const r = basesDelDia([mov({}), mov({ tipo: "devolucion", monto: 160000 })], "2026-08-08");
    expect(r.efectivo).toBe(40000);
  });

  // Si la retención restara, la caja diría que salió plata que sigue en la gaveta.
  it("la retención de la visita NO se cuenta: no sale de la caja, solo cambia de bolsillo", () => {
    const r = basesDelDia([
      mov({}),                                        // entró 200.000
      mov({ tipo: "devolucion", monto: 160000 }),      // salieron 160.000
      mov({ tipo: "retencion", monto: 40000 }),        // se quedaron 40.000 en la empresa
    ], "2026-08-08");
    expect(r.efectivo).toBe(40000);
  });

  it("separa efectivo de transferencia — el arqueo compara cada lado por aparte", () => {
    const r = basesDelDia([mov({}), mov({ metodo: "Transferencia", monto: 300000 })], "2026-08-08");
    expect(r).toEqual({ efectivo: 200000, transfer: 300000, total: 500000 });
  });

  // Misma regla que los pagos: el efectivo cuenta el día que se digitó, la transferencia el día
  // que el banco la recibió.
  it("la transferencia cuenta el día del BANCO, no el que se digitó", () => {
    const t = mov({ metodo: "Transferencia", fecha: "2026-08-07", fecha_registro: "2026-08-08" });
    expect(basesDelDia([t], "2026-08-07").transfer).toBe(200000);
    expect(basesDelDia([t], "2026-08-08").transfer).toBe(0);
  });

  it("el efectivo cuenta el día que se DIGITÓ", () => {
    const e = mov({ fecha: "2026-08-07", fecha_registro: "2026-08-08" });
    expect(basesDelDia([e], "2026-08-08").efectivo).toBe(200000);
  });

  // Una base nace sin grupo: el cliente aún no tiene moto. Sumársela a un socio sería meterle
  // al bolsillo plata que quizá es de otro.
  it("una base SIN grupo no entra en el total de ningún portafolio", () => {
    expect(basesDelDia([mov({})], "2026-08-08", "COSTA").total).toBe(0);
    expect(basesDelDia([mov({})], "2026-08-08").total).toBe(200000);
  });

  it("con grupo asignado sí entra al de su portafolio, y solo al suyo", () => {
    const m = [mov({ grupo: "COSTA" }), mov({ grupo: "PRADERA", monto: 100000 })];
    expect(basesDelDia(m, "2026-08-08", "COSTA").total).toBe(200000);
    expect(basesDelDia(m, "2026-08-08", "PRADERA").total).toBe(100000);
    expect(basesDelDia(m, "2026-08-08").total).toBe(300000);
  });
});

describe("saldoBaseDeCliente — cuánto tiene entregado hoy", () => {
  const base = (p: Partial<AbonoBase>): AbonoBase => ({
    id: "x", cliente_id: "c1", contrato_id: null, tipo: "abono", monto: 200000,
    metodo: "Efectivo", cuenta_id: null, grupo: null, fecha: "2026-08-08",
    fecha_registro: "2026-08-08", registrado_por: null, firma_url: null,
    huella_url: null, nota: null, created_at: "2026-08-08T10:00:00Z", ...p,
  });

  it("quien se retiró y ya cobró queda en cero, no con su plata adentro", () => {
    const movs = [base({}), base({ tipo: "devolucion", monto: 160000 }), base({ tipo: "retencion", monto: 40000 })];
    expect(saldoBaseDeCliente(movs, "c1")).toBe(0);
  });

  it("no mezcla el saldo de un cliente con el de otro", () => {
    const movs = [base({}), base({ cliente_id: "c2", monto: 500000 })];
    expect(saldoBaseDeCliente(movs, "c1")).toBe(200000);
  });
});
