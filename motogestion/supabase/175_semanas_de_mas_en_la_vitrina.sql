-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 175 — LAS SEMANAS DE MÁS EN LA BASE: ZALA Y MI DÍA DICEN LO MISMO QUE LA PANTALLA (D-026 · 26-sep-2026)
--
-- LA REGLA DEL DUEÑO (D-026): quien llena su última semana y todavía debe sigue pagando su semana
-- normal hasta quedar en $0, y esas semanas se cobran como cualquier otra (gabela, mora, días de
-- mora, recolección). La pantalla ya lo hace (`semanaDeCierre` en `cicloPago.ts`, commit 06b8fcb).
-- Esta migración es su ESPEJO en la base (REGLA DE LA VITRINA): sin ella, el día que YESID
-- entrara a sus semanas de más, la pantalla lo cobraría y ZALA y Mi Día lo verían "al día".
--
-- LO QUE HACE:
--   1. `zala.semana_de_cierre()`: gemela exacta de `semanaDeCierre()`. SECURITY DEFINER porque
--      lee deudas y pagos del contrato, y la llaman tanto ZALA (zala_vitrina) como Mi Día
--      (security_invoker): solo devuelve cifras del contrato que quien la llama ya está viendo.
--   2. `zala.cuenta_contrato()` (la cuenta que usan la vitrina y Mi Día): en semanas de más, la
--      cuota ES esa semana, el acuerdo va en nulo (no se cuenta dos veces), y el estado y los días
--      de mora salen de su semana de más más vieja sin cubrir. Parche por anclas sobre la VIVA.
--   3. `zala.cliente`: en semanas de más `debe_hoy` NO suma las deudas por aparte (ya son esa
--      semana), el detalle dice "de su semana de más", y 4 columnas nuevas al final.
--   4. `zala.diccionario`: las palabras nuevas, para que ZALA las sepa decir.
--   `public.pendientes` (Mi Día) NO se toca: su "falta" es cuota + acuerdo y su estado sale de la
--   cuenta, así que queda bien solo con el punto 2.
--
-- Medido el 26-sep: HOY NADIE está en semanas de más. Esta migración no cambia ninguna cifra de
-- hoy; la foto de la plata lo comprueba (debe dar 0). El primero será YESID (~2-nov).
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   Volver a correr zala.cuenta_contrato y zala.cliente tal como estaban (definiciones leídas el
--   26-sep, guardadas en el historial de este chat y en las migs 126/138) y:
--     drop function if exists zala.semana_de_cierre(public.contratos, public.convenios, numeric, date);
--     delete from zala.diccionario where columna in ('en_semanas_de_mas','semana_de_mas','semanas_de_mas','debe_para_terminar','6_semanas_de_mas');
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-175') as contratos_fotografiados;

begin;

-- ─── 1. LA CUENTA DE LAS SEMANAS DE MÁS (gemela de semanaDeCierre) ────────────────────────────
create or replace function zala.semana_de_cierre(c public.contratos, cv public.convenios, p_abonado_convenio numeric, p_hoy date)
returns table (
  en_cierre boolean, semana int, semanas int, valor_semana numeric,
  debe_total numeric, debe_deudas numeric, debe_acuerdo numeric,
  exigido numeric, abonado numeric, falta numeric,
  fecha_vencida date, dias_vencida int, proxima_fecha date
) language plpgsql stable security definer set search_path = public, zala as $$
declare
  v_total int; v_base int; v_salto int := 0; v_debe_desde date; v_inicio date; v_hoy date;
  v_f date; v_debe_deudas numeric; v_debe_acuerdo numeric := 0; v_valor numeric;
  v_semana int := 0; v_abonado numeric; v_exigido numeric; v_falta numeric;
  v_fecha_venc date := null; v_dias int := 0; v_prox date := null; v_min_deuda date;
