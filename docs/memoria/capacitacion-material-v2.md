---
name: capacitacion-material-v2
description: "Material de capacitación rehecho — día a día por rol, casos reales e ilustraciones; generadores versionados en el repo"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-25T22:45:46.757Z
---

# Capacitación v2 (25-jul-2026, commit `131e16f`) — EN EL REPO

El usuario rechazó el deck anterior: *"muy poco documentada, sin ejemplos, sin ilustraciones, sin explicaciones y sin propósito u organización real según los casos que se puedan presentar y según lo que los funcionarios deben hacer en el día a día"*. Se rehízo completo.

## Qué hay ahora (en `docs/presentaciones/`)
- **`03-Capacitacion-operativa.pptx`** (41 láminas) — para proyectar con TODO el equipo junto (decisión del usuario: en empresa chica todos deben entender el circuito del dinero).
  - Día a día de **secretaria** (9 momentos), **cobrador** (8) y **administrador** (8): al llegar / durante el día / al cerrar.
  - **Catálogo "¿Qué hago si…?"** con 15 casos en las palabras del funcionario.
  - Cada lámina: **pantalla ilustrada de la app** con el elemento resaltado + **pasos con la ruta exacta** + **EJEMPLO REAL** (nombre, placa, cifras) + **⚠ OJO** con el error común.
  - Cierre: 6 reglas de oro + qué hacer si algo sale mal.
- **`Guias-rapidas-por-rol.pptx`** (4 hojas carta) — 1 página por rol para imprimir y pegar en cada puesto + hoja de consulta rápida de casos para el mostrador.

## Cómo se mantiene (importante)
- **El contenido vive en `_generadores/contenido-capacitacion.json`** (40 bloques) — se edita el texto ahí y se regenera, sin tocar código.
- `_generadores/gen-capacitacion-v2.js` (deck) · `gen-guias-rol.js` (guías) · `_visual-lib.js` (componentes: `pantallaMovil`, `señala`, `bloqueEjemplo`, `bloqueOjo`, `fichaCaso`).
- Las ilustraciones son **formas nativas de PowerPoint**, no capturas: se ven nítidas y no exponen datos reales de clientes. Las pantallas salen de plantillas por módulo (`PANTALLAS` en gen-capacitacion-v2.js) y se resalta la fila mencionada en la ruta.
- Regenerar: `cd docs/presentaciones && node _generadores/gen-capacitacion-v2.js 03-Capacitacion-operativa.pptx`
- **pptxgenjs se instaló localmente** en `_generadores/` (no venía en este PC); `node_modules` gitignorado.

## Gotchas aprendidos
- El grep de placeholders del skill pptx da **falsos positivos en español** ("TODO" = palabra común, "🌎 Todos"). Verificar con `TODO:` (con dos puntos) y `[insert`.
- `fichaCaso` calcula la altura de cada paso según su largo (si no, textos de 2 líneas se solapan).
- En las guías, quitar el texto entre paréntesis de los pasos (suele ser la ruta larga) o desborda la fila.

## Pendiente (no bloqueante)
Manual del SOCIO (los otros 4 roles ya tienen .docx en `docs/manuales/`).

Ver [[entrega-golive-lunes27]], [[linea-de-tiempo-historial]].
