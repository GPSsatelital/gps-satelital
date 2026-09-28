# Memoria — MotoGestión (GPS Satelital)

En producción desde el 27-jul-2026. **El detalle vive en el archivo de cada tema, no acá** —
una línea por entrada.

## 📋 LOS PENDIENTES VIVEN EN EL REPO

🔴 **`docs/PENDIENTES.md`** — por prioridad (P0 plata mal contada hoy · P1 a medio hacer · P2 gente ·
P3 módulos · P4 limpieza). **Leerla al arrancar.** Acá NO se duplican pendientes.

## ▶️ DÓNDE RETOMAR (28-sep)

🔑 **El estado se MIDE al arrancar**, no se lee: rama, commit, migraciones, pruebas y **qué
herramientas no conectaron** (D-017). EL ESTÁNDAR va 2 de 7 pasos → `docs/ESTANDAR.md` (sigue el
paso 3: arranque/cierre con hooks · foto de la plata · RUNBOOK · CI, que no existe).

1. 🔴 **MELISSA BELLO (LIQ-0056)** — lo último de D-023. Quincenal: base $743.000, puso $404.000 →
   acuerdo $339.000. Cerrada el 14-sep con −$174.000 y en lista negra por cobrarle el acuerdo de base
   entero. Podría quedar a su favor (~+$165.000), pero ANTES revisar si su ahorro de $25.000 y los
   $140.000 de "pagó adelantado y no alcanzó a usar" se cuentan dos veces. Método JORDAN/RICARDO.
2. **Saldos a favor más visibles para el funcionario** (pedido del 28-sep) — analizar dónde se ven
   hoy y proponer el lugar con dibujo, antes de tocar. Está en P1.
3. **La nómina no salta las semanas rodadas** (lo vecino a D-028) — toca plata de cobradores: medir
   y preguntar. P1.
4. **La fecha de fin** → [[fecha-fin-y-semanas-una-sola-verdad]]: 4 reglas confirmadas, los 7
   puntos de implementación SIN aprobar (JHON NAIDER, $9.696.000). Repetírselos y esperar el sí.
5. Después: medir los demás diarios (lo de ADOLFO) · `ampliarConvenio` cobra doble ·
   `docs/PLAN-COMPLETAR-DATOS.md` (4 preguntas abiertas) · EGRESOS.

🧑 Oficina: reimprimir JESUS MARIA (LIQ-0011) y los acuerdos de JORDAN y JORGE DAVID · mirar a
YESID el 2-nov (primera semana de más, [[d026-semanas-de-cierre]]).
🚫 **CESAR (ZHO34G) y RAMON (RLI25H): quietos** hasta que el dueño los saque (21-sep).
🆕 Medir desde el navegador con la sesión del dueño → [[consultar-base-desde-el-navegador]].

### Bitácora corta — el detalle está en el archivo de cada tema

- **28-sep** — Revisando DPU43I (ELKIN CARDALES) y RNK57H (KATIA, cuenta bien): **los días de mora no
  saltaban las semanas rodadas** (D-028, mig 180, espejo 325/0): 6 salían en mora pagando ese día y
  JORGE LUIS TOVAR tenía su semana saltada ($55.000 → $250.000). Subido en día de cobro por decisión
  del dueño. 🔑 El espejo prueba que las dos cuentas son IGUALES, no que estén BIEN.
- **26-sep** — **D-023 cerrada por sus 3 caras** (migs 176·177·178·179: la base no se cobra al que se
  va, lo del acuerdo de base suma a la base, el acuerdo nace solo con el ahorro) →
  [[ahorro-de-quien-es-regla-d023]] · **D-026 completa** (migs 173·174·175) → [[d026-semanas-de-cierre]]
- **25-sep** — Firma a pantalla completa · devolver la base se registraba 2-4 veces (mig 172) →
  [[devolucion-base-doble-registro]] · el que termina no se lleva el ahorro (D-023) · kit de diseño
  25/25 → [[kit-diseno-pruebas-estado]]
- **24-sep** — La regla del ahorro (D-023) · mig 171 (el acuerdo recibe) y D-024 · firmar liquidación
  cerrada · manual de liquidación · 5 herramientas arregladas (`npx`) · CLAUDE.md podado →
  [[estandar-del-proyecto]]
- **22/23-sep** — Estados ya no a mano, préstamo con evidencia (mig 164) →
  [[estados-a-mano-y-evidencia-del-prestamo]] · saldo a favor negativo/trabado (migs 166·167) →
  [[candado-saldo-favor-dos-clics]] · [[saldo-favor-movimiento-atascado]]
- **17-21 sep** — Fuga de documentos cerrada (migs 161·162) → [[fuga-documentos-storage]] · coherencia
  de flota, YERLIS, JORGE TOVAR → [[correcciones-a-mano-sep-2026]] · acuerdo vencido (157-159) →
  [[acuerdo-vencido-se-sigue-cobrando]] · reversa de ELKIN → [[elkin-revertir-liquidacion-cerrada]]
- **1-16 sep** — Nómina (119·120), lavada y llave (122·123), recolección por días vencida (136),
  regresión mig 124, Mi Día y avisos (140-146), caja por cuenta, rodar_tiempo → archivos de tema
- 🔨 **ZALA** — canal probado, faltan plantillas de Meta y **rotar la llave (P0)** →
  [[zala-integracion-mensajes-plan]] · [[zala-vitrina-lectura]]

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
