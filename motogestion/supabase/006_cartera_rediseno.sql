-- ========= DEUDAS =========
CREATE TABLE IF NOT EXISTS deudas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES contratos(id),
  concepto text NOT NULL CHECK (concepto IN ('tarifa_atrasada','daño_vehiculo','prestamo_repuesto','prestamo_eventualidad','fotomulta','otro')),
  descripcion text NOT NULL,
  monto numeric NOT NULL,
  monto_pendiente numeric NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','en_convenio','pagada')),
  registrado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE deudas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deudas_all" ON deudas FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE deudas;

-- ========= CONVENIOS =========
CREATE TABLE IF NOT EXISTS convenios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES contratos(id),
  numero_convenio int NOT NULL CHECK (numero_convenio BETWEEN 1 AND 3),
  deuda_total numeric NOT NULL,
  cuota_por_periodo numeric NOT NULL,
  numero_cuotas int NOT NULL,
  cuotas_pagadas int NOT NULL DEFAULT 0,
  fecha_limite date NOT NULL,
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','cumplido','incumplido','renovado')),
  concepto text NOT NULL,
  aprobado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE convenios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "convenios_all" ON convenios FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE convenios;

-- ========= GESTIONES DE COBRO =========
CREATE TABLE IF NOT EXISTS gestiones_cobro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES contratos(id),
  tipo text NOT NULL CHECK (tipo IN ('llamada','whatsapp','visita','apagado_moto','sirena','recuperacion','otro')),
  resultado text,
  registrado_por uuid REFERENCES profiles(id),
  fecha date NOT NULL DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE gestiones_cobro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gestiones_all" ON gestiones_cobro FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE gestiones_cobro;

-- ========= CAMPOS NUEVOS EN CONTRATOS =========
ALTER TABLE contratos
  ADD COLUMN IF NOT EXISTS tipo_contrato text NOT NULL DEFAULT 'semanal' CHECK (tipo_contrato IN ('diario','semanal')),
  ADD COLUMN IF NOT EXISTS tarifa_diaria numeric NOT NULL DEFAULT 27000,
  ADD COLUMN IF NOT EXISTS tarifa_domingo numeric NOT NULL DEFAULT 14000,
  ADD COLUMN IF NOT EXISTS base_inicial numeric NOT NULL DEFAULT 510000,
  ADD COLUMN IF NOT EXISTS base_completada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ahorro_acumulado numeric NOT NULL DEFAULT 0;

-- ========= CAMPOS NUEVOS EN PAGOS =========
ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS aplicado_tarifa numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aplicado_deuda numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aplicado_convenio numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aplicado_ahorro numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aplicado_saldo_favor numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS convenio_id uuid REFERENCES convenios(id);

-- ========= ACTUALIZAR CHECK DE METODO EN PAGOS =========
-- Agregar 'Nequi' como método permitido (además de los existentes)
ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_metodo_check;
ALTER TABLE pagos ADD CONSTRAINT pagos_metodo_check CHECK (metodo IN ('Efectivo', 'Transferencia', 'Nequi'));
