-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 217 — LOS GRUPOS O PORTAFOLIOS SE MANEJAN DESDE LA APP (11-nov-2026, D-067)
--        (aprobado por el dueño el 7-nov: «Sí, apruebo»; arrancado el 10-nov: «Sí, arranca»)
--
-- EL PROBLEMA: los nombres de los grupos (COSTA, PRADERA, RASTREADOR, USADAS, OTRO) están
-- escritos a mano en tres reglas de la base y en unos 20 archivos de la app. Para un grupo nuevo
-- había que tocar código y escribir una migración, y una lista olvidada dejaba una pantalla sin el
-- grupo nuevo, con sumas que no dan el total.
--
-- LO QUE HACE:
--   1. Tabla `grupos`: la única lista. El nombre ES lo que se guarda en cada moto, perfil y
--      cuenta (no hay código aparte). Arranca con RASTREADOR azul, COSTA verde, PRADERA ámbar,
--      USADAS naranja (prendidos) y OTRO gris (apagado). Nunca se borra un grupo.
--   2. Tabla `grupos_historial`: quién, cuándo, qué, antes y después.
--   3. Las reglas fijas pasan a llave hacia `grupos` («on update cascade»): motos, perfiles,
--      abonos de la base, fotos diarias de Cartera, caja diaria y plata sin identificar. La regla
--      de las cuentas (que tienen una LISTA de grupos) pasa a un disparador, y otro disparador les
--      cambia el nombre si un grupo se renombra. La caja diaria pierde su valor por defecto
--      «GENERAL», que no es ningún grupo (sus 10 filas ya tienen grupo).
--   4. Cuatro funciones, solo para el Administrador principal (el candado está aquí, no solo en
--      la pantalla), cada una con su fila en el historial en el mismo paso:
--        grupo_crear(nombre, color) · grupo_editar(nombre, color, nombre_nuevo) ·
--        grupo_apagar(nombre) · grupo_encender(nombre)
--      y `grupos_uso()`, que le dice a la pantalla qué usa cada grupo y si se deja renombrar o
--      apagar. Reglas: hasta 14 caracteres, mayúsculas, letras, números y un espacio entre
--      palabras (sin «;» ni «:»); el color sale de una paleta de 8 y no se repite entre grupos
--      prendidos; el nombre se corrige solo si el grupo no se usa en nada; se apaga solo si no le
--      quedan motos en la empresa (las vendidas no cuentan).
--   5. Lectura: el personal ve todos los grupos; el socio, solo el suyo; el historial, solo el
--      Administrador principal. Nadie escribe directo en las tablas: solo por las funciones.
--   6. Tiempo real, para que las pantallas abiertas se enteren de un grupo nuevo.
--   7. ZALA: vista `zala.portafolios` y sus filas en el diccionario. Las dos filas que hoy listan
--      los 4 grupos fijos pasan a decir «los de zala.portafolios».
--   8. Conteo antes y después (motos y contratos vivos por grupo, y filas con grupo de cada
--      tabla). Si no da igual, se deshace todo.
--   9. Prueba adentro: se hace pasar por el dueño, un supervisor, la secretaria y un socio. Si
--      algo no da, la migración entera se deshace sola.
--
-- LO QUE NO TOCA: ninguna cifra de plata, ningún nombre (USADAS sigue siendo USADAS hasta la
-- 218), `mi_grupo()`, `mis_*_socio()`, las políticas del socio, el disparador de la 031,
-- `handle_new_user`, `zala._corte_migracion` ni `CORTE_POR_GRUPO`. La app sigue igual: sus listas
-- fijas tienen los mismos nombres que la tabla.
--
-- CUÁNDO CORRERLA: hoy es miércoles (día de pago): después de las 6 p. m. y antes de las 11:30 p. m.
-- (a las 11:55 p. m. se toma la foto diaria de Cartera). Tarda unos segundos.
--
-- CÓMO DESHACERLA (si hiciera falta, antes de crear grupos nuevos):
--   drop view if exists zala.portafolios;
--   delete from zala.diccionario where vista = 'portafolios';
--   update zala.diccionario set valores = 'COSTA · PRADERA · RASTREADOR · USADAS'
--    where (vista, columna) in (('cliente','grupo'), ('cuentas_pago','grupo'));
--   alter table public.motos drop constraint motos_grupo_fk;  (y las otras 5 «_grupo_fk»)
--   drop trigger trg_cuentas_grupos_existen on public.cuentas_bancarias;
--   + volver a poner las 3 reglas fijas y el valor por defecto de caja_diaria (ver la 038, 041,
--     080 y 091) · drop table public.grupos_historial, public.grupos cascade;
--   delete from public.migraciones_aplicadas where numero = 217;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ─── 0. El conteo de ANTES ─────────────────────────────────────────────────────────────────
-- Una función de paso (se borra al final), para contar igual antes y después.
create or replace function public._mg217_conteos()
returns jsonb language sql stable set search_path = public as $$
  select jsonb_build_object(
    'motos', (select jsonb_object_agg(grupo, n) from (select grupo, count(*) n from public.motos group by grupo) x),
    'motos_en_la_empresa', (select jsonb_object_agg(grupo, n) from (select grupo, count(*) n from public.motos
                              where estado is distinct from 'Vendida' group by grupo) x),
    'contratos_vivos', (select jsonb_object_agg(k, n) from (select m.grupo || ' · ' || c.estado k, count(*) n
                          from public.contratos c join public.motos m on m.id = c.moto_id
                         where c.estado in ('Activo', 'Suspendido', 'En proceso') group by 1) x),
    'perfiles_con_grupo', (select count(*) from public.profiles where grupo is not null),
    'abonos_con_grupo',   (select count(*) from public.abonos_base where grupo is not null),
    'fotos_cartera',      (select count(*) from public.cartera_del_dia where grupo is not null),
    'cajas',              (select count(*) from public.caja_diaria),
    'ingresos_con_grupo', (select count(*) from public.ingresos_no_identificados where grupo is not null),
    'cuentas_con_grupo',  (select count(*) from public.cuentas_bancarias where cardinality(grupos) > 0)
  )
