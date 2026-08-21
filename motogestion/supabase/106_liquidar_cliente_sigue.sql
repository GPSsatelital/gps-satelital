-- Migración 106: al liquidar se puede decir que el cliente SIGUE con la empresa
--
-- EL BLOQUEO QUE RESUELVE. Regla del dueño (21-ago): «la única forma de cambiar una moto de manera
-- permanente es liquidar la anterior — la liquidación es lo que certifica que el contrato queda
-- oficialmente cerrado y que al cliente se le regresó lo que le corresponde». O sea: liquidar es
-- el camino correcto, no un rodeo.
--
-- Pero el wizard de contratos SOLO ofrece clientes en estado 'Aprobado' (y lo valida otra vez al
-- crear), y la liquidación dejaba al cliente en 'Retirado'. Resultado: apenas se liquidaba a
-- alguien para pasarlo a otra moto, el sistema dejaba de ofrecerlo y no se le podía entregar nada.
-- El cliente quedaba trancado y tocaba devolverle el estado a mano.
--
-- Ahora el cierre recibe si la persona sigue con la empresa. Si sigue, queda 'Aprobado' — listo
-- para su contrato nuevo sin trámites. Si no, 'Retirado', igual que antes.
--
-- NO cambia nada más: el contrato se cierra igual, se le devuelve su plata igual, la moto sigue su
-- destino igual y el documento certifica el cierre igual. Solo cambia el estado final del cliente.
--
-- ⚠️ Se ignora en 'cumplimiento': ahí el cliente se lleva la moto y queda 'Egresado', que es su
-- caso feliz. Y no se toca al que ya tiene otro contrato vivo (graduación Diario → tiempo
-- definido), igual que antes.
--
-- Se DROPEA la versión anterior en vez de sobrecargarla: dos funciones con el mismo nombre y
-- distinta firma dejan a Postgres eligiendo cuál llamar, y en algo que mueve plata eso no se deja
-- al azar.

drop function if exists public.cerrar_liquidacion(uuid, uuid);

create or replace function public.cerrar_liquidacion(
  p_liquidacion_id uuid,
  p_cerrada_por uuid,
  p_sigue_con_empresa boolean default false
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
begin
  select * into v_liq from public.liquidaciones where id = p_liquidacion_id for update;
  if v_liq.id is null then
    raise exception 'Liquidación no encontrada';
  end if;
  if v_liq.estado = 'cerrada' then
    raise exception 'Esta liquidación ya está cerrada';
  end if;

  update public.liquidaciones
     set estado = 'cerrada', cerrada_por = p_cerrada_por
   where id = p_liquidacion_id;

  v_estado_contrato := case when v_liq.motivo = 'incumplimiento' then 'Cancelado' else 'Finalizado' end;
  update public.contratos set estado = v_estado_contrato where id = v_liq.contrato_id;

  -- Saldar: las deudas y el convenio ya se cruzaron contra su ahorro al calcular el saldo.
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

  -- Si el ahorro no alcanzó, el faltante queda como UNA deuda viva.
  v_faltante := -1 * coalesce(v_liq.saldo_final, 0);
  if v_faltante > 0 then
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por)
    values (
      v_liq.contrato_id, 'otro',
      'Saldo pendiente de la liquidación ' || v_liq.numero,
      v_faltante, v_faltante, 'pendiente', p_cerrada_por
    );
  end if;

  -- La moto: en 'cumplimiento' pasa a ser del cliente; si no, vuelve a la flota salvo que ya esté
  -- comprometida con otro contrato (el papeleo va detrás de la calle — caso RLT70H del 27-jul).
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

  -- El cliente. No se toca si tiene otro contrato vivo (graduación Diario → tiempo definido).
  select exists (
    select 1 from public.contratos
     where cliente_id = v_liq.cliente_id
       and estado in ('Activo', 'En proceso')
       and id <> v_liq.contrato_id
  ) into v_otro_activo;

  if not v_otro_activo then
    v_estado_cliente := case
      when v_liq.motivo = 'cumplimiento' then 'Egresado'
      -- ⬇️ LO NUEVO: si sigue con la empresa queda listo para su moto nueva.
      when p_sigue_con_empresa then 'Aprobado'
      else 'Retirado'
    end;
    update public.clientes set estado = v_estado_cliente where id = v_liq.cliente_id;
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
    'lista_negra', coalesce(v_liq.saldo_final, 0) < 0
  );
end;
$$;

revoke all on function public.cerrar_liquidacion(uuid, uuid, boolean) from public;
grant execute on function public.cerrar_liquidacion(uuid, uuid, boolean) to authenticated;
