---
name: migracion-7-rastreador-dias-reales
description: "29-ago-2026: migrados 7 clientes mas de RASTREADOR desde Excel. Primera migracion que RESPETA el dia de pago real (sabado/jueves/viernes) y la primera que usa cajas_exoneradas para el tiempo guardado. En produccion."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-29T18:43:22.632Z
---

# Migración de 7 más de RASTREADOR — con el día de pago REAL (29-ago-2026)

Fuente: `MIGRACION 7 DE RASTREADOR.xlsx` (corte 25-ago). SQL en `migracion_datos/rastreador_7_mas.sql`
+ `_bloque2.sql` + `_bloque3.sql` (gitignored, PII). **CORRIDA Y VERIFICADA: 7/7/7 · $9.187.200
de deuda de apertura · $10.387.000 de ahorro.**

## 🔑 Lo NUEVO que dejó esta migración (aplica a las que vengan)

**1. El día de pago NO tiene que ser lunes/miércoles.** El CLAUDE.md dice "sin excepciones", pero
eso es regla de NEGOCIO, no límite técnico: `cajas_exigidas` (SQL) y `cajasExigidasHasta` (TS)
cuentan cada 7 días desde `fecha_inicio_cajas` y **nunca miran el texto `dia_pago`**. Fuera del
wizard, `dia_pago` solo se usa para MOSTRAR. Estos 7 pagan sábado, jueves y viernes.

**2. La trampa que casi lo rompe:** `preview_init_cajas` (mig 047) sí forzaba lunes —
`v_target := case when dia_pago in ('Miércoles','Miercoles') then 3 else 1 end`. A JORGE (jueves)
le habría puesto el arranque en lunes: la pantalla diría jueves y el motor cobraría lunes. Se
adaptó a mapear el día real. **Si se migra otro grupo con días libres, hay que llevar ese cambio.**

**3. El corte se elige poniendo el LUNES de la semana:** con `v_corte + ((target - dow(corte)+7)%7)`
cada contrato aterriza solo en SU día de esa semana. Corte lunes 24 → VICTOR (sábado) cae el 29.
Corte lunes 31 → JORGE el 3-sep, LUIS el 4, los sábados el 5. Un solo número controla a todos.

**4. Decisión del dueño sobre a quién cobrarle ya:** VICTOR arranca en la semana del 24 (debe 1
semana: no pagaba desde el 11-ago); los otros 6 arrancan la semana del 31 sin deber nada (ya
habían pagado entre el 18 y el 21). El arranque decide si el sistema le cobra la semana o no.

## 🔍 Lo que el Excel traía mal, y cómo se cazó

- **La casilla "DIA_PAGO" trae el día de la ENTREGA.** Coincide en 5 de 7 — y no es casualidad:
  se entrega un jueves, consume desde el viernes y paga el jueves siguiente. El ciclo queda
  anclado al día de entrega. **Sirve para validar cualquier Excel futuro.**
- **VICTOR: el año.** La hoja decía entrega 2026-03-22 y pago desde 2025-03-23 (empezaría a pagar
  un año antes de recibir la moto). Sus 74 semanas SOLO cuadran con 2025. Año correcto: 2025.
- **VICTOR: la tarifa.** El arqueo decía $169.000 y la otra hoja $195.000. El dueño acertó:
  **$169.000 es la tarifa NETA**, sin ahorro. 195.000 − 26.000 (6×4.000 + 2.000 del domingo) =
  169.000 exacto. Se migró con 195.000.
- **Placa de CESAR: `ZH034G` con un CERO** donde va la letra O (las placas son 3 letras + 2 números
  + 1 letra). Corregida a **ZHO34G**, del mismo lote que ZHO35G.
- **Bases con la cuota metida adentro:** LUIS, CESAR y RAMON traían "195.000" de base — que es su
  cuota semanal, no la base. Decisión del dueño: LUIS y CESAR en **0**, RAMON en **340.000**
  (su hoja decía 9.340.000, le sobraba el 9).
- **Saldos a favor NEGATIVOS** en 3 de 7 (−90.200, −330.000, −1.029.000). No se cargaron: un saldo
  a favor no puede ser negativo, y la mig **079 (`saldo_favor_apertura`) sigue sin correr**.

## 🕐 El tiempo guardado (primera vez que se usa `cajas_exoneradas` en una migración)

Tres pasaron sus 24 meses y seguían activos porque **la moto estuvo guardada** — el contrato
termina por PAGOS, no por tiempo (spec del libro de cajas, punto 7).

- **JORGE: 28 semanas, y el dato ya estaba en el Excel.** Su arqueo declaraba 82 semanas pero desde
  la entrega van 110. **Esa diferencia ERA el tiempo guardado** — el funcionario ya se lo había
  descontado a mano. Con `cajas_exoneradas = 28` queda en 82 de 104, igual que su hoja.
  🔑 **Regla para el próximo Excel:** si las semanas declaradas ≠ las calculadas desde la entrega,
  la diferencia es tiempo guardado, no un error.
