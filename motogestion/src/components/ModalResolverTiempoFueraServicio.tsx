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
        style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>⏱️ Tiempo fuera de servicio</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre} · {motoPlaca}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)" }}>
          <div style={{ fontSize: 13, color: "var(--accent-ink)" }}>
            La moto estuvo <strong>{dias} día{dias !== 1 ? "s" : ""}</strong> por <strong>{motivo}</strong> ({fechaEntrada} → {fechaSalida}).
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>$ {fmt(valorTotal)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{dias} días × $ {fmt(tarifa)}/día (tarifa diaria)</div>
        </div>

        <div>
          <div style={labelStyle}>¿Cómo se resuelve?</div>
          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => setDecision("cobrar_ahora")}
              style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: decision === "cobrar_ahora" ? "2px solid var(--bad-ink)" : "1px solid var(--line)",
                background: decision === "cobrar_ahora" ? "var(--bad-soft)" : "var(--card)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bad-ink)" }}>💰 Cobrar ahora</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Se registra como deuda de $ {fmt(valorTotal)}. El contrato NO se extiende.</div>
            </button>
            <button
              onClick={() => setDecision("rodar_al_final")}
              style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: decision === "rodar_al_final" ? "2px solid var(--ok-ink)" : "1px solid var(--line)",
                background: decision === "rodar_al_final" ? "var(--ok-soft)" : "var(--card)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ok-ink)" }}>📅 Rodar al final</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>No se cobra nada. El contrato termina {dias} día{dias !== 1 ? "s" : ""} más tarde.</div>
            </button>
          </div>
        </div>

        {decision && (
          <>
            <div>
              <div style={labelStyle}>Observaciones (opcional)</div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Detalle adicional..." />
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)", marginBottom: 8 }}>
                📄 Documento firmado por el cliente (obligatorio)
              </div>
              <div style={{ fontSize: 12, color: "var(--warn-ink)", marginBottom: 10 }}>
                Debe quedar claro que el cliente entiende que su contrato {decision === "rodar_al_final" ? `termina ${dias} día(s) después de lo previsto` : `debe $${fmt(valorTotal)} adicionales`}.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13 }}>
                  📷 Cámara
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                  🖼 Galería
                  <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              {archivo && <div style={{ marginTop: 8, fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>✅ {archivo.name}</div>}
            </div>
          </>
        )}

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
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
