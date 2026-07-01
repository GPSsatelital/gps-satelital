-- Agrega el concepto 'multa_recoleccion' a la tabla deudas
ALTER TABLE deudas DROP CONSTRAINT IF EXISTS deudas_concepto_check;
ALTER TABLE deudas ADD CONSTRAINT deudas_concepto_check
  CHECK (concepto IN ('tarifa_atrasada','daño_vehiculo','prestamo_repuesto','prestamo_eventualidad','fotomulta','multa_recoleccion','otro'));
