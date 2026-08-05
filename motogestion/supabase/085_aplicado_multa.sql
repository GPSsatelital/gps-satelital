-- ===== 085: anotar cuánto de cada pago fue a una multa de recolección =====
--
-- PEDIDO DEL DUEÑO (5-ago-2026): ver en la caja diaria, aparte, los ingresos por multas de
-- inmovilización. Hoy no se puede: el sistema anota "$20.000 fueron a deuda" pero no dice a
-- CUÁL deuda, así que la multa no se puede separar de una deuda vieja del Excel.
--
-- CÓMO SE CALCULA, SIN TOCAR EL REPARTO:
-- Desde la mig 083 la multa se cobra SIEMPRE de primera entre las deudas. Entonces la parte de
-- un pago que fue a multa es, exactamente:
--       min( lo que el pago aplicó a deuda , lo que se debía de multa ANTES de repartir )
-- Solo hace falta una foto del saldo de multa al entrar, y anotar el resultado al salir. Los
-- ciclos que reparten la plata —la parte delicada del motor— NO se tocan.
--
-- MÉTODO (igual que 083 y 084): el script LEE la función de la propia base y le inserta tres
-- líneas en anclas de una sola línea. Si alguna no aparece las veces esperadas, ABORTA sin tocar
-- nada. La función viva no es igual a la del repo, así que transcribirla la rompería.
--
-- LO QUE NO CAMBIA: cuánta plata va a cada cosa, el orden en que se paga, las cajas, el
-- prorrateo, el ahorro, los convenios ni la caja diaria. `aplicado_multa` es un dato NUEVO que
-- solo se lee para informar; nada de lo que ya existía depende de él.

alter table public.pagos
  add column if not exists aplicado_multa numeric not null default 0;

comment on column public.pagos.aplicado_multa is
  'De lo que este pago aplicó a deudas, cuánto fue a una multa de recolección. Solo informativo.';

do $$
declare
  -- Anclas: todas de una sola línea, para no depender de saltos de línea ni de la indentación.
  v_a1_de constant text := 'v_sin_reparto boolean;';
  v_a1_a  constant text := 'v_sin_reparto boolean; v_multa_antes numeric;';

  v_a2_de constant text := 'select * into v_contrato from public.contratos where id = v_row.contrato_id;';
  v_a2_a  constant text := 'select * into v_contrato from public.contratos where id = v_row.contrato_id; '
                        || 'select coalesce(sum(monto_pendiente), 0) into v_multa_antes from public.deudas '
                        || 'where contrato_id = v_row.contrato_id and estado = ''pendiente'' '
                        || 'and concepto = ''multa_recoleccion'';';

  v_a3_de constant text := 'if tg_op = ''DELETE'' then return old; else return new; end if;';
  v_a3_a  constant text := 'if v_pasa_a_confirmado then update public.pagos set aplicado_multa = '
                        || 'least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id; end if; '
                        || 'if tg_op = ''DELETE'' then return old; else return new; end if;';

  v_def text;
  v_n1 int; v_n2 int; v_n3 int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  if position(v_a1_a in v_def) > 0 then
    raise notice 'Ya estaba aplicada (se encontró v_multa_antes). No se hace nada.';
    return;
  end if;

  v_n1 := (length(v_def) - length(replace(v_def, v_a1_de, ''))) / length(v_a1_de);
  v_n2 := (length(v_def) - length(replace(v_def, v_a2_de, ''))) / length(v_a2_de);
  v_n3 := (length(v_def) - length(replace(v_def, v_a3_de, ''))) / length(v_a3_de);

  -- 1 declaración · 1 lectura del contrato · 4 salidas de la función.
  if v_n1 <> 1 or v_n2 <> 1 or v_n3 <> 4 then
    raise exception 'La función no tiene la forma esperada (% declaración, % lectura, % salidas). No se tocó nada.', v_n1, v_n2, v_n3;
  end if;

  v_def := replace(v_def, v_a1_de, v_a1_a);   -- variable nueva
  v_def := replace(v_def, v_a2_de, v_a2_a);   -- foto de la multa ANTES de repartir
  v_def := replace(v_def, v_a3_de, v_a3_a);   -- anotar al salir (solo si el pago se confirmó)

  execute v_def;
  raise notice 'Listo: cada pago confirmado anota cuánto fue a multa de recolección.';
end $$;
