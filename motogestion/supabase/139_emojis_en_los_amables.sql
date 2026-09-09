-- 139 — UN EMOJI EN LOS MENSAJES AMABLES, NINGUNO EN LOS SERIOS
--
-- Decisión del dueño (9-sep-2026), tomada ANTES de que ZALA registre las plantillas en Meta: una
-- vez aprobada una plantilla el texto NO se edita —hay que crear otra versión con otro nombre y
-- esperar aprobación otra vez—, así que esto se cierra ahora.
--
-- CON emoji, al inicio, donde ayuda a que se sienta cercano:
--   dia_pago (ya tenía 🏍️, no se toca) · recibo ✅ · recibo_campo 🧾 · acuse_comprobante 👍 ·
--   cuentas_pago 🏦
-- SIN ninguno: mora, recoleccion, moto_retenida y gabela. Ahí un emoji le quita peso justo al
-- mensaje que necesita tenerlo (se le puede apagar la moto, o ya se la recogieron): lo hace ver
-- menos serio y le da al cliente la sensación de que no es tan grave.
--
-- El emoji va ANTES del saludo, así que ninguna variable queda al inicio del mensaje —regla de
-- Meta— y de hecho quedan más lejos del borde que antes. Los `update` son idempotentes.

update public.mensajes_whatsapp set texto = '✅ ' || texto, updated_at = now()
 where clave = 'recibo' and texto not like '✅%';

update public.mensajes_whatsapp set texto = '🧾 ' || texto, updated_at = now()
 where clave = 'recibo_campo' and texto not like '🧾%';

update public.mensajes_whatsapp set texto = '👍 ' || texto, updated_at = now()
 where clave = 'acuse_comprobante' and texto not like '👍%';

update public.mensajes_whatsapp set texto = '🏦 ' || texto, updated_at = now()
 where clave = 'cuentas_pago' and texto not like '🏦%';

-- ═══ VERIFICACIÓN ═══
-- Los 10, con qué empieza cada uno. Los cuatro de arriba con su emoji, dia_pago con su 🏍️
-- dentro del saludo, y mora / recoleccion / moto_retenida / gabela / contacto_general limpios.
select clave, left(texto, 60) as empieza_asi
  from public.mensajes_whatsapp order by clave;
