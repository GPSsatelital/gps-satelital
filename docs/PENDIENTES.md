# PENDIENTES — MotoGestión

Lista viva y **ordenada por prioridad**. La idea es que nada se pierda a medida que se desarrolla.

- **Cómo se usa:** se agrega abajo de su bloque, se marca `[x]` al cerrarlo y se mueve a "Cerrados"
  con la fecha. Si algo sube o baja de prioridad, se mueve de bloque y se dice por qué.
- **Quién lo hace:** 🧑 = tarea del dueño / la operación · 💻 = tarea de desarrollo.
- 📋 = salió de la pizarra del dueño (foto del 19-sep).
- ⚠️ **Por definir** = está anotado con una lectura provisional, pero **antes de construirlo hay que
  preguntarle al dueño la pregunta que dice ahí**. No arrancar sin esa respuesta.
- Última revisión: **25-sep-2026**.

---

## P0 — Plata mal contada HOY (y lo que está abierto de seguridad)

Lo que está afectando cifras reales de clientes en este momento.

- [ ] 🧑 🔴 **RAUL GOMEZ SAN MARTIN — su acuerdo vence el 12 de octubre y no le alcanza.**
  Cuota **$48.000**, **0 abonado**, y quedan **18 días** (medido el 24-sep). Con el motor ya
  arreglado (mig 171) le van a entrar unas 2 cuotas antes del vencimiento: **no alcanza**.
  **Dos salidas:** cobrarle las cuotas atrasadas **aparte** de la semana, o ampliarle el plazo.
  Es el único de los 34 casos de acuerdos sin recibir que el arreglo no salva solo (ver **D-024**).

- [ ] 💻 **1-oct: comprobar que los acuerdos ya están recibiendo.** Consulta de 30 segundos —
  los **14 clientes** cuyos acuerdos estaban en cero el 24-sep deben tener abonos después de su
  primer pago con el motor nuevo. Si no los tienen, el motor necesita otra mirada. (Ver **D-024**.)

- [ ] 🧑 🔴 **ROTAR LA LLAVE DE ZALA — pasó por el chat.** Estaba anotada en P2 como una tarea más
  de la puesta en marcha de ZALA. **Una llave de producción que circuló por un chat no es un
  pendiente de operación: es una puerta abierta**, y lleva días así. Sube a P0 hasta que se cambie.
  *(Subida el 23-sep · riesgo T8 en `docs/RIESGOS.md`.)*

- [ ] 🧑 ⏸️ **CESAR ESCUDERO (ZHO34G) y RAMON BARON (RLI25H) — falta rodarles el tiempo.**
  🚫 **EN PAUSA por decisión del dueño (21-sep): "dejalos quietos".** No retomar sin que él los saque.
  Anotado desde el 29-ago y nunca hecho. Sus contratos muestran **118 y 112 semanas consumidas
  contra las 104** que tienen. Igual que JORGE TOVAR, necesitan que el cliente venga para
  reconstruir cuánto tiempo no tuvo la moto. Sin eso no se les puede cerrar la cuenta.

- [ ] 🧑💻 **ADOLFO GAMEZ (RLT70H) — $297.000 sin atribuir y ahorro congelado.**
  Contrato DIARIO. Desde el **25-ago** todos sus pagos se registran igual: $27.000 a tarifa y
  **$0 a ahorro**, pague lo que pague (el 15-sep pagó $150.000 y solo se le contaron $27.000).
  Y su ahorro no acumula desde el 19-ago. Decisión del dueño: **se arregla a mano cuando se
  migre a semanal**. ⚠️ Si se migra con el ahorro que muestra la pantalla, el error viaja al
  contrato nuevo.

- [ ] 💻 **¿Le pasa a los demás diarios?** No se midió. Consulta lista en la sesión del 19-sep:
  comparar `valor` contra `aplicado_tarifa + aplicado_ahorro` en todos los contratos diarios.

- [ ] 🧑 **JOSE ENRIQUE CHIRINOS (IEW50I) — $224.000 de semanas marcadas sin plata**, sin poder
  atribuir. Su acuerdo ($483.500, 0 de 11 desde el 5-ago) es viejo y **sin lista**.

- [ ] 🧑 **8 acuerdos viejos sin lista de qué financian.** Bloquean cualquier corrección
  automática. En algunos la lista se deduce sola (JOHAN: $965.800 de deuda + $195.000 de semana
  = $1.160.800 exacto); esos se pueden escribir sin sacar el papel.

- [ ] 🧑 🔴 **JORDAN (DQL76I / LIQ-0073) — reabierta el 24-sep, falta cerrarla EN LA APP con él
  presente.** La base de datos ya quedó lista y verificada: liquidación `en_taller` · contrato
  `Suspendido` con su ahorro de $40.000 · cliente `Activo` fuera de lista negra · moto
  `Mantenimiento` · **fecha de corte 2026-09-21** (el lunes que la trajo) · deuda del alquiler
  $54.000 pendiente. **Al darle Calcular debe salir +$157.000 a su favor** (verificado llamando a
  `cuentaLiquidacion` con los datos reales — si sale otro número, PARAR).
  **Los pasos, en orden:** finalizar su orden de taller (está en *"Listo para salida"*) → Calcular →
  generar documento → **que JORDAN firme (firma + huella)** → cerrar marcando ☑ *"Sigue con la
  empresa"* con los **$157.000** como base de la moto nueva → le faltarían **$353.000** de los
  $510.000, que se cubren con lo que dé ese día + convenio.
  ⚠️ **Su convenio de base se dejó a propósito en `cumplido`**: es lo que impide que el recálculo le
  vuelva a cobrar los $308.000 sin tener que arreglar el código todavía. **Ese truco NO sirve para
  los otros 5 casos** — ahí hay que arreglar `cuentaLiquidacion.ts`.
  ⚠️ El convenio NUEVO que le abra el wizard nace con el mismo defecto: si algún día vuelve a
  liquidar sin terminar, se lo cobrarán otra vez.