$$;

select set_config('mg217.antes', public._mg217_conteos()::text, true);

-- ─── 1. Las dos tablas ─────────────────────────────────────────────────────────────────────
create table public.grupos (
  codigo      text primary key,
  color       text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  creado_por  uuid references public.profiles(id) on delete set null,
  constraint grupos_nombre_valido check (
    char_length(codigo) <= 14 and codigo ~ '^[A-ZÑÁÉÍÓÚÜ0-9]+( [A-ZÑÁÉÍÓÚÜ0-9]+)*$'),
  constraint grupos_color_de_la_paleta check (
    color in ('azul', 'verde', 'ambar', 'naranja', 'violeta', 'aguamarina', 'magenta', 'gris'))
);

-- Un color no se repite entre los grupos prendidos.
create unique index grupos_color_unico_prendidos on public.grupos (color) where activo;

comment on table public.grupos is
  'La única lista de grupos o portafolios (mig 217, D-067). El nombre es lo que se guarda en motos, '
  'perfiles y cuentas. Se cambia solo con las funciones grupo_crear/editar/apagar/encender.';

create table public.grupos_historial (
  id          bigint generated always as identity primary key,
  grupo       text not null,          -- el nombre en ese momento; sin llave, a propósito
  accion      text not null check (accion in ('sembrar', 'crear', 'color', 'renombrar', 'apagar', 'encender')),
  antes       jsonb,
  despues     jsonb,
  hecho_por   uuid,
  created_at  timestamptz not null default now()
);

comment on table public.grupos_historial is
  'Cada cambio a un grupo: quién, cuándo, qué, antes y después (mig 217). Solo lo lee el ADMIN_PRINCIPAL.';

insert into public.grupos (codigo, color, activo) values
  ('RASTREADOR', 'azul',    true),
  ('COSTA',      'verde',   true),
  ('PRADERA',    'ambar',   true),
  ('USADAS',     'naranja', true),
  ('OTRO',       'gris',    false);

insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
select g.codigo, 'sembrar', null, to_jsonb(g), null from public.grupos g;

-- ─── 2. Ningún grupo escrito por fuera de la lista ─────────────────────────────────────────
do $$
declare v text;
begin
  select string_agg(distinct x.t || '=' || x.g, ', ') into v from (
    select 'motos' t, grupo g from public.motos
    union all select 'profiles', grupo from public.profiles
    union all select 'abonos_base', grupo from public.abonos_base
    union all select 'cartera_del_dia', grupo from public.cartera_del_dia
    union all select 'caja_diaria', grupo from public.caja_diaria
    union all select 'ingresos_no_identificados', grupo from public.ingresos_no_identificados
    union all select 'cuentas_bancarias', unnest(grupos) from public.cuentas_bancarias
  ) x
  where x.g is not null and not exists (select 1 from public.grupos where codigo = x.g);
  if v is not null then
    raise exception 'Hay grupos escritos que no están en la lista: %. No se cambió nada.', v;
  end if;
