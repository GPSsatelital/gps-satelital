import { useState } from "react";
import { supabase } from "../lib/supabase";
import MoneyInput from "./MoneyInput";

type TipoDeuda = "daño_vehiculo" | "prestamo_repuesto" | "prestamo_eventualidad" | "fotomulta" | "tarifa_atrasada";

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

const TIPOS: { value: TipoDeuda; label: string }[] = [
  { value: "daño_vehiculo", label: "🔧 Daño al vehículo" },
  { value: "prestamo_repuesto", label: "🔩 Préstamo de repuesto" },
  { value: "prestamo_eventualidad", label: "💸 Préstamo por eventualidad" },
  { value: "fotomulta", label: "📸 Fotomulta" },
  { value: "tarifa_atrasada", label: "📅 Tarifa atrasada" },
];

export default function ModalDeuda({ contratoId, clienteNombre, onClose }: Props) {
  const [tipo, setTipo] = useState<TipoDeuda>("daño_vehiculo");
  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function handleGuardar() {
    if (!valor || Number(valor) <= 0) {
      setError("Ingresa un valor válido.");
      return;
    }
    setError(null);
    setGuardando(true);
    const { error: err } = await supabase.from("deudas").insert({
      contrato_id: contratoId,
      concepto: tipo,
      descripcion: descripcion.trim() || null,
      monto: Number(valor),
      monto_pendiente: Number(valor),
      estado: "pendiente",
      registrado_por: null,
    });
    setGuardando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setExito(true);
    setTimeout(() => onClose(), 1500);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 20, padding: 24, display: "grid", gap: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>📋 Nueva deuda</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 13, color: "#92400e", fontWeight: 600 }}>
          ⚠️ Esta deuda requiere autorización del administrador. Se registrará como pendiente.
        </div>

        <div>
          <div style={labelStyle}>Tipo de deuda</div>
          <select style={inputStyle} value={tipo} onChange={e => setTipo(e.target.value as TipoDeuda)}>
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <MoneyInput label="Valor" value={valor} onChange={setValor} />

        <div>
          <div style={labelStyle}>Descripción (opcional)</div>
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalle adicional..."
          />
        </div>

        {error && (
          <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>
        )}

        {exito && (
          <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            Deuda registrada correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || exito}
            style={{ background: "#fef3c7", color: "#92400e", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: guardando ? 0.7 : 1 }}
          >
            {guardando ? "Guardando..." : "Registrar deuda"}
          </button>
        </div>
      </div>
    </div>
  );
}
