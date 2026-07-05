-- ========= SOLO ADMIN_PRINCIPAL GESTIONA USUARIOS (rol, permisos, grupo) =========
-- El trigger anterior (004_roles_seguridad.sql) solo bloqueaba cambios de "role" y
-- solo exigía rol = 'ADMIN' — quedó desactualizado desde que se creó ADMIN_PRINCIPAL.
-- Dos huecos reales que esto cierra:
--   1) Un ADMIN podía subirse su propio rol a ADMIN_PRINCIPAL editando su fila
--      directo contra la base de datos (sin pasar por la Edge Function manage-users).
--   2) Nadie protegía la columna "permisos" — cualquier usuario autenticado podía
--      auto-otorgarse acceso a cualquier módulo (incluido Usuarios) sin tocar "role".
-- Ahora "role", "permisos" y "grupo" solo los puede cambiar quien ya es ADMIN_PRINCIPAL.
-- (La Edge Function usa la service role key, que no tiene auth.uid() — el trigger no
-- la bloquea a ella, solo bloquea updates hechos directo desde el cliente autenticado.)

create or replace function public.enforce_profile_role_change()
returns trigger language plpgsql as $$
begin
  if (new.role is distinct from old.role
      or new.permisos is distinct from old.permisos
      or new.grupo is distinct from old.grupo)
     and public.current_role() <> 'ADMIN_PRINCIPAL' then
    raise exception 'Solo el administrador principal puede cambiar rol, permisos o grupo de un usuario';
  end if;
  return new;
end;
$$;

-- El trigger ya existe (creado en 004_roles_seguridad.sql) — solo se reemplaza la función.
