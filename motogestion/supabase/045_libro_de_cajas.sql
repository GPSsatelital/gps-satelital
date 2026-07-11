-- ===== 045: LIBRO DE CAJAS — motor de dinero v2 (especificación 11-jul-2026) =====
-- ⚠️ AÚN NO CORRER EN PRODUCCIÓN hasta completar F6 (inicialización de cajas).
-- El motor solo rige donde contratos.motor_v2 = true (interruptor por contrato):
--   · contratos existentes: false hasta que la F6 les inicialice sus cajas
--   · contratos nuevos del wizard (F3): nacen en true
-- Con motor_v2=false el trigger conserva EXACTAMENTE el comportamiento actual (mig 044).
--
-- Modelo (spec completa en CLAUDE.md → "🫀 LIBRO DE CAJAS"):
--   · Contrato = N cajas (calendario real). Termina al llenar la caja N (por pagos).
--   · FIFO: la plata de cuota llena la caja más vieja incompleta. Ahorro al llenar
--     cada caja (tarifa-primero dentro de la caja: los últimos $ del valor son ahorro).
--   · Caja 0 = prorrateo (nuevos). Caja 1 = adelantada, pagada con la base
--     (pago tipo_registro='adelanto_base', excluido de caja diaria).
--   · Orden: prorrateo → cajas exigidas → deudas → convenio → saldo a favor.
--   · Excedente de cuota NO llena cajas futuras solo (va a saldo); llenarlas es
--     decisión manual (rpc aplicar_saldo_a_cajas, F4).

-- ── 1) Campos nuevos ─────────────────────────────────────────────────────────
alter table public.contratos
  add column if not exists motor_v2 boolean not null default false,
  add column if not exists total_cajas integer,                       -- N (null = Diario/sin definir)
  add column if not exists cajas_pagadas integer not null default 0,  -- cajas 1..N llenas
  add column if not exists caja_actual_pagado numeric not null default 0, -- progreso caja en curso
  add column if not exists prorrateo_total numeric not null default 0,    -- valor caja 0 (0 = sin prorrateo)
  add column if not exists prorrateo_pagado numeric not null default 0,
  add column if not exists prorrateo_ahorro numeric not null default 0,   -- ahorro contenido en caja 0
  add column if not exists fecha_inicio_cajas date;  -- ancla: 1er día de pago (nuevos) o corte (migrados)

alter table public.pagos
  add column if not exists aplicado_prorrateo numeric not null default 0; -- para reversas exactas

-- ── 2) Valor y ahorro de una caja según el contrato (valores VIGENTES) ──────
create or replace function public.caja_valor(c public.contratos)
returns numeric language sql immutable as $$
  select case c.forma_pago
    when 'Semanal'   then coalesce(c.valor_semanal, 0)
    when 'Quincenal' then 2 * coalesce(c.valor_semanal, 0)
                          + coalesce(c.tarifa_diaria, 27000) + coalesce(c.ahorro_diario, 4000)
    when 'Mensual'   then 4 * coalesce(c.valor_semanal, 0)
                          + 2 * (coalesce(c.tarifa_diaria, 27000) + coalesce(c.ahorro_diario, 4000))
    else 0 end;
$$;

create or replace function public.caja_ahorro(c public.contratos)
returns numeric language sql immutable as $$
  select case c.forma_pago
    when 'Semanal'   then 6 * coalesce(c.ahorro_diario, 4000) + coalesce(c.ahorro_domingo, 2000)
    when 'Quincenal' then 2 * (6 * coalesce(c.ahorro_diario, 4000) + coalesce(c.ahorro_domingo, 2000))
                          + coalesce(c.ahorro_diario, 4000)
    when 'Mensual'   then 4 * (6 * coalesce(c.ahorro_diario, 4000) + coalesce(c.ahorro_domingo, 2000))
                          + 2 * coalesce(c.ahorro_diario, 4000)
    else 0 end;
$$;

-- ── 3) Cajas EXIGIDAS a una fecha (iniciadas desde fecha_inicio_cajas) ──────
-- La caja k se exige el día de pago que la inicia. fecha_inicio_cajas ES el día
-- que inicia la caja 1. Semanal: una caja cada 7 días. Quincenal/Mensual: por las
-- fechas del mes (dias_pago_mes) con clamp de fin de mes.
create or replace function public.cajas_exigidas(c public.contratos, p_hoy date)
returns integer language plpgsql stable as $$
declare
  v_n int := 0;
  v_d date;
  v_dias int[];
  v_mes date;
  v_dia int;
  v_fecha date;
