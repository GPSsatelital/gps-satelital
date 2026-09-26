---
name: kit-diseno-pruebas-estado
description: "Estado real de las pruebas automáticas del kit de diseño en C:\\Users\\USER\\scripts (25-sep-2026): qué corre, qué no, y por qué."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-09-25T22:35:51.991Z
---

El 25-sep-2026 el dueño preguntó "¿todas las skills están funcionando?". Las 20 skills cargan bien,
pero el informe `node scripts/accuracy_report.mjs` (en `C:\Users\USER`) **mentía**: 17 pruebas
salían aprobadas sin haber corrido nunca.

Causas encontradas y arregladas ese día:
- En este PC Python es `python`, **no existe `python3`**. El informe ahora usa el que haya.
  (El `CLAUDE.md` de `C:\Users\USER` sigue diciendo `python3 ...`: al correr esas pruebas a mano, usar `python`.)
- Playwright no estaba instalado y cada prueba de pantalla decía "SKIPPED" con salida 0, que contaba
  como aprobada. Se instaló en **`C:\Users\USER\scripts`** (con su propio `package.json`, a propósito
  NO en la carpeta de usuario para no afectar otros proyectos). Usa el Chrome instalado.
  Ahora un "SKIPPED" o un "Scanned 0 file(s)" cuenta como falla.
- `build_tokens.mjs` armaba la ruta `C:\C:\...` (`URL.pathname` en Windows).
- 7 scripts de Python leían sin UTF-8 y se caían con tildes; el detector de emojis se caía al imprimir.
  El detector ya no revisa la skill de terceros `prompt-master` (tenía 27 emojis).

**La carpeta `examples/` faltaba** (la instalación de julio no la copió). Origen del kit: paquete npm
`ux-ui-agent-skills` (repo `plugin87/ux-ui-agent-skills`), **versión 2.4.0** (la vigente el 22-jul).
Se bajó esa misma versión, se comprobó archivo por archivo (73 iguales; los 10 distintos son
exactamente los scripts arreglados hoy) y se copió SOLO `examples/`. Resultado: **25/25, 0 saltadas**.
NO se actualizó a 2.8.0 a propósito: pisaría los arreglos de Windows.

**How to apply:** no citar el "N/25" del informe como calidad de MotoGestión; esas pruebas revisan
los ejemplos del kit, no la app. Para verificar una página propia, correr los scripts directamente
sobre un HTML (`node C:/Users/USER/scripts/verify_responsive.mjs archivo.html`). Respaldo de 3
scripts originales en `C:\Users\USER\.respaldo-kit-2026-09-25`.

Ver [[herramientas-por-pc-paridad]] · [[regla-usar-design-skills]].
