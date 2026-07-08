-- ===== 041: cierre de caja diaria POR GRUPO (cada portafolio se cierra por aparte) =====
-- Antes: una sola fila por fecha (UNIQUE(fecha)) = un cierre para todos los grupos juntos.
-- Ahora: una fila por (fecha, grupo) → cada portafolio (COSTA/PRADERA/RASTREADOR/USADAS)
-- se cuadra y se cierra independiente. Los cierres viejos quedan como grupo 'GENERAL'.

alter table public.caja_diaria add column if not exists grupo text not null default 'GENERAL';

-- Cambiar la unicidad de (fecha) a (fecha, grupo)
alter table public.caja_diaria drop constraint if exists caja_diaria_fecha_key;
alter table public.caja_diaria drop constraint if exists caja_diaria_fecha_grupo_key;
alter table public.caja_diaria add constraint caja_diaria_fecha_grupo_key unique (fecha, grupo);
