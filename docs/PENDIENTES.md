# PENDIENTES — MotoGestión

Lista viva y **ordenada por prioridad**. La idea es que nada se pierda a medida que se desarrolla.

- **Cómo se usa:** se agrega abajo de su bloque, se marca `[x]` al cerrarlo y se mueve a "Cerrados"
  con la fecha. Si algo sube o baja de prioridad, se mueve de bloque y se dice por qué.
- **Quién lo hace:** 🧑 = tarea del dueño / la operación · 💻 = tarea de desarrollo.
- 📋 = salió de la pizarra del dueño (foto del 19-sep).
- ⚠️ **Por definir** = está anotado con una lectura provisional, pero **antes de construirlo hay que
  preguntarle al dueño la pregunta que dice ahí**. No arrancar sin esa respuesta.
- Última revisión: **10-oct-2026**.

> ▶️ **AL ARRANCAR (10-oct):**
> 1. **Rodar por deuda, tanda 1 punto 3** — sigue esperando su «1» o «2».
> 2. **Capacitación del tema 6** (el dueño: «la diapositiva la arreglas después»): diapositiva 7 («los mismos
>    días que Cartera»: ahora sí es cierto), recapturar los pantallazos t6 y el video 5 con el libro nuevo.
>    Hasta entonces, no presentar el tema 6 (sus pantallazos muestran «(4 días)» y la fila rodada vieja).

---

## EL PLAN DE TRABAJO POR TANDAS (aprobado el 8-oct: «hagamos todo lo que es de programación que está pendiente»)

El dueño escogió la opción **2: preguntarle antes de subir cada punto.** Antes de cada punto se dice en
una línea qué significa «terminado»; al cerrarlo, los números reales (pruebas, medición y foto a 375 px).
Nada que toque cartera o pagos se sube lunes ni miércoles antes de las 6 p.m. El detalle de cada punto
está en su bloque de abajo.

**Tanda 1: terminar lo que quedó a medias (ya aprobado)**
1. [x] Cartera de un día pasado (D-043, paso 1) — 6b96f72.
2. [x] El documento de liquidación cabe en una hoja carta — 4fa35fb.
3. [ ] **Rodar por deuda: la marca en Reportes y pasar a «saldado».** Plan de 3 piezas presentado; **espera
   el «1» o «2» del dueño** → P1, «RODAR POR DEUDA». ▶️ **AQUÍ SE RETOMA.**

**Tanda 2: defectos claros que no cambian cuánto debe nadie**
4. Firmar en pantalla una liquidación ya cerrada (24 sin ninguna firma, $11,3 millones en juego).
5. «Cerrar sin firma» sin la casilla «Sigue con la empresa» (lo de ANDRÉS).
6. Reportes › Entregas: fotos de otro cliente, fotos pesadas y scroll lento.
7. El registro de cambios del contrato que no se guarda en algunas rodadas.
8. «Este pago cubrió la semana del X al Y» no salta las semanas rodadas.
9. Borrar o mover un pago pierde la referencia o deja el comprobante en la carpeta equivocada.
10. Ventanas aparte con botones invisibles (blanco sobre blanco).
11. El formulario de motos acepta años imposibles (el 0028 de DQL79I).
12. Un aviso antes de cerrar una semana de nómina que todavía no termina.
13. Herramientas: la prueba espejo de la plata corre sola antes de subir, revisión automática en GitHub (no
    existe) y el cierre de sesión con la hora de Colombia.

**Tanda 3: defectos que tocan plata (medición antes y después de cada uno)**
14. La entrega que pierde su contrato y le corre la fecha de corte a la liquidación (JORDAN, $93.000).
15. Medir si los demás diarios tienen el problema de ADOLFO.
16. Medir si la fecha límite del acuerdo de base va antes que las cuotas en todos (KATIA).
17. Confirmar que «ampliar acuerdo» ya no cobra doble (la memoria dice arreglado; la lista lo tiene abierto).
18. Usar el saldo a favor en un solo paso dentro de la base (hoy son dos pasos sueltos).
19. Los documentos firmados (contrato, pagaré) que pueden partir una línea entre dos hojas.

**Tanda 4: necesitan una decisión del dueño** (una por una, con dibujo): cobrar y hacer acuerdo a las
motos guardadas temporales (12 motos, $14,8 millones; el plan está escrito) · la fecha de fin (JHON NAIDER) ·
saldos a favor más visibles · que devolver la moto cierre la liquidación abierta · el botón «la empresa
asume una semana» · acuerdo nuevo encima de uno vencido · pagos con la misma referencia: ¿avisar o
rechazar? · JESUS QUIÑONEZ rodado dos veces · bloquear en la base los cambios de estado a mano · la regla
del sobrante · traer por páginas lo que va a crecer · cartera de un día pasado hacia atrás (31-ago y
30-sep) y la proyección.

**Tanda 5: módulos nuevos, cada uno con su plan:** Egresos, informes gerenciales, recibo con logo, validar
papeles, visitas por confirmar, recordatorio de gestiones, completar los datos que faltan, aplicación para
el celular, sirena y apagado reales.

**Ramas locales sobrantes:** `wip/liquidacion-una-pagina` (ya reemplazada por 4fa35fb) y
`wip/cartera-del-dia` (ya traída a main) — se pueden borrar con el permiso del dueño.

---

## P0 — Plata mal contada HOY (y lo que está abierto de seguridad)

Lo que está afectando cifras reales de clientes en este momento.

- [ ] 🧑 🔴 **(Oficina) PAGOS REPETIDOS — confirmar si son copias** (medido el 8-oct, al arreglar el doble toque).
  Un doble toque registraba el mismo cobro dos veces (arreglado: commit 97ba56d + mig 192). Quedan por decidir:
  · **ARNOL ESPRIELLA (IEW93I), 7-oct:** una transferencia de $248.000 (3:58 p.m.) y un efectivo de $248.000
    (3:59 p.m.); hubo un tercero, la copia del efectivo, que ya se borró el 8-oct y le restó $201.000 de semana
    (y $45.000 del acuerdo). Si pagó UNA vez, sobra la transferencia y hay que rehacer su cuenta; si pagó dos,
    hay que devolverle lo que el borrado le quitó. **No tocar hasta que la oficina diga.**
  · **ANDRES PEREZ RUIZ (RNN72H), 9-sep:** $200.000 transferencia y 38 segundos después $200.000 efectivo.
  · **SAMIR LLAMAS (IGJ83I), 1-oct:** dos de $40.000 con 6 segundos de diferencia.
  · **LUIS ANGEL BERMUDEZ (XZI13H):** dos transferencias de $30.000 seguidas, el 25-ago y el 9-sep (pueden ser reales).
  ⚠️ **Al borrar una copia, borrar la que NO llenó semana** (la que dice "saldo a favor"): si se borra la otra,
  el motor resta la semana. Y nunca dos copias con el mismo "llenó la semana N": ahí hay que medir antes.

