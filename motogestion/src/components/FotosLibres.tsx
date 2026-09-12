// Fotos SUELTAS, las que sean: el daño, el repuesto viejo, el tablero, la pieza rota.
//
// Es el complemento de `FotosAngulos` (las 6 guiadas), que sirven para probar el estado COMPLETO
// de la moto al entrar y al salir. Un daño no está en un ángulo fijo, así que aquí no hay casillas:
// se agregan las que hagan falta y cada una lleva una nota corta ("cadena partida", "así quedó el
// tablero"). Decisión del dueño (12-sep-2026): en el taller van las dos cosas.
//
// El componente NO sube nada: entrega los `dataUrl` y la pantalla que lo usa decide dónde guardarlos.

import React, { useState } from "react";

export type FotoLibreLocal = { src: string; nota: string };

export function GridFotosLibres({
  fotos,
  onChange,
  vacio = "Todavía no hay fotos.",
}: {
  fotos: FotoLibreLocal[];
  onChange: (f: FotoLibreLocal[]) => void;
  vacio?: string;
}) {
  const [ampliada, setAmpliada] = useState<string | null>(null);

  function leer(files: FileList | null) {
    if (!files || files.length === 0) return;
    // Se leen todas las elegidas y se agregan de una: en la galería el funcionario suele
    // seleccionar varias del daño a la vez.
    const pendientes = Array.from(files);
    let leidas: FotoLibreLocal[] = [];
    let faltan = pendientes.length;
    pendientes.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        leidas = [...leidas, { src: ev.target?.result as string, nota: "" }];
        faltan--;
        if (faltan === 0) onChange([...fotos, ...leidas]);
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div style={{ display: "grid", gap: 8, textAlign: "left" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {/* Cámara y galería SEPARADAS: Android no permite las dos en un solo input. */}
        <label style={btnFoto("var(--accent-soft3)", "var(--accent-ink)")}>
          📷 Cámara
          <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
            onChange={e => { leer(e.target.files); e.target.value = ""; }} />
        </label>
        <label style={btnFoto("var(--soft2)", "var(--muted2)")}>
          🖼 Galería
          <input type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={e => { leer(e.target.files); e.target.value = ""; }} />
        </label>
      </div>

      {fotos.length === 0
        ? <div style={{ fontSize: 12, color: "var(--faint)", fontStyle: "italic" }}>{vacio}</div>
        : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
            {fotos.map((f, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 6, background: "var(--soft2)", minWidth: 0, boxSizing: "border-box" }}>
                <div style={{ position: "relative" }}>
                  <img src={f.src} alt={f.nota || `Foto ${i + 1}`} onClick={() => setAmpliada(f.src)}
                    style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 8, cursor: "zoom-in", display: "block" }} />
                  <button type="button" title="Quitar" onClick={() => onChange(fotos.filter((_, idx) => idx !== i))} style={{
                    position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                    background: "var(--bad)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                </div>
                <input
                  value={f.nota}
                  onChange={e => onChange(fotos.map((x, idx) => idx === i ? { ...x, nota: e.target.value } : x))}
                  placeholder="¿Qué es?"
                  style={{ width: "100%", marginTop: 6, padding: "5px 7px", borderRadius: 7, border: "1px solid var(--line2)", fontSize: 11, boxSizing: "border-box", background: "var(--card)", color: "var(--text)" }}
                />
              </div>
            ))}
          </div>
        )}

      {ampliada && (
        <div onClick={() => setAmpliada(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: 16 }}>
          <img src={ampliada} alt="Foto ampliada" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}
    </div>
  );
}

/** Miniaturas de fotos YA guardadas (con URL), con lightbox. Solo lectura. */
export function GaleriaFotos({ fotos, vacio }: { fotos: { url: string; nota?: string }[]; vacio?: string }) {
  const [ampliada, setAmpliada] = useState<string | null>(null);
  if (fotos.length === 0) {
    return vacio ? <div style={{ fontSize: 12, color: "var(--faint)", fontStyle: "italic" }}>{vacio}</div> : null;
  }
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8, textAlign: "left" }}>
        {fotos.map((f, i) => (
          <div key={i} style={{ minWidth: 0 }}>
            <img src={f.url} alt={f.nota || `Foto ${i + 1}`} onClick={() => setAmpliada(f.url)}
              style={{ width: "100%", height: 72, objectFit: "cover", borderRadius: 8, cursor: "zoom-in", display: "block", border: "1px solid var(--line)" }} />
            {f.nota && <div style={{ fontSize: 10, color: "var(--muted2)", marginTop: 3, lineHeight: 1.3 }}>{f.nota}</div>}
          </div>
        ))}
      </div>
      {ampliada && (
        <div onClick={() => setAmpliada(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300, padding: 16 }}>
          <img src={ampliada} alt="Foto ampliada" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />
        </div>
      )}
    </>
  );
}

function btnFoto(bg: string, color: string): React.CSSProperties {
  return {
    cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 8,
    background: bg, color, border: "1px solid var(--line2)", display: "inline-flex", alignItems: "center", gap: 4,
  };
}