begin
  en_cierre := false;
  if c.forma_pago = 'Diario' or not coalesce(c.motor_v2, false) then return next; return; end if;
  v_total := c.total_cajas;
  if v_total is null or coalesce(c.cajas_pagadas, 0) < v_total then return next; return; end if;
  v_valor := public.caja_valor(c);
  if coalesce(v_valor, 0) <= 0 then return next; return; end if;

  select coalesce(sum(greatest(d.monto_pendiente, 0)), 0), min((d.created_at at time zone 'UTC')::date) filter (where d.monto_pendiente > 0)
    into v_debe_deudas, v_min_deuda
    from public.deudas d where d.contrato_id = c.id and d.estado = 'pendiente';
  if cv.id is not null and coalesce(cv.deuda_total, 0) > 0 then
    v_debe_acuerdo := greatest(coalesce(cv.deuda_total, 0) - coalesce(p_abonado_convenio, 0), 0);
  end if;
  if v_debe_deudas + v_debe_acuerdo <= 0 then return next; return; end if;

  -- Desde cuándo debe esto: la deuda (o el acuerdo con saldo) más vieja que sigue viva.
  v_debe_desde := v_min_deuda;
  if v_debe_acuerdo > 0 and cv.created_at is not null then
    v_debe_desde := least(coalesce(v_debe_desde, (cv.created_at at time zone 'UTC')::date), (cv.created_at at time zone 'UTC')::date);
  end if;

  v_base := v_total + coalesce(c.cajas_exoneradas, 0);
  if v_debe_desde is not null then
    for i in 1..520 loop
      v_f := zala.fecha_caja(c, v_base + v_salto + 1);
      exit when v_f is null or v_f >= v_debe_desde;
      v_salto := v_salto + 1;
    end loop;
  end if;
  v_inicio := zala.fecha_caja(c, v_base + v_salto + 1);
  if v_inicio is null then return next; return; end if;

  -- Si la moto ya es de otro (mig 129), las semanas de más tampoco siguen corriendo.
  v_hoy := p_hoy;
  if c.fecha_fin_cobro is not null and v_hoy > c.fecha_fin_cobro then v_hoy := c.fecha_fin_cobro; end if;

  for m in 1..520 loop
    v_f := zala.fecha_caja(c, v_base + v_salto + m);
    exit when v_f is null or v_f > v_hoy;
    v_semana := m;
  end loop;

  select coalesce(sum(coalesce(p.aplicado_deuda, 0) + coalesce(p.aplicado_convenio, 0)), 0) into v_abonado
    from public.pagos p
   where p.contrato_id = c.id and p.estado = 'Confirmado' and p.fecha >= v_inicio;
  v_exigido := least(v_debe_deudas + v_debe_acuerdo + v_abonado, v_semana * v_valor);
  v_falta := greatest(v_exigido - v_abonado, 0);

  if v_falta > 0 then
    v_fecha_venc := zala.fecha_caja(c, v_base + v_salto + floor(v_abonado / v_valor)::int + 1);
    if v_fecha_venc is not null then v_dias := greatest(v_hoy - v_fecha_venc, 0); end if;
  else
    v_prox := zala.fecha_caja(c, v_base + v_salto + v_semana + 1);
  end if;

  en_cierre := true;
  semana := v_semana;
  semanas := floor(v_abonado / v_valor)::int + ceil((v_debe_deudas + v_debe_acuerdo) / v_valor)::int;
  valor_semana := v_valor;
  debe_total := v_debe_deudas + v_debe_acuerdo; debe_deudas := v_debe_deudas; debe_acuerdo := v_debe_acuerdo;
  exigido := v_exigido; abonado := v_abonado; falta := v_falta;
  fecha_vencida := v_fecha_venc; dias_vencida := v_dias; proxima_fecha := v_prox;
  return next;
end $$;

revoke all on function zala.semana_de_cierre(public.contratos, public.convenios, numeric, date) from public;
grant execute on function zala.semana_de_cierre(public.contratos, public.convenios, numeric, date) to authenticated;
do $g$ begin
  if exists (select 1 from pg_roles where rolname = 'zala_lector') then
    execute 'grant execute on function zala.semana_de_cierre(public.contratos, public.convenios, numeric, date) to zala_lector';
  end if;
end $g$;

-- ─── 2. LA CUENTA DEL CONTRATO: en semanas de más manda esa semana ───────────────────────────
do $mig$
declare
  v_def text; v_n int;
  a_decl constant text := 'v_ac record; v_cuota_conv numeric; v_estado text; v_dias int; v_hueco numeric;';
  a_fin  constant text := '  return next;' || E'\r\n' || 'end';
  v_bloque text;
