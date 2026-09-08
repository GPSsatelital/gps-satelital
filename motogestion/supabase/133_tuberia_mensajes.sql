-- 133 — LA TUBERÍA ÚNICA DE MENSAJES: plantilla + variables (nunca texto final) y rastro real
--
-- PLAN APROBADO POR EL DUEÑO (8-sep-2026, Fase 1 de la integración con ZALA; ver
-- docs/PLANTILLAS-WHATSAPP.md). Antes había 8 botones que abrían `wa.me`: uno anotaba "mensaje
-- enviado" sin saberlo, dos no anotaban nada, y tres mandaban texto escrito en el código que Meta
-- jamás aprobaría. Desde ahora todos pasan por UNA función (`useEnvioMensaje.enviar`) que:
--   · manda `{plantilla, variables}` — ZALA decide si sale como texto (ventana de 24 h abierta)
--     o como plantilla aprobada por Meta; el cliente lee lo mismo;
--   · deja en `gestiones_cobro` qué plantilla y qué versión se usó, y el estado REAL del mensaje.
--
-- LA REGLA DE VERSIONES (pedido textual del dueño: "que a futuro, así sean cambios de formato, el
-- sistema sepa y no siga usando un formato viejo"): ninguna pantalla nombra una plantilla de Meta.
-- Las pantallas dicen la CLAVE (`mora`, `recibo`); esta tabla traduce la clave a la plantilla
-- vigente. Cambiar de formato = editar `plantilla_meta` en una fila. Y cada mensaje enviado congela
-- en `plantilla_usada` cuál se usó, aunque la fila cambie después.
--
-- QUÉ HACE:
--   1) `mensajes_whatsapp` gana `plantilla_meta` (nombre en Meta), `variables` (qué comodín va en
--      {{1}}, {{2}}…) y `activa`. Se siembran los nombres acordados en el documento SIN TOCAR los
--      textos que ya están editados desde Configuración, y se crean las 5 claves que faltaban.
--   2) `gestiones_cobro` gana las columnas del rastro del mensaje.
--
-- LO QUE NO HACE: no manda nada. Mientras ZALA no exponga su `/api/enviar` (hoy "por crear"), la
-- app sigue abriendo WhatsApp como siempre, pero anota `mensaje_estado = 'abierto_whatsapp'` en
-- vez de mentir con "enviado".

-- ── 1) mensajes_whatsapp: la clave conoce su plantilla vigente ─────────────────────────────
alter table public.mensajes_whatsapp
  add column if not exists plantilla_meta text,
  add column if not exists variables text[] not null default '{}',
  add column if not exists activa boolean not null default true;

comment on column public.mensajes_whatsapp.plantilla_meta is
  'Nombre de la plantilla aprobada en Meta que hoy está vigente para esta clave (p.ej. cobro_mora_v1). Cambiarla aquí = todo el sistema usa la nueva; el código nunca nombra una plantilla. NULL = todavía no hay plantilla registrada: solo sale como texto dentro de la ventana de 24 h.';
comment on column public.mensajes_whatsapp.variables is
  'Orden de los comodines para las variables numeradas de Meta: variables[1] va en {{1}}, etc. Debe coincidir con la plantilla registrada. Provisional hasta que el dueño apruebe los textos finales.';
comment on column public.mensajes_whatsapp.activa is
  'false = esta clave no se manda por ningún canal (p.ej. mientras Meta aprueba la versión nueva y la vieja ya no sirve).';

