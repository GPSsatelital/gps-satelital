import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// 🔴 QUE LOS MANUALES NO ENVEJEZCAN SOLOS (pedido del dueño, 24-sep-2026)
//
// *"Hay que identificar todos los procesos y hacer manuales para todos, y tenerlos ahí por si
//   alguna cosa cambia los aspectos o los botones que se vayan cambiando o actualizando."*
//
// El problema: un manual dice «Confirmar cierre de liquidación». Mañana alguien le cambia el
// nombre a ese botón y **nadie se entera**: el manual sigue impreso diciendo el nombre viejo, y
// quien lo lee busca un botón que ya no existe. Es el mismo defecto que tenía `CLAUDE.md`, que
// le decía a cada sesión nueva cosas que habían dejado de ser ciertas hacía meses.
//
// El candado: en los manuales, cada nombre de botón va marcado con `<span class="boton">`. Esta
// prueba los saca todos y comprueba que **cada uno siga existiendo en el código**. Si uno
// desaparece, `npm test` falla y dice cuál manual quedó mintiendo.
//
// Ya cazó uno el primer día: el manual decía «Imprimir documento» y el botón real se llama
// «Imprimir para firmar».

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..", "..");          // la raíz del repo
const DOCS = join(RAIZ, "docs");
const SRC = join(AQUI, "..");                       // motogestion/src

/** Todos los .html que hay dentro de las carpetas `docs/manual*`. */
function manuales(): string[] {
  if (!existsSync(DOCS)) return [];
  const out: string[] = [];
  for (const d of readdirSync(DOCS)) {
    if (!d.startsWith("manual")) continue;
    const carpeta = join(DOCS, d);
    if (!statSync(carpeta).isDirectory()) continue;
    for (const f of readdirSync(carpeta)) {
      if (f.endsWith(".html")) out.push(join(carpeta, f));
    }
  }
  return out;
}

/** Todo el código de pantalla, en un solo texto donde buscar. */
function codigoDePantallas(): string {
  const partes: string[] = [];
  const recorrer = (dir: string) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) { recorrer(p); continue; }
      if (/\.tsx?$/.test(f) && !f.endsWith(".test.ts") && !f.endsWith(".test.tsx")) {
        partes.push(readFileSync(p, "utf8"));
      }
    }
  };
  recorrer(SRC);
  return partes.join("\n");
}

/** Los emoji y los espacios raros no cuentan: lo que importa son las palabras. */
function soloPalabras(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

const CODIGO = soloPalabras(codigoDePantallas());
const MANUALES = manuales();

describe("Los manuales no pueden mentir sobre los botones", () => {
  it("hay manuales que revisar", () => {
    // Si algún día se mueven de carpeta, esta prueba avisa en vez de pasar en verde sin mirar nada.
    expect(MANUALES.length).toBeGreaterThan(0);
  });

  for (const ruta of MANUALES) {
    const nombre = ruta.split(/[\\/]/).slice(-2).join("/");

    it(`cada botón que nombra ${nombre} sigue existiendo en la app`, () => {
      const html = readFileSync(ruta, "utf8");
      const botones = [...html.matchAll(/<span class="boton">([\s\S]*?)<\/span>/g)]
        .map(m => soloPalabras(m[1]))
        .filter(Boolean);

      const perdidos = [...new Set(botones)].filter(b => !CODIGO.includes(b));

      if (perdidos.length > 0) {
        throw new Error(
          `\n${nombre} nombra botones que YA NO EXISTEN en la app:\n` +
          perdidos.map(b => `   · «${b}»`).join("\n") +
          `\n\nAlguien les cambió el nombre y el manual quedó diciendo el viejo.\n` +
          `Busca cómo se llama hoy en src/pages/ y corrige el manual — o el código, si el` +
          ` nombre nuevo quedó peor.\n`,
        );
      }
      expect(perdidos).toEqual([]);
    });

    it(`${nombre} apunta a fotos que existen`, () => {
      const html = readFileSync(ruta, "utf8");
      const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1]);
      // Las capturas NO se versionan (llevan datos de clientes), así que si la carpeta no está,
      // es que nadie las ha generado en este equipo — no es un error del manual.
      const carpeta = join(dirname(ruta), "img");
      if (!existsSync(carpeta)) return;

      const faltan = imgs.filter(src => !existsSync(join(dirname(ruta), src)));
      if (faltan.length > 0) {
        throw new Error(
          `\n${nombre} apunta a fotos que no están:\n` +
          faltan.map(f => `   · ${f}`).join("\n") +
          `\n\nVuelve a generarlas con scripts/manual/ o corrige el nombre.\n`,
        );
      }
      expect(faltan).toEqual([]);
    });
  }
});
