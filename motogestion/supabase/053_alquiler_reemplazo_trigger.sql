-- ===== 053: alquiler de reemplazo — pago que NO toca el ledger (TEMA B F3) =====
-- El alquiler $27.000/día de una moto prestada se registra como pago con
-- tipo_registro='alquiler_reemplazo': cuenta en caja diaria como ingreso, pero NO debe
-- repartirse en las cajas/deudas del contrato (no es una cuota).
--
-- Enfoque SEGURO: NO se toca la función aplicar_pago_confirmado() (el motor de 250 líneas).
-- Solo se recrea el DISPARADOR con una condición WHEN que lo excluye para el alquiler.
-- Como el trigger cubre insert/update/delete y WHEN no puede referenciar NEW en DELETE ni
-- OLD en INSERT, se divide en dos disparadores (mismo comportamiento que el original).

drop trigger if exists trg_pago_confirmado on public.pagos;

-- Insert / update de estado: se salta el alquiler (NEW).
create trigger trg_pago_confirmado_iu
  after insert or update of estado on public.pagos
  for each row
  when (new.tipo_registro is distinct from 'alquiler_reemplazo')
  execute function public.aplicar_pago_confirmado();

-- Delete: se salta el alquiler (OLD).
create trigger trg_pago_confirmado_del
  after delete on public.pagos
  for each row
  when (old.tipo_registro is distinct from 'alquiler_reemplazo')
  execute function public.aplicar_pago_confirmado();

-- ⚠️ TRAS CORRER: probar que un pago NORMAL (efectivo) sigue registrándose y repartiéndose
-- bien (el trigger se recreó). El alquiler_reemplazo simplemente no dispara el motor.
