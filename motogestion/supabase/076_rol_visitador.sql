-- 076 — Rol VISITADOR: personas contratadas SOLO para hacer visitas domiciliarias.
--
-- POR QUÉ UN ROL NUEVO Y NO UN SUBADMIN RECORTADO: un SUBADMIN ve la ficha COMPLETA de sus
-- clientes (cédula, los 6 documentos escaneados con enlace abrible, huella, firma, foto del
-- rostro, lista negra, ingreso inicial), y no existe control por campo en ninguna capa —
-- createTableStore hace select("*"), así que la fila entera llega al navegador aunque la
-- pantalla no la pinte. El dueño definió que el visitador vea SOLO nombre, dirección y teléfono
-- del titular más nombre y teléfono del acompañante. Eso no se logra escondiendo campos.
--
-- LA IDEA CENTRAL: el VISITADOR **no tiene lectura sobre `clientes`**. En vez de recortarle la
-- ficha, no se le da: la función `mis_visitas_asignadas()` le devuelve solo las columnas que
-- necesita. El recorte vive acá, no en la pantalla.
--
-- ⚠️ Esta migración ADEMÁS cierra dos huecos que hoy están contenidos solo porque las sesiones
-- son de gente de confianza — y eso es justo lo que va a cambiar al contratar gente por horas.

-- ─────────────────────────────────────────────────────────────────────────────
-- 0) EL ROL Y SU FUNCIÓN DE SCOPE
--
-- Van PRIMERO porque las políticas de más abajo los referencian, y Postgres valida la
-- referencia en el momento de crear la política (no al usarla).
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('ADMIN_PRINCIPAL','ADMIN','SUBADMIN','SECRETARIA','MECANICO','SOCIO','VISITADOR'));

-- Scope del visitador: SOLO por visitas. Sin la rama de contratos que sí tiene el subadmin —
-- un visitador no gestiona motos.
create or replace function public.mis_clientes_visitador()
returns setof uuid language sql stable security definer
set search_path = public as $$
  select id from public.clientes where visita_asignada_a = auth.uid()
  union
  select cliente_id from public.visitas where asignada_a = auth.uid();
$$;
revoke all on function public.mis_clientes_visitador() from public;
grant execute on function public.mis_clientes_visitador() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) SEGURIDAD: Storage abierto a cualquier autenticado
--
-- La 071 dejó `select` sobre los 5 buckets a TODO `authenticated`, sin mirar rol ni dueño del
-- archivo. Y las carpetas se nombran con la cédula del cliente (useClientes.ts:132), así que
-- listar la raíz del bucket devuelve el directorio completo de los ~270 clientes: cédulas
-- escaneadas, huellas, firmas, fotos de la cara, contratos y comprobantes de pago.
-- El VISITADOR no necesita LEER un solo archivo — solo SUBIR las fotos de su visita.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "storage_select_auth_todos" on storage.objects;
create policy "storage_select_auth_todos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id in ('documentos','comprobantes','firmas','certificados','liquidaciones')
    and public.mi_rol() is distinct from 'VISITADOR'
  );

-- Subir: al VISITADOR solo bajo `visitas/`, que es lo único que produce.
-- Las políticas viejas (017) daban INSERT/UPDATE a cualquier autenticado sobre todo el bucket.
drop policy if exists "documentos_insert_auth" on storage.objects;
create policy "documentos_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documentos'
    and (public.mi_rol() is distinct from 'VISITADOR' or name like 'visitas/%')
  );

-- Reemplazar un archivo existente: el VISITADOR nunca. Antes cualquier autenticado podía
-- sobrescribir la cédula escaneada o la firma de cualquier cliente.
drop policy if exists "documentos_update_auth" on storage.objects;
create policy "documentos_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documentos' and public.mi_rol() is distinct from 'VISITADOR');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) SEGURIDAD: el INSERT de visitas no tenía scope
--
-- La 037 permitía insertar una visita para CUALQUIER cliente_id. Y mis_clientes_subadmin()
-- (026:31-38) incluye `visitas.asignada_a = auth.uid()`, así que insertarse una visita a un
-- cliente ajeno REGALABA acceso permanente a su ficha completa. Escalada real, no teórica.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "Visitas: registro por staff de cobro" on public.visitas;
create policy "Visitas: registro con scope"
  on public.visitas for insert to authenticated
  with check (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN'   and cliente_id in (select public.mis_clientes_subadmin()))
    or (public.mi_rol() = 'VISITADOR'  and cliente_id in (select public.mis_clientes_visitador()))
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) DEFAULTS DE ACCIONES DEL ROL NUEVO
-- ─────────────────────────────────────────────────────────────────────────────

