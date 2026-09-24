---
name: libro-de-cajas-motor-v2
description: "Especificación APROBADA del motor de dinero v2 \"Libro de cajas\" (FIFO por períodos) — definida 11-jul, en construcción"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
---

Especificación completa y APROBADA del motor de dinero v2 — **la fuente canónica está en CLAUDE.md sección "🫀 ESPECIFICACIÓN LIBRO DE CAJAS"** (11 reglas + ejemplo canónico + orden de construcción F1-F7). NO re-preguntar al usuario nada de lo definido.

Claves para retomar rápido:
- Contrato = N cajas (calendario real: 24m=104 sem); termina por PAGOS no por tiempo; FIFO estricto (la plata tapa el hueco más viejo); ahorro al llenar cada caja (tarifa-primero dentro de la caja); nadie pierde ahorro por castigo; excedente→saldo a favor (aplicar a futuras = manual); mora = caja exigida sin llenar; rodar exonera exigencia pero las cajas se pagan al final; convenio: semanas financiadas ganan ahorro al CUMPLIRSE; salida: se cobra hasta el día de entrega de la moto y lo no consumido se devuelve en liquidación.
- Nuevos: Caja 0 prorrateo + Caja 1 adelantada PAGADA con la base (pago interno visible excluido de caja diaria); apertura = $308.000. Migrados: cajas desde su corte. Diario FUERA del ledger.
- Mejora estructural: reparto de pagos EN LA BD (RPC única) — frontend solo "registra $X".
- **Estado (11-jul, cierre):** F1-F7 CONSTRUIDAS Y DESPLEGADAS. Migs corridas por el usuario: 045 ✅, 046 ✅, 047 funciones preview ✅ (versión con v_c tipada — el record del join no castea a contratos). Tabla de conversión de 72 migrados REVISADA Y APROBADA (JULIO/WILLIAM/DURIS/VICTOR financiadas ✓; RMZ69H/RMZ64H fuera por falta de datos). **Paso B ✅ CORRIDO Y VERIFICADO (11-jul): 72 contratos con motor_v2, 1.614 cajas pagadas.** EL MOTOR ESTÁ VIVO EN PRODUCCIÓN — el sistema completo corre en FIFO. F7: ajusteSalidaLedger en cicloPago + integrado en LiquidacionesView (deudasAjustadas = deudas + porCobrar − aFavor). Tras el Paso B: la cartera pasa a FIFO estricto (más "mora" visibles = regla nueva, no bug). Wizard nuevos ya nacen motor_v2.
- Relacionado: [[empalme-migracion-construido]], [[cartera-fixes-dinero-julio2026]].
