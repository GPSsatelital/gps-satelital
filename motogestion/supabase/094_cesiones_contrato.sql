-- ===== 094: CESIÓN DE CONTRATO (cambio de titular) =====
--
-- EL CASO QUE LO DISPARÓ (dueño, 11-ago-2026): un cliente ya no puede seguir y le entrega a otra
-- persona su contrato completo — los ahorros, las semanas ya pagadas y también lo que debe. Firman
-- un acta ante el arrendador y el nuevo sigue pagando como suyo. La moto suele estar guardada por
-- falta de pago, y la cesión es justamente lo que permite que salga a nombre del nuevo.
--
-- POR QUÉ NO SE RECREA EL CONTRATO: legalmente esto es una CESIÓN DE POSICIÓN CONTRACTUAL, no una
-- novación — el contrato sigue vivo con las mismas tarifas y el mismo plazo (así lo dice el acta, y
-- la cláusula SEGUNDA del contrato original ya lo contempla: "no podrá ceder... sin la autorización
-- escrita del ARRENDADOR"). Liquidar y crear otro obligaría a re-teclear a mano el ahorro, las
-- cajas pagadas, la deuda y el convenio: cada cifra, una oportunidad de perderle plata al cliente.
--
-- Por eso la cesión cambia UNA sola cosa: `contratos.cliente_id`. Todo el motor de cajas vive en
-- columnas de `contratos`, y pagos/deudas/convenios/gestiones cuelgan solo de `contrato_id` — se
-- mueven solos con el contrato, sin tocar un peso.
--
-- POR QUÉ ESTA TABLA GUARDA UN RETRATO CONGELADO: el acta que firman los tres dice cifras exactas.
-- Sin este retrato, dentro de dos años nadie podría comparar el papel contra el sistema, porque
-- `cajas_pagadas` y la deuda siguen moviéndose después.
--
-- `cedente_id` ES EL DATO IRRECUPERABLE: apenas se hace el cambio, `contratos.cliente_id` ya no
-- dice quién era el titular anterior. Esta fila es la ÚNICA fuente de esa verdad, y de ella se
-- reconstruye toda la cadena de titularidad (A→B→C, o incluso A→B→A).

create table if not exists public.cesiones_contrato (
  id uuid primary key default gen_random_uuid(),

  -- SIN `on delete`: una cesión es un hecho legal y no puede desaparecer porque alguien borró algo.
  -- El NO ACTION por defecto actúa de red (`eliminarContratoEnProceso` solo borra "En proceso",
  -- y un contrato cedido nunca está en ese estado).
  contrato_id   uuid not null references public.contratos(id),
  cedente_id    uuid not null references public.clientes(id),   -- quien ENTREGA
  cesionario_id uuid not null references public.clientes(id),   -- quien RECIBE

  -- `date`, no `timestamptz`: es el BORDE que parte la historia entre los dos titulares, y esa
  -- comparación se hace como texto 'YYYY-MM-DD'. Un timestamptz obligaría a convertir a hora de
  -- Colombia en cada lectura, con el riesgo de corrimiento que ya documenta `lineaTiempo.ts`.
  fecha date not null default current_date,

  -- ── Retrato del estado de cuenta al momento de ceder (lo que dice el acta) ──
  ahorro_acumulado numeric not null default 0,
  ahorro_apertura  numeric not null default 0,   -- separado: un migrado los tiene distintos
  saldo_favor      numeric not null default 0,
  deuda_total      numeric not null default 0,
  deuda_detalle    jsonb,                         -- desglose por concepto (molde de liquidaciones)
  convenio_saldo   numeric,
  convenio_cuota   numeric,
  convenio_cuotas_restantes int,
  cajas_pagadas      int,
  total_cajas        int,
  caja_actual_pagado numeric,

  -- Condiciones congeladas: son la prueba de que NO hubo novación (no cambiaron con la cesión).
  valor_periodo  numeric,
  forma_pago     text,
  dia_pago_label text,

  -- Placa, no id: para que la fila se lea sin consultar la base. Mismo criterio que la auditoría
  -- de préstamos de reemplazo.
  moto_placa text,

  -- ── Evidencia ──
  firma_cedente_url      text,
  huella_cedente_url     text,
  firma_cesionario_url   text,
  huella_cesionario_url  text,
  huella_acompanante_url text,
  documento_firmado_url  text,   -- el acta escaneada (obligatoria; se valida en la app)
  pagare_url             text,   -- el cesionario firma pagaré nuevo (cláusula DÉCIMA SEGUNDA)
  certificado_url        text,

  motivo text,
  registrado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),

  constraint ck_cesion_partes_distintas check (cedente_id <> cesionario_id)
);

-- Candado contra el doble clic y contra dos pestañas abiertas. La app también tiene su guarda,
-- pero la única garantía real es la base (lección de los convenios duplicados, mig 050).
create unique index if not exists uq_cesion_contrato_fecha
  on public.cesiones_contrato (contrato_id, fecha);

create index if not exists idx_cesiones_contrato    on public.cesiones_contrato(contrato_id);
create index if not exists idx_cesiones_cedente     on public.cesiones_contrato(cedente_id);
create index if not exists idx_cesiones_cesionario  on public.cesiones_contrato(cesionario_id);

