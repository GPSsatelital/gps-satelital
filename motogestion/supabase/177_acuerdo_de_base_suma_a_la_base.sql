-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 177 — LO QUE SE PAGA DEL ACUERDO DE BASE QUEDA ANOTADO COMO BASE (D-023, tercera cara · 26-sep-2026)
--
-- 🔴 EL PROBLEMA, MEDIDO EL 26-SEP. Quien entra sin completar su base firma un acuerdo "Base inicial
-- incompleta al crear el contrato". Lo que paga de ese acuerdo SÍ entra a la caja y SÍ descuenta el
-- acuerdo, pero NO queda anotado como base: `contratos.ahorro_apertura` ("lo que puso de su base")
-- se quedaba con lo que dio el día que entró. ANYULIS PERTUZ puso $85.000 + pagó $223.000 de su
-- acuerdo = $308.000 de base, y el sistema decía $85.000. Si se retiraba, se le devolvía $85.000.
-- 35 clientes, $3.671.000, y creciendo con cada pago (el 24-sep eran $3.528.000).
--
-- LA REGLA DEL DUEÑO (D-023): la base es la alcancía del cliente — suya si se va antes, paga la moto
-- si termina. Confirmado el 26-sep: "lo que pagan del acuerdo de base va a la base".
--
-- LO QUE HACE:
--   1. `public.sumar_pago_de_base()`: disparador en `pagos`. Cada vez que cambia lo que un pago
--      confirmado le aporta al acuerdo de base (se confirma, se rechaza, se borra, o el motor le
--      asigna su reparto), sube o baja `ahorro_apertura` en lo que corresponde. Si el acuerdo
--      incluía la primera semana (lo que pasa del piso $308.000 / $305.000 en tarifa vieja), lo
--      pagado cubre PRIMERO la semana (tarifa primero) y solo el resto es base.
--      No toca el motor de reparto: solo lee lo que el motor ya repartió.
--   2. Una sola vez: les suma a los 35 lo que ya habían pagado de su acuerdo de base.
--
-- 🔒 LÍMITE A PROPÓSITO: solo actúa si el contrato tiene UN ÚNICO acuerdo y es el de base (hoy los
-- 63 contratos con acuerdo de base cumplen). Con otro acuerdo al lado no se sabría a cuál fue cada
-- pago; ese caso no suma solo y se revisa a mano.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--     drop trigger if exists trg_sumar_pago_de_base on public.pagos;
--     drop function if exists public.sumar_pago_de_base();
--     drop function if exists public.base_pagada_en_acuerdo(numeric, numeric, numeric);
--   y restar a cada contrato lo que se le sumó (la foto 'antes-177' tiene su ahorro_apertura previo).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-177') as contratos_fotografiados;

begin;

-- Cuánto de lo abonado a un acuerdo de base es BASE: primero se cubre la semana que traía (si traía),
-- y lo demás es base, nunca más que la parte de base del acuerdo.
create or replace function public.base_pagada_en_acuerdo(p_abonado numeric, p_deuda_total numeric, p_piso numeric)
returns numeric language sql immutable as $$
  select least(greatest(coalesce(p_abonado, 0) - (p_deuda_total - least(p_deuda_total, p_piso)), 0),
               least(p_deuda_total, p_piso))
$$;

create or replace function public.sumar_pago_de_base()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_contrato uuid := coalesce(new.contrato_id, old.contrato_id);
  v_creado timestamptz := coalesce(new.created_at, old.created_at);
  v_antes_aporte numeric := 0; v_ahora_aporte numeric := 0;
  v_cv record; v_otros int; v_abonado_ahora numeric; v_abonado_antes numeric;
  v_valor_semanal numeric; v_piso numeric; v_delta numeric;
