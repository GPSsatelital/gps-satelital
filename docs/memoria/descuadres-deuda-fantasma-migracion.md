---
name: descuadres-deuda-fantasma-migracion
description: "🔨 Pagos abonados a deudas de apertura luego anuladas — DANIEL/YERLIS ✅ reparados, CLAUDIO SQL entregado (sin confirmar corrido), JHEINER $91.000 PENDIENTE (retomar aquí)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-23T20:28:47.243Z
---

**Patrón del bug (17-jul):** la migración creó deudas de apertura que FREDY después corrigió/anuló, pero los pagos ya habían abonado a ellas → esa plata quedó "tragada" (ni en la caja ni en saldo a favor) → cuota parcial falsa en pantalla. El motor v2 (init mig 047) llenó cajas solo con Σ `aplicado_tarifa`, así que el abono desviado dejó la caja coja.

**Barrida detectora (reusar):** pagos Confirmados con Σ `aplicado_deuda` > Σ `deudas.monto` original del contrato. OJO: deudas ELIMINADAS desaparecen del lado derecho (caso JHEINER); y editar "monto original" hacia abajo da falsos positivos (caso JAIDER).

## 🆕 SEGUNDO PATRÓN (23-jul, JHEINER): CLIENTE NUEVO mal migrado — le falta el PRORRATEO
Distinto del de deuda-fantasma. JHEINER (IEW47I) recibió la moto 20-jun, solo ~11 días antes del corte (1-jul) → es casi NUEVO, pero la migración lo cargó como establecido: `prorrateo_total=0`, `ahorro_apertura=0`. Resultado: su deuda salía **$406.000** cuando lo correcto es **$515.000** (le faltaba cobrar el prorrateo de $109.000 = días 21-24 jun: dom $16.000 + 3×L-S $31.000). Además su ahorro quedó corto (le faltan los $308.000 de la base inicial).
- **Señal clave que distingue nuevo vs establecido:** `ahorro_apertura=0` → NUEVO mal migrado (no había ahorrado nada). `ahorro_apertura>0` → establecido (ya venía ahorrando) → su prorrateo=0 ES correcto, NO se toca.
- **Barrida:** migrados de tiempo definido con `fecha_entrega >= fecha_inicio_cajas - 25 días` (recibieron moto cerca del corte). El 23-jul salieron 3: JHEINER (ahorro_apertura=0 → 🔴 nuevo), NESTOR MORENO/YAL67H (apertura $48k) y CARLOS NAVARRO/IEW48I (apertura $70k). **CARLOS = ✅ establecido, correcto** (tenía deuda $72k que paga normal + saldo a favor $60.500). **NESTOR (YAL67H) = ⏸️ PARQUEADO** (usuario lo confirma después cuando tenga sus datos — al retomar preguntar si es nuevo o establecido).
- **JHEINER deuda ✅ CERRADA 23-jul** (SQL corrido y verificado: prorrateo_total/pagado=109000, caja_actual=91000). **CLAUDIO ✅ CERRADO 23-jul** (SQL corrido: aplicado_deuda 3000→1500, saldo 35000→36500 + jsonb). Reconciliación de dinero prácticamente completa; solo queda NESTOR (parqueado) y el ahorro de JHEINER (empalme, sin prisa).
- **Fix de la DEUDA de JHEINER (SQL aplicado 23-jul, con guardas `caja_actual_pagado=200000 and prorrateo_total=0`):** `prorrateo_total=109000, prorrateo_pagado=109000, prorrateo_ahorro=14000, caja_actual_pagado=91000` (mueve los $109.000 mal contados como caja al casillero prorrateo). Verificado contra cicloPago.ts: `huecoCuotasHoy = prorrateoExigibleHoy(0) + (exigidas 5 − pagadas 2)*202000 − enCurso 91000 = 515000`. Antes de este fix, JHEINER ya se había reparado el $91.000 deuda-fantasma (caja 109000→200000) — este fix es ADEMÁS de aquel.
- **AHORRO de JHEINER (pendiente, no urgente para cobrar):** faltan los $308.000 de la base. Como tiene empalme abierto, cargarlo por el Panel de Empalme con el cliente, o SQL (`ahorro_apertura=308000`).
- **Cómo se calcula el prorrateo (regla):** desde el día DESPUÉS de la entrega hasta el primer día de pago inclusive, contando domingos aparte (dom=tarifa+ahorro domingo, L-S=tarifa+ahorro L-S). Ej. JHEINER entrega sáb 20-jun, primer pago mié 24-jun → dom 21 ($16k) + lun/mar/mié ($31k×3) = $109.000.