- [ ] 💻 **A una liquidación CERRADA solo se le puede subir la FOTO del papel — no se puede firmar
  en pantalla.** ⚠️ **Corrección de lo que anoté primero:** dije que *"se puede cerrar sin que el
  cliente firme nada"* como si fuera un hueco. **No lo es: es una salida deliberada** — en el paso de
  la firma hay un botón aparte que dice *"¿El cliente no va a venir y la moto se necesita? Puedes
  cerrarla ya y subir la firma después"*. Y la puerta para firmar después **también existe**: el
  panel de una cerrada sin documento avisa en ámbar *"Liquidación cerrada — SIN FIRMA del cliente"* y
  ofrece **📷 Cámara** y **🖼 Galería / PDF** (`adjuntarFirmaACerrada`).
  **El hueco real es estrecho:** esa puerta solo acepta la **foto del papel**. Si el cliente llega
  hoy en persona, hay que imprimirle el documento, que lo firme a mano y tomarle foto — cuando el
  sistema ya sabe capturar **firma + huella en pantalla** (`firmarDigital`, que se usa antes de
  cerrar). Falta ese botón en el panel de la cerrada.
  ⚠️ `firmarDigital` **no se puede reutilizar tal cual**: pone `estado = 'firmada'`, y eso haría
  retroceder una cerrada. Necesita una variante que guarde firma, huella y fecha **sin tocar el
  estado ni una cifra**.
  **Medido el 24-sep — de las 44 liquidaciones cerradas:** 14 con firma + huella + documento
  completos · 6 con solo el papel subido · **24 sin nada, $11.276.500 en juego**. Las más grandes:
  KELVIN SALAZAR −$2.607.000 · ELIO QUIROGA −$2.164.500 · JAIDER HERNANDEZ −$1.656.000. Y dos **a
  favor del cliente** sin papel firmado: BLEIMER CASTELLANO +$959.000 · ERLEY BASTOS +$851.000.

- [ ] 💻 **La recepción real de una entrega queda huérfana y una administrativa le gana la fecha.**
  Mismo caso: la entrega de JORDAN (22-sep, `entrega_voluntaria`, con sus 6 fotos) se guardó **sin
  `contrato_id` ni `cliente_id`**, y al iniciar la liquidación se creó otra (`motivo: liquidacion`)
  con la fecha de HOY. `recepcionDelContrato()` toma **la más reciente** → el corte se corrió del 21
  al 24 y eso le quitaba **$93.000** al cliente. **Dos arreglos:** (a) que la recepción de una
  entrega quede siempre pegada a su contrato y cliente; (b) que iniciar una liquidación **no** cree
  una recepción nueva si ya hay una de entrega sin liquidar — o que no cuente para la fecha de corte.

- [x] 💻 **D-026: SEMANAS DE MÁS — LOS 4 PASOS HECHOS el 26-sep.** 🔲 Solo queda **mirarle la ficha a YESID el lunes 2-nov** (la primera semana de más de verdad) y correr la prueba espejo ese día. *(Registro:)* **D-026: SEMANAS DE MÁS PARA EL QUE TERMINA DEBIENDO — antes del ~26-oct (YESID).**
  Regla del dueño (25-sep): al llenar su última semana, si todavía debe, **sigue pagando su semana
  normal y todo va a lo que debe**, hasta quedar en $0; recién ahí se liquida por cumplimiento.
  Hoy el sistema hace otra cosa: deja de pedir la semana y solo cobra la cuota del acuerdo.
  A quién le toca: YESID ($256.000 → 2 semanas) · LUIS FERNANDO SOLANO ($1.455.200 → 8) · RAMON
  ($1.509.000, en pausa). **Piezas:** (1) no ofrecer "Cumplimiento" mientras deba un peso;
  (2) después de la última semana, exigir la semana normal (o lo que falte, si es menos) y que el
  motor la mande entera a deudas + acuerdo, no solo la cuota; (3) su espejo en la vitrina de ZALA
  + prueba espejo (REGLA DE LA VITRINA). **Respondido por el dueño el 25-sep:** esas semanas se
  cobran **igual que una semana normal** (gabela, mora, mensajes, llamada y recolección), y el
  pago va en el **orden de siempre: primero deudas, después acuerdo**.
  **PLAN APROBADO por el dueño el 26-sep ("listo dale"):**
  lo que se midió: (a) las deudas sueltas YA se pagan completas después de la última semana;
  (b) el acuerdo NO: el freno de la mig 119 le deja recibir solo la cuota exigida (YESID: $60.000
  de $235.000, el resto a saldo a favor); (c) **después de la última semana la mora queda en 0**
  (`desgloseExigible` topa en `total_cajas`, `proximaFecha = null`) → LUIS podría no pagar sus
  $1.455.200 sin entrar nunca en gabela/mora/recolección; (d) nada impide liquidar por
  cumplimiento a quien debe.
  1. ✅ **HECHO 26-sep** (commit f5450c8 + mig 173, registrada) — **Candado:** "Cumplimiento" no se ofrece mientras deba (ModalIniciar-
     Liquidacion + selector de LiquidacionesView), con el aviso *"Todavía debe $X: sigue pagando
     su semana normal hasta quedar en $0"*; y en la base, `cerrar_liquidacion` no deja cerrar un
     cumplimiento con saldo negativo.
  2. ✅ **HECHO 26-sep** (mig 174 registrada + `repartoPago.ts`) — probado en la base con YESID simulado a 65/65: $235.000 → acuerdo $235.000, saldo $0 (antes $60.000 / $175.000); 0 pesos movidos. **Motor:** con TODAS las cajas llenas, el acuerdo recibe todo lo que falte (sin freno). Antes
     de eso el freno sigue igual. Parche por anclas sobre `aplicar_pago_confirmado` VIVA (pedir
     `pg_get_functiondef` al dueño) + espejo `repartoPago.ts` + pruebas.
  3. ✅ **HECHO 26-sep** — `semanaDeCierre()` en `cicloPago.ts` + `loQueDebe` (cuota = la semana de más, `cierre` con el total) + estado y días de mora (param `deudasPendientes`, pasado en las 7 pantallas: Cobros, CobroDiario, Dashboard, Inmovilizaciones, Motos, Reportes, Socio) + etiquetas "Semana de más k de N" en el detalle, la lista y el estado de cuenta (el dueño eligió la opción A: el número grande es la semana). 17 pruebas. **Medido: hoy nadie está en semanas de más** (CESAR y RAMON quedan fuera a propósito: más semanas previas que su total). ⚠️ **No se pudo ver en pantalla con un caso real**: el primero será YESID ~2-nov — **mirarle la ficha ese lunes**. **Semanas de cierre en `cicloPago`** (`desgloseExigible`/`loQueDebe`/`diasEnMoraV2`): semana k
     de cierre vence en `fechaCaja(total_cajas + k)`; lo que toca hoy = `min(deuda actual,
     k × valor semana − pagado a deudas/acuerdo desde el inicio del cierre)`. Se corrige solo si
     paga de más o antes. Mora desde la semana de cierre más vieja sin cubrir.
     ⚠️ Caso borde: quien terminó limpio y meses después le cae una deuda → sus semanas de cierre
     cuentan desde esa deuda, no desde que terminó (si no, amanece con meses de mora).
  4. ✅ **HECHO 26-sep** (mig 175 registrada) — `zala.semana_de_cierre()` gemela de `semanaDeCierre()`, `zala.cuenta_contrato` la usa (vitrina **y Mi Día**, que no hubo que tocar), `zala.cliente` sin contar las deudas dos veces + 4 columnas, diccionario (5 palabras). **Espejo: 325 contratos, 0 diferencias.** Simulado YESID a 65/65 en 4 fechas: pantalla y base idénticas (30-oct $0 · 2-nov $235.000 vence hoy · 6-nov mora 3 días · 10-nov $256.000 mora 7 días). **ZALA:** `zala.dias_en_mora_v2` (mig 129) + cuota en `zala.cliente` + estado nuevo en
     `zala.diccionario` y `docs/DICCIONARIO-ESTADOS.md` + caso en la prueba espejo.
  Fechas: paso 1 ya; pasos 2-4 antes del **~19-oct** (una semana antes de la semana 65 de YESID),
  nunca lunes/miércoles antes de las 6 pm.

