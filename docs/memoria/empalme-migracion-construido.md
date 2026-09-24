---
name: empalme-migracion-construido
description: "Empalme de migrados construido y en producción (10 jul, parte 2) — mig 043 corrida, panel, badges, estado de cuenta, regla tarifa-primero"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Empalme de migrados COMPLETO (10 jul 2026, parte 2). Ver detalle en CLAUDE.md sesión 10 jul parte 2.

- **Mig 043 corrida y verificada**: 74 migrados pendientes, $37.698.000 apertura, $1.225.306 nuevo. `cerrar_empalme()` en BD (security definer, ADMIN/AP/SECRETARIA).
- **PanelEmpalme** en detalle del contrato en Cartera (checklist 4 puntos, checkboxes manuales 1-3, firma+huella auto). Badges ⚠️ Empalme en Cartera/Panel Hoy. `empalmePendiente/ahorroTotal/infoFinContrato` en useContratos; ahorroTotal en todos los displays.
- **Estado de cuenta general** (📄 imprimir + 📱 WhatsApp) en detalle del contrato — incluye inicio/fin de contrato, desglose traía/nuevo si empalme abierto. Sin firma (la firma solo vive en el convenio).
- **Regla tarifa-primero para el ahorro** (elegida por el usuario como "la lógica correcta"): abono parcial → ahorro $0 hasta cubrir la parte de la empresa; al completar el período cierra exacto. `calcularAhorroAplicado(+tarifaPagadaAntes)` + `tarifaPagadaPeriodoActual()`. 5 puntos actualizados. ✅ Desplegado (commit c8850b1).
- **Recálculo retroactivo HECHO (11 jul)**: los 76 pagos históricos con ahorro proporcional se recalcularon por SQL con la regla nueva (pago por pago, período real de cada contrato) + resync de ahorro_acumulado. Verificado exacto: total nuevo $627.000 (19×$26.000 semanas completas + DURIS $112.000 mensual + BLEIMER $6.000 + EVER $4.000 + L.BERMUDEZ $11.000). Cero fracciones. El primer pago calculado por el código nuevo en producción (JESUS LEON 11-jul, $202.000→$26.000) salió correcto. Los Pendientes (JULIO $21.000, YAIR $24.000) entran al confirmarse.
- **4 convenios activos**: VICTOR MANUEL RAMOS (YAL58H) sin firma → rehacer su convenio cuando venga. Los otros 3 OK.
- **Pendiente F5**: SQL de COSTA cuando el usuario entregue el Excel (placa, nombre, cédula, tel, forma_pago, días, tarifa, meses, entrega, base, ahorro al corte, deuda, saldo a favor). Nace con ahorro_apertura + empalme abierto.
- Manual del funcionario (7 pasos) aprobado — en CLAUDE.md.
