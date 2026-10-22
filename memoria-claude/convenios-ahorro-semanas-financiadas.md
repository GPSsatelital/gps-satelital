---
name: convenios-ahorro-semanas-financiadas
description: "13-ago-2026: las semanas metidas en un convenio nunca ganaban su ahorro (migs 096+097 ✅). Más el defecto de la semana a medio pagar, y la auditoría de 51 contratos con solo 1 error real."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-13T21:13:27.382Z
---

# Convenios: el ahorro de las semanas financiadas (13-ago-2026)

Pedido del dueño: *"las semanas que se meten en los convenios, una vez ya pagados, ¿se van a ir
repartiendo a lo que corresponde, de ahorros y de tarifas, en dónde van en sus tiempos?"*

**La respuesta era NO.** Verificado contra la **función VIVA de producción** (`pg_get_functiondef`),
no contra el repo: `v_ahorro_pago` solo suma en el paso 1 (prorrateo) y el 2 (cajas). El paso 4
(convenio) calcula `v_ap_conv` y **no toca el ahorro ni una vez**. Dos escépticos intentaron
refutarlo y no pudieron.

**Lo más injusto:** si el cliente pagaba esa MISMA semana atrasada en efectivo, sí ganaba sus
$26.000. Le salía **más caro el acuerdo de pago** que pagar de a poquitos.

## ✅ Lo que quedó construido

- **Mig 096** — `convenios` guarda su desglose: `monto_deudas` · `monto_semanas` · `ahorro_semanas`
  · `cajas_financiadas`. La pantalla YA lo calculaba y lo mostraba; solo guardaba la suma, así que
  después era imposible saber cuánto del convenio era semana. **Congelado, no calculado** (regla 10:
  si sube la tarifa, recalcular reescribiría la historia).
- **Mig 097** — disparador `trg_pago_convenio_ahorro`, **aparte**, que corre después del motor y
  solo suma la parte de ahorro. 🔑 **NO se tocaron las 250 líneas de `aplicar_pago_confirmado`** —
  la viva no es igual a la del repo (mig 083) y reescribirla por 6 líneas es la forma más cara de
  romper lo que funciona. Orden garantizado por nombre alfabético.
- **Nace SIN EFECTO**: solo actúa si `ahorro_semanas` existe, que es NULL en los 53 convenios
  viejos. Los nuevos ya nacen con desglose.
- **Regla de reparto = Opción B** (decisión del dueño): el ahorro se gana **a medida que paga**,
  no de golpe al final — así quien pagó $500.000 de $639.000 y se cae no pierde todo. Dentro del
  convenio: primero la deuda vieja, después las semanas; y dentro de la semana, tarifa primero.

## ✅ El otro defecto: la semana a medio pagar (commit `9624270`)

`primeraFinanciada = Math.min(hueco, cuota)` solo descontaba el abono parcial cuando el cliente
debía **menos de una semana**. Con dos o más atrasadas se quedaba con la semana entera.
**NESTOR (YAL67H):** debía 2 semanas con $14.000 abonados a la más vieja → convenio por $202.000
cuando faltaban $188.000. Y el aviso *"le quedan $X sin cubrir"* salía corrido por esos mismos
$14.000.

Se mudó a **`cicloPago.financiarSemanas()` con 13 pruebas** (cifras reales de NESTOR y ALBERT).
Vivía suelto dentro del componente — por eso pudo separarse del resto sin que nadie lo notara.

## 🔴 La auditoría: 51 contratos con diferencia, UNO solo era error

**Lección grande: mis dos verificadores tenían punto ciego.** Comparaban el contador contra la suma
de pagos, pero **el contador se mueve sin plata** en dos casos legítimos: cuando un convenio marca
semanas, y cuando alguien repara a mano por SQL. Casi todas las "diferencias" eran eso.

- ❌ **Los $173.000 de "descuadre del motor" NO eran reales.** Descartados. Menos mal que el
  diagnóstico fue antes que la reparación.
