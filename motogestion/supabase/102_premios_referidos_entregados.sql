-- Migración 102: registro de la ENTREGA de un premio del programa de referidos
--
-- Antes la única marca de "premio entregado" era la columna `clientes.premio_referidos_entregado`
-- (un número suelto dentro de la ficha). Eso tenía dos límites que este registro resuelve:
--   1. Si quien refirió NO es cliente, no hay ficha donde escribir la marca — y por tanto no había
--      forma de entregarle el premio. Caso real: JOHAN ROJAS refirió a MARLON y a JORGE LUIS, ganó
--      los guantes, y no existía botón para entregárselos. Acá la llave es la CÉDULA, no el id del
--      cliente, así que funciona igual para clientes y para quien no lo es.
--   2. Un número suelto no aguanta la foto, el monto, la fecha ni quién entregó.
--
-- REGLA DEL DUEÑO (19-ago) sobre quién paga: el premio lo pagan los PORTAFOLIOS de los referidos
-- que lo generaron, repartido según cuántas motos puso cada uno.
--   · En DINERO: se dice cuánto se paga por cada referido → cada portafolio paga los suyos.
--   · En PREMIO FÍSICO: se dice cuánto costó el artículo → se divide entre los referidos.
-- El reparto ya calculado se guarda en `reparto` con esta forma exacta:
--   [{ "grupo": "PRADERA", "referidos": ["MARLON DAVID MUÑOZ"], "monto": 30000 }, ...]
--
-- ⚠️ POR QUÉ EL REPARTO SE GUARDA Y NO SE RECALCULA: la moto de un referido puede cambiar de
-- portafolio después. Si el reparto se recalculara, el recibo que ya se le envió al socio dejaría
-- de coincidir con lo que muestra el sistema. Se sella el día de la entrega, como los pagos.
--
-- 🔗 ENLACE CON EGRESOS (aún sin construir, diseño cerrado 1-ago): cada renglón de `reparto` es
-- exactamente una fila de la futura tabla `egresos` (grupo + monto + comprobante). Cuando ese
-- módulo exista, se migran de una y la caja empieza a descontarlos. Se guarda con esa forma A
-- PROPÓSITO para que no haya que rediseñar ni volver a digitar nada.
-- Mientras tanto la caja del día NO descuenta este dinero — igual que hoy no descuenta ningún
-- gasto (taller, devoluciones de liquidación): no es un hueco nuevo, es el mismo que tapa Egresos.

create table if not exists public.premios_referidos (
  id uuid primary key default gen_random_uuid(),
  -- La cédula tal como quedó escrita en "referido por". Es la llave: sirve sea cliente o no.
  cedula_referidor text not null,
  nombre_referidor text not null,
  hito int not null check (hito in (2, 5, 10, 17)),
  premio text not null,
  forma text not null check (forma in ('fisico', 'dinero')),
  -- Lo que le costó a la empresa en total (el artículo, o la plata entregada).
  costo_total numeric not null default 0 check (costo_total >= 0),
  -- Solo en 'dinero': lo pactado por cada referido. En 'fisico' queda null.
  monto_por_referido numeric,
  reparto jsonb not null default '[]'::jsonb,
  -- Obligatoria: es la constancia de que el premio se entregó de verdad.
  foto_url text not null,
  nota text,
  entregado_por uuid references public.profiles(id),
  fecha date not null default (now() at time zone 'America/Bogota')::date,
  created_at timestamptz not null default now()
);

-- Un mismo hito no se entrega dos veces a la misma persona.
create unique index if not exists idx_premio_referidor_hito
  on public.premios_referidos (cedula_referidor, hito);

create index if not exists idx_premio_fecha on public.premios_referidos (fecha desc);

alter table public.premios_referidos enable row level security;

-- Lectura: todo el staff que ve el módulo de referidos.
create policy "premios_referidos_lectura" on public.premios_referidos
  for select to authenticated
  using (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL', 'SECRETARIA', 'ANALISTA'));

-- Entregar un premio es sacar plata de la empresa: solo ADMIN y ADMIN_PRINCIPAL.
create policy "premios_referidos_insert" on public.premios_referidos
  for insert to authenticated
  with check (public.mi_rol() in ('ADMIN', 'ADMIN_PRINCIPAL'));

-- Corregir una entrega mal registrada queda para el admin principal, igual que eliminar un pago.
create policy "premios_referidos_update" on public.premios_referidos
  for update to authenticated
  using (public.mi_rol() = 'ADMIN_PRINCIPAL')
  with check (public.mi_rol() = 'ADMIN_PRINCIPAL');

alter publication supabase_realtime add table public.premios_referidos;
