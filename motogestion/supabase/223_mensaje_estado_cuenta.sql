-- 223 — EL ESTADO DE CUENTA TIENE SU PROPIO MENSAJE (D-090)
--
-- Reglas del dueño (17-nov-2026), palabras suyas:
--   «eso no es un cobro, es un estado de cuenta y si se le envía es porque el cliente contestó y
--    lo pidió» · «los mensajes que son para una cosa no se deben mezclar o que se envíen otros que
--    son para otra cosa, eso nunca se podría».
--
-- Por qué: el botón «Enviar por WhatsApp» de la ficha (Cartera) mandaba el estado de cuenta como
-- texto suelto, sin clave ni plantilla. ZALA lo rechazó 121 de 121 veces («falta la plantilla»).
-- Ahora va con su clave `estado_cuenta` y, cuando Meta lo apruebe, con su plantilla corta
-- `estado_cuenta_v1` y el botón «Ver el detalle completo» (texto aprobado por el dueño el 17-nov).
--
-- `plantilla_meta` queda VACÍA hasta que ZALA avise que Meta la aprobó. Mientras tanto solo sale el
-- texto completo, y solo si el cliente le escribió a la línea en las últimas 24 h. El día que Meta
-- la apruebe, una sola línea la prende:
--   update public.mensajes_whatsapp set plantilla_meta = 'estado_cuenta_v1', updated_at = now()
--    where clave = 'estado_cuenta';
--
-- Regla de la vitrina: ZALA ve la clave nueva por `zala.plantillas` (lee esta tabla) y su
-- significado en `zala.diccionario`. No toca plata ni estados de cartera: la prueba espejo no
-- cambia. Todo es idempotente: correrla dos veces no duplica nada.

insert into public.mensajes_whatsapp (clave, texto, plantilla_meta, variables, activa)
values (
  'estado_cuenta',
  E'📋 Hola, {nombre}. Bendiciones.\nLe compartimos el estado de cuenta de su moto {placa} con corte al {fecha}: hoy le falta por pagar {valor}.\nSi desea ver el detalle completo, toque el botón de abajo.\nQuedamos atentos.',
  null,
  array['nombre', 'placa', 'fecha', 'valor'],
  true
)
on conflict (clave) do nothing;

update zala.diccionario
   set valores = coalesce(valores, '') || ' · estado_cuenta',
       significado = significado || ' Excepción: estado_cuenta no sale de plantilla_hoy; lo manda MotoGestión solo cuando el cliente pide su estado de cuenta. No es un cobro (D-090): ningún otro mensaje sale en su lugar. Variables: nombre · placa · fecha (de corte, «17 de noviembre de 2026») · valor (el «Debe hoy» de la ficha, ya resta lo pagado). Lleva el botón «Ver el detalle completo»: al tocarlo, ZALA manda el texto completo que vino en `texto`.',
       actualizado = now()
 where vista = 'plantillas' and columna = 'clave'
   and coalesce(valores, '') not like '%estado_cuenta%';

-- ═══ VERIFICACIÓN ═══
-- Debe salir UNA fila: estado_cuenta, sin plantilla_meta todavía, las 4 variables en orden, activa,
-- y el diccionario ya nombrando estado_cuenta.
select m.clave, m.plantilla_meta, m.variables, m.activa, left(m.texto, 60) as empieza_asi,
       (select valores like '%estado_cuenta%' from zala.diccionario
         where vista = 'plantillas' and columna = 'clave') as diccionario_al_dia
  from public.mensajes_whatsapp m
 where m.clave = 'estado_cuenta';
