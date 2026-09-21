import { useEffect, useState } from "react";
import { firmarImagenesHtml } from "../lib/storagePrivado";

// Muestra en pantalla un HTML armado por `useDocumentos.ts` (la vista previa de un documento
// para que el cliente lo LEA antes de firmar) con las imágenes de Storage ya firmadas.
//
// POR QUÉ NO SIRVE `ImgPrivada` ACÁ: estos documentos son plantillas de TEXTO — se pintan con
// `dangerouslySetInnerHTML`, no con componentes de React, así que sus `<img>` nunca pasan por
// ImgPrivada. `firmarImagenesHtml` cambia las direcciones dentro del texto.
//
// POR QUÉ ES UN COMPONENTE Y NO UN EFECTO EN CADA PANTALLA: la vista previa del acuerdo vive
// dentro de `ModalConvenio`, y ahí un efecto con dependencias inestables (arreglos derivados que
// se recrean en cada render) entra en bucle. Acá la única dependencia es `html`, que es un
// STRING: React lo compara por valor, así que el efecto solo corre cuando el documento cambia
// de verdad. Guardar el resultado no puede volver a disparar el cálculo del HTML.
//
// Mientras llega la firma se pinta el HTML tal como está hoy — así no aparece un hueco en blanco
// ni cambia nada mientras los buckets sigan públicos.

export default function HtmlFirmado({
  html,
  style,
}: {
  html: string;
  style?: React.CSSProperties;
}) {
  const [listo, setListo] = useState(html);

  useEffect(() => {
    let vivo = true;
    setListo(html);
    firmarImagenesHtml(html).then(h => { if (vivo) setListo(h); });
    // `vivo` evita pintar el documento de un cliente sobre el de otro si cambia antes de que
    // lleguen las firmas.
    return () => { vivo = false; };
  }, [html]);

  return <div style={style} dangerouslySetInnerHTML={{ __html: listo }} />;
}
