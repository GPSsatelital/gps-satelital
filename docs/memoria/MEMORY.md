# Memoria — MotoGestión (GPS Satelital)

En producción desde el 27-jul-2026. **El detalle vive en el archivo de cada tema, no acá** —
una línea por entrada.

## 📋 LOS PENDIENTES VIVEN EN EL REPO

🔴 **`docs/PENDIENTES.md`** — ordenados por prioridad (P0 plata mal contada hoy · P1 a medio hacer ·
P2 necesita gente · P3 módulos por construir · P4 limpieza). **Leerla al arrancar cualquier sesión.**
Lo que se cierra se marca y se mueve abajo. Acá NO se duplican pendientes.

## ▶️ DÓNDE RETOMAR (25-sep)

🔑 **NO le creas a ningún documento para el estado: se mide al arrancar.** Rama, último commit,
migraciones, pruebas, y **qué herramientas no conectaron** (regla D-017).

### 🔴 EL ESTÁNDAR — van 2 de 7 pasos · plan completo en `docs/ESTANDAR.md`
Pedido del dueño: *"un camino que se autoalimente y no se pueda desviar… que en una sesión nueva no
empieces a creer cosas que no son"*. Los pasos **3 al 7 están en `docs/PENDIENTES.md` (P1)**.

✅ **Paso 1 (23-sep):** `docs/memoria/` (126 archivos, antes fuera de git · `npm run memoria:respaldar`)
· **`DECISIONES.md`** (21; solo se agrega, nunca se edita) · **`DERRAPES.md`** · llave de ZALA a P0.
✅ **Paso 2 (24-sep):** `CLAUDE.md` de 1.426 → 966 líneas. La bitácora vive en `docs/HISTORIAL.md`
y **ya no miente**: se corrigieron la rama fantasma, las migraciones, el plan perdido y Taskmaster.
✅ **Las 5 herramientas caídas, arregladas** — la causa era `npx`, que las bajaba en cada arranque
(`context7`: 34 s → 1 s). `task-master-ai` se quitó (D-021).

🔑 **Sigue el paso 3:** `npm run arranque`/`cierre` **con hooks** que los disparen solos — sin eso
el protocolo depende de que yo me acuerde. Después: la *foto de la plata* antes de cada migración ·
`RUNBOOK.md` · los candados y el **CI (no existe: no hay `.github/`)**.

### ✅ D-026 COMPLETA el 26-sep (migs 173·174·175) — solo mirar a YESID el 2-nov
### (registro de lo que era:) D-026 — el plan espera el SÍ del dueño
**Nadie termina debiendo** (regla del dueño, 25-sep): si llena su última semana y todavía debe,
sigue pagando su **semana normal** y todo va a deudas → acuerdo, con gabela/mora/recolección igual;
se liquida por cumplimiento solo en $0. **Plan de 4 pasos en `docs/PENDIENTES.md` → P0: NO está
aprobado** — repetírselo y esperar el sí. El paso 1 (candado: no ofrecer cumplimiento mientras
deba) es rápido. Pasos 2-4 (motor sin freno al terminar, semanas de cierre, ZALA) **antes del
~19-oct**: YESID paga su semana 65 ~26-oct; LUIS SOLANO debe $1.455.200 a 6 semanas.
→ [[d026-semanas-de-cierre]] · ya hecho: el ahorro del que termina pagó la moto (D-023, f5c2ce1)
→ [[ahorro-de-quien-es-regla-d023]]

### ▶️ DESPUÉS: el arreglo de la fecha de fin
🔴 **[[fecha-fin-y-semanas-una-sola-verdad]]** — nació de su pregunta *"¿cómo puede ser que se le
muestre algo y se le cobre otra cosa?"*. La fecha de fin es **decorativa** y las semanas son las
que cobran; la gente la ha editado creyendo que cambiaba el contrato. **Las 4 reglas están
confirmadas por él, pero la lista de 7 puntos de implementación NO está aprobada** — repetírsela
y esperar el sí antes de escribir una línea. Trae plata: JHON NAIDER son $9.696.000 que hoy no se
le van a exigir.

