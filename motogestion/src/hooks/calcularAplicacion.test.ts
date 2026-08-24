import { describe, it, expect } from "vitest";
import { calcularAplicacion } from "./usePagos";

// EL ORDEN SAGRADO DEL REPARTO — verificado el 23-ago-2026 (caso GEOVANNY DPU58I, ver
// docs/MAPA-FINANCIERO.md): cuota pactada → base inicial → deuda → convenio → saldo a favor.
//
// Este orden vive en DOS carriles que deben decir lo mismo:
//   · contratos con motor v2 → el trigger de la BD (aplicar_pago_confirmado, mig 045)
//   · contratos v1/diarios  → esta función (calcularAplicacion)
// La única puerta que puede saltárselo A PROPÓSITO es la recuperación de moto retenida
// (multa primero — el contrato está suspendido, no hay semana corriendo).
//
// Estas pruebas son el CANDADO: si alguien cambia el orden —o agrega una pantalla que mande
// plata al convenio con la semana descubierta— esto lo caza antes de llegar a producción.

describe("el orden sagrado: la semana SIEMPRE cobra primero que el convenio", () => {
  it("con semana descubierta, ni un peso va al convenio", () => {
    // Debe $202.000 de semana y tiene convenio con cuota $60.000. Trae $150.000.
    const a = calcularAplicacion(150000, 202000, 0, 0, 60000);
    expect(a.tarifa).toBe(150000);
    expect(a.convenio).toBe(0);
  });

  it("el convenio solo recibe cuando la semana Y la deuda ya están llenas", () => {
    // Semana $202.000 + deuda $30.000 + cuota convenio $60.000. Trae $262.000:
    // alcanza para semana y deuda; al convenio solo llegan los últimos $30.000.
    const a = calcularAplicacion(262000, 202000, 0, 30000, 60000);
    expect(a).toMatchObject({ tarifa: 202000, deuda: 30000, convenio: 30000 });
  });

  it("el paquete completo se reparte entero en orden y el sobrante queda como saldo", () => {
    const a = calcularAplicacion(300000, 202000, 0, 0, 60000);
    expect(a).toMatchObject({ tarifa: 202000, convenio: 60000, saldo: 38000 });
  });

  it("semana cubierta (contemplada por el convenio) → la plata SÍ va al convenio: el caso GEOVANNY", () => {
    // El 15-ago su semana vivía dentro del convenio (cuota pendiente = 0): los $200.000
    // al convenio fueron el reparto CORRECTO, no un salto de fila.
    const a = calcularAplicacion(200000, 0, 0, 0, 925000);
    expect(a.convenio).toBe(200000);
    expect(a.tarifa).toBe(0);
  });

  it("la base inicial pendiente cobra después de la semana y antes de la deuda", () => {
    const a = calcularAplicacion(120000, 50000, 40000, 20000, 60000);
    expect(a).toMatchObject({ tarifa: 50000, baseInicial: 40000, deuda: 20000, convenio: 10000 });
  });

  it("el saldo a favor nunca se inventa: sin sobrante, saldo cero", () => {
    const a = calcularAplicacion(202000, 202000, 0, 0, 0);
    expect(a.saldo).toBe(0);
  });
});
