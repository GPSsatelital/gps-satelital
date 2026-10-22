---
name: caja-por-cuenta-bancaria
description: "Panel 'Por cuenta bancaria' en Caja Diaria (15-sep-2026): cuánto entró a cada cuenta del banco, para cuadrar contra el extracto. Suma transferencias + bases + plata sin dueño. Y con más de una cuenta ya no deja guardar sin marcarla."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-15T21:24:05.877Z
---

# Cuánto entró a CADA cuenta del banco (15-sep-2026, `2cbf030`)

Pedido del dueño: *"que se especifique las cuentas a las que entra el dinero — los del portafolio
de COSTA tienen dos cuentas bancarias y ahorita el sistema no sabe qué pago entró en qué cuenta"*.

**La sorpresa: ya estaba construido a medias.** La mig 087 (6-ago) agregó `pagos.cuenta_id` y el
`SelectorCuentaBanco` vive en las tres puertas que registran transferencias (Cartera, Cobro Diario,
base inicial en Clientes). Lo que faltaba era **la otra mitad: no había dónde verlo.** El dato se
guardaba y se quedaba ahí; la caja seguía dando un solo total.

## La regla que lo ordena todo

Son **dos preguntas distintas** y por eso son dos paneles, no uno:
- *Recaudo por grupo* → cuánto **produjo** cada portafolio.
- *Por cuenta bancaria* → cuánto tiene que decir **cada extracto**.

No coinciden a propósito: un cliente de COSTA puede transferirle al Nequi de PRADERA, y el selector
deja registrar esa verdad incómoda. Mezclarlas sería el defecto que prohíbe
[[reglas-dinero-referencia-efectivo]]: una cifra, una pregunta.

## Qué suma (decisión del dueño: "todo lo que llegó al banco")

Las tres fuentes que el extracto no distingue: **transferencias confirmadas** + **bases pagadas por
transferencia** (las devoluciones restan; la retención no se mueve) + **plata sin dueño**.
El efectivo **nunca** entra: llega a la mano, no a una cuenta.
Lo que quedó sin cuenta marcada va en amarillo y **de último** — es el aviso, no un renglón más.

## La llave que se cerró

Con **más de una** cuenta en el portafolio, ya no deja guardar la transferencia sin marcar cuál
(las dos puertas: `errorTransferencia()` en Cartera y `errorCuenta()` en Cobro Diario). Con una sola
no estorba: el selector la elige solo. **Ese dato no se recupera después** — el extracto no dice de
quién era cada entrada. Antes nadie estaba obligado y COSTA guardaba nulos.

`totalesPorCuenta` y `faltaElegirCuenta` en `src/utils/cuentasDelDia.ts`, 14 pruebas.

## Verificado en pantalla con datos reales (14-sep)

Yeiner $3.328.500 + Yeny $874.000 + Wilder $645.000 + **sin marcar $160.000** = **$5.007.500**,
que es exactamente transferencias $4.802.500 + $205.000 sin dueño. Sin desborde a 375px.
El renglón de "sin marcar" cazó plata real el primer día.

🔲 Los pagos anteriores a agosto no tienen cuenta y no hay forma de adivinarla: salen siempre en
"Sin especificar".

Relacionado: [[caja-fecha-del-banco]] · [[saldo-favor-y-caja-descuadre]]
