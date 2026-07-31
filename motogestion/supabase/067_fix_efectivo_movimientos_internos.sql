-- ===== 067: el candado de EFECTIVO ya no bloquea los MOVIMIENTOS INTERNOS =====
-- Bug real reportado con captura (25-jul): un usuario en Cartera tocó "Aplicar" el saldo a
-- favor de un cliente y le salió el alert "No tienes permiso para registrar pagos en efectivo".
-- Mensaje equivocado (no estaba registrando efectivo) y bloqueo indebido.
--
-- CAUSA RAÍZ: el trigger de la mig 066 (enforce_registrar_efectivo) exige
-- puede_accion('registrar_efectivo') a TODO insert en pagos con metodo='Efectivo' y
-- estado='Confirmado'. Pero hay movimientos que nacen así y NO son plata nueva que entra:
--   · tipo_registro='saldo_favor'   → consume un saldo que el cliente YA tenía a favor.
--     La pantalla lo gatea con la acción `aplicar_saldo_favor` (otra distinta) → desajuste:
--     el frontend deja tocar el botón y la BD lo rechaza con un mensaje que no corresponde.
--   · tipo_registro='adelanto_base' → la semana adelantada que el wizard registra contra la
--     base ya recibida al crear el contrato. La pantalla la gatea con `crear_contrato`.
-- El propio código ya sabe que estos dos NO son caja: usePagos.esPagoDeCaja() los excluye
-- del recaudo y del cierre diario. La BD era la única que no lo sabía.
--
-- ARREGLO: en vez de eximirlos (lo que abriría un hueco: se podría marcar un contrato como
-- pagado sin plata), cada movimiento exige EL PERMISO QUE LE CORRESPONDE — el mismo que pide
-- la pantalla. Así se conserva la protección y se elimina el desajuste.
--   saldo_favor        → aplicar_saldo_favor
--   adelanto_base      → crear_contrato
--   alquiler_reemplazo → registrar_efectivo (SÍ es plata real que entra: no cambia)
--   normal / campo     → registrar_efectivo (no cambia)
--
-- Mensajes de error específicos, para que nunca más se culpe al permiso equivocado.

create or replace function public.enforce_registrar_efectivo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;

  -- Movimiento interno: consumir el saldo a favor que el cliente ya tenía.
  if new.tipo_registro = 'saldo_favor' then
    if not public.puede_accion('aplicar_saldo_favor') then
      raise exception 'No tienes permiso para aplicar el saldo a favor';
    end if;
    return new;
  end if;

  -- Movimiento interno: semana adelantada pagada con la base, al crear el contrato.
  if new.tipo_registro = 'adelanto_base' then
    if not public.puede_accion('crear_contrato') then
      raise exception 'No tienes permiso para crear contratos (semana adelantada)';
    end if;
    return new;
  end if;

  -- Resto (normal, campo, transferencia, alquiler_reemplazo): plata real que entra.
  if new.metodo = 'Efectivo' and new.estado = 'Confirmado'
     and not public.puede_accion('registrar_efectivo') then
    raise exception 'No tienes permiso para registrar pagos en efectivo';
  end if;
  return new;
end; $$;

-- El trigger de la mig 066 sigue igual (before insert on pagos); solo cambió la función.

-- Verificación sugerida tras correrla:
--   select tgname from pg_trigger where tgrelid = 'public.pagos'::regclass;
--   -- debe seguir apareciendo trg_enforce_registrar_efectivo
