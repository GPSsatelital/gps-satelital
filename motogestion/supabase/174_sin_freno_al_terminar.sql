-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 174 — CON TODAS LAS SEMANAS LLENAS, EL ACUERDO RECIBE TODO LO QUE LE FALTE (D-026 · 26-sep-2026)
--
-- LA REGLA DEL DUEÑO (D-026): quien llena su última semana y todavía debe, sigue pagando su
-- semana normal y TODO va a lo que debe —primero deudas, después acuerdo— hasta quedar en $0.
--
-- 🔴 EL PROBLEMA, MEDIDO. El freno de la mig 119 le deja al acuerdo recibir solo lo EXIGIDO a la
-- fecha. Mientras hay semanas que pagar, eso protege la semana. Cuando ya no hay, frena al acuerdo
-- y manda la plata a saldo a favor: YESID BARRAZA (RLT72H) paga $235.000 en su semana de más y el
-- acuerdo recibe $60.000, $175.000 a saldo a favor, y nunca termina. Las deudas sueltas no tenían
-- este problema: ya se pagaban completas.
--
-- ── QUÉ CAMBIA, EN UNA LÍNEA ────────────────────────────────────────────────────────────────
-- En el paso del freno, si `cajas_pagadas >= total_cajas`, el acuerdo puede recibir todo su
-- pendiente en vez de solo lo exigido. Nada más.
--
-- 🔑 LO QUE **NO** CAMBIA: el freno para quien todavía tiene semanas por pagar (todos los demás
-- contratos), el conjunto semana + cuota (D-022), la ventana de prepago (mig 149), el orden de las
-- deudas, el ahorro, el prorrateo y las reversas. Un contrato sin `total_cajas` nunca pierde el freno.
--
-- 🔑 SE PARCHA LA FUNCIÓN **VIVA** con `pg_get_functiondef` (leída el 26-sep, idéntica a la que
-- dejó la mig 171), por un ancla que tiene que aparecer EXACTAMENTE una vez: si no, aborta sin
-- tocar nada. Lección de la mig 124.
--
-- ── ESPEJO ──────────────────────────────────────────────────────────────────────────────────
-- `repartirPagoV2` (`src/utils/repartoPago.ts`), ya cambiado, con 6 pruebas nuevas de YESID y las
-- 47 de antes intactas. Si se toca uno hay que tocar el otro.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
-- Correr el bloque al revés: reemplazar `v_bloque || v_ancla` por `v_ancla`. No toca ningún dato:
-- solo cambia cómo se reparten los pagos FUTUROS de quien ya llenó sus semanas.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-174') as contratos_fotografiados;

begin;

do $mig$
declare
  v_def   text;
  v_n     int;
  v_ancla constant text := '-- ★ D-022: descontar lo que ya se entregó período por período arriba,';
  v_sp    constant text := '            ';   -- la sangría de ese bloque (12 espacios)
  v_bloque text;
begin
  v_def := pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure);

  if position('D-026' in v_def) > 0 then
    raise notice 'NADA QUE HACER: aplicar_pago_confirmado() ya tiene D-026.'; return;
  end if;

  v_n := (length(v_def) - length(replace(v_def, v_ancla, ''))) / length(v_ancla);
  if v_n <> 1 then raise exception 'El ancla aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;

  v_bloque :=
    '-- ★ D-026 (26-sep-2026): con TODAS las semanas llenas no hay freno: el acuerdo recibe' || E'\r\n' ||
    v_sp || '--   todo lo que le falte. El cliente sigue pagando su semana normal hasta quedar en $0.' || E'\r\n' ||
    v_sp || 'if v_contrato.total_cajas is not null' || E'\r\n' ||
    v_sp || '   and v_contrato.cajas_pagadas >= v_contrato.total_cajas then' || E'\r\n' ||
    v_sp || '  v_puede_conv := v_pend_conv;' || E'\r\n' ||
    v_sp || 'end if;' || E'\r\n' ||
    v_sp;

  v_def := replace(v_def, v_ancla, v_bloque || v_ancla);
  execute v_def;
  raise notice 'LISTO: el acuerdo ya no tiene freno cuando todas las semanas están llenas.';
end
$mig$;

select public.registrar_migracion(174, '174_sin_freno_al_terminar.sql',
  'D-026: con todas las semanas llenas el acuerdo recibe todo lo que le falte (sin el freno de la 119)');

commit;

select public.tomar_foto_plata('despues-174');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- (a) Debe dar 0: esta migración no mueve plata de nadie, solo cambia pagos futuros.
-- (b) Debe dar true: el parche quedó puesto.
select
  (select count(*) from public.comparar_fotos('antes-174', 'despues-174'))                  as pesos_movidos,
  position('D-026' in pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure)) > 0 as parche_puesto;

-- ─── PRUEBA CON YESID (no cambia nada: todo va dentro de un rollback) ────────────────────────
-- Se le simulan las 65 semanas llenas y un pago de $235.000. Esperado: al_acuerdo = 235000,
-- a_la_semana = 0, quedo_a_favor = 0. (Antes del parche: al_acuerdo = 60000, quedo_a_favor = 175000.)
--   begin;
--     update public.contratos set cajas_pagadas = 65, caja_actual_pagado = 0
--      where id = 'd1ef9166-8592-418d-acb6-5bda982bc531';
--     insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
--     values ('d1ef9166-8592-418d-acb6-5bda982bc531', 235000, 'Efectivo', 'Confirmado', 'normal',
--             current_date, current_date);
--     select aplicado_tarifa as a_la_semana, aplicado_convenio as al_acuerdo,
--            aplicado_deuda as a_deudas, aplicado_saldo_favor as quedo_a_favor
--       from public.pagos
--      where contrato_id = 'd1ef9166-8592-418d-acb6-5bda982bc531'
--      order by created_at desc limit 1;
--   rollback;

-- Limpieza de las fotos (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-174','despues-174');
