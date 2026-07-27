-- 075 — Candado: la marca de retención se limpia sola cuando la moto deja de estar retenida.
--
-- PROBLEMA: hay ~11 sitios en el código que cambian `motos.estado`, y solo el flujo de "Salida de
-- retención" limpia retencion_fecha / retencion_numero_caso / retencion_detalle. Los demás la dejan
-- pegada. Ejemplo real: iniciar una liquidación (useLiquidaciones.ts:132) pasa la moto a
-- Mantenimiento sin tocar esos campos -> la moto queda marcada como retenida para siempre y la
-- ficha (FichaMotoView) le pinta "Fecha retención" en rojo aunque ya esté rodando con un cliente.
--
-- POR QUÉ UN TRIGGER Y NO PARCHEAR CADA LLAMADOR: perseguir los 11 sitios es frágil — basta que
-- mañana alguien agregue el número 12 para que el problema vuelva, y nadie se va a acordar de esta
-- regla. Es el mismo principio de "una sola fuente de verdad" que ya se aplicó con cicloPago.ts y
-- con las funciones de scope de la migración 026: la regla vive en UN lugar.
--
-- LA REGLA, en una frase: si la moto DEJA de estar en Fiscalía/Tránsito/Garantía, entonces no está
-- retenida, y los datos de la retención dejan de ser ciertos.
--
-- Casos que NO toca a propósito:
--   · entrar a una retención (Disponible -> Fiscalía): la condición pide que ANTES estuviera retenida.
--   · cambiar de una retención a otra (Fiscalía -> Tránsito): sigue retenida, se conserva el dato.
--   · cualquier update que no toque el estado (cambiar color, kilometraje, sub-admin).
--
-- NO se pierde historia: el rastro de dónde estuvo la moto vive en `historial_ubicaciones` y
-- `recepciones_vehiculo`. Estos tres campos son ESTADO ACTUAL, no historial. Y el cálculo de días
-- fuera de servicio lee la fecha ANTES de cambiar el estado, así que no se ve afectado.

create or replace function public.limpiar_retencion_al_salir()
returns trigger
language plpgsql
as $$
begin
  if old.estado in ('Fiscalia', 'Transito', 'Garantia')
     and new.estado not in ('Fiscalia', 'Transito', 'Garantia') then
    new.retencion_fecha       := null;
    new.retencion_numero_caso := null;
    new.retencion_detalle     := null;
  end if;
  return new;
end;
$$;

comment on function public.limpiar_retencion_al_salir() is
  'Borra los datos de retención de una moto cuando su estado deja de ser Fiscalía/Tránsito/Garantía. Evita que queden marcadas como retenidas motos que ya volvieron a operar.';

drop trigger if exists trg_limpiar_retencion on public.motos;
create trigger trg_limpiar_retencion
  before update of estado on public.motos
  for each row
  when (old.estado is distinct from new.estado)
  execute function public.limpiar_retencion_al_salir();

-- Limpieza de lo que ya esté sucio hoy (si la mig 074 ya corrió y alguna moto quedó marcada).
-- En una base recién migrada esto no afecta ninguna fila.
update public.motos
   set retencion_fecha = null, retencion_numero_caso = null, retencion_detalle = null
 where estado not in ('Fiscalia', 'Transito', 'Garantia')
   and (retencion_fecha is not null or retencion_numero_caso is not null or retencion_detalle is not null);
