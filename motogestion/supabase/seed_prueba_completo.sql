-- ================================================================
-- SEED COMPLETO DE PRUEBA v2 — MotoGestión
-- 20 clientes · 20 motos · 14 contratos · pagos · deudas · convenios
-- Ejecutar en Supabase SQL Editor
-- ================================================================

DO $$
DECLARE
  admin_id uuid;

  -- Clientes
  c01 uuid := gen_random_uuid(); c02 uuid := gen_random_uuid();
  c03 uuid := gen_random_uuid(); c04 uuid := gen_random_uuid();
  c05 uuid := gen_random_uuid(); c06 uuid := gen_random_uuid();
  c07 uuid := gen_random_uuid(); c08 uuid := gen_random_uuid();
  c09 uuid := gen_random_uuid(); c10 uuid := gen_random_uuid();
  c11 uuid := gen_random_uuid(); c12 uuid := gen_random_uuid();
  c13 uuid := gen_random_uuid(); c14 uuid := gen_random_uuid();
  c15 uuid := gen_random_uuid(); c16 uuid := gen_random_uuid();
  c17 uuid := gen_random_uuid(); c18 uuid := gen_random_uuid();
  c19 uuid := gen_random_uuid(); c20 uuid := gen_random_uuid();

  -- Motos
  m01 uuid := gen_random_uuid(); m02 uuid := gen_random_uuid();
  m03 uuid := gen_random_uuid(); m04 uuid := gen_random_uuid();
  m05 uuid := gen_random_uuid(); m06 uuid := gen_random_uuid();
  m07 uuid := gen_random_uuid(); m08 uuid := gen_random_uuid();
  m09 uuid := gen_random_uuid(); m10 uuid := gen_random_uuid();
  m11 uuid := gen_random_uuid(); m12 uuid := gen_random_uuid();
  m13 uuid := gen_random_uuid(); m14 uuid := gen_random_uuid();
  m15 uuid := gen_random_uuid(); m16 uuid := gen_random_uuid();
  m17 uuid := gen_random_uuid(); m18 uuid := gen_random_uuid();
  m19 uuid := gen_random_uuid(); m20 uuid := gen_random_uuid();

  -- Contratos
  ct01 uuid := gen_random_uuid(); ct02 uuid := gen_random_uuid();
  ct03 uuid := gen_random_uuid(); ct04 uuid := gen_random_uuid();
  ct05 uuid := gen_random_uuid(); ct06 uuid := gen_random_uuid();
  ct07 uuid := gen_random_uuid(); ct08 uuid := gen_random_uuid();
  ct09 uuid := gen_random_uuid(); ct10 uuid := gen_random_uuid();
  ct11 uuid := gen_random_uuid(); ct12 uuid := gen_random_uuid();
  ct13 uuid := gen_random_uuid(); ct14 uuid := gen_random_uuid();

  -- Deudas y convenios
  d01 uuid := gen_random_uuid(); d02 uuid := gen_random_uuid();
  d03 uuid := gen_random_uuid(); d04 uuid := gen_random_uuid();
  conv01 uuid := gen_random_uuid();