-- Semilla: los nombres del documento y el orden de variables. `on conflict … do update` NO toca
-- `texto`: los de dia_pago, gabela y mora fueron editados desde Configuración el 7-jul y esos son
-- los que valen. Las claves nuevas nacen con el borrador del documento para que se vean y se
-- puedan editar en Configuración; el dueño va a revisar los textos con conversaciones reales.
insert into public.mensajes_whatsapp (clave, texto, plantilla_meta, variables) values
('dia_pago',          'Hola {nombre}, hoy le corresponde el pago de su moto {placa}. El valor es {valor}. Puede pagar en la oficina o por transferencia; si transfiere, envíenos la foto del comprobante con el número de referencia. Club Moteros Cartagena.', 'cobro_dia_pago_v1',     '{nombre,placa,valor}'),
('gabela',            'Hola {nombre}, ayer venció el pago de su moto {placa} y hoy es su día de gracia. Debe {valor}. Por favor póngase al día hoy para no entrar en mora. Club Moteros Cartagena.', 'cobro_gabela_v1',       '{nombre,placa,valor}'),
('mora',              'Hola {nombre}, su moto {placa} lleva {dias} sin pagar y debe {valor}. Comuníquese hoy con nosotros para ponerse al día o acordar un plan de pago. Club Moteros Cartagena.', 'cobro_mora_v1',         '{nombre,placa,dias,valor}'),
('recoleccion',       'Hola {nombre}, su moto {placa} presenta {dias} de mora y una deuda de {valor}. Si no recibimos su pago hoy, procederemos con la recolección del vehículo. Comuníquese con nosotros. Club Moteros Cartagena.', 'aviso_recoleccion_v1',  '{nombre,placa,dias,valor}'),
('moto_retenida',     'Hola {nombre}, su moto {placa} está en nuestras instalaciones. Para entregársela nuevamente debe ponerse al día: {valor}. Comuníquese con nosotros para acordar cómo y cuándo la retira. Club Moteros Cartagena.', 'moto_retenida_v1',      '{nombre,placa,valor}'),
('acuse_comprobante', 'Hola {nombre}, recibimos su comprobante de pago por {valor} para la moto {placa}. Lo estamos verificando y le confirmamos apenas quede registrado. Club Moteros Cartagena.', 'acuse_comprobante_v1',  '{nombre,valor,placa}'),
('recibo',            '🧾 *CLUB MOTEROS CARTAGENA — Comprobante de pago*{detalle}', 'recibo_pago_v1',        '{folio,fecha,nombre,placa,valor,pendiente}'),
('recibo_campo',      'Club Moteros Cartagena — recibo provisional de cobro en campo. Recibo {folio} del {fecha}. Cliente {nombre}, moto {placa}. Valor recibido: {valor}. Pendiente de validación en caja; conserve este comprobante.', 'recibo_campo_v1',       '{folio,fecha,nombre,placa,valor}'),
('cuentas_pago',      'Hola {nombre}, para el pago de su moto {placa} puede transferir a: {cuentas}. Cuando transfiera, envíenos la foto del comprobante con el número de referencia para poder acreditarle el pago. Club Moteros Cartagena.', 'cuentas_para_pagar_v1', '{nombre,placa,cuentas}'),
('contacto_general',  'Hola {nombre}, le escribimos de Club Moteros Cartagena por un tema de su moto {placa}. Por favor comuníquese con nosotros. Club Moteros Cartagena.', 'contacto_general_v1',   '{nombre,placa}')
on conflict (clave) do update set
  plantilla_meta = excluded.plantilla_meta,
  variables      = excluded.variables;
  -- texto NO se toca a propósito.

-- ── 2) gestiones_cobro: el rastro real de cada mensaje ────────────────────────────────────
alter table public.gestiones_cobro
  add column if not exists plantilla_usada  text,
  add column if not exists variables_usadas jsonb,
  add column if not exists mensaje_id       text,
  add column if not exists mensaje_estado   text,
  add column if not exists mensaje_motivo   text,
  add column if not exists aprobado_por     uuid references public.profiles(id);

comment on column public.gestiones_cobro.plantilla_usada is
  'Qué plantilla se usó EXACTAMENTE en este envío (congelada: si la clave cambia de versión después, esto no se mueve). Con el respaldo de wa.me, la clave.';
comment on column public.gestiones_cobro.mensaje_estado is
  'Estado real del mensaje. De ZALA/Meta: en_cola · enviado · entregado · leido · fallo. Del respaldo mientras ZALA no está conectada: abierto_whatsapp (se abrió WhatsApp en el equipo con el texto; el envío NO está confirmado). NULL en gestiones que no son mensajes.';
comment on column public.gestiones_cobro.mensaje_id is 'Id del mensaje en ZALA, para consultar después su acuse (llegó / leído / falló).';
comment on column public.gestiones_cobro.aprobado_por is 'Quién autorizó el envío por el canal oficial. Mientras cada persona envía bajo su propio permiso, es la misma que registró.';

create index if not exists idx_gestiones_mensaje_id on public.gestiones_cobro(mensaje_id) where mensaje_id is not null;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- a) Las 10 claves con su plantilla y variables; los textos de dia_pago/gabela/mora siguen siendo
--    los editados el 7-jul (updated_at no se movió para esos).
select clave, plantilla_meta, array_to_string(variables, ' · ') as variables, activa,
       updated_at::date as texto_editado_el, left(texto, 60) as texto
  from public.mensajes_whatsapp order by clave;

-- b) Las 6 columnas nuevas de gestiones_cobro existen.
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'gestiones_cobro'
   and column_name in ('plantilla_usada','variables_usadas','mensaje_id','mensaje_estado','mensaje_motivo','aprobado_por')
 order by column_name;
