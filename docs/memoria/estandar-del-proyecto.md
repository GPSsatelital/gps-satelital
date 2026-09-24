---
name: estandar-del-proyecto
description: "El estándar que evita repetir errores y perder el hilo entre sesiones — diagnóstico con evidencia, las 4 capas, y los 7 pasos (1 hecho el 23-sep, 2 al 7 pendientes)"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-24T01:43:01.318Z
---

# EL ESTÁNDAR DEL PROYECTO (23-sep-2026)

🔑 **El plan completo vive en el repo: `docs/ESTANDAR.md`.** Acá solo queda el porqué y dónde
estamos. Los pasos pendientes están en `docs/PENDIENTES.md` (P1).

## De dónde salió

El dueño, después de un día entero arreglando lo mismo de siempre: *"un camino muy bien trazado que
se autoalimente y que no se pueda desviar… que cuando se arregla algo no se dañe otra cosa, y que en
una sesión nueva no empieces a creer cosas que no son las que se pensaron en un principio"*. Más:
*"yo no tengo conocimientos de cómo funcionan las cosas"* y *"el experto sos vos"*.

## 🔴 La causa, medida (no opinada)

**`CLAUDE.md` es un diario, no una especificación.** 1.426 líneas; **437 (31%) son bitácora de
julio**, y hoy le dicen cosas falsas a cada sesión nueva:

| Le dice | La realidad |
|---|---|
| *"mig 026 pendiente"* · *"aplicadas 001–029"* | Vamos por la **167** |
| *"rama `claude/clever-turing-daklkq`"* + la orden de merge | Se trabaja en `main`; no existe |
| *"`codebase-memory` SIEMPRE ACTIVA"* | El 23-sep no conectó (ni otras 4) |
| *"leer `sunny-brewing-island.md`, 40+ decisiones"* | 🔴 **Ese archivo se perdió** |

Se actualiza **solo hacia adelante**: cada sesión agrega, nadie poda. Y nada avisa cuando una línea
se vuelve falsa. Mezcla lo permanente (*"la tarifa del domingo se redondea al millar"*) con lo
perecedero (*"vamos por la 029"*), y por eso nadie se atreve a limpiarlo.

**Los otros tres huecos:** las decisiones no tenían casa · la memoria vivía fuera de git ·
no había bucle de automejora.

## Las 4 capas (el diseño)

| Capa | Dónde | ¿Envejece? |
|---|---|---|
| Especificación — *cómo funciona* | `CLAUDE.md` · `PROCESOS.md` · `DICCIONARIO-ESTADOS.md` | No |
| **Decisiones** — *qué se decidió y por qué* | `docs/DECISIONES.md` · **solo se agrega** | No |
| **Estado** — *dónde estamos hoy* | `npm run arranque` (se **calcula**) · `PENDIENTES.md` | Imposible |
| **Historia** — *qué pasó* | `docs/HISTORIAL.md` · `docs/memoria/` | No |

**Principio:** lo que se olvida se repite → todo lo que pueda vivir en una máquina, vive en una
máquina. Y el dueño **no tiene que saber cómo funciona nada**: dos comandos, y los candados hablan
en su idioma cuando fallan.

## ✅ Paso 1, hecho (commit `b60c9d6`)

- **`docs/memoria/`** — los 125 archivos, antes solo en `C:\Users\USER\.claude\`. `npm run memoria:respaldar`.
- **`docs/DECISIONES.md`** — 19 sembradas (reglas madre del dinero + toda esta semana).
- **`docs/DERRAPES.md`** — mis 5 errores del día + la mig 124, cada uno con su candado.
- **`docs/ESTANDAR.md`** — el plan, sacado de la carpeta donde se pierden las cosas.
- La llave de ZALA que pasó por el chat: **subida a P0**.

## 🔲 Pasos 2 al 7

**2.** Mudar las 437 líneas de bitácora de `CLAUDE.md` → `docs/HISTORIAL.md` y corregir lo falso.
**3.** `npm run arranque`/`cierre` **+ los hooks** (`SessionStart`/`Stop`) que los disparan solos —
*lo más importante: sin eso, el protocolo depende de que yo me acuerde* — y la tabla
`migraciones_aplicadas`.
**4.** La **foto de la plata** antes/después de cada migración (*lo único que habría cazado la
124*) · toda migración con su vuelta atrás (**hoy 0 de 171 la tienen**) · **ventana de despliegue:
nada de cartera lunes ni miércoles antes de las 6pm** (son los días de pago).
**5.** `RUNBOOK.md` con las maniobras probadas + la sección técnica de `RIESGOS.md` (8 riesgos ya
redactados).
**6.** Los candados: casos reales → espejos → knip → **CI, que NO EXISTE** (no hay `.github/`; las
668 pruebas solo corren si alguien se acuerda).
**7.** Recién ahí, la auditoría técnica.

## Reglas nuevas que ya rigen

- **Avisar al arrancar qué herramientas no conectaron** (D-017).
- **La segunda mirada:** antes de construir algo de plata o arquitectura, escribo el caso **en
  contra** de mi propia propuesta. *(El 23-sep eso convirtió un RPC innecesario en una condición de
  una línea.)*
- **Medir la flota antes de cerrar un defecto.** *(Así apareció RAFAEL detrás de LUIS.)*
- **Precedencia:** si hay plata mal contada hoy, eso manda sobre el protocolo — pero se registra el
  mismo día.

## Medido de paso (sirve para la auditoría futura)

54 llamadas a la base al abrir · **591 ms de mediana** por llamada (176 ms es la latencia base a la
región) · `pendientes_activos` **1.180 ms** y se pide 2 veces · 14 canales de tiempo real, 4 todavía
con el patrón viejo · `createTableStore` **está bien hecho**, no se toca.

Relacionado: [[feedback-nada-queda-mocho]] · [[feedback-preguntar-hasta-que-quede-claro]] ·
[[regla-esencia-y-rastro]] · [[regresion-mig124-convenios]] · [[consultar-base-desde-el-navegador]]
