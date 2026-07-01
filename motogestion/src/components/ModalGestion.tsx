import { useState } from "react";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  contratoId: string;
  clienteNombre: string;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

type ResultadoGestion = "Contactado" | "No contestó" | "Promesa de pago" | "Sin acuerdo" | "Ejecutado" | "No aplica";

const TIPOS: Array<{ value: TipoGestion; label: string }> = [
  { value: "llamada",       label: "📞 Llamada telefónica" },
  { value: "whatsapp",      label: "💬 Mensaje WhatsApp" },
  { value: "sirena",        label: "🚨 Sirena remota" },
  { value: "cobro_campo",   label: "🛵 Visita en campo" },
  { value: "plazo_extra",   label: "⏳ Plazo extra" },
  { value: "recoleccion",   label: "🔧 Recolección" },
  { value: "otro",          label: "🤝 Convenio de pago" },
];

const RESULTADOS: ResultadoGestion[] = [
  "Contactado",
  "No contestó",
  "Promesa de pago",
  "Sin acuerdo",
  "Ejecutado",
  "No aplica",
];

export default function ModalGestion({ contratoId, clienteNombre, onClose }: Props) {
  const { registrarGestion } = useGestiones();
  const { profile } = useAuth();
  const puedeDarPlazoExtra = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL" || profile?.role === "SUBADMIN";
  const tiposDisponibles = puedeDarPlazoExtra ? TIPOS : TIPOS.filter(t => t.value !== "plazo_extra");

  const [tipo, setTipo] = useState<TipoGestion>("llamada");
  const [resultado, setResultado] = useState<ResultadoGestion>("Contactado");
  const [observacion, setObservacion] = useState("");
  const [diasPlazo, setDiasPlazo] = useState("");
  const [motivoPlazo, setMotivoPlazo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (saving) return;
    if (!profile) { setError("Sesión no válida."); return; }
    let extras: { plazo_extra_dias?: number; plazo_extra_motivo?: string; plazo_extra_fecha_limite?: string } | undefined;
    if (tipo === "plazo_extra") {
      const dias = Number(diasPlazo);
      if (!diasPlazo || dias < 1 || dias > 2) {
        setError("El plazo extra es máximo 2 días. Ingresa 1 o 2.");
        return;
      }
      if (!motivoPlazo.trim()) {
        setError("El motivo del plazo extra es obligatorio.");
        return;
      }
      const limite = new Date();
      limite.setDate(limite.getDate() + dias);
      extras = {
        plazo_extra_dias: dias,
        plazo_extra_motivo: motivoPlazo.trim(),
        plazo_extra_fecha_limite: limite.toISOString().slice(0, 10),
      };
    }
    setError(null);
    setSaving(true);
    try {
      const { error: err } = await registrarGestion(contratoId, tipo, resultado, profile.id, extras);
      if (err) { setError(err); return; }
      setExito(true);
      setTimeout(() => onClose(), 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.55)",
          zIndex: 400,
        }}
      />

      {/* Card */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, 96vw)",
        background: "white",
        borderRadius: 20,
        padding: 28,
        zIndex: 401,
        boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
        display: "grid",
        gap: 18,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>📋 Registrar gestión</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, textTransform: "uppercase" }}>
              {clienteNombre}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", borderRadius: 999,
              width: 34, height: 34, cursor: "pointer", fontSize: 16,
              color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tipo */}
        <div>
          <div style={labelStyle}>Tipo de gestión</div>
          <select
            style={inputStyle}
            value={tipo}
            onChange={e => { setTipo(e.target.value as TipoGestion); setError(null); }}
          >
            {tiposDisponibles.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Días plazo — solo si plazo_extra */}
        {tipo === "plazo_extra" && (
          <>
            <div>
              <div style={labelStyle}>¿Cuántos días adicionales? (máx. 2)</div>
              <input
                type="number"
                min={1}
                max={2}
                style={inputStyle}
                value={diasPlazo}
                onChange={e => setDiasPlazo(e.target.value)}
                placeholder="1 o 2"
              />
            </div>
            <div>
              <div style={labelStyle}>Motivo del plazo extra (obligatorio)</div>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
                value={motivoPlazo}
                onChange={e => setMotivoPlazo(e.target.value)}
                placeholder="¿Por qué se le da esta chance al cliente?"
              />
            </div>
          </>
        )}

        {/* Resultado */}
        <div>
          <div style={labelStyle}>Resultado</div>
          <select
            style={inputStyle}
            value={resultado}
            onChange={e => setResultado(e.target.value as ResultadoGestion)}
          >
            {RESULTADOS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Observación */}
        <div>
          <div style={labelStyle}>Observación (opcional)</div>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
            value={observacion}
            onChange={e => setObservacion(e.target.value)}
            placeholder="Detalles de la gestión..."
          />
        </div>

        {error && (
          <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}
        {exito && (
          <div style={{
            color: "#166534", background: "#dcfce7",
            padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14,
          }}>
            ✅ Gestión registrada correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", borderRadius: 14, border: "none",
              background: "#f1f5f9", color: "#334155", fontWeight: 600,
              cursor: "pointer", fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 2, padding: "12px", borderRadius: 14, border: "none",
              background: saving ? "#94a3b8" : "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
              color: "white", fontWeight: 700, cursor: saving ? "default" : "pointer", fontSize: 14,
            }}
          >
            {saving ? "Registrando..." : "Registrar gestión"}
          </button>
        </div>
      </div>
    </>
  );
}
