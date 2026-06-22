-- PAGOS PARTE 1/5 — 679 registros
BEGIN;

INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-01' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-01' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-03-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-01' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,900000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,900000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=900000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,55000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,55000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,160000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,160000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=160000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,175000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,175000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=175000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,145000,0,0,0,0,NULL,'2026-03-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-02' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,81000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,81000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=81000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,227000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,227000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=227000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,177000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,177000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=177000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,135000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-03' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,400000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,400000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,113000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,113000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=113000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,55000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,61000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,61000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=61000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,145000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,145000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,34000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,34000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=34000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,193000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,193000,0,0,0,0,NULL,'2026-03-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-04' AND ex.valor=193000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,82000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,82000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=82000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,173000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,173000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=173000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,82000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,82000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=82000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-05' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,43000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,43000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=43000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,25000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,25000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=25000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-06' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-08' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,510000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,196000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,196000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=196000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,214000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,214000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=214000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-03-09',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-09' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,49000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,49000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=49000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,245000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,245000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=245000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,155000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,155000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-10',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-10' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,125000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,125000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,85000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,85000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=85000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,115000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,115000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,12000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,12000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=12000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,108000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,108000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=108000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-11',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-11' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,410000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,410000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=410000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,123000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,123000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=123000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-12',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-12' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,155000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,155000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=155000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,162000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,162000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=162000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,230000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,230000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-13',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-13' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,380000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,380000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=380000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,73000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,73000,0,0,0,0,NULL,'2026-03-14',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-14' AND ex.valor=73000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-15' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-03-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-15' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-15' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-15' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-15',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-15' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,59000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,59000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=59000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,135000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,135000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,115000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,115000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=115000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,175000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,175000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=175000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,250000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,250000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=250000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,162000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,162000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=162000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,185000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,185000,0,0,0,0,NULL,'2026-03-16',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-16' AND ex.valor=185000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,204000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,204000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=204000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-17',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-17' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-18',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-18' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,400000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,400000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=400000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,225000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,225000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=225000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-19',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-19' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,75000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,75000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=75000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,7000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,7000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=7000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-20',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-20' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,109000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,109000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=109000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,99500,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,99500,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=99500);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-21',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-21' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-23',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-23' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,165000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,165000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=165000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,132000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,132000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=132000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,290000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,290000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=290000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,206000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,206000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=206000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-24',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-24' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,107000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,107000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=107000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,54000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,54000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=54000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,102000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,102000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=102000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,52000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,52000,0,0,0,0,NULL,'2026-03-25',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-25' AND ex.valor=52000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,182000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,182000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=182000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,55000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,55000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=55000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,510000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,510000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,510000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,145000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,145000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=145000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,300000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,300000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=300000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-26',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-26' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,230000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,230000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=230000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,20000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,20000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=20000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,224500,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,224500,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=224500);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML44H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,215000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,215000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=215000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,135000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,135000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=135000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-27',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-27' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,44500,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,44500,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=44500);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ85H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,182000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,182000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=182000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,80000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,80000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=80000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,15000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,15000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=15000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,280000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,280000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=280000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,70000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,70000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=70000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-28',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-28' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-29' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-03-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-29' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-29' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-29',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-29' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,175000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,175000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=175000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,10000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,10000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=10000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,510000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,510000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=510000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,78000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,78000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=78000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,47000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,47000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=47000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,193000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,193000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=193000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU50I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW65I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,188000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,188000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=188000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,9000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,9000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=9000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-03-30',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-30' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU51I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML41H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ97H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,260000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,260000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=260000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ95H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY50H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,60000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,60000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=60000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ79H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL62H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,114000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,114000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=114000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-03-31',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ96H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-03-31' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,130000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,130000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=130000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,33000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,33000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=33000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL59H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,105000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,105000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=105000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ98H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL65H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,17000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,17000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=17000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU52I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMB51H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,103000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,103000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=103000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO09H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ86H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,65000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,65000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=65000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMW28H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML55H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,420000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,420000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ77H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=420000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM70H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ81H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-01',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY53H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-01' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL64H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,95000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,95000,0,0,0,0,NULL,'2026-04-02',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML42H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-02' AND ex.valor=95000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,30000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,30000,0,0,0,0,NULL,'2026-04-03',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-03' AND ex.valor=30000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU38I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU30I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZO72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,404000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,404000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL63H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=404000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,51000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,51000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=51000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-04',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM69H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-04' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-05',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-05' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY45H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,220000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,220000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=220000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU57I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ90H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM71H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY17H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZZ84H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ92H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL61H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL77I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,167000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,167000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ94H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=167000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,205000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,205000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU56I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=205000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW63I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,62000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,62000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=62000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,110000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,110000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ43H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=110000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,152000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,152000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=152000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,201000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,201000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZT91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=201000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU53I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQF59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,210000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,210000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU55I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=210000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU44I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='YAL60H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU45I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,240000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,240000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU54I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=240000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU60I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW47I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU43I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU58I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-06',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNK54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-06' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,50000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,50000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=50000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU46I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU39I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT88H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ83H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW62I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU42I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,90000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,90000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XYZ46H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=90000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,120000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,120000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQG96I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=120000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU32I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ93H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='XZN82H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,101000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,101000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM68H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=101000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RNN29H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,190000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,190000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML57H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=190000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML52H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,100000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,100000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ89H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=100000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,815000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,815000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=815000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU48I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ91H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,195000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,195000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMU58H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=195000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,234000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,234000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLT72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=234000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,140000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,140000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM72H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=140000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,200000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,200000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMY48H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=200000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,180000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,180000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL81I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=180000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,125000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,125000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML47H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=125000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU59I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,202000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,202000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPW61I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=202000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,85000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,85000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLY56H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=85000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,171000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,171000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DQL71I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=171000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,199000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,199000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='DPU40I' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=199000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,40000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,40000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RLZ87H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=40000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,150000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,150000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML49H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=150000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,45000,'Transferencia','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,45000,0,0,0,0,NULL,'2026-04-07',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RMM66H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-07' AND ex.valor=45000);
INSERT INTO pagos (contrato_id,valor,metodo,estado,tipo_registro,registrado_por,comprobante_url,aplicado,aplicado_tarifa,aplicado_deuda,aplicado_convenio,aplicado_ahorro,aplicado_saldo_favor,convenio_id,fecha,created_at)
SELECT c.id,98000,'Efectivo','Confirmado','normal',NULL,NULL,'{"deuda":0,"semana":0,"ahorro":0,"convenio":0,"saldo":0}'::jsonb,98000,0,0,0,0,NULL,'2026-04-08',now()
FROM contratos c JOIN motos m ON m.id=c.moto_id
WHERE m.placa='RML54H' AND c.estado='Activo'
AND NOT EXISTS(SELECT 1 FROM pagos ex WHERE ex.contrato_id=c.id AND ex.fecha='2026-04-08' AND ex.valor=98000);

COMMIT;
SELECT COUNT(*) as pagos_total FROM pagos;
