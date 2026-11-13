// Los grupos (portafolios) viven en la tabla `grupos` (mig 217): el nombre ES el código y la base
// guarda el color como una clave de esta paleta. Acá está lo que la base no guarda —cómo se ve cada
// color de día y de noche— y la misma regla de nombre que aplica la base (`grupo_normalizar` y
// `grupo_validar_nombre`), para avisarle al dueño antes de mandar y no después.
//
// 🔴 Antes de la 217 cada pantalla tenía su lista escrita a mano y su propio color: RASTREADOR era
// azul en la ficha de la moto, ámbar en Caja y celeste en Reportes. Ninguna pantalla vuelve a
// escribir un nombre de grupo ni un color: todo sale de acá y de `useGrupos()`.

export const COLORES_GRUPO = [
  "azul", "verde", "ambar", "naranja", "violeta", "aguamarina", "magenta", "gris",
] as const;
export type ColorGrupo = (typeof COLORES_GRUPO)[number];

export const NOMBRE_COLOR: Record<ColorGrupo, string> = {
  azul: "Azul", verde: "Verde", ambar: "Ámbar", naranja: "Naranja",
  violeta: "Violeta", aguamarina: "Aguamarina", magenta: "Magenta", gris: "Gris",
};

/** sólido = la raya y el botón · suave = el fondo del chip · letra = el texto sobre el suave. */
export type TonoGrupo = { solido: string; suave: string; letra: string };

export function esColorGrupo(c: unknown): c is ColorGrupo {
  return typeof c === "string" && (COLORES_GRUPO as readonly string[]).includes(c);
}

/**
 * Los tres tonos de un color, como variables de `index.css`: así cambian solos al pasar de día a
 * noche (y al imprimir vuelven a los de día). Un color que no se conoce sale gris, nunca invisible.
 */
export function tonoDeColor(color: string | null | undefined): TonoGrupo {
  const c: ColorGrupo = esColorGrupo(color) ? color : "gris";
  return { solido: `var(--g-${c})`, suave: `var(--g-${c}-soft)`, letra: `var(--g-${c}-ink)` };
}

/**
 * Los mismos tonos de día, en hex, para lo que sale de la app (el Excel no entiende variables).
 * Tienen que ser iguales a los de `:root` en `index.css`; `grupos.test.ts` lo revisa.
 */
export const HEX_DIA: Record<ColorGrupo, TonoGrupo> = {
  azul:       { solido: "#2563eb", suave: "#dbeafe", letra: "#1e40af" },
  verde:      { solido: "#16a34a", suave: "#dcfce7", letra: "#166534" },
  ambar:      { solido: "#d97706", suave: "#fef3c7", letra: "#92400e" },
  naranja:    { solido: "#ea580c", suave: "#ffedd5", letra: "#9a3412" },
  violeta:    { solido: "#7c3aed", suave: "#ede9fe", letra: "#5b21b6" },
  aguamarina: { solido: "#0d9488", suave: "#ccfbf1", letra: "#115e59" },
  magenta:    { solido: "#db2777", suave: "#fce7f3", letra: "#9d174d" },
  gris:       { solido: "#64748b", suave: "#f1f5f9", letra: "#334155" },
};

export const LARGO_MAX_GRUPO = 14;
const PATRON_NOMBRE = /^[A-ZÑÁÉÍÓÚÜ0-9]+( [A-ZÑÁÉÍÓÚÜ0-9]+)*$/;

/** Espejo de `grupo_normalizar`: un solo espacio entre palabras, sin espacios en las puntas, en mayúscula. */
export function normalizarNombreGrupo(texto: string): string {
  return texto.normalize("NFC").replace(/\s+/g, " ").trim().toUpperCase();
}

/**
 * Espejo de `grupo_validar_nombre`, con los mismos mensajes. Recibe el nombre YA normalizado.
 * Devuelve el problema, o `null` si el nombre sirve.
 */
export function problemaNombreGrupo(nombre: string): string | null {
  if (nombre === "") return "Escriba el nombre del grupo.";
  const largo = [...nombre].length;
  if (largo > LARGO_MAX_GRUPO) return `El nombre lleva hasta ${LARGO_MAX_GRUPO} caracteres; «${nombre}» tiene ${largo}.`;
  if (!PATRON_NOMBRE.test(nombre)) return `El nombre solo lleva letras, números y un espacio entre palabras: «${nombre}» no sirve.`;
  return null;
}

/** Orden de la lista en todas las pantallas: alfabético, como lo devuelve la base. */
export function ordenarPorCodigo<T extends { codigo: string }>(grupos: T[]): T[] {
  return [...grupos].sort((a, b) => a.codigo.localeCompare(b.codigo, "es"));
}
