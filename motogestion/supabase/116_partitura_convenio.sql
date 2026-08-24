-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 116 — LA PARTITURA DEL CONVENIO (23-ago-2026)
--
-- La regla del dueño, textual: "el convenio es una agrupación de diferentes tipos de deudas
-- que las agrupa para ser diferida y que al cliente le quede facilidad de pago, pero a la
-- final cada cosa que quedó ahí contemplada debería volver o ser contado en donde
-- verdaderamente tuvo que haber estado".
--
-- Qué hace esta migración (ver docs/MAPA-FINANCIERO.md):
--   1. `convenios.partitura` — la lista EN PESOS Y EN ORDEN de qué financia cada convenio:
--      [{tipo:'semana'|'deuda'|'ajuste', ref, etiqueta, monto}, ...]
--   2. `convenio_marca_contemplado()` la escribe SOLA al firmar (cuerpo VIVO del 23-ago +
--      el bloque nuevo — método pg_get_functiondef, lección de la mig 083).
--   3. `convenio_ampliado_marca_deudas()` le ANEXA renglones al ampliar (solo si ya tiene
--      partitura — a los viejos sin partitura no se les inventa media lista).
--   4. `convenio_amortiza_deudas()` (trigger NUEVO y APARTE sobre pagos, patrón del vigía:
--      el motor de reparto NO se toca): cada vez que entra o se reversa plata del convenio,
--      recalcula el tachado y deja las DEUDAS ENVUELTAS en su valor real — baja
--      monto_pendiente y las pasa a 'pagada' al llegar a cero. Cierra el cabo suelto de las
--      deudas 'en_convenio' congeladas para siempre (hallazgo del mapa financiero).
--
-- El TACHADO (qué renglón va cubierto) NO se guarda: se deriva siempre de la misma cifra
-- (la plata entrada al convenio) — en la BD acá, y en pantalla con partituraConvenio.ts.
-- Los convenios VIEJOS quedan con partitura null: el dueño se las escribe una por una desde
-- el editor de la app, contra el acuerdo firmado — nunca a ciegas.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── 1) La columna ────────────────────────────────────────────────────────────────────────────
alter table public.convenios add column if not exists partitura jsonb;

comment on column public.convenios.partitura is
  'La lista en pesos y en orden de qué financia este convenio: '
  '[{tipo: semana|deuda|ajuste, ref: nro de caja o uuid de la deuda, etiqueta, monto}]. '
  'Se escribe al firmar (o a mano para los viejos) y no cambia sola. El tachado se deriva '
  'del acumulado de aplicado_convenio — nunca se guarda.';

-- ── 2) Al FIRMAR: el cuerpo VIVO (volcado pg_get_functiondef del 23-ago) + la partitura ─────
create or replace function public.convenio_marca_contemplado()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_c public.contratos;
  v_cubrir int;
  v_partitura jsonb := '[]'::jsonb;
  v_valor numeric;
  v_monto numeric;
  v_suma numeric := 0;
  v_k int;
  v_d record;
begin
  if new.estado <> 'activo' then return new; end if;

  update public.deudas
     set estado = 'en_convenio'
   where contrato_id = new.contrato_id
     and estado = 'pendiente'
     and created_at <= new.created_at;

  select * into v_c from public.contratos where id = new.contrato_id;

  -- Las SEMANAS que este convenio asume (solo contratos con motor; v1 y Diario llevan
  -- partitura de puras deudas). Mismo cálculo vivo de siempre; lo nuevo es que cada semana
  -- queda ESCRITA en pesos: la primera puede estar parcial (ya tenía plata adentro).
  if v_c.id is not null and coalesce(v_c.motor_v2, false) and v_c.forma_pago <> 'Diario' then
    if new.cubre_periodo_hasta is not null and new.cubre_periodo_hasta > current_date then
      v_cubrir := public.cajas_exigidas(v_c, new.cubre_periodo_hasta - 1);
    elsif new.cubre_periodo_hasta = current_date then
      v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
    else
      v_cubrir := greatest(public.cajas_exigidas(v_c, current_date) - 1, 0);
    end if;

    if v_cubrir > coalesce(v_c.cajas_pagadas, 0) then
      v_valor := public.caja_valor(v_c);
      for v_k in coalesce(v_c.cajas_pagadas, 0) + 1 .. v_cubrir loop
        -- La primera de las cajas asumidas puede venir parcial: solo se asume lo que FALTABA.
        v_monto := v_valor - case when v_k = coalesce(v_c.cajas_pagadas, 0) + 1
                                  then coalesce(v_c.caja_actual_pagado, 0) else 0 end;
        if v_monto > 0 then
          v_partitura := v_partitura || jsonb_build_object(
            'tipo', 'semana', 'ref', v_k,
            'etiqueta', 'Semana #' || v_k || ' del contrato'
                        || case when v_k = coalesce(v_c.cajas_pagadas, 0) + 1
                                 and coalesce(v_c.caja_actual_pagado, 0) > 0
                                then ' (lo que faltaba)' else '' end,
            'monto', v_monto);
          v_suma := v_suma + v_monto;
        end if;
      end loop;

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
  end if;

  -- Las DEUDAS envueltas (las que este convenio cobra), de la más vieja a la más nueva —
  -- el mismo orden en que el sistema cobra todo.
  for v_d in
    select id, concepto, monto_pendiente from public.deudas
     where contrato_id = new.contrato_id and estado = 'en_convenio' and monto_pendiente > 0
     order by created_at
  loop
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'deuda', 'ref', v_d.id::text,
      'etiqueta', 'Deuda: ' || v_d.concepto, 'monto', v_d.monto_pendiente);
    v_suma := v_suma + v_d.monto_pendiente;
  end loop;

  -- El AJUSTE: si el total pactado quedó por encima de lo envuelto (redondeo de cuotas,
  -- recargo pactado), la diferencia queda visible como renglón — nunca escondida. Si quedó
  -- por DEBAJO (descuento), no se inventa renglón: el descuadre se ve en pantalla.
  if new.deuda_total - v_suma > 0 then
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'ajuste', 'etiqueta', 'Ajuste pactado (redondeo de cuotas)',
      'monto', new.deuda_total - v_suma);
  end if;

  update public.convenios set partitura = v_partitura where id = new.id;

  return new;