begin
  if tg_op <> 'INSERT' and old.estado = 'Confirmado' then v_antes_aporte := coalesce(old.aplicado_convenio, 0); end if;
  if tg_op <> 'DELETE' and new.estado = 'Confirmado' then v_ahora_aporte := coalesce(new.aplicado_convenio, 0); end if;
  if v_antes_aporte = v_ahora_aporte then return null; end if;

  select id, deuda_total, created_at into v_cv
    from public.convenios where contrato_id = v_contrato and concepto = 'Base inicial incompleta al crear el contrato';
  if v_cv.id is null then return null; end if;
  select count(*) into v_otros from public.convenios where contrato_id = v_contrato and id <> v_cv.id;
  if v_otros > 0 then return null; end if;              -- con otro acuerdo al lado no se sabe a cuál fue
  if v_creado < v_cv.created_at then return null; end if; -- pago anterior al acuerdo: no es de él

  select coalesce(sum(aplicado_convenio), 0) into v_abonado_ahora
    from public.pagos where contrato_id = v_contrato and estado = 'Confirmado' and created_at >= v_cv.created_at;
  v_abonado_antes := v_abonado_ahora - v_ahora_aporte + v_antes_aporte;

  select valor_semanal into v_valor_semanal from public.contratos where id = v_contrato;
  v_piso := case when coalesce(v_valor_semanal, 0) > 0 and v_valor_semanal < 202000 then 305000 else 308000 end;
  v_delta := public.base_pagada_en_acuerdo(v_abonado_ahora, v_cv.deuda_total, v_piso)
           - public.base_pagada_en_acuerdo(v_abonado_antes, v_cv.deuda_total, v_piso);
  if v_delta <> 0 then
    update public.contratos set ahorro_apertura = coalesce(ahorro_apertura, 0) + v_delta where id = v_contrato;
  end if;
  return null;
end $$;

drop trigger if exists trg_sumar_pago_de_base on public.pagos;
create trigger trg_sumar_pago_de_base
  after insert or update of estado, aplicado_convenio or delete on public.pagos
  for each row execute function public.sumar_pago_de_base();

-- Una sola vez: lo que ya habían pagado de su acuerdo de base.
do $fix$
declare n int; v_total numeric;
begin
  with base as (
    select cv.contrato_id, cv.deuda_total, cv.created_at,
           case when coalesce(c.valor_semanal, 0) > 0 and c.valor_semanal < 202000 then 305000 else 308000 end as piso
      from public.convenios cv join public.contratos c on c.id = cv.contrato_id
     where cv.concepto = 'Base inicial incompleta al crear el contrato'
       and not exists (select 1 from public.convenios o where o.contrato_id = cv.contrato_id and o.id <> cv.id)
  ), suma as (
    select b.contrato_id,
           public.base_pagada_en_acuerdo(
             (select coalesce(sum(p.aplicado_convenio), 0) from public.pagos p
               where p.contrato_id = b.contrato_id and p.estado = 'Confirmado' and p.created_at >= b.created_at),
             b.deuda_total, b.piso) as base_pagada
      from base b
  ), hecho as (
    update public.contratos c set ahorro_apertura = coalesce(c.ahorro_apertura, 0) + s.base_pagada
      from suma s where s.contrato_id = c.id and s.base_pagada > 0
    returning s.base_pagada
  )
  select count(*), coalesce(sum(base_pagada), 0) into n, v_total from hecho;
  if n <> 35 or v_total <> 3671000 then
    raise exception 'Se esperaban 35 clientes y $3.671.000; salieron % clientes y $%. No se tocó nada.', n, v_total;
  end if;
  raise notice 'LISTO: % clientes, $% sumados a su base.', n, v_total;
end
$fix$;

select public.registrar_migracion(177, '177_acuerdo_de_base_suma_a_la_base.sql',
  'D-023: lo pagado del acuerdo de base suma a ahorro_apertura (35 clientes, $3.671.000) + disparador para lo que venga');

commit;

select public.tomar_foto_plata('despues-177');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- Solo cambió el ahorro de base, en 35 contratos, por $3.671.000 en total. Nada más.
select que_cambio, count(*) as contratos, sum(diferencia) as total
  from public.comparar_fotos('antes-177', 'despues-177')
 group by que_cambio;
-- Esperado: una sola fila → 'ahorro de apertura' · 35 · 3671000

-- Limpieza de las fotos (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-177','despues-177');
