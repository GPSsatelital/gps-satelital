---
name: modulo-informes-gerenciales
description: "Diseño APROBADO (visualmente) del módulo de Informes Gerenciales — para gerencia, todos los formatos. Suite de ~17 informes, mockups aprobados. Construcción por fases pendiente."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-24T17:38:37.235Z
---

## ✅ FILTROS COMBINABLES + AGING + MATRIZ + PORTADA (24-jul, commit 102f177)
Todo en `ReportesView.tsx`. tsc+build+21 tests OK. Verificado logueado (PRADERA+No pagó → 3 motos; PDF titulado "PRADERA · no pagó"; Excel = 6 hojas ZIP válido).
- **Filtros combinables** (grupo · cobrador · modalidad · estado, AND) — `<FiltrosGestion>` (4 `<select>` + limpiar + resumen "Mostrando: …") en Por admin, Por grupo y la tarjeta PDF de Exportar. `baseFiltrada` es la fuente única → on-screen + PDF + Excel salen SOLO de la selección. Reemplazó el filtroAdmin de un solo cobrador. Título/nombre-archivo/leyenda reflejan los filtros. Comparación ▲/▼ ahora usa el mismo set (via `contratoId` en la fila).
- **E1 aging** (antigüedad de mora): tramos 1-3/4-7/8-15/+15 días (`diasMora` en la fila via `diasDesdeUltimoPago`); columna "Días mora" + barra apilada+tabla en PDF + hoja "Aging mora".
- **E2 esperado vs recaudado**: % cumplimiento en $ (`esperadoCiclo` = Σ `valorPeriodoReal`); KPI en PDF + leyenda Resumen.
- **E3 portada ejecutiva**: KPIs grandes + semáforo + **sparkline** de `recaudoDiario` 14d (`sparklineSVG`) al inicio del PDF.
- **E4 matriz cobrador×grupo + recaudo por método** (efectivo/transferencia): tablas en PDF (se ocultan si no aplican) + hojas "Matriz" y "Metodo".
- Excel ahora 6 hojas: Informe · Resumen · Aging mora · Matriz · Metodo · Por convenir. `descargarExcel` con `hojasExtra`; motor `estilarSeccionesWS`.
- Plan en `.claude/plans/humble-dazzling-phoenix.md`. **Pendiente real**: columna "A pagar" (nómina) — falta la regla de pago.

## ✅ INFORME GERENCIAL PDF + EXCEL PRO (24-jul, commit 5721dd8) — skills interface-design + dataviz
Todo en `pages/ReportesView.tsx` (+ `useMotos.ts` + mig 058). tsc+build+21 tests OK. Verificado logueado.
- **PDF "Informe Gerencial"** (botón en pestaña Exportar): documento con GRÁFICOS — dona de estado (al día/parcial/no pagó), barras de recaudo por grupo y cumplimiento por cobrador, tarjetas KPI, tabla ranking y sección "por convenir". `informeGerencialHTML()` (hex + SVG inline) → `htmlAPdfBlob` de `src/utils/pdf.ts` (html2canvas→jsPDF, sin dep nueva). Respeta período + filtro cobrador. **Excel del navegador NO puede llevar gráficos nativos** → por eso los gráficos van en el PDF.
- **Excel con estilo** (dep nueva `xlsx-js-style`, drop-in de SheetJS): encabezados navy/cian, filas cebra, bordes, montos `#,##0`, autofiltro, y **3 hojas** (Informe · Resumen con ranking+comparación · Por convenir). Motor `estilarSeccionesWS`+`descargarLibro`; `descargarExcel` acepta `hojasExtra`. Verificado: ZIP OOXML válido, 3 sheets, styles.xml → abre limpio.
- **C1 comparación** vs período anterior (`getRangoAnterior`, ▲/▼ solo sobre RECAUDO — el estado al día es foto de hoy, no reconstruible). **C3 ranking** por %al día (on-screen+PDF+Excel). **C2 por convenir** (deudores sin convenio con teléfono). **C4 fecha asignación**: mig `058_motos_subadmin_asignado_desde.sql` + set en `useMotos.asignarSubadmin` + "asignada desde" en detalle. ⚠️ **mig 058 pendiente de correr en Supabase** (solo agrega la columna; sin ella, reasignar moto falla).
- Plan completo en `.claude/plans/humble-dazzling-phoenix.md`. **Pendiente real**: columna "A pagar" (nómina) — falta la regla de pago del usuario.

