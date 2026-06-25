-- Accesos personalizados por usuario.
-- permisos: arreglo JSON de claves de módulo (ViewKey) que el usuario puede abrir.
--   NULL o vacío  -> usa los accesos por defecto de su rol (comportamiento actual)
--   [..]          -> el admin definió accesos a medida; manda esta lista
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS permisos jsonb;
