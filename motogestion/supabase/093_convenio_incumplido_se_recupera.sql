-- ===== 093: un convenio "incumplido" se recupera si el cliente vuelve a pagar =====
--
-- REGLA DEL DUEÑO (8-ago-2026), textual: "si un cliente se atrasó pero luego se coloca al día
-- sigue normal con su convenio. El incumplido es mientras está atrasado, o si ya definitivamente
-- no paga y se liquida. Por eso es que el sub admin que tenga asignado debe hacer bien la gestión
-- de cobro."
--
-- 🔴 EL DEFECTO: `marcar_convenios_vencidos()` estampa 'incumplido' cuando pasa la fecha límite
-- sin completar, y ese sello era DEFINITIVO — el motor solo mira convenios 'activo' o 'cumplido'
-- (`estado in ('activo','cumplido')`). O sea que desde ese momento:
--    · los pagos del cliente DEJABAN DE APLICARSE al convenio
--    · el contador de cuotas quedaba congelado para siempre
--    · el cliente podía pagar todo y el convenio seguía diciendo "incumplido"
-- Un cliente que se pone al día quedaba castigado sin salida, y encima su plata no se veía.
--
-- QUÉ CAMBIA (tres anclas de una línea):
--   1. El motor también mira los 'incumplido': los pagos vuelven a aplicarse.
--   2. Un 'incumplido' que recibe abono vuelve a 'activo' — se está poniendo al día.
--   3. Al volver a 'activo' se le corre la fecha límite por las cuotas que le faltan, contadas
--      desde hoy. Sin esto quedaría oscilando: activo al pagar, incumplido al día siguiente
--      cuando la función de vencidos lo volviera a estampar por la fecha ya pasada.
--
-- LO QUE NO CAMBIA: cuánta plata entra, el reparto, el ahorro, las cajas, la caja diaria, ni
-- cuándo un convenio se da por 'cumplido' (eso lo fijó la mig 084). Un convenio 'activo' se
-- comporta exactamente igual que hoy.
--
-- MÉTODO (igual que 083/084/085/086): lee la función de la propia base y la reescribe. Si no
-- encuentra las anclas exactamente una vez cada una, ABORTA sin tocar nada. La función VIVA no
-- siempre es igual a la del repo — pegar la del archivo revertiría arreglos en silencio.

do $$
declare
  v_a1_de constant text := 'where contrato_id = v_row.contrato_id and estado in (''activo'', ''cumplido'')';
  v_a1_a  constant text := 'where contrato_id = v_row.contrato_id and estado in (''activo'', ''cumplido'', ''incumplido'')';

  v_a2_de constant text := 'cuotas_pagadas = v_cuotas_completas,';
  v_a2_a  constant text :=
    'cuotas_pagadas = v_cuotas_completas, '
    || 'fecha_limite = case when estado = ''incumplido'' and v_cuotas_completas < numero_cuotas '
    ||   'then current_date + ((numero_cuotas - v_cuotas_completas) * '
    ||        '(select case c.forma_pago when ''Quincenal'' then 15 when ''Mensual'' then 30 else 7 end '
    ||           'from public.contratos c where c.id = v_row.contrato_id))::int '
    ||   'else fecha_limite end,';

  v_a3_de constant text := 'when estado = ''cumplido'' and v_cuotas_completas < numero_cuotas then ''activo''';
  v_a3_a  constant text := 'when estado = ''cumplido'' and v_cuotas_completas < numero_cuotas then ''activo'' '
    || 'when estado = ''incumplido'' then ''activo''';

  v_def text; v_n1 int; v_n2 int; v_n3 int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  if position('when estado = ''incumplido'' then ''activo''' in v_def) > 0 then
    raise notice 'Ya estaba aplicada. No se hace nada.';
    return;
  end if;

  v_n1 := (length(v_def) - length(replace(v_def, v_a1_de, ''))) / length(v_a1_de);
  v_n2 := (length(v_def) - length(replace(v_def, v_a2_de, ''))) / length(v_a2_de);
  v_n3 := (length(v_def) - length(replace(v_def, v_a3_de, ''))) / length(v_a3_de);

  -- Las anclas aparecen DOS veces en la función viva (en el repo, una): el bloque que recalcula
  -- el convenio está duplicado — un camino para el pago que entra y otro para la reversa. Los dos
  -- hacen lo mismo, así que el arreglo va en ambos y `replace()` los cubre solos.
  -- Se exige que aparezcan al menos una vez y la MISMA cantidad de veces: si una apareciera 2 y
  -- otra 1, la función no sería la que creemos y hay que mirarla antes de tocarla.
  if v_n1 < 1 or v_n2 < 1 or v_n3 < 1 or v_n1 <> v_n2 or v_n2 <> v_n3 then
    raise exception 'La funcion no tiene la forma esperada (% / % / %). No se toco nada.', v_n1, v_n2, v_n3;
  end if;

  v_def := replace(v_def, v_a1_de, v_a1_a);
  v_def := replace(v_def, v_a2_de, v_a2_a);
  v_def := replace(v_def, v_a3_de, v_a3_a);

  execute v_def;
  raise notice 'Listo: un convenio incumplido vuelve a activo cuando el cliente retoma los pagos.';
end $$;