-- Defaults de acciones: el visitador NO tiene ninguna (no aprueba, no cobra, no liquida).
-- De paso se sincroniza `exportar_datos`, que está en src/lib/acciones.ts desde el 27-jul
-- pero faltaba acá — el mapa de TS y el de SQL tienen que decir lo mismo.
create or replace function public._acciones_default(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'ADMIN_PRINCIPAL' then array[
      'registrar_efectivo','confirmar_transferencia','eliminar_pago','cerrar_caja','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra',
      'editar_configuracion','exportar_datos']
    when 'ADMIN' then array[
      'registrar_efectivo','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra',
      'editar_configuracion','exportar_datos']
    when 'SECRETARIA' then array[
      'registrar_efectivo','confirmar_transferencia','cerrar_caja','aplicar_saldo_favor','crear_convenio']
    when 'SUBADMIN' then array['recolectar_moto','iniciar_liquidacion']
    when 'VISITADOR' then array[]::text[]
    else array[]::text[]
  end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) LA ÚNICA PUERTA A DATOS DE CLIENTES PARA EL VISITADOR
--
-- Devuelve SOLO lo que necesita para llegar a la casa y tocar la puerta. El acompañante va
-- incluido porque el dueño lo pidió: es a quién llamar si el titular no contesta.
-- NO devuelve cédula, documentos, huella, firma, foto, lista negra ni nada financiero.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.mis_visitas_asignadas()
returns table (
  cliente_id uuid,
  nombre text,
  direccion text,
  telefono text,
  whatsapp text,
  acompanante_nombre text,
  acompanante_telefono text,
  estado text,
  visita_registrada boolean
)
language sql security definer
set search_path = public
stable as $$
  select
    c.id,
    c.nombre,
    c.direccion,
    c.telefono,
    c.whatsapp,
    c.acompanante_nombre,
    c.acompanante_telefono,
    c.estado,
    exists (select 1 from public.visitas v where v.cliente_id = c.id and v.asignada_a = auth.uid())
  from public.clientes c
  where c.visita_asignada_a = auth.uid()
    and c.estado in ('Listo para visita', 'Pendiente evaluación')
  order by c.nombre;
$$;
revoke all on function public.mis_visitas_asignadas() from public;
grant execute on function public.mis_visitas_asignadas() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) VER SUS PROPIAS VISITAS (para saber cuáles ya registró y cuáles le rebotaron)
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "Visitas: lectura por rol" on public.visitas;
create policy "Visitas: lectura por rol"
  on public.visitas for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() in ('SUBADMIN','VISITADOR') and asignada_a = auth.uid())
  );

-- Que el visitador aparezca en el desplegable de "asignar visita" junto a los sub-admin.
-- Sigue devolviendo solo id + nombre: nada más de la tabla profiles.
create or replace function public.nombres_subadmins()
returns table (id uuid, nombre text)
language sql security definer
set search_path = public
stable as $$
  select p.id, p.nombre
  from public.profiles p
  where p.role in ('SUBADMIN', 'VISITADOR')
$$;
revoke all on function public.nombres_subadmins() from public;
grant execute on function public.nombres_subadmins() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- CÓMO COMPROBAR QUE QUEDÓ BIEN (con una sesión de VISITADOR abierta):
--   · storage.from('documentos').list('')            → debe dar VACÍO
--   · subir una foto a visitas/…                     → debe FUNCIONAR
--   · select * from clientes                         → debe dar VACÍO (no tiene policy)
--   · select * from mis_visitas_asignadas()          → solo las suyas, con 7 columnas
--   · insert en visitas con un cliente_id ajeno      → debe RECHAZAR
-- Con una sesión de ADMIN, todo lo anterior debe seguir funcionando igual que antes.
-- ─────────────────────────────────────────────────────────────────────────────
