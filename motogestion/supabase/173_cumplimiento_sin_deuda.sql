-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 173 — NADIE SE CIERRA POR CUMPLIMIENTO DEBIENDO (D-026 · 26-sep-2026)
--
-- LA REGLA DEL DUEÑO (D-026, 25-sep): *"para cuando el tiempo del contrato termine y aún siga
-- debiendo, se debe colocar más tiempo en semanas… hasta que quede totalmente al día"*. Solo en $0
-- se liquida por cumplimiento y la moto pasa a ser suya.
--
-- POR QUÉ VA EN LA BASE. La pantalla ya no ofrece "Cumplimiento" mientras deba (ModalIniciar-
-- Liquidacion y el selector de LiquidacionesView). Pero la guarda de la PANTALLA no protege plata
-- (lección de la mig 166): la deuda puede aparecer después de elegir el motivo (daños del taller,
-- una multa), o alguien puede llegar por otra puerta. Sin esto, un cumplimiento con saldo negativo
-- se cerraría y `cerrar_liquidacion()` mandaría a LISTA NEGRA a alguien que sí terminó su contrato.
--
-- LO QUE HACE: un disparador que rechaza el paso a 'cerrada' de una liquidación por cumplimiento
-- con saldo final negativo. No reescribe `cerrar_liquidacion()` (se evita copiarla — mig 124):
-- actúa sobre el UPDATE que ella misma hace. Solo mira la TRANSICIÓN a cerrada: lo ya cerrado
-- (ANGELICA PACHECO, LIQ-0007, −$289.000) no se toca, y editar una cerrada (subir la firma) tampoco.
--
-- NO mueve plata de nadie: solo agrega una regla. Los otros dos motivos cierran igual que ayer.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--     drop trigger if exists liquidacion_cumplimiento_sin_deuda on public.liquidaciones;
--     drop function if exists public.liquidacion_cumplimiento_sin_deuda();
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

create or replace function public.liquidacion_cumplimiento_sin_deuda()
returns trigger language plpgsql as $$
begin
  if new.estado = 'cerrada'
     and old.estado is distinct from 'cerrada'
     and new.motivo = 'cumplimiento'
     and coalesce(new.saldo_final, 0) < 0 then
    raise exception 'No se puede cerrar % por cumplimiento: el cliente todavía debe $%. Sigue pagando su semana normal hasta quedar en $0 (regla D-026).',
      coalesce(new.numero, 'la liquidación'), replace(to_char(-new.saldo_final, 'FM999,999,999'), ',', '.');
  end if;
  return new;
end;
$$;

drop trigger if exists liquidacion_cumplimiento_sin_deuda on public.liquidaciones;
create trigger liquidacion_cumplimiento_sin_deuda
  before update of estado on public.liquidaciones
  for each row execute function public.liquidacion_cumplimiento_sin_deuda();

select public.registrar_migracion(173, '173_cumplimiento_sin_deuda.sql',
  'D-026: la base no deja cerrar por cumplimiento una liquidación con saldo negativo');

commit;

-- ─── VERIFICACIÓN — debe dar 1 ───────────────────────────────────────────────────────────────
select count(*) as candado_puesto
  from pg_trigger
 where tgname = 'liquidacion_cumplimiento_sin_deuda' and not tgisinternal;

-- ─── PRUEBA DEL CANDADO (no cambia nada: todo va dentro de un rollback) ──────────────────────
-- Debe fallar con: "No se puede cerrar ... por cumplimiento: el cliente todavía debe $1.000 ..."
--   begin;
--     update public.liquidaciones
--        set estado = 'cerrada', motivo = 'cumplimiento', saldo_final = -1000
--      where id = (select id from public.liquidaciones where estado <> 'cerrada' limit 1);
--   rollback;
