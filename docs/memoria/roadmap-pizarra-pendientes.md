---
name: roadmap-pizarra-pendientes
description: "Lista de pendientes de la pizarra del usuario (foto 13-jul), clasificada por urgencia — roadmap para dejar el programa operativo"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

El usuario fotografió su pizarra de pendientes (13-jul-2026). Objetivo: clasificar de más a menos urgente e ir haciéndolos para dejar el programa operativo (que solo queden arreglos menores). Orden ACORDADO con el usuario:

**✅ TIER 1 — datos reales mal AHORA:**
1. **Revisar Pago XYZ47H** — ✅ RESUELTO (se cobra desde Inmovilizaciones "cobrar para recuperar", confirmado por el usuario).
2. **Convenios repetidos XZN22H** — 🔨 EN CURSO. Causa raíz: 2 rutas crean convenios con chequeo lee-antes-de-insertar (carrera) + ModalConvenio usaba `.single()` que revienta con >1 fila (dejó pasar el 3º). Se crearon 3 activos a mano en 9 min (901500/13, 809000/12, 901500/13), 0 abonos. FIX: (a) SQL limpieza — dejar be3af621 ($901.500/13, confirmado por usuario) + borrar los otros 2; (b) mig 050 índice único parcial `un solo convenio activo por contrato`; (c) frontend: `if(guardando)return` en ModalConvenio, `.single()`→`.limit(1)`, traducir error 23505 a "Ya existe convenio activo" en ModalConvenio y useConvenios.