begin
  if c.fecha_inicio_cajas is null or p_hoy < c.fecha_inicio_cajas then return 0; end if;

  if c.forma_pago = 'Semanal' then
    v_n := floor((p_hoy - c.fecha_inicio_cajas) / 7.0)::int + 1;
  elsif c.forma_pago in ('Quincenal', 'Mensual') then
    v_dias := coalesce(c.dias_pago_mes, case when c.forma_pago = 'Quincenal' then array[5,20] else array[5] end);
    v_mes := date_trunc('month', c.fecha_inicio_cajas)::date;
    while v_mes <= p_hoy loop
      foreach v_dia in array v_dias loop
        -- clamp al último día del mes (ej. día 30 en febrero)
        v_fecha := least(v_mes + (v_dia - 1), (v_mes + interval '1 month' - interval '1 day')::date);
        if v_fecha >= c.fecha_inicio_cajas and v_fecha <= p_hoy then
          v_n := v_n + 1;
        end if;
      end loop;
      v_mes := (v_mes + interval '1 month')::date;
    end loop;
  else
    return 0; -- Diario: fuera del libro
  end if;

  if c.total_cajas is not null then
    v_n := least(v_n, c.total_cajas);
  end if;
  return greatest(v_n, 0);
end;
$$;

-- ── 4) TRIGGER v3: reparto completo en la BD ────────────────────────────────
-- motor_v2=false → comportamiento idéntico a mig 044 (sin cambios para los actuales).
-- motor_v2=true  → si el pago llega SIN reparto (aplicado_* en null/0 y hay valor),
--   la BD reparte al confirmar: prorrateo → cajas exigidas → deudas → convenio → saldo.
--   El ahorro se acredita al cruzar el tramo final de cada caja (tarifa-primero).
--   'adelanto_base' puede llenar su caja aunque no esté exigida (prepago autorizado).
--   Reversas: des-llena cajas en orden inverso con los aplicados guardados.
create or replace function public.aplicar_pago_confirmado()
returns trigger language plpgsql security definer as $$
declare
  v_contrato public.contratos;
  v_ratio numeric;
  v_ahorro_pago numeric := 0;
  v_nuevo_ahorro numeric;
  v_convenio record;
  v_abonado_total numeric;
  v_cuotas_completas int;
  v_row record;
  v_pasa_a_confirmado boolean;
  v_sale_de_confirmado boolean;
  v_resto numeric;
  v_delta numeric;
  v_d record;
  -- motor v2
  v_monto numeric;
  v_ap_pror numeric := 0;
  v_ap_tarifa numeric := 0;
  v_ap_deuda numeric := 0;
  v_ap_conv numeric := 0;
  v_ap_saldo numeric := 0;
  v_falta numeric;
  v_caja_val numeric;
  v_caja_ah numeric;
  v_exigidas int;
  v_antes numeric;
  v_despues numeric;
  v_pend_conv numeric;
  v_sin_reparto boolean;
