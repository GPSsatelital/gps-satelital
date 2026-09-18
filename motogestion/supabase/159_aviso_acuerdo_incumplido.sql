-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 159 — EL ACUERDO ROTO DICE DE DÓNDE SALIÓ LA PLATA (18-sep-2026)
--
-- Cierra la última pieza de la regla del dueño (17-sep), textual:
--   "si está incumplido todo lo que quede debiendo que le salga como saldo en mora normal
--    y que quede demarcado de dónde salió y detalles".
--
-- La primera mitad —"que salga como mora normal"— la resolvió la mig 158: al destapar el join
-- ciego del CTE `cartera`, los acuerdos vencidos volvieron a pesar en la mora. Verificado el
-- 18-sep: de los 5 incumplidos con la moto rodando, los 5 aparecieron en mora o recolección.
-- Antes NO estaban en ninguna lista.
--
-- Falta la segunda mitad: "demarcado de dónde salió". Hoy a REINEL le sale "En mora — su cuota
-- lleva 2 días de vencida" por un monto que adentro lleva la semana Y la cuota del acuerdo roto,
-- sin distinguirlas. El que va a cobrar no sabe que parte de eso viene de un acuerdo que se
-- rompió, ni cuántas cuotas alcanzó a pagar.
--
-- Este aviso lo dice completo: cuándo se venció, cuántas cuotas pagó de cuántas, cuánto queda,
-- y que esa plata YA se le está cobrando como mora (para que nadie la sume dos veces).
--
-- NO SE PISA con `acuerdo_sin_pagos` (mig 158): aquel cubre a los que no han abonado NADA, este
-- exige `abonado > 0`. Cada acuerdo cae en uno solo. La campana ya costó bajarla de 428 a 263
-- avisos; no se le agregan filas repetidas.
--
-- 🔑 SE PARCHA LA VISTA VIVA, NO SE REGENERA (lección mig 124): se lee con `pg_get_viewdef` y se
-- le añade la rama al final. Aborta sola si ya estaba aplicada.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

do $mig$
declare
  v_def  text;
  v_rama text;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('acuerdo_incumplido' in v_def) > 0 then
    raise notice '159: ya estaba aplicada. No se tocó nada.';
    return;
  end if;

  -- Sanidad: si la rama de la 158 no está, esta vista no es la que creemos y mejor no tocarla.
  if position('acuerdo_sin_pagos' in v_def) = 0 then
    raise exception '159 ABORTADA: falta la rama de la mig 158. Correr la 158 primero.';
  end if;

  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  v_rama := $rama$
union all
select
  'acuerdo_roto:' || cv.id,
  'acuerdo_incumplido',
  'Acuerdo incumplido — ' || cl.nombre,
  'Se venció el ' || to_char(cv.fecha_limite, 'DD/MM/YYYY') || ' con ' || cv.cuotas_pagadas
    || ' de ' || cv.numero_cuotas || ' cuotas pagadas. Quedan $'
    || replace(to_char(cv.deuda_total - ab.abonado, 'FM999,999,999'), ',', '.')
    || ', que ya se le están cobrando como mora — no se los cobres aparte.',
  'critico',
  m.subadmin_id,
  case when m.subadmin_id is null then 'ADMIN' end,
  c.id, c.moto_id, c.cliente_id, m.placa,
  ((select d from h) - cv.fecha_limite)::int,
  2,
  cv.deuda_total - ab.abonado
from public.convenios cv
join public.contratos c on c.id = cv.contrato_id
join public.clientes cl on cl.id = c.cliente_id
left join public.motos m on m.id = c.moto_id
cross join lateral (
  select coalesce((select sum(p.aplicado_convenio) from public.pagos p
                    where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado'
                      and p.created_at >= cv.created_at), 0) as abonado
) ab
where cv.estado = 'incumplido'
  and c.estado in ('Activo', 'Suspendido')
  and ab.abonado > 0
  and cv.deuda_total - ab.abonado > 0
$rama$;

  execute 'create or replace view public.pendientes with (security_invoker = true) as '
          || v_def || v_rama;
  raise notice '159: aviso `acuerdo_incumplido` agregado.';
end
$mig$;

comment on view public.pendientes is
  'Todo lo que hay que hacer hoy, calculado en el servidor: los 23 avisos con su dueño. NO guarda alertas, las deduce de los datos. El acuerdo VENCIDO cuenta igual que el activo (mig 158) y dice de dónde salió su plata (mig 159). `monto` en los avisos de cobro es la CUOTA Y EL ACUERDO vencidos, no la deuda total. Ver docs/FLUJO-DIARIO.md.';

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from public.pendientes where tipo = 'acuerdo_incumplido')            as acuerdos_rotos,
  (select count(*) from public.pendientes where tipo = 'acuerdo_sin_pagos')             as acuerdos_secos,
  -- Nadie puede estar en los dos a la vez.
  (select count(*) from (
     select contrato_id from public.pendientes
      where tipo in ('acuerdo_incumplido', 'acuerdo_sin_pagos')
      group by contrato_id having count(distinct tipo) > 1) x)                          as repetidos,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)                        as claves_duplicadas,
  (select count(*) from public.pendientes
    where dueno_id is null and dueno_rol is null)                                       as sin_dueno;
-- Esperado: acuerdos_rotos = 4 · repetidos = 0 · claves_duplicadas = 0 · sin_dueno = 0

-- El detalle, para leerlo como lo va a ver el funcionario.
select titulo, detalle, monto from public.pendientes
where tipo = 'acuerdo_incumplido' order by monto desc;
