-- ===== 079: saldo_favor_apertura — el saldo a favor que el cliente YA TRAÍA =====
--
-- EL HUECO: el arqueo de migración capturó lo que cada cliente traía de ANTES del corte en dos
-- cifras — su deuda (deudas de apertura) y su ahorro (`ahorro_apertura`, mig 043). Pero a los
-- que traían SALDO A FAVOR no había dónde ponérselo. Esa plata quedaba fuera del sistema.
--
-- LO QUE PASÓ POR NO TENERLO (caso real de COSTA, corte 27-jul): al habilitarse el registro de
-- pagos con fecha de días anteriores, la secretaria cargó los que le faltaban — y eran de ANTES
-- del corte, o sea plata que el arqueo ya había contado. El motor no tenía caja donde aplicarlos
-- (las cajas del contrato arrancan el día del corte) y los mandó enteros a saldo a favor, que es
-- justo lo que este campo debió recibir desde el principio.
--
-- CÓMO FUNCIONA: mismo patrón que `ahorro_apertura`. Se edita mientras el empalme está ABIERTO
-- y suma al saldo a favor del contrato:
--     saldo a favor = saldo_favor_apertura + Σ(pagos.aplicado_saldo_favor)
-- Cuando el cliente lo usa, el movimiento interno de "Aplicar" registra un aplicado_saldo_favor
-- NEGATIVO, así que el total baja solo — no hay que tocar nada más.

alter table public.contratos
  add column if not exists saldo_favor_apertura numeric not null default 0;

comment on column public.contratos.saldo_favor_apertura is
  'Saldo a favor que el cliente ya traía de las cuentas viejas al migrar. Editable mientras el empalme esté abierto. Suma al saldo a favor del contrato junto con los pagos.';

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPROBAR (nace en 0 → no cambia nada para nadie hasta que se cargue algo):
--   select count(*) as contratos, sum(saldo_favor_apertura) as saldo_apertura_total
--     from public.contratos;                      -- saldo_apertura_total debe dar 0
-- ─────────────────────────────────────────────────────────────────────────────
