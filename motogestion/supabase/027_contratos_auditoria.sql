-- Migración 027: Auditoría de ediciones manuales de contrato
-- Registra quién cambió qué campo, cuándo, y de qué valor a qué valor.
-- Se llena automáticamente desde la pantalla "Editar contrato" (ContratosView).

create table if not exists public.contratos_auditoria (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id),
  campo text not null,
  valor_anterior text,
  valor_nuevo text,
  editado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.contratos_auditoria enable row level security;

create policy "Admin lee auditoria contratos" on public.contratos_auditoria
  for select to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

create policy "Admin inserta auditoria contratos" on public.contratos_auditoria
  for insert to authenticated
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

alter publication supabase_realtime add table public.contratos_auditoria;
