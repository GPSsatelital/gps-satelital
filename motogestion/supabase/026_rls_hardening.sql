-- ========================================================================
-- MIGRACIÓN 026 — Endurecimiento de RLS antes de cargar clientes reales
-- ========================================================================
-- Hasta ahora el filtrado por rol (SUBADMIN solo sus motos, SOCIO solo su
-- grupo, MECANICO solo taller) SOLO vivía en el frontend (useScope()).
-- Cualquiera con la sesión abierta podía consultar Supabase directamente
-- y ver datos de otros. Esta migración lo hace cumplir también en la BD.

-- ─── 1) Documentar mi_rol() (vivía solo en producción, no en git) ────────
create or replace function public.mi_rol()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.mi_grupo()
returns text language sql stable security definer as $$
  select grupo from public.profiles where id = auth.uid();
$$;

-- ─── 2) Funciones de scope reutilizables (una sola fuente de verdad) ────
create or replace function public.mis_moto_ids_subadmin()
returns setof uuid language sql stable security definer as $$
  select id from public.motos where subadmin_id = auth.uid();
$$;

create or replace function public.mis_contratos_subadmin()
returns setof uuid language sql stable security definer as $$
  select id from public.contratos where moto_id in (select public.mis_moto_ids_subadmin());
$$;

create or replace function public.mis_clientes_subadmin()
returns setof uuid language sql stable security definer as $$
  select cliente_id from public.contratos where moto_id in (select public.mis_moto_ids_subadmin())
  union
  select id from public.clientes where visita_asignada_a = auth.uid()
  union
  select cliente_id from public.visitas where asignada_a = auth.uid();
$$;

create or replace function public.mis_moto_ids_socio()
returns setof uuid language sql stable security definer as $$
  select id from public.motos where grupo = public.mi_grupo();
$$;

create or replace function public.mis_contratos_socio()
returns setof uuid language sql stable security definer as $$
  select id from public.contratos where moto_id in (select public.mis_moto_ids_socio());
$$;

create or replace function public.mis_clientes_socio()
returns setof uuid language sql stable security definer as $$
  select cliente_id from public.contratos where moto_id in (select public.mis_moto_ids_socio());
$$;

-- ─── 3) Índices para que el scope no se ponga lento con datos reales ────
create index if not exists idx_motos_subadmin_id on public.motos(subadmin_id);
create index if not exists idx_motos_grupo on public.motos(grupo);
create index if not exists idx_contratos_moto_id on public.contratos(moto_id);
create index if not exists idx_visitas_asignada_a on public.visitas(asignada_a);
create index if not exists idx_clientes_visita_asignada_a on public.clientes(visita_asignada_a);
create index if not exists idx_deudas_contrato_id on public.deudas(contrato_id);
create index if not exists idx_pagos_contrato_id on public.pagos(contrato_id);
create index if not exists idx_convenios_contrato_id on public.convenios(contrato_id);
create index if not exists idx_gestiones_cobro_contrato_id on public.gestiones_cobro(contrato_id);

-- ─── 4) CLIENTES ─────────────────────────────────────────────────────────
drop policy if exists "Autenticados leen clientes" on public.clientes;
drop policy if exists "Autenticados insertan clientes" on public.clientes;
drop policy if exists "Autenticados actualizan clientes" on public.clientes;

create policy "Clientes: lectura por rol"
  on public.clientes for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_clientes_subadmin()))
    or (public.mi_rol() = 'SOCIO' and id in (select public.mis_clientes_socio()))
  );

create policy "Clientes: solo staff de oficina registra"
  on public.clientes for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "Clientes: actualizacion por rol"
  on public.clientes for update to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_clientes_subadmin()))
  );

-- ─── 5) CONTRATOS (solo se toca SELECT; INSERT/UPDATE ya estaban bien) ──
drop policy if exists "Autenticados leen contratos" on public.contratos;

create policy "Contratos: lectura por rol"
  on public.contratos for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_contratos_subadmin()))
    or (public.mi_rol() = 'SOCIO' and id in (select public.mis_contratos_socio()))
  );

-- ─── 6) MOTOS (solo SELECT; INSERT/UPDATE se revisan con el rediseño de taller) ──
drop policy if exists "Usuarios autenticados pueden leer motos" on public.motos;

