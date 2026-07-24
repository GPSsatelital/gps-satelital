-- ===== 059: recordar el estado previo de la moto prestada =====
-- Bug: al devolver un préstamo de reemplazo, la moto prestada volvía SIEMPRE a "Recuperada",
-- aunque hubiera salido del pool "Disponible" (queda mal clasificada como retenida). Ahora se
-- guarda el estado que tenía ANTES de prestarse y se restaura EXACTO al devolverla.
-- Préstamos viejos sin este dato: el frontend usa "Recuperada" como respaldo (comportamiento anterior).
alter table public.prestamos_reemplazo
  add column if not exists moto_prestada_estado_previo text;