Después, por orden:
1. **Medir los demás contratos diarios** (P0, 5 minutos): ¿a cuántos les pasa lo de ADOLFO
   ($27.000 a tarifa y $0 a ahorro pague lo que pague)? Nunca se midió.
2. **`ampliarConvenio` cobra doble** — defecto de plata conocido; toca el motor.
3. **Alimentar el sistema con lo que le falta** → `docs/PLAN-COMPLETAR-DATOS.md` (medido: 168
   contratos sin papeles, **82 clientes sin firma de habeas data**, 97 motos sin SOAT). Tiene
   **4 preguntas abiertas** al final que hay que resolver con él antes de construir.
4. **EGRESOS** — el módulo grande de la pizarra; varias sesiones.

🚫 **CESAR (ZHO34G) y RAMON (RLI25H): el dueño pidió dejarlos quietos** (21-sep). No retomarlos
sin que él los saque.

> 🆕 **Ahora se puede consultar la base y probar funciones reales desde el navegador**, con la
> sesión del dueño ya abierta en `localhost:5173`. Las tareas de MEDIR ya no hay que pasárselas
> como consulta para pegar → **[[consultar-base-desde-el-navegador]]** (incluye las 3 trampas).

🔒 **21-sep: LA FUGA DE DOCUMENTOS QUEDÓ CERRADA, las 3 puertas.** Bodega en privado (enlace viejo
= **400**, camino nuevo = **200 · 783.675 bytes**), el VISITADOR fuera (mig 161) y el registro de
Supabase apagado + `mi_rol() is not null` (mig 162). Comprobado midiendo en producción con 8
documentos reales → [[fuga-documentos-storage]] · `docs/COMPROBAR-ANTES-DE-CERRAR-BUCKETS.md`.

**Se retoma en `docs/PENDIENTES.md`.** Lo más urgente de P0: CESAR (ZHO34G) y RAMON (RLI25H)
necesitan que el cliente venga para rodarles el tiempo; los $297.000 de ADOLFO; los 8 acuerdos
viejos sin lista. Y la **regla del sobrante**, que se decidió esperar hasta el ~26-sep a propósito.

### Bitácora corta — el detalle está en el archivo de cada tema

- **26-sep** — **D-026 completa en 4 pasos**: candado de cumplimiento (173), motor sin freno al terminar
  (174), semanas de más en la cartera con mora y recolección (opción A), y la vitrina de ZALA y Mi Día
  (175, espejo 325/0) → [[d026-semanas-de-cierre]]
- **25-sep** — Firma a pantalla completa (b210b16) · **devolver la base se registraba 2-4 veces**:
  $2.082.000 corregidos + mig 172 con candado → [[devolucion-base-doble-registro]] · **el que termina
  ya no se lleva el ahorro** (D-023, f5c2ce1) · de ahí **D-026** (plan sin aprobar) · kit de diseño
  25/25 real → [[kit-diseno-pruebas-estado]]
- **24-sep (tarde)** — 🔴 **¿De quién es el ahorro?** La regla que faltaba (**D-023**): es de la
  empresa **solo si el contrato termina bien**; si liquida sin finalizar, se devuelve. De ahí salen
  **3 defectos por $13,8M** (el peor: la liquidación **no mira el motivo** y le devolvería
  **$3.801.000** a YESID, que está a 5 semanas). Se corrigió **solo JORDAN** —
  −$244.000 → **+$157.000** con la fecha real del lunes 21, firmado y listo para su moto nueva
  → [[ahorro-de-quien-es-regla-d023]]
- **24-sep (noche)** — **Mig 171 corrida**: el acuerdo por fin recibe ($48.000 donde iba $0, cero
  pesos movidos en 366 contratos) · la **169 se descartó** por duplicar un aviso que ya existía
  (**D-024**) · **botón nuevo**: firmar en pantalla una liquidación ya cerrada — eran **24 de 44
  cerradas sin ninguna firma, $11.276.500** · **manual de liquidación** (18 hojas A4, pantallas
  reales) con el **candado** que avisa si un botón cambia de nombre y el manual queda mintiendo
