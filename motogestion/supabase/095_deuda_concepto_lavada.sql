-- ===== 095: concepto de deuda "lavada del vehículo" =====
--
-- PEDIDO DEL DUEÑO (12-ago-2026): "en las deudas coloca una opción por lavada del vehículo,
-- esto para cuando las motos se guardan y hay que mandarlas a lavar por lo que hay que
-- asignarle la deuda".
--
-- Es un gasto real que hoy no tiene dónde ir: cuando una moto entra retenida sucia, la empresa
-- paga el lavado y ese costo es del cliente. Sin concepto propio terminaba en 'otro' o en
-- 'daño_vehiculo' — y ahí se pierde de vista para siempre. Es exactamente el mismo problema que
-- el dueño señaló con las deudas de migración: "están como otros porque no hay una opción que
-- diga de migración".
--
-- NO GENERA AHORRO: es un servicio que la empresa pagó por él, todo va a la empresa. Cuando
-- entre la fase 5 del plan de la base (que solo `tarifa_atrasada` genere ahorro), este concepto
-- queda del lado correcto sin hacer nada más.
--
-- Se reproduce la lista COMPLETA porque un CHECK no se puede ampliar: hay que soltarlo y volver
-- a crearlo. La lista sale de la mig 090, que era la última que lo tocó.

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
    'lavada',
    'otro'
  ));
