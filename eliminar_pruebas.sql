-- PASO 1: Ver motos sin contrato (las 5 extras de prueba)
SELECT id, placa, marca, modelo, estado, created_at
FROM motos
WHERE id NOT IN (SELECT DISTINCT moto_id FROM contratos WHERE moto_id IS NOT NULL)
ORDER BY created_at ASC;

-- PASO 2: Ver clientes sin contrato (los 3 extras de prueba)
SELECT id, nombre, cedula, estado, created_at
FROM clientes
WHERE id NOT IN (SELECT DISTINCT cliente_id FROM contratos WHERE cliente_id IS NOT NULL)
ORDER BY created_at ASC;
