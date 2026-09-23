-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 167 — UNA FILA DE SALDO QUE NO APLICÓ NADA NO PUEDE TRABAR LA PLATA (23-sep-2026)
--
-- EL CASO — LUIS ALEJANDRO GUTIERREZ (IEW57I). El dueño pidió revisar sus cuentas: cuadraban al
-- peso. Le dio a "Aplicar saldo a favor" por sus $59.000 y salió *"solo quedan $0 disponibles"*.
-- Llevaba **8 días** con la plata trabada y la pantalla mostrándosela. RAFAEL ARNEDO (DPU52I)
-- llevaba 1 día con $100.000 igual. Eran los 2 únicos de 148 movimientos de saldo en la flota.
--
-- ── POR QUÉ PASABA ──────────────────────────────────────────────────────────────────────────
-- `aplicarSaldoFavor` trabaja en DOS TIEMPOS: crea el movimiento (el motor lo reparte) y después
-- le escribe cuánto consumió. El candado de la mig 160 protege esos segundos contando las filas
-- "en vuelo" por su **valor completo** — correcto, porque en ese rato todavía no se sabe qué
-- consumieron.
--
-- Pero cuando el cliente **no debe nada**, el motor no tiene dónde meter la plata y devuelve todo:
--     nuevoSaldo = excedente − restante = 110.000 − 110.000 = 0
-- La fila termina bien, con consumo CERO… y queda idéntica a una que va en camino. El candado le
-- descontaba $110.000 que nunca salieron:
--       $59.000 (lo que sus pagos dejaron)  −  $110.000 (la fila vacía)  =  −$51.000 → "$0"
--
-- ── EL ARREGLO, Y POR QUÉ ES EXACTO Y NO UNA CORAZONADA ─────────────────────────────────────
-- Las dos situaciones SÍ se distinguen, solo que el candado no miraba el dato bueno:
--    · va en camino  → el motor YA llenó algo (tarifa / prorrateo / deuda / convenio / base)
--    · no aplicó nada → los cinco campos en cero
-- Una fila solo se vuelve visible para otra sesión DESPUÉS de que su trigger AFTER corrió, así
-- que "los cinco en cero" significa siempre "el motor no tuvo dónde meterlo". No existe el caso
-- de una fila que haya gastado saldo y muestre los cinco en cero.
--
-- 🔑 LO QUE **NO** SE TOCA: el motor, el orden de aplicación, la mig 166, la caja diaria, y la
-- protección de YERLIS — una fila que sí llenó algo se sigue contando por su valor, igual que hoy.
--
-- 🔑 SE PARCHA LA FUNCIÓN VIVA con `pg_get_functiondef`, nunca se regenera del archivo de la 160
-- (lección de la mig 124). Aborta sola si el ancla no está donde se espera.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) EL CANDADO: que no descuente lo que no se gastó ──────────────────────────────────────
do $mig$
declare
  v_def   text;
  v_resto text;
  v_i     int;
  v_n     int;
  v_ancla text := 'select sum(p.valor) from public.pagos p';
  v_vieja text := 'coalesce(p.aplicado_saldo_favor, 0) >= 0';
  v_nueva text;
begin
  v_def := pg_get_functiondef('public.enforce_saldo_favor_disponible()'::regprocedure);

  if position('aplicado_base_inicial' in v_def) > 0 then
    raise notice '167: el candado ya estaba parchado. No se tocó.';
    return;
  end if;

  v_i := position(v_ancla in v_def);
  if v_i = 0 then
    raise exception '167 ABORTADA: no encontré el subselect de "en vuelo" en el candado VIVO. ¿Se corrió la mig 160?';
  end if;

  v_resto := substr(v_def, v_i);

  v_n := (length(v_resto) - length(replace(v_resto, v_vieja, ''))) / length(v_vieja);
  if v_n <> 1 then
    raise exception '167 ABORTADA: esperaba 1 condición para parchar dentro del subselect y encontré %. No se tocó nada.', v_n;
  end if;

  v_nueva := v_vieja
    || E'\n              -- mig 167: si el motor NO aplicó nada, esta fila no consumió saldo.'
    || E'\n              and ( coalesce(p.aplicado_tarifa,0)  + coalesce(p.aplicado_prorrateo,0)'
    || E'\n                  + coalesce(p.aplicado_deuda,0)   + coalesce(p.aplicado_convenio,0)'
    || E'\n                  + coalesce(p.aplicado_base_inicial,0) ) > 0';

  v_def := left(v_def, v_i - 1) || replace(v_resto, v_vieja, v_nueva);

  execute v_def;
  raise notice '167: listo — el candado ya no descuenta filas donde el motor no aplicó nada.';