- **22-sep** — Los estados ya no se cambian a mano (fuera el selector de Motos y los 2 botones de
  Contratos) · el menú de novedades dice si el contrato SIGUE COBRANDO o se suspende · la moto
  prestada exige 6 fotos + km al salir y al volver (mig 164). Disparado por JORDAN/DQL76I
  → [[estados-a-mano-y-evidencia-del-prestamo]]
- **24-sep** — Las 5 herramientas caídas (la causa era `npx`) · `CLAUDE.md` deja de ser un diario:
  1.426 → 966 líneas, la bitácora a `docs/HISTORIAL.md` → [[estandar-del-proyecto]]
- **23-sep** — IEW57I: el saldo a favor **trabado** (LUIS 8 días, RAFAEL 1) y el **rastro** de de
  dónde viene cada peso (mig 167 · `saldoFavor.ts`) → [[saldo-favor-movimiento-atascado]]. De ahí
  salió **EL ESTÁNDAR** → [[estandar-del-proyecto]]
- **22-sep** — KEVIN: el saldo a favor podía ser **negativo** y la pantalla lo tapaba con
  `Math.max(0)`; candado en la base (mig 166) + la empresa asumió sus $195.000
  → [[candado-saldo-favor-dos-clics]]. De ahí salió **la fecha de fin que no cobra nada**
  → [[fecha-fin-y-semanas-una-sola-verdad]]
- **21-sep** — Fuga de documentos, 3 puertas: enlaces sin firmar, el **registro de usuarios de
  Supabase ABIERTO**, y `NULL IS DISTINCT FROM` (migs 161·162). Nadie había entrado
  → [[fuga-documentos-storage]]
- **19-sep** — Revisión de coherencia de toda la flota · YERLIS (saldo aplicado dos veces, mig 160)
  · JORGE TOVAR (día de pago mal migrado) · pago de $162.000 movido de placa
  → [[correcciones-a-mano-sep-2026]] · [[candado-saldo-favor-dos-clics]]
- **17/18-sep** — El acuerdo vencido se sigue cobrando (migs 157-159) · ELKIN: reversa de liquidación cerrada → [[acuerdo-vencido-se-sigue-cobrando]] · [[elkin-revertir-liquidacion-cerrada]]
- **15/16-sep** — Los 6 pendientes dictados (155·156) · permiso `rodar_tiempo` · caja por cuenta bancaria · nómina (150-154) → [[pendientes-16-sep]] · [[excedente-base-a-saldo-favor]] · [[permiso-rodar-tiempo]] · [[caja-por-cuenta-bancaria]]
- **10/12-sep** — **Mi Día** + `public.pendientes` + avisos al celular (140-146) · EDINSON: la ventana de prepago se tragaba el acuerdo (149) → [[flujo-diario-de-cada-persona]] · [[avisos-al-celular-push]] · [[motor-ventana-prepago-al-final]]
- **7/8/9-sep** — Taller · deudas etiquetadas · recolección por días vencida (136) · **regresión mía de la mig 124** → [[taller-trabajo-y-cobro]] · [[regresion-mig124-convenios]] · [[deudas-etiquetadas-a-donde-va-la-plata]]
- **1/2/3-sep** — Nómina y su freno (119·120) · lavada y llave (122·123) · SUBADMIN validado (121) → [[regla-nomina-cobradores]] · [[auditoria-subadmin-nuevos]]
- 🔨 **ZALA** — canal probado (10-sep), los 10 textos vivos. Falta que Meta apruebe las plantillas y **rotar la llave (ahora P0)** → [[zala-integracion-mensajes-plan]] · [[zala-vitrina-lectura]]

## 🚨 Estado vivo

