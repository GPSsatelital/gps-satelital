-- ============================================================
-- MIGRACIÓN v2 — Recrear tablas con columnas correctas + RLS
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================

-- 1. Eliminar tablas anteriores si existen (la v1 las creó con nombres incorrectos)
DROP TABLE IF EXISTS gestiones_cobro CASCADE;
DROP TABLE IF EXISTS deudas CASCADE;
DROP TABLE IF EXISTS convenios CASCADE;
DROP TABLE IF EXISTS caja_diaria CASCADE;

-- 2. GESTIONES DE COBRO
CREATE TABLE gestiones_cobro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  resultado TEXT,
  registrado_por UUID REFERENCES profiles(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  plazo_extra_dias INTEGER,
  plazo_extra_motivo TEXT,
  plazo_extra_fecha_limite DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gestiones_cobro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gestiones_cobro_all" ON gestiones_cobro FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. DEUDAS
CREATE TABLE deudas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  descripcion TEXT,
  monto INTEGER NOT NULL DEFAULT 0,
  monto_pendiente INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  registrado_por UUID REFERENCES profiles(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deudas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deudas_all" ON deudas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. CONVENIOS
CREATE TABLE convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  numero_convenio INTEGER NOT NULL DEFAULT 1,
  deuda_total INTEGER NOT NULL DEFAULT 0,
  cuota_por_periodo INTEGER NOT NULL DEFAULT 0,
  numero_cuotas INTEGER NOT NULL DEFAULT 4,
  cuotas_pagadas INTEGER NOT NULL DEFAULT 0,
  fecha_limite DATE,
  estado TEXT NOT NULL DEFAULT 'activo',
  concepto TEXT,
  aprobado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE convenios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "convenios_all" ON convenios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. CAJA DIARIA
CREATE TABLE caja_diaria (
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

ALTER TABLE caja_diaria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "caja_diaria_all" ON caja_diaria FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Verificación
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('gestiones_cobro','deudas','convenios','caja_diaria')
ORDER BY tablename;
