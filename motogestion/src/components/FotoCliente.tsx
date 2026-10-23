import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { urlFirmada } from "../lib/storagePrivado";
import { useBackGuard } from "../contexts/BackNav";

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

export default function FotoCliente({ url, nombre, tamano = 40, borde, ampliable = false }: {
  url: string | null | undefined;
  nombre: string | null | undefined;
  tamano?: number;
  /** Color del aro: el mismo del riel de estado de la tarjeta. */
  borde?: string;
  /** Al tocarla se ve en grande en una ventana flotante, sin salir de la pantalla (pedido del dueño). */
  ampliable?: boolean;
}) {
  const caja = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const [grande, setGrande] = useState(false);
  // En el celular, el botón «atrás» cierra la foto en vez de salirse de la pantalla (como en la ficha).
  useBackGuard(grande, () => setGrande(false));
  useEffect(() => {
    if (!grande) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") setGrande(false); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [grande]);

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
  const tocable = ampliable && conFoto;
  return (
    <>
    <div
      ref={caja}
      onClick={tocable ? e => { e.stopPropagation(); setGrande(true); } : undefined}
      role={tocable ? "button" : undefined}
      aria-label={tocable ? `Ver la foto de ${nombre ?? "el cliente"}` : undefined}
      style={{
        width: tamano, height: tamano, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
        border: `2px solid ${borde ?? "var(--line)"}`, background: "var(--soft)", boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--muted)", fontWeight: 700, fontSize: Math.round(tamano * 0.36), letterSpacing: 0.5,
        cursor: tocable ? "zoom-in" : "default",
      }}
    >
      {conFoto
        ? <img src={src!} alt={`Foto de ${nombre ?? "el cliente"}`} loading="lazy" onError={() => setFallo(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <span aria-hidden="true">{iniciales(nombre)}</span>}
    </div>
    {/* La ventana flotante va al <body>: si quedara adentro de una tarjeta, un transform o un overflow
        de la tarjeta la encerraría en su caja. Se cierra tocando cualquier parte, con Escape o con «atrás». */}
    {grande && src && createPortal(
      <div onClick={() => setGrande(false)} role="dialog" aria-modal="true" aria-label={`Foto de ${nombre ?? "el cliente"}`}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 1300,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
        <img src={src} alt={`Foto de ${nombre ?? "el cliente"}`}
          style={{ maxWidth: "90vw", maxHeight: "78vh", borderRadius: 14, background: "var(--card)", objectFit: "contain" }} />
        <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 15, textTransform: "uppercase", textAlign: "center" }}>{nombre}</div>
        <button onClick={() => setGrande(false)}
          style={{ minHeight: 44, padding: "8px 22px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Cerrar
        </button>
      </div>,
      document.body,
    )}
    </>
  );
}
