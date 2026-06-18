-- ========= CLIENTES =========
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cedula text not null,
  direccion text not null,
  fuente_llegada text,
  telefono text not null,
  mismo_whatsapp boolean not null default true,
  whatsapp text,
  acompanante_nombre text,
  acompanante_cedula text,
  acompanante_telefono text,
  documentos_cliente jsonb not null default '{}'::jsonb,
  documentos_acompanante jsonb not null default '{}'::jsonb,
  estado text not null default 'En proceso',
  excepcion_documental boolean not null default false,
  excepcion_motivo text,
  excepcion_plazo date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clientes enable row level security;

create policy "Autenticados leen clientes" on public.clientes for select to authenticated using (true);
create policy "Autenticados insertan clientes" on public.clientes for insert to authenticated with check (true);
create policy "Autenticados actualizan clientes" on public.clientes for update to authenticated using (true);

drop trigger if exists trg_clientes_updated_at on public.clientes;
create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter publication supabase_realtime add table public.clientes;

-- ========= VISITAS =========
create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  estado text not null default 'Realizada',
  resultado text,
  entrevista jsonb not null default '{}'::jsonb,
  fotos jsonb not null default '{}'::jsonb,
  ubicacion jsonb,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.visitas enable row level security;

create policy "Autenticados leen visitas" on public.visitas for select to authenticated using (true);
create policy "Autenticados insertan visitas" on public.visitas for insert to authenticated with check (true);
create policy "Autenticados actualizan visitas" on public.visitas for update to authenticated using (true);

alter publication supabase_realtime add table public.visitas;
