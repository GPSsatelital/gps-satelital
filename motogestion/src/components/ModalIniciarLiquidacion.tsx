import { useState } from "react";
import { useLiquidaciones, type MotivoLiquidacion } from "../hooks/useLiquidaciones";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

// Punto de entrada REAL al flujo de Liquidación (antes iniciarLiquidacion existía
// pero ningún botón la llamaba — código muerto). Se abre desde Contratos o desde
// Inmovilizaciones → Motos retenidas. El motivo define todo lo que pasa al cierre:
//   cumplimiento      → Paz y Salvo, moto En traspaso, cliente Egresado
//   retiro_voluntario → moto vuelve a la flota, cliente Retirado
//   incumplimiento    → contrato Cancelado, cliente Retirado

interface Props {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  motoId: string | null;
  placa: string;
  ahorroAcumulado: number;
  motivoInicial?: MotivoLiquidacion;
  onClose: () => void;
  onDone?: () => void;
}

const MOTIVOS: { value: MotivoLiquidacion; label: string; desc: string }[] = [
  { value: "cumplimiento", label: "✅ Cumplimiento de contrato", desc: "El cliente terminó su plazo — se genera Paz y Salvo y la moto pasa a ser suya." },
  { value: "retiro_voluntario", label: "🚪 Retiro voluntario", desc: "El cliente entregó la moto y no volvió en los 7 días — la moto vuelve a la flota." },
  { value: "incumplimiento", label: "❌ Incumplimiento (mora)", desc: "La moto fue recolectada por mora y el cliente no pagó en los 7 días." },
];

export default function ModalIniciarLiquidacion({ contratoId, clienteId, clienteNombre, motoId, placa, ahorroAcumulado, motivoInicial, onClose, onDone }: Props) {
  const { iniciarLiquidacion } = useLiquidaciones();
  const { profile } = useAuth();

  const [motivo, setMotivo] = useState<MotivoLiquidacion>(motivoInicial ?? "incumplimiento");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const motivoSel = MOTIVOS.find(m => m.value === motivo)!;

  async function handleIniciar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    setError(null);
    setGuardando(true);
    try {
      const { error: err } = await iniciarLiquidacion(contratoId, clienteId, motoId, motivo, profile.id, ahorroAcumulado);
      if (err) { setError(err); return; }
      setExito(true);
      setTimeout(() => { onDone?.(); onClose(); }, 1400);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(480px, 96vw)", background: "white", borderRadius: 20, padding: 24,
        zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>📄 Iniciar liquidación</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, textTransform: "uppercase" }}>
              {placa} · {clienteNombre}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>

        <div>
          <div style={labelStyle}>Motivo de la liquidación</div>
          <select style={inputStyle} value={motivo} onChange={e => setMotivo(e.target.value as MotivoLiquidacion)}>
            {MOTIVOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>{motivoSel.desc}</div>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1" }}>
          Al iniciar: las deudas pendientes y el convenio se traen automáticamente del sistema,
          {motoId ? " la moto entra a revisión de taller obligatoria (el mecánico la ve en su lista)," : ""} y el proceso
          sigue las 6 etapas hasta el documento firmado. El cálculo final del saldo y el cierre los hace ADMIN.
        </div>

        {error && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✅ Liquidación iniciada — continúa en el módulo Liquidaciones.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleIniciar} disabled={guardando || exito} style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Iniciando..." : "Iniciar liquidación"}
          </button>
        </div>
      </div>
    </>
  );
}
