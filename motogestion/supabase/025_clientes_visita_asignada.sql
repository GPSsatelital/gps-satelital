-- Sub-admin asignado para realizar la visita domiciliaria pendiente (antes de que exista el registro de visita)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS visita_asignada_a uuid REFERENCES profiles(id);
