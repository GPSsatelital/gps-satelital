import { useState } from "react";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { usePrestamos } from "../hooks/usePrestamos";
import { useAuth } from "../contexts/AuthContext";
import { card, secondaryBtn, primaryBtn } from "../styles/shared";

// TEMA B F2: elegir una moto del pool para prestar como reemplazo a un cliente cuya moto
// está varada en taller. Muestra tipo (diario/tiempo definido) + estado (mora/incapacidad/
// disponible) para prestar primero las seguras (disponibles o de mora) y no comprometer la
// de un cliente de tiempo definido que la querrá exacta de vuelta.
interface Props {
  contratoId: string;      // contrato del que pide (su moto está en taller)
  motoOriginalId: string | null; // la suya, varada
  clienteNombre: string;
  placaOriginal: string;
  onClose: () => void;
  onDone?: () => void;
}

export default function ModalPrestarReemplazo({ contratoId, motoOriginalId, clienteNombre, placaOriginal, onClose, onDone }: Props) {
  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { prestarReemplazo, prestamoActivoDeMoto } = usePrestamos();
  const { profile } = useAuth();
  const [sel, setSel] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busq, setBusq] = useState("");

  // Pool: motos Disponibles o Recuperadas (guardadas), que no estén ya prestadas.
  const pool = motos
    .filter(m => (m.estado === "Disponible" || m.estado === "Recuperada") && m.id !== motoOriginalId && !prestamoActivoDeMoto(m.id))
    .map(m => {
      const contSusp = contratos.find(c => c.moto_id === m.id && c.estado === "Suspendido");
      const cat = m.estado === "Disponible"
        ? { label: "Disponible", color: "#166534", bg: "#dcfce7" }
        : contSusp?.motivo_suspension === "temporal"
          ? { label: "Incapacidad", color: "#0369a1", bg: "#e0f2fe" }
          : { label: "Mora", color: "#991b1b", bg: "#fee2e2" };
      const tipo = contSusp ? (contSusp.forma_pago === "Diario" ? "Diario" : "Tiempo definido") : "—";
      // Seguridad de préstamo: disponible/mora = seguro; incapacidad tiempo-definido = riesgo (la querrá exacta).
      const seguro = m.estado === "Disponible" || contSusp?.motivo_suspension !== "temporal";
      return { m, cat, tipo, seguro };
    })
    .filter(x => !busq.trim() || x.m.placa.toLowerCase().includes(busq.toLowerCase()))
    .sort((a, b) => Number(b.seguro) - Number(a.seguro)); // seguras primero

  async function handlePrestar() {
    if (guardando || !sel || !profile) return;
    if (!confirm(`¿Prestar la moto ${motos.find(m => m.id === sel)?.placa} a ${clienteNombre} mientras su moto ${placaOriginal} está en taller?`)) return;
    setGuardando(true); setError(null);
    try {
      const { error } = await prestarReemplazo(contratoId, sel, motoOriginalId, profile.id);
      if (error) { setError(error); return; }
      onDone?.(); onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{ ...card, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(500px,96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto", zIndex: 401, display: "grid", gap: 12, boxSizing: "border-box" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>🔄 Prestar moto de reemplazo</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, textTransform: "uppercase" }}>{clienteNombre} · su moto {placaOriginal} en taller</div>
        </div>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Elige una moto del pool. Presta primero las <strong>disponibles</strong> o de <strong>mora</strong>; evita las de incapacidad de tiempo definido (el dueño las querrá exactas de vuelta).
        </div>
        <input value={busq} onChange={e => setBusq(e.target.value)} placeholder="Buscar placa..." style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />

        <div style={{ display: "grid", gap: 6, maxHeight: "44vh", overflowY: "auto" }}>
          {pool.length === 0 && <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: 16 }}>No hay motos disponibles para prestar.</div>}
          {pool.map(({ m, cat, tipo, seguro }) => (
            <button key={m.id} onClick={() => setSel(m.id)} style={{
              textAlign: "left", border: `2px solid ${sel === m.id ? "#0284c7" : "#e2e8f0"}`, borderRadius: 12, padding: "10px 12px",
              background: sel === m.id ? "#eff6ff" : "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
            }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 900, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{m.placa}</span>
                <span style={{ fontSize: 12, color: "#64748b", marginLeft: 6 }}>{m.marca} {m.modelo} · {m.grupo}</span>
                <span style={{ display: "block", fontSize: 11, color: "#64748b", marginTop: 2 }}>{tipo !== "—" ? tipo : "Sin contrato"}</span>
              </span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: cat.bg, color: cat.color }}>{cat.label}</span>
                {!seguro && <span style={{ fontSize: 10, fontWeight: 700, color: "#b45309" }}>⚠️ la querrá de vuelta</span>}
              </span>
            </button>
          ))}
        </div>

        {error && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handlePrestar} disabled={!sel || guardando} style={{ ...primaryBtn, flex: 2, opacity: (!sel || guardando) ? 0.6 : 1 }}>
            {guardando ? "Prestando..." : "🔄 Prestar esta moto"}
          </button>
        </div>
      </div>
    </>
  );
}
