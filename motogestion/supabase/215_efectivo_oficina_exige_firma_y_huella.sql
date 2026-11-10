-- ===== 215: el efectivo de la oficina exige la firma, la huella y la foto del cliente (D-065) =====
-- Pedido del dueño (5-nov-2026): si al cliente le falta el registro y la huella, que no deje
-- registrarle un pago en efectivo en la oficina hasta que quede registrado. Si el efectivo se
-- recogió en campo, que no bloquee, porque el cliente no está presente.
--
-- Qué cuenta como «registrado» (decisión del dueño, 5-nov): la FIRMA y la HUELLA del recuadro
-- «Autorización de tratamiento de datos» (Ley 1581): clientes.autorizacion_datos_firma_url y
-- clientes.autorizacion_datos_huella_url. Van juntas porque la huella es un dato biométrico y la
-- firma es la autorización expresa para guardarla.
--
-- La FOTO de perfil (clientes.foto_perfil_url) se sumó el 10-nov, antes de correr esta migración,
-- por decisión del dueño: «no importa que haya que estar autorizando». Medido ese día: de los 127
-- clientes que pagaron efectivo en la oficina en 30 días, a 6 les faltaba la firma o la huella y a
-- 29 alguna de las tres; el computador de la oficina no toma la foto con cámara (sí desde archivo).
--
-- Si el lector falla, no hay cámara o el cliente no puede poner el dedo (decisión del dueño, 5-nov): solo el
-- ADMIN_PRINCIPAL autoriza a ESE cliente por ESE día, con motivo obligatorio. Queda guardado quién,
-- cuándo y por qué, y nadie lo puede editar ni borrar desde la app.
--
-- Lo que hace (no reescribe ninguna función que ya exista):
--   1. public.falta_firma_huella(cliente): la única revisión en la base de qué le falta al cliente.
--      Su espejo en la pantalla es src/utils/firmaHuellaEfectivo.ts: si se toca una, se toca la otra.
--   2. public.efectivo_sin_huella_autorizado: las autorizaciones del dueño, una por cliente y día.
--   3. El candado trg_enforce_registro_firma_huella, BEFORE INSERT en pagos. Corre después del
--      candado de permisos (trg_enforce_registrar_efectivo, migs 066 y 067), así que quien no tiene
--      permiso para registrar efectivo sigue viendo el mismo mensaje de antes.
--      Frena SOLO metodo = 'Efectivo' con tipo_registro 'normal' o 'alquiler_reemplazo'.
--      NO frena el cobro en campo ('campo'), las transferencias, el saldo a favor ('saldo_favor'),
--      la semana adelantada ('adelanto_base', la que mete activar_entrega) ni las confirmaciones
--      (son UPDATE, no INSERT). Igual que el candado de permisos, no actúa sobre lo que se corre sin
--      usuario (el editor SQL).
--   4. La prueba, adentro. Cada pago de prueba lleva un estado que no existe ('PRUEBA-215'): el
--      control de estados de pagos se revisa DESPUÉS de los candados, así que si el candado frena se
--      ve su mensaje, y si deja pasar se ve el del estado. Ningún pago se guarda nunca. Si un caso no
--      da lo esperado, la migración se deshace sola.

begin;