- [x] 💻 **25-sep: ARREGLADO EN CÓDIGO** — con motivo `cumplimiento` el ahorro se muestra y se cierra
  con *"Con este ahorro terminó de pagar la moto"* (no suma al saldo); retiro e incumplimiento
  siguen devolviéndolo. La proyección lo aplica solo si ya llenó sus cajas. Cambiar el motivo
  desde/hacia cumplimiento después de calcular devuelve la liquidación al cálculo. 7 pruebas nuevas
  con las cifras reales de YESID. Medido el 25-sep: **$8.753.000** en 5 contratos (YESID $4.366.000
  contando el sobrante de su base). **Lo que salió al medirlo, sin decidir:**
  - 🔴 **Terminar debiendo algo = saldo negativo.** Simulado con YESID a 65/65: saldo a favor
    $109.000 − acuerdo pendiente $256.000 = **−$147.000**. Antes su ahorro lo tapaba; ahora el
    cierre lo mandaría a **lista negra** y no deja imprimir Paz y Salvo. Decidir con el dueño:
    ¿se le cobra lo pendiente ANTES de liquidar por cumplimiento? (Al ritmo de ~$60.000/semana
    al acuerdo, YESID lo termina en ~4 semanas, antes que las 5 que le faltan.)
  - **La fecha de corte de un cumplimiento mueve plata:** si se liquida el lunes que paga la caja
    65, el ajuste le devuelve **$199.000** de la semana que no usó; el 1-nov, $0; el 2-nov le cobra
    un día. ¿Qué fecha manda en un cumplimiento, si la moto no se recibe?
  - **YESID paga $234.000 y su contrato dice $235.000**: el peso que falta sale del ahorro
    ($65.000 en vez de $66.000 por semana). Y su ahorro ganado ($3.801.000) está $159.000 por
    debajo de 60 × $66.000 — la diferencia viene del Excel de la migración.
- [x] ~~💻 🔴 **LA LIQUIDACIÓN NO MIRA EL MOTIVO — $8.043.000 en riesgo, YESID a 5 semanas.**~~ *(lo de abajo es el registro del 24-sep)*
  Regla del dueño **D-023** (24-sep): el ahorro es de la empresa **solo si el contrato termina
  bien**; si liquida sin finalizar, se le devuelve. Pero `cuentaLiquidacion()` **no mira `motivo`
  ni una vez** (verificado por grep: cero coincidencias) → le devuelve todo el ahorro igual al que
  pagó sus 104 semanas y al que entregó la moto a los 7 días.
  **Ya pasó una vez:** ANGELICA PACHECO (LIQ-0007, la única por `cumplimiento` en toda la
  historia) → se le devolvieron **$340.000**. ⚠️ Su saldo quedó en −$289.000 aun devolviéndoselos:
  revisar ese caso aparte, un "cumplimiento" con saldo negativo es raro.
  **Lo que viene:** YESID BARRAZA 60/65 → **$3.801.000** · LUIS FERNANDO SOLANO 98/104 →
  **$2.203.000** · JOSE GOMEZ 12/15 → $172.000. (RAMON y CESAR ya completaron, pero están en pausa
  por decisión del dueño.) **2 contratos ya llenaron sus semanas.**

- [x] 💻 **26-sep: ARREGLADO** — código (a20bdf7): al que se va antes no se le cobra NADA de su
  convenio de base (corregido en 02cbf62: la semana ya la cobra el ajuste de salida);
  por cumplimiento se cobra entera (D-026). Lo usan iniciar liquidación, proyección y la preliquidación
  del estado de cuenta. **Datos (mig 176):** EDER, WILMAR, JORGE LUIS (nuevo, LIQ-0075) −$308.000 ·
  FRAIRON $410.000 → $0 (mig 178: el "pedazo de semana" de $102.000 que le dejé era cobro doble — ya lo cobran los días que usó) · JESUS MARIA −$390.000 → **−$82.000** (volvió a *calculada*: 🧑 **hay que
  reimprimirle el papel**) · RICARDO −$472.000 → **−$164.000** (deuda y lista negra ajustadas; sigue
  sin firmar). 🔲 **Falta MELISSA** (su cuenta no cuadra). *(Registro:)* ~~La liquidación cobra el convenio de base — $2.289.000 en 7 casos.~~ Misma regla
  D-023 vista del otro lado: los $308.000 de la base son ahorro del cliente, y a quien liquida sin
  finalizar se le devuelven — así que cobrarle lo que nunca puso es cobrar algo que habría que
  devolver. `cuentaLiquidacion.ts:160` cobra todo convenio `activo`/`incumplido` sin distinguir.
  | Liquidación | Cliente | Placa | Mal cobrado | Estado |
  |---|---|---|---|---|
  | LIQ-0073 | JORDAN MARTINEZ | DQL76I | $308.000 | 🔲 **reabierta el 24-sep — falta que el dueño la cierre en la app** (ver abajo) |
  | LIQ-0056 | MELISSA BELLO | RMZ65H | $339.000 | 🔴 cerrada · lista negra · ⚠️ **su cuenta no cuadra: puso $404.000 al registrarse (debería deber $106.000) y su Semana 1 aparece SIN pagar. Mirarla aparte antes de tocarle un peso.** |
  | LIQ-0011 | JESUS MARIA DE HORTA | XZP35H | $308.000 | ⚠️ documento ya generado |
  | LIQ-0063 | RICARDO CRUZ | IEW84I | $308.000 | salvable antes de cerrar |
  | LIQ-0049 | EDER LEON | DQW27I | $308.000 | salvable |
  | LIQ-0052 | WILMAR MORENO | XYZ54H | $308.000 | salvable |
  | LIQ-0070 | FRAIRON CASTILLA | IEW54I | $410.000 | salvable — ⚠️ **mixto: $308.000 son ahorro (no se cobran) + $102.000 son primera semana (SÍ se cobran)** |
  Y hay **53 convenios de base vivos**: sin arreglar el código, vuelve a pasar con cada uno.

