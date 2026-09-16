-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 155 — ANULAR UNA LIQUIDACIÓN EMPEZADA POR ERROR (16-sep-2026)
--
-- EL HUECO: iniciar una liquidación sobre el contrato equivocado dejaba ese contrato BLOQUEADO
-- para siempre. `iniciarLiquidacion` rechaza empezar otra si ya hay una en curso
-- (`iniciada`/`en_taller`/`calculada`/`documento_generado`) y no existía forma de deshacerla.
-- Corregir el motivo ya se podía (se resolvió antes); lo que faltaba era cancelarla entera.
--
-- ALCANCE, A PROPÓSITO: solo se anula una liquidación que **NO esté cerrada**. Cerrar es lo que
-- mueve plata de verdad —salda deudas, cierra el convenio, pone el ahorro en 0 y crea la deuda
-- del faltante— y deshacer eso es harina de otro costal. Antes del cierre lo único que la
-- liquidación creó fue su propia fila y una orden de taller: eso sí se puede revertir limpio.
--
-- 🔴 SE MARCA, NO SE BORRA. La fila queda con `estado='anulada'` + quién, cuándo y por qué.
-- Una liquidación empezada sobre un cliente real es un hecho que pasó: borrarla dejaría al
-- contrato sin explicación de por qué estuvo bloqueado tres días. Es la regla de EL RASTRO.
-- Y como 'anulada' no está en la lista que bloquea, el contrato queda libre solo.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- 1) El estado nuevo. Se recrea el CHECK de la mig 007 conservando los seis de siempre.
alter table public.liquidaciones drop constraint if exists liquidaciones_estado_check;
alter table public.liquidaciones add constraint liquidaciones_estado_check
  check (estado in ('iniciada', 'en_taller', 'calculada', 'documento_generado', 'firmada', 'cerrada', 'anulada'));

-- 2) El rastro: sin motivo no se anula (lo exige la app, y acá queda el dato para siempre).
alter table public.liquidaciones
  add column if not exists anulada_por    uuid references public.profiles(id),
  add column if not exists anulada_motivo text,
  add column if not exists anulada_at     timestamptz;

comment on column public.liquidaciones.anulada_motivo is
  'Por que se anulo esta liquidacion. Obligatorio al anular (mig 155): una liquidacion empezada '
  'sobre un cliente real es un hecho que paso, y el contrato estuvo bloqueado mientras tanto.';

-- ─── VERIFICACIÓN — debe dar: estados=7 · columnas=3 ─────────────────────────────────────────
select
  (select count(*) from pg_constraint
    where conname = 'liquidaciones_estado_check'
      and pg_get_constraintdef(oid) like '%anulada%')                      as check_tiene_anulada,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'liquidaciones'
      and column_name in ('anulada_por', 'anulada_motivo', 'anulada_at'))  as columnas_nuevas;
-- check_tiene_anulada = 1 · columnas_nuevas = 3
