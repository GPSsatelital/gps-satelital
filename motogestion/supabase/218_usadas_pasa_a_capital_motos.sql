-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 218 — USADAS PASA A LLAMARSE «CAPITAL MOTOS», Y SU COLOR PASA DE NARANJA A VIOLETA
--        (11-nov-2026 · D-067 aprobado el 7-nov y confirmado el 10-nov · D-074: violeta)
--
-- POR QUÉ UNA MIGRACIÓN Y NO EL BOTÓN: la sección Grupos solo deja cambiar el nombre de un grupo
-- que no se usa en nada. USADAS ya tiene motos, fotos diarias de Cartera, una cuenta y un premio de
-- referidos: su nombre se cambia aquí, en un solo paso, con conteo antes y después.
--
-- LO QUE HACE:
--   1. Cambia el nombre en la tabla `grupos`. Las llaves de la 217 («on update cascade») lo cambian
--      solas en las motos, las fotos diarias de Cartera, los perfiles, los abonos de la base, la caja
--      diaria y la plata sin identificar; el disparador de la 217 lo cambia en las cuentas.
--   2. El color pasa de naranja a violeta (D-074: el naranja se confundía con el ámbar de PRADERA).
--   3. El premio de referidos que le repartió $20.000 a USADAS (fila bc40b557…) pasa a decir
--      CAPITAL MOTOS. El monto no se toca.
--   4. Dos filas en el historial de grupos: «renombrar» y «color».
--   5. Revisa que no quede USADAS en ninguna columna «grupo»/«grupos» ni en ningún JSON de la base,
--      y que cada tabla tenga las mismas filas que antes. Si algo no da, se deshace todo.
--
-- LO QUE NO TOCA: ninguna cifra de plata, ningún contrato, ninguna moto más que su grupo (sí les
-- cambia la fecha de «última modificación» a las 14 motos: es el disparador de siempre), el historial
-- de migraciones (la 217 sigue diciendo USADAS: es historia), RASTREADOR, COSTA, PRADERA ni OTRO.
--
-- CUÁNDO CORRERLA: DESPUÉS de publicar la app que lee los grupos de la tabla (si se corre antes, las
-- pantallas viejas no conocen CAPITAL MOTOS). Un lunes o miércoles, después de las 6 p. m., y antes de
-- las 11:30 p. m. (a las 11:55 p. m. se toma la foto diaria de Cartera). Tarda unos segundos.
--
-- CÓMO DESHACERLA: es la misma migración al revés (CAPITAL MOTOS → USADAS, violeta → naranja, y el
-- premio). Las llaves vuelven a cambiar todo solas.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ─── 0. Antes de tocar nada ────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from public.migraciones_aplicadas where numero = 217) then
    raise exception 'Falta la 217. No se cambió nada.';
  end if;
  if not exists (select 1 from public.grupos where codigo = 'USADAS') then
    raise exception 'No existe el grupo USADAS (¿ya se corrió la 218?). No se cambió nada.';
  end if;
  if exists (select 1 from public.grupos where codigo = 'CAPITAL MOTOS') then
    raise exception 'Ya existe un grupo CAPITAL MOTOS. No se cambió nada.';
  end if;
  if exists (select 1 from public.grupos where activo and color = 'violeta' and codigo <> 'USADAS') then
    raise exception 'El violeta ya lo tiene otro grupo prendido. No se cambió nada.';
  end if;
  -- El disparador de la 031 cuida el grupo de los perfiles; hoy ningún socio es de USADAS. Si
  -- apareciera uno, mejor parar y revisarlo que dejar que el disparador decida.
  if exists (select 1 from public.profiles where grupo = 'USADAS') then
    raise exception 'Hay un perfil del grupo USADAS: revisarlo antes. No se cambió nada.';
  end if;
end $$;

