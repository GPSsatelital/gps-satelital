-- ========= EL EFECTIVO CONFIRMADO EXIGE EL PERMISO, TAMBIÉN EN LA BD =========
-- Hueco encontrado probando con el login real del SUBADMIN (25-jul, víspera del go-live):
-- el trigger de la mig 057 protege el UPDATE de estado (confirmar/rechazar), pero el
-- registro de efectivo entra como INSERT ya 'Confirmado' — y ese camino estaba abierto:
-- un SUBADMIN pudo insertar un pago Efectivo/Confirmado directo contra la BD.
--
-- Este trigger es el espejo del de 057 para el INSERT: pago Efectivo que nace Confirmado
-- exige puede_accion('registrar_efectivo').
--
-- NO estorba a los flujos legítimos (verificado contra el código antes de escribirlo):
--   · Wizard (adelanto_base, Efectivo/Confirmado) → lo insertan SECRETARIA/ADMIN/AP,
--     todos con registrar_efectivo en _acciones_default (048).
--   · Cobro en campo del SUBADMIN → entra 'Pendiente', el trigger no aplica.
--   · Transferencias → metodo <> 'Efectivo', no aplica.
--   · auth.uid() null (SQL Editor / mantenimiento) → pasa, igual que en 057.

create or replace function public.enforce_registrar_efectivo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.metodo = 'Efectivo' and new.estado = 'Confirmado'
     and not public.puede_accion('registrar_efectivo') then
    raise exception 'No tienes permiso para registrar pagos en efectivo';
  end if;
  return new;
end; $$;

drop trigger if exists trg_enforce_registrar_efectivo on public.pagos;
create trigger trg_enforce_registrar_efectivo
  before insert on public.pagos
  for each row execute function public.enforce_registrar_efectivo();