end
$mig$;

-- ── 2) EL CHEQUEO #6: que una fila vacía se avise al otro día, no a los ocho ─────────────────
-- Ya no traba plata (punto 1), pero sigue siendo una fila que no significa nada y la señal de que
-- el freno de la pantalla falló. Nivel `alerta`, no `critico`: el ruido es lo que hizo que 431
-- avisos taparan 20 SOAT vencidos.
do $mig$
declare
  v_def  text;
  v_rama text;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('saldo_favor_atascado' in v_def) > 0 then
    raise notice '167: el chequeo #6 ya estaba. No se tocó.';
    return;
  end if;

  if position('reparto_descuadrado' in v_def) = 0 then
    raise exception '167 ABORTADA: falta la revisión de coherencia de la mig 165. Correrla primero.';
  end if;

  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  v_rama := $rama$
union all
-- ⑥ MOVIMIENTO DE SALDO A FAVOR QUE NO APLICÓ NADA ───────────────────────────────────────────
select
  'saldo_atascado:' || p.id,
  'saldo_favor_atascado',
  'Saldo a favor sin aplicar — ' || cl.nombre,
  'El ' || to_char(p.created_at, 'DD/MM/YYYY') || ' se mandó a aplicar $'
    || replace(to_char(p.valor, 'FM999,999,999'), ',', '.')
    || ' de saldo a favor y no cubrió nada: en ese momento no debía nada. Su plata sigue guardada '
    || 'y disponible; este movimiento sobra y hay que quitarlo.',
  'alerta',
  null::uuid,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  (current_date - p.created_at::date)::int,
  2,
  p.valor::numeric
from public.pagos p
join public.contratos c  on c.id  = p.contrato_id
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
where p.estado = 'Confirmado'
  and p.tipo_registro = 'saldo_favor'
  and coalesce(p.aplicado_saldo_favor, 0) >= 0
  and ( coalesce(p.aplicado_tarifa,0)  + coalesce(p.aplicado_prorrateo,0)
      + coalesce(p.aplicado_deuda,0)   + coalesce(p.aplicado_convenio,0)
      + coalesce(p.aplicado_base_inicial,0) ) = 0
  -- Las de hace un rato pueden ir legítimamente en camino: no son atascadas todavía.
  and p.created_at < now() - interval '10 minutes'
$rama$;

  execute 'create or replace view public.pendientes with (security_invoker = true) as ' || v_def || v_rama;
  raise notice '167: chequeo #6 agregado (saldo_favor_atascado).';
end
$mig$;

commit;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  -- El candado tiene que mirar lo que el motor aplicó
  (select case when position('aplicado_base_inicial' in
            pg_get_functiondef('public.enforce_saldo_favor_disponible()'::regprocedure)) > 0
          then 1 else 0 end)                                                as candado_parchado,
  -- Y en TODA la flota, lo disponible tiene que coincidir con el saldo que muestra la pantalla
  (select count(*) from public.contratos c
    where public.saldo_favor_actual(c.id) <> greatest(
            coalesce(c.saldo_favor_apertura,0)
            + coalesce((select sum(p.aplicado_saldo_favor) from public.pagos p
                         where p.contrato_id = c.id and p.estado = 'Confirmado'
                           and not (p.tipo_registro = 'saldo_favor'
                                    and coalesce(p.aplicado_saldo_favor,0) >= 0)),0)
            - coalesce((select sum(p.valor) from public.pagos p
                         where p.contrato_id = c.id and p.estado = 'Confirmado'
                           and p.tipo_registro = 'saldo_favor'
                           and coalesce(p.aplicado_saldo_favor,0) >= 0
                           and ( coalesce(p.aplicado_tarifa,0)  + coalesce(p.aplicado_prorrateo,0)
                               + coalesce(p.aplicado_deuda,0)   + coalesce(p.aplicado_convenio,0)
                               + coalesce(p.aplicado_base_inicial,0) ) > 0),0)
          ,0)
      and public.saldo_favor_actual(c.id) > 0)                              as contratos_con_saldo_trabado,
  -- El chequeo #6 existe y la vista sigue sana
  (select count(*) from public.pendientes where tipo = 'saldo_favor_atascado') as filas_vacias_hoy,
  (select count(*) from public.pendientes)                                  as total_avisos,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)            as claves_duplicadas;
-- Esperado: candado_parchado = 1 · contratos_con_saldo_trabado = 0 · filas_vacias_hoy = 0
--           claves_duplicadas = 0 · total_avisos ≈ 363
