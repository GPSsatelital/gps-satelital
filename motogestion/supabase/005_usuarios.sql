-- ========= GESTIÓN DE USUARIOS DESDE EL ADMIN =========
-- Antes cualquier usuario autenticado podía ver la lista completa de
-- perfiles (nombre y rol de todos). Ahora cada uno solo ve su propio
-- perfil, salvo que sea ADMIN, que ve la lista completa para poder
-- administrar el equipo desde la pantalla de "Usuarios".

drop policy if exists "Usuarios ven su propio perfil" on public.profiles;

create policy "Ver perfiles según rol"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.current_role() = 'ADMIN');
