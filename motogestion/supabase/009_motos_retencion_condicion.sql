-- ================================================================
-- Migración 009 — Motos: condición de ingreso + campos de retención
-- ================================================================

ALTER TABLE motos
  ADD COLUMN IF NOT EXISTS condicion_ingreso text CHECK (condicion_ingreso IN ('nueva', 'usada')),
  ADD COLUMN IF NOT EXISTS retencion_fecha date,
  ADD COLUMN IF NOT EXISTS retencion_numero_caso text,
  ADD COLUMN IF NOT EXISTS retencion_fecha_salida date,
  ADD COLUMN IF NOT EXISTS retencion_detalle text;

-- Ampliar el constraint de estado para incluir nuevos valores
ALTER TABLE motos DROP CONSTRAINT IF EXISTS motos_estado_check;
ALTER TABLE motos ADD CONSTRAINT motos_estado_check
  CHECK (estado IN ('Disponible','Reservada','Asignada','Mantenimiento','Recuperada','Fiscalia','Transito','Garantia'));

-- Ampliar constraint de grupo para incluir RASTREADOR y OTRO
ALTER TABLE motos DROP CONSTRAINT IF EXISTS motos_grupo_check;
ALTER TABLE motos ADD CONSTRAINT motos_grupo_check
  CHECK (grupo IN ('CLUB','PRADERA','COSTA','RASTREADOR','OTRO'));
