-- ===== 113: RE-VISITAS — pedir una visita a un cliente que YA tiene contrato =====
--
-- EL CASO REAL (22-ago, JOSUE/RML59H): se liquida su moto y se le entrega otra HOY, pero la
-- visita de verificación no alcanza a hacerse hoy — el dueño quiere dejarla PEDIDA en el sistema
-- para que el visitador vaya después. Hoy eso no se podía: la lista del visitador
-- (mis_visitas_asignadas, mig 076) solo muestra clientes del embudo de ingreso
-- ('Listo para visita' / 'Pendiente evaluación'), así que asignarle la visita a un cliente
-- Activo era invisible para quien debía hacerla.
--
-- DOS CAMBIOS, los dos con red:
--
-- 1. La lista del visitador también muestra la asignación cuando el cliente ya tiene contrato.
--    No inunda nada: solo aparece quien tenga `visita_asignada_a` puesto A MANO por el admin.
--    Para esos, la marca de "visita registrada" va SIEMPRE en false — la de su ingreso original
--    no cuenta: lo que se le pidió es una visita NUEVA.
--
-- 2. Al registrarse la re-visita, la asignación se LIMPIA SOLA (en el mismo trigger de la 042):
--    el cliente sale de la lista del visitador sin que nadie tenga que acordarse de quitarlo.
--    Solo aplica a clientes FUERA del embudo — el flujo de ingreso queda idéntico (el guard de
--    estado del trigger corre primero: si venía de 'Listo para visita' ya quedó en 'Pendiente
--    evaluación' y NO entra en la limpieza).
--
-- El estado del cliente NO se toca en re-visitas: el trigger de la 042 solo mueve si venía de
-- 'Listo para visita' (verificado — un Activo queda Activo).

-- ── 1) La lista del visitador ────────────────────────────────────────────────
create or replace function public.mis_visitas_asignadas()
returns table (
  cliente_id uuid,
  nombre text,
  direccion text,
  telefono text,
  whatsapp text,
  acompanante_nombre text,
  acompanante_telefono text,
  estado text,
  visita_registrada boolean
)
language sql security definer
set search_path = public
stable as $$
  select
    c.id,
    c.nombre,
    c.direccion,
    c.telefono,
    c.whatsapp,
    c.acompanante_nombre,
    c.acompanante_telefono,
    c.estado,
    -- En el embudo, la marca de "ya registrada" funciona como siempre. En una RE-visita
    -- (cliente con contrato) va en false: la visita vieja de su ingreso no es la pedida.
    case when c.estado in ('Listo para visita', 'Pendiente evaluación')
         then exists (select 1 from public.visitas v where v.cliente_id = c.id and v.asignada_a = auth.uid())
         else false end
  from public.clientes c
  where c.visita_asignada_a = auth.uid()
    and c.estado in ('Listo para visita', 'Pendiente evaluación',
                     'Aprobado', 'Activo', 'En seguimiento', 'En riesgo', 'En mora')
  order by c.nombre;
$$;
revoke all on function public.mis_visitas_asignadas() from public;
grant execute on function public.mis_visitas_asignadas() to authenticated;

-- ── 2) La re-visita registrada limpia su asignación ─────────────────────────
-- Cuerpo de la 042 + el bloque nuevo. El orden importa: primero el avance del embudo (que deja
-- al de ingreso en 'Pendiente evaluación'), después la limpieza SOLO para los que no son del
-- embudo — así el flujo de ingreso queda exactamente igual que antes.
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

  -- ⬇️ LO NUEVO (mig 113): la re-visita hecha se des-asigna sola.
  update public.clientes
  set visita_asignada_a = null
  where id = new.cliente_id
    and visita_asignada_a is not null
    and estado not in ('En proceso', 'Listo para visita', 'Pendiente evaluación');

  return new;
end;
$$;
