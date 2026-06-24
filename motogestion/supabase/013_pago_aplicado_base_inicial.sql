-- Agrega la columna que faltaba para el desglose de aplicación del pago.
-- La migración 006 creó aplicado_tarifa/deuda/convenio/ahorro/saldo_favor,
-- pero el código de registrarPago también escribe aplicado_base_inicial.
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS aplicado_base_inicial numeric NOT NULL DEFAULT 0;
