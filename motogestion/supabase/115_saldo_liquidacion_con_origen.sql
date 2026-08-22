-- ===== 115: el resto del saldo queda A FAVOR para el contrato nuevo — con su origen marcado =====
--
-- Pedido del dueño (22-ago, cerrando el circuito del cambio de moto): "mejor le deja los 510 [de
-- base] y el restante como saldo a favor, pero que siempre quede marcado de dónde viene y a
-- dónde se aplica cuando se aplique".
--
-- El cierre ya trasladaba la BASE (mig 114). Esto completa el circuito con el RESTO:
--
--   Al cerrar con "sigue con la empresa":     base (→ ingreso_inicial, wizard la precarga)
--                                           + resto a favor (→ queda ANOTADO en la liquidación)
--                                           + efectivo (lo que decida llevarse)
--
--   Cuando el wizard cree su contrato nuevo: el resto entra como `saldo_favor_apertura` del
--   contrato, la liquidación queda apuntando al contrato destino (no se puede reclamar dos
--   veces), y en la auditoría del contrato nuevo queda escrito DE DÓNDE VIENE ("viene de la
--   liquidación LIQ-XXXX"). A dónde se aplica cuando se aplique ya lo marca el sistema: cada
--   pago guarda su desglose (aplicado_*) y el flujo "Aplicar a lo que debe" existente.

alter table public.liquidaciones
  add column if not exists saldo_para_nueva numeric not null default 0,
  add column if not exists contrato_destino_id uuid references public.contratos(id);

comment on column public.liquidaciones.saldo_para_nueva is
  'Parte del saldo a favor que el cliente dejó reservada para su contrato NUEVO. El wizard la pasa a saldo_favor_apertura del contrato que cree y marca contrato_destino_id.';
comment on column public.liquidaciones.contrato_destino_id is
  'El contrato nuevo que ya reclamó ese saldo. Lleno = no se puede reclamar otra vez.';

-- La función de cierre (cuerpo de la 114) + el nuevo destino del resto.
drop function if exists public.cerrar_liquidacion(uuid, uuid, boolean, numeric);

create or replace function public.cerrar_liquidacion(
  p_liquidacion_id uuid,
  p_cerrada_por uuid,
  p_sigue_con_empresa boolean default false,
  p_base_nueva numeric default 0,
  p_saldo_para_nueva numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_liq             public.liquidaciones;
  v_estado_contrato text;
  v_estado_cliente  text;
  v_comprometida    boolean;
  v_otro_activo     boolean;
  v_faltante        numeric;
  v_base            numeric := 0;
  v_para_nueva      numeric := 0;
begin
  if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA') then
    raise exception 'Solo ADMIN, ADMIN_PRINCIPAL o SECRETARIA pueden cerrar una liquidación';
  end if;

  perform set_config('app.cierre_liquidacion', '1', true);

  select * into v_liq from public.liquidaciones where id = p_liquidacion_id for update;
  if v_liq.id is null then
    raise exception 'Liquidación no encontrada';
  end if;
  if v_liq.estado = 'cerrada' then
    raise exception 'Esta liquidación ya está cerrada';
  end if;

  if p_sigue_con_empresa and (coalesce(p_base_nueva, 0) > 0 or coalesce(p_saldo_para_nueva, 0) > 0) then
    if coalesce(v_liq.saldo_final, 0) <= 0 then
      raise exception 'No hay saldo a favor: no se puede dejar base ni saldo para la moto nueva';
    end if;
    if coalesce(p_base_nueva, 0) + coalesce(p_saldo_para_nueva, 0) > v_liq.saldo_final then
      raise exception 'Base + saldo para la moto nueva no pueden sumar más de lo que el cliente tiene a favor';
    end if;
    v_base := greatest(coalesce(p_base_nueva, 0), 0);
    v_para_nueva := greatest(coalesce(p_saldo_para_nueva, 0), 0);
  end if;

  update public.liquidaciones
     set estado = 'cerrada', cerrada_por = p_cerrada_por,
         base_trasladada = v_base, saldo_para_nueva = v_para_nueva
   where id = p_liquidacion_id;

  v_estado_contrato := case when v_liq.motivo = 'incumplimiento' then 'Cancelado' else 'Finalizado' end;
  update public.contratos set estado = v_estado_contrato where id = v_liq.contrato_id;

  update public.deudas
     set estado = 'pagada', monto_pendiente = 0
   where contrato_id = v_liq.contrato_id
     and estado in ('pendiente', 'en_convenio');

  update public.convenios
     set estado = 'cumplido', cuotas_pagadas = numero_cuotas
   where contrato_id = v_liq.contrato_id
     and estado in ('activo', 'incumplido');

  update public.contratos
     set ahorro_acumulado = 0, ahorro_apertura = 0
   where id = v_liq.contrato_id;

  v_faltante := -1 * coalesce(v_liq.saldo_final, 0);
  if v_faltante > 0 then
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por)
    values (
      v_liq.contrato_id, 'otro',
      'Saldo pendiente de la liquidación ' || v_liq.numero,
      v_faltante, v_faltante, 'pendiente', p_cerrada_por
    );
  end if;

  if v_liq.moto_id is not null then
    if v_liq.motivo = 'cumplimiento' then
      update public.motos set estado = 'En traspaso' where id = v_liq.moto_id;
    else
      select exists (
        select 1 from public.contratos
         where moto_id = v_liq.moto_id
           and estado in ('En proceso', 'Activo')
           and id <> v_liq.contrato_id
      ) into v_comprometida;
      if not v_comprometida then
        update public.motos set estado = 'Disponible' where id = v_liq.moto_id;
      end if;
    end if;
  end if;

  select exists (
    select 1 from public.contratos
     where cliente_id = v_liq.cliente_id
       and estado in ('Activo', 'En proceso')
       and id <> v_liq.contrato_id
  ) into v_otro_activo;

  if not v_otro_activo then
    v_estado_cliente := case
      when v_liq.motivo = 'cumplimiento' then 'Egresado'
      when p_sigue_con_empresa then 'Aprobado'
      else 'Retirado'
    end;
    update public.clientes set estado = v_estado_cliente where id = v_liq.cliente_id;
  end if;

  if v_base > 0 then
    update public.clientes set ingreso_inicial = v_base where id = v_liq.cliente_id;
  end if;

  if coalesce(v_liq.saldo_final, 0) < 0 then
    update public.clientes
       set lista_negra = true,
           motivo_lista_negra = 'Liquidación ' || v_liq.numero || ': saldo pendiente $'
             || replace(to_char(v_faltante, 'FM999,999,999,999'), ',', '.')
     where id = v_liq.cliente_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'estado_contrato', v_estado_contrato,
    'estado_cliente', coalesce(v_estado_cliente, 'sin cambio'),
    'deuda_creada', v_faltante > 0,
    'faltante', greatest(v_faltante, 0),
    'lista_negra', coalesce(v_liq.saldo_final, 0) < 0,
    'base_trasladada', v_base,
    'saldo_para_nueva', v_para_nueva
  );
end;
$$;

revoke all on function public.cerrar_liquidacion(uuid, uuid, boolean, numeric, numeric) from public;
grant execute on function public.cerrar_liquidacion(uuid, uuid, boolean, numeric, numeric) to authenticated;
