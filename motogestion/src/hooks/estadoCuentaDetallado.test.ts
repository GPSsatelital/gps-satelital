import { describe, it, expect } from "vitest";
import { generarHTMLEstadoCuentaDetallado, type DatosDetallado } from "./useDocumentos";
import type { Cliente } from "./useClientes";
import type { Moto } from "./useMotos";

// El estado de cuenta DETALLADO es el papel que se le entrega al cliente. Lo que no esté acá,
// para él no existe. Estas pruebas cuidan que la plata que él entregó aparezca nombrada.

const CLIENTE = { nombre: "JOHAN ANDRES PEREZ", cedula: "1234567890" } as Cliente;
const MOTO = { placa: "RMW28H" } as Moto;

const datos = (over: Partial<DatosDetallado> = {}): DatosDetallado => ({
  cuotaPeriodo: 195000,
  diaPagoLabel: "Lunes",
  estadoLabel: "Al día",
  debeHoy: 0,
  ahorroTotal: 1416000,
  deudas: [],
  saldoFavor: 0,
  pagosRecientes: [],
  desglose: [{ concepto: "Cuota del período", toca: 195000, pagado: 195000, falta: 0 }],
  historial: [],
  totalPagado: 1725000,
  preliquidacion: { lineas: [], resultado: 0 },
  ...over,
});

describe("la semana adelantada sale en el papel, no solo en pantalla", () => {
  // JOHAN (RMW28H), 18-sep-2026: le aplicaron $195.000 de saldo a favor; $110.000 taparon las 2
  // cuotas que debía del acuerdo y los $85.000 restantes quedaron adelantados de la semana
  // siguiente. En pantalla se veía; en el papel no aparecía por ningún lado.
  it("dice cuánto lleva adelantado y cuánto le faltaría", () => {
    const html = generarHTMLEstadoCuentaDetallado(CLIENTE, MOTO, datos({ adelanto: { lleva: 85000, de: 195000 } }));
    expect(html).toContain("85.000");
    expect(html).toContain("adelantados");
    expect(html).toContain("110.000");   // 195.000 − 85.000, lo que le faltaría para completarla
  });

  it("sin adelanto no inventa el renglón", () => {
    expect(generarHTMLEstadoCuentaDetallado(CLIENTE, MOTO, datos())).not.toContain("adelantados");
    expect(generarHTMLEstadoCuentaDetallado(CLIENTE, MOTO, datos({ adelanto: null }))).not.toContain("adelantados");
  });

  it("el adelanto NO se mezcla con el saldo a favor: son dos plata distintas y van en dos renglones", () => {
    const html = generarHTMLEstadoCuentaDetallado(CLIENTE, MOTO, datos({
      saldoFavor: 10000, adelanto: { lleva: 85000, de: 195000 },
    }));
    expect(html).toContain("a favor, sin usar");
    expect(html).toContain("adelantados");
  });
});
