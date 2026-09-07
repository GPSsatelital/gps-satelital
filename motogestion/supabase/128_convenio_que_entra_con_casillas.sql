-- 128 — EL ACUERDO YA NO SE ESCRIBE A MANO: la base dice qué entra, la pantalla lo muestra con
--       casillas, y la base se niega a firmar por menos de lo que envuelve.
--
-- EL CASO (7-sep-2026, ESTARLIS CHIQUILLO): el formulario dejaba escribir a mano el monto de
-- deudas. Lumar firmó por $368.000; el trigger metió adentro las 2 semanas ($250.000) MÁS la deuda
-- de migración completa ($313.000) = $563.000. Al pagar los $368.000 quedaban $195.000 atrapados
-- en un acuerdo ya pagado, que nadie cobraría. Decisión del dueño: "las deudas nacen donde se crean;
-- por el convenio no entra plata escrita a mano".
--
-- QUÉ HACE:
--   1) `convenios.deudas_incluidas uuid[]`: cuáles deudas eligió el funcionario (casillas). NULL =
--      comportamiento viejo (todas las pendientes), para no romper nada que no mande la lista.
--   2) `convenio_semanas_que_entran(c, cubre_hasta)`: la cuenta de las semanas que el acuerdo asume,
--      SACADA del trigger a una función para que la pantalla pueda preguntarla ANTES de firmar.
--   3) `convenio_que_entra(contrato, cubre_hasta)` (rpc): lo que la pantalla lista — semanas y
--      deudas pendientes — con el mismo cálculo que va a usar el trigger. Un solo cerebro.
--   4) El trigger `convenio_marca_contemplado` (cuerpo de la 127, verificado vivo abajo) ahora:
--      usa la función de semanas · marca solo las deudas incluidas · y se NIEGA (raise) si el total
--      pactado es menor que lo que envuelve. Como es AFTER INSERT, al negarse no queda ni el acuerdo
--      ni las deudas tocadas.
--
-- 🔴 CAMBIO DE REGLA, a propósito y documentado: antes, con `cubre_periodo_hasta` en el pasado o en
-- NULL, el trigger marcaba TODAS las cajas exigidas menos la actual (rama `else`). Eso contradecía
-- el formulario ("si bajas a 0 semanas, las sigue debiendo aparte") y sobre-marcaba al financiar 1
-- de 3 semanas (marcaba 2). Ahora la regla es una sola: entran las cajas que EMPIEZAN antes de
-- `cubre_periodo_hasta` (= cajas_exigidas(c, cubre − 1)); NULL = ninguna. Medido antes de cambiar:
-- de 44 convenios sin `cubre`, solo 2 (del defecto de agosto ya conocido) habían marcado semanas.

-- ── 0) La función viva tiene que ser la de la 127 (116 + 124). Si no, PARAR. ───────────────
do $$
declare v_def text;
begin
  v_def := pg_get_functiondef('public.convenio_marca_contemplado'::regproc);
  if position('app.fuente_caja' in v_def) = 0 then
    raise exception 'La función viva convenio_marca_contemplado NO trae la marca fuente_caja de la 116: no es la de la 127. Revisar antes de seguir.';
  end if;
  if position('convenio_id = new.id' in v_def) = 0 then
    raise exception 'La función viva convenio_marca_contemplado NO trae convenio_id de la 124: no es la de la 127. Revisar antes de seguir.';
  end if;
end $$;

-- ── 1) Qué deudas eligió el funcionario ───────────────────────────────────────────────────────
alter table public.convenios
  add column if not exists deudas_incluidas uuid[];
comment on column public.convenios.deudas_incluidas is
  'Deudas que el funcionario marcó con casilla al firmar (mig 128). NULL = todas las pendientes (comportamiento anterior). Una deuda sin casilla se queda por fuera y se cobra aparte.';

-- ── 2) Las semanas que el acuerdo asume — UNA cuenta para la pantalla y para el trigger ────────
create or replace function public.convenio_semanas_que_entran(c public.contratos, p_cubre_hasta date)
returns table (cubrir int, caja_numero int, monto numeric, etiqueta text) language plpgsql stable as $$
declare
  v_cubrir int; v_valor numeric; v_monto numeric; v_k int;
  v_pag int := coalesce(c.cajas_pagadas, 0);
