-- ===== 062: préstamo de tarjetas de propiedad y copias de llaves =====
-- Control de dónde están las tarjetas y llaves físicas de cada moto:
--  · Llaves: se le prestan al CLIENTE cuando pierde la suya y va a sacar copia; no se le
--    pueden dejar → debe devolverla para tenerla en la empresa (control).
--  · Tarjetas: cuando toca hacer trámites legales; apenas terminan, se devuelve a la empresa.
-- Cada préstamo se abre (estado='prestado') y se cierra al devolver (estado='devuelto').

create table if not exists public.prestamos_llave_tarjeta (
  id uuid primary key default gen_random_uuid(),
  moto_id uuid not null references public.motos(id) on delete cascade,
  tipo text not null check (tipo in ('tarjeta', 'llave')),
  prestado_a text not null,                      -- a quién (texto libre; suele ser el cliente)
  motivo text,                                   -- copia de llave / trámite legal / otro
  estado text not null default 'prestado' check (estado in ('prestado', 'devuelto')),
  fecha_prestamo date not null default current_date,
  fecha_devolucion date,
  registrado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_prestamos_doc_moto   on public.prestamos_llave_tarjeta(moto_id);
create index if not exists idx_prestamos_doc_estado on public.prestamos_llave_tarjeta(estado);

alter table public.prestamos_llave_tarjeta enable row level security;

-- Staff operativo gestiona (el SUBADMIN se filtra por sus motos en el frontend, mismo
-- criterio que prestamos_reemplazo / recepciones).
drop policy if exists "prestamos_doc_staff_all" on public.prestamos_llave_tarjeta;
create policy "prestamos_doc_staff_all"
  on public.prestamos_llave_tarjeta for all
  to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'SUBADMIN'))
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'SUBADMIN'));

alter publication supabase_realtime add table public.prestamos_llave_tarjeta;
