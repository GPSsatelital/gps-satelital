-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 198 — EL RODADO POR DEUDA SE CIERRA SOLO (tanda 1, punto 3 · 10-oct-2026, dueño: «1» = las tres piezas)
--
-- QUÉ FALTABA (D-044, mig 191): el rodado nacía «vigente» y se quedaba así para siempre.
--   · Pieza 2: cuando el cliente termina de pagar las semanas del final (cajas_pagadas ≥ total_cajas),
--     el rodado pasa solo a «saldado». Si le vuelve a faltar una semana (pago rechazado o borrado),
--     vuelve a «vigente». Es la misma prueba de «terminó de pagar» que usan ModalIniciarLiquidacion y
--     ModalProyeccionLiquidacion.
--   · Pieza 3: la liquidación ya COBRA lo rodado (`rodado_pendiente_liquidacion`), pero el rodado seguía
--     «vigente» y ZALA lo leía como pendiente. Al cerrarse la liquidación pasa a «cobrado_en_liquidacion»;
--     si la liquidación sale de «cerrada» (anulada o devuelta, como la mig 188), vuelve a vigente (o a
--     saldado, si ya había pagado todo).
--   (La pieza 1, la marca en Reportes, es pantalla: va en la app.)
--
-- NO CAMBIA NINGUNA CIFRA: solo el estado del registro del rodado. ZALA ya conoce «saldado» y
-- «cobrado_en_liquidacion» (diccionario de la mig 191): no hay estado nuevo. Hoy no hay ningún rodado
-- (medido el 10-oct): esto deja listo el primero.
--
-- Cada cambio deja su rastro en el historial del contrato (`contratos_auditoria`), con un texto que NO
-- empieza por «exoneradas N» (ese formato lo lee la nómina, `rodadasDesdeRegistros`).
--
-- LA PRUEBA VA ADENTRO: un rodado de mentira (ROD-PRUEBA, número puesto a mano para no gastar el
-- consecutivo: el primero real sigue siendo ROD-0001) sobre un contrato real; se completan sus semanas
-- (→ saldado), se quita una (→ vigente), se cierra y se anula una liquidación (→ cobrado → vigente), y
-- todo se deshace. Si algo no da lo esperado, la migración entera se cancela.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   drop trigger if exists trg_rodado_saldado on public.contratos;
--   drop trigger if exists trg_rodado_liquidacion on public.liquidaciones;
--   drop function if exists public._trg_rodado_saldado(); drop function if exists public._trg_rodado_liquidacion();
--   drop function if exists public.rodado_revisar_saldado(uuid);
--   drop function if exists public.rodado_por_liquidacion(uuid, text, text);
--   delete from public.migraciones_aplicadas where numero = 198;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── Pieza 2: saldado cuando paga todas sus semanas ──────────────────────────────────────────
create or replace function public.rodado_revisar_saldado(p_contrato uuid)
returns text language plpgsql security definer set search_path = public as $$
declare r public.rodados_por_deuda; c public.contratos; v_nuevo text;
begin
  select * into r from public.rodados_por_deuda
   where contrato_id = p_contrato and estado in ('vigente', 'saldado') order by created_at desc limit 1;
  if r.id is null then return null; end if;
  select * into c from public.contratos where id = p_contrato;
  if c.total_cajas is null then return r.estado; end if;
  v_nuevo := case when c.cajas_pagadas >= c.total_cajas then 'saldado' else 'vigente' end;
  if v_nuevo = r.estado then return r.estado; end if;
  update public.rodados_por_deuda set estado = v_nuevo where id = r.id;
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
    (p_contrato, 'Estado del rodado ' || r.numero, r.estado,
     case when v_nuevo = 'saldado'
          then format('saldado: ya pagó sus %s semanas, incluidas las rodadas al final', c.total_cajas)
          else format('vigente: le volvió a faltar una semana (lleva %s de %s)', c.cajas_pagadas, c.total_cajas) end,
     auth.uid());
  return v_nuevo;
end $$;

create or replace function public._trg_rodado_saldado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.rodado_revisar_saldado(new.id);
  return null;
end $$;

drop trigger if exists trg_rodado_saldado on public.contratos;
create trigger trg_rodado_saldado
  after update of cajas_pagadas, total_cajas on public.contratos
  for each row
  when (old.cajas_pagadas is distinct from new.cajas_pagadas or old.total_cajas is distinct from new.total_cajas)
  execute function public._trg_rodado_saldado();

-- ── Pieza 3: cobrado en la liquidación ──────────────────────────────────────────────────────
create or replace function public.rodado_por_liquidacion(p_contrato uuid, p_estado_viejo text, p_estado_nuevo text)
returns text language plpgsql security definer set search_path = public as $$
declare r public.rodados_por_deuda; c public.contratos; v_nuevo text;
begin
  if p_estado_nuevo = 'cerrada' and coalesce(p_estado_viejo, '') <> 'cerrada' then
    select * into r from public.rodados_por_deuda
     where contrato_id = p_contrato and estado = 'vigente' order by created_at desc limit 1;
    if r.id is null then return null; end if;
    update public.rodados_por_deuda set estado = 'cobrado_en_liquidacion' where id = r.id;
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
      (p_contrato, 'Estado del rodado ' || r.numero, 'vigente',
       'cobrado_en_liquidacion: se cerró la liquidación, que cobra lo rodado', auth.uid());
    return 'cobrado_en_liquidacion';
  elsif coalesce(p_estado_viejo, '') = 'cerrada' and p_estado_nuevo <> 'cerrada' then
    select * into r from public.rodados_por_deuda
     where contrato_id = p_contrato and estado = 'cobrado_en_liquidacion' order by created_at desc limit 1;
    if r.id is null then return null; end if;
    select * into c from public.contratos where id = p_contrato;
    v_nuevo := case when c.total_cajas is not null and c.cajas_pagadas >= c.total_cajas then 'saldado' else 'vigente' end;
    update public.rodados_por_deuda set estado = v_nuevo where id = r.id;
    insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por) values
      (p_contrato, 'Estado del rodado ' || r.numero, 'cobrado_en_liquidacion',
       format('%s: la liquidación pasó de cerrada a %s', v_nuevo, p_estado_nuevo), auth.uid());
    return v_nuevo;
  end if;
  return null;
