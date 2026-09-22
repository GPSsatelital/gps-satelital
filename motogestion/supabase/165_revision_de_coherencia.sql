-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 165 — LA REVISIÓN DE COHERENCIA CORRE SOLA (22-sep-2026)
--
-- El 19-sep se corrieron a mano diez chequeos sobre toda la flota. Encontraron TRES problemas
-- reales de plata (ADOLFO, YERLIS, CESAR/RAMON) que nadie habría visto solo. Desde entonces
-- dependen de que alguien se acuerde de correrlos — y nadie se va a acordar.
--
-- Acá pasan a ser cinco avisos más de `public.pendientes`, con dueño ADMIN y nivel crítico:
-- es plata mal contada, no una tarea de cobro.
--
-- 🔴 LAS FÓRMULAS ESTÁN MEDIDAS, NO DEDUCIDAS (22-sep, contra los 2.938 pagos confirmados).
-- La del reparto me dio 265 falsas alarmas en el primer intento y 142 en el segundo. Un aviso
-- que grita en falso 265 veces no lo vuelve a mirar nadie: sería peor que no tenerlo. Las tres
-- trampas, escritas acá para que nadie las vuelva a pisar:
--   1. Hay OCHO columnas de reparto, no cuatro. La que más pesa es `aplicado_prorrateo`: un pago
--      de prorrateo tiene `aplicado_tarifa = 0` y su plata vive ahí.
--   2. `aplicado_multa` y `aplicado_lavada` van DENTRO de `aplicado_deuda` — sumarlas aparte las
--      cuenta dos veces.
--   3. En un movimiento `tipo_registro = 'saldo_favor'` la plata va AL REVÉS:
--      `aplicado_saldo_favor` viene NEGATIVO (el saldo se gasta, no entra) y `valor` solo repite
--      ese monto. En un pago normal ese mismo campo es POSITIVO (el sobrante que queda guardado).
-- Con la fórmula buena: 0 descuadres de 2.938. Detalle en la memoria `bateria-coherencia-formulas`.
--
-- 🔴 Y DOS FALSOS POSITIVOS DEL 19-SEP QUE NO SE REPITEN ACÁ:
--   · El candado de convenios es por CONTRATO, no por placa. Agrupar por placa da dobles que no
--     lo son (XZP35H tiene dos contratos, cada uno con su acuerdo).
--   · Los contratos Diario llevan el ahorro FUERA de la tarifa; en motor v2 va DENTRO.
--
-- 🔑 SE PARCHA LA VISTA VIVA, NO SE REGENERA (lección mig 124): se lee con `pg_get_viewdef` y se
-- le añaden las ramas al final. Aborta sola si ya estaba aplicada.
--
-- ── EL POSPONER (decisión del dueño, 22-sep) ────────────────────────────────────────────────
-- Un aviso se marca "atendido" solo por HOY (`pendientes_atendidos` es unique(clave, fecha)):
-- mañana vuelve. De los 3 casos que hay hoy, DOS los mandó a dormir el dueño ("CESAR y RAMON,
-- dejalos quietos"), así que tal cual se los pondría en la cara todos los días. Y el ruido es
-- exactamente lo que hizo que 431 avisos taparan 20 SOAT vencidos.
-- Por eso: se puede posponer un aviso hasta una fecha, con motivo escrito.
--
-- DÓNDE VIVE EL FILTRO: en una vista NUEVA, `public.pendientes_activos`. NO se mete dentro de
-- `public.pendientes` a propósito — esa vista se parcha leyéndola con `pg_get_viewdef` y
-- agregándole ramas al final; si la envolviéramos, la próxima migración que le agregue un aviso
-- le apendería la rama DESPUÉS del filtro y lo rompería en silencio.
-- "Atendido hoy" NO se filtra acá: la pantalla lo muestra en gris, que es otra cosa.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── 1) Posponer: hasta cuándo y por qué ─────────────────────────────────────────────────────
alter table public.pendientes_atendidos
  add column if not exists posponer_hasta  date,
  add column if not exists posponer_motivo text;

comment on column public.pendientes_atendidos.posponer_hasta is
  'Hasta qué día NO mostrar este aviso. null = solo se atendió hoy y mañana vuelve. Se usa para lo que ya se sabe y no depende de nosotros (un cliente al que hay que citar, por ejemplo).';
comment on column public.pendientes_atendidos.posponer_motivo is
  'Por qué se pospuso. Obligatorio por pantalla: un aviso que se silencia sin explicación es un aviso perdido.';

