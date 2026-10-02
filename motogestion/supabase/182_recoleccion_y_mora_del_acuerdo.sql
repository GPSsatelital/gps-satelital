-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 182 — DÍAS DE MORA DEL CONJUNTO Y LA COLA DE RECOLECCIÓN (decisiones del dueño 29-sep, 1-oct y 2-oct)
--
-- ESPEJO de cicloPago.ts (mismo commit): `diasDelConjunto`, `calcularEstadoCartera`, `diasEnMora`
-- y `vaARecoleccion`. Sin ella, la pantalla diría una cosa y ZALA y Mi Día otra.
--
-- LO QUE DECIDIÓ EL DUEÑO:
--   1. (29-sep) Moto guardada (taller, garantía, fiscalía, tránsito) y el cliente sin moto prestada →
--      NO entra a recolección: no hay moto que recoger. Sigue en mora, con mensajes y llamadas.
--      Caso: REGINALDO RODRIGUEZ (IEW53I), moto en garantía, estaba en la cola.
--   2. (1-oct) Quien tiene acuerdo paga "como si su tarifa cambiara" (D-022): semana + cuota, un
--      solo conjunto. Los días de mora se cuentan sobre ese conjunto: se suma todo lo que le falta y
--      se mira desde cuándo lo debe. Antes solo contaban las semanas: REINEL CASTRO (XYZ53H) debía 5
--      cuotas y cada día de pago amanecía "al día", y varios salían "en mora" con 0 días. Contar el
--      acuerdo por separado tampoco servía: antes del 24-sep el motor metía la plata en las semanas
--      y el acuerdo no recibía nada, y JAIDER (YAC80H) habría salido con 58 días (conjunto: 9).
--   3. (2-oct) Sin mínimo de plata: lo que lleve más de 3 días de mora va a recolección, $2.000 o
--      $200.000. "Si le faltaron $2.000 no pagó completo, y tienen que cobrárselo o guardar la moto."
--
-- LO QUE HACE:
--   1. `zala.dias_conjunto()` — nueva, gemela de diasDelConjunto.
--   2. `zala.se_puede_recolectar()` — nueva: la moto guardada sin prestada no se recoge.
--   3. `zala.cuenta_contrato()` — con acuerdo, el estado y los días salen del conjunto. Parche por
--      anclas sobre la función VIVA (cada ancla debe aparecer 1 vez).
--   4. `zala.cliente` — balde_hoy y plantilla_hoy no mandan a recolección la moto guardada.
--   5. `public.pendientes` (Mi Día) — la tarea de recolección y la de mora, igual. Conserva
--      security_invoker.
--   6. `zala.diccionario` — las palabras nuevas.
--   No toca el motor, el reparto, las cajas ni ninguna tabla de plata: la foto debe dar 0.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   En cada bloque de abajo, cambiar el texto nuevo (b_…) por su ancla original (a_…) con
--   pg_get_functiondef / pg_get_viewdef, y luego:
--     drop function if exists zala.se_puede_recolectar(text, boolean);
--     drop function if exists zala.dias_conjunto(public.contratos, public.convenios, numeric, date);
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-182') as contratos_fotografiados;

begin;

-- ─── 1. DESDE CUÁNDO LE FALTA PLATA AL CONJUNTO (semana + cuota del acuerdo) ────────────────
-- null = no aplica (sin motor o sin acuerdo con cuota). 0 = no debe nada o vence hoy.
-- Recorre hacia atrás desde hoy lo que se le exigió (semanas y cuotas, cada una en su fecha)
-- hasta cubrir lo que debe (`p_debe` = falta de la semana + falta del acuerdo).
create or replace function zala.dias_conjunto(c public.contratos, cv public.convenios, p_debe numeric, p_hoy date)
returns int language plpgsql stable as $$
declare
  v_f date[] := '{}'; v_m numeric[] := '{}';
  v_hoy_ini date; v_d date; v_n int := 0; v_k int; v_cuota numeric; v_total numeric; v_monto numeric;
  v_valor numeric; v_j int; v_previas int; v_rod int; v_fj date; v_ic int;
  v_acum numeric := 0; v_fecha date := null;
