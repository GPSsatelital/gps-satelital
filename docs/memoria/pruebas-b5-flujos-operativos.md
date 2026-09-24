---
name: pruebas-b5-flujos-operativos
description: "Pruebas B5 en sandbox (26-jul, víspera go-live) — recolección/convenio/entrega verificados; 3 bugs arreglados (mig 067); liquidación y préstamo sin probar"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-26T22:29:53.747Z
---

Pruebas de los flujos operativos "sin probar" (bloqueante B5), hechas sobre un **contrato de
prueba desechable**, no sobre clientes reales. Un workflow de 6 agentes mapeó antes qué escribe
cada flujo y dictaminó que **4 de los 5 no se debían probar sobre datos vivos** (el convenio
pisa el ledger sin guardar el previo, el préstamo cambia `moto_id` sin auditoría, la liquidación
es terminal y consume folio legal, la recolección crea deuda exigible).

## ✅ Verificado funcionando (cadena completa en sandbox)
- **Recolección**: las 4 escrituras encadenadas — contrato Suspendido + motivo 'mora', moto
  Recuperada en bodega, multa $20.000, recepción con 6 fotos, gestión registrada.
- **Candado del protocolo**: no deja recolectar sin haber intentado mensaje + llamada + sirena
  (no es un bug — es la regla; el funcionario debe saberlo o creerá que está roto).
- **Motor de cajas**: $202.000 → 1 caja + $26.000 de ahorro exacto.
- **Cobro deuda-primero**: los $20.000 fueron íntegros a la multa, sin tocar cajas ni ahorro.
- **Regla "multa antes que convenio"**: el botón Convenio no aparece hasta pagar la multa.
- **Entrega de la moto** (`ModalEntregaDevolucion`): contrato → Activo, moto → Asignada, evidencia.
- **Candados de la BD**: no se pueden borrar contratos Activos, ni motos, ni gestiones.

## 🔧 Bugs encontrados y ARREGLADOS (commits `1a871ee` + `77e888e`, **mig 067 ✅ corrida**)
1. **Borrar un convenio dejaba cuotas pagadas fantasma.** Medido: crear convenio subió
   `cajas_pagadas` de 1 a 5 (correcto); borrarlo lo dejó en 5 → el cliente quedaba como si
   hubiera pagado $808.000 que nunca pagó. Ya había pasado (duplicados del caso XZN22H).
   Fix: el convenio guarda `cajas_pagadas_previas`/`caja_actual_pagado_previo`/`cajas_pagadas_marcadas`
   y un trigger AFTER DELETE lo restaura **solo si el ledger sigue donde él lo dejó**.
   ⚠️ **Mi primera versión no servía**: la guarda decía `cajas_pagadas <= cajas_exigidas`, que
   bloquea justo el caso fantasma. Corregida y **verificada en sandbox por los dos lados**
   (restaura el previo incluido el parcial de $15.000 · no pisa un pago real posterior).
2. **La liquidación por cumplimiento fallaba en silencio**: `clientes.estado='Egresado'` no
   existía en el CHECK y el error no se revisaba → decía "cerrada" y el cliente quedaba Activo.
   Fix: 'Egresado' en el CHECK + el error ahora se informa.
3. **El cliente que nunca pagó ni una cuota no se podía recolectar**: `diasSinPago` exigía
   `deudaContrato > 0`; sin deuda quedaba en el sentinel 999 → salía "P4 Recolección física"
   en Contratos pero nunca entraba al grupo de Recolección. Quitada esa condición (quien
   protege a los nuevos es `estadoCartera === "mora"`).

## ❌ Error mío a no repetir
Para probar la reversa subí a mano un contrato REAL de 9 a 12 cuotas y lo devolví enseguida
(verificado: 9 cajas / $112.000 / sin convenios, idéntico). **No debí tocar datos vivos —
había un sandbox disponible.** También afirmé que "las pantallas no se refrescan": es FALSO,
la prueba limpia mostró 1 segundo de refresco; lo que me confundió fue que el servidor local
se cayó 3 veces durante las pruebas y eso corta el realtime.

## 🔲 Sin probar (decisión consciente)
**Liquidación completa** y **préstamo de reemplazo**. Ambos mapeados en detalle en el workflow;
son los más destructivos. Riesgos conocidos del préstamo: cambia `contratos.moto_id` sin
auditoría (si el insert falla no queda registro de la placa original) y mientras dura re-atribuye
el recaudo histórico al grupo de la moto prestada.

## 🔴 Pendiente serio post-go-live
El bucket `documentos` es **público**: cédulas, recibos, hojas de vida, huellas y la foto
"persona + moto" (cara del cliente) se abren con solo tener el link, sin sesión. Requiere pasar
a URLs firmadas — no es un cambio de una noche.

## Limpieza
Producción quedó limpia. Solo queda la moto de prueba **ZZZ03T** (USADAS, Disponible, marcada
"MOTO DE PRUEBA - BORRAR"): las motos no se pueden borrar desde la app, hay que hacerlo por SQL:
`delete from public.motos where placa = 'ZZZ03T';`
