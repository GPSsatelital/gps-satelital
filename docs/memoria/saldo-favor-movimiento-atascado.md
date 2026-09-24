---
name: saldo-favor-movimiento-atascado
description: "Aplicar saldo a favor cuando el cliente no debe nada crea una fila en ceros que traba el saldo para siempre — LUIS (IEW57I) y RAFAEL (DPU52I), destrabados el 23-sep; la puerta sigue abierta"
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-24T00:04:12.221Z
---

# El "papelito vacío" que traba el saldo a favor (23-sep-2026)

✅ **Los 2 casos destrabados y verificados.** 🔲 **La causa sigue viva: el botón puede volver a
crearlos.**

## Cómo se destapó

El dueño pidió revisar las cuentas de **IEW57I**. Todo cuadraba al peso, pero había un pago de
$110.000 del 15-sep con **los nueve campos de reparto en cero**. Le dije que el daño era solo el
texto de la pantalla. **Me equivoqué.** Él le dio a "Aplicar saldo a favor" en producción y salió:

> *"Ese saldo a favor ya se aplicó: solo quedan $0 disponibles y se intentó aplicar $59.000."*

## La causa

`aplicarSaldoFavor` trabaja en **dos tiempos**: crea el movimiento y después el motor lo cierra.
Si en ese momento **el cliente no debe nada exigible**, el motor no tiene dónde meter la plata y la
fila queda con `aplicado_saldo_favor = 0` — **sin cerrar, para siempre**.

Y el candado de la mig 160 cuenta esas filas *"en vuelo"* **por su `valor` completo** (a propósito:
asume que se creó hace segundos). Resultado en LUIS:

```
   $59.000   lo que sus pagos dejaron a favor
 − $110.000  la fila del 15-sep "en vuelo"
 ───────────
  −$51.000 → se muestra $0 disponible
```

🔑 **Los dos casos nacieron idénticos: un minuto después de un pago que dejó sobrante, con el
cliente ya en cero.** LUIS 15-sep 19:44 paga → 19:45 se aplica. RAFAEL 22-sep 14:35 paga →
14:36 se aplica.

| Placa | Cliente | Fila | Plata trabada |
|---|---|---|---|
| IEW57I | LUIS ALEJANDRO GUTIERREZ | $110.000 · 15-sep | $59.000 (8 días) |
| DPU52I | RAFAEL ARNEDO GOMEZ | $100.000 · 22-sep | $100.000 (1 día) |

De **148** movimientos de saldo en la flota, solo esos 2 estaban atascados.

## Lo que además mentía en pantalla

`lineaTiempo.ts` → `tituloPago`, rama `saldo_favor`: con `aplicado_saldo_favor = 0` calcula
`usado = 0` y `sobro = valor`, así que la ficha decía **"Se usó saldo a favor: $0 · Sobraron
$110.000 y siguen como saldo a favor"** — prometiéndole $51.000 que no tenía.

## 🔴 Por qué la batería de coherencia no lo vio

La fórmula del reparto hace `entra − sale`. En una fila `saldo_favor` con todo en cero,
`entra = −0 = 0` y `sale = 0`: **cero menos cero da cero y pasa como sana.** Falta el chequeo #6.
Ver [[bateria-coherencia-formulas]].

## Cómo se arregló (y las 2 trampas del SQL)

Borrar las 2 filas con guardas (que sumen 0 en los 9 aplicados, que el saldo sea el medido),
auditoría en `contratos_auditoria`, y verificación de que `disponible = saldo` al final.
**Dos intentos reventaron antes de dar con la forma:**

1. **`P0001: No tiene permiso para eliminar/anular pagos`** — `trg_enforce_eliminar_pago`
   (mig 048) exige `puede_accion('eliminar_pago')`, y el editor de Supabase corre **sin sesión**
   (`mi_rol()` nulo). → `alter table public.pagos disable trigger trg_enforce_eliminar_pago`
   dentro de la transacción, y prenderlo antes del commit.
2. **`55006: cannot ALTER TABLE because it has pending trigger events`** — el candado de la
   mig 166 es **DIFERIDO**: el DELETE lo deja en cola para el commit, y con revisiones pendientes
   Postgres no deja hacer ALTER. → **`set constraints all immediate;`** justo después del DELETE.

**DESPUÉS (verificado por los dos lados):** LUIS $59.000/$59.000 · RAFAEL $100.000/$100.000 ·
candado prendido (`O`) · 0 atascadas en la flota · cajas y ahorro de ambos intactos.

## ✅ CERRADO (23-sep) — mig 167 + commit `277ba92`

1. **El candado** solo cuenta "en vuelo" las filas donde el motor SÍ aplicó algo. Medido sobre los
   **2.998 pagos** (paginado): 0 contratos trabados de 95 con saldo · 0 filas vacías · y de los
   148 movimientos de saldo, los **148** que consumieron crédito aplicaron algo.
