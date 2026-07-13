-- ===== 048: Permisos detallados por ACCIÓN (Opción A) =====
-- Agrega la columna profiles.acciones (overrides por persona) + la función puede_accion()
-- que replica EXACTO la lógica del frontend (src/lib/acciones.ts calcularPuede) para que
-- la base de datos sea la fuente de verdad real, no solo la pantalla.
--
-- Refuerzo en BD (esta migración): SOLO eliminar_pago (DELETE de pagos) — es la acción
-- peligrosa y de baja frecuencia; un trigger aditivo no toca el flujo diario de registrar/
-- confirmar. registrar_efectivo y confirmar_transferencia quedan reforzados en el FRONTEND
-- (ya conectados con puede()); su refuerzo en BD es un pase aparte y PROBADO, porque el
-- INSERT de efectivo lo usan también el cobro en campo (subadmin) y los pagos internos.

-- 1) Columna de overrides por persona: { "eliminar_pago": "bloquear", "registrar_efectivo": "permitir", ... }
alter table public.profiles
  add column if not exists acciones jsonb not null default '{}'::jsonb;

-- 2) Defaults por rol — MISMO mapa que DEFAULT_ACCIONES en src/lib/acciones.ts (Opción 1:
--    calzan con el comportamiento actual del código). Si cambia allá, cambiar aquí también.
create or replace function public._acciones_default(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'ADMIN_PRINCIPAL' then array[
      'registrar_efectivo','confirmar_transferencia','eliminar_pago','cerrar_caja','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion']
    when 'ADMIN' then array[
      'registrar_efectivo','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion']
    when 'SECRETARIA' then array[
      'registrar_efectivo','confirmar_transferencia','cerrar_caja','aplicar_saldo_favor','crear_convenio']
    when 'SUBADMIN' then array['recolectar_moto','iniciar_liquidacion']
    else array[]::text[]
  end;
$$;

-- 3) ¿El usuario ACTUAL puede esta acción? (rol=techo + override por persona + AP bypass)
create or replace function public.puede_accion(p_accion text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare v_role text; v_acc jsonb; v_ov text;
begin
  select role, coalesce(acciones, '{}'::jsonb) into v_role, v_acc
    from public.profiles where id = auth.uid();
  if v_role is null then return false; end if;
  if v_role = 'ADMIN_PRINCIPAL' then return true; end if;
  v_ov := v_acc ->> p_accion;
  if v_ov = 'permitir' then return true; end if;
  if v_ov = 'bloquear' then return false; end if;
  return p_accion = any(public._acciones_default(v_role));
end; $$;

-- 4) Refuerzo real de eliminar_pago: la BD rechaza el DELETE si no tiene el permiso,
--    sin importar lo que muestre la pantalla (trigger aditivo, no toca las políticas RLS).
create or replace function public.enforce_eliminar_pago()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.puede_accion('eliminar_pago') then
    raise exception 'No tiene permiso para eliminar/anular pagos.';
  end if;
  return old;
end; $$;

drop trigger if exists trg_enforce_eliminar_pago on public.pagos;
create trigger trg_enforce_eliminar_pago
  before delete on public.pagos
  for each row execute function public.enforce_eliminar_pago();
