import { useEffect, useState } from "react";

// Detecta si se publicó una versión NUEVA de la app, sin service worker: compara el archivo
// principal del index.html actual (en el servidor) contra el que se cargó al abrir la pestaña.
// Si cambió, muestra un aviso con botón "Actualizar" (recarga la página). NO recarga solo, para
// no interrumpir a media digitación — la persona decide cuándo. La red de seguridad de
// `vite:preloadError` (en main.tsx) cubre el caso en que un archivo viejo ya no exista.

function tagDeHtml(texto: string): string | null {
  const m = texto.match(/\/assets\/index-[\w-]+\.js/);
  return m ? m[0] : null;
}

export default function AvisoActualizacion() {
  const [hayNueva, setHayNueva] = useState(false);

  useEffect(() => {
    let activo = true;
    // Versión que estamos corriendo ahora (del <script> ya cargado en el DOM).
    const script = document.querySelector('script[type="module"][src*="/assets/index-"]') as HTMLScriptElement | null;
    let baseline: string | null = script ? tagDeHtml(script.src) : null;

    async function chequear() {
      if (!activo || document.hidden) return;
      try {
        const res = await fetch("/", { cache: "no-store" });
        const tag = tagDeHtml(await res.text());
        if (!activo || !tag) return;
        if (!baseline) { baseline = tag; return; } // no se pudo leer del DOM: fijar la 1a vez
        if (tag !== baseline) setHayNueva(true);
      } catch {
        /* sin conexión: se reintenta en el próximo ciclo */
      }
    }

    const primer = setTimeout(chequear, 15000); // primer chequeo a los 15s (dar tiempo a cargar)
    const id = setInterval(chequear, 60000);      // luego cada minuto
    const onFocus = () => chequear();             // y al volver a la pestaña
    window.addEventListener("focus", onFocus);
    return () => {
      activo = false;
      clearTimeout(primer);
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!hayNueva) return null;

  return (
    <div style={{
      position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 84, zIndex: 3000,
      background: "var(--ink)", color: "var(--on-ink)", borderRadius: 14, padding: "12px 16px",
      boxShadow: "0 12px 40px rgba(15,23,42,0.35)", display: "flex", alignItems: "center", gap: 14,
      maxWidth: "calc(100vw - 24px)", boxSizing: "border-box",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, minWidth: 0 }}>🔄 Hay una versión nueva de la app.</div>
      <button
        onClick={() => window.location.reload()}
        style={{ background: "var(--accent-hi)", color: "var(--text)", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
      >
        Actualizar
      </button>
    </div>
  );
}
