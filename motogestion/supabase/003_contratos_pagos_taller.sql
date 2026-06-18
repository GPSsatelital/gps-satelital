-- ========= CONTRATOS =========
create table if not exists public.contratos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  moto_id uuid references public.motos(id),
  dia_pago text not null default 'Lunes',
  valor_semanal numeric not null,
  meses int not null,
  ahorro_inicial numeric not null default 0,
  fecha_entrega date,
  firma_cliente boolean not null default false,
  firma_responsable boolean not null default false,
  estado text not null default 'En proceso' check (estado in ('En proceso', 'Activo', 'Finalizado', 'Cancelado')),
  created_at timestamptz not null default now()
);

alter table public.contratos enable row level security;
create policy "Autenticados leen contratos" on public.contratos for select to authenticated using (true);
create policy "Autenticados insertan contratos" on public.contratos for insert to authenticated with check (true);
create policy "Autenticados actualizan contratos" on public.contratos for update to authenticated using (true);
alter publication supabase_realtime add table public.contratos;

-- ========= PAGOS =========
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id),
  valor numeric not null,
  metodo text not null check (metodo in ('Efectivo', 'Transferencia')),
  estado text not null default 'Pendiente' check (estado in ('Confirmado', 'Pendiente', 'Rechazado')),
  aplicado jsonb not null default '{}'::jsonb,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.pagos enable row level security;
create policy "Autenticados leen pagos" on public.pagos for select to authenticated using (true);
create policy "Autenticados insertan pagos" on public.pagos for insert to authenticated with check (true);
create policy "Autenticados actualizan pagos" on public.pagos for update to authenticated using (true);
alter publication supabase_realtime add table public.pagos;

-- ========= TALLER =========
create table if not exists public.taller (
  id uuid primary key default gen_random_uuid(),
  moto_id uuid not null references public.motos(id),
  estado_tecnico text not null default 'Pendiente',
  detalle text not null,
  costo numeric not null default 0,
  repuestos text,
  fecha_ingreso date not null default current_date,
  fecha_salida date,
  created_at timestamptz not null default now()
);

alter table public.taller enable row level security;
create policy "Autenticados leen taller" on public.taller for select to authenticated using (true);
create policy "Autenticados insertan taller" on public.taller for insert to authenticated with check (true);
create policy "Autenticados actualizan taller" on public.taller for update to authenticated using (true);
alter publication supabase_realtime add table public.taller;
