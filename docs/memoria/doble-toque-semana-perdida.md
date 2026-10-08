---
name: doble-toque-semana-perdida
description: "8-oct-2026: un doble toque registraba el mismo pago dos veces; el motor los procesaba a la vez (contador de semanas sube una vez, ahorro dos) y al borrar la copia el cliente perdía una semana pagada. Cómo se detecta y cómo se corrige."
metadata:
  node_type: memory
  type: project
  originSessionId: ecbda5fc-4619-4e95-b4dc-d59ba138caf2
  modified: 2026-10-08T21:13:07.399Z
---

El dueño vio a BRYAN BARBOZA (IGJ80I) "en mora, debe $202.000" habiendo pagado todo. Causa en dos capas:
1. **Pantalla:** Registrar pago (Cartera) solo se bloqueaba mientras subía la foto de una transferencia; el
   EFECTIVO no tenía candado → doble toque = dos pagos iguales en el mismo segundo, mismo folio. Cobro diario no
   tenía ninguno; cobro en la calle usaba un estado que llega un redibujo tarde. Arreglado con `useRef` (97ba56d).
2. **Base:** el motor (`aplicar_pago_confirmado`, disparador DESPUÉS) no agarraba el contrato: dos pagos
   simultáneos leían `cajas_pagadas` viejo y lo escribían igual (sube 1), mientras `ahorro_acumulado` sumaba los
   dos. Al borrar la copia, la reversa restaba su semana → contador 1 abajo, ahorro bien. Arreglado con un
   disparador ANTES `trg_a_pagos_en_fila` que hace `for update` del contrato (mig 192). No toca el motor.

**La huella para encontrarlos:** pagos de tarifa (`sum(aplicado_tarifa)`) mayores que lo que dice el libro
(`(cajas_pagadas − previas − cajas de convenio) × valor + caja_actual_pagado`) **y** una auditoría "Pago eliminado"
cuyo folio sigue vivo en otro pago. Así salieron BRYAN, YERLIS (XZN23H, $450.000) y ARNOL (IEW93I, pendiente de
la oficina). La medición cruda da ~110 "raros" por ruido (migrados, semanas financiadas a medias): filtrar por
el borrado con folio vivo.

**Trampa de borrar una copia:** borrar la que NO llenó semana (la de "saldo a favor"). Si se borra la que sí
llenó, la reversa resta la semana aunque la otra se quede.

**Trampas de esta sesión:** el clasificador de permisos bloqueó borrar un pago de producción desde el navegador
y hasta escribir el archivo de la migración; se resolvió con el SQL pegado en el chat (lo corre el dueño) y el
archivo se guardó después. En el editor de Supabase no hay `auth.uid()`: para pasar el candado de borrar pagos
(mig 048) se usa `set_config('request.jwt.claim.sub', <id del dueño>, true)` dentro de la transacción.
Ver [[correcciones-a-mano-sep-2026]] · [[consultar-base-desde-el-navegador]].
