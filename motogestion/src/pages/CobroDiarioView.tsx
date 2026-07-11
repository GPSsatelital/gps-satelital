import { useMemo, useState, useEffect } from "react";
import type { ViewKey } from "../App";
import { useContratos, diasDesdeUltimoPago, corteMigracionGrupo } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { usePagos, calcularAplicacion, esPagoDeCaja } from "../hooks/usePagos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useCaja } from "../hooks/useCaja";
import { useMensajesWhatsapp } from "../hooks/useMensajesWhatsapp";
import { useAuth } from "../contexts/AuthContext";
import {
  esDiaDePago,
  inicioPeriodoActual,
  proximoDiaPago,
  calcularEstadoCartera as calcularEstadoCarteraCiclo,
  calcularAhorroAplicado,
  tarifaPagadaPeriodoActual,
  estaEnProrrateo,
  inicioVentanaPagosISO,
  formatDiaPago,
} from "../utils/cicloPago";
import { hoyISO } from "../utils/fecha";
import ModalGestion from "../components/ModalGestion";
import ModalDeuda from "../components/ModalDeuda";
import ModalConvenio from "../components/ModalConvenio";
import ModalConfirmarPago from "../components/ModalConfirmarPago";
import MoneyInput from "../components/MoneyInput";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

type Tab = "diario" | "periodico" | "gabela" | "pagaron" | "caja";

