# Catálogo de procesos — MotoGestión

Todos los procesos del negocio con su **flujo normal**, **variaciones**, **casos borde**, **quién lo hace** y **estado para go-live** (✅ listo · ⚠️ funciona pero verificar/frágil · ❌ falta o incompleto).

> Este documento es la fuente de la que se derivan los manuales por rol y la lista final de bloqueantes.

---

## 1. Alta y aprobación de cliente
**Rol:** SECRETARIA / ADMIN / ADMIN_PRINCIPAL (el SUBADMIN NO registra clientes). **Pantalla:** ClientesView.

**Flujo normal:** registrar cliente (nombre, cédula, contacto, `ruta_contrato` diario/tiempo-definido, `ingreso_inicial`, autorización de datos con firma) → subir documentos (cliente: hoja de vida, cédula, recibo, antecedentes, licencia opcional; acompañante mujer: cédula + recibo) → visita domiciliaria (fotos + GPS) → admin aprueba/rechaza → estado pasa a **Aprobado**.

**Estados del cliente:** En proceso → Listo para visita → Pendiente evaluación → Aprobado → Activo → En riesgo/En mora → Retirado/Egresado/Rechazado/Lista negra.

**Variaciones:**
- Acompañante vive en el mismo domicilio → no repite recibo (solo cédula).
- Cliente sin licencia → se permite (licencia es opcional).
- Huella opcional al registrar (si el lector falla, no bloquea; la firma sí es obligatoria).

**Casos borde:**
- Cliente en lista negra al registrar → validar contra lista negra.
- Documentos incompletos → estado "Inmovilización documentación incompleta".
- Visita registrada por un SUBADMIN no asignado → trigger `after insert on visitas` (mig 042) mueve el cliente igual (security definer).

**Estado go-live:** ✅ (flujo maduro). ⚠️ verificar: registro nuevo con firma guarda bien (mig 030 aplicada).

---

## 2. Creación de contrato (WizardContrato — 6 pasos)
**Rol:** ADMIN / ADMIN_PRINCIPAL (SUBADMIN no crea). **Pantalla:** WizardContrato.

**Flujo normal:** Paso 1 datos (cliente Aprobado, modalidad, 4 tarifas directas, día de pago, meses, base inicial pre-cargada de `ingreso_inicial`, fecha entrega) → Paso 2 asignar moto (confirma placa) → Paso 3 firma contrato → Paso 4 firma pagaré → Paso 5 foto certificado → Paso 6 entrega (km + 6 fotos guiadas incl. persona + checklist) → activa contrato, moto "Asignada", cliente "Activo".

**Variaciones:**
- Semanal → día Lunes/Miércoles. Quincenal/Mensual → fechas reales del mes (`dias_pago_mes`).
- Base inicial incompleta → convenio obligatorio (modal forzado) antes del paso 2.
- Prorrateo día a día si entrega cae fuera del inicio del período (detecta domingos).

**Casos borde:**
- Chunk viejo tras deploy → `Failed to fetch dynamically imported module` → `Ctrl+Shift+R`.
- Cancelar un contrato "En proceso" → se ELIMINA por completo (no queda "Cancelado" colgado).

**Estado go-live:** ✅ paso 1 maduro. ⚠️ **verificar en navegador:** pasos 2-6 completos (fotos, firmas, huella) nunca se probaron de punta a punta con login.

---

## 3. Cobro (los 5 puntos de registro de pago)
**Rol:** efectivo = SECRETARIA · campo = ADMIN/AP/SUBADMIN · transferencia = ADMIN jr/SECRETARIA reporta, SECRETARIA confirma. **Pantalla:** CobrosView, CobroDiarioView.

**Flujo normal:** funcionario registra pago (efectivo/transferencia/campo) → `ModalConfirmarPago` (cliente, monto, método, aviso de duplicado) → el pago entra; campo y transferencia quedan **Pendiente** hasta que SECRETARIA confirma (doble control).

**Los 5 puntos:** (1) detalle del contrato [solo efectivo], (2) ventana "Pagar", (3) Cobro Diario, (4) cobro en campo (GPS + foto), (5) confirmar transferencia.

**Variaciones:**
- Cobro en campo: SUBADMIN solo sus clientes asignados; captura GPS + foto opcional + recibo provisional WhatsApp; flujo 2 pasos (entregó a secretaria → confirmar).
- Prepago de víspera (paga el martes su cuota del miércoles) → aceptado.

**Casos borde:**
- Pago duplicado (mismo monto+contrato+día) → avisa, NO bloquea.
- Reparto del pago vive en la BD (RPC/trigger) → no se puede repartir mal desde el frontend (causa raíz de bugs viejos, ya cerrada).

**Estado go-live:** ✅ arquitectura. ⚠️ **verificar integral con login real** (es la operación diaria — B3).

---

## 4. Motor de dinero (cajas FIFO — el corazón)
**Rol:** automático (BD). **Fuente:** cicloPago.ts + mig 045 (RPC + trigger v2).

