---
name: mapa-financiero-y-partitura
description: "Auditoria financiera completa 23-ago (docs/MAPA-FINANCIERO.md) — el convenio es bolsa opaca, deudas en_convenio nunca pasan a pagada, y la solucion es la PARTITURA. 3 decisiones pendientes del dueno (nomina paquete, candado, partitura)."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-27T21:19:11.147Z
---

# El mapa financiero y la PARTITURA del convenio (23-ago-2026)

## 🔨 EL TOPE DEL PAQUETE — PASOS 1 y 2 HECHOS (29-ago). ⚠️ **LA MIG 119 ESTÁ SIN CORRER**

**Lo disparó el mismo DANIEL MILLÁN (RLT87H), otra vez.** Pagó el **sábado 29** sus $230.000 de
siempre (su día es LUNES) y el motor repartió: **tarifa $0 · convenio $230.000** — 7 cuotas de
golpe, y el lunes 31 apareciendo en mora habiendo pagado dos días antes. Su convenio quedó en
**10 de 16 cuotas** cuando le tocaban ~4. El saldo a favor de $17.000 que le aplicaron ese día
cayó en la misma trampa.

**LA CAUSA, dos huecos que se suman** (verificado leyendo la función VIVA con `pg_get_functiondef`,
que coincide con la mig 045):
1. El paso de las **cajas TIENE freno** (`cajas_pagadas < cajas_exigidas`); el del **convenio NO
   TENÍA NINGUNO**: recibía hasta TODO su saldo pendiente. La plata que las cajas rechazan cae al
   único balde sin tope.
2. `cajas_exigidas` se preguntaba con la fecha EXACTA del pago — el sábado, la caja del lunes aún
   no estaba exigida, aunque fuera justo la que estaba pagando.

### ✅ PASO 1 (`e51f2a1`) — la fotografía, sin cambiar un peso
`src/utils/repartoPago.ts`: espejo en TS del motor v2 (el reparto vive en plpgsql y `npm test` no
lo puede correr; sin espejo, cualquier cambio se prueba sobre la plata de los clientes). 17
pruebas con el contrato REAL de DANIEL: las 🔴 fijaban el defecto, las demás lo que YA funciona.
🔑 **Y la red sirvió de inmediato:** al implementar el paso 2 saltaron y destaparon un **choque
entre dos reglas del dueño** que yo no había visto (ver abajo).

### ✅ PASO 2 (`a2cdf89`, mig **119 SIN CORRER**) — el freno + la ventana
- **Ventana de prepago (3 días):** las exigidas se preguntan 3 días ADELANTE de la fecha del pago.
  Pagar el sábado la semana que arranca el lunes es pagar a tiempo, no adelantarse.
- **El freno:** el convenio solo recibe **lo EXIGIDO menos lo ya abonado**. Ponerse al día NO es
  adelanto — la cuenta es acumulada, así que cubre todas las cuotas atrasadas de una.
- **`cuotas_convenio_exigidas()` es NUEVA en SQL.** Esa cuenta **solo existía en la pantalla**
  (`periodosConvenioExigidos`, cicloPago.ts) y por eso el motor no podía frenar nada. Anclada al
  MISMO reloj que `cajas_exigidas`: si contara sus períodos por su lado podría exigir 3 cuotas
  mientras las cajas exigen 2 semanas, y el paquete dejaría de ir parejo.
- La función se recreó COMPLETA desde la leída viva; el resto queda idéntico línea por línea.
- Espejo TS con 22 pruebas (407 en total).

### 🔴 LO QUE SE DESCARTÓ, y por qué importa
El dueño propuso que el excedente **adelantara el paquete siguiente** (semana + convenio). Lo
implementé — y **las pruebas del paso 1 saltaron**: rompía DOS reglas suyas, y no solo para
DANIEL sino para los **~190 clientes sin convenio**:
- *"el excedente NO llena cajas futuras"* (el freno de las cajas, meses funcionando);
- *"el saldo a favor se MUESTRA, nunca se resta solo — se aplica a mano"* (12-ago).
Se le presentó el choque y **eligió la ventana de prepago**: resuelve el caso real (DANIEL no
estaba adelantando por gusto, pagaba su paquete de siempre dos días antes) sin tocarle el modelo
a nadie. 🔑 **La lección: una idea que suena bien puede chocar con una regla vieja del propio
dueño. La batería del comportamiento actual es lo que hace visible ese choque ANTES de romperlo.**

