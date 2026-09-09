-- 135 — LOS 10 TEXTOS DEFINITIVOS DE LAS PLANTILLAS (versión 2, de USTED) + orden de variables
--
-- Salen de docs/PLANTILLAS-WHATSAPP.md tras leer 4 conversaciones reales (8-sep-2026) y de las
-- reglas del dueño esa noche: SIEMPRE de usted y con respeto (nunca tutear) · voz de empresa, por
-- áreas, sin firma personal · sin coloquialismos · "realizar" mejor que "hacer" · "el día de hoy",
-- no "hoy" a secas · la gabela OFRECE el día ("le podemos dar"), la mora YA NO da plazo: informa el
-- estado y advierte que desde ese día el apagado y la recolección pueden pasar en cualquier momento
-- · la moto retenida se invita a volver a rodar, no se le impone la cifra · "Bendiciones" como
-- saluda la empresa. {nombre} llega ya corto ("Jose Alberto").
--
-- LOS DÍAS VAN EN DOS CIFRAS, cada una con su palabra (decisión del dueño, 8-sep):
--   {dias}    = desde su último pago registrado — él lo reconoce, pero un abono parcial la reinicia.
--   {vencida} = lo que lleva vencida la cuota — esa no la mueve un abono, y es la que manda para recoger.
-- Con una sola, el que abonó ayer y debe tres semanas vería "1 día". Al que NUNCA registró un pago
-- no se le manda este mensaje (no hay último pago que nombrar): se gestiona por llamada.
--
-- Respetan las reglas de Meta: ninguna variable al inicio ni al final, ninguna pegada a otra,
-- ninguna con salto de línea adentro, ninguna vacía.
--
-- CORRERLA = APROBAR LOS TEXTOS. Pisa `texto` de las 10 claves (incluidos los tres editados el
-- 7-jul, que tuteaban) y deja `variables` en el orden en que aparecen en cada texto.
-- `plantilla_meta` y `activa` no se tocan. Después, ZALA registra estos mismos textos en Meta.

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones 🏍️\nHoy es su día de pago de la moto {placa}. Su cuota del día de hoy es {valor}.\nPuede realizar el pago en la oficina o por transferencia; si transfiere, envíenos la foto del comprobante con la placa y su nombre.\nSi ya realizó el pago, ¡gracias por su puntualidad! Quedamos atentos.',
  variables = '{nombre,placa,valor}', updated_at = now() where clave = 'dia_pago';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu pago de la moto {placa} venció ayer y hoy es su día de gracia: le podemos dar el día de hoy para ponerse al día con {valor} y no entrar en mora.\nSi ya realizó el pago, envíenos el comprobante con la placa y su nombre para actualizarlo de inmediato. Quedamos atentos.',
  variables = '{nombre,placa,valor}', updated_at = now() where clave = 'gabela';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu último pago registrado de la moto {placa} fue hace {dias} y su cuota lleva {vencida} de vencida; hoy debe {valor}. Mientras el pago no se complete, su cuenta sigue en mora.\nLe recordamos que, estando en mora, el sistema puede realizar el apagado del vehículo en cualquier momento y proceder con su recolección.\nPóngase al día lo más pronto posible para seguir rodando tranquilo. Escríbanos para reportar su pago o para acordar cómo se pone al día. Quedamos atentos.',
  variables = '{nombre,placa,dias,vencida,valor}', updated_at = now() where clave = 'mora';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu último pago registrado de la moto {placa} fue hace {dias} y su cuota lleva {vencida} de vencida; debe {valor}. Se agotaron los plazos y su caso pasó a recolección, lo que genera un costo adicional de inmovilización.\nAún está a tiempo de evitarlo si se pone al día de inmediato: envíenos el comprobante o escríbanos ahora mismo para acordar el pago. Quedamos atentos.',
  variables = '{nombre,placa,dias,vencida,valor}', updated_at = now() where clave = 'recoleccion';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nSu moto {placa} está guardada en nuestras instalaciones y queremos verlo rodando nuevamente con ella. Cuéntenos cómo desea proceder: en la oficina revisamos con usted las opciones para devolverle su vehículo lo antes posible.\nComuníquese con nosotros por este medio. Quedamos atentos.',
  variables = '{nombre,placa}', updated_at = now() where clave = 'moto_retenida';

update public.mensajes_whatsapp set texto = 'Hola, {nombre}. Recibimos su comprobante por {valor} para la moto {placa}. Lo estamos verificando; apenas quede registrado le confirmamos. Gracias.',
  variables = '{nombre,valor,placa}', updated_at = now() where clave = 'acuse_comprobante';

update public.mensajes_whatsapp set texto = E'¡Gracias por su pago, {nombre}! Bendiciones.\nRecibo {folio} del {fecha} · Moto {placa} · Valor recibido: {valor}.\nLe queda pendiente: {pendiente}.\nClub Moteros Cartagena.',
  variables = '{nombre,folio,fecha,placa,valor,pendiente}', updated_at = now() where clave = 'recibo';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Bendiciones.\nRecibimos su pago en efectivo de {valor} por la moto {placa} (recibo provisional {folio}, {fecha}). Queda pendiente de validación en caja; le confirmamos apenas se registre. Conserve este comprobante.',
  variables = '{nombre,valor,placa,folio,fecha}', updated_at = now() where clave = 'recibo_campo';

update public.mensajes_whatsapp set texto = E'Hola, {nombre}. Estas son las cuentas para realizar el pago de su moto {placa}: {cuentas}.\nCuando transfiera, envíenos la foto del comprobante junto con la placa y su nombre, para acreditarlo rápido. Quedamos atentos.',
  variables = '{nombre,placa,cuentas}', updated_at = now() where clave = 'cuentas_pago';

update public.mensajes_whatsapp set texto = 'Hola, {nombre}. Bendiciones. Le escribimos de Club Moteros Cartagena por un tema de su moto {placa}. Por favor comuníquese con nosotros por este medio. Quedamos atentos.',
  variables = '{nombre,placa}', updated_at = now() where clave = 'contacto_general';

-- VERIFICACIÓN: 10 filas actualizadas hoy, ninguna tutea.
select clave, array_to_string(variables, ' · ') as variables, updated_at::date as actualizado,
       (texto ~* '\m(tu|tus|te|ti|tienes|puedes|pagaste|envíanos|escríbenos)\M') as tutea,
       left(texto, 70) as texto
  from public.mensajes_whatsapp order by clave;
