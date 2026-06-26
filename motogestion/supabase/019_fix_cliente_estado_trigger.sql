-- Fix enforce_cliente_estado_change: usar mi_rol() en vez de current_role()
-- current_role() devuelve el rol de Postgres ("authenticated"), no el rol de la app.
-- mi_rol() lee la tabla profiles y devuelve el rol real (ADMIN, ADMIN_PRINCIPAL, etc.)

create or replace function public.enforce_cliente_estado_change()
returns trigger language plpgsql security definer as $$
declare
  estados_libres text[] := array['En proceso', 'Listo para visita', 'Pendiente evaluación'];
  rol_actual text;
begin
  rol_actual := public.mi_rol();

  if new.estado is distinct from old.estado
     and not (new.estado = any(estados_libres))
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede cambiar el cliente a este estado';
  end if;

  if (new.excepcion_documental is distinct from old.excepcion_documental
      or new.excepcion_motivo is distinct from old.excepcion_motivo
      or new.excepcion_plazo is distinct from old.excepcion_plazo)
     and rol_actual not in ('ADMIN', 'ADMIN_PRINCIPAL') then
    raise exception 'Solo un ADMIN puede aplicar excepciones documentales';
  end if;

  return new;
end;
$$;
