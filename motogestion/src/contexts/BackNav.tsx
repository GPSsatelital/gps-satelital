import { createContext, useContext, useEffect, useRef } from "react";

// Registra un "cerrador" y devuelve la función para desregistrarlo.
type RegisterFn = (onBack: () => void) => () => void;

export const BackNavContext = createContext<RegisterFn | null>(null);

/**
 * Hace que una capa (panel de detalle, modal, hoja) sea "cerrable con atrás".
 * Mientras `active` sea true, el botón atrás del celular/navegador cierra ESTA capa
 * (llamando `onBack`) antes de cambiar de módulo. Se apilan en orden LIFO: atrás
 * cierra siempre la capa más reciente primero.
 *
 * Uso: useBackGuard(hayDetalleAbierto, () => cerrarDetalle());
 */
export function useBackGuard(active: boolean, onBack: () => void) {
  const register = useContext(BackNavContext);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;
  useEffect(() => {
    if (!register || !active) return;
    return register(() => onBackRef.current());
  }, [register, active]);
}
