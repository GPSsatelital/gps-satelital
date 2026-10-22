---
name: base-inicial-circuito-completo
description: "La base inicial ya entra a la caja, se puede DEVOLVER con firma, y descuenta la visita. Fases 1+1b del plan de separación de conceptos — en producción 8-ago."
metadata: 
  node_type: memory
  type: project
  originSessionId: e189eed2-e48b-4069-b4c2-6cc4daa35703
  modified: 2026-08-08T22:00:53.558Z
---

# Base inicial — el circuito ya cierra (fases 1 y 1b) · producción 8-ago-2026

Migraciones **091** y **092 ✅ corridas**. Plan completo en `.claude/plans/humble-dazzling-phoenix.md`.

## El problema que resolvía

La plata de la base **no entraba a ninguna caja**: `ClientesView` guardaba
`clientes.ingreso_inicial` e imprimía un recibo, nada más. El día que se registraban clientes
nuevos la secretaria tenía **más efectivo en la gaveta del que el sistema decía**, y la caja no
podía cuadrar.

Y no había forma de **devolverla**. Caso real que llegó con el cliente esperando en la oficina:
se retira antes de recibir moto y quiere su plata. La liquidación no servía — exige contrato.

## Por qué tabla propia (`abonos_base`) y no `pagos`

`pagos.contrato_id` es **NOT NULL** y la base se paga ANTES de que exista contrato. Aflojarlo
obligaría a revisar el motor de reparto, los triggers y ~10 pantallas. La tabla aparte no toca
nada de lo que ya funciona.

## Los tres tipos, y por qué son tres

| tipo | La caja lo ve |
|---|---|
| `abono` | **SUMA** — entró plata |
| `devolucion` | **RESTA** — salió de la gaveta a manos del cliente |
| `retencion` | **NADA** — solo cambia de bolsillo dentro de la empresa |

🔴 **La retención NO resta.** Si restara, la caja diría que salió plata que **sigue en la gaveta**.
Fue el error que casi cometo y lo atrapó una prueba.

## Reglas del dueño (NO re-preguntar)

- **Se descuenta la visita domiciliaria: $40.000** — es lo que ya se le pagó al visitador.
  Él lo corrigió sobre la marcha: *"me equivoqué en lo que te dije que no se le descontaba nada"*.
- **Una sola vez** aunque le hayan hecho varias visitas.
- **No se descuenta si se retira ANTES de la visita** — si nadie fue, la empresa no gastó nada.
  La condición es que la visita esté **hecha**, no aprobada (`visitaFueHecha`).
- **La base nace sin dueño**: al pagarse no se sabe de qué portafolio será → `grupo = null`,
  entra al total del día pero **no al bolsillo de ningún socio**.
- **La prueba de entrega es obligatoria** (*"manera de probar que sí se le devolvió"*): firma en
  pantalla + recibo impreso. La firma se compara con la que ya dio al registrarse.

`COSTO_VISITA_DOMICILIARIA = 40000` vive en una constante, **no escrito a mano en la pantalla**,
por la lección de la multa: subió de $20.000 a $30.000 y un letrero siguió diciendo el valor viejo.
Pasa a Configuración en la fase 6.

## De paso: la visita no se auto-aprobaba, y yo no la había roto

Él preguntó *"¿quién la aprobó?"* y después *"¿por qué me dañaste eso?"* (los botones de repetir
visita). **Verifiqué con git: no fue un cambio mío.** `ModalVisita.tsx` llevaba sin tocarse desde
el 29-jul y esa línea existía desde el 22-jun.

**La causa real:** los botones se mostraban solo si `resultado === null`, y el rol VISITADOR nuevo
llena ese campo con su recomendación. **El código dependía de una costumbre, no de una regla.**
Arreglado con `visitaFueHecha()` como fuente única; la recomendación del visitador se guarda en
`entrevista.recomendacion`, que es donde va — `resultado` es la decisión del admin.

## 🔲 Lo que falta del plan

- **Fase 2** — la base se muda al portafolio de la moto al asignarla. Hoy se queda
  `grupo = null` **para siempre**. ⚠️ Mueve cajas de días cerrados → debe disparar el aviso
  *"⚠️ El cierre cambió"* que ya existe.
- **Fase 3** — contador `base_pagada` + quitar la fusión `ahorro_inicial → ahorro_acumulado`
  (`useContratos.ts:206`). ⚠️ Es lógica de plata viva: **escribir la prueba del comportamiento
  actual ANTES de tocarla**.
- **Fase 4** — el convenio de base abona a la base (hoy se aplica como pago genérico y el
  cliente nunca la ve completarse).
- **Fase 5** — `tarifa_atrasada` genera ahorro. 🔴 **BLOQUEADA** hasta que el dueño decida
  las **3 deudas ambiguas** (3-jul PRADERA $62.000 · 27-jul COSTA $202.000 · 28-jul COSTA
  $520.000): si son de migración y entra la regla, se les acredita el ahorro **dos veces**.
- **Fase 6** — los montos a Configuración ($308.000 está fijo en `WizardContrato.tsx:180`).

## Concepto `migracion` (mig 090) ✅

Lo pidió él: *"están como otros porque no hay una opción que diga de migración o deuda del
sistema viejo"*. **No fue descuido del funcionario — la opción no existía.**
**125 filas reclasificadas** ($60.269.200). Las 19 variantes escritas a mano ("EXCELO VIEJO",
"EXCEL VEIJO"…) son la prueba: la gente escribía en la descripción lo que no podía marcar.

Ver [[caja-fecha-del-banco]] · [[convenios-revision-completa]].
