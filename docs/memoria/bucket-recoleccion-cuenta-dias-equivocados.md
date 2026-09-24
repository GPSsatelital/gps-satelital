---
name: bucket-recoleccion-cuenta-dias-equivocados
description: "Hallazgo del 8/9-sep-2026: el balde RECOLECCIÓN (panel Hoy de Cartera y zala.cliente) se decide con los días desde el ÚLTIMO PAGO, no con los días que lleva VENCIDA la cuota — así casi todo el que entra en mora cae en recolección desde el primer día. Medido en producción: 137 hoy vs 64 contando la vencida, sobre 176 en mora. DECISIÓN DEL DUEÑO PENDIENTE antes de prender el envío automático."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-09T12:50:23.166Z
---

# El balde de RECOLECCIÓN cuenta los días equivocados (8/9-sep-2026)

## Qué se encontró
Al mirar la primera tanda de ZALA salieron **52 avisos de recolección contra 16 de mora**. El aviso
de recolección es el más duro que existe ("su caso pasó a recolección, genera un costo adicional de
inmovilización") y debería ser el más raro.

La causa: el balde se decide con **`diasSinPago > 3`** (días desde el último pago confirmado), no
con los días que lleva **vencida la cuota**. Para un cliente de lunes que entra en mora el
miércoles ya van 9 días desde que pagó la semana pasada → pasa el filtro el **primer día de mora**.
Por eso los que quedan en el balde "mora" son casi solo los que **abonaron algo hace poco** (un
abono parcial reinicia esa cuenta, la de vencida no).

## La misma regla, en dos sitios (espejo)
- `CobrosView.tsx` (panel Hoy): `c.estadoCartera === "mora" && c.diasSinPago > 3 && c.diasSinPago < 999 && !plazoVigente`.
- `zala.cliente` (mig 134): `balde_hoy` y `plantilla_hoy` con `dsp.dias > 3 and dsp.dias < 999`.
**No es un error de la vitrina: copia lo que ya hace la pantalla.** Si se cambia, se cambian los dos.

## Lo medido en producción (8/9-sep, contratos Activos en mora sin plazo vigente)
| | Contando días **vencida** (`dias_mora > 3`) | Como está hoy (`dias_sin_pago > 3`) | Total en mora |
|---|---|---|---|
| Recolección | **64** | **137** | 176 |

73 personas salen de la cola de recolección y pasan a "mora", que es el mensaje correcto para el
primer día. Ver la distribución completa del día en [[zala-vitrina-lectura]].

## ✅ RESUELTO — el dueño eligió "días vencida, más de 3" (9-sep-2026)
Se cambió en los **cuatro** sitios donde vivía la misma decisión (mapeados con grep antes de tocar):
- `CobrosView` balde Recolección del panel Hoy → `c.diasMora > 3`.
- `CobrosView` badge "Paso 4 RECOLECCIÓN FÍSICA" en el **detalle** y en la **lista** de contratos
  (`calcProtocoloStep`) → también `diasMora`. Si no, el panel diría "Mora" y la ficha "Paso 4".
- `zala.cliente` `balde_hoy` y `plantilla_hoy` → **mig 136**, generada a partir de la 134 con un
  script (no a mano) para que la vista salga idéntica salvo esas dos condiciones.
- Diccionario de ZALA actualizado (la regla vieja estaba escrita en la mig 126).

✅ **Mig 136 corrida el 9-sep. Espejo verificado:** la pantalla (TS) dice **64** en Recolección y la
vitrina (SQL) dice **64** — calculados por caminos distintos. Mora: 113 en la pantalla vs 112 en la
vitrina; la diferencia es **1 contrato Diario**, que la vitrina manda a `sin-motor` a propósito (no
calcula cifra para Diario ni lo mete en la tanda). Cuadra: 64+112+22+1 = 199. Ese día **87 personas
salieron de la cola** (con la regla vieja habrían sido 151, porque los 111 de gabela amanecieron en
mora; el grupo de "más de 3 días vencida" se mantuvo en 64 los dos días).

**NO se tocaron, con razón:** `CobroDiarioView` (su escalera cuenta desde el día de pago, no desde
el último pago — ya estaba bien) y el top 5 del Dashboard ("Contratos con más días sin pago": su
título dice justo lo que cuenta).

**Why:** ver 52 nombres en una lista es una cosa; mandarles a los 52 un mensaje automático diciendo
que su moto pasó a recolección es otra — quema la relación con el cliente y expone el número de
WhatsApp a reportes. Antes de que el envío automático se prenda, este contador tiene que estar bien.
**How to apply:** cambiar `diasSinPago` por los días de mora en `CobrosView` (panel Hoy) y en
`balde_hoy`/`plantilla_hoy` de `zala.cliente` (migración nueva, columnas al final). Es un cambio a
algo que YA FUNCIONA: no se toca sin autorización explícita (ver [[regla-no-romper-lo-que-funciona]]).
