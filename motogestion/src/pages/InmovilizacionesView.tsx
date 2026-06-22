import { useMemo, useState } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import ModalGestion from "../components/ModalGestion";
import ClienteDetalleSheet from "../components/ClienteDetalleSheet";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

type Fila = {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteTel: string;
  motoId: string | null;
  placa: string;
  marca: string;
  diasSinPago: number;
  deudaEstimada: number;
  tarifa: number;
  prioridad: "critica" | "alta" | "media";
};

const PRIORIDAD_STYLE: Record<Fila["prioridad"], { bg: string; color: string; border: string; label: string }> = {
  critica: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítica" },
  alta:    { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alta" },
  media:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Media" },
};

export default function InmovilizacionesView() {
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos } = usePagos();

  const [gestionContratoId, setGestionContratoId] = useState<string | null>(null);
  const [gestionClienteNombre, setGestionClienteNombre] = useState("");
  const [clienteDetalleId, setClienteDetalleId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const hoy = new Date().toISOString().slice(0, 10);

  const filas: Fila[] = useMemo(() => {
    const contratosActivos = contratos.filter(c => c.estado === "Activo");
    const result: Fila[] = [];

    for (const c of contratosActivos) {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const dias = ultimo
        ? Math.floor((new Date(hoy + "T00:00:00").getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;

      if (dias < 3) continue;

      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      const tarifa = c.tarifa_diaria ?? 27000;
      const deuda = Math.min(dias, 30) * tarifa;

      const prioridad: Fila["prioridad"] = dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media";

      result.push({
        contratoId: c.id,
        clienteId: c.cliente_id,
        clienteNombre: cliente?.nombre ?? "Sin nombre",
        clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
        motoId: c.moto_id ?? null,
        placa: moto?.placa ?? "Sin placa",
        marca: moto ? `${moto.marca} ${moto.modelo}` : "",
        diasSinPago: dias,
        deudaEstimada: deuda,
        tarifa,
        prioridad,
      });
    }

    return result.sort((a, b) => b.diasSinPago - a.diasSinPago);
  }, [contratos, clientes, motos, pagos, hoy]);

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return filas;
    const q = busqueda.toLowerCase();
    return filas.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
  }, [filas, busqueda]);

  const resumen = useMemo(() => ({
    total: filas.length,
    critica: filas.filter(f => f.prioridad === "critica").length,
    alta: filas.filter(f => f.prioridad === "alta").length,
    media: filas.filter(f => f.prioridad === "media").length,
    deudaTotal: filas.reduce((a, f) => a + f.deudaEstimada, 0),
  }), [filas]);

  function abrirWA(tel: string, nombre: string, dias: number) {
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const msg = `Hola ${n}, su moto lleva ${dias} días sin pago. Es urgente que se comunique con nosotros para evitar la recolección del vehículo. GPS Satelital ⚠️`;
    const num = tel.replace(/\D/g, "");
    const full = num.startsWith("57") ? num : `57${num}`;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, margin: 0 }}>Inmovilizaciones</h2>
        <p style={{ marginTop: 6, color: "#64748b" }}>Contratos activos con 3+ días sin pago — requieren acción inmediata.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total motos", value: resumen.total, color: "#334155", bg: "white" },
          { label: "Críticas (10+d)", value: resumen.critica, color: "#991b1b", bg: "#fff5f5" },
          { label: "Alta (5-9d)", value: resumen.alta, color: "#92400e", bg: "#fefce8" },
          { label: "Media (3-4d)", value: resumen.media, color: "#c2410c", bg: "#fff7ed" },
          { label: "Deuda estimada", value: `$${fmt(resumen.deudaTotal)}`, color: "#991b1b", bg: "#fee2e2" },
        ].map(k => (
          <div key={k.label} style={{ ...card, background: k.bg, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{k.label}</div>
            <div style={{ fontSize: k.label === "Deuda estimada" ? 16 : 26, fontWeight: 800, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Búsqueda */}
      <div style={{ marginBottom: 14 }}>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente o placa..."
          style={{ padding: "9px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, width: "100%", boxSizing: "border-box" }} />
      </div>

      {/* Empty state */}
      {filas.length === 0 && (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Sin motos en mora</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Todos los contratos están al día</div>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtradas.map(f => {
          const s = PRIORIDAD_STYLE[f.prioridad];
          return (
            <div key={f.contratoId} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "#0f172a" }}>
                      {f.placa} · {f.clienteNombre}
                    </div>
                    <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.border, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                        {f.diasSinPago === 999 ? "∞" : f.diasSinPago}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                    </div>
                    <div style={{ borderLeft: "1px solid " + s.border, paddingLeft: 16 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>$ {fmt(f.deudaEstimada)}</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                    </div>
                    <div style={{ borderLeft: "1px solid " + s.border, paddingLeft: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>$ {fmt(f.tarifa)}/día</div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>tarifa</div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setClienteDetalleId(f.clienteId); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}>
                    👤 Cliente
                  </button>
                  {f.clienteTel && (
                    <>
                      <button onClick={() => { const n = f.clienteTel.replace(/\D/g,""); window.open(`tel:+57${n}`); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>
                        📞 Llamar
                      </button>
                      <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                        💬 WA
                      </button>
                    </>
                  )}
                  <button onClick={() => { setGestionContratoId(f.contratoId); setGestionClienteNombre(f.clienteNombre); }} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                    📋 Gestión
                  </button>
                </div>
              </div>

              {/* Barra de urgencia */}
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(100, (f.diasSinPago / 14) * 100)}%`, background: f.prioridad === "critica" ? "#ef4444" : f.prioridad === "alta" ? "#f59e0b" : "#f97316", transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, textAlign: "right" }}>{f.diasSinPago === 999 ? "Sin historial de pagos" : `${f.diasSinPago} de 14 días máximo`}</div>
              </div>
            </div>
          );
        })}
      </div>

      {gestionContratoId && (
        <ModalGestion
          contratoId={gestionContratoId}
          clienteNombre={gestionClienteNombre}
          onClose={() => setGestionContratoId(null)}
        />
      )}

      {clienteDetalleId && (
        <ClienteDetalleSheet
          clienteId={clienteDetalleId}
          onClose={() => setClienteDetalleId(null)}
        />
      )}
    </div>
  );
}