end $$;

-- ─── 3. Las reglas fijas pasan a llave ─────────────────────────────────────────────────────
alter table public.motos drop constraint if exists motos_grupo_check;
alter table public.profiles drop constraint if exists profiles_grupo_check;
alter table public.abonos_base drop constraint if exists abonos_base_grupo_check;
alter table public.caja_diaria alter column grupo drop default;

alter table public.motos add constraint motos_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;
alter table public.profiles add constraint profiles_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;
alter table public.abonos_base add constraint abonos_base_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;
alter table public.cartera_del_dia add constraint cartera_del_dia_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;
alter table public.caja_diaria add constraint caja_diaria_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;
alter table public.ingresos_no_identificados add constraint ingresos_no_identificados_grupo_fk
  foreign key (grupo) references public.grupos (codigo) on update cascade;

-- Las cuentas tienen una LISTA de grupos: una llave no la puede revisar, un disparador sí.
alter table public.cuentas_bancarias drop constraint if exists cuentas_grupos_validos;

create or replace function public.cuentas_grupos_existen()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_malo text;
begin
  select x into v_malo
    from unnest(coalesce(new.grupos, '{}'::text[])) as x
   where not exists (select 1 from public.grupos g where g.codigo = x)
   limit 1;
  if v_malo is not null then
    raise exception 'El grupo % no existe. Créelo primero en Configuración → Grupos.', v_malo
      using errcode = '23503';
  end if;
  return new;
end $$;

drop trigger if exists trg_cuentas_grupos_existen on public.cuentas_bancarias;
create trigger trg_cuentas_grupos_existen
  before insert or update of grupos on public.cuentas_bancarias
  for each row execute function public.cuentas_grupos_existen();

-- Si un grupo cambia de nombre, sus cuentas lo cambian también (las llaves ya lo hacen solas
-- con motos, perfiles, abonos, fotos, cajas y plata sin identificar).
create or replace function public.grupos_renombrar_en_cuentas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.codigo is distinct from old.codigo then
    update public.cuentas_bancarias
       set grupos = array_replace(grupos, old.codigo, new.codigo)
     where old.codigo = any(grupos);
  end if;
  return null;
end $$;

create trigger trg_grupos_renombrar_en_cuentas
  after update of codigo on public.grupos
  for each row execute function public.grupos_renombrar_en_cuentas();

-- ─── 4. Quién lee y quién escribe ──────────────────────────────────────────────────────────
alter table public.grupos enable row level security;
alter table public.grupos_historial enable row level security;

revoke all on public.grupos from anon, authenticated;
revoke all on public.grupos_historial from anon, authenticated;
grant select on public.grupos to authenticated;
grant select on public.grupos_historial to authenticated;

-- El personal ve todos; el socio, solo el suyo.
create policy grupos_select on public.grupos for select to authenticated
  using (public.mi_rol() is not null
         and (public.mi_rol() <> 'SOCIO' or codigo = public.mi_grupo()));

