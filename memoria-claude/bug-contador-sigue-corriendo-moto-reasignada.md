---
name: bug-contador-sigue-corriendo-moto-reasignada
description: "✅ ARREGLADO el 7-sep-2026 (mig 129). A 12 clientes les crecía la deuda por motos que ya se le habían entregado a otro: $4.980.000 de más. Ahora el contador para el día que la moto pasa a otro cliente, y un trigger lo hace solo de ahora en adelante."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-07T17:56:56.307Z
---

# El contador para cuando la moto ya es de otro — ARREGLADO (mig 129, 7-sep-2026)

## Lo que pasaba
Cadena: se recoge la moto → contrato 'Suspendido' + moto 'Recuperada' → alguien la libera →
'Disponible' → el wizard la ofrece → se le entrega a OTRO… y **el contrato del primero seguía vivo
exigiendo cajas para siempre**, porque `cajas_exigidas` solo miraba `fecha_inicio_cajas`.
Detectado el 19-ago con 4 casos; medido el 7-sep: **12 casos, $9.082.000** inflados (y +$200.000
por semana).

## La regla (dueño)
- Mientras la moto está guardada esperando que pague, el contador **SIGUE** — ese tiempo se le
  cobra o se le rueda, como siempre.
- El día que la moto se le entrega a OTRO cliente, se acabó la espera: **el contador para ahí**.
  Se usa `fecha_entrega` del contrato nuevo, **no** la recepción: hasta ese día todavía podía
  recuperarla, así que ese tiempo sí se le cobra (más favorable a la empresa y coherente con la
  regla del tiempo guardado).

## Lo construido
- `contratos.fecha_fin_cobro` + `motivo_fin_cobro`.
- `public.cajas_exigidas` (cuerpo vivo de la 078 + una línea) y `cajasExigidasHasta` en TS topan
  ahí. **Espejo: si se toca una, se toca la otra.**
- `diasEnMoraV2` (TS) y `zala.dias_en_mora_v2` también se congelan. **Lo encontró una prueba**:
  las cajas dejaban de crecer pero los días seguían subiendo, y el cliente escalaba solo hasta
  "recolección física" de una moto que ya no tiene.
- **Trigger `contrato_activo_para_el_anterior`**: al activar un contrato sobre una moto que ya
  tenía otro contrato vivo, le pone la fecha al viejo. Excluye préstamos de reemplazo. Nadie
  tiene que acordarse.
- Backfill de los 12 + aviso gris en Cartera ("Su cuenta está congelada… no se le siguen sumando
  semanas"). 8 pruebas nuevas (`contadorParado.test.ts`).

## Resultado medido (7-sep, tras correr la 129)
**$4.980.000 dejan de cobrarse.** DANIEL DIAZ CARDONA (RNG53H): debía $1.950.000 → $1.170.000; al
liquidar pasa de deber $1.052.000 a deber $272.000. LUIS SANDON: $1.365.000 → $195.000.
ERIKA: $1.414.000 → $404.000. Verificado: 0 motos con dos contratos vivos sin freno.

## Pendiente menor
🔲 Agregarle a `zala.cliente` las columnas `cuenta_congelada` / `cuenta_congelada_porque` (obliga a
reescribir la vista completa). La CIFRA ya sale bien sola porque la vitrina usa `cajas_exigidas`.

**Why:** un contrato que no se cierra sigue cobrando solo; el candado tenía que estar en la base,
no en que alguien se acuerde de cerrar el viejo.
**How to apply:** para cerrar un contrato cuya moto pasó a otro no hace falta liquidarlo primero —
el freno ya lo dejó en la cifra correcta y la liquidación saldrá bien.