begin
  if c.forma_pago = 'Diario' or not coalesce(c.motor_v2, false) then return null; end if;
  if cv.id is null or coalesce(cv.cuota_por_periodo, 0) <= 0 or cv.created_at is null then return null; end if;
  if coalesce(p_debe, 0) <= 0 then return 0; end if;
  v_cuota := cv.cuota_por_periodo;
  v_total := cv.deuda_total;

  -- Las cuotas del acuerdo exigidas, en su fecha (mismo recorrido de periodos_convenio_exigidos; las
  -- rodadas corren la k-ésima, y la última es el resto del total).
  v_hoy_ini := zala.inicio_periodo_actual(c, p_hoy);
  v_d := zala.inicio_periodo_actual(c, (cv.created_at at time zone 'UTC')::date);
  for i in 1..200 loop
    exit when v_d > v_hoy_ini;
    if zala.cuota_convenio_del_periodo(cv, c, v_d) > 0 then
      v_n := v_n + 1;
      v_k := v_n - coalesce(cv.periodos_exonerados, 0);
      if v_k >= 1 then
        v_monto := case when v_total is null then v_cuota
                        else least(v_k * v_cuota, v_total) - least((v_k - 1) * v_cuota, v_total) end;
        if v_monto > 0 then v_f := v_f || v_d; v_m := v_m || v_monto; end if;
      end if;
    end if;
    v_d := zala.proximo_dia_pago(c, v_d);
  end loop;

  -- Hacia atrás: la semana y la cuota del mismo día van juntas; primero se cuenta la cuota.
  v_valor := public.caja_valor(c);
  v_rod := coalesce(c.cajas_exoneradas, 0);
  v_previas := coalesce(c.cajas_previas, 0);
  v_j := public.cajas_exigidas(c, p_hoy);
  v_ic := coalesce(array_length(v_f, 1), 0);
  for guarda in 1..1000 loop
    v_fj := case when v_j > v_previas then zala.fecha_caja(c, v_j + v_rod) else null end;
    exit when v_fj is null and v_ic < 1;
    if v_ic >= 1 and (v_fj is null or v_f[v_ic] >= v_fj) then
      v_fecha := v_f[v_ic]; v_acum := v_acum + v_m[v_ic]; v_ic := v_ic - 1;
    else
      v_fecha := v_fj; v_acum := v_acum + v_valor; v_j := v_j - 1;
    end if;
    exit when v_acum >= p_debe;
  end loop;
  if v_fecha is null then return null; end if;
  return greatest(p_hoy - v_fecha, 0);
end $$;

-- ─── 2. ¿HAY MOTO QUE RECOGER? (lo demás —mora de más de 3 días, plazo— se mira afuera) ───────
create or replace function zala.se_puede_recolectar(p_estado_moto text, p_con_prestada boolean)
returns boolean language sql immutable as $$
  select not (coalesce(p_estado_moto, '') in ('Mantenimiento', 'Fiscalia', 'Transito', 'Garantia')
              and not coalesce(p_con_prestada, false))
$$;

grant execute on function zala.dias_conjunto(public.contratos, public.convenios, numeric, date) to authenticated;
grant execute on function zala.se_puede_recolectar(text, boolean) to authenticated;

-- ─── 3. LA CUENTA: con acuerdo, el estado y los días salen del conjunto ──────────────────────
do $mig$
declare
  v_def text; v_n int;
  a_decl constant text := 'v_ac record; v_cuota_conv numeric; v_estado text; v_dias int; v_hueco numeric;';
  b_decl constant text := 'v_ac record; v_cuota_conv numeric; v_estado text; v_dias int; v_hueco numeric; v_conj_dias int;';
  a_si   constant text := 'if v_estado = ''al-dia'' and v_cuota_conv > 0 and coalesce(v_ac.falta, 0) > 0 then';
  b_si   constant text := 'v_conj_dias := zala.dias_conjunto(c, cv, v_falta + coalesce(v_ac.falta, 0), p_hoy); '
                       || 'if v_conj_dias is not null then '
                       || 'v_estado := case when v_conj_dias >= 2 then ''mora'' when v_conj_dias = 1 then ''gabela'' else ''al-dia'' end; '
                       || 'elsif v_estado = ''al-dia'' and v_cuota_conv > 0 and coalesce(v_ac.falta, 0) > 0 then';
  a_mora constant text := 'r_dias_mora := case when v_estado = ''mora'' then greatest(zala.dias_en_mora_v2(c, p_hoy) - 1, 0) else 0 end;';
  b_mora constant text := 'r_dias_mora := case when v_estado = ''mora'' then greatest(coalesce(v_conj_dias, zala.dias_en_mora_v2(c, p_hoy)) - 1, 0) else 0 end;';
