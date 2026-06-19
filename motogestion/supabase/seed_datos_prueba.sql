-- ================================================================
-- DATOS DE PRUEBA — MotoGestión
-- Ejecutar DESPUÉS de todas las migraciones (001 al 008)
-- IMPORTANTE: Ajusta los UUIDs de profiles al ejecutar
-- ================================================================

-- NOTA: Para obtener el UUID de tu usuario admin, ejecuta primero:
-- SELECT id FROM profiles WHERE role IN ('ADMIN','ADMIN_PRINCIPAL') LIMIT 1;
-- Y reemplaza el valor de ADMIN_ID abajo.

DO $$
DECLARE
  admin_id uuid;
  c1_id uuid := gen_random_uuid();
  c2_id uuid := gen_random_uuid();
  c3_id uuid := gen_random_uuid();
  c4_id uuid := gen_random_uuid();
  c5_id uuid := gen_random_uuid();
  m1_id uuid := gen_random_uuid();
  m2_id uuid := gen_random_uuid();
  m3_id uuid := gen_random_uuid();
  m4_id uuid := gen_random_uuid();
  m5_id uuid := gen_random_uuid();
  ct1_id uuid := gen_random_uuid();
  ct2_id uuid := gen_random_uuid();
BEGIN

  -- Obtener el primer admin disponible
  SELECT id INTO admin_id FROM profiles WHERE role IN ('ADMIN_PRINCIPAL','ADMIN') LIMIT 1;

  -- ============================================================
  -- CLIENTES
  -- ============================================================
  INSERT INTO clientes (id, nombre, cedula, telefono, direccion, barrio, ciudad, estado, referido_por, created_at)
  VALUES
    (c1_id, 'Carlos Andrés Martínez', '1234567890', '3001234567', 'Calle 15 #20-45', 'El Bosque', 'Cartagena', 'Activo', 'Pedro García', NOW() - INTERVAL '6 months'),
    (c2_id, 'María Fernanda López', '9876543210', '3109876543', 'Carrera 8 #12-30', 'Manga', 'Cartagena', 'Activo', NULL, NOW() - INTERVAL '4 months'),
    (c3_id, 'Juan David Pérez', '1122334455', '3201122334', 'Av. Pedro de Heredia #40-10', 'Torices', 'Cartagena', 'Activo', 'Carlos Martínez', NOW() - INTERVAL '2 months'),
    (c4_id, 'Luisa Camila Torres', '5566778899', '3015566778', 'Calle 30 #5-20', 'Olaya Herrera', 'Cartagena', 'Aprobado', NULL, NOW() - INTERVAL '1 month'),
    (c5_id, 'Andrés Felipe Gómez', '3344556677', '3153344556', 'Cra 22 #18-50', 'La Esperanza', 'Cartagena', 'Pendiente', 'María López', NOW() - INTERVAL '15 days');

  -- Documentos de clientes activos (marcados como completos)
  INSERT INTO documentos_cliente (cliente_id, tipo, url, verificado)
  VALUES
    (c1_id, 'cedula_frente', 'doc_c1_cedula_frente.jpg', true),
    (c1_id, 'cedula_reverso', 'doc_c1_cedula_reverso.jpg', true),
    (c1_id, 'licencia_conduccion', 'doc_c1_licencia.jpg', true),
    (c1_id, 'foto_perfil', 'doc_c1_foto.jpg', true),
    (c2_id, 'cedula_frente', 'doc_c2_cedula_frente.jpg', true),
    (c2_id, 'cedula_reverso', 'doc_c2_cedula_reverso.jpg', true),
    (c2_id, 'licencia_conduccion', 'doc_c2_licencia.jpg', true),
    (c2_id, 'foto_perfil', 'doc_c2_foto.jpg', true);

  -- ============================================================
  -- MOTOS
  -- ============================================================
  INSERT INTO motos (id, placa, grupo, marca, modelo, numero_motor, numero_chasis, cilindraje, estado, ubicacion_fisica, observaciones, created_at)
  VALUES
    (m1_id, 'ABC123', 'CLUB', 'HONDA', 'CB125F', 'MOT001XYZ', 'CHA001XYZ', '125cc', 'Asignada', 'con_cliente', 'Moto en buen estado', NOW() - INTERVAL '6 months'),
    (m2_id, 'DEF456', 'CLUB', 'YAMAHA', 'YBR125', 'MOT002XYZ', 'CHA002XYZ', '125cc', 'Asignada', 'con_cliente', 'Revisada en mayo', NOW() - INTERVAL '4 months'),
    (m3_id, 'GHI789', 'PRADERA', 'SUZUKI', 'GS150R', 'MOT003XYZ', 'CHA003XYZ', '150cc', 'Disponible', 'bodega', 'Lista para entregar', NOW() - INTERVAL '8 months'),
    (m4_id, 'JKL012', 'PRADERA', 'HONDA', 'CG150', 'MOT004XYZ', 'CHA004XYZ', '150cc', 'Mantenimiento', 'taller', 'Cambio de aceite pendiente', NOW() - INTERVAL '3 months'),
    (m5_id, 'MNO345', 'COSTA', 'YAMAHA', 'FZ150', 'MOT005XYZ', 'CHA005XYZ', '150cc', 'Disponible', 'bodega', 'Moto nueva', NOW() - INTERVAL '1 month');

  -- ============================================================
  -- CONTRATOS
  -- ============================================================
  INSERT INTO contratos (id, cliente_id, moto_id, dia_pago, valor_semanal, meses, ahorro_inicial, fecha_entrega, firma_cliente, firma_responsable, estado, tipo_contrato, tarifa_diaria, tarifa_domingo, base_inicial, base_completada, created_at)
  VALUES
    (ct1_id, c1_id, m1_id, 'Lunes', 50000, 12, 510000, NOW() - INTERVAL '6 months', true, true, 'Activo', 'semanal', 27000, 14000, 510000, true, NOW() - INTERVAL '6 months'),
    (ct2_id, c2_id, m2_id, 'Martes', 60000, 18, 510000, NOW() - INTERVAL '4 months', true, true, 'Activo', 'semanal', 27000, 14000, 510000, true, NOW() - INTERVAL '4 months');

  -- ============================================================
  -- PAGOS de prueba (últimas 8 semanas para contrato 1)
  -- ============================================================
  INSERT INTO pagos (contrato_id, cliente_id, monto, metodo_pago, confirmado, fecha_pago, notas, created_at)
  VALUES
    (ct1_id, c1_id, 50000, 'Efectivo', true, NOW() - INTERVAL '7 weeks', 'Pago semanal', NOW() - INTERVAL '7 weeks'),
    (ct1_id, c1_id, 50000, 'Nequi', true, NOW() - INTERVAL '6 weeks', 'Comprobante enviado por WhatsApp', NOW() - INTERVAL '6 weeks'),
    (ct1_id, c1_id, 50000, 'Efectivo', true, NOW() - INTERVAL '5 weeks', 'Pago puntual', NOW() - INTERVAL '5 weeks'),
    (ct1_id, c1_id, 50000, 'Efectivo', true, NOW() - INTERVAL '4 weeks', NULL, NOW() - INTERVAL '4 weeks'),
    (ct1_id, c1_id, 50000, 'Efectivo', true, NOW() - INTERVAL '3 weeks', NULL, NOW() - INTERVAL '3 weeks'),
    (ct1_id, c1_id, 50000, 'Nequi', true, NOW() - INTERVAL '2 weeks', 'Pagó el martes (un día de gabela)', NOW() - INTERVAL '2 weeks'),
    (ct1_id, c1_id, 50000, 'Efectivo', true, NOW() - INTERVAL '1 week', NULL, NOW() - INTERVAL '1 week'),
    -- Pagos contrato 2
    (ct2_id, c2_id, 60000, 'Efectivo', true, NOW() - INTERVAL '4 weeks', NULL, NOW() - INTERVAL '4 weeks'),
    (ct2_id, c2_id, 60000, 'Nequi', true, NOW() - INTERVAL '3 weeks', NULL, NOW() - INTERVAL '3 weeks'),
    (ct2_id, c2_id, 60000, 'Efectivo', true, NOW() - INTERVAL '2 weeks', NULL, NOW() - INTERVAL '2 weeks'),
    (ct2_id, c2_id, 60000, 'Efectivo', true, NOW() - INTERVAL '1 week', NULL, NOW() - INTERVAL '1 week');

  -- ============================================================
  -- VISITA de ejemplo
  -- ============================================================
  INSERT INTO visitas_cliente (cliente_id, tipo, notas, realizada_por)
  VALUES (c3_id, 'domiciliaria', 'Cliente vive en apartamento propio, vecinos conocidos. Referencias positivas.', admin_id);

  -- ============================================================
  -- HISTORIAL UBICACIONES de motos
  -- ============================================================
  INSERT INTO historial_ubicaciones (moto_id, ubicacion_anterior, ubicacion_nueva, motivo, registrado_por)
  VALUES
    (m1_id, 'bodega', 'con_cliente', 'Activación de contrato - entrega al cliente Carlos Martínez', admin_id),
    (m2_id, 'bodega', 'con_cliente', 'Activación de contrato - entrega al cliente María López', admin_id),
    (m4_id, 'con_cliente', 'taller', 'Ingreso a mantenimiento preventivo', admin_id);

END $$;