### ✅ PASO 3 — LOS 16 CUADRADOS (1-sep). Mig 119 **CORRIDA**

Barrido: **18 clientes con plata de más en el convenio, $1.911.000**. Se corrigieron 16
re-repartiendo sus pagos con el motor (no con cuentas a mano): revertir → limpiar los aplicados →
re-confirmar en orden → aplicarles el saldo que quedó. Quedan 5 a propósito: **DPU50I** (la cesión
hecha a mano) y **DPU58I** (el de la partitura), más DANIEL $8.000, DQG99I $6.000 y DQL78I $2.000
— montos que se compensan solos.

**DANIEL (RLT87H):** su pago del 29-ago pasó de `convenio $230.000 / tarifa $0` a
`tarifa $195.000 / ahorro $26.000 / saldo $35.000`. Recuperó el ahorro que perdía.

### 🔍 YESID (RLT72H) — el dueño desconfió y tenía razón

Dijo *"me parece que nunca ha pagado nada del convenio"*. **Cierto: cero abonos.** Y la causa no
es del reparto: **su semana vale $235.000 y él paga $234.000**. El convenio se cobra DESPUÉS de la
semana, y como su pago nunca la llena, nunca sobra un peso. Lleva 6 pagos así.
El único abono que el convenio registraba eran $234.000 del 18-ago — y eso era **el defecto**:
plata de su semana. Al poner el freno, el convenio volvió a su realidad: **cero**.
🔑 **Su paquete real es $295.000** ($235.000 + $60.000). Paga $61.000 menos cada semana.

**Sus $234.000 a favor** son una semana que pagó DOS veces: en efectivo el 18-ago, cuando su
convenio (firmado el 19) ya la había asumido por dentro. Nadie se lo explicó al armarle el acuerdo.
**Y el descuadre de $238.000 que encontré al revisarlo NO era un error:** es exactamente lo que el
trigger `convenio_marca_contemplado` asume cuando el convenio financia semanas ($3.000 para
completar una + $235.000 de otra). Mi fórmula de cuadre no lo contemplaba.

### 🔑 TRES TROPIEZOS DE MÉTODO, todos míos

1. **`cannot cast type record to convenios`** (`80674cf`). El motor reventó en el primer pago con
   convenio: `v_convenio` es `record` y mi función pedía `public.convenios`. **Es el MISMO tropiezo
   que dio `caja_valor()` el 11-jul con `contratos`** — estaba anotado en [[migracion-costa-siembra]]
   y no lo apliqué. Fix: `v_conv_tipado public.convenios` y releer la fila con su tipo.
   ⚠️ Dejó el motor roto para TODO cliente con convenio hasta correr la corrección.
2. **`begin;` sin `commit;`** — la corrección de EMERSON (XZZ68H) se vio bien en pantalla y **se
   revirtió sola**. Es la regla de PRADERA otra vez: *el script completo, con su `COMMIT;`, se
   ejecuta de una sola vez*. Los bloques sin `begin` (autocommit) sí guardaron.
3. **El candado de pagos me atajó.** Mi bloque, cuando el saldo no tenía dónde aplicarse, intentaba
   BORRAR el movimiento recién creado — y `enforce_eliminar_pago` lo prohibió, con razón. Por eso
   3 clientes quedaron sin corregir en la corrida masiva. La solución correcta no era forzar el
   borrado sino **mirar ANTES si hay algo que cobrar** (cajas + deuda + convenio exigido) y no
   crear el movimiento si no. 🔑 **Cuando un candado del sistema te frena, casi siempre el
   equivocado es el script.**

