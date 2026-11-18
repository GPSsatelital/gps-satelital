-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 224 — LA EVALUACIÓN SEMANAL DE LOS SUPERVISORES (18-nov-2026, D-093; dueño: «quiero un resumen de
--       evaluacion que se pueda sacar semana a semana desde la app», «asi igual a ese y que podamos
--       seguirlo mejorando», «Sí, arranca así»)
--
-- QUÉ ES: la hoja «CARTERA RESUMEN EVALUACIÓN» que se llenaba a mano, sacada de las fotos de cada
-- noche (`cartera_del_dia`, mig 190). Una semana va de lunes a domingo. Cada moto cuenta para el
-- supervisor que la tenía en la foto del domingo (o de la última noche, si la semana va en curso).
-- Es el mismo método del PDF del 18-nov (memoria `resumen-evaluacion-supervisores-18nov`).
--
-- QUÉ HACE:
--   1. `evaluacion_semanas()`: las semanas que tienen fotos (para el selector de la pantalla).
--   2. `evaluacion_semana(lunes)`: todas las filas de cada supervisor y las listas de placas.
--   Las dos solo LEEN: no tocan pagos, cuotas, contratos ni la foto de cada noche.
--   Solo las ven ADMIN_PRINCIPAL y ADMIN (D-093): cualquier otro recibe un error aunque la pida
--   directo a la base, sin pasar por la pantalla.
--   La regla de «para recoger» NO se repite aquí: se usa `para_recoger` tal como lo anotó la foto.
--   ZALA no la lee (D-093: son cifras internas del equipo).
--   Para agregar una fila: un bloque más en `filas` y un renglón en la pantalla. La meta (90 %)
--   vive solo aquí.
--
-- LO QUE NO SABE: cuántos pagos estaban «por confirmar» un día pasado (el pago no guarda la hora en
-- que lo confirmaron). En semanas cerradas sale vacío; en la semana en curso, los de hoy.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   drop function if exists public.evaluacion_semana(date);
--   drop function if exists public.evaluacion_semanas();
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── Las semanas que tienen fotos ────────────────────────────────────────────────────────────
create or replace function public.evaluacion_semanas()
returns table (lunes date, corte date, completa boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if coalesce(public.mi_rol(), '') not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'La evaluación semanal solo la ven el administrador principal y el administrador'
      using errcode = '42501';
  end if;
  return query
    select (d.fecha - (extract(isodow from d.fecha)::int - 1))::date,
           max(d.fecha),
           bool_or(extract(isodow from d.fecha) = 7)
      from (select distinct c.fecha from public.cartera_del_dia c) d
     group by 1
     order by 1 desc;
end $$;

-- ── Una semana: todas las filas por supervisor ──────────────────────────────────────────────
create or replace function public.evaluacion_semana(p_lunes date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_dom_ant  date := p_lunes - 1;     -- el domingo anterior: cómo arrancó la semana
  v_domingo  date := p_lunes + 6;
  v_corte    date;                    -- la noche que cierra: el domingo, o la última foto si va en curso
  v_fin_rec  date;                    -- hasta qué noche una moto «debió recogerse» en esta semana
  v_en_curso boolean;
  v_r        jsonb;
begin
  if coalesce(public.mi_rol(), '') not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'La evaluación semanal solo la ven el administrador principal y el administrador'
      using errcode = '42501';
  end if;
  if extract(isodow from p_lunes) <> 1 then
    raise exception 'La semana se pide por su lunes: % no es lunes', p_lunes;
  end if;

  select max(fecha) into v_corte from public.cartera_del_dia where fecha between p_lunes and v_domingo;
  if v_corte is null then
    return null;                      -- esa semana no tiene fotos
  end if;
  -- La que entra a Recolección el mismo domingo no cuenta: todavía no daba tiempo de recogerla.
  v_fin_rec  := case when v_corte = v_domingo then v_domingo - 1 else v_corte end;
  v_en_curso := v_domingo >= zala.hoy();

  with
  s as (select * from public.cartera_del_dia where fecha = v_corte),
  a as (select * from public.cartera_del_dia where fecha = v_dom_ant),

  -- 1 a 3. Asignadas, en la calle y guardadas: por PLACA (una moto con dos contratos cuenta una vez).
  placas as (
    select placa,
           (array_agg(cobrador_id order by (estado in ('aldia', 'gabela', 'mora', 'sin-cuenta')) desc, contrato_id))[1] as sup,
           bool_or(estado in ('aldia', 'gabela', 'mora', 'sin-cuenta')) as en_calle
      from s group by placa),

  -- 4 a 7. Les tocaba pagar: en la calle esa noche, y con día de pago en la semana o debiendo desde
  -- el domingo anterior. Completo = al día esa noche. Parcial = debe, pero pagó algo en la semana.
  tocaba as (
    select s.contrato_id, s.cobrador_id as sup, s.estado,
           exists (select 1 from public.pagos p
                    where p.contrato_id = s.contrato_id and p.estado <> 'Rechazado'
                      and p.tipo_registro in ('normal', 'transferencia', 'campo')
                      and p.fecha between p_lunes and v_corte) as pago
      from s left join a on a.contrato_id = s.contrato_id
     where s.estado in ('aldia', 'gabela', 'mora')
       and (exists (select 1 from public.cartera_del_dia f
                     where f.contrato_id = s.contrato_id and f.paga_ese_dia
                       and f.fecha between p_lunes and v_corte)
            or (a.contrato_id is not null and a.estado <> 'aldia'))),

  -- Cada contrato, noche contra la noche anterior que tenga foto.
  noches as (
    select fecha, lag(fecha) over (order by fecha) as previa
      from (select distinct fecha from public.cartera_del_dia where fecha between p_lunes - 7 and v_corte) d),
  cambios as (
    select c.fecha, c.contrato_id, c.placa, c.estado, c.debe_total,
           p.contrato_id is not null as habia, p.estado as estado_antes, p.debe_total as debe_antes,
           case when s.contrato_id is not null then s.cobrador_id else c.cobrador_id end as sup
      from noches n
      join public.cartera_del_dia c on c.fecha = n.fecha
      left join public.cartera_del_dia p on p.fecha = n.previa and p.contrato_id = c.contrato_id
      left join s on s.contrato_id = c.contrato_id
     where n.fecha between p_lunes and v_corte and n.previa is not null),
  -- 8. Inmovilizadas: pasaron a guardada (retenida) en la semana, una vez por contrato.
  inmov as (
    select distinct on (contrato_id) contrato_id, placa, fecha, sup
      from cambios where estado = 'retenida' and (not habia or estado_antes <> 'retenida')
     order by contrato_id, fecha),
  -- 10. Reentregadas: de guardada (retenida) a la calle.
  reent as (
    select fecha, placa, sup, debe_antes, debe_total as debe_despues
      from cambios where estado_antes = 'retenida' and estado in ('aldia', 'gabela', 'mora')),
  -- 9. Inmovilizadas de antes: guardadas el domingo anterior y todavía esa noche.
  ant as (
    select s.cobrador_id as sup from s join a on a.contrato_id = s.contrato_id
     where s.estado = 'retenida' and a.estado = 'retenida'),

  -- El supervisor de cada contrato en la última noche de la semana en que aparece.
  ultimo as (
    select distinct on (contrato_id) contrato_id, cobrador_id as sup, placa
      from public.cartera_del_dia where fecha between v_dom_ant and v_corte
     order by contrato_id, fecha desc),
  -- 11. Liquidaciones abiertas en la semana (las anuladas no cuentan).
  liq as (
    select l.numero, (l.created_at at time zone 'America/Bogota')::date as fecha, u.sup, u.placa
      from public.liquidaciones l left join ultimo u on u.contrato_id = l.contrato_id
     where l.anulada_at is null
       and (l.created_at at time zone 'America/Bogota')::date between p_lunes and v_corte),
  -- 12. Referidos que recibieron su moto en la semana (la primera entrega del cliente referido).
  refe as (
    select cl.referido_por_funcionario as sup, m.placa, pc.fecha_entrega as fecha
      from public.clientes cl
      join lateral (select c.fecha_entrega, c.moto_id from public.contratos c
                     where c.cliente_id = cl.id and c.fecha_entrega is not null
                     order by c.fecha_entrega limit 1) pc on true
      left join public.motos m on m.id = pc.moto_id
     where cl.referido_por_funcionario is not null
       and pc.fecha_entrega between p_lunes and v_corte),
  -- Visitas hechas en la semana, para quien la hizo.
  vis as (
    select v.realizada_por as sup from public.visitas v
     where v.realizada_por is not null and v.fecha between p_lunes and v_corte),
  -- 13. Terminaron de pagar: la última semana del contrato se llenó con un pago (no con un acuerdo).
  term as (
    select u.sup from public.cajas_llenadas cj
      join public.contratos c on c.id = cj.contrato_id
      left join ultimo u on u.contrato_id = cj.contrato_id
     where cj.fecha between p_lunes and v_corte and cj.fuente = 'pago'
       and c.total_cajas is not null and cj.caja_numero >= c.total_cajas),
  -- Pagos por confirmar: solo se puede saber HOY.
  pend as (
    select x.sup from public.pagos p
      left join (select contrato_id, cobrador_id as sup from s) x on x.contrato_id = p.contrato_id
     where v_en_curso and p.estado = 'Pendiente'),

  -- Recolección de la semana, por placa.
  por_placa as (
    select fecha, placa,
           bool_or(estado in ('aldia', 'gabela', 'mora')) as en_calle,
           bool_or(estado = 'retenida') as alguna_retenida,
           bool_or(para_recoger) as para_recoger,
           bool_or(con_plazo) as con_plazo,
           (array_agg(cobrador_id order by (estado in ('aldia', 'gabela', 'mora')) desc, contrato_id))[1] as sup,
           max(dias_mora) as dias_mora,
           max(coalesce(debe_total, 0)) as debe
      from public.cartera_del_dia where fecha between v_dom_ant and v_corte
     group by fecha, placa),
  -- Debieron recogerse: estaban para recoger alguna noche, del domingo anterior al sábado.
  entro as (
    select distinct on (placa) placa, sup
      from por_placa where para_recoger and en_calle and fecha between v_dom_ant and v_fin_rec
     order by placa, fecha),
  -- Y qué les pasó a la noche que cierra.
  recol as (
    select e.placa,
           case when f.placa is not null then f.sup else e.sup end as sup,
           case when f.placa is null then 'otro'
                when not f.en_calle and f.alguna_retenida then 'recogida'
                when f.en_calle and f.para_recoger then 'no'
                when f.en_calle and f.con_plazo then 'plazo'
                when f.en_calle then 'pago'
                else 'otro' end as como,
           f.dias_mora, f.debe
      from entro e left join por_placa f on f.placa = e.placa and f.fecha = v_corte),

  gente as (
    select sup from placas union select sup from tocaba union select sup from inmov
    union select sup from reent union select sup from ant union select sup from liq
    union select sup from refe union select sup from vis union select sup from term
    union select sup from pend union select sup from recol),

  filas as (
    select g.sup as id,
           coalesce(pr.nombre, case when g.sup is null then 'SIN SUPERVISOR' else '?' end) as nombre,
           pr.role as rol,
           (select count(*) from placas x where x.sup is not distinct from g.sup) as asig,
           (select count(*) from placas x where x.sup is not distinct from g.sup and x.en_calle) as calle,
           (select count(*) from placas x where x.sup is not distinct from g.sup and not x.en_calle) as guard,
           (select count(*) from tocaba x where x.sup is not distinct from g.sup) as base,
           (select count(*) from tocaba x where x.sup is not distinct from g.sup and x.estado = 'aldia') as comp,
           (select count(*) from tocaba x where x.sup is not distinct from g.sup and x.estado <> 'aldia' and x.pago) as parc,
           (select count(*) from tocaba x where x.sup is not distinct from g.sup and x.estado <> 'aldia' and not x.pago) as nop,
           (select count(*) from inmov x where x.sup is not distinct from g.sup) as inmov,
           (select count(*) from inmov x where x.sup is not distinct from g.sup
               and exists (select 1 from s where s.placa = x.placa and s.estado = 'retenida')) as siguen,
           (select count(*) from ant x where x.sup is not distinct from g.sup) as ant,
           (select count(*) from reent x where x.sup is not distinct from g.sup) as reent,
           case when v_en_curso then (select count(*) from pend x where x.sup is not distinct from g.sup) end as pend,
           (select count(*) from liq x where x.sup is not distinct from g.sup) as liq,
           (select count(*) from refe x where x.sup is not distinct from g.sup) as ref,
           (select count(*) from vis x where x.sup is not distinct from g.sup) as vis,
           (select count(*) from term x where x.sup is not distinct from g.sup) as term,
           -- Cómo cerró: lo que deben los que quedaron en mora, y los que ya estaban para recoger.
           (select coalesce(sum(x.debe_total), 0) from s x where x.cobrador_id is not distinct from g.sup and x.estado = 'mora') as plata,
           (select count(*) from s x where x.cobrador_id is not distinct from g.sup and x.para_recoger) as recoger,
           (select count(*) from recol x where x.sup is not distinct from g.sup) as rec_pas,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'recogida') as rec_rec,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'pago') as rec_pag,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'plazo') as rec_plazo,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'no') as rec_no,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'otro') as rec_otro,
           (select coalesce(sum(x.debe), 0) from recol x where x.sup is not distinct from g.sup and x.como = 'no') as rec_plata,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'no' and x.dias_mora <= 7) as rec_b1,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'no' and x.dias_mora between 8 and 14) as rec_b2,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'no' and x.dias_mora between 15 and 30) as rec_b3,
           (select count(*) from recol x where x.sup is not distinct from g.sup and x.como = 'no' and x.dias_mora > 30) as rec_b4
      from gente g left join public.profiles pr on pr.id = g.sup)

  select jsonb_build_object(
    'lunes', p_lunes, 'domingo', v_domingo, 'corte', v_corte,
    'completa', v_corte = v_domingo, 'en_curso', v_en_curso, 'meta', 90,
    'supervisores', coalesce((select jsonb_agg(to_jsonb(f) order by f.nombre) from filas f), '[]'::jsonb),
    'inmovilizadas', coalesce((select jsonb_agg(jsonb_build_object('fecha', x.fecha, 'placa', x.placa, 'sup', x.sup,
        'sigue', exists (select 1 from s where s.placa = x.placa and s.estado = 'retenida')) order by x.fecha, x.placa) from inmov x), '[]'::jsonb),
    'reentregas', coalesce((select jsonb_agg(jsonb_build_object('fecha', x.fecha, 'placa', x.placa, 'sup', x.sup,
        'debia', x.debe_antes, 'debe', x.debe_despues) order by x.fecha, x.placa) from reent x), '[]'::jsonb),
    'liquidaciones', coalesce((select jsonb_agg(jsonb_build_object('numero', x.numero, 'fecha', x.fecha, 'placa', x.placa, 'sup', x.sup)
        order by x.fecha, x.numero) from liq x), '[]'::jsonb),
    'referidos', coalesce((select jsonb_agg(jsonb_build_object('fecha', x.fecha, 'placa', x.placa, 'sup', x.sup)
        order by x.fecha, x.placa) from refe x), '[]'::jsonb),
    'no_recogidas', coalesce((select jsonb_agg(jsonb_build_object('placa', x.placa, 'sup', x.sup, 'dias_mora', x.dias_mora, 'debe', x.debe)
        order by x.sup, x.dias_mora desc, x.debe desc, x.placa) from recol x where x.como = 'no'), '[]'::jsonb)
  ) into v_r;

  return v_r;
end $$;

comment on function public.evaluacion_semana(date) is
  'La evaluación semanal de los supervisores (hoja CARTERA RESUMEN EVALUACIÓN), sacada de cartera_del_dia. Solo ADMIN_PRINCIPAL y ADMIN (D-093). Ver 224_evaluacion_semanal.sql.';

revoke all on function public.evaluacion_semanas() from public, anon;
revoke all on function public.evaluacion_semana(date) from public, anon;
grant execute on function public.evaluacion_semanas() to authenticated;
grant execute on function public.evaluacion_semana(date) to authenticated;

select public.registrar_migracion(224, '224_evaluacion_semanal.sql',
  'La evaluación semanal de los supervisores sacada de las fotos de cada noche; solo la ven ADMIN_PRINCIPAL y ADMIN (D-093)');

commit;

-- ─── VERIFICACIÓN — deben salir DOS filas: evaluacion_semana y evaluacion_semanas, las dos «security definer» ──
-- (Las cifras no se pueden mirar desde aquí: el editor no entra como administrador de la app, y la
-- función le contesta que no. Se revisan desde la app, con tu sesión.)
select p.proname as funcion, p.prosecdef as security_definer
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname in ('evaluacion_semana', 'evaluacion_semanas')
 order by 1;
