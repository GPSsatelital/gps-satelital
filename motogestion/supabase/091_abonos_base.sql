-- ===== 091: movimientos de la BASE INICIAL (entradas y devoluciones) =====
--
-- EL CASO QUE LO DISPARÓ (dueño, 6-ago-2026): "un cliente no va a seguir con el proceso y quiere
-- la devolución del dinero, pero eso no está contemplado ahorita". Verificado: NO existía ningún
-- flujo de devolución de plata en todo el sistema. Y la liquidación no sirve — exige un contrato,
-- y este cliente nunca llegó a tener moto.
--
-- POR QUÉ UNA TABLA PROPIA Y NO `pagos`: `pagos.contrato_id` es NOT NULL (mig 003) y la base se
-- entrega ANTES de que exista contrato. Aflojar esa columna obligaría a revisar el motor de
-- reparto, sus triggers y las ~10 pantallas que asumen que todo pago tiene contrato. Una tabla
-- aparte no toca nada de lo que ya funciona.
--
-- ENTRADAS Y SALIDAS EN LA MISMA TABLA (`tipo`): un abono suma, una devolución resta. Si la
-- devolución viviera aparte, la caja podría contar la entrada y no la salida — y quedaría inflada
-- para siempre cada vez que alguien se retira.
--
-- REGLA DEL DUEÑO: se devuelve TODO, sin descontar nada (ni visita, ni papeleo).
--
-- LA PRUEBA DE QUE SE DEVOLVIÓ (pedido explícito): `firma_url` guarda la firma que el cliente
-- traza en pantalla al recibir su plata, y `huella_url` su huella si el lector está disponible.
-- El recibo impreso se lo lleva él; la firma queda acá. El papel térmico se borra con los años,
-- el registro no.
--
-- `grupo` nace NULL a propósito: cuando el cliente entrega su base todavía no se sabe de qué
-- portafolio será su moto. Se llena cuando se le asigna (fase 2 del plan). Mismo criterio que
-- una partida de dinero sin dueño: antes que adivinar el portafolio, decir "no se sabe".

create table if not exists public.abonos_base (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  contrato_id uuid references public.contratos(id),      -- null hasta que exista contrato
  tipo text not null check (tipo in ('abono','devolucion')),
  monto numeric not null check (monto > 0),              -- SIEMPRE positivo; el signo lo da `tipo`
  metodo text not null default 'Efectivo' check (metodo in ('Efectivo','Transferencia')),
  cuenta_id uuid references public.cuentas_bancarias(id), -- solo si fue transferencia (mig 087)
  grupo text check (grupo in ('COSTA','PRADERA','RASTREADOR','USADAS','OTRO')),
  fecha date not null,                                    -- cuándo entregó/recibió la plata
  fecha_registro date not null,                           -- cuándo se digitó (manda para la caja)
  registrado_por uuid references public.profiles(id),
  firma_url text,                                         -- prueba: la firma del cliente
  huella_url text,
  nota text,
  created_at timestamptz not null default now()
);

create index if not exists idx_abonos_base_cliente on public.abonos_base(cliente_id);
create index if not exists idx_abonos_base_fecha   on public.abonos_base(fecha_registro);

alter table public.abonos_base enable row level security;

-- Lectura: el staff que gestiona el embudo de ingreso y el dinero.
-- El SUBADMIN queda fuera a propósito: no registra clientes ni maneja el efectivo de la base
-- (regla de negocio en CLAUDE.md), así que tampoco tiene por qué ver esos movimientos.
create policy "staff lee abonos base" on public.abonos_base
  for select to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

create policy "staff registra abonos base" on public.abonos_base
  for insert to authenticated
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL','SECRETARIA'));

-- Corregir un movimiento mal digitado es de ADMIN para arriba: es plata.
create policy "admin corrige abonos base" on public.abonos_base
  for update to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

create policy "admin borra abonos base" on public.abonos_base
  for delete to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

alter publication supabase_realtime add table public.abonos_base;