### 🔲 LO QUE FALTA
1. **DPU50I y DPU58I** — los dos casos especiales, con el dueño mirando.
2. **Hablar con YESID**: su cuota real es $295.000, no $234.000.
3. **Saldo a favor VISIBLE en la lista** (decidido 29-ago, sin construir). El dueño pidió
   aplicarlo automático; se le recomendó NO hacerlo (taparía pagos mal registrados, el cliente
   no se entera, y un defecto futuro pegaría a todos a la vez — el botón ya tuvo uno en julio
   que inflaba la caja). **La causa real es que el saldo a favor SOLO se ve al abrir la ficha**;
   en la lista de cobro no hay ninguna marca, por eso queda olvidado. Acordado: marcarlo en la
   lista y en el panel Hoy, con el botón de aplicar ahí mismo.

## 🔴 REGLA NUEVA DEL DUEÑO (24-ago noche): "TODO SE PAGA PAREJO — semana + convenio"

Textual: *"el sistema no debe adelantarse un convenio así; todo debe ser pagado por parejo,
semana + convenio"*. El convenio solo puede recibir lo EXIGIDO (cuotas acumuladas con arrastre —
ponerse al día NO es adelanto); el excedente va a saldo a favor (aplicación manual), igual que
las semanas. Adelantar el convenio solo por decisión explícita.
**🔲 EL TRABAJO DE LA PRÓXIMA SESIÓN: el TOPE en el motor de reparto** (aplicar_pago_confirmado,
mig 045 — la pieza más delicada): topar el paso del convenio a lo exigido. Método obligatorio:
batería de pruebas del comportamiento ACTUAL primero, función leída VIVA (pg_get_functiondef),
espejo SQL↔TS de la exigencia del convenio con pruebas en ambos lados. NO es parche de una noche.

### El caso que la parió — DANIEL JOSÉ MILLÁN (RLT87H), ✅ CORREGIDO 24-ago

Su convenio del 1-ago ($737.000, "Excel viejo", 22×$33.500) tenía DOS errores de armado:
1. **La semana del 10-ago estaba DOBLE**: dentro de la meta ($390.000 = 2 semanas metidas "para
   que pagara adelantado") pero `cubre_periodo_hasta=2026-08-10` solo cubrió UNA (la del 3-ago)
   → la del 10 se siguió exigiendo como semana normal y la pagó con plata el 8-ago. Habría
   pagado $195.000 de más.
2. **La cuota real pactada era $35.000** (paga $230.000 redondos = 195+35); el funcionario dejó
   el 33.500 del cálculo automático del modal.
El pago del 15-ago ($230.000) se fue TODO al convenio (las cajas exigidas estaban cubiertas) →
8 cuotas "pagadas" cuando le tocaban 3, y su semana del 17 pagada tarde → un cliente juicioso
pareciendo deudor. **Corrección aplicada y verificada**: total 542.000 (deuda 347.000 + semana
del 3-ago 195.000) · cuota 35.000 · 16 cuotas · pago del 15 reclasificado parejo (195.000
semana + ahorro 26.000 + 35.000 convenio) · cajas 56 · ahorro +26.000 · auditoría completa.
**Y el REMATE (2º ajuste, mismo día):** el pago del 24-ago ($230.000, el paquete exacto) el
motor lo mandó todo a semanas — $35.000 ADELANTABAN la semana del 31 mientras el convenio
quedaba $9.000 corto (el defecto del tope POR EL OTRO LADO: adelanta semanas futuras antes del
convenio exigido — el tope del motor debe cubrir AMBOS lados). Repartido parejo: 3 cuotas
completas + $26.000 acumulados, caja del 31 en $0, pantalla "Al día · $0". Verificado.
Pendiente del dueño: partitura (2 renglones: 347.000 + 195.000) + avisarle (WhatsApp basta).
Su plata total $1.080.000 quedó repartida sin un peso doble. Defecto menor anotado: el "próximo
pago" sale con dos montos en la misma pantalla (recuadro azul = paquete completo; texto =
descontando abonos de la caja próxima) — barrido de etiquetas pendiente.

