---
name: unificar-deuda-convenio-descartado
description: "Unificar `deudas` + `convenios` — analizado a fondo y DESCARTADO (138-172h, 6 defectos que romperían producción); destapó 4 bugs vivos ya corregidos"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-27T01:15:55.825Z
---

El usuario pidió unificar `deudas` y `convenios` en una sola fuente (guardan la misma plata dos
veces, y eso causó el cobro doble de [[bug-convenio-cobro-doble]]). Se midió el alcance con un
workflow de 6 agentes: mapeo de lecturas, diseño del modelo unificado y revisión adversarial.

## VEREDICTO: no unificar
**138–172 horas** tocando el motor del dinero, con 269 clientes y 17 convenios vivos.
El revisor adversarial encontró **6 defectos que romperían producción** en el diseño propuesto:
- Vistas SQL **sin `security_invoker`** → expondrían la cartera de los 269 a SUBADMIN, SOCIO y
  MECANICO, destruyendo las 12 políticas RLS de las migs 026/056/057.
- `createTableStore` **no sirve sobre vistas**: no hay `created_at` para el `order`, y realtime
  no replica vistas → la cartera aparecería en $0 y un cobrador no cobraría ese día.
- `current_date` en SQL (Supabase corre en UTC) movería toda la cartera un día **desde las 7pm**
  hora Colombia — el proyecto ya tiene `hoyISO()` con `America/Bogota` justo por esto.
- `drop column cuotas_pagadas` mata la creación de convenios (3 puntos la insertan) y deja el
  RPC `marcar_convenios_vencidos()` fallando en silencio → **ningún convenio volvería a vencer**.
- `rename deuda_total` haría imprimir **`$NaN`** en el acuerdo de pago que el cliente firma.
- El estado `'anulada'` viola el CHECK de `006_cartera_rediseno.sql`.

**Conclusión del revisor, compartida:** si el chequeo de la mig 070 sigue en cero durante un mes
y nadie reporta descuadres, **la respuesta correcta es no hacerlo nunca**.

## ✅ Lo que SÍ salió de ahí (commit `20ef291`)
Cuatro filtros que sumaban deudas `en_convenio` como si se debieran aparte —
**17 clientes, $8.047.100 de más**, varios con deuda exigible real de $0 y la ficha mostrando
$872.000 en rojo:
- `FichaClienteView:231` — el KPI "Deuda activa" de la ficha del cliente
- `FichaClienteView:934` — **el acuerdo de pago impreso**, que el cliente firma
- `ReportesView:1024` — el informe de gerencia (la línea 589 del **mismo archivo** ya usaba el
  criterio correcto: había dos verdades contradictorias en un archivo)
- `ModalConvenio:77` — precargaba la meta de un convenio NUEVO incluyendo deudas que un convenio
  ANTERIOR ya financiaba. **Mismo bug de la mig 070 por otra puerta, y seguía vivo.**

NO se tocó el contador del tab "Deudas (N)": ahí la lista muestra cada deuda con su estado, así
que contar las no pagadas es correcto.

## 🔲 Pendientes que dejó el análisis (semana 1-2, sin tocar el motor)
1. **Archivar en PDF los 17 acuerdos de pago tal como se imprimen hoy** — es lo único
   irreversible del sistema y cuesta ~2 h.
2. `ModalDeuda.tsx:53` — no valida `descripcion`: revienta con un `23502` crudo delante del
   cliente.
3. Dos columnas huérfanas (`cubre_periodo_hasta`, `firma_url`) no están en ninguna migración del
   repo: **un `db reset` borraría producción en silencio**.
4. Trigger `AFTER UPDATE OF estado` en `convenios`: al salir de `activo`, devolver sus deudas a
   `'pendiente'` (hoy quedan `en_convenio` para siempre y un convenio nuevo las volvería a cubrir).
5. Contar `deudas en_convenio con convenio no activo` y resolver nominalmente, con placa.
