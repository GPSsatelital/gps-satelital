-- ===== 086: con la moto RETENIDA, la multa se cobra antes que las cuotas =====
--
-- REGLA DEL DUEÑO: la multa por ir a buscar la moto es el mínimo obligatorio para recuperarla,
-- y se cobra de primero. La mig 083 la puso de primera ENTRE LAS DEUDAS, pero el reparto llega a
-- las deudas solo después de llenar las cuotas atrasadas — y una moto retenida por mora SIEMPRE
-- tiene cuotas atrasadas. Resultado: la plata nunca alcanzaba a llegar a la multa.
--
-- CASO REAL (5-ago-2026): JOSE ENRIQUE CHIRINOS (IEW50I) pagó $200.000 desde Cartera y el motor
-- los mandó completos a sus cuotas; su multa de $20.000 quedó intacta y el sistema siguió sin
-- dejar entregarle la moto. Las 16 motos retenidas por mora tenían la multa sin pagar: ninguna
-- se había podido cobrar salvo entrando por Inmovilizaciones, que sí manda el pago dirigido.
--
-- EL ARREGLO: si el contrato está Suspendido (moto retenida), lo primero que cubre el pago es la
-- multa; después sigue todo igual — prorrateo, cajas, demás deudas, convenio, saldo a favor.
-- Un cliente normal NO cambia: su cuota se sigue cobrando primero.
--
-- Son dos cambios, los dos en anclas de una sola línea:
--   1. Antes del prorrateo, un ciclo que cubre las multas pendientes cuando está suspendido.
--   2. `v_ap_deuda := v_monto - v_resto` pasa a SUMAR en vez de asignar — si no, el bloque de
--      deudas de más abajo pisaría lo que ya se abonó a la multa y el pago quedaría mal anotado.
--
-- MÉTODO (igual que 083/084/085): lee la función de la propia base y la reescribe. Si no
-- encuentra las anclas exactamente una vez cada una, ABORTA sin tocar nada. Y si ya estaba
-- aplicada, lo detecta y no hace nada.
--
-- LO QUE NO CAMBIA: cuánta plata entra (la misma), las cajas, el prorrateo, el ahorro, los
-- convenios, la caja diaria, ni el reparto de un contrato que NO esté suspendido.

do $$
declare
  v_a1_de constant text := 'if v_sin_reparto and v_monto > 0 then';
  v_a1_a  constant text :=
    'if v_sin_reparto and v_monto > 0 then '
    || 'if v_contrato.estado = ''Suspendido'' then '
    ||   'for v_d in select id, monto_pendiente from public.deudas '
    ||     'where contrato_id = v_row.contrato_id and estado = ''pendiente'' '
    ||     'and concepto = ''multa_recoleccion'' and monto_pendiente > 0 order by created_at '
    ||   'loop '
    ||     'exit when v_monto <= 0; '
    ||     'v_delta := least(v_monto, v_d.monto_pendiente); '
    ||     'update public.deudas set monto_pendiente = monto_pendiente - v_delta, '
    ||       'estado = case when monto_pendiente - v_delta <= 0 then ''pagada'' else estado end '
    ||       'where id = v_d.id; '
    ||     'v_ap_deuda := v_ap_deuda + v_delta; '
    ||     'v_monto := v_monto - v_delta; '
    ||   'end loop; '
    || 'end if;';

  -- El bloque de deudas ASIGNA en vez de sumar; con el abono de la multa hecho antes, eso lo
  -- borraría y el pago quedaría diciendo que abonó menos a deuda de lo que realmente abonó.
  v_a2_de constant text := 'v_ap_deuda := v_monto - v_resto;';
  v_a2_a  constant text := 'v_ap_deuda := v_ap_deuda + (v_monto - v_resto);';

  v_def text; v_n1 int; v_n2 int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  if position('concepto = ''multa_recoleccion'' and monto_pendiente > 0 order by created_at' in v_def) > 0 then
    raise notice 'Ya estaba aplicada. No se hace nada.';
    return;
  end if;

  v_n1 := (length(v_def) - length(replace(v_def, v_a1_de, ''))) / length(v_a1_de);
  v_n2 := (length(v_def) - length(replace(v_def, v_a2_de, ''))) / length(v_a2_de);

  if v_n1 <> 1 or v_n2 <> 1 then
    raise exception 'La función no tiene la forma esperada (% y %). No se tocó nada.', v_n1, v_n2;
  end if;

  v_def := replace(v_def, v_a1_de, v_a1_a);
  v_def := replace(v_def, v_a2_de, v_a2_a);

  execute v_def;
  raise notice 'Listo: con la moto retenida, la multa se cubre antes que las cuotas.';
end $$;
