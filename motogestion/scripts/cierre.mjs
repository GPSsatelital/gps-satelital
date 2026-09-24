#!/usr/bin/env node
/**
 * CIERRE DE SESIÓN — que no quede nada suelto, y que la próxima sesión sepa cómo terminó esta.
 *
 * 🔴 POR QUÉ EXISTE (24-sep-2026, `docs/ESTANDAR.md` paso 3). El dueño: *"lo que no quiero es que
 * ya yo piense que algo está listo y vamos a ver que no, que siempre queda mocho"*. Esto revisa lo
 * que se puede revisar solo, y **pregunta en voz alta lo que no**.
 *
 * No arregla nada por su cuenta (salvo respaldar la memoria): avisa. Decidir es del humano.
 *
 *     npm run cierre
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "..", "..");
const sh = (c, opts = {}) => { try { return execSync(c, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], ...opts }).trim(); } catch (e) { return opts.tolerante ? (e.stdout ?? "") : null; } };

const items = [];
const ok = (t, d = "") => items.push({ e: "✅", t, d });
const mal = (t, d = "") => items.push({ e: "❌", t, d, falla: true });
const ojo = (t, d = "") => items.push({ e: "⚠️ ", t, d });

console.log("\n═══════════ CIERRE DE SESIÓN ═══════════\n");

// ── 1) La memoria, respaldada ───────────────────────────────────────────────────────────────
try {
  execSync("node scripts/respaldar-memoria.mjs", { cwd: join(RAIZ, "motogestion"), stdio: "ignore" });
  const n = existsSync(join(RAIZ, "docs", "memoria")) ? readdirSync(join(RAIZ, "docs", "memoria")).filter(f => f.endsWith(".md")).length : 0;
  ok("Memoria respaldada en el repo", `${n} archivos`);
} catch { mal("No se pudo respaldar la memoria"); }

// ── 2) Los enlaces de la memoria, sanos ─────────────────────────────────────────────────────
try {
  const dir = join(RAIZ, "docs", "memoria");
  const archivos = readdirSync(dir).filter(f => f.endsWith(".md"));
  const hay = new Set(archivos.map(f => f.replace(/\.md$/, "")));
  const rotos = new Set();
  for (const f of archivos)
    for (const m of readFileSync(join(dir, f), "utf8").matchAll(/\[\[([^\]|#]+)\]\]/g)) {
      const n = m[1].trim();
      // `nombre` es el ejemplo literal que usa la regla de memoria, no un enlace de verdad.
      if (n !== "nombre" && !hay.has(n)) rotos.add(n);
    }
  rotos.size ? ojo(`Enlaces de memoria rotos: ${rotos.size}`, [...rotos].join(", ")) : ok("Enlaces de memoria sanos");
} catch { ojo("No pude revisar los enlaces de memoria"); }

// ── 3) El índice de memoria, dentro del límite ──────────────────────────────────────────────
try {
  const n = readFileSync(join(RAIZ, "docs", "memoria", "MEMORY.md"), "utf8").split("\n").length;
  n > 180 ? ojo(`El índice de memoria va en ${n} líneas`, "a las 200 una sesión nueva lo lee CORTADO — hay que podarlo")
          : ok(`Índice de memoria en ${n} líneas`, "el corte está en 200");
} catch { ojo("No encontré el índice de memoria"); }

// ── 4) Las pruebas ──────────────────────────────────────────────────────────────────────────
let pruebas = null;
const salida = sh("npm test --silent", { cwd: join(RAIZ, "motogestion"), tolerante: true, stdio: ["ignore", "pipe", "pipe"] });
const m = (salida ?? "").match(/Tests\s+(\d+)\s+passed\s+\((\d+)\)/);
if (m && m[1] === m[2]) { pruebas = Number(m[1]); ok(`${pruebas} pruebas en verde`); }
else if (/failed/i.test(salida ?? "")) mal("HAY PRUEBAS EN ROJO", "no cerrar así: `npm test` para ver cuáles");
else ojo("No pude leer el resultado de las pruebas", "correr `npm test` a mano");

// ── 5) Nada sin subir ───────────────────────────────────────────────────────────────────────
// `ultima-sesion.json` se excluye porque lo escribe ESTE script: si no, el cierre nunca podría
// pasar — dejaría un archivo nuevo y se quejaría de él en la misma corrida. Se muerde la cola.
const sucio = (sh("git status --porcelain") ?? "")
  .split("\n").filter(l => l.trim() && !l.includes("ultima-sesion.json")).join("\n");
const rama = sh("git branch --show-current") ?? "main";
sh("git fetch -q origin");
const local = sh("git rev-parse HEAD"), remoto = sh("git rev-parse origin/" + rama);
if (sucio) mal(`${sucio.split("\n").length} archivo(s) sin commitear`, "se pierden si esta máquina falla");
else if (local && remoto && local !== remoto) mal("Hay commits sin subir a GitHub", "`git push origin " + rama + "`");
else ok("Todo subido a GitHub");

// ── 6) ¿Se registró lo aprendido hoy? ───────────────────────────────────────────────────────
const hoyISO = new Date(execSync("node -e \"process.stdout.write(new Date().toISOString())\"", { encoding: "utf8" }).trim()).toISOString().slice(0, 10);
const tocadoHoy = (arch) => {
  const f = sh(`git log -1 --format=%cs -- docs/${arch}`);
  return f === hoyISO;
};
tocadoHoy("DECISIONES.md") ? ok("Hay decisiones registradas hoy")
  : ojo("Hoy no se registró ninguna DECISIÓN", "¿el dueño no decidió nada? — si decidió, va a docs/DECISIONES.md");
tocadoHoy("DERRAPES.md") ? ok("Hay derrapes registrados hoy")
  : ojo("Hoy no se registró ningún DERRAPE", "¿en qué me equivoqué hoy? — si la respuesta es 'en nada', es sospechosa");

// ── Resultado ───────────────────────────────────────────────────────────────────────────────
for (const i of items) console.log(`  ${i.e} ${i.t}${i.d ? "  —  " + i.d : ""}`);

const cerroBien = !items.some(i => i.falla);
mkdirSync(join(RAIZ, ".claude"), { recursive: true });
writeFileSync(join(RAIZ, ".claude", "ultima-sesion.json"),
  JSON.stringify({ fecha: hoyISO, cerroBien, pruebas, commit: sh("git rev-parse --short HEAD") }, null, 2) + "\n");

console.log("\n" + (cerroBien
  ? "✅ Sesión cerrada. La próxima arranca sabiendo que esta terminó bien."
  : "❌ QUEDÓ ALGO SUELTO. Arreglalo y volvé a correr `npm run cierre`."));
console.log("\nY el entregable en palabras del dueño:");
console.log("  • la lista de «qué significa terminado», respondida una por una con el número real");
console.log("  • qué se tocó · qué NO se tocó · qué se ve distinto · qué quedó sin probar\n");
process.exit(cerroBien ? 0 : 1);
