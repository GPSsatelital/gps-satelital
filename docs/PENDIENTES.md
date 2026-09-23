# PENDIENTES — MotoGestión

Lista viva y **ordenada por prioridad**. La idea es que nada se pierda a medida que se desarrolla.

- **Cómo se usa:** se agrega abajo de su bloque, se marca `[x]` al cerrarlo y se mueve a "Cerrados"
  con la fecha. Si algo sube o baja de prioridad, se mueve de bloque y se dice por qué.
- **Quién lo hace:** 🧑 = tarea del dueño / la operación · 💻 = tarea de desarrollo.
- 📋 = salió de la pizarra del dueño (foto del 19-sep).
- ⚠️ **Por definir** = está anotado con una lectura provisional, pero **antes de construirlo hay que
  preguntarle al dueño la pregunta que dice ahí**. No arrancar sin esa respuesta.
- Última revisión: **22-sep-2026**.

---

## P0 — Plata mal contada HOY

Lo que está afectando cifras reales de clientes en este momento.

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

- [ ] 🧑 **Los 53 convenios viejos:** desglose uno por uno contra el acuerdo firmado.

- [ ] 🧑 **ESTARLIS CHIQUILLO** — $368.000 contra $563.000 sin conciliar.

---

## P1 — A medio hacer: cerrar antes de abrir otra cosa

- [ ] 💻 🔴 **El botón de saldo a favor sigue pudiendo trabar la plata de un cliente.**
  Si se aplica saldo cuando el cliente **no debe nada**, el motor no tiene dónde meterlo y queda
  una fila en ceros que el candado de la mig 160 cuenta "en vuelo" por su valor completo — el
  saldo queda en $0 disponible **para siempre**, mientras la ficha se lo sigue mostrando. Le pasó
  a LUIS (IEW57I, 8 días) y a RAFAEL (DPU52I, 1 día); los 2 se destrabaron a mano el 23-sep.
  Falta: **(a)** que no se pueda crear ese movimiento si no hay nada pendiente que cubrir,
  **(b)** el **chequeo #6** de coherencia (*movimiento de saldo atascado* — la fórmula actual no
  lo ve: cero menos cero da cero), **(c)** el texto de `lineaTiempo.ts`, que con el aplicado en 0
  dice *"sobraron $110.000 y siguen como saldo a favor"*.
  → [[saldo-favor-movimiento-atascado]]

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

- [ ] 🧑 **ZALA:** que Meta apruebe las 10 plantillas · cambiar la llave (pasó por el chat) ·
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
