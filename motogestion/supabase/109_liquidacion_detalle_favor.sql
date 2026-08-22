-- 109 — El desglose de la plata que ES del cliente, guardado igual que el de las deudas.
--
-- Hasta ahora `ahorro_acumulado` de la liquidación era un solo número con TRES cosas adentro: la
-- base que entregó al entrar, el ahorro que traía del arqueo y el que ganó pagando. El documento
-- que el cliente firma mostraba ese bulto con la etiqueta "Ahorro acumulado" — que es falsa: la
-- base NO es ahorro. Es el mismo defecto que ya se corrigió del lado de las deudas (mig anterior,
-- los $108.000 sin explicar de ANTONIO), ahora del lado de lo que se le devuelve.
--
-- Con esta columna el total y su explicación salen del MISMO sitio y no se pueden contradecir.
-- Cada renglón trae su nombre: "Base inicial que entregó", "Menos la semana que esa base pagó",
-- "Ahorro que ganó pagando", "Saldo a favor", "Pagó adelantado y no alcanzó a usar".
--
-- Monto NEGATIVO = se le descuenta de su propia plata (la semana que la base pagó y que ya rodó).
--
-- Las liquidaciones viejas se quedan con el arreglo vacío: el documento sigue sabiendo dibujarlas
-- a la antigua, así que nada de lo ya firmado cambia.

alter table public.liquidaciones
  add column if not exists detalle_favor jsonb not null default '[]'::jsonb;

comment on column public.liquidaciones.detalle_favor is
  'Desglose de la plata del cliente, un renglón por concepto. Su suma es lo que se le devuelve antes de descuentos. Monto negativo = se le resta (la semana que su base pagó). Vacío = liquidación vieja, el documento la dibuja a la antigua.';
