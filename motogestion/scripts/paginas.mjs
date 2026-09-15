// Cuenta en cuántas páginas de carta cae un HTML, imprimiéndolo de verdad con Chrome.
//   node scripts/paginas.mjs scripts/_liq-tipico.html [...]
// Mide, no adivina: es la única forma de saber si el documento se pasa a la segunda hoja.
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const archivos = process.argv.slice(2);
if (!archivos.length) { console.error("Uso: node scripts/paginas.mjs <archivo.html> [...]"); process.exit(1); }

for (const rel of archivos) {
  const html = resolve(rel);
  const pdf = join(tmpdir(), `mg-liq-${Date.now()}.pdf`);
  spawnSync(CHROME, [
    "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
    `--print-to-pdf=${pdf}`, `file:///${html.replace(/\\/g, "/")}`,
  ], { stdio: "ignore" });

  if (!existsSync(pdf)) { console.log(`${rel}: no se pudo imprimir`); continue; }
  // El número de páginas del PDF: la cuenta de objetos /Type /Page (sin /Pages).
  const buf = readFileSync(pdf).toString("latin1");
  const paginas = (buf.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  console.log(`${rel}: ${paginas} página(s)`);
  unlinkSync(pdf);
}
