---
name: deudas-etiquetadas-a-donde-va-la-plata
description: "✅ CONSTRUIDO 7-sep-2026 (mig 131 corrida). Cada deuda tiene concepto propio y DESTINO: a dónde vuelve la plata al pagarse (socio de la moto / socio de la prestada / reembolso a la empresa / ingreso de la empresa). Cero deudas en 'otro'. La empresa tiene $3.128.000 adelantados sin recuperar."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T18:48:48.885Z
---

# Deudas etiquetadas y con destino — CONSTRUIDO (mig 131, 7-sep-2026)

## De dónde vino
Pedido del dueño, textual: *"las deudas nacen por donde se crean las deudas y ya nacen con sus
asignaciones o el porqué se generaron; hay que definir más las posibles deudas para que sean
devueltas a donde van cuando se paguen y queden debidamente etiquetadas o vigiladas."*

**La evidencia:** de 287 deudas, 12 estaban en `otro` — y no eran una cosa, eran SIETE: 5 decían
"EXCEL VIEJO" (migración), 2 alquiler de moto prestada, 1 saldo de liquidación, 1 lavada, 1
préstamo, 1 base inicial y 1 multa por comprobante falso. Mismo patrón que obligó a crear
`migracion` (mig 090): **cuando la gente no puede marcar lo que es, escribe a mano.**

## Decisiones del dueño (7-sep)
1. **"Depende del tipo de deuda"** — no todo es del socio ni todo de la empresa.
2. **Crear los conceptos que faltaban y reclasificar** las 12 viejas (ninguna cifra cambió).

## Lo construido
- **4 conceptos nuevos**: `alquiler_reemplazo`, `saldo_liquidacion`, `base_inicial`, `multa`.
- **`zala.conceptos_deuda`** — el catálogo: concepto, etiqueta, qué es en palabras, **destino**,
  destino en palabras, quién puso la plata. **Un tipo nuevo es una fila acá, no desarrollo.**
- **Los 4 destinos**:
  · `socio` → arriendo y saldos: al portafolio de la moto (tarifa_atrasada, migracion, base_inicial, saldo_liquidacion, otro)
  · `socio_prestada` → el alquiler de la prestada va al portafolio de ESA moto (regla 30-jul: "nunca se mezclan las cuentas")
  · `empresa_reembolso` → la empresa adelantó y recupera (lavada, prestamo_repuesto, prestamo_eventualidad, daño_vehiculo, fotomulta)
  · `empresa_ingreso` → penalización, ingreso propio (multa_recoleccion, multa)
- `zala.deudas` gana `etiqueta`, `destino`, `destino_texto`, `lo_puso`; 5 filas nuevas en el
  diccionario (102 en total). El alquiler del préstamo ya nace con su concepto, no con 'otro'.
- Pantalla: `ModalDeuda` ofrece Multa y Base inicial (alquiler y saldo de liquidación NO: los crea
  el sistema solo). `ConceptoDeuda` en TS y `CONCEPTO_TEXTO` de ModalConvenio actualizados.

## Verificado tras correr la 131
**0 deudas en 'otro'.** 12 conceptos vivos. `zala.deudas` = 204 filas con su destino.
**Lo que la empresa adelantó y no ha recuperado: $3.128.000** — daño al vehículo $1.542.000 ·
fotomulta $645.000 · préstamos por eventualidad $521.000 · repuestos $300.000 · lavadas $120.000.
Ese informe no se podía hacer antes.

## Tropiezo al correrla (lección)
`create or replace view` **no deja cambiar el nombre ni el orden de una columna existente**
("cannot change name of view column"). Hay que `drop view` y recrear — y volver a dar el `grant`.
Y el SQL Editor corre el bloque en UNA transacción: al fallar la parte 4 se deshizo también el
catálogo de la parte 2. Migración idempotente = se vuelve a correr entera sin daño.

**Why:** sin destino, la caja sabía cuánto entró pero no a qué bolsillo iba; la empresa no podía
ver qué había adelantado y no recuperado.
**How to apply:** concepto nuevo = fila en `zala.conceptos_deuda` con su destino + valor en el
CHECK de `deudas.concepto` + su texto en las dos pantallas. Ver [[convenio-que-entra-casillas]].
