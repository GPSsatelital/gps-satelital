---
name: motor-ventana-prepago-al-final
description: "Caso EDINSON MOSQUERA (IEW58I, 11-sep-2026) — la ventana de prepago de la mig 119 dejaba que la semana del lunes siguiente se tragara la cuota del acuerdo; mig 149 la manda al final de la fila. Estado de las 3 piezas y los 11 contratos con la misma huella."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-11T21:41:50.866Z
---

# La ventana de prepago se tragaba el acuerdo (EDINSON, IEW58I)

**Qué pasó (verificado peso por peso contra la base, 11-sep-2026).** Semana $202.000 · acuerdo
$679.000 en 12 cuotas de $58.000 (25-ago) · paga lunes → paquete $260.000. Lo pagó exacto el
**domingo 6-sep** y el **viernes 11-sep**. El motor guardó las dos veces `tarifa 260.000 ·
convenio 0`. Resultado: acuerdo en 0 de 12 "en mora", `caja_actual_pagado = 116.000` adelantados
a la semana del 14-sep. El recibo impreso del 11-sep decía otra cosa (144/45/116, pendiente $0)
porque el papel imprimía la **vista previa de la app**, no lo que la base repartió.

**Por qué.** La mig 119 metió la ventana de prepago (`fecha + 3`, caso DANIEL sábado) en el paso 2
junto con las semanas vencidas. Pago en vie/sáb/dom → la semana del lunes siguiente se vuelve
exigible y entra ANTES del convenio (fila cajas → deudas → convenio) → se lleva la cuota del
acuerdo. El paso 4 tenía la misma ventana pero ya no le llegaba plata. **En pesos nada se perdió**;
la etiqueta estaba mal y solo se autocorregía si pagaba el lunes.

**Regla que manda:** "TODO SE PAGA PAREJO — semana + convenio" (dueño, 24-ago).

## Las 3 piezas (orden aprobado por el dueño: "aranquemos")
1. ✅ **Recibo** (`f9cbb41`): el papel imprime lo que la base guardó (`repartoDelPago()` /
   `leerReparto()` en `usePagos.ts`), en los 3 puntos: pagar efectivo, confirmar transferencia,
   reimprimir del historial.
2. ✅ **mig 149 CORRIDA** (12-sep, verificada por posiciones: paso2 < paso4 < 2b < 4b < saldo) (`d5100c4`): `149_ventana_prepago_al_final_de_la_fila.sql`,
   parche anclado a `pg_get_functiondef` (3 anclas, se niega si no coinciden). Pasos 2 y 4 a la
   fecha real; 2b (cajas) y 4b (convenio) con la ventana, antes del saldo a favor. Espejo
   `repartoPago.ts` con `cajasExigidasVentana` / `convenioExigidoVentana`; 37 pruebas (15 nuevas,
   incluido el recibo exacto de Edinson). Chequeo previo esperado `1 · 1 · 1 · 2`; posterior
   `0 · 0 · 1 · 1 · 2`. Después: correr la prueba espejo de la vitrina.
3. ✅ **Re-repartido** (12-sep) los 2 pagos de Edinson (revert → limpiar → reconfirmar, procedimiento del
   1-sep) y ver que el acuerdo queda en 2 de 12 y la semana 12 sin adelanto.

## Los otros 10 con la misma huella (solo Edinson está probado; revisar caso por caso)
11 de 126 convenios activos, $839.000 en total: YAL68H · RLT66H ($175k) · **IEW58I** · RNG53H ·
XZN22H · IEW50I · XZI04H · RMZ67H · XZI12H · IGC35I ($200k) · IEW54I. Huella = pago en vie/sáb/dom
con convenio activo, `aplicado_convenio = 0` y `caja_actual_pagado > 0` después.

