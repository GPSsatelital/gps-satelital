-- 129 — EL CONTADOR PARA CUANDO LA MOTO YA ES DE OTRO
--
-- EL DEFECTO (visto el 19-ago-2026 con 4 casos; medido hoy 7-sep: **12 casos, $9.082.000 cobrados
-- de más**, y crecía $200.000 cada semana). Cadena: se recoge la moto → contrato 'Suspendido' +
-- moto 'Recuperada' → alguien la libera → 'Disponible' → el wizard la ofrece → se le entrega a
-- OTRO cliente… y el contrato del primero **sigue vivo exigiendo cajas para siempre**, porque
-- `cajas_exigidas` solo mira `fecha_inicio_cajas` y nunca el estado ni la moto.
--
-- Caso que lo destapó — DANIEL DIAZ CARDONA (RNG53H): la moto es de MARLON desde el 10-ago.
-- Liquidarlo hoy: DEBE $1.052.000 y entra a lista negra. Con el corte al día que la perdió:
-- DEBE $272.000. Los mismos hechos.
--
-- LA REGLA (dueño, 19-ago: "la moto ya es de otro, no la va a recuperar: el contador debe parar"):
--   · Mientras la moto está guardada esperando que pague, el contador SIGUE — ese tiempo se le
--     cobra o se le rueda, como siempre (NESTOR en bodega).
--   · El día que la moto se le entrega a OTRO cliente, se acabó la espera: **el contador para ahí**.
--     Se toma `fecha_entrega` del contrato nuevo, no la recepción: hasta ese día todavía podía
--     recuperarla, así que ese tiempo sí se le cobra.
--
-- QUÉ HACE:
--   1) `contratos.fecha_fin_cobro` + `motivo_fin_cobro`: desde esa fecha no se le exige nada más.
--   2) `cajas_exigidas` topa el cálculo en esa fecha (cuerpo vivo de la 078 + una línea).
--   3) Trigger `contrato_activo_para_el_anterior`: al activar un contrato sobre una moto que ya
--      tenía otro contrato vivo, le pone la fecha al viejo SOLO. Nadie tiene que acordarse.
--   4) Backfill de los 12 casos que hay hoy.
--
-- NO toca: pagos, ahorro, `total_cajas`, deudas ni convenios. Solo deja de EXIGIR hacia adelante.
-- Lo ya pagado queda como está; la liquidación de cada uno saldrá con la cifra correcta.

-- ── 0) La función viva de cajas_exigidas tiene que ser la de la 078. Si no, PARAR. ────────────
do $$
declare v_def text;
begin
  v_def := pg_get_functiondef('public.cajas_exigidas(public.contratos, date)'::regprocedure);
  if position('cajas_exoneradas' in v_def) = 0 then
    raise exception 'La función viva cajas_exigidas NO trae cajas_exoneradas (mig 078). Leerla con pg_get_functiondef antes de seguir.';
  end if;
  if position('fecha_fin_cobro' in v_def) > 0 then
    raise notice 'cajas_exigidas ya tiene el freno: la 129 ya se corrió. Se vuelve a aplicar sin daño.';
  end if;
end $$;

-- ── 1) Hasta cuándo se le cobra a este contrato ───────────────────────────────────────────────
alter table public.contratos
  add column if not exists fecha_fin_cobro date,
  add column if not exists motivo_fin_cobro text;

comment on column public.contratos.fecha_fin_cobro is
  'Último día por el que se le exigen cuotas (mig 129). Se llena solo cuando la moto se le entrega a OTRO cliente: desde ahí el contador para. NULL = sigue corriendo normal.';
comment on column public.contratos.motivo_fin_cobro is
  'Por qué paró el contador, en palabras. Queda para la liquidación y para el informe.';

-- ── 2) El motor deja de exigir después de esa fecha ───────────────────────────────────────────
-- Cuerpo VIVO de la 078 (leído con pg_get_functiondef) con UNA línea nueva, marcada con ★.
create or replace function public.cajas_exigidas(c public.contratos, p_hoy date)
returns integer language plpgsql stable as $$
declare
  v_n int := 0;
  v_dias int[];
  v_mes date;
  v_dia int;
  v_fecha date;
