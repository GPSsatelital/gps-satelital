import { useState } from "react";
import ImgPrivada from "./ImgPrivada";
import type { Moto } from "../hooks/useMotos";
import { useMotos } from "../hooks/useMotos";
import { secondaryBtn } from "../styles/shared";

interface Props {
  moto: Moto;
  onClose: () => void;
}

type DocKey = "tarjeta_frente" | "tarjeta_reverso" | "soat";
const DOCS: { key: DocKey; label: string }[] = [
  { key: "tarjeta_frente", label: "Tarjeta de propiedad — frente" },
  { key: "tarjeta_reverso", label: "Tarjeta de propiedad — reverso" },
  { key: "soat", label: "SOAT (una página)" },
];

export default function ModalDocumentosMoto({ moto: motoInicial, onClose }: Props) {
  const { adjuntarDocumentoMoto } = useMotos();
  const [moto, setMoto] = useState(motoInicial);
  const [subiendo, setSubiendo] = useState<DocKey | null>(null);
  const [errorKey, setErrorKey] = useState<{ key: DocKey; msg: string } | null>(null);

  const docs = moto.documentos_moto ?? {};

  async function subir(key: DocKey, file: File | undefined) {
    if (!file || subiendo) return;
    setErrorKey(null);
    setSubiendo(key);
    try {
      const { url, error } = await adjuntarDocumentoMoto(moto, key, file);
      if (error || !url) { setErrorKey({ key, msg: error || "No se pudo subir" }); return; }
      setMoto(prev => ({ ...prev, documentos_moto: { ...(prev.documentos_moto ?? {}), [key]: url } }));
    } finally {
      setSubiendo(null);
    }
  }

  // Imprime la tarjeta con AMBAS caras en una sola hoja (la copia que se le entrega al conductor).
  function imprimirTarjeta() {
    const d = moto.documentos_moto ?? {};
    if (!d.tarjeta_frente || !d.tarjeta_reverso) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Tarjeta ${moto.placa}</title>
      <style>@page{margin:10mm}@media print{body{margin:0}}
      body{font-family:Arial,sans-serif;text-align:center}
      h3{margin:6px 0 10px;font-size:15px}
      .cara{font-size:11px;color:#555;margin:6px 0 2px}
      img{width:100%;max-width:170mm;max-height:118mm;object-fit:contain;display:block;margin:0 auto;border:1px solid #ddd}
      </style></head><body>
      <h3>Tarjeta de propiedad — ${moto.placa}</h3>
      <div class="cara">Frente</div><img src="${d.tarjeta_frente}"/>
      <div class="cara">Reverso</div><img src="${d.tarjeta_reverso}"/>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  function imprimirSoat() {
    const d = moto.documentos_moto ?? {};
    if (!d.soat) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>SOAT ${moto.placa}</title>
      <style>@page{margin:10mm}@media print{body{margin:0}}body{font-family:Arial,sans-serif;text-align:center}
      h3{margin:6px 0 10px;font-size:15px}img{width:100%;max-width:180mm;max-height:250mm;object-fit:contain;display:block;margin:0 auto;border:1px solid #ddd}
      </style></head><body><h3>SOAT — ${moto.placa}</h3><img src="${d.soat}"/></body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  const tarjetaCompleta = !!(docs.tarjeta_frente && docs.tarjeta_reverso);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 14, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>🪪 Documentos de la moto</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{moto.placa}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Escanea la tarjeta bien encuadrada (frente y reverso) para poder imprimir ambas caras en una sola hoja — esa es la copia que se le entrega al conductor. La tarjeta física se queda en la empresa.
        </div>

        {DOCS.map(({ key, label }) => {
          const url = docs[key];
          return (
            <div key={key} style={{ padding: 14, borderRadius: 14, background: "var(--soft2)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted2)" }}>{label}</div>
                {url
                  ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 999, padding: "2px 8px" }}>✅ Escaneado</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 999, padding: "2px 8px" }}>⏳ Falta</span>}
              </div>
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginBottom: 8 }}>
                  <ImgPrivada src={url} alt={label} style={{ maxHeight: 90, borderRadius: 8, border: "1px solid var(--line)" }} />
                </a>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13, opacity: subiendo ? 0.6 : 1 }}>
                  📷 Cámara
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={!!subiendo} onChange={e => subir(key, e.target.files?.[0])} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13, opacity: subiendo ? 0.6 : 1 }}>
                  🖼 Galería
                  <input type="file" accept="image/*" style={{ display: "none" }} disabled={!!subiendo} onChange={e => subir(key, e.target.files?.[0])} />
                </label>
              </div>
              {subiendo === key && <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>Subiendo…</div>}
              {errorKey?.key === key && <div style={{ marginTop: 8, fontSize: 12, color: "var(--bad-ink)", fontWeight: 700 }}>⛔ {errorKey.msg}</div>}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={imprimirTarjeta} disabled={!tarjetaCompleta} title={tarjetaCompleta ? "" : "Faltan las dos caras de la tarjeta"} style={{ flex: 1, minWidth: 140, padding: "10px 14px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: tarjetaCompleta ? "pointer" : "not-allowed", background: tarjetaCompleta ? "var(--ok-soft)" : "var(--soft)", color: tarjetaCompleta ? "var(--ok-ink)" : "var(--faint)" }}>
            🖨️ Imprimir tarjeta (2 caras)
          </button>
          {docs.soat && (
            <button onClick={imprimirSoat} style={{ flex: 1, minWidth: 120, padding: "10px 14px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
              🖨️ Imprimir SOAT
            </button>
          )}
        </div>

        <button onClick={onClose} style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14 }}>Cerrar</button>
      </div>
    </div>
  );
}
