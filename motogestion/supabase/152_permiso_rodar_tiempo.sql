-- 152 — El permiso "rodar el tiempo de un contrato" se puede prender y apagar por persona
-- ============================================================================================
-- QUÉ CAMBIA
-- Hasta hoy, quién podía decidir entre COBRAR el tiempo guardado o RODARLO estaba quemado en el
-- código como "ADMIN o ADMIN_PRINCIPAL" en unas pantallas, y abierto a cualquiera en otras. Ahora
-- es una acción del catálogo (`rodar_tiempo`), igual que `crear_convenio` o `recolectar_moto`: se
-- ve en Usuarios y se prende/apaga por persona.
--
-- QUIÉNES LO TIENEN AL ARRANCAR — exactamente los mismos que lo hacían ayer, ni uno más ni uno
-- menos (decisión del dueño, 15-sep-2026: "dejar como está hoy"): ADMIN_PRINCIPAL, ADMIN,
-- SECRETARIA y SUBADMIN. El SUBADMIN ya rodaba desde Inmovilizaciones y Cartera — es la regla del
-- dueño del 24-ago: "quien opere el flujo; lo sagrado es EL RASTRO", y el rastro no cambia (sigue
-- exigiendo el documento firmado).
--
-- 🔴 POR QUÉ ESTA MIGRACIÓN NO REESCRIBE LA FUNCIÓN COMPLETA
-- La mig 124 volvió a escribir dos triggers copiándolos de un archivo de migración viejo y borró
-- en silencio lo que otra migración posterior les había agregado; costó tres días descubrirlo.
-- Acá se lee la definición VIVA con `pg_get_functiondef`, se le insertan las tres palabras y se
-- vuelve a guardar. Si la función viva no es la que esperamos, la migración FALLA en vez de
-- pisar algo: cada ancla tiene su número exacto de apariciones.
--
-- Espejo del frontend: `DEFAULT_ACCIONES` en src/lib/acciones.ts. Si se toca una, se toca la otra.
-- Correr en el SQL Editor de Supabase. Es idempotente: correrla dos veces no hace nada la segunda.
-- ============================================================================================

do $mig$
declare
  v_def   text;
  v_veces int;

  -- Las tres anclas, con cuántas veces DEBE aparecer cada una.
  c_admins      constant text := '''ceder_contrato'',''entregar_premio'',''asignar_tarea'']';
  c_secretaria  constant text := '''entregar_premio'',''iniciar_liquidacion'']';
  c_subadmin    constant text := 'array[''recolectar_moto'',''iniciar_liquidacion'']';
begin
  select pg_get_functiondef(p.oid) into v_def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = '_acciones_default';

  if v_def is null then
    raise exception 'No existe public._acciones_default(). Corre primero la migración 048.';
  end if;

  if position('rodar_tiempo' in v_def) > 0 then
    raise notice 'NADA QUE HACER: _acciones_default() ya tiene rodar_tiempo.';
    return;
  end if;

  -- ── 1) ADMIN_PRINCIPAL y ADMIN (las dos listas terminan igual) ────────────────────────────
  v_veces := (length(v_def) - length(replace(v_def, c_admins, ''))) / length(c_admins);
  if v_veces <> 2 then
    raise exception 'Ancla de ADMIN/ADMIN_PRINCIPAL encontrada % veces, se esperaban 2. La función viva no es la que esta migración conoce: revisar a mano antes de seguir.', v_veces;
  end if;
  v_def := replace(v_def, c_admins,
                   '''ceder_contrato'',''entregar_premio'',''asignar_tarea'',''rodar_tiempo'']');

  -- ── 2) SECRETARIA ─────────────────────────────────────────────────────────────────────────
  -- Ya lo hacía: en Cartera resuelve el tiempo guardado ANTES de armar el convenio.
  v_veces := (length(v_def) - length(replace(v_def, c_secretaria, ''))) / length(c_secretaria);
  if v_veces <> 1 then
    raise exception 'Ancla de SECRETARIA encontrada % veces, se esperaba 1.', v_veces;
  end if;
  v_def := replace(v_def, c_secretaria,
                   '''entregar_premio'',''iniciar_liquidacion'',''rodar_tiempo'']');

  -- ── 3) SUBADMIN ───────────────────────────────────────────────────────────────────────────
  -- Ya rodaba al entregar una retenida y al devolver un préstamo (regla del dueño, 24-ago).
  v_veces := (length(v_def) - length(replace(v_def, c_subadmin, ''))) / length(c_subadmin);
  if v_veces <> 1 then
    raise exception 'Ancla de SUBADMIN encontrada % veces, se esperaba 1.', v_veces;
  end if;
  v_def := replace(v_def, c_subadmin,
                   'array[''recolectar_moto'',''iniciar_liquidacion'',''rodar_tiempo'']');

  execute v_def;
  raise notice 'LISTO: rodar_tiempo agregado a ADMIN_PRINCIPAL, ADMIN, SECRETARIA y SUBADMIN.';
end
$mig$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────
-- Los 4 primeros deben dar TRUE y los 3 últimos FALSE. Si alguno sale al revés, avisar.
select 'ADMIN_PRINCIPAL' as rol, 'rodar_tiempo' = any(public._acciones_default('ADMIN_PRINCIPAL')) as puede_rodar
union all select 'ADMIN',       'rodar_tiempo' = any(public._acciones_default('ADMIN'))
union all select 'SECRETARIA',  'rodar_tiempo' = any(public._acciones_default('SECRETARIA'))
union all select 'SUBADMIN',    'rodar_tiempo' = any(public._acciones_default('SUBADMIN'))
union all select 'VISITADOR',   'rodar_tiempo' = any(public._acciones_default('VISITADOR'))
union all select 'MECANICO',    'rodar_tiempo' = any(public._acciones_default('MECANICO'))
union all select 'SOCIO',       'rodar_tiempo' = any(public._acciones_default('SOCIO'));

-- Y que NO se haya perdido nada por el camino: estas 4 deben seguir dando TRUE.
select 'AP conserva asignar_tarea'        as control, 'asignar_tarea'      = any(public._acciones_default('ADMIN_PRINCIPAL')) as ok
union all select 'ADMIN conserva ceder',       'ceder_contrato'     = any(public._acciones_default('ADMIN'))
union all select 'SECRE conserva liquidar',    'iniciar_liquidacion'= any(public._acciones_default('SECRETARIA'))
union all select 'SUBADMIN conserva recolectar','recolectar_moto'   = any(public._acciones_default('SUBADMIN'));
