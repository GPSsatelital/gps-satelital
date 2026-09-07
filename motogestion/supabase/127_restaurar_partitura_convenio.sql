-- 127 — RESTAURAR lo que la 124 borró del trigger de convenios (regresión del 4-sep-2026)
--
-- QUÉ PASÓ. La mig 124 (deudas.convenio_id) volvió a escribir `convenio_marca_contemplado` y
-- `convenio_ampliado_marca_deudas` "copiándolas de la mig 099 / 098" en vez de leer la función
-- VIVA (que era la de la mig 116, del 23-ago). Con eso se perdieron dos cosas de la 116:
--   1. La PARTITURA: la lista en pesos de qué financia el convenio (semanas + deudas + ajuste).
--      Sin ella, `amortizar_convenio` no hace nada → las deudas envueltas nunca se tachan al pagar.
--   2. La marca `app.fuente_caja = 'convenio'` al llenar cajas por financiación → las cajas
--      quedaron rotuladas 'pago' en `cajas_llenadas`, y la nómina las cuenta como cobradas.
-- Medido el 7-sep: 12 convenios firmados desde el 4-sep con partitura NULL (antes: 0 de 38);
-- 11 cajas financiadas rotuladas 'pago' (JHEINER 9-11, YEISON 4-6, ESTARLIS 42-43, JESUS
-- MALDONADO 30, JOSE SANMARTIN 20-21). Ninguno de los 12 ha recibido plata al convenio todavía y
-- ninguna nómina se ha cerrado: se alcanza a corregir sin que nadie haya cobrado de más.
--
-- QUÉ HACE. (1) Deja las dos funciones EXACTAMENTE como la 116 + el único cambio que la 124 quería
-- (escribir `convenio_id`). (2) Rotula 'convenio' las 11 cajas. (3) Reconstruye la partitura de los
-- 12 con la misma regla de la 116 al firmar. (4) Recalcula la amortización (idempotente; con $0
-- abonados no mueve nada, solo deja todo consistente).
--
-- LECCIÓN (queda en CLAUDE.md): una función que se reescribe se copia de `pg_get_functiondef`
-- de la base VIVA, nunca del archivo de una migración anterior.

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 1) Al FIRMAR — cuerpo de la 116 + `convenio_id` (★ 124)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
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
     set estado = 'en_convenio',
         convenio_id = new.id          -- ★ 124: el rastro
   where contrato_id = new.contrato_id
     and estado = 'pendiente'
     and created_at <= new.created_at;

  select * into v_c from public.contratos where id = new.contrato_id;

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

  if new.deuda_total - v_suma > 0 then
    v_partitura := v_partitura || jsonb_build_object(
      'tipo', 'ajuste', 'etiqueta', 'Ajuste pactado (redondeo de cuotas)',
      'monto', new.deuda_total - v_suma);
  end if;

  update public.convenios set partitura = v_partitura where id = new.id;

  return new;
end; $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 2) Al AMPLIAR — cuerpo de la 116 + `convenio_id` (★ 124)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
create or replace function public.convenio_ampliado_marca_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_extra numeric;
  v_d record;
  v_anexo jsonb := '[]'::jsonb;
begin
  if new.estado <> 'activo' then return new; end if;

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
    if v_d.monto_pendiente <= v_extra then
      update public.deudas
         set estado = 'en_convenio',
             convenio_id = new.id      -- ★ 124: el rastro
       where id = v_d.id;
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

  if new.partitura is not null and jsonb_array_length(v_anexo) > 0 then
    update public.convenios set partitura = new.partitura || v_anexo where id = new.id;
  end if;

  return new;
end; $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 3) Las 11 cajas financiadas que quedaron rotuladas 'pago' → 'convenio'
--    (mismo contrato, mismo instante de creación que el convenio, dentro del rango que marcó)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
update public.cajas_llenadas cl
   set fuente = 'convenio'
  from public.convenios cv
 where cv.contrato_id = cl.contrato_id
   and cl.created_at = cv.created_at
   and cv.created_at >= '2026-09-04'
   and cl.fuente = 'pago'
   and cv.cajas_pagadas_marcadas is not null
   and cl.caja_numero between coalesce(cv.cajas_pagadas_previas, 0) + 1 and cv.cajas_pagadas_marcadas;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 4) Reconstruir la partitura de los convenios firmados sin ella (misma regla de la 116)
