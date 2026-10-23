-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 205 — QUE LA BASE AVISE CUANDO CAMBIAN LAS RECEPCIONES, EL TIEMPO GUARDADO Y LAS UBICACIONES
--        (23-oct-2026, D-055; aprobado por el dueño: «la lista compartida que se refresca al guardar
--        y la migración que prende el aviso en las 3 tablas»)
--
-- LO QUE PASÓ: resuelto el tiempo guardado y entregada la moto, Inmovilizaciones la seguía mostrando
-- «retenida · tiempo por resolver», y se hacía todo otra vez. JORGE BELLO (RLT88H, 2-oct): Sergio
-- resolvió a las 10:33:24 p.m., entregó a las 10:34:29, y repitió las dos cosas a las 10:34:46 y
-- 10:35:54. Causa: estas tres tablas NO estaban en `supabase_realtime` (medido el 23-oct: de las
-- cuatro consultadas solo salió `pagos`), así que las pantallas abiertas nunca se enteraban.
--
-- QUÉ HACE: las agrega a `supabase_realtime`, solo si no están (se puede correr dos veces).
-- El otro lado del arreglo está en la app: las 14 pantallas comparten una sola lista que se refresca
-- al guardar (`useUbicaciones` sobre `createTableStore`). Esto hace que se entere también el celular
-- de OTRA persona que tenga la pantalla abierta.
-- QUÉ NO TOCA: ningún dato ni ninguna política (el aviso respeta las mismas reglas de quién ve qué).
--
-- CÓMO DESHACERLA:
--   alter publication supabase_realtime drop table public.recepciones_vehiculo,
--     public.acuerdos_tiempo_rodado, public.historial_ubicaciones;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $$
declare
  t text;
begin
  foreach t in array array['recepciones_vehiculo', 'acuerdos_tiempo_rodado', 'historial_ubicaciones'] loop
    if not exists (select 1 from pg_publication_tables
                    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

select public.registrar_migracion(205, '205_aviso_recepciones_y_tiempo.sql',
  'Realtime en recepciones_vehiculo, acuerdos_tiempo_rodado e historial_ubicaciones (la moto ya no queda «por resolver» después de resolverla)');

commit;

-- VERIFICACIÓN: deben salir las cuatro tablas (pagos es el control).
select tablename
  from pg_publication_tables
 where pubname = 'supabase_realtime'
   and tablename in ('recepciones_vehiculo', 'acuerdos_tiempo_rodado', 'historial_ubicaciones', 'pagos')
 order by tablename;