end $$;

create or replace function public._trg_rodado_liquidacion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.rodado_por_liquidacion(new.contrato_id, old.estado, new.estado);
  return null;
end $$;

drop trigger if exists trg_rodado_liquidacion on public.liquidaciones;
create trigger trg_rodado_liquidacion
  after update of estado on public.liquidaciones
  for each row
  when (old.estado is distinct from new.estado)
  execute function public._trg_rodado_liquidacion();

-- Solo la base las usa (los disparadores); nadie las llama desde la app.
revoke all on function public.rodado_revisar_saldado(uuid) from public, anon, authenticated;
revoke all on function public.rodado_por_liquidacion(uuid, text, text) from public, anon, authenticated;

-- ── La prueba: un rodado de mentira sobre un contrato real, todo deshecho al final ──────────
do $prueba$
declare
  v_c   uuid := 'bd6f3e53-6ce6-41cf-96f3-332f11799580';   -- contrato activo sin rodado (10-oct)
  v_tot int; v_pag int;
  e1 text; e2 text; e3 text; e4 text; e5 text; n_aud int;
begin
  begin
    select total_cajas, cajas_pagadas into v_tot, v_pag from public.contratos where id = v_c;
    insert into public.rodados_por_deuda (
      numero, contrato_id, creado_por, valor_semana, debia_total, debia_cuotas, debia_acuerdo, debia_deudas,
      cajas_corridas, monto_deudas_rodadas, semanas_rodadas, semanas_extra, semanas_a_cobrar, monto_rodado,
      monto_a_cobrar, sobrante, queda_debiendo, total_cajas_antes, total_cajas_despues, exoneradas_antes,
      exoneradas_despues, documento_url, firma_cliente_url, video_url, calculo)
    values (
      'ROD-PRUEBA', v_c, (select id from public.profiles where role = 'ADMIN_PRINCIPAL' order by created_at limit 1),
      202000, 0, 0, 0, 0, 0, 0, 1, 0, 1, 202000, 202000, 0, 0, v_tot, v_tot, 0, 0, 'prueba', 'prueba', 'prueba', '{}'::jsonb);
    select estado into e1 from public.rodados_por_deuda where numero = 'ROD-PRUEBA';              -- vigente
    update public.contratos set cajas_pagadas = v_tot where id = v_c;
    select estado into e2 from public.rodados_por_deuda where numero = 'ROD-PRUEBA';              -- saldado
    update public.contratos set cajas_pagadas = v_tot - 1 where id = v_c;
    select estado into e3 from public.rodados_por_deuda where numero = 'ROD-PRUEBA';              -- vigente
    perform public.rodado_por_liquidacion(v_c, 'calculada', 'cerrada');
    select estado into e4 from public.rodados_por_deuda where numero = 'ROD-PRUEBA';              -- cobrado_en_liquidacion
    perform public.rodado_por_liquidacion(v_c, 'cerrada', 'anulada');
    select estado into e5 from public.rodados_por_deuda where numero = 'ROD-PRUEBA';              -- vigente
    select count(*) into n_aud from public.contratos_auditoria
     where contrato_id = v_c and campo = 'Estado del rodado ROD-PRUEBA';                          -- 4 rastros
    raise exception using errcode = 'ZZ198', message = 'deshacer la prueba';
  exception when sqlstate 'ZZ198' then
    null;   -- el rodado de mentira, las semanas tocadas y los rastros quedan deshechos
  end;
  raise notice 'Prueba: nace %, paga todo → %, le falta una → %, liquidación cerrada → %, anulada → %, rastros %',
    e1, e2, e3, e4, e5, n_aud;
  if e1 is distinct from 'vigente' or e2 is distinct from 'saldado' or e3 is distinct from 'vigente'
     or e4 is distinct from 'cobrado_en_liquidacion' or e5 is distinct from 'vigente' or n_aud is distinct from 4 then
    raise exception 'La prueba no dio lo esperado (vigente, saldado, vigente, cobrado_en_liquidacion, vigente, 4 rastros): salió %, %, %, %, %, %. No se cambió nada.',
      e1, e2, e3, e4, e5, n_aud;
  end if;
end
$prueba$;

select public.registrar_migracion(198, '198_rodado_saldado_y_liquidado.sql',
  'Rodado por deuda: pasa solo a saldado al pagar todas sus semanas y a cobrado_en_liquidacion al cerrar la liquidación');

commit;

-- ─── VERIFICACIÓN — debe dar una fila con: true · true · 0 · 'ROD-0001' ──────────────────────
-- (el último: el próximo rodado real sigue siendo el ROD-0001; la prueba no gastó el consecutivo)
select
  exists (select 1 from pg_trigger where tgname = 'trg_rodado_saldado')      as disparador_saldado,
  exists (select 1 from pg_trigger where tgname = 'trg_rodado_liquidacion')  as disparador_liquidacion,
  (select count(*) from public.rodados_por_deuda)                            as rodados,
  'ROD-' || lpad((select case when is_called then last_value + 1 else last_value end from public.rodados_numero_seq)::text, 4, '0') as proximo_numero;
