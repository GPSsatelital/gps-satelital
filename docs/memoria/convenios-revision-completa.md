---
name: convenios-revision-completa
description: "8-ago-2026: sección de convenios revisada entera — 9 arreglos en producción, incluido uno que REGALABA semanas. Reglas del dueño y los 5 casos que faltan."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-08T21:57:13.661Z
---

# Convenios — revisión completa (8-ago-2026) · todo en producción

`main` = `ffb251d`. Migración **093 ✅ corrida**. 130 pruebas verdes.

## 🔴 REGLA DEL DUEÑO QUE MANDA SOBRE TODO

> *"Los convenios que están hechos deberían quedar así, y mejor sería buscar la forma de
> arreglarlos **sin robarle y sin perder nada**, para que así puedan seguir bien con sus cuentas."*

Al cliente le dijeron "pagas $0 hasta el 19" y **firmó eso**. Moverle la fecha hacia atrás sería
cobrarle lo que ya le perdonaron. **Los arreglos van SOLO hacia adelante.** Descarté auditar y
recuadrar los convenios viejos — la propuse y él la rechazó, con razón.

## Las otras reglas que fijó

- **Incumplido NO es un sello definitivo:** *"si un cliente se atrasó pero luego se coloca al día
  sigue normal con su convenio. El incumplido es mientras está atrasado, o si ya definitivamente
  no paga y se liquida. Por eso el sub admin que tenga asignado debe hacer bien la gestión de cobro."*
- **Se amplía, no se rehace:** por eso el botón nuevo suma la deuda al convenio existente en vez
  de crear otro o borrar el viejo.

## 🔴 El defecto grave: REGALABA semanas

Lo cachó preguntando *"¿por qué me dice que la siguiente es el 19-08?"* (JHEFERSON, XYZ50H).

`cubre_periodo_hasta` hace que **dejen de exigirse TODAS las cajas anteriores a esa fecha**
(`CobrosView:838`). Y se calculaba avanzando N días de pago **desde HOY** — pero las semanas que
se financian son las **VENCIDAS, hacia atrás**. Con 2 vencidas y financiando 2:

```
entraban al convenio ....... $404.000 (2 semanas)
la fecha quedaba en 19-ago, que perdonaba TRES períodos ($606.000)
                                                → $202.000 REGALADOS
```

Y regalaba una semana más **por cada semana de atraso** que trajera el cliente.

**Arreglo:** `fechaCubrePeriodo()` en `cicloPago.ts` — la fecha sale del período actual corrido
`(N − vencidas + 1)` días de pago. 6 pruebas con sus números reales.
⚠️ **Los convenios viejos NO se tocaron** (regla de arriba). Ese regalo ya está dado.

## Los otros 8 arreglos

| Era | Es |
|---|---|
| Un "incumplido" **congelaba los pagos** — el motor solo miraba activo/cumplido, el cliente pagaba y nada avanzaba | Vuelve a activo y se le corre la fecha límite (**mig 093**) |
| Cliente con convenio + deuda nueva: **sin salida** | Botón *"➕ Agregar deuda a este convenio"* |
| Decía *"paga $0 de arriendo"* dejando semanas sin cubrir | Dice cuánto queda y a cuánto subir |
| Cobraba la cuota del convenio mientras cubría semanas | Arranca cuando se acaban |
| El campo decía "total del convenio" **sin serlo** | Se llama "Deuda a financiar"; el total se ve al armarlo |
| Precargaba **$0 en silencio** si la deuda estaba en otro convenio | Lo explica con el monto y ofrece la salida |
| El tope de 3 era un callejón sin salida | Manda a liquidación |
| Borrar con abonos **perdía la plata en silencio** | Avisa el monto, ofrece Ampliar, y queda en auditoría |

## Por qué se AMPLÍA manteniendo la cuota (no subiéndola)

`cuotas_pagadas` se cuenta en **CUOTAS, no en pesos** (el trigger hace
`floor(abonado / cuota_por_periodo)`). Subir la cuota haría que esas mismas "1 cuota pagada"
valieran más — **le reescribiría al cliente lo que ya pagó**. Manteniéndola, sigue pagando lo
mismo por período, solo por más tiempo.

## Al borrar un convenio: qué se recupera y qué no

La mig 067 **sí** devuelve las semanas marcadas (y con un cuidado fino: solo si el cliente no
pagó de verdad después) y las deudas `en_convenio` a `pendiente`.
🔴 **NO devuelve lo ABONADO a la cuota**: ese abono nunca bajó la deuda —vuelve completa— y solo
vivía en el contador del convenio. Se avisa con el monto, pero **el comportamiento no se cambió**:
repartir esa plata a ciegas sería peor.

## 🔲 Lo que falta (P4 y P5 del análisis)

- **P4 — un convenio mal pactado solo se puede borrar.** Editarlo con auditoría, como ya se hace
  con las deudas. Ya pasó con REYNALDO (XZN20H): 60.000 cuotas de $9.
- **6 convenios con sobrante raro** (LUIS ARMANDO 3.59 · LUIS FERNANDO 3.16 · MARTHA 2.54 ·
  YULIETH 2.31 · LUIS DAVID 2.15 · JOSÉ ENRIQUE 2.11). **No seguir deduciendo**: los creó una
  persona escogiendo opciones, y solo ella sabe qué quiso. Revisar con el acuerdo al lado.

## ⚠️ Trampas de análisis que me costaron esta sesión

1. **Deduje el orden de dos hechos por aritmética** y me equivoqué: el pago fue ANTES del convenio
   en los 12 casos. La hora lo dijo, mi resta no.
2. **Repetí un error escrito en la memoria como "no repetirlo"**: comparé el convenio contra la
   deuda de HOY en vez de la que había al crearlo. Los clientes siguieron pagando y la
   "diferencia" creció sola → números imposibles (4.35 semanas).
3. **Los convenios de BASE (deuda $0) no entran en ese análisis**: no están respaldados por deuda
   sino por la base faltante. $510.000 exactos = base inicial.

Ver [[regla-inmovilizar-y-convenios]] · [[cartera-doble-cobro-deuda-vs-caja]].
