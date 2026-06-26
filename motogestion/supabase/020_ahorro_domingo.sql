-- Agregar columna ahorro_domingo a contratos
alter table public.contratos
  add column if not exists ahorro_domingo numeric default 0;
