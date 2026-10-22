---
name: verificar-ui-sin-browser-pane
description: "Por qué el Browser pane (y a ratos Bash) se bloquea con \"glm-5.2 temporarily unavailable\" en modo Auto, cómo destrabarlo, y la receta para verificar UI a 375px con Chrome headless cuando el pane no responde"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-03T15:53:48.263Z
---

# Browser pane bloqueado + verificación con Chrome headless (3-sep-2026)

## Causa raíz del bloqueo (no es Claude ni el proyecto)
Variables de entorno de Windows del usuario (`HKCU\Environment`) apuntan a otro proveedor:
`ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic`, `ANTHROPIC_AUTH_TOKEN=…`,
`ANTHROPIC_DEFAULT_SONNET_MODEL=glm-5.2`, `ANTHROPIC_DEFAULT_OPUS_MODEL=glm-5.2`.
En **modo Auto**, el clasificador de seguridad de cada acción intenta usar `glm-5.2` vía z.ai; si
z.ai no responde, bloquea TODO lo que no sea lectura, **aunque la herramienta esté en la allowlist**
(el Browser pane lleva meses permitido en `.claude/settings.local.json` y se bloqueó igual).
Otro proyecto del usuario sí corre a propósito con GLM (`lastModelUsage: glm-5.2[1m]` en
`.claude.json`), así que **no borrar esas variables sin preguntarle**.

**Why:** la madrugada del 3-sep se perdieron horas reintentando; git y `npx` pasaban "a ratos"
solo porque z.ai contestaba a ratos. Saberlo evita diagnosticar el proyecto por gusto.

**✅ RESUELTO DE RAÍZ el 3-sep-2026 (tarde):** el dueño pidió "borra todo lo de zai" y borró las 4
variables desde PowerShell (`reg delete`), verificación vacía. Copia de los valores (con la clave)
en `~/.claude/zai-env-backup.txt` — borrarla cuando ya no haga falta. Quedó intacta
`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`. Si el bloqueo "glm-5.2 unavailable" reaparece, algo
volvió a poner esas variables (revisar `reg query "HKCU\Environment"`).

**How to apply (si vuelve a pasar):**
- Si aparece "glm-5.2[1m] is temporarily unavailable, so auto mode cannot determine…": pedirle al
  usuario cambiar el modo de permisos de **Auto** a **Aceptar ediciones/Predeterminado**. Eso
  libera Bash y las herramientas de archivo. ⚠️ **El Browser pane siguió bloqueado aun así** (tiene
  su propio portero atado al clasificador) — no insistir, ir a la receta de abajo.
- Solución de raíz (decisión del usuario): `reg delete "HKCU\Environment" /v ANTHROPIC_BASE_URL /f`
  (y las otras 3) + reiniciar la app. Solo si ya no usa GLM en otros proyectos.

## Receta: verificar un componente a 375px sin el Browser pane
Chrome y Edge están instalados (`/c/Program Files/Google/Chrome/Application/chrome.exe`). El dev
server de Vite suele seguir vivo en `[::1]:5173` (comprobar con `netstat -ano | grep :5173`).
1. Página temporal `motogestion/harness-<tema>.html` (copia de index.html: fonts Inter, `data-theme`
   por `?theme=dark`) + `src/harness-<tema>.tsx` que importa `./index.css`, monta en `#root` y
   renderiza el componente dentro de un contenedor IGUAL al modal real (ModalRecoleccion:
   `width: min(520px, 96vw)`, padding 24, gap 14, border-box → **312px útiles a 375**).
2. **Chrome headless no permite ventanas < 500px**: simular el celular con un wrapper de `VW` px
   (`?vw=375`) y calcular el ancho del modal como `min(520, 0.96*VW)` en JS, no con `vw`.
3. Medir de verdad, no solo mirar: `getBoundingClientRect` de cada descendiente contra los bordes
   internos del modal + `scrollWidth vs clientWidth`, y pintar el resultado en la página para que
   salga en la foto.
4. `chrome.exe --headless=new --disable-gpu --hide-scrollbars --user-data-dir=<tmp>
   --window-size=500,1500 --virtual-time-budget=12000 --screenshot=<ruta.png> <url>` (día y noche),
   luego `Read` del PNG. Borrar harness + PNG antes de commitear.
- Dato del proyecto: `#root { text-align: center }` en index.css es heredado por TODA la app; las
  etiquetas `labelStyle` salen centradas también en producción — no es defecto del harness.
- Lo que la receta NO prueba: el flujo real con login (hooks/Supabase). Para eso sigue haciendo
  falta el Browser pane o el usuario en el celular.
