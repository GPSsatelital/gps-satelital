-- ===== 044: el trigger ya NO trata aplicado_ahorro = 0 como "dato faltante" =====
-- Con la regla tarifa-primero (10-jul), $0 es un valor REAL: abono parcial que no alcanzó
-- la parte de la empresa. El trigger anterior (034/040) usaba `coalesce(aplicado_ahorro,0) > 0`
-- y al confirmar un pago con ahorro 0 recalculaba el promedio proporcional viejo y lo
-- escribía encima (víctimas reales: CRISTIAN AGUIRRE $12.871, EFREN $18.020).
-- Cambios: (1) el respaldo proporcional SOLO corre si aplicado_ahorro IS NULL (pagos legado);
-- (2) al revertir una confirmación ya no se pone el ahorro en 0 — se conserva el valor exacto
-- de la app por si el pago se re-confirma.
-- ✅ Corrida en Supabase el 11-jul-2026 (junto con la corrección de los 3 pagos afectados).

create or replace function public.aplicar_pago_confirmado()
returns trigger language plpgsql security definer as $$
declare
  v_contrato record;
  v_ratio numeric;
  v_ahorro_pago numeric;
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

  -- AHORRO: usa el valor de la app tal cual (incluido 0). Promedio SOLO si es NULL (legado).
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
      -- Ya NO se resetea aplicado_ahorro a 0: el valor exacto de la app se conserva
      -- por si el pago vuelve a confirmarse.
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
