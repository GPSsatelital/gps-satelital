/**
 * LAS DOS PREGUNTAS DEL ACUERDO — que no son la misma (17-sep-2026).
 *
 * Hasta hoy el sistema preguntaba UNA sola cosa —"¿el acuerdo está activo?"— y con esa respuesta
 * decidía DOS: si lo muestra y si le cobra. Cuando un acuerdo vence, `marcar_convenios_vencidos()`
 * lo pasa a 'incumplido', y desde ahí desaparecía de las pantallas de cobro y el motor le pasaba
 * por encima. Al que hay que perseguir se le borraba la cuenta.
 *
 * 🔴 UN ACUERDO VENCIDO ES UNA DEUDA VENCIDA, NO UNA DEUDA PERDONADA.
 *
 * El caso que lo destapó — BRAYAN (RLZ79H): acuerdo de UNA cuota de $65.000 con fecha límite el
 * lunes 14-sep. No pagó ese lunes; el martes quedó 'incumplido'. El 17 pagó $270.000 —debía
 * $195.000 de semana + $65.000 del acuerdo, le sobraba— y el motor le cobró la semana, SALTÓ el
 * acuerdo y mandó $75.000 a saldo a favor. Su acuerdo seguía diciendo 0 de 1.
 * Peor: la otra mitad del motor SÍ mira a los incumplidos y lo revivía con 7 días nuevos. O sea,
 * lo resucitaba sin darle un peso — y a los 7 días volvía a vencer. Un cliente podía quedar
 * girando en eso para siempre.
 *
 * Medido en toda la flota ese día: 7 acuerdos muertos, invisibles e incobrables, por $874.000.
 *
 * La liquidación YA lo hacía bien (`cuentaLiquidacion.ts` cobra 'activo' e 'incumplido'). Esto no
 * inventa una regla nueva: pone de acuerdo al resto del sistema con la parte que ya estaba bien.
 */

/** Lo mínimo que se necesita saber de un acuerdo para elegirlo. */
export type ConvenioElegible = {
  contrato_id: string;
  estado: string;
  created_at: string;
};

/** Los estados en los que un acuerdo TODAVÍA SE COBRA. */
export const ESTADOS_POR_COBRAR = ["activo", "incumplido"] as const;

/**
 * ¿Tiene un acuerdo VIGENTE? — activo y nada más.
 *
 * Esta es la pregunta de siempre y NO cambia. La usan las decisiones de gobierno del acuerdo:
 * si se le puede crear otro (el candado de la BD es `unique … where estado = 'activo'`) y si se
 * puede ampliar el que tiene. Ampliar un acuerdo muerto o crear uno encima de otro vivo son cosas
 * que siguen prohibidas exactamente igual que antes.
 */
export function elegirConvenioVigente<T extends ConvenioElegible>(
  convenios: T[],
  contratoId: string,
): T | null {
  return convenios.find(c => c.contrato_id === contratoId && c.estado === "activo") ?? null;
}

/**
 * ¿Tiene un acuerdo QUE HAY QUE COBRARLE? — activo o incumplido.
 *
 * Esta es la pregunta nueva, y es la que usan las pantallas de cobro y el motor de reparto.
 *
 * ⚠️ EL ORDEN IMPORTA Y NO ES CAPRICHO. Un contrato PUEDE tener un incumplido viejo y un activo
 * nuevo a la vez: el candado de la base solo impide dos ACTIVOS. Si se eligiera cualquiera, la
 * plata del cliente podría irse a pagar el acuerdo muerto en vez del que está vivo y firmado.
 * Por eso: primero el activo; si no hay, el incumplido MÁS VIEJO (se salda el más antiguo primero,
 * misma lógica FIFO que las cajas y las deudas).
 */
export function elegirConvenioPorCobrar<T extends ConvenioElegible>(
  convenios: T[],
  contratoId: string,
): T | null {
  const candidatos = convenios.filter(
    c => c.contrato_id === contratoId && (c.estado === "activo" || c.estado === "incumplido"),
  );
  if (candidatos.length === 0) return null;
  // `filter` ya devolvió un arreglo nuevo: ordenarlo no toca la lista original del store.
  candidatos.sort(
    (a, b) =>
      (a.estado === "activo" ? 0 : 1) - (b.estado === "activo" ? 0 : 1) ||
      a.created_at.localeCompare(b.created_at),
  );
  return candidatos[0];
}
