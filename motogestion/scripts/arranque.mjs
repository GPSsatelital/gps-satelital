#!/usr/bin/env node
/**
 * ARRANQUE DE SESIÓN — el estado real, medido, sin creerle a ningún documento.
 *
 * 🔴 POR QUÉ EXISTE (24-sep-2026, `docs/ESTANDAR.md` paso 3). `CLAUDE.md` llegó a decirle a cada
 * sesión nueva que íbamos por la migración 029 (íbamos por la 167), que se trabajaba en una rama
 * borrada, y que faltaban por construir cosas hechas hacía meses. La solución no es "actualizar
 * mejor el documento" —eso es lo que venía fallando— sino **que el estado no se escriba: se mida**.
 * Esto no puede envejecer porque no recuerda nada.
 *
 * Lo dispara el hook `SessionStart`, así que pasa aunque nadie se acuerde.
 *
 *     npm run arranque
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "..", "..");
const sh = (c) => { try { return execSync(c, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; } };
const noSe = "no verificado";

const L = [];
const linea = (k, v) => L.push("  " + String(k).padEnd(18) + (v ?? noSe));

// ── ¿La sesión anterior terminó bien? ───────────────────────────────────────────────────────
const fichaSesion = join(RAIZ, ".claude", "ultima-sesion.json");
let avisoCorte = null;
if (existsSync(fichaSesion)) {
  try {
    const s = JSON.parse(readFileSync(fichaSesion, "utf8"));
    if (!s.cerroBien) avisoCorte = `La sesión del ${s.fecha ?? "?"} NO cerró bien. Revisá si quedó algo a medias.`;
  } catch { avisoCorte = "El registro de la última sesión está ilegible."; }
} else {
  avisoCorte = "No hay registro de la última sesión (es la primera vez que corre esto, o se cortó).";
}

// ── Estado real ─────────────────────────────────────────────────────────────────────────────
const rama = sh("git branch --show-current");
const commit = sh("git log --oneline -1");
const sucio = sh("git status --porcelain");
const sinSubir = sucio === null ? null : (sucio === "" ? 0 : sucio.split("\n").length);
sh("git fetch -q origin");   // silencioso: si no hay internet, sigue
const local = sh("git rev-parse HEAD"), remoto = sh("git rev-parse origin/" + (rama || "main"));
const sync = (local && remoto) ? (local === remoto ? "iguales" : "⚠️  DISTINTOS — falta subir o bajar") : noSe;

const dirMig = join(RAIZ, "motogestion", "supabase");
const migs = existsSync(dirMig) ? readdirSync(dirMig).filter(f => /^\d+.*\.sql$/.test(f)).sort() : [];

let pruebas = noSe;
try { pruebas = JSON.parse(readFileSync(fichaSesion, "utf8")).pruebas ?? noSe; } catch { /* queda "no verificado" */ }

// ── Lo primero de la lista y las últimas decisiones ──────────────────────────────────────────
// `desdeElFinal`: las DECISIONES se leen de abajo (las últimas son las de hoy); los PENDIENTES
// de arriba (están ordenados por prioridad, y lo de arriba es lo más urgente).
const sacar = (archivo, regex, n, desdeElFinal = false) => {
  const p = join(RAIZ, "docs", archivo);
  if (!existsSync(p)) return ["(no encontré docs/" + archivo + ")"];
  const todas = [];
  for (const l of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = l.match(regex);
    // D-000 es el ejemplo de formato del encabezado, no una decisión de verdad.
    if (m && !m[1].startsWith("D-000")) todas.push(m[1].replace(/\*\*/g, "").replace(/`/g, "").trim().slice(0, 74));
  }
  if (!todas.length) return ["(nada)"];
  // Las decisiones se ordenan por NÚMERO, no por dónde quedaron en el archivo: una D-021 puede
  // estar escrita antes que la D-019 y aun así ser más nueva.
  if (desdeElFinal) {
    const num = (s) => Number((s.match(/^D-(\d+)/) || [])[1] ?? 0);
    return [...todas].sort((a, b) => num(b) - num(a)).slice(0, n);
  }
  return todas.slice(0, n);
};
const pendientes = sacar("PENDIENTES.md", /^- \[ \] .*?\*\*(.+?)\*\*/, 4);
const decisiones = sacar("DECISIONES.md", /^#{2,3} (D-\d+ · .+)$/, 3, true);

// ── ¿Hoy es día de pago? ────────────────────────────────────────────────────────────────────
const hoy = new Date(execSync("node -e \"process.stdout.write(new Date().toISOString())\"", { encoding: "utf8" }).trim());
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const diaPago = hoy.getDay() === 1 || hoy.getDay() === 3;

// ── Salida ──────────────────────────────────────────────────────────────────────────────────
console.log("\n═══════════ ARRANQUE · " + DIAS[hoy.getDay()] + " " + hoy.toLocaleDateString("es-CO") + " ═══════════\n");

if (avisoCorte) console.log("⚠️  " + avisoCorte + "\n");
if (diaPago) console.log("🔴 HOY ES DÍA DE PAGO. Nada de motor, cartera, pagos ni reparto se despliega\n   antes de las 6 de la tarde, salvo para arreglar plata mal contada de hoy.\n");

console.log("ESTADO (medido ahora, no leído de ningún documento)");
linea("rama", rama);
linea("último commit", commit);
linea("tu PC vs GitHub", sync);
linea("sin subir", sinSubir === null ? noSe : sinSubir + " archivo(s)");
linea("migraciones", migs.length ? `${migs.length} · la última: ${migs[migs.length - 1]}` : noSe);
linea("pruebas", pruebas === noSe ? "no verificado (correr `npm test`)" : `${pruebas} (al cerrar la sesión anterior)`);
console.log(L.join("\n"));

console.log("\nHERRAMIENTAS QUE DEBERÍAN ESTAR");
try {
  const m = JSON.parse(readFileSync(join(RAIZ, ".mcp.json"), "utf8"));
  console.log("  " + Object.keys(m.mcpServers || {}).join(" · "));
} catch { console.log("  " + noSe); }
console.log("  → Claude: decí cuáles NO conectaron. Si falta codebase-memory, buscá con grep Y DECILO.");

console.log("\nLO PRIMERO DE LA LISTA (docs/PENDIENTES.md)");
pendientes.forEach(p => console.log("  • " + p));

console.log("\nÚLTIMAS DECISIONES (docs/DECISIONES.md)");
decisiones.forEach(d => console.log("  • " + d));

console.log("\n───────────────────────────────────────────────────────────");
console.log("Antes de tocar plata: medir la flota, no un caso. Nada se afirma sin medirlo.");
console.log("Al terminar: npm run cierre\n");
