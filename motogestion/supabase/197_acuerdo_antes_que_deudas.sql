-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 197 — EL ACUERDO SE COBRA ANTES QUE LAS DEUDAS SUELTAS (D-049 · 10-oct-2026)
--
-- LA REGLA DEL DUEÑO (10-oct): *"el reparto de un pago debe ser primero a la semana, después a lo
-- que pactó de convenio para que queden juntos, y ya de último las deudas y demás"*. Escogió el
-- cambio SOLO HACIA ADELANTE: lo ya repartido no se toca.
--
-- 🔴 EL PROBLEMA, MEDIDO EL 10-OCT. Desde D-022 la semana y SU cuota del acuerdo van juntas, pero
-- las cuotas del acuerdo que quedaban atrás sin su semana (las de antes de D-022, o la de quien pagó
-- solo su semana) esperaban DETRÁS de cualquier deuda suelta. De 136 clientes con acuerdo, 43 tienen
-- cuotas así y 4 además deudas sueltas. JONATHAN KENDRI (DPU30I): acuerdo con $96.000 cobrados sin
-- pagar y un repuesto de $110.000; si pagaba $100.000, todo iba al repuesto y el acuerdo seguía atrás
-- (al tercer acuerdo incumplido va liquidación).
--
-- ── QUÉ CAMBIA ──────────────────────────────────────────────────────────────────────────────
-- En la función VIVA se intercambian dos bloques que no dependen uno del otro (solo comparten la plata
-- que queda, `v_monto`): el del acuerdo («★ EL FRENO», con D-022 y D-026 adentro) pasa ANTES que el de
-- las deudas sueltas. Nada más.
--
-- 🔑 LO QUE **NO** CAMBIA: el paso 0 (moto retenida: multa y lavada primero), el prorrateo, el
-- conjunto semana + cuota (D-022), el freno del acuerdo (mig 119), D-026, el orden entre deudas
-- (multa → lavada → antiguas), la ventana de prepago al final (mig 149), el saldo a favor, las
-- reversas y el reparto explícito. Ningún pago ya repartido se mueve (foto antes/después = 0).
--
-- 🔑 SE PARCHA LA FUNCIÓN **VIVA** (`pg_get_functiondef`, leída el 10-oct: el bloque de deudas en las
-- líneas 138-155 y el del acuerdo en 157-184). Tres anclas que tienen que aparecer EXACTAMENTE una vez
-- y en ese orden; si no, aborta sin tocar nada. Lección de la mig 124.
--
-- 🔑 LA PRUEBA VA ADENTRO: con la función nueva se registra un pago de prueba de $100.000 a JONATHAN,
-- se mira cómo quedó repartido y se deshace. Si no da acuerdo $96.000 y deudas $4.000, la migración
-- entera se cancela y no cambia nada. Esos números son los de su cuenta del sábado 10-oct; desde el
-- lunes 12 se le suma una semana y la prueba ya no aplicaría.
--
-- ── ESPEJO ──────────────────────────────────────────────────────────────────────────────────
-- `repartirPagoV2` (`src/utils/repartoPago.ts`), ya cambiado: 3 pruebas del orden viejo actualizadas y
-- 3 nuevas (JONATHAN, moto retenida, semanas de más). Si se toca uno hay que tocar el otro.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
-- Volver a intercambiar los dos bloques (el de deudas antes del de «★ EL FRENO») y quitar las dos
-- líneas «★ D-049». No toca ningún dato: solo cambia cómo se reparten los pagos FUTUROS.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-197') as contratos_fotografiados;

begin;

do $mig$
declare
  v_def    text;
  v_n      int;
  v_deudas constant text := 'if v_monto > 0 then' || E'\r\n' ||
                            '          v_resto := v_monto;' || E'\r\n' ||
                            '          for v_d in' || E'\r\n' ||
                            '            select id, monto_pendiente from public.deudas';
  v_freno  constant text := '-- ★ EL FRENO: el convenio solo recibe lo EXIGIDO menos lo ya abonado.';
  v_ventana constant text := '-- 2b) LA VENTANA DE PREPAGO';
  v_sp     constant text := '        ';   -- la sangría de esos bloques (8 espacios)
  i1 int; i2 int; i3 int;
  v_bloque_deudas text;
  v_bloque_conv   text;
