import type { DetalleDeuda } from "../hooks/useLiquidaciones";

// EL DESGLOSE DE LO QUE SE LE DESCUENTA AL CLIENTE EN SU LIQUIDACIÓN.
//
// Existe porque el total y su explicación se habían separado: `total_deudas` guardaba el NETO
// (lo que rodó sin pagar, menos su ahorro de esos días, menos lo prepagado) pero `detalle_deudas`
// solo guardaba lo que había escrito el funcionario. Resultado: el documento que el cliente FIRMA
// mostraba renglones que no sumaban el total. Caso real — ANTONIO MONTERROZA, LIQ-0012:
//
//     Ahorro acumulado     $448.000
//     Daño: Lavada         - $10.000
//     SALDO FINAL          $330.000      ← faltaban $108.000 sin explicar
//
// Acá salen los DOS del mismo lugar, así que no pueden contradecirse.

export type EntradaDesglose = {
  /** Lo que escribió una persona: deudas del sistema + lo que agregó el funcionario. */
  manuales: DetalleDeuda[];
  /** Días que usó la moto y no pagó. Se cobran completos (tarifa + ahorro). */
  porCobrar: number;
  /** De esos días cobrados, la parte que es ahorro SUYO. Se le devuelve. */
  ahorroDeLosDias: number;
  /** Lo que pagó por adelantado y no alcanzó a consumir. Se le devuelve. */
  prepagadoNoUsado: number;
};

/**
 * Arma los renglones y el total. Montos NEGATIVOS = crédito del cliente.
 *
 * Los renglones del cálculo van marcados `auto`: el formulario los filtra al precargar, porque
 * si se precargaran, volver a calcular los sumaría encima de los que el cálculo genera otra vez
 * y se le cobraría dos veces.
 */
export function desgloseDeudas(e: EntradaDesglose): { renglones: DetalleDeuda[]; total: number } {
  const renglones: DetalleDeuda[] = e.manuales.filter(d => d.concepto.trim());
  const auto: DetalleDeuda[] = [];
  if (e.porCobrar > 0) auto.push({ concepto: "Días que rodó y no pagó", monto: e.porCobrar, auto: true });
  if (e.ahorroDeLosDias > 0) auto.push({ concepto: "Ahorro que le corresponde de esos días", monto: -e.ahorroDeLosDias, auto: true });
  if (e.prepagadoNoUsado > 0) auto.push({ concepto: "Pagó adelantado y no alcanzó a usar", monto: -e.prepagadoNoUsado, auto: true });

  const todos = [...renglones, ...auto];
  return { renglones: todos, total: todos.reduce((s, d) => s + Number(d.monto), 0) };
}