create policy "Motos: lectura por rol"
  on public.motos for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','MECANICO')
    or (public.mi_rol() = 'SUBADMIN' and subadmin_id = auth.uid())
    or (public.mi_rol() = 'SOCIO' and grupo = public.mi_grupo())
  );

-- ─── 7) DEUDAS ───────────────────────────────────────────────────────────
drop policy if exists "deudas_all" on public.deudas;

create policy "Deudas: lectura por rol"
  on public.deudas for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
    or (public.mi_rol() = 'SOCIO' and contrato_id in (select public.mis_contratos_socio()))
  );

create policy "Deudas: registro por staff de cobro"
  on public.deudas for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN'));

create policy "Deudas: actualizacion por staff de oficina"
  on public.deudas for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "Deudas: eliminacion admin"
  on public.deudas for delete to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

-- ─── 8) CONVENIOS ────────────────────────────────────────────────────────
drop policy if exists "convenios_all" on public.convenios;

create policy "Convenios: lectura por rol"
  on public.convenios for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
    or (public.mi_rol() = 'SOCIO' and contrato_id in (select public.mis_contratos_socio()))
  );

create policy "Convenios: creacion por staff de oficina"
  on public.convenios for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "Convenios: actualizacion por staff de oficina"
  on public.convenios for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "Convenios: eliminacion admin"
  on public.convenios for delete to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

-- ─── 9) GESTIONES DE COBRO ──────────────────────────────────────────────
drop policy if exists "gestiones_all" on public.gestiones_cobro;

create policy "Gestiones: lectura por rol"
  on public.gestiones_cobro for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
  );

create policy "Gestiones: registro por staff de cobro"
  on public.gestiones_cobro for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN'));

create policy "Gestiones: actualizacion por staff de cobro"
  on public.gestiones_cobro for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN'));

-- ─── 10) PAGOS ──────────────────────────────────────────────────────────
drop policy if exists "Autenticados leen pagos" on public.pagos;
drop policy if exists "Autenticados insertan pagos" on public.pagos;
drop policy if exists "Autenticados actualizan pagos" on public.pagos;

create policy "Pagos: lectura por rol"
  on public.pagos for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
    or (public.mi_rol() = 'SOCIO' and contrato_id in (select public.mis_contratos_socio()))
  );

create policy "Pagos: registro por staff de cobro"
  on public.pagos for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN'));

create policy "Pagos: actualizacion por staff de cobro"
  on public.pagos for update to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
  );

-- ─── 11) VISITAS (incluye fix del bug: ADMIN_PRINCIPAL no podía resolver) ──
drop policy if exists "Autenticados leen visitas" on public.visitas;
drop policy if exists "Solo ADMIN resuelve visitas" on public.visitas;

create policy "Visitas: lectura por rol"
  on public.visitas for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and asignada_a = auth.uid())
  );

create policy "Visitas: solo admin resuelve"
  on public.visitas for update to authenticated
  using (true)
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

-- ─── 12) LIQUIDACIONES / CAJA DIARIA / GPS / RECEPCIONES / ACUERDOS ─────
-- Estas tablas no le competen a SUBADMIN, SOCIO ni MECANICO — solo al
-- staff de oficina que gestiona la operación administrativa completa.
drop policy if exists "Autenticados leen liquidaciones" on public.liquidaciones;
drop policy if exists "Admin gestiona liquidaciones" on public.liquidaciones;
create policy "Liquidaciones: acceso staff de oficina"
  on public.liquidaciones for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

drop policy if exists "caja_diaria_all" on public.caja_diaria;
create policy "Caja diaria: acceso staff de oficina"
  on public.caja_diaria for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

drop policy if exists "Autenticados historial_ubicaciones" on public.historial_ubicaciones;
create policy "Historial ubicaciones: acceso staff de oficina"
  on public.historial_ubicaciones for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

drop policy if exists "Autenticados recepciones_vehiculo" on public.recepciones_vehiculo;
create policy "Recepciones vehiculo: acceso staff de oficina"
  on public.recepciones_vehiculo for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

drop policy if exists "Autenticados acuerdos_tiempo" on public.acuerdos_tiempo_rodado;
create policy "Acuerdos tiempo rodado: acceso staff de oficina"
  on public.acuerdos_tiempo_rodado for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));
