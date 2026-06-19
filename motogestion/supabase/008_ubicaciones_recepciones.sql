-- Migración 008: Ubicación física de motos y recepciones de vehículos

-- Ubicación física en motos
ALTER TABLE motos ADD COLUMN IF NOT EXISTS ubicacion_fisica text DEFAULT 'bodega'
  CHECK (ubicacion_fisica IN ('con_cliente','bodega','oficina','taller','patios_transito','fiscalia','otro'));
ALTER TABLE motos ADD COLUMN IF NOT EXISTS detalle_ubicacion text;

-- Historial de ubicaciones (registro de cada cambio)
CREATE TABLE IF NOT EXISTS historial_ubicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moto_id uuid REFERENCES motos(id) ON DELETE CASCADE,
  ubicacion_anterior text,
  ubicacion_nueva text NOT NULL,
  detalle text,
  motivo text,
  registrado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE historial_ubicaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados historial_ubicaciones" ON historial_ubicaciones FOR ALL USING (auth.role() = 'authenticated');

-- Recepciones de vehículo (formulario de ingreso físico)
CREATE TABLE IF NOT EXISTS recepciones_vehiculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moto_id uuid REFERENCES motos(id) ON DELETE CASCADE,
  contrato_id uuid REFERENCES contratos(id),
  cliente_id uuid REFERENCES clientes(id),
  motivo text NOT NULL CHECK (motivo IN ('retencion_mora','entrega_voluntaria','liquidacion','nuevo_registro','otro')),
  condicion_general text NOT NULL CHECK (condicion_general IN ('buena','regular','mala')),
  descripcion_danos text,
  kilometros integer,
  ubicacion_destino text NOT NULL,
  quien_recibe uuid REFERENCES profiles(id),
  nombre_entrega text,
  fotos jsonb DEFAULT '[]',
  observaciones text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recepciones_vehiculo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados recepciones_vehiculo" ON recepciones_vehiculo FOR ALL USING (auth.role() = 'authenticated');

-- Acuerdos de tiempo rodado (cuando se pospone el contrato)
CREATE TABLE IF NOT EXISTS acuerdos_tiempo_rodado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid REFERENCES contratos(id),
  cliente_id uuid REFERENCES clientes(id),
  moto_id uuid REFERENCES motos(id),
  recepcion_id uuid REFERENCES recepciones_vehiculo(id),
  dias_en_empresa integer NOT NULL,
  valor_por_dia numeric DEFAULT 0,
  total_a_cobrar numeric DEFAULT 0,
  decision text NOT NULL CHECK (decision IN ('cobrar_ahora','rodar_al_final')),
  fecha_entrada date NOT NULL,
  fecha_salida date,
  nueva_fecha_fin_contrato date,
  observaciones text,
  documento_firmado_url text,
  creado_por uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER acuerdos_tiempo_updated_at
  BEFORE UPDATE ON acuerdos_tiempo_rodado
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE acuerdos_tiempo_rodado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Autenticados acuerdos_tiempo" ON acuerdos_tiempo_rodado FOR ALL USING (auth.role() = 'authenticated');
