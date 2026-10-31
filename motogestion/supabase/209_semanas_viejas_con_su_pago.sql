-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 209 — LAS SEMANAS LLENADAS ANTES DEL 26-OCT TAMBIÉN DICEN QUÉ PAGO LAS LLENÓ (31-oct-2026, D-058)
--        (aprobado por el dueño el 31-oct: «sí corrígelo», al revisar la nómina de BRANDON)
--
-- LO QUE PASÓ: la mig 207 empezó a guardar qué pago llenó cada semana (`cajas_llenadas.pago_id`) y
-- con eso la nómina cuenta el día en que PAGÓ el cliente (D-057). Pero solo completó las semanas desde
-- el 26-oct: las de antes quedaron sin el pago, y para ellas la nómina sigue usando el día en que se
-- CONFIRMÓ. Una transferencia pagada dentro de su semana y confirmada después salía "atrasada"
-- ($3.750 en vez de $7.500). Ej. BRANDON, semana del 19-oct: DPU42I (pagó el 14, confirmado el 21),
-- IEW83I (pagó el 15, confirmado el 20), RMY88H (pagó el 16, confirmado el 19).
--
-- QUÉ HACE (todo o nada), con el MISMO método de la mig 207:
--   · A cada semana llenada antes del 26-oct sin pago le pone el pago anotado en el mismo instante
--     o, si no, el último anotado antes (con plata de semana; el prorrateo con plata de prorrateo).
--   · Si un mismo pago aparece llenando semanas en dos momentos separados (más de 10 minutos), solo
--     se le pone a las del primer momento: un pago no se confirma dos veces. Las otras quedan como
--     estaban (5 casos el 31-oct).
--   · Marca cada semana completada así (`pago_deducido = true`) para poder verla o deshacerla.
--
-- LO QUE NO CAMBIA: el motor de pagos, el reparto, las cajas, lo que debe cada cliente, Cartera,
-- ZALA, la semana del 26-oct en adelante. Solo se completa un dato de la nómina.
-- Medido antes de correrla (31-oct): 2.995 semanas sin pago; se completan 2.237. Quedan sin pago 758:
-- 629 son del corte de migración (antes del sistema), 124 la semana adelantada que se paga con la base,
-- y los 5 dudosos — ninguna de esas le paga nada al supervisor.
-- Efecto en la nómina del 24-ago al 25-oct: Ariza +$161.250 · Alvarez +$105.000 · Lumar +$101.250 ·
-- Brandon +$97.500 (+$465.000 en total).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

alter table public.cajas_llenadas
  add column if not exists pago_deducido boolean not null default false;
comment on column public.cajas_llenadas.pago_deducido is
  'true = el pago se dedujo después (mig 209) para una semana llenada antes del 26-oct-2026: el anotado en el mismo instante o el último anotado antes.';
comment on column public.cajas_llenadas.pago_id is
  'El pago que llenó esta semana (mig 207; antes del 26-oct-2026 deducido por la mig 209). La nómina usa su fecha (el día en que pagó el cliente). NULL = la llenó un acuerdo, la base o el corte de migración.';

with candidatos as (
  select e.id as evento_id,
         e.created_at as lleno,
         (select p.id
            from public.pagos p
           where p.contrato_id = e.contrato_id
             and p.estado = 'Confirmado'
             and p.tipo_registro is distinct from 'adelanto_base'
             and case when e.caja_numero = 0 then coalesce(p.aplicado_prorrateo, 0) > 0
                      else coalesce(p.aplicado_tarifa, 0) > 0 end
             and p.created_at <= e.created_at
           order by (p.created_at = e.created_at) desc, p.created_at desc
           limit 1) as pago_id
    from public.cajas_llenadas e
   where e.fecha < '2026-10-26'
     and e.fuente = 'pago'
     and e.pago_id is null
), primeros as (
  select pago_id, min(lleno) as primer_lleno
    from candidatos
   where pago_id is not null
   group by pago_id
)
update public.cajas_llenadas e
   set pago_id = c.pago_id,
       pago_deducido = true
  from candidatos c
  join primeros f on f.pago_id = c.pago_id
 where e.id = c.evento_id
   and c.lleno <= f.primer_lleno + interval '10 minutes';

commit;

-- ── Verificación (correr después) ──────────────────────────────────────────────────────────────
-- Debe dar: deducidas 2237 · siguen_sin_pago 758.
select count(*) filter (where pago_deducido)   as deducidas,
       count(*) filter (where pago_id is null) as siguen_sin_pago
  from public.cajas_llenadas
 where fecha < '2026-10-26' and fuente = 'pago';

-- ── Deshacer (solo si hiciera falta) ─────────────────────────────────────────────────────────────
-- update public.cajas_llenadas set pago_id = null, pago_deducido = false where pago_deducido;