-- ── 2) Las 5 ramas nuevas ───────────────────────────────────────────────────────────────────
do $mig$
declare
  v_def  text;
  v_rama text;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('reparto_descuadrado' in v_def) > 0 then
    raise notice '165: ya estaba aplicada. No se tocó nada.';
    return;
  end if;

  -- Sanidad: si las ramas de las migs 158/159 no están, esta vista no es la que creemos.
  if position('acuerdo_sin_pagos' in v_def) = 0 or position('acuerdo_incumplido' in v_def) = 0 then
    raise exception '165 ABORTADA: faltan las ramas de las migs 158/159. Correrlas primero.';
  end if;

  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  v_rama := $rama$
union all
-- ① EL REPARTO DE UN PAGO NO SUMA LO QUE ENTRÓ ───────────────────────────────────────────────
select
  'reparto:' || p.id,
  'reparto_descuadrado',
  'Pago mal repartido — ' || cl.nombre,
  'El pago de $' || replace(to_char(p.valor, 'FM999,999,999'), ',', '.')
    || ' del ' || to_char(p.fecha, 'DD/MM/YYYY') || ' reparte $'
    || replace(to_char(r.sale, 'FM999,999,999'), ',', '.')
    || '. ' || (case when r.entra > r.sale then 'Sobran $' else 'Faltan $' end)
    || replace(to_char(abs(r.entra - r.sale), 'FM999,999,999'), ',', '.')
    || ' sin destino. Revisar antes de cobrarle otra vez.',
  'critico',
  null::uuid,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  0::int,
  1,
  abs(r.entra - r.sale)::numeric
from public.pagos p
join public.contratos c  on c.id  = p.contrato_id
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
cross join lateral (
  select
    -- Saldo a favor: la plata SALE del saldo (viene negativa) y `valor` solo la repite.
    (case when p.tipo_registro = 'saldo_favor'
          then -coalesce(p.aplicado_saldo_favor, 0)
          else p.valor end) as entra,
    -- Multa y lavada NO se suman: ya van dentro de `aplicado_deuda`.
    coalesce(p.aplicado_tarifa, 0) + coalesce(p.aplicado_prorrateo, 0)
      + coalesce(p.aplicado_deuda, 0) + coalesce(p.aplicado_convenio, 0)
      + coalesce(p.aplicado_base_inicial, 0)
      -- En motor v2 el ahorro va DENTRO de la tarifa; en Diario va aparte.
      + (case when coalesce(c.total_cajas, 0) > 0 then 0 else coalesce(p.aplicado_ahorro, 0) end)
      + (case when p.tipo_registro = 'saldo_favor' then 0 else coalesce(p.aplicado_saldo_favor, 0) end)
      as sale
) r
where p.estado = 'Confirmado'
  and abs(r.entra - r.sale) > 1

union all
-- ② LA LISTA DEL ACUERDO NO SUMA SU TOTAL ────────────────────────────────────────────────────
select
  'acuerdo_lista:' || cv.id,
  'acuerdo_lista_no_cuadra',
  'La lista del acuerdo no cuadra — ' || cl.nombre,
  'El acuerdo es de $' || replace(to_char(cv.deuda_total, 'FM999,999,999'), ',', '.')
    || ' pero su lista suma $' || replace(to_char(s.suma, 'FM999,999,999'), ',', '.')
    || '. Se le está cobrando una cifra que sus renglones no explican.',
  'critico',
  null::uuid,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  0::int,
  1,
  abs(s.suma - cv.deuda_total)::numeric
from public.convenios cv
join public.contratos c  on c.id  = cv.contrato_id
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
cross join lateral (
  select coalesce((select sum((r ->> 'monto')::numeric)
                     from jsonb_array_elements(cv.partitura) r), 0) as suma
) s
where cv.estado in ('activo', 'incumplido')
  and jsonb_typeof(cv.partitura) = 'array'
  and jsonb_array_length(cv.partitura) > 0
  and abs(s.suma - cv.deuda_total) > 1

union all
-- ③ CAJAS IMPOSIBLES ─────────────────────────────────────────────────────────────────────────
select
  'cajas:' || c.id,
  'cajas_imposibles',
  'Semanas imposibles — ' || cl.nombre,
  'Su contrato es de ' || c.total_cajas || ' semanas pero figura con '
    || greatest(coalesce(c.cajas_previas, 0), coalesce(c.cajas_pagadas, 0))
    || '. El libro no puede cerrar así: hay que reconstruirle la cuenta.',
  'critico',
  null::uuid,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  0::int,
  1,
  0::numeric
