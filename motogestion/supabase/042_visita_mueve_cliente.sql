-- 042: al registrar una visita, el cliente pasa a "Pendiente evaluación" de forma ATÓMICA
-- ────────────────────────────────────────────────────────────────────────────────────
-- Antes esto lo hacía SOLO el frontend (ModalVisita), como un segundo paso separado
-- (`actualizarCliente(... "Pendiente evaluación")`) y SIN revisar el error. Ese paso corría
-- con la sesión de quien registraba: si un SUBADMIN registraba una visita que NO estaba
-- asignada a él (su uid no coincide con clientes.visita_asignada_a ni con visitas.asignada_a),
-- la política RLS de UPDATE de `clientes` lo rechazaba → la visita quedaba guardada pero el
-- cliente atascado en "Listo para visita", sin ningún aviso.
-- Casos reales (6-jul-2026): JONATAN PINEDA y JOSE ANGEL SANCHEZ.
--
-- Este trigger hace el cambio en la MISMA operación del insert (no se puede quedar a medias)
-- y con permisos del sistema (security definer → salta la RLS), así que el cliente siempre
-- avanza sin importar quién registre la visita ni a quién esté asignada.
-- Solo mueve si venía de "Listo para visita" (no pisa otros estados).

create or replace function public.visita_mueve_cliente()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clientes
  set estado = 'Pendiente evaluación'
  where id = new.cliente_id
    and estado = 'Listo para visita';
  return new;
end;
$$;

drop trigger if exists trg_visita_mueve_cliente on public.visitas;
create trigger trg_visita_mueve_cliente
  after insert on public.visitas
  for each row execute function public.visita_mueve_cliente();
