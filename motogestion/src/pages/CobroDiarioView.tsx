import { useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos, type AplicadoPago } from "../hooks/usePagos";
import { useCaja } from "../hooks/useCaja";
import { useAuth } from "../contexts/AuthContext";
import ModalGestion from "../components/ModalGestion";
import ModalDeuda from "../components/ModalDeuda";
import ModalConvenio from "../components/ModalConvenio";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

type Tab = "hoy" | "semanal" | "mora" | "inmovilizar" | "caja";
type FiltroDia = "todos" | "lunes" | "miercoles";
type FiltroEstado = "todos" | "al-dia" | "pendiente" | "mora";

const DIAS_LABEL = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_LABEL = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESES_FULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function fmtFechaCarta(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LABEL[d.getDay()]} ${d.getDate()} ${MESES_LABEL[d.getMonth()]}`;
}

function calcPagadoHasta(
  pagosC: Array<{ fecha: string; estado: string }>,
  diaPago: string,
  hoy: string,
): { pagadoHasta: string | null; estadoLabel: "Al día" | "Pendiente" | "Mora" } {
  const conf = pagosC.filter(p => p.estado === "Confirmado").sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (!conf.length) return { pagadoHasta: null, estadoLabel: "Mora" };
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const targetDay = norm(diaPago) === "miercoles" ? 3 : 1;
  const d = new Date(hoy + "T00:00:00");
  while (d.getDay() !== targetDay) d.setDate(d.getDate() - 1);
  const inicioPeriodo = d.toISOString().slice(0, 10);
  const pagoPeriodo = conf.find(p => p.fecha >= inicioPeriodo);
  if (pagoPeriodo) {
    const hasta = new Date(d); hasta.setDate(hasta.getDate() + 6);
    return { pagadoHasta: hasta.toISOString().slice(0, 10), estadoLabel: "Al día" };
  }
  const anterior = new Date(d); anterior.setDate(anterior.getDate() - 7);
  const pagoAnterior = conf.find(p => p.fecha >= anterior.toISOString().slice(0, 10));
  if (pagoAnterior) {
    const hasta = new Date(anterior); hasta.setDate(hasta.getDate() + 6);
    return { pagadoHasta: hasta.toISOString().slice(0, 10), estadoLabel: "Pendiente" };
  }
  return { pagadoHasta: conf[0]?.fecha ?? null, estadoLabel: "Mora" };
}

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
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const targetDay = norm(diaPago) === "miercoles" ? 3 : 1;
  const d = new Date(hoy + "T00:00:00");
  while (d.getDay() !== targetDay) d.setDate(d.getDate() - 1);
  const inicioPeriodo = d.toISOString().slice(0, 10);
  const pagoPeriodo = conf.find(p => p.fecha >= inicioPeriodo);
  if (pagoPeriodo) return 0;
  return Math.floor((new Date(hoy + "T00:00:00").getTime() - d.getTime()) / 86400000);
}

// Protocolo de mora: pasos ordenados
function getProtocoloStep(dias: number): { paso: number; label: string; color: string; bg: string } {
  if (dias === 0) return { paso: 0, label: "Al día", color: "#166534", bg: "#dcfce7" };
  if (dias === 1) return { paso: 1, label: "Gabela — mensaje + llamada", color: "#92400e", bg: "#fef3c7" };
  if (dias === 2) return { paso: 2, label: "Apagado remoto (detenido)", color: "#c2410c", bg: "#fff7ed" };
  if (dias <= 4)  return { paso: 3, label: "En mora — inmovilizar", color: "#991b1b", bg: "#fee2e2" };
  return { paso: 4, label: "Recolección urgente", color: "#7f1d1d", bg: "#fca5a5" };
}

type Fila = {
  contratoId: string;
  clienteId: string;
  motoId: string;
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
  pagadoHasta: string | null;
  estadoLabel: "Al día" | "Pendiente" | "Mora";
  prioridad: "critica" | "alta" | "media";
};

const PRIORIDAD: Record<string, { bg: string; color: string; border: string; label: string }> = {
  critica: { bg: "#fff5f5", color: "#991b1b", border: "#fecaca", label: "Crítica" },
  alta:    { bg: "#fefce8", color: "#92400e", border: "#fde68a", label: "Alta" },
  media:   { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa", label: "Media" },
};

const ESTADO_COLOR: Record<string, { bg: string; color: string }> = {
  "Al día":    { bg: "#dcfce7", color: "#166534" },
  "Pendiente": { bg: "#fef3c7", color: "#92400e" },
  "Mora":      { bg: "#fee2e2", color: "#991b1b" },
};

export default function CobroDiarioView({ onNavigate }: { onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const diaSem = new Date(hoy + "T00:00:00").getDay();
  const esLunes = diaSem === 1;
  const esMiercoles = diaSem === 3;

  const [tab, setTab] = useState<Tab>("hoy");
  const [busqueda, setBusqueda] = useState("");
  const [filtroDia, setFiltroDia] = useState<FiltroDia>("todos");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [deudaId, setDeudaId] = useState<string | null>(null);
  const [convenioId, setConvenioId] = useState<string | null>(null);
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);
  const [cobrarValor, setCobrarValor] = useState("");
  const [cobrarMetodo, setCobrarMetodo] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [cobrandoLoading, setCobrandoLoading] = useState(false);
  const [cobrarError, setCobrarError] = useState<string | null>(null);
  const [cerrandoCaja, setCerrandoCaja] = useState(false);
  const [notasCaja, setNotasCaja] = useState("");
  const [msgCaja, setMsgCaja] = useState<string | null>(null);

  const { profile } = useAuth();
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos, registrarPago } = usePagos();
  const { cerrarCaja, cajaDia } = useCaja();

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
        const valorPeriodo = (c as { valor_periodo?: number }).valor_periodo ?? c.valor_semanal ?? valorPactado * 7;
        const esContratoDiario = (c.forma_pago ?? "").toLowerCase() === "diario";
        const tipoRuta = esContratoDiario ? "diario" : "semanal";
        const diaPago = c.dia_pago ?? "Lunes";
        const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        const diaPagoNorm = norm(diaPago);
        const dias = calcDiasConPeriodo(pagosC, tipoRuta, diaPago, hoy);
        const pagadosHoy = pagosC.filter(p => p.fecha === hoy && p.estado === "Confirmado");
        const pagadoHoy = pagadosHoy.reduce((s, p) => s + p.valor, 0);
        const pagaHoy = esContratoDiario
          ? true
          : (diaPagoNorm === "lunes" && esLunes) || (diaPagoNorm === "miercoles" && esMiercoles);
        const { pagadoHasta, estadoLabel } = esContratoDiario
          ? {
              pagadoHasta: pagosC.filter(p => p.estado === "Confirmado").sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha ?? null,
              estadoLabel: (dias === 0 ? "Al día" : dias === 1 ? "Pendiente" : "Mora") as "Al día" | "Pendiente" | "Mora",
            }
          : calcPagadoHasta(pagosC, diaPago, hoy);
        const prioridad: Fila["prioridad"] = dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media";

        return {
          contratoId: c.id,
          clienteId: c.cliente_id,
          motoId: moto?.id ?? "",
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
          pagadoHasta,
          estadoLabel,
          prioridad,
        };
      });
  }, [contratos, clientes, motos, pagos, hoy, esLunes, esMiercoles]);

  const filasHoy = useMemo(() => filas.filter(f => f.pagaHoy), [filas]);
  const filasSemanal = useMemo(() =>
    filas.filter(f => f.tipoRuta !== "diario").sort((a, b) => {
      const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      const dA = norm(a.diaPago), dB = norm(b.diaPago);
      if (dA !== dB) return dA.localeCompare(dB);
      return a.clienteNombre.localeCompare(b.clienteNombre);
    }), [filas]);
  const filasMora = useMemo(() =>
    filas.filter(f => f.diasSinPago > 0 && f.diasSinPago < 999).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);
  const filasInmov = useMemo(() =>
    filas.filter(f => f.diasSinPago >= 3).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);

  const kpiRecaudado = useMemo(() => pagos.filter(p => p.fecha === hoy && p.estado === "Confirmado").reduce((s, p) => s + p.valor, 0), [pagos, hoy]);
  const kpiEsperado  = useMemo(() => filasHoy.reduce((s, f) => s + f.valorPactado, 0), [filasHoy]);
  const kpiMora      = useMemo(() => filasMora.reduce((s, f) => s + f.deudaEstimada, 0), [filasMora]);
  const pagaronHoy   = useMemo(() => filasHoy.filter(f => f.pagadoHoyBool).length, [filasHoy]);
  const progressPct  = kpiEsperado > 0 ? Math.min(100, Math.round((kpiRecaudado / kpiEsperado) * 100)) : 0;

  const fechaHoy = new Date(hoy + "T00:00:00");
  const fechaDisplay = `${DIAS_LABEL[fechaHoy.getDay()]} ${fechaHoy.getDate()} de ${MESES_FULL[fechaHoy.getMonth()]} ${fechaHoy.getFullYear()}`;

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
    window.open(`tel:+57${tel.replace(/\D/g, "")}`);
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
    const { error } = await registrarPago(f.contratoId, valor, cobrarMetodo, aplicado, { registradoPor: profile?.id });
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

  // ── Botones de acción reutilizables ───────────────────────────────────────
  function AccionesBtns({ f, vertical = false }: { f: Fila; vertical?: boolean }) {
    const s: React.CSSProperties = {
      padding: "6px 10px", borderRadius: 8, border: "none",
      cursor: "pointer", fontSize: 12, fontWeight: 700,
    };
    return (
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
        {!f.pagadoHoyBool && (
          <button onClick={() => abrirCobrar(f)} style={{ ...s, background: "#0f172a", color: "white" }} title="Registrar pago">💳</button>
        )}
        {f.clienteTel && (
          <>
            <button onClick={() => abrirLlamada(f.clienteTel)} style={{ ...s, background: "#dbeafe", color: "#1d4ed8" }} title="Llamar">📞</button>
            <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago > 0 ? f.diasSinPago : 0)} style={{ ...s, background: "#dcfce7", color: "#166534" }} title="WhatsApp">💬</button>
          </>
        )}
        <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ ...s, background: "#fef3c7", color: "#92400e" }} title="Gestión">📋</button>
        <button onClick={() => setDeudaId(f.contratoId)} style={{ ...s, background: "#fee2e2", color: "#991b1b" }} title="Deuda">⚠️</button>
        {onNavigate && (
          <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ ...s, background: "#eff6ff", color: "#0284c7" }} title="Ver ficha cliente">👤</button>
        )}
        {onNavigate && f.motoId && (
          <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ ...s, background: "#f0fdf4", color: "#166534" }} title="Ver ficha moto">🏍️</button>
        )}
      </div>
    );
  }

  // ── Modal cobrar ──────────────────────────────────────────────────────────
  const modalCobrar = cobrandoId ? (() => {
    const f = filas.find(x => x.contratoId === cobrandoId);
    if (!f) return null;
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={e => { if (e.target === e.currentTarget) setCobrandoId(null); }}
      >
        <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 2, textTransform: "uppercase" }}>{f.clienteNombre}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {f.placa !== "—" && (
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0284c7", background: "#eff6ff", padding: "2px 10px", borderRadius: 999 }}>🏍️ {f.placa}</span>
            )}
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Valor pactado: <strong>${fmt(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo)}</strong>
              /{f.tipoRuta === "diario" ? "día" : "sem"}
            </span>
          </div>
          {f.diasSinPago > 0 && (
            <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
              ⚠️ {f.diasSinPago} días sin pago · {getProtocoloStep(f.diasSinPago).label}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Valor a cobrar</div>
            <input
              type="number"
              value={cobrarValor}
              onChange={e => setCobrarValor(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 18, fontWeight: 800, textAlign: "center" }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Efectivo", "Transferencia"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setCobrarMetodo(m)}
                  disabled={m === "Efectivo" && !esSecretaria}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                    cursor: m === "Efectivo" && !esSecretaria ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 13,
                    background: cobrarMetodo === m ? (m === "Efectivo" ? "#dcfce7" : "#dbeafe") : "#f1f5f9",
                    color: cobrarMetodo === m ? (m === "Efectivo" ? "#166534" : "#1d4ed8") : "#94a3b8",
                    opacity: m === "Efectivo" && !esSecretaria ? 0.4 : 1,
                  }}
                >
                  {m === "Efectivo" ? "💵 Efectivo" : "🏦 Transfer."}
                </button>
              ))}
            </div>
            {!esSecretaria && <div style={{ fontSize: 11, color: "#92400e", marginTop: 6 }}>Solo la secretaria registra efectivo</div>}
          </div>
          {cobrarError && (
            <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>{cobrarError}</div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCobrandoId(null)}
              style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}
            >
              Cancelar
            </button>
            <button
              onClick={() => handleCobrar(f)}
              disabled={cobrandoLoading}
              style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", background: "#0f172a", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: cobrandoLoading ? 0.7 : 1 }}
            >
              {cobrandoLoading ? "Registrando..." : "✅ Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  // ── Tarjeta "Hoy" ────────────────────────────────────────────────────────
  function TarjetaHoy({ f }: { f: Fila }) {
    const prot = getProtocoloStep(f.diasSinPago);
    return (
      <div style={{
        background: "white", borderRadius: 16, padding: "14px 16px",
        boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
        borderLeft: f.pagadoHoyBool ? "4px solid #22c55e" : f.diasSinPago > 0 ? `4px solid ${prot.color}` : "4px solid #e2e8f0",
      }}>
        {/* Fila superior */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {onNavigate && f.motoId
                ? <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{f.placa}</button>
                : <span style={{ fontWeight: 800, fontSize: 14 }}>{f.placa}</span>
              }
              <span style={{ fontSize: 12, color: "#64748b" }}>·</span>
              {onNavigate
                ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                : <span style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{f.clienteNombre}</span>
              }
              {f.pagadoHoyBool
                ? <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>✅ Pagado</span>
                : <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Pendiente</span>
              }
            </div>
            {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}

            {/* Protocolo si tiene días sin pago */}
            {f.diasSinPago > 0 && (
              <div style={{ marginTop: 6, padding: "4px 10px", borderRadius: 8, background: prot.bg, display: "inline-block", fontSize: 11, fontWeight: 700, color: prot.color }}>
                ⚡ Paso {prot.paso}: {prot.label} ({f.diasSinPago}d sin pago)
              </div>
            )}

            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  ${fmt(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo)}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#64748b", marginLeft: 4 }}>
                    /{f.tipoRuta === "diario" ? "día" : "sem"}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>valor pactado</div>
              </div>
              {f.pagadoHoyBool && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>${fmt(f.pagadoHoy)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>pagado hoy</div>
                </div>
              )}
              {f.pagadoHasta && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFechaCarta(f.pagadoHasta)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>pagado hasta</div>
                </div>
              )}
              {f.tipoRuta === "diario" && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: "#166534" }}>${fmt(f.tarifaDiaria)}</span>
                    <span style={{ color: "#64748b" }}> + </span>
                    <span style={{ color: "#0284c7" }}>${fmt(f.ahorroDiario)} ahorro</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>desglose</div>
                </div>
              )}
            </div>
          </div>

          {/* Botones acción lado derecho */}
          <AccionesBtns f={f} vertical />
        </div>
      </div>
    );
  }

  // ── Tab "Hoy" contenido ───────────────────────────────────────────────────
  const listaHoy = filtrar(filasHoy);
  const pendientesHoy = listaHoy.filter(f => !f.pagadoHoyBool).length;
  const pagadosHoyCount = listaHoy.filter(f => f.pagadoHoyBool).length;

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Cobro Diario</h2>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{fechaDisplay}</div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120, background: "#dcfce7", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Recaudado hoy</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#166534" }}>${fmt(kpiRecaudado)}</div>
          <div style={{ fontSize: 11, color: "#166534", marginTop: 2, opacity: 0.8 }}>{pagaronHoy} de {filasHoy.length} pagaron</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: "#dbeafe", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>Esperado hoy</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#1d4ed8" }}>${fmt(kpiEsperado)}</div>
          <div style={{ fontSize: 11, color: "#1d4ed8", marginTop: 2, opacity: 0.8 }}>{pendientesHoy} pendientes</div>
        </div>
        <div style={{ flex: 1, minWidth: 120, background: "#fee2e2", borderRadius: 14, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Cartera mora</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#991b1b" }}>${fmt(kpiMora)}</div>
          <div style={{ fontSize: 11, color: "#991b1b", marginTop: 2, opacity: 0.8 }}>{filasMora.length} contratos</div>
        </div>
      </div>

      {/* Barra de progreso recaudo */}
      {kpiEsperado > 0 && (
        <div style={{ marginBottom: 14, background: "white", borderRadius: 14, padding: "12px 16px", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: "#334155" }}>Progreso del día</span>
            <span style={{ fontWeight: 800, color: progressPct >= 100 ? "#166534" : "#0284c7" }}>{progressPct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              width: `${progressPct}%`,
              background: progressPct >= 100 ? "#22c55e" : progressPct >= 60 ? "#0284c7" : "#f59e0b",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
            <span>${fmt(kpiRecaudado)} recaudado</span>
            <span>Falta ${fmt(Math.max(0, kpiEsperado - kpiRecaudado))}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "white", borderRadius: 12, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)", flexWrap: "wrap" }}>
        {([
          { key: "hoy",         label: `Hoy (${filasHoy.length})` },
          { key: "semanal",     label: `Cartera (${filasSemanal.length})` },
          { key: "mora",        label: `Mora (${filasMora.length})` },
          { key: "inmovilizar", label: `Inmovilizar (${filasInmov.length})` },
          { key: "caja",        label: "🏦 Caja" },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 700,
              background: tab === t.key ? "#0f172a" : "transparent",
              color: tab === t.key ? "white" : "#64748b",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar cliente o placa..."
        style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12 }}
      />

      {/* ── Tab Hoy ── */}
      {tab === "hoy" && (
        <div>
          {/* Subresumen */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700 }}>
              ✅ {pagadosHoyCount} pagaron
            </span>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>
              ⏳ {pendientesHoy} pendientes
            </span>
            {listaHoy.filter(f => f.diasSinPago > 0).length > 0 && (
              <span style={{ padding: "4px 12px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 700 }}>
                🔴 {listaHoy.filter(f => f.diasSinPago > 0).length} con mora
              </span>
            )}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {listaHoy.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
                <div style={{ fontSize: 32 }}>📅</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>Sin cobros programados para hoy</div>
              </div>
            )}
            {/* Primero pendientes, luego pagados */}
            {[...listaHoy.filter(f => !f.pagadoHoyBool), ...listaHoy.filter(f => f.pagadoHoyBool)].map(f => (
              <TarjetaHoy key={f.contratoId} f={f} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tab Cartera Semanal ── */}
      {tab === "semanal" && (() => {
        const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        let lista = filtrar(filasSemanal);
        if (filtroDia !== "todos") lista = lista.filter(f => norm(f.diaPago) === filtroDia);
        if (filtroEstado !== "todos") lista = lista.filter(f =>
          filtroEstado === "al-dia" ? f.estadoLabel === "Al día" :
          filtroEstado === "pendiente" ? f.estadoLabel === "Pendiente" :
          f.estadoLabel === "Mora"
        );
        const lunes     = lista.filter(f => norm(f.diaPago) === "lunes");
        const miercoles = lista.filter(f => norm(f.diaPago) === "miercoles");
        const otros     = lista.filter(f => norm(f.diaPago) !== "lunes" && norm(f.diaPago) !== "miercoles");
        const grupos = [
          { label: `Lunes (${lunes.length})`,      filas: lunes,     color: "#1d4ed8", bg: "#dbeafe", pagaHoyGrupo: esLunes },
          { label: `Miércoles (${miercoles.length})`, filas: miercoles, color: "#7c3aed", bg: "#ede9fe", pagaHoyGrupo: esMiercoles },
          ...(otros.length > 0 ? [{ label: `Otro (${otros.length})`, filas: otros, color: "#334155", bg: "#f1f5f9", pagaHoyGrupo: false }] : []),
        ].filter(g => g.filas.length > 0);

        return (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {(["todos","lunes","miercoles"] as FiltroDia[]).map(d => (
                <button key={d} onClick={() => setFiltroDia(d)} style={{ padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: filtroDia === d ? "#0f172a" : "#f1f5f9", color: filtroDia === d ? "white" : "#64748b" }}>
                  {d === "todos" ? "Todos" : d === "lunes" ? "🔵 Lunes" : "🟣 Miércoles"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {(["todos","al-dia","pendiente","mora"] as FiltroEstado[]).map(e => (
                <button key={e} onClick={() => setFiltroEstado(e)} style={{ padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: filtroEstado === e ? "#0f172a" : "#f1f5f9", color: filtroEstado === e ? "white" : "#64748b" }}>
                  {e === "todos" ? `Todos (${filasSemanal.length})` :
                   e === "al-dia" ? `✅ Al día (${filasSemanal.filter(f=>f.estadoLabel==="Al día").length})` :
                   e === "pendiente" ? `⏳ Pendiente (${filasSemanal.filter(f=>f.estadoLabel==="Pendiente").length})` :
                   `🔴 Mora (${filasSemanal.filter(f=>f.estadoLabel==="Mora").length})`}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {grupos.map(g => (
                <div key={g.label}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ padding: "4px 12px", borderRadius: 999, background: g.bg, color: g.color, fontWeight: 800, fontSize: 13 }}>{g.label}</div>
                    {g.pagaHoyGrupo && <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>⚡ Paga HOY</span>}
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {g.filas.map(f => {
                      const ec = ESTADO_COLOR[f.estadoLabel] ?? ESTADO_COLOR["Mora"];
                      const prot = getProtocoloStep(f.diasSinPago);
                      return (
                        <div key={f.contratoId} style={{ background: "white", borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 8px rgba(15,23,42,0.06)", borderLeft: `4px solid ${ec.color}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                {onNavigate && f.motoId
                                  ? <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 13, color: "#0284c7" }}>{f.placa}</button>
                                  : <span style={{ fontWeight: 800, fontSize: 13 }}>{f.placa}</span>
                                }
                                <span style={{ fontSize: 12, color: "#64748b" }}>·</span>
                                {onNavigate
                                  ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                                  : <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                                }
                                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: ec.bg, color: ec.color }}>{f.estadoLabel}</span>
                                {f.pagadoHoyBool && g.pagaHoyGrupo && <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>✅ Pagó hoy</span>}
                              </div>
                              {f.diasSinPago > 0 && (
                                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: prot.color }}>
                                  ⚡ {prot.label} · {f.diasSinPago}d sin pago
                                </div>
                              )}
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <span>${fmt(f.valorPeriodo)}/sem</span>
                                {f.pagadoHasta && <span>Hasta: <strong>{fmtFechaCarta(f.pagadoHasta)}</strong></span>}
                                {f.diasSinPago > 0 && f.deudaEstimada > 0 && (
                                  <span style={{ color: "#dc2626", fontWeight: 700 }}>Deuda ~${fmt(f.deudaEstimada)}</span>
                                )}
                              </div>
                            </div>
                            <AccionesBtns f={f} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {lista.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
                  <div style={{ fontSize: 32 }}>🔍</div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>Sin resultados</div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Tab Mora ── */}
      {tab === "mora" && (
        <div>
          {/* Leyenda protocolo */}
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: "#334155", marginBottom: 6 }}>Protocolo de mora:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { label: "1d · Gabela", color: "#92400e", bg: "#fef3c7" },
                { label: "2d · Apagado remoto", color: "#c2410c", bg: "#fff7ed" },
                { label: "3-4d · Inmovilizar", color: "#991b1b", bg: "#fee2e2" },
                { label: "5d+ · Recolección urgente", color: "#7f1d1d", bg: "#fca5a5" },
              ].map(p => (
                <span key={p.label} style={{ padding: "3px 10px", borderRadius: 999, background: p.bg, color: p.color, fontSize: 11, fontWeight: 700 }}>{p.label}</span>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {filtrar(filasMora).length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 24px", background: "white", borderRadius: 16 }}>
                <div style={{ fontSize: 32 }}>✅</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>Sin contratos en mora</div>
              </div>
            )}
            {filtrar(filasMora).map(f => {
              const prot = getProtocoloStep(f.diasSinPago);
              return (
                <div key={f.contratoId} style={{ background: "white", borderRadius: 16, padding: "14px 16px", boxShadow: "0 2px 12px rgba(15,23,42,0.07)", borderLeft: `4px solid ${prot.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {onNavigate && f.motoId
                          ? <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{f.placa}</button>
                          : <span style={{ fontWeight: 800, fontSize: 14 }}>{f.placa}</span>
                        }
                        <span style={{ fontSize: 12, color: "#64748b" }}>·</span>
                        {onNavigate
                          ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                          : <span style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                        }
                        {f.clienteTel && <span style={{ fontSize: 12, color: "#64748b" }}>· {f.clienteTel}</span>}
                      </div>
                      {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}

                      {/* Protocolo actual */}
                      <div style={{ marginTop: 8, padding: "6px 12px", borderRadius: 10, background: prot.bg, display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: prot.color }}>{f.diasSinPago === 999 ? "∞" : f.diasSinPago}</span>
                        <div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: prot.color }}>Paso {prot.paso}: {prot.label}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaEstimada)}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                        </div>
                        {f.pagadoHasta && (
                          <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtFechaCarta(f.pagadoHasta)}</div>
                            <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>último pago hasta</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <AccionesBtns f={f} vertical />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Inmovilizar ── */}
      {tab === "inmovilizar" && (
        <div>
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", gap: 8 }}>
            <span>📡</span>
            <span><strong>GPS no conectado.</strong> Sirena y apagado remoto disponibles al integrar la plataforma GPS. Solo usar con vehículo <strong>detenido</strong>. Máximo 1 hora apagado.</span>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {onNavigate && f.motoId
                          ? <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{f.placa}</button>
                          : <span style={{ fontWeight: 800, fontSize: 14 }}>{f.placa}</span>
                        }
                        <span style={{ fontSize: 12, color: "#64748b" }}>·</span>
                        {onNavigate
                          ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                          : <span style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                        }
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.border, color: s.color }}>{s.label}</span>
                      </div>
                      {f.marca && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{f.marca}</div>}
                      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{f.diasSinPago === 999 ? "∞" : f.diasSinPago}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
                        </div>
                        <div style={{ borderLeft: `1px solid ${s.border}`, paddingLeft: 12 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>${fmt(f.deudaEstimada)}</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: "rgba(0,0,0,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, width: `${Math.min(100, (f.diasSinPago / 14) * 100)}%`, background: f.prioridad === "critica" ? "#ef4444" : f.prioridad === "alta" ? "#f59e0b" : "#f97316" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                      <button onClick={() => abrirCobrar(f)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#0f172a", color: "white" }}>💳</button>
                      {f.clienteTel && (
                        <>
                          <button onClick={() => abrirLlamada(f.clienteTel)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>📞</button>
                          <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.diasSinPago)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬</button>
                        </>
                      )}
                      <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>📋</button>
                      {onNavigate && (
                        <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>👤</button>
                      )}
                      <button disabled title="Requiere GPS" style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}>🚨</button>
                      <button disabled title="Requiere GPS" style={{ padding: "6px 10px", borderRadius: 8, border: "none", cursor: "not-allowed", fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}>🔴</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Caja ── */}
      {tab === "caja" && (() => {
        const pagosHoy = pagos.filter(p => p.fecha === hoy && p.estado === "Confirmado");
        const efectivoHoy = pagosHoy.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
        const transHoy = pagosHoy.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
        const totalHoy = efectivoHoy + transHoy;
        return (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140, background: "#dcfce7", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>💵 Efectivo</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#166534" }}>${fmt(efectivoHoy)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: "#dbeafe", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>🏦 Transferencias</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#1d4ed8" }}>${fmt(transHoy)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 140, background: "#0f172a", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Total del día</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>${fmt(totalHoy)}</div>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 800, fontSize: 14 }}>
                Pagos recibidos hoy — {pagosHoy.length} registros
              </div>
              {pagosHoy.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#64748b", fontSize: 14 }}>Sin pagos registrados hoy</div>
              )}
              {pagosHoy.map((p, i) => {
                const c = contratos.find(x => x.id === p.contrato_id);
                const cl = clientes.find(x => x.id === c?.cliente_id);
                const m = motos.find(x => x.id === c?.moto_id);
                return (
                  <div key={p.id ?? i} style={{ padding: "10px 16px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                        {m?.placa ?? "—"} · {cl?.nombre ?? "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{p.metodo}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>${fmt(p.valor)}</div>
                      {onNavigate && cl && (
                        <button onClick={() => onNavigate("ficha_cliente", cl.id)} style={{ padding: "3px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>
                          Ver ficha
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!esSecretaria ? (
              <div style={{ padding: "10px 14px", background: "#fef3c7", borderRadius: 12, fontSize: 12, color: "#92400e" }}>
                Solo la secretaria puede cerrar la caja.
              </div>
            ) : cajaDia(hoy) ? (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 700, color: "#166534" }}>
                ✅ Caja cerrada — ${fmt(cajaDia(hoy)!.total)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea
                  value={notasCaja}
                  onChange={e => setNotasCaja(e.target.value)}
                  placeholder="Notas del cierre (opcional)..."
                  rows={2}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "vertical" }}
                />
                {msgCaja && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: msgCaja.startsWith("Error") ? "#fee2e2" : "#dcfce7", color: msgCaja.startsWith("Error") ? "#991b1b" : "#166534" }}>
                    {msgCaja}
                  </div>
                )}
                <button
                  disabled={cerrandoCaja || totalHoy === 0}
                  onClick={async () => {
                    setCerrandoCaja(true);
                    setMsgCaja(null);
                    const detalle = pagosHoy.map(p => {
                      const c = contratos.find(x => x.id === p.contrato_id);
                      const cl = clientes.find(x => x.id === c?.cliente_id);
                      const m = motos.find(x => x.id === c?.moto_id);
                      return { placa: m?.placa ?? "—", nombre: cl?.nombre ?? "—", valor: p.valor, metodo: p.metodo };
                    });
                    const { error } = await cerrarCaja({
                      fecha: hoy,
                      efectivo: efectivoHoy,
                      transferencias: transHoy,
                      total: totalHoy,
                      detalle,
                      cerradoPor: profile?.id ?? null,
                      notas: notasCaja.trim() || undefined,
                    });
                    setCerrandoCaja(false);
                    if (error) setMsgCaja(`Error: ${error}`);
                    else { setMsgCaja(`Caja cerrada — $${fmt(totalHoy)}`); setNotasCaja(""); }
                  }}
                  style={{ padding: "14px", borderRadius: 14, border: "none", cursor: cerrandoCaja || totalHoy === 0 ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 15, background: totalHoy === 0 ? "#e2e8f0" : "#166534", color: totalHoy === 0 ? "#94a3b8" : "white", opacity: cerrandoCaja ? 0.7 : 1 }}
                >
                  {cerrandoCaja ? "Cerrando..." : `✅ Cerrar caja del día — $${fmt(totalHoy)}`}
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {modalCobrar}
      {gestionId && <ModalGestion contratoId={gestionId} clienteNombre={gestionNombre} onClose={() => setGestionId(null)} />}
      {deudaId && <ModalDeuda contratoId={deudaId} clienteNombre={filas.find(f => f.contratoId === deudaId)?.clienteNombre ?? ""} onClose={() => setDeudaId(null)} />}
      {convenioId && <ModalConvenio contratoId={convenioId} clienteNombre={filas.find(f => f.contratoId === convenioId)?.clienteNombre ?? ""} onClose={() => setConvenioId(null)} />}
    </div>
  );
}
