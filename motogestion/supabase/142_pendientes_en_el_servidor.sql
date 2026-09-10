-- 142 — LOS PENDIENTES VIVEN EN EL SERVIDOR (fase 2 de docs/FLUJO-DIARIO.md)
--
-- El problema: las 19 alertas se calculan EN EL NAVEGADOR (`useAlertas`). Se arman cuando alguien
-- abre la app y se borran al cerrarla. No se pueden asignar, no se sabe qué quedó sin hacer ayer,
-- Sergio no puede supervisar lo que no queda registrado, y NO PUEDE HABER NOTIFICACIONES: si el
-- cálculo solo ocurre cuando tú miras, nadie se entera de nada para avisarte.
--
-- 🔴 LO QUE **NO** SE HACE ACÁ, Y POR QUÉ:
-- No se guardan las alertas como filas. Son consecuencia de datos que cambian solos: guardar
-- "Nelson está en mora" obliga a acordarse de borrarlo cuando pague, y ahí nace un SEGUNDO lugar
-- donde vive la verdad — que es exactamente lo que ya costó caro en este proyecto (las dos cuentas
-- que no coincidían). Se separan dos cosas:
--   · Lo que se DEDUCE de los datos → se calcula, no se guarda. Siempre al día, imposible de
--     desincronizar. Es esta vista.
--   · Lo que NO se deduce (quién lo atendió, cuándo) → eso sí se guarda, y es poquito.
--     Es `pendientes_atendidos`.
--
-- SE REUSA LA CALCULADORA DE LA VITRINA. Las funciones `zala.*` ya son espejo verificado de
-- `cicloPago.ts` (prueba espejo: 322 contratos, cero diferencias). Reescribir la mora acá sería
-- crear una tercera versión de la misma cuenta.
--
-- SEGURIDAD — `security_invoker = true`: la vista se comporta como si la consultara la propia
-- persona, así que respeta las políticas RLS que YA existen sobre contratos, motos y pagos. El
-- SUBADMIN ve solo lo suyo sin que haya que escribir permisos nuevos (que serían un segundo sitio
-- que mantener sincronizado). Sin esto, una vista normal corre con los privilegios del dueño y
-- le mostraría TODA la cartera a cualquiera con sesión abierta.

-- ── 1) Lo único que no se puede deducir: quién lo atendió ────────────────────────────────────
-- Por DÍA a propósito: un pendiente atendido hoy vuelve a aparecer mañana si sigue vigente. Es la
-- misma idea del panel Hoy — "tarea hecha hoy" — y evita tener que adivinar cuándo caduca.
create table if not exists public.pendientes_atendidos (
  id uuid primary key default gen_random_uuid(),
  clave text not null,
  fecha date not null default (now() at time zone 'America/Bogota')::date,
  atendido_por uuid not null references public.profiles(id),
  nota text,
  created_at timestamptz not null default now(),
  unique (clave, fecha)
);

alter table public.pendientes_atendidos enable row level security;

drop policy if exists "Pendientes atendidos: los ve el staff" on public.pendientes_atendidos;
create policy "Pendientes atendidos: los ve el staff"
  on public.pendientes_atendidos for select to authenticated using (true);

drop policy if exists "Pendientes atendidos: cada quien firma lo suyo" on public.pendientes_atendidos;
create policy "Pendientes atendidos: cada quien firma lo suyo"
  on public.pendientes_atendidos for insert to authenticated
  with check (atendido_por = auth.uid());