BEGIN
  SELECT id INTO admin_id FROM profiles WHERE role IN ('ADMIN_PRINCIPAL','ADMIN') LIMIT 1;

  -- ============================================================
  -- CLIENTES (20) — varios estados
  -- ============================================================
  INSERT INTO clientes (id, nombre, cedula, telefono, direccion, estado, created_at) VALUES
    -- Activos (tienen contrato activo)
    (c01,'Carlos Andrés Martínez','1001234567','3001234501','Calle 15 #20-45, El Bosque',     'Activo',   NOW()-INTERVAL '8 months'),
    (c02,'María Fernanda López',  '1001234568','3001234502','Carrera 8 #12-30, Manga',        'Activo',   NOW()-INTERVAL '7 months'),
    (c03,'Juan David Pérez',      '1001234569','3001234503','Av. Pedro de Heredia #40-10',    'Activo',   NOW()-INTERVAL '6 months'),
    (c04,'Luisa Camila Torres',   '1001234570','3001234504','Calle 30 #5-20, Olaya',          'Activo',   NOW()-INTERVAL '5 months'),
    (c05,'Andrés Felipe Gómez',   '1001234571','3001234505','Cra 22 #18-50, La Esperanza',    'Activo',   NOW()-INTERVAL '4 months'),
    (c06,'Sandra Patricia Ríos',  '1001234572','3001234506','Calle 70 #40-15, Bosque',        'Activo',   NOW()-INTERVAL '3 months'),
    (c07,'Roberto Carlos Díaz',   '1001234573','3001234507','Carrera 50 #30-20, Chiquinquirá','Activo',   NOW()-INTERVAL '3 months'),
    (c08,'Diana Marcela Vargas',  '1001234574','3001234508','Calle 29 #16-40, Torices',       'Activo',   NOW()-INTERVAL '2 months'),
    (c09,'Héctor Luis Mendoza',   '1001234575','3001234509','Cra 17 #22-10, El Campestre',    'Activo',   NOW()-INTERVAL '2 months'),
    (c10,'Patricia Elena Suárez', '1001234576','3001234510','Av. El Lago #10-20, Ternera',    'Activo',   NOW()-INTERVAL '45 days'),
    -- Aprobados (listos para contrato)
    (c11,'Miguel Ángel Herrera',  '1001234577','3001234511','Calle 5 #8-30, Pie de la Popa',  'Aprobado', NOW()-INTERVAL '20 days'),
    (c12,'Claudia Inés Morales',  '1001234578','3001234512','Cra 3 #15-60, Getsemaní',        'Aprobado', NOW()-INTERVAL '15 days'),
    (c13,'Fabio Ernesto Castro',  '1001234579','3001234513','Calle 44 #20-10, Boston',        'Aprobado', NOW()-INTERVAL '10 days'),
    -- Pendientes de aprobación
    (c14,'Yolanda Beatriz Niño',  '1001234580','3001234514','Cra 60 #45-30, Villa Sandra',    'Pendiente',NOW()-INTERVAL '5 days'),
    (c15,'Jorge Iván Castillo',   '1001234581','3001234515','Calle 31 #12-20, Nuevo Bosque',  'Pendiente',NOW()-INTERVAL '3 days'),
    (c16,'Amparo Cecilia Rojas',  '1001234582','3001234516','Cra 90 #70-15, La Playa',        'Pendiente',NOW()-INTERVAL '2 days'),
    -- Rechazados
    (c17,'Eduardo Antonio Peña',  '1001234583','3001234517','Calle 68 #30-50, Los Alpes',     'Rechazado',NOW()-INTERVAL '30 days'),
    (c18,'Natalia Sofía Medina',  '1001234584','3001234518','Av. Crisanto Luque #5-10',       'Rechazado',NOW()-INTERVAL '25 days'),
    -- Finalizados
    (c19,'Bernardo José Acosta',  '1001234585','3001234519','Calle 20 #40-30, Canapote',      'Activo',   NOW()-INTERVAL '12 months'),
    (c20,'Gloria Amparo Fuentes', '1001234586','3001234520','Cra 15 #10-20, El Toril',        'Activo',   NOW()-INTERVAL '10 months');

  -- ============================================================
  -- MOTOS (20) — grupos y estados variados
  -- ============================================================
  INSERT INTO motos (id, placa, grupo, marca, modelo, numero_motor, numero_chasis, cilindraje, condicion_ingreso, estado, observaciones, created_at) VALUES
    -- COSTA — Asignadas
    (m01,'ABC001','COSTA', 'HONDA',   'CB125F',  'MOT01A','CHA01A','125cc','nueva',   'Asignada',     'Entregada a cliente activo',         NOW()-INTERVAL '8 months'),
    (m02,'ABC002','COSTA', 'YAMAHA',  'YBR125',  'MOT02A','CHA02A','125cc','usada',   'Asignada',     'Buen estado general',                NOW()-INTERVAL '7 months'),
    (m03,'ABC003','COSTA', 'SUZUKI',  'GS125',   'MOT03A','CHA03A','125cc','usada',   'Asignada',     'Revisada antes de entrega',          NOW()-INTERVAL '6 months'),
    (m04,'ABC004','COSTA', 'AKT',     'NKD125',  'MOT04A','CHA04A','125cc','nueva',   'Asignada',     'Cliente en mora',                    NOW()-INTERVAL '5 months'),
    -- COSTA — Disponibles
    (m05,'ABC005','COSTA', 'HONDA',   'CB150R',  'MOT05A','CHA05A','150cc','nueva',   'Disponible',   'Lista para entregar',                NOW()-INTERVAL '2 months'),
    (m06,'ABC006','COSTA', 'YAMAHA',  'FZ150',   'MOT06A','CHA06A','150cc','usada',   'Disponible',   'Recién salida de taller',            NOW()-INTERVAL '1 month'),
    -- PRADERA — Asignadas
    (m07,'PRD007','PRADERA','HONDA',  'XRE300',  'MOT07B','CHA07B','300cc','nueva',   'Asignada',     'Contrato mensual activo',            NOW()-INTERVAL '4 months'),
    (m08,'PRD008','PRADERA','YAMAHA', 'MT03',    'MOT08B','CHA08B','300cc','usada',   'Asignada',     'Cliente al día',                     NOW()-INTERVAL '3 months'),
    (m09,'PRD009','PRADERA','SUZUKI', 'GS150R',  'MOT09B','CHA09B','150cc','nueva',   'Asignada',     'Contrato quincenal',                 NOW()-INTERVAL '2 months'),
    (m10,'PRD010','PRADERA','AKT',    'TTR200',  'MOT10B','CHA10B','200cc','usada',   'Asignada',     'Pago pendiente revisión',            NOW()-INTERVAL '45 days'),
    -- PRADERA — Mantenimiento
    (m11,'PRD011','PRADERA','HONDA',  'CB190R',  'MOT11B','CHA11B','190cc','usada',   'Mantenimiento','Cambio de frenos y aceite',          NOW()-INTERVAL '3 months'),
    (m12,'PRD012','PRADERA','YAMAHA', 'YBR125',  'MOT12B','CHA12B','125cc','usada',   'Mantenimiento','Falla eléctrica en revisión',        NOW()-INTERVAL '2 months'),
    -- RASTREADOR — Asignadas y retenidas
    (m13,'RST013','RASTREADOR','HONDA','CB125F',  'MOT13C','CHA13C','125cc','nueva',   'Asignada',     'Contrato diario activo',             NOW()-INTERVAL '3 months'),
    (m14,'RST014','RASTREADOR','YAMAHA','YBR125', 'MOT14C','CHA14C','125cc','usada',   'Asignada',     'Al día en pagos',                    NOW()-INTERVAL '2 months'),
    (m15,'RST015','RASTREADOR','SUZUKI','GS125',  'MOT15C','CHA15C','125cc','usada',   'Fiscalia',     'Retenida por fiscalía desde jun 10',  NOW()-INTERVAL '10 days'),
    (m16,'RST016','RASTREADOR','AKT',  'NKD125',  'MOT16C','CHA16C','125cc','nueva',   'Transito',     'Retenida por tránsito, multa pendiente',NOW()-INTERVAL '5 days'),
    -- OTRO — Estados especiales
    (m17,'OTR017','OTRO',   'HONDA',  'CG150',   'MOT17D','CHA17D','150cc','nueva',   'Garantia',     'Falla de fábrica en motor',          NOW()-INTERVAL '1 month'),
    (m18,'OTR018','OTRO',   'YAMAHA', 'FZ200',   'MOT18D','CHA18D','200cc','usada',   'Recuperada',   'Recuperada por mora, en bodega',     NOW()-INTERVAL '2 months'),
    (m19,'OTR019','OTRO',   'HONDA',  'CB125F',  'MOT19D','CHA19D','125cc','nueva',   'Disponible',   'Nunca entregada, disponible',        NOW()-INTERVAL '15 days'),
    (m20,'OTR020','OTRO',   'SUZUKI', 'AX100',   'MOT20D','CHA20D','100cc','usada',   'Disponible',   'Devuelta por cliente, lista',        NOW()-INTERVAL '7 days');

  -- Retenciones para m15 y m16
  UPDATE motos SET
    retencion_fecha = CURRENT_DATE - 10,
    retencion_numero_caso = 'FIS-2026-0441',
    retencion_detalle = 'Retenida en operativo nocturno sector Bocagrande'
  WHERE id = m15;

  UPDATE motos SET
    retencion_fecha = CURRENT_DATE - 5,
    retencion_numero_caso = 'TRA-2026-1182',
    retencion_detalle = 'Infracción de tránsito, documentos vencidos'
  WHERE id = m16;

  -- ============================================================
  -- CONTRATOS (14) — varios estados y modalidades
  -- ============================================================
  INSERT INTO contratos (id, cliente_id, moto_id, dia_pago, forma_pago, valor_semanal, meses, ahorro_inicial, fecha_entrega, firma_cliente, firma_responsable, estado, tarifa_diaria, tarifa_domingo, base_inicial, base_completada, created_at) VALUES
    -- Activos semanales
    (ct01,c01,m01,'Lunes',   'Semanal',  100000,12,510000,'2025-10-20',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '8 months'),
    (ct02,c02,m02,'Martes',  'Semanal',  120000,18,510000,'2025-11-15',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '7 months'),
    (ct03,c03,m03,'Miércoles','Semanal',  90000,12,510000,'2025-12-01',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '6 months'),
    (ct04,c04,m04,'Jueves',  'Semanal',  150000,24,510000,'2026-01-10',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '5 months'),
    -- Activos quincenales
    (ct05,c05,m07,'Lunes',   'Quincenal',200000,12,510000,'2026-02-05',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '4 months'),
    (ct06,c06,m08,'Viernes', 'Quincenal',180000,18,510000,'2026-03-01',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '3 months'),
    -- Activos mensuales
    (ct07,c07,m09,'Lunes',   'Mensual',  400000,12,510000,'2026-03-15',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '3 months'),
    (ct08,c08,m10,'Martes',  'Mensual',  350000,18,510000,'2026-04-01',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '2 months'),
    -- Activos diarios (indefinidos)
    (ct09,c09,m13,'Lunes',   'Diario',    27000,NULL,510000,'2026-04-15',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '2 months'),
    (ct10,c10,m14,'Miércoles','Diario',   27000,NULL,510000,'2026-05-06',true,true,'Activo', 27000,14000,510000,true,NOW()-INTERVAL '45 days'),
    -- En proceso
    (ct11,c11,NULL,'Lunes',  'Semanal',  100000,12,510000,'2026-07-01',true,false,'En proceso',27000,14000,510000,false,NOW()-INTERVAL '10 days'),
    (ct12,c12,NULL,'Viernes','Quincenal',200000,12,510000,'2026-07-15',false,false,'En proceso',27000,14000,510000,false,NOW()-INTERVAL '5 days'),
    -- Finalizados
    (ct13,c19,m18,'Lunes',   'Semanal',   80000,12,510000,'2024-10-01',true,true,'Finalizado',26000,13000,510000,true,NOW()-INTERVAL '12 months'),
    -- Cancelado
    (ct14,c20,NULL,'Martes', 'Semanal',  100000,12,300000,'2025-10-01',true,false,'Cancelado', 27000,14000,510000,false,NOW()-INTERVAL '10 months');

  -- ============================================================
  -- PAGOS para contratos activos
  -- ============================================================
  INSERT INTO pagos (contrato_id, valor, metodo, estado, aplicado, aplicado_tarifa, aplicado_deuda, aplicado_convenio, aplicado_ahorro, aplicado_saldo_favor, fecha, created_at) VALUES
    -- ct01 (semanal 100k) — al día, historial de 8 semanas
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-56,NOW()-INTERVAL '8 weeks'),
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-49,NOW()-INTERVAL '7 weeks'),
    (ct01,100000,'Nequi',   'Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-42,NOW()-INTERVAL '6 weeks'),
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-35,NOW()-INTERVAL '5 weeks'),
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-28,NOW()-INTERVAL '4 weeks'),
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-21,NOW()-INTERVAL '3 weeks'),
    (ct01,100000,'Nequi',   'Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-14,NOW()-INTERVAL '2 weeks'),
    (ct01,100000,'Efectivo','Confirmado','{"tarifa":100000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',100000,0,0,0,0,CURRENT_DATE-7, NOW()-INTERVAL '1 week'),
    -- ct02 (semanal 120k) — en mora, lleva 2 semanas sin pagar completo
    (ct02,120000,'Efectivo','Confirmado','{"tarifa":120000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',120000,0,0,0,0,CURRENT_DATE-42,NOW()-INTERVAL '6 weeks'),
    (ct02,120000,'Efectivo','Confirmado','{"tarifa":120000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',120000,0,0,0,0,CURRENT_DATE-35,NOW()-INTERVAL '5 weeks'),
    (ct02,120000,'Nequi',   'Confirmado','{"tarifa":120000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',120000,0,0,0,0,CURRENT_DATE-28,NOW()-INTERVAL '4 weeks'),
    (ct02,60000, 'Efectivo','Confirmado','{"tarifa":60000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 60000, 0,0,0,0,CURRENT_DATE-14,NOW()-INTERVAL '2 weeks'),
    -- ct03 (semanal 90k) — al día
    (ct03,90000, 'Efectivo','Confirmado','{"tarifa":90000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 90000, 0,0,0,0,CURRENT_DATE-21,NOW()-INTERVAL '3 weeks'),
    (ct03,90000, 'Nequi',   'Confirmado','{"tarifa":90000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 90000, 0,0,0,0,CURRENT_DATE-14,NOW()-INTERVAL '2 weeks'),
    (ct03,90000, 'Efectivo','Confirmado','{"tarifa":90000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 90000, 0,0,0,0,CURRENT_DATE-7, NOW()-INTERVAL '1 week'),
    -- ct04 (semanal 150k) — en gabela, pago pendiente
    (ct04,150000,'Efectivo','Confirmado','{"tarifa":150000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',150000,0,0,0,0,CURRENT_DATE-14,NOW()-INTERVAL '2 weeks'),
    (ct04,75000, 'Nequi',   'Pendiente', '{"tarifa":75000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 75000, 0,0,0,0,CURRENT_DATE-1, NOW()-INTERVAL '1 day'),
    -- ct05 (quincenal 200k) — al día
    (ct05,200000,'Efectivo','Confirmado','{"tarifa":200000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',200000,0,0,0,0,CURRENT_DATE-30,NOW()-INTERVAL '30 days'),
    (ct05,200000,'Efectivo','Confirmado','{"tarifa":200000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',200000,0,0,0,0,CURRENT_DATE-15,NOW()-INTERVAL '15 days'),
    -- ct06 (quincenal 180k) — mora, con deuda
    (ct06,180000,'Efectivo','Confirmado','{"tarifa":180000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',180000,0,0,0,0,CURRENT_DATE-45,NOW()-INTERVAL '45 days'),
    (ct06,90000, 'Efectivo','Confirmado','{"tarifa":90000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 90000, 0,0,0,0,CURRENT_DATE-30,NOW()-INTERVAL '30 days'),
    -- ct07 (mensual 400k) — al día
    (ct07,400000,'Efectivo','Confirmado','{"tarifa":400000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',400000,0,0,0,0,CURRENT_DATE-60,NOW()-INTERVAL '60 days'),
    (ct07,400000,'Nequi',   'Confirmado','{"tarifa":400000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',400000,0,0,0,0,CURRENT_DATE-30,NOW()-INTERVAL '30 days'),
    -- ct08 (mensual 350k) — pago parcial pendiente
    (ct08,350000,'Efectivo','Confirmado','{"tarifa":350000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',350000,0,0,0,0,CURRENT_DATE-60,NOW()-INTERVAL '60 days'),
    (ct08,200000,'Nequi',   'Pendiente', '{"tarifa":200000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}',200000,0,0,0,0,CURRENT_DATE-2, NOW()-INTERVAL '2 days'),
    -- ct09 (diario 27k) — varios días pagados
    (ct09,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-5, NOW()-INTERVAL '5 days'),
    (ct09,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-4, NOW()-INTERVAL '4 days'),
    (ct09,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-3, NOW()-INTERVAL '3 days'),
    (ct09,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-2, NOW()-INTERVAL '2 days'),
    (ct09,27000, 'Nequi',   'Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-1, NOW()-INTERVAL '1 day'),
    -- ct10 (diario 27k) — debe 2 días
    (ct10,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-4, NOW()-INTERVAL '4 days'),
    (ct10,27000, 'Efectivo','Confirmado','{"tarifa":27000,"deuda":0,"convenio":0,"ahorro":0,"saldo":0}', 27000, 0,0,0,0,CURRENT_DATE-3, NOW()-INTERVAL '3 days');

  -- ============================================================
  -- DEUDAS
  -- ============================================================
  INSERT INTO deudas (id, contrato_id, concepto, descripcion, monto, monto_pendiente, estado, registrado_por, created_at) VALUES
    -- ct02 en mora: deuda de tarifa atrasada
    (d01,ct02,'tarifa_atrasada','Semana del 2 al 8 de junio sin pagar completo',60000,60000,'pendiente',admin_id,NOW()-INTERVAL '14 days'),
    -- ct06 en mora: deuda por daño
    (d02,ct06,'daño_vehiculo','Rayón en guardabarro delantero detectado en revisión',150000,150000,'pendiente',admin_id,NOW()-INTERVAL '20 days'),
    (d03,ct06,'tarifa_atrasada','Quincena del 1 al 15 de junio sin completar',90000,90000,'pendiente',admin_id,NOW()-INTERVAL '10 days'),
    -- ct04: préstamo de repuesto con convenio
    (d04,ct04,'prestamo_repuesto','Cambio de llanta trasera, empresa asumió costo',80000,80000,'en_convenio',admin_id,NOW()-INTERVAL '30 days');

  -- ============================================================
  -- CONVENIO (ct04 tiene convenio activo para pagar el préstamo)
  -- ============================================================
  INSERT INTO convenios (id, contrato_id, numero_convenio, deuda_total, cuota_por_periodo, numero_cuotas, cuotas_pagadas, fecha_limite, estado, concepto, aprobado_por, created_at) VALUES
    (conv01,ct04,1,80000,10000,8,2,'2026-08-31','activo','Pago de llanta trasera en 8 cuotas semanales de $10.000',admin_id,NOW()-INTERVAL '30 days');

  -- ============================================================
  -- GESTIONES DE COBRO (para contratos en mora)
  -- ============================================================
  INSERT INTO gestiones (contrato_id, tipo, resultado, registrado_por, fecha, created_at) VALUES
    (ct02,'llamada',  'Cliente dice que paga el lunes, promete ponerse al día', admin_id, CURRENT_DATE-10, NOW()-INTERVAL '10 days'),
    (ct02,'whatsapp', 'Se envió mensaje de aviso, no respondió',                admin_id, CURRENT_DATE-7,  NOW()-INTERVAL '7 days'),
    (ct02,'llamada',  'No contesta, buzón de voz',                              admin_id, CURRENT_DATE-3,  NOW()-INTERVAL '3 days'),
    (ct06,'llamada',  'Cliente informa problema económico, solicita convenio',  admin_id, CURRENT_DATE-15, NOW()-INTERVAL '15 days'),
    (ct06,'visita',   'Se visitó el domicilio, cliente en casa, promete pagar', admin_id, CURRENT_DATE-8,  NOW()-INTERVAL '8 days');

END $$;