- [ ] 💻 🔴 **TIEMPO GUARDADO RODADO DOS VECES (medido el 9-oct, al armar el libro de semanas).** En
  `acuerdos_tiempo_rodado` hay 8 decisiones registradas 2 o 3 veces con segundos/minutos de diferencia
  (doble toque o dos personas a la vez; el mismo mal de los pagos repetidos). Las 6 de «cobrar ahora» no
  hacen daño (solo anotan; no crearon deudas: medido). **Las 2 de «rodar al final» SÍ:**
  · **JORGE BELLO (RLT88H)**, 2-oct 22:33 y 22:34 (SERGIO): guardada 18-sep → 2-oct = 2 semanas; quedaron
    **4 rodadas** (y su acuerdo #1 se corrió dos veces: fecha límite 13-nov → 27-nov → 11-dic).
  · **JESUS RAFAEL QUIÑONEZ (RMU62H)**, 18-sep 16:01 y 16:04 (Brandon): guardada 23-ago → 18-sep = 3
    semanas; quedaron **6 rodadas** (ya estaba en la tanda 4 como «rodado dos veces»).
  Efecto: hoy se les exige 2 y 3 semanas MENOS de lo que deben (Cartera y ZALA les muestran menos deuda y
  menos días de mora; el contrato terminaría más tarde). Falta: decisión del dueño para corregirlos (con
  antes/después y rastro) + el candado anti-doble en la ventana de resolver tiempo guardado y en la base.
- [ ] **(Oficina) ANDRÉS BALLESTAS: que firme la LIQ-0032** (cerrada SIN firma el 6-oct, en $0). Cuando
  venga: Liquidaciones → LIQ-0032 → «Firmar en pantalla». Su moto nueva lleva de base los $150.000 que
  dio el 6-oct (están en su perfil como ingreso inicial). Su transferencia de $35.000 del 6-oct quedó
  SIN registrar a propósito (decisión del dueño): cuando aparezca en el Nequi, darle destino.
- [ ] 🧑 🔴 **RAUL GOMEZ SAN MARTIN (IEW56I · COSTA · cobrador Lumar Avendaño) — su acuerdo vence el
  lunes 12 de octubre y no le alcanza. ESPERA DECISIÓN DEL DUEÑO (1 o 2).**
  Medido el **7-oct** con `loQueDebe()`: acuerdo de **$153.500** (semana 14 $116.000 + multa $30.000 +
  migración $7.500), 4 cuotas de $48.000, **abonado $48.000** (1-oct), **le faltan $105.500**. Hoy debe
  **$348.000** ($252.000 de semanas + $96.000 del acuerdo), **8 días en mora**. Si no paga antes del
  12-oct: **$559.500** y 13 días. Paga **$200.000 cada 6-8 días** (menos que su semana de $202.000); Lumar
  lo gestionó todos los días del 1 al 7-oct sin pago.
  🔑 Desde la mig 157 un acuerdo vencido **se sigue cobrando** (queda «INCUMPLIDO» en rojo): no se pierde
  plata; solo se le gasta 1 de sus 3 acuerdos y ya no desbloquea la moto si se la recogen.
  **Las dos salidas que se le mostraron:** **1 (recomendada)** cobrarle normal y dejar que se venza si no
  paga — no se toca el sistema; ya cumple la regla de Recolección (>3 días). **2** ampliarle el plazo
  (p. ej. al 26-oct) con un SQL — NO con el botón de la app, que cobra doble —; no le baja lo que debe.

- [ ] 🧑 **JUAN CARLOS LEAL (YAL68H · RASTREADOR · Carlos Alvarez) — su acuerdo también vence el lunes 12-oct.**
  Medido el 9-oct: acuerdo de $616.500 desde el 14-jul, cuota $58.000; le pidió 10 cuotas ($580.000) y pagó 2
  ($116.000, el 30-sep y el 6-oct). Debe $594.000 ($130.000 de semana + $464.000 del acuerdo), 17 días en mora
  (D-030: semana y cuota juntas, desde el lunes 21-sep). De agosto al 25-sep pagaba solo la semana. Se le explicó
  al dueño; no pidió nada. Al vencer queda INCUMPLIDO y se le sigue cobrando (mig 157).

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

- [ ] 💻 **CAPACITACIÓN DEL TEMA 6 CON EL LIBRO ARREGLADO** (el arreglo del libro se subió el 10-oct, e160c9c;
  el dueño pidió dejar la diapositiva «para después»). Falta: el texto del «Ojo» de la diapositiva 7 (ya es
  cierto, pero conviene decir «el número de arriba»), recapturar `t6-*` con `capturas-capacitacion.mjs` (sesión vía
  `recibe-sesion.mjs`), regrabar el video 5 (`hacer-videos.mjs v5`) y regenerar el PowerPoint (`gen-capacitacion-7oct.js
  6` + `pptx-com.ps1`). Las marcas (círculos) de las diapositivas 6, 9 y 13 hay que volver a medirlas: el
  resumen ahora tiene el bloque rojo de días en mora.

- [ ] 💻 **El libro de semanas + el manual para los supervisores (aprobado el 9-oct: «1») — HECHO salvo la
  capacitación de arriba.** Libro 1c670d6 · tema 6 en PowerPoint (19 diapositivas) + video 5 de 87 s, fuera de git en
  `docs/capacitacion/powerpoint/` y `videos/`. Lo que sigue es la descripción original. Pedido del dueño:
  «no saben identificar las cuentas»; quiere ver cada pago y a qué semana fue, desde cuándo está el cliente
  en el sistema, y un manual o capacitación **bien explicada para los supervisores**.
  · **Dónde:** ficha del cliente → pestaña Pagos: arriba el libro con botón **Lista | Calendario** (escogió
    «las dos»), abajo la lista de pagos de siempre. Desde Cartera, botón «Ver semana por semana».
  · **Primero que las fechas sean ciertas:** las semanas rodadas en su fecha (23 de 24 contratos tienen el
    acuerdo de tiempo con entrada/salida; ZIB64G trae 28 de antes de la app) — esto arregla también la
    frase «Cubre la semana del X al Y» de Cartera (tanda 2, punto 8). Donde el rebobinado no cierra (109 de
    345, casi todos migrados) se muestra el estado de cada semana con los contadores del contrato y se dice
    «no hay detalle de con qué pago»; nunca se inventa.
  · **Terminado =** las dos vistas + el botón · medido en los 345: semanas pagadas del libro = `cajas_pagadas`
    y la de a medias = `caja_actual_pagado` (0 diferencias) · pruebas con un contrato de la app, un migrado,
    uno con rodadas y ZIB64G · 375 px y computador, día y noche · estados de semana en el diccionario de
    ZALA · DESPUÉS el manual (formato `docs/manual-liquidacion/`, capturas reales, para supervisores).
  · Medido el 9-oct: el rebobinado (`rastroDeCubrimiento`) cierra en 236 de 345 (app 132/144, migrados
    104/201); `cajas_llenadas` anota el día en que se llenó cada semana desde el 22-ago.

- [ ] 🧑 **RODAR POR DEUDA (D-044, mig 191) — subido la madrugada del 7-oct, SIN usar todavía con un cliente.**
  · 🧑 Después de la capacitación: prenderle a SERGIO el permiso «Rodar por deuda» (Usuarios). De entrada
    solo lo tiene el dueño.
  · 🧑💻 El primer rodado real hacerlo CON el dueño y revisar: el video grabado DENTRO de la app en su
    celular (la grabadora no se pudo probar en un celular; si falla, quedan los botones Cámara y Galería),
    el documento firmado y el historial del contrato.
  · 🧑 LUIS FERNANDO SOLANO (EXT59H) tiene la cédula «POR DEFINIR»: corregirla antes de rodarle (sale en
    el documento). Su contrato además tiene el empalme abierto (la app avisa).
  · Medido el 6-oct con la vista previa: se pueden rodar 9 de los 10 activos con más de $700.000; RAMON
    BARON (RLI25H) no (su contrato ya pasó su total de semanas; además está quieto).
  · ✅ **VALIDADO DE PRINCIPIO A FIN el 9-oct** (antes del primer uso): 7 deben más de $700.000, se pueden
    rodar 6 (EXT59H, YAL57H, YAL58H, IEW64I, XYZ47H, RLZ94H; RAMON no). Espejo de hoy 345/0 diferencias; el
    "después" simulado en la pantalla = el de la base en los 6, peso a peso. Prueba SQL del dueño (aplicar
    de verdad y deshacer): los 6 BIEN (debe, estado, días, semanas, deudas, acuerdo, liquidación, una sola
    vez, rastro, ZALA); quedaron 0 rodados guardados. Video/firmas/PDF suben a `documentos` (probado con
    archivos de 2 KB a 10 MB, borrados). Ventana recorrida en 375 px sin guardar. Firmas partidas entre dos
    hojas (YAL57H, IEW64I) → arreglado y subido (4974cf4).
  · 🧑 **Datos a corregir ANTES de rodarles:** EXT59H cédula «POR DEFINIR» y sin huella registrada · IEW64I
    sin huella registrada · RLZ94H la cédula de su acompañante dice «NO SABE». En EXT59H ($1.365.000 de
    tarifa atrasada) y RLZ94H ($585.000 de migración) confirmar que esa deuda está bien: el documento la congela.
  · 🧑 **Para el abogado (el dueño decidió el 9-oct NO cambiar el documento por ahora: «solo arréglalo que
    las firmas queden en la misma página y ya»).** Comparado con el contrato, el pagaré y el acuerdo de pago,
    al documento del rodado le falta: nombrar al arrendador (FREDY MORA AVENDAÑO, C.C. 1.047.393.901) y su
    firma (el recuadro queda en blanco) · la huella del cliente (el acuerdo de pago la exige desde el 28-jul) ·
    la cédula de la acompañante y su calidad (codeudora solidaria) · decir qué contrato modifica · una
    autorización para grabar y guardar el video (la de datos del registro, Ley 1581, no cubre video ni voz) ·
    «Hoja 1 de 2 · ROD-xxxx» en cada hoja · guardar el código único (hash) del PDF. Preguntas para el abogado:
    que las semanas de recargo no se lean como intereses sobre la usura; si bastan firma en pantalla + huella
    + video (Ley 527/1999, Dec. 2364/2012) o también papel; el nombre de la empresa (el acuerdo de pago dice
    «Club Moteros de la Costa», los demás «Club Moteros Cartagena»).
  · 💻 Menores, sin arreglar: el video dice «se me ruedan 1 semana» y el documento «1 semana completas»; la
    fecha límite del acuerdo de YAL57H/YAL58H queda más tarde de lo necesario (el acuerdo ya se exigía
    completo, hay que correr más cuotas que las atrasadas; no cambia lo que pagan); la ventana acepta un video
    que no se puede reproducir (si el celular no lee la duración, lo deja pasar); el editor de la partitura
    del acuerdo muestra las deudas «rodada» (no las cobra, pero se podrían enganchar).
  · 💻 Sin hacer: la marca en Reportes («rodado por deuda» en la lista de Cartera) y pasar el rodado a
    saldado cuando termine de pagar las semanas del final. **Plan presentado el 8-oct en la noche (tanda 1,
    punto 3); el dueño pidió guardar antes de responder. ESPERA SU «1» o «2»:**
    1 = las tres piezas (recomendada) · 2 = solo la 1 y la 2 (la 3 queda aquí anotada).
    Medido el 8-oct: **no hay ningún rodado hecho** (la tabla `rodados_por_deuda` está vacía).
    - **Pieza 1 (pantalla):** en todas las listas de Reportes › Cartera, al lado de cómo va el cliente:
      «· deuda rodada al final (ROD-0001)». En la tarjeta «Cómo van pagando hoy», una línea nueva que solo
      sale si hay alguno: «Con la deuda rodada al final del contrato · N» → lista con «ROD-0001 · paga N
      semanas al final · termina aprox. …» y al lado `monto_a_cobrar`. En un día pasado, solo los rodados
      con `fecha` ≤ ese día. Dónde: `ReportesView.tsx` → `comoVa()` (OJO: también la usa la lista «los que más
      deben» del informe para los socios, ~línea 2317, y la frase sale en el Excel) y `abrirDetalleCobranza`;
      la línea nueva en `CobranzaReportes.tsx` (bloque de recolección/taller/retenidas/liquidación). Datos:
      `useRodadosPorDeuda(null)`.
    - **Pieza 2 (base, mig 194):** disparador AFTER UPDATE OF `cajas_pagadas`, `total_cajas` en `contratos`
      (security definer): `cajas_pagadas >= total_cajas` → rodado `vigente`→`saldado`; si vuelve a faltar
      una semana (pago rechazado o borrado) → `saldado`→`vigente`. Es la misma prueba de «terminó de pagar»
      que ya usan `ModalIniciarLiquidacion` y `ModalProyeccionLiquidacion`. Rastro en `contratos_auditoria`
      SIN empezar por «exoneradas N» (la nómina lee ese formato con `rodadasDesdeRegistros`). ZALA ya conoce
      «saldado» (diccionario de la mig 191): no hay estado nuevo. `ContratosView` ya dice «Ya lo pagó».
    - **Pieza 3 (hallazgo, base):** NADA pasa hoy un rodado a `cobrado_en_liquidacion`: la liquidación sí
      cobra lo rodado (`useLiquidaciones` → `rodado_pendiente_liquidacion`), pero el rodado se queda
      «vigente» para siempre y ZALA lo leería como pendiente. Disparador en `liquidaciones` (estados en
      minúscula: `cerrada`, `anulada`): al pasar a `cerrada` → `cobrado_en_liquidacion`; si sale de
      `cerrada` (anulada o devuelta, como la mig 188) → `vigente`. Solo toca rodados `vigente`.
    - **La prueba de la mig 194:** fila de rodado de mentira con `numero = 'ROD-PRUEBA'` puesto a mano (si
      se usa el número por defecto, `nextval` NO se deshace y el primer rodado real saldría ROD-0002);
      completar semanas → saldado; quitar una → vigente; cerrar/reabrir liquidación → cobrado/vigente;
      `raise 'PRUEBA_OK'` para deshacer. El `set_config` de quién corre va FUERA del bloque de prueba (lo
      que falló en el 1er intento de la 193).
    - **Terminado =** `tsc -b` y `npm test` en verde · la mig 194 corrida por el dueño con su PRUEBA OK ·
      la marca vista en Reportes a 375 px (con un rodado de mentira en el navegador, o diciendo que no se
      pudo ver porque no hay ninguno) · subido solo con su permiso.
- [ ] 💻 **CAPACITACIÓN (7-oct) — material en `docs/capacitacion/`.** Lo que se comparte son los 5
  PowerPoint de `powerpoint/` (video adentro, letra incrustada, iconos PNG, «Cómo llegar» en cada pantalla)
  y los 4 MP4 de `videos/` (rearmados: PowerPoint, Windows y celulares los abren). Las fotos, el audio, los
  videos y los PowerPoint NO se suben (datos de clientes). Si la app cambia, se regeneran con los 8 pasos
  del README de esa carpeta.
  · 🧑 **Sin probar en un celular real**: abrir un PPTX y un MP4 en el celular del dueño después de la
    capacitación (se verificó en PowerPoint de Windows y en Chrome).
  · 🧑 Preguntarle cómo le fue y qué preguntas del equipo quedaron sin responder.

- [ ] 💻 🔴 **REPORTES › CARTERA DE UN DÍA PASADO — a medio hacer (D-043, 6-oct).** El dueño aprobó
  "Las dos" y "empieza por el paso 1".
  · ✅ **Paso 1, la base: HECHO.** Mig 190 corrida y verificada el 6-oct: reloj `cartera-cada-noche`
    prendido (55 4 * * * UTC = 11:55 p.m.), 338 contratos anotados el 6-oct que deben $135.322.100
    (= cuenta en vivo). Desde el 7-oct ya se puede escoger el 6-oct.
  · ✅ **Paso 1, la pantalla: TERMINADA el 8-oct** (traída de la rama `wip/cartera-del-dia` a main). Probada a
    375 px con el 6-oct: total $135.322.100 y 270 clientes (= lo anotado esa noche), filtro COSTA $76.074.500 / 167,
    filtro BRANDON $40.310.000 / 72 (= la base), las 7 listas abren con las filas de ese día y sin "Abrir en
    Cartera", Excel "Lo que se debía el 6 de octubre" con total 270 / $135.322.100, y el PDF dice el día, todo en
    pasado y sin el bloque de acuerdos (riesgo que se corrigió: salía con cifras de ese día y título "hoy").
    10 pruebas nuevas (`carteraDelDia.test.ts`).
  · ⏳ **Paso 2, la cuenta hacia atrás** para el 31-ago y el 30-sep (marca "calculado después").
    Medido el 6-oct: reconstruyendo las semanas pagadas hacia atrás con `cajas_llenadas`, 354 de 365
    contratos dieron igual que la foto de la plata del 25-sep; revisar los 11 que no (casi todos
    "pred = foto − 1"). Antes de guardar, medir contra las fotos del 24 y 25-sep y decirle cuántos dan
    exacto. El Resumen ya tiene `estadoAlCierre` (estados, sin plata) que puede servir.
  · ⏳ Después: **#7 Proyección de lo que debería entrar** (lo eligió con la 6). Falta definir con él si
    es por semana, por mes o por grupo — con dibujo.

- [ ] 🧑 🔴 **LIQ-0050 (NELSON ESTUPIÑAN, RMZ58H): corregir su lista de deudas y volver a calcular.**
  Se inició el 11-sep copiando las deudas de ese momento (la del Excel estaba "devuelta" por la mig 130)
  y quedó con el cobro doble: dice −$1.488.000. El cálculo usa la lista guardada en la liquidación, no
  la del sistema: hay que corregirla a mano en Liquidaciones (sigue "calculada", no firmada). Decidido
  con el dueño el 2-oct:
  · Quitar "Deuda de apertura — migración RMZ58H" $870.000 (está dentro del acuerdo).
  · "Saldo de convenio incumplido": $840.000 → **$830.000** (el 26-jul se le acreditaron $10.000). Desde el 8-oct
    (D-046) esto lo hace solo el botón de calcular. NO se recalculó el 8-oct a propósito: con la lista mal sale
    −$1.582.000, otro número equivocado.
  · Agregar "Multa por inmovilización (4 y 7 de julio)" $30.000 (mig 184).
  · Daños que se le cobran: **$387.400 completos** (la orden del taller; el dueño: "todo").
  · ⏸️ **Falta que la oficina confirme:** ¿el motocarro de $50.000 (deuda del 11-sep) es el mismo
    "transporte desde casa a bodega" que ya va dentro de los $387.400 del taller? Si es el mismo, no se
    agrega; si son dos viajes, se agrega. Preguntar también por "ENRRADIADA DE LLANTA DELANTERA" $25.000
    (escrita a mano en la liquidación): el taller ya cobra "rin delantero" y "radios delanteros".
  Al cerrarla, el cierre salda todas las deudas del contrato (incluida la de daños de $387.400) y deja
  una sola deuda con el saldo en contra: no hay cobro doble por cerrar.
- [ ] 💻 ⚠️ **Acuerdo nuevo sobre uno vencido** (riesgo que abre la mig 183, hoy 0 casos): las deudas
  del vencido se quedan dentro de él, así que un acuerdo NUEVO no las recoge, y como se cobra primero
  el activo, lo que falta del vencido dejaría de verse. Decidir si la pantalla de acuerdos lo bloquea
  ("cóbralo o liquídalo") o si el nuevo debe recoger lo que le falta al vencido.

- [x] 💻 **Rediseño de Reportes — TERMINADO el 2-oct** (`docs/REDISENO-REPORTES.md`). Sigue el mismo
  trabajo en el resto de la app, pantalla por pantalla (pedido del dueño, 2-oct): orden propuesto
  Cartera y Cobros → Panel → Mi Día → Clientes y ficha → Contratos → Motos y ficha → Caja, Historial y
  Cobro diario → Liquidaciones → las demás. Lo de abajo es la historia de Reportes. Hechos el 2-oct:
  Resumen, Por grupo, Por admin, el menú de 5 secciones, Flota (Motos, Guardadas, Entregas), Cobranza
  (Cartera, Acuerdos) y Equipo (Nómina, Visitas). Las visitas "sin resultado" quedaron resueltas
  (D-038): eran clientes aprobados con "Aprobar cliente", y su pago en la nómina estaba bien.
  ⚠️ La pestaña **Exportar** (Excel "resumen gerencial" y el PDF) todavía le cuenta a cada cobrador
  todo lo de sus motos de hoy, sin D-035, y su "Mora y cartera vencida" usa la cuenta vieja de la
  pestaña Cartera (sin taller ni liquidación aparte): se arregla al rehacerla.
  Aprobadas como idea, sin construir: **la foto automática de cada noche** (para que "cómo estaban al
  cierre" deje de ser reconstruido) y **"lo que falta por cobrar este mes"**.

- [ ] 🧑 **¿Cómo se les pagó a los cobradores desde la semana del 31-ago?** La pantalla de nómina
  (y el desprendible) mostraba mucho menos de lo real porque traía solo 1.000 registros (D-031,
  arreglado el 2-oct). Ej.: Brandon, semana del 21-sep, $57.500 en vez de $402.500; la semana completa
  $930.000 en vez de $2.006.250. Si se pagó mirando esa pantalla, se les debe la diferencia.
  **Dato del 2-oct:** en la app no hay NINGÚN cierre de nómina guardado (`nomina_cierres` = 0), así
  que nunca se usó "Cerrar y pagar": lo que se les pagó se hizo por fuera. Preguntar al dueño con qué
  cifra les pagó cada semana.

- [ ] 💻 **El registro de cambios del contrato no se guarda en algunas rodadas** (visto el 1-oct). En 7
  de 18 rodadas (las de Lumar, Carlos Ariza y algunas de Carlos Alvarez) no quedó la fila en
  `contratos_auditoria`: el insert falla en silencio (`editarContrato`, `useContratos.ts`), probable
  permiso de SUBADMIN. La rodada sí quedó (y `acuerdos_tiempo_rodado` también). Medir y arreglar.

- [ ] 🧑 **Decisiones pendientes de liquidaciones** (`docs/REVISION-29SEP.md`): (a) las semanas
  rodadas al liquidar ¿se cobran o no? — ✅ 8-oct (D-046): no se cobran, en producción; (b) las 28
  liquidaciones cerradas con el error de la fórmula del ahorro ($1.613.200 de más) + ROGER (cerrada el
  30-sep con $120.000 por encima); (c) ✅ JHEINER PALOMINO LIQ-0076: el ahorro de sus semanas
  financiadas ya se le devuelve solo (D-046), recalculada el 8-oct en −$623.000; (d) MELISSA: el taller confirma daños de RMZ65H y se corrige.

- [ ] 🧑💻 **JESUS RAFAEL QUIÑONEZ (RMU62H): tiempo rodado DOS veces** (6 semanas en vez de 3) + falta un
  candado para que rodar no se registre dos veces. Medir su cuenta con 3 y decidir.

- [ ] 💻 **Saldos a favor más visibles:** propuesta con dibujo (medido: 95 clientes, $5,1M; 10 en
  recolección con plata a favor). Ver `docs/REVISION-29SEP.md`.

- [ ] 💻 **Saldos a favor más visibles para el funcionario** (pedido del dueño, 28-sep). Que al
  ver al cliente lo tenga claro. **Primero analizar** dónde se muestra hoy (ficha, cartera, cobro,
  recibo, Mi Día, ZALA) y dónde lo necesita el que cobra; después proponer el lugar con dibujo.

- [ ] 💻 **KATIA GONZALES (RNK57H): la fecha límite de su acuerdo de base va una semana antes que
  sus cuotas.** El papel dice 26-oct; con $40.000 cada lunes desde el 14-sep (el acuerdo arranca
  la semana siguiente al prorrateo) la última cuota, de $28.000, cae el 2-nov. Medir en todos los
  acuerdos de base y ver qué hace el sistema cuando pasa la fecha límite con saldo, antes de decir
  si es general.

- [ ] 💻 **El rastro "este pago cubrió la semana del X al Y" no salta las rodadas**
  (`fechasDeLaSemana`, `cubrimientoPago.ts`). Solo informativo, no cobra. Ojo al arreglarlo: con el
  número de rodadas solo se sabe CUÁNTAS, no DÓNDE cayeron; `acuerdos_tiempo_rodado` tiene las
  fechas de entrada y salida de la moto.

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

- [ ] 🧑 **(Oficina) BRADER GUZMAN WATSON (YAL65H, LIQ-0078): mostrarle su estado de cuenta y que firme.**
  Su liquidación ya dice **−$237.500** (recalculada el 8-oct con D-046). El PDF de dos hojas que lo explica
  está en `docs/estados-de-cuenta/` (no se sube). Si la policía le quitó la moto ANTES del 26-sep, con esa
  fecha se recalcula y le baja (hoy se le cobran 6 días, del 21 al 26 de sep, $186.000).

- [ ] 🧑 **El 28-sep ZALA mandó el mensaje de mora a 4 clientes que estaban al día**: JORGE LUIS
  TOVAR (dos veces), ORLANDO BARRERA, WALTER BAHOQUE y WILLINGTON GARCIA. Era el defecto de las
  semanas rodadas (D-028, ya arreglado). El dueño decide si se les aclara.

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

- [ ] 💻 **Reportes › Entregas muestra fotos de otro cliente y baja las fotos completas** (visto el 8-oct al arreglar
  el portal del socio). Las fotos de la entrega viven en la MOTO: si se volvió a entregar, la entrega vieja sale con
  las fotos (y la cara) del cliente nuevo. En PRADERA eran 6 de 22. El portal del socio ya lo resuelve con
  `fotosDeLaEntrega` (`utils/portalSocio.ts`) y la copia liviana (`ImgPrivada ancho`); falta usarlos en
  `ReportesView` (miniaturas de 48 × 48 que hoy bajan la foto de ~3.500 KB). Solo con el sí del dueño.

- [ ] 💻 **Rehacer un acuerdo borra el anterior sin dejar cuánto valía** (8-oct, BRADER). El primer acuerdo (8-ago) se
  borró el 8-sep al rehacerlo y no quedó su total en ninguna tabla: hubo que reconstruirlo con la auditoría (cuadró al
  peso). Debería quedar el rastro (regla LA ESENCIA Y EL RASTRO): total, partitura y abonos del acuerdo reemplazado.

- [ ] **(Código) «Cerrar sin firma» no trae la casilla "Sigue con la empresa"** (6-oct). La casilla solo
  sale en el paso de después de firmar; si se cierra sin firma, el cliente queda Retirado y el contrato
  nuevo no lo ofrece (con ANDRÉS BALLESTAS hubo que dejarlo Aprobado a mano). Mostrar la casilla también ahí.
- [ ] **(Código) Los PDF de contratos, pagarés, liquidaciones y acuerdos de tiempo pueden partir una línea
  entre dos hojas** (5-oct). Es el mismo cortador de `utils/pdf.ts` que partía las filas del informe de
  Reportes. Reportes ya usa `cortesSeguros`; los demás siguen igual porque son documentos firmados:
  antes de activarlo ahí, generar un contrato real y mirar sus cambios de hoja.
- [ ] **(Código) Ventanas aparte que usan los colores de la app (`var(--…)`)** (6-oct). Una ventana
  que se abre aparte no tiene el CSS de la app: esos colores no existen ahí. En Entregas el botón
  «Descargar / Imprimir» del reporte de cada entrega quedaba blanco sobre blanco (arreglado el 6-oct,
  junto con «Imprimir reporte para los socios»). Hay más ventanas así en Cobros, Ficha del cliente,
  Liquidaciones, Taller, la línea de tiempo y otras: revisarlas una por una.
- [ ] **(Oficina) DQL79I tiene la tecnomecánica con año 0028** (debe ser 2028-03-25 o parecido). Por eso sale
  como vencida en Flota y en el PDF. Falta la fecha real del papel. Además, el formulario de motos dejó
  guardar un año imposible: conviene que no lo acepte.

- [ ] 💻 **Traer por páginas todo lo que va a crecer** (propuesta del 2-oct, sin aprobar). Supabase
  entrega máximo 1.000 filas sin avisar (D-031). Hoy piden de un solo viaje: Mi Día (429), recepciones
  (268), historial de ubicaciones (274), visitas (156). Con 1.000 motos, Mi Día pasaría de 1.000.
  Propuesta: una sola función "traer todo por páginas" + una alarma si una consulta llega justo a 1.000.

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

- [x] **10-oct · El libro de semanas arreglado** (e160c9c + mig 194 corrida) — «esta» ya no queda en una semana
  vieja cuando hoy cae en tiempo rodado (RMZ68H, DQG87I: la fila rodada dice «hoy»); la fila de moto guardada dice
  las fechas reales (22 de 22: JOSE LUIS «del 13 ago al 9 oct · 57 días»); y un solo número de días en mora, el de
  Cartera, dicho de dónde sale (168 de 168 iguales; JUAN CARLOS LEAL 18 días, desde el lunes 21-sep, semana +
  cuota). Espejo del libro 349/0. Falta la capacitación (P1).
- [x] **10-oct · El acuerdo atrasado se cobra antes que las deudas sueltas** (a1f1bdc + mig 197 corrida, D-049) —
  solo pagos nuevos (el dueño escogió no rehacer cuentas). Prueba adentro con JONATHAN KENDRI (DPU30I): $100.000 →
  $96.000 al acuerdo y $4.000 al repuesto, deshecha; 0 pesos movidos; espejo de la vitrina 349/0. Hoy le cambia a
  4 clientes (JONATHAN, LIBINTO, JARLIN, OSVALDO). JUAN CARLOS LEAL se deja como está (se le va a rodar o resolver).

- [x] **9-oct · Reportes: vuelven a salir los que pagaron una parte** (7ce31c0 + mig 196 corrida, D-048) — «En
  mora» partido en Parcial (entró plata en el período) y No pagó, en el Resumen (hoy y al cierre), el Excel por
  cobrador y por grupo y el PDF. Medido: 132 en mora → esta semana 83/49, este mes 114/18, igual por la cuenta
  aparte. 🔲 Opcional: partirlo también en Cobranza y Portafolios (hoy dicen «En mora» entero) — preguntar.
  Verificado antes: las filas del Excel de Carlos Alvarez = Cartera (93 de 93 en plata; días iguales en los 82
  no retenidos). Hallazgo sin arreglar: «Últ. pago» cuenta como pago la aplicación de saldo a favor o el registro
  interno de la base (14 de 93); Cartera usa la misma regla — preguntar si se cambia.
- [x] **9-oct · Referidos: lista por fecha y filtro de quién lo trajo; lo del equipo ya no suma premios** (3740dbd
  + mig 195 corrida, D-047) — por «recibió la moto» (por defecto) o «se registró»; filtro clientes / equipo / cada
  supervisor; bloque «Los trajo el equipo» (Johan 18, Lumar 12, Carlos Alvarez 11, Carlos Ariza 4, Brandon 3).
  Premios: 18 → 8 alcanzados, 48 → 40 personas que refieren; ninguno de los supervisores había recibido premio.
- [x] **9-oct · Capacitación tema 6 y videos con letras** (f345165) — PowerPoint del tema 6 (19 diapositivas) y
  video 5 (87 s); los 5 videos regrabados con letras (desde el 7-oct salían sin ellas). Revisión de videos: los 5
  BIEN, voz a tiempo ±0,02 s. ⚠️ La diapositiva de los colores tiene un error (ver P1, arreglar el libro).

- [x] **8-oct · El documento de liquidación cabe en una hoja carta** (4fa35fb) — medido imprimiendo de verdad
  con Chrome las 85 liquidaciones reales: antes 12 se partían en dos hojas; ahora las 85 caben en una (la
  más larga ocupa 913 de los 964 px de la hoja). Solo se apretaron los espacios entre bloques; la letra y el
  recuadro de la firma (104 px) quedaron iguales. No cambia ninguna cifra.
- [x] **8-oct · La ventana de hacer un convenio cabe en la pantalla** (42608be) — medida: era una columna de 500 px con
  2.040 px de contenido en un portátil (2.371 en celular); el total, la firma y el botón quedaban abajo sin aviso.
  Ahora título y total con botones fijos, solo el medio se desliza; en computador 920 px y dos columnas (1.218 px),
  en celular "Desliza para ver más". Mismo componente en las 4 puertas. No cambia ninguna cuenta.
- [x] **8-oct · La entrega de la moto se guarda de un solo golpe** (a62d414 + mig 193 `activar_entrega`) — antes
  eran 5 guardados sueltos que no miraban si fallaban (un corte en la mitad dejaba la entrega a medias sin aviso,
  y una foto que no subía se perdía). Medido antes: 130 entregas de la app, ninguna a medias. La prueba de la
  migración entregó y deshizo la de JOSE SANMARTIN (RMY55H). Primer intento de la mig falló al registrarse
  (el "a nombre del dueño" dentro de la prueba quedaba vacío al deshacerla) y no dejó nada: corregido.
- [x] **8-oct · Base de datos de NANO a MICRO** (lo hizo el dueño, +$0/mes) — el aviso "Disk IO Budget" era la
  memoria: 0,5 GB no alcanzaban y la máquina usaba el disco como memoria (Swap). La base pesa 62 MB y el 100 % de
  las lecturas salía de memoria: no eran las consultas. Reinicio de 4:41 a 4:44 p.m.; ningún pago quedó a medias
  ni repetido (el último guardado fue 4:34). 🔲 **Mañana:** mirar si el Swap bajó en las gráficas.

- [x] **8-oct · Un doble toque ya no registra el mismo cobro dos veces** (97ba56d + mig 192, corrida por el dueño a
  las 4:08 p.m.) — candado inmediato en Registrar pago, cobro en la calle y Cobro diario (probado: dos toques en el
  mismo instante = 1 intento) + en la base los pagos de un mismo contrato se procesan en fila. Corregidos: **BRYAN
  BARBOZA (IGJ80I)** semana 4 → "Al día" (la pantalla le cobraba $202.000 que ya pagó) · **YERLIS QUINTERO
  (XZN23H)** 3 semanas del 5-oct → debe $592.000 (antes $1.042.000), 14 días en mora (antes 35) · **JONATAN
  PINEDA (IGA80I)** copia borrada → sin el saldo a favor falso de $202.000. Y el detalle de Cartera ya no dice
  "Corte de la cartera" en los contratos hechos en la app (decía "6 jul" a uno entregado el 11-sep).

- [x] **8-oct · Portal del socio › Entregas** (259b630) — de portada la foto "Persona + moto" (280 px, encuadrada
  arriba), todas las entregas por páginas de 6 dentro de un recuadro con scroll, dos columnas en computador, solo
  fotos de ESA entrega (6 de 22 en PRADERA mostraban a otro cliente) y copia liviana de la portada: de 3.510 KB a
  33-50 KB. Al entrar se bajan 4 fotos, 165 KB.

- [x] **8-oct · Al liquidar se le da al cliente lo justo (D-046)** (237eed8) — el acuerdo resta lo abonado de
  verdad desde su firma; los días guardados que se rodaron no se cobran (día por día, nunca el del corte); si se
  cobra un acuerdo entero se devuelve el ahorro de sus semanas. 22 pruebas con BRADER. Recalculadas desde la app,
  cada una con la fecha que ya tenía y comprobada contra la medición: **LIQ-0078 BRADER −$447.500 → −$237.500 ·
  LIQ-0074 +$371.000 → +$408.000 · LIQ-0025 −$317.900 → −$345.900 · LIQ-0076 JHEINER −$419.000 → −$623.000**
  (en 0025 y 0076 sube lo que deben por el arreglo del 30-sep, "ahorro caja por caja", que ya decía que
  cambiarían al recalcular; el de hoy les baja $50.000 y $56.000). Las 6 "en taller" (0039, 0065, 0066, 0072,
  0077, 0086) salen bien solas cuando la oficina registre la revisión. LIQ-0050 quieta (su lista, en P1).

- [x] **8-oct · Cuadro cobrador × grupo en Reportes (D-045)** — Portafolios › Cruzado (5 vistas + Excel de 5
  hojas), Flota › Motos (Motos y Paradas), enlace en Equipo, Excel de Flota con Debe hoy y Días en mora.
  Cuadró cifra por cifra con Portafolios, Flota y Cobranza. En producción (71d5c75).
- [x] **8-oct · Manual de Reportes v3, por preguntas** — 31 páginas: índice «¿Qué quiere saber?» con 23
  preguntas y una página por pregunta con su camino de botones y la foto real del 8-oct. PDF fuera del repo
  (`docs/manual-reportes/COMO-USAR-REPORTES.pdf`); herramienta nueva `revisar-paginas.mjs`.

| Fecha | Qué |
|---|---|
| 6-oct | **ANDRÉS BALLESTAS: LIQ-0032 cerrada en $0** (decisión del dueño): se le perdonó la deuda vieja ($1.339.000) cruzándola con su ahorro ($910.000) y su base ($300.000); retrovisores fuera. Cerrada sin firma; él quedó Aprobado, sin deuda ni lista negra, con $150.000 de base para la moto nueva. Antes (migs 188) se había devuelto porque se cerró el 14-sep sin validar ahorro ni deudas |
| 6-oct | **Borrar una deuda vuelve a dejar rastro** (mig 189) — la protección de la mig 101 nunca quedó viva en producción: ni un renglón "Deuda ELIMINADA" en toda la base. Se puso de nuevo con una prueba que borra una deuda de mentira y comprueba el renglón (se deshace sola). Verificado: activa, 0 restos de la prueba |
| 6-oct | **Manual de Reportes v2** — números al borde de cada foto con una línea hasta lo que explican y anillo azul donde hay que tocar; las señales se miden en la pantalla real al tomar las fotos (`poner-senales.mjs`). 24 hojas. Y el botón «Descargar / Imprimir» del reporte de cada entrega ya se ve |
| 5-oct | **Reportes: los archivos revisados abriéndolos** — cifras: las 48 filas del Excel de LUMAR iguales a la base, 65 clientes y $43.886.400; toda la empresa $147.436.100 (la única diferencia, $27.000 de ADOLFO, el diario). Arreglado: columnas que salían cortadas en los Excel (en todos los de la app), cada Excel dice con qué filtro se bajó, el total de Acuerdos ponía lo que falta bajo "Lleva abonado", "Cómo va" dice "al día, le toca pagar hoy" / "con plazo extra" / "la moto ya la tiene otro cliente" (las palabras de ZALA), y el PDF de Reportes ya no parte filas entre hojas y cada sección empieza en hoja nueva |
| 5-oct | **Reportes: descargar en cada sección y filtros de a varios** (D-040) — Excel y PDF donde se está viendo, lo que baja es lo que se ve; un cobrador sale partido por grupo y un grupo por cobrador; Reportes recuerda dónde estabas. Manual en `docs/manual-reportes/` (PDF de 24 páginas con pantallas reales) |
| 2-oct | **Reportes terminado: Descargar nuevo** — informe para los socios (PDF o impreso) con las 5 secciones y las mismas cifras de cada pantalla, más tres anexos ya con D-035; listas en Excel. El PDF viejo le daba a cada cobrador plata de motos que no eran suyas ($26.898.200 en septiembre). `docs/REDISENO-REPORTES.md` |
| 2-oct | **XYZ51H y YAV66H vendidas, dadas de baja** (D-039, migs 186·187) — estado nuevo "Vendida": salen de Motos (filtro "Vendidas"), Flota, Reportes, Panel, portal del socio y nómina; su historia se queda. Contrato de JESUS DAVID SABALLET cerrado y él Retirado (sus $260.500 quedan anotados; las 14 semanas no). La entrada al taller de XYZ51H cerrada. Flota 376 → 374, retenidas 42 → 41, lo que se debe hoy −$3.088.500 |
| 2-oct | **Borradas las 3 motos de prueba de USADAS** (mig 185): ZZB01T, ZZC01T y ZZC02T ("MOTO DE PRUEBA - BORRAR", sin contratos ni pagos), con los 2 movimientos de prueba de ZZC02T. La primera vez el seguro encontró esos movimientos y se detuvo sin tocar nada. USADAS queda en 0 motos |
| 2-oct | **Las 8 visitas "sin resultado"** (D-038) — 7 eran clientes aprobados con "Aprobar cliente" en la decisión final, que no marcaba la visita (todos ya con su moto); la otra, ORLANDO JAVIER FRANCO, espera la decisión. Reportes las cuenta como aprobadas o "esperando decisión", y aprobar al cliente ahora marca la visita. Septiembre: 60 aprobadas de 65 (antes 55 y 5 "sin resultado") |
| 2-oct | **Reportes: Equipo nuevo** (D-037) — Nómina: cobros, visitas y referidos por separado (antes "cobros" traía los referidos), si quedó pagada en la app (ninguna lo está), cada cobrador con las motos que ya tenía esa semana, las semanas de cada cobrador juntas desde el 14-sep, filtro de grupo (sin poder pagar recortado). Visitas: resultados, cuántas terminaron en moto entregada y en cuántos días, GPS y fotos, quién las hizo. Motos: volver a escoger el mismo cobrador ya no le cambia la fecha. `docs/REDISENO-REPORTES.md` |
| 2-oct | **Reportes: Cobranza nueva** — Cartera: lo que se debe hoy partido (cuotas del contrato, de acuerdos y deudas), qué tan cobrable es, quién tiene la deuda por grupo y cobrador, los que más deben, la plata a favor de los clientes. Acuerdos: cómo van, los 31 que vencen en 14 días con $6.331.500 por pagar, quién los lleva y los pagos de cada uno. Con filtro de grupo y cobrador, todo se toca. El atrasado de los acuerdos cuadra con Cartera por dos caminos ($21.786.000). `docs/REDISENO-REPORTES.md` |
| 2-oct | **Comprobado: los acuerdos ya reciben** (verificación de D-024). De 26 acuerdos que el 24-sep tenían $0 aunque el cliente pagaba: 11 ya reciben, 11 no han vuelto a pagar, 1 ya está cumplido (BRAYAN) y 3 pagaron después pero debían semanas, que van primero por la regla (LUIS EDUARDO PEREZ DQF58I le faltan $12.000 de la semana, ANTONY CABARCAS IGJ76I y YAIR DIAZ YAL54H debían semanas). El motor está bien |
| 2-oct | **NELSON ESTUPIÑAN (RMZ58H): la multa de inmovilización de julio, aparte** (mig 184) — el 9-jul se le sumaron $30.000 a mano a la deuda del Excel (840 → 870) y el acuerdo se firmó por $840.000. Ahora: Excel $840.000 dentro del acuerdo + multa $30.000 pendiente. Debe $3.227.400, igual en pantalla y ZALA |
| 2-oct | 🔴 **El acuerdo vencido ya no se cobra dos veces** (D-036, mig 183) — la mig 130 devolvía sus deudas a 'pendiente' y desde el 17-sep el acuerdo también se cobraba. 6 clientes, $2.718.000 de más (ARISMEL MUÑOZ RMY48H $889.000 → $447.000). ZALA ya ve el acuerdo vencido (era el pendiente de WILLINGTON y ARISMEL). La prueba espejo ahora elige el acuerdo como la pantalla: 330 comparados, 0 diferencias |
| 2-oct | **Reportes: arreglo corto tras la revisión con agentes** — el Resumen ya no se recorta con filtros que no muestra; "Cargando" en vez de $0 con sello verde; el sello compara de verdad (grupos contra pagos, cada peso repartido, estados contra vigentes); lo pagado al acuerdo de base va a la parte del cliente ($3.644.000 en septiembre); la nómina no deja pagar ni imprimir con datos a medias ni muestra el cierre de otra semana; los pagos de a 1.000 ya no se repiten ni se pierden en el borde (toda la app). `docs/REDISENO-REPORTES.md` |
| 2-oct | **Reportes: Resumen nuevo** — filtros de período, grupo y cobrador que mandan sobre todo lo de abajo; cada número se toca y abre la lista de quiénes son, con "Abrir en Cartera" ya filtrada y descarga; columna "hoy" contra "al cierre" del período; recaudado separado empresa / ahorro / base; sello que revisa que las cifras cuadren; modo oscuro sin textos ilegibles (0 de 119). `docs/REDISENO-REPORTES.md` |
| 2-oct | 🔴 **Recolección y días de mora del acuerdo** (D-030, mig 182) — la moto guardada sin prestada no va a recolección (REGINALDO, JAIRO MARIMON); con acuerdo los días se cuentan sobre el conjunto (REINEL 1 → 15 días); sin mínimo de plata. Cola 36 → 55. Foto de la plata 0, espejo 330/0 |
| 2-oct | 🔴 **Nómina: semanas rodadas y las 1.000 filas** (D-031) — se paga como estaba el día del cobro; la pantalla y el desprendible traen todos los registros (semana del 21-sep: $930.000 → $2.017.500, impreso = pantalla) |
| 30-sep | **Reportes, bloque 2** — visitas suman, clientes con contrato, retenidas por mora separadas, aviso de SOAT separado, motos reasignadas fuera de la cuenta, y las 11 pestañas caben en el celular. `docs/AUDITORIA-REPORTES.md` |
| 30-sep | 🔴 **Liquidación: el ahorro de los días usados caja por caja** (93c442d) — ROGER $30.000 → $4.000, MELISSA +$9.000; 4 abiertas cambian al recalcularlas |
| 29-sep | 🔴 **Reportes dice la verdad (bloque 1)** (D-029) — "en mora" 187 → 65 (igual a Cartera, 0 diferencias), aviso de recolección 50 → 58, los grupos suman el total ($13.297.200 que faltaban), un solo "vs anterior", y el período se mide por cumplimiento (cambia con la fecha). Medido en la app. `docs/AUDITORIA-REPORTES.md` |
| 28-sep | 🔴 **Los días de mora saltan las semanas rodadas** (D-028, commit 879ae45 + mig 180) — 6 clientes salían en mora cuando les tocaba pagar ese día (ELKIN CARDALES, KEVIN, ORLANDO, WALTER, WILLINGTON, JORGE LUIS TOVAR) y 7 con días inflados (LUIS ARMANDO 27 → 6). JORGE LUIS TOVAR tenía su semana saltada: $55.000 → $250.000. Foto de la plata 0, espejo 325/0. Subido en horas de cobro por decisión del dueño |
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
