---
name: feedback-nada-queda-mocho
description: "El dueño no quiere volver a creer que algo está listo y descubrir después que quedó mocho o con errores — antes de arrancar se acuerda qué significa TERMINADO, con pruebas medibles"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-23T22:31:29.374Z
---

# 🔴 "Que no quede mocho" (dueño, 23-sep-2026)

Textual: *"lo que no quiero es que ya yo piense que algo está listo y vamos a ver que no, que
siempre queda mocho o con errores"*.

## Por qué lo dijo (el mismo día, dos veces)

1. Le dije que el movimiento de saldo en ceros era **solo cosmético**. No lo era: le trababa la
   plata a dos clientes. Lo descubrió **él**, dándole al botón en producción.
2. Le recomendé mover `aplicarSaldoFavor` a un RPC. Al releer el candado, el camino correcto era
   una condición en la mig 160. Lo destapó su pregunta *"¿es el mejor camino?"*.

En los dos casos yo ya había dado una conclusión antes de terminar de medir.

## La regla

**Antes de escribir la primera línea, se escribe QUÉ SIGNIFICA TERMINADO**, como una lista de
comprobaciones que se puedan medir, y se acuerda con él. Al cerrar, se responde la lista
**una por una con el resultado real medido** — no con "listo".

Cada punto lleva:
- **cómo se prueba** (el comando, la consulta o la pantalla), y
- **qué número se espera**.

Y al final, siempre, **lo que NO quedó cubierto** y por qué. Un entregable sin esa lista está
incompleto aunque funcione.

## Lo que NO cuenta como prueba

- "El build pasó" — `tsc` avisa de referencias rotas, no de reglas perdidas.
- "Debería funcionar" / "es el mismo patrón que X".
- Un `success` de Supabase: no prueba que el cambio hizo lo que se quería
  (ver [[correcciones-a-mano-sep-2026]] — antes/después SIEMPRE).
- Mi propia lectura del código sin correrlo contra datos reales.

## Lo que sí cuenta

- La medición en la base con [[consultar-base-desde-el-navegador]], con el caso real por nombre.
- La función de verdad corrida con los datos de verdad (no un ejemplo inventado).
- `npm test` con una prueba que ANTES fallaba y ahora pasa.
- Decir con todas las letras **qué no se pudo probar** (ej. "no puedo dar el clic como la
  secretaria: eso lo tiene que probar ella").

**Why:** su problema no es que haya errores — es enterarse tarde, cuando ya dio algo por cerrado
y se lo dijo a otro. La lista acordada de antemano convierte "está listo" en algo que él puede
verificar, en vez de algo que tiene que creerme.

**How to apply:** abrir toda tarea con la lista de comprobaciones; cerrarla respondiéndola con
números. Relacionado: [[feedback-preguntar-hasta-que-quede-claro]] ·
[[regla-no-romper-lo-que-funciona]] · [[feedback-resumen-final-para-nino]].