- [x] 💻 **26-sep: ARREGLADO** — el wizard arma el acuerdo de base solo con el ahorro que falta (54b3791) y la mig 179 bajó JORDAN ($353.000 → $308.000, 11 cuotas, límite 7-dic) y JORGE DAVID ($310.000 → $308.000). 🧑 **Reimprimirles el acuerdo firmado.** *(Registro:)* **El acuerdo de base trae un "pedazo de semana" que el cliente paga dos veces.** Cuando pone
  menos que su primera semana, el wizard arma el acuerdo con TODO lo que falta (semana + ahorro), pero
  esa semana también se la cobra el libro de cajas en sus semanas normales. Activos: **JORDAN $45.000**
  (acuerdo $353.000 → debería ser $308.000) · **JORGE DAVID $2.000** ($310.000 → $308.000). ⚠️ Los
  acuerdos están firmados: **decisión del dueño** para bajarlos, y cambio en el wizard para que el
  acuerdo de base lleve solo el ahorro que falta.

- [x] 💻 **26-sep: ARREGLADO (mig 177)** — lo pagado del acuerdo de base ya suma a `ahorro_apertura`:
  35 clientes, **$3.671.000** (foto: solo cambió eso, en esos 35). Disparador `trg_sumar_pago_de_base`
  para lo que venga (todo lo abonado es base, hasta su parte de base — mig 178; JORGE DAVID +$2.000; sube al confirmar, baja al rechazar o borrar; probado con LUIS ALEJANDRO dentro de
  un rollback: $300.000 → $250.000). Solo actúa si el contrato tiene únicamente su acuerdo de base.
  *(Registro:)* ~~Pagar el convenio de base no suma al ahorro — $3.528.000 de 35 clientes.~~ Tercera cara
  de D-023. Medido: el `ahorro_acumulado` de los 35 coincide **exacto** con la suma de
  `aplicado_ahorro` de sus pagos (lo que dejan las semanas, $26.000 cada una) — la plata del
  convenio entró como `aplicado_convenio` y **no sumó un peso** a su alcancía. Debería crecer
  `ahorro_apertura`, que es *"el remanente de su base"* (`cuentaLiquidacion.ts:110`).
  Los dos que **terminaron** de pagar su base tampoco la tienen: ANYULIS PERTUZ $223.000 ·
  DAVIAN PLAZA $160.000. Los más grandes: LUIS ALEJANDRO GUTIERREZ $300.000 · GERMAN DIAZ $240.000.
  ⚠️ Al construirlo, **cuidado con los convenios mixtos** (base + primera semana, como FRAIRON):
  solo la parte de ahorro sube.

- [ ] 🧑 **Los 53 convenios viejos:** desglose uno por uno contra el acuerdo firmado.

- [ ] 🧑 **ESTARLIS CHIQUILLO** — $368.000 contra $563.000 sin conciliar.

---

## P1 — A medio hacer: cerrar antes de abrir otra cosa

- [ ] 💻 🔴 **A una moto guardada TEMPORAL no se le puede cobrar ni conveniar — 12 motos,
  $14.816.500 que la pantalla no puede tocar.** Es **la mitad de un arreglo del 8-sep** que quedó
  sin terminar. Lo levantó el dueño con **XYZ49H (LUIS EDUARDO VEGAS)** el 24-sep: *"la entregó
  voluntariamente pero en Inmovilizaciones no me aparece para hacerle convenio ni rodar tiempo ni
  nada, solo me sale reactivar y tiene deuda"*.
  **Dos candados que se suman** (`InmovilizacionesView.tsx`):
  1. `💵 Cobrar` solo aparece si `!entregable`, y `puedeEntregar()` (línea 615) arranca con
     `m.esTemporal || …` → **para toda temporal la moto ya es entregable, así que el botón de
     cobrar NUNCA aparece.** Deba lo que deba.
  2. `📝 Convenio` y `⏳ Dar plazo` exigen `!faltaMulta` → con la multa pendiente se esconden los dos.
  **El comentario de la línea 1080 cuenta el caso idéntico de BRADER (YAL65H, 8-sep)**: le quitaron
  el `!m.esTemporal` al convenio… y no al botón de cobrar.
  **Y "rodar tiempo" no es un botón**: sale como paso previo de *"✓ Reactivar / entregar"* — o sea
  que el único camino para decidir si se ruedan las semanas guardadas es el mismo que suelta la moto.
  **Las 3 peores — ni cobrar ni conveniar** (multa pendiente y sin convenio): RMZ58H NELSON
  $3.042.400 (multa $80.000) · RNG54H JULIO SAYAS $1.840.000 ($30.000) · **XYZ49H LUIS VEGAS
  $1.190.000 ($25.000)**. Las otras 9 ya tienen convenio, pero igual no se les puede recibir un peso.
  A **8 de las 12** nunca se les resolvió el tiempo guardado.
  **Plan propuesto (falta el sí del dueño):** (a) separar *"¿le entrego la moto?"* de *"¿le recibo
  plata?"* → `💵 Cobrar` visible siempre que deba algo; (b) que la multa **no** trabe el convenio en
  las temporales (en una temporal la moto se entrega igual, así que el candado no protege la plata:
  solo quita la herramienta); (c) sacar **rodar tiempo** a su propio botón.
  ⚠️ **NO hacer (c) mezclando la multa DENTRO del convenio:** hoy el sistema le pone el sello
  `en_convenio` a la deuda pero **no la suma a la meta** → esa plata se perdería. Toca el motor.

- [ ] 💻 **XYZ49H — la cuenta, ya medida** (24-sep, para cuando el dueño decida): entregada el
  **31-ago** (24 días en bodega). Va **36 de 104** semanas. El motor le exige 42 → hueco de
  **$1.165.000**, que son **dos cosas distintas**:
  **$385.000** de ANTES de entregar la moto (semanas del 19 y 26 de agosto) → **se cobran, no se
  ruedan nunca** · **$780.000** de las **4 semanas completas** que la moto lleva en la bodega
  (2, 9, 16 y 23 de sep) → **esas sí se pueden rodar o cobrar**, con documento firmado.
  Son 4 períodos completos exactos, así que la regla de *"rodar solo por períodos completos"* se
  cumple limpio. Multa $25.000 pendiente · saldo a favor $0 · su ahorro $872.000 ·
  ⚠️ **transferencia de $200.000 del 24-sep sin confirmar** · ⚠️ **empalme nunca cerrado**.

- [ ] 💻 **3 liquidaciones fantasma — la moto dice una cosa y la liquidación otra.** Lo levantó el
  dueño el 24-sep con **DRO38I**: *"¿cómo es posible que esté activa en la calle y al mismo tiempo
  en taller para liquidación?"*. Devolverle la moto reactiva el contrato **pero no toca la
  liquidación que ya estaba abierta** → queda huérfana.
  | Placa | Cliente | Qué pasa |
  |---|---|---|
  | **DRO38I** | CLAUDIO ARNEDO | Contrato **Activo** + LIQ-0002 abierta desde el 4-ago (entregó el 4, volvió el 11 y se le devolvió). **Se puede anular desde la pantalla** — el botón existe para las no cerradas; nadie fue a buscarla |
  | **XZP35H** | JESUS MARIA DE HORTA | Moto dice **Asignada** pero está en el taller, con LIQ-0011 con documento generado desde el 20-ago |
  | **RLZ98H** | MARCOS VILLEGAS | Moto ya **Disponible** con LIQ-0039 abierta → **se le puede entregar a otro cliente mientras esa liquidación sigue sin cerrar** |
  Medido: 1 de 74 liquidaciones es contradictoria de verdad; las otras 24 abiertas son trabajo en
  curso. **El arreglo de fondo:** que devolver/reactivar cierre o anule la liquidación abierta.

