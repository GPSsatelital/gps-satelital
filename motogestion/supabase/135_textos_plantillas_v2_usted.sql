-- 135 — LOS 10 TEXTOS DEFINITIVOS DE LAS PLANTILLAS (versión 2, de USTED) + orden de variables
--
-- Salen de docs/PLANTILLAS-WHATSAPP.md tras leer 4 conversaciones reales (8-sep-2026) y de las
-- reglas del dueño esa noche: SIEMPRE de usted y con respeto (nunca tutear) · voz de empresa, por
-- áreas, sin firma personal · sin coloquialismos · "Bendiciones" como saluda la empresa · abono
-- parcial dice el faltante · escalera aviso → apagado → 1 hora → recolección (el apagado no es la
-- última instancia). Respetan las reglas de Meta: ninguna variable al inicio ni al final, ninguna
-- pegada, ninguna con salto de línea.
--
-- CORRERLA = APROBAR LOS TEXTOS. Pisa `texto` de las 10 claves (incluidos los tres editados el
-- 7-jul, que tuteaban) y corrige el orden de `variables` de `recibo` y `recibo_campo`, que cambió
-- respecto a la semilla de la mig 133. `plantilla_meta` y `activa` no se tocan. Después, ZALA
-- registra estos mismos textos en Meta con los nombres `_v1`.

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones 🏍️\nHoy es su día de pago de la moto {placa}. Su cuota de hoy es {valor}.\nPuede pagar en la oficina o por transferencia; si transfiere, envíenos la foto del comprobante con la placa y su nombre.\nSi ya pagó, ¡gracias por su puntualidad! Quedamos atentos.',
  variables = '{nombre,placa,valor}', updated_at = now() where clave = 'dia_pago';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu pago de la moto {placa} venció ayer y hoy es su día de gracia: tiene hasta hoy para ponerse al día con {valor} y no entrar en mora.\nSi ya pagó, envíenos el comprobante con la placa y su nombre para actualizarlo de inmediato. Quedamos atentos.',
  variables = '{nombre,placa,valor}', updated_at = now() where clave = 'gabela';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu moto {placa} lleva {dias} días sin pago y hoy debe {valor}. Los pagos son los lunes; mientras el pago no se complete, su cuenta sigue en mora.\nTiene hasta hoy para ponerse al día. Después de eso, el sistema puede apagar el vehículo en cualquier momento, y si en la hora siguiente no hay pago ni respuesta, se procede a recogerlo.\nEscríbanos hoy para reportar su pago o acordar cómo se pone al día. Quedamos atentos.',
  variables = '{nombre,placa,dias,valor}', updated_at = now() where clave = 'mora';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu moto {placa} lleva {dias} días en mora y debe {valor}. Se agotaron los plazos: por reglamento, el vehículo pasa a recolección, y eso genera un costo adicional de inmovilización.\nTodavía puede evitarlo hoy: envíenos el comprobante o escríbanos ahora para acordar el pago. Quedamos atentos.',
  variables = '{nombre,placa,dias,valor}', updated_at = now() where clave = 'recoleccion';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu moto {placa} está en nuestras instalaciones. Para entregársela nuevamente debe ponerse al día con {valor}; si no lo tiene completo, en la oficina podemos revisar un acuerdo de pago con usted.\nEscríbanos para acordar cuándo la retira. Quedamos atentos.',
  variables = '{nombre,placa,valor}', updated_at = now() where clave = 'moto_retenida';

update public.mensajes_whatsapp set texto = 'Hola, {nombre}. Recibimos su comprobante por {valor} para la moto {placa}. Lo estamos verificando; apenas quede registrado le confirmamos. Gracias.',
  variables = '{nombre,valor,placa}', updated_at = now() where clave = 'acuse_comprobante';

update public.mensajes_whatsapp set texto = E'¡Gracias por su pago, {nombre}! Bendiciones.\nRecibo {folio} del {fecha} · Moto {placa} · Valor recibido: {valor}.\nLe queda pendiente: {pendiente}.\nClub Moteros Cartagena.',
  variables = '{nombre,folio,fecha,placa,valor,pendiente}', updated_at = now() where clave = 'recibo';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nRecibimos su pago en efectivo de {valor} por la moto {placa} (recibo provisional {folio}, {fecha}). Queda pendiente de validación en caja; le confirmamos apenas se registre. Conserve este comprobante.',
  variables = '{nombre,valor,placa,folio,fecha}', updated_at = now() where clave = 'recibo_campo';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Estas son las cuentas para el pago de su moto {placa}: {cuentas}.\nCuando transfiera, envíenos la foto del comprobante junto con la placa y su nombre, para acreditarlo rápido. Quedamos atentos.',
  variables = '{nombre,placa,cuentas}', updated_at = now() where clave = 'cuentas_pago';

update public.mensajes_whatsapp set texto = 'Hola, {nombre}. Bendiciones. Le escribimos de Club Moteros Cartagena por un tema de su moto {placa}. Por favor comuníquese con nosotros por este medio. Quedamos atentos.',
  variables = '{nombre,placa}', updated_at = now() where clave = 'contacto_general';

-- VERIFICACIÓN: 10 filas actualizadas hoy, ninguna tutea.
select clave, array_to_string(variables, ' · ') as variables, updated_at::date as actualizado,
       (texto ~* '\m(tu|tus|te|ti|tienes|puedes|pagaste|envíanos|escríbenos)\M') as tutea,
       left(texto, 70) as texto
  from public.mensajes_whatsapp order by clave;
