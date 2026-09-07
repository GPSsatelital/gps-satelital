// Reglas chicas del taller, aparte de la pantalla para poder probarlas.

export type ContratoMin = { id: string; moto_id: string | null; estado: string };
export type PrestamoMin = { contrato_id: string; moto_original_id: string | null; estado: string };

/**
 * El contrato del CLIENTE de esta moto.
 *
 * Normalmente es el contrato vivo que apunta a la placa. Pero durante un préstamo de reemplazo
 * el contrato apunta a la moto PRESTADA (así funciona el swap), y la única forma de llegar al
 * cliente es por el préstamo activo cuya moto original es esta. Sin esta segunda rama, al
 * cliente que anda en una prestada no se le podía cobrar el arreglo de la suya.
 *
 * Se aceptan contratos Activos y Suspendidos (una retenida también va a taller y su dueño sigue
 * respondiendo); si hay de los dos, manda el Activo.
 */
export function contratoDeLaMoto<T extends ContratoMin>(motoId: string, contratos: T[], prestamos: PrestamoMin[]): T | null {
  const directos = contratos.filter(c => c.moto_id === motoId && (c.estado === "Activo" || c.estado === "Suspendido"));
  const directo = directos.find(c => c.estado === "Activo") ?? directos[0];
  if (directo) return directo;
  const prest = prestamoActivoDeOriginal(motoId, prestamos);
  if (!prest) return null;
  return contratos.find(c => c.id === prest.contrato_id) ?? null;
}

/** El préstamo activo en el que ESTA moto es la original (la que está guardada mientras su cliente anda en otra). */
export function prestamoActivoDeOriginal<P extends PrestamoMin>(motoId: string, prestamos: P[]): P | null {
  return prestamos.find(p => p.estado === "activo" && p.moto_original_id === motoId) ?? null;
}

/**
 * Anota qué se le hizo, con la fecha, DEBAJO de lo anterior. Nunca borra lo ya escrito: la orden
 * es la historia del arreglo y cada anotación queda con su día.
 */
export function anotarTrabajo(previo: string | null | undefined, texto: string, fechaISO: string): string {
  const limpio = texto.trim();
  const base = (previo ?? "").trim();
  if (!limpio) return base;
  const [y, m, d] = fechaISO.slice(0, 10).split("-");
  const linea = `[${d}/${m}/${y}] ${limpio}`;
  return base ? `${base}\n${linea}` : linea;
}