-- 1. La revisión. Devuelve lo que le falta, en el orden firma, huella, foto, y con el mismo texto
--    que la pantalla ('la foto', 'la huella y la foto', 'la firma, la huella y la foto'…), o null si
--    tiene las tres. Un texto vacío cuenta como que no está.
create or replace function public.falta_firma_huella(p_cliente_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case cardinality(t.partes)
           when 0 then null
           when 1 then t.partes[1]
           else array_to_string(t.partes[1:cardinality(t.partes) - 1], ', ') || ' y ' || t.partes[cardinality(t.partes)]
         end
    from (
      select array_remove(array[
               case when nullif(btrim(coalesce(c.autorizacion_datos_firma_url, '')), '') is null then 'la firma'::text end,
               case when nullif(btrim(coalesce(c.autorizacion_datos_huella_url, '')), '') is null then 'la huella'::text end,
               case when nullif(btrim(coalesce(c.foto_perfil_url, '')), '') is null then 'la foto'::text end
             ], null) as partes
        from public.clientes c
       where c.id = p_cliente_id
    ) t;
$$;

comment on function public.falta_firma_huella(uuid) is
  'Mig 215: qué le falta al cliente (firma y huella de la autorización de datos, foto de perfil) para '
  'recibirle efectivo en la oficina. Null = tiene las tres. Espejo en src/utils/firmaHuellaEfectivo.ts.';

-- Solo la usa el candado (que corre como dueño de la función); nadie la llama desde la app.
revoke execute on function public.falta_firma_huella(uuid) from public, anon, authenticated;

-- 2. Las autorizaciones del dueño.
create table if not exists public.efectivo_sin_huella_autorizado (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null references public.clientes(id) on delete cascade,
  fecha          date not null default ((now() at time zone 'America/Bogota')::date),
  motivo         text not null,
  autorizado_por uuid not null default auth.uid(),
  created_at     timestamptz not null default now(),
  constraint efectivo_sin_huella_motivo_escrito check (length(btrim(motivo)) >= 5),
  constraint efectivo_sin_huella_un_dia unique (cliente_id, fecha)
);

comment on table public.efectivo_sin_huella_autorizado is
  'Mig 215: el dueño (ADMIN_PRINCIPAL) autoriza recibirle efectivo en la oficina a un cliente sin firma, '
  'sin huella o sin foto, solo ese día y con motivo. Sin editar ni borrar: es el rastro.';

-- Vale solo el día en que se da y queda a nombre de quien tiene la sesión abierta:
-- no se puede autorizar por adelantado ni a nombre de otro.
create or replace function public.efectivo_sin_huella_marca()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.fecha          := (now() at time zone 'America/Bogota')::date;
  new.created_at     := now();
  new.autorizado_por := coalesce(auth.uid(), new.autorizado_por);
  new.motivo         := btrim(new.motivo);
  return new;
end;
$$;

drop trigger if exists trg_efectivo_sin_huella_marca on public.efectivo_sin_huella_autorizado;
create trigger trg_efectivo_sin_huella_marca
  before insert on public.efectivo_sin_huella_autorizado
  for each row execute function public.efectivo_sin_huella_marca();

alter table public.efectivo_sin_huella_autorizado enable row level security;

-- Leer y agregar; editar y borrar no, para nadie de la app.
revoke all on public.efectivo_sin_huella_autorizado from anon, authenticated;
grant select, insert on public.efectivo_sin_huella_autorizado to authenticated;

-- La leen quienes reciben la plata en la oficina y los ADMIN.
drop policy if exists efectivo_sin_huella_select on public.efectivo_sin_huella_autorizado;
create policy efectivo_sin_huella_select on public.efectivo_sin_huella_autorizado for select
  using (public.mi_rol() in ('ADMIN_PRINCIPAL', 'ADMIN', 'SECRETARIA'));

-- La escribe solo el dueño.
drop policy if exists efectivo_sin_huella_insert on public.efectivo_sin_huella_autorizado;
create policy efectivo_sin_huella_insert on public.efectivo_sin_huella_autorizado for insert
  with check (public.mi_rol() = 'ADMIN_PRINCIPAL');

-- 3. El candado.
create or replace function public.enforce_registro_firma_huella()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente uuid;
  v_falta   text;
begin
  if auth.uid() is null then return new; end if;

  -- Solo el efectivo que se recibe en la oficina, con el cliente presente.
  if new.metodo is distinct from 'Efectivo'
     or coalesce(new.tipo_registro, 'normal') not in ('normal', 'alquiler_reemplazo') then
    return new;
  end if;

  select ct.cliente_id into v_cliente from public.contratos ct where ct.id = new.contrato_id;
  if v_cliente is null then return new; end if;

  v_falta := public.falta_firma_huella(v_cliente);
  if v_falta is null then return new; end if;

  -- La salida del dueño: autorización para ese cliente, ese día.
  if exists (
    select 1
      from public.efectivo_sin_huella_autorizado a
     where a.cliente_id = v_cliente
       and a.fecha = (now() at time zone 'America/Bogota')::date
  ) then
    return new;
  end if;

  raise exception using
    errcode = 'MG215',
    message = format(
      'A este cliente le falta %s. Para recibirle efectivo en la oficina, '
      'primero hay que registrarle lo que falta (en la ventana del pago o en Clientes → el cliente → Editar), '
      'o el dueño lo autoriza solo por hoy. Por transferencia sí se le puede recibir.', v_falta);
end;
$$;

comment on function public.enforce_registro_firma_huella() is
  'Mig 215: frena el efectivo de la oficina (normal y alquiler_reemplazo) de un cliente sin firma, sin '
  'huella o sin foto, salvo autorización del dueño de ese día. No toca campo, transferencias ni movimientos internos.';

drop trigger if exists trg_enforce_registro_firma_huella on public.pagos;
create trigger trg_enforce_registro_firma_huella
  before insert on public.pagos
  for each row execute function public.enforce_registro_firma_huella();

-- 4. La prueba.
do $prueba$
declare
  v_sec     uuid := (select id from public.profiles where role = 'SECRETARIA' order by created_at limit 1);
  v_ap      uuid := (select id from public.profiles where role = 'ADMIN_PRINCIPAL' order by created_at limit 1);
  v_hoy     date := (now() at time zone 'America/Bogota')::date;
  v_ct_sin  uuid;   -- contrato de un cliente al que le falta algo
  v_cli_sin uuid;
  v_ct_con  uuid;   -- contrato de un cliente con las tres
  v_ct_foto  uuid;  -- contrato de un cliente con firma y huella, sin foto
  v_cli_foto uuid;
  v_res     text;
  v_pudo    boolean;
  v_fecha   date;
  v_por     uuid;
begin
  if v_sec is null or v_ap is null then
    raise exception 'No hay una secretaria o un ADMIN_PRINCIPAL para la prueba. No se guardó nada.';
  end if;

  select ct.id, ct.cliente_id into v_ct_sin, v_cli_sin
    from public.contratos ct
   where ct.estado in ('Activo', 'Suspendido')
     and public.falta_firma_huella(ct.cliente_id) is not null
   order by ct.id
   limit 1;

  select ct.id into v_ct_con
    from public.contratos ct
   where ct.estado = 'Activo'
     and public.falta_firma_huella(ct.cliente_id) is null
   order by ct.id
   limit 1;

  if v_ct_sin is null or v_ct_con is null then
    raise exception 'La prueba no encontró un cliente al que le falte algo y otro con las tres. No se guardó nada.';
  end if;

  select ct.id, ct.cliente_id into v_ct_foto, v_cli_foto
    from public.contratos ct
   where ct.estado in ('Activo', 'Suspendido')
     and public.falta_firma_huella(ct.cliente_id) = 'la foto'
   order by ct.id
   limit 1;

  -- Los pagos de prueba los «registra» la secretaria.
  perform set_config('request.jwt.claim.sub', v_sec::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);

  -- Caso 1: efectivo en la oficina, cliente al que le falta algo: lo frena.
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values (v_ct_sin, 1, 'Efectivo', 'PRUEBA-215', 'normal', v_hoy, v_hoy);
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when sqlstate 'MG215' then v_res := 'frenado';
    when check_violation  then v_res := 'paso';
    when sqlstate 'ZZ215' then v_res := 'paso';
  end;
  if v_res <> 'frenado' then
    raise exception 'La prueba falló: no frenó el efectivo en la oficina de un cliente al que le falta algo. No se guardó nada.';
  end if;

  -- Caso 1b: tiene la firma y la huella pero no la foto: también lo frena.
  if v_ct_foto is not null then
    begin
      insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
      values (v_ct_foto, 1, 'Efectivo', 'PRUEBA-215', 'normal', v_hoy, v_hoy);
      raise exception using errcode = 'ZZ215', message = 'deshacer';
    exception
      when sqlstate 'MG215' then v_res := 'frenado';
      when check_violation  then v_res := 'paso';
      when sqlstate 'ZZ215' then v_res := 'paso';
    end;
    if v_res <> 'frenado' then
      raise exception 'La prueba falló: no frenó el efectivo de un cliente sin foto. No se guardó nada.';
    end if;
  end if;

  -- Caso 2: alquiler de la moto prestada en efectivo, mismo cliente: lo frena.
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values (v_ct_sin, 1, 'Efectivo', 'PRUEBA-215', 'alquiler_reemplazo', v_hoy, v_hoy);
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when sqlstate 'MG215' then v_res := 'frenado';
    when check_violation  then v_res := 'paso';
    when sqlstate 'ZZ215' then v_res := 'paso';
  end;
  if v_res <> 'frenado' then
    raise exception 'La prueba falló: no frenó el alquiler en efectivo de un cliente al que le falta algo. No se guardó nada.';
  end if;

  -- Caso 3: cobro en campo del mismo cliente: pasa.
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values (v_ct_sin, 1, 'Efectivo', 'PRUEBA-215', 'campo', v_hoy, v_hoy);
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when sqlstate 'MG215' then v_res := 'frenado';
    when check_violation  then v_res := 'paso';
    when sqlstate 'ZZ215' then v_res := 'paso';
  end;
  if v_res <> 'paso' then
    raise exception 'La prueba falló: frenó un cobro en campo. No se guardó nada.';
  end if;

  -- Caso 4: transferencia del mismo cliente: pasa.
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values (v_ct_sin, 1, 'Transferencia', 'PRUEBA-215', 'transferencia', v_hoy, v_hoy);
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when sqlstate 'MG215' then v_res := 'frenado';
    when check_violation  then v_res := 'paso';
    when sqlstate 'ZZ215' then v_res := 'paso';
  end;
  if v_res <> 'paso' then
    raise exception 'La prueba falló: frenó una transferencia. No se guardó nada.';
  end if;

  -- Caso 5: efectivo en la oficina de un cliente con las tres: pasa.
  begin
    insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
    values (v_ct_con, 1, 'Efectivo', 'PRUEBA-215', 'normal', v_hoy, v_hoy);
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when sqlstate 'MG215' then v_res := 'frenado';
    when check_violation  then v_res := 'paso';
    when sqlstate 'ZZ215' then v_res := 'paso';
  end;
  if v_res <> 'paso' then
    raise exception 'La prueba falló: frenó a un cliente que tiene firma, huella y foto. No se guardó nada.';
  end if;

  -- Caso 6: con la autorización del dueño de hoy, el cliente al que le falta algo pasa.
  -- La autorización la escribe el dueño con su permiso real, pide la fecha de dentro de una semana
  -- (debe quedar la de hoy) y al final se deshace.
  v_res := null;
  begin
    perform set_config('request.jwt.claim.sub', v_ap::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
    set local role authenticated;
    insert into public.efectivo_sin_huella_autorizado (cliente_id, motivo, fecha)
    values (v_cli_sin, 'Prueba de la migración 215', v_hoy + 7)
    returning fecha, autorizado_por into v_fecha, v_por;
    reset role;

    perform set_config('request.jwt.claim.sub', v_sec::text, true);
    perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);
    begin
      insert into public.pagos (contrato_id, valor, metodo, estado, tipo_registro, fecha, fecha_registro)
      values (v_ct_sin, 1, 'Efectivo', 'PRUEBA-215', 'normal', v_hoy, v_hoy);
      raise exception using errcode = 'ZZ215', message = 'deshacer';
    exception
      when sqlstate 'MG215' then v_res := 'frenado';
      when check_violation  then v_res := 'paso';
      when sqlstate 'ZZ215' then v_res := 'paso';
    end;

    raise exception using errcode = 'ZZ216', message = 'deshacer la autorización de prueba';
  exception
    when sqlstate 'ZZ216' then null;
  end;
  reset role;
  if v_fecha is distinct from v_hoy then
    raise exception 'La prueba falló: la autorización quedó con fecha % y no con la de hoy. No se guardó nada.', v_fecha;
  end if;
  if v_por is distinct from v_ap then
    raise exception 'La prueba falló: la autorización no quedó a nombre del dueño. No se guardó nada.';
  end if;
  if v_res is distinct from 'paso' then
    raise exception 'La prueba falló: con la autorización del dueño de hoy, el pago no pasó. No se guardó nada.';
  end if;

  -- Caso 7: la secretaria no puede escribir una autorización.
  perform set_config('request.jwt.claim.sub', v_sec::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_sec, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    insert into public.efectivo_sin_huella_autorizado (cliente_id, motivo)
    values (v_cli_sin, 'Prueba de la migración 215');
    raise exception using errcode = 'ZZ215', message = 'deshacer';
  exception
    when insufficient_privilege then v_pudo := false;
    when sqlstate 'ZZ215'      then v_pudo := true;
  end;
  reset role;
  if v_pudo then
    raise exception 'La prueba falló: la secretaria pudo escribir una autorización. No se guardó nada.';
  end if;

  -- Caso 8: ni el dueño puede editar o borrar una autorización (es el rastro).
  perform set_config('request.jwt.claim.sub', v_ap::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', v_ap, 'role', 'authenticated')::text, true);
  begin
    set local role authenticated;
    update public.efectivo_sin_huella_autorizado set motivo = motivo where false;
    v_pudo := true;
  exception when insufficient_privilege then
    v_pudo := false;
  end;
  reset role;
  if v_pudo then
    raise exception 'La prueba falló: se pudo editar una autorización. No se guardó nada.';
  end if;
  begin
    set local role authenticated;
    delete from public.efectivo_sin_huella_autorizado where false;
    v_pudo := true;
  exception when insufficient_privilege then
    v_pudo := false;
  end;
  reset role;
  if v_pudo then
    raise exception 'La prueba falló: se pudo borrar una autorización. No se guardó nada.';
  end if;

  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}', true);
end
$prueba$;

select public.registrar_migracion(215, '215_efectivo_oficina_exige_firma_y_huella.sql',
  'El efectivo de la oficina exige la firma, la huella y la foto del cliente, o la autorización del dueño de ese día (D-065)');

commit;

-- Debe dar: candado 1 · tabla 1 · reglas 2 · autorizaciones 0 · clientes_que_frena alrededor de 118
-- (medido el 10-nov; baja a medida que se les toma lo que falta)
select
  (select count(*) from pg_trigger
    where tgrelid = 'public.pagos'::regclass and tgname = 'trg_enforce_registro_firma_huella') as candado,
  (select count(*) from pg_tables
    where schemaname = 'public' and tablename = 'efectivo_sin_huella_autorizado')            as tabla,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'efectivo_sin_huella_autorizado')            as reglas,
  (select count(*) from public.efectivo_sin_huella_autorizado)                               as autorizaciones,
  (select count(distinct ct.cliente_id) from public.contratos ct
    where ct.estado in ('Activo', 'Suspendido')
      and public.falta_firma_huella(ct.cliente_id) is not null)                              as clientes_que_frena;
