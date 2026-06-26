-- Agrega columna detalle de retención a motos (Fiscalía/Tránsito/Garantía)
ALTER TABLE motos ADD COLUMN IF NOT EXISTS retencion_detalle text;
