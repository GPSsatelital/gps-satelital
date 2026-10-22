---
name: bug-aplicar-saldo-favor
description: "Bug de plata: 'Aplicar saldo a favor' registraba efectivo nuevo (inflaba caja) y no descontaba el saldo (doble crédito). Arreglado + CARLOS/IEW48I corregido (24-jul)."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-24T19:50:26.796Z
---

**Bug (24-jul-2026):** el botón "Aplicar saldo a favor" (CobrosView `handleAplicarSaldo`) llamaba a `registrarPago(..., saldo, "Efectivo", ...)` → registraba un **pago NUEVO en efectivo** por el monto del saldo. Dos daños: (1) **inflaba la caja diaria/recaudo del día** con plata que no entró; (2) **no descontaba el saldo** (el saldo = Σ `aplicado_saldo_favor`, y el pago nuevo lo dejaba en 0) → quedaba **doble crédito** (se podía aplicar infinitas veces).

**Por qué el motor v2 lo hacía difícil:** en `aplicar_pago_confirmado` (mig 045), el reparto FIFO solo corre si TODOS los `aplicado_*` son 0 (`v_sin_reparto`), y llena cajas desde `valor` como plata nueva, poniendo el excedente en `aplicado_saldo_favor` POSITIVO. Con `aplicado` explícito NO reparte (no avanza cajas). O sea el motor trata el saldo como SALIDA (excedente), no como FUENTE.

**Fix (commit 6258098, EN PRODUCCIÓN):** nueva `usePagos.aplicarSaldoFavor(contratoId, saldo)`:
1. Inserta un movimiento **interno** (`tipo_registro:'saldo_favor'`, `valor=saldo`, todos los `aplicado_*`=0) → el motor lo reparte y **avanza la cuota**.
2. **Relee** el pago (RETURNING no refleja triggers AFTER) para saber el excedente, y hace `PATCH aplicado_saldo_favor = excedente - saldo` (consume el crédito). No re-dispara el motor (no toca `estado`).
- `esPagoDeCaja` ahora excluye `tipo_registro` **`saldo_favor`** (además de `adelanto_base`) → NO cuenta en caja diaria/recaudo. `TipoRegistroPago` incluye `saldo_favor`. `handleAplicarSaldo` usa la nueva función (ya no `registrarPago` en Efectivo).

**CARLOS NAVARRO (IEW48I, contrato 86162a72-…) — CORREGIDO 24-jul:** tenía el pago malo (24/07 $60.500 Efectivo normal, id e71d57a9). Se **borró por UUID exacto** (el motor revirtió caja 100.500→40.000, saldo intacto 60.500) y se **re-aplicó** con la lógica corregida (movimiento interno) → **saldo 0, caja 100.500, sin efectivo fantasma**. "Recaudado hoy" bajó de $312.500 a $252.000 (los $60.500 fantasma). Verificado por REST paso a paso.

**⚠️ Pendiente ofrecido, no hecho:** **escanear la BD por otros clientes** que usaron el botón viejo (patrón: pago `metodo=Efectivo`, `tipo_registro='normal'`, por un monto igual a un `aplicado_saldo_favor` positivo previo del mismo contrato, sin que el saldo baje). El usuario eligió "arregla CARLOS + el botón" (no el escaneo). Ofrecer al retomar. Ver técnica de reparación segura en [[descuadres-deuda-fantasma-migracion]].
