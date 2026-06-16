-- Tabla de motos
create table if not exists public.motos (
  id uuid primary key default gen_random_uuid(),
  placa text not null unique,
  grupo text not null check (grupo in ('CLUB', 'PRADERA', 'COSTA')),
  marca text not null,
  modelo text not null,
  numero_motor text,
  numero_chasis text,
  lugar_matricula text,
  cilindraje text,
  fecha_seguro date,
  fecha_tecnomecanica date,
  propietario text,
  numero_serie text,
  estado text not null default 'Disponible' check (
    estado in ('Disponible', 'Reservada', 'Asignada', 'Mantenimiento', 'Recuperada')
  ),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activar seguridad por fila (obligatorio en Supabase)
alter table public.motos enable row level security;

-- Por ahora: cualquier usuario autenticado puede leer y escribir.
-- Más adelante afinamos esto por rol (ADMIN vs SECRETARIA).
create policy "Usuarios autenticados pueden leer motos"
  on public.motos for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden insertar motos"
  on public.motos for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden actualizar motos"
  on public.motos for update
  to authenticated
  using (true);

-- Mantener updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_motos_updated_at on public.motos;
create trigger trg_motos_updated_at
  before update on public.motos
  for each row execute function public.set_updated_at();

-- Habilitar Realtime para esta tabla
alter publication supabase_realtime add table public.motos;