begin
  if c.id is null or not coalesce(c.motor_v2, false) or c.forma_pago = 'Diario' then return; end if;
  -- Sin semanas financiadas no entra ninguna semana (ver el CAMBIO DE REGLA arriba).
  if p_cubre_hasta is null then return; end if;
  -- `cubre_periodo_hasta` es el PRIMER día no cubierto: entran las cajas que empiezan antes.
  v_cubrir := public.cajas_exigidas(c, p_cubre_hasta - 1);
  if v_cubrir <= v_pag then return; end if;
  v_valor := public.caja_valor(c);
  for v_k in v_pag + 1 .. v_cubrir loop
    -- La primera de las cajas asumidas puede venir parcial: solo se asume lo que FALTABA.
    v_monto := v_valor - case when v_k = v_pag + 1 then coalesce(c.caja_actual_pagado, 0) else 0 end;
    if v_monto > 0 then
      cubrir := v_cubrir; caja_numero := v_k; monto := v_monto;
      etiqueta := 'Semana #' || v_k || ' del contrato'
                  || case when v_k = v_pag + 1 and coalesce(c.caja_actual_pagado, 0) > 0 then ' (lo que faltaba)' else '' end;
      return next;
    end if;
  end loop;
end $$;

-- ── 3) Lo que la pantalla pregunta antes de firmar ───────────────────────────────────────────
-- security INVOKER a propósito: corre con los permisos de quien pregunta (RLS de contratos y
-- deudas), igual que si la pantalla leyera las tablas.
create or replace function public.convenio_que_entra(p_contrato_id uuid, p_cubre_hasta date)
returns jsonb language plpgsql stable as $$
declare
  v_c public.contratos; v_sem jsonb; v_sem_total numeric; v_cubrir int;
  v_deudas jsonb; v_deudas_total numeric; v_otro numeric;
begin
  select * into v_c from public.contratos where id = p_contrato_id;
  if v_c.id is null then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object('caja_numero', s.caja_numero, 'monto', s.monto, 'etiqueta', s.etiqueta) order by s.caja_numero), '[]'::jsonb),
         coalesce(sum(s.monto), 0), max(s.cubrir)
    into v_sem, v_sem_total, v_cubrir
    from public.convenio_semanas_que_entran(v_c, p_cubre_hasta) s;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', d.id, 'concepto', d.concepto, 'descripcion', d.descripcion,
           'monto_pendiente', d.monto_pendiente, 'fecha', (d.created_at at time zone 'America/Bogota')::date) order by d.created_at), '[]'::jsonb),
         coalesce(sum(d.monto_pendiente), 0)
    into v_deudas, v_deudas_total
    from public.deudas d
   where d.contrato_id = p_contrato_id and d.estado = 'pendiente' and d.monto_pendiente > 0;

  select coalesce(sum(monto_pendiente), 0) into v_otro
    from public.deudas where contrato_id = p_contrato_id and estado = 'en_convenio';

  return jsonb_build_object(
    'semanas', v_sem, 'semanas_total', v_sem_total, 'cubrir', v_cubrir,
    'deudas', v_deudas, 'deudas_total', v_deudas_total,
    'deudas_en_otro_convenio', v_otro);
end $$;
revoke all on function public.convenio_que_entra(uuid, date) from public;
grant execute on function public.convenio_que_entra(uuid, date) to authenticated;

-- ── 4) El trigger: cuerpo de la 127 + casillas + función de semanas + el cinturón ────────────
create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
  v_cubrir int := null;
  v_partitura jsonb := '[]'::jsonb;
  v_suma numeric := 0;
  v_suma_semanas numeric := 0;
  v_suma_deudas numeric := 0;
  v_s record;
  v_d record;
