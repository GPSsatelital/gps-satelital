-- Migración 105: cerrar una liquidación SALDA de verdad, y lo hace todo junto o no hace nada
--
-- DOS PROBLEMAS QUE RESUELVE:
--
-- 1. CERRAR NO SALDABA NADA. Se calculaba el saldo cruzando ahorro contra deudas y convenio, se
--    imprimía, el cliente firmaba... y en la base las deudas seguían en 'pendiente', el convenio
--    seguía 'activo' y el ahorro seguía figurando en el contrato. El cruce que se acababa de
--    hacer no quedaba escrito en ninguna parte. Al día siguiente el cliente aparecía debiendo lo
--    mismo que ya se le había descontado de su ahorro: cobrado dos veces.
--
-- 2. ERAN 4 ESCRITURAS SUELTAS desde el navegador (liquidación, contrato, moto, cliente) sin nada
--    que las mantuviera juntas. Si se caía el internet a la mitad quedaba la liquidación 'cerrada'
--    y el contrato 'Activo' — o sea, un cliente que ya entregó la moto siguiendo en el Panel Hoy
--    con su cuota por cobrar. Ahora es UNA función: o pasa todo, o no pasa nada.
--
-- REGLA DEL DUEÑO (19-ago) sobre lo que queda debiendo: «la deuda sigue viva y se le puede cobrar
-- o conveniar después». Por eso, si el ahorro no alcanzó, NO se borra la diferencia: se deja UNA
-- deuda nueva con el faltante, atada al contrato, para poder cobrársela si vuelve. Se consolida en
-- un solo renglón a propósito — las deudas viejas ya se cruzaron contra su ahorro, y dejarlas
-- también vivas sería cobrarlas dos veces.
--
-- Se conserva EXACTO todo lo que ya funcionaba: el destino de la moto según el motivo, la guarda
-- que impide soltarle la moto a alguien cuando ya está comprometida con otro contrato, el estado
-- del cliente y la lista negra.

create or replace function public.cerrar_liquidacion(p_liquidacion_id uuid, p_cerrada_por uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_liq            public.liquidaciones;
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

  -- 1. La liquidación queda cerrada.
  update public.liquidaciones
     set estado = 'cerrada', cerrada_por = p_cerrada_por
   where id = p_liquidacion_id;

  -- 2. El contrato, según el motivo: incumplimiento = fin anormal; el resto, fin ordenado.
  v_estado_contrato := case when v_liq.motivo = 'incumplimiento' then 'Cancelado' else 'Finalizado' end;
  update public.contratos set estado = v_estado_contrato where id = v_liq.contrato_id;

  -- 3. LO NUEVO — saldar. Las deudas y el convenio ya se cruzaron contra su ahorro al calcular el
  --    saldo, así que quedan saldados. Si no se hiciera, el cliente aparecería debiendo otra vez
  --    algo que ya se le descontó.
  update public.deudas
     set estado = 'pagada', monto_pendiente = 0
   where contrato_id = v_liq.contrato_id
     and estado in ('pendiente', 'en_convenio');

  update public.convenios
     set estado = 'cumplido', cuotas_pagadas = numero_cuotas
   where contrato_id = v_liq.contrato_id
     and estado in ('activo', 'incumplido');

  -- El ahorro se entregó (o se consumió cruzándolo contra lo que debía): ya no es del contrato.
  update public.contratos
     set ahorro_acumulado = 0, ahorro_apertura = 0
   where id = v_liq.contrato_id;

  -- 4. Si el ahorro NO alcanzó, el faltante queda como UNA deuda viva: es lo que se le puede
  --    cobrar o conveniar si vuelve (regla del dueño). Consolidada en un renglón — las viejas ya
  --    se cruzaron, dejarlas vivas también sería cobrar dos veces.
  v_faltante := -1 * coalesce(v_liq.saldo_final, 0);
  if v_faltante > 0 then
    insert into public.deudas (contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por)
    values (
      v_liq.contrato_id, 'otro',
      'Saldo pendiente de la liquidación ' || v_liq.numero,
      v_faltante, v_faltante, 'pendiente', p_cerrada_por
    );
  end if;

  -- 5. La moto. En 'cumplimiento' pasa a ser del cliente y eso manda siempre. En los demás casos
  --    vuelve a la flota SOLO si no está ya comprometida con otro contrato: el papeleo va detrás
  --    de la calle, y un cierre tardío pisando la reserva del contrato nuevo dejaba la moto suelta
  --    para que un tercero la tomara (caso real 27-jul: RLT70H).
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

  -- 6. El cliente. No se toca si tiene otro contrato vivo (ej. graduación Diario → tiempo definido).
  select exists (
    select 1 from public.contratos
     where cliente_id = v_liq.cliente_id
       and estado in ('Activo', 'En proceso')
       and id <> v_liq.contrato_id
  ) into v_otro_activo;

  if not v_otro_activo then
    v_estado_cliente := case when v_liq.motivo = 'cumplimiento' then 'Egresado' else 'Retirado' end;
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
    'deuda_creada', v_faltante > 0,
    'faltante', greatest(v_faltante, 0)
  );
end;
$$;

revoke all on function public.cerrar_liquidacion(uuid, uuid) from public;
grant execute on function public.cerrar_liquidacion(uuid, uuid) to authenticated;
