-- ========= NOMBRES DE LOS SUB-ADMIN, VISIBLES PARA TODA LA OPERACIÓN =========
-- Problema: en Cartera queremos mostrar qué admin tiene asignada cada moto, pero la RLS de
-- `profiles` (mig 005 + 049) solo deja leer perfiles ajenos a ADMIN y ADMIN_PRINCIPAL. Para
-- la SECRETARIA y el SUBADMIN el nombre salía vacío.
--
-- Abrir `profiles` a todos NO es opción: ahí viven `role`, `permisos`, `acciones` y `grupo`
-- (la configuración de seguridad de cada persona). En vez de eso, una función security definer
-- que devuelve ÚNICAMENTE el id y el nombre de los sub-admin — lo mínimo para pintar el chip.

create or replace function public.nombres_subadmins()
returns table (id uuid, nombre text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.nombre
  from public.profiles p
  where p.role = 'SUBADMIN'
$$;

revoke all on function public.nombres_subadmins() from public;
grant execute on function public.nombres_subadmins() to authenticated;

comment on function public.nombres_subadmins() is
  'Devuelve solo id y nombre de los SUBADMIN, para mostrar quién tiene asignada una moto sin '
  'abrir la tabla profiles (que contiene role, permisos y acciones).';