- [ ] 💻 🔴 **EL ESTÁNDAR DEL PROYECTO — pasos 4 al 7** → `docs/ESTANDAR.md`.
  ✅ **Paso 1 (23-sep):** decisiones + memoria en git. ✅ **Paso 2 (24-sep):** `CLAUDE.md` de 1.426
  a 966 líneas, la bitácora a `docs/HISTORIAL.md`, y se corrigió todo lo falso.
  ✅ **Paso 3 (24-sep):** `npm run arranque` (lo dispara solo el hook `SessionStart`) y
  `npm run cierre` · mig 168 `migraciones_aplicadas`.
  ⚠️ **Pendiente del paso 3:** correr la **mig 168** en Supabase.
  **Falta, en orden:**
  **(4)** la *foto de la plata* antes/después de cada migración, la regla de la vuelta atrás, y la
  ventana de despliegue (no tocar cartera lunes ni miércoles antes de las 6pm) ·
  **(5)** `RUNBOOK.md` + la sección técnica de riesgos ·
  **(6)** los candados: casos reales → espejos → knip → **CI, que NO existe** (no hay `.github/`) ·
  **(7)** recién ahí, la auditoría técnica (rendimiento, seguridad, código muerto).

- [ ] 🧑 **Probar que el respaldo de Supabase se puede restaurar.** Tienen el plan Pro: hay respaldo
  diario con **7 días** de retención. Nunca se probó restaurarlo, y un respaldo sin probar es una
  ilusión. ⚠️ **Por definir:** 7 días es corto — la mig 124 se descubrió a los 3; si hubiera tardado
  8, el respaldo ya no la alcanzaba. ¿Activar *Point-in-Time Recovery* (extra pagado) o un respaldo
  propio semanal de las tablas de plata?

- [x] ✅ **Las herramientas caídas, arregladas** (24-sep, commit `5facd3d`). La causa, medida:
  `context7` tardaba **34 s** en arrancar y el límite son 30 — `npx` lo bajaba de internet cada vez.
  Instalados en la máquina: **34 s → 1 s** · `sequential-thinking` 7 s → 0 s · `mempalace` 11 s → 3 s.
  De paso se quitó una duplicación (3 servidores declarados en dos archivos) y **`task-master-ai`**
  (D-021: nunca se usó, nunca conectó, y `PENDIENTES.md` hace lo mismo y el dueño lo puede leer).

- [ ] 💻 **Sembrar `DECISIONES.md` con lo de junio a agosto.** Quedaron las 19 más importantes;
  faltan las anteriores, que hay que rescatar de `CLAUDE.md`, `docs/memoria/` y el código. Las del
  plan perdido que no se puedan reconstruir se marcan `⚠️ no recuperada` — sin inventar.

- [x] ✅ **El saldo a favor ya no se puede trabar** — cerrado el **23-sep** (mig 167 + `277ba92`).
  Aplicar saldo cuando el cliente no debía nada dejaba una fila con los 5 campos de reparto en
  cero, que el candado de la mig 160 contaba "en vuelo" por su valor completo: LUIS (IEW57I)
  estuvo **8 días** sin poder usar sus $59.000 y RAFAEL (DPU52I) **1 día** con $100.000, mientras
  la ficha se los mostraba. Las 2 filas se quitaron a mano, y quedó: el candado solo cuenta las
  que el motor SÍ aplicó · el **freno** (`debeHoy` obligatorio en `aplicarSaldoFavor`) · el
  **chequeo #6** de coherencia · el texto de la ficha. Medido sobre los 2.998 pagos: 0 trabados,
  0 filas vacías, y de los 148 movimientos de saldo los 148 que consumieron crédito aplicaron
  algo. → [[saldo-favor-movimiento-atascado]]
  ✅ **Probado en la pantalla real** con LUIS: salió el aviso y no escribió nada (10/10 pagos).
  ⚠️ **Efecto secundario a vigilar:** ya no se puede usar el saldo para **adelantar** una cuota
  del acuerdo que todavía no se le exige. Fue decisión del dueño (23-sep); si estorba, se ajusta.

- [ ] 💻 🔴 **LA FECHA DE FIN NO COBRA NADA — una sola verdad.** *"¿Cómo puede ser que se le
  muestre algo y se le cobre otra cosa?"* (dueño, 22-sep). El contrato termina **por semanas
  pagadas**, pero `fecha_fin_contrato` quedó visible y editable con pinta de importante, y la gente
  la ha editado creyendo que cambiaba el contrato. Medido: **15 de 266 activos** con la fecha
  descuadrada (7 son rodadas legítimas) y **2 contratos con las semanas mal** — los 2 únicos a los
  que alguien les editó los meses, porque `editarContrato` no recalcula nada.
  ✅ **Las 4 reglas están confirmadas por el dueño** (la fecha se mueve solo al rodar con firma;
  el cliente ve una fecha y el funcionario las dos; editar el plazo muestra el impacto y **bloquea**
  si ya pagó más semanas).
  ⚠️ **La lista de 7 puntos de implementación NO está aprobada** — repetírsela y esperar el sí
  antes de escribir una línea. → [[fecha-fin-y-semanas-una-sola-verdad]]

- [ ] 💻 **Bloquear los cambios de estado también en la BASE, no solo en la pantalla.**
  El 22-sep se quitaron los 3 controles que movían un estado a dedo, pero eso es la capa de
  arriba: con las herramientas del navegador todavía se puede. Un candado en la base necesita
  distinguir el cambio *a dedo* del que viene de un flujo bueno (wizard, recolección, taller,
  liquidación, préstamo, cesión) — si se hace de pasada, frena la operación.
  → [[estados-a-mano-y-evidencia-del-prestamo]] · [[permisos-dos-capas-rls]]

- [ ] 🧑 **Los 2 préstamos activos no tienen fotos ni kilometraje de salida** — se hicieron antes
  de la mig 164 y eso no se puede inventar hacia atrás. Al devolverlos, el modal lo va a decir.
  Si alguno vuelve con un daño, no hay con qué comparar.

