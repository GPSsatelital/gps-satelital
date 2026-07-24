-- ===== 060: validación de dónde se guarda la moto (post-entrega) =====
-- Tras entregar la moto, el ADMIN valida en el GPS (plataforma externa) que la moto se
-- guarda donde el cliente declaró en la visita. La app arma la tarea (alerta persistente)
-- y el admin marca el resultado. La app NO tiene el GPS del vehículo (eso es backlog), por
-- eso la validación es manual/asistida.
alter table public.contratos
  add column if not exists ubicacion_moto_validada boolean not null default false,
  add column if not exists ubicacion_moto_validada_por uuid references public.profiles(id),
  add column if not exists ubicacion_moto_validada_fecha timestamptz,
  add column if not exists ubicacion_moto_resultado text
    check (ubicacion_moto_resultado in ('coincide','no_coincide')),
  -- Registro del lugar donde SÍ se guarda la moto, con su propio GPS (Fase 3). Se llena yendo
  -- físicamente al sitio (cuando el cliente declara que no la guarda en casa, o cuando el admin
  -- ve que no coincide). jsonb: { lat, lng, direccion, condiciones, foto_url, fecha, por }.
  -- NO se usa la tabla `visitas` a propósito: su trigger 042 movería al cliente de estado.
  add column if not exists guardado_lugar jsonb;

-- Backfill: los contratos que YA existen no se validan retroactivamente (llevan tiempo
-- rodando y no pasaron por este flujo) → se marcan como validados para NO inundar de alertas.
-- Solo las entregas NUEVAS (contratos creados de aquí en adelante) nacen con validada=false
-- y piden la validación después de la entrega.
update public.contratos set ubicacion_moto_validada = true where ubicacion_moto_validada = false;
