---
name: liquidaciones-auditoria-y-huecos
description: "Auditoría de liquidaciones (12-ago-2026, 83 hallazgos). VERIFICADO el 7-sep: los 5 defectos de PLATA y la trampa del motivo ya están arreglados. Quedan solo cosas de forma (Paz y Salvo, 375px, errores en verde, anular una liquidación)."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T17:57:12.577Z
---

# Liquidaciones — auditoría (12-ago) · los 5 de plata ✅ CERRADOS (verificado 7-sep-2026)

Los 83 hallazgos siguen en `.claude/plans/auditoria-liquidaciones-hallazgos.json`.

## ✅ Los defectos de PLATA: todos arreglados (verificado en el código vivo, 7-sep)

| Defecto de agosto | Estado hoy |
|---|---|
| El cobro de salida crecía mientras la liquidación dormía (usaba HOY) | ✅ `LiquidacionesView:282` y `cuentaLiquidacion:132` usan la **fecha de entrega de la moto**, no hoy |
| El convenio INCUMPLIDO desaparecía del snapshot (solo miraba 'activo') | ✅ `useLiquidaciones:162` ya trae `['activo','incumplido']` |
| El saldo a favor no se devolvía | ✅ va en el snapshot (`saldo_favor`) y la mig 114/115 lo traslada con su origen |
| Cerrar no saldaba nada | ✅ `cerrar_liquidacion` (mig 105→115) salda deudas, cierra convenio, pone el ahorro en 0 y crea la deuda del faltante |
| 4 escrituras sin transacción | ✅ una sola función en la base (`rpc cerrar_liquidacion`) |
| **La trampa**: "Cumplimiento" preseleccionado regalaba la moto | ✅ `ContratosView:696` → `incumplimiento` si está Suspendido, si no `retiro_voluntario` |
| Tiempo real + guardar el objeto en vez del id | ✅ mig 107 publica la tabla |
| Se liquidaba sobre la moto PRESTADA | ✅ `useLiquidaciones:132` lo bloquea y manda a devolver primero |

## ✅ CERRADO el 16-sep-2026 — los cuatro pendientes de forma

Se verificaron **contra el código de hoy** antes de tocar nada (la lección de abajo, aplicada):
**tres ya estaban arreglados** y la memoria estaba vieja.
- Paz y Salvo debiendo → ✅ bloqueado, con doble candado (render + handler).
- 375px → ✅ `isMobile` puesto, grid de una columna.
- Errores en verde → ✅ el aviso lleva su tipo EXPLÍCITO (`{texto, esError}`).
- Corregir el motivo → ✅ `cambiarMotivo`, mientras no esté firmada.
- **Anular** → era el único que faltaba de verdad. Construido (`dfb3078`, mig 155).

**ANULAR (mig 155):** iniciar una liquidación sobre el contrato equivocado lo dejaba bloqueado para
siempre. Ahora se anula — **solo antes del cierre**, porque cerrar es lo que mueve plata; el
`.neq("estado","cerrada")` es el candado real, no el botón escondido. **Se marca, no se borra**
(`estado='anulada'` + quién/cuándo/por qué obligatorio + fila en `contratos_auditoria`): ese
contrato estuvo bloqueado y tiene que saberse por qué. Al anular se cierra la orden de taller
**solo si el mecánico no la trabajó**, y la moto vuelve con `estadoMotoTrasLiberar`.

## ⚠️ Lección de cómo NO hacer la auditoría
Se lanzó con **87 agentes** (la guía eran 15), consumió el tope mensual y 37 verificadores murieron;
la síntesis se cayó leyendo un veredicto nulo. Reglas: agrupar verificadores y proteger contra
nulos antes de sintetizar. Ver [[feedback-no-gastar-tokens-en-agentes]].

**Why:** la memoria de agosto decía "NADA arreglado" y llevó a planear trabajo ya hecho; se
verificó contra el código vivo antes de tocar nada.
**How to apply:** antes de retomar un pendiente viejo, comprobarlo en el código de hoy — entre la
nota y ahora pudo arreglarse por otra vía.