- [ ] 💻 **No hay botón para "la empresa asume una semana".**
  Se destapó con KEVIN (22-sep): un error de cuentas que no se le puede cobrar al cliente hoy
  **solo se arregla por SQL**. `cajas_exoneradas` únicamente se toca desde
  `ModalResolverTiempoFueraServicio` —que exige que la moto haya estado en taller— y
  `ModalEditarContrato` no lo expone. Debería poder hacerse desde la ficha del contrato, con
  motivo escrito obligatorio y permiso de ADMIN_PRINCIPAL.
  ⚠️ **Por definir:** ¿distinguir en pantalla "rodar" (se cobra al final, exige firma) de "asumir"
  (no se cobra nunca, no exige firma)? Son dos cosas distintas y hoy se hacen con el mismo campo.
  → [[candado-saldo-favor-dos-clics]]

- [ ] 🧑 **KEVIN (RLY45H): revisar si el hueco le cambió alguna decisión de cobro.**
  Del 29-ago al 16-sep su cuenta lo mostró debiendo **$195.000 menos de lo real**. Si en esas
  tres semanas alguien decidió no perseguirlo o no recogerle la moto, esa decisión se tomó con
  un número malo. Su plata está cuadrada y **la semana del 21 ya la asumió la empresa** —
  esto es lo único de su caso que quedó sin mirar. → [[candado-saldo-favor-dos-clics]]

- [ ] 🧑 **Redesplegar la Edge Function `avisar`** — cambió el 22-sep para que el celular respete
  los avisos pospuestos y para que el ADMIN_PRINCIPAL reciba también lo que cae en 'ADMIN'.
  Mientras no se redespliegue, la pantalla y el celular dicen cosas distintas.

- [ ] 💻 **56 acuerdos activos o incumplidos SIN lista de qué financian** (medido el 22-sep; antes
  se hablaba de 8 y de 53 por separado). El aviso de coherencia solo revisa los que SÍ tienen
  lista: los que no la tienen no se pueden comprobar contra nada.


- [ ] 💻 **La regla del sobrante** (decidida **esperar hasta el ~26-sep, a propósito**).
  Cuando a un cliente le sobra plata después de cubrir semana, deudas y la cuota del acuerdo, hoy
  adelanta la semana de los próximos 3 días. Propuesta: que **baje el acuerdo primero**. Se
  pospuso porque el motor se tocó 3 veces en 2 días y el adelanto se volvió visible recién el
  18-sep: había que verlo con casos reales antes de decidir. → [[acuerdo-vencido-se-sigue-cobrando]]

- [ ] 💻 **Un pago de $1.000 revive un acuerdo incumplido.** `aplicar_pago_confirmado` le pone
  `fecha_limite = hoy + cuotas_faltantes × días`. Con la regla nueva de inmovilizar, alguien podría
  abonar cualquier cosa y salirse de la cola. El dueño: *"lo definimos cuando sea necesario"*.

- [ ] 💻 **`aplicarSaldoFavor` trabaja en dos tiempos desde el cliente** (crea el movimiento y
  después le descuenta el saldo, en dos llamadas). La mig 160 le puso candado, pero la raíz sigue:
  debería ser **un solo RPC en una transacción**.

- [ ] 💻 **La prueba espejo `loQueDebe()` ↔ `zala.cliente`** existe como script de navegador. Debería
  correr sola antes de cada despliegue que toque plata.

- [ ] 🧑 **LIQ-0011 (JESÚS DE HORTA)** parada en `documento_generado` desde el 7-sep.

- [ ] 💻 **Al mover un pago de contrato, el comprobante queda en la carpeta del contrato viejo**
  en Storage. Se ve bien, pero está archivado donde no es. (Caso RONAL/ANGEL, 19-sep.)

- [ ] 💻 📋 **Referencia de pagos repetidos.** Hoy **nada impide** registrar dos pagos con la
  misma referencia de transferencia: la misma consignación se puede contar dos veces. Sería el
  mismo tipo de candado en la base que la mig 160 le puso al saldo a favor.
  ⚠️ **Por definir:** ¿avisar y dejar pasar, o rechazar como el del saldo a favor?

- [ ] 💻 **`eliminarPago()` pierde la referencia y el comprobante.**

- [ ] 💻 **`ampliarConvenio` cobra doble** → [[convenios-ahorro-semanas-financiadas]].

- [ ] 💻 **Cesión DPU50I** hecha a mano, sin flujo · **8 partidas de caja sin grupo**.

---

- [ ] 🧑💻 **PLAN: alimentar el sistema con la información que le falta** →
  `docs/PLAN-COMPLETAR-DATOS.md` (medido el 22-sep). Lo grande: **168 contratos migrados sin un
  solo papel**, **82 clientes sin firma de autorización de datos** (eso es la ley de habeas data),
  **97 motos sin fecha de SOAT** y **371 sin tarjeta escaneada**. La estrategia propuesta es que
  el sistema lo pida solo, con cupo diario, en el momento en que el cliente ya está enfrente.
  ⚠️ Tiene 4 preguntas por definir al final del plan antes de construir nada.

- [ ] 🧑 **Los 4 contratos con el plazo dudoso** (22-sep) — entre $2M y $11M cada uno, en las dos
  direcciones. **JHON NAIDER** (IEW88I) y **JOSE LUIS JULIO** (XZN84H): confirmar con SERGIO, que
  fue quien les editó los meses. **KENNY** (RMM69H): sacar su contrato de papel del archivo y ver
  si dice 18 o 24 meses — no está escaneado. **DARGENIS** (RLZ83H): la teoría del typo (2026 por
  2027) no cuadra por 11 semanas; o su total son 80 semanas y no 91, o sus semanas previas de la
  migración están 11 cortas. → [[fecha-fin-y-semanas-una-sola-verdad]]

## P2 — Necesita gente, no código

- [ ] 🧑 **NÓMINA: los 63 atrasados de BRANDON** (~$330.750) sin verificar, y **nadie ha cerrado
  una semana todavía** — el primer cierre es **irreversible**.

- [ ] 🧑 **Punto 2 de la nómina:** si la semana de una moto guardada debe tener precio propio en vez
  de seguir pegada al atrasado. Abierto desde el 1-sep.

- [ ] 🧑 **ZALA:** que Meta apruebe las 10 plantillas · *(la llave subió a P0)* ·
  formato de la plata.

- [ ] 🧑 **Probar con gente real:** Mi Día con un SUBADMIN · los avisos push en un Android ·
  el rol ANALISTA · el portal del SOCIO · los pasos 3 a 6 del wizard en una entrega de verdad.

- [ ] 🧑 **Avisarle a quien registra clientes** del selector *"¿Alguien del equipo lo trajo?"*: si
  nadie lo marca, esos $30.000 de comisión no se pagan y nadie se entera.

- [ ] 🧑 **45 motos guardadas, 463 días sin producir.** Que el sistema exija gestionarlas.

