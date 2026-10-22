---
name: regla-memoria-siempre
description: "Regla del dueño (19-ago-2026): guardar SIEMPRE en memoria y BUSCAR en ella antes de trabajar — es lo que sostiene la coherencia entre sesiones"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-21T17:04:57.261Z
---

Guardar todo en las memorias **y buscar en ellas** antes de trabajar es obligatorio, no opcional.
El dueño lo pidió textualmente: *"el guardar todo siempre en las memorias y el buscar en las
mismas para no perder coherencia es muy importante"*.

**Why:** este proyecto lleva meses de decisiones de negocio cerradas pregunta por pregunta. Sin
memoria se re-pregunta lo ya decidido (que él odia, ver [[regla-no-romper-lo-que-funciona]]) o —
peor — se implementa contra una regla que ya existía y se rompe algo que funcionaba. Ya pasó: el
caso RLT70H del 27-jul se parchó sin dejar registro de la causa, y el mismo defecto reapareció en
4 motos el 19-ago (ver [[bug-contador-sigue-corriendo-moto-reasignada]]).

**How to apply:**
- **Antes de tocar un tema**, leer su memoria. Si el tema tiene decisiones cerradas, NO se
  re-preguntan — se citan.
- **Al cerrar cualquier hallazgo o decisión**, escribirlo de una: qué se decidió, por qué, y con
  qué datos reales se verificó. No dejarlo para "el final de la sesión" — las sesiones se cortan.
- **Guardar el POR QUÉ, no solo el qué.** Un parche sin su causa es el que deja que el defecto
  vuelva por otro lado.
- Un archivo por tema, enlazados con `[[nombre]]`, y su línea en `MEMORY.md`.
