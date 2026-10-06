-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 190 — EL CUADERNO DE LA CARTERA: cada noche se anota cuánto se debía ese día (6-oct-2026,
--       dueño: "La cartera en una fecha pasada", "Las dos", "Sí, empieza por el paso 1")
--
-- EL PROBLEMA: Reportes → Cobranza → Cartera solo sabe decir cómo está la cartera HOY. La app nunca
-- guardó cómo quedaba cada noche, así que "¿cuánto se debía el 30 de septiembre?" no tiene respuesta.
-- Es como la caja sin cuaderno: si nadie anotó cuánto había cada noche, después toca sacar la cuenta
-- hacia atrás.
--
-- QUÉ HACE:
--   1. La tabla `cartera_del_dia`: una fila por contrato y por día, con lo que debía (cuotas, acuerdo,
--      deudas), su plata a favor y cómo iba (al día, gabela, mora, taller, retenida, en liquidación).
--   2. `anotar_cartera_del_dia()`: copia esas cifras de `zala.cliente`, que es la MISMA cuenta de la
--      pantalla (`loQueDebe()`), probada peso por peso por la prueba espejo. No hay cuenta nueva.
--      Clasifica igual que Reportes (ReportesView, D-033/D-034): en liquidación > retenida > taller >
--      mora > gabela > al día. Solo entran los contratos con moto, como en Reportes.
--   3. El reloj: todas las noches a las 11:55 p.m. de Colombia (04:55 UTC).
--   4. Anota HOY mismo, para que el cuaderno no arranque vacío, y se revisa contra la cuenta en vivo.
--   Quién lo lee: los mismos que pueden ver ese contrato (la regla de `contratos` decide; si mañana
--   cambia quién ve qué contrato, esto la sigue sola). Nadie lo escribe desde la app.
--   No toca ninguna cifra, pago, deuda ni contrato. ZALA no lo lee.
--
-- LO QUE NO SABE (dicho en la pantalla):
--   · Anota lo que la app sabía esa noche: un pago del 30 confirmado el 1 sale como no pagado el 30.
--   · Los contratos Diario no se anotan con cifra (hoy es 1, ADOLFO GAMEZ): la base no les lleva la
--     cuenta, igual que en ZALA. Quedan con estado 'sin-cuenta'.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   select cron.unschedule('cartera-cada-noche');
--   drop function if exists public.cartera_fechas();
--   drop function if exists public.anotar_cartera_del_dia();
--   drop table if exists public.cartera_del_dia;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.cartera_del_dia (
  fecha            date        not null,
  contrato_id      uuid        not null,
  cliente_id       uuid,
  cliente          text,
  placa            text,
  grupo            text,
  cobrador_id      uuid,
  cobrador         text,
  forma_pago       text,
  contrato_estado  text,
  moto_estado      text,
  -- aldia | gabela | mora | taller | retenida | reasignada (en liquidación) | sin-cuenta (Diario)
  estado           text        not null,
  debe_cuotas      numeric,
  debe_acuerdo     numeric,
  debe_deudas      numeric,
  debe_total       numeric,
  saldo_a_favor    numeric,
  dias_mora        int         not null default 0,
  para_recoger     boolean     not null default false,
  con_plazo        boolean     not null default false,
  paga_ese_dia     boolean     not null default false,
  -- 'anotada' = la copió el reloj esa noche · 'calculada_despues' = cuenta hacia atrás (paso 2)
  como             text        not null default 'anotada' check (como in ('anotada', 'calculada_despues')),
  anotada_el       timestamptz not null default now(),
  primary key (fecha, contrato_id)
);

comment on table public.cartera_del_dia is
  'El cuaderno de la cartera: lo que debía cada contrato al final de cada día, copiado de zala.cliente. Lo llena el reloj cartera-cada-noche. Ver 190_cartera_del_dia.sql.';

alter table public.cartera_del_dia enable row level security;
drop policy if exists cartera_del_dia_lee on public.cartera_del_dia;
create policy cartera_del_dia_lee on public.cartera_del_dia
  for select to authenticated
  using (exists (select 1 from public.contratos c where c.id = cartera_del_dia.contrato_id));

-- ── Anotar el día ───────────────────────────────────────────────────────────────────────────
create or replace function public.anotar_cartera_del_dia()
returns int language plpgsql security definer set search_path = public as $$
declare
  v_dia date := zala.hoy();
  v_n int;
