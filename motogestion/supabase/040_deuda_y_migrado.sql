-- ===== 040: (1) la deuda baja cuando le abonan · (2) flag es_migrado (sin prorrateo) =====
-- BUG 1: al confirmar un pago con aplicado_deuda > 0, el sistema guardaba el abono en el
--        pago pero NUNCA restaba de deudas.monto_pendiente → el cliente quedaba debiendo
--        lo que ya había abonado (posible doble cobro). Se corrige en el trigger.
-- BUG 2: el prorrateo (primera cuota parcial) se aplicaba a clientes MIGRADOS, que ya
--        traían ciclos anteriores. Se agrega contratos.es_migrado; el prorrateo solo
--        aplica a contratos NO migrados. Todos los contratos que existen HOY son migrados.

-- ── (2) Flag es_migrado ─────────────────────────────────────────────────────
alter table public.contratos add column if not exists es_migrado boolean not null default false;
-- Todos los contratos actuales provienen de las migraciones PRADERA/RASTREADOR.
-- Los nuevos (wizard) nacen con es_migrado = false (default) → sí tienen prorrateo.
update public.contratos set es_migrado = true where es_migrado = false;

-- ── (1) Trigger: ahora también aplica/revierte la DEUDA ─────────────────────
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

  -- ── DEUDA ─────────────────────────────────────────────────────────────────
  -- Al confirmar: baja las deudas pendientes (más antigua primero) por aplicado_deuda.
  -- Al anular/borrar: devuelve ese monto a las deudas (más reciente primero), sin pasar
  -- del monto original. Así el saldo de la deuda siempre refleja lo realmente abonado.
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

  -- ── AHORRO ────────────────────────────────────────────────────────────────
  if v_pasa_a_confirmado then
    if coalesce(v_row.aplicado_ahorro, 0) > 0 then
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
      if tg_op <> 'DELETE' then
        update public.pagos set aplicado_ahorro = 0 where id = v_row.id;
      end if;
    end if;
  end if;

  -- ── CONVENIO ──────────────────────────────────────────────────────────────
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

-- ── (1b) BACKFILL: corrige las deudas que YA recibieron abonos sin descontarse ──
-- Los pagos confirmados antes de este cambio guardaron aplicado_deuda pero nunca
-- bajaron la deuda. Se resta ese total una sola vez (más antigua primero).
-- Idempotencia: si se corriera dos veces, la 2a no tiene efecto real solo si las
-- deudas ya están en su valor correcto; por seguridad, correr UNA vez y verificar.
do $$
declare
  v_c record;
  v_total numeric;
  v_resto numeric;
  v_delta numeric;
  v_d record;
begin
  for v_c in
    select contrato_id, coalesce(sum(aplicado_deuda), 0) as total
    from public.pagos
    where estado = 'Confirmado' and coalesce(aplicado_deuda, 0) > 0
    group by contrato_id
  loop
    v_resto := v_c.total;
    for v_d in
      select id, monto_pendiente from public.deudas
      where contrato_id = v_c.contrato_id and estado <> 'pagada' and monto_pendiente > 0
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
  end loop;
end $$;
