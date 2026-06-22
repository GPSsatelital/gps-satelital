import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import FirmaCanvas from "../components/FirmaCanvas";
import { generarHTMLContrato, generarHTMLCertificado, generarHTMLPagare, type TipoDocumento } from "../hooks/useDocumentos";
import type { Contrato } from "../hooks/useContratos";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";

type Props = {
  contrato: Contrato;
  cliente: Cliente;
  moto: Moto | null;
  onClose: () => void;
  onCompletado: () => void;
};

const PASOS: { key: TipoDocumento; titulo: string; sub: string }[] = [
  { key: "contrato", titulo: "Contrato de arrendamiento", sub: "El cliente lee y firma el contrato de arriendo del vehículo." },
  { key: "certificado", titulo: "Certificado de conocimiento", sub: "El cliente demuestra que entendió las condiciones." },
  { key: "pagare", titulo: "Pagaré + Carta de instrucciones", sub: "Título valor en blanco como garantía legal." },
];

function primaryBtn(disabled = false): React.CSSProperties {
  return { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 20px", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 };
}

function secondaryBtn(): React.CSSProperties {
  return { background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" };
}

export default function FirmaModal({ contrato, cliente, moto, onClose, onCompletado }: Props) {
  const [paso, setPaso] = useState(0);
  const [firmas, setFirmas] = useState<Record<TipoDocumento, string | null>>({ contrato: null, certificado: null, pagare: null });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const pasoActual = PASOS[paso];

  function getHTML() {
    if (pasoActual.key === "contrato") return generarHTMLContrato(contrato, cliente, moto);
    if (pasoActual.key === "certificado") return generarHTMLCertificado(contrato, cliente);
    return generarHTMLPagare(contrato, cliente);
  }

  function handleImprimir() {
    const html = getHTML();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${pasoActual.titulo}</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  }

  async function subirFirma(tipo: TipoDocumento, dataUrl: string): Promise<string | null> {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `firmas/${contrato.id}/${tipo}_${Date.now()}.png`;
    const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSiguiente() {
    const firma = firmas[pasoActual.key];
    if (!firma) {
      setError("Debes capturar la firma antes de continuar.");
      return;
    }
    setError(null);

    if (paso < PASOS.length - 1) {
      setPaso(p => p + 1);
      return;
    }

    // Último paso: guardar todo
    setGuardando(true);
    try {
      const urls: Record<string, string | null> = {};
      for (const p of PASOS) {
        const f = firmas[p.key];
        if (f) urls[p.key] = await subirFirma(p.key, f);
      }

      await supabase.from("contratos").update({
        firma_cliente: true,
        ...(urls.contrato ? { contrato_pdf_url: urls.contrato } : {}),
        ...(urls.certificado ? { certificado_pdf_url: urls.certificado } : {}),
        ...(urls.pagare ? { pagare_pdf_url: urls.pagare } : {}),
      }).eq("id", contrato.id);

      onCompletado();
    } catch {
      setError("No se pudieron guardar las firmas. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12, zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 680, background: "white", borderRadius: 20, display: "flex", flexDirection: "column", maxHeight: "96vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Firma digital · {cliente.nombre.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{pasoActual.sub}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {PASOS.map((p, i) => (
              <div key={p.key} style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: i < paso ? "#10b981" : i === paso ? "#0284c7" : "#e2e8f0", color: i <= paso ? "white" : "#94a3b8" }}>
                  {i < paso ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: i === paso ? 700 : 400, color: i === paso ? "#0f172a" : "#94a3b8", lineHeight: 1.3 }}>{p.titulo}</div>
                {i < PASOS.length - 1 && <div style={{ flex: 1, height: 1, background: i < paso ? "#10b981" : "#e2e8f0", minWidth: 8 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Documento */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>
          <div ref={docRef} style={{ fontSize: 11, lineHeight: 1.6, padding: "12px 16px" }} dangerouslySetInnerHTML={{ __html: getHTML() }} />
        </div>

        {/* Panel inferior: firma + botones */}
        <div style={{ borderTop: "1px solid #e2e8f0", padding: "14px 20px", background: "#f8fafc" }}>
          <FirmaCanvas
            label={`Firma del cliente — ${pasoActual.titulo}`}
            onFirma={dataUrl => setFirmas(p => ({ ...p, [pasoActual.key]: dataUrl }))}
            onLimpiar={() => setFirmas(p => ({ ...p, [pasoActual.key]: null }))}
          />

          {error && <div style={{ marginTop: 8, color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10 }}>
            <button onClick={handleImprimir} style={{ ...secondaryBtn(), fontSize: 13 }}>
              🖨️ Imprimir documento
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {paso > 0 && (
                <button onClick={() => { setPaso(p => p - 1); setError(null); }} style={secondaryBtn()}>Atrás</button>
              )}
              <button onClick={handleSiguiente} disabled={guardando || !firmas[pasoActual.key]} style={primaryBtn(guardando || !firmas[pasoActual.key])}>
                {guardando ? "Guardando..." : paso < PASOS.length - 1 ? "Siguiente documento →" : "✅ Finalizar firmas"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