- 🔴 **[Las DOS cuentas de días](dos-cuentas-de-dias-mora.md)** — "en mora" (manda, no la reinicia un abono) vs "desde su último pago" (informativa). Nunca decir "días sin pagar" a secas.
- 🔴 **[Rompí el convenio ya definido](regresion-convenio-y-reglas-de-seguridad.md)** — LEER ANTES DE TOCAR CÓDIGO.
- ✅ **[Correcciones a mano — el método](correcciones-a-mano-sep-2026.md)** — leer la función que hizo el daño e invertirla; parchar nunca regenerar; antes/después siempre (un "success" no prueba el commit).
- 🔨 **[Mapa financiero + PARTITURA](mapa-financiero-y-partitura.md)** — `repartoPago.ts` = espejo del motor v2. 🔲 fase D · egresos.
- 🔴 **Reportes 25-ago** — 78 convenios activos · $64,4M pactados · 25 sin abono · 45 guardadas, 463 días sin producir.
- ✅ **[El acuerdo vencido se sigue cobrando](acuerdo-vencido-se-sigue-cobrando.md)** · **[El excedente de la base a saldo a favor](excedente-base-a-saldo-favor.md)** · **[Caja por cuenta bancaria](caja-por-cuenta-bancaria.md)** · **[Permiso rodar_tiempo](permiso-rodar-tiempo.md)**.
- 🔨 **[Cambio de moto](graduacion-cambio-moto-flujo.md)** (114+115) sin probar · **[Liquidaciones: firma + REGLA MADRE](liquidacion-firma-digital-y-desglose.md)** · **[Definición cerrada](liquidaciones-definicion-cerrada.md)** · 🔴 **[83 hallazgos](liquidaciones-auditoria-y-huecos.md)**.
- 🔨 **[Diarios: ahorro no acumula](bug-diario-ahorro-no-acumula.md)** — no más diarios, motor NO se toca.
- ✅ [Recolección por días vencida](bucket-recoleccion-cuenta-dias-equivocados.md) · [Rol ANALISTA](rol-analista-solo-lectura.md) · [Rol VISITADOR](rol-visitador-y-fluidez.md) · [Convenios: ahorro semanas financiadas](convenios-ahorro-semanas-financiadas.md) (`ampliarConvenio` cobra doble) · [Convenios revisados](convenios-revision-completa.md) · [BASE INICIAL](base-inicial-circuito-completo.md) · [Cartera: "¿cuánto debe?" es UNA función](cartera-cuanto-debe-una-sola-funcion.md) · [Cesión de contrato](cesion-de-contrato.md) · [Plata cobrada dos veces](cartera-doble-cobro-deuda-vs-caja.md) · [La caja de raíz](caja-fecha-del-banco.md).
- 🔨 [Saldo a favor COSTA](saldo-favor-y-caja-descuadre.md) · ✅ [Permisos: dos capas UI+RLS](permisos-dos-capas-rls.md) · 📍 [Inmovilizar + convenios](regla-inmovilizar-y-convenios.md) · [Retenciones + descargas](retenciones-rotas-y-filtros-descargas.md) · [Go-live](estado-golive-27jul.md) · [Entrega](entrega-golive-lunes27.md).

## 🔴 Dinero y seguridad (lo que no se puede volver a romper)

