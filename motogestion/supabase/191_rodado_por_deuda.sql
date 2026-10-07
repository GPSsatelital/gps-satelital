-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 191 — RODAR POR DEUDA (D-044, 6-oct-2026, decidido con el dueño pregunta por pregunta)
--
-- PARA QUÉ: a unos pocos clientes con deudas grandes (más de $700.000) se les rueda el TIEMPO que deben
-- al final del contrato, con un poco más por el desgaste extra de la moto, para que esa deuda no les
-- siga saliendo en mora.
--
-- LAS REGLAS (D-044):
--   · Solo contratos Activos y Semanales que deban más de $700.000. Una sola vez por contrato.
--   · Solo se rueda lo que es TIEMPO: semanas atrasadas del contrato y deudas de 'tarifa_atrasada' y
--     'migracion'. Repuestos, préstamos, daños, alquiler de la prestada, multas y lavadas NO.
--   · Solo semanas completas. Lo que sobra (menos de una semana) se paga ahora.
--   · Semanas que se cobran al final: hasta 4 rodadas, una más; desde la 5ª, una más por cada 2
--     completas (3→4 · 4→5 · 5→6 · 6→8 · 7→9 · 8→11 · 10→14). Son semanas NORMALES (con su ahorro).
--   · Lo atrasado del acuerdo de pago se corre al final del MISMO acuerdo (periodos_exonerados, mig 118).
--   · Si se va antes, la liquidación cobra lo rodado SIN el recargo (`rodado_pendiente_liquidacion`).
--   · Permiso 'rodar_por_deuda': de entrada solo ADMIN_PRINCIPAL (puede_accion le da todo); a otros se
--     les prende desde Usuarios. Documento firmado y video OBLIGATORIOS.
--
-- CÓMO LO HACE SIN DAÑAR NADA: usa los dos mecanismos probados desde agosto —
--   `contratos.cajas_exoneradas` (mig 078: la curva de exigencia se corre, las semanas se pagan al
--   final) y `convenios.periodos_exonerados` (mig 118)— y la cuenta de ANTES y DESPUÉS sale de
--   `zala.cuenta_contrato`, la MISMA que usa la vitrina (espejo de loQueDebe). No se escribe ninguna
--   fórmula de plata nueva. Las deudas de tiempo rodadas quedan con estado 'rodada' (o con su pendiente
--   rebajado, si se rodó solo una parte): ninguna pantalla las cobra, y el detalle queda en el rodado.
--
-- QUÉ AGREGA: tabla `rodados_por_deuda` · estado 'rodada' en deudas · `calcular_rodado_por_deuda()`
-- (vista previa) · `aplicar_rodado_por_deuda()` (una transacción, con candado) ·
-- `rodado_pendiente_liquidacion()` · vista `zala.rodado` + diccionario.
-- QUÉ NO TOCA: ninguna cifra de ningún cliente. Mientras nadie use el botón, nada cambia.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   (si ya se usó con algún cliente, primero revertir cada rodado a mano con su rastro)
--   drop view if exists zala.rodado;
--   delete from zala.diccionario where vista = 'rodado';
--   drop function if exists public.rodado_pendiente_liquidacion(uuid, date);
--   drop function if exists public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int);
--   drop function if exists public.calcular_rodado_por_deuda(uuid);
--   drop function if exists public._calcular_rodado_por_deuda(uuid);
--   drop table if exists public.rodados_por_deuda;  drop sequence if exists public.rodados_numero_seq;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1. Las deudas aceptan el estado 'rodada' (sobre la regla VIVA, si existe) ────────────────
do $est$
declare v_con text; v_def text;
begin
  select conname, pg_get_constraintdef(oid) into v_con, v_def from pg_constraint
   where conrelid = 'public.deudas'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%estado%'
   limit 1;
  if v_con is null then
    raise notice 'deudas.estado no tiene regla de valores: ''rodada'' entra sin cambios.';
  elsif v_def ilike '%rodada%' then
    raise notice 'La regla de deudas.estado ya acepta ''rodada''.';
  else
    if v_def not ilike '%''pendiente''%' or v_def not ilike '%''pagada''%' then
      raise exception '191 ABORTADA: la regla de deudas.estado no es la que se esperaba (%). NO se tocó nada.', v_def;
    end if;
    execute format('alter table public.deudas drop constraint %I', v_con);
    execute format('alter table public.deudas add constraint %I %s', v_con,
                   regexp_replace(v_def, '''pagada''', '''pagada'', ''rodada''', 'i'));
    raise notice 'deudas.estado: se agregó ''rodada'' (antes: %).', v_def;
  end if;
