-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 169 — AVISO: "ESTE CLIENTE PAGA Y SU ACUERDO NO RECIBE NADA" (24-sep-2026)
--
-- 🔴 EL CASO. Revisando IEW50I (JOSE ENRIQUE CHIRINOS) apareció que pagó **$1.116.000 en 8 pagos**
-- desde el 5 de agosto y a su acuerdo **no le entró un solo peso**: sigue en 0 de 11 cuotas.
-- Al medir la flota no era él solo: **31 clientes están pagando y nada llega a su acuerdo**.
-- YAL68H lleva $1.664.000 en 10 pagos, IEW54I $1.285.000.
--
-- POR QUÉ PASA. El motor reparte en orden: prorrateo → cajas → deuda → convenio → saldo. Mientras
-- el cliente tenga UNA semana atrasada, todo se va a las semanas y el acuerdo nunca recibe. No es
-- un defecto del reparto: es el orden que está escrito. Pero deja a gente que sí paga camino a
-- "acuerdo incumplido", y al tercero va liquidación obligatoria.
--
-- LO QUE ESTE AVISO HACE. Ponerlo delante del cobrador ANTES de que venza, para que le pida la
-- cuota del acuerdo **aparte** de la semana. Los primeros vencen el 12 y el 19 de octubre.
--
-- ⚠️ ESTO NO ARREGLA LA CAUSA. El arreglo de fondo lo decidió el dueño el 24-sep (D-022): para
-- quien tenga acuerdo, la semana y la cuota del acuerdo pasan a ser **un conjunto**. Eso toca el
-- motor y va después de construir la red de seguridad (la foto de la plata). Este aviso protege
-- mientras tanto — y sigue sirviendo después, porque un cliente que deja de pagar del todo igual
-- necesita que alguien vea que su acuerdo se vence.
--
-- 🔑 Se parcha la vista VIVA con `pg_get_viewdef` y se le añade la rama al final (lección mig 124).
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   Volver a crear `public.pendientes` sin esta rama: leerla con `pg_get_viewdef`, cortar desde
--   el `UNION ALL` que precede a 'acuerdo_sin_recibir:' hasta el final de esa rama, y recrearla.
--   No toca datos: es solo una vista de lectura.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

do $mig$
declare
  v_def  text;
  v_rama text;
begin
  v_def := pg_get_viewdef('public.pendientes'::regclass);

  if position('acuerdo_sin_recibir' in v_def) > 0 then
    raise notice '169: el aviso ya estaba. No se tocó.';
    return;
  end if;

  if position('reparto_descuadrado' in v_def) = 0 then
    raise exception '169 ABORTADA: falta la revisión de coherencia de la mig 165. Correrla primero.';
  end if;

  v_def := rtrim(v_def);
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;

  v_rama := $rama$
union all
-- EL CLIENTE PAGA PERO SU ACUERDO NO RECIBE NADA ─────────────────────────────────────────────
select
  'acuerdo_sin_recibir:' || cv.id,
  'acuerdo_sin_recibir',
  'Paga, pero su acuerdo no recibe — ' || cl.nombre,
  'Desde el ' || to_char(cv.created_at, 'DD/MM') || ' pagó $'
    || replace(to_char(r.pagado, 'FM999,999,999'), ',', '.') || ' en ' || r.n_pagos
    || ' pago(s), y a su acuerdo no le ha entrado un peso: sigue en '
    || cv.cuotas_pagadas || ' de ' || cv.numero_cuotas || ' cuotas. Vence el '
    || to_char(cv.fecha_limite, 'DD/MM')
    || case when cv.fecha_limite < current_date then ' (YA VENCIÓ)'
            else ' (en ' || (cv.fecha_limite - current_date) || ' días)' end
    || '. Cóbrale la cuota del acuerdo — $'
    || replace(to_char(cv.cuota_por_periodo, 'FM999,999,999'), ',', '.')
    || ' — APARTE de la semana.',
  case when cv.fecha_limite - current_date <= 14 then 'critico' else 'alerta' end,
  m.subadmin_id,
  'ADMIN'::text,
  c.id, c.moto_id, c.cliente_id, m.placa,
  greatest(cv.fecha_limite - current_date, 0)::int,
  2,
  (cv.deuda_total - r.abonado)::numeric
from public.convenios cv
join public.contratos c  on c.id  = cv.contrato_id
join public.clientes cl  on cl.id = c.cliente_id
left join public.motos m on m.id  = c.moto_id
cross join lateral (
  select
    coalesce(sum(p.aplicado_convenio), 0)                                   as abonado,
    coalesce(sum(p.valor) filter (where p.fecha >= cv.created_at::date), 0)  as pagado,
    count(*)  filter (where p.fecha >= cv.created_at::date)                 as n_pagos
  from public.pagos p
  where p.contrato_id = cv.contrato_id and p.estado = 'Confirmado'
) r
where cv.estado = 'activo'
  and cv.cuotas_pagadas < cv.numero_cuotas
  and r.abonado = 0        -- ni un peso al acuerdo
  and r.pagado > 0         -- pero el cliente SÍ está pagando: por eso duele
$rama$;

  execute 'create or replace view public.pendientes with (security_invoker = true) as ' || v_def || v_rama;
  raise notice '169: aviso agregado (acuerdo_sin_recibir).';
end
$mig$;

-- Se anota en el registro de migraciones. Va envuelto a propósito: si esta base todavía no
-- tiene la mig 168, la migración NO debe reventar por una línea que solo lleva la cuenta.
do $reg$ begin
  perform public.registrar_migracion(169, '169_aviso_acuerdo_sin_recibir.sql',
    'Avisa cuando un cliente paga y su acuerdo no recibe nada — 31 casos al crearlo');
exception when undefined_function then
  raise notice 'Sin registro de migraciones (falta la 168). La migración se aplicó igual.';
end $reg$;

commit;

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
select
  (select count(*) from public.pendientes where tipo = 'acuerdo_sin_recibir')          as casos,
  (select count(*) from public.pendientes where tipo = 'acuerdo_sin_recibir'
      and nivel = 'critico')                                                            as vencen_en_2_semanas,
  (select count(*) from public.pendientes)                                              as total_avisos,
  (select count(*) from (select clave from public.pendientes
                          group by clave having count(*) > 1) d)                        as claves_duplicadas;
-- Esperado: casos = 31 · claves_duplicadas = 0 · total_avisos ≈ 394
