-- Migración 007: Módulo de liquidaciones

-- Lista negra en clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS lista_negra boolean DEFAULT false;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS motivo_lista_negra text;

-- Tabla de liquidaciones
CREATE TABLE IF NOT EXISTS liquidaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text UNIQUE NOT NULL,
  contrato_id uuid REFERENCES contratos(id),
  cliente_id uuid REFERENCES clientes(id),
  moto_id uuid REFERENCES motos(id),
  motivo text NOT NULL CHECK (motivo IN ('cumplimiento', 'retiro_voluntario', 'incumplimiento')),
  estado text NOT NULL DEFAULT 'iniciada' CHECK (estado IN ('iniciada', 'en_taller', 'calculada', 'documento_generado', 'firmada', 'cerrada')),
  ahorro_acumulado numeric DEFAULT 0,
  total_deudas numeric DEFAULT 0,
  costo_danos numeric DEFAULT 0,
  saldo_final numeric DEFAULT 0,
  detalle_deudas jsonb DEFAULT '[]',
  detalle_danos jsonb DEFAULT '[]',
  observaciones_taller text,
  nombre_responsable text,
  cargo_responsable text,
  documento_firmado_url text,
  iniciada_por uuid REFERENCES profiles(id),
  cerrada_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER liquidaciones_updated_at
  BEFORE UPDATE ON liquidaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE liquidaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados leen liquidaciones" ON liquidaciones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin gestiona liquidaciones" ON liquidaciones FOR ALL USING (auth.role() = 'authenticated');