- **CESAR y RAMON: pendientes.** Su arqueo no descontó nada. Mínimos para que el contrato reviva:
  **CESAR 13, RAMON 7**. El dueño decidió rodarlos DESPUÉS, al validar. SQL listo en el archivo.
  ⚠️ **Mientras tanto el sistema NO les cobra la semana** (salen 118/104 y 112/104).

**Ojo con `cajas_pagadas`:** el bloque 3 lleva `pagadas_init - cajas_exoneradas`. Sin esa resta
JORGE quedaría con 111 pagadas contra 83 exigidas = "al día y 28 semanas adelantado", falso.

**Distorsión conocida y benigna:** antes de `fecha_inicio_cajas`, `cajas_exigidas` aplica el tope de
`total_cajas` ANTES de restar las exoneradas (al revés que en la rama normal, donde la 078 lo hace
a propósito). JORGE aparece con 7 cajas de sobra hasta el 3-sep y ahí se acomoda solo. **No se tocó
el motor por esto** — es cosmético y temporal.

## Los guardas salvaron la migración

El bloque 1 abortó al primer intento: **RLI14H, RLI25H y ZHO35G ya existían** como motos
"Disponible" del grupo RASTREADOR con marca BAJAJ real y sin contrato. Se cambió a REUSARLAS
(insert solo de las que faltan + update a Asignada, sin pisarles la marca). Sin ese guarda habría
reventado por la unique de placa a mitad de camino.
🔑 **Guardas que vale la pena repetir:** placa con contrato vivo · cédula ya registrada · la
variante mal digitada de la placa (ZH034G) · que la migración que se necesita esté corrida.

**Falso positivo que costó un susto:** verifiqué si el update había tocado contratos ajenos con
`fecha_inicio_cajas >= 2026-08-24` y salió 1 (JOSE GOMEZ, RLY56H). **No era daño:** es mensual día
25, su arranque siempre fue el 25-ago desde la siembra de COSTA, y además ya tenía `motor_v2=true`
así que el filtro lo excluía. La consulta estaba mal planteada, no el dato.

## ✅ El corte era POR GRUPO y hay varias tandas (`1e22eb5`) — lo cazó el dueño mirando la ficha

Al abrir a VICTOR vio *"Corte de la cartera RASTREADOR: Lun 6 jul"* y preguntó por qué esa fecha.
**No era solo un letrero:** `diasDesdeUltimoPago` usa ese corte como punto de arranque cuando el
contrato no tiene pagos. VICTOR contaba desde el 6-jul = **54 días sin pagar → Paso 4 Recolección
física**, cuando apenas le tocaba pagar ese día. A los otros 6 les habría pasado igual al entrar
en mora la semana siguiente.

**Causa raíz:** `CORTE_POR_GRUPO` asume *un grupo = una fecha de migración*. Falso: RASTREADOR
tiene dos tandas (28 el 6-jul, 7 el 29-ago). **Idéntico al defecto de COSTA** (le caía el default
del 1-jul cuando su corte fue el 27-jul; ~180 contratos con "27d sin pagar" el primer día).

**Arreglo:** `corteMigracionContrato(contrato, grupo)` → devuelve `fecha_inicio_cajas` si el
contrato es migrado, y si no cae al corte del grupo. `fecha_inicio_cajas` ES la fecha desde la que
se le exige a ESE contrato. A PRADERA/COSTA/RASTREADOR-viejos no les cambia nada porque su arranque
se calculó justamente desde el corte de su grupo. Aplicado en los 6 puntos: Cartera (días + el
letrero), Cobro Diario, Panel, Reportes ×2. Además `diasDesdeUltimoPago` ya no da negativo — los 6
que arrancan la semana entrante tienen el corte en el FUTURO y decía "-5d sin pagar".
`corteMigracion.test.ts`: 10 pruebas con las cifras reales de VICTOR (54 → 0) y JAIRO.

🔑 **La lección:** un dato de migración guardado **por grupo** se rompe en cuanto hay una segunda
tanda. Si vuelve a aparecer un valor "por grupo" que en realidad describe *cuándo se migró*, va
por contrato. Y el aviso llegó porque el dueño **leyó un letrero que no le cuadró** — vale la pena
que las pantallas muestren de dónde sale cada fecha.

## ✅ El día NO se podía corregir: la lista solo tenía lunes y miércoles (`e277e0c`)

El dueño: *"en un lado me dice que es de los lunes y por otro que es de los sábados, y al modificar
el contrato no se cambia"*. **Y me corrigió el dato: VICTOR es de LUNES, no de sábado** — o sea que
mi deducción "el día declarado = el día de la entrega" falla al menos en un caso.