## Estado por caso
1. **DANIEL NIÑO (RMZ47H) ✅ REPARADO y verificado** — pago 3-jul: $30.000 deuda→cuota, caja 8-jul completada, ahorro +26.000. Guarda `caja_actual_pagado=165000` usada.
2. **YERLIS QUINTERO (XZN23H) ✅ REPARADO y verificado** — ídem con $31.000, guarda 171000. Ambos con rastro en contratos_auditoria. Ya no salen en la barrida.
3. **JAIDER FERRER (YAC80H) ✅ NO TOCAR** — falso positivo: FREDY revisó con el cliente el 16-jul, dejó deuda $88.000 en convenio y CERRÓ su empalme. Decisión del usuario: está bien así.
4. **CLAUDIO ARNEDO (DRO38I) — SQL entregado, ⚠️ SIN CONFIRMAR si se corrió.** Deuda venía doblada ($3.000, real $1.500). Fix: pago 3-jul `aplicado_deuda 3000→1500`, `aplicado_saldo_favor 35000→36500` + auditoría. La cuota NO se toca (entró completa). Verificar con la barrida: si ya no sale, se corrió.
5. **JHEINER PALOMINO (IEW47I) 🔴 PENDIENTE — EL SIGUIENTE PASO AL RETOMAR.** Pago 6-jul $200.000 = $109.000 cuota + **$91.000 a deuda que NO EXISTE** (cero filas en deudas, cero rastro en auditoría — ¿borrada por SQL directo?). Los $109.000 huelen a prorrateo inicial (3×$31.000+$16.000) → probablemente contrato NUEVO "camino viejo" (pre-wizard-v2, NO estaba en la lista de los 5 reparados el 15-jul). Pago duplicado Rechazado 5-jul (sin efecto). Pago 15-jul $202.000 normal.
   - **Faltan 2 consultas** (ya redactadas en el historial, pedirlas de nuevo):
     a) Ficha del contrato: `es_migrado, motor_v2, forma_pago, valor_semanal, fecha_entrega, fecha_inicio_cajas, cajas_previas, cajas_pagadas, caja_actual_pagado, prorrateo_total, prorrateo_pagado, created_at` (SIN columna saldo_a_favor — no existe).
     b) **Barrida de contratos sin motor:** activos/suspendidos de tiempo definido con `motor_v2=false` → deberían ser CERO; si salen más, hay más "camino viejo" sueltos.
   - Según eso se decide a dónde devolver los $91.000 (caja vs prorrateo) con el mismo estilo de SQL con guardas.

## Técnica de reparación segura (usada en DANIEL/YERLIS)
- Editar `pagos.aplicado_*` NO dispara el motor (el trigger `trg_pago_confirmado_iu` es `update OF estado`) — seguro por SQL directo.
- UPDATE de contratos con **guarda** (`where caja_actual_pagado = <valor esperado>`) para que no toque nada si el estado difiere.
- Siempre: SELECT preview → fix en un solo begin/commit → SELECT verificación → verificar pantalla.
- Al completar una caja: `cajas_pagadas+1`, `caja_actual_pagado=0`, `ahorro_acumulado+26000` (tarifa-primero: los últimos $26k de la caja son ahorro).
