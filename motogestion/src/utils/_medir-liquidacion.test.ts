// Escribe el documento de liquidación a archivos HTML para medirlo en páginas REALES.
//
// No es una prueba de nada: es la forma de ejecutar el TS del generador desde la consola. Por eso
// se salta sola en `npm test` — solo corre cuando se le pide a propósito:
//   MEDIR=1 npx vitest run src/utils/_medir-liquidacion.test.ts
//   node scripts/paginas.mjs scripts/_liq-tipico.html
import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { htmlLiquidacion } from "./generarDocumentoLiquidacion";

const cliente = { nombre: "JHEFERSON GARCIA SILVA", cedula: "1.047.393.901", telefono: "3045383077" };
const moto = { placa: "XYZ50H", marca: "BAJAJ", modelo: "2026" };

function liq(extra: Record<string, unknown> = {}) {
  return {
    numero: "LIQ-0051",
    created_at: "2026-09-12T12:00:00Z",
    motivo: "retiro_voluntario",
    observaciones_taller: "Llega con el farol partido y el espejo derecho suelto.",
    ahorro_acumulado: 520000,
    saldo_favor: 35000,
    saldo_final: 493000,
    nombre_responsable: "SERGIO AGUAS",
    cargo_responsable: "Administrador",
    detalle_favor: [
      { concepto: "Ahorro ganado pagando", monto: 520000 },
      { concepto: "Base inicial entregada", monto: 510000 },
      { concepto: "Menos la semana que pagó esa base", monto: -202000 },
    ],
    detalle_deudas: [
      { concepto: "multa_recoleccion", monto: 30000, descripcion: "Multa por recolección" },
      { concepto: "lavada", monto: 15000, descripcion: "Lavada de la moto" },
      { concepto: "tarifa_atrasada", monto: 404000, descripcion: "2 semanas sin pagar" },
    ],
    detalle_danos: [
      { concepto: "Farol delantero", monto: 85000 },
      { concepto: "Espejo derecho", monto: 32000 },
    ],
    ...extra,
  };
}

it.runIf(process.env.MEDIR === "1")("escribe los HTML para medirlos", () => {
  // Caso típico: 3 renglones a favor, 3 deudas, 2 daños.
  writeFileSync("scripts/_liq-tipico.html", htmlLiquidacion(liq() as never, cliente as never, moto as never, { paraFirmar: true }));

  // Caso pesado: el que se le desborda al dueño — más deudas y más daños.
  writeFileSync("scripts/_liq-pesado.html", htmlLiquidacion(liq({
    detalle_deudas: [
      { concepto: "multa_recoleccion", monto: 30000, descripcion: "Multa por recolección" },
      { concepto: "lavada", monto: 15000, descripcion: "Lavada de la moto" },
      { concepto: "tarifa_atrasada", monto: 404000, descripcion: "2 semanas sin pagar" },
      { concepto: "migracion", monto: 181000, descripcion: "Saldo del sistema anterior" },
      { concepto: "convenio", monto: 232000, descripcion: "Lo que faltaba del acuerdo" },
    ],
    detalle_danos: [
      { concepto: "Farol delantero", monto: 85000 },
      { concepto: "Espejo derecho", monto: 32000 },
      { concepto: "Guardabarros", monto: 48000 },
      { concepto: "Tapa lateral", monto: 26000 },
    ],
  }) as never, cliente as never, moto as never, { paraFirmar: true }));

  // Caso mínimo: sin daños ni deudas.
  writeFileSync("scripts/_liq-minimo.html", htmlLiquidacion(liq({
    detalle_deudas: [], detalle_danos: [], observaciones_taller: null,
  }) as never, cliente as never, moto as never, { paraFirmar: true }));
});
