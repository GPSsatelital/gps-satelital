-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 194 — EL LIBRO DE SEMANAS EN EL DICCIONARIO DE ZALA (9-oct-2026, dueño: "1" al plan)
--
-- QUÉ ES: la ficha del cliente → Pagos ahora muestra el contrato semana por semana (lista o
-- calendario): cada semana pagada, a medias o sin pagar, con los pagos que la llenaron. La cuenta
-- vive en `src/utils/libroSemanas.ts` y NO es nueva: sale de `cajas_pagadas`, `caja_actual_pagado` y
-- la misma fecha de Cartera (`desgloseExigible`). Medido el 9-oct en los 345 contratos: 0 diferencias.
--
-- POR QUÉ ESTA MIGRACIÓN (regla de la vitrina): todo estado nuevo que se muestre va al diccionario.
-- ZALA NO lee el libro (es la pantalla de la oficina) — por eso `zala_lo_dice = 'no'` y no hay vista
-- nueva: lo mismo, sumado, ya lo tiene en `zala.cliente` (cuota_falta, dias_mora, proximo_pago_fecha).
-- Solo agrega una fila al diccionario. No toca ninguna cifra ni ninguna tabla del negocio.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   delete from zala.diccionario where vista = 'libro_semanas';
--   delete from public.migraciones_aplicadas where numero = 194;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values
('libro_semanas', 'estado',
 'El estado de cada semana del contrato en la ficha del cliente (pantalla de la oficina, no es una vista de ZALA). '
 || 'pagada = completa · a medias = lleva una parte (dice cuánto le falta) · sin pagar = ya se le exigía y no ha pagado nada · '
 || 'próxima = la que le toca después · falta = las que vienen. Aparte: rodada = semana de moto guardada o de un rodado por deuda, '
 || 'que se paga al final del contrato; dice las fechas REALES en que la moto estuvo guardada. Las fechas de las que debe son las mismas de Cartera. '
 || 'Días en mora: el libro muestra UN solo número, arriba, el mismo de Cartera (con acuerdo cuenta la semana y la cuota juntas, D-030) y dice de dónde sale; '
 || 'cada semana dice solo la fecha en que venció (corregido el 10-oct: antes cada semana decía sus propios días y no coincidían). '
 || 'Si el cliente pregunta qué semana debe, ZALA lo responde con zala.cliente (cuota_falta, dias_mora, proximo_pago_fecha), con estas mismas palabras.',
 'pagada · a medias · sin pagar · próxima · falta · rodada', 'no', true)
on conflict (vista, columna) do update set significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, confirmado_por_dueno = excluded.confirmado_por_dueno, actualizado = now();

select public.registrar_migracion(194, '194_libro_de_semanas_diccionario.sql',
  'El libro de semanas (ficha → Pagos) en el diccionario de ZALA: estados de cada semana; ZALA no lo lee');

commit;

-- ─── VERIFICACIÓN — debe dar una fila ────────────────────────────────────────────────────────
select vista, columna, valores, zala_lo_dice from zala.diccionario where vista = 'libro_semanas';