from public.contratos c
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
where coalesce(c.total_cajas, 0) > 0
  and c.estado in ('Activo', 'Suspendido')
  and (coalesce(c.cajas_pagadas, 0) > c.total_cajas
    or coalesce(c.cajas_previas, 0) > c.total_cajas
    or coalesce(c.cajas_pagadas, 0) < 0
    or coalesce(c.cajas_previas, 0) < 0)

union all
-- ④ SALDO A FAVOR EN NEGATIVO ────────────────────────────────────────────────────────────────
select
  'saldo_neg:' || c.id,
  'saldo_negativo',
  'Saldo a favor en rojo — ' || cl.nombre,
  'Su saldo a favor figura en -$'
    || replace(to_char(abs(c.saldo_favor_apertura), 'FM999,999,999'), ',', '.')
    || '. Un saldo a favor nunca puede ser negativo.',
  'critico',
  null::uuid,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  0::int,
  1,
  abs(c.saldo_favor_apertura)::numeric
from public.contratos c
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
where coalesce(c.saldo_favor_apertura, 0) < 0

union all
-- ⑤ DOS CONTRATOS ACTIVOS SOBRE LA MISMA MOTO ────────────────────────────────────────────────
-- Se agrupa por MOTO, no por placa: son lo mismo acá, pero el falso positivo del 19-sep vino de
-- agrupar convenios por placa cuando su candado es por contrato. Dejarlo dicho evita repetirlo.
select
  'moto_2contratos:' || c.moto_id,
  'moto_con_dos_contratos',
  'Dos contratos sobre la misma moto — ' || m.placa,
  'La ' || m.placa || ' figura con ' || d.cuantos
    || ' contratos activos a la vez. Uno de los dos está mal: su plata y su mora se están '
    || 'contando por separado sobre la misma moto.',
  'critico',
  m.subadmin_id,
  (case when m.subadmin_id is null then 'ADMIN' end)::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  0::int,
  1,
  0::numeric
from public.contratos c
join public.motos m on m.id = c.moto_id
cross join lateral (
  select count(*) as cuantos from public.contratos c2
   where c2.moto_id = c.moto_id and c2.estado = 'Activo'
) d
where c.estado = 'Activo'
  and d.cuantos > 1
  -- Una sola fila por moto: la del contrato más viejo.
  and c.id = (select c3.id from public.contratos c3
               where c3.moto_id = c.moto_id and c3.estado = 'Activo'
               order by c3.created_at limit 1)
$rama$;

  execute 'create or replace view public.pendientes with (security_invoker = true) as '
          || v_def || v_rama;
  raise notice '165: los 5 avisos de coherencia quedaron agregados.';
end
$mig$;

-- ── 3) La lista que de verdad se muestra: sin lo pospuesto ──────────────────────────────────
create or replace view public.pendientes_activos with (security_invoker = true) as
select p.*
from public.pendientes p
where not exists (
  select 1 from public.pendientes_atendidos pa
   where pa.clave = p.clave
     and pa.posponer_hasta is not null
     and pa.posponer_hasta >= (now() at time zone 'America/Bogota')::date
);

comment on view public.pendientes_activos is
  'Lo mismo que public.pendientes pero SIN los avisos pospuestos a una fecha futura. Es la que deben leer la pantalla y los avisos al celular. `pendientes` se deja cruda a propósito: se le agregan ramas leyéndola con pg_get_viewdef, y envolverla rompería el próximo parche en silencio.';

grant select on public.pendientes_activos to authenticated;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from public.pendientes where tipo = 'reparto_descuadrado')     as reparto_mal,
  (select count(*) from public.pendientes where tipo = 'acuerdo_lista_no_cuadra') as listas_mal,
  (select count(*) from public.pendientes where tipo = 'cajas_imposibles')        as cajas_mal,
  (select count(*) from public.pendientes where tipo = 'saldo_negativo')          as saldos_mal,
  (select count(*) from public.pendientes where tipo = 'moto_con_dos_contratos')  as motos_dobles,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)                  as claves_duplicadas,
  (select count(*) from public.pendientes
    where dueno_id is null and dueno_rol is null)                                 as sin_dueno,
  (select count(*) from public.pendientes)                                        as total_avisos,
  (select count(*) from public.pendientes_activos)                                as total_sin_pospuestos;
-- Esperado el 22-sep: reparto_mal = 0 · listas_mal = 0 · cajas_mal = 3 · saldos_mal = 0 ·
--                     motos_dobles = 0 · claves_duplicadas = 0 · sin_dueno = 0

-- Los 3 de cajas, para leerlos como los va a ver el dueño.
select titulo, detalle from public.pendientes where tipo = 'cajas_imposibles';
