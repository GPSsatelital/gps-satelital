-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 178 — EL PEDAZO DE SEMANA DEL ACUERDO DE BASE NO SE COBRA NI SE DESCUENTA APARTE (26-sep-2026)
--
-- 🔴 ERROR MÍO DE ESTE MISMO DÍA (migs 176 y 177). Traté el acuerdo de base como "ahorro hasta
-- $308.000 + lo que pase de ahí es su primera semana". Esa semana YA la lleva el libro de cajas:
-- la cobra en sus semanas normales mientras está activo y, al liquidar, el ajuste de salida la cuenta
-- por los días que usó la moto. Resultado:
--   · FRAIRON (LIQ-0070): se le dejó "Primera semana de su base, sin pagar $102.000" ENCIMA de los
--     $82.000 de días usados sin pagar, que ya incluyen esa semana. Cobro doble.
--   · JORGE DAVID FIGUEROA: de los $200.000 que abonó a su acuerdo de base se le reconocieron
--     $198.000 de base (se "descontó" un pedazo de semana de $2.000 que no correspondía).
--
-- LO QUE HACE:
--   1. FRAIRON: se quita la línea de $102.000 (total de deudas $177.000 → $75.000).
--   2. `base_pagada_en_acuerdo()`: todo lo abonado al acuerdo de base es base, hasta la parte de base
--      del acuerdo (nunca más del piso). El disparador de la mig 177 la usa para lo que venga.
--   3. JORGE DAVID: +$2.000 de base ($198.000 → $200.000). Es el único al que le cambia.
--
-- El pedazo de semana dentro de los acuerdos de JORDAN ($45.000) y JORGE DAVID ($2.000), que se les
-- pediría dos veces mientras pagan, es otra cosa y necesita la decisión del dueño (los acuerdos están
-- firmados): NO se toca acá.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-178') as contratos_fotografiados;

begin;

do $fix$
declare n int; v_total numeric;
begin
  -- 1. FRAIRON: quitar el cobro doble.
  update public.liquidaciones l
     set detalle_deudas = (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(l.detalle_deudas) e
                            where not (e->>'concepto' = 'Primera semana de su base, sin pagar' and (e->>'monto')::numeric = 102000)),
         total_deudas = l.total_deudas - 102000
   where l.numero = 'LIQ-0070' and l.estado = 'en_taller' and l.total_deudas = 177000;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FRAIRON (LIQ-0070) no está como se midió'; end if;

  -- 3. (antes de cambiar la función) lo que cambia la base de cada contrato con la regla nueva.
  with base as (
    select cv.contrato_id, cv.deuda_total,
           case when coalesce(c.valor_semanal, 0) > 0 and c.valor_semanal < 202000 then 305000 else 308000 end as piso,
           (select coalesce(sum(p.aplicado_convenio), 0) from public.pagos p
             where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado' and p.created_at >= cv.created_at) as abonado
      from public.convenios cv join public.contratos c on c.id = cv.contrato_id
     where cv.concepto = 'Base inicial incompleta al crear el contrato'
       and not exists (select 1 from public.convenios o where o.contrato_id = cv.contrato_id and o.id <> cv.id)
  ), dif as (
    select contrato_id,
           least(greatest(abonado, 0), least(deuda_total, piso))
             - public.base_pagada_en_acuerdo(abonado, deuda_total, piso) as delta
      from base
  ), hecho as (
    update public.contratos c set ahorro_apertura = coalesce(c.ahorro_apertura, 0) + d.delta
      from dif d where d.contrato_id = c.id and d.delta <> 0
    returning d.delta
  )
  select count(*), coalesce(sum(delta), 0) into n, v_total from hecho;
  if n <> 1 or v_total <> 2000 then
    raise exception 'Se esperaba 1 contrato (JORGE DAVID) y +$2.000; salieron % y $%. No se tocó nada.', n, v_total;
  end if;
end
$fix$;

-- 2. La regla nueva: todo lo abonado al acuerdo de base es base, hasta la parte de base del acuerdo.
create or replace function public.base_pagada_en_acuerdo(p_abonado numeric, p_deuda_total numeric, p_piso numeric)
returns numeric language sql immutable as $$
  select least(greatest(coalesce(p_abonado, 0), 0), least(p_deuda_total, p_piso))
$$;

select public.registrar_migracion(178, '178_acuerdo_de_base_sin_pedazo_de_semana.sql',
  'Corrige 176/177: FRAIRON sin el cobro doble de $102.000; lo abonado al acuerdo de base es todo base (JORGE DAVID +$2.000)');

commit;

select public.tomar_foto_plata('despues-178');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select 'foto' as que, que_cambio as detalle, count(*)::text as n, sum(diferencia)::text as total
  from public.comparar_fotos('antes-178', 'despues-178') group by que_cambio
union all
select 'frairon', l.estado, l.total_deudas::text,
       coalesce((select string_agg(e->>'concepto', ' · ') from jsonb_array_elements(l.detalle_deudas) e where e->>'concepto' ~* 'base|convenio'), 'sin línea de base')
  from public.liquidaciones l where l.numero = 'LIQ-0070';
-- Esperado:
--   foto    · ahorro de apertura · 1     · 2000
--   frairon · en_taller          · 75000 · sin línea de base
