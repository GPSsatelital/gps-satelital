# PENDIENTES — MotoGestión

Lista viva y **ordenada por prioridad**. La idea es que nada se pierda a medida que se desarrolla.

- **Cómo se usa:** se agrega abajo de su bloque, se marca `[x]` al cerrarlo y se mueve a "Cerrados"
  con la fecha. Si algo sube o baja de prioridad, se mueve de bloque y se dice por qué.
- **Quién lo hace:** 🧑 = tarea del dueño / la operación · 💻 = tarea de desarrollo.
- 📋 = salió de la pizarra del dueño (foto del 19-sep).
- ⚠️ **Por definir** = está anotado con una lectura provisional, pero **antes de construirlo hay que
  preguntarle al dueño la pregunta que dice ahí**. No arrancar sin esa respuesta.
- Última revisión: **19-sep-2026**.

---

## P0 — Plata mal contada HOY

Lo que está afectando cifras reales de clientes en este momento.

- [ ] 🧑 **CESAR ESCUDERO (ZHO34G) y RAMON BARON (RLI25H) — falta rodarles el tiempo.**
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

- [ ] 🧑 **Los 53 convenios viejos:** desglose uno por uno contra el acuerdo firmado.

- [ ] 🧑 **ESTARLIS CHIQUILLO** — $368.000 contra $563.000 sin conciliar.

---

## P1 — A medio hacer: cerrar antes de abrir otra cosa

- [ ] 💻 **La regla del sobrante** (decidida **esperar hasta el ~26-sep, a propósito**).
  Cuando a un cliente le sobra plata después de cubrir semana, deudas y la cuota del acuerdo, hoy
  adelanta la semana de los próximos 3 días. Propuesta: que **baje el acuerdo primero**. Se
  pospuso porque el motor se tocó 3 veces en 2 días y el adelanto se volvió visible recién el
  18-sep: había que verlo con casos reales antes de decidir. → [[acuerdo-vencido-se-sigue-cobrando]]

- [ ] 💻 **Un pago de $1.000 revive un acuerdo incumplido.** `aplicar_pago_confirmado` le pone
  `fecha_limite = hoy + cuotas_faltantes × días`. Con la regla nueva de inmovilizar, alguien podría
  abonar cualquier cosa y salirse de la cola. El dueño: *"lo definimos cuando sea necesario"*.

- [ ] 💻 **El estado de cuenta IMPRESO no muestra la semana adelantada.** En pantalla ya se ve
  (`d01c7a9`); en el papel que se le entrega al cliente, no.

- [ ] 💻 **`aplicarSaldoFavor` trabaja en dos tiempos desde el cliente** (crea el movimiento y
  después le descuenta el saldo, en dos llamadas). La mig 160 le puso candado, pero la raíz sigue:
  debería ser **un solo RPC en una transacción**.

- [ ] 💻 **La batería de coherencia debería correr sola.** Los 10 chequeos del 19-sep (reparto que
  no suma, lista de acuerdo que no cuadra, saldo negativo, cajas imposibles…) se corrieron a mano y
  encontraron 3 problemas reales. Deberían ser un aviso más de `public.pendientes`, no una consulta
  que alguien se acuerde de correr.

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

- [ ] 💻 **Cesión DPU50I** hecha a mano, sin flujo · **Storage: 20 `<a href>` directos** (fuga de
  documentos) · **8 partidas de caja sin grupo**.

- [ ] 💻 **Fechas UTC en TallerView** (se ven corridas un día).

---

## P2 — Necesita gente, no código

- [ ] 🧑 **NÓMINA: los 63 atrasados de BRANDON** (~$330.750) sin verificar, y **nadie ha cerrado
  una semana todavía** — el primer cierre es **irreversible**.

- [ ] 🧑 **Punto 2 de la nómina:** si la semana de una moto guardada debe tener precio propio en vez
  de seguir pegada al atrasado. Abierto desde el 1-sep.

- [ ] 🧑 **ZALA:** que Meta apruebe las 10 plantillas · cambiar la llave (pasó por el chat) ·
  formato de la plata.

- [ ] 🧑 **Probar con gente real:** Mi Día con un SUBADMIN · los avisos push en un Android ·
  el rol ANALISTA · el portal del SOCIO · los pasos 3 a 6 del wizard en una entrega de verdad.

- [ ] 🧑 **Avisarle a quien registra clientes** del selector *"¿Alguien del equipo lo trajo?"*: si
  nadie lo marca, esos $30.000 de comisión no se pagan y nadie se entera.

- [ ] 🧑 **45 motos guardadas, 463 días sin producir.** Que el sistema exija gestionarlas.

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

- [ ] 💻 **Aviso en "Cerrar y pagar" de la nómina** cuando la semana todavía no terminó. Hoy deja
  cerrar una semana a medias y **no se puede deshacer**.
- [ ] 💻 **`dias_mora` puede contar un hueco de cajas que un acuerdo ya cubrió.** Un solo caso en
  toda la flota (JORGE TOVAR, y se resolvió corrigiéndole el día de pago). **Si aparece un segundo
  caso, ahí sí arreglarlo de raíz** — con dos casos se sabe qué tienen en común.
- [ ] 💻 **Los diarios están fuera del motor de cajas** y su ahorro no acumula bien. Decisión: no se
  crean más diarios y el motor no se toca. Pero quedan activos.
- [ ] 💻 **`cajas_previas` puede superar a `total_cajas`** (3 contratos hoy). Viene de la migración y
  nadie lo valida.
- [ ] 💻 📋 **Scroll lento en el Reporte de Entregas.** La pantalla va pesada. Se mide con el
  navegador y se arregla — probablemente sea que arma la lista completa sin ventana de scroll.

---

## Cerrados recientemente

| Fecha | Qué |
|---|---|
| 19-sep | **Candado del saldo a favor** (mig 160) — ya no se puede aplicar dos veces |
| 19-sep | YERLIS: doble clic deshecho · JORGE TOVAR: día de pago corregido · pago movido de IEW59I a IEW65I |
| 18-sep | **El acuerdo vencido se sigue cobrando** — 4 piezas (migs 157·158·159) |
| 18-sep | La semana adelantada por fin se ve en pantalla |
| 17-sep | ELKIN: liquidación cerrada revertida · RONAL: moto equivocada corregida |
| 16-sep | Los 6 pendientes dictados (wizard, excedente de base, fiscalía, liquidaciones…) |
