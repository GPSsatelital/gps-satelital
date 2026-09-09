-- 137 — LO QUE ZALA PIDIÓ AL CONECTARSE (9-sep-2026)
--
-- Dos cosas, ninguna toca cuentas ni vistas:
--
-- 1) `cobro_mora_v1` YA EXISTE en Meta, aprobada, con otro texto y dos variables. Meta no permite
--    dos plantillas con el mismo nombre e idioma, y un nombre borrado no se puede reusar en un mes.
--    La nuestra pasa a llamarse `cobro_mora_v2`. El texto no cambia: solo el nombre con que ZALA la
--    registra. Como el nombre vive en la BASE y no en el código, esto es una celda.
--
-- 2) ZALA leyó el diccionario entero y encontró 13 columnas que las vistas ya devuelven pero que
--    nadie documentó. Por nuestra propia regla ("si no está en el diccionario, no existe para
--    ZALA"), hoy no las puede usar aunque las esté viendo. Se publican con su significado y con
--    `zala_lo_dice`, que es lo que gobierna si se le puede decir al cliente.

-- ── 1) El nombre de la plantilla de mora ─────────────────────────────────────────────────────
update public.mensajes_whatsapp
   set plantilla_meta = 'cobro_mora_v2', updated_at = now()
 where clave = 'mora' and plantilla_meta = 'cobro_mora_v1';

-- ── 2) Las 13 columnas que ZALA necesita ─────────────────────────────────────────────────────
insert into zala.diccionario (vista, columna, significado, valores, zala_lo_dice, confirmado_por_dueno) values

-- zala.pagos
('pagos', 'pago_id', 'Identificador del pago en MotoGestión. Sirve para cruzar la foto de un comprobante con el pago que se registró; no es un dato para el cliente.', null, 'no', true),
('pagos', 'valor', 'Cuánto se recibió en ese pago, en pesos.', null, 'sí', true),
('pagos', 'metodo', 'Cómo pagó.', 'Efectivo · Transferencia', 'sí', true),
('pagos', 'registrado_el', 'Cuándo se DIGITÓ el pago en el sistema (distinto de fecha_pago, que es cuándo PAGÓ el cliente). El motor reparte por este orden.', null, 'no', true),

-- zala.moto
('moto', 'moto_id', 'Identificador de la moto en MotoGestión. Para cruzar datos, no para el cliente.', null, 'no', true),
('moto', 'soat_dias', 'Días que faltan para que se venza el SOAT. Negativo = ya está vencido.', null, 'sí', true),
('moto', 'tecnomecanica_dias', 'Días que faltan para que se venza la tecnomecánica. Negativo = ya está vencida.', null, 'sí', true),
('moto', 'taller_estado', 'En qué va la orden de taller abierta de esa moto. Vacío = no está en taller.', null, 'sí', true),
('moto', 'taller_motivo', 'Por qué entró al taller, en palabras del mecánico. Vacío = no está en taller.', null, 'sí', true),
('moto', 'retencion_numero_caso', 'Número del caso cuando la moto está retenida por una autoridad (tránsito, fiscalía). Es un dato de un proceso legal: se le dice SOLO si el cliente pregunta por él.', null, 'solo si pregunta', true),

-- zala.cliente
('cliente', 'cliente_id', 'Identificador del cliente en MotoGestión. Para cruzar datos, no para el cliente.', null, 'no', true),

-- zala.convenios
('convenios', 'concepto', 'De qué es el acuerdo de pago, escrito cuando se firmó (por ejemplo: cuotas atrasadas, multa de inmovilización, base inicial).', null, 'sí', true),
('convenios', 'abonado', 'Cuánto lleva abonado a ESTE acuerdo, contando solo los pagos hechos desde que se firmó (mig 132). Un acuerdo nuevo empieza en 0 aunque el contrato tenga pagos viejos.', null, 'sí', true)

on conflict (vista, columna) do update set
  significado = excluded.significado, valores = excluded.valores,
  zala_lo_dice = excluded.zala_lo_dice, actualizado = now();

-- ═══ VERIFICACIÓN ═══
-- a) La plantilla de mora quedó con el nombre nuevo.
select clave, plantilla_meta from public.mensajes_whatsapp where clave = 'mora';

-- b) Las 13 filas nuevas, con lo que ZALA puede decir de cada una.
select vista, columna, zala_lo_dice from zala.diccionario
 where (vista, columna) in (('pagos','pago_id'),('pagos','valor'),('pagos','metodo'),('pagos','registrado_el'),
        ('moto','moto_id'),('moto','soat_dias'),('moto','tecnomecanica_dias'),('moto','taller_estado'),
        ('moto','taller_motivo'),('moto','retencion_numero_caso'),('cliente','cliente_id'),
        ('convenios','concepto'),('convenios','abonado'))
 order by vista, columna;
