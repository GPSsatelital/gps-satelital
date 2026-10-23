-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 201 — RODAR TODO (D-050 + D-052, 22/23-oct-2026, decidido con el dueño para OMAR AGUSTIN, RMM66H)
--
-- QUÉ CAMBIA: el rodado por deuda (mig 191) ahora tiene un segundo modo, «rodar todo». El rodado de
-- siempre corre solo las semanas atrasadas y corre las cuotas atrasadas del acuerdo al final del MISMO
-- acuerdo. «Rodar todo» toma TODO lo que debe como un solo conjunto —semanas atrasadas + lo que le
-- falta al acuerdo ENTERO (también lo que no se ha vencido) + deudas de tiempo sueltas— y lo pasa a
-- semanas al final del contrato. El acuerdo se cierra (estado nuevo 'rodado') y desde ese día el
-- cliente solo paga su semana normal.
--
-- LA REGLA (D-052, confirmada por el dueño el 23-oct):
--   1. Se suma todo lo que debe en tiempo (un solo conjunto).
--   2. Se cuentan las semanas COMPLETAS que caben.
--   3. El recargo sale de esas semanas completas, con la tabla de siempre (D-044).
--   4. El pedazo que sobra: si es de $100.000 o más, se corre como UNA semana completa más, SIN
--      recargo. Si es menos, lo paga el día de la gestión o le queda como deuda pendiente.
--   5. El mínimo de $700.000 se mide con todo lo que debe (también lo no vencido del acuerdo).
--   Solo si el acuerdo financia TIEMPO (semanas y deudas de 'migracion'/'tarifa_atrasada'). Un acuerdo
--   sin lista (partitura) o con algo que no es tiempo no se rueda entero.
--
-- CÓMO LO HACE SIN TOCAR LO QUE YA FUNCIONA:
--   · `_calcular_rodado_por_deuda(uuid)` (el de siempre, mig 191) NO se toca. Lo nuevo vive en
--     `_calcular_rodado_todo(uuid)`. Las dos funciones públicas reciben `p_todo` (por defecto false) y
--     con false llaman EXACTAMENTE a lo de antes: el rodado de siempre da lo mismo por construcción.
--   · Las semanas atrasadas se corren con `cajas_exoneradas` (mig 078) y el resto alarga `total_cajas`,
--     igual que en la 191. La cuenta de antes y después sale de `zala.cuenta_contrato` (la vitrina).
--   · Si se corre una semana que estaba a medio pagar, lo que ya tenía abonado pasa a su próxima semana
--     (así lo hace el libro de semanas solo): no se le cobra dos veces.
--   · El acuerdo 'rodado' no lo cobra NADIE: motor, Cartera, ZALA, liquidación, pendientes y nómina solo
--     miran 'activo'/'incumplido' (medido en la base viva el 22-oct). Sus deudas pasan a 'rodada'.
--
-- QUÉ AGREGA: columnas `todo` y `deuda_restante_id` en `rodados_por_deuda` · `_calcular_rodado_todo()` ·
--   `calcular_rodado_por_deuda(uuid, boolean)` · `aplicar_rodado_por_deuda(…, boolean)` · columna `todo`
--   en `zala.rodado` · el estado 'rodado' en el diccionario de ZALA.
-- QUÉ NO TOCA: ninguna cifra de ningún cliente. Mientras nadie use «rodar todo», nada cambia.
--
-- ── CÓMO DESHACERLA (si nadie la usó) ─────────────────────────────────────────────────────────
--   drop function if exists public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int, boolean);
--   drop function if exists public.calcular_rodado_por_deuda(uuid, boolean);
--   drop function if exists public._calcular_rodado_todo(uuid);
--   y volver a correr las secciones 4 y 5 de la mig 191 (las funciones públicas de antes).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1. El registro sabe si fue «rodar todo» ───────────────────────────────────────────────────
alter table public.rodados_por_deuda add column if not exists todo boolean not null default false;
alter table public.rodados_por_deuda add column if not exists deuda_restante_id uuid references public.deudas(id);

comment on column public.rodados_por_deuda.todo is
  'D-050/D-052 (mig 201): true = se rodó TODO (semanas + el acuerdo entero, que quedó en estado rodado).';
comment on column public.rodados_por_deuda.deuda_restante_id is
  'Rodar todo: la deuda que se creó con lo del acuerdo que no alcanzó a semana (el pedazo menor de $100.000).';

