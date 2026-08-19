-- Migración 101: borrar una DEUDA deja rastro (antes no dejaba ninguno)
--
-- El caso que lo destapó: DPU51I (NESTOR ANTONIO MOLINA). El dueño recordaba una deuda que ya no
-- aparecía. Se descartó con evidencia que la hubiera pagado (0 pagos registrados), que hubiera
-- entrado a un convenio (0 convenios) y que la hubieran editado a $0 (editar SÍ deja rastro, y el
-- historial del contrato estaba vacío). Quedaba una sola posibilidad dentro del sistema —que la
-- borraran— y resultó imposible de confirmar: `eliminarDeuda` era un DELETE pelado. Ni quién, ni
-- cuándo, ni de cuánto era.
--
-- La asimetría era el problema: EDITAR una deuda guardaba hasta 4 renglones de auditoría; BORRARLA
-- no guardaba nada. Quien quisiera dejar rastro lo dejaba, y quien no quisiera solo tenía que usar
-- el botón de al lado. Sobre datos así no se puede auditar cartera.
--
-- Por qué en la BD y no en el frontend: el rastro tiene que existir venga el borrado de donde
-- venga — la pantalla, la consola del navegador con la sesión abierta, o el SQL Editor. Un
-- registro que el propio borrador puede saltarse no sirve como control de plata. Mismo criterio de
-- dos capas de la migración 026.
--
-- Los convenios NO se tocan: ese camino YA deja rastro (FichaClienteView lo escribe antes de
-- borrar, incluyendo cuánto había abonado el cliente). No se reemplaza lo que funciona.
--
-- FALLA CERRADA a propósito: si no se puede escribir la auditoría, el borrado NO ocurre. Es
-- preferible que alguien no pueda borrar una deuda mal puesta (se corrige editándola a $0, que
-- también queda registrado) a que una deuda desaparezca en silencio.
--
-- No cambia ninguna cuenta ni ningún saldo: solo escribe una fila de historial antes de borrar.
-- El renglón aparece en "Editar contrato → Historial de cambios", que ya lee esta misma tabla.

create or replace function public.auditar_deuda_borrada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() queda en null si el borrado NO vino de la app (SQL Editor, llave de servicio).
  -- Se deja así a propósito: "sin autor" también es información — dice que no pasó por la pantalla.
  insert into public.contratos_auditoria (contrato_id, campo, valor_anterior, valor_nuevo, editado_por)
  values (
    old.contrato_id,
    'Deuda ELIMINADA',
    old.concepto
      || ' — ' || coalesce(nullif(btrim(old.descripcion), ''), '(sin descripción)')
      || ' · pendiente $' || replace(to_char(old.monto_pendiente, 'FM999,999,999,999'), ',', '.')
      || ' de $'          || replace(to_char(old.monto,           'FM999,999,999,999'), ',', '.')
      || ' · estaba ' || old.estado
      || ' · creada el ' || to_char(old.created_at at time zone 'America/Bogota', 'DD/MM/YYYY'),
    '(eliminada)',
    auth.uid()
  );
  return old;
end;
$$;

drop trigger if exists trg_auditar_deuda_borrada on public.deudas;
create trigger trg_auditar_deuda_borrada
  before delete on public.deudas
  for each row execute function public.auditar_deuda_borrada();
