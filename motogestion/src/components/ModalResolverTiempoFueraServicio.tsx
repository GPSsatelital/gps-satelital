import { useState } from "react";
import type { Contrato } from "../hooks/useContratos";
import { useContratos, calcularFechaFinContrato } from "../hooks/useContratos";
import { useDeudas } from "../hooks/useDeudas";
import { useUbicaciones, type DecisionTiempo } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

interface Props {
  contrato: Contrato;
  clienteNombre: string;
  motoPlaca: string;
  motivo: string; // "Taller" | "Fiscalía" | "Tránsito" | "Garantía"
  fechaEntrada: string;
  fechaSalida: string;
  onClose: () => void;
}

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

export default function ModalResolverTiempoFueraServicio({ contrato, clienteNombre, motoPlaca, motivo, fechaEntrada, fechaSalida, onClose }: Props) {
  const { profile } = useAuth();
  const { editarContrato } = useContratos();
  const { registrarDeuda } = useDeudas();
  const { crearAcuerdoTiempo, subirDocumentoAcuerdo } = useUbicaciones();

  const dias = Math.max(1, Math.round((new Date(fechaSalida + "T00:00:00").getTime() - new Date(fechaEntrada + "T00:00:00").getTime()) / 86400000));
  const tarifa = contrato.tarifa_diaria ?? 27000;
  const valorTotal = dias * tarifa;

  const [decision, setDecision] = useState<DecisionTiempo | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function handleConfirmar() {
    if (guardando || !profile || !decision) return;
    if (!archivo) { setError("Sube el documento firmado por el cliente antes de continuar."); return; }
    setError(null);
    setGuardando(true);
    try {
      // Fecha base real del contrato hoy (guardada o calculada) + los días fuera de servicio
      const baseActual = contrato.fecha_fin_contrato
        ?? (contrato.fecha_entrega && contrato.meses ? calcularFechaFinContrato(contrato.fecha_entrega, contrato.meses) : fechaSalida);
      const fechaFinExtendida = (() => {
        const d = new Date(baseActual + "T00:00:00");
        d.setDate(d.getDate() + dias);
        return d.toISOString().slice(0, 10);
      })();

      const { error: errAcuerdo, id: acuerdoId } = await crearAcuerdoTiempo({
        contrato_id: contrato.id,
        cliente_id: contrato.cliente_id,
        moto_id: contrato.moto_id!,
        dias_en_empresa: dias,
        valor_por_dia: tarifa,
        decision,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        nueva_fecha_fin_contrato: decision === "rodar_al_final" ? fechaFinExtendida : undefined,
        observaciones: `${motivo}${observaciones ? " — " + observaciones : ""}`,
        creado_por: profile.id,
      });
      if (errAcuerdo) { setError(errAcuerdo); return; }
      if (acuerdoId) await subirDocumentoAcuerdo(acuerdoId, archivo);

      if (decision === "cobrar_ahora") {
        await registrarDeuda(contrato.id, "tarifa_atrasada", `${motivo} — ${dias} días sin producir (${fechaEntrada} a ${fechaSalida})`, valorTotal, profile.id);
      } else {
        await editarContrato(contrato, { fecha_fin_contrato: fechaFinExtendida }, profile.id);
      }

      setExito(true);
      setTimeout(() => onClose(), 1500);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 400 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: 20, padding: 24, display: "grid", gap: 16, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>⏱️ Tiempo fuera de servicio</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre} · {motoPlaca}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 12, background: "#eff6ff", border: "1px solid #bae6fd" }}>
          <div style={{ fontSize: 13, color: "#0369a1" }}>
            La moto estuvo <strong>{dias} día{dias !== 1 ? "s" : ""}</strong> por <strong>{motivo}</strong> ({fechaEntrada} → {fechaSalida}).
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0284c7", marginTop: 4 }}>$ {fmt(valorTotal)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{dias} días × $ {fmt(tarifa)}/día (tarifa diaria)</div>
        </div>

        <div>
          <div style={labelStyle}>¿Cómo se resuelve?</div>
          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => setDecision("cobrar_ahora")}
              style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: decision === "cobrar_ahora" ? "2px solid #991b1b" : "1px solid #e2e8f0",
                background: decision === "cobrar_ahora" ? "#fee2e2" : "white",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "#991b1b" }}>💰 Cobrar ahora</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Se registra como deuda de $ {fmt(valorTotal)}. El contrato NO se extiende.</div>
            </button>
            <button
              onClick={() => setDecision("rodar_al_final")}
              style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: decision === "rodar_al_final" ? "2px solid #166534" : "1px solid #e2e8f0",
                background: decision === "rodar_al_final" ? "#dcfce7" : "white",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>📅 Rodar al final</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>No se cobra nada. El contrato termina {dias} día{dias !== 1 ? "s" : ""} más tarde.</div>
            </button>
          </div>
        </div>

        {decision && (
          <>
            <div>
              <div style={labelStyle}>Observaciones (opcional)</div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Detalle adicional..." />
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>
                📄 Documento firmado por el cliente (obligatorio)
              </div>
              <div style={{ fontSize: 12, color: "#92400e", marginBottom: 10 }}>
                Debe quedar claro que el cliente entiende que su contrato {decision === "rodar_al_final" ? `termina ${dias} día(s) después de lo previsto` : `debe $${fmt(valorTotal)} adicionales`}.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#0284c7", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  📷 Cámara
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 13 }}>
                  🖼 Galería
                  <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              {archivo && <div style={{ marginTop: 8, fontSize: 12, color: "#166534", fontWeight: 700 }}>✅ {archivo.name}</div>}
            </div>
          </>
        )}

        {error && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            Registrado correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...secondaryBtn, padding: "10px 18px", fontSize: 14 }}>
            {decision ? "Cancelar" : "Resolver después"}
          </button>
          {decision && (
            <button
              onClick={handleConfirmar}
              disabled={guardando || exito || !archivo}
              style={{ ...primaryBtn, padding: "10px 18px", fontSize: 14, opacity: guardando || exito || !archivo ? 0.6 : 1 }}
            >
              {guardando ? "Guardando..." : "Confirmar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
