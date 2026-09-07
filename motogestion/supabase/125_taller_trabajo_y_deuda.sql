-- 125 — El taller anota QUÉ SE LE HIZO a la moto y recuerda si el arreglo se le cobró al cliente.
--
-- Antes la orden guardaba el problema (`detalle`), los repuestos como texto y un costo total,
-- pero no había dónde escribir el trabajo realizado, y el taller no sabía nada de deudas: para
-- cobrarle un daño al cliente había que ir a Cartera y registrar la deuda a mano, sin que la
-- orden se enterara (se podía cobrar dos veces, o ninguna). Caso que lo destapó: DQF56I,
-- 7-sep-2026 ("Ruido en el motor", cliente en préstamo de reemplazo).
--
-- `deuda_id` con ON DELETE SET NULL a propósito: borrar una deuda es una acción de admin que ya
-- deja rastro (mig 101); si se borra, la orden vuelve a mostrarse como "no cobrada", que es la
-- verdad.

alter table public.taller
  add column if not exists trabajo_realizado text,
  add column if not exists deuda_id uuid references public.deudas(id) on delete set null;

comment on column public.taller.trabajo_realizado is
  'Qué se le hizo a la moto, una anotación por línea con su fecha [dd/mm/aaaa]. Se agrega, nunca se borra.';
comment on column public.taller.deuda_id is
  'Deuda que se le registró al cliente por este arreglo (concepto daño_vehiculo u otro). NULL = no se le cobró.';

-- Verificación: las dos columnas existen.
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'taller'
  and column_name in ('trabajo_realizado', 'deuda_id')
order by column_name;
