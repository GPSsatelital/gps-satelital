---
name: regresion-mig124-convenios
description: "Regresión que causé el 4-sep-2026: la mig 124 reescribió convenio_marca_contemplado y convenio_ampliado_marca_deudas desde el TEXTO de migraciones viejas (099/098) y borró la partitura y la marca fuente='convenio' que la 116 había agregado. 12 convenios sin partitura, 11 cajas mal rotuladas para nómina. Detectada 7-sep revisando a JOSE SANMARTIN. Fix: mig 127. Regla: copiar SIEMPRE de pg_get_functiondef."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T16:28:52.176Z
---

# Regresión de la mig 124 (4-sep-2026) — detectada el 7-sep

## Qué hice mal
En la mig 124 (`deudas.convenio_id`) tenía que agregarle UNA línea a dos triggers de convenios.
Los reescribí "como copia exacta de la mig 099 / 098" **leyendo el archivo de esas migraciones**, no
la función viva. Pero la mig 116 (23-ago) ya los había cambiado: agregó la **partitura** (la lista
en pesos de qué financia el convenio, de la que depende `amortizar_convenio` para tachar deudas al
pagar) y la marca `set_config('app.fuente_caja','convenio')` para que las cajas financiadas queden
rotuladas 'convenio' en `cajas_llenadas` (la nómina las salta: `if (ev.fuente === "convenio") continue`).
La 124 pisó todo eso.

## Cómo se vio
Revisando el ciclo de DQF56I: el convenio de JOSE ($932.000) tenía `partitura = NULL` y sus cajas
20-21 salieron `fuente='pago'` en el mismo instante del convenio. Medido: **12 convenios desde el
4-sep con partitura NULL (antes 0 de 38)** y **11 cajas** financiadas rotuladas 'pago' (JHEINER,
YEISON, ESTARLIS, JESUS MALDONADO, JOSE). Ninguno había recibido plata al convenio y ninguna nómina
se había cerrado → se alcanzó a corregir antes de que alguien cobrara de más.

## El fix (mig 127)
Restaura las dos funciones = 116 + `convenio_id` (lo único que la 124 quería) · rotula 'convenio'
las 11 cajas · reconstruye la partitura de los 12 con la misma regla de la 116 (semanas desde
`cajas_pagadas_previas+1..cajas_pagadas_marcadas` con la primera parcial, deudas por `convenio_id`,
ajuste = total − suma) · `amortizar_convenio` idempotente.

## La regla (también en CLAUDE.md, ERRORES PASADOS)
**Una función que se vuelve a escribir se copia de `pg_get_functiondef` de la base VIVA, nunca de
un archivo de migración anterior.** Y tras correrla, verificar con UN caso real que lo que hacía
antes lo sigue haciendo (acá: que el convenio nuevo tenga partitura y sus cajas digan 'convenio').
La técnica de anclas (085/123) existe justamente para no reescribir cuerpos completos: usarla.

**Why:** entre la migración que uno lee y hoy pueden haber pasado otras; el archivo viejo es una foto
vencida. Costó 12 convenios y casi una nómina mal pagada.
**How to apply:** antes de `create or replace function` de algo existente: `select
pg_get_functiondef('public.nombre'::regproc)` en la base, pegar ESE cuerpo, cambiar solo lo pedido,
y después del deploy probar el flujo real una vez.
