---
name: convenios-en-convenio-sin-commitear
description: Convenios doble-cobro deuda en_convenio ✅ RESUELTO y desplegado (+ fix visualización + fecha creación + filtro). Solo confirmar mig 054 corrida.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

✅ **TODO EL TEMA CONVENIOS EN PRODUCCIÓN** (varios commits, main = rama). Ya no hay nada sin commitear.

## El problema (era de plata)
Deuda financiada en un convenio (`estado='en_convenio'`) se cobraba DOBLE: directo como deuda Y vía la cuota del convenio. Y el motor de cajas exigía semanas viejas que el convenio ya cubría (FIFO robaba pagos → falsa mora).

## Regla del negocio (LEY): "lo firmado en el convenio se respeta"
Todo lo que el cliente debía ANTES de firmar quedó contemplado dentro del convenio. Exigible aparte: semana en curso (si no se financió) + lo posterior a la firma + la cuota del convenio.

## Lo desplegado (✅)
1. **Deuda en_convenio no se cobra doble:** los 6 puntos que suman deuda cobrable filtran `estado === "pendiente"` (CobrosView, CobroDiarioView, InmovilizacionesView x2, useLiquidaciones).
2. **Fix de visualización "Debe pagar ahora":** respeta `cubre_periodo_hasta` (no muestra como vencidas las cajas que el convenio financió) y el TOTAL A COBRAR = suma exacta de las líneas (`totalDebeAhora`). El 3-box "Pendiente" muestra el mismo número. Diario/v1 caen al cálculo viejo.
3. **"Debe $X" de la LISTA de Contratos:** `calcularPendienteContrato` es la fuente ÚNICA — para motor v2 usa `desgloseExigible` respetando el convenio. Antes la lista usaba la fórmula vieja por ventana → mostraba "Debe $95.000" a clientes al día (caso DIEGO). La lista, Panel Hoy, cobro en campo y recibos leen todos de ahí.
4. **Fecha de creación del convenio visible:** "📅 Creado el ..." en pestaña Convenio + "· creado [fecha]" en el badge del detalle.
5. **Filtro "🤝 Convenio"** en la sección Contratos (ahora "🌎 Todos") — muestra solo los que tienen convenio activo.

## Datos corregidos por SQL (✅ el usuario corrió)
Los 8 convenios viejos + JUAN CARLOS LEAL (YAL68H, marcado en_convenio + ledger cajas_pagadas=21) + JAIDER (YAL55H, solo deuda→en_convenio, su convenio no cubría semanas). Detectados con la query de "convenios con deuda pendiente anterior a la firma".

## ⚠️ ÚNICO PENDIENTE: confirmar que corrió `mig 054_convenio_marca_ledger.sql`
Trigger `after insert on convenios` → al firmar marca deuda anterior como en_convenio + corre cajas cubiertas. Sin él, CADA convenio nuevo nace con el doble cobro (así nacieron JUAN y JAIDER). El SQL está en el repo y se le pasó al usuario. **Preguntar si ya lo corrió.**

## Causa raíz de fondo (para entenderlo)
El **ledger de cajas** (BD) es la verdad; el FIFO manda cada peso al hueco más viejo → toda caja financiada por convenio DEBE marcarse cubierta o roba pagos. El trigger 054 es el pegamento: sin él, todo dependía de acordarse de marcarlo a mano. Ver también [[libro-de-cajas-motor-v2]] y [[empalme-migracion-construido]].