## ✅ FASE 1 CONSTRUIDA Y EN PRODUCCIÓN (23-jul, commits 249c78e + 4ec53db)
En `pages/ReportesView.tsx`, 3 informes nuevos como pestañas (tras Resumen):
- **👤 Por admin** — bloques por sub-admin (`motos.subadmin_id`); drill-down con placa+cliente y **chip de GRUPO** (etiqueta cruzada). KPIs, % semáforo, recaudado. Base de nómina.
- **📁 Por grupo** — bloques por grupo; drill-down con placa+cliente y **el admin asignado** (👤 nombre) como etiqueta cruzada. Es el "quién pagó/no" segmentado (no se hizo lista plana aparte).
- **🏠 Visitas** — por sub-admin (`visitas.asignada_a`): total + aprobadas/rechazadas/repetir/pendientes, drill-down (cliente, fecha, GPS/foto, resultado).
- **Excel BONITO** (`descargarExcel` en el mismo archivo): reemplaza el CSV plano (que en Excel es-CO caía en 1 sola columna) por un **.xls de tabla HTML con estilo** — título navy, encabezados cian, secciones coloreadas por bloque, filas cebra, TOTAL GENERAL. Números como texto `$` formateado (`mso-number-format:'\@'`). Los 3 informes exportan así. Verificado en navegador logueado (Este año, 93 activas).
- Arquitectura: `baseGestion` (memo, motos activas con grupo+admin+recaudo del rango) → `agruparBloques(rows, "admin"|"grupo")` (módulo) → `<GestionBloques>` compartido. Todo usa `esPagoDeCaja`/`pagosRango` ya existentes.
- **✅ 3 ESTADOS DE PAGO (23-jul, commit 25ddc8f)** — el usuario aclaró que "pagó" (cualquier monto) engañaba. Ahora, con el MISMO motor de Cartera (`calcularEstadoCartera` + `cuotaConvenioDelPeriodo` + `convenioActivoDelContrato`): 🟢 **Al día** = no en mora (con convenio activo cumplido la deuda queda programada, no es mora — regla del usuario); 🟡 **Parcial** = en mora pero abonó algo (muestra pagó $X · falta $Y); 🔴 **No pagó** = en mora y $0. Bandera **⚠️ debe sin convenio** por moto + KPI "N deben sin convenio" (la gestión del subadmin = convenir a los deudores y hacer cumplir convenios). 📋 convenio en las que tienen. % del bloque = % al día. En KPIs, header, drill-down, Excel (cols Estado/Pagó/Falta/Convenio) e impresión. Prepagado/cubierto = 🟢 al día (confirmado). `deudaPend` = deudas estado "pendiente" (no en_convenio, no pagada).
- **✅ ARMADOR DE IMPRESIÓN (23-jul, commit 63304f1)** — pestaña Exportar: casillas para elegir qué secciones imprimir (KPIs/Recaudo grupo/Por admin/Por grupo/Visitas/Mora/Flota/Entregas) + interruptor "incluir detalle completo" (default ON) + Todas/Ninguna. `imprimirSeleccion` arma UN documento (Arial, hex propios, secciones oscuras, cebra) solo con lo marcado, respetando el período. Reemplazó el "Imprimir reporte PDF" fijo.
- **🔲 FALTA:** la **regla de nómina** del usuario (ej. % de recaudado, o $/moto al día) para agregar columna "A pagar". El corte por grupo/admin ya está listo para colgarle eso.
- El viejo CSV del tab "Exportar" (pagos sueltos) sigue en CSV plano — pendiente pasarlo al mismo Excel bonito si el usuario quiere.

**Pedido del usuario (23-jul):** informes semanales para GERENCIA. Empezó pidiendo 3 (recaudo quién-pagó/no, gestión por admin, visitas por admin) y pidió que como arquitecto/experto lo definiera COMPLETO y profesional. Se invocó el skill **interface-design**. Formato: **todos** (PDF / Excel / pantalla / WhatsApp). Interactivo en pantalla (drill-down a un toque), estático al exportar.

