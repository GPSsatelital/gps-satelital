---
name: correcciones-a-mano-sep-2026
description: "El método para corregir a mano lo que el sistema no deshace, y los 4 casos reales hechos en sep-2026 (ELKIN, RONAL, JHONATAN, ERLEY). Incluye los cabos sueltos verificados que NO eran problema."
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-19T20:08:28.762Z
---

# Correcciones a mano (sep-2026) — el método y los casos

## 🔑 EL MÉTODO, que es lo reusable

1. **Leer la función que hizo el daño y invertirla línea por línea.** Para las liquidaciones es
   `cerrar_liquidacion()` en `supabase/111_…sql`: hace **9 cosas**, y en cada caso concreto solo
   aplican algunas. Saber cuáles **por leerlas** es lo que evita cabos sueltos.
2. **Nunca regenerar, siempre parchar.** Funciones y vistas se leen con `pg_get_functiondef` /
   `pg_get_viewdef` y se les reemplaza el ancla, contándola primero y abortando si no cuadra.
   Es la lección de la mig 124.
3. **Guardas en cada `update`** (`and estado = 'X'`): correrlo dos veces no hace daño.
4. **Consulta de ANTES y de DESPUÉS, siempre.** Un "success" NO prueba que el `commit` pasó — ya
   pasó una vez que se revirtió en silencio.
5. **`select set_config('app.cierre_liquidacion','1', true);`** dentro de la transacción para pasar
   el guardián de `clientes.estado` (mig 111). Es transaccional, se borra sola.
6. 🔴 **Cruzar la placa contra el cliente ANTES de tocar.** Una placa dicha de memoria se verifica.

## Los 4 casos hechos

**ELKIN CARDALES — liquidación CERRADA revertida** (17-sep) → [[elkin-revertir-liquidacion-cerrada]].
La placa que dio el dueño era de OTRO cliente. Excepción autorizada; la respuesta normal sigue
siendo **contrato nuevo**.

**RONAL DAVID BENITEZ — la moto equivocada** (18-sep). Le entregaron la **DPW62I** y digitaron
**RLT86H**. Se corrigió *como si siempre hubiera sido la DPW62I* (decisión del dueño), NO como
"cambio de moto" — nunca tuvo la RLT86H. Lo importante: **el wizard guarda el kilometraje y las
fotos de entrega EN LA MOTO**, así que quedaron pegados a la placa equivocada y hubo que moverlos
(16.246 km + fotos). La RLT86H figuraba *Asignada* sin estarlo y la DPW62I *Disponible* — cualquiera
se la podía asignar a otro. La plata no se movió: pagos y convenios cuelgan del **contrato**.

**JHONATAN REYES (RML57H) — deuda del Excel corregida** (18-sep). Le faltaba registrar un pago de
$200.000 del sistema viejo. 🔴 **Una deuda dentro de un acuerdo NO se corrige sola**: hay que tocar
**cinco cosas a la vez** o el acuerdo sigue cobrando lo viejo — la deuda, `deuda_total`,
`monto_deudas`, **la partitura** (el renglón de esa deuda) y el número de cuotas.
Quedó: deuda $633.000→$433.000 · acuerdo $663.000→$463.000 · 19→14 cuotas, **misma cuota semanal
de $35.000** (no se le cambia lo que se comprometió a pagar: termina antes).

**ERLEY BASTOS (RLZ97H) — LIQ-0040 cerrada sin firma, devuelta** (18-sep). Faltaban deudas de
repuestos. **Ningún botón sirve desde `cerrada`**: "Devolver a pendiente de firma" exige `firmada`
y "Anular" tiene `.neq('cerrada')`. Se devolvió a **`calculada`** (no a nada) para que la rehiciera
por la app — menos SQL y menos riesgo que la reversa completa de ELKIN.
🔑 **El reparto del ahorro se reconstruye sin adivinar:** `detalle_favor` de la liquidación trae
*"Ahorro que ganó pagando"* = apertura + acumulado, y **acumulado = Σ `aplicado_ahorro`** de sus
pagos. ERLEY: 1.236.000 (auditoría del empalme) + 104.000 (sus pagos) = **1.340.000** ✓ exacto.
⚠️ Al contrato vuelve **1.340.000, no 1.645.000**: los otros $305.000 son la parte de la base y
**la liquidación los vuelve a sumar sola** — ponerlos en el contrato sería contarlos dos veces.

**JORGE LUIS TOVAR (ZIB64G) — el día de pago mal migrado** (19-sep). **Siempre fue de LUNES**; al
migrarlo le pusieron JUEVES. No es un cambio de día — es un error de digitación, igual que la placa
de RONAL, así que **la regla del 29-ago no aplica** (esa protege de rodarle el calendario a quien
cambia de día de verdad; acá el cliente nunca cambió).
Su arranque pasó del jue **3-sep** al lun **7-sep** y con eso **las exigidas bajaron de 86 a 85 =
sus pagadas**: hueco $0, mora 0, **salió de recolección**. Nunca debió nada; el sistema le contaba
mal el calendario. Los 4 días que quedaban por fuera (jue 3 a dom 6 = 3×$30.000 + $15.000 =
**$105.000**) entraron al acuerdo: $875.000 → **$980.000**, 16 → 18 cuotas, misma cuota de $55.000.
⚠️ **Y acá me equivoqué:** subí `deuda_total` **y** escribí la partitura a la vez. El disparador
`trg_convenio_ampliado` **escribe el renglón solo** cuando el total sube, así que quedó DOBLE
($1.085.000 en la lista contra $980.000 de total). Lo cazó la verificación y se corrigió.
🔑 **Al ampliar un acuerdo: subir el total y DESPUÉS corregirle la etiqueta al renglón que el
sistema crea — nunca escribir el propio encima.** Y toda revisión de una lista de acuerdo lleva la
comprobación de que **la suma de los renglones sea igual al total** (mirar que existan no basta).

