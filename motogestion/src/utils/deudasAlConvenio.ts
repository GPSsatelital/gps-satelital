// QUÉ DEUDAS SE LLEVA UNA AMPLIACIÓN DE CONVENIO — espejo en TS de la regla del motor.
//
// El motor (disparador `convenio_ampliado_marca_deudas`, mig 098 + 124) marca las deudas
// **de la más vieja a la más nueva, y solo las que caben COMPLETAS** en el monto agregado:
// no existe media deuda dentro de un convenio.
//
// 🔴 POR QUÉ LA PANTALLA TIENE QUE OBEDECER ESE ORDEN, y no dejar escoger sueltas:
// antes el funcionario escribía un monto a mano. Si escribía $50.000 pensando en una multa
// reciente, el motor marcaba la deuda MÁS VIEJA que cupiera en $50.000 — otra distinta. El total
// del convenio subía bien, pero adentro quedaba financiada una deuda que nadie eligió, y la que
// el funcionario tenía en mente seguía suelta y exigible.
//
// Por eso las casillas seleccionan un PREFIJO: al marcar una deuda entran también todas las más
// viejas. Así lo que se ve en pantalla es exactamente lo que el motor va a marcar.

export type DeudaSeleccionable = {
  id: string;
  monto_pendiente: number;
  created_at: string;
};

/** Las deudas sueltas en el orden en que el motor las mira: de la más vieja a la más nueva. */
export function ordenarComoElMotor<T extends DeudaSeleccionable>(deudas: T[]): T[] {
  return deudas
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}

/**
 * Marcar la deuda en la posición `indice` incluye todas las anteriores (más viejas).
 * Desmarcarla excluye todas las posteriores. Devuelve cuántas quedan seleccionadas desde el
 * inicio: 0 = ninguna.
 */
export function alternarHasta(seleccionadas: number, indice: number): number {
  // Ya estaba dentro del prefijo → se corta justo antes de ella.
  if (indice < seleccionadas) return indice;
  // Estaba fuera → el prefijo se extiende hasta incluirla.
  return indice + 1;
}

/** Lo que suman las `n` primeras (las que el motor se llevaría). */
export function sumaPrefijo(deudas: DeudaSeleccionable[], n: number): number {
  return deudas.slice(0, Math.max(0, Math.min(n, deudas.length)))
    .reduce((s, d) => s + d.monto_pendiente, 0);
}

/**
 * Qué deudas marcaría REALMENTE el motor con un monto agregado dado (misma cuenta del
 * disparador). Sirve para avisarle al funcionario cuando el monto que escribió a mano no calza
 * con ninguna deuda, o cuando arrastra una que no pensaba incluir.
 */
export function loQueMarcariaElMotor<T extends DeudaSeleccionable>(deudas: T[], montoExtra: number): T[] {
  let resto = montoExtra;
  const out: T[] = [];
  for (const d of ordenarComoElMotor(deudas)) {
    if (resto <= 0) break;
    if (d.monto_pendiente > 0 && d.monto_pendiente <= resto) {
      out.push(d);
      resto -= d.monto_pendiente;
    }
  }
  return out;
}