-- ── 2) La vista: todo lo que hay que hacer hoy, con su dueño ─────────────────────────────────
-- `clave` es el identificador estable de cada pendiente (tipo + objeto). Es lo que se marca como
-- atendido y lo que, más adelante, sirve para no notificar dos veces lo mismo.
--
-- El DUEÑO se dice de dos formas, porque hay pendientes de una persona y pendientes de un puesto:
--   · `dueno_id`  → le toca a ESA persona (el encargado de la moto).
--   · `dueno_rol` → le toca a quien tenga ese rol (las transferencias son de la secretaria).
create or replace view public.pendientes with (security_invoker = true) as
with h as (select zala.hoy() as d),
cartera as (
  select
    c.id as contrato_id, c.cliente_id, c.moto_id, m.subadmin_id, m.placa,
    cl.nombre as cliente, q.r_estado_cartera as estado, coalesce(q.r_dias_mora, 0) as dias_mora,
    plazo.hasta as plazo_hasta, promesa.fecha as promesa_fecha
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
  cross join h
  left join public.convenios cv on cv.contrato_id = c.id and cv.estado = 'activo'
  left join lateral (
    select coalesce(sum(p.aplicado_convenio), 0) as abonado
    from public.pagos p
    where cv.id is not null and p.contrato_id = c.id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
  ) ab on true
  left join lateral (select max(plazo_extra_fecha_limite) as hasta from public.gestiones_cobro g
                      where g.contrato_id = c.id and g.tipo = 'plazo_extra') plazo on true
  left join lateral (select max(fecha_compromiso) as fecha from public.gestiones_cobro g
                      where g.contrato_id = c.id and g.fecha_compromiso is not null) promesa on true
  left join lateral zala.cuenta_contrato(c, cv, ab.abonado, h.d) q on true
  where c.estado = 'Activo'
)
-- Cobro: recolección, mora y gabela. Se cuenta por DÍAS VENCIDA (`dias_mora`), no por días desde el
-- último pago — regla del dueño del 9-sep, ver `bucket-recoleccion-cuenta-dias-equivocados`.
select
  'recoleccion:' || contrato_id                     as clave,
  'recoleccion'                                     as tipo,
  'Recolección — ' || cliente                       as titulo,
  'Lleva ' || dias_mora || ' días con la cuota vencida. Se agotaron los plazos.' as detalle,
  'critico'                                         as nivel,
  subadmin_id                                       as dueno_id,
  null::text                                        as dueno_rol,
  contrato_id, moto_id, cliente_id, placa,
  dias_mora                                         as dias,
  1                                                 as orden
from cartera
where estado = 'mora' and dias_mora > 3 and not (plazo_hasta is not null and plazo_hasta >= (select d from h))

union all
select 'mora:' || contrato_id, 'mora', 'En mora — ' || cliente,
  'Su cuota lleva ' || dias_mora || ' día' || case when dias_mora = 1 then '' else 's' end || ' de vencida.',
  'alerta', subadmin_id, null, contrato_id, moto_id, cliente_id, placa, dias_mora, 2
from cartera
where estado = 'mora' and not (dias_mora > 3 and not (plazo_hasta is not null and plazo_hasta >= (select d from h)))

union all
select 'gabela:' || contrato_id, 'gabela', 'Día de gracia — ' || cliente,
  'Su pago venció ayer. Hoy es el último día antes de entrar en mora.',
  'info', subadmin_id, null, contrato_id, moto_id, cliente_id, placa, 0, 3
from cartera where estado = 'gabela'

union all
select 'plazo_vencido:' || contrato_id, 'plazo_vencido', 'Plazo vencido — ' || cliente,
  'El plazo que le dieron venció el ' || to_char(plazo_hasta, 'DD/MM') || '. Verificar si pagó.',
  'alerta', subadmin_id, null, contrato_id, moto_id, cliente_id, placa,
  (select d from h) - plazo_hasta, 2
from cartera where plazo_hasta is not null and plazo_hasta < (select d from h) and estado <> 'al-dia'

union all
select 'promesa_vencida:' || contrato_id, 'promesa_vencida', 'Promesa incumplida — ' || cliente,
  'Prometió pagar el ' || to_char(promesa_fecha, 'DD/MM') || ' y no lo hizo.',
  'alerta', subadmin_id, null, contrato_id, moto_id, cliente_id, placa,
  (select d from h) - promesa_fecha, 2
