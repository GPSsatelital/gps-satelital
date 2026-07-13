-- ===== 049: policies para que la UI de Usuarios gestione `acciones` directo =====
-- La UsuariosView es exclusiva de ADMIN_PRINCIPAL. Hoy toda la gestión de OTROS perfiles
-- pasa por la Edge Function (service role) porque la RLS de profiles solo permite ver/editar
-- el perfil PROPIO (auth.uid() = id). Para guardar los overrides de `acciones` desde la
-- pantalla sin tocar la Edge Function, se le da a ADMIN_PRINCIPAL acceso directo a profiles.
-- mi_rol() es security definer (no recursa con estas policies).

drop policy if exists "ADMIN_PRINCIPAL ve todos los perfiles" on public.profiles;
create policy "ADMIN_PRINCIPAL ve todos los perfiles"
  on public.profiles for select
  to authenticated
  using (public.mi_rol() = 'ADMIN_PRINCIPAL');

drop policy if exists "ADMIN_PRINCIPAL actualiza perfiles" on public.profiles;
create policy "ADMIN_PRINCIPAL actualiza perfiles"
  on public.profiles for update
  to authenticated
  using (public.mi_rol() = 'ADMIN_PRINCIPAL')
  with check (public.mi_rol() = 'ADMIN_PRINCIPAL');
-- El trigger enforce_profile_role_change() sigue vigente: un cambio de acciones (que NO toca
-- role/permisos/grupo) pasa siempre; cambiar role/permisos/grupo sigue exigiendo ADMIN_PRINCIPAL.