begin
  v_def := pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure);

  if position('D-049' in v_def) > 0 then
    raise notice 'NADA QUE HACER: aplicar_pago_confirmado() ya tiene D-049.'; return;
  end if;

  v_n := (length(v_def) - length(replace(v_def, v_deudas, ''))) / length(v_deudas);
  if v_n <> 1 then raise exception 'El ancla de las deudas aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, v_freno, ''))) / length(v_freno);
  if v_n <> 1 then raise exception 'El ancla del acuerdo aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;
  v_n := (length(v_def) - length(replace(v_def, v_ventana, ''))) / length(v_ventana);
  if v_n <> 1 then raise exception 'El ancla de la ventana aparece % veces, se esperaba 1. No se tocó nada.', v_n; end if;

  i1 := position(v_deudas in v_def);
  i2 := position(v_freno in v_def);
  i3 := position(v_ventana in v_def);
  if not (i1 < i2 and i2 < i3) then
    raise exception 'Los bloques no están en el orden esperado (deudas %, acuerdo %, ventana %). No se tocó nada.', i1, i2, i3;
  end if;

  v_bloque_deudas := substr(v_def, i1, i2 - i1);   -- "if v_monto > 0 then ... end if;" + espacios
  v_bloque_conv   := substr(v_def, i2, i3 - i2);   -- "-- ★ EL FRENO ... end if;" + espacios

  v_def := substr(v_def, 1, i1 - 1)
    || '-- ★ D-049 (10-oct-2026): el acuerdo ANTES que las deudas sueltas (regla del dueño: primero la' || E'\r\n'
    || v_sp || '--   semana, después lo pactado del acuerdo, de último las deudas). Antes iba al revés.' || E'\r\n'
    || v_sp || v_bloque_conv
    || '-- ★ D-049: las deudas sueltas, después del acuerdo (multa → lavada → antiguas, como siempre).' || E'\r\n'
    || v_sp || v_bloque_deudas
    || substr(v_def, i3);

  execute v_def;
  raise notice 'LISTO: el acuerdo ya se cobra antes que las deudas sueltas.';
end
$mig$;

-- La prueba con JONATHAN KENDRI (DPU30I), deshecha al terminar. Si no da lo esperado, se cancela todo.
do $prueba$
declare
  v_id uuid;
  v_conv numeric; v_deuda numeric; v_sem numeric; v_favor numeric;
begin
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values ('cf28defc-9529-440e-b24d-87235281210a', 100000, 'Efectivo', 'Confirmado', 'normal', current_date, current_date)
    returning id into v_id;
    select coalesce(aplicado_convenio, 0), coalesce(aplicado_deuda, 0), coalesce(aplicado_tarifa, 0), coalesce(aplicado_saldo_favor, 0)
      into v_conv, v_deuda, v_sem, v_favor
      from public.pagos where id = v_id;
    raise exception using errcode = 'ZZ049', message = 'deshacer el pago de prueba';
  exception when sqlstate 'ZZ049' then
    null;   -- el pago de prueba y todo lo que movió quedan deshechos; los números ya se leyeron
  end;
  raise notice 'Prueba JONATHAN ($100.000): acuerdo %, deudas %, semana %, a favor %', v_conv, v_deuda, v_sem, v_favor;
  if v_conv is distinct from 96000 or v_deuda is distinct from 4000 then
    raise exception 'La prueba no dio lo esperado (acuerdo 96000 y deudas 4000): salió acuerdo %, deudas %, semana %, a favor %. No se cambió nada.',
      v_conv, v_deuda, v_sem, v_favor;
  end if;
end
$prueba$;

select public.registrar_migracion(197, '197_acuerdo_antes_que_deudas.sql',
  'D-049: el acuerdo se cobra antes que las deudas sueltas (solo pagos nuevos)');

commit;

select public.tomar_foto_plata('despues-197');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- (a) Debe dar 0: esta migración no mueve plata de nadie, solo cambia pagos futuros.
-- (b) Debe dar true: el cambio quedó puesto.
-- (c) Debe dar true: el acuerdo («EL FRENO») quedó ANTES que las deudas.
select
  (select count(*) from public.comparar_fotos('antes-197', 'despues-197'))                    as pesos_movidos,
  position('D-049' in pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure)) > 0 as cambio_puesto,
  position('-- ★ EL FRENO' in pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure))
    < position('v_resto := v_monto;' || E'\r\n' || '          for v_d in' in pg_get_functiondef('public.aplicar_pago_confirmado()'::regprocedure)) as acuerdo_antes;

-- Limpieza de las fotos (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-197','despues-197');
