-- 228 — LOS TRES COBROS EN TONO FORMAL, Y SIN LA CIFRA EN DÍA DE PAGO Y GABELA (pedido de ZALA, 24-nov-2026)
--
-- Fredy pidió que los cobros suenen más formales, y que el de día de pago y el de gabela ya no digan
-- cuánto debe el cliente. El de mora SÍ la sigue diciendo. ZALA registró tres plantillas con nombre
-- nuevo y Meta las aprobó el 24-nov a las 18:28 (UTILITY). Las viejas siguen aprobadas y no se borran.
--
-- QUÉ CAMBIA: solo tres filas de `public.mensajes_whatsapp`, que ZALA lee como `zala.plantillas`:
--   dia_pago  cobro_dia_pago_v1 → cobro_dia_pago_v2   variables: nombre · placa              (sale valor)
--   gabela    cobro_gabela_v1   → cobro_gabela_v2     variables: nombre · placa · dia_pago   (sale valor)
--   mora      cobro_mora_v2     → cobro_mora_v3       variables: las mismas 6 de hoy
-- y el `texto` de cada una, palabra por palabra como lo mandó ZALA: es el que tiene Meta y el que sale
-- cuando el cliente escribió en las últimas 24 horas.
--
-- POR QUÉ NO HAY QUE CAMBIAR LOS BOTONES: ninguna pantalla sabe qué datos lleva cada mensaje. El botón
-- toma de ESTA fila la lista `variables` y manda solo esas (`ordenarVariables` en `utils/mensajeria.ts`);
-- el valor que el Panel Hoy y Cobro Diario siguen calculando simplemente no se usa. La tanda de ZALA
-- arma sus variables desde la misma fila (mig 134). Por eso el cambio es instantáneo y de una vez.
--
-- PASO 0 — LA GUARDA: si las tres filas no están como se cree (nombre de plantilla y variables de hoy),
-- no se cambia nada. El texto de hoy NO frena: se anota en el registro si era el mismo del repo
-- (el de la 135 con los tres cambios de la 138), que es el que ZALA registró en Meta como v1.
-- LA PRUEBA, adentro de la misma transacción: nombre nuevo, texto idéntico al de ZALA (huella md5),
-- las variables iguales a los comodines del texto y en su orden (si no, ZALA responde 400: «tiene N
-- comodines y llegaron M variables»), ninguna variable al inicio, al final ni pegada a otra, y que
-- solo se tocaron estas tres filas. Si algo falla, no queda nada.
--
-- CÓMO VOLVER ATRÁS (las plantillas viejas siguen aprobadas en Meta):
--   update public.mensajes_whatsapp set plantilla_meta = 'cobro_dia_pago_v1', variables = '{nombre,placa,valor}', updated_at = now(),
--     texto = E'Hola, {nombre}. Bendiciones 🏍️\nLe recordamos que hoy es su día de pago de la moto {placa}. Su cuota del día de hoy es {valor}.\nPuede realizar el pago en la oficina o por transferencia; si transfiere, envíenos la foto del comprobante con la placa y su nombre.\nSi ya realizó el pago, ¡gracias por su puntualidad! Quedamos atentos.'
--   where clave = 'dia_pago';
--   update public.mensajes_whatsapp set plantilla_meta = 'cobro_gabela_v1', variables = '{nombre,placa,valor,dia_pago}', updated_at = now(),
--     texto = E'Hola, {nombre}. Bendiciones.\nSu plazo de la moto {placa} venció ayer y hoy es su día de gracia: le podemos dar el día de hoy para ponerse al día con {valor} y no entrar en mora.\nRecuerde que su pago se realiza {dia_pago}: el día de gracia es solo para terminar de completarlo, no para dejarlo para después.\nSi ya realizó el pago, envíenos el comprobante con la placa y su nombre para actualizarlo de inmediato. Quedamos atentos.'
--   where clave = 'gabela';
--   update public.mensajes_whatsapp set plantilla_meta = 'cobro_mora_v2', variables = '{nombre,placa,dias,vencida,valor,dia_pago}', updated_at = now(),
--     texto = E'Hola, {nombre}. Bendiciones.\nSu último pago registrado de la moto {placa} fue hace {dias} y su cuota lleva {vencida} de vencida; hoy debe {valor}. Su pago se realiza {dia_pago} y ese mismo día debe quedar cubierto; mientras el pago no se complete, su cuenta sigue en mora.\nLe recordamos que, estando en mora, el sistema puede realizar el apagado del vehículo en cualquier momento y proceder con su recolección.\nLe recomendamos colocarse al día lo más pronto posible para seguir rodando tranquilo. Escríbanos para reportar su pago o para acordar cómo se pone al día. Quedamos atentos.'
--   where clave = 'mora';

