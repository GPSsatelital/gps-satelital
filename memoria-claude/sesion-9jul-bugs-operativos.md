---
name: sesion-9jul-bugs-operativos
description: Sesión 9 jul 2026 — bugs operativos varios en producción y pendientes inmediatos
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Sesión 9 jul 2026 (continuación). Todo desplegado a `main`/producción.

**Hecho:**
- `confirm()` en acciones serias (plata, liquidación, motos, taller, clientes).
- Trigger `042_visita_mueve_cliente.sql` (✅ corrida): la visita mueve el cliente a "Pendiente evaluación" atómicamente. Antes el 2º paso del frontend fallaba mudo si un SUBADMIN registraba una visita no asignada a él (RLS de UPDATE de clientes lo bloqueaba). Causa: `mis_clientes_subadmin()` solo incluye al prospecto si la visita está asignada a ESE subadmin. JONATAN PINEDA y JOSE ANGEL SANCHEZ destrabados por UPDATE manual.
- Wizard pasos 3-6: agregado `catch` para que los errores salgan en pantalla (antes `try/finally` sin catch → PDF fallaba mudo). El error real del usuario fue `Failed to fetch dynamically imported module` = chunk viejo tras deploy → se arregla con Ctrl+Shift+R.
- Ocultar Rechazar/Retirar/Eliminar en clientes con contrato (Activo/mora/riesgo/seguimiento) — la salida real es Liquidación.
- Cartera punto 1 (registrar pago dentro del contrato) = SOLO efectivo + modal flotante de confirmación + aviso de duplicado (mismo monto+cliente+día, advierte no bloquea). Antes dejaba Transferencia sin exigir comprobante.

**Pendientes inmediatos:**
- Replicar el aviso de duplicado en los otros 2 puntos de pago: ventana flotante "Cobrar" (`handleRegistrarPagoModal`) y Cobro Diario (`handleCobrar`).
- Borrar el pago duplicado real (falta cliente+monto+fecha) con "🗑️ Eliminar pago".
- Auto-update en varios dispositivos: PWA service worker autoUpdate o `vite:preloadError`→reload (elimina el Ctrl+Shift+R tras cada deploy).
- Robustez del lector de huella (ver [[estado-huellero-digitalpersona]]): soltar sesión previa antes de startAcquisition, botón "Reintentar", huella opcional en wizard. NO es permisos, es el agente HID local (una lectura a la vez).
- Construir el plan aprobado de unificar Recepción+Retención (ver [[rediseno-contratos-liquidaciones-julio2026]]): un botón "Registrar novedad", reutiliza ModalRecoleccion/ModalIniciarLiquidacion, mora solo si en mora, liquidación sin bloqueo 7 días.

**Parqueados:** fotos de daños libres en ModalRecoleccion; documento de tratamiento de datos del acompañante (usuario decidió que con la huella basta). Ver [[flujo-documentos-contrato-pdf]].