- ✅ **CARLOS ALBERTO (IGC31I) — $202.000 reales.** Causa: el 12-ago 19:30 se borró un pago de
  $202.000 Confirmado. Sus 4 pagos suman $808.000 = 4 semanas exactas y el contador decía 3.
  **Reparado** → al día.
- ✅ **JHEINER (IEW47I) — los $109.000 eran falsa alarma.** Los explican dos reparaciones a mano
  del 23-jul que movieron plata de "semana" a "prorrateo". Pero salió algo real y chico: los
  **$14.000 de ahorro del prorrateo** nunca se acreditaron (mover plata a mano no genera ahorro).
  **Repuesto** → $144.000.

## ✅ La fecha límite quedaba corta (commit `1428d0c`)

Se contaba avanzando N días de pago **desde la firma**, sin descontar las semanas financiadas —
pero durante esas semanas el cliente no paga nada, así que la primera cuota cae después.
**Consecuencia: `marcar_convenios_vencidos()` lo marcaba INCUMPLIDO antes de terminar de pagar**,
y 3 incumplidos = liquidación obligatoria.

**13 convenios corregidos** (todos 7 días cortos; MARTHA 14 por financiar 2 semanas). Los primeros
en caer eran JUAN DAVID CASTILLA y ALBERT, el 14-sep. Corregido en código y en los 13 datos.

## ✅ Ampliar convenio cobraba doble — mig 098

`ampliarConvenio` sube `deuda_total` pero **nunca toca `deudas`**, y el disparador que las marca es
`after INSERT` — al ampliar no corre. La deuda quedaba `pendiente` **y** dentro del convenio →
cobrada dos veces. **Nadie había usado el botón todavía**: se arregló antes de que costara plata.

**Regla del dueño:** se marcan **de la más vieja a la más nueva HASTA CUBRIR el monto agregado**,
no todas — marcar todas perdonaría plata que nadie metió al convenio. Las que no caben completas se
saltan. Va en la BD para que cubra cualquier ruta, no solo el botón.

## 🔨 NESTOR reestructurado por SQL (13-ago) — FIRMA PENDIENTE

El dueño creía que el convenio del 12-ago le cubría la semana en curso. **No: cubría solo la del
3-ago.** Se financió UNA semana teniendo DOS vencidas, y el sistema tapa la más vieja (correcto,
por diseño). Es la **tercera vez** que aparece esta confusión (NESTOR, ALBERT, y otra vez NESTOR)
— el aviso del formulario existe pero **no está aterrizando**.

Se rehízo por SQL porque el cliente no podía venir a firmar:
`$203.000 → $391.000` ($188.000 la semana del 3 + $202.000 la del 10 + $1.000 de deuda),
cuota **intacta en $48.000** (subirla sin él presente sería cambiarle el trato), 5 → 9 cuotas,
cubre hasta 17-ago, límite 12-oct. **Debe hoy $0**; el lunes 17 paga $250.000.

Total que paga: **baja** de $405.000 a $391.000 — se le corrigieron los $14.000 del sobrecobro.

**Firma NO pendiente — decisión del dueño (14-ago):** se deja el papel viejo. La cuota semanal no
cambió ($48.000) y el total le BAJÓ, así que no se le cobra más ni se le exige distinto semana a
semana. Lo único que cambia es que termina el 12-oct y no el 14-sep. **Basta con avisarle** cuando
venga a pagar o mandarle el estado de cuenta por WhatsApp. No vale la pena perseguirlo para firmar;
lo que sí hay que evitar es que se entere el último día.

**Detalle técnico que sirve para el próximo:** borrar el convenio en la app **habría regalado
$188.000** — el delete restaura la deuda pero NO las cajas, porque el retrato viene en null desde
la mig 082. Se resolvió **reponiéndole el retrato** (`cajas_pagadas_previas` 6 ·
`caja_actual_pagado_previo` 14.000 · `marcadas`) en vez de parchar el contador a mano: así el
mecanismo de deshacer vuelve a funcionar solo.

