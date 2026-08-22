-- ===== 114: el saldo de la liquidación pasa DIRECTO como base de la moto nueva =====
--
-- Pedido del dueño (22-ago, caso JOSUE/RML59H — cambio de moto): "lo que le quede entra enseguida
-- como base para la siguiente". Antes había que hacerlo a mano en dos pasos (entregarle la plata y
-- después editarle el ingreso inicial en su ficha) — dos pasos a mano en un traslado de plata son
-- dos oportunidades de que quede a medias.
--
-- Ahora el cierre recibe cuánto del saldo queda como base (editable en pantalla, porque a veces
-- una parte se la lleva en efectivo) y la BD hace las dos cosas EN LA MISMA transacción del
-- cierre: escribe clientes.ingreso_inicial (el wizard paso 1 lo precarga solo) y deja el rastro
-- en liquidaciones.base_trasladada (el recibo de egreso imprime el desglose: base vs efectivo).
--
-- Candados: solo si marcó "sigue con la empresa", solo con saldo a favor, y nunca más de lo que
-- tiene a favor (raise si se intenta). Se DROPEA la firma anterior — dos funciones con el mismo
-- nombre dejan a Postgres eligiendo cuál llamar, y en plata eso no se deja al azar (regla 106).

alter table public.liquidaciones
  add column if not exists base_trasladada numeric not null default 0;

comment on column public.liquidaciones.base_trasladada is
  'Cuánto del saldo a favor quedó directo como base de la moto nueva al cerrar (va a clientes.ingreso_inicial). El resto se entregó en efectivo.';

drop function if exists public.cerrar_liquidacion(uuid, uuid, boolean);

create or replace function public.cerrar_liquidacion(
  p_liquidacion_id uuid,
  p_cerrada_por uuid,
  p_sigue_con_empresa boolean default false,
  p_base_nueva numeric default 0
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

  -- ⬇️ LO NUEVO (mig 114): la base que queda para la moto nueva, con sus candados.
  if p_sigue_con_empresa and coalesce(p_base_nueva, 0) > 0 then
    if coalesce(v_liq.saldo_final, 0) <= 0 then
      raise exception 'No hay saldo a favor: no se puede dejar base para la moto nueva';
    end if;
    if p_base_nueva > v_liq.saldo_final then
      raise exception 'La base para la moto nueva no puede ser más de lo que el cliente tiene a favor';
    end if;
    v_base := p_base_nueva;
  end if;

  update public.liquidaciones
     set estado = 'cerrada', cerrada_por = p_cerrada_por, base_trasladada = v_base
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

  -- ⬇️ LO NUEVO (mig 114): la base queda lista para que el wizard la precargue.
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
    'base_trasladada', v_base
  );
end;
$$;

revoke all on function public.cerrar_liquidacion(uuid, uuid, boolean, numeric) from public;
grant execute on function public.cerrar_liquidacion(uuid, uuid, boolean, numeric) to authenticated;
