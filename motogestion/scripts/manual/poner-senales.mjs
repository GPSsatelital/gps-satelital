// Pinta las señales del manual (6-oct-2026): los números con su línea y el anillo de "toque aquí".
//
// `capturas-reportes.mjs` mide, en la pantalla real, dónde está cada cosa que lleva número y lo deja en
// img/<foto>.marcas.json. Este programa lee esas medidas y escribe las señales dentro de cada
// <div class="lienzo"><img src="img/<foto>.png" …></div> del manual. Así la línea cae justo en lo que
// explica, y si la pantalla cambia basta con volver a tomar las fotos y correr esto otra vez.
//
// Uso:  node scripts/manual/poner-senales.mjs            (después de tomar las fotos)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const CARPETA = join(AQUI, "..", "..", "..", "docs", "manual-reportes");
const HTML = join(CARPETA, "manual-reportes.html");

const pct = (v, total) => (v / total * 100).toFixed(2) + "%";

function senales({ W, H, marcas }) {
  return marcas.filter(m => !m.falta).map(m => {
    if (m.tipo === "anillo") {
      return `<span class="anillo" style="left:${pct(m.x - 2, W)};top:${pct(m.y0 - 2, H)};width:${pct(m.x2 - m.x + 4, W)};height:${pct(m.y2 - m.y0 + 4, H)}"></span>`;
    }
    // La línea sale del borde de la foto y termina con un punto justo antes de lo que señala
    // (6 px afuera): adentro tapaba la primera letra del texto.
    const largo = m.lado === "der" ? pct(Math.max(W - (m.x2 + 6), 0), W) : pct(Math.max(m.x - 6, 0), W);
    return `<span class="call${m.lado === "der" ? " der" : ""}" style="top:${pct(m.y, H)};width:calc(${largo} + 8px)"><b>${m.n}</b></span>`;
  }).join("");
}

let html = readFileSync(HTML, "utf8");
let puestas = 0, sinMedidas = [];
html = html.replace(/(<div class="lienzo"><img src="img\/([^"]+)\.png"[^>]*>)[\s\S]*?(<\/div>)/g, (todo, img, nombre, cierre) => {
  const archivo = join(CARPETA, "img", nombre + ".marcas.json");
  if (!existsSync(archivo)) { sinMedidas.push(nombre); return todo; }
  const med = JSON.parse(readFileSync(archivo, "utf8"));
  const faltan = med.marcas.filter(m => m.falta);
  if (faltan.length) console.log(`  ${nombre}: sin señal para ${faltan.map(m => m.falta).join(", ")}`);
  puestas++;
  return img + senales(med) + cierre;
});
writeFileSync(HTML, html);
console.log(`Señales puestas en ${puestas} fotos.` + (sinMedidas.length ? ` Sin medidas (tome las fotos primero): ${sinMedidas.join(", ")}` : ""));