begin
  v_def := pg_get_functiondef('zala.cuenta_contrato(public.contratos, public.convenios, numeric, date)'::regprocedure);
  if position('zala.dias_conjunto' in v_def) > 0 then raise notice 'NADA QUE HACER: cuenta_contrato ya cuenta el conjunto.'; return; end if;
  v_n := (length(v_def) - length(replace(v_def, a_decl, ''))) / length(a_decl);
  if v_n <> 1 then raise exception 'Ancla de declaraciones aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_si, ''))) / length(a_si);
  if v_n <> 1 then raise exception 'Ancla del acuerdo aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_mora, ''))) / length(a_mora);
  if v_n <> 1 then raise exception 'Ancla de los días de mora aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_def := replace(v_def, a_decl, b_decl);
  v_def := replace(v_def, a_si, b_si);
  v_def := replace(v_def, a_mora, b_mora);
  execute v_def;
  raise notice 'LISTO: cuenta_contrato cuenta los días del conjunto.';
end
$mig$;

-- ─── 4. LA VITRINA: balde_hoy y plantilla_hoy ────────────────────────────────────────────────
do $mig$
declare
  v_def text; v_n int; v_opc text;
  a_rec constant text := 'WHEN q.r_estado_cartera = ''mora''::text AND COALESCE(q.r_dias_mora, 0) > 3 AND NOT (plazo.hasta IS NOT NULL AND plazo.hasta >= h.d) THEN ''recoleccion''::text';
  b_rec constant text := 'WHEN q.r_estado_cartera = ''mora''::text AND COALESCE(q.r_dias_mora, 0) > 3 AND NOT (plazo.hasta IS NOT NULL AND plazo.hasta >= h.d) AND zala.se_puede_recolectar(su.estado, pr.id IS NOT NULL) THEN ''recoleccion''::text';
begin
  v_def := pg_get_viewdef('zala.cliente'::regclass, true);
  if position('se_puede_recolectar' in v_def) > 0 then raise notice 'NADA QUE HACER: la vitrina ya usa la regla nueva.'; return; end if;
  v_n := (length(v_def) - length(replace(v_def, a_rec, ''))) / length(a_rec);
  if v_n <> 2 then raise exception 'Ancla de recolección aparece % veces, se esperaban 2 (balde_hoy y plantilla_hoy). No se tocó nada.', v_n; end if;
  -- `create or replace view` borra las opciones de la vista si no se repiten: se conservan.
  select coalesce(' with (' || array_to_string(reloptions, ', ') || ')', '') into v_opc
    from pg_class where oid = 'zala.cliente'::regclass;
  execute 'create or replace view zala.cliente' || v_opc || ' as ' || replace(v_def, a_rec, b_rec);
  raise notice 'LISTO: la vitrina no manda a recolección la moto guardada.';
end
$mig$;

