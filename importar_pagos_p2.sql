-- PAGOS PARTE 2/5 — 679 registros
BEGIN;

INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,188000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,188000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=188000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,12000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,37000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,37000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=37000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,304000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,304000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=304000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,212000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,212000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=212000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,37000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,37000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=37000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,192000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,192000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=192000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,868000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,868000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=868000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,155000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,155000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,112000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,112000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=112000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,204000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,204000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-09' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,37000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,37000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=37000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-10' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,161000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,161000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=161000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,37000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,37000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=37000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-12' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-04-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-12' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,56000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,56000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=56000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,125000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,125000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,165000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,165000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=165000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,107000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,107000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=107000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,5000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,5000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=5000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-14' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL71I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202200,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202200,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=202200);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-15' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,33000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,33000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=33000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,72000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,72000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=72000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,155000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,155000,0,0,0,0,NULL,'2026-04-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-16' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,76000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,76000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=76000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,145000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,64000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,64000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=64000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,55000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,186000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,186000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=186000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,35000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,6000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,6000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=6000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-18' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,263000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,263000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=263000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,207000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,207000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=207000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,189000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,189000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=189000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,154000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,154000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=154000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,49000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,49000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=49000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-21' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,22000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL71I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,179000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,179000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=179000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,115000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,115000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-22',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,870000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,870000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=870000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,151000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,151000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=151000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,49000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,49000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=49000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,139000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,139000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=139000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-23' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,174000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,174000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=174000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-24' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,192000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,192000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=192000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,8000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,8000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=8000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,32000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,32000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=32000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,56000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,56000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=56000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-25' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-04-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-26' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,206000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,206000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=206000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,162000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,162000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=162000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,134000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,134000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=134000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,206000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,206000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=206000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-27' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,155000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,155000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,214000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,214000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=214000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,31000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,305000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,305000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=305000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,222000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,222000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=222000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,410000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,410000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=410000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,54000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,54000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=54000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,63000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,63000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=63000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-30' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,83000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,83000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=83000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,185000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,185000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=185000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,185000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,185000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=185000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,33000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,33000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=33000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-02' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-03' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-03' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,134000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,134000,0,0,0,0,NULL,'2026-05-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-03' AND ex.valor=134000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-03' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-03' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,214000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,214000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=214000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,22000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,170000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,170000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,230000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,230000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,280000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,280000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=280000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,198000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,198000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=198000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,81000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,81000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=81000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,67000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,67000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=67000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL71I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,4000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,4000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=4000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,390000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,390000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,203000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,203000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=203000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,404000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,404000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=404000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,84000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,84000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=84000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,560000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,560000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=560000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,21000,'Transferencia','Confirmado','{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,21000,0,0,0,0,NULL,'2026-05-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=21000);

COMMIT;
SELECT COUNT(*) as pagos_total FROM pagos;
