---
name: ahorro-de-quien-es-regla-d023
description: "La regla D-023 del dueño (24-sep): el ahorro es de la empresa SOLO si el contrato termina bien; si liquida sin finalizar se le devuelve. De ahí salen 3 defectos vivos por $13,8M, y la corrección a mano de JORDAN (LIQ-0073)"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-24T20:58:06.358Z
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

## Lo único que se hizo: JORDAN a mano (LIQ-0073)

El dueño eligió **"solo JORDAN, ya, y el resto después"** y la **opción A** (deshacer y rehacer, no
solo parchar la cifra) porque **el papel que firma tiene que decir la verdad**.

Su cuenta corregida: $40.000 de ahorro **+** $78.000 que prepagó y no usó **−** $54.000 del alquiler
de la prestada = **+$64.000 A SU FAVOR** (no los −$244.000 que decía). Esos $64.000 van a la base de
su moto nueva; le faltan $446.000 para los $510.000.

**Verificado 7 de 7**, y `comparar_fotos` sobre los **362 contratos** devolvió **una sola fila**: la
deuda de JORDAN, −$244.000. Nada más se movió.

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
