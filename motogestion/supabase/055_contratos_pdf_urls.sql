-- ===== 055: columnas de documentos del contrato (arreglo real) =====
-- El wizard escribe contrato_pdf_url / pagare_pdf_url / certificado_pdf_url al firmar, pero
-- estas columnas NUNCA se crearon en la BD: el alter que las agregaba (mig 010, líneas 86-88)
-- no se corrió en Supabase. Supabase rechaza un update a columna inexistente EN SILENCIO
-- (no lanza excepción, el código no revisa .error), así que:
--   - los 3 PDF se generan y suben al Storage, pero su URL nunca se guardaba.
--   - el paso 5 hace update({certificado_pdf_url, firma_cliente:true}) en UN solo update →
--     al fallar por la columna inexistente, firma_cliente TAMPOCO quedaba en true.
-- Efecto: TODOS los contratos entregados por wizard salían sin documentos y sin firma.
-- Esta migración crea las columnas para que el flujo ya existente empiece a guardar bien.
alter table public.contratos
  add column if not exists contrato_pdf_url    text,
  add column if not exists pagare_pdf_url       text,
  add column if not exists certificado_pdf_url  text;
