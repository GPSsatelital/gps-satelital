import { describe, it, expect } from "vitest";
import { htmlLiquidacion } from "./generarDocumentoLiquidacion";
import type { Liquidacion } from "../hooks/useLiquidaciones";

// EL DOCUMENTO QUE EL CLIENTE FIRMA. Estas pruebas leen el HTML real que se imprime y se vuelve
// PDF — no una copia de la lógica. Si un cambio del armador descuadra la tabla, revientan acá
// antes de llegar a un papel firmado.

// ANTONIO MONTERROZA (LIQ-0012), cifras reales del 21-ago tras el recálculo.
const LIQ = {
  numero: "LIQ-0012", motivo: "retiro_voluntario", created_at: "2026-08-21T10:00:00Z",
  ahorro_acumulado: 456000, saldo_favor: 0, total_deudas: 108000, costo_danos: 10000,
  saldo_final: 338000,
  detalle_favor: [
    { concepto: "Base inicial que entregó", monto: 510000 },
    { concepto: "Menos la semana que esa base pagó", monto: -202000 },
    { concepto: "Ahorro que ganó pagando", monto: 148000 },
  ],
  detalle_deudas: [
    { concepto: "Días que rodó y no pagó", monto: 124000, auto: true },
    { concepto: "Ahorro que le corresponde de esos días", monto: -16000, auto: true },
  ],
  detalle_danos: [{ concepto: "Lavada", monto: 10000 }],
  observaciones_taller: null, nombre_responsable: "ANGELA", cargo_responsable: "Secretaria",
} as unknown as Liquidacion;

const CLIENTE = { nombre: "ANTONIO MONTERROZA", cedula: "1044920690" };

/** Saca las filas de la tabla financiera como [concepto, montoConSigno]. */
function filas(html: string): Array<[string, number]> {
  const tabla = html.match(/<tbody>([\s\S]*?)<\/tbody>/)![1];
  return [...tabla.matchAll(/<tr[^>]*><td>(.*?)<\/td><td[^>]*>([\s\S]*?)<\/td><\/tr>/g)]
    .map(m => {
      const signo = m[2].trim().startsWith("-") ? -1 : 1;
      return [m[1], signo * Number(m[2].replace(/[^0-9]/g, ""))] as [string, number];
    });
}

describe("la tabla del documento cuadra sola", () => {
  it("los renglones (sin el total) suman exactamente el saldo final", () => {
    const html = htmlLiquidacion(LIQ, CLIENTE, null);
    const f = filas(html);
    const total = f.find(([c]) => c === "SALDO FINAL")!;
    const suma = f.filter(([c]) => c !== "SALDO FINAL").reduce((s, [, m]) => s + m, 0);
    expect(suma).toBe(338000);
    expect(total[1]).toBe(338000);
  });

  it("la base sale con su nombre y la semana descontada en rojo — no un bulto llamado 'Ahorro acumulado'", () => {
    const html = htmlLiquidacion(LIQ, CLIENTE, null);
    expect(html).toContain("Base inicial que entregó");
    expect(html).toContain("Menos la semana que esa base pagó");
    // La base NO es ahorro: el bulto viejo no debe aparecer cuando hay desglose.
    expect(html).not.toContain("<td>Ahorro acumulado</td>");
  });

  it("una liquidación VIEJA (sin desglose guardado) se dibuja a la antigua, sin cambiar lo firmado", () => {
    const vieja = { ...LIQ, detalle_favor: [] } as unknown as Liquidacion;
    const html = htmlLiquidacion(vieja, CLIENTE, null);
    expect(html).toContain("<td>Ahorro acumulado</td>");
    expect(html).not.toContain("Base inicial que entregó");
  });

  it("el crédito del cliente dentro de las deudas sale con '+', no restando su propia plata", () => {
    const html = htmlLiquidacion(LIQ, CLIENTE, null);
    const f = filas(html);
    expect(f.find(([c]) => c === "Ahorro que le corresponde de esos días")![1]).toBe(16000);
    expect(f.find(([c]) => c === "Días que rodó y no pagó")![1]).toBe(-124000);
  });

  it("el borrador lleva la marca y el aviso; el firmado no", () => {
    const borrador = htmlLiquidacion(LIQ, CLIENTE, null, { borrador: true });
    const firmado = htmlLiquidacion(LIQ, CLIENTE, null, { firmaUrl: "data:image/png;base64,x" });
    expect(borrador).toContain('<div class="marca-borrador">BORRADOR</div>');
    expect(borrador).toContain("no tiene valor");
    // La CLASE vive siempre en el CSS; lo que no puede existir en el firmado es el DIV.
    expect(firmado).not.toContain('<div class="marca-borrador">');
    expect(firmado).toContain('alt="Firma del cliente"');
  });
});