**Decisión de orden en 4b:** dentro de la ventana también va caja → convenio (primero la semana
del lunes, luego su cuota). Si el cliente trae una cuota atrasada y paga solo el paquete, se cobra
la atrasada + la semana, y la cuota del lunes queda para el lunes (prueba "DANIEL sábado con
atrasada").

Relacionado: [[mapa-financiero-y-partitura]] · [[convenio-que-entra-casillas]] ·
[[cartera-cuanto-debe-una-sola-funcion]] · [[regresion-mig124-convenios]] (copiar de la función viva).

## El primo del caso: el pago de la víspera del corte (EDWIN FONTALVO, RLY52H, 12-sep)

Mismo defecto, otra cara. Migrado de COSTA, corte 27-jul-2026, paga lunes. Pagó el **domingo
26-jul** sus $195.000 y el motor los mandó **enteros a saldo a favor** (la semana del lunes 27
todavía no estaba exigida y la ventana de la mig 119 nació un mes después). El 29-ago alguien
aplicó ese saldo: $100.000 a la deuda `migracion` "EXCEL VIEJO" y $95.000 a la semana. Desde ahí
quedó corrido $100.000 (más $1.000 de un pago corto) y hoy sale con 4 días de mora y en el balde
de **recolección** habiendo pagado el jueves.

**Las cuentas están bien** — verificado peso por peso: plata real $1.364.000 vs exigido $1.465.000
(7 semanas + la deuda vieja) = los $101.000 que muestra la pantalla. El dueño lo revisó y decidió
dejarlo así: *"era que no entendía de dónde salían"*. **No se tocó nada.**

Lo que quedó abierto y no es de plata: su **empalme sigue sin cerrar** → `cuenta_confiable = false`
(ZALA le escribe sin cifra) y su **ahorro de apertura son $1.196.000** sin revisar con él. Y un
cliente que paga las 7 semanas seguidas puede caer en la cola de recolección por un hueco heredado.
Si vuelve a aparecer un "no cuadra" de un migrado de COSTA, la consulta que lo destapa está en el
chat del 12-sep: pagos con `aplicado_saldo_favor >= valor`.


## Cerrado el 12-sep-2026

**Mig 149 corrida y verificada.** Ojo con la verificación: las dos "anclas viejas" siguen contando
1 porque ese mismo texto vive ahora dentro de los bloques 2b/4b. La prueba buena es por posiciones
(`strpos`): paso2 < paso4 < 2b < 4b < saldo, y `current_date) + 3` exactamente 2 veces.
🔴 **La migración NO es idempotente**: correrla dos veces duplicaría los bloques.

**Edinson quedó al día**: debe $0, el acuerdo pasó de 0 a $116.000 de $116.000 exigidos (2 de 12),
12/104 semanas, nada adelantado. Espejo pantalla↔base: 316 contratos, 0 diferencias.

**Detalle del re-reparto:** el motor puso los $45.000 de multa+lavada en el pago del 6-sep y el
acuerdo completo en el del 11-sep. En plata da igual, pero el recibo que el cliente tiene del
11-sep dice "deuda $45.000". Al re-repartir HOY, las deudas creadas el 10-sep ya existían cuando
el motor volvió a mirar el pago del 6. Se le pasó al dueño el SQL para alinear las etiquetas
(reparto explícito) — quedó a su decisión.

## Los otros: 14 con la huella exacta, de 126 acuerdos activos

Buscados por: pagó en la víspera de su día (1 a 3 días antes), ese pago llenó una semana completa
él solo, y el acuerdo no recibió un peso teniendo cuotas exigidas. Con plata adelantada:
RLT66H $175.000 · DPW33I $152.000 · RNG53H $112.000 · RNB18H $105.000 · RMZ63H $100.000 ·
RMZ67H $63.000 · XZI10H $50.000 · IEW60I $46.000 · XZN22H $36.000 · XZI04H $10.000.
Sin adelanto ya: RMZ59H · YAW72H · DPU30I · YAL55H · XZI14H.

**Decisión: no se toca a ninguno.** Con el motor arreglado se corrigen solos (la cuota exigida del
acuerdo es acumulada). Solo se hace lo de Edinson si el cliente reclama o si hay que liquidarlo.
Ojo: varios de esos acuerdos atrasados son deuda REAL, no etiqueta (XZI10H $645.000, RMZ63H
$395.000).
