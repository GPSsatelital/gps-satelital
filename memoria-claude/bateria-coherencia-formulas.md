---
name: bateria-coherencia-formulas
description: Las 5 fórmulas validadas de la batería de coherencia y las 3 trampas del reparto de un pago — medidas contra los 2.938 pagos confirmados el 22-sep
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-22T21:01:43.627Z
---

# Batería de coherencia — las fórmulas que SÍ dan (22-sep-2026)

Medidas en vivo contra toda la flota con [[consultar-base-desde-el-navegador]].
✅ **Construidas y desplegadas** (mig 165 — ver el final del archivo). Esto es la investigación
que las validó, y las trampas que hay que conocer para no romperlas.

## Resultado del día (la flota está limpia)

| Chequeo | Resultado |
|---|---|
| Reparto que no suma | **0** de 2.938 pagos confirmados |
| Lista del acuerdo ≠ su total | **0** de 89 con partitura · **56 acuerdos SIN lista** |
| Saldo a favor negativo | **0** |
| Dos contratos activos en una moto | **0** |
| **Cajas imposibles** | **3**: JORGE TOVAR (111 previas / 104 total) + CESAR y RAMON (118 y 112) |

## 🔴 LAS 3 TRAMPAS DEL REPARTO (me hicieron equivocar 3 veces)

Primera fórmula: **265 falsas alarmas**. Segunda: **142**. Tercera: **0**.
Si llego a construir el aviso con la primera, habría 265 alertas rojas de problemas que no existen
— y nadie vuelve a mirar un aviso que grita en falso.

1. **Hay 8 columnas de reparto, no 4.** Me faltaban `aplicado_prorrateo`, `aplicado_base_inicial`,
   `aplicado_multa`, `aplicado_lavada`. El prorrateo es el que más pesa: un pago de prorrateo tiene
   `aplicado_tarifa = 0` y su plata va en `aplicado_prorrateo`.
2. **`aplicado_multa` y `aplicado_lavada` van DENTRO de `aplicado_deuda`** — sumarlas aparte las
   cuenta dos veces.
3. **En un movimiento `tipo_registro = 'saldo_favor'`, la plata va AL REVÉS.**
   `aplicado_saldo_favor` viene **negativo** (−202.000): el saldo se **gasta**, no entra. Y `valor`
   solo repite ese monto, no es efectivo que llegó. En un pago normal ese campo es **positivo** (el
   sobrante que queda guardado).

### La fórmula buena

```
destinos = aplicado_tarifa + aplicado_prorrateo + aplicado_deuda + aplicado_convenio
         + aplicado_base_inicial
         + (contrato SIN motor v2 ? aplicado_ahorro : 0)   -- en motor v2 el ahorro va DENTRO de tarifa

si tipo_registro = 'saldo_favor':   entra = -aplicado_saldo_favor  ·  sale = destinos
si no:                              entra =  valor                 ·  sale = destinos + aplicado_saldo_favor

descuadrado  ⇔  |entra - sale| > 1
```

`motor v2` = `contratos.total_cajas > 0`. (El Diario queda fuera del motor y lleva el ahorro aparte
— ese fue uno de los 2 falsos positivos del 19-sep.)

## Las otras 4

- **Lista del acuerdo**: `sum(partitura[].monto) = convenios.deuda_total` (±1). Solo en los que
  TIENEN partitura; los 56 sin lista son otro pendiente, no un descuadre.
  ⚠️ Ojo con el otro falso positivo del 19-sep: **el candado de convenios es por CONTRATO, no por
  placa** — agrupar por placa da dobles que no lo son (XZP35H tiene 2 contratos, cada uno con el suyo).
- **Saldo negativo**: `saldo_favor_apertura < 0`. (Medir el saldo *disponible* de verdad exige
  sumar los aplicados y restar los usados — ver el candado de la mig 160.)
- **Cajas imposibles**: con `total_cajas > 0`, que `cajas_pagadas > total_cajas` o
  `cajas_previas > total_cajas` o cualquiera negativa.
- **Dos contratos activos en una moto**: agrupar contratos `Activo` por `moto_id`.

## Por qué existe el posponer

Los avisos se marcan "atendido" **por un día** (`pendientes_atendidos` es `unique(clave, fecha)`):
mañana vuelven. Con 2 de los 3 casos mandados a dormir por el dueño (CESAR y RAMON), el aviso se
los pondría en la cara todos los días — y el ruido es justo lo que hizo que 431 avisos taparan 20
SOAT vencidos. El dueño eligió **poder posponer con fecha y motivo**.

## Cómo se engancharía

`public.pendientes` (mig 144, parcheada por 145·148·158·159) es un `union all` de ramas.
Columnas: `clave · tipo · titulo · detalle · nivel · dueno_id · dueno_rol · contrato_id · moto_id ·
cliente_id · placa · dias · orden · monto`. `dueno_rol` solo usa `'ADMIN'` hoy.
**Se parcha leyendo la vista viva con `pg_get_viewdef`** — nunca regenerándola (lección de la 124).

---

## ✅ CONSTRUIDO Y DESPLEGADO (22-sep) — mig 165 corrida y verificada

Commits `7c92737` + `fb92c06`. Verificación en producción: **cajas_mal = 3** (JORGE TOVAR, CESAR,
RAMON) y **todo lo demás en 0**, sin claves duplicadas ni avisos huérfanos. 404 avisos en total.

- Los 5 chequeos son avisos de `public.pendientes`, bloque **"Revisión del sistema"** (va de
  último: es plata mal contada, no trabajo del día), dueño ADMIN, nivel crítico.
- **Posponer** (`pendientes_atendidos.posponer_hasta` + `posponer_motivo`): dormir un aviso hasta
  una fecha con motivo obligatorio. **Solo el jefe** — si un cobrador pudiera posponer su propia
  mora, el aviso dejaría de servir para lo único que sirve.
- 🔑 El filtro vive en una vista NUEVA, **`public.pendientes_activos`**, y NO dentro de
  `public.pendientes`: esa se parcha leyéndola con `pg_get_viewdef` y agregándole ramas al final,
  así que envolverla rompería el próximo parche en silencio. La leen la pantalla y la función
  `avisar`.

### 🔴 Lo que destapó al verificar en pantalla
**El ADMIN_PRINCIPAL no veía lo que cae en 'ADMIN'.** El filtro `mios()` comparaba el rol exacto,
así que los avisos sin subadmin asignado no le llegaban al jefe: eran **8**, incluidos 3 SOAT y una
tecnomecánica por vencer. Contradecía la regla escrita ("ADMIN_PRINCIPAL ve TODO"). Corregido en
`usePendientes.mios()` **y** en la función `avisar` — si se toca uno hay que tocar el otro, o el
celular y la pantalla dicen cosas distintas. FREDY pasó de 2 avisos a 11.

⚠️ **Falta redesplegar la Edge Function `avisar`** para que el celular respete el posponer y el
cambio de rol.
