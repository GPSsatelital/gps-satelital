-- ===== 037: RECONCILIACIÓN RLS — cierra huecos reales detectados en auditoría =====
-- Auditoría del 7 jul 2026 comparando pg_policies (BD real) contra el repo:
-- (1) gestiones_cobro quedó ABIERTA a cualquier autenticado: la 026 intentó
--     dropear "gestiones_all" pero la política real se llama "gestiones_cobro_all"
--     — el drop no coincidió y la política permisiva (ALL true) sobrevivió.
-- (2) motos INSERT/UPDATE y taller completo estaban abiertos (diferido en 026).
-- (3) contratos y contratos_auditoria no tenían política DELETE: el botón
--     "Cancelar y eliminar" (eliminarContratoEnProceso) borraba 0 filas EN SILENCIO
--     (RLS filtra sin error) — el contrato "eliminado" seguía existiendo.
-- (4) visitas INSERT estaba abierto a cualquier autenticado.
-- (5) Las políticas de contratos INSERT/UPDATE tenían contenido correcto
--     (mi_rol() con ADMIN/AP/SECRETARIA, arreglado directo en la BD) pero nombre
--     engañoso "Solo ADMIN..." — se renombran para que el nombre diga la verdad.

-- 1) HUECO: gestiones_cobro abierta
drop policy if exists "gestiones_cobro_all" on public.gestiones_cobro;

-- 2) MOTOS: cerrar INSERT/UPDATE
drop policy if exists "Usuarios autenticados pueden insertar motos" on public.motos;
drop policy if exists "Usuarios autenticados pueden actualizar motos" on public.motos;

create policy "Motos: registro por admins"
  on public.motos for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

create policy "Motos: actualizacion staff de oficina"
  on public.motos for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "Motos: subadmin actualiza sus motos"
  on public.motos for update to authenticated
  using (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_moto_ids_subadmin()))
  with check (public.mi_rol() = 'SUBADMIN' and id in (select public.mis_moto_ids_subadmin()));

create policy "Motos: mecanico actualiza (taller)"
  on public.motos for update to authenticated
  using (public.mi_rol() = 'MECANICO')
  with check (public.mi_rol() = 'MECANICO');

-- 3) TALLER: cerrar
drop policy if exists "Autenticados leen taller" on public.taller;
drop policy if exists "Autenticados insertan taller" on public.taller;
drop policy if exists "Autenticados actualizan taller" on public.taller;

create policy "Taller: lectura por rol"
  on public.taller for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','MECANICO')
    or (public.mi_rol() = 'SUBADMIN' and moto_id in (select public.mis_moto_ids_subadmin()))
  );

create policy "Taller: registro staff y mecanico"
  on public.taller for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','MECANICO'));

create policy "Taller: actualizacion staff y mecanico"
  on public.taller for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','MECANICO'));

-- 4) DELETE de contratos (solo "En proceso" — la BD misma lo garantiza) y su auditoría
create policy "Contratos: eliminar solo En proceso (staff oficina)"
  on public.contratos for delete to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA') and estado = 'En proceso');

create policy "Auditoria contratos: limpieza por staff de oficina"
  on public.contratos_auditoria for delete to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

-- 5) VISITAS: cerrar INSERT
drop policy if exists "Autenticados insertan visitas" on public.visitas;
create policy "Visitas: registro por staff de cobro"
  on public.visitas for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN'));

-- 6) Renombrar políticas engañosas de contratos
alter policy "Solo ADMIN crea contratos" on public.contratos
  rename to "Contratos: creacion staff de oficina";
alter policy "Solo ADMIN actualiza contratos" on public.contratos
  rename to "Contratos: actualizacion staff de oficina";
