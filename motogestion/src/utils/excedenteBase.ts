import { valorPeriodoReal, type ContratoCiclo } from "./cicloPago";

// EL EXCEDENTE DE LA BASE INICIAL — lo único de la base que se puede usar (16-sep-2026)
//
// 🔴 LA REGLA DEL DUEÑO, cerrada después de un intento fallido que hubo que revertir:
//   *"ni la base ni el ahorro se pueden usar para nada según lo ya establecido; lo único que se
//    puede usar son los saldos a favor que el cliente dé de más, y en los casos que dan más de lo
//    que debían haber dado en la base inicial y les queda ahí"*.
//
// La base entregada se parte en tres, y solo la tercera se mueve:
//   1. El período adelantado ..... ya se consumió pagando su primera semana.
//   2. El ahorro de la base ...... $308.000 ($305.000 en los de tarifa vieja). 🔒 INTOCABLE.
//   3. El EXCEDENTE .............. lo que dio POR ENCIMA de eso. Esto sí.
//
// 🔴 SE CALCULA DESDE LO QUE ENTREGÓ (`ahorro_inicial`), NUNCA DESDE `ahorro_apertura`.
// En los migrados la apertura trae la mezcla del arqueo y no reconcilia con lo entregado: a PEDRO
// FLOREZ (IEW90I) le figuran $66.000 de apertura —menos que los $308.000 sagrados— aunque entregó
// $560.000. Calcularlo desde la apertura le daría excedente NEGATIVO a él, y a INGRID URBINA
// (XZN82H) una cifra equivocada. Es exactamente el error que el dueño ya atajó una vez:
// *"¿no estás confundiendo ahorros normales con ahorros de base inicial?"*.

/** El ahorro que SIEMPRE tiene que quedar dentro de la base. Nunca puede bajar de acá. */
export const PISO_BASE = 308000;
/** Los de la tarifa vieja ($195.000/semana) entraron con $500.000 = $305.000 + su semana. */
export const PISO_BASE_VIEJO = 305000;

/**
 * El piso de ESTE contrato. Se decide por la tarifa, que es lo que separa las dos épocas:
 * la vieja cobraba $195.000 la semana y pedía $500.000 de base; la de hoy, $202.000 y $510.000.
 */
export function pisoBaseDe(contrato: { valor_semanal?: number | null }): number {
  return (contrato.valor_semanal ?? 0) > 0 && (contrato.valor_semanal ?? 0) < 202000
    ? PISO_BASE_VIEJO
    : PISO_BASE;
}

export type DesgloseBase = {
  /** Lo que entregó al entrar (`contratos.ahorro_inicial`). */
  entregado: number;
  /** El período que quedó pagado por adelantado con esa plata. */
  periodoAdelantado: number;
  /** El ahorro de la base que NO se puede tocar. */
  guardadoIntocable: number;
  /** Lo que dio de más — lo ÚNICO movible. Nunca negativo. */
  excedente: number;
  /** Lo que debía haber entregado en total. */
  requerido: number;
};

/**
 * Parte la base entregada en sus tres pedazos. Devuelve el desglose entero y no solo el número,
 * para que la pantalla que muestra "dio de más" y la que lo mueve salgan del MISMO objeto y no
 * puedan contradecirse — la lección de `loQueDebe()`.
 */
export function desglosarBase(contrato: ContratoCiclo & { ahorro_inicial?: number | null; valor_semanal?: number | null }): DesgloseBase {
  const entregado = Math.max(0, contrato.ahorro_inicial ?? 0);
  const periodoAdelantado = Math.max(0, valorPeriodoReal(contrato));
  const piso = pisoBaseDe(contrato);
  const requerido = piso + periodoAdelantado;
  return {
    entregado,
    periodoAdelantado,
    // Si entregó de menos, lo guardado es lo que alcanzó: nunca se inventa plata que no dio.
    guardadoIntocable: Math.min(piso, Math.max(0, entregado - periodoAdelantado)),
    excedente: Math.max(0, entregado - requerido),
    requerido,
  };
}

/** Atajo: cuánto tiene disponible para mover, descontando lo que YA se le pasó antes. */
export function excedenteDisponible(
  contrato: ContratoCiclo & { ahorro_inicial?: number | null; valor_semanal?: number | null },
  yaTrasladado: number,
): number {
  return Math.max(0, desglosarBase(contrato).excedente - Math.max(0, yaTrasladado));
}

/**
 * ¿Se puede mover este monto? Devuelve el motivo cuando no — para que la pantalla diga QUÉ pasa
 * en vez de un botón muerto, y para que la misma regla valga en el botón y en el guardado.
 */
export function motivoNoSePuedeTrasladar(monto: number, disponible: number): string | null {
  if (!Number.isFinite(monto) || monto <= 0) return "Escribe cuánto vas a pasar a saldo a favor.";
  if (disponible <= 0) return "Este cliente no dio de más: no hay excedente que mover. La base y el ahorro no se pueden usar.";
  if (monto > disponible) return `Solo puedes pasar hasta $ ${disponible.toLocaleString("es-CO")} — el resto es la base, y la base no se toca.`;
  return null;
}
