-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 183 — EL ACUERDO VENCIDO NO SE COBRA DOS VECES (2-oct-2026, D-036, aprobada por el dueño)
--
-- 🔴 EL DEFECTO, MEDIDO EL 2-OCT. Dos reglas chocan:
--   · Mig 130 (7-sep): al incumplirse un acuerdo, sus deudas vuelven a 'pendiente' y se cobran aparte.
--   · Migs 157-159 (17/18-sep): el acuerdo incumplido SE SIGUE COBRANDO por lo que le falta.
-- Desde el 17-sep pasan las dos: se cobra lo que le falta al acuerdo Y la deuda que está dentro de
-- ese mismo acuerdo. 6 clientes, $2.718.000 de más en pantalla (y en la liquidación, si se liquidaran):
--   ARISMEL MUÑOZ (RMY48H)      $889.000 → $447.000      NELSON ESTUPIÑAN (RMZ58H)  $4.067.400 → $3.197.400
--   JORGE BELLO (RLT88H)      $1.949.000 → $1.362.000    JULIO SAYAS (RNG54H)       $2.485.000 → $2.035.000
--   WILLINGTON GARCIA (DQW26I)  $566.000 → $296.000      ERICK RODRIGUEZ (DQG87I)     $324.000 → $225.000
-- Nadie ha pagado todavía a esas deudas devueltas: no hay que mover ningún pago.
-- Y ZALA estaba al revés: no veía el acuerdo vencido pero sí la deuda devuelta (a ARISMEL le cobraba
-- $637.000). Era el pendiente "ZALA no ve el acuerdo VENCIDO" (WILLINGTON y ARISMEL).
--
-- LA REGLA (D-036): las deudas de un acuerdo se quedan dentro de él aunque se venza. Lo que se cobra
-- es lo que le falta al acuerdo — la regla del 17-sep, que ya manda en la app, el motor y el servidor.
--
-- LO QUE HACE:
--   1. `convenio_incumplido_devuelve_deudas()`: deja de devolver las deudas al incumplirse. Conserva
--      la vuelta (si el acuerdo se reactiva, lo que haya quedado 'pendiente' regresa adentro).
--   2. Las 6 deudas devueltas vuelven a 'en_convenio'. Se detiene si no son exactamente 6 por $2.718.000.
--   3. La vitrina `zala.cliente` elige el acuerdo igual que la app y el servidor (mig 158): el activo,
--      y si no hay, el incumplido más viejo. Se parcha la vista VIVA con un ancla; no se regenera.
--
-- ⚠️ LO QUE NO HACE: si a un cliente con un acuerdo vencido se le firma uno NUEVO, el nuevo no recoge
-- las deudas del vencido (siguen dentro de él). Nunca ha pasado (medido el 2-oct: 0 casos). Queda en
-- PENDIENTES decidir si eso se bloquea o se avisa.
--
-- ── CÓMO DESHACERLA ─────────────────────────────────────────────────────────────────────────
--   La foto 'antes-183' guarda la plata de cada contrato. Para la regla y la vitrina: volver a correr
--   el cuerpo de la función de la mig 130, y en zala.cliente cambiar el join de vuelta a
--   `cv.estado = 'activo'`. Las 6 deudas: `update deudas set estado = 'pendiente'` sobre esos ids.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

select public.tomar_foto_plata('antes-183') as contratos_fotografiados;

begin;

-- ─── 1. La regla: el acuerdo vencido se queda con sus deudas ────────────────────────────────
do $mig$
declare v_def text;
begin
  v_def := pg_get_functiondef('public.convenio_incumplido_devuelve_deudas()'::regprocedure);
  if position('set estado = ''pendiente''' in v_def) = 0 then
    raise exception '183 ABORTADA: convenio_incumplido_devuelve_deudas ya no es la de la mig 130. NO se tocó nada.';
  end if;
end
$mig$;