## Mockups APROBADOS visualmente (herramienta visualize, 23-jul)
1. Informe gerencial (estático) · 2. Versión interactiva (tocar admin → despliega sus motos sin pagar) · 3. **"Informe Gerencial de 1 página"** (resumen ejecutivo que amarra todo). El usuario dijo "listo dale" y "después lo mejoramos más".

## Suite COMPLETA definida (~17 informes, 5 áreas)
- **A. DINERO:** (1) Recaudo semanal quién pagó/no ⭐ · (2) **Antigüedad de mora / aging** (1-3d/4-7d/8-15d/+15d) — el "plus" experto · (3) Esperado vs recaudado (% cumplimiento) · (4) Convenios (activos/cumplimiento/3er incumplido) · (5) Recaudo por método + efectivo pendiente de entregar.
- **B. PORTAFOLIOS (socios):** (6) Rendimiento por grupo (recaudo/mora/rentabilidad) · (7) Ahorro acumulado / camino al traspaso.
- **C. FLOTA:** (8) Motos produciendo vs paradas (parada = plata que no entra) · (9) Tiempo fuera de servicio (taller/fiscalía) · (10) Entregas y recolecciones de la semana.
- **D. PERSONAS:** (11) **Nómina/gestión por administrador** ⭐ · (12) Visitas por administrador ⭐ · (13) Gestiones de cobro por funcionario + efectividad.
- **E. RIESGO/CRECIMIENTO:** (14) Clientes en riesgo · (15) Liquidaciones/lista negra · (16) Embudo de nuevos clientes (registro→visita→aprobado→contrato→entrega) · (17) Referidos.

## 4 indicadores clave (los que un negocio flota+financiero vive/muere por conocer)
% cumplimiento de cartera · antigüedad de la mora · motos produciendo vs paradas · rentabilidad por portafolio.

## Dirección de diseño (interface-design)
Money-first (el $ es el número más grande) · todo cortado por portafolio · semáforo verde/ámbar/rojo · un toque = detalle · placa amarilla como firma. Estructura: resumen ejecutivo arriba → detalle accionable abajo.

## ⭐ SPEC DETALLADA del informe de ADMINISTRADORES (refinado 23-jul)
- **Qué:** cuántas y CUÁLES motos pagaron en el período elegido (semana / mes / rango de semanas configurable).
- **Cortes:** por GRUPO (COSTA/PRADERA/RASTREADOR/USADAS) **y** por ADMIN que la tiene asignada (`motos.subadmin_id`).
- **Por cada admin:** motos asignadas · cuántas pagaron / no pagaron · % cumplimiento · recaudado. **Es la base para su NÓMINA** (se les paga según el cumplimiento de cobro de sus motos asignadas — falta la regla exacta de pago; el usuario la dará).
- **Drill-down:** qué motos suyas pagaron y cuáles no (placa + cliente + monto).
- **Datos:** motos.subadmin_id (admin) + motos.grupo (grupo) + pagos del período (vía contrato→moto) para saber quién pagó.

## Base existente en la app
`pages/ReportesView.tsx` ya tiene: Resumen, Cartera, Flota, Entregas, Exportar CSV, imprimir, KPIs, recaudo por rango (hoy/semana/mes/mes_anterior) y por grupo, deuda real, regenerar docs. Se construye SOBRE esto, no desde cero. Datos de visitas: `useVisitas` (fecha, estado, resultado, asignada_a, realizada_por, entrevista, ubicacion, fotos).

## Construcción por FASES (pendiente de arrancar)
- **Fase 1 (lo que pidieron):** informe de admins (cross-tab grupo×admin, período, drill-down, export) + recaudo semanal + visitas por admin.
- **Fase 2 (después del lunes):** aging de mora, flota produciendo, portafolios, convenios, riesgo, embudo, referidos + pulido.
- ⚠️ Ojo prioridad: el go-live es lunes 27; esto compite con los bloqueantes B3-B6. Definir con el usuario si se construye ya o post-go-live.
