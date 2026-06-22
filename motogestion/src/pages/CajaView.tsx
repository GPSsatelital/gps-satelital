import { useMemo, useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

export default function CajaView() {
  const hoyDefault = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoyDefault);
  const [busqueda, setBusqueda] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const { pagos, confirmarPago } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const isMobile = window.innerWidth < 900;

  const pagosDia = useMemo(() =>
    pagos.filter(p => p.fecha === fecha).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [pagos, fecha]
  );

  const pagosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return pagosDia;
    const q = busqueda.toLowerCase();
    return pagosDia.filter(p => {
      const c = contratos.find(ct => ct.id === p.contrato_id);
      const cl = clientes.find(cl => cl.id === c?.cliente_id);
      const m = motos.find(m => m.id === c?.moto_id);
      return cl?.nombre?.toLowerCase().includes(q) || m?.placa?.toLowerCase().includes(q);
    });
  }, [pagosDia, busqueda, contratos, clientes, motos]);

  const resumen = useMemo(() => {
    const conf = pagosDia.filter(p => p.estado === "Confirmado");
    const efectivo = conf.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
    const transfer = conf.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
    const pend = pagosDia.filter(p => p.estado === "Pendiente");
    return { efectivo, transfer, total: efectivo + transfer, pendientes: pend.length, totalPendiente: pend.reduce((s, p) => s + p.valor, 0) };
  }, [pagosDia]);

  async function handleConfirmar(id: string) {
    setConfirmando(id);
    await confirmarPago(id);
    setConfirmando(null);
  }

  function getInfo(contratoId: string) {
    const c = contratos.find(ct => ct.id === contratoId);
    const cl = clientes.find(cl => cl.id === c?.cliente_id);
    const m = motos.find(m => m.id === c?.moto_id);
    return { nombre: cl?.nombre ?? "—", placa: m?.placa ?? "—" };
  }

  const diasLabel = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const mesesLabel = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const fechaObj = new Date(fecha + "T00:00:00");
  const fechaDisplay = `${diasLabel[fechaObj.getDay()]} ${fechaObj.getDate()} de ${mesesLabel[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;

  const resumenPanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: "#dcfce7", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>💵 Efectivo confirmado</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#166534", marginTop: 4 }}>${fmt(resumen.efectivo)}</div>
      </div>
      <div style={{ background: "#dbeafe", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>🏦 Transferencias confirmadas</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#1d4ed8", marginTop: 4 }}>${fmt(resumen.transfer)}</div>
      </div>
      <div style={{ background: "#0f172a", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>📊 Total del día</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginTop: 4 }}>${fmt(resumen.total)}</div>
      </div>
      {resumen.pendientes > 0 && (
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>⏳ Por confirmar</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#92400e", marginTop: 4 }}>${fmt(resumen.totalPendiente)}</div>
          <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>{resumen.pendientes} pago{resumen.pendientes > 1 ? "s" : ""} pendientes</div>
        </div>
      )}
      <button disabled style={{ padding: 12, borderRadius: 12, border: "1px dashed #cbd5e1", background: "white", color: "#94a3b8", fontSize: 13, fontWeight: 700, cursor: "not-allowed" }}>
        🔒 Cerrar caja — próximamente
      </button>
    </div>
  );

  const movimientosList = (
    <div>
      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar cliente o placa..."
        style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12 }} />
      {pagosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 16 }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ fontWeight: 700, marginTop: 10, color: "#334155" }}>Sin movimientos para esta fecha</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagosFiltrados.map(p => {
            const { nombre, placa } = getInfo(p.contrato_id);
            const isPend = p.estado === "Pendiente";
            const isRech = p.estado === "Rechazado";
            const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
            return (
              <div key={p.id} style={{
                background: isPend ? "#fffbeb" : "white",
                border: isPend ? "1px solid #fde68a" : "1px solid #f1f5f9",
                borderRadius: 12, padding: "12px 14px",
                opacity: isRech ? 0.5 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", minWidth: 36, flexShrink: 0 }}>{hora}</div>
                    <span style={{
                      padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe",
                      color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8",
                    }}>
                      {p.metodo === "Efectivo" ? "💵 Efectivo" : "🏦 Transfer."}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {placa} · {nombre}
                      </div>
                      {isPend && <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600, marginTop: 2 }}>⏳ Pendiente confirmación</div>}
                      {isRech && <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 600, marginTop: 2 }}>❌ Rechazado</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: isRech ? "#94a3b8" : "#0f172a", textDecoration: isRech ? "line-through" : "none" }}>
                      ${fmt(p.valor)}
                    </div>
                    {isPend && (
                      <button onClick={() => handleConfirmar(p.id)} disabled={confirmando === p.id}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#166534", color: "white", opacity: confirmando === p.id ? 0.7 : 1 }}>
                        {confirmando === p.id ? "..." : "✅ Confirmar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Caja Diaria</h2>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{fechaDisplay}</div>
        </div>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a" }} />
      </div>

      {isMobile ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "#dcfce7", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>💵 Efectivo</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#166534", marginTop: 4 }}>${fmt(resumen.efectivo)}</div>
            </div>
            <div style={{ background: "#dbeafe", borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>🏦 Transfer.</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#1d4ed8", marginTop: 4 }}>${fmt(resumen.transfer)}</div>
            </div>
            <div style={{ background: "#0f172a", borderRadius: 14, padding: "12px 14px", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>📊 Total confirmado</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 4 }}>${fmt(resumen.total)}</div>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#334155" }}>Movimientos ({pagosDia.length})</div>
          {movimientosList}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "#334155" }}>Movimientos del día ({pagosDia.length})</div>
            {movimientosList}
          </div>
          <div style={{ width: 260, flexShrink: 0, position: "sticky", top: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "#334155" }}>Resumen</div>
            {resumenPanel}
          </div>
        </div>
      )}
    </div>
  );
}