**🟠 TIER 2 — huecos de operación diaria:**
3. **Préstamos temporales / entrega por incapacidad** — ✅ DEFINICIÓN CERRADA con el usuario (13-jul), lista para construir. Son DOS features relacionadas:

   **TEMA A — Entrega temporal / incapacidad** (el dueño devuelve su moto un tiempo):
   - Se marca con motivo (incapacidad/viaje/otro) en "Registrar novedad → Entrega voluntaria".
   - El tiempo guardado NO es gratis: ideal cobrarlo como **convenio** o con **abono**; si no, el **funcionario decide rodar** (las cajas se corren y se pagan al final) **o cobrar** como deuda — con `ModalResolverTiempoFueraServicio` (ya existe).
   - Se distingue de la mora en Inmovilizaciones → Retenidas: MISMA pestaña pero DIVIDIDA EN 2 GRUPOS (usuario pidió combinar A+B): "🔴 Por mora/recolección" (debe pagar para recuperar) y "🅿️ Guardadas temporal (incapacidad)" (badge azul, texto "resolver tiempo al volver").
   - A los 7 días sin volver → aviso "se podría liquidar", decide el ADMIN según la gestión (misma regla que mora).

   **TEMA B — Préstamo de reemplazo** (a un cliente se le VARÓ la moto → taller, y se le presta otra del pool de guardadas):
   - **Swap temporal de placa:** el contrato del que pide prestado se MUEVE a la placa prestada (GPS/ubicación correctos). Cuando su moto sale de taller, swap de vuelta.
   - **Plata (Opción 2, cerrada):** día a día paga **SOLO $27.000/día** (tarifa empresa = alquiler de la provisional). Su contrato normal **queda en pausa** mientras su moto está en taller (no le corre día a día). Cuando **retira su moto del taller**, ahí el funcionario define y cobra el tiempo parado (**cobrar o rodar**). NUNCA paga la parte de empresa dos veces.
   - **Conflicto — depende del tipo de contrato:** TIEMPO DEFINIDO → el dueño recupera SU placa EXACTA (está pagando hacia ESA moto para el traspaso), el prestado devuelve y vuelve a la suya. DIARIO → motos intercambiables libremente, sin problema.
   - **Ayuda del sistema:** al elegir qué moto prestar, mostrar tipo (diario/tiempo definido) + estado (mora/incapacidad/días guardada) para prestar primero las diario o las de mora, y no comprometer la de un tiempo-definido que la quiere exacta.
   - Dueño de la prestada (incapacidad): su contrato en pausa; cuando vuelve, su tiempo guardado también cobrar/rodar.

   **Refinamientos finales (13-jul, DISEÑO 100% CERRADO):**
   - **Pausa del contrato (tiempo definido):** al entrar a taller/entregar, el contrato PAUSA (cajas no exigidas). La resolución la decide el FUNCIONARIO: **cobrar ya / hacer convenio / rodar**. Si se ROdA → SIEMPRE documento firmado de constancia (ya lo exige ModalResolverTiempoFueraServicio).
   - **Conflicto (dueño vuelve):** recupera SU MISMA placa si paga lo que debe — aplica igual a mora e incapacidad (ambos tiempo definido) — SALVO que la moto ya se haya reasignado EN FIRME a otro (liquidación+nuevo contrato). Un préstamo NO es reasignación (es reversible).
   - **DIARIO con moto varada:** distinto al tiempo definido. Si el daño dura **>1 día** → se **liquida** ese contrato diario y su **ahorro acumulado pasa como base inicial de un contrato NUEVO** en otra moto disponible (NO se devuelve en efectivo). Si queda debiendo → paga para recibir otra; si la liquidación da negativa → lista negra. (≤1 día = espera, sin acción — confirmar.) Reusa el mecanismo ya diseñado de "diario→traslado de ahorro a nuevo contrato".
   - **Alquiler de reemplazo (D1=Sí):** el $27.000/día se registra con etiqueta propia `tipo=alquiler_reemplazo` en pagos → entra a caja diaria como ingreso de empresa, aparte de las cuotas.

   **TRAZABILIDAD (diseñar pensando en el reporte — guardar etiquetado DESDE YA):**
   - Historial del contrato/cliente: líneas por evento (entregó moto+motivo, tiempo rodado/cobrado/convenio, reemplazo asignado/devuelto, reactivado, diario liquidado por varada+ahorro trasladado).
   - Historial de la MOTO: recorrido (en taller X-Y, prestada a Z con alquiler, recuperada/guardada) → responde "¿por dónde ha pasado esta placa?".
   - Reportes que habilita: ingreso por alquiler de reemplazo, motos prestadas/en préstamo, contratos con tiempo rodado (días regalados), motos más tiempo fuera de servicio, clientes que entregan seguido por incapacidad, diarios liquidados por varada. Alimenta "Informes semanales" de la pizarra.
   - 3 cosas nuevas a etiquetar: (1) motivo de entrega temporal, (2) alquiler_reemplazo en pagos, (3) registro del préstamo (quién→quién, placa, desde/hasta).

   **✅ TEMA A COMPLETO EN PRODUCCIÓN:** mig 051 (contratos.motivo_suspension) corrida. Inmovilizaciones → Retenidas distingue 3 categorías con badges (🔴 mora / 🅿️ temporal / 🔧 taller) + FILTROS chips (Todas/Mora/Temporal/Taller, excluyentes, con contador). Incluye varadas (Activo + moto Mantenimiento) como info-only (soloInfoTaller, sin acciones de recuperación). suspenderContrato recibe motivo ('mora'/'temporal'). Al reactivar una TEMPORAL: puedeEntregar=true (no la trata como morosa), botón "✓ Reactivar / entregar" → tras la entrega (fotos+reactivar) dispara ModalResolverTiempoFueraServicio (cobrar deuda / rodar + doc firmado); fecha de guardado = última recepción del contrato (useUbicaciones). **Pendiente menor (opcional):** capturar sub-motivo incapacidad/viaje/otro para reportes. **TEMA B (préstamo de reemplazo + diario-varada→liquidar) sin empezar** — diseño completo en memoria.

   **TEMA B — progreso (13-jul):** ✅ F1 (mig 052 `prestamos_reemplazo` + hook `usePrestamos`: prestarReemplazo swap contrato.moto_id→placa prestada / devolverReemplazo swap-back) y ✅ F2 (`ModalPrestarReemplazo` + botón "🔄 Prestar reemplazo" en varadas soloInfoTaller) EN PRODUCCIÓN. Opción A elegida (alquiler como pago etiquetado). ⚠️ **NO usar el botón en prod hasta F3** (swap sin pausa ni alquiler → cobraría cuota normal en placa prestada). ✅ **F3 EN PRODUCCIÓN (mig 053):** alquiler resuelto SIN tocar la función de 250 líneas — se recreó SOLO el disparador `trg_pago_confirmado` dividido en 2 (insert/update con WHEN new.tipo_registro is distinct from 'alquiler_reemplazo' + delete con WHEN old...). Así los pagos de alquiler NO disparan el reparto (no tocan cajas/deudas) pero SÍ cuentan en caja diaria. Tipo `alquiler_reemplazo` en usePagos. Panel "🔄 Préstamos activos" en Inmovilizaciones: cobrar alquiler diario + devolver (swap-back). Usuario debe correr mig 053 + probar un pago normal. ✅ **F4 EN PRODUCCIÓN:** al devolver un préstamo (moto propia sale de taller) se dispara `ModalResolverTiempoFueraServicio` para resolver el tiempo del que pidió (cobrar/rodar+doc). Estado `resolverRec` generalizado (reusado por TEMA A y B). Conflicto: la prestada vuelve al pool (Recuperada), el dueño la recupera por el flujo normal; las prestadas se excluyen del pool (prestamoActivoDeMoto). ✅ **F5 EN PRODUCCIÓN (pragmática):** en varadas, DIARIO → botón "🔁 Liquidar y reasignar" (enruta a ModalIniciarLiquidacion); tiempo definido → "🔄 Prestar reemplazo". ⚠️ El traslado AUTOMÁTICO del ahorro al nuevo contrato depende del flujo de graduación (Diario→tiempo definido) que sigue DIFERIDO (ver sunny-brewing-island.md) — hoy el funcionario liquida y crea el contrato nuevo con ahorro_inicial manual. ✅ **F6 EN PRODUCCIÓN:** ficha de moto → Historial muestra "🔄 Préstamos de reemplazo" (prestada a X / reemplazada por Y, fechas, alquiler). La DATA completa queda registrada (tabla prestamos_reemplazo + pagos alquiler_reemplazo) para reportes futuros — la pantalla de REPORTES (ingreso por alquiler, motos prestadas, tiempo rodado) queda para cuando se construya el módulo de Informes.

   **⚠️ TEMA B — pendiente menor conocido:** la PAUSA del contrato del que pide durante el préstamo NO se implementó a nivel de motor (podría mostrar falsa mora los pocos días del préstamo); se resuelve al devolver con cobrar/rodar. Implementar pausa real requeriría tocar cajasExigidasHasta/fecha_inicio_cajas — diferido por ser cambio de motor delicado y por ser temporal (días).

   **Orden de construcción recomendado:** TEMA A primero (chico-mediano, queda operativo rápido); TEMA B como bloque aparte (mediano-grande: swap de placa contrato↔moto delicado con GPS). Piezas que YA existen: entrega voluntaria (suspende+guarda), ModalResolverTiempoFueraServicio (cobrar/rodar+doc), convenio, badge 7 días, liquidación con traslado de ahorro. Falta: campo motivo_suspension (mora vs temporal) para distinguir en Retenidas, grupo aparte en Retenidas, alquiler diario $27k etiquetado, swap de placa + registro de préstamo, conflicto por tipo de contrato, flujo diario-varada→liquidar+trasladar.