- 🔴 **[Fuga de documentos](fuga-documentos-storage.md)** — 3 puertas (migs 071·161·162) + **cómo auditar `pg_policies` sin equivocarse**. 🔲 falta cerrar los buckets.
- 🔴 **[Devolver base se registraba 2-4 veces](devolucion-base-doble-registro.md)** (25-sep, mig 172) — $2.082.000 de más en 3 clientes, corregido; ahora una transacción con candado.
- 🔴 **[Saldo a favor: ni dos veces, ni negativo, ni trabado](candado-saldo-favor-dos-clics.md)** (migs 160·166·167) — KEVIN estuvo en **−$195.000 tres semanas** con la pantalla diciendo "$0" (`Math.max(0)` lo tapaba). 🔑 **La guarda de la PANTALLA no protege plata: va en la BASE.**
- ✅ **[El rastro del saldo a favor](saldo-favor-movimiento-atascado.md)** — `rastroSaldoFavor()` FIFO, una sola fuente para las 3 pantallas; dice de qué pago vino cada peso. ⚠️ el historial muestra 10 pagos pero el FIFO usa TODOS. Trae las 2 trampas del SQL de corrección.
- ✅ **[La ventana de prepago se tragaba el acuerdo](motor-ventana-prepago-al-final.md)** · **[La acompañante firma el acuerdo](convenio-firma-acompanante.md)**.
- **[Base inicial ≠ ahorro acumulado](base-inicial-vs-ahorro-acumulado.md)** · **[REGLAS del dinero](reglas-dinero-referencia-efectivo.md)** · **[Batería cicloPago](bateria-pruebas-ciclopago.md)** (`npm test` antes de desplegar plata).
- **Fecha real del pago** — `fecha` = cuándo PAGÓ · `fecha_registro` = cuándo se DIGITÓ · el motor reparte por `created_at` (migs 091·092). ⚠️ El plan `humble-dazzling-phoenix.md` **se perdió** (2º caso); esta línea es lo que quedó.
- **[Unificar deuda+convenio: DESCARTADO](unificar-deuda-convenio-descartado.md)** · [Sobrante doble ✅](bug-convenio-cobro-doble.md) · [Transferencias ✅](revision-adversarial-transferencias.md) · [Aplicar saldo a favor ✅](bug-aplicar-saldo-favor.md) · [Deuda fantasma 🔨](descuadres-deuda-fantasma-migracion.md).

## Reglas de trabajo

- 🔴 **[Que no quede mocho](feedback-nada-queda-mocho.md)** (23-sep) — **antes** de escribir la primera línea se acuerda qué significa TERMINADO, como lista medible; al cerrar se responde una por una con el número real, más lo que NO quedó cubierto. Un `success` o un build verde no son prueba.
- 🔴 **[PREGUNTAR hasta que quede TOTALMENTE claro](feedback-preguntar-hasta-que-quede-claro.md)** (19-sep) — repetir el plan con SUS números y esperar el sí; preguntar el POR QUÉ, no solo el qué.
- 🔴 **[LA ESENCIA Y EL RASTRO](regla-esencia-y-rastro.md)** · 🔴 **[NO romper lo que ya funciona](regla-no-romper-lo-que-funciona.md)** · 🔴 **[No gastar tokens en agentes](feedback-no-gastar-tokens-en-agentes.md)** (manda sobre ultracode) · 🔴 **[Resumen final para un niño](feedback-resumen-final-para-nino.md)** · **[Explicaciones simples](feedback-explicaciones-simples.md)** · 🔴 **[Guardar y buscar SIEMPRE en memoria](regla-memoria-siempre.md)**.
- **[Reusar el flujo existente](regla-reusar-flujo-existente.md)** · **[Validar SUBADMIN](auditoria-subadmin-nuevos.md)** · **[Auditoría RLS](auditoria-permisos-rls-julio2026.md)** (toda migración al repo Y a Supabase) · **[Español / inglés](comunicacion-espanol-ingles.md)** · **[Revisar antes de recap](regla-revisar-antes-de-recap.md)** · **[Skills de diseño](regla-usar-design-skills.md)** · **[JSX: funciones anidadas](regla-jsx-funciones-anidadas.md)**.

## Módulos y features