begin;

-- ── Paso 0: la guarda ─────────────────────────────────────────────────────────────────────────
do $guarda$
declare
  v_mal   text;
  v_igual text;
  v_ya    timestamptz;
begin
  -- Correrla dos veces no es un problema, pero debe DECIRLO: el 24-nov la segunda corrida dio «no están
  -- como se esperaba» y se leyó como si otro hubiera cambiado las filas, cuando era la primera corrida.
  select aplicada_en into v_ya from public.migraciones_aplicadas where numero = 228;
  if v_ya is not null then
    raise exception 'La 228 ya se corrió el % (hora de Bogotá). No se cambió nada y no hace falta volver a correrla.',
      to_char(v_ya at time zone 'America/Bogota', 'DD-MM-YYYY HH24:MI');
  end if;

  select string_agg(e.clave || ' (hoy: ' || coalesce(m.plantilla_meta, 'sin plantilla') || ' · '
                    || coalesce(array_to_string(m.variables, ','), 'sin fila') || ')', '; ' order by e.clave)
    into v_mal
    from (values ('dia_pago', 'cobro_dia_pago_v1', '{nombre,placa,valor}'::text[]),
                 ('gabela',   'cobro_gabela_v1',   '{nombre,placa,valor,dia_pago}'::text[]),
                 ('mora',     'cobro_mora_v2',     '{nombre,placa,dias,vencida,valor,dia_pago}'::text[])) as e(clave, plantilla, variables)
    left join public.mensajes_whatsapp m on m.clave = e.clave
   where m.clave is null
      or m.plantilla_meta is distinct from e.plantilla
      or m.variables is distinct from e.variables;
  if v_mal is not null then
    raise exception 'No se cambió nada: estas filas no están como se esperaba: %', v_mal;
  end if;

  -- Si el texto de hoy era el del repo, el «cómo volver atrás» de arriba lo deja exactamente igual.
  select string_agg(e.clave || ' ' || case when md5(m.texto) = e.huella then 'sí' else 'NO' end, ' · ' order by e.clave)
    into v_igual
    from (values ('dia_pago', 'a4886338cc56c93db650e2eae833f47e'),
                 ('gabela',   '7825e973b48256ff3dab96df7e4857a2'),
                 ('mora',     'fc6a4f54e4284703991331c590e2b5eb')) as e(clave, huella)
    join public.mensajes_whatsapp m on m.clave = e.clave;
  perform set_config('mig228.texto_de_antes', v_igual, true);
end $guarda$;

-- ── El cambio ─────────────────────────────────────────────────────────────────────────────────
update public.mensajes_whatsapp
   set plantilla_meta = 'cobro_dia_pago_v2',
       variables      = '{nombre,placa}',
       texto          = E'Cordial saludo, {nombre}. Bendiciones.\nLe recordamos que hoy corresponde el pago de la cuota de su moto {placa}.\nPuede realizarlo en nuestra oficina o por transferencia. Si paga por transferencia, por favor envíenos por este medio la foto del comprobante con la placa y su nombre.\nSi ya realizó el pago, le agradecemos su puntualidad.\nAtentamente,\nClub Moteros Cartagena',
       updated_at     = now()
 where clave = 'dia_pago' and plantilla_meta = 'cobro_dia_pago_v1';

update public.mensajes_whatsapp
   set plantilla_meta = 'cobro_gabela_v2',
       variables      = '{nombre,placa,dia_pago}',
       texto          = E'Cordial saludo, {nombre}. Bendiciones.\nLe informamos que ayer venció el plazo de pago de la cuota de su moto {placa}. Hoy cuenta con un día de gracia para ponerse al día y evitar que su cuenta entre en mora.\nLe recordamos que sus pagos se realizan {dia_pago}. El día de gracia es un margen para completar el pago, no una extensión del plazo.\nSi ya realizó el pago, por favor envíenos el comprobante con la placa y su nombre para registrarlo de inmediato.\nAtentamente,\nClub Moteros Cartagena',
       updated_at     = now()
 where clave = 'gabela' and plantilla_meta = 'cobro_gabela_v1';