## ✅ LOS 7 CONVENIOS DE BASE INICIAL INFLADOS — CERRADO (25-ago)

**Lo destapó el dueño con MARLON MUÑOZ (RNG53H):** "le está cobrando 510 donde debía cobrar 308".
Barrido: **7 de 15 convenios de base inicial inflados, $1.616.000 en total.** La firma del defecto
es exacta — los 7 afectados tenían `cubre_periodo_hasta` con fecha y los 8 sanos lo tenían vacío:
se marcó **financiar 1 semana** (2 en OSVALDO YAL57H) dentro del convenio, y esa semana YA venía
pagada con la base (el pago `adelanto_base`). Que XZP35H y RNG53H sean del MISMO día con distinto
resultado probó que no era automático: era el selector, que el sistema no debía ofrecer ahí.

**Arreglo de código (`f98d190`):** `sinFinanciarSemanas` en ModalConvenio, activa en el convenio
obligatorio del wizard. Un contrato recién nacido tiene su primera semana pagada por definición.

**Datos corregidos (los 7, con auditoría):** convenio a $308.000, sin semanas financiadas, cuotas
recalculadas, `fecha_limite` −28 días, partitura escrita, y a los 4 que tenían una caja marcada sin
plata (RNG53H, DQL81I, IGC39I, YAL57H) se les devolvió.

**El segundo defecto, más fino, que salió al revisar MARLON:** su pago del 20-ago se fue casi todo
al CONVENIO y su semana quedó en $0 — porque la semana figuraba financiada. Resultado: un cliente
juicioso apareciendo deudor. Revisados los 7 uno por uno: **DPW33I, IEW57I y RMZ59H estaban bien**
(su plata sí fue a cajas); **RNG53H, DQL81I, IGC39I y YAL57H** tenían plata en el balde equivocado
y se repartió PAREJO (semana primero, resto al convenio), con su ahorro de $26.000 por caja llena.
GERMÁN (IGC39I) había pagado el paquete EXACTO ($202.000 + $48.000) y el sistema lo mandó todo a
un balde — quedó al día. Verificado en pantalla: MARLON pasó de $404.000 a **$311.000** exactos.

🔑 **Esto es la prueba viva de por qué falta el TOPE DEL PAQUETE en el motor** (el trabajo grande
agendado): mientras el reparto pueda mandar la plata al balde equivocado, estos desacomodos se
repiten. Los 7 casos son el mismo defecto visto desde dos ángulos.

🔲 **Pendiente del dueño:** avisarles a los 7 que su convenio bajó a $308.000 (es a su favor;
con el estado de cuenta por WhatsApp basta, como se decidió con NESTOR y JORGE).

## ✅ CONVENIO POR SEMANAS EN MORA (25-ago, `0133ddb` + `1c042e5`) — con lección

