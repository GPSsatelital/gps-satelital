-- ===== 061: fecha de compromiso de pago (promesa de pago) =====
-- Cuando el cliente dice "te pago el viernes", se captura la fecha en la gestión. Antes solo
-- quedaba como texto en el resultado y dependía 100% de la memoria del funcionario; ahora el
-- sistema puede avisar (alerta) y hacer que reaparezca cuando la promesa vence sin pago.
alter table public.gestiones_cobro
  add column if not exists fecha_compromiso date;
