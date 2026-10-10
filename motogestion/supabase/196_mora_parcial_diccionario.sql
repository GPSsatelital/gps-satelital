-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 196 — "EN MORA" PARTIDO EN PARCIAL Y NO PAGÓ, EN EL DICCIONARIO DE ZALA (9-oct-2026, dueño: "1")
--
-- QUÉ ES: Reportes vuelve a separar, como antes del 29-sep, a los que están en mora hoy: `Parcial`
-- si en el período escogido entró plata suya (dio algo pero no completó) y `No pagó` si no entró
-- nada. Sale en el Resumen de la pantalla, en el Excel por cobrador y por grupo y en el PDF.
-- No cambia quién está en mora ni sus días.
--
-- POR QUÉ ESTA MIGRACIÓN (regla de la vitrina): todo valor nuevo que se muestre va al diccionario.
-- ZALA no lo usa: `zala_lo_dice = 'no'`, sin vista nueva. Solo agrega una fila al diccionario.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   delete from zala.diccionario where vista = 'reportes' and columna = 'mora_parcial';
--   delete from public.migraciones_aplicadas where numero = 196;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('reportes', 'mora_parcial',
 'Los que están en mora HOY (la misma cuenta de Cartera), partidos según el período escogido en Reportes: '
 || 'Parcial = entró plata suya en el período (dio algo pero no completó) · No pagó = no entró nada. '
 || 'El saldo a favor aplicado no cuenta como plata que entra. No cambia quién está en mora ni sus días. '
 || 'Pantalla de la oficina (Resumen, Excel y PDF), no es una vista de ZALA.',
 'Parcial · No pagó', 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

select public.registrar_migracion(196, '196_mora_parcial_diccionario.sql',
  'En mora partido en Parcial y No pagó (Reportes) en el diccionario de ZALA; ZALA no lo usa');

commit;

-- ─── VERIFICACIÓN — debe dar una fila ────────────────────────────────────────────────────────
select vista, columna, valores, zala_lo_dice from zala.diccionario where vista = 'reportes' and columna = 'mora_parcial';
