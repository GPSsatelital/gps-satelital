-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 172 — DEVOLVER LA BASE: todo junto o nada, y nunca dos veces (25-sep-2026)
--
-- 🔴 EL CASO. La secretaria (ANGELA) tiene el permiso `devolver_base` desde que existe el flujo
-- (mig 091): es quien recibe la base y quien la devuelve. Pero la pantalla lo hacía en 3 pasos
-- sueltos y el último —dejar al cliente "Retirado" con la base en $0— lo frena el guardián
-- `enforce_cliente_estado_change()`, que solo deja a un ADMIN pasar a "Retirado". Resultado: la
-- plata quedaba registrada como devuelta, el cliente seguía con su base, el botón "Entregar"
-- seguía ahí, y ella lo volvía a tocar. Pasó 3 veces:
--     OMAR ALFONSO YANCES (6-ago) 4 devoluciones de $470.000 · FELIPE SEMBERGMAN (5-sep) 2 ·
--     JOSE LUIS VASQUEZ (25-sep) 2 de $202.000  →  $2.082.000 registrados de más.
-- (Los datos de los 3 se corrigieron a mano el 25-sep, antes de esta migración.)
--
-- LO QUE HACE:
--   1. Le enseña a la base el permiso `devolver_base` (solo existía en la pantalla). Parche
--      ANCLADO sobre la función VIVA, como la 156 — nunca copiado de un archivo viejo (mig 124).
--   2. `devolver_base()`: la devolución entera en UNA transacción. Registra la plata que sale, el
--      descuento de la visita, y deja al cliente Retirado con base $0. Si algo falla, no queda nada.
--   3. EL CANDADO, en la base y no en la pantalla (lección de la mig 166): bloquea la fila del
--      cliente y exige que lo que se devuelve + la visita sea EXACTAMENTE su base. Después de la
--      primera devolución la base es $0, así que una segunda es imposible aunque se toque dos veces.
--   4. El guardián deja pasar a "Retirado" SOLO cuando lo pide `devolver_base()` (misma señal
--      transaccional que usa `cerrar_liquidacion()` desde la mig 111). Copiado de la definición
--      VIVA leída hoy con pg_get_functiondef (idéntica a la de la mig 111).
--
-- NO mueve plata de nadie: solo crea funciones. La foto de antes y después debe dar CERO filas.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--     drop function if exists public.devolver_base(uuid, numeric, numeric, text, text, text);
--     -- y volver a correr el guardián tal como está en la mig 111 (sin el bloque de devolucion_base).
--     -- El permiso `devolver_base` en _acciones_default() puede quedarse: sin la función no lo usa nadie.
--   La pantalla vieja (3 pasos) dejaría de funcionar para nadie más que ADMIN; habría que revertir
--   también el commit de ModalDevolucionBase.tsx.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-172');

begin;

-- ─── 1. EL PERMISO EN LA BASE ────────────────────────────────────────────────────────────────
-- Espejo SQL de `devolver_base` en src/lib/acciones.ts: ADMIN_PRINCIPAL, ADMIN y SECRETARIA.
do $mig$
declare
  v_def text; v_veces int;
  c_admins     constant text := '''rodar_tiempo'',''mover_excedente_base'']';
  c_secretaria constant text := '''iniciar_liquidacion'',''rodar_tiempo'',''mover_excedente_base'']';
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = '_acciones_default';
  if v_def is null then raise exception 'No existe public._acciones_default().'; end if;
  if position('devolver_base' in v_def) > 0 then
    raise notice 'NADA QUE HACER: _acciones_default() ya tiene devolver_base.'; return;
  end if;

  -- La SECRETARIA primero: su ancla contiene la de los admins y si se reemplaza después se duplica.
  v_veces := (length(v_def) - length(replace(v_def, c_secretaria, ''))) / length(c_secretaria);
  if v_veces <> 1 then raise exception 'Ancla SECRETARIA encontrada % veces, se esperaba 1.', v_veces; end if;
  v_def := replace(v_def, c_secretaria, '''iniciar_liquidacion'',''rodar_tiempo'',''mover_excedente_base'',''devolver_base'']');

  -- Quedan las 2 de AP y ADMIN (la de SECRETARIA ya no termina igual).
  v_veces := (length(v_def) - length(replace(v_def, c_admins, ''))) / length(c_admins);
  if v_veces <> 2 then raise exception 'Ancla ADMIN/AP encontrada % veces, se esperaban 2.', v_veces; end if;
  v_def := replace(v_def, c_admins, '''rodar_tiempo'',''mover_excedente_base'',''devolver_base'']');

  execute v_def;
  raise notice 'LISTO: devolver_base en AP, ADMIN y SECRETARIA.';
end
$mig$;

-- ─── 2. EL GUARDIÁN: una puerta más, solo para devolver_base() ───────────────────────────────
create or replace function public.enforce_cliente_estado_change()
returns trigger language plpgsql security definer as $$
declare
  estados_libres text[] := array['En proceso', 'Listo para visita', 'Pendiente evaluación'];
  rol_actual text;
