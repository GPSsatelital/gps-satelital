-- 058 — Fecha desde la que un cobrador (sub-admin) tiene una moto asignada.
-- Antes solo existía motos.subadmin_id (la asignación ACTUAL) sin saber desde cuándo,
-- lo que hacía injusto el informe de recaudo por cobrador (le atribuía todo el período
-- aunque la moto se le hubiera pasado ayer). Esta columna empieza a registrar la fecha
-- de asignación de aquí en adelante; las motos ya asignadas quedan en null ("sin registro",
-- no hay historial que recuperar). El frontend la setea en useMotos.asignarSubadmin.
alter table public.motos
  add column if not exists subadmin_asignado_desde timestamptz;
