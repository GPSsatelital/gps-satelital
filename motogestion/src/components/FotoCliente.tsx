import { useEffect, useRef, useState } from "react";
import { urlFirmada } from "../lib/storagePrivado";

// LA CARA DEL CLIENTE en un círculo (23-oct-2026, pedido del dueño: «que aparte del nombre siempre
// veamos la cara»). Va en la lista de Clientes y en la primera tarjeta del detalle de Cartera.
//
// Pensada para listas largas: la foto vive en un bucket que pide enlace firmado, y firmar es un viaje
// al servidor por foto. Con `ImgPrivada` directo, abrir Clientes firmaba las ~250 fotos de una.
// Aquí se firma SOLO cuando el círculo aparece en pantalla, y cada enlace se recuerda mientras dure
// (60 min): bajar y volver a subir por la lista no pide nada otra vez. Sin foto, o si no carga, salen
// las iniciales. Las fotos ya se guardan livianas (~19 KB), así que no hace falta pedir copia achicada.

const VALIDEZ_MS = 55 * 60 * 1000;   // un poco menos que los 60 min del enlace firmado
const firmadas = new Map<string, { url: Promise<string | null>; hasta: number }>();

function firmar(url: string): Promise<string | null> {
  const ya = firmadas.get(url);
  if (ya && ya.hasta > Date.now()) return ya.url;
  const p = urlFirmada(url).catch(() => null);
  firmadas.set(url, { url: p, hasta: Date.now() + VALIDEZ_MS });
  return p;
}

export function iniciales(nombre: string | null | undefined): string {
  const partes = (nombre ?? "").trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function FotoCliente({ url, nombre, tamano = 40, borde, onClick }: {
  url: string | null | undefined;
  nombre: string | null | undefined;
  tamano?: number;
  /** Color del aro: el mismo del riel de estado de la tarjeta. */
  borde?: string;
  /** Si se pasa, la foto se puede tocar (por ejemplo, para verla en grande). */
  onClick?: () => void;
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!url || visible || !caja.current) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(e => { if (e.some(x => x.isIntersecting)) { setVisible(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(caja.current);
    return () => io.disconnect();
  }, [url, visible]);

  useEffect(() => {
    let vivo = true;
    setFallo(false);
    if (!url) { setSrc(null); return; }
    if (url.startsWith("data:")) { setSrc(url); return; }
    if (!visible) return;
    firmar(url).then(s => { if (vivo) setSrc(s); });
    return () => { vivo = false; };
  }, [url, visible]);

  const conFoto = !!src && !fallo;
  return (
    <div
      ref={caja}
      onClick={onClick ? e => { e.stopPropagation(); onClick(); } : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `Ver la foto de ${nombre ?? "el cliente"}` : undefined}
      style={{
        width: tamano, height: tamano, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
        border: `2px solid ${borde ?? "var(--line)"}`, background: "var(--soft)", boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--muted)", fontWeight: 700, fontSize: Math.round(tamano * 0.36), letterSpacing: 0.5,
        cursor: onClick && conFoto ? "zoom-in" : onClick ? "pointer" : "default",
      }}
    >
      {conFoto
        ? <img src={src!} alt={`Foto de ${nombre ?? "el cliente"}`} loading="lazy" onError={() => setFallo(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <span aria-hidden="true">{iniciales(nombre)}</span>}
    </div>
  );
}
