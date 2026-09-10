-- 143 — LA APP PUEDE USAR LA CALCULADORA DE LA VITRINA (sin poder leer la vitrina)
--
-- Al probar la mig 142 desde la app: `permission denied for schema zala`.
--
-- Es el choque de dos decisiones que están BIEN las dos:
--   · `public.pendientes` usa `security_invoker`, o sea corre con los permisos de la persona que
--     consulta. Eso es lo que hace que el SUBADMIN vea solo lo suyo reusando la RLS que ya existe,
--     sin escribir un segundo juego de permisos que habría que mantener sincronizado.
--   · El esquema `zala` está cerrado a todo el mundo menos a `zala_lector`, a propósito: ahí viven
--     vistas SIN RLS que muestran la cartera completa.
-- Como la vista de pendientes usa las funciones de cálculo de `zala`, el usuario de la app choca
-- contra esa puerta cerrada.
--
-- 🔴 LO QUE SE ABRE Y LO QUE NO:
--   · SÍ: entrar al esquema y EJECUTAR sus funciones. Son cálculo puro y corren con los permisos
--     de quien las llama, así que no pueden mostrar una fila que esa persona no pudiera ver igual.
--   · NO: leer las vistas `zala.cliente`, `zala.moto`, etc. Ésas siguen con permiso solo para
--     `zala_lector`. Sin `select`, entrar al esquema no sirve de nada para espiar.
--
-- La alternativa era copiar las funciones a `public`: sería una TERCERA copia de la misma cuenta
-- de la mora, y la primera vez que alguien tocara una sola de ellas empezarían a decir cosas
-- distintas. Se prefiere una puerta angosta y bien cerrada antes que un duplicado.

grant usage on schema zala to authenticated;
grant execute on all functions in schema zala to authenticated;

-- Las que se creen de aquí en adelante, también: si no, la próxima función nueva vuelve a romper
-- la pantalla y nadie recordaría por qué.
alter default privileges in schema zala grant execute on functions to authenticated;

-- ═══ VERIFICACIÓN ═══
-- a) Puede ENTRAR y EJECUTAR (debe dar true, true).
select has_schema_privilege('authenticated', 'zala', 'USAGE')            as puede_entrar,
       has_function_privilege('authenticated', 'zala.hoy()', 'EXECUTE')  as puede_calcular;

-- b) 🔴 Lo que importa: NO puede leer la vitrina. Las tres deben dar FALSE.
select has_table_privilege('authenticated', 'zala.cliente', 'SELECT')  as ve_la_vitrina,
       has_table_privilege('authenticated', 'zala.moto', 'SELECT')     as ve_las_motos,
       has_table_privilege('authenticated', 'zala.pagos', 'SELECT')    as ve_los_pagos;

-- c) Y la vista de pendientes ya responde.
select count(*) as pendientes_hoy from public.pendientes;
