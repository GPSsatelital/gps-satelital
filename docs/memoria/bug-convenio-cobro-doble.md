---
name: bug-convenio-cobro-doble
description: "El sobrante de un pago se cobraba DOS VECES a clientes con convenio — 11 clientes, $891.500 devueltos (migs 069+070 corridas 26-jul)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-27T00:03:31.908Z
---

Bug de plata más grave encontrado hasta ahora. Lo destapó el usuario preguntando por qué a
DIEGO LOCIN SOTO (XZI10H) le aparecían $5.000 aplicados a "deuda" en su pago de $200.000.

## El error
`deudas` y `convenios` son **la misma plata vista dos veces**: al firmar un convenio, las deudas
existentes quedan `en_convenio` ("ya no se cobra directo, se cobra por las cuotas del acuerdo").
Cuando un cliente con convenio pagaba de más, el reparto de la BD mandaba el sobrante a esa
deuda — el camino ya cerrado. La deuda bajaba, **el saldo del convenio no**. Al terminar sus
cuotas habría pagado esa plata DOS VECES.

Causa exacta: el frontend filtraba bien (`estado === 'pendiente'`), pero el reparto de la BD
usaba `estado <> 'pagada'`, que **incluye `en_convenio`**. Una palabra.

**Impacto real medido: 11 contratos, $891.500.** Y hay convenios FIRMADOS por el cliente con un
saldo escrito → cobrar por encima es indefendible (el usuario lo señaló: "va contra toda lógica
y moral, el error es nuestro").

## Arreglado (commit `bbd84f2`, migs 069 y 070 ✅ corridas)
- **069:** corrige el filtro en las **3 rutas de aplicación** (FIFO v2, reparto explícito v2,
  motor v1) editando quirúrgicamente la definición viva de `aplicar_pago_confirmado` con
  `pg_get_functiondef` + `replace` (son ~250 líneas ya probadas; reescribirlas arriesgaba
  revertir algo). **La reversa NO se toca** (usa otro filtro: `monto_pendiente < monto`).
- **070:** corrección de datos — mueve `aplicado_deuda` → `aplicado_convenio`, devuelve la deuda
  a su valor (y de 'pagada' a 'en_convenio' si había llegado a 0), recalcula `cuotas_pagadas` y
  **deja fila en `contratos_auditoria`** con saldo antes/después y motivo (respaldo legal).
  Idempotente. Excluye a quien tenga deuda 'pendiente' creada después del convenio.
  ⚠️ Quedó pendiente revisar **DQW26I — WILLINGTON GARCIA ($3.000)**: tiene deuda nueva
  posterior al convenio, ese abono pudo ser legítimo.

## Segundo bug del mismo hilo: el convenio no contaba para la mora
`calcularEstadoCartera` ignoraba `cuotaConvenio` en la rama del **motor v2**: quien dejaba de
pagar su convenio nunca salía en mora ni en el panel del día, aunque la MISMA pantalla dijera
"DEBE PAGAR AHORA: cuota del convenio". Arreglado: con el ledger al día, si la cuota del
convenio del período no está abonada → paga hoy / gabela / mora según los días.

## Prevención (la pregunta del usuario: "cómo se nos pasó")
El reparto vive en la BD y **ninguna prueba lo cubría** — las 21 pruebas eran de fechas y ciclos.
Y como el frontend filtraba bien, en pantalla todo se veía coherente: solo era visible cruzando
dos tablas.
- **6 pruebas de regresión** nuevas (27 en total) sobre convenio-vs-mora.
- **Consulta de chequeo** al final de la mig 070: debe devolver **CERO filas**. Si devuelve algo,
  el reparto se rompió otra vez y hay clientes pagando doble. **Correrla el viernes** tras la
  primera semana de operación real.

## Deuda técnica de fondo (post go-live)
Tener la misma plata en dos tablas (`deudas` + `convenios`) es frágil y esta fue la prueba.
Existe así porque la deuda guarda *de dónde viene* y el convenio *cómo se paga*. Replantearlo a
una sola fuente es cirugía mayor sobre 17 convenios vivos — no antes del arranque.
