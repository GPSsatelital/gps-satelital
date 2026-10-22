---
name: herramientas-por-pc-paridad
description: "Qué herramientas hay en cada PC y cómo dejar un PC nuevo idéntico — claude-mem/MemPalace pendientes en PC #2 (decisión del usuario 21-jul: dejarlos así por ahora)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-04T02:43:07.534Z
---

**GUÍA COMPLETA PARA EL USUARIO:** `docs/ARRANQUE-OTRO-PC.md` en el repo (viaja por git, se abre como archivo en el otro PC) — relevo normal (~1 min), montar PC nuevo (~15-20 min), qué viaja y qué no, tiempos. Es la referencia de "cómo continuar en el otro PC como si fuera aquí".

**Regla base:** Syncthing trae **datos** (memoria, notas, settings, skills); los **programas** (Node, git, plugins, MCP, drivers) se instalan una vez por PC. Eso NO rompe la paridad — es la forma de lograrla (sincronizar `node_modules`/caches revienta por rutas >260 chars en Windows).

## Checklist para dejar un PC nuevo idéntico
1. Node, git, Claude, `npm install` en `motogestion/`, drivers (HID DigitalPersona, impresora GA-E2001).
   - ⚠️ **`npm install` es OBLIGATORIO por PC** — node_modules NO viaja por git/Syncthing. En PC#2 faltaban `vitest` y `framer-motion` → el dev server no arrancaba ("Failed to resolve import framer-motion"). `npm install` los instala (están en package.json).
   - ⚠️ **`motogestion/.env` NO viaja (gitignored, son llaves)** — hay que crearlo por PC o el dev server local no conecta a Supabase y la app queda con `#root` vacío (fue LA causa de que el preview nunca cargara en PC#2, 23-jul). Contenido: `VITE_SUPABASE_URL=https://jvfkprkjysjffhzjitgl.supabase.co` + `VITE_SUPABASE_ANON_KEY=<llave publishable sb_publishable_...>` (la llave pública, segura; NO la service_role). Se saca de Supabase → Settings → API → anon/publishable.
2. Syncthing + emparejar con los otros nodos (ver [[syncthing-setup-2pc]]).
3. **Plugins:** si `/plugin` no está disponible en el entorno, se instalan copiando del marketplace a la cache:
   - origen: `~/.claude/plugins/marketplaces/<marketplace>/<ruta-del-plugin>`
   - destino: `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>` (la versión exacta sale de `installed_plugins.json`)
   - Ej. hecho el 21-jul en PC #2: `claude-plugins-official/plugins/frontend-design` → `cache/claude-plugins-official/frontend-design/unknown`; `awesome-claude-plugins/theme-factory` → `cache/awesome-claude-plugins/theme-factory/9ef49d0f2a27`.
   - ⚠️ Los plugins/MCP **solo cargan al reiniciar Claude**.
4. **MCP:** se configuran en `~/.claude.json` (fuera de lo sincronizado). **Truco adoptado:** poner los servidores en `.mcp.json` **dentro del repo** → viaja por git a todos los PC. Ahora incluye **context7 + codebase-memory + sequential-thinking** (los 3 `npx`, sin API key → seguros en el repo, 23-jul). NO se metieron **superpowers** (ruta local por-máquina) ni **task-master-ai** (puede requerir API keys → no exponer en git).

## Qué es idéntico al abrir sesión aquí o allá (mapa claro, 23-jul)
- ✅ **Viaja SOLO** (Syncthing/git, sin hacer nada): memoria nativa `.md` (`.claude/projects/.../memory/`), las **20 skills de diseño** (`.claude/skills/`), settings, comando `/deploy`, reglas CLAUDE.md, el **código** (git), y ahora los **3 MCP** del `.mcp.json`.
- ⚠️ **NO viaja — se instala 1 vez por PC** (`/plugin`, ~2 min, el marketplace ya está local): el CÓDIGO de los plugins (docx, pptx, claude-mem, mempalace, frontend-design, theme-factory) → vive en `plugins/cache/`, excluido a propósito (rutas >260 chars rompen Syncthing en Windows).
- ⚠️ **NO viaja — decisión de dejar así:** la captura AUTOMÁTICA de claude-mem/MemPalace (sus datos viven en `~/.claude-mem`, fuera de lo sincronizado, y no están instalados en PC#2). La memoria nativa `.md` cubre la continuidad — es la fuente de verdad.
- **Conclusión:** para el TRABAJO real (memoria del hilo, skills de diseño, código, reglas) abrir sesión ya es idéntico. Lo único que hay que hacer 1 vez en un PC nuevo es `/plugin` para reinstalar los plugins.

## Estado 21-jul-2026
- **PC #2 (DESKTOP-E6SNLHO):** ✅ frontend-design, theme-factory, context7. ❌ claude-mem y MemPalace (activados en `settings.json` pero SIN instalar → no capturan aquí).
- **PC #1 (DESKTOP-TVN22VH):** los 4 funcionando.
- **Asimetría conocida:** lo trabajado en el PC #2 no entra a la captura automática de claude-mem, solo a la memoria nativa (`.claude/projects/.../memory/`, que sí sincroniza y ha demostrado cubrir la continuidad — 21-jul se retomó todo el hilo sin esos plugins).

## 🎯 1-ago: EL REQUISITO REAL DEL DUEÑO — los dos PC IDÉNTICOS

Lo pidió así: *"la idea es que siempre estén ambos PC en la misma página del proyecto, y que si
cambio e instalo o lo que sea siempre se guarde en el otro de la misma manera. **No puede haber
nada de más ni de menos entre el uno y el otro.**"*

**Lo que se le explicó y aceptó como diagnóstico:** hay dos clases de cosas y se comportan
distinto. Los **datos** (memorias, notas, reglas, config declarativa) **sí viajan solos** por
Syncthing y git — ahí ya está resuelto. Los **programas** (Node, Python, bun, plugins, drivers,
paquetes) **no pueden viajar**: rompen en Windows por rutas largas y archivos en uso, y las bases
SQLite se corrompen.

**🔨 LA SOLUCIÓN PROPUESTA (sin construir, él dijo "guarda todo" antes de decidir):**
no perseguir la sincronización de programas, sino **sincronizar la LISTA de lo que debe haber**:
1. **Una lista única versionada en el repo** de todo lo que un PC debe tener (runtimes, paquetes,
   plugins, drivers, el `.env`). Viaja por git, los dos leen la misma.
2. **Un comando de chequeo** (`npm run doctor`): compara el PC actual contra la lista y dice qué
   falta. Se corre en los dos y convergen. **Es lo que garantiza "nada de más ni de menos".**
3. **Regla:** lo que se instale se agrega a la lista **en el mismo commit**. Si no está en la
   lista, no existe. Así no se puede desincronizar sin que se note.

**Se le recomendó NO sincronizar las bases de MemPalace/claude-mem** (cada PC con la suya): lo que
importa que esté igual —decisiones, reglas, estado— ya vive en las notas `.md`, que son texto y si
chocan se arreglan; las bases son binarias y si chocan se pierden enteras.

## ✅ 1-ago: MemPalace INSTALADO en el PC #2

`pip install` **desde el clon local** (`plugins/marketplaces/mempalace`), no desde PyPI — para que
quede la versión 3.5.0 exacta que el plugin espera y no un paquete distinto con el mismo nombre.
Trae chromadb + tokenizers/huggingface (nada de PyTorch); el modelo ONNX de 300 MB se baja recién
al primer uso. Los comandos `mempalace` y `mempalace-mcp` quedaron en el PATH.

Declarado en el **`.mcp.json` del repo** (commit `0abc927`), no en `.claude.json`, para que la
config le llegue sola al otro PC por git. ⚠️ **En el PC #1 hay que correr el mismo `pip install`**
o la entrada no conecta (el comando solo existe si el paquete está instalado en ESE PC).
🔲 **Falta inicializar su base**: `mempalace_status` responde "Chroma database missing".

**🔲 claude-mem sigue SIN instalar: necesita `bun`** (~90 MB). Verificado en `bun-runner.js`: busca
bun y si no está corta con "Bun not found" — **no hay respaldo con node**. Se recomendó instalarlo
por `npm install -g bun` antes que el script de la web. **El dueño no dio el visto bueno todavía.**

## ✅ RESUELTO 29-jul: NO se sincronizan las bases de claude-mem/MemPalace
El dueño preguntó si se podían sincronizar para dejar los 2 PC idénticos. Se auditó y se decidió
**que no**: son SQLite (`chroma.sqlite3` + WAL), y una base copiada a mitad de escritura queda rota
y se pierde entera — un `.md` en cambio genera un `.sync-conflict` recuperable. Además guardan
FUERA de `.claude` (`~/.claude-mem` y `~/.mempalace`), así que nunca iban a viajar solas.
**Si el PC #1 tiene contenido real, se exporta a `.md`: se migra el contenido, no la base.**
En su lugar se arregló el `.stignore`, que estaba muerto (243 MB → 2,4 MB). Detalle completo en
[[syncthing-setup-2pc]].

## Pendiente (decisión del usuario: "dejemos así por ahora")
Instalar claude-mem + MemPalace en PC #2 requiere: runtime **bun** (no instalado), `npm install`+build, servicio worker en segundo plano, **y** sincronizar sus datos (`~/.claude-mem`, fuera de la carpeta sincronizada) o su memoria seguirá separada por PC.
- El usuario valora la captura automática ("siempre está la información, solo sería buscarla") — por eso NO se desinstalaron.
- ⚠️ Riesgo a tener presente: son SQLite → son el motivo de la regla de oro "nunca Claude abierto en los 2 PC a la vez" (se corrompen). La memoria nativa en `.md` solo generaría un `.sync-conflict` recuperable.