- [ ] 💻 **Verificar en el navegador el cambio de moto / graduación** (migs 114+115, nunca se
  probó): la partitura de **GEOVANNY**, los rodares de **JUAN CARLOS** y **WILLINGTON**, y que
  **ADOLFO** aparezca listo para graduar. → [[graduacion-cambio-moto-flujo]]

- [ ] 🧑 **DQF56I sigue sin devolverse** — anotado el 7-sep en el módulo de taller y nunca cerrado.
  → [[taller-trabajo-y-cobro]]

- [ ] 🧑 **Decisiones sueltas:** 3 deudas `tarifa_atrasada` ambiguas · 6 convenios con sobrante ·
  grupo USADAS sin cuenta bancaria · $152.000 de IEW38I · si `cuentas_bancarias` debe verla el
  SUBADMIN/VISITADOR · la multa cuando hay que salir de la ciudad (valor distinto, sin dónde
  ponerlo) · avisar a los 7 del convenio inflado, a NESTOR (YAL67H) y a JORGE BELLO (RLT88H).

- [ ] 🧑 **Cabo de `fuente_llegada`:** ver si hay clientes con el nombre del cobrador SOLO en ese
  campo y que por eso no se cobran.

- [ ] 💻 📋 **Historial de visitas ya pagadas.** Ver qué visitas se pagaron en la nómina y en qué
  semana, para que no se paguen dos veces. ⚠️ **Por definir:** ¿una pantalla aparte, o una columna
  en el desprendible que ya existe?

- [ ] 🧑 📋 **Cambios de contrato Semanal → Quincenal** — IEW83I (JHON FREDDYS SANCHEZ), XZI08H
  (AILTON UCHIRODRIGUEZ), DQL82I (AGUSTIN TOVAR), RML41H (ALVARO WILCHES).
  🔴 **PARQUEADO por decisión del dueño (19-sep):** *"hay que pensarlo mejor por temas de firmas"* —
  cambiar la forma de pago cambia lo que el cliente firmó. Además mueve todo su calendario de cobro
  (la quincena no son dos semanas: son 15 días con dos fechas fijas del mes).

---

## P3 — Módulos por construir

- [ ] 💻 📋 **EGRESOS, con detalles y evidencias** — diseñado, sin construir. Hoy la plata que SALE
  no se registra en ningún lado (se vio con ELKIN: no había forma de saber si se le entregó su
  saldo a favor). El dueño pide que lleve **evidencia adjunta**, no solo el monto.
- [ ] 💻 **INFORMES GERENCIALES** — diseñados, sin construir.
- [ ] 💻 **Aviso "salieron $X" en Caja** (no aprobado todavía).
- [ ] 💻 **GPS real: sirena y apagado remoto.** Hoy la sirena solo deja registro de la
  gestión (3 segundos simulados) y el apagado no existe. Las reglas ya están definidas en CLAUDE.md
  (sirena máx 5-10 s y solo con el vehículo detenido; apagado solo detenido, máx 1 hora). Falta el
  puente con el proveedor de GPS. *(Venía de la lista 'Pendiente' de CLAUDE.md, 24-sep.)*

- [ ] 💻 **Recibo como imagen o PDF con el logo.** Hoy el recibo se imprime en la térmica y se manda
  como texto por WhatsApp. ⚠️ Depende del logo, que todavía no existe. *(Ídem.)*

- [ ] 💻 **APK nativo con Capacitor.** Decidido en su momento: empaquetar apuntando a la web en vivo
  (no una copia local), así un cambio de código se refleja sin reinstalar. Solo haría falta para el
  lector de huellas en Android. *(Ídem.)*

- [ ] 💻 📋 **Logo e identidad de marca** (falta el logo) · **Rediseño visual, fase 3: Cartera**.

- [ ] 💻 📋 **Portal del SOCIO: número de motos y portafolio detallado.** Que el socio vea cuántas
  motos tiene y el detalle de su portafolio. ⚠️ **Por definir:** ¿qué cifras exactamente — solo
  cuántas motos y su estado, o también recaudo, mora y rentabilidad del grupo?

- [ ] 💻 📋 **Validar papeles.** Que alguien pueda marcar que los documentos de un cliente
  **fueron revisados y están correctos**, no solo que están subidos. Hoy el sistema sabe que el
  papel existe, pero no que alguien lo miró.
  ⚠️ **Por definir:** ¿quién valida (secretaria, admin), y qué pasa si un papel se rechaza?

- [ ] 💻 📋 **Módulo de visitas por confirmar.** Una pantalla con las visitas ya hechas que esperan
  que el admin las apruebe o rechace. ⚠️ **Por definir:** ¿es una pantalla nueva o le falta algo al
  panel de aprobación que ya existe en Clientes?

- [ ] 💻 📋 **Recordatorio de gestiones de los Sub Admin (hora y detalle).**
  ⚠️ **Por definir, y son dos cosas opuestas:** (a) un recordatorio **para ellos** —"te falta llamar
  a estos 5 hoy"— o (b) un registro **para el dueño**: a qué hora hizo cada gestión y con qué
  detalle, para revisarle el día.

- [ ] 💻 📋 **Total o proyección esperada.** Cuánto **debería** entrar esta semana o este mes si
  todos pagan, contra lo que de verdad entró. ⚠️ **Por definir:** ¿por semana, por mes, por grupo?

- [ ] 💻 📋 **Migración / base de datos local.**
  ⚠️ **Por definir, y cambia todo el trabajo:** ¿es un **respaldo** por si Supabase falla, o poder
  **trabajar sin internet** y sincronizar después? Lo primero es una tarea; lo segundo es un
  proyecto grande.

---

## P4 — Limpieza y optimización

- [ ] 💻 **`npm run cierre` compara fechas en UTC** (`cierre.mjs`, líneas 77-80): después de las 7 pm de Colombia ya es el día siguiente en UTC y no ve lo registrado hoy en `DECISIONES.md`/`DERRAPES.md` (pasó el 25-sep con D-026). Usar la fecha de Colombia, como `hoyISO()`.
- [ ] 💻 **Aviso en "Cerrar y pagar" de la nómina** cuando la semana todavía no terminó. Hoy deja
  cerrar una semana a medias y **no se puede deshacer**.
- [ ] 💻 **`dias_mora` puede contar un hueco de cajas que un acuerdo ya cubrió.** Un solo caso en
  toda la flota (JORGE TOVAR, y se resolvió corrigiéndole el día de pago). **Si aparece un segundo
  caso, ahí sí arreglarlo de raíz** — con dos casos se sabe qué tienen en común.
- [ ] 💻 **Los diarios están fuera del motor de cajas** y su ahorro no acumula bien. Decisión: no se
  crean más diarios y el motor no se toca. Pero quedan activos.
- [ ] 💻 **`cajas_previas` puede superar a `total_cajas`** (3 contratos hoy). Viene de la migración y
  nadie lo valida.
