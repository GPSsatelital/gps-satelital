-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 202 — ACTA DE ENTREGA (23-oct-2026, pedido del dueño)
--
-- «Cuando se entrega un vehículo por primera vez, que se genere un acta de entrega con un breve
-- resumen del contrato y sus condiciones más importantes, que la firmen como paso final del wizard,
-- y que quede en los documentos para descargarla y entregársela.»
--
-- QUÉ AGREGA: la columna donde queda el PDF firmado. La genera el wizard (paso 7) ANTES de activar el
-- contrato; también se puede adjuntar a mano desde «Documentos del contrato».
-- QUÉ NO TOCA: nada más. Los contratos ya entregados quedan sin acta (null), y eso es lo esperado.
-- Las políticas de `contratos` ya cubren la columna nueva (son por fila, no por columna).
--
-- CÓMO DESHACERLA:  alter table public.contratos drop column if exists acta_entrega_pdf_url;
-- ═══════════════════════════════════════════════════════════════════════════════════════════

begin;

alter table public.contratos add column if not exists acta_entrega_pdf_url text;

comment on column public.contratos.acta_entrega_pdf_url is
  'Acta de entrega firmada (PDF): resumen del contrato + condiciones + checklist + fotos + firmas y huellas. La genera el wizard antes de activar (mig 202). Null en los contratos entregados antes del 23-oct-2026.';

select public.registrar_migracion(202, '202_acta_entrega.sql',
  'Acta de entrega: columna contratos.acta_entrega_pdf_url (la firma el cliente como paso final del wizard)');

commit;

-- VERIFICACIÓN: debe salir una fila con data_type = text
select column_name, data_type from information_schema.columns
 where table_schema = 'public' and table_name = 'contratos' and column_name = 'acta_entrega_pdf_url';