Cartera no dejaba convenir a un cliente EN MORA de semanas si no tenía deudas registradas
("No hay deudas pendientes para crear un convenio") — el convenio existe justo para financiar
semanas atrasadas. Fix del gate: abre si hay `debe.cuota.falta > 0` **o** deudas.
🔴 **La lección (defecto que introduje y el dueño cazó en minutos):** de paso le pasé al modal
`metaFija = semanas + deudas`… y el modal YA suma las semanas aparte con su selector → la
semana se cobraba DOS VECES (YAL54H YAIR DIAZ: "Deuda $199.500 + 1 semana $199.500 = $399.000"
por UNA semana). **El propio comentario del ModalConvenio lo advertía** (línea ~246: "cuando
viene metaFija el monto ya trae lo atrasado adentro, y sumarle semanas encima lo cobraría dos
veces") y no lo leí antes de editar. Corregido: sin `metaFija` — meta = deudas registradas,
semanas por el selector (que se auto-marca en las vencidas), como las otras 3 puertas.
**VERIFICADO EN NAVEGADOR** (el acceso se liberó el 25-ago): YAL54H muestra "Deuda $0 + 1 semana
$199.500 = TOTAL $199.500" ✓.

## ✅ LAS PUERTAS DEL CONVENIO, IGUALADAS (27-ago, `f892cd3` + `0a01c06`)

Cierre del defecto de arriba, pero **por el lado que faltaba mirar**: al revisar las otras puertas
se encontró que **Inmovilizaciones seguía pasando `metaFija` con las semanas adentro** — el mismo
cobro doble que se había corregido en Cartera, vivo en otra pantalla. El dueño lo describió antes
de que apareciera en el código: *"las cuentas por inmovilizaciones a veces no coinciden con las de
cartera… cobraba como dos veces la misma semana, y aparecía en la casilla 0 y el otro en la 2"*.

**Arreglo:** las dos puertas ahora **suman igual y se ven igual** (`metaTraeSemanas` /
`sinFinanciarSemanas` como props explícitas del ModalConvenio, en vez de que cada puerta adivine).
Y `0a01c06`: el **pre-paso del tiempo guardado** (decidir cobrar/rodar antes de firmar) se colaba
por Cartera — quedó también en esa entrada.

🔑 **La regla que esto deja escrita:** cuando se arregla un cobro doble, la pregunta obligatoria no
es *"¿quedó bien la pantalla?"* sino **"¿todas las puertas hacen lo mismo?"**. Fueron 4 puertas y el
defecto vivía en la que no se revisó. Ver [[regla-no-romper-lo-que-funciona]].

## ⚠️ LA MIG 115 ESTABA MARCADA "CORRIDA" PERO LA BD NO LA TENÍA (25-ago — re-aplicada ✅)

ANGELA no podía cerrar una liquidación: "Could not find the function cerrar_liquidacion(...5
params...)". La 115 figuraba corrida el 22-ago pero la función de 5 parámetros NO estaba en la
base — el cierre de ANTONIO funcionó porque fue con la app anterior (4 params); el hueco mordió
cuando la app nueva llamó con 5. **Re-aplicada el 25-ago con verificación pegada de vuelta**
(firma de 5 params confirmada) + `notify pgrst, 'reload schema'`. Refuerza la regla: migración
al repo Y a Supabase, SIEMPRE con la verificación de vuelta — "corrida" sin verificación no vale.

## ✅ EL TOPE DE LAS 1.000 FILAS (25-ago, `ce25207`) — resuelto de raíz

Supabase entrega máximo 1.000 filas por consulta SIN avisar. `pagos` las cruzó el **12-ago**
(hoy: 1.459 filas) → durante 12 días la app vio solo los 1.000 más recientes: historial del mes
cortado (reporte del dueño 25-ago), los "4 pagos que faltaban" de XYZ54H (misterio del 24-ago,
RESUELTO: eran sus pagos de julio caídos del tope), y sumas de pantalla cortas para clientes con
pagos de julio (saldo a favor, arrastre de convenios de julio, "por pagos" del ahorro). La plata
de fondo (motor/contadores) nunca se tocó; los casos corregidos estos días fueron por SQL directo
(sin tope) — sólidos. **Fix:** `createTableStore` pagina con `.range()` en tandas de 1.000 hasta
traer todo (todas las tablas, con guard de secuencia por tanda). Ojo de tarea: reclamos de
saldo-a-favor/cifras raras entre el 12 y el 24-ago merecen re-mirada con la app ya completa.

## ⏭️ LOS CASOS VIVOS DEL 24-AGO (retomar acá — detalle que el índice no carga)

