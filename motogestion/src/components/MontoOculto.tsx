import { useState } from "react";

// Monto tapado hasta que se mantiene presionado (pedido del dueño, 5-ago-2026).
//
// POR QUÉ: en la calle y en el mostrador el cliente ve la pantalla del funcionario. El total
// recaudado del día no es asunto suyo, y verlo invita a comentarios y a preguntas incómodas.
// Se tapa por defecto y solo se ve MIENTRAS se mantiene el dedo encima: al soltar, se tapa sola.
// Nada de un botón de "mostrar/ocultar" que alguien deje prendido y se olvide.
//
// Detalles que importan en el celular:
//  · `userSelect/touchCallout: none` + `onContextMenu` → mantener presionado NO abre el menú de
//    "copiar/seleccionar" de Android, que tapaba el número justo cuando se quería ver.
//  · `stopPropagation` → estos montos viven dentro de tarjetas que navegan al tocarlas; sin esto,
//    intentar ver el valor te sacaba a otra pantalla.
//  · `onPointerLeave/Cancel` → si el dedo se corre fuera del número, se tapa igual.
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
  const mostrar = (e: React.SyntheticEvent) => { e.stopPropagation(); setVisible(true); };
  const tapar = (e: React.SyntheticEvent) => { e.stopPropagation(); setVisible(false); };

  return (
    <span
      role="button"
      tabIndex={-1}
      title={visible ? undefined : "Mantén presionado para ver"}
      onPointerDown={mostrar}
      onPointerUp={tapar}
      onPointerLeave={tapar}
      onPointerCancel={tapar}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => e.preventDefault()}
      style={{
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        touchAction: "manipulation",
        // Sin ancho fijo la tarjeta "salta" al pasar de •••• al número. `tabular-nums` mantiene
        // los dígitos del mismo ancho y el letterSpacing empareja los puntos con las cifras.
        fontVariantNumeric: "tabular-nums",
        letterSpacing: visible ? undefined : 2,
        ...estilo,
      }}
    >
      {visible ? `${prefijo}${Math.round(valor).toLocaleString("es-CO")}` : "••••••"}
    </span>
  );
}