create or replace function public.convenio_incumplido_devuelve_deudas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Desde la mig 157 el acuerdo vencido se sigue cobrando por lo que le falta: sus deudas se quedan
  -- adentro ('en_convenio'). Devolverlas al incumplirse las cobraba dos veces (D-036, mig 183).
  -- Solo queda la vuelta: si el acuerdo se reactiva, lo que haya quedado 'pendiente' regresa adentro.
  if new.estado = 'activo' and coalesce(old.estado, '') = 'incumplido' then
    update public.deudas
       set estado = 'en_convenio'
     where convenio_id = new.id
       and estado = 'pendiente'
       and monto_pendiente > 0;
  end if;
  return new;
end; $$;

-- ─── 2. Las 6 deudas devueltas vuelven adentro de su acuerdo ─────────────────────────────────
do $fix$
declare n int; v_total numeric;
begin
  with vuelven as (
    update public.deudas d
       set estado = 'en_convenio'
      from public.convenios cv
     where d.convenio_id = cv.id
       and cv.estado = 'incumplido'
       and d.estado = 'pendiente'
       and d.monto_pendiente > 0
    returning d.monto_pendiente
  )
  select count(*), coalesce(sum(monto_pendiente), 0) into n, v_total from vuelven;
  if n <> 6 or v_total <> 2718000 then
    raise exception '183 ABORTADA: se esperaban 6 deudas por $2.718.000 y salieron % por $%. NO se tocó nada.', n, v_total;
  end if;
  raise notice 'LISTO: 6 deudas ($2.718.000) vuelven adentro de su acuerdo.';
end
$fix$;

-- ─── 3. ZALA ve el acuerdo vencido (el mismo que la app y el servidor) ───────────────────────
do $mig$
declare
  v_def text; v_n int; v_opc text;
  v_ancla constant text := '(cv.contrato_id = c.id) AND (cv.estado = ''activo''::text)';
  v_nuevo constant text := '(cv.contrato_id = c.id) AND (cv.id = ( SELECT cv2.id FROM public.convenios cv2'
               || ' WHERE cv2.contrato_id = c.id AND cv2.estado = ANY (ARRAY[''activo''::text, ''incumplido''::text])'
               || ' ORDER BY CASE WHEN cv2.estado = ''activo''::text THEN 0 ELSE 1 END, cv2.created_at'
               || ' LIMIT 1))';
begin
  v_def := pg_get_viewdef('zala.cliente'::regclass);
  if position('''incumplido''' in v_def) > 0 then
    raise notice 'NADA QUE HACER: zala.cliente ya veía el acuerdo vencido.';
    return;
  end if;
  v_n := (length(v_def) - length(replace(v_def, v_ancla, ''))) / length(v_ancla);
  if v_n <> 1 then
    raise exception '183 ABORTADA: el ancla del acuerdo en zala.cliente aparece % veces y se esperaba 1. NO se tocó nada.', v_n;
  end if;
  v_def := rtrim(replace(v_def, v_ancla, v_nuevo));
  if right(v_def, 1) = ';' then v_def := left(v_def, length(v_def) - 1); end if;
  -- `create or replace view` borra las opciones de la vista si no se repiten: se conservan.
  select coalesce(' with (' || array_to_string(reloptions, ', ') || ')', '') into v_opc
    from pg_class where oid = 'zala.cliente'::regclass;
  execute 'create or replace view zala.cliente' || v_opc || ' as ' || v_def;
  raise notice 'LISTO: ZALA ve el acuerdo vencido.';
end
$mig$;

select public.registrar_migracion(183, '183_acuerdo_vencido_no_cobra_doble.sql',
  'El acuerdo vencido se queda con sus deudas (no se cobran dos veces) y ZALA ve el acuerdo vencido (D-036)');

commit;

-- ─── Comprobación (correr después) ──────────────────────────────────────────────────────────
-- Debe dar 0: deudas devueltas de acuerdos incumplidos.
--   select count(*) from public.deudas d join public.convenios cv on cv.id = d.convenio_id
--    where cv.estado = 'incumplido' and d.estado = 'pendiente' and d.monto_pendiente > 0;
-- ARISMEL en ZALA: acuerdo_falta 252000, deudas_falta 0, debe_hoy 447000.
--   select placa, debe_hoy, cuota_falta, acuerdo_falta, deudas_falta from zala.cliente where placa = 'RMY48H';
