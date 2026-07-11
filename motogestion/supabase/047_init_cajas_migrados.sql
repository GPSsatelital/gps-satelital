-- ===== 047: F6 — inicialización del LIBRO DE CAJAS para los contratos migrados =====
-- PASO A: correr las funciones + `select * from public.preview_init_cajas()` → tabla de
--         conversión (meses→N, previas, inicio, estado resultante) para APROBACIÓN del usuario.
-- PASO B: solo tras aprobar, correr el UPDATE del final (enciende motor_v2 en los migrados).
-- Reglas: corte por grupo (PRADERA 1-jul / RASTREADOR 6-jul) · N = calendario real
-- (semanal round(meses*365/12/7), quincenal meses*2, mensual meses) · previas = cuotas
-- pre-corte (cubiertas por el arqueo) + cajas financiadas por convenio (cubre_periodo_hasta)
-- · llenado inicial desde Σ aplicado_tarifa de pagos Confirmados (todos post-corte).

-- Helpers de fechas de pago para Quincenal/Mensual (dias_pago_mes con clamp fin de mes)
create or replace function public._payday_siguiente(p_dias int[], p_desde date)
returns date language plpgsql immutable as $$
declare v_mes date; v_dia int; v_f date; v_best date;
begin
  v_mes := date_trunc('month', p_desde)::date;
  for i in 0..24 loop
    foreach v_dia in array p_dias loop
      v_f := least(v_mes + (v_dia - 1), (v_mes + interval '1 month' - interval '1 day')::date);
      if v_f >= p_desde and (v_best is null or v_f < v_best) then v_best := v_f; end if;
    end loop;
    exit when v_best is not null;
    v_mes := (v_mes + interval '1 month')::date;
  end loop;
  return v_best;
end; $$;

create or replace function public._paydays_entre(p_dias int[], p_desde date, p_hasta date)
returns int language plpgsql immutable as $$
declare v_mes date; v_dia int; v_f date; v_n int := 0;
begin
  if p_hasta <= p_desde then return 0; end if;
  v_mes := date_trunc('month', p_desde)::date;
  while v_mes < p_hasta loop
    foreach v_dia in array p_dias loop
      v_f := least(v_mes + (v_dia - 1), (v_mes + interval '1 month' - interval '1 day')::date);
      if v_f >= p_desde and v_f < p_hasta then v_n := v_n + 1; end if;
    end loop;
    v_mes := (v_mes + interval '1 month')::date;
  end loop;
  return v_n;
end; $$;

-- Vista previa de la inicialización (NO modifica nada)
-- NOTA: la versión CORRIDA en Supabase (11-jul) usa una variable v_c public.contratos
-- (select * into v_c ... where id = r.cid) porque caja_valor() exige la fila tipada —
-- el record del join daba "cannot cast type record to contratos". Ver historial del chat;
-- el cuerpo de abajo es la versión original de referencia.
create or replace function public.preview_init_cajas()
returns table(
  contrato_id uuid, nombre text, placa text, forma text, meses int, grupo text,
  corte date, inicio_cajas date, previas int, financiadas int, total_cajas int,
  tarifa_sistema numeric, cajas_llenas int, caja_actual numeric,
  exigidas_hoy int, pagadas_init int, estado_v2 text
) language plpgsql stable as $$
declare
  r record; v_corte date; v_target int; v_primer date; v_inicio date;
  v_prev int; v_fin int := 0; v_tot int; v_val numeric; v_ah numeric;
  v_tar numeric; v_add int; v_resto numeric; v_exig int; v_cubre date;
  v_dias int[]; v_pag int;