begin
  -- Señal transaccional puesta por cerrar_liquidacion() (mig 111). Esa función ya validó el rol
  -- de quien cierra; este guardián protege los cambios SUELTOS, no la operación completa.
  if coalesce(current_setting('app.cierre_liquidacion', true), '') = '1' then
    return new;
  end if;

  -- Señal de devolver_base() (mig 172): ya validó el permiso `devolver_base` y registró la plata
  -- en la misma transacción. Solo abre el paso a "Retirado", nada más.
  if coalesce(current_setting('app.devolucion_base', true), '') = '1'
     and new.estado = 'Retirado' then
    return new;
  end if;

  rol_actual := public.mi_rol();

  if new.estado is distinct from old.estado
     and not (new.estado = any(estados_libres))
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede cambiar el cliente a este estado';
  end if;

  if (new.excepcion_documental is distinct from old.excepcion_documental
      or new.excepcion_motivo is distinct from old.excepcion_motivo
      or new.excepcion_plazo is distinct from old.excepcion_plazo)
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede aplicar excepciones documentales';
  end if;

  return new;
end;
$$;

-- ─── 3. LA DEVOLUCIÓN DE UNA VEZ ─────────────────────────────────────────────────────────────
-- El monto lo sigue calculando la pantalla (ella sabe si la visita se hizo), pero la base lo
-- VERIFICA contra la base real del cliente: si no cuadra peso por peso, no se registra nada.
create or replace function public.devolver_base(
  p_cliente_id uuid,
  p_devolver   numeric,
  p_retencion  numeric,
  p_firma_url  text,
  p_huella_url text,
  p_nota       text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_base   numeric;
  v_estado text;
  v_id     uuid;
  v_hoy    date := (now() at time zone 'America/Bogota')::date;
begin
  if not public.puede_accion('devolver_base') then
    raise exception 'No tienes permiso para devolver la base inicial.';
  end if;
  if coalesce(trim(p_firma_url), '') = '' then
    raise exception 'Falta la firma del cliente: es la prueba de que recibió su dinero. No se registró nada.';
  end if;

  -- EL CANDADO. `for update` hace esperar a un segundo toque simultáneo; cuando entra, ya ve $0.
  select ingreso_inicial, estado into v_base, v_estado
    from public.clientes where id = p_cliente_id
     for update;
  if not found then raise exception 'El cliente no existe.'; end if;

  if coalesce(v_base, 0) <= 0 then
    raise exception 'Este cliente ya no tiene base para devolver: su devolución ya quedó registrada. No se registró nada.';
  end if;
  -- Mismo criterio que la pantalla (`conContrato` en ClientesView): quien ya tiene moto no se
  -- retira por aquí, se liquida.
  if v_estado in ('Activo', 'En seguimiento', 'En riesgo', 'En mora') then
    raise exception 'El cliente está % (tiene contrato): su base no se devuelve aquí, se liquida.', v_estado;
  end if;
  if p_devolver < 0 or p_retencion < 0
     or round(p_devolver) + round(p_retencion) <> round(v_base) then
    raise exception 'Lo que se entrega ($%) más la visita ($%) no da la base del cliente ($%). No se registró nada.',
      round(p_devolver), round(p_retencion), round(v_base);
  end if;

  if round(p_devolver) > 0 then
    insert into public.abonos_base
      (cliente_id, tipo, monto, metodo, fecha, fecha_registro, registrado_por, firma_url, huella_url, nota)
    values
      (p_cliente_id, 'devolucion', round(p_devolver), 'Efectivo', v_hoy, v_hoy, auth.uid(),
       p_firma_url, p_huella_url, coalesce(nullif(trim(p_nota), ''), 'El cliente se retira del proceso'))
    returning id into v_id;
  end if;

  if round(p_retencion) > 0 then
    insert into public.abonos_base
      (cliente_id, tipo, monto, metodo, fecha, fecha_registro, registrado_por, nota)
    values
      (p_cliente_id, 'retencion', round(p_retencion), 'Efectivo', v_hoy, v_hoy, auth.uid(),
       'Visita domiciliaria ya realizada — pago al visitador');
  end if;

  perform set_config('app.devolucion_base', '1', true);
  update public.clientes set ingreso_inicial = 0, estado = 'Retirado' where id = p_cliente_id;
  perform set_config('app.devolucion_base', '', true);

  return v_id;
end;
$$;

revoke all on function public.devolver_base(uuid, numeric, numeric, text, text, text) from public;
grant execute on function public.devolver_base(uuid, numeric, numeric, text, text, text) to authenticated;

select public.registrar_migracion(172, '172_devolver_base_de_una_vez.sql',
  'devolver_base(): la devolución de la base en una transacción, con candado contra la doble devolución');

commit;

select public.tomar_foto_plata('despues-172');

-- ─── VERIFICACIÓN ────────────────────────────────────────────────────────────────────────────
-- (a) Debe dar CERO filas: esta migración no mueve plata de nadie.
select * from public.comparar_fotos('antes-172', 'despues-172');

-- (b) Permisos: ap = true · admin = true · secretaria = true · subadmin = false
select 'devolver_base' = any(public._acciones_default('ADMIN_PRINCIPAL')) as ap,
       'devolver_base' = any(public._acciones_default('ADMIN'))           as admin,
       'devolver_base' = any(public._acciones_default('SECRETARIA'))      as secretaria,
       'devolver_base' = any(public._acciones_default('SUBADMIN'))        as subadmin;

-- Limpieza de las fotos (ya cumplieron su papel):
-- delete from public.foto_plata where etiqueta in ('antes-172','despues-172');