1. **JUAN CARLOS LEAL (YAL68H)**: guardada desde el 5-ago por mora. Paso a paso entregado: multa
   ($20.000, no se rueda) → Inmovilizaciones → Entregar → el modal de rodar sale SOLO (nuevo para
   mora) → "Rodar 2 períodos" (corre también 2 cuotas del convenio de $58.000) → firmar en
   pantalla → su cuenta baja de $1.176.000 a $656.000 (2 semanas + 4 cuotas + multa). ⚠️ Falta
   confirmar que lo hicieron. Su renglón "Cuota del convenio $58.000" en el detalle de cobro
   ENGAÑA: el total suma el arrastre completo (6 cuotas, $348.000) — defecto de etiqueta tipo
   LIBINTO, anotado SIN arreglar.
2. **JOSUE (RML59H)**: inició HOY el cambio de moto — el ESTRENO del circuito completo. Verificar
   cómo quedó cada paso (liquidación con corte al día de entrega, firma, cierre 3 destinos,
   claim del wizard, contrato viejo Finalizado).
3. 🔴 **Convenios del wizard INFLADOS (a medio investigar):** ~6 casos "ficha $202.000 + convenio
   $510.000": RNG53H (MARLON, el del dueño), DPW33I, IEW57I, RMZ59H, DQL81I, IGC39I. OJO:
   DQL81I e IGC39I tenían ficha Y alcancía en $202.000 y el convenio IGUAL salió inflado — la
   causa NO está confirmada (el código del wizard resta bien HOY; ¿ficha llenada DESPUÉS de crear
   el convenio? ¿meta editada?). Investigar fechas (cliente.created_at vs convenio.created_at)
   ANTES de corregir los 6. El fix "wizard lee la alcancía (saldoBaseDeCliente) si hay
   movimientos, si no la ficha" quedó PROPUESTO sin implementar. Tampoco existe el botón
   "Abonar a la base" (la alcancía no tiene puerta después del registro).
4. **JUAN CARLOS: ✅ AJUSTADO por SQL** (24-ago, verificado: 2 exoneradas contrato + 2 convenio,
   fin 2028-03-02, límite 12-oct, acuerdo + auditoría; PENDIENTE subir su acta firmada en papel).
   La causa de que el modal no saliera: **la entrega la hizo su SUBADMIN** (el modal es solo
   ADMIN/AP — diseño correcto: la decisión es del admin). El arreglo de fondo (`f0498be`):
   **botón "⏱️ Resolver tiempo guardado" en el detalle del contrato** (ADMIN/AP, Activos) —
   fechas reales → el modal de siempre con doc firmado. Y (`540e793`) **la detección DERIVADA**
   (`tiempoGuardado.ts`): guardada→entregada sin acuerdo = aviso ámbar en el contrato con el
   botón prellenado — red SOLO para casos históricos (WILLINGTON aparece solo ahí).
   **EL DISEÑO FINAL (`c5068f9`, corregido DOS veces por el dueño hasta quedar exacto):**
   - **EL PRE-PASO**: la decisión cobrar/rodar se toma ENSEGUIDA — antes del formulario del
     convenio si no tiene (el convenio nace con valores reales), antes de la entrega si ya
     tiene. Cancelar el pre-paso = el flujo NO continúa; la decisión no se puede saltar.
   - **QUIEN OPERA DECIDE — el subadmin TAMBIÉN tiene permiso** (1ª corrección que malentendí
     como gate de rol: NO hay gate). Lo sagrado es EL RASTRO: qué, quién (creado_por), cuándo
     y cómo (acuerdo + doc firmado + auditoría). "Todo el sistema debe saber qué sucedió."
   - "Se cobra normal (no rodar)" también queda REGISTRADO como acuerdo cobrar_ahora sin deuda
     ni doc (cobrar es lo pactado; el papel firmado es para rodar, que cambia obligaciones).
   - La campana 🔔 se DESCARTÓ (2ª corrección: "¿por qué un letrero y una notificación?") —
     con el pre-paso obligatorio, sobra.
   **WILLINGTON (DQW26I)**: resolverlo POR LA APP con ese botón (guardada ~9 días → 1 semana;
   preguntar las fechas exactas al usarlo).
5. **Pieza 3 del rodar** (aprobada en concepto, sin construir): ofrecer rodar ANTES de armar un
   convenio nuevo, para que nazca con los valores reales.
