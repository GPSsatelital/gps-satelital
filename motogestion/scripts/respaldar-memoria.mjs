#!/usr/bin/env node
/**
 * RESPALDAR LA MEMORIA DEL PROYECTO DENTRO DEL REPO.
 *
 * 🔴 POR QUÉ EXISTE (23-sep-2026). La memoria del proyecto —125 archivos, 1,1 MB, todo el "porqué"
 * de cada decisión— vivía SOLO en `C:\Users\USER\.claude\projects\…`, fuera de git. Un disco que
 * falle o un cambio de PC y se pierde entera. No es hipotético: en esa misma carpeta ya se perdió
 * `sunny-brewing-island.md`, que tenía 40+ decisiones de negocio cerradas una por una con el dueño.
 *
 * Se corre en el cierre de cada sesión. Es una copia, no un movimiento: la memoria sigue viviendo
 * donde Claude la lee; esto es la red por debajo.
 *
 *     npm run memoria:respaldar
 */
import { readdirSync, mkdirSync, copyFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ORIGEN = process.env.CLAUDE_MEMORIA_DIR
  ?? join(process.env.USERPROFILE ?? process.env.HOME ?? "",
          ".claude", "projects", "C--Users-USER-Documents-GitHub-gps-satelital", "memory");
const DESTINO = resolve(import.meta.dirname, "..", "..", "docs", "memoria");

if (!existsSync(ORIGEN)) {
  // No es un error: en otra máquina la ruta cambia. Se avisa y se sigue.
  console.log(`ℹ️  No encontré la memoria en:\n   ${ORIGEN}`);
  console.log("   Si estás en otro equipo, pasá la ruta con CLAUDE_MEMORIA_DIR=... npm run memoria:respaldar");
  process.exit(0);
}

mkdirSync(DESTINO, { recursive: true });

const archivos = readdirSync(ORIGEN).filter(f => f.endsWith(".md"));
let copiados = 0, sinCambios = 0;

for (const f of archivos) {
  const origen = join(ORIGEN, f);
  const destino = join(DESTINO, f);
  // Solo se copia lo que cambió: así `git status` muestra exactamente qué se movió hoy.
  if (existsSync(destino) && statSync(destino).mtimeMs >= statSync(origen).mtimeMs) { sinCambios++; continue; }
  copyFileSync(origen, destino);
  copiados++;
}

const enDestino = readdirSync(DESTINO).filter(f => f.endsWith(".md")).length;
const sobran = enDestino - archivos.length;

console.log(`✅ Memoria respaldada en docs/memoria/`);
console.log(`   ${archivos.length} archivos en la memoria · ${copiados} actualizados · ${sinCambios} sin cambios`);
if (sobran > 0) {
  console.log(`   ⚠️  Hay ${sobran} archivo(s) en el respaldo que ya NO están en la memoria.`);
  console.log(`      No se borran solos a propósito: puede ser una memoria eliminada a mano, y el`);
  console.log(`      respaldo es justamente para no perder nada. Revisar antes de quitarlos.`);
}
