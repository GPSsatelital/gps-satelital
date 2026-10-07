// La voz de los videos de la capacitación: lee contenido.js y graba cada escena con la voz del computador
// (Windows, "Microsoft Laura"). Uso:  node docs/capacitacion/hacer-audio.mjs
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const AQUI = dirname(fileURLToPath(import.meta.url));
const window = {};
new Function("window", readFileSync(join(AQUI, "contenido.js"), "utf8"))(window);
const SALIDA = join(AQUI, "audio");
mkdirSync(SALIDA, { recursive: true });
const solo = process.argv[2];
for (const [id, v] of Object.entries(window.CAP.videos)) {
  if (solo && solo !== id) continue;
  v.escenas.forEach((e, i) => {
    const archivo = join(SALIDA, `${id}-${String(i + 1).padStart(2, "0")}.wav`);
    const r = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", join(AQUI, "voz.ps1"), "-Texto", e.voz, "-Salida", archivo], { encoding: "utf8" });
    console.log(`${id} escena ${i + 1}: ${r.trim()} ${existsSync(archivo) ? "" : "(NO SE GUARDÓ)"}`);
  });
}
