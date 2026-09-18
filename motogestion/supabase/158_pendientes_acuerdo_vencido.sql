-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 158 — EL ACUERDO VENCIDO CUENTA EN EL SERVIDOR, Y EL QUE NO PAGA NADA SE VE (18-sep-2026)
--
-- Dos cosas sobre la misma vista `public.pendientes`, y ninguna la regenera.
--
-- 1) LA SÉPTIMA PUERTA CIEGA. El CTE `cartera` traía
--    `left join public.convenios cv on cv.contrato_id = c.id and cv.estado = 'activo'`.
--    De ese CTE salen la mora, la gabela, los plazos y —lo más grave— la RECOLECCIÓN. Y de ahí
--    come `zala.cuenta_contrato`, así que ZALA veía lo mismo. Resultado: a quien se le vencía el
--    acuerdo, el servidor dejaba de contárselo y no entraba a ninguna cola.
--    Es la regla del dueño, textual: "no deberían haber casos de incumplidos sin que el sistema
--    los mande a inmovilizar".
--
--    ⚠️ NO se cambió a `in ('activo','incumplido')` a secas. Ese join hoy devuelve como máximo una
--    fila porque el candado de la mig 050 solo permite un acuerdo ACTIVO por contrato; con los
--    incumplidos adentro, un contrato con uno de cada devolvería DOS filas y DUPLICARÍA todos sus
--    pendientes. Se elige UNO SOLO con el mismo orden que la app (`elegirConvenioPorCobrar`):
--    primero el activo; si no hay, el incumplido más viejo.
--    Se conserva el join a la TABLA (no un lateral) porque `zala.cuenta_contrato(c, cv, …)`
--    recibe `cv` como fila de tipo `public.convenios`.
--
-- 2) EL AVISO QUE NO EXISTÍA: `acuerdo_sin_pagos`. Medido el 17-sep: 60 acuerdos activos que no
--    han recibido UN SOLO PESO, algunos firmados hace dos meses. Nadie los cobró porque el sistema
--    nunca los puso en ninguna lista: ni campana, ni Mi Día, ni panel. El patrón: le recogen la
--    moto, paga los $30.000 de multa para llevársela, le hacen el acuerdo... y de ahí nada.
--    Sale a los 7 días de firmado (ya pasó al menos un día de pago) y con $0 abonado.
--
-- 🔑 SE PARCHA LA VISTA VIVA, NO SE REGENERA. Se lee con `pg_get_viewdef`, se reemplaza solo el
-- ancla y se le añade la rama nueva al final. Es la lección de la mig 124: regenerar desde un
-- archivo viejo borra lo que migraciones posteriores hayan agregado. Acá eso es imposible.
--
-- ESPEJO EN LA APP: `src/utils/convenioPorCobrar.ts`. Si se toca una, se toca la otra.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

do $mig$
declare
  v_def   text;
  v_ancla text := '(cv.contrato_id = c.id) AND (cv.estado = ''activo''::text)';
  v_nuevo text := '(cv.contrato_id = c.id) AND (cv.id = ( SELECT cv2.id FROM public.convenios cv2'
               || ' WHERE cv2.contrato_id = c.id AND cv2.estado = ANY (ARRAY[''activo''::text, ''incumplido''::text])'
               || ' ORDER BY CASE WHEN cv2.estado = ''activo''::text THEN 0 ELSE 1 END, cv2.created_at'
               || ' LIMIT 1))';
  v_rama  text;
  v_n     int;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('acuerdo_sin_pagos' in v_def) > 0 then
    raise notice '158: ya estaba aplicada. No se tocó nada.';
    return;
  end if;

  -- El ancla tiene que estar EXACTAMENTE una vez. Si no, la vista cambió y hay que mirarla antes.
  v_n := (length(v_def) - length(replace(v_def, v_ancla, ''))) / length(v_ancla);
  if v_n <> 1 then
    raise exception '158 ABORTADA: el ancla del join aparece % veces y se esperaba 1. NO se tocó nada.', v_n;
  end if;

  v_def := replace(v_def, v_ancla, v_nuevo);
  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  v_rama := $rama$
union all
select
  'acuerdo_seco:' || cv.id,
  'acuerdo_sin_pagos',
  'Acuerdo sin un solo peso — ' || cl.nombre,
  'Firmó hace ' || ((select d from h) - cv.created_at::date) || ' días por $'
    || replace(to_char(cv.deuda_total, 'FM999,999,999'), ',', '.')
    || ' y no ha entrado nada. '
    || case when cv.estado = 'incumplido'
            then 'Ya se venció el ' || to_char(cv.fecha_limite, 'DD/MM/YYYY') || ' sin pagarse.'
            else 'Vence el ' || to_char(cv.fecha_limite, 'DD/MM/YYYY') || '.' end,
  case when cv.estado = 'incumplido' then 'critico' else 'alerta' end,
  m.subadmin_id,
  case when m.subadmin_id is null then 'ADMIN' end,
  c.id, c.moto_id, c.cliente_id, m.placa,
  ((select d from h) - cv.created_at::date)::int,
  2,
  cv.deuda_total
from public.convenios cv
join public.contratos c on c.id = cv.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
where cv.estado in ('activo', 'incumplido')
  and c.estado in ('Activo', 'Suspendido')
  and cv.created_at::date <= (select d from h) - 7
  and coalesce((select sum(p.aplicado_convenio) from public.pagos p
                 where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado'
                   and p.created_at >= cv.created_at), 0) <= 0
$rama$;

  execute 'create or replace view public.pendientes with (security_invoker = true) as '
          || v_def || v_rama;
  raise notice '158: join arreglado y aviso `acuerdo_sin_pagos` agregado.';
end
$mig$;

comment on view public.pendientes is
  'Todo lo que hay que hacer hoy, calculado en el servidor: los 22 avisos con su dueño. NO guarda alertas, las deduce de los datos. El acuerdo VENCIDO cuenta igual que el activo (mig 158): se sigue cobrando y manda a inmovilizar. `monto` en los avisos de cobro es la CUOTA Y EL ACUERDO vencidos, no la deuda total. Ver docs/FLUJO-DIARIO.md.';

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from public.pendientes where tipo = 'acuerdo_sin_pagos')            as acuerdos_secos,
  (select round(coalesce(sum(monto), 0)) from public.pendientes
    where tipo = 'acuerdo_sin_pagos')                                                  as plata,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)                       as claves_duplicadas,
  (select count(distinct tipo) from public.pendientes)                                 as tipos_vivos,
  (select count(*) from public.pendientes
    where dueno_id is null and dueno_rol is null)                                      as sin_dueno;
-- Esperado: acuerdos_secos ≈ 60 · claves_duplicadas = 0 · tipos_vivos >= 16 · sin_dueno = 0
