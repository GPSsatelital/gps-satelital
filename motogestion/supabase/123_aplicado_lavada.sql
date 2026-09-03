-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 123 — LA LAVADA SE COBRA DETRÁS DE LA MULTA Y SALE APARTE EN LA CAJA (3-sep-2026)
--
-- PEDIDO DEL DUEÑO (2-sep): la lavada de $15.000 que nace al recibir la moto (mig 122) debe
-- cobrarse "de primera junto con la multa" y verse separada en la caja diaria, como hoy se ven
-- las multas de recolección.
--
-- CÓMO ESTABA: la lavada es una deuda más (concepto `lavada`, mig 095). El motor cobra las
-- deudas así: multa de recolección primero, después las demás de la MÁS ANTIGUA a la más nueva.
-- Como la lavada nace el día en que se recibe la moto, siempre era la más nueva: esperaba detrás
-- de cualquier deuda vieja del Excel. Y la caja no podía separarla porque el pago solo anota
-- "tanto fue a deudas", sin decir a cuál.
--
-- QUÉ CAMBIA (6 retoques, todos en el orden de las DEUDAS; nada más se mueve):
--   1) Orden al cobrar:   multa → LAVADA → las demás por antigüedad        (3 sitios)
--   2) Orden al anular:   el inverso exacto — demás → lavada → multa       (2 sitios)
--   3) Moto retenida:     hoy la multa se cobra ANTES que la semana para que recupere la moto
--      rápido; la lavada va en ese mismo grupo, detrás de la multa (decisión del dueño, 3-sep:
--      "la moto se lavó porque se recogió, es un costo de la retención igual que la multa").
--   4) Anotar cuánto fue a lavada: `pagos.aplicado_lavada`, solo informativo, calculado igual
--      que `aplicado_multa` (mig 085) — y funciona SOLO porque la lavada va segunda:
--          lavada = min( aplicado_deuda − aplicado_multa , lavada que debía ANTES de repartir )
--
-- LO QUE NO CAMBIA: cajas, prorrateo, convenio, saldo a favor, ahorro, el orden
-- cuota → deuda → convenio, ni la caja diaria (solo LEE la columna nueva).
-- SIN recálculo hacia atrás: las lavadas cobradas antes de hoy se pagaron con el orden viejo;
-- inventarles una cifra sería mentir en cajas ya cerradas.
--
-- MÉTODO (igual que 083/084/085): el script LEE la función viva de la base y reemplaza
-- anclas de una sola línea, contando que cada una aparece EXACTAMENTE las veces esperadas.
-- Si algo no cuadra, ABORTA sin tocar nada. La función viva es la de la mig 119 (nada la tocó
-- después: 120 nómina, 121 RLS, 122 columnas).
--
-- ESPEJO: `src/utils/repartoPago.ts` (`ordenarDeudasReparto`, `separarMultaYLavada`, y el paso 0
-- de contrato suspendido). 🔴 Si se toca uno hay que tocar el otro.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.pagos
  add column if not exists aplicado_lavada numeric not null default 0;

comment on column public.pagos.aplicado_lavada is
  'De lo que este pago aplicó a deudas, cuánto fue a la lavada del vehículo (concepto lavada). Solo informativo; la caja lo lee para mostrarlo aparte (mig 123).';

