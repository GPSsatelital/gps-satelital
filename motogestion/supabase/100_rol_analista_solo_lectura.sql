-- ===== 100: rol ANALISTA — ve todo, no toca nada =====
--
-- PARA QUÉ (pedido del dueño, 16-ago-2026): una cuenta de solo lectura para un asistente de
-- análisis que consulta la base directo por la API REST, no por la app.
--
-- 🔴 LA CUENTA SE USA CON LA `anon key` + LOGIN DE ESE USUARIO. Nunca con la
-- `service_role key`: esa se salta TODAS las políticas y convertiría al "solo lectura" en un
-- administrador con permiso de borrar. Es la única forma de que "solo lectura" signifique algo.
--
-- POR QUÉ ES SEGURO POR CONSTRUCCIÓN: cada política de escritura de este sistema nombra
-- explícitamente los roles que pueden ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'...). Un rol que
-- no está en ninguna de esas listas no puede escribir en ninguna parte — y tampoco podrá en las
-- tablas que se creen mañana, porque nadie lo va a agregar. No dependemos de acordarnos de
-- bloquearlo: dependemos de nunca haberlo autorizado.
--
-- QUÉ NO TOCA: ni una sola política existente. Solo AGREGA una política de lectura por tabla.
-- ADMIN, SECRETARIA, SUBADMIN, SOCIO, MECANICO y VISITADOR quedan exactamente igual.
--
-- LA ÚNICA EXCEPCIÓN: `marcar_convenios_vencidos()` sí se modifica — ver el bloque 3.
--
-- LA APP NO SE TOCA. El rol ANALISTA no existe en el `Role` de AuthContext ni en
-- DEFAULT_ACCIONES/ACCESOS_SUGERIDOS a propósito: esta cuenta no es para entrar a las
-- pantallas. Si algún día se quiere que también entre por la app, eso es un cambio aparte.
--
-- ⚠️ AL CREAR LA CUENTA: `handle_new_user` la hace nacer como **SECRETARIA**
-- (`coalesce(raw_user_meta_data->>'role','SECRETARIA')`) — el rol que registra efectivo,
-- confirma transferencias y cierra caja. Crear el usuario y correr el UPDATE del rol tienen
-- que ir seguidos, en la misma sentada.

-- ── 1) Que la credencial exista ──────────────────────────────────────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('ADMIN_PRINCIPAL','ADMIN','SUBADMIN','SECRETARIA',
                  'MECANICO','SOCIO','VISITADOR','ANALISTA'));

-- ── 2) Lectura en las 23 tablas ──────────────────────────────────────────────────────────────
-- En bucle a propósito: la lista queda explícita y la regla es idéntica en todas, así que no
-- puede quedar una tabla con una condición distinta por un copiar-pegar mal hecho.
-- El `drop if exists` va primero → se puede volver a correr sin romper nada.
--
-- Las 23 salieron de la BD VIVA (pg_class + pg_policies, 16-ago), no del repo. Dos merecen nota
-- porque su política de lectura NO es por rol sino por acción, y una política nueva es la única
-- forma de que el analista las lea sin darle un permiso que implica escritura:
--   · contratos_auditoria → puede_accion('editar_contrato')
--   · liquidaciones       → puede_accion('iniciar_liquidacion')
-- Y `mensajes_whatsapp` ya estaba abierta a cualquier autenticado; se le agrega igual, para que
-- si alguien la cierra el día de mañana el analista no se quede ciego sin que nadie lo note.
do $$
declare t text;
begin
  foreach t in array array[
    'abonos_base','acuerdos_tiempo_rodado','caja_diaria','cesiones_contrato','clientes',
    'contratos','contratos_auditoria','convenios','cuentas_bancarias','deudas',
    'gestiones_cobro','historial_ubicaciones','ingresos_no_identificados','liquidaciones',
    'mensajes_whatsapp','motos','pagos','prestamos_llave_tarjeta','prestamos_reemplazo',
    'profiles','recepciones_vehiculo','taller','visitas'
  ] loop
    execute format('drop policy if exists "Analista: solo lectura" on public.%I', t);
    execute format('create policy "Analista: solo lectura" on public.%I '
                   'for select to authenticated using (public.mi_rol() = ''ANALISTA'')', t);
  end loop;
end $$;

-- `profiles` va incluida a propósito: ahí no hay claves ni correos (viven en auth.users), solo
-- nombre y rol. Sin ella el asistente lee "lo registró 8f3a-91c2-…" en vez de "lo registró
-- ANGELA". Si algún día se quiere fuera, se saca de la lista de arriba y se corre de nuevo.

-- ── 3) El botón que quedaba suelto ───────────────────────────────────────────────────────────
-- Auditoría del 16-ago: de las 30 funciones `security definer`, casi todas son de disparador
-- (Postgres no deja llamarlas directo) y las demás validan por dentro:
--   · cerrar_empalme               → exige ADMIN/AP/SECRETARIA
--   · registrar_guardado_visitador → exige haber hecho ESA visita (auth.uid())
--   · siguiente_numero_liquidacion → solo saca un folio de una secuencia
-- La única sin ningún control era esta, y ESCRIBE: marca convenios activos como incumplidos, y
-- 3 incumplidos = liquidación obligatoria. Cualquier usuario con sesión podía llamarla.
--
-- Los cuatro roles del `if` son exactamente los que la llaman hoy al abrir Cartera: para ellos
-- NO cambia nada. Para cualquier otro devuelve 0 sin tocar una fila. El resto del cuerpo queda
-- idéntico, letra por letra (incluido el no tener `set search_path` — no se "mejora de paso";
-- las tablas ya van calificadas con `public.`).
create or replace function public.marcar_convenios_vencidos()
returns int language plpgsql security definer as $$
declare
  v_count int;
begin
  if public.mi_rol() not in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA','SUBADMIN') then
    return 0;
  end if;
  update public.convenios
     set estado = 'incumplido'
   where estado = 'activo'
     and fecha_limite < current_date
     and cuotas_pagadas < numero_cuotas;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ── Cómo se completa (fuera de esta migración) ───────────────────────────────────────────────
--   1. Supabase → Authentication → Users → Add user (correo + clave + Auto Confirm User)
--   2. De inmediato (ver la advertencia de arriba):
--        update public.profiles
--           set role='ANALISTA', nombre='ASISTENTE DE ANALISIS',
--               permisos='[]'::jsonb, acciones='{}'::jsonb
--         where id = (select id from auth.users where email='<el correo>');
--      Si rebota con "Solo el administrador principal puede cambiar rol", se rodea con
--      `alter table public.profiles disable/enable trigger trg_profiles_role_guard`.
--   3. Prueba real: leer un pago debe salir · crear una deuda debe rebotar.
--
-- LO QUE ESTA MIGRACIÓN NO CUBRE: los documentos escaneados (cédulas, firmas, huellas) viven en
-- Storage, con sus propias políticas. Este rol no las abre. Es una decisión aparte.
