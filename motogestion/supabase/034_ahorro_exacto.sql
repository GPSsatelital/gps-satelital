-- ========= AHORRO EXACTO — EL TRIGGER RESPETA EL VALOR CALCULADO POR LA APP =========
-- Bug encontrado con datos reales (JHEINER PALOMINO SALAS): su primer pago fue un
-- prorrateo de $109.000 (3 días L-S + 1 domingo) y el trigger le calculó $14.030 de
-- ahorro usando el PROMEDIO semanal (regla de tres 26.000/202.000), cuando el valor
-- exacto día por día es $14.000 (3×$4.000 + $2.000). El promedio solo es exacto para
-- semanas completas; en prorrateos y pagos parciales se desvía unos pesos.
--
-- Solución: la app ahora calcula el ahorro EXACTO al registrar cada pago (día por día
-- para prorrateo, composición fija del período para el resto — funciones nuevas en
-- cicloPago.ts) y lo guarda en pagos.aplicado_ahorro desde el inicio. El trigger:
--   1. Si el pago YA TRAE aplicado_ahorro > 0 → lo usa tal cual (valor exacto de la app).
--   2. Si viene en 0/null (pagos viejos registrados antes de este cambio) → calcula el
--      promedio como respaldo, igual que antes.
-- La reversión (anular/borrar) no cambia: siempre resta lo que ese pago sumó.

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
begin
  if tg_op = 'DELETE' then
    v_row := old;
    v_pasa_a_confirmado := false;
    v_sale_de_confirmado := (old.estado = 'Confirmado');
  elsif tg_op = 'INSERT' then
    v_row := new;
    v_pasa_a_confirmado := (new.estado = 'Confirmado');
    v_sale_de_confirmado := false;
  else -- UPDATE
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

  -- ── AHORRO ────────────────────────────────────────────────────────────────
  if v_pasa_a_confirmado then
    if coalesce(v_row.aplicado_ahorro, 0) > 0 then
      -- La app ya calculó el ahorro exacto (día por día / composición del período).
      v_ahorro_pago := v_row.aplicado_ahorro;
    elsif coalesce(v_row.aplicado_tarifa, 0) > 0 then
      -- Respaldo para pagos sin desglose exacto (registrados antes de este cambio):
      -- promedio del período — puede desviarse unos pesos en prorrateos.
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
      if tg_op <> 'DELETE' then
        update public.pagos set aplicado_ahorro = 0 where id = v_row.id;
      end if;
    end if;
  end if;

  -- ── CONVENIO ──────────────────────────────────────────────────────────────
  -- Recalcula siempre desde cero sumando los pagos que SIGAN Confirmado.
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

-- El trigger en sí no cambia (mismos eventos) — se recrea por consistencia.
drop trigger if exists trg_pago_confirmado on public.pagos;
create trigger trg_pago_confirmado
  after insert or update of estado or delete on public.pagos
  for each row execute function public.aplicar_pago_confirmado();