from cartera where promesa_fecha is not null and promesa_fecha < (select d from h) and estado <> 'al-dia'

-- Papeles de la moto. 30 días de aviso, igual que hoy.
union all
select 'soat:' || m.id, 'soat_vence',
  'SOAT por vencer — ' || m.placa,
  case when m.fecha_seguro < (select d from h) then 'Está VENCIDO desde el ' || to_char(m.fecha_seguro, 'DD/MM')
       else 'Vence el ' || to_char(m.fecha_seguro, 'DD/MM') end,
  case when m.fecha_seguro < (select d from h) then 'critico' else 'alerta' end,
  m.subadmin_id, null, null, m.id, null, m.placa,
  (m.fecha_seguro - (select d from h)), 4
from public.motos m
where m.fecha_seguro is not null and m.fecha_seguro <= (select d from h) + 30

union all
select 'tecno:' || m.id, 'tecno_vence',
  'Tecnomecánica por vencer — ' || m.placa,
  case when m.fecha_tecnomecanica < (select d from h) then 'Está VENCIDA desde el ' || to_char(m.fecha_tecnomecanica, 'DD/MM')
       else 'Vence el ' || to_char(m.fecha_tecnomecanica, 'DD/MM') end,
  case when m.fecha_tecnomecanica < (select d from h) then 'critico' else 'alerta' end,
  m.subadmin_id, null, null, m.id, null, m.placa,
  (m.fecha_tecnomecanica - (select d from h)), 4
from public.motos m
where m.fecha_tecnomecanica is not null and m.fecha_tecnomecanica <= (select d from h) + 30

-- Moto parada en el taller: cada día ahí es un día sin producir.
union all
select 'taller:' || t.moto_id, 'taller_demorado',
  'Lleva días en el taller — ' || m.placa,
  'Entró el ' || to_char(t.fecha_ingreso, 'DD/MM') || '. ' || coalesce(t.detalle, 'Sin detalle.'),
  'alerta', m.subadmin_id, null, null, t.moto_id, null, m.placa,
  (select d from h) - t.fecha_ingreso, 5
from (select distinct on (moto_id) moto_id, fecha_ingreso, detalle from public.taller
       where estado_tecnico <> 'Finalizado' order by moto_id, created_at desc) t
join public.motos m on m.id = t.moto_id
where t.fecha_ingreso is not null and t.fecha_ingreso < (select d from h) - 7

-- Plata detenida esperando que la secretaria diga sí o no. Es de un PUESTO, no de una persona.
union all
select 'transferencia:' || p.id, 'transferencia_pendiente',
  'Pago por confirmar — ' || cl.nombre,
  'Hay un pago de ' || zala.pesos(p.valor) || ' esperando confirmación desde el ' || to_char(p.fecha, 'DD/MM') || '.',
  'alerta', null, 'SECRETARIA', p.contrato_id, c.moto_id, c.cliente_id, m.placa,
  (select d from h) - p.fecha, 2
from public.pagos p
join public.contratos c on c.id = p.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where p.estado = 'Pendiente';

comment on view public.pendientes is
  'Todo lo que hay que hacer hoy, calculado en el servidor. NO guarda alertas: las deduce de los datos, así no se puede desincronizar. Lo atendido se marca en pendientes_atendidos. Ver docs/FLUJO-DIARIO.md.';

-- ═══ VERIFICACIÓN ═══
-- a) Cuántos pendientes hay de cada tipo. Comparar con la campana de la app: deben coincidir.
select tipo, nivel, count(*) from public.pendientes group by tipo, nivel order by count(*) desc;

-- b) Cuántos tiene cada encargado (los de rol salen con dueño vacío).
select coalesce(p.nombre, '(le toca a ' || coalesce(pe.dueno_rol, 'nadie asignado') || ')') as dueno,
       count(*) as pendientes
  from public.pendientes pe
  left join public.profiles p on p.id = pe.dueno_id
 group by 1 order by 2 desc;