update public.mensajes_whatsapp
   set plantilla_meta = 'cobro_mora_v3',
       variables      = '{nombre,placa,dias,vencida,valor,dia_pago}',
       texto          = E'Cordial saludo, {nombre}. Bendiciones.\nLe informamos que la cuenta de su moto {placa} se encuentra en mora. Su último pago registrado fue hace {dias} y la cuota lleva {vencida} vencida. El saldo pendiente a hoy es de {valor}.\nLe recordamos que sus pagos se realizan {dia_pago} y deben quedar cubiertos ese mismo día. Mientras la cuenta permanezca en mora, el vehículo puede ser apagado a distancia y retirado para su recolección.\nLe solicitamos ponerse al día a la mayor brevedad. Si ya realizó el pago, envíenos el comprobante por este medio; si necesita acordar una fecha de pago, escríbanos y con gusto lo atendemos.\nAtentamente,\nClub Moteros Cartagena',
       updated_at     = now()
 where clave = 'mora' and plantilla_meta = 'cobro_mora_v2';

-- ── La prueba ─────────────────────────────────────────────────────────────────────────────────
do $prueba$
declare
  r record;
  v_comodines text[];
  v_tocadas   int;
begin
  for r in
    select e.clave, e.plantilla, e.huella, e.variables, m.plantilla_meta, m.variables as vars_fila, m.texto, m.activa
      from (values ('dia_pago', 'cobro_dia_pago_v2', '2391d93331e639ef79fa86f8837e8f00', '{nombre,placa}'::text[]),
                   ('gabela',   'cobro_gabela_v2',   'b76033965d089c3adb808759053ce6b0', '{nombre,placa,dia_pago}'::text[]),
                   ('mora',     'cobro_mora_v3',     '82fa2d310e453d7cf96780400b95f4db', '{nombre,placa,dias,vencida,valor,dia_pago}'::text[]))
           as e(clave, plantilla, huella, variables)
      left join public.mensajes_whatsapp m on m.clave = e.clave
  loop
    if r.plantilla_meta is distinct from r.plantilla then
      raise exception 'Prueba: % quedó con la plantilla %, se esperaba %.', r.clave, r.plantilla_meta, r.plantilla;
    end if;
    if md5(r.texto) <> r.huella then
      raise exception 'Prueba: el texto de % no es idéntico al que mandó ZALA.', r.clave;
    end if;
    if r.vars_fila is distinct from r.variables then
      raise exception 'Prueba: % quedó con las variables %.', r.clave, r.vars_fila;
    end if;
    select array_agg(x.m[1] order by x.n) into v_comodines
      from regexp_matches(r.texto, '\{(\w+)\}', 'g') with ordinality as x(m, n);
    if v_comodines is distinct from r.vars_fila then
      raise exception 'Prueba: en % los comodines del texto (%) no son las variables (%): ZALA respondería 400.', r.clave, v_comodines, r.vars_fila;
    end if;
    if r.texto ~ '^\s*\{' or r.texto ~ '\}\s*$' or r.texto ~ '\}\s*\{' then
      raise exception 'Prueba: en % hay una variable al inicio, al final o pegada a otra (Meta no lo acepta).', r.clave;
    end if;
    if not coalesce(r.activa, false) then
      raise exception 'Prueba: % está desactivada: no saldría por ningún canal.', r.clave;
    end if;
  end loop;

  select count(*) into v_tocadas from public.mensajes_whatsapp where updated_at = now();
  if v_tocadas <> 3 then
    raise exception 'Prueba: se tocaron % filas de mensajes, se esperaban 3.', v_tocadas;
  end if;
end $prueba$;

select public.registrar_migracion(228, '228_cobros_formales_v2.sql',
  'Cobros en tono formal (pedido de ZALA, 24-nov): dia_pago → cobro_dia_pago_v2 y gabela → cobro_gabela_v2 sin la cifra; mora → cobro_mora_v3 con las mismas variables. Texto de antes igual al del repo: '
  || current_setting('mig228.texto_de_antes', true) || '.');

commit;

-- ═══ VERIFICACIÓN (solo lectura) ═══
-- Las tres filas como las ve ZALA. Deben salir v2 · v2 · v3, con 2 · 3 · 6 variables, el texto
-- empezando por «Cordial saludo», y en la última columna la 228 anotada con «sí» en las tres.
select p.clave, p.plantilla_meta, cardinality(p.variables) as n_variables,
       array_to_string(p.variables, ' · ') as variables, p.activa,
       left(replace(p.texto, E'\n', ' / '), 60) as empieza_asi,
       (select substring(a.que_hizo from 'Texto de antes igual al del repo: (.*)$')
          from public.migraciones_aplicadas a where a.numero = 228) as anotada_228_texto_de_antes
  from zala.plantillas p
 where p.clave in ('dia_pago', 'gabela', 'mora')
 order by p.clave;
