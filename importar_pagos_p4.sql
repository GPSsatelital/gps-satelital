-- PAGOS PARTE 4/5 — 679 registros
BEGIN;
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,800000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=800000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-03' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,99000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=99000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,168000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=168000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,62000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,72000,'Efectivo','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=72000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,94000,'Efectivo','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=94000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,15000,'Efectivo','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,222000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=222000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,404000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=404000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,31000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=31000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,808000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=808000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,171000,'Efectivo','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,53000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=53000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-08' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,122000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=122000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,203000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=203000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,252000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=252000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,133000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=133000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL74I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,164000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=164000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,199000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=199000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,89000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=89000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,390000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,125000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-06-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-09' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,81000,'Efectivo','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=81000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL84I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNB18H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,26000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=26000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,203000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=203000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,92000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=92000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL79I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,230000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,186000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=186000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-11' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,64000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=64000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,106000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=106000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG94I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Efectivo','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,317000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=317000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-13' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','2026-06-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-14' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,68000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=68000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,22000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW66I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,34000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=34000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,540000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=540000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,434000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL82I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=434000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL80I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,225000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=225000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,212000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=212000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,125000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,142000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=142000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,404000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=404000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN25H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL76I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,78000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,157000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=157000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG99I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,89000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=89000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,9000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=9000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,450000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=450000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG97I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,56000,'Efectivo','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=56000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,44000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=44000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,47000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU49I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,252000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=252000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,62000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAT46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL67I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG87I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL86I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='IEW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZI11H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,404000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=404000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,103000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=103000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,350000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=350000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW33I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-06-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-06-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','2026-02-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-02' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-02' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,194000,'Transferencia','Confirmado','2026-02-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-05' AND ex.valor=194000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-02-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-06' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,295000,'Efectivo','Confirmado','2026-02-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-06' AND ex.valor=295000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-06' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,136700,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=136700);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,54000,'Transferencia','Confirmado','2026-02-08','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-08' AND ex.valor=54000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,129000,'Efectivo','Confirmado','2026-02-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-09' AND ex.valor=129000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Efectivo','Confirmado','2026-02-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-09' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','2026-02-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-09' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','2026-02-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-09' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-10' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-10' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Efectivo','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,51000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=51000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,230000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,108000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=108000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,87000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=87000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,59000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=59000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-02-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-14' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-02-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-14' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-14' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','2026-02-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-15' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-15','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,400000,'Efectivo','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,55000,'Efectivo','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-17' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','2026-02-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-17' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,28000,'Transferencia','Confirmado','2026-02-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-17' AND ex.valor=28000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,320000,'Transferencia','Confirmado','2026-02-17','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-17' AND ex.valor=320000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,390000,'Transferencia','Confirmado','2026-02-18','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-18' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,25000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-19','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,154000,'Efectivo','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=154000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,48000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=48000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-20','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','2026-02-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-21' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,295000,'Transferencia','Confirmado','2026-02-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-21' AND ex.valor=295000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,255000,'Efectivo','Confirmado','2026-02-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-21' AND ex.valor=255000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-21','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-21' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-23' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-02-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-23' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','2026-02-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-23' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-23','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-23' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-02-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-24' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,390000,'Transferencia','Confirmado','2026-02-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-24' AND ex.valor=390000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-24','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Efectivo','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,264000,'Transferencia','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=264000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-25','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,22000,'Efectivo','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=22000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,23000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=23000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,35000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=35000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-26','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,170000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=170000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-02-27','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','2026-02-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-28' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','2026-02-28','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-02-28' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-03-01','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-01' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,840000,'Transferencia','Confirmado','2026-03-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=840000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-03-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','2026-03-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,75000,'Efectivo','Confirmado','2026-03-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,27000,'Transferencia','Confirmado','2026-03-02','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=27000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,165000,'Efectivo','Confirmado','2026-03-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=165000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','2026-03-03','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,142000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=142000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-03-04','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,109000,'Efectivo','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,93000,'Efectivo','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=93000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,108000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=108000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-05','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,350000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=350000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,19000,'Efectivo','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=19000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,11000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=11000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-03-06','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,228000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=228000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-03-07','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-03-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','2026-03-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','2026-03-09','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-10','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,400000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ67H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV73H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN22H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-11','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,192000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=192000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,66000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=66000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN27H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,21000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAW70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=21000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN24H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAV71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO26H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-12','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','2026-03-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','2026-03-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-03-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,81000,'Transferencia','Confirmado','2026-03-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=81000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,9000,'Transferencia','Confirmado','2026-03-13','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=9000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,107000,'Transferencia','Confirmado','2026-03-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=107000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','2026-03-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNG55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','2026-03-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN23H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','2026-03-14','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','2026-03-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','2026-03-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','2026-03-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,54000,'Transferencia','Confirmado','2026-03-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=54000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,fecha,tipo_registro,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','2026-03-16','normal',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMZ60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=60000);
COMMIT;
SELECT COUNT(*) as pagos_total FROM pagos;