-- El conteo de ANTES: filas de cada tabla con grupo, y cuántas son de USADAS. Va en una variable de
-- la transacción (no en una tabla temporal: el editor de Supabase avisa raro con esas).
select set_config('mg218.antes', (
  select jsonb_build_object(
    'motos',      jsonb_build_array((select count(*) from public.motos),                     (select count(*) from public.motos where grupo = 'USADAS')),
    'fotos',      jsonb_build_array((select count(*) from public.cartera_del_dia),           (select count(*) from public.cartera_del_dia where grupo = 'USADAS')),
    'perfiles',   jsonb_build_array((select count(*) from public.profiles),                  (select count(*) from public.profiles where grupo = 'USADAS')),
    'abonos',     jsonb_build_array((select count(*) from public.abonos_base),               (select count(*) from public.abonos_base where grupo = 'USADAS')),
    'cajas',      jsonb_build_array((select count(*) from public.caja_diaria),               (select count(*) from public.caja_diaria where grupo = 'USADAS')),
    'ingresos',   jsonb_build_array((select count(*) from public.ingresos_no_identificados), (select count(*) from public.ingresos_no_identificados where grupo = 'USADAS')),
    'cuentas',    jsonb_build_array((select count(*) from public.cuentas_bancarias),         (select count(*) from public.cuentas_bancarias where 'USADAS' = any(grupos))),
    'premios',    jsonb_build_array((select count(*) from public.premios_referidos),
                    (select count(*) from public.premios_referidos r cross join lateral jsonb_array_elements(
                       case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e
                      where e->>'grupo' = 'USADAS')),
    'plata_premios', (select coalesce(sum((e->>'monto')::numeric), 0) from public.premios_referidos r cross join lateral jsonb_array_elements(
                       case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e),
    'contratos_vivos', (select count(*) from public.contratos where estado in ('Activo', 'Suspendido', 'En proceso'))
  )
)::text, true);

-- ─── 1 y 2. El nombre y el color ───────────────────────────────────────────────────────────
update public.grupos set codigo = 'CAPITAL MOTOS', color = 'violeta' where codigo = 'USADAS';

-- ─── 3. El premio de referidos ─────────────────────────────────────────────────────────────
update public.premios_referidos r
   set reparto = (
     select jsonb_agg(case when x.e->>'grupo' = 'USADAS' then jsonb_set(x.e, '{grupo}', '"CAPITAL MOTOS"') else x.e end
                      order by x.o)
       from jsonb_array_elements(r.reparto) with ordinality as x(e, o))
 where jsonb_typeof(r.reparto) = 'array'
   and exists (select 1 from jsonb_array_elements(r.reparto) e where e->>'grupo' = 'USADAS');

-- ─── 4. El historial ───────────────────────────────────────────────────────────────────────
insert into public.grupos_historial (grupo, accion, antes, despues, hecho_por) values
  ('CAPITAL MOTOS', 'renombrar', jsonb_build_object('codigo', 'USADAS'), jsonb_build_object('codigo', 'CAPITAL MOTOS'), null),
  ('CAPITAL MOTOS', 'color',     jsonb_build_object('color', 'naranja'), jsonb_build_object('color', 'violeta'),        null);

-- ─── 5. El conteo de DESPUÉS ───────────────────────────────────────────────────────────────
do $$
declare
  v_antes   jsonb := current_setting('mg218.antes')::jsonb;
  v_despues jsonb;
begin
  -- Las mismas cuentas, ahora con CAPITAL MOTOS donde antes decía USADAS.
  select jsonb_build_object(
    'motos',      jsonb_build_array((select count(*) from public.motos),                     (select count(*) from public.motos where grupo = 'CAPITAL MOTOS')),
    'fotos',      jsonb_build_array((select count(*) from public.cartera_del_dia),           (select count(*) from public.cartera_del_dia where grupo = 'CAPITAL MOTOS')),
    'perfiles',   jsonb_build_array((select count(*) from public.profiles),                  (select count(*) from public.profiles where grupo = 'CAPITAL MOTOS')),
    'abonos',     jsonb_build_array((select count(*) from public.abonos_base),               (select count(*) from public.abonos_base where grupo = 'CAPITAL MOTOS')),
    'cajas',      jsonb_build_array((select count(*) from public.caja_diaria),               (select count(*) from public.caja_diaria where grupo = 'CAPITAL MOTOS')),
    'ingresos',   jsonb_build_array((select count(*) from public.ingresos_no_identificados), (select count(*) from public.ingresos_no_identificados where grupo = 'CAPITAL MOTOS')),
    'cuentas',    jsonb_build_array((select count(*) from public.cuentas_bancarias),         (select count(*) from public.cuentas_bancarias where 'CAPITAL MOTOS' = any(grupos))),
    'premios',    jsonb_build_array((select count(*) from public.premios_referidos),
                    (select count(*) from public.premios_referidos r cross join lateral jsonb_array_elements(
                       case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e
                      where e->>'grupo' = 'CAPITAL MOTOS')),
    'plata_premios', (select coalesce(sum((e->>'monto')::numeric), 0) from public.premios_referidos r cross join lateral jsonb_array_elements(
                       case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e),
    'contratos_vivos', (select count(*) from public.contratos where estado in ('Activo', 'Suspendido', 'En proceso'))
  ) into v_despues;

  if v_antes is distinct from v_despues then
    raise exception 'Los conteos no cuadran. Antes (USADAS): % · Después (CAPITAL MOTOS): %. No se cambió nada.', v_antes, v_despues;
  end if;
end $$;

-- Ningún USADAS suelto en una columna «grupo» o «grupos» de public: así se caza también una tabla
-- nueva que nadie recordó. Si queda uno, se deshace todo.
-- Dentro de los JSON (public y zala) solo se AVISA: un registro viejo, como un recibo ya mandado, puede
-- nombrar USADAS con razón y no debe frenar el cambio. La lista sale en la verificación de abajo.
-- El historial de migraciones y el de grupos lo nombran a propósito: es historia.
do $$
declare
  c      record;
  v_n    bigint;
  v_malo text := '';
  v_json text := '';
begin
  for c in
    select k.table_schema, k.table_name, k.column_name, k.data_type
      from information_schema.columns k
      join information_schema.tables t
        on t.table_schema = k.table_schema and t.table_name = k.table_name and t.table_type = 'BASE TABLE'
     where k.table_schema in ('public', 'zala')
       and k.table_name not in ('migraciones_aplicadas', 'grupos_historial')
       and ((k.table_schema = 'public' and k.column_name in ('grupo', 'grupos')) or k.data_type = 'jsonb')
  loop
    if c.data_type = 'jsonb' then
      execute format('select count(*) from %I.%I where %I::text like %L', c.table_schema, c.table_name, c.column_name, '%"USADAS"%') into v_n;
      if v_n > 0 then v_json := v_json || format(' %s.%s.%s (%s)', c.table_schema, c.table_name, c.column_name, v_n); end if;
    else
      if c.data_type = 'ARRAY' then
        execute format('select count(*) from %I.%I where %L = any(%I)', c.table_schema, c.table_name, 'USADAS', c.column_name) into v_n;
      else
        execute format('select count(*) from %I.%I where %I::text = %L', c.table_schema, c.table_name, c.column_name, 'USADAS') into v_n;
      end if;
      if v_n > 0 then v_malo := v_malo || format(' %s.%s.%s (%s)', c.table_schema, c.table_name, c.column_name, v_n); end if;
    end if;
  end loop;
  if v_malo <> '' then
    raise exception 'Quedó USADAS en:%. No se cambió nada.', v_malo;
  end if;
  -- false = dura toda la ventana del editor, para que la verificación de abajo la pueda leer.
  perform set_config('mg218.json_usadas', coalesce(nullif(btrim(v_json), ''), 'ninguno'), false);
end $$;

select public.registrar_migracion(218, '218_usadas_pasa_a_capital_motos.sql',
  'USADAS pasa a CAPITAL MOTOS y de naranja a violeta (D-067, D-074); las llaves de la 217 cambian el resto solas');

commit;

-- ── VERIFICACIÓN (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: lista CAPITAL MOTOS violeta · COSTA verde · OTRO gris (apagado) · PRADERA ambar ·
-- RASTREADOR azul · motos_capital 14 · cuentas_capital 1 · premio_capital 20000 · quedan_usadas 0 ·
-- historial 7 · json_con_usadas «ninguno» (si sale una lista, pegármela: son registros viejos que
-- nombran USADAS y se revisan uno por uno). Si la migración terminó, el conteo de adentro ya cuadró.
select
  (select string_agg(codigo || ' ' || color || case when activo then '' else ' (apagado)' end, ' · ' order by codigo)
     from public.grupos) as lista,
  (select count(*) from public.motos where grupo = 'CAPITAL MOTOS') as motos_capital,
  (select count(*) from public.cuentas_bancarias where 'CAPITAL MOTOS' = any(grupos)) as cuentas_capital,
  (select coalesce(sum((e->>'monto')::numeric), 0) from public.premios_referidos r
     cross join lateral jsonb_array_elements(case when jsonb_typeof(r.reparto) = 'array' then r.reparto else '[]'::jsonb end) e
    where e->>'grupo' = 'CAPITAL MOTOS') as premio_capital,
  (select count(*) from public.motos where grupo = 'USADAS')
    + (select count(*) from public.cartera_del_dia where grupo = 'USADAS') as quedan_usadas,
  (select count(*) from public.grupos_historial) as historial,
  coalesce(current_setting('mg218.json_usadas', true), '(correr en la misma ventana que la migración)') as json_con_usadas;
