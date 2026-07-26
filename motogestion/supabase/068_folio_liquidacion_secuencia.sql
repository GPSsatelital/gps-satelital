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

-- Arrancar por encima de lo que ya exista, sin retroceder nunca. Idempotente.
-- OJO con `last_value`: una secuencia recién creada lo reporta en 1 aunque no se haya usado
-- (is_called = false). Leerlo sin mirar is_called hacía que el primer folio saliera LIQ-0002.
do $$
declare v_max int; v_cur int; v_called boolean;
begin
  select coalesce(max(substring(numero from 'LIQ-([0-9]+)')::int), 0)
    into v_max from public.liquidaciones;
  select last_value, is_called into v_cur, v_called from public.liquidaciones_numero_seq;
  if not v_called then v_cur := 0; end if;      -- nunca se ha usado → no cuenta
  if greatest(v_max, v_cur) = 0 then
    perform setval('public.liquidaciones_numero_seq', 1, false);   -- el próximo será LIQ-0001
  else
    perform setval('public.liquidaciones_numero_seq', greatest(v_max, v_cur), true);
  end if;
end $$;

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