begin
  v_def := pg_get_functiondef('zala.cuenta_contrato(public.contratos, public.convenios, numeric, date)'::regprocedure);
  if position('D-026' in v_def) > 0 then raise notice 'NADA QUE HACER: cuenta_contrato ya tiene D-026.'; return; end if;

  v_n := (length(v_def) - length(replace(v_def, a_decl, ''))) / length(a_decl);
  if v_n <> 1 then raise exception 'Ancla de declaraciones aparece % veces, se esperaba 1.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_fin, ''))) / length(a_fin);
  if v_n <> 1 then raise exception 'Ancla del final aparece % veces, se esperaba 1.', v_n; end if;

  v_bloque :=
    '  -- ★ D-026 (26-sep-2026): en semanas de más (llenó todas y todavía debe) la cuota ES esa semana,' || E'\r\n' ||
    '  --   el acuerdo va en nulo para no contarlo dos veces, y el estado y los días de mora salen de su' || E'\r\n' ||
    '  --   semana de más más vieja sin cubrir. Gemela de semanaDeCierre/loQueDebe en cicloPago.ts.' || E'\r\n' ||
    '  select * into v_ci from zala.semana_de_cierre(c, cv, p_abonado_convenio, p_hoy);' || E'\r\n' ||
    '  if v_ci.en_cierre then' || E'\r\n' ||
    '    r_cuota_toca := v_ci.exigido;' || E'\r\n' ||
    '    r_cuota_pagado := least(v_ci.abonado, v_ci.exigido);' || E'\r\n' ||
    '    r_cuota_falta := v_ci.falta;' || E'\r\n' ||
    '    r_acuerdo_toca := null; r_acuerdo_pagado := null; r_acuerdo_falta := null;' || E'\r\n' ||
    '    r_acuerdo_cuota_este_periodo := null; r_acuerdo_proxima_fecha := null;' || E'\r\n' ||
    '    r_proximo_pago_fecha := coalesce(v_ci.proxima_fecha, v_ci.fecha_vencida);' || E'\r\n' ||
    '    r_proximo_pago_monto := least(v_ci.debe_total, v_ci.valor_semana);' || E'\r\n' ||
    '    r_estado_cartera := case when v_cubierto then ''al-dia''' || E'\r\n' ||
    '                             when v_ci.falta <= 0 or v_ci.dias_vencida = 0 then ''al-dia''' || E'\r\n' ||
    '                             when v_ci.dias_vencida = 1 then ''gabela'' else ''mora'' end;' || E'\r\n' ||
    '    r_dias_mora := case when r_estado_cartera = ''mora'' then greatest(v_ci.dias_vencida - 1, 0) else 0 end;' || E'\r\n' ||
    '  end if;' || E'\r\n';

  v_def := replace(v_def, a_decl, a_decl || ' v_ci record;');
  v_def := replace(v_def, a_fin, v_bloque || a_fin);
  execute v_def;
  raise notice 'LISTO: cuenta_contrato con semanas de más.';
end
$mig$;

-- ─── 3. LA VITRINA: debe_hoy sin contar dos veces + columnas nuevas ──────────────────────────
do $mig$
declare
  v_def text; v_n int;
  a_suma  constant text := 'COALESCE(q.r_acuerdo_falta, 0::numeric) + COALESCE(de.pend_falta, 0::bigint)::numeric';
  b_suma  constant text := 'COALESCE(q.r_acuerdo_falta, 0::numeric) + CASE WHEN COALESCE(ci.en_cierre, false) THEN 0::numeric ELSE COALESCE(de.pend_falta, 0::bigint)::numeric END';
  a_cuota constant text := 'zala.pesos(q.r_cuota_falta) || '' de su cuota''::text';
  b_cuota constant text := 'zala.pesos(q.r_cuota_falta) || CASE WHEN COALESCE(ci.en_cierre, false) THEN '' de su semana de más''::text ELSE '' de su cuota''::text END';
  a_deu   constant text := 'WHEN COALESCE(de.pend_falta, 0::bigint) > 0 THEN zala.pesos(de.pend_falta::numeric) || '' de deudas''::text';
  b_deu   constant text := 'WHEN COALESCE(de.pend_falta, 0::bigint) > 0 AND NOT COALESCE(ci.en_cierre, false) THEN zala.pesos(de.pend_falta::numeric) || '' de deudas''::text';
  a_cols  constant text := 'AS cuenta_confiable' || E'\n' || '   FROM contratos c';
  b_cols  constant text := 'AS cuenta_confiable,' || E'\n' ||
    '    COALESCE(ci.en_cierre, false) AS en_semanas_de_mas,' || E'\n' ||
    '    ci.semana AS semana_de_mas,' || E'\n' ||
    '    ci.semanas AS semanas_de_mas,' || E'\n' ||
    '    ci.debe_total AS debe_para_terminar' || E'\n' || '   FROM contratos c';
  a_lat   constant text := 'r_estado_cartera, r_dias_mora) ON true' || E'\n' || '  WHERE c.estado = ANY';
  b_lat   constant text := 'r_estado_cartera, r_dias_mora) ON true' || E'\n' ||
    '     LEFT JOIN LATERAL zala.semana_de_cierre(c.*, cv.*, ab.abonado, h.d) ci ON true' || E'\n' || '  WHERE c.estado = ANY';