## ✅ El retrato volvió + el aviso con fecha y monto — mig 099

**La regresión:** la mig 067 guardaba el retrato del contador para poder deshacer un convenio; la
**082 lo borró al reescribir la función completa** para arreglar otra cosa. Desde el 5-ago ninguno
era reversible. Se detectó al ir a rehacer el de NESTOR: **borrarlo le habría regalado $188.000.**

Devueltas las 5 líneas. Y para los ~52 viejos sin retrato, **el borrado se BLOQUEA** con mensaje
claro — su retrato no se puede reconstruir y adivinarlo sería peor. Un convenio que nunca marcó
semanas se borra sin problema.

**El aviso de la ventana** ahora dice fecha y monto justo antes de guardar: *"queda en $0 hasta el
lunes 17; ese día paga $250.000"*. El viejo decía "trae 2 semanas vencidas" — en abstracto y arriba
de todo. La confusión se repitió **3 veces en un día** y arreglar un caso costó SQL, un papel
firmado inservible y una firma pendiente.

## ✅ 14-ago: BARRIDO COMPLETO de los convenios pre-082 — 7 clientes, $1.588.000

El defecto de ALBERT (convenio que financia semanas futuras y el disparador viejo no las marca)
se buscó en TODOS los convenios firmados antes del 5-ago. **28 candidatos, solo 7 con el defecto**
— en los otros 21 la cobertura caía dentro del mismo período y el disparador alcanzó a marcarla.

🔑 **La fórmula que los detecta:**
`cajas_exigidas(contrato, cubre_periodo_hasta − 1) − cajas_exigidas(contrato, created_at)`.
Reprodujo sola la reparación que a ALBERT se le había hecho a mano el día anterior.

🔑 **Cómo se verificó cada uno (vale para el próximo barrido):** se rehace el reparto pago por pago
y **se compara el AHORRO**. Si el ahorro que registró el sistema coincide con el reconstruido, la
simulación es correcta. Cifras raras como los **$6.000 de MARTHA** (semana que venía con $5.000
puestos y se completó en dos pagos) son las que más confirman — no salen por casualidad.

| Cliente | Placa | Semanas | Contador | Quedó |
|---|---|:-:|---|---|
| MARTHA ALVAREZ | RLT68H | 2 | 53→55 | **al día** |
| DANIEL MILLAN | RLT87H | 1 | 53→54 | **al día** |
| ANDRES ESPINOZA | DQL84I | 1 | 15→16 | **al día**, convenio 1 de 11 |
| ALBERT DEL CRISTO | YAL59H | 1 | 25→26 | (13-ago) |
| LUIS FERNANDO SILGADO | XZO26H | 1 | 28→29 | debe $133.000 |
| LUIS ANGEL PUA | RLZ96H | 1 | 26→27 | debe $262.000 |
| JOSE LUIS LOPEZ PONCE | RMZ68H | 1 | 40→41 | debe $590.000 |

**Regla que se aplicó:** se acredita la semana que el acuerdo compró; **no se re-reparten pagos
viejos**. Excepción: ANDRES, donde sí se movieron $98.000 de tarifa a convenio porque su acuerdo
iba en 0 de 11 y encaminaba a incumplido. Ninguno necesitó firma nueva — el monto no cambió.

**Los tres que siguen debiendo es deuda real, no del defecto.** JOSE LUIS es el más atrasado
(2 semanas + 2 cuotas) y merece mirada aparte.

## 🔨 JORGE BELLO (RLT88H) — error humano, no del sistema

Su convenio del 4-ago se hizo por **0 semanas** cuando él traía una vencida. **El sistema hizo lo
correcto** — el `cubre_periodo_hasta` venía en null. Fue una escogencia del funcionario.

