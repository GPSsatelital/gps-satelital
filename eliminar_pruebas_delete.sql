-- Eliminar clientes de prueba (sin contrato)
DELETE FROM clientes
WHERE id NOT IN (
  SELECT DISTINCT cliente_id FROM contratos WHERE cliente_id IS NOT NULL
);

-- Eliminar motos de prueba (sin contrato)
DELETE FROM motos
WHERE id NOT IN (
  SELECT DISTINCT moto_id FROM contratos WHERE moto_id IS NOT NULL
);

-- Verificar resultado final
SELECT 'contratos' as tabla, COUNT(*) as registros FROM contratos
UNION ALL SELECT 'motos', COUNT(*) FROM motos
UNION ALL SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'pagos', COUNT(*) FROM pagos;