-- ── 2. La cuenta de «rodar todo» (sin permisos: la usan la vista previa, el aplicar y la prueba) ──
create or replace function public._calcular_rodado_todo(p_contrato uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  c public.contratos; c2 public.contratos;
  cv public.convenios; cv_vacio public.convenios;
  z record; a record; d record; m record; it jsonb;
  v_hoy date := zala.hoy();
  c_minimo constant numeric := 700000;
  c_pedazo constant numeric := 100000;
  v_valor numeric; v_pror numeric; v_cuota_rod numeric;
  v_td numeric := 0; v_conv_falta numeric := 0; v_total numeric; v_debe_todo numeric;
  v_n_full int; v_n int; v_k int; v_extra int; v_sobra numeric; v_redondea boolean := false;
  v_x numeric; v_cubre_conv numeric := 0; v_resto numeric; v_toma numeric; v_tomado_td numeric := 0;
  v_queda_conv numeric := 0; v_adelanto numeric := 0; v_conc text;
  v_razones text[] := '{}'; v_avisos text[] := '{}';
  v_deu_rod jsonb := '[]'; v_deu_tiempo jsonb := '[]'; v_deu_no jsonb := '[]'; v_deu_conv jsonb := '[]';
  v_deudas_no numeric := 0; v_previo record; v_fin_antes date; v_fin_aprox date;
begin
  select * into c from public.contratos where id = p_contrato;
  if c.id is null then raise exception 'No existe el contrato %', p_contrato; end if;
  select * into z from zala.cliente where contrato_id = p_contrato;

  -- ── Quién puede recibirlo (las mismas de la 191) ──
  if c.estado <> 'Activo' then v_razones := v_razones || 'El contrato no está activo: el rodado es solo para clientes con la moto trabajando.'::text; end if;
  if c.forma_pago <> 'Semanal' then v_razones := v_razones || 'Por ahora el rodado es solo para contratos semanales.'::text; end if;
  if not coalesce(c.motor_v2, false) or z.contrato_id is null or z.cuota_falta is null then
    v_razones := v_razones || 'Este contrato no lleva la cuenta por semanas en la app.'::text;
  end if;
  if c.total_cajas is null then v_razones := v_razones || 'El contrato no tiene definido su total de semanas.'::text; end if;
  select * into v_previo from public.rodados_por_deuda where contrato_id = p_contrato and estado <> 'anulado' order by created_at desc limit 1;
  if v_previo.id is not null then
    v_razones := v_razones || format('Ya tuvo un rodado por deuda (%s, del %s): es una sola vez por contrato.', v_previo.numero, to_char(v_previo.fecha, 'DD/MM/YYYY'));
  end if;
  if z.placa in ('ZHO34G', 'RLI25H') then
    v_avisos := v_avisos || 'Este cliente está QUIETO por decisión del dueño (21-sep). Confirme con él antes de rodar.'::text;
  end if;
  if array_length(v_razones, 1) > 0 and (z.contrato_id is null or z.cuota_falta is null or c.total_cajas is null) then
    return jsonb_build_object('puede', false, 'todo', true, 'razones', to_jsonb(v_razones), 'avisos', to_jsonb(v_avisos), 'contrato_id', p_contrato);
  end if;

  v_valor := public.caja_valor(c);

  -- ── El acuerdo: se rueda ENTERO, solo si lo que financia es tiempo ──
  if z.convenio_id is not null then
    select * into cv from public.convenios where id = z.convenio_id;
    if cv.estado <> 'activo' then
      v_razones := v_razones || format('El acuerdo #%s está %s: un acuerdo incumplido no se rueda.', cv.numero_convenio, cv.estado);
    elsif cv.partitura is null or jsonb_typeof(cv.partitura) <> 'array' or jsonb_array_length(cv.partitura) = 0 then
      v_razones := v_razones || format('El acuerdo #%s no tiene la lista de lo que financia: no se sabe si todo es tiempo, así que no se puede rodar entero.', cv.numero_convenio);
    else
      for it in select value from jsonb_array_elements(cv.partitura) loop
        if it->>'tipo' = 'semana' then
          continue;
        elsif it->>'tipo' = 'deuda' then
          v_conc := null;
          select concepto into v_conc from public.deudas where id::text = it->>'ref';
          if v_conc is null or v_conc not in ('migracion', 'tarifa_atrasada') then
            v_razones := v_razones || format('El acuerdo #%s incluye «%s», que no es tiempo: no se puede rodar entero.', cv.numero_convenio, coalesce(it->>'etiqueta', v_conc, 'una deuda'));
          else
            v_deu_conv := v_deu_conv || jsonb_build_object('deuda_id', it->>'ref', 'concepto', v_conc, 'monto', (it->>'monto')::numeric);
          end if;
        else
          v_razones := v_razones || format('El acuerdo #%s incluye «%s», que no es tiempo: no se puede rodar entero.', cv.numero_convenio, coalesce(it->>'etiqueta', it->>'tipo'));
        end if;
      end loop;
      v_conv_falta := greatest(cv.deuda_total - coalesce(z.convenio_abonado, 0), 0);
    end if;
  end if;

  -- ── La cuenta de ANTES con la función de la vitrina: debe dar lo mismo que Cartera ──
  select * into a from zala.cuenta_contrato(c, cv, coalesce(z.convenio_abonado, 0), v_hoy);
  if coalesce(a.r_cuota_falta, -1) <> coalesce(z.cuota_falta, -1) or coalesce(a.r_acuerdo_falta, 0) <> coalesce(z.acuerdo_falta, 0) then
    v_razones := v_razones || 'La cuenta no cuadra con la de Cartera para este contrato: no se puede rodar. Avisar a sistemas.'::text;
  end if;

  -- ── Lo que es TIEMPO, como un solo conjunto ──
  v_pror := coalesce(a.r_prorrateo_pendiente, 0);
  v_cuota_rod := greatest(coalesce(z.cuota_falta, 0) - v_pror, 0);
  for d in select id, concepto, descripcion, monto_pendiente from public.deudas
            where contrato_id = p_contrato and estado = 'pendiente' and monto_pendiente > 0 order by created_at, id loop
    if d.concepto in ('tarifa_atrasada', 'migracion') then
      v_td := v_td + d.monto_pendiente;
      v_deu_tiempo := v_deu_tiempo || jsonb_build_object('deuda_id', d.id, 'concepto', d.concepto, 'descripcion', d.descripcion, 'pendiente', d.monto_pendiente);
    else
      v_deudas_no := v_deudas_no + d.monto_pendiente;
      v_deu_no := v_deu_no || jsonb_build_object('deuda_id', d.id, 'concepto', d.concepto, 'que_es', zala.concepto_deuda_texto(d.concepto), 'descripcion', d.descripcion, 'pendiente', d.monto_pendiente);
    end if;
  end loop;
  v_total := v_cuota_rod + v_conv_falta + v_td;

  -- El mínimo se mide con TODO lo que debe: lo de Cartera, cambiando lo vencido del acuerdo por lo que le falta entero.
  v_debe_todo := coalesce(z.debe_hoy, 0) - coalesce(z.acuerdo_falta, 0) + v_conv_falta;
  if v_debe_todo <= c_minimo then
    v_razones := v_razones || format('Debe %s en total: el rodado es para quien debe más de $700.000.', zala.pesos(v_debe_todo));
  end if;

  -- ── Las semanas (D-052) ──
  v_n_full := floor(v_total / v_valor)::int;
  v_sobra := v_total - v_n_full * v_valor;
  v_redondea := v_sobra >= c_pedazo;
  v_n := v_n_full + case when v_redondea then 1 else 0 end;
  v_extra := case when v_n_full <= 0 then 0 when v_n_full <= 4 then 1 else 1 + floor((v_n_full - 4) / 2.0)::int end;
  if v_n < 1 and array_length(v_razones, 1) is null then
    v_razones := v_razones || format('Lo que debe en tiempo (%s) no alcanza a una semana: no hay nada que rodar.', zala.pesos(v_total));
  end if;
  if v_pror > 0 then
    v_avisos := v_avisos || format('El prorrateo de %s no se rueda: no es una semana completa. Se paga ahora.', zala.pesos(v_pror));
  end if;

  -- Semanas del contrato que se corren: todas las atrasadas, también la que está a medio pagar (lo que ya
  -- abonó de ella pasa a su próxima semana), sin pasar de las semanas que se ruedan.
  v_k := least(ceil(v_cuota_rod / v_valor)::int, v_n);
  v_adelanto := greatest(v_k * v_valor - v_cuota_rod, 0);
  -- El resto de semanas cubre primero el acuerdo y después las deudas de tiempo sueltas (D-049).
  v_x := (v_n - v_k) * v_valor;
  v_cubre_conv := least(v_x, v_conv_falta);
  v_queda_conv := v_conv_falta - v_cubre_conv;
  v_resto := v_x - v_cubre_conv;
  for m in select value from jsonb_array_elements(v_deu_tiempo) loop
    exit when v_resto <= 0;
    v_toma := least(v_resto, (m.value->>'pendiente')::numeric);
    v_deu_rod := v_deu_rod || jsonb_build_object('deuda_id', m.value->>'deuda_id', 'concepto', m.value->>'concepto',
      'descripcion', m.value->>'descripcion', 'monto', v_toma, 'completa', v_toma = (m.value->>'pendiente')::numeric);
    v_tomado_td := v_tomado_td + v_toma;
    v_resto := v_resto - v_toma;
  end loop;

  -- ── La cuenta de DESPUÉS, con la misma función: el contrato con las semanas corridas y sin acuerdo ──
  c2 := c;
  c2.cajas_exoneradas := coalesce(c.cajas_exoneradas, 0) + greatest(v_k, 0);
  c2.total_cajas := c.total_cajas + greatest(v_n - v_k, 0) + v_extra;
  select * into a from zala.cuenta_contrato(c2, cv_vacio, 0, v_hoy);

  -- Candado: las cuotas tienen que bajar EXACTO lo que se corrió.
  if v_n >= 1 and coalesce(z.cuota_falta, 0) - coalesce(a.r_cuota_falta, 0) <> least(greatest(v_k, 0) * v_valor, v_cuota_rod) then
    v_razones := v_razones || format('Al correr las semanas, la cuenta de este contrato no baja exacto (baja %s y debería bajar %s). No se puede rodar: avisar a sistemas.',
      zala.pesos(coalesce(z.cuota_falta, 0) - coalesce(a.r_cuota_falta, 0)), zala.pesos(least(greatest(v_k, 0) * v_valor, v_cuota_rod)));
  end if;

  v_fin_antes := zala.fecha_caja(c, c.total_cajas + coalesce(c.cajas_exoneradas, 0)) + 7;
  v_fin_aprox := zala.fecha_caja(c2, c2.total_cajas + coalesce(c2.cajas_exoneradas, 0)) + 7;

  return jsonb_build_object(
    'puede', array_length(v_razones, 1) is null,
    'todo', true,
    'razones', to_jsonb(v_razones),
    'avisos', to_jsonb(v_avisos),
    'contrato_id', c.id, 'cliente_id', c.cliente_id, 'cliente', z.cliente, 'cedula', z.cedula, 'placa', z.placa, 'grupo', z.grupo,
    'valor_semana', v_valor, 'hoy', v_hoy,
    'antes', jsonb_build_object('cuotas', z.cuota_falta, 'acuerdo', coalesce(z.acuerdo_falta, 0), 'deudas', coalesce(z.deudas_falta, 0),
                                'total', z.debe_hoy, 'estado', z.estado_cartera, 'dias_mora', z.dias_mora),
    'debe_todo', v_debe_todo,
    'prorrateo', v_pror,
    'cuotas_rodables', v_cuota_rod,
    'deudas_tiempo', v_deu_tiempo,
    'deudas_no_rodables', v_deu_no,
    'tiempo_total', v_total,
    'semanas_completas', v_n_full,
    'pedazo', v_sobra,
    'pedazo_se_rueda', v_redondea,
    'cajas_corridas', greatest(v_k, 0),
    'adelanto_proxima_semana', v_adelanto,
    'proxima_semana', v_valor - v_adelanto,
    'deudas_rodadas', v_deu_rod,
    'monto_deudas_rodadas', v_tomado_td,
    'semanas_rodadas', greatest(v_n, 0),
    'semanas_extra', v_extra,
    'semanas_a_cobrar', greatest(v_n, 0) + v_extra,
    'monto_rodado', greatest(v_n, 0) * v_valor,
    'monto_a_cobrar', (greatest(v_n, 0) + v_extra) * v_valor,
    'sobrante', greatest(v_total - greatest(v_n, 0) * v_valor, 0),
    'acuerdo', case when cv.id is null then null else jsonb_build_object(
        'convenio_id', cv.id, 'numero', cv.numero_convenio, 'cuota', cv.cuota_por_periodo,
        'deuda_total', cv.deuda_total, 'abonado', coalesce(z.convenio_abonado, 0),
        'falta_antes', v_conv_falta, 'periodos_corridos', 0, 'monto_corrido', v_cubre_conv,
        'queda', v_queda_conv, 'deudas', v_deu_conv,
        'fecha_limite_antes', cv.fecha_limite, 'fecha_limite_despues', cv.fecha_limite) end,
    'despues', jsonb_build_object('cuotas', coalesce(a.r_cuota_falta, 0), 'acuerdo', 0,
                                  'deudas', v_deudas_no + (v_td - v_tomado_td) + v_queda_conv,
                                  'total', coalesce(a.r_cuota_falta, 0) + v_deudas_no + (v_td - v_tomado_td) + v_queda_conv,
                                  'estado', a.r_estado_cartera, 'dias_mora', a.r_dias_mora),
    'total_cajas_antes', c.total_cajas, 'total_cajas_despues', c2.total_cajas,
    'exoneradas_antes', coalesce(c.cajas_exoneradas, 0), 'exoneradas_despues', c2.cajas_exoneradas,
    'fecha_fin_antes', v_fin_antes, 'fecha_fin_aprox', v_fin_aprox
  );
end $$;

revoke all on function public._calcular_rodado_todo(uuid) from public, anon, authenticated;

-- ── 3. La vista previa: con p_todo = false es EXACTAMENTE la de antes ─────────────────────────
drop function if exists public.calcular_rodado_por_deuda(uuid);
create or replace function public.calcular_rodado_por_deuda(p_contrato uuid, p_todo boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.puede_accion('rodar_por_deuda') then
    raise exception 'No tiene permiso para rodar por deuda.';
  end if;
  if coalesce(p_todo, false) then return public._calcular_rodado_todo(p_contrato); end if;
  return public._calcular_rodado_por_deuda(p_contrato);
end $$;

revoke all on function public.calcular_rodado_por_deuda(uuid, boolean) from public, anon;
grant execute on function public.calcular_rodado_por_deuda(uuid, boolean) to authenticated;

-- ── 4. Aplicar: con p_todo = false hace lo mismo que la 191; con true cierra el acuerdo ───────
drop function if exists public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int);
create or replace function public.aplicar_rodado_por_deuda(
  p_contrato uuid, p_video_url text, p_documento_url text, p_firma_cliente_url text,
  p_firma_acompanante_url text default null, p_semanas_esperadas int default null, p_todo boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v jsonb; v_r public.rodados_por_deuda; d jsonb; n int; v_yo uuid := auth.uid(); v_aud text;
  v_todo boolean := coalesce(p_todo, false); v_conv uuid; v_queda numeric; v_deuda_nueva uuid;
begin
  if not public.puede_accion('rodar_por_deuda') then raise exception 'No tiene permiso para rodar por deuda.'; end if;
  if v_yo is null then raise exception 'Hay que entrar a la app para rodar.'; end if;
  if coalesce(btrim(p_video_url), '') = '' then raise exception 'Falta el video del cliente: sin video no se puede rodar.'; end if;
  if coalesce(btrim(p_documento_url), '') = '' or coalesce(btrim(p_firma_cliente_url), '') = '' then
    raise exception 'Falta el documento firmado por el cliente.';
  end if;

  perform 1 from public.contratos where id = p_contrato for update;   -- dos clics a la vez: el segundo espera y ve el primero
  v := case when v_todo then public._calcular_rodado_todo(p_contrato) else public._calcular_rodado_por_deuda(p_contrato) end;
  if not (v->>'puede')::boolean then
    raise exception 'No se puede rodar: %', array_to_string(array(select jsonb_array_elements_text(v->'razones')), ' ');
  end if;
  if p_semanas_esperadas is not null and (v->>'semanas_rodadas')::int <> p_semanas_esperadas then
    raise exception 'La cuenta cambió mientras se hacía el documento (eran % semanas, ahora %). Vuelva a abrir el rodado.',
      p_semanas_esperadas, v->>'semanas_rodadas';
  end if;

  -- 1. El contrato: las semanas atrasadas se corren y el contrato se alarga
  update public.contratos
     set cajas_exoneradas = (v->>'exoneradas_despues')::int,
         total_cajas      = (v->>'total_cajas_despues')::int,
         fecha_fin_contrato = coalesce((v->>'fecha_fin_aprox')::date, fecha_fin_contrato)
   where id = p_contrato;

  -- 2. Las deudas de tiempo sueltas que se rodaron
  for d in select * from jsonb_array_elements(v->'deudas_rodadas') loop
    update public.deudas
       set monto_pendiente = monto_pendiente - (d->>'monto')::numeric,
           estado = case when (d->>'completa')::boolean then 'rodada' else estado end
     where id = (d->>'deuda_id')::uuid and estado = 'pendiente' and monto_pendiente >= (d->>'monto')::numeric;
    get diagnostics n = row_count;
    if n <> 1 then raise exception 'La deuda % cambió mientras se rodaba. No se guardó nada.', d->>'deuda_id'; end if;
  end loop;

  -- 3. El acuerdo
  if not v_todo then
    -- El rodado de siempre: sus cuotas atrasadas se corren al final del mismo acuerdo
    if (v->'acuerdo') is not null and coalesce((v->'acuerdo'->>'periodos_corridos')::int, 0) > 0 then
      update public.convenios
         set periodos_exonerados = coalesce(periodos_exonerados, 0) + (v->'acuerdo'->>'periodos_corridos')::int,
             fecha_limite = (v->'acuerdo'->>'fecha_limite_despues')::date
       where id = (v->'acuerdo'->>'convenio_id')::uuid and estado = 'activo';
      get diagnostics n = row_count;
      if n <> 1 then raise exception 'El acuerdo cambió mientras se rodaba. No se guardó nada.'; end if;
    end if;
  elsif (v->'acuerdo') is not null then
    -- Rodar todo: el acuerdo entero pasó a semanas. Sus deudas primero (para que ningún disparador del
    -- acuerdo las devuelva a 'pendiente'), después el acuerdo queda 'rodado' y ya no lo cobra nadie.
    v_conv := (v->'acuerdo'->>'convenio_id')::uuid;
    update public.deudas
       set monto_pendiente = 0, estado = 'rodada'
     where contrato_id = p_contrato and estado = 'en_convenio'
       and id::text in (select e->>'deuda_id' from jsonb_array_elements(v->'acuerdo'->'deudas') as t(e));
    update public.convenios set estado = 'rodado' where id = v_conv and estado = 'activo';
    get diagnostics n = row_count;
    if n <> 1 then raise exception 'El acuerdo cambió mientras se rodaba. No se guardó nada.'; end if;
    if exists (select 1 from public.deudas where contrato_id = p_contrato and estado <> 'rodada'
                 and id::text in (select e->>'deuda_id' from jsonb_array_elements(v->'acuerdo'->'deudas') as t(e))) then
      raise exception 'Una deuda del acuerdo no quedó rodada. No se guardó nada: avisar a sistemas.';
    end if;
    -- Lo del acuerdo que no alcanzó a semana (el pedazo menor de $100.000): queda como deuda que se paga ya.
    v_queda := coalesce((v->'acuerdo'->>'queda')::numeric, 0);
    if v_queda > 0 then
      insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por)
      values (p_contrato, 'tarifa_atrasada',
              format('Lo que quedó del acuerdo #%s al rodarlo todo (no alcanzó a una semana)', v->'acuerdo'->>'numero'),
              v_queda, v_queda, 'pendiente', v_yo)
      returning id into v_deuda_nueva;
    end if;
  end if;

  -- 4. El registro
  insert into public.rodados_por_deuda (
    contrato_id, cliente_id, creado_por, valor_semana, debia_total, debia_cuotas, debia_acuerdo, debia_deudas,
    cajas_corridas, deudas_rodadas, monto_deudas_rodadas, semanas_rodadas, semanas_extra, semanas_a_cobrar,
    monto_rodado, monto_a_cobrar, sobrante, queda_debiendo, total_cajas_antes, total_cajas_despues,
    exoneradas_antes, exoneradas_despues, convenio_id, acuerdo_periodos_corridos, acuerdo_monto_corrido,
    acuerdo_fecha_limite_antes, acuerdo_fecha_limite_despues, fecha_fin_antes, fecha_fin_aprox,
    documento_url, firma_cliente_url, firma_acompanante_url, video_url, calculo, todo, deuda_restante_id)
  values (
    p_contrato, (v->>'cliente_id')::uuid, v_yo, (v->>'valor_semana')::numeric,
    coalesce((v->>'debe_todo')::numeric, (v->'antes'->>'total')::numeric), (v->'antes'->>'cuotas')::numeric,
    case when v_todo then coalesce((v->'acuerdo'->>'falta_antes')::numeric, 0) else (v->'antes'->>'acuerdo')::numeric end,
    (v->'antes'->>'deudas')::numeric,
    (v->>'cajas_corridas')::int, v->'deudas_rodadas', (v->>'monto_deudas_rodadas')::numeric,
    (v->>'semanas_rodadas')::int, (v->>'semanas_extra')::int, (v->>'semanas_a_cobrar')::int,
    (v->>'monto_rodado')::numeric, (v->>'monto_a_cobrar')::numeric, (v->>'sobrante')::numeric, (v->'despues'->>'total')::numeric,
    (v->>'total_cajas_antes')::int, (v->>'total_cajas_despues')::int, (v->>'exoneradas_antes')::int, (v->>'exoneradas_despues')::int,
    (v->'acuerdo'->>'convenio_id')::uuid, coalesce((v->'acuerdo'->>'periodos_corridos')::int, 0), coalesce((v->'acuerdo'->>'monto_corrido')::numeric, 0),
    (v->'acuerdo'->>'fecha_limite_antes')::date, (v->'acuerdo'->>'fecha_limite_despues')::date,
    (v->>'fecha_fin_antes')::date, (v->>'fecha_fin_aprox')::date,
    p_documento_url, p_firma_cliente_url, nullif(btrim(coalesce(p_firma_acompanante_url, '')), ''), p_video_url, v,
    v_todo, v_deuda_nueva)
  returning * into v_r;

  -- 5. El rastro en el historial del contrato. El primer renglón lleva "exoneradas N" en el formato
  --    que lee la nómina (rodadasDesdeRegistros): así cuenta estas semanas corridas como las demás.
  v_aud := format('%s%s: debía %s; se rodaron %s semanas (%s); al final paga %s semanas (%s); queda debiendo hoy %s; fin aprox %s. Documento: %s · Video: %s',
    v_r.numero, case when v_todo then ' (rodar todo)' else '' end, zala.pesos(v_r.debia_total), v_r.semanas_rodadas, zala.pesos(v_r.monto_rodado), v_r.semanas_a_cobrar,
    zala.pesos(v_r.monto_a_cobrar), zala.pesos(v_r.queda_debiendo), to_char(v_r.fecha_fin_aprox, 'DD/MM/YYYY'),
    v_r.documento_url, v_r.video_url);
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (p_contrato, 'Rodado por deuda ' || v_r.numero,
     format('exoneradas %s · total de semanas %s', v_r.exoneradas_antes, v_r.total_cajas_antes),
     format('exoneradas %s · total de semanas %s — %s', v_r.exoneradas_despues, v_r.total_cajas_despues, v_aud), v_yo);
  for d in select * from jsonb_array_elements(v_r.deudas_rodadas) loop
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
      (p_contrato, 'Deuda rodada (' || v_r.numero || ')',
       format('%s — %s · se rodaron %s', d->>'concepto', coalesce(d->>'descripcion', ''), zala.pesos((d->>'monto')::numeric)),
       case when (d->>'completa')::boolean then 'rodada completa: pasa a las semanas del final' else 'rodada en parte: el resto sigue pendiente' end, v_yo);
  end loop;
  if v_todo and v_r.convenio_id is not null then
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
    select p_contrato, format('Convenio #%s rodado entero (%s)', cv.numero_convenio, v_r.numero),
           format('estado=activo · le faltaban %s de %s', zala.pesos(v_r.debia_acuerdo), zala.pesos(cv.deuda_total)),
           format('estado=rodado · pasó a las semanas del final%s', case when v_deuda_nueva is not null
             then format('; lo que no alcanzó a semana (%s) queda como deuda', zala.pesos((v->'acuerdo'->>'queda')::numeric)) else '' end), v_yo
      from public.convenios cv where cv.id = v_r.convenio_id;
  elsif v_r.acuerdo_periodos_corridos > 0 then
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
    select p_contrato, format('Convenio #%s: cuotas corridas al final', cv.numero_convenio),
           format('fecha_limite=%s', v_r.acuerdo_fecha_limite_antes),
           format('se corrieron %s cuotas (%s atrasados) · fecha_limite=%s — rodado por deuda %s',
                  v_r.acuerdo_periodos_corridos, zala.pesos(v_r.acuerdo_monto_corrido), v_r.acuerdo_fecha_limite_despues, v_r.numero), v_yo
      from public.convenios cv where cv.id = v_r.convenio_id;
  end if;

  return to_jsonb(v_r);
end $$;

revoke all on function public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int, boolean) from public, anon;
grant execute on function public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int, boolean) to authenticated;

