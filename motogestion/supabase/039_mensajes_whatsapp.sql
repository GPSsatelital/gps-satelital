-- ===== 039: Mensajes de WhatsApp editables desde Configuración =====
-- Tabla clave→texto con las plantillas de los mensajes que se envían por WhatsApp.
-- Comodines que la app reemplaza al enviar: {nombre} {placa} {dias} {valor}
-- (y {folio} {fecha} {detalle} solo en el recibo).
-- Lectura: cualquier autenticado (los envía cualquier funcionario de cobro).
-- Escritura: solo ADMIN y ADMIN_PRINCIPAL.

create table if not exists public.mensajes_whatsapp (
  clave text primary key,
  texto text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.mensajes_whatsapp enable row level security;

drop policy if exists "Mensajes wa: lectura autenticados" on public.mensajes_whatsapp;
create policy "Mensajes wa: lectura autenticados"
  on public.mensajes_whatsapp for select to authenticated
  using (true);

drop policy if exists "Mensajes wa: escritura admins" on public.mensajes_whatsapp;
create policy "Mensajes wa: escritura admins"
  on public.mensajes_whatsapp for all to authenticated
  using (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'))
  with check (public.mi_rol() in ('ADMIN','ADMIN_PRINCIPAL'));

-- Semilla con los textos por defecto (si ya existen, no los pisa)
insert into public.mensajes_whatsapp (clave, texto) values
  ('dia_pago',    'Hola {nombre}, le recordamos su pago de hoy en GPS Satelital. Cualquier duda estamos atentos. ¡Gracias! 🏍️'),
  ('gabela',      'Hola {nombre}, su pago venció y está en día de gracia. Por favor póngase al día hoy para evitar la mora. GPS Satelital 🏍️'),
  ('mora',        'Hola {nombre}, lleva {dias} días de mora. Por favor comuníquese urgente con nosotros para regularizar su pago. GPS Satelital ⚠️'),
  ('recoleccion', 'Hola {nombre}, su moto de placa {placa} presenta {dias} días de mora. Le informamos que se procederá con la RECOLECCIÓN del vehículo. Para evitarlo, comuníquese HOY y realice su pago. GPS Satelital ⚠️'),
  ('recibo',      '🧾 *GPS SATELITAL — Comprobante de pago*{detalle}')
on conflict (clave) do nothing;