do $$
declare
  -- 1 declaración
  v_a1_de constant text := 'v_sin_reparto boolean; v_multa_antes numeric;';
  v_a1_a  constant text := 'v_sin_reparto boolean; v_multa_antes numeric; v_lavada_antes numeric;';

  -- 1 foto de la lavada pendiente ANTES de repartir (justo después de la foto de la multa)
  v_a2_de constant text := 'and concepto = ''multa_recoleccion'';';
  v_a2_a  constant text := 'and concepto = ''multa_recoleccion''; '
                        || 'select coalesce(sum(monto_pendiente), 0) into v_lavada_antes from public.deudas '
                        || 'where contrato_id = v_row.contrato_id and estado = ''pendiente'' '
                        || 'and concepto = ''lavada'';';

  -- 3 recorridos al COBRAR deudas (motor v2 · pago que ya trae reparto · motor v1)
  v_a3_de constant text := 'order by (concepto = ''multa_recoleccion'') desc, created_at';
  v_a3_a  constant text := 'order by (concepto = ''multa_recoleccion'') desc, (concepto = ''lavada'') desc, created_at';

  -- 2 recorridos al ANULAR (reversa v2 · reversa v1): el inverso exacto
  v_a4_de constant text := 'order by (concepto = ''multa_recoleccion'') asc, created_at desc';
  v_a4_a  constant text := 'order by (concepto = ''multa_recoleccion'') asc, (concepto = ''lavada'') asc, created_at desc';

  -- 1 paso previo con el contrato SUSPENDIDO (moto retenida): multa y lavada antes que la semana
  v_a5_de constant text := 'and concepto = ''multa_recoleccion'' and monto_pendiente > 0 order by created_at loop';
  v_a5_a  constant text := 'and concepto in (''multa_recoleccion'', ''lavada'') and monto_pendiente > 0 '
                        || 'order by (concepto = ''multa_recoleccion'') desc, created_at loop';

  -- 4 salidas de la función: anotar la lavada al lado de la multa
  v_a6_de constant text := 'set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)) where id = v_row.id;';
  v_a6_a  constant text := 'set aplicado_multa = least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)), '
                        || 'aplicado_lavada = least(greatest(coalesce(aplicado_deuda, 0) - least(coalesce(aplicado_deuda, 0), coalesce(v_multa_antes, 0)), 0), coalesce(v_lavada_antes, 0)) '
                        || 'where id = v_row.id;';

  v_def text;
  v_n1 int; v_n2 int; v_n3 int; v_n4 int; v_n5 int; v_n6 int;
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado';

  if v_def is null then
    raise exception 'No existe public.aplicar_pago_confirmado() — nada que hacer.';
  end if;

  if position('v_lavada_antes' in v_def) > 0 then
    raise notice 'Ya estaba aplicada (se encontró v_lavada_antes). No se hace nada.';
    return;
  end if;

  v_n1 := (length(v_def) - length(replace(v_def, v_a1_de, ''))) / length(v_a1_de);
  v_n2 := (length(v_def) - length(replace(v_def, v_a2_de, ''))) / length(v_a2_de);
  v_n3 := (length(v_def) - length(replace(v_def, v_a3_de, ''))) / length(v_a3_de);
  v_n4 := (length(v_def) - length(replace(v_def, v_a4_de, ''))) / length(v_a4_de);
  v_n5 := (length(v_def) - length(replace(v_def, v_a5_de, ''))) / length(v_a5_de);
  v_n6 := (length(v_def) - length(replace(v_def, v_a6_de, ''))) / length(v_a6_de);

  if v_n1 <> 1 or v_n2 <> 1 or v_n3 <> 3 or v_n4 <> 2 or v_n5 <> 1 or v_n6 <> 4 then
    raise exception 'La función no tiene la forma esperada (decl %, foto %, cobrar %, anular %, suspendido %, salidas %). No se tocó nada.',
      v_n1, v_n2, v_n3, v_n4, v_n5, v_n6;
  end if;

  v_def := replace(v_def, v_a1_de, v_a1_a);   -- variable nueva
  v_def := replace(v_def, v_a2_de, v_a2_a);   -- foto de la lavada ANTES de repartir
  v_def := replace(v_def, v_a3_de, v_a3_a);   -- cobrar: multa → lavada → demás
  v_def := replace(v_def, v_a4_de, v_a4_a);   -- anular: demás → lavada → multa
  v_def := replace(v_def, v_a5_de, v_a5_a);   -- retenida: multa y lavada antes que la semana
  v_def := replace(v_def, v_a6_de, v_a6_a);   -- anotar la lavada al salir

  execute v_def;
  raise notice 'Listo: la lavada se cobra detrás de la multa y cada pago anota cuánto fue a lavada.';
end $$;

-- ─── Verificación (no cambia nada; solo mira) ───────────────────────────────────────────────
-- 1) La columna existe.
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'pagos' and column_name = 'aplicado_lavada';
-- Debe dar 1 fila: aplicado_lavada numeric 0

-- 2) La función viva quedó con los 6 retoques.
select
  (length(d) - length(replace(d, '(concepto = ''lavada'') desc', ''))) / length('(concepto = ''lavada'') desc') as cobrar_debe_ser_3,
  (length(d) - length(replace(d, '(concepto = ''lavada'') asc', '')))  / length('(concepto = ''lavada'') asc')  as anular_debe_ser_2,
  (length(d) - length(replace(d, 'aplicado_lavada = least', '')))     / length('aplicado_lavada = least')     as salidas_debe_ser_4,
  (length(d) - length(replace(d, 'concepto in (''multa_recoleccion'', ''lavada'')', ''))) / length('concepto in (''multa_recoleccion'', ''lavada'')') as retenida_debe_ser_1
from (select pg_get_functiondef(p.oid) as d
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'aplicar_pago_confirmado') f;
