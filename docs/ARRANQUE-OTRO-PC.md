# Arranque en el otro PC — para continuar como si fuera aquí

Guía para retomar el trabajo en el otro computador sin perder el hilo. Léela como archivo (viaja por git) antes de abrir Claude.

---

## A) Cada vez que cambias de PC (relevo normal) — ~1 minuto

1. **En el PC que dejas:** cierra Claude → cuenta ~10 segundos (que terminen de escribirse las bases) → mira que Syncthing quede en **VERDE ("Actualizado")**.
2. **En el PC al que llegas:** espera el **VERDE** de Syncthing → abre Claude.
   - El `git pull` del código lo hace solo el hook al abrir (no tienes que hacer nada).
3. **Regla de oro:** NUNCA Claude abierto en los dos PC a la vez (las bases SQLite se corrompen).
4. Di **"¿en qué vamos?"** — Claude lee la memoria y retoma el hilo exacto.

> Si aparece un archivo `*.sync-conflict-*` en `.claude/projects/.../memory/`: **no lo borres**, avísame y lo fusionamos (el versionado de Syncthing guarda copias).

---

## B) Montar un PC nuevo desde cero (una sola vez) — ~15-20 minutos

1. Instalar (por máquina, no se sincronizan): **Node, git, Claude CLI**.
2. Clonar el repo en la MISMA ruta: `C:\Users\USER\Documents\GitHub\gps-satelital` y `npm install` en `motogestion/`.
   - La cuenta de Windows debe ser **USER** y la ruta idéntica (la memoria usa la ruta literal).
3. **Syncthing:** instalar y emparejar con los otros nodos (PC #1, PC #2, celu buzón). Esperar el verde.
4. **Plugins** (el código no viaja; el marketplace sí): abrir Claude → `/plugin` → instalar:
   - `frontend-design`, `theme-factory`, `claude-mem`, `mempalace`.
   - Reiniciar Claude (los plugins cargan al reiniciar).
5. **MCP:** context7 + codebase-memory + sequential-thinking **ya viajan** por el `.mcp.json` del repo → se cargan solos. Si necesitas `task-master-ai` o `superpowers`, se agregan a mano (no van al repo: keys/rutas locales).
6. **Drivers** (por máquina): HID DigitalPersona (huella) + impresora GA-E2001.

---

## C) Qué ya es idéntico sin hacer nada (viaja solo)

- **Memoria del hilo** (los `.md` con el plan de entrega, rediseño, reglas, decisiones).
- **Las 20 skills de diseño** (interface-design, design-review, redesign, ux-writing…).
- **Settings, comando `/deploy`, reglas de CLAUDE.md**.
- **El código** (por git) y **los 3 MCP** del `.mcp.json`.

Para el trabajo real, abrir sesión ya es idéntico. Lo único manual en un PC nuevo es el `/plugin` del punto B4.

---

## D) Lo que NO viaja (y por qué está bien así)

- **Código de los plugins** (`plugins/cache/`): rutas de +260 caracteres rompen Syncthing en Windows → se reinstala con `/plugin`.
- **Captura automática de claude-mem/MemPalace** (`~/.claude-mem`, fuera de lo sincronizado): la memoria nativa `.md` cubre la continuidad — es la fuente de verdad.

> Paridad TOTAL de la captura automática = instalar claude-mem/MemPalace en el otro PC + sincronizar `~/.claude-mem` (30-60 min). Proyecto para DESPUÉS del go-live, no antes.

---

## E) Resumen de tiempos

| Situación | Tiempo |
|---|---|
| Relevo normal (cambiar de PC) | ~1 min |
| Montar un PC nuevo desde cero | ~15-20 min |
| Paridad total claude-mem (opcional, después) | 30-60 min |