end
$est$;

-- ── 2. El registro de cada rodado ───────────────────────────────────────────────────────────
create sequence if not exists public.rodados_numero_seq;

create table if not exists public.rodados_por_deuda (
  id                       uuid primary key default gen_random_uuid(),
  numero                   text not null unique default ('ROD-' || lpad(nextval('public.rodados_numero_seq')::text, 4, '0')),
  contrato_id              uuid not null references public.contratos(id),
  cliente_id               uuid,
  fecha                    date not null default (now() at time zone 'America/Bogota')::date,
  creado_por               uuid not null references public.profiles(id),
  valor_semana             numeric not null,
  -- Lo que debía en el momento (la cuenta de Cartera)
  debia_total              numeric not null,
  debia_cuotas             numeric not null,
  debia_acuerdo            numeric not null,
  debia_deudas             numeric not null,
  -- Lo que se rodó
  cajas_corridas           int not null,                 -- semanas atrasadas que se corrieron (cajas_exoneradas)
  deudas_rodadas           jsonb not null default '[]',  -- [{deuda_id, concepto, descripcion, monto, completa}]
  monto_deudas_rodadas     numeric not null,
  semanas_rodadas          int not null,                 -- semanas completas de tiempo rodadas
  semanas_extra            int not null,                 -- el recargo por el desgaste
  semanas_a_cobrar         int not null,                 -- las que paga al final
  monto_rodado             numeric not null,             -- semanas_rodadas × valor_semana
  monto_a_cobrar           numeric not null,             -- semanas_a_cobrar × valor_semana
  sobrante                 numeric not null,             -- lo de tiempo que no alcanzó semana: lo paga ahora
  queda_debiendo           numeric not null,             -- lo que le queda hoy, con la cuenta de Cartera
  total_cajas_antes        int not null,
  total_cajas_despues      int not null,
  exoneradas_antes         int not null,
  exoneradas_despues       int not null,
  -- El acuerdo de pago (sus cuotas atrasadas se corren al final del mismo acuerdo)
  convenio_id              uuid references public.convenios(id),
  acuerdo_periodos_corridos int not null default 0,
  acuerdo_monto_corrido    numeric not null default 0,
  acuerdo_fecha_limite_antes   date,
  acuerdo_fecha_limite_despues date,
  fecha_fin_antes          date,
  fecha_fin_aprox          date,
  -- La evidencia (obligatoria)
  documento_url            text not null,
  firma_cliente_url        text not null,
  firma_acompanante_url    text,
  video_url                text not null,
  estado                   text not null default 'vigente'
                           check (estado in ('vigente', 'saldado', 'cobrado_en_liquidacion', 'anulado')),
  calculo                  jsonb not null,               -- la vista previa completa que se aceptó
  created_at               timestamptz not null default now()
);

comment on table public.rodados_por_deuda is
  'Rodado por deuda (D-044, mig 191): el tiempo que debía un cliente se pasó al final del contrato, con recargo. Lo escribe SOLO aplicar_rodado_por_deuda(). Una vez por contrato.';

create unique index if not exists rodados_por_deuda_uno_por_contrato
  on public.rodados_por_deuda(contrato_id) where estado <> 'anulado';

alter table public.rodados_por_deuda enable row level security;
drop policy if exists rodados_por_deuda_lee on public.rodados_por_deuda;
create policy rodados_por_deuda_lee on public.rodados_por_deuda
  for select to authenticated
  using (exists (select 1 from public.contratos c where c.id = rodados_por_deuda.contrato_id));

