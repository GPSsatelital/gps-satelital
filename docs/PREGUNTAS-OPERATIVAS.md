# Preguntas operativas del día a día — cómo lo resuelve el sistema (y qué falta)

Auditoría de preparación operativa: por cada escenario real, **cómo lo hace hoy MotoGestión** y dónde hay un **hueco a reforzar** (⚠️). Sirve de FAQ para el personal y de lista de mejoras para el equipo técnico. Verificado contra el código (24-jul-2026).

> **Conclusión de fondo:** el **corazón del dinero** (cuánto debe, cartera, mora, cajas, convenios, prorrateo, "debe hoy") está **sólido y con fuente única** (`cicloPago.ts`, con pruebas). El punto débil son los **casos físicos de la moto** (fuera de servicio, empeño, sin movimiento) y algunos **compromisos que dependen de la memoria del funcionario** (promesa de pago). Ahí el sistema es un *libro de registro manual*: si nadie teclea el evento, no se entera.

---

## A) El día a día y dónde ver las cosas

**1. ¿Cómo sabe un SUBADMIN (cobrador) qué hacer en el día?**
En **Cartera → pestaña "Para hacer hoy"** (Panel Hoy): agrupa sus clientes por urgencia sin duplicar — Recolección → Mora → Gabela → Pagan hoy — con los botones de tarea en cada tarjeta (Mensaje/Llamar/Sirena/Recolección) que además registran la gestión. Ve **solo sus motos** (scope por `subadmin_id`).
⚠️ *No es la pestaña de arranque (abre en "Todos") → un cobrador nuevo puede no descubrirla. Y no incluye sus visitas asignadas (ver #4).*

**2. ¿Dónde ve lo urgente?**
En tres lugares: la **campana 🔔** del header (alertas del sistema), el **Panel Hoy** (urgencias de cobro) y el **Dashboard** (KPIs de mora/inmovilizar).
⚠️ *Están dispersos y con criterios que no coinciden: el Panel Hoy no muestra SOAT/tecno por vencer, transferencias pendientes ni moto en taller demorada (eso solo vive en la campana), y el dashboard usa su propio conteo. "Lo urgente" depende de qué pantalla mires.*

**3. ¿Cómo busca algo en el momento (cliente, placa, contrato)?**
Con la **lupa 🔍** del header → busca clientes (nombre/cédula/teléfono), motos (placa/marca/modelo) y contratos, con botones para ir a la ficha/cartera/moto. Filtrado por scope.
⚠️ *No busca por convenio, deuda, folio de recibo ni dirección; exige 2 caracteres y no tiene atajo de teclado.*

**4. ¿Cómo sabe a quién cobrar y a quién visitar hoy?**
**Cobrar:** Panel Hoy (balde "Pagan hoy") o la vista "Cobro Diario". **Visitar (prospectos):** solo en **Clientes → filtro "Para visita"** (las visitas asignadas al sub-admin via `visita_asignada_a`).
⚠️ **GAP grande:** *las visitas asignadas NO aparecen en el Panel Hoy ni en el dashboard ni con un badge — el cobrador tiene que acordarse de entrar a Clientes. Fácil de olvidar.*

**5. ¿Qué ve cada rol al entrar?**
El **SOCIO** tiene su propio tablero (solo lectura de su grupo). Todos los demás ven el **mismo Dashboard**; solo cambian los datos por scope.
⚠️ *No hay "dashboard del cobrador" con sus tareas ni "dashboard del mecánico" con sus órdenes — el MECÁNICO aterriza en KPIs de plata que no le sirven.*

**6. ¿Cómo concilia el efectivo que recogió en la calle?**
El Panel Hoy muestra "Recogiste hoy $X" y "Pendiente entregar a caja"; la SECRETARIA confirma en Caja Diaria (doble control).
⚠️ *El resumen del cobrador solo mira HOY: su efectivo de días anteriores sin entregar no le aparece, y no hay alerta de "X tiene $Y sin entregar hace Z días".*

---

## B) Que no se le pase nada (mora, plazos, convenios)

**7. ¿Cómo hace para que no se le pase cobrarle a un cliente al que ya le dio un plazo extra?**
**Se resuelve solo:** al dar un plazo extra (1-2 días, con motivo obligatorio) el contrato sale del balde Recolección; al **vencer el plazo, reingresa automáticamente** a la cola (se recalcula contra la fecha de hoy en cada carga). No depende de la memoria.
⚠️ *Pero NO hay aviso proactivo "el plazo de X vence hoy": la alerta `plazo_extra_vence` está declarada en el código pero nunca se dispara (código muerto). El respaldo es solo pasivo (reaparece en Panel Hoy).*

**8. ¿Y si el cliente "promete pagar el viernes"?**
La promesa de pago solo se guarda como **texto** en el resultado de la gestión.
⚠️ **GAP claro:** *no hay fecha de compromiso, ni recordatorio, ni reingreso. Si promete pagar el viernes, nada lo resurge el viernes — depende 100% de la memoria del funcionario.* (Es el hueco más parecido a tu pregunta del plazo.)

**9. ¿Cómo sabe que un convenio se está incumpliendo?**
Automático: una función de BD marca "incumplido" los convenios vencidos sin completar; hay alerta "convenio por vencer" (≤3 días) y "3er convenio incumplido → liquidación". La cuota del convenio cuenta para la mora.
⚠️ *Menor: solo avisa del vencimiento final, no cuota por cuota.*

**10. ¿Cómo sabe quién está en mora / gabela / por recolectar?**
Fuente única (`calcularEstadoCartera`), consumida por Panel Hoy e Inmovilizaciones. Recolectar exige haber intentado antes mensaje+llamada+sirena (candado anti-descuido). Sólido.

**11. ¿Qué avisa el sistema (campana) y qué NO?**
**Sí avisa (13):** mora crítica, gabela, base completada, SOAT, tecnomecánica, transferencia pendiente, contrato sin activar, validar ubicación de la moto, moto retenida (fiscalía/tránsito/garantía), traspaso próximo, convenio por vencer, 3er convenio incumplido, taller demorado.
⚠️ **NO avisa:** *plazo extra vencido · promesa de pago · excepción documental vencida (solo en Clientes) · documentos de contrato faltantes (solo nota inline) · moto recuperada por mora sin liquidar · efectivo de campo de días previos sin entregar.*

---

## C) Casos raros y el historial

**12. ¿Qué pasa si un cliente lleva la moto a garantía (o fiscalía/tránsito/taller) y no avisa?**
⚠️ **GAP crítico:** *el sistema NO lo detecta solo — alguien tiene que registrarlo a mano en Motos.* Mientras nadie lo registre, **el contrato sigue Activo y la cartera lo sigue cobrando**, e incluso puede marcarlo en **mora falsa** con la moto parada en un patio. Una vez registrada la salida, el sistema sí resuelve bien el tiempo parado (cobrar la deuda o rodar el fin del contrato, con documento firmado).

**13. ¿Cómo se entera de una moto sin movimiento / posible empeño?**
⚠️ **GAP grande:** *hoy es solo doctrina escrita, 0% código.* Las "señales de empeño" (2 días sin movimiento, dispositivo sin reportar, paga solo transferencia) requieren el **GPS del vehículo integrado**, que está en la plataforma externa y es backlog. La sirena y el apagado remoto son botones deshabilitados. Lo más cercano es la **validación manual** de dónde se guarda la moto (el admin compara en su plataforma GPS y marca ✅/❌), pero es de una sola vez, no monitoreo continuo.

**14. ¿Cómo sabe el historial real de un cliente?**
En la **ficha del cliente** ("Ver ficha completa"): 8 pestañas — Resumen · Contrato (todos, con PDFs firmados) · Pagos · Visitas (con fotos y mapa) · Documentos · Deudas · Convenios · Gestiones (mensajes, llamadas, sirenas, recolecciones…). Es la vista más completa por cliente.
⚠️ *Menor: no hay una línea de tiempo única cronológica (cada evento en su pestaña), y el historial físico de la moto (ubicaciones/recepciones) vive en la ficha de la MOTO, no en la del cliente.*

**15. ¿Cómo sabe cuánto debe realmente un cliente?**
El detalle del contrato en Cartera muestra el **"total a cobrar" exacto**, desglosado línea por línea: prorrateo + cada cuota exigible (con "Xd vencida"/"vence hoy") + multa/deuda + cuota del convenio, con el mismo cálculo que el estado de cuenta imprimible/WhatsApp. El saldo a favor se muestra pero no se aplica solo (decisión manual). **Sólido y con pruebas** — sin gap.

**16. ¿Qué pasa si una moto se recolecta pero el cliente desaparece?**
Hay **plazo de 7 días** (badge "Lista para liquidar"), **reasignación** vía liquidación por incumplimiento (traslada el ahorro a un contrato nuevo) y **lista negra** automática si el saldo final es negativo. Todo es **decisión del ADMIN**, no automático.
⚠️ *(a) el reloj de 7 días arranca desde la gestión de recolección registrada — si se recolecta sin registrarla, nunca habilita liquidar; (b) no hay alerta de campana para una moto Recuperada por mora — solo se ve entrando a Inmovilizaciones.*

**17. ¿Cómo verifica el sistema que una transferencia es real?**
No la verifica: la SECRETARIA confirma/rechaza a mano revisando la foto del comprobante (doble control humano, sin validación bancaria).

**18. Casos raros no modelados:** no existe estado de **robo / siniestro / pérdida total** de la moto; no hay contador de "veces recolectada" ni historial de entradas/salidas de lista negra; los días a cobrar por fiscalía/garantía se **teclean a mano** (mitigado solo por el documento firmado).

---

## D) Lista priorizada de mejoras

### 🔴 Bug concreto — arreglar ya (rápido)
1. **Dashboard "En gabela" muestra el número de MORA** (`DashboardView.tsx:591` usa `stats.clientesMora` — el mismo valor que la tarjeta "En mora"). No hay conteo real de gabela. *Etiqueta engañosa, fix de 1 línea.*

### 🟡 A verificar (probablemente OK por RLS)
2. **Cobro Diario no aplica el filtro de frontend (`useScope`).** Si a un SUBADMIN se le concede el módulo "Cobro Diario", la vista no recorta a mano por sus motos — PERO la **RLS de la BD** ya limita sus `contratos`/`pagos` a los suyos, así que los datos llegan ya recortados y **no debería ser una fuga real**. *Verificar con un login de SUBADMIN que solo ve sus motos; si es así, es solo una inconsistencia de defensa-en-profundidad (agregar `useScope` por prolijidad), no un hueco de seguridad.*

### 🟡 Huecos operativos reales — decidir arreglar antes o justo después del lunes
3. **Promesa de pago sin recordatorio** — capturar `fecha_compromiso` en la gestión + alerta/reingreso al vencer (igual que el plazo extra). *Cierra el hueco #8.*
4. **Plazo extra vencido sin alerta** — el andamiaje ya existe; falta pasar `gestiones` a `useAlertas` y emitir la alerta (y de paso no gritar "mora crítica" mientras el plazo esté vigente).
5. **Visitas asignadas invisibles fuera de Clientes** — mostrarlas en el Panel Hoy del cobrador (o badge en la barra).
6. **Moto fuera de servicio no frena la cartera** — cuando la moto está en Fiscalía/Tránsito/Garantía/Taller con contrato Activo, no marcar mora falsa / avisarlo. (Mitigación mientras no haya GPS: capacitar a registrar SIEMPRE la salida.)
7. **Sin alerta de campana** para: moto Recuperada por mora +7 días, excepción documental vencida, documentos de contrato faltantes, efectivo de campo sin entregar de días previos.

### 🟢 Mayor alcance / backlog (necesitan GPS o rediseño)
8. **Detección de empeño / sin movimiento / sirena / apagado** — depende de integrar la plataforma GPS externa (backlog). Es lo que cerraría la mayoría de los huecos físicos de la moto.
9. **Vista "Mi día" unificada para el cobrador** (pagan hoy + mora + recolección + visitas + SOAT/tecno + efectivo pendiente en un solo lugar) y **dashboard por rol** (cobrador, mecánico).
10. **Estado de robo/siniestro** y **línea de tiempo unificada** en la ficha del cliente.
11. **Limpieza de nomenclatura** entre la doc y el código (motos usan `Mantenimiento`, no "En taller"/"Suspendida").

> **Recomendación de arquitecto:** para el lunes, arreglar los **2 bugs concretos (🔴)** y decidir si entra la **promesa de pago (#3)** y el **arranque del Panel Hoy en "Para hacer hoy" para el cobrador**. El resto (🟡/🟢) es fast-follow: no bloquea la operación, pero conviene cerrarlo pronto. Los huecos físicos de la moto (empeño, sin movimiento) solo se cierran de verdad con la integración GPS — mientras tanto, la mitigación es **procedimental** (capacitar a registrar a mano cada evento de la moto).
