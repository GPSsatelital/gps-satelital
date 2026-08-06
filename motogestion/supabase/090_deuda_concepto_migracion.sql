-- ===== 090: concepto de deuda "migracion" (saldo que viene del sistema viejo) =====
--
-- EL PROBLEMA (lo destapó el dueño el 6-ago-2026): al revisar por qué la deuda de IEW38I estaba
-- como `otro`, dijo: "están como otros porque no hay una opción que diga de migración o deuda del
-- sistema viejo". No fue descuido del funcionario — LA OPCIÓN NO EXISTÍA.
--
-- La prueba está en los datos: 19 formas distintas de escribir lo mismo en la descripción, porque
-- era el único lugar donde se podía dejar constancia — "EXCEL VIEJO", "EXCEL viejo", "EXCELO
-- VIEJO", "EXCEL VEIJO", "Viene del EXCEL SISTEMA VIEJO", "DEUDA DE MIGRACION SISTEMA EXCEL
-- VIEJO"... Cuando la gente escribe a mano lo que no puede marcar, el formulario está incompleto.
--
-- QUÉ CAMBIA: solo se agrega la opción al CHECK. Ningún cálculo, ningún trigger, ningún monto.
--
-- POR QUÉ IMPORTA MÁS ADELANTE: una deuda de migración es "una sola cosa" (regla del dueño) — el
-- funcionario ya hizo el cálculo de a dónde va cada peso al armar el arqueo. Una `tarifa_atrasada`
-- del sistema, en cambio, es una semana del cliente y lleva su ahorro adentro. Cuando se construya
-- la regla de que la tarifa atrasada genera ahorro, poder distinguirlas es lo que evita
-- acreditarle el ahorro DOS VECES a los 125 contratos migrados.
--
-- CORRIDA EN SUPABASE EL 6-AGO-2026 junto con la reclasificación de esas 125 deudas
-- ($60.269.200) a este concepto. Este archivo existe para que el repo y la BD digan lo mismo:
-- la desincronización entre ambos fue la causa raíz de la cascada de errores del 7-jul.

ALTER TABLE public.deudas DROP CONSTRAINT IF EXISTS deudas_concepto_check;
ALTER TABLE public.deudas ADD CONSTRAINT deudas_concepto_check
  CHECK (concepto IN (
    'tarifa_atrasada',
    'daño_vehiculo',
    'prestamo_repuesto',
    'prestamo_eventualidad',
    'fotomulta',
    'multa_recoleccion',
    'migracion',
    'otro'
  ));

-- Reclasificación ya aplicada (queda acá como rastro de lo que se corrió, es idempotente):
--
-- update public.deudas set concepto = 'migracion'
--  where (descripcion ilike '%deuda de apertura%' or descripcion ilike '%saldo de apertura%'
--      or descripcion ilike '%excel%' or descripcion ilike '%sistema viejo%'
--      or descripcion ilike '%migraci%')
--    and concepto <> 'migracion';
--
-- Devolvió 125 filas. Quedaron FUERA a propósito 3 que dicen "tarifa atrasada" a secas y caen en
-- las fechas de corte (3-jul PRADERA $62.000 · 27-jul COSTA $202.000 · 28-jul COSTA $520.000):
-- pueden ser de migración o deudas reales del sistema nuevo, y esa la decide el dueño.