**Flujo normal:** cada contrato de tiempo definido = fila de cajas (períodos). Todo peso de cuota llena la caja MÁS VIEJA incompleta (FIFO). Orden de aplicación: cajas → deuda → convenio → saldo a favor. Cada caja entrega su ahorro AL LLENARSE (tarifa-primero: los últimos pesos son ahorro). El contrato termina al llenar la caja N (por pagos, no por tiempo).

**Variaciones:**
- Diario queda FUERA del motor de cajas (lógica propia de ahorro hasta $510.000).
- Nuevos: Caja 0 = prorrateo; Caja 1 = semana adelantada (nace pagada con la base, pago interno excluido de caja diaria).
- Migrados/COSTA: cajas desde su fecha de corte, sin caja 0 ni adelantada; ahorro de apertura aparte.

**Casos borde:**
- Abono parcial → $0 de ahorro hasta cubrir la tarifa (tarifa-primero).
- Reversa (rechazar/eliminar pago) → des-llena cajas en orden inverso.
- Mora = existe caja exigida sin llenar; pagar la actual con una vieja abierta NO saca de mora.

**Estado go-live:** ✅ vivo en producción (72 migrados, 1.614 cajas). ⚠️ **verificar con COSTA** (empalme abierto + apertura en cero + primeras cajas).

---

## 5. Convenios
**Rol:** SECRETARIA/ADMIN crean. **Pantalla:** ModalConvenio.

**Flujo normal:** máx 3 por contrato; siempre encima del pago normal; apunta a una meta (deuda total). Cuotas avanzan solas al confirmar pagos (desde `aplicado_convenio`). El convenio cuenta para la mora igual que la cuota normal.

**Casos borde:** 3er convenio incumplido → alerta + "requiere liquidación". Candado BD: un solo convenio activo por contrato (índice único, mig 050).

**Estado go-live:** ✅. Convenios reales activos: JULIO SAYAS, NELSON ESTUPIÑAN, JESUS RAMOS (con firma), VICTOR RAMOS (rehacer para capturar firma).

---

## 6. Mora, recolección e inmovilización
**Rol:** gestión = quien tenga la moto asignada (SUBADMIN/ADMIN). **Pantalla:** CobrosView Panel Hoy, InmovilizacionesView.

**Flujo normal:** día de pago → mensaje · día de gabela (1 día) → sigue · mora (día después) → gestión exhaustiva: mensaje → llamada → sirena/apagado → recolección física. Los 3 pasos pueden ser el mismo día. **El botón de recolección EXIGE mensaje+llamada+sirena registrados.**

**Recolección física:** `ModalRecoleccion` (destino bodega/oficina/taller, 6 fotos, km, daños) → suspende contrato + moto "Recuperada" + multa $20.000 automática. Va a Inmovilizaciones → Retenidas (reloj 7 días).

**Variaciones:**
- Plazo extra (1-2 días con motivo) → sale del balde Recolección mientras esté vigente.
- Recuperar retenida: mínimo pagar la MULTA; el resto atrasado → convenio; cobro deuda-primero. Al saldar → `ModalEntregaDevolucion` (6 fotos) → reactiva.
- Tras 7 días sin pagar → ADMIN puede iniciar liquidación / reasignar la moto.

**Estado go-live:** ✅ construido. ⚠️ **sin probar en navegador con login** (B5) — recolección, entrega-devolución, convenio-para-recuperar.

---

## 7. Liquidación y cierre de contrato
**Rol:** SUBADMIN inicia (recepción/taller); ADMIN/AP calcula saldo y cierra. **Pantalla:** ContratosView, InmovilizacionesView, LiquidacionesView.

**Flujo normal:** iniciar liquidación (crea orden real de taller + trae deudas automáticas) → revisión taller → cálculo saldo (`ahorro − deudas − daños`) → documento → firma → cierre.

**Variaciones por motivo:** cumplimiento → moto "En traspaso" + Paz y Salvo + cliente "Egresado"; incumplimiento → "Cancelado" + "Retirado"; retiro voluntario → "Finalizado" + "Retirado". Regla 7 días antes de habilitar.

**Casos borde:** saldo positivo → se devuelve; saldo negativo → lista negra automática. Diario→$510.000 → se liquida y el saldo pasa como base del contrato nuevo.

**Estado go-live:** ✅ construido y desplegado. ⚠️ **sin probar en navegador** (B5).

---

## 8. Motos — ciclo de vida
**Rol:** ADMIN/AP asigna; MECÁNICO lee (taller). **Pantalla:** MotosView.

**Estados:** Disponible ⇄ Reservada ⇄ Asignada ⇄ {Mantenimiento, Fiscalía, Tránsito, Garantía, Recuperada, En traspaso}. **Regla universal:** al liberar de un estado temporal → "Asignada" si hay contrato Activo, si no "Disponible".

**Tiempo fuera de servicio (taller/fiscalía/tránsito/garantía):** por defecto se COBRA (deuda `tarifa_atrasada`); opción de rodar (extiende `fecha_fin_contrato`, con documento firmado). `ModalResolverTiempoFueraServicio`.

**Registrar novedad:** botón único enruta a recolección/entrega/retención/liquidación/recepción.