Reestructurado por SQL: **$587.000 → $682.000** (se le metió lo que faltaba de la semana del 10,
$95.000), cuota intacta en $100.000, 6 → 7 cuotas, cubre hasta 17-ago, límite 28-sep. **Debe $0**;
el lunes 17 paga $295.000. **Firma NO pendiente** (misma decisión del dueño: cuota intacta en
$100.000, misma plata, solo termina el 28-sep en vez del 14-sep — se le avisa y ya).

**Decisión del dueño:** dejarlo en $0 y no en $100.000, porque cobrar la cuota de una semana
absorbida contradice su propia regla del 7-ago y obligaría a escribir datos que se contradicen
(el contador diría cubierta y la fecha diría que no).

## 🔴 LO QUE ESTO DESTAPÓ, y es lo más importante del día

**No existe ninguna forma de mandar un pago al convenio.** El motor reparte siempre
semanas → deudas → convenio, y `pagos.convenio_id` **no es una instrucción: se pone solo** cuando
el contrato tiene convenio activo (verificado en las 3 rutas de registro). Es solo una etiqueta de
"se pagó mientras este convenio estaba vigente".

**Consecuencia:** mientras el cliente esté atrasado en semanas, su acuerdo **nunca avanza** —
JORGE iba 0 de 6 y ANDRES 0 de 11 pagando cada semana. Y al llegar la fecha límite el sistema los
marca **incumplidos**; 3 incumplidos = liquidación.

🔲 **Decisión de negocio pendiente del dueño:** ¿debería poder dirigirse un pago al convenio aunque
el arriendo quede debiendo? A favor: el cliente cumple lo que firmó. En contra: el arriendo es lo
que produce la moto.

🔲 **Y un cambio chico propuesto, sin aprobar:** que el formulario del convenio **arranque con las
semanas vencidas ya escogidas** en vez de en 0. La confusión se repitió **cuatro veces en dos días**
(ALBERT, NESTOR ×2, ANDRES, JORGE) y siempre por lo mismo: hay que acordarse de meterlas.

## ✅ 14-ago: el ESTADO y el MONTO contaban el acuerdo distinto (commit `620c7bd`)

**Encontrado mirando la pantalla**, no el código. DANIEL MILLAN (RLT87H) salía con `Al día · $0` y
al lado `✕ Mora · P4: RECOLECCIÓN FÍSICA` — **en la cola de recolección sin deber un peso**. Barrido
de los 281 contratos: era el único.

**Causa:** dos cuentas del mismo hecho. El MONTO (`loQueDebe`) usaba el **arrastre** — todo lo
abonado desde que se firmó el acuerdo. El ESTADO (`calcularEstadoCartera`) miraba **solo los pagos
de la semana en curso**. DANIEL llevaba $61.000 contra una cuota de $33.500, pagados el 1 y el 8 de
agosto: para el estado no existían.

**Es el mismo defecto de LIBINTO (13-ago) pero al revés:** allá mentía el monto, acá el estado.

La cuenta se extrajo a **`faltaDelAcuerdo()`** y ahora la usan las dos. Se pasa el convenio en los
**7 puntos** que lo tenían a la mano (alertas, dashboard, inmovilizaciones, motos, reportes, y
`diasEnMora` en sus dos llamadas — sin eso seguiría contando días de mora y entrando a recolección).
Sin convenio se conserva el comportamiento viejo. **4 pruebas con sus cifras reales.**
⚠️ **Falta verlo en pantalla** — al recargar se cerró la sesión.

🔴 **Y me faltó una pantalla: la de Cartera** (commit `2ed7894`). El arreglo llegó a 5 sitios y se
saltó justo el que el dueño estaba mirando. **Causa: `CobrosView` importa la función con OTRO
NOMBRE** (`calcularEstadoCartera as calcularEstadoCarteraCiclo`), así que el grep por
`calcularEstadoCartera(` no la encontró.

> **LECCIÓN PARA TODO BARRIDO:** un import con alias esconde el sitio de una búsqueda por nombre.
> Al preguntar "¿quién usa esta función?" hay que buscar TAMBIÉN `NombreFuncion as `.

