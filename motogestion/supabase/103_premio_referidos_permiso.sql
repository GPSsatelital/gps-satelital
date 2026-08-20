-- Migración 103: entregar un premio de referidos pasa a ser una ACCIÓN con permiso por persona
--
-- En la mig 102 dejé el candado clavado por rol (ADMIN + ADMIN_PRINCIPAL). Dos problemas:
--   1. ANGELA (SECRETARIA) no veía el botón — siendo la única que registra efectivo y la que
--      maneja la plata de la oficina, o sea justo quien entrega el premio en la práctica.
--   2. Al estar clavado en el código, el dueño no podía dárselo desde Usuarios: había que tocar
--      el sistema. La app ya tiene permisos por persona (mig 048) y ese es el camino correcto.
--
-- Decisión del dueño (19-ago): por defecto SECRETARIA + ADMIN + ADMIN_PRINCIPAL, editable por
-- persona. Mismo criterio que `devolver_base`, que también es plata que sale.
--
-- ⚠️ La lista de defaults por rol está DUPLICADA: una en src/lib/acciones.ts y otra acá en
-- _acciones_default(). Si se agrega una acción con candado en la BD y solo se toca el código, la
-- pantalla muestra el botón y la base lo rechaza — peor que no mostrarlo. Por eso esta migración
-- toca las dos. Se agrega ÚNICAMENTE 'entregar_premio'; el resto de la lista queda exactamente
-- igual para no cambiar de paso ningún permiso que hoy funcione.

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
      'entregar_premio']
    when 'SUBADMIN' then array['recolectar_moto','iniciar_liquidacion']
    else array[]::text[]
  end;
$$;

drop policy if exists "premios_referidos_insert" on public.premios_referidos;

create policy "premios_referidos_insert" on public.premios_referidos
  for insert to authenticated
  with check (public.puede_accion('entregar_premio'));
