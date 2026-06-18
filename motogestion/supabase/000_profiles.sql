-- ========= PERFILES Y ROLES =========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  role text not null default 'SECRETARIA' check (role in ('ADMIN', 'SECRETARIA')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuarios actualizan su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Crear perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'SECRETARIA')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Función auxiliar para usar en políticas: rol del usuario actual
create or replace function public.current_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;
