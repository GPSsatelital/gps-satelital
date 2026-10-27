-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 208 — EL PAGO DE NÓMINA DEL 15 Y EL 30 (27-oct-2026, D-057, parte 4)
--        (decidido por el dueño: «cada 15 y 30 se pagan las semanas ya cerradas el miércoles que no
--        se hayan pagado»; el día lo pone quien paga; pagan ADMIN y ADMIN_PRINCIPAL)
--
-- QUÉ HACE:
--   1. `nomina_pagos`: cada entrega de plata a un supervisor — cuánto, qué día, qué semanas
--      (congeladas), su firma de RECIBIDO y la foto del comprobante. No se edita ni se borra.
--   2. `nomina_pago_semanas`: qué semana cerrada entró en qué pago. `cierre_id` es ÚNICO: una semana
--      cerrada se paga UNA sola vez — el candado está en la base, no solo en la pantalla (D-054).
--   3. `registrar_pago_nomina(...)`: registra el pago entero o nada. Revisa quién paga, que las
--      semanas sean de ese supervisor, que sean del 26-oct en adelante (las anteriores se pagaron por
--      fuera) y que ninguna esté ya pagada. El total lo suma la base con las cifras congeladas de cada
--      cierre: la pantalla no puede mandar otro número.
--
-- LO QUE NO CAMBIA: los cierres semanales (`nomina_cierres`) siguen igual: no se tocan, no se editan.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) Los pagos ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.nomina_pagos (
  id uuid primary key default gen_random_uuid(),
  subadmin_id uuid not null references public.profiles(id),
  /** El nombre tal como estaba el día del pago: si mañana cambia, el comprobante no miente. */
  cobrador_nombre text not null,
  total numeric not null,
  /** Las semanas que se pagaron, CONGELADAS: [{cierre_id, semana_lunes, total}]. */
  semanas jsonb not null default '[]'::jsonb,
  firma_url text not null,
  foto_url text,
  observacion text,
  pagado_por uuid references public.profiles(id),
  /** El día en que se pagó (hora de Colombia). */
  fecha date not null default (now() at time zone 'America/Bogota')::date,
  created_at timestamptz not null default now()
);
comment on table public.nomina_pagos is
  'Pagos de nómina a los supervisores (el 15 y el 30, mig 208): cuánto, qué día, qué semanas cerradas, firma de recibido. No se edita ni se borra.';

-- ── 2) Qué semana cerrada entró en qué pago (una sola vez) ───────────────────────────────────
create table if not exists public.nomina_pago_semanas (
  pago_id uuid not null references public.nomina_pagos(id),
  cierre_id uuid not null unique references public.nomina_cierres(id)
);

alter table public.nomina_pagos enable row level security;
alter table public.nomina_pago_semanas enable row level security;

-- LEER: quien ve la nómina; el supervisor ve SUS pagos.
drop policy if exists nomina_pagos_select on public.nomina_pagos;
create policy nomina_pagos_select on public.nomina_pagos for select
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA') or subadmin_id = auth.uid());

drop policy if exists nomina_pago_semanas_select on public.nomina_pago_semanas;
create policy nomina_pago_semanas_select on public.nomina_pago_semanas for select
  using (
    public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA')
    or exists (select 1 from public.nomina_pagos p where p.id = pago_id and p.subadmin_id = auth.uid())
  );
-- Sin INSERT, UPDATE ni DELETE directos: solo se escribe con la función de abajo.

-- ── 3) Registrar el pago: todo o nada ────────────────────────────────────────────────────────
create or replace function public.registrar_pago_nomina(
  p_subadmin uuid,
  p_cierres uuid[],
  p_firma_url text,
  p_foto_url text default null,
  p_observacion text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_pago uuid;
  v_n int;
  v_total numeric;
  v_semanas jsonb;
  v_nombre text;
begin
  if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo ADMIN o ADMIN_PRINCIPAL registran el pago de nómina.';
  end if;
  if p_cierres is null or coalesce(array_length(p_cierres, 1), 0) = 0 then
    raise exception 'No hay semanas para pagar.';
  end if;
  if coalesce(trim(p_firma_url), '') = '' then
    raise exception 'Falta la firma de recibido del supervisor.';
  end if;

  -- Un pago a la vez por supervisor: dos clics o dos celulares no lo pagan dos veces.
  perform pg_advisory_xact_lock(hashtext('nomina_pago|' || p_subadmin::text));

  select count(*), sum(c.total),
         jsonb_agg(jsonb_build_object('cierre_id', c.id, 'semana_lunes', c.semana_lunes, 'total', c.total) order by c.semana_lunes)
    into v_n, v_total, v_semanas
    from public.nomina_cierres c
   where c.id = any(p_cierres)
     and c.subadmin_id = p_subadmin
     and c.semana_lunes >= date '2026-10-26';
  if v_n <> array_length(p_cierres, 1) then
    raise exception 'Alguna semana no es de este supervisor, no está cerrada o es de antes del 26 de octubre.';
  end if;

  if exists (select 1 from public.nomina_pago_semanas s where s.cierre_id = any(p_cierres)) then
    raise exception 'Alguna de esas semanas ya se le pagó. Vuelve a abrir la pantalla.';
  end if;

  select nombre into v_nombre from public.profiles where id = p_subadmin;

  insert into public.nomina_pagos (subadmin_id, cobrador_nombre, total, semanas, firma_url, foto_url, observacion, pagado_por)
  values (p_subadmin, coalesce(v_nombre, 'Supervisor'), v_total, v_semanas, p_firma_url,
          nullif(trim(coalesce(p_foto_url, '')), ''), nullif(trim(coalesce(p_observacion, '')), ''), auth.uid())
  returning id into v_pago;

  insert into public.nomina_pago_semanas (pago_id, cierre_id)
  select v_pago, unnest(p_cierres);

  return v_pago;
end; $$;

grant execute on function public.registrar_pago_nomina(uuid, uuid[], text, text, text) to authenticated;

commit;

-- ── Verificación (debe dar: 1 · 1 · 1 · 2) ──────────────────────────────────────────────────
select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'nomina_pagos')        as tabla_pagos,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'nomina_pago_semanas') as tabla_semanas,
  (select count(*) from pg_proc where proname = 'registrar_pago_nomina')                                                as funcion,
  (select count(*) from pg_policies where tablename in ('nomina_pagos', 'nomina_pago_semanas'))                         as politicas;