-- ── 5. ZALA: la vitrina sabe del rodado entero y del estado nuevo del acuerdo (regla de la vitrina) ──
create or replace view zala.rodado as
select r.contrato_id, r.numero, r.fecha, r.semanas_rodadas, r.semanas_a_cobrar, r.monto_rodado, r.monto_a_cobrar,
       r.fecha_fin_aprox, r.estado, r.todo
  from public.rodados_por_deuda r
 where r.estado <> 'anulado';
grant select on zala.rodado to zala_lector;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('rodado', 'todo', 'true = se le rodó TODO: las semanas atrasadas y el acuerdo de pago entero, que quedó cerrado (D-050). Desde ese día solo paga su semana normal.', 'true · false', 'solo si pregunta', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

-- El estado del acuerdo: se le agrega 'rodado' a lo que ya diga la fila viva (no se pisa el resto).
update zala.diccionario
   set valores = coalesce(nullif(valores, ''), 'activo · cumplido · incumplido') || ' · rodado',
       significado = significado || ' rodado = el acuerdo entero se pasó a semanas al final del contrato (rodar todo, D-050): ya no se cobra.',
       actualizado = now()
 where vista = 'convenios' and columna = 'estado' and coalesce(valores, '') not like '%rodado%';
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno)
select 'convenios', 'estado',
       'Estado del acuerdo de pago. rodado = el acuerdo entero se pasó a semanas al final del contrato (rodar todo, D-050): ya no se cobra.',
       'activo · cumplido · incumplido · rodado', 'no', true
 where not exists (select 1 from zala.diccionario where vista = 'convenios' and columna = 'estado');

