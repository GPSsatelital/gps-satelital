import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MoneyInput from "./MoneyInput";

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

export default function ModalConvenio({ contratoId, clienteNombre, onClose }: Props) {
  const [motivo, setMotivo] = useState("");
  const [cuota, setCuota] = useState("");
  const [cuotas, setCuotas] = useState("");
  const [primerPago, setPrimerPago] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [totalConvenios, setTotalConvenios] = useState<number | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase
        .from("convenios")
        .select("id")
        .eq("contrato_id", contratoId)
        .neq("estado", "renovado");
      setTotalConvenios((data ?? []).length);
      setVerificando(false);
    }
    verificar();
  }, [contratoId]);

  const totalCalculado = cuota && cuotas ? Number(cuota) * Number(cuotas) : 0;

  async function handleGuardar() {
    if (!motivo.trim()) { setError("Escribe el motivo del convenio."); return; }
    if (!cuota || Number(cuota) <= 0) { setError("Ingresa una cuota adicional válida."); return; }
    if (!cuotas || Number(cuotas) <= 0) { setError("Ingresa el número de cuotas."); return; }
    if (!primerPago) { setError("Selecciona la fecha del primer pago."); return; }
    if (totalConvenios !== null && totalConvenios >= 3) { setError("Este contrato ya tiene 3 convenios (máximo permitido)."); return; }

    setError(null);
    setGuardando(true);

    const { data: existente } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .eq("estado", "activo")
      .single();

    if (existente) {
      setError("Ya existe un convenio activo para este contrato.");
      setGuardando(false);
      return;
    }

    const { data: countData } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .neq("estado", "renovado");

    const count = (countData ?? []).length;

    const { error: err } = await supabase.from("convenios").insert({
      contrato_id: contratoId,
      motivo: motivo.trim(),
      cuota_convenio: Number(cuota),
      total_convenio: totalCalculado,
      cuotas_totales: Number(cuotas),
      cuotas_pagadas: 0,
      fecha_inicio: primerPago,
      estado: "activo",
      numero_convenio: count + 1,
      deuda_total: totalCalculado,
      cuota_por_periodo: Number(cuota),
      numero_cuotas: Number(cuotas),
      fecha_limite: primerPago,
      concepto: motivo.trim(),
      aprobado_por: null,
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
        style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 20, padding: 24, display: "grid", gap: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>🤝 Nuevo convenio</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 13, color: "#92400e", fontWeight: 600 }}>
          ⚠️ El convenio se paga ENCIMA del pago normal. No reemplaza la cuota.
        </div>

        {verificando ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>Verificando convenios existentes...</div>
        ) : totalConvenios !== null && totalConvenios >= 3 ? (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 14, color: "#991b1b", fontWeight: 700 }}>
            Este contrato ya tiene 3 convenios (máximo permitido). No se pueden crear más.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Convenios usados: <strong>{totalConvenios} / 3</strong>
            </div>

            <div>
              <div style={labelStyle}>Motivo del convenio</div>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Describe el motivo del convenio..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <MoneyInput label="Cuota adicional" value={cuota} onChange={setCuota} placeholder="$ 10.000" />
              <div>
                <div style={labelStyle}>Número de cuotas</div>
                <input
                  type="number"
                  style={inputStyle}
                  value={cuotas}
                  onChange={e => setCuotas(e.target.value)}
                  placeholder="Ej. 4"
                />
              </div>
            </div>

            {totalCalculado > 0 && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "#dbeafe", border: "1px solid #bfdbfe", fontSize: 14, fontWeight: 700, color: "#1d4ed8" }}>
                Total a pagar: $ {Math.round(totalCalculado).toLocaleString("es-CO")}
              </div>
            )}

            <div>
              <div style={labelStyle}>Fecha del primer pago</div>
              <input
                type="date"
                style={inputStyle}
                value={primerPago}
                onChange={e => setPrimerPago(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>
            )}

            {exito && (
              <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                Convenio creado correctamente.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ background: "#f1f5f9", color: "#334155", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando || exito}
                style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: guardando ? 0.7 : 1 }}
              >
                {guardando ? "Guardando..." : "Crear convenio"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
