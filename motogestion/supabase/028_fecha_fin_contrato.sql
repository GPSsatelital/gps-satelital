-- Migración 028: fecha_fin_contrato guardada (no calculada al vuelo)
-- Antes el vencimiento se calculaba cada vez como fecha_entrega + meses*30.
-- Ahora queda como un dato real del contrato: se puede corregir a mano (ej. contratos
-- migrados con tiempo real de taller ya transcurrido) y sirve de base para "tiempo rodado"
-- (acuerdos_tiempo_rodado) que la irá moviendo hacia adelante cuando aplique.

alter table public.contratos
  add column if not exists fecha_fin_contrato date;

-- Backfill: mismo cálculo que se usaba al vuelo, solo para contratos de tiempo definido
-- (Diario no tiene vencimiento — CLAUDE.md: "Sin fecha de vencimiento").
update public.contratos
set fecha_fin_contrato = (fecha_entrega + make_interval(days => meses * 30))::date
where fecha_entrega is not null
  and meses is not null
  and forma_pago <> 'Diario'
  and fecha_fin_contrato is null;