begin
  if new.estado <> 'activo' then return new; end if;

  -- Solo las deudas que el funcionario marcó (casillas). NULL = todas, como antes.
  update public.deudas
     set estado = 'en_convenio',
         convenio_id = new.id          -- ★ 124: el rastro
   where contrato_id = new.contrato_id
     and estado = 'pendiente'
     and created_at <= new.created_at
     and (new.deudas_incluidas is null or id = any(new.deudas_incluidas));   -- ★ 128

  select * into v_c from public.contratos where id = new.contrato_id;

  -- Las SEMANAS que este convenio asume: la MISMA cuenta que la pantalla le preguntó a la base.
  for v_s in select * from public.convenio_semanas_que_entran(v_c, new.cubre_periodo_hasta) loop
    v_cubrir := v_s.cubrir;
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'semana', 'ref', v_s.caja_numero, 'etiqueta', v_s.etiqueta, 'monto', v_s.monto);
    v_suma := v_suma + v_s.monto;
    v_suma_semanas := v_suma_semanas + v_s.monto;
  end loop;

  if v_cubrir is not null and v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
    update public.convenios
       set cajas_pagadas_previas     = coalesce(v_c.cajas_pagadas, 0),
           caja_actual_pagado_previo = coalesce(v_c.caja_actual_pagado, 0),
           cajas_pagadas_marcadas    = v_cubrir
     where id = new.id;

    perform set_config('app.fuente_caja', 'convenio', true);
    update public.contratos
       set cajas_pagadas = v_cubrir,
           caja_actual_pagado = 0
     where id = new.contrato_id;
    perform set_config('app.fuente_caja', '', true);
  end if;

  -- Las DEUDAS envueltas, de la más vieja a la más nueva.
  for v_d in
    select id, concepto, monto_pendiente from public.deudas
     where contrato_id = new.contrato_id and estado = 'en_convenio' and monto_pendiente > 0
     order by created_at
  loop
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'deuda', 'ref', v_d.id::text,
      'etiqueta', 'Deuda: ' || v_d.concepto, 'monto', v_d.monto_pendiente);
    v_suma := v_suma + v_d.monto_pendiente;
    v_suma_deudas := v_suma_deudas + v_d.monto_pendiente;
  end loop;

  -- ★ 128 EL CINTURÓN: un acuerdo no se firma por menos de lo que envuelve. Al negarse acá
  -- (AFTER INSERT) se deshace todo: el acuerdo, las deudas marcadas y las cajas.
  if v_suma > coalesce(new.deuda_total, 0) + 0.5 then
    raise exception 'Este acuerdo envuelve % (semanas % + deudas %) pero se está firmando por %. Súbelo a % o deja deudas por fuera antes de firmar.',
      to_char(v_suma, 'FM999G999G999'), to_char(v_suma_semanas, 'FM999G999G999'),
      to_char(v_suma_deudas, 'FM999G999G999'), to_char(coalesce(new.deuda_total, 0), 'FM999G999G999'),
      to_char(v_suma, 'FM999G999G999');
  end if;

  -- Lo pactado por encima de lo envuelto queda visible como renglón (base inicial del wizard,
  -- redondeo de cuotas). Nunca escondido.
  if new.deuda_total - v_suma > 0 then
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'ajuste', 'etiqueta', 'Monto pactado sin deuda registrada (ver motivo del acuerdo)',
      'monto', new.deuda_total - v_suma);
  end if;

  update public.convenios set partitura = v_partitura where id = new.id;

  return new;
end; $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) La columna y las dos funciones existen (debe dar 1 · 1 · 1).
select
  (select count(*) from information_schema.columns where table_name = 'convenios' and column_name = 'deudas_incluidas') as columna,
  (select count(*) from pg_proc where proname = 'convenio_semanas_que_entran') as fn_semanas,
  (select count(*) from pg_proc where proname = 'convenio_que_entra') as fn_que_entra;

-- b) La misma cuenta que ya está firmada: para los 12 acuerdos del 4-sep en adelante, las semanas
--    que la función devuelve con SU cubre_periodo_hasta y SU estado previo deben coincidir con lo
--    que la partitura ya tiene (debe salir todo en 'igual').
select cl.nombre, cv.deuda_total,
       (select coalesce(sum((r->>'monto')::numeric), 0) from jsonb_array_elements(cv.partitura) r where r->>'tipo' = 'semana') as semanas_partitura,
       coalesce(cv.monto_semanas, 0) as semanas_declaradas,
       case when (select coalesce(sum((r->>'monto')::numeric), 0) from jsonb_array_elements(cv.partitura) r where r->>'tipo' = 'semana') = coalesce(cv.monto_semanas, 0)
            then 'igual' else 'REVISAR' end as coincide
  from public.convenios cv
  join public.contratos c on c.id = cv.contrato_id
  join public.clientes cl on cl.id = c.cliente_id
 where cv.created_at >= '2026-09-04' and cv.estado = 'activo'
 order by cv.created_at;

-- c) Lo que la pantalla vería para un contrato con deudas pendientes (el primero que haya).
select cl.nombre, m.placa, public.convenio_que_entra(c.id, null) as que_entra_sin_semanas
  from public.contratos c
  join public.clientes cl on cl.id = c.cliente_id
  left join public.motos m on m.id = c.moto_id
 where c.estado = 'Activo'
   and exists (select 1 from public.deudas d where d.contrato_id = c.id and d.estado = 'pendiente' and d.monto_pendiente > 0)
 order by c.created_at
 limit 1;
