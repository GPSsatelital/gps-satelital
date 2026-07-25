-- ===== 064: fecha real del pago + referencia bancaria + dinero sin dueño =====
--
-- PROBLEMA 1 — el pago se hace un día y se digita otro: la app guardaba siempre la fecha
-- de hoy, así que el recibo y el historial mostraban una fecha falsa y el cliente aparecía
-- en mora habiendo pagado. A partir de aquí:
--     pagos.fecha           = CUÁNDO PAGÓ EL CLIENTE (la real; manda para mora e historial)
--     pagos.fecha_registro  = CUÁNDO SE DIGITÓ       (manda para la caja del día)
-- Así, un pago del domingo digitado el lunes corrige la cuenta del cliente SIN descuadrar
-- el arqueo de hoy ni ningún cierre anterior.
-- OJO: el motor de cajas reparte por created_at, no por fecha → esto NO altera el reparto.
--
-- PROBLEMA 2 — dinero sin dueño: a veces entra plata al banco que nadie reportó. Ahora se
-- guarda el número de referencia de cada transferencia y existe una "bolsa" de partidas sin
-- identificar, para cruzarlas cuando el cliente aparezca.

-- ── 1) Pagos: fecha de registro + referencia ─────────────────────────────────
alter table public.pagos
  add column if not exists fecha_registro date,
  add column if not exists referencia text;

-- Backfill: en el histórico ambas fechas son la misma (nunca se pudo poner otra).
update public.pagos set fecha_registro = fecha where fecha_registro is null;

alter table public.pagos
  alter column fecha_registro set default current_date;

create index if not exists idx_pagos_fecha_registro on public.pagos(fecha_registro);
create index if not exists idx_pagos_referencia on public.pagos(referencia) where referencia is not null;

-- ── 2) Bolsa de dinero sin dueño (partidas no identificadas) ─────────────────
-- Se alimenta desde el cierre de caja (cuando el banco reporta más de lo registrado) o
-- en cualquier momento que la secretaria vea en el banco una transferencia sin reclamar.
create table if not exists public.ingresos_no_identificados (
  id uuid primary key default gen_random_uuid(),
  fecha_banco date not null,              -- cuándo entró la plata al banco (la fecha REAL)
  monto numeric not null,
  referencia text not null,               -- el número que permite cruzarlo después
  grupo text,                             -- portafolio, si se sabe
  estado text not null default 'pendiente' check (estado in ('pendiente', 'asignado')),
  pago_id uuid references public.pagos(id) on delete set null,  -- a qué pago se asignó
  registrado_por uuid references public.profiles(id),
  nota text,
  created_at timestamptz not null default now()
);

-- Una misma referencia no puede estar dos veces esperando dueño.
create unique index if not exists idx_ingresos_ref_pendiente
  on public.ingresos_no_identificados(referencia) where estado = 'pendiente';
create index if not exists idx_ingresos_estado on public.ingresos_no_identificados(estado);

alter table public.ingresos_no_identificados enable row level security;

drop policy if exists "ingresos_ni_staff_all" on public.ingresos_no_identificados;
create policy "ingresos_ni_staff_all"
  on public.ingresos_no_identificados for all
  to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA'));

alter publication supabase_realtime add table public.ingresos_no_identificados;

-- ── 3) Caja diaria: arqueo contra el banco y el efectivo contado ─────────────
-- (nombres alineados con la tabla VIVA: efectivo_total / transferencias_total / total /
--  cerrado_por / notas — la migración 010 quedó desactualizada respecto a producción)
alter table public.caja_diaria
  add column if not exists banco_reportado numeric,   -- lo que dice el banco que entró
  add column if not exists efectivo_contado numeric,  -- lo que se contó físicamente
  add column if not exists diferencia numeric;        -- (banco+efectivo) - registrado
