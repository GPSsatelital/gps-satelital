import { useMemo, useState } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos, type AplicadoPago } from "../hooks/usePagos";
import { useAuth } from "../contexts/AuthContext";
import ModalGestion from "../components/ModalGestion";
import ClienteDetalleSheet from "../components/ClienteDetalleSheet";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

type Tab = "hoy" | "mora" | "inmovilizar";

type Fila = {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteTel: string;
  placa: string;
  marca: string;
  tipoRuta: string;
  diaPago: string;
  tarifaDiaria: number;
  ahorroDiario: number;
  valorPactado: number;
  valorPeriodo: number;
  diasSinPago: number;
  deudaEstimada: number;
  pagadoHoy: number;
  pagaHoy: boolean;
  pagadoHoyBool: boolean;
  prioridad: "critica" | "alta" | "media";
};

const PRIORIDAD: Record<string, { bg: string; color: string; border: string; label: string }> = {
  critica: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítica" },
  alta:    { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alta" },
  media:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Media" },
};

function calcDiasConPeriodo(
  pagosC: Array<{ fecha: string; estado: string }>,
  tipoRuta: string,
  diaPago: string,
  hoy: string,
): number {
  const conf = pagosC.filter(p => p.estado === "Confirmado");
  if (tipoRuta === "diario") {
    const ultimo = conf.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    if (!ultimo) return 999;
    return Math.floor((new Date(hoy + "T00:00:00").getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000);
  }
  // Periódico: buscar el inicio del período actual (último lunes o miércoles pasado)
  const targetDay = diaPago === "Lunes" ? 1 : 3;
  const d = new Date(hoy + "T00:00:00");
  while (d.getDay() !== targetDay) d.setDate(d.getDate() - 1);
  const inicioPeriodo = d.toISOString().slice(0, 10);
  const pagoPeriodo = conf.find(p => p.fecha >= inicioPeriodo);
  if (pagoPeriodo) return 0;
  return Math.floor((new Date(hoy + "T00:00:00").getTime() - d.getTime()) / 86400000);
}

export default function CobroDiarioView() {
  const hoy = new Date().toISOString().slice(0, 10);
  const diaSem = new Date(hoy + "T00:00:00").getDay();
  const esLunes = diaSem === 1;
  const esMiercoles = diaSem === 3;

  const [tab, setTab] = useState<Tab>("hoy");
  const [busqueda, setBusqueda] = useState("");
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [clienteDetalleId, setClienteDetalleId] = useState<string | null>(null);
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);
  const [cobrarValor, setCobrarValor] = useState("");
  const [cobrarMetodo, setCobrarMetodo] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [cobrandoLoading, setCobrandoLoading] = useState(false);
  const [cobrarError, setCobrarError] = useState<string | null>(null);

  const { profile } = useAuth();
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos, registrarPago } = usePagos();

  const filas: Fila[] = useMemo(() => {
    return contratos
      .filter(c => c.estado === "Activo")
      .map(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = motos.find(m => m.id === c.moto_id);
        const pagosC = pagos.filter(p => p.contrato_id === c.id);
        const tarifa = c.tarifa_diaria ?? 27000;
        const ahorro = (c as { ahorro_diario?: number }).ahorro_diario ?? 4000;
        const valorPactado = tarifa + ahorro;
        const valorPeriodo = (c as { valor_periodo?: number }).valor_periodo ?? valorPactado * 7;
        const tipoRuta = (c as { tipo_ruta?: string }).tipo_ruta ?? "diario";
        const diaPago = c.dia_pago ?? "Lunes";
        const dias = calcDiasConPeriodo(pagosC, tipoRuta, diaPago, hoy);
        const pagadosHoy = pagosC.filter(p => p.fecha === hoy && p.estado === "Confirmado");
        const pagadoHoy = pagadosHoy.reduce((s, p) => s + p.valor, 0);
        const pagaHoy = tipoRuta === "diario"
          ? true
          : (diaPago === "Lunes" && esLunes) || (diaPago === "Miércoles" && esMiercoles);
        const prioridad: Fila["prioridad"] = dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media";

        return {
          contratoId: c.id,
          clienteId: c.cliente_id,
          clienteNombre: cliente?.nombre ?? "Sin nombre",
          clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
          placa: moto?.placa ?? "—",
          marca: moto ? `${moto.marca} ${moto.modelo}` : "",
          tipoRuta,
          diaPago,
          tarifaDiaria: tarifa,
          ahorroDiario: ahorro,
          valorPactado,
          valorPeriodo,
          diasSinPago: dias,
          deudaEstimada: dias > 0 && dias < 999 ? Math.min(dias, 30) * valorPactado : 0,
          pagadoHoy,
          pagaHoy,
          pagadoHoyBool: pagadoHoy > 0,
          prioridad,
        };
      });
  }, [contratos, clientes, motos, pagos, hoy, esLunes, esMiercoles]);

  const filasHoy = useMemo(() => filas.filter(f => f.pagaHoy), [filas]);
  const filasMora = useMemo(() => filas.filter(f => f.diasSinPago > 0 && f.diasSinPago < 999).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);
  const filasInmov = useMemo(() => filas.filter(f => f.diasSinPago >= 3).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);

  const kpiRecaudado = useMemo(() => pagos.filter(p => p.fecha === hoy && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0), [pagos, hoy]);
  const kpiEsperado = useMemo(() => filasHoy.reduce((s, f) => s + f.valorPactado, 0), [filasHoy]);
  const kpiMora = useMemo(() => filasMora.reduce((s, f) => s + f.deudaEstimada, 0), [filasMora]);

  function abrirWA(tel: string, nombre: string, dias: number) {
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const msg = dias > 0
      ? `Hola ${n}, lleva ${dias} días sin pago. Por favor comuníquese urgente con nosotros. GPS Satelital ⚠️`
      : `Hola ${n}, recuerde que hoy es su día de pago. GPS Satelital 🏍️`;
    const num = tel.replace(/\D/g, "");
    const full = num.startsWith("57") ? num : `57${num}`;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function abrirLlamada(tel: string) {
    if (!tel) return;
    const num = tel.replace(/\D/g, "");
    window.open(`tel:+57${num}`);
  }

  async function handleCobrar(f: Fila) {
    const valor = parseInt(cobrarValor.replace(/\D/g, ""), 10);
    if (!valor || valor <= 0) { setCobrarError("Ingresa un valor válido"); return; }
    if (cobrarMetodo === "Efectivo" && !esSecretaria) { setCobrarError("Solo la secretaria puede registrar efectivo"); return; }
    setCobrandoLoading(true);
    setCobrarError(null);
    const aplicado: AplicadoPago = {
      tarifa: Math.min(valor, f.tarifaDiaria),
      ahorro: Math.max(0, Math.min(valor - f.tarifaDiaria, f.ahorroDiario)),
      deuda: 0,
      convenio: 0,
      saldo: Math.max(0, valor - f.tarifaDiaria - f.ahorroDiario),
    };
    const { error } = await registrarPago(f.contratoId, valor, cobrarMetodo, aplicado, {
      registradoPor: profile?.id,
    });
    setCobrandoLoading(false);
    if (error) { setCobrarError(error); return; }
    setCobrandoId(null);
    setCobrarValor("");
  }

  function abrirCobrar(f: Fila) {
    setCobrandoId(f.contratoId);
    setCobrarValor(String(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo));
    setCobrarMetodo(esSecretaria ? "Efectivo" : "Transferencia");
    setCobrarError(null);
  }

  const q = busqueda.toLowerCase();
  function filtrar(lista: Fila[]) {
    if (!q) return lista;
    return lista.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
  }

  const diasLabel = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const mesesLabel = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const fechaHoy = new Date(hoy + "T00:00:00");
  const fechaDisplay = `${diasLabel[fechaHoy.getDay()]} ${fechaHoy.getDate()} de ${mesesLabel[fechaHoy.getMonth()]} ${fechaHoy.getFullYear()}`;

  const modalCobrar = cobrandoId ? (() => {
    const f = filas.find(x => x.contratoId === cobrandoId);
    if (!f) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={e => { if (e.target === e.currentTarget) setCobrandoId(null); }}>
        <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, textTransform: "uppercase" }}>{f.placa} · {f.clienteNombre}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Valor pactado: ${fmt(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo)}/{f.tipoRuta === "diario" ? "día" : f.tipoRuta === "semanal" ? "sem" : "período"}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Valor a cobrar</div>
            <input
              type="number"
              value={cobrarValor}
              onChange={e => setCobrarValor(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 16, fontWeight: 700 }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Efectivo", "Transferencia"] as const).map(m => (
                <button key={m} onClick={() => setCobrarMetodo(m)}
                  disabled={m === "Efectivo" && !esSecretaria}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: m === "Efectivo" && !esSecretaria ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 13,
                    background: cobrarMetodo === m ? (m === "Efectivo" ? "#dcfce7" : "#dbeafe") : "#f1f5f9",
                    color: cobrarMetodo === m ? (m === "Efectivo" ? "#166534" : "#1d4ed8") : "#94a3b8",
                    opacity: m === "Efectivo" && !esSecretaria ? 0.4 : 1,
                  }}>
                  {m === "Efectivo" ? "💵 Efectivo" : "🏦 Transfer."}
                </button>
              ))}
            </div>
            {!esSecretaria && <div style={{ fontSize: 11, color: "#92400e", marginTop: 6 }}>Solo la secretaria puede registrar efectivo</div>}
          </div>
          {cobrarError && <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>{cobrarError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setCobrandoId(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}>
              Cancelar
            </button>
            <button onClick={() => handleCobrar(f)} disabled={cobrandoLoading}
              style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "#0f172a", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: cobrandoLoading ? 0.7 : 1 }}>
              {cobrandoLoading ? "Registrando..." : "✅ Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  function tarjetaHoy(f: Fila) {
    return (
      <div key={f.contratoId} style={{ background: "white", borderRadius: 16, padding: "14px 16px", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", border: f.pagadoHoyBool ? "1px solid #bbf7d0" : "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase" }}>{f.placa} · {f.clienteNombre}</span>
              {f.pagadoHoyBool
                ? <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>✅ Pagado</span>
                : <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Pendiente</span>
              }
            </div>
            {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              {f.tipoRuta === "diario" ? "Pago diario" : `${f.tipoRuta.charAt(0).toUpperCase() + f.tipoRuta.slice(1)} · Paga ${f.diaPago}`}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  {f.tipoRuta === "diario" ? `$${fmt(f.valorPactado)}/día` : `$${fmt(f.valorPeriodo)}/${f.tipoRuta === "semanal" ? "sem" : f.tipoRuta === "quincenal" ? "quinc" : "mes"}`}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>valor pactado</div>
              </div>
              {f.pagadoHoyBool && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>${fmt(f.pagadoHoy)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>pagado hoy</div>
                </div>
              )}
              {f.diasSinPago > 0 && f.diasSinPago < 999 && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{f.diasSinPago}d</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>sin pago</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            {!f.pagadoHoyBool && (
              <button onClick={() => abrirCobrar(f)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#0f172a", color: "white" }}>💳</button>
            )}
            {f.clienteTel && <>
              <button onClick={() => abrirLlamada(f.clienteTel)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>📞</button>
              <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, 0)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬</button>
            </>}
            <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>📋</button>
            <button onClick={() => setClienteDetalleId(f.clienteId)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}>👤</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Cobro Diario</h2>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{fechaDisplay}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: "#dcfce7", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Recaudado hoy</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>${fmt(kpiRecaudado)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: "#dbeafe", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>Esperado hoy</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1d4ed8" }}>${fmt(kpiEsperado)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: "#fee2e2", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Deuda mora</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#991b1b" }}>${fmt(kpiMora)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "white", borderRadius: 12, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
        {([
          { key: "hoy", label: `Hoy (${filasHoy.length})` },
          { key: "mora", label: `Mora (${filasMora.length})` },
          { key: "inmovilizar", label: `Inmovilizar (${filasInmov.length})` },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 700,
            background: tab === t.key ? "#0f172a" : "transparent",
            color: tab === t.key ? "white" : "#64748b",
          }}>{t.label}</button>
        ))}
      </div>

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar cliente o placa..."
        style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12 }} />

      {tab === "hoy" && (
        <div style={{ display: "grid", gap: 10 }}>
          {filtrar(filasHoy).length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
              <div style={{ fontSize: 32 }}>📅</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Sin cobros programados para hoy</div>
            </div>
          )}
          {filtrar(filasHoy).map(f => tarjetaHoy(f))}
        </div>
      )}

      {tab === "mora" && (
        <div style={{ display: "grid", gap: 10 }}>
          {filtrar(filasMora).length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>Sin contratos en mora</div>
            </div>
          )}
          {filtrar(filasMora).map(f => {
            const dColor = f.diasSinPago >= 5 ? "#991b1b" : f.diasSinPago >= 3 ? "#c2410c" : "#92400e";
            const dBg = f.diasSinPago >= 5 ? "#fee2e2" : f.diasSinPago >= 3 ? "#fff7ed" : "#fef3c7";
            return (
              <div key={f.contratoId} style={{ background: "white", borderRadius: 16, padding: "14px 16px", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", borderLeft: `4px solid ${dColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase" }}>{f.placa} · {f.clienteNombre}</div>
                    {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}
                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      <div style={{ background: dBg, borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: dColor, lineHeight: 1 }}>{f.diasSinPago === 999 ? "∞" : f.diasSinPago}</div>
                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                      </div>
                      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaEstimada)}</div>
                        <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    <button onClick={() => abrirCobrar(f)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#0f172a", color: "white" }}>💳</button>
                    {f.clienteTel && <>
                      <button onClick={() => abrirLlamada(f.clienteTel)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>📞</button>
                      <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬</button>
                    </>}
                    <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>📋</button>
                    <button onClick={() => setClienteDetalleId(f.clienteId)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}>👤</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "inmovilizar" && (
        <div>
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", gap: 8 }}>
            <span>📡</span>
            <span><strong>GPS no conectado.</strong> Sirena y apagado remoto disponibles al integrar la plataforma GPS. Solo usar con vehículo <strong>detenido</strong>.</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {filtrar(filasInmov).length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
                <div style={{ fontSize: 32 }}>✅</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>Sin motos para inmovilizar</div>
              </div>
            )}
            {filtrar(filasInmov).map(f => {
              const s = PRIORIDAD[f.prioridad];
              return (
                <div key={f.contratoId} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase" }}>{f.placa} · {f.clienteNombre}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.border, color: s.color }}>{s.label}</span>
                      </div>
                      {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}
                      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{f.diasSinPago === 999 ? "∞" : f.diasSinPago}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                        </div>
                        <div style={{ borderLeft: `1px solid ${s.border}`, paddingLeft: 12 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaEstimada)}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(100, (f.diasSinPago / 14) * 100)}%`, background: f.prioridad === "critica" ? "#ef4444" : f.prioridad === "alta" ? "#f59e0b" : "#f97316" }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                      <button onClick={() => abrirCobrar(f)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#0f172a", color: "white" }}>💳</button>
                      {f.clienteTel && <>
                        <button onClick={() => abrirLlamada(f.clienteTel)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>📞</button>
                        <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬</button>
                      </>}
                      <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>📋</button>
                      <button onClick={() => setClienteDetalleId(f.clienteId)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}>👤</button>
                      <button disabled title="Requiere GPS" style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}>📡</button>
                      <button disabled title="Requiere GPS" style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}>🔴</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modalCobrar}
      {gestionId && <ModalGestion contratoId={gestionId} clienteNombre={gestionNombre} onClose={() => setGestionId(null)} />}
      {clienteDetalleId && <ClienteDetalleSheet clienteId={clienteDetalleId} onClose={() => setClienteDetalleId(null)} />}
    </div>
  );
}
