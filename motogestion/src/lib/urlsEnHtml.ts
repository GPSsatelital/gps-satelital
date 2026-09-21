// Encuentra las URL públicas de Supabase Storage dentro de un HTML ya armado.
//
// Vive aparte de `storagePrivado.ts` a propósito: ahí adentro se importa el cliente de Supabase,
// y esta parte —la que de verdad puede equivocarse— es pura y se puede probar sola.
//
// El riesgo real no es la firma, es el RECORTE: si el patrón se pasa de largo y se lleva la
// comilla de cierre, la imagen queda con una dirección inválida y el documento sale sin firma.

const PATRON = /https?:\/\/[^"'\s<>)]*\/storage\/v1\/object\/public\/[^"'\s<>)]+/g;

/**
 * Devuelve las URL de Storage que aparecen en el HTML, sin repetir.
 * Corta en comilla, espacio, `<`, `>` o `)` — los cinco caracteres que cierran una dirección
 * dentro de un atributo HTML (`src="..."`), de un `url(...)` de CSS o de texto suelto.
 */
export function urlsDeStorageEnHtml(html: string): string[] {
  return [...new Set(html.match(PATRON) ?? [])];
}
