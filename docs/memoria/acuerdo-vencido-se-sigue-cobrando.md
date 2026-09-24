---
name: acuerdo-vencido-se-sigue-cobrando
description: "✅ HECHO (17 y 18-sep-2026): un acuerdo vencido desaparecía de las pantallas de cobro y el motor le pasaba por encima. Arreglado en las 4 piezas — app, motor, servidor y avisos. Queda SOLO la regla del sobrante, y se decidió esperar una semana."
metadata:
  node_type: memory
  type: project
  originSessionId: 4d849eb2-8be4-4b25-abd8-2432e669ac90
  modified: 2026-09-18T23:22:41.288Z
---

# El acuerdo vencido se sigue cobrando (17–18-sep-2026) — ✅ LAS 4 PIEZAS HECHAS

## El defecto, en una frase

El sistema hacía **UNA** pregunta —*"¿el acuerdo está activo?"*— y con esa respuesta decidía **DOS**:
si lo muestra y si le cobra. Al vencerse pasaba a `incumplido` y desaparecía de las pantallas de
cobro; el motor le pasaba por encima y la plata del cliente saltaba a saldo a favor.

🔴 **Un acuerdo vencido es una deuda VENCIDA, no una deuda perdonada.**

**BRAYAN (RLZ79H)** lo destapó: acuerdo de UNA cuota de $65.000 que vencía el lunes 14. El 17 pagó
$270.000 —debía $195.000 de semana + $65.000 del acuerdo, **le sobraba**— y el motor le cobró la
semana, **saltó el acuerdo** y mandó $75.000 a saldo a favor. Y la otra mitad del mismo motor lo
**revivía con 7 días nuevos sin darle un peso**: iba a girar en eso para siempre.
**Lo de BRAYAN era un PLAZO, no un convenio** — existe el botón de *plazo extra* justo para eso, y
nadie lo usó: le quemaron 1 de sus 3 convenios y le hicieron firmar a la acompañante como codeudora
por dos días de espera.

## Lo que se midió

| | |
|---|---|
| Semanas figurando pagadas respaldadas por acuerdos, no por plata | **$25,5 M** |
| Acuerdos que SÍ reciben plata (48 clientes) | $15,1 M |
| **Acuerdos activos sin recibir UN SOLO PESO** | **60** (41 pasan el filtro de 7 días) |
| Acuerdos muertos, invisibles e incobrables | $874.000 (7 clientes) |

**El patrón que lo explica todo:** le recogen la moto → paga los $30.000 de multa para llevársela →
le hacen el acuerdo por lo atrasado → **y de ahí en adelante nada**. Verificado: lo que esos
clientes pagaron a "deuda" eran **multas**, no el acuerdo. Y nadie los cobró porque
**el sistema nunca los puso en ninguna lista**.

## ✅ LAS 4 PIEZAS — todas desplegadas y verificadas en producción

**A · La app** (`a7598df`, 635 pruebas). `src/utils/convenioPorCobrar.ts` separa las dos preguntas:
`elegirConvenioVigente` (solo activo) para CREAR y AMPLIAR — sin cambios — y
`elegirConvenioPorCobrar` (activo **o** incumplido) para COBRAR. Si hay de los dos manda el activo;
entre incumplidos, el **más viejo**. Cambiadas **9 puertas**. El recuadro decía "Activo" fijo: ahora
dice **INCUMPLIDO en rojo** con la fecha en que venció.
⚠️ **Inmovilizaciones tiene DOS copias y NO cambian igual**: la que **desbloquea la entrega** de una
retenida sigue exigiendo `activo` a propósito — un acuerdo incumplido no financia nada.

**B · El motor** (mig **157**, `350155f`). `aplicar_pago_confirmado` se contradecía sola: la mitad
que reparte buscaba solo `activo`; la que actualiza sí miraba a los incumplidos y los revivía.
Se alineó la primera con la segunda. Migración **anclada** sobre `pg_get_functiondef`, con conteo
del ancla (2 = reparto + su reverso) y aborto si no cuadra. Verificada: `parchado=1, quedan_viejas=0`.

**C · El servidor** (mig **158**, `afc70fc`) — **la séptima puerta, la peor**. El CTE `cartera` de
`public.pendientes` traía `and cv.estado = 'activo'`. De ahí salen mora, gabela, plazos,
**recolección** y `zala.cuenta_contrato` → **ZALA también estaba ciega**. Se elige UNO con el mismo
orden que la app (join a la TABLA, no lateral, porque `cuenta_contrato` recibe `cv` como fila de
`public.convenios`; con `in (…)` a secas se DUPLICABAN todos los pendientes del contrato).
Más el aviso **`acuerdo_sin_pagos`**: 41 acuerdos por **$21.798.000** saliendo solos.

**D · El origen escrito** (mig **159**, `fc660fc`). Aviso **`acuerdo_incumplido`** (4 casos):
*"Se venció el 16/09/2026 con 3 de 9 cuotas pagadas. Quedan $280.000, que ya se le están cobrando
como mora — **no se los cobres aparte**."* Esa última frase evita el doble cobro. No se pisa con
`acuerdo_sin_pagos` (aquel exige $0 abonado, este `abonado > 0`).

**Verificado el 18-sep:** de los 5 incumplidos con la moto rodando, **los 5** aparecieron en mora o
recolección (OSVALDO ya en recolección). **Antes no estaban en ninguna lista.**

## ✅ De paso: la semana adelantada por fin se ve (`d01c7a9`)

Pregunta del dueño: *"¿dónde se ve cuando hay semana adelantada?"*. **En ningún lado** — vivía en
`contratos.caja_actual_pagado`, columna que NINGUNA pantalla leía. `loQueDebe()` ahora devuelve
`adelanto: { lleva, de }` y Cartera lo muestra. **No cambia ni un peso**: es un renglón, no un cálculo.
⚠️ La distinción con su propia prueba: solo es adelanto si **no queda nada exigido**. Si le falta una
caja, ese mismo parcial es ABONO de lo que ya debe — decirle "va adelantado" a quien debe sería peor
que no decir nada.
🔲 El estado de cuenta **IMPRESO** todavía no lo muestra.

## 🔲 LO ÚNICO QUE QUEDA — la regla del sobrante (DECIDIDO: esperar)

Propuesta: que el sobrante **baje el acuerdo hasta acabarlo**, y solo cuando no quede acuerdo
adelante la semana. Hoy el orden es: semanas vencidas → deudas → cuota exigida del acuerdo →
**ventana de prepago (3 días)** → saldo a favor.

⚠️ La ventana **solo alcanza 3 días** y existe para un caso real: **el que paga el sábado la semana
del lunes**. Quitarla traería de vuelta la mora falsa que arregló la mig 149.

**Mi recomendación, aceptada: esperar una semana.** Se le tocó el motor del dinero 3 veces en dos
días y nada ha pasado por una semana de operación real; y el adelanto se volvió visible recién el
18-sep, así que decidir hoy sería a ciegas. En 7 días habrá casos reales en pantalla.

🔲 **Decisión parqueada aparte:** cualquier pago revive un acuerdo incumplido (`fecha_limite =
hoy + cuotas_faltantes × días`). O sea que alguien podría pagar $1.000 y salirse de la cola de
inmovilizar. El dueño dijo: *"lo definimos cuando sea necesario"*.

Relacionado: [[correcciones-a-mano-sep-2026]] · [[regla-nomina-cobradores]] ·
[[convenio-que-entra-casillas]] · [[mapa-financiero-y-partitura]] · [[regla-esencia-y-rastro]]
