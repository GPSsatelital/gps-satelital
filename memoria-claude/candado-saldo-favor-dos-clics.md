---
name: candado-saldo-favor-dos-clics
description: "El saldo a favor se aplicó DOS VECES a YERLIS porque dos personas le dieron al botón con 5 segundos de diferencia. La guarda anti-doble-clic de la pantalla no sirve contra dos celulares. Candado en la BASE (mig 160, 19-sep-2026)."
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-19T20:07:35.921Z
---

# El saldo a favor no se puede aplicar dos veces (mig 160, 19-sep-2026) ✅

## El caso — YERLIS QUINTERO (XZN23H)

El 18-sep a las **22:06:15** y a las **22:06:20** se aplicó **dos veces** el mismo saldo a favor de
$202.000. Solo había uno (entró el 18-jul). Su saldo quedó en **−$202.000** y **una semana entera
se dio por pagada con plata que no existe**. Su contrato está Suspendido y la moto Recuperada: esa
semana de regalo la hacía ver más cerca de recuperarla de lo que estaba.

**Lo arreglado (19-sep):** se rechazó el segundo movimiento con su motivo escrito. Saldo $0,
semanas de 33 a **32**, el abono de la actual intacto. Verificado antes/después.

## 🔴 POR QUÉ LA GUARDA DE LA PANTALLA NO SIRVIÓ

Explicación del dueño: *"dos personas le dieron en aplicar casi al mismo tiempo… eso es de lo que
hablábamos, que no se actualizaban las cosas enseguida"*.

El botón **sí tiene** guarda anti-doble-clic, pero **vive dentro de la pantalla de cada persona**:
impide que *vos* le des dos veces, no sabe nada del otro celular. Dos pantallas mostraban
"$202.000 disponibles" porque ninguna alcanzó a enterarse de la otra. **Cada guarda hizo bien su
trabajo y aun así pasó.**

→ **Regla general: una guarda de UI nunca protege plata. El candado va en la base.**
Mismo camino que los convenios repetidos de XZN22H (mig 050), y por eso ese defecto no volvió.

## Cómo quedó (mig 160)

`BEFORE INSERT on pagos WHEN tipo_registro = 'saldo_favor'` → `enforce_saldo_favor_disponible()`.
Traba el contrato (`for update`), suma el disponible real y **rechaza** con mensaje claro:
*"Ese saldo a favor ya se aplicó: solo quedan $0 disponibles… Refresca la pantalla."*

**Dos decisiones de diseño que no son obvias:**

1. **Va en el INSERT, no después.** `aplicarSaldoFavor` trabaja en DOS tiempos: crea el movimiento
   (el motor lo reparte y **ahí ya llenó la semana**) y después le descuenta el saldo. Un candado
   en el segundo tiempo llegaría TARDE: la semana ya estaría regalada y solo fallaría el descuento
   — **peor que sin candado**.
2. **Se cuentan los movimientos "en vuelo".** Entre crear el movimiento y cerrarle su cuenta pasan
   segundos en los que su `aplicado_saldo_favor` todavía es 0 (o el excedente que devolvió el motor,
   positivo). **Esos segundos son exactamente donde se coló el de YERLIS.** Por eso un movimiento de
   saldo sin cerrar se cuenta por su `valor`, no por su aplicado.

El flujo legítimo pasa con **margen cero**: la segunda mitad de una aplicación pide exactamente lo
que le quedó disponible de la primera.

**Probado en producción:** se reintentó el movimiento de YERLIS y la base lo rechazó con el mensaje.

## 🔲 La raíz sigue

`aplicarSaldoFavor` hace **dos llamadas desde el cliente** (insert + update). El candado lo tapa,
pero lo correcto es **un solo RPC en una transacción**. Queda en `docs/PENDIENTES.md` (P1).

Relacionado: [[bug-aplicar-saldo-favor]] · [[correcciones-a-mano-sep-2026]] ·
[[reglas-dinero-referencia-efectivo]] · [[regla-esencia-y-rastro]]

---

# 22-sep — Y AHORA NO PUEDE SER NEGATIVO (mig 166, corrida y PROBADA)

La pregunta del dueño, textual: *"¿por qué siquiera debería existir la posibilidad de que haya
saldo a favor negativo si se supone que saldo a favor es porque es A FAVOR?"*. Tiene razón, y
cambió la solución: yo iba a construir un **detector**; él pidió que **no se pueda prender fuego**.

## El caso que lo destapó — KEVIN ALEXIS LUNA CARDOZO (RLY45H)

29-ago 16:29, **tres aplicaciones seguidas**: $195.000 (legítimo, lo dejó en 0), $120.000 y
$75.000. Las dos últimas gastaron $195.000 que ya no existían. Su saldo quedó en **−$195.000**
desde el 29-ago hasta el 16-sep, cuando un sobrante lo devolvió a 0 **sin que nadie se enterara**.

**Lo encontró el dueño mirando una ficha, no el sistema.** Y su pregunta —"$600.000 hasta el 14
+ $195.000 de la semana del 21 = los $795.000 que pagó, ¿a dónde fueron esos $195.000?"— era
exactamente la correcta: el número equivocado era el **$600.000**, que estaba bajo porque en
agosto el hueco le había tapado $120.000 de deuda y $75.000 de una semana.

✅ Su plata está cuadrada: entraron $2.160.000 y se aplicaron $2.160.000. Le cobra bien.

## 🔴 POR QUÉ NADIE LO VIO EN TRES SEMANAS