begin
  for r in
    select c.*, cl.nombre as cli_nombre, m.placa as m_placa, m.grupo as m_grupo
    from public.contratos c
    join public.clientes cl on cl.id = c.cliente_id
    left join public.motos m on m.id = c.moto_id
    where c.es_migrado = true and c.forma_pago <> 'Diario'
      and c.estado in ('Activo', 'Suspendido')
  loop
    v_corte := case when r.m_grupo = 'RASTREADOR' then date '2026-07-06' else date '2026-07-01' end;
    v_fin := 0;

    if r.forma_pago = 'Semanal' then
      v_target := case when r.dia_pago in ('Miércoles', 'Miercoles') then 3 else 1 end;
      v_inicio := v_corte + ((v_target - extract(dow from v_corte)::int + 7) % 7);
      v_primer := r.fecha_entrega + ((v_target - extract(dow from r.fecha_entrega)::int + 7) % 7);
      if v_primer = r.fecha_entrega then v_primer := v_primer + 7; end if;
      v_prev := greatest(((v_inicio - v_primer) / 7)::int, 0);
      v_tot := case when r.meses is null then null else round(r.meses * 365.0 / 12 / 7)::int end;
    else
      v_dias := coalesce(r.dias_pago_mes, case when r.forma_pago = 'Quincenal' then array[5,20] else array[5] end);
      v_inicio := public._payday_siguiente(v_dias, v_corte);
      v_primer := public._payday_siguiente(v_dias, (r.fecha_entrega + 1));
      v_prev := greatest(public._paydays_entre(v_dias, v_primer, v_inicio), 0);
      v_tot := case when r.meses is null then null
                    when r.forma_pago = 'Quincenal' then r.meses * 2
                    else r.meses end;
    end if;

    -- Cajas financiadas por convenio activo (cubre_periodo_hasta futuro)
    select cv.cubre_periodo_hasta into v_cubre
      from public.convenios cv where cv.contrato_id = r.id and cv.estado = 'activo' limit 1;
    if v_cubre is not null and v_cubre > v_inicio then
      if r.forma_pago = 'Semanal' then
        v_fin := greatest(((v_cubre - v_inicio) / 7)::int, 0);
      else
        v_fin := greatest(public._paydays_entre(v_dias, v_inicio, v_cubre), 0);
      end if;
    end if;

    v_val := public.caja_valor(r);
    select coalesce(sum(coalesce(p.aplicado_tarifa, 0)), 0) into v_tar
      from public.pagos p where p.contrato_id = r.id and p.estado = 'Confirmado';
    v_add := case when v_val > 0 then floor(v_tar / v_val)::int else 0 end;
    v_resto := v_tar - v_add * v_val;

    v_pag := v_prev + v_fin + v_add;
    if r.forma_pago = 'Semanal' then
      v_exig := least(coalesce(v_tot, 999999),
                      v_prev + v_fin + greatest(floor((current_date - v_inicio) / 7.0)::int + 1, 0));
    else
      v_exig := least(coalesce(v_tot, 999999),
                      v_prev + v_fin + public._paydays_entre(v_dias, v_inicio, current_date + 1));
    end if;

    contrato_id := r.id; nombre := r.cli_nombre; placa := r.m_placa; forma := r.forma_pago;
    meses := r.meses; grupo := r.m_grupo; corte := v_corte; inicio_cajas := v_inicio;
    previas := v_prev; financiadas := v_fin; total_cajas := v_tot;
    tarifa_sistema := v_tar; cajas_llenas := v_add; caja_actual := v_resto;
    exigidas_hoy := v_exig; pagadas_init := v_pag;
    estado_v2 := case
      when v_pag >= v_exig and v_resto >= 0 then 'AL DIA'
      when v_exig - v_pag = 1 and v_resto > 0 then 'PARCIAL SEMANA ACTUAL'
      else 'DEBE ' || (v_exig - v_pag)::text || ' caja(s)'
    end;
    return next;
  end loop;
end; $$;

-- ═══ PASO B (correr SOLO tras aprobar la tabla del preview) ═══
-- update public.contratos c set
--   motor_v2 = true,
--   fecha_inicio_cajas = p.inicio_cajas,
--   cajas_previas = p.previas + p.financiadas,
--   total_cajas = p.total_cajas,
--   cajas_pagadas = p.pagadas_init,
--   caja_actual_pagado = p.caja_actual,
--   prorrateo_total = 0, prorrateo_pagado = 0, prorrateo_ahorro = 0
-- from public.preview_init_cajas() p
-- where p.contrato_id = c.id and p.total_cajas is not null;
