-- ===== 092: tercer tipo de movimiento de la base — RETENCIÓN =====
--
-- CORRECCIÓN DEL DUEÑO (6-ago-2026, el mismo día): primero dijo que al retirarse se le devolvía
-- TODO al cliente, y al rato lo corrigió: "sí se le descuentan, y son lo que se le paga al
-- visitador que le hizo la visita — en este caso son 40.000".
--
-- Reglas que confirmó:
--   · $40.000 FIJOS, una sola vez, aunque se le hayan hecho varias visitas
--   · si el cliente se retira ANTES de que le hicieran la visita, se le devuelve TODO
--     (el descuento existe porque se le pagó a alguien; si nadie fue, no hay qué descontar)
--
-- POR QUÉ UN TIPO NUEVO Y NO RESTARLO DEL MONTO: son dos hechos distintos y la caja los ve
-- distinto. De la base de $510.000 salen $470.000 a la mano del cliente (eso SÍ es plata que sale
-- de la caja) y $40.000 se quedan en la empresa (eso NO sale: cambia de bolsillo). Si se guardara
-- una sola devolución de $470.000, el saldo del cliente quedaría en $40.000 y parecería que
-- todavía tiene plata adentro, cuando no tiene nada.
--
--   abono      (+)  el cliente entrega
--   devolucion (−)  sale de la caja a manos del cliente
--   retencion  (−)  se queda la empresa (aquí: el pago del visitador)
--
-- Aditiva: no toca ninguna fila existente. Los movimientos ya registrados siguen igual.

alter table public.abonos_base drop constraint if exists abonos_base_tipo_check;
alter table public.abonos_base add constraint abonos_base_tipo_check
  check (tipo in ('abono','devolucion','retencion'));

comment on column public.abonos_base.tipo is
  'abono = el cliente entrega · devolucion = sale de la caja a sus manos · '
  'retencion = se queda la empresa (p. ej. el pago del visitador que le hizo la visita).';
