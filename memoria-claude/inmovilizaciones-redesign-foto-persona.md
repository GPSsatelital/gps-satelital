---
name: inmovilizaciones-redesign-foto-persona
description: ✅ CONSTRUIDO Y DESPLEGADO — Inmovilizaciones 2 pestañas + convenio para recuperar + formulario de entrega con evidencias + 6ª foto persona
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-07-24T21:30:35.935Z
---

✅ **TODO EN PRODUCCIÓN (11-jul-2026)** — 2 commits: foto persona + inmovilizaciones. `tsc -b` + `vite build` limpios, merge a main hecho.

**1. 6ª foto "Persona + moto"** (foto SEPARADA, NO combinada con la trasera — la trasera debe mantener la placa legible). Se agregó key `"persona"` a `ANGULOS_FOTO` en `src/components/FotosAngulos.tsx` con glifo propio persona+moto en `IconoAngulo` (no la flecha de ángulo). Se propaga solo a wizard paso 6, `ModalRecoleccion` y el nuevo `ModalEntregaDevolucion`. Requerida en los 3 (el bucle de validación ya la exige). Textos "5 obligatorias" → "6 obligatorias".

**2. Inmovilizaciones en 2 pestañas** (`InmovilizacionesView.tsx`): `tab` state `"retenidas"|"en_mora"`, retenidas por defecto (endpoint que antes quedaba enterrado tras scroll). Barra de pestañas con contadores. KPIs clicables navegan a su pestaña.

**3. Convenio para recuperar retenida** — regla del usuario: **mínimo obligatorio = pagar la MULTA; el resto atrasado → convenio; el funcionario pide lo máximo.** Botón 📝 Convenio → `ModalConvenio` con `metaFija = cuotasAtrasadas`. Cobro DIRIGIDO deuda-primero (multa) + ahorro tarifa-primero vía `calcularAhorroAplicado`: la BD respeta el `aplicado` explícito (mig 045 líneas 163-165: solo re-reparte si TODOS los aplicado_* son 0), funciona igual para motor v2 y v1. "✓ Entregar" se habilita cuando `totalPendiente(deudas)<=0 && (cuotasAtrasadas<=0 || convenioId!=null)`.

**4. `ModalEntregaDevolucion.tsx`** (nuevo) — al entregar retenida ya paga: 6 fotos (incl persona) + km + condición → sube a Storage `entregas/{contratoId}/`, registra evidencia en `recepciones_vehiculo` (motivo `otro`, destino `con_cliente`) y `reactivarContrato()` (Activo + moto Asignada).

**Pendiente de probar en navegador con login real** (no había credenciales): las 2 pestañas, cobro→convenio→entregar de una retenida, y la 6ª foto en wizard/recolección. **Nota de diseño:** el convenio NO manipula el ledger de cajas (cajas_previas es estático); la unblock de entrega usa `convenioId!=null` como flag de "atrasado financiado" — el convenio se cobra semana a semana por cartera normal (ya cuenta para mora, ver Fase Convenios).