**Un solo defecto explica los tres síntomas:** el `<select>` de "Día de pago" solo tenía Lunes y
Miércoles. Con `dia_pago = 'Sábado'` guardado, el select no encuentra su valor → **muestra la
primera opción (Lunes) pero el estado interno sigue en "Sábado"**. Por eso la ficha decía sábado,
la ventana decía lunes, y guardar no cambiaba nada.
🔑 **Patrón repetible:** un `<select>` cuyo `value` no está entre sus `<option>` miente en silencio.
Si un campo acepta valores que la lista no ofrece, la lista está incompleta.

**Lo que se hizo:**
- Los 7 días en la lista (el motor siempre los soportó; la ventana era la que no dejaba verlos).
- 🔴 **Cambiar el día ahora MUEVE el arranque de cajas** (`moverAlDiaDeLaSemana`, dentro de la misma
  semana para no correr ni adelantar ninguna caja). Sin esto el arreglo creaba un defecto peor: la
  ficha diría "paga lunes" y el motor seguiría exigiendo los sábados. `editarContrato` no tocaba
  `fecha_inicio_cajas`; hubo que agregarla a los campos editables (queda en la auditoría).
- **Nota que pidió el dueño**, en vez de corregir los días a ciegas: `diaPagoPorConfirmar()` marca
  los que no son lunes/miércoles y avisa en la ficha de Cartera y en la ventana de editar. Decisión
  suya: *"apenas el funcionario vea esos días lo terminará arreglando"*.
- 20 pruebas (`corteMigracion.test.ts`). Total 375.

⚠️ **Los días de JAIRO (sábado), JORGE (jueves), LUIS (viernes) y RAMON (sábado) siguen SIN
confirmar.** Si VICTOR estaba mal, ellos también pueden estarlo. Los corrige el funcionario.

## 🔴 EL CANDADO que pidió el dueño (`17eb1e8`) — lo cazó él, no una prueba

Sobre el arreglo de arriba preguntó: *"no vaya a ser que por algún motivo cambien el día de pago
—cosa que no debería pasar, pero por si pasa— y se vaya a rodar también el cuándo inició la caja.
Esto solo aplicaría para estos 7"*. **Tenía razón y era grave:** mover el arranque estaba abierto a
CUALQUIER semanal con motor, o sea a los ~370 que ya vienen cobrando. A un cliente con meses de
pagos, moverle el arranque le corre TODAS sus cajas futuras.

`puedeMoverArranqueCajas(fecha, hoy)`: solo se mueve si el arranque cae en la **semana en curso o
la siguiente** — la ventana de una migración recién hecha. Es objetiva (sin placas escritas a mano)
y **se cierra sola con el calendario**: en dos semanas los 7 quedan tan sellados como los demás.
Fuera de la ventana el selector se deshabilita y explica por qué; si aun así llegara un cambio,
`handleGuardar` lo rebota antes de tocar la BD. **Se bloquea en vez de guardar a medias**, porque
cambiar el día sin mover el arranque haría que la ficha diga un día y el cobro caiga otro.

🔑 **La lección de método:** yo arreglé el defecto visible (el día no se podía cambiar) y de paso
abrí una puerta sobre ~370 contratos vivos sin decirlo. El dueño la vio de inmediato. **Todo
arreglo que toque el motor tiene que declarar a QUIÉNES alcanza, no solo qué corrige** — y lo que
nace para una migración puntual debe llevar su propio candado desde el primer commit.

## 🔲 Lo que queda pendiente

1. **Rodar a CESAR (mín 13) y RAMON (mín 7)** cuando el dueño valide. Hasta entonces no les cobra semana.
2. **6 cédulas**: entraron como `POR DEFINIR-<placa>` (la columna es NOT NULL). El checklist del
   empalme ya pide verificar la cédula con el cliente al frente — encaja solo.
3. **Verificar en el empalme** (los 7 tienen badge ⚠️): las 82 semanas de JORGE, la base de RAMON,
   las bases en 0 de LUIS y CESAR (su hoja dice "FALTA INFORMACION").
4. **Saldos a favor**: $366.000 de 4 clientes sin cargar + 3 negativos por aclarar + mig 079 sin correr.
5. **Datos técnicos** de las 4 motos nuevas (EYQ88H, ZIB64G, EXT59H, ZHO34G quedaron "POR DEFINIR").
6. **Aparte, no es de esta migración:** JOSE GOMEZ (RLY56H, COSTA, mensual $900.000) lleva **cero
   pagos confirmados** desde la siembra de julio y su empalme sigue abierto.

Ver [[migracion-grupos-datos-reales]] · [[migracion-costa-siembra]] · [[libro-de-cajas-motor-v2]] ·
[[prestamo-liquidacion-verificados]] (de donde sale `cajas_exoneradas`).