El saldo **no es un dato guardado: es una suma** que se recalcula al abrir la pantalla, y termina
en `Math.max(suma, 0)` (`cicloPago.ts`). **Ese cero convertía −$195.000 en "$0".** El sistema
estaba escrito para no mostrarlo nunca.

Se DEJA el `Math.max(0)` (mostrar un saldo a favor negativo no le sirve a quien atiende), pero
ahora está explicado en el código con el caso y las fechas.

## 🔑 POR QUÉ EL CANDADO DE LA MIG 160 NO ALCANZABA — tapa 1 puerta de 4

Es `before INSERT ... when (tipo_registro = 'saldo_favor')`:
| Puerta | 160 | 166 |
|---|---|---|
| Aplicar saldo que no hay | ✅ | ✅ |
| **Rechazar** un pago cuyo sobrante ya se gastó (UPDATE) | ❌ | ✅ |
| **Borrar** ese pago (DELETE) | ❌ | ✅ |
| El motor re-reparte y el saldo baja | ❌ | ✅ |

## El candado de verdad (mig 166)

**`constraint trigger ... deferrable initially deferred`** sobre `pagos`. Corre **al CERRAR la
operación**, cuando el motor ya terminó de repartir: no se confunde con un estado a medias, exige
el estado FINAL. Si quedó en rojo, **deshace todo**.
Cuenta única: **`public.saldo_favor_actual(uuid)`** — espejo de `cicloPago.ts` pero sin el piso en
cero. Si se toca una, hay que tocar la otra.

✅ **PROBADO, no solo puesto**: se intentó rechazar el pago de $795.000 de KEVIN y saltó con el
mensaje completo (placa, nombre, monto y qué hacer). Después: el pago sigue `Confirmado` y el
saldo en `0` — el intento no dejó rastro.

🔴 **PUERTA QUE SE CIERRA, a propósito:** rechazar o borrar un pago cuyo sobrante el cliente ya
gastó ahora **se bloquea**. Antes pasaba sin chistar y dejaba el hueco escondido.

## Y se arregló mi propio aviso

La mig 165 dejó el aviso `saldo_negativo` mirando `saldo_favor_apertura`, que en KEVIN vale **0**
— el rojo vivía en la suma. **El aviso que construí para cazar esto justamente no lo cazaba.**
Ahora usa `saldo_favor_actual()`. Se parcheó recortando SOLO esa rama por su clave `'saldo_neg:'`
(buscando el `UNION ALL` de antes y el de después) para no tocar ninguna de las otras 22.

**Auditoría completa (22-sep):** en 2.938 pagos y 150 contratos con movimientos de saldo,
**KEVIN fue el único** que alguna vez quedó en rojo. Comprobado por dos métodos distintos:
saldo corrido movimiento a movimiento, y tandas de 2+ aplicaciones en menos de 10 minutos
(11 tandas, las otras 10 eran partir el saldo en pedazos, todas con respaldo).

## 💸 LO QUE LE COSTÓ A LA EMPRESA: $195.000 (22-sep) — y cómo se registró

Lo que faltaba saber lo dijo el dueño: **al cliente se le dijo que debía $600.000 y pagó $795.000
"para que no se le molestara hasta la semana del 27"**. O sea: pagó $195.000 de más *a propósito*,
para cubrir la semana del 21.

Pero su deuda REAL hasta el 14 era **$795.000** — el $600.000 estaba bajo por el hueco de agosto.
Así que su pago cubrió atraso viejo y **la semana del 21 quedó sin pagar**. Él pagó de buena fe
sobre un número que le dio la empresa.

🔴 **La contabilidad estaba bien y el cliente igual quedó mal.** Ese es el punto: que las cuentas
cuadren ($2.160.000 entraron = $2.160.000 aplicados) no significa que nadie salió perjudicado.

### Por qué NO se pudo "rodar"
Rodar **extiende el contrato**, y por regla del dueño eso **exige documento firmado por el
cliente**. KEVIN no iba a firmar una extensión por algo que él ya había pagado.

### Cómo se registró (sin firma, sin alargarle el contrato)
```
cajas_exoneradas:  0 → 1     (no se le exige ahora)
total_cajas:     100 → 99    (ni al final)
```
🔑 **Las dos juntas = "la empresa asume una semana".** Como `cajasExigidasHasta` resta las
exoneradas ANTES del tope de `total_cajas`, las dos se cancelan en el calendario: **el contrato
termina el mismo día**, con una semana menos que pagar. Por eso no necesita firma: nada le queda
peor al cliente.
(Solo `exoneradas +1` sería RODAR — misma plata, cobrada al final, contrato una semana más largo.)

Verificado: hoy le falta **$0** y está **al día**; el lunes 28 vuelve a pagar normal.
Todo en `contratos_auditoria` con el porqué completo.

### 🔲 El hueco de pantalla que dejó
**No hay botón para esto.** `cajas_exoneradas` solo se toca desde
`ModalResolverTiempoFueraServicio`, que exige que la moto haya estado en taller, y
`ModalEditarContrato` no lo expone. Un error de cuentas que no se le puede cobrar al cliente hoy
se arregla **solo por SQL**.

### 🔑 La lección, que es la cara
Un candado que falta no cuesta lo que costó arreglarlo: cuesta lo que se le dijo mal a un cliente
mientras estuvo faltando. Acá fueron **$195.000 y la confianza de KEVIN**, por un `Math.max(0)`.