alter table public.cesiones_contrato enable row level security;

-- 🔴 LA LECTURA DEBE SER TAN AMPLIA COMO LA DE `pagos` (espejo exacto de la mig 026).
-- Si fuera más estrecha, un SUBADMIN vería los pagos de un contrato pero NO la cesión que los
-- acota — y su pantalla le atribuiría al cliente nuevo los pagos del anterior. No sería "menos
-- información": sería información equivocada.
create policy "Cesiones: lectura por rol"
  on public.cesiones_contrato for select to authenticated
  using (
    public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA')
    or (public.mi_rol() = 'SUBADMIN' and contrato_id in (select public.mis_contratos_subadmin()))
    or (public.mi_rol() = 'SOCIO' and contrato_id in (select public.mis_contratos_socio()))
  );

create policy "Cesiones: registro por permiso de accion"
  on public.cesiones_contrato for insert to authenticated
  with check (public.puede_accion('ceder_contrato'));

-- Solo para adjuntar un escaneo que llegó tarde o corregir el motivo. Los montos no se editan:
-- son el retrato de lo que se firmó.
create policy "Cesiones: correccion admin"
  on public.cesiones_contrato for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

-- Sin política de DELETE a propósito: una cesión no se borra desde la app.

alter publication supabase_realtime add table public.cesiones_contrato;


-- ===== El que RECIBE no paga base inicial: la hereda =====
--
-- Lo detectó el dueño al preguntar cómo registrarlo: `ClientesView` exige un ingreso inicial mínimo
-- para guardar un cliente. Pero el cesionario no entrega plata — el ahorro que recibe vive en
-- `contratos.ahorro_acumulado`, pegado al contrato, no a su persona.
--
-- Sin esta marca el funcionario terminaría tecleando un monto inventado, y eso causa TRES defectos
-- de plata a la vez: entra a la caja del día (la gaveta no cuadra esa noche), se imprime un recibo
-- por plata que nadie recibió, y esa base fantasma queda RECLAMABLE — el sistema le devolvería
-- mañana una plata que nunca entregó.
--
-- La marca de "pendiente" NO se guarda: se DERIVA (marcado + todavía sin fila en
-- cesiones_contrato). Así desaparece sola cuando la cesión ocurre, sin que nadie tenga que
-- acordarse de apagarla — las banderas que dependen de que alguien las limpie siempre quedan sucias.
alter table public.clientes
  add column if not exists ingreso_por_cesion boolean not null default false;

comment on column public.clientes.ingreso_por_cesion is
  'Ingresó para recibir un contrato por cesión, no pagó base inicial. Mientras no exista su fila en cesiones_contrato, queda pendiente y sale en alertas.';


-- ===== Permiso de la acción =====
--
-- Solo ADMIN (ADMIN_PRINCIPAL entra por el bypass de puede_accion). Fuera SECRETARIA y SUBADMIN a
-- propósito: la cesión termina cambiando dos `clientes.estado`, y el trigger `enforce_cliente_estado_change`
-- (mig 019) solo se lo permite a ADMIN para arriba. Dárselo a otro rol produciría cesiones a medias:
-- contrato ya cambiado, estados fallando.
--
-- ⚠️ Este mapa YA venía desincronizado de `DEFAULT_ACCIONES` en src/lib/acciones.ts (allá existen
-- además 'exportar_datos' y 'devolver_base'). NO se corrige acá a propósito — hoy es inofensivo
-- porque esas dos no se consultan desde SQL, y arreglarlo de paso sería tocar lo que ya funciona.
-- Se reproduce el mapa tal como está y solo se agrega 'ceder_contrato'.
create or replace function public._acciones_default(p_role text)
returns text[] language sql immutable as $$
  select case p_role
    when 'ADMIN_PRINCIPAL' then array[
      'registrar_efectivo','confirmar_transferencia','eliminar_pago','cerrar_caja','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion',
      'ceder_contrato']
    when 'ADMIN' then array[
      'registrar_efectivo','aplicar_saldo_favor',
      'crear_contrato','editar_contrato','editar_deuda','crear_convenio',
      'recolectar_moto','cambiar_grupo_moto','iniciar_liquidacion','aprobar_visita','lista_negra','editar_configuracion',
      'ceder_contrato']
    when 'SECRETARIA' then array[
      'registrar_efectivo','confirmar_transferencia','cerrar_caja','aplicar_saldo_favor','crear_convenio']
    when 'SUBADMIN' then array['recolectar_moto','iniciar_liquidacion']
    else array[]::text[]
  end;
$$;

-- Sin esto, quien tenga 'ceder_contrato' pero no 'editar_contrato' haría el cambio de titular y la
-- fila de auditoría se rechazaría EN SILENCIO: la cesión quedaría hecha y sin rastro. Las políticas
-- de las migs 027 y 058 no cubren este caso.
create policy "Auditoria contratos: insert por cesion"
  on public.contratos_auditoria for insert to authenticated
  with check (public.puede_accion('ceder_contrato'));
