-- 164 — La moto prestada también deja evidencia de cómo sale y cómo vuelve (22-sep-2026)
--
-- EL HUECO (lo vio el dueño): prestar un reemplazo era el ÚNICO momento del sistema en que una
-- moto cambia de manos SIN dejar nada. Se elegía la placa, salía un "¿seguro?", y listo: ni una
-- foto, ni kilometraje, ni condición. Devolverla, igual: un botón y se cerraba.
--
-- Todo lo demás sí documenta: la entrega del wizard pide 6 fotos + km + checklist · la
-- recolección por mora, 6 fotos + multa + gestión · la entrega voluntaria, 6 fotos · devolver una
-- retenida, 6 fotos + km + condición. Solo el préstamo no.
--
-- Y es la moto de OTRO SOCIO la que se presta y se desgasta: si el cliente la choca o la raya,
-- esa foto es la única prueba de cómo salió. Con el km de ida y de vuelta, además, por primera
-- vez se sabe cuánto rodó — dato que hoy no existe en ningún lado.
--
-- QUÉ HACE ESTA MIGRACIÓN: nada más que abrirle dos nombres propios a `recepciones_vehiculo`.
-- La tabla YA tiene todo lo demás (fotos, kilometros, condicion_general, descripcion_danos,
-- nombre_entrega, quien_recibe, observaciones) — no hace falta ninguna columna nueva.
--
-- POR QUÉ NO SE USA 'otro' Y NOS AHORRAMOS LA MIGRACIÓN: ya se intentó ese atajo con el alquiler
-- del reemplazo, que nació como deuda 'otro'. Meses después hubo que hacer la mig 131 justamente
-- porque esa plata no se podía seguir. Un nombre propio desde el principio cuesta esta migración;
-- ponerlo después cuesta una migración Y un backfill.

begin;

-- ── GUARDA: si el check ya trae los motivos nuevos, esto ya se corrió ────────────────────────
do $$
declare v_def text;
begin
  select pg_get_constraintdef(c.oid) into v_def
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
   where n.nspname = 'public' and t.relname = 'recepciones_vehiculo'
     and c.contype = 'c' and pg_get_constraintdef(c.oid) like '%motivo%';

  if v_def is null then
    raise exception 'ABORTA: no se encontró el CHECK del motivo en recepciones_vehiculo.';
  end if;
  if v_def like '%prestamo_entrega%' then
    raise exception 'ABORTA: el motivo prestamo_entrega ya existe. Esto ya se corrió.';
  end if;
  -- Los 5 de siempre tienen que seguir estando: si alguno falta, alguien ya tocó el check y
  -- reescribirlo a ciegas borraría su cambio (la lección de la mig 124).
  if v_def not like '%retencion_mora%' or v_def not like '%entrega_voluntaria%'
     or v_def not like '%liquidacion%' or v_def not like '%nuevo_registro%' or v_def not like '%otro%' then
    raise exception 'ABORTA: el CHECK ya no es el que este archivo cree. Dice: %', v_def;
  end if;
end $$;

-- El nombre del constraint se busca, no se adivina (la primera versión de la mig 071 falló por
-- adivinarlo mal y dejó un bucket sin cerrar).
do $$
declare v_nombre text;
begin
  select c.conname into v_nombre
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
   where n.nspname = 'public' and t.relname = 'recepciones_vehiculo'
     and c.contype = 'c' and pg_get_constraintdef(c.oid) like '%motivo%';
  execute format('alter table public.recepciones_vehiculo drop constraint %I', v_nombre);
end $$;

alter table public.recepciones_vehiculo
  add constraint recepciones_vehiculo_motivo_check
  check (motivo in (
    'retencion_mora',      -- se le recolectó por no pagar
    'entrega_voluntaria',  -- el cliente para un tiempo y entrega la moto
    'liquidacion',         -- se cierra el contrato
    'nuevo_registro',      -- solo constancia del estado / movimiento de bodega
    'otro',
    'prestamo_entrega',    -- 🆕 sale una moto PRESTADA hacia el cliente
    'prestamo_devolucion'  -- 🆕 vuelve la moto PRESTADA a la empresa
  ));

-- ── COMPROBACIÓN ─────────────────────────────────────────────────────────────────────────────
do $$
declare v_def text;
begin
  select pg_get_constraintdef(c.oid) into v_def
    from pg_constraint c join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
   where n.nspname='public' and t.relname='recepciones_vehiculo'
     and c.contype='c' and pg_get_constraintdef(c.oid) like '%motivo%';
  if v_def not like '%prestamo_entrega%' or v_def not like '%prestamo_devolucion%' then
    raise exception 'ABORTA: los motivos nuevos no quedaron. Dice: %', v_def;
  end if;
  if v_def not like '%retencion_mora%' or v_def not like '%otro%' then
    raise exception 'ABORTA: se perdió alguno de los motivos viejos. Dice: %', v_def;
  end if;
end $$;

commit;

-- Para verlo:
--   select pg_get_constraintdef(c.oid) from pg_constraint c
--     join pg_class t on t.oid = c.conrelid
--    where t.relname = 'recepciones_vehiculo' and c.contype = 'c';