6. **ANGELA edita contratos**: sin código — Usuarios → ANGELA → activar acción "Editar contrato".
7. **APK**: el dueño la pidió (23-ago) — diferida, diseño Capacitor→WebView ya decidido en CLAUDE.md.

El dueño pidió revisar TODA la parte financiera con esta regla: *"cada peso debe conservar su
esencia aunque cambie de envoltorio — el sistema debe saber de dónde salen las cosas, hacia dónde
van y en dónde quedaron"*. El resultado completo vive en **`docs/MAPA-FINANCIERO.md`** del repo
(conceptos, puertas de entrada, libro por capas, 10 huecos priorizados). Esto es lo esencial:

## Los hallazgos rojos

1. **El convenio es una bolsa opaca.** El retrato (migs 067/099) guarda contadores para DESHACER
   (cajas_pagadas_previas/marcadas) y las deudas quedan `en_convenio` — pero no hay desglose en
   pesos ni orden de amortización: la cuota que entra no se traduce a lo que era en esencia.
2. **Verificado por grep en todas las migraciones: NADIE pasa una deuda de `en_convenio` a
   `pagada` cuando el convenio se cumple.** Queda con su monto_pendiente intacto para siempre
   (GEOVANNY: migración $521.000). No estalla porque las pantallas filtran por estado.
3. **Registro dirigido sin candado**: un pago marcado "al convenio" (convenio_id) se respeta
   aunque la semana corriente esté descubierta — se salta el orden semana→deuda→convenio.
   En GEOVANNY (15-ago, $200.000, ANGELA) no hizo daño porque su semana estaba contemplada.

## La solución de fondo: la PARTITURA

Al firmar, el convenio guarda su desglose en pesos y en orden (jsonb): qué semanas, qué deudas,
qué ajuste de redondeo financia. Cada peso que entra la amortiza FIFO → cada cuota sabe qué es →
la nómina paga según la esencia, las deudas envueltas se cierran solas, y el estado de cuenta
explica el convenio renglón por renglón. Los 53 convenios viejos se llenan escribiéndoles su
partitura a mano (trabajo ya pendiente del dueño, pero con un lugar donde quedar).

## El malentendido de nómina que destapó todo esto

El "rta; 1" del 22-ago se programó como **renglón aparte por cuota** ($2.250 × cuota entrada,
acumulable: 3 cuotas juntas = $6.750). La intención REAL del dueño (23-ago, textual): *"solo se le
va a pagar una sola agrupación de semana + convenio = 7.500, no por separados"* — **EL PAQUETE**:
un renglón por semana por cliente ($7.500 completo a tiempo / $2.250 completado tarde / $0
incompleto; cuotas adelantadas cubren semanas futuras sin pagar extra; lo nacido de atraso paga
$2.250, nunca $7.500). Si se aprueba, la sección 1b de `nominaCobradores.ts` (renglones
cuota_convenio) queda obsoleta y se integra al ciclo.

## Estado de los pasos (23-ago)

1. ✅ **Nómina regla del paquete — HECHA Y SUBIDA** (commit `b70f2a0`, 298 pruebas). El dueño dio
   el dale tras confirmar el concepto con sus palabras. ⚠️ Falta verla en navegador (pestaña
   Nómina) — primera semana exacta: 24–30 ago.
   **"Convenio de retenida (30%)" es regla DEFINITIVA, no puente** (corregido 23-ago noche,
   ver fase C cancelada abajo): el retenido que paga cuota hizo la gestión de esa semana →
   $2.250 una vez. No se reemplaza por nada.
2. ✅ **Candado semana-primero — VERIFICADO 23-ago: ya existía por construcción.** El mapeo de
   TODOS los puntos de registro dio: ventana Cobrar con motor v2 → reparte LA BD (FIFO
   semana→deuda→convenio); v1/diarios → `calcularAplicacion` (orden estricto escrito en
   usePagos:155). El pago de GEOVANNY fue reparto CORRECTO (semana contemplada). Única puerta
   dirigida: recuperación de retenida (excepción aprobada — contrato suspendido, sin semana
   corriendo). Lo que faltaba era la PRUEBA que proteja el orden → `calcularAplicacion.test.ts`
   (6 casos, incluye GEOVANNY). El refuerzo del orden DENTRO del trigger de la BD no se hace:
   sería tocar el motor.
