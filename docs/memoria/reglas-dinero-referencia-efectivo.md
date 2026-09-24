---
name: reglas-dinero-referencia-efectivo
description: "Dos reglas de negocio del dinero confirmadas por el usuario (25-jul-2026) — una referencia = un valor exacto, y en efectivo nunca puede faltar"
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-07-26T02:55:11.819Z
---

Reglas dictadas por el usuario el 25-jul-2026, al corregir una implementación mía. Valen para
**cualquier** pantalla que toque dinero, no solo donde se aplicaron.

## 1. Una referencia bancaria va casada a UN solo valor
Nunca puede existir la misma referencia con dos valores distintos: un movimiento del banco es
uno solo, por un monto exacto.
- **No existe el "abono parcial" de una transferencia.** Si sobran $300.000, lo normal es que
  sean **dos referencias distintas** ($120.000 con una y $180.000 con otra), no una partida de
  $300.000 pagada a pedazos.
- Si el valor registrado no coincide con el del extracto → **algo raro**: el funcionario lo
  valida **con la foto del comprobante** (que siempre es obligatoria) antes de pasar.
- **Why:** es la única prueba de que ese dinero entró. Si el sistema acepta cualquier monto
  contra una referencia, la prueba deja de valer y se puede acreditar plata que no existe.
- **How to apply:** al cruzar contra `ingresos_no_identificados`, exigir monto idéntico;
  bloquear el descuadre en las dos direcciones (no solo cuando el pago es mayor).
  Ver [[revision-adversarial-transferencias]].

## 2. La foto del comprobante SIEMPRE es obligatoria en transferencias
Sin excepción por pantalla ni por rol. Descarté mi propia propuesta de exceptuarla cuando la
referencia ya cruzó con el banco — el usuario fue explícito.
- **How to apply:** falta implementarla en `CobroDiarioView` (bloque E pendiente).

## 3. En efectivo nunca puede faltar
El efectivo se recibe **en la mano y se confirma en el acto**; un pago en efectivo Confirmado
significa que esa plata está en la caja. No hay caso legítimo donde falte.
- Si al contar la caja no cuadra → **no se deja cerrar** hasta hallar la diferencia (no es una
  nota al pie, es una alarma: o alguien la tomó, o hay un pago registrado que no se recibió).
- El **banco** sí deja cerrar: un sobrante ahí es plata por identificar, no plata perdida.
- **Why:** dejar cerrar con faltante hace que el descuadre quede "cerrado" y nadie responda.