begin
  -- ★ 129: el contador para el día que la moto pasó a otro cliente. Nunca cuenta más allá.
  if c.fecha_fin_cobro is not null and p_hoy > c.fecha_fin_cobro then
    p_hoy := c.fecha_fin_cobro;
  end if;

  if c.fecha_inicio_cajas is null or p_hoy < c.fecha_inicio_cajas then
    v_n := least(coalesce(c.cajas_previas, 0), coalesce(c.total_cajas, coalesce(c.cajas_previas, 0)));
    return greatest(v_n - coalesce(c.cajas_exoneradas, 0), 0);
  end if;

  if c.forma_pago = 'Semanal' then
    v_n := floor((p_hoy - c.fecha_inicio_cajas) / 7.0)::int + 1;
  elsif c.forma_pago in ('Quincenal', 'Mensual') then
    v_dias := coalesce(c.dias_pago_mes, case when c.forma_pago = 'Quincenal' then array[5,20] else array[5] end);
    v_mes := date_trunc('month', c.fecha_inicio_cajas)::date;
    while v_mes <= p_hoy loop
      foreach v_dia in array v_dias loop
        v_fecha := least(v_mes + (v_dia - 1), (v_mes + interval '1 month' - interval '1 day')::date);
        if v_fecha >= c.fecha_inicio_cajas and v_fecha <= p_hoy then
          v_n := v_n + 1;
        end if;
      end loop;
      v_mes := (v_mes + interval '1 month')::date;
    end loop;
  else
    return 0; -- Diario: fuera del libro
  end if;

  v_n := v_n + coalesce(c.cajas_previas, 0);
  -- La resta va ANTES del tope (mig 078: si va después, el contrato nunca termina).
  v_n := v_n - coalesce(c.cajas_exoneradas, 0);
  if c.total_cajas is not null then
    v_n := least(v_n, c.total_cajas);
  end if;
  return greatest(v_n, 0);
end;
$$;

-- ── 2b) Los días de mora también se congelan (la vitrina los usa) ────────────────────────────
-- Si el contador paró no hay moto que recolectar ni cuota que siga venciendo: sin esto las cajas
-- dejaban de crecer pero los días seguían subiendo, y el cliente escalaba solo en el protocolo.
create or replace function zala.dias_en_mora_v2(c public.contratos, p_hoy date) returns int language plpgsql stable as $$
declare
  v_pagadas int := coalesce(c.cajas_pagadas, 0);
  v_exig int; v_pror numeric; v_k int; v_fecha date := null;
  v_dias int[]; v_mes date; v_dia int; v_f date; v_cont int := 0; v_ult int;
begin
  if c.fecha_inicio_cajas is null then return 0; end if;
  -- ★ 129: el contador paró → los días también.
  if c.fecha_fin_cobro is not null and p_hoy > c.fecha_fin_cobro then
    p_hoy := c.fecha_fin_cobro;
  end if;
  v_exig := public.cajas_exigidas(c, p_hoy);
  if v_exig <= v_pagadas then
    v_pror := greatest(coalesce(c.prorrateo_total, 0) - coalesce(c.prorrateo_pagado, 0), 0);
    if v_pror <= 0 then return 0; end if;
    return greatest(p_hoy - c.fecha_inicio_cajas, 0);
  end if;
  v_k := greatest(v_pagadas - coalesce(c.cajas_previas, 0) + 1, 1);
  if c.forma_pago = 'Semanal' then
    v_fecha := c.fecha_inicio_cajas + (v_k - 1) * 7;
  else
    select array_agg(x order by x) into v_dias from unnest(zala._dias_pago_mes(c)) x;
    v_mes := date_trunc('month', c.fecha_inicio_cajas::timestamp)::date;
    for g in 0..399 loop
      v_ult := extract(day from (v_mes::timestamp + interval '1 month' - interval '1 day'))::int;
      foreach v_dia in array v_dias loop
        v_f := v_mes + (least(v_dia, v_ult) - 1);
        if v_f >= c.fecha_inicio_cajas then
          v_cont := v_cont + 1;
          if v_cont = v_k then v_fecha := v_f; exit; end if;
        end if;
      end loop;
      exit when v_fecha is not null;
      v_mes := (v_mes::timestamp + interval '1 month')::date;
    end loop;
    if v_fecha is null then v_fecha := c.fecha_inicio_cajas; end if;
  end if;
  return greatest(p_hoy - v_fecha, 0);
end $$;

