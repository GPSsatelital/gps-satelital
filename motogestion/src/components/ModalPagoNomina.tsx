import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import CanvasFirma from "./CanvasFirma";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useBackGuard } from "../contexts/BackNav";
import { primaryBtn, secondaryBtn, inputStyle, labelStyle } from "../styles/shared";

const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");
const textoSemana = (lunes: string) => {
  const d = new Date(lunes.slice(0, 10) + "T12:00:00");
  const fin = new Date(d); fin.setDate(fin.getDate() + 6);
  const f = (x: Date) => x.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  return `Semana del ${f(d)} al ${f(fin)}`;
};

interface Props {
  cobradorNombre: string;
  semanas: Array<{ id: string; semana_lunes: string; total: number }>;
  onPagar: (opts: { firmaDataUrl: string; fotoDataUrl: string | null; observacion: string }) => Promise<{ error: string | null }>;
  onClose: () => void;
}

/**
 * EL PAGO DEL 15 Y EL 30 (D-057, parte 4): se le entregan al supervisor todas sus semanas cerradas
 * que todavía no se le han pagado, y firma que recibió. No se edita ni se borra; una semana no se
 * puede pagar dos veces (candado en la base, mig 208).
 */
export default function ModalPagoNomina({ cobradorNombre, semanas, onPagar, onClose }: Props) {
  const [firma, setFirma] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);
  useBloquearScrollFondo();
  useBackGuard(true, onClose);

  const total = semanas.reduce((a, s) => a + Number(s.total), 0);
  const ordenadas = [...semanas].sort((a, b) => a.semana_lunes.localeCompare(b.semana_lunes));

  function tomarFoto(file: File | null | undefined) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setFoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(file);
  }

  async function confirmar() {
    if (guardando) return;
    if (!firma) { setError("Falta la firma del supervisor. Es la constancia de que recibió la plata."); return; }
    setError(null);
    setGuardando(true);
    try {
      const { error: e } = await onPagar({ firmaDataUrl: firma, fotoDataUrl: foto, observacion });
      if (e) { setError(e); return; }
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 320 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 22, display: "grid", gap: 14, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Registrar pago de nómina</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{cobradorNombre}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--soft)", border: "none", borderRadius: 999, cursor: "pointer", flexShrink: 0, color: "var(--text)" }}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div style={{ padding: "12px 16px", borderRadius: 16, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)" }}>
          <div style={{ fontSize: 12, color: "var(--accent-ink)" }}>Se le paga</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-ink)", fontVariantNumeric: "tabular-nums" }}>$ {fmt(total)}</div>
          <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
            {ordenadas.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, color: "var(--accent-ink)" }}>
                <span style={{ flex: 1, minWidth: 0 }}>{textoSemana(s.semana_lunes)}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>$ {fmt(Number(s.total))}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.45 }}>
          Son todas sus semanas <b>cerradas y firmadas</b> que todavía no se le han pagado. El pago
          <b> no se puede editar ni borrar</b>, y ninguna de estas semanas se puede volver a pagar.
          Imprime el comprobante para que también lo firme en papel.
        </div>

        <CanvasFirma label="Firma del supervisor — recibí conforme" modal opcional={false} onChange={setFirma} />

        <div>
          <div style={labelStyle}>Foto del comprobante firmado <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span></div>
          {foto ? (
            <div style={{ display: "grid", gap: 8 }}>
              <img src={foto} alt="Comprobante firmado" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 12, border: "1px solid var(--line)" }} />
              <button onClick={() => setFoto(null)} style={{ ...secondaryBtn, width: "100%" }}>Quitar y tomar otra</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Android no permite cámara y galería en un solo input (convención del proyecto). */}
              <button onClick={() => inputFoto.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Camera size={16} aria-hidden="true" /> Cámara
              </button>
              <button onClick={() => inputGaleria.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <ImageIcon size={16} aria-hidden="true" /> Galería
              </button>
              <input ref={inputFoto} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => tomarFoto(e.target.files?.[0])} />
              <input ref={inputGaleria} type="file" accept="image/*" style={{ display: "none" }} onChange={e => tomarFoto(e.target.files?.[0])} />
            </div>
          )}
        </div>

        <div>
          <div style={labelStyle}>Observación <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span></div>
          <input style={inputStyle} value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. se pagó en efectivo" />
        </div>

        {error && (
          <div role="alert" style={{ padding: "8px 12px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} disabled={guardando} style={{ ...secondaryBtn, flex: 1, minWidth: 0 }}>Cancelar</button>
          <button onClick={confirmar} disabled={guardando} style={{ ...primaryBtn, flex: 2, minWidth: 0, opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Registrando..." : "Registrar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