**AUDITORÍA B5 (go-live) — 7 bugs corregidos + desplegados (24-jul-2026, commit `7b20656`):** tsc/tests/build limpios.
- **ALTA-1:** liquidación subía documento/fotos al bucket **`liquidaciones` inexistente** → cambiado a `documentos` (`useLiquidaciones.ts:179,182` doc firmado; `useUbicaciones.ts:212,214` fotos de recepción). Ninguna liquidación se podía cerrar antes.
- **ALTA-2:** liquidación perdía el ahorro de apertura de migrados (usaba `ahorro_acumulado` en vez de `ahorroTotal(c)`) → corregido en `InmovilizacionesView.tsx:311` y `MotosView.tsx:1164` (ContratosView ya estaba bien). Evita lista negra injusta / devolución mal calculada (~74 migrados).
- **ALTA-3:** convenio-para-recuperar se tragaba la multa (el trigger 054 la marca `en_convenio` fuera de la meta). Fix = **candado `!faltaMulta`** en `puedeHacerConvenio` (InmovilizacionesView) → hay que cobrar la multa (deuda) ANTES de conveniar. NO se tocó el trigger 054 (diseñado para el flujo general de CobrosView, donde la meta SÍ incluye las deudas — cambiarlo lo rompería).
- **MEDIA:** guarda contra doble-inicio de liquidación (misma no-cerrada) en `iniciarLiquidacion`; `ModalRecoleccion` chequea error de `registrarGestion` (ancla del reloj de 7 días) y de la subida de las 6 fotos (aborta antes de suspender); `ModalEntregaDevolucion` chequea subida de fotos; `usePrestamos` chequea error en cada swap **y** restaura el estado previo EXACTO de la prestada al devolver (Disponible vs Recuperada) vía **mig 059** `prestamos_reemplazo.moto_prestada_estado_previo` (✅ corrida por el usuario).
- **Diferidos con razón:** dedup de alquiler diario (ambiguo — puede ser cobro de varios días; falta regla), `recolectandoId` (código inerte en CobrosView, sin efecto), doble-conteo de convenio PLAUSIBLE (memoria dice que ya cuadra; no se tocó el ledger sin repro).
- **✅ CLICK-TESTS B5 HECHOS (24-jul, commit `63df022`):** verificado en navegador logueado (FREDY) + REST contra producción.
  - **🐛 BUG NUEVO encontrado y arreglado — crash de `ModalPrestarReemplazo`:** al abrir "Prestar reemplazo" la app se ponía en BLANCO. Causa: `usePrestamos` usaba nombre de canal realtime FIJO (`"prestamos_reemplazo_ch"`); cuando el hook lo montan 2 componentes a la vez (InmovilizacionesView + el modal), el 2º `.on()` sobre el canal ya suscrito revienta (`cannot add postgres_changes callbacks after subscribe()`) y tumba la app (sin error boundary). **El préstamo estaba 100% roto** (nunca se había abierto en navegador). TODOS los demás hooks ya usaban `${Math.random()}` en el nombre — usePrestamos era el único con nombre fijo. Fix: sufijo único por instancia (`chId`). **Lección: hook con nombre de canal FIJO + usado por 2 componentes montados a la vez = crash. Siempre randomizar el nombre del canal.**
  - **Ciclo de préstamo completo ✅:** prestar (guardó `moto_prestada_estado_previo='Disponible'`, swap OK) → devolver (la prestada volvió a **Disponible**, NO Recuperada = fix ALTA-7 probado; contrato volvió a su moto). El modal de resolver tiempo aparece tras devolver (para AP), se cierra sin resolver.
  - **ALTA-1 bucket ✅:** subida a `documentos` = 200; bucket `liquidaciones` = **"Bucket not found"** (confirmado que NO existe → antes ninguna liquidación se cerraba).
  - **ALTA-2 ahorroTotal ✅:** iniciar liquidación guardó `ahorro_acumulado=350000` (=50k acum + 300k apertura), creó orden de taller real, moto→Mantenimiento.
  - **ALTA-3 candado ✅:** ambas retenidas reales (XZZ68H, YAW70H) ocultan el botón Convenio con multa pendiente.
- **Test data de prueba (B3 + B5) limpiado por SQL** (el usuario corrió el bloque de borrado). B3: `b9eace0c`/`e5af7e18`/`e3092dbc`/`6fb9b2ba`. B5: cliente `a81df92e`, motos `831b2519`+`2ca3c0bb`, contrato `17e3652a`, préstamo, liquidación LIQ-0001 + orden taller.
- **Falta (solo requiere file-upload real, no automatizable fácil):** completar el CIERRE de una liquidación (subir doc firmado → firmada → cerrada) — el bucket ya está probado, así que es bajo riesgo.

Relacionado: [[libro-de-cajas-motor-v2]], [[rediseno-contratos-liquidaciones-julio2026]], [[empalme-migracion-construido]], [[entrega-golive-lunes27]].