**Cobro Diario NO se tocó:** llama la función sin `cuotaConvenio`, o sea que allí el convenio nunca
contó para la mora. Cambiarlo movería el estado de muchos clientes — decisión aparte.

## ✅ 14-ago: la cuenta bancaria SÍ se está guardando (falsa alarma mía)

El dueño preguntó si ya se especifica a qué cuenta entra cada pago, sobre todo en **COSTA que tiene
DOS** (Bancolombia 78400006116 y Nequi 3128317132; PRADERA y RASTREADOR tienen una cada uno).

**Respuesta: sí, y funciona.** Desde el **7-ago el 100%** de las transferencias quedan con su
cuenta — 175 seguidas. El ~40% sin cuenta que yo vi **era el arranque de la función (1 al 6-ago)**,
no un defecto. **Lección: mirar el corte POR DÍA antes de declarar un hueco** — el promedio mensual
mezclaba el antes y el después.

Queda histórico sin cuenta: **157 transferencias de agosto (~$25M)** y todo julio (la columna no
existía). Solo importa si hay que auditar esos días contra el extracto.

🔲 **USADAS no tiene ninguna cuenta registrada** — si un cliente de ese grupo transfiere, no hay a
cuál mandarlo. Decisión pendiente del dueño.

## ✅ 14-ago: quién registró el pago (commit `87cb92a`)

**Ninguna de las 343 transferencias de agosto guardaba `registrado_por`.** Una sola puerta lo
causaba: la **ventana de pago de Cartera**, la única que no lo pasaba. Cobro Diario, Clientes e
Inmovilizaciones sí — fue olvido, no decisión, y por Cartera entra casi todo.

Plata que llega por banco y que alguien cuadra contra el extracto: sin ese dato, un pago mal metido
no tiene a quién preguntarle. **Ya lo guarda. Los 343 de atrás no se recuperan.**

## 🔲 Lo que quedó pendiente

1. **Los 53 convenios viejos** necesitan que se les llene el desglose para que el arreglo los
   alcance. **Uno por uno contra su acuerdo firmado, nunca a ciegas.** Hoy solo 2 tienen ahorro ya
   ganado sin acreditar: DENILSON (RLY54H) y JUAN ANDRES MESTRA (XZZ70H), **$26.000 cada uno**.
   ⚠️ La exposición total es ~$2.000.000 — es lo que se deberá **cuando terminen de pagar**.
   **Hoy cuesta $52.000 arreglarlo; en seis meses cuesta los $2 millones.**
2. 🔴 **`eliminarPago` no guarda a qué se había aplicado el pago** (`usePagos.ts:371`) — solo el
   monto. **Un borrado de plata no se puede auditar ni deshacer.** Fue lo que impidió reconstruir
   con certeza el caso de CARLOS.
6. **La liquidación sigue siendo una foto, no una cuenta** → ver [[liquidaciones-auditoria-y-huecos]].

## La idea del dueño que cambió el plan (vale para todo el sistema)

Él lo dijo así: *"al liquidar primero se cobra la tarifa y lo que les quede es su ahorro… las
matemáticas siempre darían lo mismo, es como tú lo veas"*.

**Tiene razón, y reencuadra el problema.** El ahorro hoy es un **contador** que hay que alimentar a
mano en cada uno de los 5 caminos por donde entra plata; el del convenio se olvidó y nadie se
enteró en meses. Su regla es una **fórmula** — y una fórmula no se puede olvidar.

> **Lo correcto a futuro: que el ahorro se DERIVE de lo que pagó menos la tarifa que consumió, en
> vez de mantenerlo como un acumulador.** Y sobre todo, que **la liquidación** haga esa cuenta —
> es el único momento en que la plata cambia de manos de verdad.

Ver [[cartera-cuanto-debe-una-sola-funcion]] · [[cesion-dpu50i-hecha-a-mano]] · [[regla-no-romper-lo-que-funciona]].
