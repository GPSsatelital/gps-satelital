// Una presentación por tema, sacada de presentacion.html (que trae todo). Uso: node docs/capacitacion/hacer-temas.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const AQUI = dirname(fileURLToPath(import.meta.url));
const base = readFileSync(join(AQUI, "presentacion.html"), "utf8");
const guion = readFileSync(join(AQUI, "guion.html"), "utf8");
const TEMAS = { 1: "el-dia-del-administrador", 2: "liquidaciones", 3: "taller-prestamo-y-rodar", 4: "rodar-por-deuda", 5: "ceder-un-contrato", 6: "como-leer-la-cuenta-de-un-cliente" };
for (const [n, nombre] of Object.entries(TEMAS)) {
  const html = base.replace('<script src="contenido.js"></script>', `<script>window.TEMA = ${n};</script>\n<script src="contenido.js"></script>`);
  writeFileSync(join(AQUI, `tema-${n}-${nombre}.html`), html);
  writeFileSync(join(AQUI, `guion-tema-${n}-${nombre}.html`), guion.replace('<script src="contenido.js"></script>', `<script>window.TEMA = ${n};</script>
<script src="contenido.js"></script>`));
  console.log(`tema-${n}-${nombre}.html + guion`);
}
