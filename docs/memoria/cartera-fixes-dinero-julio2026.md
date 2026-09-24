---
name: cartera-fixes-dinero-julio2026
description: "Los 4 bugs de dinero de cartera corregidos el 8 jul 2026 (falsa mora, deuda que no bajaba, prorrateo en migrados, protocolo falso) + próximo tema caja por grupos"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Sesión 8 jul 2026 — "la parte más importante del sistema" (manejo del dinero). 4 bugs reales de plata corregidos, todos disparados por revisar casos reales (JHON FERNEY BOLAÑO, YERLIS ELENA QUINTERO). Todo en producción; mig 040 corrida.

**Patrón raíz recurrente:** funciones/side-effects "construidos pero nunca conectados" (ya visto en Liquidaciones, ahorro, cuotas de convenio, y ahora la reducción de deuda). Y cálculos de "días" que no distinguen días-desde-último-pago vs días-de-mora-real vs período-real-del-contrato.

**Los 4 bugs:**
1. **Falsa mora:** `totalPagadoPeriodoActual` usaba semana calendario lunes-domingo para Semanal → clientes de día miércoles salían "en mora" los lun/mar aunque pagaran puntual (41 falsos). Fix: período REAL del contrato + `inicioVentanaPagosISO()` (prepago de víspera). Fuente única en cicloPago.ts; useAlertas migrado a calcularEstadoCartera/diasEnMora (tenía su propia copia con días crudos).
2. **Deuda no bajaba:** pago con aplicado_deuda>0 guardaba el abono pero nunca restaba de deudas.monto_pendiente → doble cobro. Fix en el trigger aplicar_pago_confirmado (mig 040): baja deudas más-antigua-primero al confirmar, restaura al anular/borrar. Backfill una vez. CLAUDIO ARNEDO quedó en $0 (deuda real $1.500, bug le duplicó abono a $3.000 — el tope least() lo protege).
3. **Prorrateo en migrados:** nueva columna `contratos.es_migrado`. TODOS los contratos actuales = true (son PRADERA+RASTREADOR migrados); nuevos del wizard = false por default. `estaEnProrrateo` devuelve false si es_migrado. Los migrados ya traían ciclos anteriores → nunca están en su "primera semana".
4. **Badge protocolo (Paso 1-4) estando al día:** el panel de detalle lo mostraba con diasSinPago>0. Ahora gateado con estadoCartera==="mora" (como el Panel Hoy).

Más: desglose "Se aplicó a" en el Historial del contrato (con respaldo al jsonb legacy `aplicado`); entrega voluntaria de moto en Motos (suspende contrato, costo solo si se fue a buscar).

**Regla de negocio confirmada:** la cuota (ej. $202.000 semanal) YA incluye el ahorro por dentro ($176.000 tarifa empresa + $26.000 ahorro cliente). El ahorro nunca es aparte. Ver [[estado-ciclopago-convenios]].

**CAJA POR GRUPO — ✅ HECHO (8 jul 2026, en producción, commit `2039883`→merge `d87576d`):** cada portafolio se cierra POR APARTE (Paso 2, no solo desglose visual). `caja_diaria` pasó de UNIQUE(fecha) a UNIQUE(fecha,grupo) — **mig `041_caja_por_grupo.sql` ⚠️ el usuario debe correrla en Supabase** (agrega columna `grupo` default 'GENERAL' + cambia la constraint). `useCaja.cerrarCaja` ahora exige `grupo` y hace upsert onConflict "fecha,grupo"; `cajaDia(fecha, grupo)`. En **CajaView** cada grupo se cierra desde su tarjeta del recuadro "Recaudo por grupo" (botón por grupo + modal por grupo), badge "N de M grupos cerrados". En **CobroDiarioView** pestaña Caja también quedó por grupo (regla de mapeo integral — no dejar un botón viejo que cerrara todo junto). Grupo de un pago = pago→contrato→moto→grupo. Schema real confirmado antes de la mig: caja_diaria(id, fecha, efectivo_total, transferencias_total, total int, detalle jsonb, cerrado_por, notas, created_at).

Ver [[auditoria-permisos-rls-julio2026]] y [[migracion-grupos-datos-reales]].
