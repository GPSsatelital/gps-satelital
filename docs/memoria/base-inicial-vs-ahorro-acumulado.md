---
name: base-inicial-vs-ahorro-acumulado
description: La BASE INICIAL y el AHORRO ACUMULADO son dos cosas distintas — el dueño me corrigió el 21-ago porque las estaba mezclando
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-08-21T22:17:54.912Z
---

# Base inicial ≠ ahorro acumulado

**La base inicial es la plata que el cliente pone AL ENTRAR**, de una, para poder llevarse la moto:
$510.000. De esos, **$202.000 le pagan su primera semana por adelantado** y los **$308.000 que
sobran quedan guardados como suyos**.

**El ahorro acumulado es otra cosa: es lo que va GANANDO con cada pago.** De los $31.000 que paga
al día, $4.000 son suyos y se le van sumando.

> **La base la pone él de entrada; el ahorro lo construye pagando.** Empieza en cero y crece
> semana a semana.

Confirmado textualmente por el dueño el 21-ago-2026 ("exacto, sí me suena") después de corregirme:
*"la base inicial es una cosa y el ahorro acumulado es otra cosa, eso sale es de los pagos
realizados, la base es base"*.

## Los campos del sistema (verificado en el código)

| Campo | Qué es |
|---|---|
| `contratos.ahorro_inicial` | **Solo el REGISTRO de cuánta base entregó.** No es su ahorro. Se copia de `clientes.ingreso_inicial`. En la pantalla de editar contrato se llama "Ahorro inicial" — mal nombre, es la BASE. |
| `contratos.ahorro_apertura` | Lo que le quedó de la base después de pagar la semana adelantada. En migrados, lo que el arqueo dijo que traía. |
| `contratos.ahorro_acumulado` | **Arranca en 0** y solo crece pagando. |
| `ahorroTotal(c)` | `ahorro_acumulado + ahorro_apertura`. **`ahorro_inicial` NO entra.** |

El wizard lo reparte bien: `adelantoValor = min(entregado, valorPeriodo)` → pago interno a la Caja 1;
`aperturaInicial = entregado − valorPeriodo` → `ahorro_apertura`; `ahorro_acumulado` en 0.

## ⚠️ Trampa cargada: `crearContrato()` en useContratos.ts

Hace `ahorro_acumulado: nuevo.ahorro_inicial ?? 0` — **mete la base completa dentro del ahorro
acumulado**, justo la confusión de arriba. Hoy NO hace daño porque **nadie la llama**: el wizard
inserta directo con `supabase.from("contratos").insert(...)`. Es código muerto.
Pero si alguien la conecta, el cliente sale con un ahorro que no ganó. **Recomendado borrarla** —
mismo patrón que ya mordió 3 veces en este proyecto.

## Problema de UI anotado

En "Editar contrato" hay **cuatro campos que dicen 'ahorro'** (inicial, nuevo, de apertura, saldo a
favor de apertura) y **solo dos entran en la cuenta**. Confunde a cualquiera — a mí me confundió.
Vale la pena renombrar "Ahorro inicial" → "Base inicial entregada".

Ver [[libro-de-cajas-motor-v2]] y [[liquidaciones-definicion-cerrada]].
