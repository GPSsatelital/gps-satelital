import { useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useBackGuard } from "../contexts/BackNav";
import { primaryBtn, secondaryBtn, labelStyle } from "../styles/shared";
import { hoyMasDias } from "../utils/fecha";

const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");
const fmtDia = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

interface Props {
  placa: string;
  clienteNombre: string;
  /** Lo que se lleva debiendo: deudas viejas + cuotas atrasadas (la multa NUNCA entra acá). */
  debe: number;
  autorizaNombre: string;
  onGuardar: (opts: { dias: number; motivo: string; fechaLimite: string }) => Promise<{ error: string | null }>;
  onClose: () => void;
}

/**
 * DAR PLAZO para entregar una moto retenida (excepción del dueño, 2-sep-2026).
 *
 * El caso real: ERICK (DQG87I) estaba al día con sus semanas y ya había pagado la multa, pero
 * arrastraba $99.000 de deuda de apertura del empalme. La regla exige convenio para soltar la
 * moto — y quemarle uno de sus 3 convenios por una deuda que paga en dos días es caro (el 3º
 * incumplido obliga a liquidar).
 *
 * Por qué no un botón que simplemente salte el candado: esto registra una gestión `plazo_extra`,
 * la MISMA que frena una recolección. Gratis viene todo lo demás — la campana avisa cuando vence,
 * queda en la línea de tiempo del cliente con su motivo y quién lo autorizó, y Cartera no lo manda
 * a recolectar mientras el plazo esté vigente.
 *
 * La MULTA no se toca: quien abre esta ventana ya la tiene paga (mismo candado que el convenio).
 */
export default function ModalPlazoEntrega({ placa, clienteNombre, debe, autorizaNombre, onGuardar, onClose }: Props) {
  const [dias, setDias] = useState(2);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useBloquearScrollFondo();
  useBackGuard(true, onClose);

  const fechaLimite = hoyMasDias(dias);

  async function confirmar() {
    if (guardando) return;
    if (motivo.trim().length < 10) {
      setError("Escribe el motivo. Es lo que explica, dentro de un mes, por qué se soltó esta moto debiendo.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const { error: e } = await onGuardar({ dias, motivo: motivo.trim(), fechaLimite });
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
        style={{ width: "100%", maxWidth: 440, maxHeight: "92vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 22, display: "grid", gap: 14, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>⏳ Dar plazo para entregar la moto</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre} · {placa}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 14, background: "var(--bad-soft)", border: "1px solid var(--bad-line)" }}>
          <div style={{ fontSize: 12.5, color: "var(--bad-ink)" }}>Se lleva la moto debiendo</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--bad-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>$ {fmt(debe)}</div>
          <div style={{ fontSize: 11.5, color: "var(--bad-ink)", marginTop: 3 }}>
            Esta deuda <b>no se perdona ni se mueve</b> — solo se le da tiempo.
          </div>
        </div>

        <div>
          <div style={labelStyle}>¿Cuántos días?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2].map(d => (
              <button key={d} onClick={() => setDias(d)}
                style={{
                  flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700,
                  border: dias === d ? "2px solid var(--accent-ink)" : "1px solid var(--line)",
                  background: dias === d ? "var(--accent-soft2)" : "var(--card)",
                  color: dias === d ? "var(--accent-ink)" : "var(--text)",
                }}>
                {d} día{d === 1 ? "" : "s"}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>
            Se vence el <b style={{ color: "var(--text)" }}>{fmtDia(fechaLimite)}</b>. Ese día la campana te avisa si no ha pagado.
          </div>
        </div>

        <div>
          <div style={labelStyle}>Motivo <span style={{ fontWeight: 400, color: "var(--bad-ink)" }}>(obligatorio)</span></div>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ej. Está al día con sus semanas y ya pagó la multa; queda la deuda vieja del empalme y se compromete a cancelarla el jueves."
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", fontSize: 13.5, fontFamily: "inherit", resize: "vertical" }}
          />
        </div>

        <div style={{ padding: "9px 12px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.45 }}>
          Queda registrado que <b style={{ textTransform: "uppercase" }}>{autorizaNombre}</b> autorizó soltar esta moto
          debiendo. Aparece en la línea de tiempo del cliente y en la campana el día que se vence.
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
            {guardando ? "Guardando..." : "Dar el plazo"}
          </button>
        </div>
      </div>
    </div>
  );
}
