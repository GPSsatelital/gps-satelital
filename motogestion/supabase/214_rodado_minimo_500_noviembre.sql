-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 214 — EL MÍNIMO PARA RODAR POR DEUDA BAJA A $500.000 HASTA EL 30 DE NOVIEMBRE (D-064)
--        (5-nov-2026; pedido del dueño: «baja el límite de 700 a 500 por este mes» · «Sí, así»)
--
-- QUÉ CAMBIA: hasta el 30-nov-2026 se puede rodar a quien deba más de $500.000, en las dos formas
-- («Solo lo atrasado» y «Rodar todo»). El 1-dic vuelve SOLA a $700.000: ese día no hay que correr nada.
--
-- CÓMO: una función nueva, `public.rodado_minimo()`, dice el mínimo según el día (fecha de Colombia,
-- `zala.hoy()`). Las dos cuentas la leen en vez del 700000 escrito a mano. Se lee cada función VIVA y
-- se le cambian dos pedazos; si alguno no aparece exactamente una vez, ABORTA sin tocar nada.
-- Espejo en la app: `minimoRodado()` en `src/utils/rodadoPorDeuda.ts` (el botón de Contratos y el
-- permiso en Usuarios dicen el mínimo del día). Si se cambia una, se cambia la otra.
--
-- QUÉ NO CAMBIA: las cifras, las semanas, el recargo, el pedazo de $100.000, las demás razones para no
-- rodar, y `aplicar_rodado_por_deuda` (vuelve a hacer la cuenta con el mismo mínimo).
-- Sin tablas nuevas ni temporales: no sale el aviso de RLS del editor.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create or replace function public.rodado_minimo()
returns numeric language sql stable set search_path = public as $$
  select case when zala.hoy() <= date '2026-11-30' then 500000::numeric else 700000::numeric end
$$;
comment on function public.rodado_minimo() is
  'D-064 (mig 214): lo mínimo que debe un cliente para rodarle la deuda. $500.000 hasta el 30-nov-2026; desde el 1-dic, $700.000. Espejo: minimoRodado() en la app.';
revoke all on function public.rodado_minimo() from public, anon;
grant execute on function public.rodado_minimo() to authenticated;

do $$
declare
  v_def text;
  -- «Rodar todo»
  t1_de constant text := 'c_minimo constant numeric := 700000;';
  t1_a  constant text := 'c_minimo constant numeric := public.rodado_minimo();';
  t2_de constant text := '''Debe %s en total: el rodado es para quien debe más de $700.000.'', zala.pesos(v_debe_todo)';
  t2_a  constant text := '''Debe %s en total: el rodado es para quien debe más de %s.'', zala.pesos(v_debe_todo), zala.pesos(c_minimo)';
  -- «Solo lo atrasado»
  s1_de constant text := 'if coalesce(z.debe_hoy, 0) <= 700000 then';
  s1_a  constant text := 'if coalesce(z.debe_hoy, 0) <= public.rodado_minimo() then';
  s2_de constant text := '''Debe %s: el rodado es para quien debe más de $700.000.'', zala.pesos(coalesce(z.debe_hoy, 0))';
  s2_a  constant text := '''Debe %s: el rodado es para quien debe más de %s.'', zala.pesos(coalesce(z.debe_hoy, 0)), zala.pesos(public.rodado_minimo())';
begin
  v_def := pg_get_functiondef('public._calcular_rodado_todo(uuid)'::regprocedure);
  if (length(v_def) - length(replace(v_def, t1_de, ''))) / length(t1_de) <> 1
     or (length(v_def) - length(replace(v_def, t2_de, ''))) / length(t2_de) <> 1 then
    raise exception 'La cuenta de rodar todo no es la esperada. No se toco nada.';
  end if;
  execute replace(replace(v_def, t1_de, t1_a), t2_de, t2_a);

  v_def := pg_get_functiondef('public._calcular_rodado_por_deuda(uuid)'::regprocedure);
  if (length(v_def) - length(replace(v_def, s1_de, ''))) / length(s1_de) <> 1
     or (length(v_def) - length(replace(v_def, s2_de, ''))) / length(s2_de) <> 1 then
    raise exception 'La cuenta de rodar lo atrasado no es la esperada. No se toco nada.';
  end if;
  execute replace(replace(v_def, s1_de, s1_a), s2_de, s2_a);
end $$;

-- La prueba: el mínimo de hoy es $500.000 y las dos cuentas corren sin error con una muestra.
do $prueba$
declare r record; v jsonb; n int := 0;
begin
  if public.rodado_minimo() <> 500000 then
    raise exception 'El minimo de hoy no dio 500000. No se guardo nada.';
  end if;
  for r in select z.contrato_id from zala.cliente z where z.contrato_estado = 'Activo' order by z.debe_hoy desc nulls last limit 5 loop
    v := public._calcular_rodado_por_deuda(r.contrato_id);
    v := public._calcular_rodado_todo(r.contrato_id);
    n := n + 1;
  end loop;
  if n = 0 then raise exception 'La prueba no encontro contratos. No se guardo nada.'; end if;
end
$prueba$;

select public.registrar_migracion(214, '214_rodado_minimo_500_noviembre.sql',
  'Rodar por deuda: el mínimo baja a $500.000 hasta el 30-nov-2026 (D-064); el 1-dic vuelve solo a $700.000');

commit;

-- Debe dar: $ 500.000
select zala.pesos(public.rodado_minimo()) as minimo_hoy;
