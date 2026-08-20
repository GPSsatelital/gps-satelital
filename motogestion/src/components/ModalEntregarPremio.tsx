import { useMemo, useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { usePremiosReferidos, repartirPremio } from "../hooks/usePremiosReferidos";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import MoneyInput from "./MoneyInput";

// Entrega de un premio del programa de referidos.
//
// Funciona igual si quien refirió NO es cliente: la llave es la cédula, no la ficha. Ese era el
// bloqueo real — JOHAN ROJAS ganó los guantes y no existía forma de entregárselos porque la marca
// vivía dentro de la ficha del cliente y él no tiene una.
//
// La foto es OBLIGATORIA: es la constancia de que el premio se entregó de verdad. Mismo criterio
// que el comprobante de las transferencias.

interface Props {
  cedulaReferidor: string;
  nombreReferidor: string;
  hito: number;
  premio: string;
  // Los referidos que generaron este premio, cada uno con el portafolio de su moto. De aquí sale
  // el reparto: el premio lo pagan los portafolios que ganaron un cliente.
  referidos: { nombre: string; grupo: string }[];
  onClose: () => void;
  onDone?: () => void;
}

export default function ModalEntregarPremio({ cedulaReferidor, nombreReferidor, hito, premio, referidos, onClose, onDone }: Props) {
  useBloquearScrollFondo();
  const { profile } = useAuth();
  const { subirFotoPremio, entregarPremio } = usePremiosReferidos();

  const [forma, setForma] = useState<"fisico" | "dinero">("fisico");
  const [valor, setValor] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const valorNum = Number(valor) || 0;
  const { reparto, costoTotal } = useMemo(
    () => repartirPremio(referidos, forma, valorNum),
    [referidos, forma, valorNum],
  );

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    if (valorNum <= 0) {
      setError(forma === "dinero"
        ? "Escribe cuánto se le paga por cada referido."
        : "Escribe cuánto costó el artículo — sin ese valor no se puede repartir entre los portafolios.");
      return;
    }
    if (!foto) { setError("Falta la foto de la entrega. Es la constancia de que el premio se entregó."); return; }

    setError(null);
    setGuardando(true);
    try {
      // La foto primero: si falla, no queda una entrega registrada sin su constancia.
      const { url, error: errFoto } = await subirFotoPremio(foto, cedulaReferidor);
      if (errFoto || !url) { setError("No se pudo subir la foto: " + (errFoto ?? "intenta de nuevo")); return; }

      const { error: errGuardar } = await entregarPremio({
        cedulaReferidor,
        nombreReferidor,
        hito,
        premio,
        forma,
        costoTotal,
        montoPorReferido: forma === "dinero" ? valorNum : null,
        reparto,
        fotoUrl: url,
        nota: nota.trim() || null,
        entregadoPor: profile.id,
      });
      if (errGuardar) { setError(errGuardar); return; }

      setExito(true);
      setTimeout(() => { onDone?.(); onClose(); }, 1300);
    } finally {
      setGuardando(false);
    }
  }

  const btnFoto = (label: string, capture?: "environment") => (
    <label style={{ ...secondaryBtn, flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
      {label}
      <input type="file" accept="image/*" {...(capture ? { capture } : {})} style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) { setFoto(f); setError(null); } }} />
    </label>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(500px, 96vw)", background: "var(--card)", borderRadius: 20, padding: 24,
        zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Entregar premio</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>
              {nombreReferidor} · C.C. {cedulaReferidor}
            </div>
            <div style={{ fontSize: 13, color: "var(--accent-ink)", fontWeight: 700, marginTop: 4 }}>
              {premio} — por {hito} referidos
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)", flexShrink: 0 }}>✕</button>
        </div>

        <div>
          <div style={labelStyle}>¿Qué se le entregó?</div>
          <div style={{ display: "grid", gap: 8 }}>
            {([
              ["fisico", "El premio físico", "Los guantes, el casco, etc. Pon cuánto costó el artículo para poder repartirlo."],
              ["dinero", "Dinero en vez del premio", "Pon cuánto se le paga por cada referido."],
            ] as [typeof forma, string, string][]).map(([val, label, sub]) => (
              <button key={val} type="button" onClick={() => setForma(val)}
                style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: forma === val ? "2px solid var(--accent)" : "1px solid var(--line2)",
                  background: forma === val ? "var(--accent-soft)" : "var(--card)",
                }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{label}</div>
                <div style={{ fontSize: 12, color: forma === val ? "var(--accent-ink)" : "var(--muted)", marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={labelStyle}>{forma === "dinero" ? "¿Cuánto se le paga por cada referido?" : "¿Cuánto costó el artículo?"}</div>
          <MoneyInput value={valor} onChange={setValor} />
        </div>

        {/* Vista previa del reparto: se muestra ANTES de confirmar para que se pueda revisar. */}
        {costoTotal > 0 && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>
              Quién paga — total {`$${costoTotal.toLocaleString("es-CO")}`}
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {reparto.map(r => (
                <div key={r.grupo} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--muted2)", minWidth: 0 }}>
                    <strong style={{ color: "var(--text)" }}>{r.grupo}</strong>
                    <span style={{ fontSize: 11.5, color: "var(--muted)" }}> · {r.referidos.join(", ")}</span>
                  </span>
                  <strong style={{ whiteSpace: "nowrap" }}>{`$${r.monto.toLocaleString("es-CO")}`}</strong>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, lineHeight: 1.45 }}>
              Cada portafolio paga por los clientes que le entraron. Al guardar puedes imprimir un recibo para cada uno.
            </div>
          </div>
        )}

        <div>
          <div style={labelStyle}>Foto de la entrega (obligatoria)</div>
          <div style={{ display: "flex", gap: 8 }}>
            {btnFoto("📷 Cámara", "environment")}
            {btnFoto("🖼 Galería")}
          </div>
          {foto
            ? <div style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 700, marginTop: 6 }}>✓ {foto.name}</div>
            : <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.45 }}>
                Es la constancia de que el premio se entregó. Sin ella no se puede guardar.
              </div>}
        </div>

        <div>
          <div style={labelStyle}>Nota (opcional)</div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 46 }} value={nota}
            onChange={e => setNota(e.target.value)} placeholder="Ej. se le entregó en la oficina" />
        </div>

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>{error}</div>}
        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✅ Premio entregado y registrado.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || exito}
            style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "Confirmar entrega"}
          </button>
        </div>
      </div>
    </>
  );
}
