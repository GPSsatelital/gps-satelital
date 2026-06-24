-- Agrega el grupo/portafolio "Usadas Club" (valor interno: USADAS)
-- Actualiza los CHECK de motos.grupo y profiles.grupo para aceptarlo.

ALTER TABLE motos DROP CONSTRAINT IF EXISTS motos_grupo_check;
ALTER TABLE motos ADD CONSTRAINT motos_grupo_check
  CHECK (grupo IN ('COSTA','PRADERA','RASTREADOR','USADAS','OTRO'));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_grupo_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_grupo_check
  CHECK (grupo IN ('COSTA','PRADERA','RASTREADOR','USADAS'));
