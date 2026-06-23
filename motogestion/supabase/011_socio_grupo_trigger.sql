-- =========================================================
-- MIGRACIÓN 011 — Socios: copiar grupo al crear usuario
-- Ejecutar en Supabase SQL Editor
-- =========================================================
-- El trigger handle_new_user no copiaba el campo grupo desde la
-- metadata del usuario. Sin esto, un SOCIO creado desde el panel
-- queda sin grupo y su dashboard cae por defecto a RASTREADOR.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, role, grupo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'SECRETARIA'),
    nullif(new.raw_user_meta_data->>'grupo', '')
  );
  return new;
end;
$$;
