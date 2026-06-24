-- Confirmación de pagos: cobro en campo y recibos
-- entregado_caja: el admin marcó que entregó el efectivo físico a la secretaria
-- folio: número de comprobante único (CMP-YYMMDD-HHMM) para recibos al cliente
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS entregado_caja boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS folio text;