-- ─── 5. MI DÍA: la tarea de recolección y la de mora ─────────────────────────────────────────
do $mig$
declare
  v_def text; v_n int; v_opc text;
  a_col constant text := 'COALESCE(q.r_cuota_falta, 0::numeric) + COALESCE(q.r_acuerdo_falta, 0::numeric) AS falta,';
  b_col constant text := 'COALESCE(q.r_cuota_falta, 0::numeric) + COALESCE(q.r_acuerdo_falta, 0::numeric) AS falta,' ||
    ' zala.se_puede_recolectar(m.estado, (EXISTS ( SELECT 1 FROM prestamos_reemplazo pr WHERE pr.contrato_id = c.id AND pr.estado = ''activo''::text))) AS se_puede_recolectar,';
  a_rec constant text := 'WHERE cartera.estado = ''mora''::text AND cartera.dias_mora > 3 AND NOT (';
  b_rec constant text := 'WHERE cartera.estado = ''mora''::text AND cartera.se_puede_recolectar AND cartera.dias_mora > 3 AND NOT (';
  a_mor constant text := 'WHERE cartera.estado = ''mora''::text AND NOT (cartera.dias_mora > 3 AND NOT (';
  b_mor constant text := 'WHERE cartera.estado = ''mora''::text AND NOT (cartera.se_puede_recolectar AND cartera.dias_mora > 3 AND NOT (';
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass, true);
  if position('se_puede_recolectar' in v_def) > 0 then raise notice 'NADA QUE HACER: Mi Día ya usa la regla nueva.'; return; end if;
  v_n := (length(v_def) - length(replace(v_def, a_col, ''))) / length(a_col);
  if v_n <> 1 then raise exception 'Ancla de la columna falta aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_rec, ''))) / length(a_rec);
  if v_n <> 1 then raise exception 'Ancla de la tarea de recolección aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_mor, ''))) / length(a_mor);
  if v_n <> 1 then raise exception 'Ancla de la tarea de mora aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_def := replace(v_def, a_col, b_col);
  v_def := replace(v_def, a_rec, b_rec);
  v_def := replace(v_def, a_mor, b_mor);
  select coalesce(' with (' || array_to_string(reloptions, ', ') || ')', '') into v_opc
    from pg_class where oid = 'public.pendientes'::regclass;
  if position('security_invoker' in v_opc) = 0 then raise exception 'Mi Día perdió security_invoker (%). No se tocó nada.', v_opc; end if;
  execute 'create or replace view public.pendientes' || v_opc || ' as ' || v_def;
  raise notice 'LISTO: Mi Día no manda a recolección la moto guardada.';
end
$mig$;

-- ─── 6. EL DICCIONARIO: si no está acá, no existe para ZALA ──────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('cliente', 'dias_mora', 'Días que lleva en mora, sin contar el día de gracia. Sin acuerdo: desde la semana más vieja que no completó. Con acuerdo: semana y cuota del acuerdo son un solo pago (el conjunto), y se cuenta desde lo más viejo que le falta a ese conjunto. Un abono parcial no los reinicia. 0 si no está en mora.', null, 'sí', true),
('cliente', 'balde_hoy', 'En qué grupo cae hoy para la gestión del día (panel Hoy de Cartera).',
 'recoleccion (más de 3 días en mora, sin plazo vigente, y con su moto en la calle o una prestada) · mora · gabela · paga-hoy · al-dia · retenida · sin-motor', 'no', true),
('_reglas', '7_recoleccion', 'Decisiones del dueño (29-sep y 2-oct-2026). (1) Si la moto del cliente está guardada en la empresa (taller, garantía, fiscalía, tránsito) y no anda en una prestada, NO va a recolección: no hay moto que recoger; sigue en mora y se le escribe y se le llama. (2) No hay mínimo de plata: lo que lleve más de 3 días de mora va a recolección, sea $2.000 o $200.000; un pago incompleto se cobra o se guarda la moto, no pasa al siguiente pago.', null, 'no', true)
on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores, actualizado = now();

select public.registrar_migracion(182, '182_recoleccion_y_mora_del_acuerdo.sql',
  'Días de mora del conjunto (semana + acuerdo) y la moto guardada sin prestada no va a recolección (espejo de cicloPago)');

commit;

select public.tomar_foto_plata('despues-182');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select count(*) as cambios_de_plata_esperado_cero from public.comparar_fotos('antes-182', 'despues-182');

select (select reloptions from pg_class where oid = 'public.pendientes'::regclass) as mi_dia_sigue_security_invoker;

select z.placa, z.cliente, z.estado_cartera, z.dias_mora, z.balde_hoy, z.debe_hoy, z.su_moto_estado
  from zala.cliente z
 where z.placa in ('IEW53I', 'XYZ53H', 'YAW70H', 'YAC80H')
 order by z.placa;

select balde_hoy, count(*) from zala.cliente group by balde_hoy order by 2 desc;
