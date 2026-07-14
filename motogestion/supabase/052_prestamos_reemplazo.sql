-- ===== 052: préstamos de reemplazo (TEMA B) =====
-- Cuando a un cliente se le vara la moto (va a taller) y se le presta otra del pool para
-- que siga trabajando. Registra el préstamo para el swap-back, la trazabilidad y el alquiler.
-- El swap real (contrato.moto_id → placa prestada) lo hacen los hooks; esta tabla es el rastro.

create table if not exists public.prestamos_reemplazo (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  moto_prestada_id uuid not null references public.motos(id),
  moto_original_id uuid references public.motos(id),
  fecha_inicio date not null default current_date,
  fecha_fin date,
  tarifa_dia numeric not null default 27000,
  estado text not null default 'activo', -- 'activo' | 'cerrado'
  creado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_prestamos_contrato on public.prestamos_reemplazo(contrato_id);
create index if not exists idx_prestamos_estado on public.prestamos_reemplazo(estado);

alter table public.prestamos_reemplazo enable row level security;

-- Staff operativo lee y gestiona los préstamos (mismo criterio que recepciones/gestiones).
drop policy if exists "prestamos_staff_all" on public.prestamos_reemplazo;
create policy "prestamos_staff_all"
  on public.prestamos_reemplazo for all
  to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'SUBADMIN'))
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'SUBADMIN'));

-- Etiqueta de alquiler de reemplazo en pagos (Fase 3): el $27.000/día se registra como pago
-- con tipo_registro='alquiler_reemplazo' → entra a caja diaria como ingreso, pero el motor de
-- cajas lo IGNORA (no toca el ledger del contrato). El guard en el trigger va en la mig de Fase 3.
