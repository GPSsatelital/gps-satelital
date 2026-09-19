import { useEffect, useState } from "react";
import { urlFirmada } from "../lib/storagePrivado";

// Muestra una imagen de Storage con enlace FIRMADO en vez del enlace público eterno.
// Reemplazo directo de `<img src={url} ...>` en todo lo que sea documento del cliente:
// cédulas, recibos, firmas, huellas, comprobantes, fotos de moto.
//
// Por qué existe: firmar es asíncrono y no se puede hacer dentro del atributo `src`. Este
// componente lo resuelve una vez y guarda el resultado, para que ninguna pantalla tenga que
// llevar su propio estado por cada imagen.
//
// Si la URL no es de Storage (un dataURL recién capturado, una foto externa) se muestra tal
// cual: la firma solo aplica a lo que vive en el bucket.

export default function ImgPrivada({
  src,
  alt = "",
  style,
  onClick,
  title,
}: {
  src: string | null | undefined;
  alt?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}) {
  const [resuelta, setResuelta] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    // Un dataURL no necesita firma y pedirla sería un viaje al servidor por nada.
    if (!src || src.startsWith("data:")) { setResuelta(src ?? null); return; }
    setResuelta(null);
    urlFirmada(src).then(u => { if (vivo) setResuelta(u); });
    // `vivo` evita pintar la imagen de un cliente sobre la de otro si el usuario cambia de
    // ficha antes de que llegue la firma.
    return () => { vivo = false; };
  }, [src]);

  if (!src) return null;
  if (!resuelta) {
    // Hueco del mismo tamaño mientras llega la firma: sin esto la pantalla salta.
    return <div style={{ ...style, background: "var(--soft2)", borderRadius: style?.borderRadius ?? 8 }} />;
  }
  // `loading="lazy"`: el navegador solo BAJA la imagen cuando está por verse (19-sep-2026).
  // El Reporte de Entregas pinta hasta 6 miniaturas de 48×48 por tarjeta, pero cada una es la
  // foto COMPLETA de la cámara del celular: con 20 entregas eran 120 imágenes de varios megas
  // bajando y decodificándose a la vez para mostrarse del tamaño de una estampilla. Ese era el
  // "scroll lento". Va acá y no en cada pantalla para que lo hereden todas.
  // `decoding="async"`: decodificar tampoco frena el pintado de lo demás.
  return (
    <img
      src={resuelta}
      alt={alt}
      title={title}
      style={style}
      onClick={onClick}
      loading="lazy"
      decoding="async"
    />
  );
}
