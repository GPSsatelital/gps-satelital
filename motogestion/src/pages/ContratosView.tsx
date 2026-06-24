import React, { useEffect, useMemo, useState } from "react";
import { useContratos, type ContratoEstado, type FormaPago, diasHastaProximoDiaPago } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import FirmaModal from "./FirmaModal";
import type { Contrato } from "../hooks/useContratos";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 };
const secondaryBtn: React.CSSProperties = { background: "#f1f5f9", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer", color: "#334155", fontSize: 14 };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

function calcularDiasHastaVencimiento(contrato: Contrato): number | null {
  if (!contrato.fecha_entrega) return null;
  if (contrato.forma_pago === "Diario") return null;
  const diasPeriodo = contrato.forma_pago === "Semanal" ? 7 : contrato.forma_pago === "Quincenal" ? 15 : 30;
  const entrega = new Date(contrato.fecha_entrega + "T00:00:00");
  const vencimiento = new Date(entrega);
  vencimiento.setDate(vencimiento.getDate() + diasPeriodo);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.round((vencimiento.getTime() - hoy.getTime()) / 86400000);
}

function VencimientoBadge({ contrato }: { contrato: Contrato }) {
  if (contrato.estado !== "Activo") return null;
  const dias = calcularDiasHastaVencimiento(contrato);
  if (dias === null || dias > 7) return null;
  const [bg, color, text] = dias < 0
    ? ["#fee2e2", "#991b1b", `Vencido hace ${Math.abs(dias)}d`]
    : dias === 0 ? ["#fef3c7", "#92400e", "Vence hoy"]
    : dias === 1 ? ["#fef3c7", "#92400e", "Vence mañana"]
    : ["#fef9c3", "#854d0e", `Vence en ${dias}d`];
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

const ESTADO_COLORS: Record<ContratoEstado, { bg: string; color: string }> = {
  "En proceso": { bg: "#fef3c7", color: "#92400e" },
  Activo:       { bg: "#dcfce7", color: "#166534" },
  Finalizado:   { bg: "#dbeafe", color: "#1d4ed8" },
  Cancelado:    { bg: "#ffe4e6", color: "#be123c" },
  Suspendido:   { bg: "#ede9fe", color: "#6d28d9" },
};

function ContractBadge({ estado }: { estado: ContratoEstado }) {
  const c = ESTADO_COLORS[estado] ?? { bg: "#f1f5f9", color: "#334155" };
  return <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontWeight: 700 }}>{estado}</span>;
}

const TARIFAS_DIARIAS = [26000, 27000, 28000, 30000, 32000, 35000, 40000];
const VALORES_SEMANAL = [195000, 202000, 210000, 220000, 250000, 300000];
const VALORES_QUINCENAL = [390000, 404000, 420000, 440000, 500000];
const VALORES_MENSUAL = [780000, 808000, 840000, 880000, 1000000];

function getValoresPorForma(forma: string) {
  if (forma === "Semanal") return VALORES_SEMANAL;
  if (forma === "Quincenal") return VALORES_QUINCENAL;
  if (forma === "Mensual") return VALORES_MENSUAL;
  return [];
}

