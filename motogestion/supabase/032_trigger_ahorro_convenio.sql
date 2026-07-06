-- ========= AHORRO ACUMULADO Y CUOTAS DE CONVENIO AUTOMÁTICOS =========
-- Dos funciones del sistema existían pero nunca se llamaban desde ningún lado
-- (actualizarAhorro y abonarCuotaConvenio): el ahorro_acumulado de TODOS los
-- contratos quedaba congelado en su valor inicial para siempre, y el contador
-- de cuotas de los convenios nunca avanzaba aunque el cliente pagara.
-- Este trigger corre en la base de datos al confirmar un pago, sin importar
-- desde cuál de las 3 pantallas se confirme (efectivo, transferencia, campo).

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
begin
  -- Solo cuando el pago QUEDA confirmado (insert confirmado o update a Confirmado)
  if new.estado <> 'Confirmado' then return new; end if;
  if tg_op = 'UPDATE' and old.estado = 'Confirmado' then return new; end if;

  select * into v_contrato from public.contratos where id = new.contrato_id;
  if v_contrato.id is null then return new; end if;

  -- ── AHORRO ────────────────────────────────────────────────────────────────
  -- Proporcional: de la parte del pago aplicada a la cuota (aplicado_tarifa),
  -- la fracción de ahorro es ahorro_del_período / valor_total_del_período.
  -- Diario: ratio del día L-S (el domingo tiene el suyo pero la diferencia es
  -- mínima y el ratio L-S es el representativo). Tiempo definido: mismo ratio
  -- toda la vida del contrato (ninguna semana es especial).
  if coalesce(new.aplicado_tarifa, 0) > 0 then
    if v_contrato.forma_pago = 'Diario' then
      v_ratio := coalesce(v_contrato.ahorro_diario, 4000)::numeric
                 / nullif(coalesce(v_contrato.tarifa_diaria, 27000) + coalesce(v_contrato.ahorro_diario, 4000), 0);
    else
      -- Semanal: ahorro semanal = 6*ahorro_ls + ahorro_dom; valor = valor_semanal
      v_ratio := (6 * coalesce(v_contrato.ahorro_diario, 4000) + coalesce(v_contrato.ahorro_domingo, 2000))::numeric
                 / nullif(coalesce(v_contrato.valor_semanal, 0), 0);
    end if;

    if v_ratio is not null and v_ratio > 0 then
      v_ahorro_pago := round(new.aplicado_tarifa * v_ratio);
      v_nuevo_ahorro := coalesce(v_contrato.ahorro_acumulado, 0) + v_ahorro_pago;
      update public.contratos set
        ahorro_acumulado = v_nuevo_ahorro,
        base_completada = (v_nuevo_ahorro >= 510000)
      where id = v_contrato.id;
      -- Guarda el desglose en el propio pago (antes siempre quedaba en 0)
      update public.pagos set aplicado_ahorro = v_ahorro_pago where id = new.id;
    end if;
  end if;

  -- ── CONVENIO ──────────────────────────────────────────────────────────────
  -- Avance automático de cuotas: cuotas completas = floor(abonado_total / cuota).
  -- El pago parcial abona (resta de la deuda) pero la cuota solo cuenta al completarse.
  if coalesce(new.aplicado_convenio, 0) > 0 then
    select * into v_convenio from public.convenios
      where contrato_id = new.contrato_id and estado = 'activo'
      limit 1;
    if v_convenio.id is not null and coalesce(v_convenio.cuota_por_periodo, 0) > 0 then
      select coalesce(sum(aplicado_convenio), 0) into v_abonado_total
        from public.pagos
        where contrato_id = new.contrato_id
          and estado = 'Confirmado'
          and created_at >= v_convenio.created_at;
      v_cuotas_completas := least(floor(v_abonado_total / v_convenio.cuota_por_periodo)::int, v_convenio.numero_cuotas);
      update public.convenios set
        cuotas_pagadas = v_cuotas_completas,
        estado = case when v_cuotas_completas >= numero_cuotas then 'cumplido' else 'activo' end
      where id = v_convenio.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_pago_confirmado on public.pagos;
create trigger trg_pago_confirmado
  after insert or update of estado on public.pagos
  for each row execute function public.aplicar_pago_confirmado();

-- ========= CONVENIOS VENCIDOS → INCUMPLIDO AUTOMÁTICO =========
-- marcarIncumplido() existía en el código pero nadie la llamaba: ningún convenio
-- podía quedar "incumplido" jamás. Esta función marca los vencidos; se puede
-- llamar desde el frontend al cargar los datos (o programarse con pg_cron si
-- algún día se habilita). Idempotente: solo toca los que sigan "activo".
create or replace function public.marcar_convenios_vencidos()
returns int language plpgsql security definer as $$
declare
  v_count int;
begin
  update public.convenios
     set estado = 'incumplido'
   where estado = 'activo'
     and fecha_limite < current_date
     and cuotas_pagadas < numero_cuotas;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ========= VÍNCULO TALLER ↔ LIQUIDACIÓN (Fase 3) =========
-- Cuando una liquidación manda la moto a taller, la orden de taller real queda
-- vinculada para que al finalizarla sus resultados alimenten la liquidación.
alter table public.liquidaciones
  add column if not exists taller_id uuid references public.taller(id);

-- ========= TRASPASO DE MOTO AL CLIENTE QUE CUMPLE (Fase 5) =========
-- "En traspaso": la moto dejó la flota para siempre (el cliente cumplió y se la
-- lleva). fecha_traspaso_completado null = trámite legal de cambio de titularidad
-- aún en curso; con fecha = traspaso legalmente completado.
alter table public.motos
  add column if not exists fecha_traspaso_completado date;
