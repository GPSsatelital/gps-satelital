---
name: ahorro-de-quien-es-regla-d023
description: "La regla D-023 del dueño (24-sep): el ahorro es de la empresa SOLO si el contrato termina bien; si liquida sin finalizar se le devuelve. De ahí salen 3 defectos vivos por $13,8M, y la corrección a mano de JORDAN (LIQ-0073)"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-24T21:17:21.347Z
---

# ¿De quién es el ahorro? La regla que faltaba (24-sep-2026)

Salió de una pregunta del dueño sobre la liquidación de **JORDAN (DQL76I)**: *"¿por qué está
cobrando la base en la liquidación?"*. Terminó siendo una regla de negocio que **no estaba escrita
en ninguna parte** y de la que cuelgan tres defectos de plata.

## La regla, textual

> *"Es de la empresa si termina el contrato satisfactoriamente; o si liquida sin finalizar, hay que
> devolvérselos."*

El ahorro es **la alcancía con la que el cliente compra la moto**. Llega al final → la alcancía se
gastó comprándola, es de la empresa. Se va antes → no compró nada, la alcancía es suya.
Aplica a **todo** el ahorro: los **$308.000** de la base **y** los $26.000 de cada semana.
Queda como **D-023** en `docs/DECISIONES.md`.

## 🔴 Los tres defectos que salieron de medirla (ninguno arreglado — están en P0/P1)

| Cara | Qué hace el sistema | Plata |
|---|---|---|
| Termina bien → es de la empresa | `cuentaLiquidacion()` **no mira `motivo` ni una vez** (grep: 0 coincidencias) → devuelve todo el ahorro igual al de 104 semanas y al de 7 días | **$8.043.000** · **YESID BARRAZA a 5 semanas con $3.801.000** · ya pasó: ANGELICA PACHECO LIQ-0007, $340.000 |
| Se va antes → se devuelve | La liquidación **cobra** el convenio de base no pagado (`cuentaLiquidacion.ts:160`) | **$2.289.000** · 7 liquidaciones |
| Se va antes → se devuelve | Pagar el convenio de base **no suma al ahorro** | **$3.528.000** · 35 clientes |

Los tres son **la misma regla vista de tres lados**. Y hay **53 convenios de base vivos**: sin
arreglar el código, el segundo vuelve a pasar con cada uno.

⚠️ **Cuidado al construir:** hay convenios **mixtos** (FRAIRON, IEW54I: $308.000 de ahorro que NO se
cobran + $102.000 de primera semana que SÍ). Y **MELISSA BELLO no cuadra** — puso $404.000 al
registrarse (debería deber $106.000) y su Semana 1 aparece sin pagar: mirarla aparte.

## Lo único que se hizo: JORDAN (LIQ-0073) — REABIERTA, esperando su firma

El dueño eligió **"solo JORDAN, ya, y el resto después"** y la **opción A**: deshacer y rehacer, no
solo parchar la cifra, porque **el papel que firma tiene que decir la verdad**.

🔴 **Mi derrape acá:** en la primera vuelta solo corregí las cifras y **la dejé cerrada** — media
tarea. El dueño lo cazó: *"¿no se suponía que se iba a devolver y se iba a hacer de nuevo… y que se
le coloque la fecha de recibimiento para el lunes 21 y no de hoy, y también para que firme la
liquidación que no la ha firmado?"*. Las tres cosas faltaban.

**Al reabrirla apareció un hueco:** LIQ-0073 estaba **`cerrada` sin ninguna firma** —
`firma_cliente_url`, `huella_cliente_url`, `fecha_firma` y `documento_firmado_url` **los cuatro en
null**. Se puede cerrar una liquidación sin que el cliente firme nada.

**Y la fecha movía $93.000.** Había **dos** recepciones: la real (`entrega_voluntaria`, 22-sep 2:27pm,
km 17.467, *"con sonido en el motor"*, **huérfana: sin contrato ni cliente**) y una administrativa
que creó el arranque de la liquidación hoy (`motivo: liquidacion`, km 17.487). La pantalla toma **la
más reciente** → corte el 24. Saldo según la fecha: **21-sep → +$157.000** · 22-sep → +$126.000 ·
24-sep → +$64.000. El dueño confirmó **lunes 21** (*"la trajo ese día"*, se registró al siguiente).

**Estado al 24-sep, medido:** liquidación `en_taller` · contrato `Suspendido` con su ahorro de
$40.000 de vuelta · cliente `Activo`, fuera de lista negra · moto `Mantenimiento` · deuda del
alquiler $54.000 pendiente · **fecha de corte 2026-09-21** (verificado con `recepcionDelContrato`,
la misma función de la pantalla) · **al Calcular va a dar +$157.000** (verificado llamando a
`cuentaLiquidacion` con los datos reales). `comparar_fotos` sobre los 362 contratos: **2 filas, las
dos de JORDAN** (su deuda y su ahorro restaurados). Nadie más se movió.

🔑 **El truco que evitó tocar el código:** su convenio de base se **deja en `cumplido`** (así lo dejó
el cierre). `cuentaLiquidacion` solo cobra convenios `activo`/`incumplido`, así que el recálculo
**no le vuelve a cobrar los $308.000** sin necesidad de arreglar el código todavía. Para los otros
5 casos abiertos eso NO sirve — ahí sí hay que arreglar `cuentaLiquidacion.ts`.

🔲 **Falta que el dueño lo termine en la app, con JORDAN presente:** finalizar la orden de taller
(está en *"Listo para salida"*) → Calcular (+$157.000) → generar documento → **que firme con firma y
huella** → cerrar marcando **"Sigue con la empresa"** con los $157.000 como base de la moto nueva
(le faltarían $353.000 de los $510.000).

