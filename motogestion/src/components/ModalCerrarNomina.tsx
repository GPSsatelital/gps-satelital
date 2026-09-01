import { useRef, useState } from "react";
import CanvasFirma from "./CanvasFirma";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useBackGuard } from "../contexts/BackNav";
import { primaryBtn, secondaryBtn, inputStyle, labelStyle } from "../styles/shared";
import { totalesPorGrupo, type NominaCobrador } from "../utils/nominaCobradores";

const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");
const fmtDia = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long" });

interface Props {
  nomina: NominaCobrador;
  cobradorNombre: string;
  lunes: string;
  domingo: string;
  onCerrar: (opts: { firmaDataUrl: string | null; fotoDataUrl: string | null; observacion: string }) => Promise<{ error: string | null }>;
  onClose: () => void;
}

/**
 * CERRAR Y PAGAR la semana de un cobrador (mig 120).
 *
 * Pedido del dueño: *"¿dónde se cierran las semanas que ya se pagaron para que los funcionarios
 * firmen y se puedan subir las fotos de lo firmado?"*. Hasta hoy la nómina se recalculaba cada
 * vez que se abría la pantalla: un pago que entrara después movía una semana ya pagada, y no
 * quedaba constancia de qué se le pagó a quién.
 *
 * Al cerrar, las cifras quedan CONGELADAS con la firma del cobrador y la foto del desprendible
 * en papel. Un cierre no se edita ni se borra — es un registro de pago.
 */
export default function ModalCerrarNomina({ nomina, cobradorNombre, lunes, domingo, onCerrar, onClose }: Props) {
  const [firma, setFirma] = useState<string | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);

  useBloquearScrollFondo();
  useBackGuard(true, onClose);

  const grupos = totalesPorGrupo(nomina.renglones);

  function tomarFoto(file: File | null | undefined) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setFoto(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(file);
  }

  async function confirmar() {
    if (guardando) return;
    if (!firma) { setError("Falta la firma del cobrador. Es la constancia de que recibió."); return; }
    setError(null);
    setGuardando(true);
    try {
      const { error: e } = await onCerrar({ firmaDataUrl: firma, fotoDataUrl: foto, observacion });
      if (e) { setError(e); return; }
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 320 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 22, display: "grid", gap: 14, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Cerrar y pagar la semana</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{cobradorNombre}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{fmtDia(lunes)} al {fmtDia(domingo)}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        {/* Lo que se le paga, sin letra chica */}
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)" }}>
          <div style={{ fontSize: 12.5, color: "var(--accent-ink)" }}>Se le paga</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "var(--accent-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>
            $ {fmt(nomina.total)}
          </div>
          <div style={{ fontSize: 12, color: "var(--accent-ink)", marginTop: 4, lineHeight: 1.5 }}>
            {nomina.ciclosATiempo > 0 && <>{nomina.ciclosATiempo} a tiempo · </>}
            {nomina.prorrateos > 0 && <>{nomina.prorrateos} prorrateo{nomina.prorrateos === 1 ? "" : "s"} · </>}
            {nomina.ciclosAtrasados > 0 && <>{nomina.ciclosAtrasados} atrasado{nomina.ciclosAtrasados === 1 ? "" : "s"} · </>}
            {nomina.cuotasConvenio > 0 && <>{nomina.cuotasConvenio} de convenio · </>}
            {nomina.retenciones > 0 && <>{nomina.retenciones} retención{nomina.retenciones === 1 ? "" : "es"} · </>}
            {nomina.visitas > 0 && <>{nomina.visitas} visita{nomina.visitas === 1 ? "" : "s"} · </>}
            {nomina.renglones.length} gestiones en total
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {grupos.map(g => (
              <span key={g.grupo} style={{ fontSize: 11, fontWeight: 700, background: "var(--card)", border: "1px solid var(--accent-line)", borderRadius: 999, padding: "3px 9px", color: "var(--accent-ink)" }}>
                {g.grupo} pone $ {fmt(g.total)}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: "9px 12px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.45 }}>
          Al cerrar, <b>estas cifras quedan congeladas</b>: un pago que entre después ya no las mueve.
          El cierre <b>no se puede editar ni borrar</b>. Imprime el desprendible antes, para que el
          cobrador verifique renglón por renglón lo que se le está pagando.
        </div>

        {/* Firma del cobrador — la constancia de que recibió */}
        <div>
          <CanvasFirma
            label="Firma del cobrador — recibí conforme"
            modal
            onChange={setFirma}
          />
        </div>

        {/* Foto del desprendible firmado en papel */}
        <div>
          <div style={labelStyle}>Foto del desprendible firmado <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span></div>
          {foto ? (
            <div style={{ display: "grid", gap: 8 }}>
              <img src={foto} alt="Desprendible firmado" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 12, border: "1px solid var(--line)" }} />
              <button onClick={() => setFoto(null)} style={{ ...secondaryBtn, width: "100%" }}>🗑️ Quitar y tomar otra</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Android no permite cámara y galería en un solo input (convención del proyecto). */}
              <button onClick={() => inputFoto.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0 }}>📷 Cámara</button>
              <button onClick={() => inputGaleria.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0 }}>🖼 Galería</button>
              <input ref={inputFoto} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => tomarFoto(e.target.files?.[0])} />
              <input ref={inputGaleria} type="file" accept="image/*" style={{ display: "none" }} onChange={e => tomarFoto(e.target.files?.[0])} />
            </div>
          )}
        </div>

        <div>
          <div style={labelStyle}>Observación <span style={{ fontWeight: 400, color: "var(--muted)" }}>(opcional)</span></div>
          <input style={inputStyle} value={observacion} onChange={e => setObservacion(e.target.value)}
                 placeholder="Ej. se le descontó un adelanto" />
        </div>

        {error && (
          <div style={{ padding: "9px 12px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", color: "var(--bad-ink)", fontSize: 12.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} disabled={guardando} style={{ ...secondaryBtn, flex: 1, minWidth: 0 }}>Cancelar</button>
          <button onClick={confirmar} disabled={guardando}
                  style={{ ...primaryBtn, flex: 2, minWidth: 0, opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : `Cerrar y pagar $ ${fmt(nomina.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