-- ── 3. La cuenta (sin permisos: la usan la vista previa, el aplicar y la prueba de abajo) ─────
create or replace function public._calcular_rodado_por_deuda(p_contrato uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  c public.contratos; c2 public.contratos;
  cv public.convenios; cv2 public.convenios;
  z record; a record; d record; m record;
  v_hoy date := zala.hoy();
  v_valor numeric; v_pror numeric; v_cuota_rod numeric; v_k_max int; v_k int; v_n int; v_x numeric;
  v_td numeric := 0; v_dt numeric; v_extra int; v_resto numeric; v_toma numeric;
  v_j int := 0; v_razones text[] := '{}'; v_avisos text[] := '{}';
  v_deu_rod jsonb := '[]'; v_deu_tiempo jsonb := '[]'; v_deu_no jsonb := '[]';
  v_deudas_total numeric := 0; v_previo record; v_fin_antes date; v_fin_aprox date;
  v_conv_falta numeric := 0; v_conv_lim2 date;
begin
  select * into c from public.contratos where id = p_contrato;
  if c.id is null then raise exception 'No existe el contrato %', p_contrato; end if;
  select * into z from zala.cliente where contrato_id = p_contrato;

  -- ── Quién puede recibirlo ──
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
  if coalesce(z.debe_hoy, 0) <= 700000 then
    v_razones := v_razones || format('Debe %s: el rodado es para quien debe más de $700.000.', zala.pesos(coalesce(z.debe_hoy, 0)));
  end if;
  if z.placa in ('ZHO34G', 'RLI25H') then
    v_avisos := v_avisos || 'Este cliente está QUIETO por decisión del dueño (21-sep). Confirme con él antes de rodar.'::text;
  end if;
  if array_length(v_razones, 1) > 0 and (z.contrato_id is null or z.cuota_falta is null or c.total_cajas is null) then
    return jsonb_build_object('puede', false, 'razones', to_jsonb(v_razones), 'avisos', to_jsonb(v_avisos), 'contrato_id', p_contrato);
  end if;

  v_valor := public.caja_valor(c);
  if z.convenio_id is not null then select * into cv from public.convenios where id = z.convenio_id; end if;

  -- ── La cuenta de ANTES con la función de la vitrina: debe dar lo mismo que Cartera ──
  select * into a from zala.cuenta_contrato(c, cv, coalesce(z.convenio_abonado, 0), v_hoy);
  if coalesce(a.r_cuota_falta, -1) <> coalesce(z.cuota_falta, -1) or coalesce(a.r_acuerdo_falta, 0) <> coalesce(z.acuerdo_falta, 0) then
    v_razones := v_razones || 'La cuenta no cuadra con la de Cartera para este contrato: no se puede rodar. Avisar a sistemas.'::text;
  end if;

  -- ── Lo que es TIEMPO ──
  v_pror := coalesce(a.r_prorrateo_pendiente, 0);
  v_cuota_rod := greatest(coalesce(z.cuota_falta, 0) - v_pror, 0);
  v_k_max := floor(v_cuota_rod / v_valor)::int;
  for d in select id, concepto, descripcion, monto_pendiente from public.deudas
            where contrato_id = p_contrato and estado = 'pendiente' and monto_pendiente > 0 order by created_at, id loop
    v_deudas_total := v_deudas_total + d.monto_pendiente;
    if d.concepto in ('tarifa_atrasada', 'migracion') then
      v_td := v_td + d.monto_pendiente;
      v_deu_tiempo := v_deu_tiempo || jsonb_build_object('deuda_id', d.id, 'concepto', d.concepto, 'descripcion', d.descripcion, 'pendiente', d.monto_pendiente);
    else
      v_deu_no := v_deu_no || jsonb_build_object('deuda_id', d.id, 'concepto', d.concepto, 'que_es', zala.concepto_deuda_texto(d.concepto), 'descripcion', d.descripcion, 'pendiente', d.monto_pendiente);
    end if;
  end loop;
  v_dt := v_cuota_rod + v_td;

  -- Semanas completas: primero las atrasadas enteras del contrato, después las deudas de tiempo.
  v_n := floor(v_dt / v_valor)::int;
  v_k := least(v_k_max, v_n);
  if (v_n - v_k) * v_valor > v_td then v_n := v_k + floor(v_td / v_valor)::int; end if;
  v_x := (v_n - v_k) * v_valor;
  if v_n < 1 and array_length(v_razones, 1) is null then
    v_razones := v_razones || format('Lo que debe en tiempo (%s) no alcanza a una semana completa: no hay nada que rodar.', zala.pesos(v_dt));
  end if;
  v_extra := case when v_n <= 0 then 0 when v_n <= 4 then 1 else 1 + floor((v_n - 4) / 2.0)::int end;
  if v_pror > 0 then
    v_avisos := v_avisos || format('El prorrateo de %s no se rueda: no es una semana completa. Se paga ahora.', zala.pesos(v_pror));
  end if;

  -- Qué deudas de tiempo se ruedan (las más viejas primero; la última puede quedar a medias)
  v_resto := v_x;
  for m in select * from jsonb_array_elements(v_deu_tiempo) loop
    exit when v_resto <= 0;
    v_toma := least(v_resto, (m.value->>'pendiente')::numeric);
    v_deu_rod := v_deu_rod || jsonb_build_object('deuda_id', m.value->>'deuda_id', 'concepto', m.value->>'concepto',
      'descripcion', m.value->>'descripcion', 'monto', v_toma, 'completa', v_toma = (m.value->>'pendiente')::numeric);
    v_resto := v_resto - v_toma;
  end loop;

  -- ── La cuenta de DESPUÉS, con la misma función: el contrato con las semanas corridas y alargado ──
  c2 := c;
  c2.cajas_exoneradas := coalesce(c.cajas_exoneradas, 0) + greatest(v_k, 0);
  c2.total_cajas := c.total_cajas + greatest(v_n - v_k, 0) + v_extra;
  cv2 := cv;
  -- El acuerdo: se corren las cuotas que hagan falta para que no quede nada atrasado
  if cv.id is not null and coalesce(a.r_acuerdo_falta, 0) > 0 and v_n >= 1 then
    v_conv_falta := a.r_acuerdo_falta;
    for i in 1..60 loop
      v_j := i;   -- (la variable del for vive solo dentro del for: se copia afuera)
      cv2 := cv;
      cv2.periodos_exonerados := coalesce(cv.periodos_exonerados, 0) + v_j;
      cv2.fecha_limite := cv.fecha_limite + 7 * v_j;
      select * into a from zala.cuenta_contrato(c2, cv2, coalesce(z.convenio_abonado, 0), v_hoy);
      exit when coalesce(a.r_acuerdo_falta, 0) = 0;
    end loop;
    if coalesce(a.r_acuerdo_falta, 0) > 0 then
      v_j := 0; cv2 := cv;
      v_avisos := v_avisos || format('Lo atrasado del acuerdo #%s (%s) no se pudo correr: se le sigue cobrando.', cv.numero_convenio, zala.pesos(v_conv_falta));
    end if;
  else
    v_j := 0;
  end if;
  select * into a from zala.cuenta_contrato(c2, cv2, coalesce(z.convenio_abonado, 0), v_hoy);

  -- Candado: las cuotas tienen que bajar EXACTO lo que se corrió. Si no (un acuerdo que cubre semanas,
  -- un contrato que ya pasó su total), este contrato no se rueda por aquí.
  if v_n >= 1 and coalesce(z.cuota_falta, 0) - coalesce(a.r_cuota_falta, 0) <> greatest(v_k, 0) * v_valor then
    v_razones := v_razones || format('Al correr las semanas, la cuenta de este contrato no baja exacto (baja %s y debería bajar %s). No se puede rodar por aquí: avisar a sistemas.',
      zala.pesos(coalesce(z.cuota_falta, 0) - coalesce(a.r_cuota_falta, 0)), zala.pesos(greatest(v_k, 0) * v_valor));
  end if;

  -- Fecha aproximada de fin: el día de la última semana, con las corridas, más una semana
  v_fin_antes := zala.fecha_caja(c, c.total_cajas + coalesce(c.cajas_exoneradas, 0)) + 7;
  v_fin_aprox := zala.fecha_caja(c2, c2.total_cajas + coalesce(c2.cajas_exoneradas, 0)) + 7;
  v_conv_lim2 := cv2.fecha_limite;

  return jsonb_build_object(
    'puede', array_length(v_razones, 1) is null,
    'razones', to_jsonb(v_razones),
    'avisos', to_jsonb(v_avisos),
    'contrato_id', c.id, 'cliente_id', c.cliente_id, 'cliente', z.cliente, 'cedula', z.cedula, 'placa', z.placa, 'grupo', z.grupo,
    'valor_semana', v_valor, 'hoy', v_hoy,
    'antes', jsonb_build_object('cuotas', z.cuota_falta, 'acuerdo', coalesce(z.acuerdo_falta, 0), 'deudas', coalesce(z.deudas_falta, 0),
                                'total', z.debe_hoy, 'estado', z.estado_cartera, 'dias_mora', z.dias_mora),
    'prorrateo', v_pror,
    'cuotas_rodables', v_cuota_rod,
    'deudas_tiempo', v_deu_tiempo,
    'deudas_no_rodables', v_deu_no,
    'tiempo_total', v_dt,
    'cajas_corridas', greatest(v_k, 0),
    'deudas_rodadas', v_deu_rod,
    'monto_deudas_rodadas', greatest(v_x, 0),
    'semanas_rodadas', greatest(v_n, 0),
    'semanas_extra', v_extra,
    'semanas_a_cobrar', greatest(v_n, 0) + v_extra,
    'monto_rodado', greatest(v_n, 0) * v_valor,
    'monto_a_cobrar', (greatest(v_n, 0) + v_extra) * v_valor,
    'sobrante', v_dt - greatest(v_n, 0) * v_valor,
    'acuerdo', case when cv.id is null then null else jsonb_build_object(
        'convenio_id', cv.id, 'numero', cv.numero_convenio, 'cuota', cv.cuota_por_periodo,
        'falta_antes', v_conv_falta, 'periodos_corridos', v_j, 'monto_corrido', case when v_j > 0 then v_conv_falta else 0 end,
        'fecha_limite_antes', cv.fecha_limite, 'fecha_limite_despues', v_conv_lim2) end,
    'despues', jsonb_build_object('cuotas', coalesce(a.r_cuota_falta, 0), 'acuerdo', coalesce(a.r_acuerdo_falta, 0),
                                  'deudas', v_deudas_total - greatest(v_x, 0),
                                  'total', coalesce(a.r_cuota_falta, 0) + coalesce(a.r_acuerdo_falta, 0) + v_deudas_total - greatest(v_x, 0),
                                  'estado', a.r_estado_cartera, 'dias_mora', a.r_dias_mora),
    'total_cajas_antes', c.total_cajas, 'total_cajas_despues', c2.total_cajas,
    'exoneradas_antes', coalesce(c.cajas_exoneradas, 0), 'exoneradas_despues', c2.cajas_exoneradas,
    'fecha_fin_antes', v_fin_antes, 'fecha_fin_aprox', v_fin_aprox
  );
end $$;

revoke all on function public._calcular_rodado_por_deuda(uuid) from public, anon, authenticated;

-- ── 4. La vista previa (con permiso) ─────────────────────────────────────────────────────────
create or replace function public.calcular_rodado_por_deuda(p_contrato uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.puede_accion('rodar_por_deuda') then
    raise exception 'No tiene permiso para rodar por deuda.';
  end if;
  return public._calcular_rodado_por_deuda(p_contrato);
end $$;

revoke all on function public.calcular_rodado_por_deuda(uuid) from public, anon;
grant execute on function public.calcular_rodado_por_deuda(uuid) to authenticated;

-- ── 5. Aplicar: todo en una transacción, con candado sobre el contrato ──────────────────────
create or replace function public.aplicar_rodado_por_deuda(
  p_contrato uuid, p_video_url text, p_documento_url text, p_firma_cliente_url text,
  p_firma_acompanante_url text default null, p_semanas_esperadas int default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v jsonb; v_r public.rodados_por_deuda; d jsonb; n int; v_yo uuid := auth.uid(); v_aud text;
begin
  if not public.puede_accion('rodar_por_deuda') then raise exception 'No tiene permiso para rodar por deuda.'; end if;
  if v_yo is null then raise exception 'Hay que entrar a la app para rodar.'; end if;
  if coalesce(btrim(p_video_url), '') = '' then raise exception 'Falta el video del cliente: sin video no se puede rodar.'; end if;
  if coalesce(btrim(p_documento_url), '') = '' or coalesce(btrim(p_firma_cliente_url), '') = '' then
    raise exception 'Falta el documento firmado por el cliente.';
  end if;

  perform 1 from public.contratos where id = p_contrato for update;   -- dos clics a la vez: el segundo espera y ve el primero
  v := public._calcular_rodado_por_deuda(p_contrato);
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

  -- 2. Las deudas de tiempo rodadas
  for d in select * from jsonb_array_elements(v->'deudas_rodadas') loop
    update public.deudas
       set monto_pendiente = monto_pendiente - (d->>'monto')::numeric,
           estado = case when (d->>'completa')::boolean then 'rodada' else estado end
     where id = (d->>'deuda_id')::uuid and estado = 'pendiente' and monto_pendiente >= (d->>'monto')::numeric;
    get diagnostics n = row_count;
    if n <> 1 then raise exception 'La deuda % cambió mientras se rodaba. No se guardó nada.', d->>'deuda_id'; end if;
  end loop;

  -- 3. El acuerdo: sus cuotas atrasadas se corren al final del mismo acuerdo
  if (v->'acuerdo') is not null and coalesce((v->'acuerdo'->>'periodos_corridos')::int, 0) > 0 then
    update public.convenios
       set periodos_exonerados = coalesce(periodos_exonerados, 0) + (v->'acuerdo'->>'periodos_corridos')::int,
           fecha_limite = (v->'acuerdo'->>'fecha_limite_despues')::date
     where id = (v->'acuerdo'->>'convenio_id')::uuid and estado = 'activo';
    get diagnostics n = row_count;
    if n <> 1 then raise exception 'El acuerdo cambió mientras se rodaba. No se guardó nada.'; end if;
  end if;

  -- 4. El registro
  insert into public.rodados_por_deuda (
    contrato_id, cliente_id, creado_por, valor_semana, debia_total, debia_cuotas, debia_acuerdo, debia_deudas,
    cajas_corridas, deudas_rodadas, monto_deudas_rodadas, semanas_rodadas, semanas_extra, semanas_a_cobrar,
    monto_rodado, monto_a_cobrar, sobrante, queda_debiendo, total_cajas_antes, total_cajas_despues,
    exoneradas_antes, exoneradas_despues, convenio_id, acuerdo_periodos_corridos, acuerdo_monto_corrido,
    acuerdo_fecha_limite_antes, acuerdo_fecha_limite_despues, fecha_fin_antes, fecha_fin_aprox,
    documento_url, firma_cliente_url, firma_acompanante_url, video_url, calculo)
  values (
    p_contrato, (v->>'cliente_id')::uuid, v_yo, (v->>'valor_semana')::numeric,
    (v->'antes'->>'total')::numeric, (v->'antes'->>'cuotas')::numeric, (v->'antes'->>'acuerdo')::numeric, (v->'antes'->>'deudas')::numeric,
    (v->>'cajas_corridas')::int, v->'deudas_rodadas', (v->>'monto_deudas_rodadas')::numeric,
    (v->>'semanas_rodadas')::int, (v->>'semanas_extra')::int, (v->>'semanas_a_cobrar')::int,
    (v->>'monto_rodado')::numeric, (v->>'monto_a_cobrar')::numeric, (v->>'sobrante')::numeric, (v->'despues'->>'total')::numeric,
    (v->>'total_cajas_antes')::int, (v->>'total_cajas_despues')::int, (v->>'exoneradas_antes')::int, (v->>'exoneradas_despues')::int,
    (v->'acuerdo'->>'convenio_id')::uuid, coalesce((v->'acuerdo'->>'periodos_corridos')::int, 0), coalesce((v->'acuerdo'->>'monto_corrido')::numeric, 0),
    (v->'acuerdo'->>'fecha_limite_antes')::date, (v->'acuerdo'->>'fecha_limite_despues')::date,
    (v->>'fecha_fin_antes')::date, (v->>'fecha_fin_aprox')::date,
    p_documento_url, p_firma_cliente_url, nullif(btrim(coalesce(p_firma_acompanante_url, '')), ''), p_video_url, v)
  returning * into v_r;

  -- 5. El rastro en el historial del contrato. El primer renglón lleva "exoneradas N" en el formato
  --    que lee la nómina (rodadasDesdeRegistros): así cuenta estas semanas corridas como las demás.
  v_aud := format('%s: debía %s; se rodaron %s semanas (%s); al final paga %s semanas (%s); paga ahora %s; queda debiendo %s; fin aprox %s. Documento: %s · Video: %s',
    v_r.numero, zala.pesos(v_r.debia_total), v_r.semanas_rodadas, zala.pesos(v_r.monto_rodado), v_r.semanas_a_cobrar,
    zala.pesos(v_r.monto_a_cobrar), zala.pesos(v_r.sobrante), zala.pesos(v_r.queda_debiendo), to_char(v_r.fecha_fin_aprox, 'DD/MM/YYYY'),
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
  if v_r.acuerdo_periodos_corridos > 0 then
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
    select p_contrato, format('Convenio #%s: cuotas corridas al final', cv.numero_convenio),
           format('fecha_limite=%s', v_r.acuerdo_fecha_limite_antes),
           format('se corrieron %s cuotas (%s atrasados) · fecha_limite=%s — rodado por deuda %s',
                  v_r.acuerdo_periodos_corridos, zala.pesos(v_r.acuerdo_monto_corrido), v_r.acuerdo_fecha_limite_despues, v_r.numero), v_yo
      from public.convenios cv where cv.id = v_r.convenio_id;
  end if;

  return to_jsonb(v_r);
end $$;

revoke all on function public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int) from public, anon;
grant execute on function public.aplicar_rodado_por_deuda(uuid, text, text, text, text, int) to authenticated;

-- ── 6. Si se va antes: lo rodado que todavía no se le exigía (sin el recargo) ────────────────
-- Las semanas rodadas son las que van después de las normales (total − rodadas − recargo). La
-- liquidación ya cobra las semanas exigidas sin pagar; aquí sale SOLO lo rodado que aún no se exigía.
create or replace function public.rodado_pendiente_liquidacion(p_contrato uuid, p_fecha date)
returns table (rodado_id uuid, numero text, semanas int, monto numeric)
language plpgsql stable security definer set search_path = public as $$
declare r public.rodados_por_deuda; c public.contratos; v_normales int; v_exig int; v_ya int;
begin
  select * into r from public.rodados_por_deuda where contrato_id = p_contrato and estado = 'vigente' order by created_at desc limit 1;
  if r.id is null then return; end if;
  select * into c from public.contratos where id = p_contrato;
  v_normales := r.total_cajas_despues - r.semanas_a_cobrar;
  v_exig := public.cajas_exigidas(c, p_fecha);
  v_ya := least(greatest(v_exig - v_normales, 0), r.semanas_rodadas);
  rodado_id := r.id; numero := r.numero; semanas := r.semanas_rodadas - v_ya; monto := (r.semanas_rodadas - v_ya) * r.valor_semana;
  return next;
end $$;

revoke all on function public.rodado_pendiente_liquidacion(uuid, date) from public, anon;
grant execute on function public.rodado_pendiente_liquidacion(uuid, date) to authenticated;

-- ── 7. ZALA: la vitrina sabe del rodado (regla de la vitrina) ───────────────────────────────
create or replace view zala.rodado as
select r.contrato_id, r.numero, r.fecha, r.semanas_rodadas, r.semanas_a_cobrar, r.monto_rodado, r.monto_a_cobrar,
       r.fecha_fin_aprox, r.estado
  from public.rodados_por_deuda r
 where r.estado <> 'anulado';
grant select on zala.rodado to zala_lector;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('rodado', '_vista', 'Clientes a los que se les rodó la deuda al final del contrato (D-044). Una fila por contrato.', null, 'solo si pregunta', true),
('rodado', 'numero', 'Número del documento del rodado (ROD-0001).', null, 'solo si pregunta', true),
('rodado', 'fecha', 'Día en que se hizo el rodado.', null, 'solo si pregunta', true),
('rodado', 'semanas_rodadas', 'Semanas de tiempo que debía y se pasaron al final.', null, 'solo si pregunta', true),
('rodado', 'semanas_a_cobrar', 'Semanas que paga al final por ese rodado (incluye el recargo por el desgaste).', null, 'solo si pregunta', true),
('rodado', 'monto_rodado', 'Plata que debía y se pasó al final.', null, 'no', true),
('rodado', 'monto_a_cobrar', 'Plata que pagará al final por el rodado.', null, 'solo si pregunta', true),
('rodado', 'fecha_fin_aprox', 'Fecha aproximada en que termina el contrato con el rodado. Es aproximada: si se atrasa, se corre.', null, 'solo si pregunta', true),
('rodado', 'estado', 'vigente = falta pagarlo al final · saldado = ya lo pagó · cobrado_en_liquidacion = se fue y se le cobró · anulado.', 'vigente · saldado · cobrado_en_liquidacion · anulado', 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

-- ── 8. LA PRUEBA, con los clientes reales y SIN guardar nada en ellos ────────────────────────
do $prueba$
declare r record; v jsonb; n_ok int := 0; n_no int := 0; v_txt text := '';
begin
  for r in select z.contrato_id, z.placa from zala.cliente z
            where z.contrato_estado = 'Activo' and z.debe_hoy > 700000 order by z.debe_hoy desc loop
    v := public._calcular_rodado_por_deuda(r.contrato_id);
    if (v->>'puede')::boolean then
      n_ok := n_ok + 1;
      v_txt := v_txt || format(E'\n  %s: debe %s → queda %s · rueda %s sem → paga %s al final · acuerdo corre %s cuotas',
        r.placa, v->'antes'->>'total', v->'despues'->>'total', v->>'semanas_rodadas', v->>'semanas_a_cobrar',
        coalesce(v->'acuerdo'->>'periodos_corridos', '0'));
    else
      n_no := n_no + 1;
      v_txt := v_txt || format(E'\n  %s: NO — %s', r.placa, v->'razones'->>0);
    end if;
  end loop;
  raise notice 'PRUEBA: % se pueden rodar, % no.%', n_ok, n_no, v_txt;
end
$prueba$;

select public.registrar_migracion(191, '191_rodado_por_deuda.sql',
  'Rodar por deuda (D-044): el tiempo que debe un cliente pasa al final del contrato con recargo, con documento y video');

commit;

-- ─── VERIFICACIÓN — la vista previa de los clientes que hoy deben más de $700.000 (no guarda nada) ──
select z.placa, z.cliente,
       (v->>'puede')::boolean as se_puede,
       (v->'antes'->>'total')::numeric as debe_hoy,
       (v->>'semanas_rodadas')::int as semanas_rodadas,
       (v->>'semanas_a_cobrar')::int as paga_al_final,
       (v->'despues'->>'total')::numeric as queda_debiendo,
       coalesce(v->'razones'->>0, v->'avisos'->>0) as nota
  from zala.cliente z
  cross join lateral (select public._calcular_rodado_por_deuda(z.contrato_id) as v) x
 where z.contrato_estado = 'Activo' and z.debe_hoy > 700000
 order by z.debe_hoy desc;
