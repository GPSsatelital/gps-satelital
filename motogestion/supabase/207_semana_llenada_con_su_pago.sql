-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 207 — CADA SEMANA LLENADA ANOTA QUÉ PAGO LA LLENÓ (27-oct-2026, D-057)
--        (aprobado por el dueño: «si apruebo» + arrancar los cortes con la semana del 26-oct)
--
-- LO QUE PASÓ: la nómina contaba cada semana con el día en que se CONFIRMÓ el pago, no el día en
-- que pagó el cliente. En la semana del 19-oct, 29 transferencias pagadas de jueves a domingo se
-- confirmaron el lunes siguiente o después, y a los supervisores les salieron "atrasadas" ($3.750 en
-- vez de $7.500) y en la semana equivocada. El registro de semanas llenadas (`cajas_llenadas`, mig
-- 112) no guardaba qué pago llenó cada semana, así que no había cómo saber el día real.
--
-- QUÉ HACE (todo o nada):
--   1. `cajas_llenadas.pago_id`: el pago que llenó esa semana. La nómina toma de ahí el día en que
--      pagó el cliente (`pagos.fecha`).
--   2. Dos piezas pequeñas sobre `pagos`, SIN TOCAR EL MOTOR: una corre justo antes del motor
--      (`trg_pago_a_…` va antes que `trg_pago_confirmado_iu` por orden alfabético) y deja dicho qué
--      pago se está aplicando; la otra corre justo después (`trg_pago_d_…`) y lo borra.
--   3. El registro de semanas llenadas (copiado de la base VIVA el 27-oct, idéntico al de la mig
--      112) guarda ese pago cuando la semana la llenó un pago (no un acuerdo).
--   4. Completa las semanas llenadas desde el 26-oct (arranque de los cortes): el pago registrado
--      en el mismo instante, o si no, el último registrado antes (las transferencias se confirman
--      por tandas). Las de antes del 26-oct no se tocan: esas semanas se pagaron por fuera.
--
-- LO QUE NO CAMBIA: el motor de pagos, el reparto, las cajas, lo que debe cada cliente, Cartera,
-- ZALA. Solo se agrega un dato y se anota.
-- ORDEN: correr ESTO antes de subir la app (la nómina ya pide la columna nueva).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) La columna ────────────────────────────────────────────────────────────────────────────
alter table public.cajas_llenadas
  add column if not exists pago_id uuid references public.pagos(id) on delete set null;
comment on column public.cajas_llenadas.pago_id is
  'El pago que llenó esta semana (mig 207). La nómina usa su fecha (el día en que pagó el cliente). NULL = la llenó un acuerdo, o es anterior al 26-oct-2026.';

-- ── 2) Avisar qué pago se está aplicando (antes del motor) y borrarlo (después) ──────────────
create or replace function public.pago_en_curso_marca()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.pago_id', new.id::text, true);
  return null;
end; $$;

create or replace function public.pago_en_curso_limpia()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('app.pago_id', '', true);
  return null;
end; $$;

drop trigger if exists trg_pago_a_marca_en_curso on public.pagos;
create trigger trg_pago_a_marca_en_curso
  after insert or update of estado on public.pagos
  for each row execute function public.pago_en_curso_marca();

drop trigger if exists trg_pago_d_limpia_en_curso on public.pagos;
create trigger trg_pago_d_limpia_en_curso
  after insert or update of estado on public.pagos
  for each row execute function public.pago_en_curso_limpia();

-- ── 3) El registro de semanas llenadas guarda el pago ────────────────────────────────────────
create or replace function public.registrar_caja_llenada()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_fuente text := coalesce(nullif(current_setting('app.fuente_caja', true), ''), 'pago');
  v_pago   uuid := case when v_fuente = 'pago'
                        then nullif(current_setting('app.pago_id', true), '')::uuid end;
begin
  if coalesce(new.cajas_pagadas, 0) > coalesce(old.cajas_pagadas, 0) then
    insert into public.cajas_llenadas (contrato_id, caja_numero, fecha, fuente, pago_id)
    select new.id, n, current_date, v_fuente, v_pago
    from generate_series(coalesce(old.cajas_pagadas, 0) + 1, coalesce(new.cajas_pagadas, 0)) n
    on conflict (contrato_id, caja_numero) do nothing;
  elsif coalesce(new.cajas_pagadas, 0) < coalesce(old.cajas_pagadas, 0) then
    delete from public.cajas_llenadas
     where contrato_id = new.id and caja_numero > coalesce(new.cajas_pagadas, 0);
  end if;

  if coalesce(new.prorrateo_total, 0) > 0 then
    if coalesce(new.prorrateo_pagado, 0) >= new.prorrateo_total
       and coalesce(old.prorrateo_pagado, 0) < coalesce(old.prorrateo_total, new.prorrateo_total) then
      insert into public.cajas_llenadas (contrato_id, caja_numero, fecha, fuente, pago_id)
      values (new.id, 0, current_date, 'pago', v_pago)
      on conflict (contrato_id, caja_numero) do nothing;
    elsif coalesce(new.prorrateo_pagado, 0) < new.prorrateo_total then
      delete from public.cajas_llenadas where contrato_id = new.id and caja_numero = 0;
    end if;
  end if;

  return new;
end; $$;

-- ── 4) Completar las semanas llenadas desde el arranque de los cortes (26-oct) ───────────────
update public.cajas_llenadas e
   set pago_id = (
     select p.id
       from public.pagos p
      where p.contrato_id = e.contrato_id
        and p.estado = 'Confirmado'
        and p.tipo_registro is distinct from 'adelanto_base'
        and case when e.caja_numero = 0 then coalesce(p.aplicado_prorrateo, 0) > 0
                 else coalesce(p.aplicado_tarifa, 0) > 0 end
        and p.created_at <= e.created_at
      order by (p.created_at = e.created_at) desc, p.created_at desc
      limit 1)
 where e.fecha >= '2026-10-26'
   and e.fuente = 'pago'
   and e.pago_id is null;

commit;

-- ── Verificación (correr después): cuántas semanas llenadas desde el 26-oct quedaron con su pago
select count(*)                                   as llenadas_desde_26_oct,
       count(pago_id)                             as con_su_pago,
       count(*) filter (where pago_id is null)    as sin_pago
  from public.cajas_llenadas
 where fecha >= '2026-10-26' and fuente = 'pago';
