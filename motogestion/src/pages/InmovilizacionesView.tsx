import { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import { useGestiones } from "../hooks/useGestiones";
import ModalGestion from "../components/ModalGestion";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

const DIAS_LABEL  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_LABEL = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fmtFecha(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LABEL[d.getDay()]} ${d.getDate()} ${MESES_LABEL[d.getMonth()]}`;
}

type Prioridad = "critica" | "alta" | "media";

type Fila = {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteTel: string;
  motoId: string | null;
  placa: string;
  marca: string;
  modelo: string;
  diasSinPago: number;
  deudaEstimada: number;
  tarifa: number;
  ultimoPago: string | null;
  prioridad: Prioridad;
  ultimaGestion: string | null;
  tipoUltimaGestion: string | null;
  recoleccionOrdenada: boolean;
};

const PRIO: Record<Prioridad, { bg: string; color: string; border: string; label: string; icon: string }> = {
  critica: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítica",  icon: "🔴" },
  alta:    { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alta",     icon: "🟠" },
  media:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Media",    icon: "🟡" },
};

type FiltroP = "todos" | "criticos" | "en_proceso" | Prioridad;

function protocoloPasos(dias: number) {
  return [
    { num: 1, label: "Mensaje WA",         done: dias >= 1, active: dias === 0 },
    { num: 2, label: "Llamada + gabela",    done: dias >= 2, active: dias === 1 },
    { num: 3, label: "Apagado remoto",      done: dias >= 3, active: dias === 2 },
    { num: 4, label: "Inmovilización",      done: dias >= 4, active: dias === 3 },
    { num: 5, label: "Plazo extra (2d)",    done: dias >= 6, active: dias >= 4 && dias < 6 },
    { num: 6, label: "Recolección física",  done: false,     active: dias >= 6 },
  ];
}

export default function InmovilizacionesView({ onNavigate }: { onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { contratos } = useContratos();
  const { clientes }  = useClientes();
  const { motos }     = useMotos();
  const { pagos }     = usePagos();
  const { gestiones } = useGestiones();

  const [gestionId, setGestionId]     = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [busqueda, setBusqueda]       = useState("");
  const [filtro, setFiltro]           = useState<FiltroP>("todos");
  const [expandido, setExpandido]     = useState<string | null>(null);
  const [recuperadas, setRecuperadas] = useState<Set<string>>(new Set());

  const hoy = new Date().toISOString().slice(0, 10);
  const inicioSemana = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10);
  })();

  const filas: Fila[] = useMemo(() => {
    return contratos
      .filter(c => c.estado === "Activo")
      .flatMap(c => {
        const pagosC = pagos
          .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
          .sort((a, b) => b.fecha.localeCompare(a.fecha));
        const ultimo = pagosC[0];
        const dias = ultimo
          ? Math.floor((new Date(hoy + "T00:00:00").getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
          : 999;
        if (dias < 3) return [];

        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto    = motos.find(m => m.id === c.moto_id);
        const tarifa  = c.tarifa_diaria ?? 27000;

        const gestionesC = gestiones
          .filter(g => g.contrato_id === c.id)
          .sort((a, b) => b.fecha.localeCompare(a.fecha));
        const ultimaG = gestionesC[0] ?? null;
        const tieneRecoleccion = gestionesC.some(g => g.tipo === "recoleccion");

        return [{
          contratoId: c.id,
          clienteId: c.cliente_id,
          clienteNombre: cliente?.nombre ?? "Sin nombre",
          clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
          motoId: c.moto_id ?? null,
          placa: moto?.placa ?? "Sin placa",
          marca: moto?.marca ?? "",
          modelo: moto?.modelo ?? "",
          diasSinPago: dias,
          deudaEstimada: Math.min(dias, 30) * tarifa,
          tarifa,
          ultimoPago: ultimo?.fecha ?? null,
          prioridad: (dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media") as Prioridad,
          ultimaGestion: ultimaG?.fecha ?? null,
          tipoUltimaGestion: ultimaG?.tipo ?? null,
          recoleccionOrdenada: tieneRecoleccion,
        }];
      })
      .sort((a, b) => b.diasSinPago - a.diasSinPago);
  }, [contratos, clientes, motos, pagos, gestiones, hoy]);

  // Recovery count this week
  const recuperadasSemana = useMemo(() => {
    return gestiones.filter(
      g => g.tipo === "recoleccion" && g.fecha >= inicioSemana
    ).length;
  }, [gestiones, inicioSemana]);

  const resumen = useMemo(() => ({
    total:       filas.length,
    critica:     filas.filter(f => f.prioridad === "critica").length,
    alta:        filas.filter(f => f.prioridad === "alta").length,
    media:       filas.filter(f => f.prioridad === "media").length,
    deudaTotal:  filas.reduce((a, f) => a + f.deudaEstimada, 0),
    recoleccion: filas.filter(f => f.recoleccionOrdenada).length,
  }), [filas]);

  const filtradas = useMemo(() => {
    let lista = filas.filter(f => !recuperadas.has(f.contratoId));
    if (filtro === "criticos")   lista = lista.filter(f => f.prioridad === "critica");
    if (filtro === "en_proceso") lista = lista.filter(f => f.recoleccionOrdenada);
    if (filtro === "critica")    lista = lista.filter(f => f.prioridad === "critica");
    if (filtro === "alta")       lista = lista.filter(f => f.prioridad === "alta");
    if (filtro === "media")      lista = lista.filter(f => f.prioridad === "media");
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
    }
    return lista;
  }, [filas, busqueda, filtro, recuperadas]);

  const enRecoleccion = useMemo(() =>
    filas.filter(f => f.recoleccionOrdenada && !recuperadas.has(f.contratoId)),
    [filas, recuperadas]
  );

  function abrirWA(tel: string, nombre: string, dias: number) {
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const msg = `Hola ${n}, su moto lleva ${dias} días sin pago. Es urgente que se comunique con nosotros para evitar la recolección del vehículo. GPS Satelital ⚠️`;
    const num = tel.replace(/\D/g, "");
    window.open(`https://wa.me/${num.startsWith("57") ? num : `57${num}`}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function marcarRecuperada(id: string) {
    setRecuperadas(prev => { const next = new Set(prev); next.add(id); return next; });
  }

  const filtroBtns: { key: FiltroP; label: string; count: number }[] = [
    { key: "todos",      label: "Todos",       count: filas.length },
    { key: "criticos",   label: "Críticos",    count: resumen.critica },
    { key: "en_proceso", label: "En proceso",  count: resumen.recoleccion },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 22, margin: 0, fontWeight: 900, color: "#0f172a" }}>Inmovilizaciones</h2>
        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 14 }}>
          Contratos con 3+ días sin pago — requieren acción inmediata
        </p>
      </div>

      {/* KPI header cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#fee2e2", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Mora crítica (+3d)</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#991b1b", lineHeight: 1.1, marginTop: 6 }}>{resumen.total}</div>
          <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, marginTop: 2 }}>{resumen.critica} críticos (+10d)</div>
        </div>
        <div style={{ background: "#fef3c7", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>En proceso recolección</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#92400e", lineHeight: 1.1, marginTop: 6 }}>{resumen.recoleccion}</div>
          <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 2 }}>orden activa</div>
        </div>
        <div style={{ background: "#dcfce7", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Recuperadas esta semana</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#166534", lineHeight: 1.1, marginTop: 6 }}>{recuperadasSemana}</div>
          <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 2 }}>motos recuperadas</div>
        </div>
        <div style={{ background: "#fff5f5", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.4 }}>Deuda estimada total</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#991b1b", lineHeight: 1.1, marginTop: 6 }}>${fmt(resumen.deudaTotal)}</div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 2 }}>{filas.length} contratos</div>
        </div>
      </div>

      {/* GPS notice */}
      <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>📡</span>
        <span>
          <strong>GPS no integrado.</strong> Sirena (máx. 10s) y apagado remoto (máx. 1h) disponibles al integrar la plataforma GPS.{" "}
          <strong>Solo con vehículo detenido.</strong>
        </span>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {filtroBtns.map(btn => (
            <button
              key={btn.key}
              onClick={() => setFiltro(btn.key)}
              style={{
                padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 700,
                background: filtro === btn.key ? "#0f172a" : "#f1f5f9",
                color: filtro === btn.key ? "white" : "#64748b",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {btn.label}
              <span style={{
                background: filtro === btn.key ? "rgba(255,255,255,0.2)" : "#e2e8f0",
                borderRadius: 999, fontSize: 10, fontWeight: 900,
                padding: "1px 6px",
                color: filtro === btn.key ? "white" : "#64748b",
              }}>{btn.count}</span>
            </button>
          ))}
        </div>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente o placa..."
          style={{ flex: 1, minWidth: 180, padding: "7px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
      </div>

      {/* Empty state */}
      {filas.length === 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: "52px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Sin motos en mora</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Todos los contratos están al día</div>
        </div>
      )}

      {/* Main list */}
      <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {filtradas.map(f => {
          const s = PRIO[f.prioridad];
          const abierto = expandido === f.contratoId;
          const pasos = protocoloPasos(f.diasSinPago);
          const esRecuperada = recuperadas.has(f.contratoId);
          if (esRecuperada) return null;

          return (
            <div key={f.contratoId} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  {/* Info column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {onNavigate && f.motoId
                        ? <button onClick={() => onNavigate("ficha_moto", f.motoId!)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 900, fontSize: 16, color: "#0284c7", textDecoration: "underline" }}>{f.placa}</button>
                        : <span style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>{f.placa}</span>
                      }
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      {onNavigate
                        ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 15, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                        : <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                      }
                      <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: s.border, color: s.color }}>
                        {s.icon} {s.label}
                      </span>
                      {f.recoleccionOrdenada && (
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>
                          🚔 Recolección
                        </span>
                      )}
                    </div>

                    {(f.marca || f.modelo) && (
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{f.marca} {f.modelo}</div>
                    )}
                    {f.clienteTel && (
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>📞 {f.clienteTel}</div>
                    )}

                    {/* Metrics row */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                          {f.diasSinPago === 999 ? "∞" : f.diasSinPago}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                      </div>
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaEstimada)}</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                      </div>
                      <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>${fmt(f.tarifa)}/día</div>
                        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>tarifa</div>
                      </div>
                      {f.ultimoPago && (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFecha(f.ultimoPago)}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>último pago</div>
                        </div>
                      )}
                      {f.ultimaGestion ? (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFecha(f.ultimaGestion)}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>última gestión · {f.tipoUltimaGestion}</div>
                        </div>
                      ) : (
                        <div style={{ borderLeft: `2px solid ${s.border}`, paddingLeft: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#991b1b" }}>Sin gestiones</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>requiere acción</div>
                        </div>
                      )}
                    </div>

                    {/* Urgency bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${Math.min(100, (f.diasSinPago / 14) * 100)}%`,
                          background: f.prioridad === "critica" ? "#ef4444" : f.prioridad === "alta" ? "#f59e0b" : "#f97316",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, textAlign: "right" }}>
                        {f.diasSinPago === 999 ? "Sin historial de pagos" : `${f.diasSinPago} / 14 días`}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
                    {f.clienteTel && (
                      <>
                        <button
                          onClick={() => window.open(`tel:+57${f.clienteTel.replace(/\D/g, "")}`)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}
                        >
                          📞 Llamar
                        </button>
                        <button
                          onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}
                        >
                          💬 WA
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}
                    >
                      📋 Gestión
                    </button>
                    <button
                      onClick={() => marcarRecuperada(f.contratoId)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}
                    >
                      ✓ Recuperada
                    </button>
                    {onNavigate && (
                      <>
                        <button
                          onClick={() => onNavigate("ficha_cliente", f.clienteId)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}
                        >
                          👤 Ficha
                        </button>
                        {f.motoId && (
                          <button
                            onClick={() => onNavigate("ficha_moto", f.motoId!)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f0fdf4", color: "#166534" }}
                          >
                            🏍️ Moto
                          </button>
                        )}
                      </>
                    )}
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 10s"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}
                    >
                      📡 Sirena
                    </button>
                    <button
                      disabled
                      title="Requiere GPS — solo con vehículo detenido, máx. 1h"
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}
                    >
                      🔴 Apagar
                    </button>
                    <button
                      onClick={() => setExpandido(abierto ? null : f.contratoId)}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}
                    >
                      {abierto ? "▲ Cerrar" : "▼ Protocolo"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Protocol panel */}
              {abierto && (
                <div style={{ borderTop: `1px solid ${s.border}`, padding: "14px 16px", background: "rgba(255,255,255,0.7)" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Protocolo de mora — estado actual
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {pasos.map(p => (
                      <div
                        key={p.num}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                          background: p.done ? "#dcfce7" : p.active ? s.bg : "#f8fafc",
                          color: p.done ? "#166534" : p.active ? s.color : "#94a3b8",
                          border: p.active ? `2px solid ${s.color}` : "1px solid transparent",
                        }}
                      >
                        <span>{p.done ? "✓" : p.active ? "▶" : p.num}</span>
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
                    <strong style={{ color: "#0f172a" }}>Regla GPS:</strong> Sirena máx. 10 seg · Apagado máx. 1 hora · Solo vehículo{" "}
                    <strong>detenido</strong> · Recolección siempre con acompañamiento policial.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Orden de recolección section */}
      {enRecoleccion.length > 0 && (
        <div style={{ background: "#fff5f5", border: "2px solid #fecaca", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>🚔</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#991b1b" }}>Órdenes de recolección activas</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {enRecoleccion.length} moto{enRecoleccion.length !== 1 ? "s" : ""} — coordinar con equipo de campo y policía
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {enRecoleccion.map(f => (
              <div key={f.contratoId} style={{
                background: "white", border: "1px solid #fecaca", borderRadius: 12,
                padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14, textTransform: "uppercase", color: "#0f172a" }}>
                    {f.placa} · {f.clienteNombre}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {f.marca} {f.modelo} · {f.diasSinPago === 999 ? "Sin historial" : `${f.diasSinPago} días sin pago`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {f.clienteTel && (
                    <button
                      onClick={() => window.open(`tel:+57${f.clienteTel.replace(/\D/g, "")}`)}
                      style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}
                    >
                      📞 Llamar
                    </button>
                  )}
                  <button
                    onClick={() => marcarRecuperada(f.contratoId)}
                    style={{ padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}
                  >
                    ✓ Marcar recuperada
                  </button>
                  <span style={{ padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#991b1b" }}>
                    ${fmt(f.deudaEstimada)} adeudado
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: "8px 12px", background: "white", borderRadius: 10, border: "1px solid #fecaca", fontSize: 12, color: "#991b1b", fontWeight: 700 }}>
            ⚠️ Nunca acercarse al vehículo sin acompañamiento policial. Llamar a GPS + Policía primero.
          </div>
        </div>
      )}

      {gestionId && (
        <ModalGestion
          contratoId={gestionId}
          clienteNombre={gestionNombre}
          onClose={() => setGestionId(null)}
        />
      )}
    </div>
  );
}
