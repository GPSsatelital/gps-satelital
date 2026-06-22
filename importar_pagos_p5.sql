-- PAGOS PARTE 5/5 — 676 registros
BEGIN;

INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,192000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,192000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=192000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,390000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,390000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,230000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,230000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,62000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,62000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,185000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,185000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=185000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,840000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,840000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=840000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,400000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,400000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,12000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,158000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,158000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=158000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,295000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,295000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=295000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,135000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,99000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,99000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=99000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,1000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,1000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=1000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,244000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,244000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=244000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,270000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,270000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=270000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,204000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,204000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,304000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,304000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=304000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,194000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,194000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=194000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,840000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,840000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=840000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,434000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,434000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL82I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=434000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,242000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,242000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=242000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,241000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,241000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=241000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,139000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,139000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=139000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,125000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,125000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,3000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,3000,0,0,0,0,NULL,'2026-05-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=3000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-05-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-05-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,204000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,204000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,31000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,230000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,230000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,260000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,260000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=260000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,222000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,222000,0,0,0,0,NULL,'2026-05-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=222000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,154000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,154000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=154000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,500000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,500000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=500000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-05-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,304000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,304000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=304000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,26000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,26000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=26000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,199000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,199000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=199000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,225000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,225000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=225000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,58000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,58000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=58000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-05-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,143000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,143000,0,0,0,0,NULL,'2026-05-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=143000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,139000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,139000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=139000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-05-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,156000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,156000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=156000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,31000,0,0,0,0,NULL,'2026-05-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-05-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,191000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,191000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=191000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,172000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,172000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=172000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-05-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,115000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,115000,0,0,0,0,NULL,'2026-05-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-06-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-06-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-06-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,840000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,840000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=840000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,54000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,54000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=54000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,198000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,198000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=198000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,3000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,3000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=3000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,199000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,199000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=199000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,55000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,12000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,82000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,82000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=82000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,115000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,115000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-06-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-06-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-06-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-06-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-06-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-06-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-06-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,194000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,194000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=194000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,405000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,405000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=405000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,206000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,206000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=206000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,26000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,26000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=26000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,42000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,42000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=42000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,232000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,232000,0,0,0,0,NULL,'2026-06-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=232000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-06-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,178000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,178000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=178000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DRO37I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,97000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,97000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=97000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,138000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,138000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=138000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,212000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,212000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=212000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,235000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,235000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=235000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,2000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,42000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,42000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=42000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-06-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-06-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-06-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-06-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-06-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-06-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,58000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,58000,0,0,0,0,NULL,'2026-06-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-22' AND ex.valor=58000);

COMMIT;
SELECT COUNT(*) as pagos_total FROM pagos;