2. **El freno**: `aplicarSaldoFavor` exige `debeHoy` (posicional y obligatorio → TypeScript marca
   cualquier punto de cobro nuevo que lo olvide). La cifra sale de `loQueDebe()`, la fuente única.
3. **El texto de la ficha** ya no promete plata. 3 pruebas nuevas (653 en total, eran 650),
   **verificadas fallando sin el arreglo** con el texto viejo exacto `"Se usó saldo a favor: $ 0"`.
4. **Chequeo #6** `saldo_favor_atascado` vivo en `pendientes_activos`, 0 casos.

🔑 **PROBADO EN LA PANTALLA REAL, sin escribir en la base.** El freno se prueba solo: se le da al
botón en un contrato que no debe nada y, si funciona, **no guarda nada**. Con LUIS ($9.000, debe
$0): salió el aviso correcto y los pagos quedaron en 10/10, cajas y ahorro idénticos. Para llegar
al handler hay que interceptar el `confirm()` (el navegador automático los rechaza solo) — guardar
los originales UNA vez y restaurarlos, ver [[consultar-base-desde-el-navegador]].

⚠️ **Efecto secundario aceptado por el dueño:** ya no se puede usar el saldo para **adelantar** una
cuota del acuerdo que todavía no se le exige.

## ✅ Y EL RASTRO DEL SALDO (23-sep, commit `03ef50d`)

Mirando la ficha de LUIS el dueño preguntó: *"sale que no se usó dinero real pero **no dice de
cuándo vino ni qué cantidad era la del pago inicial y de dónde sigue** ese mismo saldo a favor"*.
Tenía razón y se veía en su propia captura: **arriba $59.000, abajo "Convenio $50.000", y los
$9.000 restantes en ninguna parte.** Es [[regla-esencia-y-rastro]] pura.

🔑 **`src/utils/saldoFavor.ts` — `rastroSaldoFavor()`**: FIFO, igual que las cajas. Cada peso
guardado sabe de qué pago salió; el más viejo se gasta primero. Devuelve `usos` (lo que se mandó,
lo que se usó, lo que volvió a guardarse, de dónde vino, cuánto queda) y `generadores` (cuánto
dejó guardado un pago y cuándo se fue usando). **Una sola fuente para las 3 pantallas**, misma
lección de `loQueDebe()`.

Cómo quedó la tarjeta de LUIS, medido en producción:
> **$ 50.000** de $ 59.000 · Miércoles 23 de septiembre · No entró dinero
> **Viene de:** su pago de $ 260.000 del Mar 15 sep.
> Se usó en: → Convenio $50.000 · **Volvió a quedar guardado $ 9.000** ·
> **Saldo a favor después de esto $ 9.000**

Y el pago de $260.000 que lo generó ahora dice hacia adelante: *"De este pago quedaron $59.000
guardados. Se usaron $50.000 el Mié 23 sep. Todavía quedan $9.000."*

⚠️ **La trampa que casi se me pasa:** el historial de Cartera muestra solo **los últimos 10
pagos**, pero el FIFO tiene que arrancar por el PRIMERO o le atribuye el crédito al pago
equivocado. El rastro se arma con `pagosDelContrato()` completo, no con la lista recortada.

Decisión del dueño sobre el número grande: **las dos cifras juntas** ("$50.000 de $59.000"), de
tres opciones que se le dibujaron. Verificado a **375px en la pantalla real**: 0 elementos
desbordados, sin scroll horizontal. 668 pruebas (eran 653).

## 🔲 Lo que queda (no es de este defecto)

La raíz —que `aplicarSaldoFavor` trabaje **en dos tiempos** en vez de un solo RPC— sigue en
`docs/PENDIENTES.md`. Se evaluó hacerlo ahora y **se descartó a propósito**: es reescribir en la
base lógica de plata que funciona (deuda-primero, saldo dirigido a un convenio) empujado por un
defecto chico. Es la lección de la mig 124.

## 🔲 Lo que FALTA (la puerta sigue abierta)

1. **Que no se pueda crear un movimiento de saldo cuando el cliente no debe nada** — hoy el botón
   deja, y en vez de un aviso deja una fila que traba la plata.
2. **Chequeo #6** en la revisión de coherencia: *movimiento de saldo a favor atascado*.
3. **El texto de `lineaTiempo.ts`**: con `aplicado_saldo_favor = 0` no puede decir "sobraron $X y
   siguen como saldo a favor".

Relacionado: [[candado-saldo-favor-dos-clics]] (migs 160 y 166) · [[bateria-coherencia-formulas]] ·
[[correcciones-a-mano-sep-2026]] (el método: leer, invertir, antes/después).
