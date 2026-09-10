-- 141 — LAS TAREAS SE VEN AL INSTANTE
--
-- Al probar la mig 140 en producción: se montó una tarea, el formulario cerró sin error… y la lista
-- siguió vacía. La tarea SÍ se había creado — aparecía al recargar la página.
--
-- La causa: `public.tareas` nació fuera de la publicación de tiempo real, así que el aviso del
-- servidor nunca llegaba y la pantalla se quedaba con lo que había cargado al abrir. Todas las
-- demás tablas que se ven en pantalla (motos, clientes, contratos, pagos…) sí están adentro; a la
-- nueva hay que meterla a mano.
--
-- Es el mismo daño que ya costó un cobro duplicado esta semana: si la pantalla no refleja lo que
-- acabas de hacer, la persona lo vuelve a hacer.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tareas'
  ) then
    alter publication supabase_realtime add table public.tareas;
    raise notice 'tareas agregada a supabase_realtime.';
  else
    raise notice 'tareas ya estaba en supabase_realtime.';
  end if;
end $$;

-- ═══ VERIFICACIÓN ═══
-- Debe salir una fila con tablename = 'tareas'.
select schemaname, tablename
  from pg_publication_tables
 where pubname = 'supabase_realtime' and tablename = 'tareas';
