-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 213 — «RODAR TODO»: «DEBE EN TOTAL» SUMA SIEMPRE LO QUE LE FALTA AL ACUERDO
--        (5-nov-2026; aprobado por el dueño: «sí» a la propuesta del 5-nov)
--
-- LO QUE PASABA: con el acuerdo SIN lista de lo que financia (partitura) o INCUMPLIDO, la ventana de
-- «Rodar todo» decía «Debe en total» de menos. La cuenta le quitaba las cuotas vencidas del acuerdo
-- (para no contarlas dos veces) pero no le sumaba lo que le falta al acuerdo entero: `v_conv_falta`
-- solo se llenaba cuando el acuerdo se podía rodar. Medido el 5-nov: 31 contratos. Ej.: RML44H
-- (LUIS ARMANDO) decía $530.000 y debe $2.119.000, con el aviso falso de «debe menos de $700.000».
--
-- LO QUE NO PASÓ: nadie quedó mal rodado. A esos contratos la ventana les muestra en rojo por qué no
-- se puede, y `aplicar_rodado_por_deuda` vuelve a hacer la cuenta y no deja.
--
-- QUÉ HACE: lee la función VIVA `_calcular_rodado_todo` (no la copia de la mig 201) y le agrega UNA
-- línea: lo que le falta al acuerdo se cuenta apenas se lee el acuerdo. Si no encuentra la línea de
-- referencia exactamente una vez, ABORTA sin tocar nada. Los avisos en rojo se quedan: con el
-- acuerdo sin lista o incumplido todavía no se puede rodar todo.
--
-- LA PRUEBA VA ADENTRO (todo o nada): a los contratos con el acuerdo sin lista o incumplido, «Debe en
-- total» tiene que dar exacto y seguir sin poderse rodar todo; a una muestra de los demás, la cuenta
-- tiene que dar IDÉNTICA antes y después. Si algo no da, no se guarda nada.
--
-- QUÉ NO TOCA: el rodado de siempre (`_calcular_rodado_por_deuda`), `aplicar_rodado_por_deuda`,
-- pagos, Cartera, ZALA. Es una cuenta que solo lee: no mueve plata de nadie.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) La foto de ANTES de una muestra que NO debe cambiar (acuerdo activo y con su lista) ─────
create temp table _mig213_antes on commit drop as
select x.contrato_id, x.placa, public._calcular_rodado_todo(x.contrato_id) as v
  from (select z.contrato_id, z.placa
          from zala.cliente z join public.convenios cv on cv.id = z.convenio_id
         where cv.estado = 'activo'
           and (case when jsonb_typeof(cv.partitura) = 'array' then jsonb_array_length(cv.partitura) else 0 end) > 0
         order by z.debe_hoy desc nulls last
         limit 8) x;

-- ── 2) El arreglo: la función VIVA, con una sola línea más ────────────────────────────────────
do $$
declare
  v_def text;
  v_n   int;
  v_de  constant text := 'select * into cv from public.convenios where id = z.convenio_id;';
  v_a   constant text := 'select * into cv from public.convenios where id = z.convenio_id;'
    || E'\n    -- mig 213: lo que le falta al acuerdo entero se cuenta siempre, aunque el acuerdo no se pueda rodar'
    || E'\n    v_conv_falta := greatest(cv.deuda_total - coalesce(z.convenio_abonado, 0), 0);';
begin
  v_def := pg_get_functiondef('public._calcular_rodado_todo(uuid)'::regprocedure);
  v_n := (length(v_def) - length(replace(v_def, v_de, ''))) / length(v_de);
  if v_n <> 1 then
    raise exception 'La cuenta de rodar todo no es la esperada (la linea de referencia aparece % veces). No se toco nada.', v_n;
  end if;
  execute replace(v_def, v_de, v_a);
end $$;

-- ── 3) La prueba ─────────────────────────────────────────────────────────────────────────────
do $prueba$
declare
  r record; v jsonb;
  n_iguales int := 0; n_corregidos int := 0; n_sin_cuenta int := 0;
begin
  -- a) La muestra que no debe cambiar: idéntica, peso por peso
  for r in select * from _mig213_antes loop
    v := public._calcular_rodado_todo(r.contrato_id);
    if v is distinct from r.v then
      raise exception '% cambio y no debia cambiar (su acuerdo esta activo y con lista). No se guardo nada.', r.placa;
    end if;
    n_iguales := n_iguales + 1;
  end loop;

  -- b) Los del arreglo: acuerdo sin lista o incumplido
  for r in select z.contrato_id, z.placa,
                  coalesce(z.debe_hoy, 0) - coalesce(z.acuerdo_falta, 0)
                    + greatest(cv.deuda_total - coalesce(z.convenio_abonado, 0), 0) as esperado
             from zala.cliente z join public.convenios cv on cv.id = z.convenio_id
            where cv.estado <> 'activo'
               or (case when jsonb_typeof(cv.partitura) = 'array' then jsonb_array_length(cv.partitura) else 0 end) = 0 loop
    v := public._calcular_rodado_todo(r.contrato_id);
    if not (v ? 'debe_todo') then
      n_sin_cuenta := n_sin_cuenta + 1;   -- la app no le lleva la cuenta por semanas: la ventana no muestra cifras
      continue;
    end if;
    if (v->>'debe_todo')::numeric is distinct from r.esperado then
      raise exception '%: Debe en total da % y tenia que dar %. No se guardo nada.', r.placa, v->>'debe_todo', r.esperado;
    end if;
    if coalesce((v->>'puede')::boolean, false) then
      raise exception '%: quedo como que se puede rodar todo, y con el acuerdo sin lista o incumplido no se puede. No se guardo nada.', r.placa;
    end if;
    n_corregidos := n_corregidos + 1;
  end loop;

  if n_iguales = 0 or n_corregidos = 0 then
    raise exception 'La prueba no encontro contratos para comparar (iguales %, corregidos %). No se guardo nada.', n_iguales, n_corregidos;
  end if;
  perform set_config('mig213.prueba',
    format('%s sin cambio (como debia) · %s con la cifra completa · %s sin cuenta por semanas', n_iguales, n_corregidos, n_sin_cuenta), false);
end
$prueba$;

select public.registrar_migracion(213, '213_rodar_todo_suma_el_acuerdo.sql',
  '«Rodar todo»: «Debe en total» suma siempre lo que le falta al acuerdo, también con el acuerdo sin lista o incumplido');

commit;

-- ── RESULTADO (sale en la tabla de abajo) ──────────────────────────────────────────────────────
-- Debe dar: «8 sin cambio (como debia) · N con la cifra completa · …» · LUIS (RML44H): $2.119.000 si
-- no ha pagado desde la mañana del 5-nov · se_puede: false (su acuerdo sigue sin lista).
select current_setting('mig213.prueba', true) as prueba,
       zala.pesos((v->>'debe_todo')::numeric) as luis_debe_en_total,
       v->>'puede' as luis_se_puede_rodar_todo
  from zala.cliente z
 cross join lateral (select public._calcular_rodado_todo(z.contrato_id) as v) x
 where z.placa = 'RML44H';
