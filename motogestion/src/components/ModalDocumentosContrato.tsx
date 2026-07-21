import { useState } from "react";
import type { Contrato, TipoDocumentoContrato } from "../hooks/useContratos";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { secondaryBtn } from "../styles/shared";

interface Props {
  contrato: Contrato;
  clienteNombre: string;
  onClose: () => void;
}

const DOCUMENTOS: { tipo: TipoDocumentoContrato; label: string }[] = [
  { tipo: "contrato_pdf_url", label: "Contrato firmado" },
  { tipo: "pagare_pdf_url", label: "Pagaré firmado" },
  { tipo: "certificado_pdf_url", label: "Certificado de conocimiento" },
];

export default function ModalDocumentosContrato({ contrato: contratoInicial, clienteNombre, onClose }: Props) {
  const { profile } = useAuth();
  const { adjuntarDocumentoContrato } = useContratos();
  const [contrato, setContrato] = useState(contratoInicial);
  const [subiendo, setSubiendo] = useState<TipoDocumentoContrato | null>(null);
  const [errorTipo, setErrorTipo] = useState<{ tipo: TipoDocumentoContrato; msg: string } | null>(null);

  async function subir(tipo: TipoDocumentoContrato, file: File | undefined) {
    if (!file || !profile || subiendo) return;
    setErrorTipo(null);
    setSubiendo(tipo);
    try {
      const { url, error } = await adjuntarDocumentoContrato(contrato, tipo, file, profile.id);
      if (error || !url) {
        setErrorTipo({ tipo, msg: error || "No se pudo subir" });
        return;
      }
      setContrato(prev => ({ ...prev, [tipo]: url }));
    } finally {
      setSubiendo(null);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>📎 Documentos del contrato</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Sube la foto o escaneo del documento físico firmado. Si ya había uno, subir uno nuevo lo reemplaza.
        </div>

        {DOCUMENTOS.map(({ tipo, label }) => {
          const url = contrato[tipo];
          return (
            <div key={tipo} style={{ padding: 14, borderRadius: 14, background: "var(--soft2)", border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted2)" }}>{label}</div>
                {url ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 999, padding: "2px 8px" }}>✅ Adjunto</span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 999, padding: "2px 8px" }}>⏳ Falta</span>
                )}
              </div>

              {url && (
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
                    👁 Ver
                  </a>
                  <a href={`${url}?download`} style={{ fontSize: 12, fontWeight: 700, color: "var(--ok-ink)" }}>
                    ⬇ Descargar
                  </a>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13, opacity: subiendo ? 0.6 : 1 }}>
                  📷 Cámara
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={!!subiendo} onChange={e => subir(tipo, e.target.files?.[0])} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13, opacity: subiendo ? 0.6 : 1 }}>
                  🖼 Galería
                  <input type="file" accept="image/*,.pdf" style={{ display: "none" }} disabled={!!subiendo} onChange={e => subir(tipo, e.target.files?.[0])} />
                </label>
              </div>

              {subiendo === tipo && <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>Subiendo…</div>}
              {errorTipo?.tipo === tipo && <div style={{ marginTop: 8, fontSize: 12, color: "var(--bad-ink)", fontWeight: 700 }}>⛔ {errorTipo.msg}</div>}
            </div>
          );
        })}

        <button onClick={onClose} style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14 }}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
