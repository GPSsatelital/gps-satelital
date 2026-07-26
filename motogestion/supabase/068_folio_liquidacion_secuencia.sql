-- ===== 068: el folio de la liquidación sale de una secuencia, no de contar filas =====
--
-- Antes: `generarNumero()` hacía COUNT(*) sobre liquidaciones y sumaba 1. Dos problemas reales:
--   1) CARRERA: dos personas iniciando una liquidación al mismo tiempo obtienen el mismo count
--      → el mismo LIQ-XXXX → una de las dos revienta contra el UNIQUE de `numero`.
--   2) REUSO: si alguna vez se borra una liquidación, el count baja y el siguiente folio repite
--      un número ya usado en un documento legal impreso.
--
-- Una secuencia de Postgres resuelve ambos: nextval es atómico y nunca retrocede.

create sequence if not exists public.liquidaciones_numero_seq;

-- Arrancar por encima de lo que ya exista (idempotente: se puede correr varias veces).
select setval(
  'public.liquidaciones_numero_seq',
  greatest(
    coalesce((select max(substring(numero from 'LIQ-([0-9]+)')::int) from public.liquidaciones), 0),
    coalesce((select last_value from public.liquidaciones_numero_seq), 0)
  ),
  true
);

-- La app pide el folio ANTES de insertar (lo necesita para el detalle de la orden de taller),
-- así que se expone como función en vez de como default de la columna.
create or replace function public.siguiente_numero_liquidacion()
returns text
language sql
security definer
set search_path = public
as $$
  select 'LIQ-' || lpad(nextval('public.liquidaciones_numero_seq')::text, 4, '0');
$$;

revoke all on function public.siguiente_numero_liquidacion() from public;
grant execute on function public.siguiente_numero_liquidacion() to authenticated;

comment on function public.siguiente_numero_liquidacion() is
  'Folio consecutivo y atómico para una liquidación. Reemplaza el COUNT(*)+1 del frontend, '
  'que se repetía si dos personas liquidaban a la vez o si se borraba una liquidación.';