-- ═══════════════════════════════════════════════════════════════════════════════════════════
do $$
declare
  cv record; v_c public.contratos; v_part jsonb; v_valor numeric; v_monto numeric; v_suma numeric; v_k int; v_d record;
begin
  for cv in
    select * from public.convenios
     where partitura is null and created_at >= '2026-09-04' and estado = 'activo'
     order by created_at
  loop
    v_part := '[]'::jsonb; v_suma := 0;
    select * into v_c from public.contratos where id = cv.contrato_id;

    -- Semanas que asumió (quedaron anotadas en el propio convenio al firmar).
    if cv.cajas_pagadas_marcadas is not null and cv.cajas_pagadas_marcadas > coalesce(cv.cajas_pagadas_previas, 0) then
      v_valor := public.caja_valor(v_c);
      for v_k in coalesce(cv.cajas_pagadas_previas, 0) + 1 .. cv.cajas_pagadas_marcadas loop
        v_monto := v_valor - case when v_k = coalesce(cv.cajas_pagadas_previas, 0) + 1
                                  then coalesce(cv.caja_actual_pagado_previo, 0) else 0 end;
        if v_monto > 0 then
          v_part := v_part || jsonb_build_object(
            'tipo', 'semana', 'ref', v_k,
            'etiqueta', 'Semana #' || v_k || ' del contrato'
                        || case when v_k = coalesce(cv.cajas_pagadas_previas, 0) + 1
                                 and coalesce(cv.caja_actual_pagado_previo, 0) > 0
                                then ' (lo que faltaba)' else '' end,
            'monto', v_monto);
          v_suma := v_suma + v_monto;
        end if;
      end loop;
    end if;

    -- Deudas envueltas: gracias a la 124 se sabe exactamente cuáles (convenio_id).
    for v_d in
      select id, concepto, monto_pendiente from public.deudas
       where convenio_id = cv.id and estado in ('en_convenio', 'pagada') and monto_pendiente > 0
       order by created_at
    loop
      v_part := v_part || jsonb_build_object(
        'tipo', 'deuda', 'ref', v_d.id::text,
        'etiqueta', 'Deuda: ' || v_d.concepto, 'monto', v_d.monto_pendiente);
      v_suma := v_suma + v_d.monto_pendiente;
    end loop;

    if cv.deuda_total - v_suma > 0 then
      v_part := v_part || jsonb_build_object(
        'tipo', 'ajuste', 'etiqueta', 'Ajuste pactado (redondeo de cuotas)',
        'monto', cv.deuda_total - v_suma);
    end if;

    update public.convenios set partitura = v_part where id = cv.id;
    -- Idempotente: con $0 abonados no cambia nada; si ya hubiera plata, tacha lo que toca.
    perform public.amortizar_convenio(cv.id);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) Ningún convenio vivo sin partitura (debe dar 0).
select count(*) as convenios_activos_sin_partitura from public.convenios where estado = 'activo' and partitura is null;

-- b) Ninguna caja financiada rotulada 'pago' (debe dar 0).
select count(*) as cajas_financiadas_mal_rotuladas
  from public.cajas_llenadas cl join public.convenios cv
    on cv.contrato_id = cl.contrato_id and cl.created_at = cv.created_at
 where cl.fuente = 'pago' and cv.cajas_pagadas_marcadas is not null
   and cl.caja_numero between coalesce(cv.cajas_pagadas_previas, 0) + 1 and cv.cajas_pagadas_marcadas;

-- c) Las 12 partituras reconstruidas: renglones y suma contra el total pactado.
select cl.nombre, cv.deuda_total,
       jsonb_array_length(cv.partitura) as renglones,
       (select sum((r->>'monto')::numeric) from jsonb_array_elements(cv.partitura) r) as suma_partitura,
       (select string_agg(r->>'etiqueta' || ' ' || (r->>'monto'), ' · ' order by ord)
          from jsonb_array_elements(cv.partitura) with ordinality as t(r, ord)) as detalle
  from public.convenios cv
  join public.contratos c on c.id = cv.contrato_id
  join public.clientes cl on cl.id = c.cliente_id
 where cv.created_at >= '2026-09-04' and cv.estado = 'activo'
 order by cv.created_at;
