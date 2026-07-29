-- 077 — El visitador puede ir a documentar el lugar cuando la validación sale ❌ NO COINCIDE.
--
-- LA REGLA DEL DUEÑO (28-jul-2026): cuando el admin valida contra el GPS y la moto NO duerme
-- donde el visitador reportó, le toca a ÉL llamar al cliente por la explicación, ir hasta el
-- lugar real, y documentarlo: fotos, GPS y quién está a cargo del sitio (por si hay que ir a
-- preguntar sin el cliente). El registro del ❌ se conserva: queda que informó mal.
--
-- Y se le paga por dejar el dato CIERTO, no por acertar de una: la visita queda pagable cuando
-- el lugar quedó confirmado, sea el que reportó o el que encontró después.
--
-- QUÉ FALTABA para que eso fuera posible (la 076 lo dejó cerrado de más):
--   · el visitador solo podía subir bajo `visitas/`, y las fotos del lugar van a `guardados/`
--   · no tiene UPDATE sobre `contratos`, así que no podía escribir `guardado_lugar`
-- Se resuelve con una RPC acotada, no abriéndole la tabla.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Subir también las fotos del lugar de guardado
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "documentos_insert_auth" on storage.objects;
create policy "documentos_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documentos'
    and (
      public.mi_rol() is distinct from 'VISITADOR'
      or name like 'visitas/%'
      or name like 'guardados/%'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) SUS re-verificaciones pendientes
--
-- Contratos donde ÉL hizo la visita y el admin marcó que la moto no duerme donde se dijo.
-- Devuelve lo mínimo para ir: a quién buscar, dónde y con qué teléfonos. Igual que
-- mis_visitas_asignadas(), NO devuelve cédula, documentos, huella ni nada financiero.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.mis_reverificaciones()
returns table (
  contrato_id uuid,
  cliente_id uuid,
  nombre text,
  direccion text,
  telefono text,
  acompanante_nombre text,
  acompanante_telefono text,
  placa text,
  fecha_validacion timestamptz,
  ya_documentado boolean
)
language sql security definer
set search_path = public
stable as $$
  select
    ct.id, c.id, c.nombre, c.direccion, c.telefono,
    c.acompanante_nombre, c.acompanante_telefono,
    m.placa,
    ct.ubicacion_moto_validada_fecha,
    ct.guardado_lugar is not null
  from public.contratos ct
  join public.clientes c on c.id = ct.cliente_id
  left join public.motos m on m.id = ct.moto_id
  where ct.ubicacion_moto_resultado = 'no_coincide'
    and exists (
      select 1 from public.visitas v
      where v.cliente_id = ct.cliente_id
        and coalesce(v.realizada_por, v.asignada_a) = auth.uid()
    )
  order by ct.ubicacion_moto_validada_fecha desc nulls last;
$$;
revoke all on function public.mis_reverificaciones() from public;
grant execute on function public.mis_reverificaciones() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Registrar el lugar real — SIN abrirle la tabla `contratos`
--
-- La función valida que quien llama haya hecho de verdad la visita de ese cliente. Un
-- visitador no puede escribir en el contrato de alguien que no visitó, ni tocar ninguna otra
-- columna: solo `guardado_lugar`.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.registrar_guardado_visitador(
  p_contrato_id uuid,
  p_datos jsonb
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_cliente uuid;
begin
  select cliente_id into v_cliente from public.contratos where id = p_contrato_id;
  if v_cliente is null then
    raise exception 'Ese contrato no existe';
  end if;

  if not exists (
    select 1 from public.visitas v
    where v.cliente_id = v_cliente
      and coalesce(v.realizada_por, v.asignada_a) = auth.uid()
  ) then
    raise exception 'Solo puedes registrar el lugar de un cliente que tú visitaste';
  end if;

  update public.contratos
     set guardado_lugar = p_datos || jsonb_build_object(
           'fecha', now(),
           'por',   auth.uid()
         )
   where id = p_contrato_id;
end $$;
revoke all on function public.registrar_guardado_visitador(uuid, jsonb) from public;
grant execute on function public.registrar_guardado_visitador(uuid, jsonb) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) De paso: quitar la política de UPDATE duplicada sobre `visitas`
--
-- Convivían dos y Postgres las combina con O: la vieja (026) dejaba pasar a cualquier
-- ADMIN/ADMIN_PRINCIPAL sin mirar el permiso `aprobar_visita`. O sea que si le BLOQUEABAS esa
-- acción a un admin desde Usuarios, el botón se le escondía pero la base lo dejaba pasar por
-- consola. La de la 057 (por permiso de acción) ya cubre a los dos, con el bypass de AP incluido.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "Visitas: solo admin resuelve" on public.visitas;

-- ─────────────────────────────────────────────────────────────────────────────
-- CÓMO COMPROBARLO (con sesión de VISITADOR):
--   · select * from mis_reverificaciones()                → solo las suyas
--   · registrar_guardado_visitador(<contrato ajeno>, '{}') → debe dar "Solo puedes registrar…"
--   · subir una foto a guardados/…                         → debe FUNCIONAR
--   · select * from contratos                              → sigue VACÍO
-- Y con un ADMIN al que le BLOQUEES `aprobar_visita`: un update directo a `visitas` debe fallar.
-- ─────────────────────────────────────────────────────────────────────────────
