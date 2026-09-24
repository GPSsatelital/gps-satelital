---
name: feedback-no-gastar-tokens-en-agentes
description: El dueño paga los tokens y ya se le agotó el tope una vez. Hacer el trabajo yo mismo con lecturas puntuales; no lanzar agentes/workflows salvo que él lo pida.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-13T22:17:08.459Z
---

# "Hazlo tú mismo que te me gastas los tokens"

Dicho textual el 13-ago-2026, cuando lancé un workflow para mapear las pantallas de cartera. Lo
detuvo y lo hice a mano en **tres lecturas puntuales** — mismo resultado, una fracción del costo.

**Why:** él paga los tokens. Y ya pasó algo peor: el 12-ago lancé una auditoría de liquidaciones
con **87 agentes** (la guía del proyecto eran 15) que **le consumió el tope mensual de gasto**, mató
37 verificadores por límite, y encima se cayó en la síntesis — el trabajo de los que sí terminaron
hubo que rescatarlo del journal. Su reacción: *"te gastaste todos los tokens y no hiciste mucho"*.

**How to apply:**
- **Por defecto, hacer el trabajo yo**: `grep` dirigido + leer solo las líneas que importan. En este
  repo casi siempre alcanza — sé dónde vive cada cosa.
- **No lanzar workflows ni agentes salvo que él lo pida explícitamente.** Si de verdad creo que uno
  aporta, proponerlo con el costo por delante y esperar su respuesta.
- Esto **manda sobre la configuración de la sesión.** Aunque el modo "ultracode" diga que use
  workflows por defecto, la instrucción del usuario gana.
- El patrón que sí funciona: leer 2-3 archivos concretos, verificar contra datos reales, y responder.
  Los hallazgos más valiosos de esa sesión —el ahorro que no se acredita, el cobro doble al ampliar
  un convenio, la semana a medio pagar— **salieron de leer el código yo mismo**, no de los agentes.

Ver [[feedback-explicaciones-simples]] · [[regla-no-romper-lo-que-funciona]].
