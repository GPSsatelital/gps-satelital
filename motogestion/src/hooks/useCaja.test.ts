import { describe, it, expect } from "vitest";
import { cierreDesactualizado } from "./useCaja";

// Desde que la transferencia cuenta en el día en que el banco la recibió (ver `fechaDeCaja`),
// una reportada tarde puede aterrizar en un día YA CERRADO. Eso es lo correcto para el arqueo,
// pero deja el cierre firmado viejo. Sin este aviso la pantalla seguiría diciendo "✓ Cerrada"
// con una cifra que ya no es, y nadie se enteraría.
//
// Regla: solo avisa cuando de verdad cambió. Un aviso que sale siempre se vuelve paisaje y el
// funcionario deja de leerlo.

const cerrada = (efectivo: number, transfer: number) =>
  ({ efectivo_total: efectivo, transferencias_total: transfer, total: efectivo + transfer });
const actual = (efectivo: number, transfer: number) =>
  ({ efectivo, transfer, total: efectivo + transfer });

describe("cierreDesactualizado — cuándo NO debe avisar", () => {
  it("el día no está cerrado → no hay nada que avisar", () => {
    expect(cierreDesactualizado(null, actual(100000, 200000))).toBeNull();
  });

  it("el cierre sigue coincidiendo → no avisa", () => {
    expect(cierreDesactualizado(cerrada(100000, 200000), actual(100000, 200000))).toBeNull();
  });

  it("diferencias de centavos no cuentan (se comparan pesos redondos)", () => {
    expect(cierreDesactualizado(cerrada(100000, 200000), actual(100000.4, 199999.8))).toBeNull();
  });
});

describe("cierreDesactualizado — cuándo SÍ debe avisar", () => {
  it("entró una transferencia de un día ya cerrado", () => {
    // Caso real: el lunes se cerró, y el martes se digitó una transferencia que el banco
    // había recibido el lunes. La plata pertenece al lunes, así que el cierre del lunes cambió.
    const dif = cierreDesactualizado(cerrada(500000, 1000000), actual(500000, 1202000));
    expect(dif).toEqual({ efectivo: 0, transfer: 202000, total: 202000 });
  });

  it("un pago del día se rechazó o se borró después de cerrar → la cifra baja", () => {
    const dif = cierreDesactualizado(cerrada(500000, 1000000), actual(500000, 800000));
    expect(dif).toEqual({ efectivo: 0, transfer: -200000, total: -200000 });
  });

  it("cambió el efectivo (esto es más grave: la plata se recibe en la mano)", () => {
    const dif = cierreDesactualizado(cerrada(500000, 1000000), actual(550000, 1000000));
    expect(dif).toEqual({ efectivo: 50000, transfer: 0, total: 50000 });
  });

  it("los dos lados a la vez", () => {
    const dif = cierreDesactualizado(cerrada(500000, 1000000), actual(480000, 1202000));
    expect(dif).toEqual({ efectivo: -20000, transfer: 202000, total: 182000 });
  });

  it("un lado sube y el otro baja lo mismo: el total no cambia, pero IGUAL avisa", () => {
    // Si solo mirara el total, este caso pasaría de largo: un pago que estaba mal marcado como
    // efectivo y se corrigió a transferencia deja el total idéntico y el arqueo torcido.
    const dif = cierreDesactualizado(cerrada(500000, 1000000), actual(400000, 1100000));
    expect(dif).toEqual({ efectivo: -100000, transfer: 100000, total: 0 });
  });
});