- **[Libro de cajas — motor v2](libro-de-cajas-motor-v2.md)** (el Diario queda FUERA) · 🔨 **[7 más de RASTREADOR](migracion-7-rastreador-dias-reales.md)** · **[Migración COSTA](migracion-costa-siembra.md)** · **[Empalme](empalme-migracion-construido.md)** · **[Migración de grupos](migracion-grupos-datos-reales.md)**.
- **[Navegación + performance](nav-y-performance.md)** · **[Línea de tiempo](linea-de-tiempo-historial.md)** · ✅ **[Préstamo + alquiler + rodar](prestamo-liquidacion-verificados.md)** · **[Guardado de la moto](guardado-moto-validacion.md)** · **[Visita: GPS obligatorio](visita-gps-obligatorio.md)** · **[Inmovilizaciones + 6ª foto](inmovilizaciones-redesign-foto-persona.md)** · **[Unificar recepción](unificar-recepcion-y-permisos.md)**.
- **[Cartera: teléfono, grupo, admin](cartera-telefono-grupo-admin.md)** · **[Convenios en_convenio](convenios-en-convenio-sin-commitear.md)** · **[Reporte de entregas](reporte-entregas-y-pdf-fix.md)** · **[Documentos del contrato](flujo-documentos-contrato-pdf.md)**.
- 🔴 **[REGLA DE NÓMINA](regla-nomina-cobradores.md)** · 🔨 **[Flujo operativo + pendientes](flujo-operativo-y-pendientes.md)** · **[Egresos — diseñado](modulo-egresos-disenado.md)** · **[Informes gerenciales](modulo-informes-gerenciales.md)** · ✅ **[Portal del socio](portal-socio-rediseno.md)**.

## Documentos, diseño, entorno

- **[Manual de operación en PDF](manual-operacion-pdf.md)** (el PDF NO se versiona: lleva datos de clientes) · **[Flujo diario de cada persona](flujo-diario-de-cada-persona.md)** · **[Capacitación v2](capacitacion-material-v2.md)**.
- **[PLAN sistema de diseño](plan-sistema-diseno.md)** · **[Rediseño visual — retomar F3 Cartera](rediseno-visual-f1.md)** · **[Compactar densidad móvil](compactar-densidad-movil.md)** · **[Brief de marca/logo](../../../../Documents/GitHub/gps-satelital/docs/BRIEF-DISENO.md)** (falta logo).
- 🔴 **[Trabajar en dos PC con un disco](migrar-proyecto-a-otro-pc.md)** — disco `PY_ofc` (D:) con `1-TRAER.bat` / `2-LLEVAR.bat`. **Syncthing se probó y FALLÓ.** Nunca Claude en los dos PC a la vez.
- 🆕 **[Consultar la base desde el navegador](consultar-base-desde-el-navegador.md)** — medir y probar funciones reales con la sesión del dueño, sin pasarle consultas. Con sus 3 trampas.
- **[Pruebas del kit de diseño: qué corre y qué no](kit-diseno-pruebas-estado.md)** (25-sep) — kit 2.4.0, 25/25 real; Playwright en ~/scripts · **[Formatos .docx](plantillas-docx-generador.md)** · ✅ **[Correo Zoho](zoho-correo-corporativo.md)** (`mx.zoho.com`, no `mx1`) · 🔴 **[Browser pane bloqueado por z.ai](verificar-ui-sin-browser-pane.md)** · **[Huellero DigitalPersona](estado-huellero-digitalpersona.md)** · **[Hardware de oficina](decisiones-hardware-oficina.md)** · **[Herramientas por PC](herramientas-por-pc-paridad.md)**.

## Historial (julio, resuelto)

- **[Pruebas B5](pruebas-b5-flujos-operativos.md)** · **[Logins reales](pruebas-roles-reales-golive.md)** (SUBADMIN = Brandon Rojas) · **[Editar cliente revertía estado](bug-editar-cliente-revierte-estado.md)** · **[Gabela día-0](fix-gabela-dia0-sin-commitear.md)** · **[Cartera: fixes de dinero](cartera-fixes-dinero-julio2026.md)** · **[cicloPago y convenios](estado-ciclopago-convenios.md)** · **[Ficha del cliente](estado-ficha-cliente-julio2026.md)** · **[Usuarios y seguridad](estado-usuarios-seguridad-julio2026.md)** · **[Rediseño contratos/liquidaciones](rediseno-contratos-liquidaciones-julio2026.md)** · **[Roadmap de la pizarra](roadmap-pizarra-pendientes.md)** · **[Sesión 9-jul](sesion-9jul-bugs-operativos.md)** · **[Sesión 10-jul](sesion-10jul-pagos-syncthing-empalme.md)**.
