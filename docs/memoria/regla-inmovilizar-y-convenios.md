---
name: regla-inmovilizar-y-convenios
description: "Sesión 28-jul — cuándo se puede inmovilizar (mora/gabela/deuda), tope de 12 cuotas en convenios, y los dos cuadernos separados del sistema"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-05T22:53:03.463Z
---

## ✅ 5-ago: el reloj de días de una moto retenida arrancaba solo por UNA puerta

Reportado con RLT70H: *"se guardó hace tiempo y dice que está hace 0 días"*.

El contador salía **solo de la gestión de tipo `recoleccion`**, y esa la crea únicamente el flujo
de *Registrar recolección*. Las motos que entraron por otro camino —recepción desde Motos, entrega
voluntaria— no tenían gestión y el reloj marcaba **0 para siempre**. Medido: **12 de 28** contratos
suspendidos. Y como la regla de los 7 días para liquidar sale de ese mismo contador, esas motos
**no se podían liquidar** por mucho que llevaran guardadas.

Arreglado: si no hay gestión de recolección, usa la **última recepción del vehículo** —ese registro
sí lo crean todos los caminos, con fotos y fecha—. Solo pantalla, no toca la BD.

🔴 **ES EL MISMO PATRÓN QUE SE REPITIÓ TODO EL DÍA**: el resultado dependía de por cuál puerta entró
el funcionario. Pasó con el convenio (0/1/2 semanas), con la multa (Cartera vs Inmovilizaciones),
y acá con el reloj. **Al tocar cualquier flujo, preguntar siempre: ¿hay más de una puerta que lleve
a este mismo estado, y todas hacen lo mismo?**

## 🧾 5-ago: dos errores de digitación corregidos (uno destapó otro misterio)

- **Placa mal escrita**: XZN84I → **XZN84H** (BAJAJ 2027 de COSTA). No existía otra con ese número,
  así que fue un UPDATE limpio.
- **Moto equivocada en el contrato**: a YEFERSON GIRARDO le entregaron la **IGC52I** pero el
  funcionario seleccionó **RNG56H** en el wizard. Se movió el contrato a la IGC52I con sus 13 km,
  la RNG56H volvió a Disponible (estaba en bodega), y **las fotos de entrega se mudaron** — eran
  de la IGC pero el sistema las guardó en la RNG.
- 💡 **Eso explicó el misterio de la mañana**: la IGC52I aparecía *Reservada sin ningún contrato* y
  no supimos por qué. Era esta entrega a medias. **Una moto Reservada sin contrato es la huella de
  un wizard abandonado o de una entrega mal registrada — no un dato suelto.**

## ✅ 31-jul/1-ago: CONVENIO UNIFICADO — las 4 puertas usan el mismo componente

Disparado por el dueño creando un convenio desde Inmovilizaciones: *"está diferente al del módulo
de cartera... **no veo por qué habría alguna diferencia si un convenio es un convenio**"*. Tenía
razón, y las diferencias no eran cosméticas.

**Había DOS implementaciones:** Cartera con un formulario propio escrito dentro de la pantalla, y
`ModalConvenio` compartido para Inmovilizaciones, Cobro Diario y el wizard. Además Inmovilizaciones
lo abría en modo restringido (`metaFija` bloqueaba el monto Y escondía lo de financiar semanas).

**Los 3 defectos reales que destapó:**
1. 🔴 **`fecha_limite` guardaba cosas DISTINTAS**: Cartera la fecha de la ÚLTIMA cuota (correcto,
   es la fecha tope), el compartido la del PRIMER pago. De ese campo depende
   `marcar_convenios_vencidos()` → un convenio de 6 cuotas creado desde Inmovilizaciones **nacía
   vencido a la semana**. Se revisaron los 26 activos: **ninguno afectado**, porque todos salieron
   de Cartera. El primero que iba a salir mal era el que estaba creando ese día.
2. 🔴 **El tope de cuotas solo existía en el compartido.** Cartera se lo saltaba, y es la puerta
   por la que se crean casi todos: el 31-jul —3 días después de poner el tope— se creó uno de
   **32 cuotas**. Los que ya estaban por encima se dejaron como están.
   ⚠️ **El tope se subió de 12 a 24 el 1-ago** (`01ab22f`): los MIGRADOS traen deudas de apertura
   altas y con 12 la cuota quedaba impagable — el tope empujaba a partir la deuda en varios
   convenios, que es peor. Contraste con datos reales: con 12 se salían **9** de los 26 activos;
   con 24 se salen **2**. Vive en UNA constante (`MAX_CUOTAS`) y los mensajes la interpolan.
   Su otra función sigue intacta y es la que de verdad ataja errores: red contra escribir el
   VALOR de la cuota en la casilla del NÚMERO (lo de XZN20H, $9 durante 60.000 semanas).
