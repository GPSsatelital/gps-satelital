-- Migración 107: la tabla de liquidaciones entra a tiempo real
--
-- La pantalla abre un canal de tiempo real para `liquidaciones` desde que existe el módulo, pero
-- la tabla NUNCA se agregó a la publicación. O sea: se suscribía a un canal que no iba a recibir
-- un aviso jamás. Hay 15 tablas publicadas y esta no estaba.
--
-- Era la tercera de las tres causas del congelamiento que reportó el dueño al hacer su primera
-- liquidación (le dio a "Registrar revisión y calcular", se guardó de verdad, y la pantalla se
-- quedó igual):
--   1. La pantalla guardaba una FOTOCOPIA del objeto, no el id → arreglado en LiquidacionesView.
--   2. Las mutaciones no refrescaban la lista → arreglado en useLiquidaciones.
--   3. Sin tiempo real, ningún aviso llegaba → esto.
--
-- Con las dos primeras ya funciona en el equipo que hace el cambio. Esta hace que además se vea en
-- los OTROS equipos: si la secretaria calcula el saldo, el admin lo ve sin recargar. Sin ella,
-- dos personas trabajando la misma liquidación se pisan sin enterarse.

alter publication supabase_realtime add table public.liquidaciones;