function emptyForm() {
  return { cliente_id: "", forma_pago: "Semanal", dia_pago: "Lunes", valor_semanal: "", tarifa_diaria: "27000", meses: "", ahorro_inicial: "", fecha_entrega: new Date().toISOString().slice(0, 10) };
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function ContratosView({ initialFilter = "", initialOpenForm = false }: { initialFilter?: string; initialOpenForm?: boolean }) {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";
  const puedeCrear = role === "ADMIN" || role === "ADMIN_PRINCIPAL";

  const { contratos, loading, error, crearContrato, asignarMoto, activarContrato, cancelarContrato, suspenderContrato, finalizarContrato } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const [filtroEstado, setFiltroEstado] = useState(initialFilter);
  useEffect(() => { setFiltroEstado(initialFilter); }, [initialFilter]);

  const [busqueda, setBusqueda] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(initialOpenForm && puedeCrear);
  // profile carga async: si initialOpenForm llegó antes de resolver el rol, abrir cuando ya pueda crear
  useEffect(() => { if (initialOpenForm && puedeCrear) setOpen(true); }, [initialOpenForm, puedeCrear]);
  const [contratoFirma, setContratoFirma] = useState<Contrato | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [accionError, setAccionError] = useState<string | null>(null);

  const clientesAprobados = clientes.filter((c) => c.estado === "Aprobado");
  const motosDisponibles = motos.filter((m) => m.estado === "Disponible");

  const prorrateo = useMemo(() => {
    if (form.forma_pago === "Diario" || !form.fecha_entrega) return null;
    const info = diasHastaProximoDiaPago(form.fecha_entrega);
    if (info.diasHasta === 0) return null;
    const tarifa = Number(form.tarifa_diaria || 27000);
    const cuotaDiaria = form.valor_semanal ? Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)) : tarifa;
    return { ...info, valorProrrateo: cuotaDiaria * info.diasHasta };
  }, [form.fecha_entrega, form.forma_pago, form.valor_semanal, form.tarifa_diaria]);

  const clienteSeleccionado = useMemo(() => clientes.find(c => c.id === form.cliente_id), [clientes, form.cliente_id]);

  function handleClienteChange(clienteId: string) {
    const cliente = clientes.find(c => c.id === clienteId);
    setForm(p => ({ ...p, cliente_id: clienteId, forma_pago: cliente?.ruta_contrato === "diario" ? "Diario" : "Semanal" }));
  }

  async function handleCrear() {
    if (!form.cliente_id || (!form.valor_semanal && form.forma_pago !== "Diario") || !form.fecha_entrega) {
      setFormError("Completa cliente, valor por período y fecha de entrega."); return;
    }
    if (form.forma_pago !== "Diario" && !form.meses) { setFormError("Ingresa la duración en meses."); return; }

    const cliente = clientes.find((c) => c.id === form.cliente_id);
    if (!cliente || cliente.estado !== "Aprobado") { setFormError("El cliente debe estar aprobado."); return; }

    const yaActivo = contratos.some(c => c.cliente_id === form.cliente_id && (c.estado === "Activo" || c.estado === "En proceso"));
    if (yaActivo) { setFormError("Este cliente ya tiene un contrato activo o en proceso."); return; }

    const tarifa = Number(form.tarifa_diaria || 27000);
    const valor = form.forma_pago === "Diario" ? tarifa : Number(form.valor_semanal);
    const diasPeriodo = form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30;
    const cuotaDiaria = form.forma_pago === "Diario" ? tarifa : Math.round(valor / diasPeriodo);
    const ahorroDiario = Math.max(cuotaDiaria - tarifa, 0);
    const diaPago = form.forma_pago === "Diario" ? "Diario" : form.dia_pago;

    setGuardando(true);
    const { error: err } = await crearContrato({
      cliente_id: form.cliente_id, dia_pago: diaPago, forma_pago: form.forma_pago as FormaPago,
      valor_semanal: valor, meses: form.forma_pago === "Diario" ? null : Number(form.meses),
      ahorro_inicial: Number(form.ahorro_inicial || 0), fecha_entrega: form.fecha_entrega,
      tipo_ruta: cliente?.ruta_contrato ?? "tiempo_definido", tarifa_diaria: tarifa,
      tarifa_domingo: Math.round(tarifa / 2), ahorro_diario: ahorroDiario, base_inicial: 510000,
    });
    setGuardando(false);
    if (err) { setFormError(err); return; }
    setForm(emptyForm()); setFormError(null); setOpen(false);
  }

  async function handleAsignarMoto(contratoId: string, motoId: string, firmaCliente: boolean) {
    if (!motoId) return;
    if (!firmaCliente) { setAccionError("Primero debe firmar el cliente antes de asignar una moto."); return; }
    const enUso = contratos.some(c => c.moto_id === motoId && c.id !== contratoId && c.estado !== "Cancelado" && c.estado !== "Suspendido");
    if (enUso) { setAccionError("Esta moto ya está asignada a otro contrato activo."); return; }
    setAccionError(null);
    const { error: err } = await asignarMoto(contratoId, motoId);
    if (err) setAccionError(err);
  }

  async function handleActivar(contratoId: string, motoId: string | null, clienteId: string) {
    if (!motoId) { setAccionError("Debe tener moto asignada antes de activar el contrato."); return; }
    setAccionError(null);
    const { error: err } = await activarContrato(contratoId, motoId, clienteId);
    if (err) setAccionError(err);
  }

  // ── Datos filtrados ───────────────────────────────────────────────────────
  const contratosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return contratos.filter(c => {
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (!q) return true;
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return (
        (cliente?.nombre ?? "").toLowerCase().includes(q) ||
        (moto?.placa ?? "").toLowerCase().includes(q) ||
        (cliente?.cedula ?? "").includes(q)
      );
    });
  }, [contratos, filtroEstado, busqueda, clientes, motos]);

  // Contrato seleccionado
  const contratoSeleccionado = contratosFiltrados.find(c => c.id === selectedId) ?? (isMobile ? null : contratosFiltrados[0] ?? null);
  const clienteDetalle = contratoSeleccionado ? clientes.find(cl => cl.id === contratoSeleccionado.cliente_id) : null;
  const motoDetalle = contratoSeleccionado ? motos.find(m => m.id === contratoSeleccionado.moto_id) : null;

  // KPI counts
  const counts = useMemo(() => ({
    total:      contratos.length,
    enProceso:  contratos.filter(c => c.estado === "En proceso").length,
    activos:    contratos.filter(c => c.estado === "Activo").length,
    suspendidos:contratos.filter(c => c.estado === "Suspendido").length,
    finalizados:contratos.filter(c => c.estado === "Finalizado").length,
    cancelados: contratos.filter(c => c.estado === "Cancelado").length,
  }), [contratos]);

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando contratos...</div>;

  // ── Panel de detalle ──────────────────────────────────────────────────────
  function PanelDetalle() {
    if (!contratoSeleccionado || !clienteDetalle) {
      return (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "#64748b" }}>
          Selecciona un contrato para ver el detalle.
        </div>
      );
    }

    const c = contratoSeleccionado;
    const esDiario = c.forma_pago === "Diario";
    const ahorro = c.ahorro_acumulado ?? 0;
    const ahorroMeta = c.base_inicial ?? 510000;
    const pctAhorro = Math.min(100, Math.round((ahorro / ahorroMeta) * 100));
    const alertaBase = esDiario && !c.base_completada && ahorro >= ahorroMeta * 0.9;
    const [motoAsignarId, setMotoAsignarId] = useState("");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header detalle */}
        <div style={card}>
          {isMobile && (
            <button onClick={() => setSelectedId(null)} style={{ ...secondaryBtn, marginBottom: 14, padding: "8px 14px", fontSize: 13 }}>
              ← Volver
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", color: "#0f172a" }}>
                {clienteDetalle.nombre}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                CC {clienteDetalle.cedula}
                {clienteDetalle.telefono && ` · 📞 ${clienteDetalle.telefono}`}
              </div>
              {motoDetalle && (
                <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: "#0284c7" }}>
                  🏍️ {motoDetalle.placa} — {motoDetalle.marca} {motoDetalle.modelo}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <ContractBadge estado={c.estado} />
              <VencimientoBadge contrato={c} />
            </div>
          </div>

          {/* Datos del contrato */}
          <div style={{ marginTop: 14 }}>
            <InfoRow label="Modalidad" value={c.forma_pago} />
            <InfoRow label="Valor por período" value={`$ ${fmt(c.valor_semanal)}`} />
            <InfoRow label="Tarifa diaria" value={`$ ${fmt(c.tarifa_diaria ?? 27000)}/día`} />
            {c.ahorro_diario && c.ahorro_diario > 0 && (
              <InfoRow label="Ahorro diario" value={`$ ${fmt(c.ahorro_diario)}/día`} />
            )}
            {!esDiario && <InfoRow label="Día de pago" value={c.dia_pago} />}
            {c.meses && <InfoRow label="Duración" value={`${c.meses} meses`} />}
            {c.fecha_entrega && (
              <InfoRow label="Fecha entrega" value={new Date(c.fecha_entrega + "T00:00:00").toLocaleDateString("es-CO")} />
            )}
          </div>

          {/* Progreso base — diario */}
          {esDiario && (
            <div style={{ marginTop: 14 }}>
              {c.base_completada ? (
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 13 }}>
                  ✅ Base completada — listo para cambio de contrato
                </div>
              ) : (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: alertaBase ? "#fef3c7" : "#f8fafc", border: `1px solid ${alertaBase ? "#fde68a" : "#e2e8f0"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
                    <span>Ahorro acumulado</span>
                    <span style={{ fontWeight: 700 }}>$ {fmt(ahorro)} / $ {fmt(ahorroMeta)} ({pctAhorro}%)</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "#f59e0b" : "#0284c7", transition: "width 0.3s" }} />
                  </div>
                  {alertaBase && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#92400e", fontWeight: 700 }}>
                      ⚠️ Falta poco — avisar al admin para tramitar cambio de contrato
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        {puedeCrear && c.estado !== "Cancelado" && c.estado !== "Finalizado" && (
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "#334155" }}>Acciones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {!c.firma_cliente && (
                <button onClick={() => setContratoFirma(c)} style={{ ...primaryBtn, textAlign: "center" }}>
                  ✍️ Firmar documentos
                </button>
              )}
              {c.firma_cliente && !c.moto_id && (
                <div>
                  <div style={labelStyle}>Asignar moto</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select style={{ ...inputStyle, flex: 1 }} value={motoAsignarId} onChange={e => setMotoAsignarId(e.target.value)}>
                      <option value="">Seleccionar moto disponible</option>
                      {motosDisponibles.map(m => <option key={m.id} value={m.id}>{m.placa} — {m.marca} {m.modelo}</option>)}
                    </select>
                    <button onClick={() => handleAsignarMoto(c.id, motoAsignarId, c.firma_cliente)} style={{ ...primaryBtn, whiteSpace: "nowrap" }}>
                      Asignar
                    </button>
                  </div>
                </div>
              )}
              {c.moto_id && c.estado === "En proceso" && (
                <button onClick={() => handleActivar(c.id, c.moto_id, c.cliente_id)} style={{ background: "#dcfce7", color: "#166534", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ✅ Activar contrato
                </button>
              )}
              {c.estado === "Activo" && (
                <button onClick={() => suspenderContrato(c.id, c.moto_id)} style={{ background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ⏸️ Suspender contrato
                </button>
              )}
              {c.estado === "Activo" && (
                <button
                  onClick={async () => {
                    if (!confirm("¿Finalizar este contrato? La moto quedará disponible.")) return;
                    const { error } = await finalizarContrato(c.id, c.moto_id);
                    if (error) setAccionError(error);
                  }}
                  style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                >
                  🏁 Finalizar contrato
                </button>
              )}
              <button onClick={() => cancelarContrato(c.id, c.moto_id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                ❌ Cancelar contrato
              </button>
            </div>

            {accionError && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontWeight: 600, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                <span>⚠️ {accionError}</span>
                <button onClick={() => setAccionError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b" }}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* Firma info */}
        {c.firma_cliente && (
          <div style={{ ...card, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>✅ Documentos firmados</div>
          </div>
        )}
      </div>
    );
  }

  // On mobile with selection → show only detail
  if (isMobile && selectedId) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <PanelDetalle />
        {contratoFirma && (() => {
          const cl = clientes.find(c => c.id === contratoFirma.cliente_id);
          const mo = motos.find(m => m.id === contratoFirma.moto_id);
          if (!cl) return null;
          return <FirmaModal contrato={contratoFirma} cliente={cl} moto={mo ?? null} onClose={() => setContratoFirma(null)} onCompletado={() => setContratoFirma(null)} />;
        })()}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0, fontWeight: 800 }}>Contratos</h2>
          <p style={{ marginTop: 4, color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>Solo clientes aprobados con visita domiciliaria.</p>
        </div>
        {puedeCrear && <button onClick={() => setOpen(true)} style={primaryBtn}>+ Nuevo contrato</button>}
      </div>

      {error && <div style={{ marginBottom: 12, color: "#991b1b" }}>Error: {error}</div>}

      {/* KPI pills */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {[
          { label: "Total",       value: counts.total,       estado: "",            color: "#334155", bg: "#f1f5f9" },
          { label: "Activos",     value: counts.activos,     estado: "Activo",      color: "#166534", bg: "#dcfce7" },
          { label: "En proceso",  value: counts.enProceso,   estado: "En proceso",  color: "#92400e", bg: "#fef3c7" },
          { label: "Suspendidos", value: counts.suspendidos, estado: "Suspendido",  color: "#6d28d9", bg: "#ede9fe" },
          { label: "Finalizados", value: counts.finalizados, estado: "Finalizado",  color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Cancelados",  value: counts.cancelados,  estado: "Cancelado",   color: "#be123c", bg: "#ffe4e6" },
        ].map(k => (
          <button
            key={k.estado}
            onClick={() => { setFiltroEstado(k.estado); setSelectedId(null); }}
            style={{
              flex: "0 0 auto",
              padding: "10px 16px",
              borderRadius: 14,
              border: filtroEstado === k.estado ? `2px solid ${k.color}` : "2px solid transparent",
              background: filtroEstado === k.estado ? k.bg : "white",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
              textAlign: "center",
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{k.label}</div>
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <input
        style={{ ...inputStyle, marginBottom: 16 }}
        placeholder="Buscar por nombre, cédula o placa..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setSelectedId(null); }}
      />

      {/* Layout principal */}
      <div style={{ display: "flex", gap: 20, alignItems: "start" }}>
        {/* Lista */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {contratosFiltrados.length === 0 && contratos.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sin contratos</div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Crea el primer contrato para empezar</div>
              {puedeCrear && <button onClick={() => setOpen(true)} style={primaryBtn}>+ Nuevo contrato</button>}
            </div>
          )}
          {contratosFiltrados.length === 0 && contratos.length > 0 && (
            <div style={{ ...card, color: "#64748b", textAlign: "center", padding: 24 }}>No hay contratos con ese filtro.</div>
          )}

          {contratosFiltrados.map(c => {
            const cliente = clientes.find(cl => cl.id === c.cliente_id);
            const moto = motos.find(m => m.id === c.moto_id);
            const esDiario = c.forma_pago === "Diario";
            const ahorro = c.ahorro_acumulado ?? 0;
            const ahorroMeta = c.base_inicial ?? 510000;
            const pctAhorro = Math.min(100, Math.round((ahorro / ahorroMeta) * 100));
            const alertaBase = esDiario && !c.base_completada && ahorro >= ahorroMeta * 0.9;
            const seleccionado = c.id === (contratoSeleccionado?.id ?? null);

            return (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                style={{
                  ...card,
                  cursor: "pointer",
                  border: seleccionado ? "2px solid #0284c7" : c.base_completada ? "2px solid #10b981" : alertaBase ? "2px solid #f59e0b" : "2px solid transparent",
                  background: seleccionado ? "#eff6ff" : "white",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cliente?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      {moto ? `🏍️ ${moto.placa} · ` : "Sin moto · "}
                      {esDiario ? "Diario" : `${c.forma_pago} · Paga ${c.dia_pago}`}
                      {" · "}$ {fmt(c.valor_semanal)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <ContractBadge estado={c.estado} />
                    <VencimientoBadge contrato={c} />
                  </div>
                </div>

                {/* Barra progreso base — diario */}
                {esDiario && !c.base_completada && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
                      <span>Ahorro base</span>
                      <span>{pctAhorro}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "#f59e0b" : "#0284c7" }} />
                    </div>
                  </div>
                )}
                {esDiario && c.base_completada && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "#dcfce7", borderRadius: 8, fontSize: 12, color: "#166534", fontWeight: 700 }}>
                    🎯 Base completada — listo para nuevo contrato
                  </div>
                )}

                {/* Pasos pendientes */}
                {c.estado === "En proceso" && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {!c.firma_cliente && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>⏳ Falta firma</span>}
                    {c.firma_cliente && !c.moto_id && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#eff6ff", color: "#0284c7", fontWeight: 700 }}>🏍️ Falta asignar moto</span>}
                    {c.firma_cliente && c.moto_id && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 700 }}>✅ Listo para activar</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel detalle — solo desktop */}
        {!isMobile && (
          <div style={{ flex: "0 0 360px", maxWidth: 360 }}>
            <PanelDetalle />
          </div>
        )}
      </div>

      {/* Modal firma */}
      {contratoFirma && (() => {
        const cl = clientes.find(c => c.id === contratoFirma.cliente_id);
        const mo = motos.find(m => m.id === contratoFirma.moto_id);
        if (!cl) return null;
        return <FirmaModal contrato={contratoFirma} cliente={cl} moto={mo ?? null} onClose={() => setContratoFirma(null)} onCompletado={() => setContratoFirma(null)} />;
      })()}

      {/* Modal nuevo contrato */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 20, padding: 24, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Nuevo contrato</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={labelStyle}>Cliente</div>
                <select style={inputStyle} value={form.cliente_id} onChange={e => handleClienteChange(e.target.value)}>
                  <option value="">Seleccionar cliente aprobado</option>
                  {clientesAprobados.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.cedula}</option>)}
                </select>
                {clienteSeleccionado?.ruta_contrato && (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#0284c7", fontWeight: 600 }}>
                    Ruta: {clienteSeleccionado.ruta_contrato === "diario" ? "Diario (ahorrando base)" : "Tiempo definido"}
                  </div>
                )}
              </div>

              <div>
                <div style={labelStyle}>Modalidad de pago</div>
                <select style={inputStyle} value={form.forma_pago} onChange={e => setForm(p => ({ ...p, forma_pago: e.target.value, valor_semanal: "" }))}>
                  <option value="Diario">Diario — pago cada día, ahorrando base</option>
                  <option value="Semanal">Semanal — pago cada semana</option>
                  <option value="Quincenal">Quincenal — pago cada 15 días</option>
                  <option value="Mensual">Mensual — pago cada mes</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>Tarifa diaria empresa</div>
                <select style={inputStyle} value={form.tarifa_diaria} onChange={e => setForm(p => ({ ...p, tarifa_diaria: e.target.value }))}>
                  {TARIFAS_DIARIAS.map(v => <option key={v} value={String(v)}>$ {fmt(v)}/día</option>)}
                </select>
              </div>

              {form.forma_pago !== "Diario" && (
                <>
                  <div>
                    <div style={labelStyle}>Valor por período</div>
                    <select style={inputStyle} value={form.valor_semanal} onChange={e => setForm(p => ({ ...p, valor_semanal: e.target.value }))}>
                      <option value="">Seleccionar valor</option>
                      {getValoresPorForma(form.forma_pago).map(v => (
                        <option key={v} value={String(v)}>$ {fmt(v)}</option>
                      ))}
                    </select>
                    {form.valor_semanal && form.tarifa_diaria && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                        ≈ $ {fmt(Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)))}/día
                        · Ahorro: $ {fmt(Math.max(Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)) - Number(form.tarifa_diaria), 0))}/día
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={labelStyle}>Día de pago (solo Lunes o Miércoles)</div>
                    <select style={inputStyle} value={form.dia_pago} onChange={e => setForm(p => ({ ...p, dia_pago: e.target.value }))}>
                      <option value="Lunes">Lunes</option>
                      <option value="Miércoles">Miércoles</option>
                    </select>
                  </div>

                  <div>
                    <div style={labelStyle}>Duración (meses)</div>
                    <input type="number" min="1" max="36" style={inputStyle} value={form.meses} onChange={e => setForm(p => ({ ...p, meses: e.target.value }))} placeholder="Ej. 12" />
                  </div>
                </>
              )}

              <div>
                <div style={labelStyle}>Ahorro inicial entregado</div>
                <input type="number" style={inputStyle} value={form.ahorro_inicial} onChange={e => setForm(p => ({ ...p, ahorro_inicial: e.target.value }))} placeholder="$ 0" />
              </div>

              <div>
                <div style={labelStyle}>Fecha de entrega</div>
                <input type="date" style={inputStyle} value={form.fecha_entrega} onChange={e => setForm(p => ({ ...p, fecha_entrega: e.target.value }))} />
              </div>

              {prorrateo && prorrateo.diasHasta > 0 && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1" }}>📅 Prorrateo hasta primer día de pago</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    {prorrateo.diasHasta} días hasta el próximo {prorrateo.diaSemana} ({new Date(prorrateo.proximaFecha + "T00:00:00").toLocaleDateString("es-CO")})
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0284c7", marginTop: 6 }}>
                    Cobrar al firmar: $ {fmt(prorrateo.valorProrrateo)}
                  </div>
                </div>
              )}
            </div>

            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{formError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleCrear} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? "Guardando..." : "Crear contrato"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
