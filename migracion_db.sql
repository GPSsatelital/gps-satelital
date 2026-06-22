-- ============================================================
-- MIGRACIÓN DE BASE DE DATOS — MotoGestión v2.0
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================

-- 1. CONTRATOS: agregar forma_pago (alias capitalizado de tipo_contrato)
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS forma_pago TEXT;
UPDATE contratos SET forma_pago = CASE
  WHEN tipo_contrato = 'diario' THEN 'Diario'
  WHEN tipo_contrato = 'semanal' THEN 'Semanal'
  WHEN tipo_contrato = 'quincenal' THEN 'Quincenal'
  WHEN tipo_contrato = 'mensual' THEN 'Mensual'
  ELSE 'Semanal'
END WHERE forma_pago IS NULL;

-- 2. CONTRATOS: agregar columnas faltantes
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS tipo_ruta TEXT DEFAULT 'tiempo_definido';
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS tarifa_diaria INTEGER DEFAULT 27000;
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS tarifa_domingo INTEGER DEFAULT 16000;
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS ahorro_diario INTEGER DEFAULT 4000;
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS valor_periodo INTEGER;
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS periodo_pagado_hasta DATE;

-- poblar valor_periodo desde valor_semanal si existe
UPDATE contratos SET valor_periodo = valor_semanal WHERE valor_periodo IS NULL AND valor_semanal IS NOT NULL;

-- 3. MOTOS: agregar columnas faltantes
ALTER TABLE motos ADD COLUMN IF NOT EXISTS condicion_ingreso TEXT;
ALTER TABLE motos ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE motos ADD COLUMN IF NOT EXISTS ubicacion_fisica TEXT;
ALTER TABLE motos ADD COLUMN IF NOT EXISTS kilometraje_inicial INTEGER;
ALTER TABLE motos ADD COLUMN IF NOT EXISTS fotos_entrega JSONB DEFAULT '[]'::jsonb;

-- 4. CLIENTES: agregar columnas faltantes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ruta_contrato TEXT DEFAULT 'tiempo_definido';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS referido_por_cedula TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS referido_por_nombre TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS referidos_confirmados INTEGER DEFAULT 0;

-- 5. PAGOS: agregar columnas faltantes
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS tipo_registro TEXT DEFAULT 'normal';
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES profiles(id);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS comprobante_url TEXT;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS notas TEXT;

-- 6. DEUDAS: crear si no existe
CREATE TABLE IF NOT EXISTS deudas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  tipo TEXT NOT NULL, -- 'tarifa_atrasada'|'dano_vehiculo'|'prestamo_repuesto'|'prestamo_eventualidad'|'fotomulta'
  descripcion TEXT,
  monto INTEGER NOT NULL DEFAULT 0,
  monto_pendiente INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Pendiente', -- 'Pendiente'|'En convenio'|'Pagada'|'Condonada'
  autorizado_por UUID REFERENCES profiles(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CONVENIOS: crear si no existe
CREATE TABLE IF NOT EXISTS convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  cuota_semanal INTEGER NOT NULL DEFAULT 0,
  total_deuda INTEGER NOT NULL DEFAULT 0,
  semanas INTEGER NOT NULL DEFAULT 4,
  semanas_pagadas INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Activo', -- 'Activo'|'Cumplido'|'Incumplido'
  motivo TEXT,
  autorizado_por UUID REFERENCES profiles(id),
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. GESTIONES DE COBRO: crear si no existe
CREATE TABLE IF NOT EXISTS gestiones_cobro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id),
  tipo TEXT NOT NULL, -- 'llamada'|'whatsapp'|'sirena'|'visita'|'recoleccion'|'plazo_extra'|'apagado_remoto'
  resultado TEXT,
  notas TEXT,
  dias_plazo INTEGER, -- para plazo_extra
  motivo_plazo TEXT,
  realizado_por UUID REFERENCES profiles(id),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CAJA DIARIA: crear si no existe
CREATE TABLE IF NOT EXISTS caja_diaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  efectivo_total INTEGER NOT NULL DEFAULT 0,
  transferencias_total INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  detalle JSONB DEFAULT '[]'::jsonb,
  cerrado_por UUID REFERENCES profiles(id),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Verificación final
SELECT
  'contratos' as tabla,
  COUNT(*) as registros
FROM contratos
UNION ALL
SELECT 'motos', COUNT(*) FROM motos
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'pagos', COUNT(*) FROM pagos;