begin
  if tg_op = 'DELETE' then
    v_row := old;
    v_pasa_a_confirmado := false;
    v_sale_de_confirmado := (old.estado = 'Confirmado');
  elsif tg_op = 'INSERT' then
    v_row := new;
    v_pasa_a_confirmado := (new.estado = 'Confirmado');
    v_sale_de_confirmado := false;
  else
    v_row := new;
    v_pasa_a_confirmado := (new.estado = 'Confirmado' and old.estado is distinct from 'Confirmado');
    v_sale_de_confirmado := (old.estado = 'Confirmado' and new.estado is distinct from 'Confirmado');
  end if;

  if not v_pasa_a_confirmado and not v_sale_de_confirmado then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  select * into v_contrato from public.contratos where id = v_row.contrato_id;
  if v_contrato.id is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  -- ════════════════════ MOTOR V2 (libro de cajas) ════════════════════
  if v_contrato.motor_v2 and v_contrato.forma_pago <> 'Diario' then
    if v_pasa_a_confirmado then
      v_sin_reparto := coalesce(v_row.aplicado_tarifa, 0) = 0 and coalesce(v_row.aplicado_deuda, 0) = 0
                   and coalesce(v_row.aplicado_convenio, 0) = 0 and coalesce(v_row.aplicado_saldo_favor, 0) = 0
                   and coalesce(v_row.aplicado_prorrateo, 0) = 0;
      v_monto := v_row.valor;
      v_caja_val := public.caja_valor(v_contrato);
      v_caja_ah := public.caja_ahorro(v_contrato);

      if v_sin_reparto and v_monto > 0 then
        -- 1) Caja 0: prorrateo (tarifa-primero: el tramo final es ahorro)
        -- El 'adelanto_base' NO paga prorrateo: va directo a la Caja 1 (la semana
        -- adelantada de la base); el prorrateo lo paga el cliente el primer día de pago.
        v_falta := case when v_row.tipo_registro = 'adelanto_base' then 0
                        else greatest(v_contrato.prorrateo_total - v_contrato.prorrateo_pagado, 0) end;
        if v_falta > 0 then
          v_delta := least(v_monto, v_falta);
          v_antes := least(greatest(v_contrato.prorrateo_pagado - (v_contrato.prorrateo_total - v_contrato.prorrateo_ahorro), 0), v_contrato.prorrateo_ahorro);
          v_despues := least(greatest(v_contrato.prorrateo_pagado + v_delta - (v_contrato.prorrateo_total - v_contrato.prorrateo_ahorro), 0), v_contrato.prorrateo_ahorro);
          v_ahorro_pago := v_ahorro_pago + (v_despues - v_antes);
          v_contrato.prorrateo_pagado := v_contrato.prorrateo_pagado + v_delta;
          v_ap_pror := v_delta;
          v_monto := v_monto - v_delta;
        end if;

        -- 2) Cajas FIFO — solo hasta las EXIGIDAS hoy (excedente NO llena futuras),
        --    salvo 'adelanto_base' (la adelantada llena su caja aunque no esté exigida).
        v_exigidas := public.cajas_exigidas(v_contrato, coalesce(v_row.fecha, current_date));
        if v_row.tipo_registro = 'adelanto_base' then
          v_exigidas := greatest(v_exigidas, v_contrato.cajas_pagadas + 1);
        end if;
        while v_monto > 0
          and v_contrato.cajas_pagadas < coalesce(v_contrato.total_cajas, 2147483647)
          and v_contrato.cajas_pagadas < v_exigidas
          and v_caja_val > 0
        loop
          v_falta := v_caja_val - v_contrato.caja_actual_pagado;
          v_delta := least(v_monto, v_falta);
          v_antes := least(greatest(v_contrato.caja_actual_pagado - (v_caja_val - v_caja_ah), 0), v_caja_ah);
          v_despues := least(greatest(v_contrato.caja_actual_pagado + v_delta - (v_caja_val - v_caja_ah), 0), v_caja_ah);
          v_ahorro_pago := v_ahorro_pago + (v_despues - v_antes);
          v_contrato.caja_actual_pagado := v_contrato.caja_actual_pagado + v_delta;
          v_ap_tarifa := v_ap_tarifa + v_delta;
          v_monto := v_monto - v_delta;
          if v_contrato.caja_actual_pagado >= v_caja_val then
            v_contrato.cajas_pagadas := v_contrato.cajas_pagadas + 1;
            v_contrato.caja_actual_pagado := 0;
          end if;
        end loop;

        -- 3) Deudas (más antigua primero)
        if v_monto > 0 then
          v_resto := v_monto;
          for v_d in
            select id, monto_pendiente from public.deudas
            where contrato_id = v_row.contrato_id and estado <> 'pagada' and monto_pendiente > 0
            order by created_at
          loop
            exit when v_resto <= 0;
            v_delta := least(v_resto, v_d.monto_pendiente);
            update public.deudas set
              monto_pendiente = monto_pendiente - v_delta,
              estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
            where id = v_d.id;
            v_resto := v_resto - v_delta;
          end loop;
          v_ap_deuda := v_monto - v_resto;
          v_monto := v_resto;
        end if;

        -- 4) Convenio activo (hasta su saldo pendiente)
        if v_monto > 0 then
          select * into v_convenio from public.convenios
            where contrato_id = v_row.contrato_id and estado = 'activo' limit 1;
          if v_convenio.id is not null then
            select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
              from public.pagos
              where contrato_id = v_row.contrato_id and estado = 'Confirmado'
                and created_at >= v_convenio.created_at and id <> v_row.id;
            v_pend_conv := greatest(coalesce(v_convenio.deuda_total, 0) - v_abonado_total, 0);
            v_ap_conv := least(v_monto, v_pend_conv);
            v_monto := v_monto - v_ap_conv;
          end if;
        end if;

        -- 5) Lo que sobre → saldo a favor
        v_ap_saldo := v_monto;

        update public.pagos set
          aplicado_prorrateo = v_ap_pror,
          aplicado_tarifa = v_ap_tarifa,
          aplicado_deuda = v_ap_deuda,
          aplicado_convenio = v_ap_conv,
          aplicado_saldo_favor = v_ap_saldo,
          aplicado_ahorro = v_ahorro_pago
        where id = v_row.id;

        update public.contratos set
          prorrateo_pagado = v_contrato.prorrateo_pagado,
          cajas_pagadas = v_contrato.cajas_pagadas,
          caja_actual_pagado = v_contrato.caja_actual_pagado,
          ahorro_acumulado = coalesce(ahorro_acumulado, 0) + v_ahorro_pago
        where id = v_contrato.id;
      else
        -- Pago que YA trae reparto (correcciones por SQL / adelanto con valores fijos):
        -- aplicar acumuladores tal cual sin recalcular.
        update public.contratos set
          prorrateo_pagado = prorrateo_pagado + coalesce(v_row.aplicado_prorrateo, 0),
          caja_actual_pagado = caja_actual_pagado + coalesce(v_row.aplicado_tarifa, 0),
          ahorro_acumulado = coalesce(ahorro_acumulado, 0) + coalesce(v_row.aplicado_ahorro, 0)
        where id = v_contrato.id;
        -- normaliza cajas completas
        update public.contratos c2 set
          cajas_pagadas = c2.cajas_pagadas + floor(c2.caja_actual_pagado / nullif(public.caja_valor(c2), 0))::int,
          caja_actual_pagado = c2.caja_actual_pagado - floor(c2.caja_actual_pagado / nullif(public.caja_valor(c2), 0))::int * public.caja_valor(c2)
        where c2.id = v_contrato.id and public.caja_valor(c2) > 0;
        -- deudas como en v1
        if coalesce(v_row.aplicado_deuda, 0) > 0 then
          v_resto := v_row.aplicado_deuda;
          for v_d in
            select id, monto_pendiente from public.deudas
            where contrato_id = v_row.contrato_id and estado <> 'pagada' and monto_pendiente > 0
            order by created_at
          loop
            exit when v_resto <= 0;
            v_delta := least(v_resto, v_d.monto_pendiente);
            update public.deudas set
              monto_pendiente = monto_pendiente - v_delta,
              estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
            where id = v_d.id;
            v_resto := v_resto - v_delta;
          end loop;
        end if;
      end if;

    elsif v_sale_de_confirmado then
      -- REVERSA v2: des-llenar con los aplicados guardados (orden inverso)
      -- cajas: restar aplicado_tarifa del progreso (bajando cajas completas si hace falta)
      v_caja_val := public.caja_valor(v_contrato);
      v_resto := coalesce(v_row.aplicado_tarifa, 0);
      if v_resto > 0 and v_caja_val > 0 then
        v_delta := v_contrato.caja_actual_pagado;
        if v_resto <= v_delta then
          v_contrato.caja_actual_pagado := v_delta - v_resto;
          v_resto := 0;
        else
          v_resto := v_resto - v_delta;
          v_contrato.caja_actual_pagado := 0;
          while v_resto > 0 and v_contrato.cajas_pagadas > 0 loop
            v_contrato.cajas_pagadas := v_contrato.cajas_pagadas - 1;
            if v_resto >= v_caja_val then
              v_resto := v_resto - v_caja_val;
            else
              v_contrato.caja_actual_pagado := v_caja_val - v_resto;
              v_resto := 0;
            end if;
          end loop;
        end if;
      end if;
      update public.contratos set
        prorrateo_pagado = greatest(prorrateo_pagado - coalesce(v_row.aplicado_prorrateo, 0), 0),
        cajas_pagadas = v_contrato.cajas_pagadas,
        caja_actual_pagado = v_contrato.caja_actual_pagado,
        ahorro_acumulado = greatest(coalesce(ahorro_acumulado, 0) - coalesce(v_row.aplicado_ahorro, 0), 0)
      where id = v_contrato.id;
      -- deudas: devolver (más reciente primero) — igual que v1
      if coalesce(v_row.aplicado_deuda, 0) > 0 then
        v_resto := v_row.aplicado_deuda;
        for v_d in
          select id, monto, monto_pendiente from public.deudas
          where contrato_id = v_row.contrato_id and monto_pendiente < monto
          order by created_at desc
        loop
          exit when v_resto <= 0;
          v_delta := least(v_resto, v_d.monto - v_d.monto_pendiente);
          update public.deudas set
            monto_pendiente = monto_pendiente + v_delta,
            estado = case when estado = 'pagada' and monto_pendiente + v_delta > 0 then 'pendiente' else estado end
          where id = v_d.id;
          v_resto := v_resto - v_delta;
        end loop;
      end if;
    end if;

    -- Convenio: recontar cuotas (igual que v1, con los aplicados ya guardados)
    select * into v_convenio from public.convenios
      where contrato_id = v_row.contrato_id and estado in ('activo', 'cumplido')
      limit 1;
    if v_convenio.id is not null and coalesce(v_convenio.cuota_por_periodo, 0) > 0 then
      select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
        from public.pagos
        where contrato_id = v_row.contrato_id and estado = 'Confirmado'
          and created_at >= v_convenio.created_at;
      v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas);
      update public.convenios set
        cuotas_pagadas = v_cuotas_completas,
        estado = case
          when v_cuotas_completas >= numero_cuotas then 'cumplido'
          when estado = 'cumplido' and v_cuotas_completas < numero_cuotas then 'activo'
          else estado
        end
      where id = v_convenio.id;
    end if;

    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;

  -- ════════════════════ MOTOR V1 (idéntico a mig 044) ════════════════════
  if v_pasa_a_confirmado and coalesce(v_row.aplicado_deuda, 0) > 0 then
    v_resto := v_row.aplicado_deuda;
    for v_d in
      select id, monto_pendiente from public.deudas
      where contrato_id = v_row.contrato_id and estado <> 'pagada' and monto_pendiente > 0
      order by created_at
    loop
      exit when v_resto <= 0;
      v_delta := least(v_resto, v_d.monto_pendiente);
      update public.deudas set
        monto_pendiente = monto_pendiente - v_delta,
        estado = case when monto_pendiente - v_delta <= 0 then 'pagada' else estado end
      where id = v_d.id;
      v_resto := v_resto - v_delta;
    end loop;
  elsif v_sale_de_confirmado and coalesce(v_row.aplicado_deuda, 0) > 0 then
    v_resto := v_row.aplicado_deuda;
    for v_d in
      select id, monto, monto_pendiente from public.deudas
      where contrato_id = v_row.contrato_id and monto_pendiente < monto
      order by created_at desc
    loop
      exit when v_resto <= 0;
      v_delta := least(v_resto, v_d.monto - v_d.monto_pendiente);
      update public.deudas set
        monto_pendiente = monto_pendiente + v_delta,
        estado = case when estado = 'pagada' and monto_pendiente + v_delta > 0 then 'pendiente' else estado end
      where id = v_d.id;
      v_resto := v_resto - v_delta;
    end loop;
  end if;

  if v_pasa_a_confirmado then
    if v_row.aplicado_ahorro is not null then
      v_ahorro_pago := v_row.aplicado_ahorro;
    elsif coalesce(v_row.aplicado_tarifa, 0) > 0 then
      if v_contrato.forma_pago = 'Diario' then
        v_ratio := coalesce(v_contrato.ahorro_diario, 4000)::numeric
                   / nullif(coalesce(v_contrato.tarifa_diaria, 27000) + coalesce(v_contrato.ahorro_diario, 4000), 0);
      else
        v_ratio := (6 * coalesce(v_contrato.ahorro_diario, 4000) + coalesce(v_contrato.ahorro_domingo, 2000))::numeric
                   / nullif(coalesce(v_contrato.valor_semanal, 0), 0);
      end if;
      if v_ratio is not null and v_ratio > 0 then
        v_ahorro_pago := round(v_row.aplicado_tarifa * v_ratio);
        update public.pagos set aplicado_ahorro = v_ahorro_pago where id = v_row.id;
      else
        v_ahorro_pago := 0;
      end if;
    else
      v_ahorro_pago := 0;
    end if;

    if v_ahorro_pago > 0 then
      v_nuevo_ahorro := coalesce(v_contrato.ahorro_acumulado, 0) + v_ahorro_pago;
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
    end if;
  elsif v_sale_de_confirmado then
    v_ahorro_pago := coalesce(v_row.aplicado_ahorro, 0);
    if v_ahorro_pago > 0 then
      v_nuevo_ahorro := greatest(coalesce(v_contrato.ahorro_acumulado, 0) - v_ahorro_pago, 0);
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
    end if;
  end if;

  select * into v_convenio from public.convenios
    where contrato_id = v_row.contrato_id and estado in ('activo', 'cumplido')
    limit 1;
  if v_convenio.id is not null and coalesce(v_convenio.cuota_por_periodo, 0) > 0 then
    select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
      from public.pagos
      where contrato_id = v_row.contrato_id
        and estado = 'Confirmado'
        and created_at >= v_convenio.created_at;
    v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas);
    update public.convenios set
      cuotas_pagadas = v_cuotas_completas,
      estado = case
        when v_cuotas_completas >= numero_cuotas then 'cumplido'
        when estado = 'cumplido' and v_cuotas_completas < numero_cuotas then 'activo'
        else estado
      end
    where id = v_convenio.id;
  end if;

  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
