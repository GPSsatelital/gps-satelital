-- ===== 083: la multa por ir a buscar la moto se cobra de PRIMERA =====
--
-- REGLA DEL DUEÑO (5-ago-2026): "a las motos que se les genere multa o recargo por buscar la
-- moto se le debe cobrar de primero antes que lo demás".
--
-- QUÉ PASABA: el motor bajaba las deudas de la más antigua a la más nueva. Mientras dura el
-- ajuste de cuentas conviven las deudas viejas metidas a mano (Excel) con las multas que el
-- sistema genera solo, y la vieja se llevaba la plata. Caso real: LIBINTO PATERNINA (XZT89H)
-- pagó $20.000 para recuperar su moto, se fueron a una deuda de "EXCEL VIEJO" de $880.000 y la
-- multa quedó intacta — así que el sistema seguía sin dejar entregarle la moto.
--
-- POR QUÉ ESTE SCRIPT NO TRAE LA FUNCIÓN ESCRITA:
-- La función viva en Supabase NO es igual a la del repo (la viva filtra `estado = 'pendiente'`
-- en los cobros; la del archivo 045 dice `estado <> 'pagada'` — un arreglo posterior que nunca
-- volvió al repo). Pegar la del archivo habría revertido eso en silencio. Así que el script LEE
-- la función de la propia base, cambia solo los `order by` y la vuelve a guardar. La lógica del
-- motor —250 líneas— no se transcribe, no se toca y no puede perderse en el camino.
--
-- SEGURO POR DISEÑO: antes de cambiar nada cuenta cuántos `order by created_at` hay. Si no son
-- exactamente los 5 esperados (3 de cobro + 2 de reversa), la función cambió desde que se
-- escribió esto y el script ABORTA sin modificar nada.
--
-- LO QUE NO CAMBIA: cuánta plata se aplica a deuda (eso lo decide el reparto, no el orden), ni
-- las cajas, ni el prorrateo, ni el convenio, ni el ahorro, ni la caja diaria. Solo cambia
-- CUÁL deuda se baja primero cuando hay varias.

do $$
declare
  v_def   text;
  v_todos int;
  v_desc  int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  v_todos := (length(v_def) - length(replace(v_def, 'order by created_at', '')))
             / length('order by created_at');
  v_desc  := (length(v_def) - length(replace(v_def, 'order by created_at desc', '')))
             / length('order by created_at desc');

  if v_todos <> 5 or v_desc <> 2 then
    raise exception 'La función cambió: se esperaban 5 "order by created_at" (2 de ellos "desc") y hay % (% desc). No se tocó nada — revisar a mano.', v_todos, v_desc;
  end if;

  -- 1) REVERSAS (rechazar o borrar un pago): el orden tiene que ser el INVERSO del de cobro,
  --    o la plata no vuelve a la deuda de la que salió. Si al cobrar la multa va primera, al
  --    devolver va de última.
  v_def := replace(
    v_def,
    'order by created_at desc',
    'order by (concepto = ''multa_recoleccion'') asc, created_at desc'
  );

  -- 2) COBROS: la multa de recolección primero; el resto por antigüedad, como siempre.
  --    (Los `desc` ya fueron reemplazados arriba, así que esto solo alcanza a los 3 de cobro.)
  v_def := replace(
    v_def,
    'order by created_at',
    'order by (concepto = ''multa_recoleccion'') desc, created_at'
  );

  execute v_def;
  raise notice 'aplicar_pago_confirmado(): la multa de recolección ahora se cobra de primera.';
end $$;