begin
  v_def := pg_get_viewdef('zala.cliente'::regclass, true);
  if position('en_semanas_de_mas' in v_def) > 0 then raise notice 'NADA QUE HACER: la vitrina ya tiene las semanas de más.'; return; end if;

  v_n := (length(v_def) - length(replace(v_def, a_suma, ''))) / length(a_suma);
  if v_n <> 2 then raise exception 'Ancla de la suma aparece % veces, se esperaban 2 (debe_hoy y debe_hoy_texto).', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_cuota, ''))) / length(a_cuota);
  if v_n <> 1 then raise exception 'Ancla "de su cuota" aparece % veces, se esperaba 1.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_deu, ''))) / length(a_deu);
  if v_n <> 1 then raise exception 'Ancla "de deudas" aparece % veces, se esperaba 1.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_cols, ''))) / length(a_cols);
  if v_n <> 1 then raise exception 'Ancla de la última columna aparece % veces, se esperaba 1.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_lat, ''))) / length(a_lat);
  if v_n <> 1 then raise exception 'Ancla del lateral aparece % veces, se esperaba 1.', v_n; end if;

  v_def := replace(v_def, a_suma, b_suma);
  v_def := replace(v_def, a_cuota, b_cuota);
  v_def := replace(v_def, a_deu, b_deu);
  v_def := replace(v_def, a_cols, b_cols);
  v_def := replace(v_def, a_lat, b_lat);
  execute 'create or replace view zala.cliente as ' || v_def;
  raise notice 'LISTO: la vitrina conoce las semanas de más.';
end
$mig$;

-- ─── 4. EL DICCIONARIO: si no está acá, no existe para ZALA ──────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('_reglas', '6_semanas_de_mas', 'Nadie termina debiendo (D-026, regla del dueño 25-sep-2026). Si el cliente ya pagó todas las semanas de su contrato pero todavía debe (deudas o acuerdo), sigue pagando su semana normal y todo va a lo que debe, hasta quedar en $0. Esas semanas se cobran igual que cualquier otra: gabela, mora, recolección. Recién en $0 se liquida y la moto pasa a ser suya.', null, 'sí', true),
('cliente', 'en_semanas_de_mas', 'true = ya pagó todas sus semanas y todavía debe: está en sus semanas de más. Entonces debe_hoy es lo de ESTA semana (su semana normal, que va a lo que debe) y NO se le suman las deudas aparte.', 'true · false', 'sí', true),
('cliente', 'semana_de_mas', 'En cuál semana de más va (1, 2, 3…). 0 = ya terminó sus semanas pero la primera de más todavía no le toca.', null, 'sí', true),
('cliente', 'semanas_de_mas', 'En cuántas semanas de más termina al ritmo de su semana normal, con lo que debe hoy.', null, 'sí', true),
('cliente', 'debe_para_terminar', 'Todo lo que le falta para quedar en $0 y que la moto sea suya (deudas + acuerdo). No es lo que se le cobra hoy: lo de hoy es debe_hoy.', null, 'sí', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno;

select public.registrar_migracion(175, '175_semanas_de_mas_en_la_vitrina.sql',
  'D-026: semanas de más en zala.cuenta_contrato (vitrina y Mi Día) + columnas en zala.cliente + diccionario');

commit;

select public.tomar_foto_plata('despues-175');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from public.comparar_fotos('antes-175', 'despues-175'))                         as pesos_movidos,
  (select count(*) from zala.cliente where en_semanas_de_mas)                                        as en_semanas_de_mas_hoy,
  position('D-026' in pg_get_functiondef('zala.cuenta_contrato(public.contratos, public.convenios, numeric, date)'::regprocedure)) > 0 as cuenta_parchada,
  (select count(*) from zala.diccionario where columna in ('en_semanas_de_mas','semana_de_mas','semanas_de_mas','debe_para_terminar','6_semanas_de_mas')) as palabras_nuevas;
-- Esperado: pesos_movidos = 0 · en_semanas_de_mas_hoy = 0 · cuenta_parchada = true · palabras_nuevas = 5

-- Limpieza de las fotos (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-175','despues-175');
