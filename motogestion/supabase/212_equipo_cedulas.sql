-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 212 — LA CÉDULA DE LA GENTE DEL EQUIPO (2-nov-2026, D-062)
--        (aprobado por el dueño el 2-nov: «Sí, apruebo»)
--
-- EL PROBLEMA: cuando un supervisor o un visitador trae un cliente, la oficina escribe a mano su
-- nombre y su cédula en la tarjeta «Referido por» del registro. Medido el 2-nov: de los 73 clientes
-- que trajo el equipo, 8 llevan una cédula distinta de la que más se repite para esa persona, y una
-- misma cédula aparece como la de tres supervisores. La app no tenía guardada la cédula del equipo:
-- `profiles` no tiene esa columna.
--
-- LO QUE HACE:
--   1. Tabla `equipo_cedulas`: la cédula de cada persona del equipo, solo dígitos, una por persona.
--   2. La escribe solo el ADMIN_PRINCIPAL (Usuarios → Editar usuario).
--   3. La leen solo los que registran clientes: ADMIN_PRINCIPAL, ADMIN y SECRETARIA. Con eso, al
--      escoger a alguien en «¿Alguien del equipo lo trajo?», la tarjeta se llena sola.
--   4. Prueba adentro: un supervisor no la ve ni la escribe; el dueño y la secretaria sí la ven. Si
--      algo no da, la migración entera se deshace sola.
--
-- LO QUE NO TOCA: `profiles` (quién puede leerla sigue igual), las tarjetas de los clientes ya
-- registrados (quedan como están), la nómina ni los premios de referidos (D-047).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.equipo_cedulas (
  profile_id  uuid primary key references public.profiles(id) on delete cascade,
  cedula      text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid(),
  constraint equipo_cedulas_solo_digitos check (cedula ~ '^[0-9]{5,12}$')
);

comment on table public.equipo_cedulas is
  'La cedula de cada persona del equipo (mig 212). La escribe el ADMIN_PRINCIPAL en Usuarios; la leen '
  'quienes registran clientes, para llenar sola la tarjeta Referido por.';

alter table public.equipo_cedulas enable row level security;

revoke all on public.equipo_cedulas from anon;
grant select, insert, update, delete on public.equipo_cedulas to authenticated;

-- LEER: los que registran clientes.
drop policy if exists equipo_cedulas_select on public.equipo_cedulas;
create policy equipo_cedulas_select on public.equipo_cedulas for select
  using (public.mi_rol() in ('ADMIN_PRINCIPAL', 'ADMIN', 'SECRETARIA'));

-- ESCRIBIR: solo el ADMIN_PRINCIPAL (Usuarios solo lo abre él).
drop policy if exists equipo_cedulas_insert on public.equipo_cedulas;
create policy equipo_cedulas_insert on public.equipo_cedulas for insert
  with check (public.mi_rol() = 'ADMIN_PRINCIPAL');

drop policy if exists equipo_cedulas_update on public.equipo_cedulas;
create policy equipo_cedulas_update on public.equipo_cedulas for update
  using (public.mi_rol() = 'ADMIN_PRINCIPAL')
  with check (public.mi_rol() = 'ADMIN_PRINCIPAL');

drop policy if exists equipo_cedulas_delete on public.equipo_cedulas;
create policy equipo_cedulas_delete on public.equipo_cedulas for delete
  using (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- Cuándo y quién la cambió por última vez.
create or replace function public.equipo_cedulas_marca()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_equipo_cedulas_marca on public.equipo_cedulas;
create trigger trg_equipo_cedulas_marca
  before update on public.equipo_cedulas
  for each row execute function public.equipo_cedulas_marca();

-- ─── PRUEBA ADENTRO ────────────────────────────────────────────────────────────────────────────
-- Con una cédula de prueba (99999) que se borra al final, se entra como cada persona y se mira qué
-- ve. Si algo no da, `raise exception` deshace la migración entera: no queda nada a medias.
do $prueba$
declare
  v_sup  uuid := (select id from public.profiles where role = 'SUBADMIN' order by created_at limit 1);
  v_sec  uuid := (select id from public.profiles where role = 'SECRETARIA' order by created_at limit 1);
  v_ap   uuid := (select id from public.profiles where role = 'ADMIN_PRINCIPAL' order by created_at limit 1);
  v_n    int;
  v_pudo boolean;
begin
  if v_sup is null or v_ap is null then
    raise exception 'No hay un supervisor o un ADMIN_PRINCIPAL para la prueba. No se cambió nada.';
  end if;

  insert into public.equipo_cedulas (profile_id, cedula) values (v_sup, '99999');

  -- 1. Un supervisor NO la ve.
  perform set_config('request.jwt.claim.sub', v_sup::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_sup, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_n from public.equipo_cedulas;
  reset role;
  if v_n <> 0 then
    raise exception 'La prueba falló: un supervisor vio % cédula(s). No se cambió nada.', v_n;
  end if;

  -- 2. Un supervisor NO la cambia.
  set local role authenticated;
  update public.equipo_cedulas set cedula = '77777' where profile_id = v_sup;
  get diagnostics v_n = row_count;
  reset role;
  if v_n <> 0 then
    raise exception 'La prueba falló: un supervisor cambió una cédula. No se cambió nada.';
  end if;

  -- 3. Un supervisor NO guarda una nueva.
  begin
    set local role authenticated;
    insert into public.equipo_cedulas (profile_id, cedula) values (v_ap, '88888');
    v_pudo := true;
  exception when insufficient_privilege then
    v_pudo := false;
  end;
  reset role;
  if v_pudo then
    raise exception 'La prueba falló: un supervisor guardó una cédula. No se cambió nada.';
  end if;

  -- 4. La secretaria SÍ la ve.
  if v_sec is not null then
    perform set_config('request.jwt.claim.sub', v_sec::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select count(*) into v_n from public.equipo_cedulas;
    reset role;
    if v_n <> 1 then
      raise exception 'La prueba falló: la secretaria vio % cédula(s), debía ver 1. No se cambió nada.', v_n;
    end if;
  end if;

  -- 5. El dueño SÍ la ve.
  perform set_config('request.jwt.claim.sub', v_ap::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_n from public.equipo_cedulas;
  reset role;
  if v_n <> 1 then
    raise exception 'La prueba falló: el dueño vio % cédula(s), debía ver 1. No se cambió nada.', v_n;
  end if;

  delete from public.equipo_cedulas where profile_id = v_sup and cedula = '99999';
  -- '{}' y no '': registrar_migracion lee estas claims como json.
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}', true);
end
$prueba$;

select public.registrar_migracion(212, '212_equipo_cedulas.sql',
  'La cédula de la gente del equipo, para llenar sola la tarjeta Referido por');

commit;

-- ── VERIFICACIÓN (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: tabla 1 · rls true · reglas 4 · cedulas 0. Si la migración terminó, la prueba de
-- adentro ya pasó (un supervisor no ve ni escribe; el dueño y la secretaria sí ven).
select
  (select count(*) from pg_tables where schemaname = 'public' and tablename = 'equipo_cedulas') as tabla,
  (select relrowsecurity from pg_class where oid = 'public.equipo_cedulas'::regclass)          as rls,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'equipo_cedulas') as reglas,
  (select count(*) from public.equipo_cedulas)                                                  as cedulas;