begin
  delete from public.cartera_del_dia where fecha = v_dia;   -- repetible: vuelve a anotar el día

  insert into public.cartera_del_dia (
    fecha, contrato_id, cliente_id, cliente, placa, grupo, cobrador_id, cobrador, forma_pago,
    contrato_estado, moto_estado, estado, debe_cuotas, debe_acuerdo, debe_deudas, debe_total,
    saldo_a_favor, dias_mora, para_recoger, con_plazo, paga_ese_dia, como)
  select
    v_dia, c.id, c.cliente_id, z.cliente, m.placa, coalesce(port.grupo, 'SIN GRUPO'), port.subadmin_id, enc.nombre, c.forma_pago,
    c.estado, m.estado,
    case
      when c.estado = 'Suspendido' and exists (select 1 from public.contratos o
                                                where o.moto_id = c.moto_id and o.estado = 'Activo' and o.id <> c.id) then 'reasignada'
      when c.estado = 'Suspendido' or m.estado = 'Recuperada' then 'retenida'
      when m.estado in ('Mantenimiento', 'Fiscalia', 'Transito', 'Garantia') then 'taller'
      when z.estado_cartera is null then 'sin-cuenta'
      when z.estado_cartera = 'mora' then 'mora'
      when z.estado_cartera = 'gabela' then 'gabela'
      else 'aldia' end,
    z.cuota_falta, z.acuerdo_falta, z.deudas_falta, z.debe_hoy, z.saldo_a_favor,
    case when z.estado_cartera = 'mora' then coalesce(z.dias_mora, 0) else 0 end,
    (c.estado = 'Activo' and z.balde_hoy = 'recoleccion'),
    coalesce(z.plazo_extra_vigente, false),
    coalesce(z.paga_hoy, false),
    'anotada'
  from zala.cliente z
  join public.contratos c on c.id = z.contrato_id
  join public.motos m on m.id = c.moto_id
  -- Grupo y cobrador salen de la moto del PORTAFOLIO (la suya, aunque ande en una prestada),
  -- igual que en Reportes (`motoDelPortafolio`).
  left join lateral (select pr.moto_original_id from public.prestamos_reemplazo pr
                      where pr.contrato_id = c.id and pr.estado = 'activo'
                      order by pr.created_at desc limit 1) pr on true
  left join public.motos orig on orig.id = pr.moto_original_id
  left join lateral (select coalesce(orig.grupo, m.grupo) as grupo,
                            coalesce(orig.subadmin_id, m.subadmin_id) as subadmin_id) port on true
  left join public.profiles enc on enc.id = port.subadmin_id;

  get diagnostics v_n = row_count;
  return v_n;
end $$;

comment on function public.anotar_cartera_del_dia() is
  'Anota en cartera_del_dia lo que debe cada contrato hoy (zala.cliente). La corre el reloj cartera-cada-noche a las 11:55 p.m. de Colombia.';

revoke all on function public.anotar_cartera_del_dia() from public, anon, authenticated;

-- ── Los días que hay anotados (para el selector de la pantalla) ─────────────────────────────
-- Corre con los permisos de quien pregunta: cada uno ve los días de los contratos que puede ver.
create or replace function public.cartera_fechas()
returns table (fecha date, como text, contratos int, anotada_el timestamptz)
language sql stable security invoker set search_path = public as $$
  select d.fecha, min(d.como), count(*)::int, max(d.anotada_el)
    from public.cartera_del_dia d
   group by d.fecha
   order by d.fecha desc
$$;

revoke all on function public.cartera_fechas() from public, anon;
grant execute on function public.cartera_fechas() to authenticated;

-- ── Anotar HOY, y revisarlo contra la cuenta en vivo antes de guardar ───────────────────────
do $fix$
declare
  v_n int; v_anotado numeric; v_vivo numeric; v_vivos int;
begin
  v_n := public.anotar_cartera_del_dia();

  select coalesce(sum(debe_total), 0) into v_anotado from public.cartera_del_dia where fecha = zala.hoy();
  select coalesce(sum(z.debe_hoy), 0), count(*) into v_vivo, v_vivos
    from zala.cliente z join public.contratos c on c.id = z.contrato_id join public.motos m on m.id = c.moto_id;

  if v_n = 0 or v_n <> v_vivos or v_anotado <> v_vivo then
    raise exception '190 ABORTADA: lo anotado (% contratos, $%) no cuadra con la cuenta en vivo (% contratos, $%). NO se guardó nada.',
      v_n, v_anotado, v_vivos, v_vivo;
  end if;

  raise notice 'LISTO: anotados % contratos; deben $% entre todos, igual que la cuenta en vivo.', v_n, v_anotado;
end
$fix$;

select public.registrar_migracion(190, '190_cartera_del_dia.sql',
  'El cuaderno de la cartera: cada noche se anota cuánto debía cada contrato, para ver la cartera de un día pasado');

commit;

-- ── El reloj: 11:55 p.m. de Colombia = 04:55 UTC (el reloj de Postgres anda en UTC) ─────────
-- Va fuera de la transacción: si ya existía, se quita primero para no dejar dos sonando.
select cron.unschedule('cartera-cada-noche') where exists (select 1 from cron.job where jobname = 'cartera-cada-noche');
select cron.schedule('cartera-cada-noche', '55 4 * * *', $$select public.anotar_cartera_del_dia()$$);

-- ─── VERIFICACIÓN — debe salir UNA fila: cartera-cada-noche · 55 4 * * * · true · y los contratos anotados hoy ──
select j.jobname as reloj, j.schedule as hora_utc, j.active as prendido,
       (select count(*) from public.cartera_del_dia where fecha = zala.hoy()) as anotados_hoy,
       (select sum(debe_total) from public.cartera_del_dia where fecha = zala.hoy()) as deben_hoy
  from cron.job j where j.jobname = 'cartera-cada-noche';