-- ── 6. LA PRUEBA, con los clientes reales y SIN guardar nada en ellos ────────────────────────
do $prueba$
declare r record; v jsonb; v_txt text := ''; n int := 0;
begin
  for r in select z.contrato_id, z.placa from zala.cliente z
            where z.contrato_estado in ('Activo', 'Suspendido') and z.convenio_id is not null and z.debe_hoy > 300000
            order by z.debe_hoy desc limit 15 loop
    v := public._calcular_rodado_todo(r.contrato_id);
    n := n + 1;
    v_txt := v_txt || format(E'\n  %s: debe todo %s → %s completas, pedazo %s %s → rueda %s, paga %s al final · hoy queda %s · próxima semana %s · %s',
      r.placa, v->>'debe_todo', v->>'semanas_completas', v->>'pedazo',
      case when (v->>'pedazo_se_rueda')::boolean then '(se rueda)' else '(se paga)' end,
      v->>'semanas_rodadas', v->>'semanas_a_cobrar', v->'despues'->>'total', v->>'proxima_semana',
      coalesce(v->'razones'->>0, 'SE PUEDE'));
  end loop;
  raise notice 'PRUEBA rodar todo (vista previa, % contratos):%', n, v_txt;
end
$prueba$;

select public.registrar_migracion(201, '201_rodar_todo.sql',
  'Rodar todo (D-050/D-052): las semanas atrasadas y el acuerdo entero pasan a semanas al final; el pedazo de $100.000 o más se rueda como una semana sin recargo');

commit;

-- ─── VERIFICACIÓN — OMAR AGUSTIN (RMM66H): la vista previa de rodar todo (no guarda nada) ──────
-- Debe dar: debe todo $3.064.000 · 15 completas · pedazo $139.000 (se rueda) · 16 semanas rodadas ·
-- 22 al final · hoy queda $0 · próxima semana $147.000 (su semana menos los $48.000 que ya tenía).
-- La única razón para no poder todavía: "El contrato no está activo" (falta devolverle la moto).
select v->>'debe_todo' as debe_todo, v->>'semanas_completas' as completas, v->>'pedazo' as pedazo,
       v->>'pedazo_se_rueda' as se_rueda, v->>'semanas_rodadas' as rodadas, v->>'semanas_a_cobrar' as al_final,
       v->'despues'->>'total' as hoy_queda, v->>'proxima_semana' as proxima_semana, v->'razones' as razones
  from (select public._calcular_rodado_todo(c.id) as v
          from public.contratos c join public.motos m on m.id = c.moto_id
         where m.placa = 'RMM66H' order by c.created_at desc limit 1) x;