create policy grupos_historial_select on public.grupos_historial for select to authenticated
  using (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- ─── 5. Las funciones ──────────────────────────────────────────────────────────────────────
create or replace function public.grupos_exigir_dueno()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if public.mi_rol() is distinct from 'ADMIN_PRINCIPAL' then
    raise exception 'Solo el Administrador principal puede crear o cambiar los grupos.'
      using errcode = '42501';
  end if;
end $$;

create or replace function public.grupo_normalizar(p text)
returns text language sql immutable as $$
  select upper(btrim(regexp_replace(coalesce(p, ''), '\s+', ' ', 'g')))
$$;

create or replace function public.grupo_validar_nombre(p text)
returns void language plpgsql immutable as $$
begin
  if p = '' then
    raise exception 'Escriba el nombre del grupo.' using errcode = '22023';
  end if;
  if char_length(p) > 14 then
    raise exception 'El nombre lleva hasta 14 caracteres; «%» tiene %.', p, char_length(p) using errcode = '22023';
  end if;
  if p !~ '^[A-ZÑÁÉÍÓÚÜ0-9]+( [A-ZÑÁÉÍÓÚÜ0-9]+)*$' then
    raise exception 'El nombre solo lleva letras, números y un espacio entre palabras: «%» no sirve.', p
      using errcode = '22023';
  end if;
end $$;

-- p_revisar_repetido = false para un grupo apagado: su color se puede repetir mientras esté apagado.
create or replace function public.grupo_validar_color(p_color text, p_codigo text, p_revisar_repetido boolean)
returns void language plpgsql stable security definer set search_path = public as $$
declare v_dueno text;
begin
  if p_color is null or p_color not in ('azul', 'verde', 'ambar', 'naranja', 'violeta', 'aguamarina', 'magenta', 'gris') then
    raise exception 'Ese color no está en la paleta (azul, verde, ámbar, naranja, violeta, aguamarina, magenta o gris).'
      using errcode = '22023';
  end if;
  if p_revisar_repetido then
    select codigo into v_dueno from public.grupos
     where activo and color = p_color and codigo is distinct from p_codigo limit 1;
    if v_dueno is not null then
      raise exception 'El color % ya es de %. Escoja otro.', p_color, v_dueno using errcode = '23505';
    end if;
  end if;
end $$;

-- Qué usa un grupo. «total» = 0 quiere decir que no se usa en nada y se puede renombrar.
create or replace function public.grupo_conteos(p_codigo text)
returns table (motos_empresa int, motos_vendidas int, socios int, cuentas int, abonos int,
               fotos int, cajas int, ingresos int, premios int, total int)
language sql stable security definer set search_path = public as $$
  with c as (
    select
      (select count(*)::int from public.motos m where m.grupo = p_codigo and m.estado is distinct from 'Vendida') as motos_empresa,
      (select count(*)::int from public.motos m where m.grupo = p_codigo and m.estado = 'Vendida')                as motos_vendidas,
      (select count(*)::int from public.profiles p where p.grupo = p_codigo)                                     as socios,
      (select count(*)::int from public.cuentas_bancarias k where p_codigo = any(k.grupos))                      as cuentas,
      (select count(*)::int from public.abonos_base a where a.grupo = p_codigo)                                  as abonos,
      (select count(*)::int from public.cartera_del_dia f where f.grupo = p_codigo)                              as fotos,
      (select count(*)::int from public.caja_diaria j where j.grupo = p_codigo)                                  as cajas,
      (select count(*)::int from public.ingresos_no_identificados i where i.grupo = p_codigo)                    as ingresos,
      (select count(*)::int from public.premios_referidos r
         cross join lateral jsonb_array_elements(
           case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e
        where e->>'grupo' = p_codigo)                                                                       as premios
  )
  select c.motos_empresa, c.motos_vendidas, c.socios, c.cuentas, c.abonos, c.fotos, c.cajas, c.ingresos, c.premios,
         c.motos_empresa + c.motos_vendidas + c.socios + c.cuentas + c.abonos + c.fotos + c.cajas + c.ingresos + c.premios
    from c
$$;

-- Para la sección Grupos: cada grupo con lo que usa y si se deja renombrar o apagar.
-- A quien no sea el Administrador principal le devuelve vacío.
create or replace function public.grupos_uso()
returns table (codigo text, color text, activo boolean, motos_empresa int, motos_vendidas int,
               socios int, cuentas int, abonos int, fotos int, cajas int, ingresos int, premios int,
               puede_renombrar boolean, puede_apagar boolean)
language sql stable security definer set search_path = public as $$
  select g.codigo, g.color, g.activo, c.motos_empresa, c.motos_vendidas, c.socios, c.cuentas, c.abonos,
         c.fotos, c.cajas, c.ingresos, c.premios, c.total = 0, g.activo and c.motos_empresa = 0
    from public.grupos g
   cross join lateral public.grupo_conteos(g.codigo) c
   where public.mi_rol() = 'ADMIN_PRINCIPAL'
   order by g.codigo
$$;

create or replace function public.grupo_crear(p_codigo text, p_color text)
returns public.grupos language plpgsql security definer set search_path = public as $$
declare
  v_cod text := public.grupo_normalizar(p_codigo);
  v_r   public.grupos;
begin
  perform public.grupos_exigir_dueno();
  perform public.grupo_validar_nombre(v_cod);
  if exists (select 1 from public.grupos where codigo = v_cod) then
    raise exception 'Ya existe un grupo llamado %. Si está apagado, enciéndalo.', v_cod using errcode = '23505';
  end if;
  perform public.grupo_validar_color(p_color, v_cod, true);

  insert into public.grupos (codigo, color, activo, creado_por)
  values (v_cod, p_color, true, auth.uid())
  returning * into v_r;

  insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
  values (v_cod, 'crear', null, to_jsonb(v_r), auth.uid());
  return v_r;
end $$;

-- El color siempre; el nombre solo si el grupo no se usa en nada (con motos, se renombra con una
-- migración, como la 218).
create or replace function public.grupo_editar(p_codigo text, p_color text default null, p_nuevo_codigo text default null)
returns public.grupos language plpgsql security definer set search_path = public as $$
declare
  v_g     public.grupos;
  v_r     public.grupos;
  v_color text;
  v_nuevo text;
  v_usos  int;
begin
  perform public.grupos_exigir_dueno();
  select * into v_g from public.grupos where codigo = p_codigo for update;
  if not found then
    raise exception 'No existe el grupo %.', p_codigo using errcode = 'P0002';
  end if;

  v_color := coalesce(p_color, v_g.color);
  v_nuevo := coalesce(nullif(public.grupo_normalizar(p_nuevo_codigo), ''), v_g.codigo);
  if v_color = v_g.color and v_nuevo = v_g.codigo then
    return v_g;
  end if;

  if v_color <> v_g.color then
    perform public.grupo_validar_color(v_color, v_g.codigo, v_g.activo);
  end if;

  if v_nuevo <> v_g.codigo then
    perform public.grupo_validar_nombre(v_nuevo);
    if exists (select 1 from public.grupos where codigo = v_nuevo) then
      raise exception 'Ya existe un grupo llamado %.', v_nuevo using errcode = '23505';
    end if;
    select c.total into v_usos from public.grupo_conteos(v_g.codigo) c;
    if v_usos > 0 then
      raise exception 'El grupo % ya se usa (motos, socio, cuentas, plata, fotos de Cartera o premios): su nombre solo se cambia con una migración.', v_g.codigo
        using errcode = '55000';
    end if;
  end if;

  update public.grupos set codigo = v_nuevo, color = v_color where codigo = v_g.codigo
  returning * into v_r;

  if v_color <> v_g.color then
    insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
    values (v_r.codigo, 'color', jsonb_build_object('color', v_g.color), jsonb_build_object('color', v_color), auth.uid());
  end if;
  if v_nuevo <> v_g.codigo then
    insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
    values (v_r.codigo, 'renombrar', jsonb_build_object('codigo', v_g.codigo), jsonb_build_object('codigo', v_nuevo), auth.uid());
  end if;
  return v_r;
end $$;

create or replace function public.grupo_apagar(p_codigo text)
returns public.grupos language plpgsql security definer set search_path = public as $$
declare
  v_g public.grupos;
  v_r public.grupos;
  v_n int;
begin
  perform public.grupos_exigir_dueno();
  select * into v_g from public.grupos where codigo = p_codigo for update;
  if not found then
    raise exception 'No existe el grupo %.', p_codigo using errcode = 'P0002';
  end if;
  if not v_g.activo then
    raise exception 'El grupo % ya está apagado.', p_codigo using errcode = '55000';
  end if;
  select c.motos_empresa into v_n from public.grupo_conteos(p_codigo) c;
  if v_n > 0 then
    raise exception 'Al grupo % le quedan % motos en la empresa. Páselas a otro grupo antes de apagarlo.', p_codigo, v_n
      using errcode = '55000';
  end if;

  update public.grupos set activo = false where codigo = p_codigo returning * into v_r;
  insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
  values (p_codigo, 'apagar', jsonb_build_object('activo', true), jsonb_build_object('activo', false), auth.uid());
  return v_r;
end $$;

create or replace function public.grupo_encender(p_codigo text)
returns public.grupos language plpgsql security definer set search_path = public as $$
declare
  v_g public.grupos;
  v_r public.grupos;
begin
  perform public.grupos_exigir_dueno();
  select * into v_g from public.grupos where codigo = p_codigo for update;
  if not found then
    raise exception 'No existe el grupo %.', p_codigo using errcode = 'P0002';
  end if;
  if v_g.activo then
    raise exception 'El grupo % ya está prendido.', p_codigo using errcode = '55000';
  end if;
  -- Mientras estuvo apagado, otro grupo pudo quedarse con su color.
  perform public.grupo_validar_color(v_g.color, v_g.codigo, true);

  update public.grupos set activo = true where codigo = p_codigo returning * into v_r;
  insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por)
  values (p_codigo, 'encender', jsonb_build_object('activo', false), jsonb_build_object('activo', true), auth.uid());
  return v_r;
end $$;

-- Las de adentro no se llaman desde la app.
revoke all on function public.grupos_exigir_dueno() from public, anon, authenticated;
revoke all on function public.grupo_normalizar(text) from public, anon, authenticated;
revoke all on function public.grupo_validar_nombre(text) from public, anon, authenticated;
revoke all on function public.grupo_validar_color(text, text, boolean) from public, anon, authenticated;
revoke all on function public.grupo_conteos(text) from public, anon, authenticated;
revoke all on function public.cuentas_grupos_existen() from public, anon, authenticated;
revoke all on function public.grupos_renombrar_en_cuentas() from public, anon, authenticated;
revoke all on function public._mg217_conteos() from public, anon, authenticated;

-- Las que llama la app (el candado de adentro rechaza a quien no sea el dueño).
revoke all on function public.grupos_uso() from public, anon;
revoke all on function public.grupo_crear(text, text) from public, anon;
revoke all on function public.grupo_editar(text, text, text) from public, anon;
revoke all on function public.grupo_apagar(text) from public, anon;
revoke all on function public.grupo_encender(text) from public, anon;
grant execute on function public.grupos_uso() to authenticated;
grant execute on function public.grupo_crear(text, text) to authenticated;
grant execute on function public.grupo_editar(text, text, text) to authenticated;
grant execute on function public.grupo_apagar(text) to authenticated;
grant execute on function public.grupo_encender(text) to authenticated;

-- ─── 6. Tiempo real ────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication_tables
                  where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'grupos') then
    alter publication supabase_realtime add table public.grupos;
  end if;