3. **La opción de financiar semanas no aparecía en Inmovilizaciones**, porque dependía de que la
   pantalla pasara `cuotaPeriodo`/`finPeriodoISO` por props y esa no los pasaba. **Ahora el modal
   los CALCULA desde el contrato** (`valorPeriodoReal`, `huecoCuotasHoy`, `proximoDiaPago`), así
   ninguna puerta puede volver a quedarse corta por olvido.

**Lo que se llevó al compartido para no perder nada:** la previsualización del acuerdo de pago
(existía SOLO en Cartera y es lo que el cliente lee antes de firmar), el selector de 0/1/2 semanas,
y el ajuste de que la primera semana financiada va por lo que FALTA del período si ya lo debe.
`metaFija` ya no bloquea: viene precargado y editable, con el sugerido a la vista.

**CobrosView: 3.683 → 3.502 líneas.** `noUnusedLocals` fue la red que encontró cada referencia
colgada al borrar — sin eso habrían quedado variables muertas.

🔴 **PERO esa unificación ROMPIÓ la regla de la última cuota** y el dueño lo cachó en producción:
el formulario de Cartera respetaba la cuota tecleada y dejaba el resto en la ÚLTIMA; el compartido
la recalculaba dividiendo. **Ver [[regresion-convenio-y-reglas-de-seguridad]]** — ahí está el
arreglo (`repartirConvenio()` + 9 pruebas), por qué se me pasó, y los 5 convenios que quedaron mal
creados esperando que él confirme los montos.

⚠️ **Sin probar:** el clic Cartera → contrato CON deuda → pestaña Convenio → "+ Crear convenio".
El botón solo aparece si hay deuda pendiente y no se logró llegar por clics. El cableado son 6
líneas y tsc valida los props, pero conviene abrirlo una vez con un cliente que deba.

# 28-jul-2026 — EN PRODUCCIÓN (commits `22f601e` `e4545d9` `109c645`). Sin SQL pendiente.

## 1. Cuándo se puede inmovilizar una moto

**El caso:** a ISMAEL GAMARRA (RLZ94H) le retuvieron la moto y el funcionario NO pudo registrarlo:
el botón exigía `estado === "mora"` y él salía en **gabela**.

**El concepto que hay que tener claro — dos cuadernos separados:**
- *"¿pagó la semana?"* → el motor de cajas. Es lo único que mira `calcularEstadoCartera`.
- *"¿qué debe de antes?"* → la tabla `deudas`. **`calcularEstadoCartera` NI SIQUIERA la recibe**
  (verificado en su firma, `cicloPago.ts:156`).
Por eso Cartera podía mostrar "Debe pagar $X" al lado de un badge verde: dos preguntas distintas,
dos fórmulas distintas, misma pantalla.

**Regla nueva (decisión del dueño):** habilita **mora · gabela · cualquier deuda** (sin monto
mínimo — *"de aquí en adelante nadie tendría por qué tener deudas"*).
Vive en **`src/utils/inmovilizacion.ts`** (`razonParaInmovilizar`), APARTE de `cicloPago.ts`:
meterle deudas a `calcularEstadoCartera` habría movido KPIs, chips, campana, informes y 27 pruebas.
La deuda `en_convenio` queda fuera a propósito (quien está cumpliendo su convenio no se habilita).

**Trampa que encontré al probar y que hay que recordar:** meter gabela a InmovilizacionesView infló
la lista de persecución de **35 a 195** y dejó el KPI "mora crítica (+3d)" contando gente con CERO
días. Se resolvió con chips por razón (🔴 En mora · 🟡 Gabela · 💰 Deben) y **"En mora"
preseleccionado**, para que la vista por defecto siga siendo la de siempre. Los KPI cuentan solo
mora real. La pestaña se llama ahora "⚠️ Por cobrar".

**El Panel Hoy de Cartera NO se tocó** (sigue con `mora && diasSinPago > 3`): decide a quién salir
a buscar, y meterle gabela sería perseguir el mismo día que se da el chance. Supuesto declarado al
usuario — si algún día lo quiere distinto, es un ajuste chico.

## 2. Bugs corregidos en el mismo pase

- **`useContratos.ts` — faltaba COSTA en `CORTE_POR_GRUPO`.** Le caía el default 1-jul cuando su
  corte real fue el 27, así que a clientes de UN día les mostraba **"27d sin pagar"**. ~180 contratos.
- **Registro fantasma:** el motivo "Retención por mora" del formulario de recepción **no hacía nada**
  (el handler solo reacciona a `entrega_voluntaria`). Decía "Recepción registrada" en verde y el
  contrato seguía Activo, la moto Asignada, sin multa. Se quitó del selector.
- **Entrega voluntaria + deuda:** `puedeEntregar = m.esTemporal || (...)` salta TODA la validación
  de deuda. Decisión del dueño: **avisar, no bloquear** (aviso en la tarjeta + confirm con el monto).
  ⚠️ No se pudo ver con datos reales: hay 0 motos guardadas temporal.
