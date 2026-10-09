-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 195 — DE DÓNDE VINO UN REFERIDO, EN EL DICCIONARIO DE ZALA (9-oct-2026, dueño: "1" al plan)
--
-- QUÉ ES: la pantalla de Referidos ahora tiene la lista «Referidos por fecha» (por el día en que
-- recibió la moto o en que se registró) y el bloque «Los trajo el equipo». Cada referido sale como
-- `cliente` (programa de premios) o `equipo` (lo trajo un supervisor: se le paga en la nómina, como
-- las visitas, y NO cuenta para premios — decisión del dueño del 9-oct).
--
-- POR QUÉ ESTA MIGRACIÓN (regla de la vitrina): todo valor nuevo que se muestre va al diccionario.
-- ZALA no lo usa (es la pantalla de la oficina): `zala_lo_dice = 'no'`, sin vista nueva.
-- Solo agrega una fila al diccionario. No toca ninguna tabla del negocio.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   delete from zala.diccionario where vista = 'referidos' and columna = 'origen';
--   delete from public.migraciones_aplicadas where numero = 195;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('referidos', 'origen',
 'De dónde vino un cliente referido (pantalla de Referidos de la oficina, no es una vista de ZALA). '
 || 'equipo = lo trajo alguien del equipo (clientes.referido_por_funcionario, mig 153): se le paga en la nómina, '
 || 'como las visitas, y no cuenta para premios. cliente = lo refirió otro cliente con su cédula: cuenta para los '
 || 'premios (guantes, intercomunicador, casco, combo) cuando el referido recibe la moto.',
 'cliente · equipo', 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

select public.registrar_migracion(195, '195_referidos_origen_diccionario.sql',
  'De dónde vino un referido (cliente o equipo) en el diccionario de ZALA; ZALA no lo usa');

commit;

-- ─── VERIFICACIÓN — debe dar una fila ────────────────────────────────────────────────────────
select vista, columna, valores, zala_lo_dice from zala.diccionario where vista = 'referidos';
