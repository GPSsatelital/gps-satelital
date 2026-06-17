-- ========= REFUERZO DE SEGURIDAD POR ROL (ADMIN vs SECRETARIA) =========
-- Este archivo agrega reglas que la base de datos obliga a cumplir,
-- sin importar lo que haga la pantalla (la pantalla solo oculta botones,
-- pero cualquiera con la clave de la app podría saltarse eso; estas
-- reglas lo bloquean también del lado del servidor).

-- 1) Nadie puede subirse su propio rol a ADMIN.
--    Antes, un SECRETARIA podía editar su propia fila en "profiles" y
--    ponerse role = 'ADMIN'. Esto lo bloquea.
create or replace function public.enforce_profile_role_change()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and public.current_role() <> 'ADMIN' then
    raise exception 'Solo un ADMIN puede cambiar roles de usuario';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_role_guard on public.profiles;
create trigger trg_profiles_role_guard
  before update on public.profiles
  for each row execute function public.enforce_profile_role_change();

-- 2) Clientes: cualquier usuario autenticado (ADMIN o SECRETARIA) puede
--    registrar clientes nuevos y actualizar sus datos/documentos. Pero
--    solo un ADMIN puede tomar decisiones de aprobación/rechazo/riesgo
--    o aplicar excepciones documentales.
create or replace function public.enforce_cliente_estado_change()
returns trigger language plpgsql as $$
declare
  estados_libres text[] := array['En proceso', 'Listo para visita', 'Pendiente evaluación'];
begin
  if new.estado is distinct from old.estado
     and not (new.estado = any(estados_libres))
     and public.current_role() <> 'ADMIN' then
    raise exception 'Solo un ADMIN puede cambiar el cliente a este estado';
  end if;

  if (new.excepcion_documental is distinct from old.excepcion_documental
      or new.excepcion_motivo is distinct from old.excepcion_motivo
      or new.excepcion_plazo is distinct from old.excepcion_plazo)
     and public.current_role() <> 'ADMIN' then
    raise exception 'Solo un ADMIN puede aplicar excepciones documentales';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_clientes_estado_guard on public.clientes;
create trigger trg_clientes_estado_guard
  before update on public.clientes
  for each row execute function public.enforce_cliente_estado_change();

-- 3) Visitas: cualquiera puede registrar la visita (entrevista, fotos,
--    ubicación), pero solo un ADMIN puede aprobar/rechazar el resultado.
drop policy if exists "Autenticados actualizan visitas" on public.visitas;

create policy "Solo ADMIN resuelve visitas"
  on public.visitas for update
  to authenticated
  using (true)
  with check (public.current_role() = 'ADMIN');

-- 4) Contratos: todo el ciclo de vida del contrato (crear, firmar,
--    asignar moto, activar, cancelar) queda restringido a ADMIN.
drop policy if exists "Autenticados insertan contratos" on public.contratos;
drop policy if exists "Autenticados actualizan contratos" on public.contratos;

create policy "Solo ADMIN crea contratos"
  on public.contratos for insert
  to authenticated
  with check (public.current_role() = 'ADMIN');

create policy "Solo ADMIN actualiza contratos"
  on public.contratos for update
  to authenticated
  using (true)
  with check (public.current_role() = 'ADMIN');
