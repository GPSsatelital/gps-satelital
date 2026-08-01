import { useEffect } from "react";

/**
 * Congela la página de atrás mientras hay una ventana flotante abierta.
 *
 * EL PROBLEMA QUE RESUELVE (reportado el 31-jul-2026): al deslizar sobre una ventana flotante, la
 * que se movía era la pantalla de ABAJO — se veía correr por debajo mientras la ventana quedaba
 * quieta. En el celular es peor: parece que la ventana está trabada.
 *
 * Pasa porque el overlay es `position: fixed` pero el `body` sigue siendo scrolleable, así que el
 * gesto se lo lleva el fondo. Se arregla congelando el body mientras la ventana está abierta.
 *
 * Se conserva la posición: al cerrar, la página vuelve exactamente a donde estaba. Sin eso, salir
 * de la ventana te manda al principio de la lista y hay que buscar de nuevo dónde ibas.
 *
 * OJO con ventanas anidadas (una que abre otra): se cuenta cuántas hay abiertas y solo se
 * descongela cuando se cierra la última. Si cada una descongelara al cerrarse, cerrar la de
 * adentro soltaría el fondo con la de afuera todavía abierta.
 */
let abiertas = 0;
let scrollGuardado = 0;

export function useBloquearScrollFondo(activo = true) {
  useEffect(() => {
    if (!activo || typeof document === "undefined") return;

    if (abiertas === 0) {
      scrollGuardado = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollGuardado}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    }
    abiertas++;

    return () => {
      abiertas--;
      if (abiertas > 0) return;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollGuardado);
    };
  }, [activo]);
}
