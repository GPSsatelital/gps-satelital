---
name: migracion-grupos-datos-reales
description: "Estado de la migración de datos reales por grupo (PRADERA, RASTREADOR, COSTA) desde el Excel MIGRACION_GPS_SATELITAL"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Migración de datos reales de flota al sistema, grupo por grupo, desde `MIGRACION_GPS_SATELITAL_v2*.xlsx` (hojas MOTOS_/CONTRATOS_/ARQUEO_ por grupo).

**PRADERA** — migrado (jul 2026). 52 motos/contratos/clientes, 44 con datos completos. Ver historial en CLAUDE.md.

**RASTREADOR** — ✅ migrado 7 jul 2026. 28 clientes + 28 contratos + 28 motos + 18 deudas de apertura. Script en `motogestion/migracion_datos/rastreador.sql` (gitignored, PII). Generado con Node+xlsx desde el Excel. Decisiones tomadas con el usuario:
- Solo AGREGA, no borra nada (PRADERA ya en producción).
- Solo se migran los que tienen contrato activo. 6 motos sueltas sin contrato (EYU81H, XYZ17H, XZI03H, XZI09H, XZI18H, XZP35H) se ingresan manual después.
- Fecha de fin = columna "fecha real de terminación del contrato" del Excel (las fechas de ENTREGA venían mal digitadas, año 2026 en vez de 2025 — se usó arqueo FECHA_INICIO_PAGO como fecha_entrega).
- `ahorro_acumulado` y deuda (DEUDA_ACTUAL, solo si >0) del arqueo. Notas de garantía/inmovilización NO se tuvieron en cuenta.
- Motos con marca/modelo = "POR DEFINIR" (NOT NULL); datos técnicos se llenan luego en la app.
- **WILLIAM MARTINEZ (XZI02H)**: caso especial, se pasó de semanal a Quincenal, días 5 y 20, valor $435.000 (= 2×202.000 + 31.000). Se dejó "atrasado" a propósito para que su pago de hoy se registre en la app y lo lleve al 20.

**FECHA_CORTE por grupo** (cambio de código, commit `ea600a5`): `FECHA_CORTE_MIGRACION` pasó de constante única a `corteMigracionGrupo(grupo)` en useContratos.ts. PRADERA=2026-07-01, RASTREADOR=2026-07-06. `diasDesdeUltimoPago` acepta el corte; conectado en CobrosView, CobroDiarioView, DashboardView, ReportesView (cada uno pasa `moto.grupo`). Razón: mover el corte de un grupo nuevo no debe alterar el reloj de mora de otro ya en uso.

**COSTA** — pendiente (hojas MOTOS_COSTA/CONTRATOS_COSTA/ARQUEO_COSTA existen en el mismo Excel). Mismo proceso.

Ver [[estado-ciclopago-convenios]] y [[feedback-explicaciones-simples]].