end $$;

-- ─── 7. ZALA ───────────────────────────────────────────────────────────────────────────────
create or replace view zala.portafolios as
select g.codigo as grupo, g.activo
  from public.grupos g;

grant select on zala.portafolios to zala_lector;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('portafolios', 'grupo', 'El nombre de cada portafolio (el grupo de la moto). Es el mismo que sale en zala.cliente.grupo y en zala.cuentas_pago.grupo. La lista la maneja el dueño desde MotoGestión: un grupo nuevo aparece acá solo, sin cambiar nada en ZALA.', null, 'no', true),
('portafolios', 'activo', 'true = el grupo recibe motos nuevas. false = apagado: ya no recibe motos nuevas, pero lo que ya tenía se sigue viendo con ese nombre.', 'true · false', 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

update zala.diccionario
   set valores = 'Los de zala.portafolios', actualizado = now()
 where (vista, columna) in (('cliente', 'grupo'), ('cuentas_pago', 'grupo'));

-- ─── 8. El conteo de DESPUÉS ───────────────────────────────────────────────────────────────
do $$
declare
  v_antes   jsonb := current_setting('mg217.antes')::jsonb;
  v_despues jsonb := public._mg217_conteos();
begin
  if v_antes is distinct from v_despues then
    raise exception 'Los conteos cambiaron. Antes: % · Después: %. No se cambió nada.', v_antes, v_despues;
  end if;
end $$;

drop function public._mg217_conteos();

-- ─── 9. PRUEBA ADENTRO ─────────────────────────────────────────────────────────────────────
-- Crea un grupo de prueba, lo cambia, lo apaga y lo enciende como el dueño; intenta lo prohibido
-- como el dueño y como los demás; y al final lo borra. Si algo no da, se deshace todo.
do $prueba$
declare
  v_ap        uuid := (select id from public.profiles where role = 'ADMIN_PRINCIPAL' order by created_at limit 1);
  v_sup       uuid := (select id from public.profiles where role = 'SUBADMIN' order by created_at limit 1);
  v_sec       uuid := (select id from public.profiles where role = 'SECRETARIA' order by created_at limit 1);
  v_soc       uuid;
  v_soc_grupo text;
  v_total     int := (select count(*) from public.grupos);
  v_g         public.grupos;
  v_n         int;
  v_txt       text;
  v_b1        boolean;
  v_b2        boolean;
  v_fallo     boolean;
begin
  select id, grupo into v_soc, v_soc_grupo from public.profiles
   where role = 'SOCIO' and grupo is not null order by created_at limit 1;
  if v_ap is null or v_sup is null then
    raise exception 'No hay un ADMIN_PRINCIPAL o un supervisor para la prueba. No se cambió nada.';
  end if;

  -- ── Como el dueño ──
  perform set_config('request.jwt.claim.sub', v_ap::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- 1. Crea (el nombre se limpia y pasa a mayúsculas).
  select * into v_g from public.grupo_crear('  prueba   217 ', 'violeta');
  if v_g.codigo <> 'PRUEBA 217' or v_g.color <> 'violeta' or not v_g.activo then
    raise exception 'La prueba falló: crear dio % / % / %. No se cambió nada.', v_g.codigo, v_g.color, v_g.activo;
  end if;

  -- 2. Cambia el color.
  select * into v_g from public.grupo_editar('PRUEBA 217', 'aguamarina');
  if v_g.color <> 'aguamarina' then
    raise exception 'La prueba falló: no cambió el color. No se cambió nada.';
  end if;

  -- 3. Renombra un grupo que no se usa en nada.
  select * into v_g from public.grupo_editar('PRUEBA 217', null, 'prueba dos');
  if v_g.codigo <> 'PRUEBA DOS' then
    raise exception 'La prueba falló: no renombró el grupo vacío. No se cambió nada.';
  end if;

  -- 4. NO renombra un grupo con motos.
  begin
    perform public.grupo_editar('COSTA', null, 'COSTA DOS');
    v_fallo := false;
  exception when object_not_in_prerequisite_state then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: dejó renombrar COSTA. No se cambió nada.'; end if;

  -- 5. NO apaga un grupo con motos.
  begin
    perform public.grupo_apagar('COSTA');
    v_fallo := false;
  exception when object_not_in_prerequisite_state then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: dejó apagar COSTA. No se cambió nada.'; end if;

  -- 6. NO acepta un nombre con «;», ni uno de más de 14 caracteres.
  begin
    perform public.grupo_crear('MAL;NOMBRE', 'magenta');
    v_fallo := false;
  exception when invalid_parameter_value then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: aceptó un nombre con punto y coma. No se cambió nada.'; end if;

  begin
    perform public.grupo_crear('NOMBRE DEMASIADO LARGO', 'magenta');
    v_fallo := false;
  exception when invalid_parameter_value then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: aceptó un nombre de más de 14. No se cambió nada.'; end if;

  -- 7. NO repite el color de un grupo prendido.
  begin
    perform public.grupo_crear('OTRO MAS', 'verde');
    v_fallo := false;
  exception when unique_violation then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: repitió el color de COSTA. No se cambió nada.'; end if;

  -- 8. Apaga y enciende el grupo vacío.
  select * into v_g from public.grupo_apagar('PRUEBA DOS');
  if v_g.activo then raise exception 'La prueba falló: no apagó el grupo vacío. No se cambió nada.'; end if;
  select * into v_g from public.grupo_encender('PRUEBA DOS');
  if not v_g.activo then raise exception 'La prueba falló: no encendió el grupo. No se cambió nada.'; end if;

  -- 9. Cada paso quedó en el historial (crear, color, renombrar, apagar, encender = 5).
  select count(*) into v_n from public.grupos_historial where grupo in ('PRUEBA 217', 'PRUEBA DOS');
  if v_n <> 5 then
    raise exception 'La prueba falló: el historial tiene % filas de la prueba, debía tener 5. No se cambió nada.', v_n;
  end if;

  -- 10. El uso: todos los grupos; COSTA no se deja renombrar ni apagar; el de prueba sí.
  select count(*) into v_n from public.grupos_uso();
  if v_n <> v_total + 1 then
    raise exception 'La prueba falló: el uso trajo % grupos, debía traer %. No se cambió nada.', v_n, v_total + 1;
  end if;
  select u.puede_renombrar, u.puede_apagar into v_b1, v_b2 from public.grupos_uso() u where u.codigo = 'COSTA';
  if v_b1 or v_b2 then raise exception 'La prueba falló: el uso dice que COSTA se puede cambiar. No se cambió nada.'; end if;
  select u.puede_renombrar, u.puede_apagar into v_b1, v_b2 from public.grupos_uso() u where u.codigo = 'PRUEBA DOS';
  if not v_b1 or not v_b2 then raise exception 'La prueba falló: el uso no deja cambiar el grupo vacío. No se cambió nada.'; end if;
  reset role;

  -- ── Como un supervisor ──
  perform set_config('request.jwt.claim.sub', v_sup::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_sup, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- 11. Ve todos los grupos, pero ni el historial ni el uso.
  select count(*) into v_n from public.grupos;
  if v_n <> v_total + 1 then
    raise exception 'La prueba falló: un supervisor vio % grupos, debía ver %. No se cambió nada.', v_n, v_total + 1;
  end if;
  select count(*) into v_n from public.grupos_historial;
  if v_n <> 0 then raise exception 'La prueba falló: un supervisor vio el historial. No se cambió nada.'; end if;
  select count(*) into v_n from public.grupos_uso();
  if v_n <> 0 then raise exception 'La prueba falló: un supervisor vio el uso. No se cambió nada.'; end if;

  -- 12. No crea, no escribe directo en la tabla, no apaga.
  begin
    perform public.grupo_crear('DEL SUPERVISOR', 'magenta');
    v_fallo := false;
  exception when insufficient_privilege then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: un supervisor creó un grupo. No se cambió nada.'; end if;

  begin
    insert into public.grupos (codigo, color) values ('DIRECTO', 'magenta');
    v_fallo := false;
  exception when insufficient_privilege then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: un supervisor escribió directo en grupos. No se cambió nada.'; end if;

  begin
    update public.grupos set color = 'magenta' where codigo = 'PRUEBA DOS';
    v_fallo := false;
  exception when insufficient_privilege then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: un supervisor cambió un grupo directo. No se cambió nada.'; end if;

  begin
    perform public.grupo_apagar('PRUEBA DOS');
    v_fallo := false;
  exception when insufficient_privilege then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: un supervisor apagó un grupo. No se cambió nada.'; end if;
  reset role;

  -- ── Como la secretaria ──
  if v_sec is not null then
    perform set_config('request.jwt.claim.sub', v_sec::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      perform public.grupo_editar('PRUEBA DOS', 'magenta');
      v_fallo := false;
    exception when insufficient_privilege then v_fallo := true;
    end;
    reset role;
    if not v_fallo then raise exception 'La prueba falló: la secretaria cambió un grupo. No se cambió nada.'; end if;
  end if;

  -- ── Como un socio: ve solo su grupo ──
  if v_soc is not null then
    perform set_config('request.jwt.claim.sub', v_soc::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_soc, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select count(*), max(codigo) into v_n, v_txt from public.grupos;
    reset role;
    if v_n <> 1 or v_txt is distinct from v_soc_grupo then
      raise exception 'La prueba falló: un socio de % vio % grupos (%). No se cambió nada.', v_soc_grupo, v_n, v_txt;
    end if;
  end if;

  -- ── Las llaves (como la base) ──
  -- 13. Una moto no acepta un grupo que no existe.
  begin
    update public.motos set grupo = 'NO EXISTE' where id = (select id from public.motos order by id limit 1);
    v_fallo := false;
  exception when foreign_key_violation then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: una moto aceptó un grupo que no existe. No se cambió nada.'; end if;

  -- 14. Una cuenta tampoco.
  begin
    update public.cuentas_bancarias set grupos = array_append(grupos, 'NO EXISTE')
     where id = (select id from public.cuentas_bancarias order by id limit 1);
    v_fallo := false;
  exception when foreign_key_violation then v_fallo := true;
  end;
  if not v_fallo then raise exception 'La prueba falló: una cuenta aceptó un grupo que no existe. No se cambió nada.'; end if;

  -- Limpiar: el grupo de prueba y su historial no quedan.
  delete from public.grupos_historial where grupo in ('PRUEBA 217', 'PRUEBA DOS');
  delete from public.grupos where codigo = 'PRUEBA DOS';
  -- '{}' y no '': registrar_migracion lee estas claims como json.
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}', true);
end
$prueba$;

select public.registrar_migracion(217, '217_grupos_portafolios.sql',
  'Tabla grupos (la única lista) + historial; las reglas fijas pasan a llave; 4 funciones solo del dueño; zala.portafolios (D-067)');

commit;

-- ── VERIFICACIÓN (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: grupos 5 · lista COSTA verde · OTRO gris (apagado) · PRADERA ambar · RASTREADOR azul ·
-- USADAS naranja · llaves 6 · reglas_viejas 0 · politicas 2 · tiempo_real 1 · zala_la_lee true ·
-- historial 5. Si la migración terminó, la prueba de adentro ya pasó.
select
  (select count(*) from public.grupos) as grupos,
  (select string_agg(codigo || ' ' || color || case when activo then '' else ' (apagado)' end, ' · ' order by codigo)
     from public.grupos) as lista,
  (select count(*) from pg_constraint where conname like '%\_grupo\_fk') as llaves,
  (select count(*) from pg_constraint
    where conname in ('motos_grupo_check', 'abonos_base_grupo_check', 'profiles_grupo_check', 'cuentas_grupos_validos')) as reglas_viejas,
  (select count(*) from pg_policies where schemaname = 'public' and tablename in ('grupos', 'grupos_historial')) as politicas,
  (select count(*) from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'grupos') as tiempo_real,
  has_table_privilege('zala_lector', 'zala.portafolios', 'SELECT') as zala_la_lee,
  (select count(*) from public.grupos_historial) as historial;
