-- ===== 064: detalles, evidencia y fecha de devolución en préstamos de tarjeta/llave =====
-- Al prestar se pide: detalles, foto de evidencia, y el día en que se debe devolver, para
-- que el sistema alerte al funcionario si el cliente no la trae a tiempo y pueda pedirla.
alter table public.prestamos_llave_tarjeta
  add column if not exists detalles text,
  add column if not exists foto_url text,
  add column if not exists fecha_devolucion_esperada date;
