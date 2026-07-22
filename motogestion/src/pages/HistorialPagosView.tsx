import { useEffect, useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { usePagos, type Pago } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { hoyISO, hoyDate } from "../utils/fecha";
import { Badge, type BadgeTone } from "../components/atomos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

function estadoTone(estado: string): BadgeTone {
  if (estado === "Confirmado") return "ok";
  if (estado === "Pendiente") return "warn";
  if (estado === "Rechazado") return "bad";
  return "neutral";
}

function isoMes(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
}

export default function HistorialPagosView({ onNavigate }: {
  onNavigate: (view: ViewKey, filter?: string) => void;
}) {
  const mesActual = isoMes(0);
  const [desde, setDesde] = useState(`${mesActual}-01`);
  const [hasta, setHasta] = useState(hoyISO());
  const [busqueda, setBusqueda] = useState("");
  const [metodo, setMetodo] = useState<"todos" | "Efectivo" | "Transferencia">("todos");
  const [estadoFiltro, setEstadoFiltro] = useState<"todos" | "Confirmado" | "Pendiente" | "Rechazado">("todos");
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { pagos } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  function getInfo(p: Pago) {
    const c = contratos.find(ct => ct.id === p.contrato_id);
    const cl = clientes.find(cl => cl.id === c?.cliente_id);
    const m = c?.moto_id ? motos.find(mo => mo.id === c.moto_id) : null;
    return { cliente: cl, moto: m };
  }

  const pagosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return pagos.filter(p => {
      if (p.fecha < desde || p.fecha > hasta) return false;
      if (metodo !== "todos" && p.metodo !== metodo) return false;
      if (estadoFiltro !== "todos" && p.estado !== estadoFiltro) return false;
      if (q) {
        const c = contratos.find(ct => ct.id === p.contrato_id);
        const cl = clientes.find(cl => cl.id === c?.cliente_id);
        const m = c?.moto_id ? motos.find(m => m.id === c.moto_id) : null;
        const match = (cl?.nombre ?? "").toLowerCase().includes(q) || (cl?.cedula ?? "").includes(q) || (m?.placa ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => {
      const dc = b.fecha.localeCompare(a.fecha);
      if (dc !== 0) return dc;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [pagos, contratos, clientes, motos, desde, hasta, metodo, estadoFiltro, busqueda]);

  const stats = useMemo(() => {
    const conf = pagosFiltrados.filter(p => p.estado === "Confirmado");
    const ef = conf.filter(p => p.metodo === "Efectivo");
    const tr = conf.filter(p => p.metodo === "Transferencia");
    const pend = pagosFiltrados.filter(p => p.estado === "Pendiente");
    return {
      total: conf.reduce((s, p) => s + p.valor, 0),
      ef: { count: ef.length, val: ef.reduce((s, p) => s + p.valor, 0) },
      tr: { count: tr.length, val: tr.reduce((s, p) => s + p.valor, 0) },
      pend: { count: pend.length, val: pend.reduce((s, p) => s + p.valor, 0) },
    };
  }, [pagosFiltrados]);

  const pagoSeleccionado = seleccionado ? pagosFiltrados.find(p => p.id === seleccionado) ?? null : null;
  const infoSeleccionado = pagoSeleccionado ? getInfo(pagoSeleccionado) : null;

  function estadoBadge(estado: string) {
    if (estado === "Confirmado") return { bg: "var(--ok-soft)", color: "var(--ok-ink)" };
    if (estado === "Pendiente") return { bg: "var(--warn-soft)", color: "var(--warn-ink)" };
    return { bg: "var(--soft)", color: "var(--muted)" };
  }

  function metodoBadge(m: string) {
    return m === "Efectivo"
      ? { bg: "var(--ok-soft)", color: "var(--ok-ink)", label: "Efectivo" }
      : { bg: "var(--accent-soft3)", color: "var(--accent-ink)", label: "Transferencia" };
  }

  const quickRanges = [
    { label: "Hoy", from: hoyISO(), to: hoyISO() },
    { label: "Esta semana", from: (() => { const d = hoyDate(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toISOString().slice(0, 10); })(), to: hoyISO() },
    { label: "Este mes", from: `${mesActual}-01`, to: hoyISO() },
  ];

  const PagoCard = ({ p }: { p: Pago }) => {
    const { cliente, moto } = getInfo(p);
    const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
    const eb = estadoBadge(p.estado);
    const mb = metodoBadge(p.metodo);
    const isSelected = seleccionado === p.id;
    return (
      <div
        onClick={() => setSeleccionado(isSelected ? null : p.id)}
        style={{
          background: "var(--card)",
          borderRadius: 14,
          padding: "16px 18px",
          cursor: "pointer",
          border: isSelected ? "2px solid var(--accent)" : "1px solid var(--line)",
          borderLeft: `4px solid ${eb.color}`,
          transition: "box-shadow 0.15s",
          boxShadow: isSelected ? "0 4px 16px rgba(2,132,199,0.15)" : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cliente?.nombre ?? "—"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
              {p.fecha} · {hora}{moto ? ` · ${moto.placa}` : ""}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <Badge tone={p.metodo === "Efectivo" ? "ok" : "accent"}>{mb.label}</Badge>
              <Badge tone={estadoTone(p.estado)}>{p.estado}</Badge>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: p.estado === "Rechazado" ? "var(--faint)" : "var(--text)", flexShrink: 0, textDecoration: p.estado === "Rechazado" ? "line-through" : "none" }}>
            ${fmt(p.valor)}
          </div>
        </div>
      </div>
    );
  };

  const detailPanel = pagoSeleccionado && infoSeleccionado && (
    <div style={{ background: "var(--card)", borderRadius: 16, padding: "24px", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Detalle del pago</div>
        <button onClick={() => setSeleccionado(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--faint)", lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>${fmt(pagoSeleccionado.valor)}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <Badge tone={estadoTone(pagoSeleccionado.estado)}>{pagoSeleccionado.estado}</Badge>
        <Badge tone={pagoSeleccionado.metodo === "Efectivo" ? "ok" : "accent"}>{pagoSeleccionado.metodo}</Badge>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--soft2)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Cliente</div>
          <button onClick={() => infoSeleccionado.cliente && onNavigate("ficha_cliente", infoSeleccionado.cliente.id)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: "var(--accent)" }}>{infoSeleccionado.cliente?.nombre ?? "—"}</div>
            {infoSeleccionado.cliente && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>C.C. {infoSeleccionado.cliente.cedula}</div>}
          </button>
        </div>
        {infoSeleccionado.moto && (
          <div style={{ background: "var(--soft2)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Moto</div>
            <button onClick={() => onNavigate("ficha_moto", infoSeleccionado.moto!.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--accent)" }}>{infoSeleccionado.moto.placa}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{infoSeleccionado.moto.marca} {infoSeleccionado.moto.modelo}</div>
            </button>
          </div>
        )}
        <div style={{ background: "var(--soft2)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Aplicación</div>
          {[
            { label: "Tarifa", val: pagoSeleccionado.aplicado_tarifa },
            { label: "Deuda", val: pagoSeleccionado.aplicado_deuda },
            { label: "Convenio", val: pagoSeleccionado.aplicado_convenio },
            { label: "Ahorro", val: pagoSeleccionado.aplicado_ahorro },
            { label: "Saldo a favor", val: pagoSeleccionado.aplicado_saldo_favor },
          ].filter(r => r.val > 0).map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--soft)" }}>
              <span style={{ color: "var(--muted)" }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>${fmt(r.val)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--faint)" }}>
          {pagoSeleccionado.fecha} · {pagoSeleccionado.created_at ? new Date(pagoSeleccionado.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—"} · {pagoSeleccionado.tipo_registro}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Historial de Pagos</h2>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{pagosFiltrados.length} registro{pagosFiltrados.length !== 1 ? "s" : ""} encontrado{pagosFiltrados.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Filtros */}
      <div style={{ background: "var(--card)", borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Buscar</label>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre o cédula..."
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Método</label>
          <select value={metodo} onChange={e => setMetodo(e.target.value as typeof metodo)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }}>
            <option value="todos">Todos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Estado</label>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value as typeof estadoFiltro)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }}>
            <option value="todos">Todos</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {quickRanges.map(r => (
            <button key={r.label} onClick={() => { setDesde(r.from); setHasta(r.to); }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: desde === r.from && hasta === r.to ? "var(--accent)" : "var(--soft)", color: desde === r.from && hasta === r.to ? "var(--card)" : "var(--muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Total confirmado", val: stats.total, bg: "var(--ok-soft)", color: "var(--ok-ink)" },
          { label: `Efectivo (${stats.ef.count})`, val: stats.ef.val, bg: "var(--ok-soft)", color: "var(--ok-ink)" },
          { label: `Transferencias (${stats.tr.count})`, val: stats.tr.val, bg: "var(--accent-soft2)", color: "var(--accent-ink)" },
          { label: `Pendiente (${stats.pend.count})`, val: stats.pend.val, bg: "var(--warn-soft)", color: "var(--warn-ink)" },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: kpi.bg, borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color, marginTop: 3 }}>${fmt(kpi.val)}</div>
          </div>
        ))}
      </div>

      {pagosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, background: "var(--card)", borderRadius: 16, color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700 }}>Sin pagos en este período</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Ajusta los filtros o el rango de fechas</div>
        </div>
      ) : isMobile ? (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pagosFiltrados.map(p => <PagoCard key={p.id} p={p} />)}
          </div>
          {pagoSeleccionado && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
              <div style={{ background: "var(--card)", borderRadius: "20px 20px 0 0", padding: "24px 20px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                {detailPanel}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {pagosFiltrados.map(p => <PagoCard key={p.id} p={p} />)}
          </div>
          {pagoSeleccionado && (
            <div style={{ width: 340, flexShrink: 0, position: "sticky", top: 16 }}>
              {detailPanel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
