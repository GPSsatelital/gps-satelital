-- PAGOS PARTE 3/5 — 679 registros
BEGIN;
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,340000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=340000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,62000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,38000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=38000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Efectivo','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,155000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,82000,'Transferencia','Confirmado','2026-05-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-06' AND ex.valor=82000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,134000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=134000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,189000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=189000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,191000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=191000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,56000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=56000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-08' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,13000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=13000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,2000,'Transferencia','Confirmado','2026-05-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-09' AND ex.valor=2000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,112000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=112000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,400000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,808000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=808000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,125000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-05-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-11' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,151000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=151000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,24000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=24000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,79000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=79000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,203000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=203000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,365000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=365000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,203000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=203000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,178000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=178000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,123000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=123000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','2026-05-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-12' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,196000,'Transferencia','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=196000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,222000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=222000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,106000,'Efectivo','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=106000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-05-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-14' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-15' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,247000,'Efectivo','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=247000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,121000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=121000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,232000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=232000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,132000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=132000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,96000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=96000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,360000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=360000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,151000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=151000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,206000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=206000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,42000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=42000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,51000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=51000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,204000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,9000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=9000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,62000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,204000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,63000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=63000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,164000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=164000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-20' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Efectivo','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,110000,'Efectivo','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,306000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=306000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,273000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=273000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,208000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=208000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,24000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=24000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-22','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-22' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,74000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQW27I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=74000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,161000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=161000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,124000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=124000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNB18H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,212000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=212000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,74000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=74000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-23' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','2026-05-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-24' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,245000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=245000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,78000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,322000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=322000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,126000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=126000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,64000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=64000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,400000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,440000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL73I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=440000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,185000,'Efectivo','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=185000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,17000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=17000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,165000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=165000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,76000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=76000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,122000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=122000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,115000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,32000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=32000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,57000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=57000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,3000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=3000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,142000,'Efectivo','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=142000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL78I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,600000,'Efectivo','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=600000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,340000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=340000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,201000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,74000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=74000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,107000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=107000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,78000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,192000,'Efectivo','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=192000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-29','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-29' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,78000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,12000,'Efectivo','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL82I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,422000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL82I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=422000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,76000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=76000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,400000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,122000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=122000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-30','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-30' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-05-31','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-05-31','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-05-31','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-05-31','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-05-31' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,126000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=126000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,285000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=285000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,211000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=211000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,350000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=350000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,230000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,155000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','2026-06-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-01' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,390000,'Efectivo','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,42000,'Efectivo','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=42000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,162000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=162000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,350000,'Efectivo','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=350000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,24000,'Efectivo','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=24000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200200,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=200200);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNB18H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,178000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=178000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,47000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,137000,'Efectivo','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=137000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Efectivo','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Efectivo','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
COMMIT;
SELECT COUNT(*) as pagos_total FROM pagos;
