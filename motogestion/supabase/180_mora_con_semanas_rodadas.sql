-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 180 — LOS DÍAS DE MORA RESTAN LAS SEMANAS RODADAS (28-sep-2026)
--
-- EL DEFECTO. Rodar corre la curva de exigencia N semanas (mig 078): `cajas_exigidas()` ya resta
-- las rodadas para saber CUÁNTO debe. Pero la cuenta de DESDE CUÁNDO debe (`dias_en_mora_v2`) y
-- las fechas de cada semana en `cuenta_contrato` no las restaban. Medido el lunes 28-sep: 13 de los
-- 16 clientes con semanas rodadas salían con más días de mora de los reales, y 6 en mora cuando en
-- realidad les tocaba pagar ese mismo día (ELKIN CARDALES, KEVIN LUNA, ORLANDO BARRERA, WALTER
-- BAHOQUE, WILLINGTON GARCIA, JORGE LUIS TOVAR). A 4 les salió el mensaje de mora de ZALA.
-- KEVIN salía en mora "desde el 21": la semana que la empresa asumió (D-010).
--
-- JORGE LUIS TOVAR (ZIB64G) es el único contrato con cajas_pagadas < cajas_previas (86 < 111,
-- 28 rodadas). Su semana exigida caía en un número "anterior al libro" que no tenía fecha, y la
-- cuenta la SALTABA: ZALA y la pantalla le cobraban $55.000 (solo el acuerdo) en vez de $250.000
-- (su semana $195.000 + el acuerdo). Con la fecha corrida, la semana aparece. Es lo que exige el
-- motor y lo que él pagó el lunes 21.
--
-- LO QUE HACE (parche por anclas sobre la función VIVA, cada ancla debe aparecer 1 vez):
--   1. `zala.dias_en_mora_v2`: la semana más vieja sin pagar se exige N semanas rodadas después.
--   2. `zala.cuenta_contrato`: la fecha de cada semana exigida y la del próximo pago, corridas.
--   Espejo exacto de `diasEnMoraV2` y `desgloseExigible` en cicloPago.ts (mismo commit).
--   No toca el motor, el reparto, las cajas ni ninguna tabla: la foto de la plata debe dar 0.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   Quitar " + coalesce(c.cajas_exoneradas, 0)" de las tres líneas parchadas (se ven con
--   pg_get_functiondef) y volver a crear las dos funciones.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-180') as contratos_fotografiados;

begin;

-- ─── 1. DÍAS DE MORA ─────────────────────────────────────────────────────────────────────────
do $mig$
declare
  v_def text; v_n int;
  a_k constant text := 'v_k := greatest(v_pagadas - coalesce(c.cajas_previas, 0) + 1, 1);';
  b_k constant text := 'v_k := greatest(v_pagadas - coalesce(c.cajas_previas, 0) + coalesce(c.cajas_exoneradas, 0) + 1, 1);';
begin
  v_def := pg_get_functiondef('zala.dias_en_mora_v2(public.contratos, date)'::regprocedure);
  if position(b_k in v_def) > 0 then raise notice 'NADA QUE HACER: dias_en_mora_v2 ya resta las rodadas.'; return; end if;
  v_n := (length(v_def) - length(replace(v_def, a_k, ''))) / length(a_k);
  if v_n <> 1 then raise exception 'Ancla de v_k aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  execute replace(v_def, a_k, b_k);
  raise notice 'LISTO: dias_en_mora_v2 resta las semanas rodadas.';
end
$mig$;

-- ─── 2. FECHAS DE LAS SEMANAS Y DEL PRÓXIMO PAGO ─────────────────────────────────────────────
do $mig$
declare
  v_def text; v_n int;
  a_f constant text := 'v_fecha := zala.fecha_caja(c, j);';
  b_f constant text := 'v_fecha := zala.fecha_caja(c, j + coalesce(c.cajas_exoneradas, 0));';
  a_p constant text := 'zala.fecha_caja(c, v_prox_num)';
  b_p constant text := 'zala.fecha_caja(c, v_prox_num + coalesce(c.cajas_exoneradas, 0))';
begin
  v_def := pg_get_functiondef('zala.cuenta_contrato(public.contratos, public.convenios, numeric, date)'::regprocedure);
  if position(b_f in v_def) > 0 then raise notice 'NADA QUE HACER: cuenta_contrato ya corre las fechas.'; return; end if;
  v_n := (length(v_def) - length(replace(v_def, a_f, ''))) / length(a_f);
  if v_n <> 1 then raise exception 'Ancla de la fecha de cada semana aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, a_p, ''))) / length(a_p);
  if v_n <> 1 then raise exception 'Ancla del próximo pago aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_def := replace(v_def, a_f, b_f);
  v_def := replace(v_def, a_p, b_p);
  execute v_def;
  raise notice 'LISTO: cuenta_contrato corre las fechas por las semanas rodadas.';
end
$mig$;

select public.registrar_migracion(180, '180_mora_con_semanas_rodadas.sql',
  'Los días de mora y las fechas de las semanas restan las semanas rodadas (espejo de cicloPago): 6 clientes pasan de mora a paga hoy');

commit;

select public.tomar_foto_plata('despues-180');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select count(*) as cambios_de_plata_esperado_cero from public.comparar_fotos('antes-180', 'despues-180');

select z.cliente, z.estado_cartera, z.dias_mora, z.debe_hoy, z.proximo_pago_fecha, z.balde_hoy
  from zala.cliente z
 where z.contrato_id in (select id from public.contratos where cajas_exoneradas > 0)
 order by z.cliente;
-- Esperado el lunes 28-sep (16 filas):
--   BRADER GUZMAN WATSON ........ mora   6  · 591.000   · 2026-10-05
--   EDIER MARRUGO SUAREZ ........ mora   6  · 310.000   · 2026-10-05
--   ELKIN CARDALES JULIO ........ al-dia 0  · 404.000   · 2026-10-05
--   ELKIN HURTADO MOSQUERA ...... mora   6  · 485.000   · 2026-10-05
--   JESUS RAFAEL QUIÑONEZ ....... al-dia 0  · 140.000   · 2026-10-12
--   JONATHAN KENDRI VILLALOBOS .. mora   6  · 367.000   · 2026-10-05
--   JORGE LUIS TOVAR PRIMERA .... al-dia 0  · 250.000   · 2026-10-05
--   JUAN CARLOS LEAL ............ mora   6  · 838.000   · 2026-10-05
--   KEVIN ALEXIS LUNA CARDOZO ... al-dia 0  · 195.000   · 2026-10-05
--   LUIS ARMANDO MARTINEZ ....... mora   6  · 630.000   · 2026-10-05
--   LUIS EDUARDO VEGAS VILLEGA .. al-dia 0  · 0         · 2026-09-30
--   LUIS FELIPE HUERTAS ......... al-dia 0  · 0         · 2026-10-05
--   ORLANDO BARRERA VALDELAMAR .. al-dia 0  · 270.000   · 2026-10-05
--   WALTER BAHOQUE .............. al-dia 0  · 250.000   · 2026-10-05
--   WILLINGTON GARCIA ........... al-dia 0  · 251.000   · 2026-10-05
--   YEISON GABRIEL GUZMAN PEREZ . mora   13 · 951.000   · 2026-10-05
-- (Los montos pueden moverse si alguien paga hoy entre la medición y la corrida.)