- [ ] 💻 **Permisos escritos descuidadamente (no son huecos, se verificaron el 21-sep).**
  · `contratos` UPDATE "staff de oficina" tiene la primera casilla en `true` ("cualquier
  contrato"); lo que frena es la segunda. Funciona, pero si alguien agrega otro permiso con la
  segunda abierta, ese `true` se vuelve peligroso. Debería decir lo mismo en las dos.
  · `ajustes`, `mensajes_whatsapp` y `pendientes_atendidos` los lee cualquiera con sesión.
  Se revisó qué guardan: el número de WhatsApp de ZALA, textos de mensajes y quién atendió qué.
  Ningún secreto, ningún dato de cliente — por eso no se tocó.
  · `subir comprobantes` (INSERT) no pide rol: cualquiera con sesión sube al bucket
  `comprobantes`. Subir basura no expone datos de nadie, pero tampoco debería poder.

- [ ] 💻 📋 **Scroll lento en el Reporte de Entregas.** La pantalla va pesada. Se mide con el
  navegador y se arregla — probablemente sea que arma la lista completa sin ventana de scroll.

---

## Cerrados recientemente

| Fecha | Qué |
|---|---|
| 26-sep | 🔴 **D-023 cerrada por sus tres caras** — el que termina no se lleva el ahorro (f5c2ce1) · al que se va antes no se le cobra la base que no pagó (a20bdf7 + mig 176: RICARDO −$472.000 → −$164.000, JESUS MARIA −$390.000 → −$82.000, FRAIRON, EDER, WILMAR, JORGE LUIS) · lo pagado del acuerdo de base suma a su base (mig 177: 35 clientes, $3.671.000). Queda MELISSA aparte |
| 26-sep | 🔴 **D-026 completa: nadie termina debiendo** — no se liquida por cumplimiento debiendo (mig 173), el motor manda la semana de más entera a lo que debe (mig 174), la cartera la cobra como cualquier semana con mora y recolección ("Semana de más k de N"), y ZALA y Mi Día dicen lo mismo (mig 175, espejo 0 diferencias). Primer caso real: YESID ~2-nov |
| 25-sep | 🔴 **El que termina su contrato ya no se lleva el ahorro** (D-023, commit f5c2ce1) — con motivo cumplimiento el ahorro se muestra y se cierra con "Con este ahorro terminó de pagar la moto". Medido: $8.753.000 en 5 contratos. Salió D-026 (nadie termina debiendo), plan arriba en P0 |
| 25-sep | 🔴 **Devolver la base ya no se registra dos veces** (mig 172, commit 6ebc3dd) — la secretaria quedaba frenada en el último paso y repetía: OMAR YANCES 4 veces, FELIPE SEMBERGMAN 2, JOSE LUIS VASQUEZ 2 = $2.082.000 de más, corregidos. Ahora una sola transacción con candado; probado en producción |
| 25-sep | **La firma sale en pantalla completa** en Devolver base y Ceder contrato (commit b210b16) — la ventana centrada con transform la encerraba |
| 22-sep | 🔴 **El saldo a favor ya NO puede ser negativo** (mig 166, probada) — KEVIN (RLY45H) estuvo en −$195.000 tres semanas y la pantalla decía $0. Candado diferido que deshace cualquier operación que lo deje en rojo. **Era el único de la flota** (2.938 pagos auditados) |
| 22-sep | **La revisión de coherencia corre sola** (mig 165) — 5 chequeos pasan a ser avisos de Mi Día, bloque "Revisión del sistema". Las fórmulas medidas contra los 2.938 pagos: 0 descuadres, 3 casos de cajas (los conocidos) |
| 22-sep | **Se pueden posponer avisos** con fecha y motivo (solo el jefe), para lo que ya se sabe y no depende de nosotros |
| 22-sep | **El ADMIN_PRINCIPAL ve también lo que cae en 'ADMIN'** — eran 8 avisos que el jefe no veía, incluidos 3 SOAT y 1 tecnomecánica por vencer |
| 22-sep | **La moto prestada deja evidencia** (mig 164) — 6 fotos + km al salir y al volver; el km compara y dice cuánto rodó. Era el único traspaso de moto sin rastro |
| 22-sep | **Los estados ya no se cambian a mano** — fuera el selector de Motos y los botones Suspender/Reactivar de Contratos |
| 22-sep | **El menú de novedades dice la consecuencia** — cada opción avisa si el contrato sigue cobrando o se suspende; "Entrega voluntaria" → "El cliente para un tiempo" |
| 22-sep | **JORDAN MARTINEZ (DQL76I)** destrabado: su contrato estaba suspendido por error, se le prestó la YAT46H |
| 21-sep | 🔒 **LA BODEGA DE ARCHIVOS QUEDÓ CERRADA** — los 2 buckets en privado. El enlace viejo devuelve **400**; el camino nuevo, **200 · 783.675 bytes**. Comprobado con 8 documentos reales y las 6 piezas del mecanismo → `docs/COMPROBAR-ANTES-DE-CERRAR-BUCKETS.md` |
| 21-sep | 🔴 **El registro de usuarios de Supabase estaba ABIERTO** — cualquiera en internet podía crearse cuenta (sin confirmar correo siquiera), quedar sin perfil y descargar los documentos de los 269 clientes. **Apagado.** Nadie había entrado (0 cuentas sin perfil). Ver también: *anonymous sign-ins* ya estaba apagado |
| 21-sep | **mig 161** — el VISITADOR ya no lee los documentos: 5 políticas PERMISIVAS se sumaban y anulaban su exclusión |
| 21-sep | **mig 162** — para tocar los documentos hay que tener un rol de verdad (`NULL IS DISTINCT FROM 'X'` es TRUE) |
| 21-sep | **Las imágenes de los documentos también piden enlace firmado** — sin esto, cerrar la bodega hacía que el contrato y la liquidación salieran impresos SIN FIRMA, en silencio |
| 21-sep | **Los 19 enlaces** que abrían la URL pública ahora piden enlace firmado que caduca en 60 min |
| 21-sep | Al revisar se encontró que **dos ítems ya estaban resueltos**: el adelanto en el estado de cuenta impreso (quedó en `1fc87c7`), y las fechas UTC de TallerView (ya usa `fmtFechaCorta`) |
| 19-sep | **Candado del saldo a favor** (mig 160) — ya no se puede aplicar dos veces |
| 19-sep | YERLIS: doble clic deshecho · JORGE TOVAR: día de pago corregido · pago movido de IEW59I a IEW65I |
| 18-sep | **El acuerdo vencido se sigue cobrando** — 4 piezas (migs 157·158·159) |
| 18-sep | La semana adelantada por fin se ve en pantalla |
| 17-sep | ELKIN: liquidación cerrada revertida · RONAL: moto equivocada corregida |
| 16-sep | Los 6 pendientes dictados (wizard, excedente de base, fiscalía, liquidaciones…) |