-- ── 3) EL CANDADO: al entregarle la moto a otro, el contador del anterior para solo ───────────
create or replace function public.contrato_activo_para_el_anterior()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_placa text; v_n int;
begin
  if new.estado <> 'Activo' or new.moto_id is null then return new; end if;
  -- Solo al ACTIVARSE (nace Activo, o pasa de En proceso/Suspendido a Activo).
  if tg_op = 'UPDATE' and old.estado = 'Activo' and old.moto_id is not distinct from new.moto_id then
    return new;
  end if;

  select placa into v_placa from public.motos where id = new.moto_id;

  with parados as (
    update public.contratos c
       set fecha_fin_cobro  = coalesce(new.fecha_entrega, current_date),
           motivo_fin_cobro = 'La moto ' || coalesce(v_placa, '') || ' se le entregó a otro cliente el '
                              || to_char(coalesce(new.fecha_entrega, current_date), 'DD/MM/YYYY')
     where c.moto_id = new.moto_id
       and c.id <> new.id
       and c.estado in ('Activo', 'Suspendido')
       and c.fecha_fin_cobro is null
       -- Un préstamo de reemplazo NO es esto: ahí el contrato apunta a una moto prestada a
       -- propósito y su propio contador debe seguir corriendo.
       and not exists (select 1 from public.prestamos_reemplazo p
                        where p.estado = 'activo' and p.contrato_id = c.id)
    returning 1
  )
  select count(*) into v_n from parados;

  if v_n > 0 then
    raise notice 'Se paró el contador de % contrato(s) anterior(es) sobre la moto %.', v_n, coalesce(v_placa, new.moto_id::text);
  end if;
  return new;
end; $$;

drop trigger if exists trg_contrato_activo_para_el_anterior on public.contratos;
create trigger trg_contrato_activo_para_el_anterior
  after insert or update of estado, moto_id on public.contratos
  for each row execute function public.contrato_activo_para_el_anterior();

-- NOTA: la vitrina (`zala.cliente`) ya devuelve la cifra correcta sin tocarla, porque su cuenta
-- pasa por `public.cajas_exigidas`, que acaba de quedar topada. Falta agregarle las columnas
-- `cuenta_congelada` / `cuenta_congelada_porque` para que ZALA pueda explicar POR QUÉ no crece:
-- eso obliga a reescribir la vista completa y se hace aparte, sin bloquear este arreglo.

-- ── 4) Backfill: los que hoy están cobrando de más ───────────────────────────────────────────
-- Para cada moto con dos contratos vivos, el más NUEVO por fecha de entrega es el que la tiene;
-- a los demás se les para el contador ese día.
with nuevo as (
  select distinct on (c.moto_id) c.moto_id, c.id, c.fecha_entrega, m.placa
    from public.contratos c
    join public.motos m on m.id = c.moto_id
   where c.estado in ('Activo', 'Suspendido')
     and not exists (select 1 from public.prestamos_reemplazo p where p.estado = 'activo' and p.contrato_id = c.id)
   order by c.moto_id, c.fecha_entrega desc nulls last
)
update public.contratos c
   set fecha_fin_cobro  = n.fecha_entrega,
       motivo_fin_cobro = 'La moto ' || n.placa || ' se le entregó a otro cliente el '
                          || to_char(n.fecha_entrega, 'DD/MM/YYYY') || ' (corregido el 07/09/2026)'
  from nuevo n
 where c.moto_id = n.moto_id
   and c.id <> n.id
   and c.estado in ('Activo', 'Suspendido')
   and c.fecha_fin_cobro is null
   and n.fecha_entrega is not null
   and not exists (select 1 from public.prestamos_reemplazo p where p.estado = 'activo' and p.contrato_id = c.id);

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) A quiénes se les paró el contador y cuánto baja lo que se les exige.
select cl.nombre, m.placa, c.estado, c.fecha_fin_cobro,
       public.cajas_exigidas(c, current_date)      as exigidas_ahora,
       public.cajas_exigidas(c, c.fecha_fin_cobro) as exigidas_al_corte,
       c.cajas_pagadas,
       greatest((public.cajas_exigidas(c, current_date) - c.cajas_pagadas), 0) * public.caja_valor(c) as debe_cuotas
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
 where c.fecha_fin_cobro is not null
 order by cl.nombre;

-- b) Ninguna moto debe quedar con dos contratos vivos SIN freno (debe dar 0).
select count(*) as motos_con_dos_contratos_vivos_sin_freno
  from (select moto_id from public.contratos
         where estado in ('Activo','Suspendido') and moto_id is not null and fecha_fin_cobro is null
         group by moto_id having count(*) > 1) x;

-- c) Nadie más quedó tocado: contratos con freno = solo los del backfill.
select count(*) as contratos_con_freno from public.contratos where fecha_fin_cobro is not null;
