-- Migración 030: autorización de tratamiento de datos personales (Ley 1581 de 2012)
-- Se captura al registrar un cliente nuevo — firma ya disponible (lápiz digital / dedo),
-- huella pendiente hasta integrar el lector HID DigitalPersona (solo funciona en PC Windows).

alter table public.clientes
  add column if not exists autorizacion_datos_firma_url text,
  add column if not exists autorizacion_datos_huella_url text,
  add column if not exists autorizacion_datos_fecha timestamptz;
