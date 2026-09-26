---
name: d026-semanas-de-cierre
description: "D-026 (25-sep-2026) — el que llena su última semana debiendo sigue pagando su semana normal hasta $0; plan de 4 pasos propuesto, SIN aprobar; antes del ~19-oct por YESID."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-09-26T00:06:29.374Z
---

**La regla (D-026, textual del dueño):** *"para cuando el tiempo del contrato termine y aún siga
debiendo, se debe colocar más tiempo en semanas dependiendo de lo que tiene pendiente hasta que
quede totalmente al día"*. Se le mostraron dos formas con los números de YESID y eligió la **A**:
sigue pagando su **semana normal** ($235.000) y todo va a lo que debe (2 semanas de más), no solo
la cuota del acuerdo ($60.000, 5 semanas). Respondió además: esas semanas se cobran **igual que
cualquier semana** (gabela, mora, mensajes, llamada, recolección) y el pago va en el **orden de
siempre** (deudas primero, después acuerdo).

**Por qué salió:** al arreglar D-023 (el ahorro del que termina pagó la moto), YESID simulado a
65/65 daba −$147.000 (acuerdo pendiente $256.000 − saldo a favor $109.000) → el cierre lo
mandaría a lista negra y no dejaría imprimir Paz y Salvo. Antes su ahorro tapaba la deuda en
silencio.

**Lo medido el 25-sep (los que terminan pronto):** JOSE GOMEZ 12/15 debe $0 · YESID 60/65 debe
$256.000 (acuerdo "tarifas atrasadas", $556.000 en 10 cuotas de $60.000, lleva 5) · LUIS FERNANDO
SOLANO 98/104 debe **$1.455.200** en deudas sueltas (8 semanas de más a $195.000) · RAMON 112/104
$1.509.000 y CESAR 118/104 $0 (los dos en pausa por el dueño).

**Lo que hace hoy el sistema (y por qué no alcanza):** las deudas sueltas ya reciben el pago
completo después de la última semana; el acuerdo NO (freno de la mig 119: solo la cuota exigida,
el resto a saldo a favor); `desgloseExigible` topa en `total_cajas` → **después de la última semana
la mora queda en 0** y nunca entraría a recolección; y nada impide liquidar por cumplimiento a
quien debe.

**Plan (en `docs/PENDIENTES.md` → P0), sin aprobar:** 1) candado de cumplimiento mientras deba
(pantalla + `cerrar_liquidacion`); 2) motor sin freno al acuerdo solo con todas las cajas llenas
(parche por anclas sobre la función VIVA + `repartoPago.ts`); 3) semanas de cierre en `cicloPago`:
toca hoy = `min(deuda actual, k × semana − pagado a deudas/acuerdo desde el inicio del cierre)`,
mora desde la semana de cierre más vieja sin cubrir, y el caso borde de la deuda que aparece
después de terminar limpio; 4) espejo en ZALA (`zala.dias_en_mora_v2` de la mig 129 + diccionario
+ prueba espejo).

**How to apply:** en la sesión nueva, repetirle el plan con los números de YESID y LUIS y esperar
el sí antes de escribir código. Paso 1 primero (protege aunque lo demás tarde). Nada del motor un
lunes o miércoles antes de las 6 pm.

Ver [[ahorro-de-quien-es-regla-d023]] · [[acuerdo-vencido-se-sigue-cobrando]] · [[libro-de-cajas-motor-v2]].