end; $$;

-- ── 3) Al AMPLIAR: el cuerpo VIVO + anexar renglones (solo si ya hay partitura) ─────────────
create or replace function public.convenio_ampliado_marca_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_extra numeric;
  v_d record;
  v_anexo jsonb := '[]'::jsonb;
begin
  if new.estado <> 'activo' then return new; end if;

  -- Solo lo que se AGREGÓ. Se marcan de la más vieja a la más nueva hasta cubrirlo.
  v_extra := coalesce(new.deuda_total, 0) - coalesce(old.deuda_total, 0);
  if v_extra <= 0 then return new; end if;

  for v_d in
    select id, concepto, monto_pendiente from public.deudas
     where contrato_id = new.contrato_id
       and estado = 'pendiente'
       and monto_pendiente > 0
     order by created_at
  loop
    exit when v_extra <= 0;
    -- No existe media deuda dentro de un convenio: solo entran las que caben completas.
    if v_d.monto_pendiente <= v_extra then
      update public.deudas set estado = 'en_convenio' where id = v_d.id;
      v_extra := v_extra - v_d.monto_pendiente;
      v_anexo := v_anexo || jsonb_build_object(
        'tipo', 'deuda', 'ref', v_d.id::text,
        'etiqueta', 'Deuda: ' || v_d.concepto || ' (ampliación)', 'monto', v_d.monto_pendiente);
    end if;
  end loop;

  if v_extra > 0 then
    v_anexo := v_anexo || jsonb_build_object(
      'tipo', 'ajuste', 'etiqueta', 'Ampliación sin deuda asociada (redondeo)', 'monto', v_extra);
  end if;

  -- A un convenio viejo SIN partitura no se le anexa media lista engañosa: sigue null hasta
  -- que el dueño se la escriba completa desde el editor.
  if new.partitura is not null and jsonb_array_length(v_anexo) > 0 then
    update public.convenios set partitura = new.partitura || v_anexo where id = new.id;
  end if;

  return new;
end; $$;

-- ── 4) LA AMORTIZACIÓN: trigger nuevo y APARTE sobre pagos (el motor NO se toca) ────────────
-- Idempotente: recalcula el tachado completo desde la plata entrada, así la MISMA lógica
-- sirve para la ida (confirmar) y la vuelta (rechazar/borrar). Solo toca deudas que la
-- partitura referencia y que siguen dentro del circuito del convenio (en_convenio/pagada) —
-- una deuda devuelta a 'pendiente' (convenio borrado) no se toca.
create or replace function public.convenio_amortiza_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_contrato uuid := coalesce(new.contrato_id, old.contrato_id);
  v_cv public.convenios;
  v_entrada numeric;
  v_r jsonb;
  v_monto numeric;
  v_pag numeric;
begin
  select * into v_cv from public.convenios
   where contrato_id = v_contrato and estado = 'activo'
   order by created_at desc limit 1;
  if v_cv.id is null or v_cv.partitura is null then return coalesce(new, old); end if;

  select coalesce(sum(aplicado_convenio), 0) into v_entrada
    from public.pagos
   where contrato_id = v_contrato and estado = 'Confirmado' and created_at >= v_cv.created_at;

  for v_r in select * from jsonb_array_elements(v_cv.partitura) loop
    v_monto := coalesce((v_r->>'monto')::numeric, 0);
    v_pag := least(greatest(v_entrada, 0), v_monto);
    v_entrada := v_entrada - v_pag;
    if v_r->>'tipo' = 'deuda' and (v_r->>'ref') is not null then
      update public.deudas
         set monto_pendiente = v_monto - v_pag,
             estado = case when v_monto - v_pag <= 0 then 'pagada' else 'en_convenio' end
       where id = (v_r->>'ref')::uuid
         and estado in ('en_convenio', 'pagada');
    end if;
  end loop;

  return coalesce(new, old);
end; $$;

drop trigger if exists trg_convenio_amortiza_iu on public.pagos;
create trigger trg_convenio_amortiza_iu
  after insert or update of estado on public.pagos
  for each row
  when (coalesce(new.aplicado_convenio, 0) <> 0)
  execute function public.convenio_amortiza_deudas();

drop trigger if exists trg_convenio_amortiza_del on public.pagos;
create trigger trg_convenio_amortiza_del
  after delete on public.pagos
  for each row
  when (coalesce(old.aplicado_convenio, 0) <> 0)
  execute function public.convenio_amortiza_deudas();

-- ── Verificación ─────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from information_schema.columns
    where table_name = 'convenios' and column_name = 'partitura') as columna_partitura,
  (select count(*) from pg_trigger where tgname in ('trg_convenio_amortiza_iu', 'trg_convenio_amortiza_del')) as triggers_amortiza;
-- Debe dar: columna_partitura = 1 · triggers_amortiza = 2