🔑 **La clave del método:** antes de escribir el SQL pedí `pg_get_functiondef('cerrar_liquidacion')`
de la base **VIVA**. Ahí se vio que **nada de lo que hizo el cierre fue un error de la función** —
todo salió del único dato malo (el saldo negativo): la deuda de $244.000, el `Retirado`, la lista
negra, y el misterio del *"convenio cumplido 11 de 11 con $0 pagado"* (lo marca
`update convenios set estado='cumplido', cuotas_pagadas=numero_cuotas`).
Para pasar el guardián de estados se usa el mismo interruptor que usa la función:
`select set_config('app.cierre_liquidacion','1',true)` dentro de la transacción.

**Why:** es la regla que decide si una cifra es del cliente o de la empresa, y de ella cuelgan
$13,8M mal contados. Sin ella escrita, cualquier sesión nueva la vuelve a adivinar — yo la adiviné
mal, ver [[regla-esencia-y-rastro]] y el derrape del 24-sep en `docs/DERRAPES.md`.

**How to apply:** antes de tocar cualquier cifra de ahorro o de base, leer D-023. Y la lección
general: cuando una cifra puede ser *"del cliente"* o *"de la empresa"*, **medir las DOS caras** —
qué pasa cuando entra la plata y qué pasa cuando no. Con una sola cara, dos reglas opuestas se ven
idénticas. Relacionado: [[base-inicial-vs-ahorro-acumulado]] · [[liquidaciones-definicion-cerrada]] ·
[[correcciones-a-mano-sep-2026]] · [[graduacion-cambio-moto-flujo]].

## ✅ 25-sep: la primera cara ARREGLADA (commit f5c2ce1)
`plataQueEsDelCliente(contrato, motivo)`: con `cumplimiento` agrega el renglón negativo
*"Con este ahorro terminó de pagar la moto"* (el ahorro se ve, el saldo no lo suma). Proyección:
solo si `cajas_pagadas >= total_cajas`. Cambiar motivo desde/hacia cumplimiento ya calculada →
vuelve a `en_taller`. El dueño lo confirmó con los números de YESID ($4.366.000 = base $800.000 −
semana $235.000 + ahorro $3.801.000; ahorra $66.000/semana pero paga $234.000 y no $235.000).
🔲 **Abierto:** terminar debiendo (YESID simulado: −$147.000 por el acuerdo) manda a lista negra y
bloquea Paz y Salvo — decidir si se cobra antes. Y qué fecha de corte manda en un cumplimiento
(±$199.000). Las otras dos caras (convenio de base cobrado; pagarlo no suma al ahorro) siguen igual.

## ✅ 26-sep: la segunda cara ARREGLADA (commits a20bdf7 + a8d2728, mig 176)
`deudasYAcuerdos(…, { seVaAntes, pisoBase })`: de un convenio `CONCEPTO_CONVENIO_BASE` al que se va
antes solo se cobra la parte de primera semana (lo que pase del piso $308.000/$305.000), con lo
abonado aplicado primero a la semana; por cumplimiento se cobra entera (D-026). Datos corregidos:
EDER, WILMAR, JORGE LUIS (LIQ-0075, no estaba en la lista del 24-sep), FRAIRON $410k→$102k,
JESUS MARIA −$390k→−$82k (a reimprimir), RICARDO −$472k→−$164k (ya se había cerrado el 24-sep).
🔲 Quedan: MELISSA (no cuadra) y la **tercera cara** (pagar el convenio de base no suma al ahorro,
35 clientes) — hoy ninguna liquidación abierta tiene abonos a su convenio de base.

## ✅ 26-sep: la tercera cara ARREGLADA — D-023 CERRADA (mig 177, commit c043d41)
El dueño preguntó "¿lo que pagan del acuerdo de base no va a la base?" — la plata SÍ entraba y SÍ
descontaba el acuerdo; lo que faltaba era ANOTARLA como base. Ahora `ahorro_apertura` = lo que puso
al entrar + lo pagado del acuerdo de base (disparador `trg_sumar_pago_de_base` en pagos, fuera del
motor; la semana que traía el acuerdo se cubre primero). Una vez: 35 clientes, $3.671.000 (foto:
solo cambió eso). Probado con LUIS ALEJANDRO en rollback. Límite: solo si el contrato tiene ÚNICAMENTE
su acuerdo de base (hoy los 63). 🔲 Queda MELISSA BELLO aparte.

## ⚠️ 26-sep (noche): CORRECCIÓN a lo de arriba — mig 178, commit 02cbf62
"La parte de primera semana del acuerdo de base sí se cobra" era FALSO: esa semana ya la lleva el
libro de cajas (semanas normales mientras activo; ajuste de salida al liquidar). Era cobro doble
(FRAIRON $102.000). Regla vigente: **al que se va antes no se le cobra NADA de su acuerdo de base**,
y **todo lo abonado al acuerdo de base es base** (hasta su parte de base). Derrape en DERRAPES.md.
🔲 Abierto: el pedazo de semana DENTRO de los acuerdos activos se paga dos veces (JORDAN $45.000,
JORGE DAVID $2.000) — decisión del dueño (acuerdos firmados) + cambio en el wizard. MELISSA pendiente.
✅ 26-sep (noche): el pedazo de semana DENTRO de los acuerdos activos también quedó arreglado — el
wizard arma el acuerdo de base con min(lo que falta, $308.000) (54b3791) y la mig 179 bajó JORDAN y
JORGE DAVID a $308.000 (el dueño lo entendió con las sumas: "le falta $353.000, le piden $398.000").
Queda solo MELISSA.
