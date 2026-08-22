-- Migración 110: ANGELA (SECRETARIA) hace liquidaciones completas — y el cierre queda con candado
--
-- Decisión del dueño (22-ago): la SECRETARIA lleva el flujo COMPLETO de una liquidación, cierre
-- incluido. Ella es quien maneja la plata de la oficina, el lector de huella está en su PC, y sin
-- ella el cliente ya firmado quedaba esperando a que un admin diera el clic del cierre.
--
-- La RLS de liquidaciones YA la dejaba (mig 026: staff de oficina). Lo que la frenaba era la
-- pantalla y el permiso de la acción. Esta migración hace dos cosas:
--
-- 1. `iniciar_liquidacion` entra a los defaults de SECRETARIA en `_acciones_default()`.
--    ⚠️ Esta lista está DUPLICADA a propósito con src/lib/acciones.ts — si se toca una hay que
--    tocar la otra, o la pantalla muestra un botón que la base rechaza. El código ya se tocó en
--    el mismo commit. Se agrega ÚNICAMENTE eso; el resto queda idéntico (base mig 103).
--
-- 2. `cerrar_liquidacion()` queda con CANDADO de rol. Estaba `security definer` + grant a todo
--    autenticado y SIN verificar rol adentro: cualquier sesión (un SUBADMIN, un MECANICO) podía
--    llamarla directo por la API y cerrar una liquidación — el paso que finaliza contratos,
--    salda deudas, mueve motos y marca lista negra. Ahora exige staff de oficina, la misma
--    matriz de la RLS. Es el mismo patrón de las dos capas: la pantalla filtra, la base manda.

-- ── 1) La acción por defecto ────────────────────────────────────────────────
create or replace function public._acciones_default(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'ADMIN_PRINCIPAL' then array[
      'registrar_efectivo','confirmar_transferencia','eliminar_pago','cerrar_caja','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion',
      'ceder_contrato','entregar_premio']
    when 'ADMIN' then array[
      'registrar_efectivo','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion',
      'ceder_contrato','entregar_premio']
    when 'SECRETARIA' then array[
      'registrar_efectivo','confirmar_transferencia','cerrar_caja','aplicar_saldo_favor','crear_convenio',
      'entregar_premio','iniciar_liquidacion']
    when 'SUBADMIN' then array['recolectar_moto','iniciar_liquidacion']
    else array[]::text[]
  end;
$$;

-- ── 2) El candado del cierre ────────────────────────────────────────────────
-- Misma función de la mig 106, con UNA sola adición: la verificación de rol al inicio.
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
  -- ⬇️ LO NUEVO (mig 110): cerrar es el paso que finaliza el contrato, salda deudas, mueve la
  -- moto y puede marcar lista negra. Solo el staff de oficina — la misma matriz de la RLS.
  if public.mi_rol() not in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA') then
    raise exception 'Solo ADMIN, ADMIN_PRINCIPAL o SECRETARIA pueden cerrar una liquidación';
  end if;

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