const GRUPOS_CAJA: GrupoMoto[] = ["COSTA", "PRADERA", "RASTREADOR", "USADAS"];
const COLOR_GRUPO_CAJA: Record<GrupoMoto, string> = { COSTA: "#0369a1", PRADERA: "#166534", RASTREADOR: "#92400e", USADAS: "#6d28d9", OTRO: "#334155" };
const DIAS_LABEL = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_LABEL = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESES_FULL = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function fmtFechaCarta(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${DIAS_LABEL[d.getDay()]} ${d.getDate()} ${MESES_LABEL[d.getMonth()]}`;
}

// Contratos de tiempo definido (Semanal/Quincenal/Mensual) — usa el ciclo real del
// contrato (cicloPago.ts) en vez de asumir siempre lunes/miércoles semanal.
function calcEstadoPeriodico(
  contrato: { forma_pago: string; dia_pago: string; dias_pago_mes?: number[] | null; fecha_entrega?: string | null; tarifa_diaria?: number; ahorro_diario?: number; tarifa_domingo?: number; ahorro_domingo?: number; valor_semanal?: number },
  pagosC: Array<{ fecha: string; estado: string; valor: number }>,
  hoy: string,
): { pagadoHasta: string | null; estadoLabel: "Al día" | "Pendiente" | "Mora"; dias: number } {
  const hoyDate = new Date(hoy + "T00:00:00");
  const conf = pagosC.filter(p => p.estado === "Confirmado").sort((a, b) => b.fecha.localeCompare(a.fecha));
  const inicioPeriodo = inicioPeriodoActual(contrato, hoyDate);
  // Misma ventana que calcularEstadoCartera (período real + prepago de víspera)
  const inicioISO = inicioVentanaPagosISO(contrato, hoyDate);
  const estado = calcularEstadoCarteraCiclo(contrato, conf, hoyDate);
  const estadoLabel = estado === "al-dia" ? "Al día" : estado === "gabela" ? "Pendiente" : "Mora";
  const dias = estado === "al-dia" ? 0 : Math.max(Math.floor((hoyDate.getTime() - inicioPeriodo.getTime()) / 86400000), 0);

  if (estado === "al-dia") {
    const proximo = proximoDiaPago(contrato, inicioPeriodo);
    proximo.setDate(proximo.getDate() - 1);
    const pagoPeriodo = conf.find(p => p.fecha >= inicioISO);
    return { pagadoHasta: pagoPeriodo ? proximo.toISOString().slice(0, 10) : null, estadoLabel, dias };
  }
  return { pagadoHasta: conf[0]?.fecha ?? null, estadoLabel, dias };
}

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
  deudaReal: number;
  cuotaConvenioFila: number;
  convenioActivoId: string | null;
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

export default function CobroDiarioView({ onNavigate }: { onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const hoy = hoyISO();

  const [tab, setTab] = useState<Tab>("diario");
  const [busqueda, setBusqueda] = useState("");
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [deudaId, setDeudaId] = useState<string | null>(null);
  const [convenioId, setConvenioId] = useState<string | null>(null);
  const [cobrandoId, setCobrandoId] = useState<string | null>(null);
  const [cobrarValor, setCobrarValor] = useState("");
  const [cobrarMetodo, setCobrarMetodo] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [cobrarNota, setCobrarNota] = useState("");
  const [cobrandoLoading, setCobrandoLoading] = useState(false);
  const [confirmarCobroOpen, setConfirmarCobroOpen] = useState(false);
  const [cobrarError, setCobrarError] = useState<string | null>(null);
  const [cerrandoCaja, setCerrandoCaja] = useState<GrupoMoto | null>(null);
  const [notasCaja, setNotasCaja] = useState("");
  const [msgCaja, setMsgCaja] = useState<string | null>(null);

  const { profile } = useAuth();
  const { render: renderMsg } = useMensajesWhatsapp();
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos, registrarPago } = usePagos();
  const { deudas } = useDeudas();
  const { convenioActivoDelContrato } = useConvenios();
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
        const diaPago = esContratoDiario ? "Diario" : formatDiaPago(c);
        const pagadosHoy = pagosC.filter(p => p.fecha === hoy && p.estado === "Confirmado" && esPagoDeCaja(p));
        const pagadoHoy = pagadosHoy.reduce((s, p) => s + p.valor, 0);
        const pagaHoy = esContratoDiario ? true : esDiaDePago(c, new Date(hoy + "T00:00:00"));
        const { dias, pagadoHasta, estadoLabel } = esContratoDiario
          ? (() => {
              const confDiario = pagosC.filter(p => p.estado === "Confirmado").sort((a, b) => b.fecha.localeCompare(a.fecha));
              const d = diasDesdeUltimoPago(confDiario[0]?.fecha ?? null, c.fecha_entrega ?? null, corteMigracionGrupo(moto?.grupo)) ?? 999;
              return {
                dias: d,
                pagadoHasta: confDiario[0]?.fecha ?? null,
                estadoLabel: (d === 0 ? "Al día" : d === 1 ? "Pendiente" : "Mora") as "Al día" | "Pendiente" | "Mora",
              };
            })()
          : calcEstadoPeriodico(c, pagosC, hoy);
        const prioridad: Fila["prioridad"] = dias >= 10 ? "critica" : dias >= 5 ? "alta" : "media";
        const deudaReal = deudas.filter(d => d.contrato_id === c.id && d.estado !== "pagada").reduce((s, d) => s + d.monto_pendiente, 0);
        const convActivo = convenioActivoDelContrato(c.id);

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
          // Incluye la deuda ya registrada (ej. saldo de apertura migrado), no solo el estimado
          // por días sin pago — antes un migrado con deuda real mostraba $0 hasta su primer pago.
          deudaEstimada: deudaReal + (dias > 0 && dias < 999 ? Math.min(dias, 30) * valorPactado : 0),
          deudaReal,
          cuotaConvenioFila: convActivo?.cuota_por_periodo ?? 0,
          convenioActivoId: convActivo?.id ?? null,
          pagadoHoy,
          pagaHoy,
          pagadoHoyBool: pagadoHoy > 0,
          pagadoHasta,
          estadoLabel,
          prioridad,
        };
      });
  }, [contratos, clientes, motos, pagos, deudas, convenioActivoDelContrato, hoy]);

  // Tab data
  const filasHoy = useMemo(() => filas.filter(f => f.tipoRuta === "diario"), [filas]);
  const filasPeriodicaHoy = useMemo(() => filas.filter(f => f.tipoRuta !== "diario" && f.pagaHoy), [filas]);
  const filasGabela = useMemo(() => filas.filter(f => f.diasSinPago === 1), [filas]);
  const filasMora = useMemo(() => filas.filter(f => f.diasSinPago > 0 && f.diasSinPago < 999).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);
  const filasPagaronHoy = useMemo(() => filas.filter(f => f.pagadoHoyBool), [filas]);
  const filasInmov = useMemo(() => filas.filter(f => f.diasSinPago >= 3).sort((a, b) => b.diasSinPago - a.diasSinPago), [filas]);

  const kpiRecaudado = useMemo(() => pagos.filter(p => p.fecha === hoy && p.estado === "Confirmado" && esPagoDeCaja(p)).reduce((s, p) => s + p.valor, 0), [pagos, hoy]);
  const kpiEsperadoDiario = useMemo(() => filasHoy.reduce((s, f) => s + f.valorPactado, 0), [filasHoy]);
  const kpiEsperadoPeriodico = useMemo(() => filasPeriodicaHoy.reduce((s, f) => s + f.valorPeriodo, 0), [filasPeriodicaHoy]);
  const kpiEsperado = kpiEsperadoDiario + kpiEsperadoPeriodico;
  const kpiMora = useMemo(() => filasMora.reduce((s, f) => s + f.deudaEstimada, 0), [filasMora]);
  const totalPagaronHoy = filasPagaronHoy.length;
  const totalEsperadosHoy = filasHoy.length + filasPeriodicaHoy.length;
  const progressPct = kpiEsperado > 0 ? Math.min(100, Math.round((kpiRecaudado / kpiEsperado) * 100)) : 0;

  const fechaHoy = new Date(hoy + "T00:00:00");
  const fechaDisplay = `${DIAS_LABEL[fechaHoy.getDay()]} ${fechaHoy.getDate()} de ${MESES_FULL[fechaHoy.getMonth()]} ${fechaHoy.getFullYear()}`;

  function abrirWA(f: Fila) {
    if (!f.clienteTel) return;
    // El mensaje cambia según el estado (día de pago / gabela / mora). Plantillas editables en Config.
    const clave = f.estadoLabel === "Mora" ? "mora" : f.estadoLabel === "Pendiente" ? "gabela" : "dia_pago";
    const texto = renderMsg(clave, {
      nombre: f.clienteNombre,
      placa: f.placa ?? "",
      dias: f.diasSinPago >= 999 ? 0 : f.diasSinPago,
      valor: `$${Math.round(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo).toLocaleString("es-CO")}`,
    });
    const num = f.clienteTel.replace(/\D/g, "");
    const full = num.startsWith("57") ? num : `57${num}`;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  function abrirLlamada(tel: string) {
    if (!tel) return;
    window.open(`tel:+57${tel.replace(/\D/g, "")}`);
  }

  // Valida y abre la ventana flotante de confirmación (en vez de cobrar directo).
  function pedirConfirmacionCobro() {
    const valor = parseInt(cobrarValor.replace(/\D/g, ""), 10);
    if (!valor || valor <= 0) { setCobrarError("Ingresa un valor válido"); return; }
    if (cobrarMetodo === "Efectivo" && !esSecretaria) { setCobrarError("Solo la secretaria puede registrar efectivo"); return; }
    setCobrarError(null);
    setConfirmarCobroOpen(true);
  }

  async function handleCobrar(f: Fila) {
    const valor = parseInt(cobrarValor.replace(/\D/g, ""), 10);
    if (!valor || valor <= 0) { setCobrarError("Ingresa un valor válido"); return; }
    if (cobrarMetodo === "Efectivo" && !esSecretaria) { setCobrarError("Solo la secretaria puede registrar efectivo"); return; }
    setCobrandoLoading(true);
    setCobrarError(null);
    const cuotaPactada = f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo;
    const aplicado = calcularAplicacion(valor, cuotaPactada, 0, f.deudaReal, f.cuotaConvenioFila);
    // Ahorro exacto del período (no promedio) — mismo criterio que Cartera.
    const contratoFila = contratos.find(c => c.id === f.contratoId);
    if (contratoFila && f.tipoRuta !== "diario") {
      const sinPagos = !pagos.some(p => p.contrato_id === f.contratoId && p.estado === "Confirmado");
      aplicado.ahorro = calcularAhorroAplicado(contratoFila, aplicado.tarifa, estaEnProrrateo(contratoFila, sinPagos),
        tarifaPagadaPeriodoActual(contratoFila, pagos.filter(p => p.contrato_id === contratoFila.id), new Date(hoy + "T00:00:00")));
    }
    const { error } = await registrarPago(f.contratoId, valor, cobrarMetodo, aplicado, {
      registradoPor: profile?.id,
      ...(f.convenioActivoId ? { convenioId: f.convenioActivoId } : {}),
    });
    setCobrandoLoading(false);
    if (error) { setCobrarError(error); return; }
    setConfirmarCobroOpen(false);
    setCobrandoId(null);
    setCobrarValor("");
    setCobrarNota("");
  }

  function abrirCobrar(f: Fila) {
    setCobrandoId(f.contratoId);
    setCobrarValor(String(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo));
    setCobrarMetodo(esSecretaria ? "Efectivo" : "Transferencia");
    setCobrarError(null);
    setCobrarNota("");
  }

  const q = busqueda.toLowerCase();
  function filtrar(lista: Fila[]) {
    if (!q) return lista;
    return lista.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
  }

  // ── Acción rápida botones ────────────────────────────────────────────────────
  function AccionesBtns({ f, vertical = false }: { f: Fila; vertical?: boolean }) {
    const s: React.CSSProperties = {
      padding: "7px 11px", borderRadius: 10, border: "none",
      cursor: "pointer", fontSize: 13, fontWeight: 700,
      transition: "opacity 0.1s",
    };
    return (
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
        {!f.pagadoHoyBool && (
          <button onClick={() => abrirCobrar(f)} style={{ ...s, background: "#0f172a", color: "white" }} title="Registrar pago">💳</button>
        )}
        {f.clienteTel && (
          <>
            <button onClick={() => abrirLlamada(f.clienteTel)} style={{ ...s, background: "#dbeafe", color: "#1d4ed8" }} title="Llamar">📞</button>
            <button onClick={() => abrirWA(f)} style={{ ...s, background: "#dcfce7", color: "#166534" }} title="WhatsApp">💬</button>
          </>
        )}
        <button onClick={() => { setGestionId(f.contratoId); setGestionNombre(f.clienteNombre); }} style={{ ...s, background: "#fef3c7", color: "#92400e" }} title="Registrar gestión">📋</button>
        <button onClick={() => setDeudaId(f.contratoId)} style={{ ...s, background: "#fee2e2", color: "#991b1b" }} title="Ver deuda">⚠️</button>
        {onNavigate && (
          <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ ...s, background: "#eff6ff", color: "#0284c7" }} title="Ver ficha cliente">👤</button>
        )}
        {onNavigate && f.motoId && (
          <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ ...s, background: "#f0fdf4", color: "#166534" }} title="Ver ficha moto">🏍️</button>
        )}
      </div>
    );
  }

  // ── Modal cobrar ─────────────────────────────────────────────────────────────
  const modalCobrar = cobrandoId ? (() => {
    const f = filas.find(x => x.contratoId === cobrandoId);
    if (!f) return null;
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={e => { if (e.target === e.currentTarget) setCobrandoId(null); }}
      >
        <div style={{ background: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, textTransform: "uppercase", color: "#0f172a" }}>{f.clienteNombre}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                {f.placa !== "—" && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0284c7", background: "#eff6ff", padding: "2px 10px", borderRadius: 999 }}>🏍️ {f.placa}</span>
                )}
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {f.tipoRuta === "diario" ? "Contrato diario" : `Contrato ${f.tipoRuta}`}
                </span>
              </div>
            </div>
            <button onClick={() => setCobrandoId(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 99, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
          </div>

          {/* Valor esperado */}
          <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Valor esperado</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
              ${fmt(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo)}
            </span>
          </div>

          {/* Alerta mora */}
          {f.diasSinPago > 0 && (
            <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fecaca", fontSize: 13, color: "#991b1b", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️
              <div>
                <div>{f.diasSinPago} días sin pago</div>
                <div style={{ fontWeight: 400, fontSize: 11 }}>{getProtocoloStep(f.diasSinPago).label}</div>
              </div>
            </div>
          )}

          {/* Valor a cobrar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Valor a cobrar</div>
            <MoneyInput
              value={cobrarValor}
              onChange={setCobrarValor}
              style={{ padding: "14px", border: "2px solid #e2e8f0", fontSize: 22, fontWeight: 900, textAlign: "center" }}
              autoFocus
            />
          </div>

          {/* Método */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Método de pago</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Efectivo", "Transferencia"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setCobrarMetodo(m)}
                  disabled={m === "Efectivo" && !esSecretaria}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 12, border: "2px solid",
                    borderColor: cobrarMetodo === m ? (m === "Efectivo" ? "#16a34a" : "#2563eb") : "#e2e8f0",
                    cursor: m === "Efectivo" && !esSecretaria ? "not-allowed" : "pointer",
                    fontWeight: 700, fontSize: 13,
                    background: cobrarMetodo === m ? (m === "Efectivo" ? "#dcfce7" : "#dbeafe") : "white",
                    color: cobrarMetodo === m ? (m === "Efectivo" ? "#166534" : "#1d4ed8") : "#94a3b8",
                    opacity: m === "Efectivo" && !esSecretaria ? 0.4 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {m === "Efectivo" ? "💵 Efectivo" : "🏦 Transferencia"}
                </button>
              ))}
            </div>
            {!esSecretaria && <div style={{ fontSize: 11, color: "#92400e", marginTop: 5, textAlign: "center" }}>Solo la secretaria registra efectivo</div>}
          </div>

          {/* Nota */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Nota (opcional)</div>
            <input
              type="text"
              value={cobrarNota}
              onChange={e => setCobrarNota(e.target.value)}
              placeholder="Observación..."
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
            />
          </div>

          {cobrarError && (
            <div style={{ color: "#991b1b", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "#fee2e2", borderRadius: 8 }}>{cobrarError}</div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setCobrandoId(null)}
              style={{ flex: 1, padding: 14, borderRadius: 14, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#64748b" }}
            >
              Cancelar
            </button>
            <button
              onClick={pedirConfirmacionCobro}
              disabled={cobrandoLoading}
              style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: cobrandoLoading ? "#94a3b8" : "#0f172a", color: "white", cursor: cobrandoLoading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14 }}
            >
              {cobrandoLoading ? "Registrando..." : "✅ Confirmar pago"}
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  // ── Tarjeta cliente ──────────────────────────────────────────────────────────
  function TarjetaCliente({ f, showDiasPago = false }: { f: Fila; showDiasPago?: boolean }) {
    const prot = getProtocoloStep(f.diasSinPago);
    const borderColor = f.pagadoHoyBool ? "#22c55e" : f.diasSinPago > 0 ? prot.color : "#e2e8f0";

    return (
      <div style={{
        background: "white", borderRadius: 18, padding: isMobile ? "14px" : "16px 20px",
        boxShadow: "0 2px 14px rgba(15,23,42,0.07)",
        borderLeft: `4px solid ${borderColor}`,
        transition: "box-shadow 0.15s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          {/* Info principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nombre + placa */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              {onNavigate && f.motoId
                ? <button onClick={() => onNavigate("ficha_moto", f.motoId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{f.placa}</button>
                : <span style={{ fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{f.placa}</span>
              }
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>·</span>
              {onNavigate
                ? <button onClick={() => onNavigate("ficha_cliente", f.clienteId)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</button>
                : <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", textTransform: "uppercase" }}>{f.clienteNombre}</span>
              }
              {/* Estado badge */}
              {f.pagadoHoyBool ? (
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>✅ Pagado</span>
              ) : f.diasSinPago > 0 ? (
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: prot.bg, color: prot.color }}>
                  {f.diasSinPago}d · {prot.label}
                </span>
              ) : (
                <span style={{ padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>⏳ Pendiente</span>
              )}
            </div>

            {/* Marca + dia pago */}
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
              {f.marca && <span>{f.marca}</span>}
              {showDiasPago && <span style={{ marginLeft: f.marca ? 8 : 0, color: "#0284c7", fontWeight: 600 }}>· Pago: {f.diaPago}</span>}
            </div>

            {/* Montos */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
                  ${fmt(f.tipoRuta === "diario" ? f.valorPactado : f.valorPeriodo)}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginLeft: 3 }}>
                    /{f.tipoRuta === "diario" ? "día" : "sem"}
                  </span>
                </div>
                {f.tipoRuta === "diario" && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    <span style={{ color: "#166534", fontWeight: 700 }}>${fmt(f.tarifaDiaria)}</span> tarifa
                    <span style={{ color: "#64748b" }}> + </span>
                    <span style={{ color: "#0284c7", fontWeight: 700 }}>${fmt(f.ahorroDiario)}</span> ahorro
                  </div>
                )}
              </div>
              {f.pagadoHoyBool && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 14 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>${fmt(f.pagadoHoy)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>pagado hoy</div>
                </div>
              )}
              {f.pagadoHasta && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{fmtFechaCarta(f.pagadoHasta)}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>pagado hasta</div>
                </div>
              )}
              {f.diasSinPago > 0 && f.deudaEstimada > 0 && (
                <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#991b1b" }}>${fmt(f.deudaEstimada)}</div>
                  <div style={{ fontSize: 10, color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>deuda est.</div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <AccionesBtns f={f} vertical />
        </div>
      </div>
    );
  }

  // ── Tabs config ─────────────────────────────────────────────────────────────
  const tabsDef: { key: Tab; label: string; count: number; color?: string; bg?: string }[] = [
    { key: "diario",   label: "Diario",    count: filasHoy.length,          color: "#0284c7", bg: "#eff6ff" },
    { key: "periodico",label: "Periódico", count: filasPeriodicaHoy.length,  color: "#7c3aed", bg: "#f5f3ff" },
    { key: "gabela",   label: "Gabela",    count: filasGabela.length,        color: "#92400e", bg: "#fef3c7" },
    { key: "pagaron",  label: "Ya pagaron",count: totalPagaronHoy,           color: "#166534", bg: "#dcfce7" },
    { key: "caja",     label: "Caja",      count: -1 },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderRadius: 20, padding: isMobile ? "20px 18px" : "24px 28px",
        marginBottom: 18, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(2,132,199,0.15)", pointerEvents: "none" }} />
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "capitalize" }}>
          Cobro del {fechaDisplay}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Total recaudado hoy</div>
            <div style={{ fontSize: isMobile ? 34 : 44, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>${fmt(kpiRecaudado)}</div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Meta estimada</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#38bdf8" }}>${fmt(kpiEsperado)}</div>
          </div>
        </div>

        {/* Progress bar */}
        {kpiEsperado > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11 }}>
              <span style={{ color: "#94a3b8" }}>{totalPagaronHoy} de {totalEsperadosHoy} clientes pagaron</span>
              <span style={{ color: progressPct >= 100 ? "#34d399" : "#38bdf8", fontWeight: 700 }}>{progressPct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${progressPct}%`,
                background: progressPct >= 100 ? "#22c55e" : progressPct >= 60 ? "#38bdf8" : "#f59e0b",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: isMobile ? "nowrap" : "wrap", overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 4 : 0 }}>
        {[
          { label: "Recaudado", value: `$${fmt(kpiRecaudado)}`, sub: `${totalPagaronHoy} pagos`, color: "#166534", bg: "#dcfce7" },
          { label: "Esperado", value: `$${fmt(kpiEsperado)}`, sub: `${totalEsperadosHoy - totalPagaronHoy} pendientes`, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "En mora", value: `$${fmt(kpiMora)}`, sub: `${filasMora.length} contratos`, color: "#991b1b", bg: "#fee2e2" },
          { label: "En gabela", value: `${filasGabela.length}`, sub: "día de gracia", color: "#92400e", bg: "#fef3c7" },
        ].map(kpi => (
          <div key={kpi.label} style={{ flex: isMobile ? "0 0 auto" : 1, minWidth: isMobile ? 130 : 110, background: kpi.bg, borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: kpi.color, marginTop: 2 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: kpi.color, opacity: 0.75, marginTop: 1 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 3, marginBottom: 14, background: "white", borderRadius: 14, padding: 4, boxShadow: "0 2px 8px rgba(15,23,42,0.06)", overflowX: "auto" }}>
        {tabsDef.map(t => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: "0 0 auto", padding: isMobile ? "7px 10px" : "8px 14px",
                borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: isMobile ? 11 : 12, fontWeight: 700,
                background: isActive ? (t.bg ?? "#0f172a") : "transparent",
                color: isActive ? (t.color ?? "white") : "#64748b",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                position: "relative" as const,
              }}
            >
              {t.key === "caja" ? "🏦 Caja" : `${t.label}${t.count >= 0 ? ` (${t.count})` : ""}`}
              {t.count > 0 && t.key === "gabela" && !isActive && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#f59e0b" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Buscador ── */}
      {tab !== "caja" && (
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8" }}>🔍</span>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o placa..."
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px 10px 36px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, background: "white" }}
          />
        </div>
      )}

      {/* ── Tab: Diario ── */}
      {tab === "diario" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 700 }}>
              ✅ {filasHoy.filter(f => f.pagadoHoyBool).length} pagaron
            </span>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>
              ⏳ {filasHoy.filter(f => !f.pagadoHoyBool).length} pendientes
            </span>
            {filasHoy.filter(f => f.diasSinPago > 0).length > 0 && (
              <span style={{ padding: "4px 12px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 700 }}>
                🔴 {filasHoy.filter(f => f.diasSinPago > 0).length} con mora acumulada
              </span>
            )}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {filtrar([...filasHoy.filter(f => !f.pagadoHoyBool), ...filasHoy.filter(f => f.pagadoHoyBool)]).map(f => (
              <TarjetaCliente key={f.contratoId} f={f} />
            ))}
            {filtrar(filasHoy).length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 18 }}>
                <div style={{ fontSize: 36 }}>📅</div>
                <div style={{ fontWeight: 700, marginTop: 10, color: "#334155" }}>Sin contratos diarios activos</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Periódico ── */}
      {tab === "periodico" && (
        <div>
          {filasPeriodicaHoy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 18 }}>
              <div style={{ fontSize: 36 }}>📋</div>
              <div style={{ fontWeight: 700, marginTop: 10, color: "#334155" }}>
                Sin contratos periódicos para hoy
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Cada contrato paga en el día pactado (semanal, quincenal o mensual)</div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 10, padding: "8px 14px", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12, color: "#0284c7", fontWeight: 600 }}>
                ⚡ Hoy es día de pago para {filasPeriodicaHoy.length} contrato{filasPeriodicaHoy.length === 1 ? "" : "s"}.
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {filtrar([...filasPeriodicaHoy.filter(f => !f.pagadoHoyBool), ...filasPeriodicaHoy.filter(f => f.pagadoHoyBool)]).map(f => (
                  <TarjetaCliente key={f.contratoId} f={f} showDiasPago />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Gabela ── */}
      {tab === "gabela" && (
        <div>
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
            <strong>Día de gabela:</strong> Se envía mensaje + llamada. Sirena solo con vehículo detenido en GPS. No aplicar apagado remoto aún.
          </div>
          {filasGabela.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 18 }}>
              <div style={{ fontSize: 36 }}>✅</div>
              <div style={{ fontWeight: 700, marginTop: 10, color: "#166534" }}>Sin clientes en gabela hoy</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filtrar(filasGabela).map(f => (
                <TarjetaCliente key={f.contratoId} f={f} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Ya pagaron ── */}
      {tab === "pagaron" && (
        <div>
          <div style={{ marginBottom: 12, fontSize: 13, color: "#64748b" }}>
            {totalPagaronHoy} pagos confirmados hoy · ${fmt(kpiRecaudado)} total
          </div>
          {filasPagaronHoy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "white", borderRadius: 18 }}>
              <div style={{ fontSize: 36 }}>💳</div>
              <div style={{ fontWeight: 700, marginTop: 10, color: "#334155" }}>Aún no hay pagos registrados hoy</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filtrar(filasPagaronHoy).map(f => (
                <TarjetaCliente key={f.contratoId} f={f} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Caja ── */}
      {tab === "caja" && (() => {
        const pagosHoy = pagos.filter(p => p.fecha === hoy && p.estado === "Confirmado" && esPagoDeCaja(p));
        const efectivoHoy = pagosHoy.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
        const transHoy = pagosHoy.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
        const totalHoy = efectivoHoy + transHoy;

        // Grupo de un pago: pago → contrato → moto → grupo (portafolio).
        const grupoDePagoCaja = (contratoId: string): GrupoMoto | null => {
          const c = contratos.find(x => x.id === contratoId);
          const m = c ? motos.find(mo => mo.id === c.moto_id) : null;
          return (m?.grupo as GrupoMoto) ?? null;
        };
        // Desglose del día por grupo (cada portafolio se cierra por aparte).
        const porGrupoCaja = GRUPOS_CAJA.map(g => {
          const lista = pagosHoy.filter(p => grupoDePagoCaja(p.contrato_id) === g);
          const ef = lista.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
          const tr = lista.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
          return { grupo: g, efectivo: ef, transfer: tr, total: ef + tr, count: lista.length, lista, cerrada: cajaDia(hoy, g) };
        }).filter(x => x.total > 0);
        const cerrarGrupoCaja = async (g: typeof porGrupoCaja[0]) => {
          if (!confirm(`¿Cerrar la caja de ${g.grupo} por $${fmt(g.total)}? No se podrá modificar después.`)) return;
          setCerrandoCaja(g.grupo);
          setMsgCaja(null);
          const detalle = g.lista.map(p => {
            const c = contratos.find(x => x.id === p.contrato_id);
            const cl = clientes.find(x => x.id === c?.cliente_id);
            const m = motos.find(x => x.id === c?.moto_id);
            return { placa: m?.placa ?? "—", nombre: cl?.nombre ?? "—", valor: p.valor, metodo: p.metodo, grupo: g.grupo };
          });
          const { error } = await cerrarCaja({
            fecha: hoy,
            grupo: g.grupo,
            efectivo: g.efectivo,
            transferencias: g.transfer,
            total: g.total,
            detalle,
            cerradoPor: profile?.id ?? null,
            notas: notasCaja.trim() || undefined,
          });
          setCerrandoCaja(null);
          if (error) setMsgCaja(`Error: ${error}`);
          else { setMsgCaja(`Caja de ${g.grupo} cerrada — $${fmt(g.total)}`); setNotasCaja(""); }
        };

        return (
          <div style={{ display: "grid", gap: 14 }}>
            {/* Resumen */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { label: "💵 Efectivo", value: efectivoHoy, color: "#166534", bg: "#dcfce7" },
                { label: "🏦 Transferencias", value: transHoy, color: "#1d4ed8", bg: "#dbeafe" },
                { label: "Total del día", value: totalHoy, color: "white", bg: "#0f172a" },
              ].map(c => (
                <div key={c.label} style={{ flex: 1, minWidth: 140, background: c.bg, borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c.color, textTransform: "uppercase", opacity: c.label === "Total del día" ? 0.7 : 1 }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c.color }}>${fmt(c.value)}</div>
                </div>
              ))}
            </div>

            {/* Lista pagos */}
            <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
              <div style={{ padding: "13px 18px", borderBottom: "1px solid #f1f5f9", fontWeight: 800, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Pagos recibidos hoy</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{pagosHoy.length} registros</span>
              </div>
              {pagosHoy.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Sin pagos registrados hoy</div>
              )}
              {pagosHoy.map((p, i) => {
                const c = contratos.find(x => x.id === p.contrato_id);
                const cl = clientes.find(x => x.id === c?.cliente_id);
                const m = motos.find(x => x.id === c?.moto_id);
                return (
                  <div key={p.id ?? i} style={{ padding: "11px 18px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{m?.placa ?? "—"} · {cl?.nombre ?? "—"}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{p.metodo}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>${fmt(p.valor)}</div>
                      {onNavigate && cl && (
                        <button onClick={() => onNavigate("ficha_cliente", cl.id)} style={{ padding: "3px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#eff6ff", color: "#0284c7" }}>Ver ficha</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cierre de caja — cada grupo (portafolio) se cierra por aparte */}
            {!esSecretaria ? (
              <div style={{ padding: "12px 16px", background: "#fef3c7", borderRadius: 12, fontSize: 12, color: "#92400e" }}>Solo la secretaria puede cerrar la caja.</div>
            ) : porGrupoCaja.length === 0 ? (
              <div style={{ padding: "14px 18px", borderRadius: 14, background: "#f1f5f9", fontSize: 13, color: "#64748b", fontWeight: 600, textAlign: "center" }}>
                Sin dinero para cerrar hoy.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Cierre por grupo
                </div>
                <textarea
                  value={notasCaja}
                  onChange={e => setNotasCaja(e.target.value)}
                  placeholder="Notas del cierre (opcional)..."
                  rows={2}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, resize: "vertical" }}
                />
                {msgCaja && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: msgCaja.startsWith("Error") ? "#fee2e2" : "#dcfce7", color: msgCaja.startsWith("Error") ? "#991b1b" : "#166534" }}>
                    {msgCaja}
                  </div>
                )}
                {porGrupoCaja.map(g => (
                  <div key={g.grupo} style={{ border: `1px solid ${COLOR_GRUPO_CAJA[g.grupo]}33`, borderLeft: `4px solid ${COLOR_GRUPO_CAJA[g.grupo]}`, borderRadius: 12, padding: "12px 14px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: COLOR_GRUPO_CAJA[g.grupo], textTransform: "uppercase" }}>{g.grupo}</span>
                        <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>Ef. ${fmt(g.efectivo)} · Tr. ${fmt(g.transfer)} · {g.count} pago{g.count !== 1 ? "s" : ""}</span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>${fmt(g.total)}</span>
                    </div>
                    {g.cerrada ? (
                      <div style={{ padding: "8px 12px", borderRadius: 8, background: "#dcfce7", border: "1px solid #86efac", fontSize: 12, fontWeight: 800, color: "#166534", textAlign: "center" }}>
                        ✅ Cerrada — ${fmt(g.cerrada.total)}
                      </div>
                    ) : (
                      <button
                        disabled={cerrandoCaja !== null}
                        onClick={() => cerrarGrupoCaja(g)}
                        style={{
                          width: "100%", padding: "11px", borderRadius: 10, border: "none",
                          cursor: cerrandoCaja !== null ? "not-allowed" : "pointer",
                          fontWeight: 800, fontSize: 13, background: COLOR_GRUPO_CAJA[g.grupo], color: "white",
                          opacity: cerrandoCaja === g.grupo ? 0.7 : 1,
                        }}
                      >
                        {cerrandoCaja === g.grupo ? "Cerrando..." : `✅ Cerrar caja de ${g.grupo} — $${fmt(g.total)}`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Sección mora / inmovilizar (siempre visible bajo cualquier tab si hay) ── */}
      {tab !== "caja" && filasInmov.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            🚨 Requieren inmovilización ({filasInmov.length})
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {filtrar(filasInmov).slice(0, 5).map(f => {
              const s = PRIORIDAD[f.prioridad];
              return (
                <div key={f.contratoId} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#0284c7" }}>{f.placa}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                        <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>{f.clienteNombre}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.border, color: s.color }}>{s.label} · {f.diasSinPago}d</span>
                      </div>
                      <div style={{ fontSize: 12, color: s.color, fontWeight: 700, marginTop: 4 }}>
                        Deuda: ${fmt(f.deudaEstimada)} · {getProtocoloStep(f.diasSinPago).label}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button onClick={() => abrirCobrar(f)} style={{ padding: "7px 11px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#0f172a", color: "white" }}>💳</button>
                      {f.clienteTel && (
                        <button onClick={() => abrirWA(f)} style={{ padding: "7px 11px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬</button>
                      )}
                      <button disabled title="Requiere GPS" style={{ padding: "7px 11px", borderRadius: 10, border: "none", cursor: "not-allowed", fontSize: 13, fontWeight: 700, background: "#f1f5f9", color: "#94a3b8", opacity: 0.5 }}>🚨</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filasInmov.length > 5 && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#64748b", padding: "8px 0" }}>
                +{filasInmov.length - 5} más en inmovilización
              </div>
            )}
          </div>
        </div>
      )}

      {modalCobrar}
      {confirmarCobroOpen && cobrandoId && (() => {
        const f = filas.find(x => x.contratoId === cobrandoId);
        if (!f) return null;
        const valorC = parseInt(cobrarValor.replace(/\D/g, ""), 10) || 0;
        const dupC = pagos.some(p => p.contrato_id === f.contratoId && p.estado !== "Rechazado" && Math.round(p.valor) === valorC && p.fecha === hoy);
        return (
          <ModalConfirmarPago
            monto={valorC}
            metodo={cobrarMetodo}
            clienteNombre={f.clienteNombre}
            placa={f.placa}
            duplicado={dupC}
            procesando={cobrandoLoading}
            onCancelar={() => setConfirmarCobroOpen(false)}
            onConfirmar={() => handleCobrar(f)}
          />
        );
      })()}
      {gestionId && <ModalGestion contratoId={gestionId} clienteNombre={gestionNombre} onClose={() => setGestionId(null)} />}
      {deudaId && <ModalDeuda contratoId={deudaId} clienteNombre={filas.find(f => f.contratoId === deudaId)?.clienteNombre ?? ""} onClose={() => setDeudaId(null)} />}
      {convenioId && <ModalConvenio contratoId={convenioId} clienteNombre={filas.find(f => f.contratoId === convenioId)?.clienteNombre ?? ""} onClose={() => setConvenioId(null)} />}
    </div>
  );
}