- **Aviso de referencia bancaria** decía "Esta referencia NO está en el dinero sin identificar" y se
  leía como rechazo, cuando no bloquea nada. Ya causó una consulta real (ref. M18871421 de JADER).
  **Regla operativa: ese aviso es informativo — el pago se registra igual.**
- Faltaba la opción "Multa por recolección" en el formulario de deuda NUEVA (sí estaba en el de editar).

## 3. Convenios: tope de 12 cuotas

**El caso (XZN20H, REYNALDO ANTONIO MARRUGO):** convenio de $505.000 en **60.000 cuotas de $9**,
fecha límite año **3176**. Alguien escribió `60000` en la casilla de *número de cuotas* pensando que
era el valor, y la única validación era `cuotasCalc <= 0`.

**`MAX_CUOTAS = 12`** (decisión del dueño: si no se paga en 12, necesita liquidación, no más plazo).
Lo que de verdad ataja el error es la frase en cristiano bajo el total: **"El cliente paga $4 cada
período, 60000 veces"** — eso salta a la vista, un `60000` en una casilla no. Verificado
reproduciendo el error exacto en el modal real.

**Auditoría de las cuentas de REYNALDO tras borrar el convenio (todo cuadra):**
- El trigger de la **mig 067** devuelve las deudas de `en_convenio` a `pendiente` al borrar ✅
- $505.000 (16-jul) = $310.000 deuda de apertura + $195.000 cuota de esa semana metida DENTRO del
  convenio (casilla "incluir la semana")
- $400.000 (hoy) = los mismos $310.000 + $90.000 que falta de la semana actual
- **La deuda es idéntica en ambos**; lo que cambió es el pedazo de cuota. No se perdió nada.
- 🔲 Pendiente: **rehacer el convenio de REYNALDO** con "Fijar por valor de cuota". Y ojo: su
  contrato tiene **empalme pendiente** (ahorro $638.000 / deuda $310.000) — conviene confirmar esas
  cifras con él ANTES de amarrarlo a un convenio, porque al cerrar el empalme quedan selladas.

## Ideas ofrecidas y sin respuesta

- Volver a poner el TOTAL GENERAL del informe de Reportes, pero calculado sobre lo filtrado (se
  quitó porque con filtros dentro de la ventana un total fijo mentiría).
- Diferenciar visualmente la casilla activa del selector "Número de cuotas / Valor de la cuota" —
  se parecen y por eso se pudo escribir en la que no era.

## ✅ DOS TOPES de cuotas, no uno (29-ago-2026, `81b90e7`)

El dueño preguntó: *"¿subo el tope de 24 a 30, o lo dejo en 24 con excepción? ¿Qué me
recomiendas?"*. **Ninguna de las dos.** La causa es que UN solo número hacía DOS trabajos que se
estorban entre sí:

1. **Atajar el error de dedo** de escribir el VALOR de la cuota en la casilla del NÚMERO de cuotas.
   Pasó de verdad — XZN20H: 60.000 en el número de cuotas → cuotas de $9 durante 60.000 semanas,
   con fecha límite en el año 3176.
2. **La norma del negocio**: un convenio que no se paga en ~24 cuotas ya es otra conversación.

Subirlo (12 → 24 → 30) **debilita (2) sin mejorar (1)**: contra un 60.000 dan igual 24 que 30. Y
aprieta de verdad: JORGE (ZIB64G) debe $2.203.000, o sea **$91.800 de cuota SOBRE su semana de
$195.000 = $286.800 semanales**. El propio código ya advertía que el tope *"termina empujando a
partir la deuda en varios convenios, que es peor"* — y de **78 convenios activos, 25 no tienen un
solo abono** (una cuota impagable es la primera sospechosa, sin confirmar).

**Cómo quedó:**
- `TOPE_DURO_CUOTAS = 60` → **bloquea**. Nadie hace 60 cuotas a propósito, así que ataja el error
  de dedo igual de bien sin estorbar un plazo legítimo.
- `CUOTAS_NORMALES = 24` → **NO bloquea**. Avisa en ámbar, sugiere revisar si al cliente le sirve
  más una cuota alta en menos tiempo, y exige marcar *"Sí, este cliente necesita el plazo largo"*.
  El rastro queda **dentro del motivo**, que es lo que se imprime en el acuerdo y se ve en la
  ficha: `[Excepción: N cuotas, más de las 24 normales]`.
- `veredictoCuotas()` salió como función pura para poder protegerla con pruebas (4, con el 60.000
  real de XZN20H y los dos umbrales escritos).

🔑 **El patrón, que sirve para el próximo tope:** cuando un límite empieza a subir cada dos
meses, casi siempre es porque está haciendo dos trabajos distintos. Sepáralos: uno duro que ataje
el disparate, y una norma que avise y deje rastro sin trabar a quien está cobrando. Es el mismo
criterio que ya usa "rodar tiempo": no se prohíbe, se exige justificarlo — [[regla-esencia-y-rastro]].

Ver [[retenciones-rotas-y-filtros-descargas]], [[estado-golive-27jul]].

