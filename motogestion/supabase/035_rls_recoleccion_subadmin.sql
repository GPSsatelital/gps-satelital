-- ===== RLS: el SUBADMIN puede hacer la recolección de SUS motos asignadas =====
-- La migración 026 dejó recepciones_vehiculo, historial_ubicaciones y la
-- actualización de contratos solo para staff de oficina (ADMIN/AP/SECRETARIA).
-- Pero el rediseño de recolección (TEMA 4) permite al SUBADMIN hacer la
-- recolección en campo/bodega, y ese flujo (ModalRecoleccion) encadena:
-- registrar recepción → gestión → SUSPENDER contrato → multa.
-- Aquí se le da acceso al SUBADMIN, SIEMPRE limitado a sus motos asignadas.
-- Idempotente: se puede correr más de una vez.

-- 1) Recepciones del vehículo (fotos/condición/km/destino)
drop policy if exists "Recepciones vehiculo: acceso staff de oficina" on public.recepciones_vehiculo;
drop policy if exists "Recepciones vehiculo: staff + subadmin sus motos" on public.recepciones_vehiculo;
create policy "Recepciones vehiculo: staff + subadmin sus motos"
  on public.recepciones_vehiculo for all to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  )
  with check (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

-- 2) Historial de ubicaciones (se escribe junto con la recepción)
drop policy if exists "Historial ubicaciones: acceso staff de oficina" on public.historial_ubicaciones;
drop policy if exists "Historial ubicaciones: staff + subadmin sus motos" on public.historial_ubicaciones;
create policy "Historial ubicaciones: staff + subadmin sus motos"
  on public.historial_ubicaciones for all to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  )
  with check (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

-- 3) Actualizar contrato (suspenderlo en la recolección) — SOLO sus contratos.
-- Política PERMISIVA aparte: se suma (OR) a la de staff de oficina ya existente,
-- sin quitarle acceso a nadie. El SUBADMIN solo puede tocar contratos de sus motos.
drop policy if exists "Contratos: actualizacion subadmin sus motos" on public.contratos;
create policy "Contratos: actualizacion subadmin sus motos"
  on public.contratos for update to authenticated
  using (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_contratos_subadmin()))
  with check (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_contratos_subadmin()));
