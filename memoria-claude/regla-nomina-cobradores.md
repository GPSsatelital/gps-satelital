---
name: regla-nomina-cobradores
description: "REGLA DE NÓMINA de cobradores/subadmin — cerrada con el dueño el 22-ago-2026, pregunta por pregunta. NO re-preguntar. Se paga por moto GESTIONADA por ciclo."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T18:25:11.300Z
---

## ✅ RESUELTA la pregunta abierta: la retención ABSORBE su semana (7-sep-2026)

Textual del dueño: *"se le paga solamente lo de la retención, que son los $17.500; ahí va el pago
de su semana en gestión. Y si llega y paga la semana para que se la devuelvan, no se le paga algo
más, porque ya se le pagó. Los que no tengan todo el dinero se les entrega con convenio y de ahí
en adelante seguiría otro ciclo: ya se paga es por la gestión de la siguiente semana, que para los
que tienen convenio se toma es el conjunto de convenio + semana."*

Implementado en `nominaCobradores.ts` (bloque 2c): en la semana en que se retuvo esa moto se
descartan los renglones `ciclo`, `ciclo_atrasado` y `cuota_convenio` de ese contrato. Antes se
pagaban $17.500 + $2.250 por el mismo trabajo. **La visita SÍ se sigue pagando**: es otro trabajo
y suele ser otra persona. Desde la semana siguiente todo corre normal y el convenio va dentro del
paquete, como siempre. 4 pruebas nuevas.

# Nómina de cobradores — la regla del dueño (22-ago-2026, cerrada)

Pedida para Reportes → "Por admin". **Es la columna "A pagar" que faltaba desde julio.**
El entregable es doble: bloque en pantalla + **DESPRENDIBLE imprimible por cobrador** — pedido
textual: *"debe ser un documento detallado para que cada cobrador o subadmin pueda verificar
bien qué le están pagando"*. Renglón por moto (placa · cliente · gestión · valor) + firmas.



## ✅ 15-sep-2026: el atrasado al 50% y el REFERIDO PROPIO ($820f00c`, mig 153 corrida)

**EL ATRASADO PASÓ DEL 30% AL 50%** — `$2.250 → $3.750`. Sube **también** la semana de convenio de
una moto guardada, que se apoya en esa misma tarifa desde el 23-ago; el dueño lo confirmó sabiéndolo
(*"cambia los dos por ahora al 50%"*). De paso: el "30%" estaba **escrito a mano en 6 etiquetas** de
pantalla y del papel — habrían quedado diciendo "30%" al lado de $3.750. Ahora sale de
`PCT_ATRASADO`, derivado de la fracción.

