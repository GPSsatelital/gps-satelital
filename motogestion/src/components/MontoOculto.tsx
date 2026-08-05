import { useEffect, useState } from "react";

// Cuántos segundos se queda visible antes de taparse sola.
const SEGUNDOS_VISIBLE = 5;

// Monto tapado (pedido del dueño, 5-ago-2026).
//
// POR QUÉ: en la calle y en el mostrador el cliente ve la pantalla del funcionario. El total
// recaudado del día no es asunto suyo, y verlo invita a comentarios y preguntas incómodas.
//
// CÓMO: un toque lo muestra, otro lo tapa. Y si a alguien se le olvida taparlo, **se tapa solo a
// los 5 segundos** — que es la protección que de verdad sirve: cambiar de pantalla ya lo tapa
// gratis (el componente se destruye y vuelve a nacer tapado), pero el caso peligroso es quedarse
// en la MISMA pantalla mostrándole algo al cliente, y ahí solo el reloj salva.
// Se descartó "mantener presionado": en el celular el long-press pelea con el menú de copiar de
// Android y se siente incómodo. Y se descartó un botón fijo de mostrar/ocultar, porque alguien lo
// deja prendido y se olvida — ahí el mirón ve todo igual.
//
// Detalles que importan:
//  · `stopPropagation` → estos montos viven dentro de tarjetas que navegan al tocarlas; sin esto,
//    tocar el valor te sacaba a otra pantalla en vez de mostrarlo.
//  · `userSelect/touchCallout: none` → un toque un poco largo en el celular no selecciona el texto
//    ni abre el menú de copiar encima del número.
export default function MontoOculto({
  valor,
  estilo,
  prefijo = "$",
}: {
  valor: number;
  estilo?: React.CSSProperties;
  prefijo?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), SEGUNDOS_VISIBLE * 1000);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <span
      role="button"
      tabIndex={0}
      title={visible ? "Toca para ocultar" : "Toca para ver"}
      onClick={e => { e.stopPropagation(); setVisible(v => !v); }}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setVisible(v => !v); }
      }}
      onContextMenu={e => e.preventDefault()}
      style={{
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "manipulation",
        // `tabular-nums` + el letterSpacing de los puntos evitan que la tarjeta "salte" de ancho
        // al pasar de •••••• al número.
        fontVariantNumeric: "tabular-nums",
        letterSpacing: visible ? undefined : 2,
        ...estilo,
      }}
    >
      {visible ? `${prefijo}${Math.round(valor).toLocaleString("es-CO")}` : "••••••"}
    </span>
  );
}
