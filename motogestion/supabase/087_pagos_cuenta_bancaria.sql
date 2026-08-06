-- ===== 087: a qué cuenta bancaria de la empresa entró cada transferencia =====
--
-- EL PROBLEMA (reportado por el dueño, 6-ago-2026): COSTA recibe en DOS cuentas —
-- Bancolombia y el Nequi de Yeiner— pero la caja del día muestra un solo total de
-- transferencias. La secretaria tiene dos extractos y una sola cifra: para cuadrar
-- suma los dos a mano, y si algo no calza no sabe en cuál cuenta buscar.
--
-- Hasta ahora `cuenta_id` solo existía en `ingresos_no_identificados` (mig 081): el
-- sistema sabía a qué cuenta cayó la plata SIN dueño, pero no la que sí lo tenía.
-- Peor: cuando una transferencia se cruzaba con una partida de la bolsa, la cuenta
-- estaba ahí por un instante y se perdía al registrar el pago.
--
-- QUÉ CAMBIA: cada pago puede decir a qué cuenta entró. Con eso el arqueo pasa a ser
-- POR CUENTA (cada extracto contra su propia cifra) en vez de por grupo.
--
-- Queda NULL en:
--   · el efectivo (no entra a ninguna cuenta, llega a la mano)
--   · todos los pagos anteriores a esta migración — no hay forma de adivinarla hacia
--     atrás, así que aparecerán como "sin especificar" hasta que se renueven solos.
--
-- Es aditiva: no toca ninguna fila existente, ningún cálculo, ningún trigger. Un pago
-- sin cuenta se sigue comportando exactamente igual que hoy.

alter table public.pagos
  add column if not exists cuenta_id uuid references public.cuentas_bancarias(id);

comment on column public.pagos.cuenta_id is
  'Cuenta de la empresa donde cayó esta transferencia (mig 087). NULL en efectivo, en '
  'movimientos internos y en los pagos anteriores a la columna. Puede apuntar a una cuenta '
  'de OTRO grupo: si el cliente se equivocó de cuenta, se registra la verdad y el arqueo '
  'de esa cuenta lo refleja.';

-- El arqueo agrupa por cuenta dentro de un día; el índice parcial deja fuera los millares
-- de pagos en efectivo, que nunca se consultan por esta columna.
create index if not exists idx_pagos_cuenta
  on public.pagos(cuenta_id)
  where cuenta_id is not null;
