-- El CHECK de contratos.estado en la BD real no incluía 'Suspendido' (la migración 010
-- lo agregaba pero nunca se aplicó), así que suspender un contrato en la recolección
-- fallaba con "violates check constraint contratos_estado_check".
-- Se recrea el CHECK con los 5 estados válidos del tipo ContratoEstado.
alter table public.contratos drop constraint if exists contratos_estado_check;
alter table public.contratos add constraint contratos_estado_check
  check (estado in ('En proceso','Activo','Finalizado','Cancelado','Suspendido'));
