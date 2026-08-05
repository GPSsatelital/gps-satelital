-- ===== 084: el convenio se da por cumplido cuando el SALDO llega a cero =====
--
-- QUÉ ESTABA MAL (encontrado el 5-ago-2026 revisando los 38 convenios activos):
-- El motor marcaba un convenio como 'cumplido' comparando `cuotas_pagadas >= numero_cuotas`, y
-- contaba las cuotas así: `plata abonada ÷ valor de la cuota`, redondeando hacia abajo.
--
-- Pero la regla del dueño es que la ÚLTIMA cuota es más chica (paga de a $55.000 y la última el
-- resto). Con eso, esa división NUNCA llega al número completo:
--     JUAN ANDRES MESTRA (XZZ70H): debe $848.500 de a $100.000 en 9 cuotas.
--     Al pagar los $848.500 completos → 848.500 ÷ 100.000 = 8. Nunca 9.
-- De los 38 convenios activos, solo DOS tienen la deuda que divide exacto. A los otros 36 les
-- iba a pasar.
--
-- CONSECUENCIA: el día que el primer cliente terminara de pagar, su convenio se quedaba 'activo'
-- con saldo en cero, la pantalla le seguía exigiendo la cuota y ENTRABA EN MORA sin deber nada.
-- Todavía no le había pasado a nadie (el más adelantado iba en $511.000 de $848.500).
--
-- EL ARREGLO: si lo abonado ya cubre la deuda total, se da por cumplido — sin importar cuántas
-- cuotas "cuente" la división. Si no, se sigue contando como antes.
--
-- MÉTODO (el mismo de la mig 083): el script LEE la función de la propia base y solo reemplaza
-- esa línea. La función viva NO es igual a la del repo (ver 083), así que transcribirla la
-- rompería. Y si no encuentra exactamente las 2 apariciones esperadas —una en la rama del motor
-- v2 y otra en la v1— ABORTA sin tocar nada.
--
-- LO QUE NO CAMBIA: el reparto de pagos, las cajas, el prorrateo, las deudas, el ahorro, ni
-- cuánta plata entra al convenio (eso ya estaba topado en `deuda_total - abonado`).

do $$
declare
  v_viejo constant text :=
    'v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas);';
  v_nuevo constant text :=
    'if v_abonado_total >= coalesce(v_convenio.deuda_total, 0) then v_cuotas_completas := v_convenio.numero_cuotas; else v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas); end if;';
  v_def text;
  v_n   int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  v_n := (length(v_def) - length(replace(v_def, v_viejo, ''))) / length(v_viejo);
  if v_n <> 2 then
    raise exception 'Se esperaban 2 conteos de cuotas del convenio y hay %. No se tocó nada — revisar a mano.', v_n;
  end if;

  v_def := replace(v_def, v_viejo, v_nuevo);
  execute v_def;
  raise notice 'El convenio ahora se da por cumplido cuando lo abonado cubre la deuda total.';
end $$;

-- ── Corrección de datos aplicada el mismo día (ya ejecutada) ──────────────────
-- Al corregir los 5 convenios que cobraban una semana dos veces se les bajó `deuda_total` pero
-- quedó el `numero_cuotas` viejo, así que el plan quedaba más largo que la deuda:
--   ANDRY (RLZ93H) 16→14 · DIONICIO (XZI01H) 7→5 · FRANCISCO (XZI14H) 9→6
--   JAIDER (YAC80H) 8→4  · LUIS FELIPE (RLZ91H) 16→14
-- Los demás quedaron bien. Consulta para volver a detectarlos si vuelve a pasar:
--   select cv.*, ceil(cv.deuda_total::numeric / nullif(cv.cuota_por_periodo,0)) as correctas
--     from public.convenios cv
--    where cv.estado = 'activo'
--      and cv.numero_cuotas <> ceil(cv.deuda_total::numeric / nullif(cv.cuota_por_periodo,0));
