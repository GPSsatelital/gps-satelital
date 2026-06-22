-- =========================================================
-- MIGRACIÓN 010 — v2.0 Lógica completa del negocio
-- Ejecutar en Supabase SQL Editor
-- =========================================================

-- 1. ACTUALIZAR ROL EN PROFILES (agregar SOCIO y SUBADMIN)
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('ADMIN_PRINCIPAL','ADMIN','SUBADMIN','SECRETARIA','MECANICO','SOCIO'));

-- Campo grupo para socios (indica qué portafolio pueden ver)
alter table public.profiles
  add column if not exists grupo text check (grupo in ('COSTA','PRADERA','RASTREADOR'));

-- 2. ACTUALIZAR TABLA CLIENTES
alter table public.clientes
  add column if not exists lista_negra boolean not null default false,
  add column if not exists motivo_lista_negra text,
  add column if not exists lista_negra_reversible boolean not null default true,
  add column if not exists ruta_contrato text not null default 'diario'
    check (ruta_contrato in ('diario','tiempo_definido')),
  add column if not exists referido_por_cedula text,
  add column if not exists referido_por_nombre text,
  add column if not exists referidos_confirmados int not null default 0,
  add column if not exists premio_referidos_entregado int not null default 0;

-- Estados adicionales de cliente
-- (el check ya existe en algunos sistemas, lo recreamos completo)
alter table public.clientes
  drop constraint if exists clientes_estado_check;

alter table public.clientes
  add constraint clientes_estado_check
  check (estado in (
    'En proceso',
    'Listo para visita',
    'Pendiente evaluación',
    'Aprobado',
    'Activo',
    'En seguimiento',
    'En riesgo',
    'En mora',
    'Rechazado',
    'Retirado',
    'Lista negra',
    'Inmovilización documentación incompleta'
  ));

-- 3. ACTUALIZAR TABLA VISITAS (formulario completo)
alter table public.visitas
  add column if not exists realizada_por uuid references public.profiles(id);

-- El campo entrevista jsonb ya existe, solo documentamos la estructura esperada:
-- {
--   "viveAlli": boolean,
--   "tiempoResidencia": string,
--   "tipoVivienda": "Propia"|"Familiar"|"Alquilada",
--   "composicionFamiliar": string,
--   "estabilidadLaboral": string,
--   "dudasCliente": string,
--   "observaciones": string,
--   "recomendacion": "Aprobado"|"Rechazado"|"Pendiente"
-- }

-- 4. ACTUALIZAR TABLA CONTRATOS
alter table public.contratos
  drop constraint if exists contratos_estado_check;

alter table public.contratos
  add constraint contratos_estado_check
  check (estado in ('En proceso','Activo','Finalizado','Cancelado','Suspendido'));

alter table public.contratos
  add column if not exists tipo_ruta text not null default 'diario'
    check (tipo_ruta in ('diario','semanal','quincenal','mensual')),
  add column if not exists tarifa_diaria numeric not null default 27000,
  add column if not exists tarifa_domingo numeric not null default 14000,
  add column if not exists ahorro_diario numeric not null default 0,
  add column if not exists ahorro_acumulado numeric not null default 0,
  add column if not exists base_completada boolean not null default false,
  add column if not exists huella_cliente_url text,
  add column if not exists huella_acompanante_url text,
  add column if not exists contrato_pdf_url text,
  add column if not exists certificado_pdf_url text,
  add column if not exists pagare_pdf_url text,
  add column if not exists kilometraje_entrega numeric,
  add column if not exists fotos_entrega jsonb not null default '[]'::jsonb;

-- Renombrar valor_semanal a valor_periodo si no se ha hecho
-- (valor_semanal puede quedar como alias)
alter table public.contratos
  add column if not exists valor_periodo numeric;

update public.contratos
  set valor_periodo = valor_semanal
  where valor_periodo is null and valor_semanal is not null;

-- 5. ACTUALIZAR TABLA PAGOS
alter table public.pagos
  add column if not exists registrado_por uuid references public.profiles(id),
  add column if not exists tipo_registro text not null default 'normal'
    check (tipo_registro in ('normal','campo','transferencia')),
  add column if not exists comprobante_url text,
  add column if not exists confirmado_por uuid references public.profiles(id),
  add column if not exists confirmado_at timestamptz;

-- 6. TABLA REFERIDOS (seguimiento del sistema de referidos)
create table if not exists public.referidos (
  id uuid primary key default gen_random_uuid(),
  cliente_referidor_id uuid not null references public.clientes(id),
  cliente_referido_id uuid not null references public.clientes(id),
  estado text not null default 'pendiente'
    check (estado in ('pendiente','confirmado')),
  confirmado_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.referidos enable row level security;
create policy "Autenticados leen referidos" on public.referidos for select to authenticated using (true);
create policy "Autenticados insertan referidos" on public.referidos for insert to authenticated with check (true);
create policy "Autenticados actualizan referidos" on public.referidos for update to authenticated using (true);

-- 7. TABLA CAJA DIARIA
create table if not exists public.caja_diaria (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  total_efectivo numeric not null default 0,
  total_transferencias numeric not null default 0,
  total_confirmado numeric not null default 0,
  detalle jsonb not null default '[]'::jsonb,
  cerrada_por uuid references public.profiles(id),
  observaciones text,
  created_at timestamptz not null default now()
);

alter table public.caja_diaria enable row level security;
create policy "Autenticados leen caja" on public.caja_diaria for select to authenticated using (true);
create policy "Autenticados insertan caja" on public.caja_diaria for insert to authenticated with check (true);
create policy "Autenticados actualizan caja" on public.caja_diaria for update to authenticated using (true);

-- 8. TABLA GESTIONES DE COBRO (protocolo mora)
create table if not exists public.gestiones_cobro (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id),
  tipo text not null check (tipo in (
    'mensaje_recordatorio',
    'llamada',
    'whatsapp',
    'sirena',
    'visita',
    'plazo_extra',
    'recoleccion',
    'cobro_campo',
    'otro'
  )),
  resultado text,
  plazo_extra_dias int,
  plazo_extra_motivo text,
  plazo_extra_fecha_limite date,
  registrado_por uuid references public.profiles(id),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.gestiones_cobro enable row level security;
create policy "Autenticados leen gestiones" on public.gestiones_cobro for select to authenticated using (true);
create policy "Autenticados insertan gestiones" on public.gestiones_cobro for insert to authenticated with check (true);
create policy "Autenticados actualizan gestiones" on public.gestiones_cobro for update to authenticated using (true);

-- Agregar a realtime
alter publication supabase_realtime add table public.referidos;
alter publication supabase_realtime add table public.caja_diaria;
alter publication supabase_realtime add table public.gestiones_cobro;