**Pago movido de contrato — IEW59I → IEW65I** (19-sep). $162.000 digitados en la placa equivocada.
🔑 **No basta cambiarle el `contrato_id`:** los disparadores del motor son
`AFTER INSERT OR UPDATE **OF estado**`, así que un cambio de contrato **no los dispara** y el
reparto viejo se queda donde estaba. Va en tres pasos: **rechazar** (el motor deshace) → **cambiar
el contrato Y BORRAR todas las casillas `aplicado_*`** → **volver a confirmar** (reparte de cero).
⚠️ Sin borrar el reparto viejo, la base lo **respeta tal cual** (mig 045: solo re-reparte si TODAS
están en cero) y le copiaría al nuevo cliente el reparto del otro. Verificado: los $162.000 se
repartieron distinto en su dueño real ($112.000 a su semana + $50.000 a su acuerdo).

**YERLIS QUINTERO (XZN23H) — saldo a favor aplicado dos veces** (19-sep)
→ [[candado-saldo-favor-dos-clics]]. Doble clic de **dos personas** con 5 segundos de diferencia.
Se rechazó el segundo movimiento y **se cerró el agujero con la mig 160**.

## Cabos verificados que NO eran problema (no volver a levantarlos)

- **XZP35H con dos clientes activos** — falsa alarma. JESÚS DE HORTA la tuvo, se la recogieron y se
  reasignó a ALFREDO PERTUZ. **El freno está puesto**: `fecha_fin_cobro = 2026-08-27` con su motivo
  escrito, puesto por la mig 129. Su deuda viva es $0 y tiene **LIQ-0011 en `documento_generado`**
  (parada desde el 7-sep — eso sí hay que cerrarlo).
- **ALVARO JAVIER MONTES (DQW24I)** — perfecto, verificado peso por peso: $1.969.000 aplicados a
  semanas = 9 cajas + $151.000, exacto. Sus "$100.000 de saldo a favor" salieron del pago del
  22-jul 20:38: ya había completado las 12 semanas exigidas y **el motor no adelanta semanas
  futuras solo** (regla 5 del libro de cajas). Nada que arreglar.
- **JOHAN ANDRES PEREZ (RMW28H)** — el acuerdo SÍ se descontaba; lo que fallaba era la etiqueta
  vieja, arreglada el 16-sep. Cerró al peso. Se le aplicaron $195.000 de saldo a favor: $110.000 al
  acuerdo (las 2 cuotas que debía) y $85.000 a la semana siguiente.

## 🔲 Cabos que SIGUEN abiertos

**La lista completa y priorizada vive en `docs/PENDIENTES.md`** (en el repo, editable). Acá solo
los que salieron de estas correcciones:

- 🧑 **CESAR ESCUDERO (ZHO34G) y RAMON BARON (RLI25H)** — recién migrados, **les falta rodarles el
  tiempo** (anotado desde el 29-ago). Muestran 118 y 112 semanas consumidas contra las 104 del
  contrato. Igual que JORGE: **necesitan que el cliente venga** para reconstruir cuánto tiempo no
  tuvo la moto.
- 🧑 **ADOLFO GAMEZ (RLT70H)** — diario: **$297.000 sin atribuir** desde el 25-ago (sus pagos se
  registran siempre como $27.000 a tarifa y $0 a ahorro, pague lo que pague) y **ahorro congelado**
  desde el 19-ago. Decisión del dueño: se arregla a mano **al migrarlo a semanal**. ⚠️ Si se migra
  con el ahorro de la pantalla, el error viaja al contrato nuevo.
- **JOSE ENRIQUE CHIRINOS (IEW50I)**: $224.000 de semanas marcadas sin plata, sin atribuir. Su
  acuerdo ($483.500, 0 de 11 desde el 5-ago) es viejo y **sin partitura**.
- **8 acuerdos viejos sin lista de qué financian** → bloquean cualquier arreglo automático.
  Ojo: en algunos la lista se deduce sola (JOHAN: $965.800 de deuda + $195.000 de semana =
  $1.160.800 exacto). En esos se puede escribir sin sacar el papel.
- **LIQ-0011 (JESÚS DE HORTA)** parada en `documento_generado` desde el 7-sep.

## 🔑 La batería de coherencia (19-sep) — repetirla cada tanto

Diez chequeos sobre toda la flota; **la consulta completa está en el chat del 19-sep**. Encontró 3
problemas reales de 10 chequeos (y 2 falsos positivos míos: agrupé por placa cuando el candado de
convenios es por contrato, y los diarios llevan el ahorro FUERA de la tarifa).
Los que valen: **reparto que no suma el valor · lista del acuerdo que no cuadra con su total ·
saldo a favor negativo · cajas imposibles · dos contratos activos en una moto.**
🔲 Debería ser un aviso más de `public.pendientes`, no una consulta que alguien recuerde correr.

Relacionado: [[acuerdo-vencido-se-sigue-cobrando]] · [[liquidaciones-auditoria-y-huecos]] ·
[[bug-contador-sigue-corriendo-moto-reasignada]] · [[regla-esencia-y-rastro]]
