-- Migración 111: el cierre de liquidación ya no choca con el guardián de clientes
--
-- LO QUE PASÓ (22-ago, reportado por el dueño): ANGELA (SECRETARIA) intentó cerrar una
-- liquidación —ya con su acceso de la mig 110— y la base la rebotó: "Solo un ADMIN puede
-- cambiar el cliente a este estado".
--
-- CAUSA: el cierre cambia `clientes.estado` (Retirado / Aprobado / Egresado), y el guardián
-- `enforce_cliente_estado_change()` (mig 019) solo deja hacer eso a ADMIN/ADMIN_PRINCIPAL.
-- Es la lección repetida del proyecto (migs 031 y 042): al ampliar permisos de un rol hay que
-- revisar TODOS los triggers que comparan contra los roles viejos.
--
-- EL ARREGLO — quirúrgico a propósito:
--   NO se agrega SECRETARIA al guardián. Eso le abriría cambiar el estado de CUALQUIER cliente
--   a mano (Activo, Lista negra...), que es justo lo que el guardián existe para impedir.
--   En cambio, `cerrar_liquidacion()` marca su propia transacción con una señal local, y el
--   guardián deja pasar SOLO lo que venga de ahí. La función ya validó el rol al entrar
--   (mig 110: ADMIN / ADMIN_PRINCIPAL / SECRETARIA), así que nada queda sin candado.
--   Mismo patrón que la mig 042 (la visita mueve al cliente con un trigger security definer):
--   la OPERACIÓN legítima pasa completa, el permiso suelto sigue cerrado.

-- ── 1) El guardián reconoce la señal del cierre ─────────────────────────────
create or replace function public.enforce_cliente_estado_change()
returns trigger language plpgsql security definer as $$
declare
  estados_libres text[] := array['En proceso', 'Listo para visita', 'Pendiente evaluación'];
  rol_actual text;
begin
  -- Señal transaccional puesta por cerrar_liquidacion() (mig 111). Esa función ya validó el rol
  -- de quien cierra; este guardián protege los cambios SUELTOS, no la operación completa.
  if coalesce(current_setting('app.cierre_liquidacion', true), '') = '1' then
    return new;
  end if;

  rol_actual := public.mi_rol();

  if new.estado is distinct from old.estado
     and not (new.estado = any(estados_libres))
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede cambiar el cliente a este estado';
  end if;

  if (new.excepcion_documental is distinct from old.excepcion_documental
      or new.excepcion_motivo is distinct from old.excepcion_motivo
      or new.excepcion_plazo is distinct from old.excepcion_plazo)
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede aplicar excepciones documentales';
  end if;

  return new;
end;
$$;

-- ── 2) El cierre enciende la señal (función de la mig 110 + UNA línea) ──────
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
  if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA') then
    raise exception 'Solo ADMIN, ADMIN_PRINCIPAL o SECRETARIA pueden cerrar una liquidación';
  end if;

  -- ⬇️ LO NUEVO (mig 111): señal SOLO de esta transacción (el tercer parámetro true la borra al
  -- terminar). El guardián de clientes la reconoce y deja pasar el cambio de estado del cierre.
  perform set_config('app.cierre_liquidacion', '1', true);

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
