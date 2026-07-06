-- ========= CORRECCIÓN DE PAGOS + REVERSIÓN DE AHORRO/CONVENIO =========
-- El trigger de la migración 032 solo sabía SUMAR ahorro al confirmar un pago.
-- Si un pago confirmado se anula (Rechazado) o se borra, el ahorro/convenio que
-- ya se le había sumado al contrato se quedaba pegado ahí para siempre ("ahorro
-- fantasma"). Este trigger reforzado sabe sumar Y restar, según corresponda.
--
-- También agrega la política para que SOLO ADMIN_PRINCIPAL pueda borrar un pago
-- de verdad (hoy nadie puede — no existía ninguna política de DELETE sobre
-- "pagos", así que quedaba bloqueado a todos por defecto).

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
  if v_pasa_a_confirmado and coalesce(v_row.aplicado_tarifa, 0) > 0 then
    if v_contrato.forma_pago = 'Diario' then
      v_ratio := coalesce(v_contrato.ahorro_diario, 4000)::numeric
                 / nullif(coalesce(v_contrato.tarifa_diaria, 27000) + coalesce(v_contrato.ahorro_diario, 4000), 0);
    else
      v_ratio := (6 * coalesce(v_contrato.ahorro_diario, 4000) + coalesce(v_contrato.ahorro_domingo, 2000))::numeric
                 / nullif(coalesce(v_contrato.valor_semanal, 0), 0);
    end if;

    if v_ratio is not null and v_ratio > 0 then
      v_ahorro_pago := round(v_row.aplicado_tarifa * v_ratio);
      v_nuevo_ahorro := coalesce(v_contrato.ahorro_acumulado, 0) + v_ahorro_pago;
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
      update public.pagos set aplicado_ahorro = v_ahorro_pago where id = v_row.id;
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
  -- Se recalcula siempre desde cero sumando los pagos que SIGAN Confirmado —
  -- funciona igual para sumar (pago nuevo confirmado) y para restar (pago
  -- anulado/borrado, que ya no aparece en la suma porque cambió de estado o
  -- porque la fila ya no existe en la tabla).
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

drop trigger if exists trg_pago_confirmado on public.pagos;
create trigger trg_pago_confirmado
  after insert or update of estado or delete on public.pagos
  for each row execute function public.aplicar_pago_confirmado();

-- ========= BORRADO DE PAGOS — SOLO ADMIN_PRINCIPAL =========
-- No existía ninguna política de DELETE sobre "pagos" (quedaba bloqueado a
-- todos por defecto con RLS activo). Se agrega, restringida a ADMIN_PRINCIPAL
-- únicamente — los demás roles deben pedirle a él que borre un pago mal
-- ingresado (el trigger de arriba ya deja el ahorro/convenio correctos al
-- borrarse).
drop policy if exists "Pagos: borrado solo admin principal" on public.pagos;
create policy "Pagos: borrado solo admin principal"
  on public.pagos for delete to authenticated
  using (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- ========= BACKFILL — AHORRO ACUMULADO DE CONTRATOS EXISTENTES =========
-- El trigger de ahorro (migración 032) nunca corrió antes de hoy, así que
-- todos los pagos ya Confirmados antes de esta fecha no sumaron su ahorro.
-- Este bloque los suma UNA sola vez — es seguro correrlo más de una vez
-- porque solo toma en cuenta los pagos que todavía tengan aplicado_ahorro
-- en 0 (si ya se sumó, no se vuelve a sumar).
do $$
declare
  r record;
  v_ratio numeric;
  v_suma_ahorro numeric;
begin
  for r in select * from public.contratos loop
    if r.forma_pago = 'Diario' then
      v_ratio := coalesce(r.ahorro_diario, 4000)::numeric
                 / nullif(coalesce(r.tarifa_diaria, 27000) + coalesce(r.ahorro_diario, 4000), 0);
    else
      v_ratio := (6 * coalesce(r.ahorro_diario, 4000) + coalesce(r.ahorro_domingo, 2000))::numeric
                 / nullif(coalesce(r.valor_semanal, 0), 0);
    end if;

    if v_ratio is null or v_ratio <= 0 then continue; end if;

    select coalesce(sum(round(aplicado_tarifa * v_ratio)), 0) into v_suma_ahorro
      from public.pagos
      where contrato_id = r.id and estado = 'Confirmado' and coalesce(aplicado_ahorro, 0) = 0;

    if v_suma_ahorro > 0 then
      update public.pagos set aplicado_ahorro = round(aplicado_tarifa * v_ratio)
        where contrato_id = r.id and estado = 'Confirmado' and coalesce(aplicado_ahorro, 0) = 0;

      update public.contratos set
        ahorro_acumulado = coalesce(ahorro_acumulado, 0) + v_suma_ahorro,
        base_completada = (coalesce(ahorro_acumulado, 0) + v_suma_ahorro) >= 510000
      where id = r.id;
    end if;
  end loop;
end $$;

-- ========= BACKFILL — CUOTAS DE CONVENIOS EXISTENTES =========
-- Mismo problema que el ahorro: marcarIncumplido/abonarCuotaConvenio nunca
-- corrieron antes de hoy. Este UPDATE recalcula desde cero (no suma, recalcula)
-- así que es seguro correrlo cuantas veces haga falta.
update public.convenios cv set
  cuotas_pagadas = least(
    floor(coalesce((
      select sum(p.aplicado_convenio) from public.pagos p
      where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
    ), 0) / nullif(cv.cuota_por_periodo, 0))::int,
    cv.numero_cuotas
  ),
  estado = case
    when least(
      floor(coalesce((
        select sum(p.aplicado_convenio) from public.pagos p
        where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado' and p.created_at >= cv.created_at
      ), 0) / nullif(cv.cuota_por_periodo, 0))::int,
      cv.numero_cuotas
    ) >= cv.numero_cuotas then 'cumplido'
    else cv.estado
  end
where cv.cuota_por_periodo > 0 and cv.estado in ('activo', 'cumplido');