**Estado go-live:** ✅. ⚠️ INSERT/UPDATE de `motos` y toda la tabla `taller` siguen abiertas a cualquier autenticado (RLS diferido) — riesgo bajo pero anotado.

---

## 9. Préstamo de reemplazo (TEMA B)
**Rol:** ADMIN/AP/SUBADMIN. **Pantalla:** InmovilizacionesView.

**Flujo:** moto varada → prestar reemplazo (swap placa contrato↔prestada) → alquiler $27k/día (`tipo_registro='alquiler_reemplazo'`, no dispara reparto pero cuenta en caja) → al devolver, resolver tiempo del que pidió (cobrar/rodar).

**Estado go-live:** ✅ construido (migs 052/053). ⚠️ **sin probar el ciclo completo con login** (B5). Nota: la pausa del contrato durante el préstamo puede mostrar falsa mora unos días (se resuelve al devolver).

---

## 10. Taller
**Rol:** MECÁNICO + staff. **Pantalla:** TallerView.

**Flujo:** ingreso (moto → Mantenimiento) → diagnóstico/reparación → finalizar (moto vuelve a Asignada/Disponible según contrato). Estados: Pendiente → En diagnóstico → En reparación → Listo para salida → Finalizado.

**Estado go-live:** ✅. ⚠️ integración auto orden→liquidación es manual (transcribir); no bloqueante.

---

## 11. Caja diaria (por grupo)
**Rol:** SECRETARIA cierra. **Pantalla:** CajaView.

**Flujo:** recaudo del día separado por grupo (COSTA/PRADERA/RASTREADOR/USADAS — cada portafolio independiente). Resumen por funcionario (total, pendiente entregar, sin confirmar). Pagos internos (base adelantada) excluidos.

**Estado go-live:** ✅ (mig 041 caja por grupo). ⚠️ verificar el cierre con datos reales del día.

---

## 12. Empalme (migrados y COSTA)
**Rol:** SECRETARIA/ADMIN/AP. **Pantalla:** CobrosView detalle → PanelEmpalme.

**Flujo:** contrato migrado nace con `ahorro_apertura` + deudas de apertura + empalme ABIERTO (badge ⚠️). Cartera lo gestiona normal desde día 1. Checklist: deuda revisada · ahorro revisado · datos verificados · firma+huella → "Confirmar migración" → apertura pasa a acumulado, badge desaparece.

**Estado go-live:** ✅ mig 043 (74 pendientes, $37.7M apertura). **COSTA usará este mismo mecanismo para completar cifras progresivamente.**

---

## 13. Roles y permisos
**Fuente:** AuthContext (`puede(accion)`) + RLS (mig 026 + 048) + acciones por persona.

**Roles:** ADMIN_PRINCIPAL (todo) → ADMIN (toda la operación, no registra efectivo) → SUBADMIN (solo sus motos asignadas) → SECRETARIA (efectivo, confirma, registra clientes) → MECÁNICO (solo taller) → SOCIO (solo lectura de su grupo).

**Dos capas:** frontend (`useScope`) + RLS en Postgres (la real). Acciones sensibles por persona (catálogo de 15, mig 048).

**Estado go-live:** ✅ construido. ⚠️ **B4: probar con CADA login** que ve/hace solo lo suyo. Confirmar Edge Function `manage-users` desplegada.

---

## 14. Alertas
**Pantalla:** CampanaAlertas (🔔). Mora/gabela, SOAT/tecno (30/15/5 días), base completada, premio referidos, traspaso próximo (2 meses), 3er convenio, transferencias pendientes, contratos sin activar. Filtradas por scope del SUBADMIN.

**Estado go-live:** ✅.

---

## 15. Documentos
Recibos térmicos 80mm (GA-E2001), recibo base inicial, contrato/pagaré PDF (firma+huella), certificado (papel), estado de cuenta general (imprimir + WhatsApp), autorización de datos, Paz y Salvo. Impresos en Arial a propósito.

**Estado go-live:** ✅ código. ⚠️ **B6: probar impresora física** + PDF de contrato (recién arreglado el error `var`).

---

## 16. Referidos
Premios: 2=guantes, 5=intercomunicador, 10=casco, 17=combo. Confirmado = cliente recibe su moto. **Nota:** tabla `referidos` puede no existir en la BD real (mig 010 nunca creada) — verificar si se usa.

**Estado go-live:** ⚠️ backlog (no crítico para operar).

---

## Resumen de estado para el lunes

| Proceso | Estado | Acción pre-lunes |
|---------|--------|------------------|
| Alta cliente, contrato, cobro, motor cajas, caja, empalme, permisos, alertas | ✅ maduro | Verificar con login real (B3, B4) |
| Recolección, liquidación, préstamo, entrega-devolución, convenio-recuperar | ⚠️ construido sin probar | Probar en navegador (B5) |
| Impresora + huella + PDF | ⚠️ | Probar físico (B6) |
| COSTA | 🟢 siembra mínima | SQL cuando el usuario avise |
| Referidos | ⚠️ backlog | No bloqueante |