3. ✅ **Partitura fases A+B — HECHAS Y SUBIDAS** (commit `dbb184c`, mig 116 ✅ corrida y
   verificada por el dueño, 306 pruebas). Qué quedó: `convenios.partitura` se escribe SOLA al
   firmar (funciones recreadas del cuerpo VIVO con pg_get_functiondef) y crece al ampliar ·
   trigger APARTE `convenio_amortiza_deudas` (patrón vigía, motor intacto) cierra las deudas
   envueltas con plata real e idempotente en reversa · Cartera muestra la lista tachada
   (`partituraConvenio.ts` deriva el tachado del acumulado — nunca se guarda) · editor manual
   solo ADMIN/AP con cuadre obligatorio y auditoría. Los viejos con partitura null siguen
   intactos. La fase B quedó COMPLETA con `db8bc60`: el desglose tachado también se IMPRIME
   (estado de cuenta compacto 80mm, detallado y texto WhatsApp — mismo conteo del motor).
   ⚠️ Sin probar en navegador (el clasificador bloqueó browser/bash casi toda la sesión).
4. ❌ **Fase C — CANCELADA por lógica del dueño (23-ago noche, NO retomar).** Textual: *"si lo
   que está en convenio en convenio queda, y si ya se paga lo que se hace en una semana no es
   lógico pagarla dos veces — se paga cuando el cliente la paga"*. La nómina NO necesita la
   partitura: mide GESTIÓN SEMANAL, no envoltorios. La regla del paquete + el $2.250 del
   retenido cubren todo; pagarle además "por la semana vieja que la cuota tapó" sería pagar dos
   veces la misma gestión. La partitura conserva sus tres usos reales: cerrar deudas envueltas,
   explicar el estado de cuenta, proteger liquidaciones. **La nómina quedó COMPLETA el 23-ago.**
5. 🔲 **Fase D (dueño) — ahora ASISTIDA** (commit `5a02422`, mig 117 ✅ corrida y verificada):
   el editor abre con LA CUENTA YA SACADA (total − deudas envueltas = N semanas a valor de caja
   + sobrante "por confirmar"), cuadrando en verde. Él solo compara contra el acuerdo firmado y
   guarda — nunca se guarda sola. Al guardar, `amortizar_convenio(uuid)` (RPC, mig 117; el
   trigger de pagos DELEGA en ella — una sola lógica) pone las deudas envueltas al día DE UNA
   con lo ya abonado, sin esperar el próximo pago. Los ~50 viejos: lista con nombres del 23-ago.
6. 🔲 Después: egresos (lo que SALE — el último hueco grande del mapa).

⚠️ NADA de la partitura está probado en navegador (el clasificador bloqueó browser toda la
sesión del 23-ago; el preview local quedó crasheado por HMR del canal realtime de convenios —
un F5 lo revive; en producción no pasa). Primer caso de prueba sugerido: GEOVANNY DPU58I
(su lista real: 2.000 + 202.000 + 521.000 + 200.000 = 925.000).

**Why:** este es el norte de todo lo financiero que falta — los arreglos sueltos (nómina, candado,
deudas eternas) son síntomas del mismo hueco: la plata pierde su esencia al entrar al convenio.

**How to apply:** antes de tocar nómina, convenios o reparto, leer `docs/MAPA-FINANCIERO.md` y
esta memoria. Nada de esto se construye sin el dale explícito, pieza por pieza. Relacionado:
[[regla-nomina-cobradores]] · [[convenios-ahorro-semanas-financiadas]] · [[modulo-egresos-disenado]]
· [[libro-de-cajas-motor-v2]].
