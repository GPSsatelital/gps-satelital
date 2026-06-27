-- Agrega columna ubicacion a pagos: GPS del lugar donde se hizo el cobro en campo
ALTER TABLE public.pagos ADD COLUMN IF NOT EXISTS ubicacion jsonb;