**REFERIDO PROPIO = $30.000** (*"si alguno tiene un referido propio recomendado por él que se
agregue adicional 30.000"*). Reglas que quedaron:
- Lo cobra **quien lo trajo**, aunque la moto quede a cargo de otro.
- Se paga en la semana en que el cliente **recibe la moto** — no al registrarlo. Mismo criterio que
  la visita y que el programa de referidos entre clientes.
- **Una sola vez por cliente** (su primera entrega). Cambiar de moto no lo vuelve a pagar.
- Es **adicional**: quien lo trajo y además le hizo la visita cobra $40.000 + $30.000 = $70.000.
- La retención no se lo traga (como tampoco a la visita).

🔴 **El hueco que tapó la mig 153:** NADA ligaba un cliente con el funcionario que lo trajo.
`clientes.referido_por_cedula` y la tabla `referidos` (mig 010) son **cliente↔cliente** — el programa
de premios (guantes/casco) — y `fuente_llegada` es **texto libre**. No se puede pagar nómina con un
texto a mano. Nueva columna `clientes.referido_por_funcionario` + selector *"¿Alguien del equipo lo
trajo?"* junto a Fuente de llegada. Se manda a la BD **solo si hay alguien anotado**, para que la app
no reviente si la migración no está corrida (lección de la mig 151).

**✅ RELLENO DE LOS VIEJOS (mig 154, corrida y verificada):** el dato ya existía — el formulario
siempre pidió *"Referido por (nombre y cédula)"* y ahí se escribía el nombre del cobrador. Quedaron
**20 clientes**: Johan David Rojas 9 · Carlos Alvarez 6 · Lumar Avendaño Pineda 4 · Brandon Rojas 1.
17 ya con moto = **$510.000** repartidos desde la semana del 8-ago; los 3 sin moto se pagarán solos
el día de su entrega.

🔴 **La lista de 4 nombres va ESCRITA A MANO en la migración, no buscada por parecido.** Comparar
por primer nombre daba falsos positivos que habrían pagado nómina real a quien no le tocaba:
`CARLOS ALBERTO PEREA` y `LUIS CARLOS ORDOÑEZ` casaban con Carlos Alvarez/Ariza, `JOHAN PEREZ PEREZ`
con Johan David Rojas — los tres son **clientes**. La mayoría de ese campo es el programa de premios
cliente↔cliente, que no paga nómina.
⚠️ Y de paso: ese mismo `like` por primer nombre **duplicaba** los conteos (los de Carlos casaban con
dos perfiles). Primero reporté 26 clientes / $780.000 y era falso; el real es 20 / $510.000.

**Verificado en pantalla** (semana 7–13 sep): JOHAN DAVID ROJAS = 3 visitas × $40.000 + 3 referidos
× $30.000 = **$210.000** exacto. Y sale en la nómina **sin tener motos asignadas** — justo lo que se
buscaba: el referido lo cobra quien lo trajo, no el dueño de la moto.

🔲 **SIGUE ABIERTO (desde el 1-sep):** si la semana de una moto guardada debe tener precio propio en
vez de seguir pegada al atrasado. El dueño dijo *"definimos el punto 2 cuando termines"*.

## ✅ EL REVERSO: qué motos NO pagaron y por qué (15-sep-2026, `e51821a`)

Pregunta del dueño: *"si tienen más motos asignadas por qué solo están saliendo las gestiones que
salen"*. **El defecto:** la nómina se armaba EMPEZANDO por los pagos, así que una moto sin gestión
desaparecía — ni en cero, ni con nota. No había cómo distinguir *"no trabajó"* de *"el sistema no
lo contó"*.

Ahora por cobrador: **"81 motos asignadas · 25 con gestión · 56 sin gestión"**, y en el detalle el
bloque **NO SE PAGÓ** con placa, cliente y motivo. Cinco motivos excluyentes, en este orden:
`sin_contrato` → `diario` → `retenida_sin_abono` → `falta_convenio` → `no_pago`.

**Separar "retenida" de "sin cliente" salió de una pregunta suya** (*"las motos guardadas no se
suponen que las pagan la retención?"*): la retención se paga **UNA vez, en su semana**; desde ahí la
retenida solo paga si el cliente sigue abonando el convenio ($2.250). No es peso muerto — es
gestión pendiente, y mezclarla con las motos sin cliente la escondía.

**También va en el DESPRENDIBLE impreso** (`8d9d6d4`) — el dueño lo pidió aparte: *"en el
desprendible no se ven"*. Tenía razón: es el papel que el cobrador **firma** y con el que reclama;
si solo dice lo que se le paga, no puede discutir lo que no. El motivo va una sola vez, en la fila
que encabeza cada grupo. `htmlDesprendibleNomina` se separó de `generarDesprendibleNomina` para
poder probarlo (abrir ventana e imprimir no se verifica en una prueba; el papel sí, y es plata).

`nominaSemana` se partió en `nominaSemanaDetallada` (devuelve `{nominas, sinGestion}`) con
`nominaSemana` de envoltorio: una sola implementación. **No cambia ni un peso** de lo que se paga.

**Medido el 15-sep con datos reales:** de 329 motos asignadas, **69 no tienen contrato activo**
(Brandon 34 de 99, Lumar 19 de 82) — flota parada con dueño asignado, que es un tema aparte de la
nómina. Las columnas de defecto (`sin motor`, `sin libro`) dieron **0 en los cuatro cobradores**:
el cálculo no está perdiendo motos en silencio.

## ✅ La visita subió a $40.000 (15-sep-2026, `eea27cf`)

Decisión del dueño. Aplica a **todas** las visitas sin pagar, también las viejas (él lo confirmó
sabiendo el efecto). Movió **$750.000** en total repartidos en 8 semanas — 75 visitas × $10.000.
Las semanas ya cerradas no se tocan: `nomina_cierres` guarda las cifras congeladas.

## La regla (NO re-preguntar ninguna de estas)

Se paga por **moto gestionada**, por **ciclo del cliente** (semanal cada semana, quincenal cada
15 días, mensual al mes — "una vez por ciclo"):

| Gestión | Valor |
|---|---|
| Ciclo cobrado **a tiempo** | **$7.500** |
| **Prorrateo** cobrado (primer cobro real de la moto) | **$7.500 completos** |
| Ciclo **atrasado** que entra después | **30% = $2.250** |
| **Retención** (una sola vez: la semana en que se retiene) | **$7.500 + $10.000 = $17.500** |
| En mora, ni pagó ni se retuvo | **$0** — no hubo gestión |
| Semana **adelantada** del wizard (caja 1, nace paga con la base) | **$0** — nadie la cobró |

- **Solo SUBADMIN con motos asignadas** (`motos.subadmin_id`). Motos sin cobrador → aparte, para
  que el dueño las asigne.
- **Diarios POR FUERA** — dijo: *"la idea ahorita es que todos los diarios paguen solo a semanal
  para tener los ciclos más controlados"*.
- La semana de la retención el cliente NO pagó su ciclo (por eso se retuvo) — no existe el caso
  "ciclo + retención la misma semana"; el dueño mismo lo descartó: *"¿pero si pagó su ciclo por
  qué se retuvo?"*.
- Los ciclos que pague DESPUÉS para recuperar la retenida entran como atrasados (30%).
- Por qué el atrasado vale 30%: la gestión llegó tarde; el trabajo duro de la retención ya se
  premió con los $10.000.
- "Semana paga, semana consumida": desde el prorrateo en adelante, todo ciclo que entra es
  gestión del cobrador.

## 🔴 AUDITORÍA 22-ago (pedida por el dueño: "no están cuadrando") — 2 defectos encontrados y corregidos

**Semántica REAL del motor (mig 045, verificada contra su código — línea 203 y 249-256):**
- `aplicado_tarifa` = TODA la plata que el pago metió a cajas, **CON el ahorro adentro**.
- `aplicado_ahorro` = cuánto de ESA MISMA plata fue ahorro — **informativo, es subconjunto**.
- `aplicado_prorrateo` = la plata del prorrateo, en SU columna, nunca dentro de tarifa.

Los defectos: la nómina sumaba tarifa+ahorro (contaba el ahorro DOS veces → ~13% inflado → un
ciclo FANTASMA cada ~8 semanas y fechas de llenado corridas) y buscaba el prorrateo dentro de la
tarifa (robaba plata de cajas en contratos del wizard). Corregidos: la nómina ahora **LEE el
reparto del motor, no lo reinventa** — `aplicado_tarifa` solo para cajas, `aplicado_prorrateo`
para el prorrateo. 2 pruebas de regresión (8 semanas = 8 ciclos, no 9).

**Además (pedido del dueño): cada gestión trae su GRUPO** — el portafolio dueño de la moto paga
esa gestión. Chips "COSTA paga $X" por cobrador, columna Grupo y bloque "De qué portafolio sale"
en el desprendible (`totalesPorGrupo`).

**"Hay más gente al día de la que marca" — la parte que es DISEÑO, no defecto:** la nómina paga
por CICLO COBRADO ESA SEMANA, no por "estar al día". Un quincenal al día que esta semana no le
tocaba pagar = cero renglones esa semana. Comparar contra la lista de al-día del Por admin
siempre dará distinto: son preguntas distintas. Y un ciclo completado la semana SIGUIENTE
(quedó debiendo $10.000 y los puso el lunes) sale como atrasado 30% — así es la regla del dueño.

## 🔴 SEGUNDA AUDITORÍA (22-ago, tarde) — el SQL del dueño mostró 63 contratos descuadrados

**La causa de fondo: las cajas se llenan por TRES caminos y la nómina solo leía uno.**
1. **Pagos** — y con DOS formatos históricos (los pre-motor guardaron el reparto distinto).
2. **Convenios** — verificado en mig 054: al crear un convenio, las semanas financiadas se marcan
   pagadas DE UNA, sin que entre un peso (`cajas_pagadas = v_cubrir`).
3. **Ajustes a mano por SQL** — caso IEW47I (JHEINER): prorrateo_pagado $109.000 con CERO pagos.

**Conclusión: reconstruir fechas de llenado desde los pagos es imposible de hacer bien.**
**✅ MIG 112 CONSTRUIDA (22-ago): tabla `cajas_llenadas` + VIGÍA sobre `contratos`** — trigger
AFTER UPDATE de cajas_pagadas/prorrateo_pagado que anota cada llenado (caja, fecha, fuente) y
borra en reversa. **NO toca `aplicar_pago_confirmado` para nada** (diseño elegido a propósito: el
vigía mira el CONTADOR, así captura los tres caminos — pagos, convenios y ajustes a mano — sin
tocar el motor). Solo recrea `convenio_marca_contemplado` (cuerpo EXACTO de la 099, retrato
incluido) + la señal `set_config('app.fuente_caja','convenio')` para que esas anotaciones queden
con su fuente. La nómina: modo exacto si hay anotaciones de la semana; si no (semanas pre-112),
método viejo CON AVISO amarillo en pantalla. Adelantada en modo exacto = caja 1 de contrato no
migrado (se salta). Cuotas de convenio: 30% al cruzar cada múltiplo de `cuota_por_periodo` en el
acumulado de `aplicado_convenio` (mismo conteo del motor, mig 045:349-354). 294 pruebas verdes.
**✅ MIG 112 CORRIDA por el dueño el 22-ago** (commit `9bdb36b` en main). **Primera semana 100%
exacta: 24–30 de agosto.** La semana del 17–23 y anteriores: pagar a mano usando el desprendible
como guía (el aviso amarillo en pantalla lo dice).

**🔴 REGLA DEL CONVENIO CORREGIDA (23-ago) — EL PAQUETE. Reemplaza la del 22-ago.**
El "rta;1" del 22-ago se había programado como renglón APARTE por cuota ($2.250 × cuota entrada,
acumulable: GEOVANNY con 3 cuotas juntas = $6.750 en un día). El dueño lo corrigió textual: *"solo
se le va a pagar una sola agrupación de semana + convenio = 7.500, no por separados"*. La regla
que quedó EN CÓDIGO (commit del 23-ago, pruebas nuevas incluidas):
- El cliente con convenio debe su semana + la cuota del convenio como UNA sola cosa. El renglón
  del ciclo nace cuando el PAQUETE completo está cubierto, fechado cuando entró la última pata:
  todo dentro de su semana = $7.500 · completado tarde = $2.250 · incompleto = $0 ("si no paga
  completo es como si la caja de la semana no se ha completado").
- Cuotas adelantadas dejan cubiertas las semanas que vienen — NUNCA renglones sueltos.
- La cuota 1 se exige la semana SIGUIENTE a la firma (el convenio arranca el período completo).
- Única excepción: moto RETENIDA (contrato Suspendido, sin semanas corriendo) = máximo UN $2.250
  por semana en que entre cuota ("Convenio de retenida (30%)" en el informe).
- El vigía se consulta 12 semanas hacia atrás: una caja llena vieja se vuelve renglón la semana
  en que su convenio se completa (la nómina filtra por la fecha del paquete, no la del evento).
- Convenio incumplido/abandonado = bloquea los ciclos del contrato hasta que entre su plata
  (coherente con la mora: el cliente no está al día → no hay $7.500).

**Mientras tanto (ya corregido y útil):** la nómina lee `aplicado_tarifa` solo (sin doble ahorro)
y `aplicado_prorrateo` — exacta para contratos post-motor sin convenio ni ajustes.

**RETENIDAS en reportes (pedido del mismo día, HECHO):** estado propio 🔒 en Por admin/Por grupo
— ni mora ni al día, fuera del % (se mide sobre las que podían pagar), Suspendidos ya entran al
informe, y la lista de mora de la pestaña Cartera las excluye.

## Estado — CONSTRUIDA el 22-ago (pendiente de commit y de verla en navegador)

- **Motor**: `src/utils/nominaCobradores.ts` — puro, **16 pruebas** (285 verdes en total). Cada
  caja del libro que se llena = un ciclo, con la fecha del pago que la cruzó; a tiempo o atrasada
  contra la semana en que la caja se exigía. **La plata de la adelantada va en carril aparte**:
  en el carril común cruzaba el prorrateo y pagaba un prorrateo que quedó pago con la base — la
  prueba "la semana ADELANTADA del wizard no se paga" caza exactamente eso.
- **Desprendible**: `src/utils/generarDesprendibleNomina.ts` — carta, renglón por renglón, regla
  escrita en el papel, firmas (quien paga + "recibí conforme, verifiqué el detalle").
- **Pantalla**: Reportes → pestaña **Nómina** — semana lunes-domingo (default: última completa),
  un renglón por cobrador con drill-down y desprendible, y aviso con las motos gestionadas SIN
  cobrador (esa plata no se paga a nadie; el dueño las asigna).
- **Limitación conocida** (la misma del informe de gestión): la gestión se atribuye al cobrador
  que tiene la moto HOY — no hay historial de asignación.
- ⚠️ El clasificador de permisos estuvo caído: quedó SIN commitear (mensaje en
  `commit_msg_tmp.txt`) y SIN verificar en navegador. En el mismo commit va el letrero del día
  de corte de cada cartera (Cartera → detalle, un renglón).

## ✅ 1-sep — LAS VISITAS APARTE + CERRAR Y PAGAR LA SEMANA (mig 120, corrida)

**Las visitas se pagan $40.000** (subido desde $30.000 el 15-sep-2026, `eea27cf`)**, a QUIEN LA HIZO, en la semana de la ENTREGA de la moto** (no en
la de la visita) — y se revierten si `ubicacion_moto_resultado = 'no_coincide'`. Las paga el
portafolio de la moto entregada. Las 3 decisiones son del dueño, no re-preguntar.

Estaban **revueltas** en el renglón de gestiones de cada cobrador: un visitador con 15 visitas
parecía tener una semana enorme de cobro. Pedido textual: *"separa las visitas aparte para ver
solo el total de las visitas"*. Ahora tienen su propio recuadro (cuántas · total · quién las
hizo · qué portafolio las paga · detalle placa por placa) y el total de cada cobrador se parte
en `cobros $X · visitas $Y`. **Por qué:** son dos trabajos con dos precios y dos dueños del pago
— $7.500 al cobrador de la moto vs $40.000 a quien fue a la casa.

**Cerrar y pagar (mig 120, tabla `nomina_cierres`):** la nómina se RECALCULA cada vez que se abre
la pantalla, así que un pago que entrara después movía una semana ya pagada y no quedaba
constancia de qué se le pagó a quién. El cierre congela `total` + `renglones` + `totales_grupo`,
guarda la **firma** del cobrador y la **foto del desprendible**. Uno por uno, por cobrador
(decisión del dueño: si uno no aparece hoy, los demás ya quedan pagados). **Sin política de
UPDATE ni DELETE a propósito** — es un registro de pago.

### 🔴 Los dos defectos que encontré revisando MI PROPIO cierre antes de que se usara

Valen más que la feature, porque son el patrón:

1. **Congelar la cifra no sirve si la pantalla sigue mostrando el cálculo vivo.** El sello decía
   "✓ Pagado" al lado de un total que se movía. Se arregló cambiando **la nómina entera** por la
   congelada (no solo el total), para que el recuadro de visitas, el de portafolios, el total y
   el detalle salgan del MISMO dato — mismo principio que `loQueDebe()`: si dos bloques calculan
   por su lado, tarde o temprano se contradicen. Y si entra plata después **no se esconde**: sale
   el aviso de cuánto se pagó, cuánto daría hoy y que la diferencia va en la próxima
   ([[regla-esencia-y-rastro]]).
2. **Un `catch` que devuelve `null` es una pérdida silenciosa.** Si la subida de la firma fallaba,
   el cierre se guardaba IGUAL sin firma — y como no se puede editar ni borrar, ese pago quedaba
   sin respaldo para siempre. **Regla: cuando el registro es inmutable, cualquier falla de una
   pieza obligatoria tiene que ABORTAR todo, no degradar en silencio.**

`resumirRenglones()` se extrajo para que el cálculo en vivo y la relectura de una semana
congelada cuenten con la MISMA función. 2 pruebas: releer da idéntico · el orden no importa.

**Cómo probar un camino de escritura que NO se puede deshacer** (sirve para el próximo caso):
no se inserta "de prueba". Se prueban las piezas por separado — `mi_rol()` por RPC (¿la política
de INSERT me deja?) y una **sonda al Storage subida y borrada enseguida** (¿la firma sube?). Eso
cubre los dos modos de falla reales sin dejar un registro imborrable.

## 🔲 PREGUNTA DEL DUEÑO SIN RESOLVER (1-sep) — la semana atrasada que sale de una retenida

Textual: *"si luego de retenida la moto sale y con lo que pague completa una semana atrasada
metida en un convenio, que NO se pague al 30% sino que llegue a la siguiente reglamentaria"*.

Le pregunté para aclararlo y me respondió *"no entiendo que significa cada renglón"* — la
conversación se fue a arreglar los renglones y **esto nunca se cerró**. Hoy el código hace lo de
siempre: esa semana entra como **atrasado ($2.250)**.

**Antes de tocar nada hay que preguntarlo otra vez, con un ejemplo concreto en la mano** (un
cliente real, su convenio, y las dos cifras: lo que se le paga hoy vs lo que él propone) — como
manda [[regla-no-romper-lo-que-funciona]]. Lo que hay que despejar es si "llegue a la siguiente
reglamentaria" significa (a) que esa semana valga $7.500 completos, o (b) que se corra y se pague
junto con el ciclo de la semana siguiente.

## 🔲 SIN VERIFICAR — los 63 atrasados de BRANDON

Semana 24–30 ago: BRANDON sale con **61 a tiempo vs 63 atrasados**. Si esos 63 fueran a tiempo, la
diferencia son **~$330.750**. Nunca se comprobó si es real (mucha gente pagando tarde) o si el
clasificador a-tiempo/atrasado se está equivocando en algún caso. **Vale la pena mirarlo antes de
pagar varias semanas seguidas** — es el renglón más caro del informe.
