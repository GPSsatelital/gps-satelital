import { useEffect, useState } from "react";
import type { Contrato, FormaPago } from "../hooks/useContratos";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

interface Props {
  contrato: Contrato;
  clienteNombre: string;
  onClose: () => void;
}

type AuditoriaFila = {
  id: string;
  campo: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  created_at: string;
  profiles?: { nombre?: string } | null;
};

const FORMAS: FormaPago[] = ["Diario", "Semanal", "Quincenal", "Mensual"];

export default function ModalEditarContrato({ contrato, clienteNombre, onClose }: Props) {
  const { profile } = useAuth();
  const { editarContrato, obtenerAuditoria } = useContratos();

  const [formaPago, setFormaPago] = useState<FormaPago>(contrato.forma_pago);
  const [diaPago, setDiaPago] = useState(contrato.dia_pago === "Diario" ? "Lunes" : contrato.dia_pago);
  const [valorSemanal, setValorSemanal] = useState(String(contrato.valor_semanal ?? 0));
  const [tarifaDiaria, setTarifaDiaria] = useState(String(contrato.tarifa_diaria ?? 27000));
  const [tarifaDomingo, setTarifaDomingo] = useState(String(contrato.tarifa_domingo ?? 14000));
  const [ahorroDiario, setAhorroDiario] = useState(String(contrato.ahorro_diario ?? 4000));
  const [ahorroDomingo, setAhorroDomingo] = useState(String(contrato.ahorro_domingo ?? 2000));
  const [meses, setMeses] = useState(String(contrato.meses ?? 24));
  const [ahorroInicial, setAhorroInicial] = useState(String(contrato.ahorro_inicial ?? 0));
  const [fechaEntrega, setFechaEntrega] = useState(contrato.fecha_entrega ?? "");
  const [ahorroAcumulado, setAhorroAcumulado] = useState(String(contrato.ahorro_acumulado ?? 0));

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [auditoria, setAuditoria] = useState<AuditoriaFila[]>([]);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await obtenerAuditoria(contrato.id);
      if (!cancelado) {
        setAuditoria(data as AuditoriaFila[]);
        setCargandoAuditoria(false);
      }
    })();
    return () => { cancelado = true; };
  }, [contrato.id]);

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) return;
    setError(null);
    setGuardando(true);
    try {
      const esDiario = formaPago === "Diario";
      const { error: err } = await editarContrato(
        contrato,
        {
          forma_pago: formaPago,
          dia_pago: esDiario ? "Diario" : diaPago,
          valor_semanal: Number(valorSemanal) || 0,
          tarifa_diaria: Number(tarifaDiaria) || 0,
          tarifa_domingo: Number(tarifaDomingo) || 0,
          ahorro_diario: Number(ahorroDiario) || 0,
          ahorro_domingo: Number(ahorroDomingo) || 0,
          meses: esDiario ? null : Number(meses) || 0,
          ahorro_inicial: Number(ahorroInicial) || 0,
          fecha_entrega: fechaEntrega || null,
          ahorro_acumulado: Number(ahorroAcumulado) || 0,
        },
        profile.id,
      );
      if (err) {
        setError(err);
        return;
      }
      setExito(true);
      setTimeout(() => onClose(), 1200);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: 20, padding: 24, display: "grid", gap: 16, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>✏️ Editar contrato</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Modalidad</div>
            <select style={inputStyle} value={formaPago} onChange={e => setFormaPago(e.target.value as FormaPago)}>
              {FORMAS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {formaPago !== "Diario" && (
            <div>
              <div style={labelStyle}>Día de pago</div>
              <select style={inputStyle} value={diaPago} onChange={e => setDiaPago(e.target.value)}>
                <option value="Lunes">Lunes</option>
                <option value="Miércoles">Miércoles</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Valor por período ($)</div>
            <input type="number" style={inputStyle} value={valorSemanal} onChange={e => setValorSemanal(e.target.value)} />
          </div>
          {formaPago !== "Diario" && (
            <div>
              <div style={labelStyle}>Meses</div>
              <input type="number" style={inputStyle} value={meses} onChange={e => setMeses(e.target.value)} />
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Tarifa L-S ($/día)</div>
            <input type="number" style={inputStyle} value={tarifaDiaria} onChange={e => setTarifaDiaria(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Tarifa domingo ($/día)</div>
            <input type="number" style={inputStyle} value={tarifaDomingo} onChange={e => setTarifaDomingo(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Ahorro L-S ($/día)</div>
            <input type="number" style={inputStyle} value={ahorroDiario} onChange={e => setAhorroDiario(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Ahorro domingo ($/día)</div>
            <input type="number" style={inputStyle} value={ahorroDomingo} onChange={e => setAhorroDomingo(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Ahorro inicial ($)</div>
            <input type="number" style={inputStyle} value={ahorroInicial} onChange={e => setAhorroInicial(e.target.value)} />
          </div>
          <div>
            <div style={labelStyle}>Ahorro acumulado ($)</div>
            <input type="number" style={inputStyle} value={ahorroAcumulado} onChange={e => setAhorroAcumulado(e.target.value)} />
          </div>
        </div>

        <div>
          <div style={labelStyle}>Fecha de entrega</div>
          <input type="date" style={inputStyle} value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
        </div>

        {error && (
          <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>
        )}

        {exito && (
          <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            Contrato actualizado correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...secondaryBtn, padding: "10px 18px", fontSize: 14 }}>
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || exito}
            style={{ ...primaryBtn, padding: "10px 18px", fontSize: 14, opacity: guardando || exito ? 0.6 : 1 }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>🕓 Historial de cambios</div>
          {cargandoAuditoria ? (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Cargando...</div>
          ) : auditoria.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Sin ediciones registradas todavía.</div>
          ) : (
            <div style={{ display: "grid", gap: 8, maxHeight: 180, overflowY: "auto" }}>
              {auditoria.map(a => (
                <div key={a.id} style={{ fontSize: 12, background: "#f8fafc", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{a.campo}</div>
                  <div style={{ color: "#64748b" }}>
                    {a.valor_anterior || "—"} → <span style={{ color: "#0f172a", fontWeight: 600 }}>{a.valor_nuevo || "—"}</span>
                  </div>
                  <div style={{ color: "#94a3b8", marginTop: 2 }}>
                    {(a.profiles?.nombre ?? "").toUpperCase() || "—"} · {new Date(a.created_at).toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