4. **Definir flujo de entrega para salir de bodega** — existe ModalEntregaDevolucion (retenidas); falta el flujo general de sacar moto de bodega.
5. **Impresión de documentos del contrato** — ya hay recibos/estado cuenta/paz y salvo; falta contrato + pagaré como tal.

**🟡 TIER 3 — documentos/respaldo legal:**
6. **Formato Hoja de Vida** — plantilla del documento. **SPEC COMPLETA (cuaderno 21-jul): UNA sola página** con: nombre, cédula, tel, tel WhatsApp, ¿tiene licencia? (sí/no), estado civil, nivel académico, experiencias laborales, tiempo manejando, referencias familiares y personales (las laborales NO — tachadas), y sección para elegir ocupación: Independiente / Empleado / Mototaxi / Domiciliario.
6b. **Documento de convenio — mejorar (cuaderno 21-jul):** debe incluir deuda, motivos, fechas, períodos sin pago (especificados), cédula, cuotas o forma de pago pactada, fecha final del contrato, nombre, placa.
6c. **🐛 BUG reportado (cuaderno 21-jul): "no salen las letras en los buscadores"** — sospecha: mismo patrón del bug de foco (componente-función anidado invocado como <X/> → remonta por tecla, ver [[regla-jsx-funciones-anidadas]]). Pendiente diagnosticar: en qué pantalla(s) pasa.
7. **Doc tratamiento de datos del acompañante** — parqueado (usuario dijo "con la huella basta"; bloque opcional).
8. **Migrar costo con distinción antes/después** ("migrar costo... antes y después para corregir después") — bloque reconciliación "total debía vs pagó" + fecha corte. Avanzado con empalme (ahorro_apertura).

**🟢 TIER 4 — pulido:**
9. **Vistas UI** — revisión visual general (+ auditoría móvil 375px pendiente en varias pantallas).
10. **Fotos adicionales en inmovilización** — parqueado, chico (fotos de daños de cantidad libre en ModalRecoleccion).
11. **Informes semanales** — reportes exportables.

**🔵 TIER 5 — módulos nuevos / infra (⚠️ ACLARAR qué son antes de construir):**
12. **Sección tarjetas** — ❓ el usuario debe aclarar (¿chips/SIM de GPS? ¿tarjetas de pago?).
13. **Sección llaves** — ❓ módulo de llaves físicas de motos, por confirmar alcance.
14. **Migración BDD local** — ❓ ¿Syncthing 2 PC, o base de datos local/offline?

**✅ YA HECHOS (aparecían en la pizarra):**
- "Colocar confirmación al pago en efectivo" → ModalConfirmarPago en los 4 puntos (10-jul).
- "Detallado de permisos" → hecho esta sesión (14/15 acciones + árbol UI + migs 048/049). Ver [[unificar-recepcion-y-permisos]].
