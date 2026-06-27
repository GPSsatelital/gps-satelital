import React, { useEffect, useMemo, useState } from "react";
import { useContratos, type ContratoEstado } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import WizardContrato from "./WizardContrato";
import type { Contrato } from "../hooks/useContratos";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
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

function wizardStep(c: Contrato): number {
  if (!c.moto_id) return 2;
  if (!c.firma_cliente) return 3;
  return 6;
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

  const { filtrarContratos } = useScope();
  const { contratos: todosContratos, loading, error, cancelarContrato, suspenderContrato, finalizarContrato } = useContratos();
  const contratos = filtrarContratos(todosContratos);
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
  const [wizardOpen, setWizardOpen] = useState(initialOpenForm && puedeCrear);
  const [wizardContrato, setWizardContrato] = useState<Contrato | undefined>(undefined);
  const [wizardStep0, setWizardStep0] = useState<number | undefined>(undefined);
  const [accionError, setAccionError] = useState<string | null>(null);

  useEffect(() => { if (initialOpenForm && puedeCrear) setWizardOpen(true); }, [initialOpenForm, puedeCrear]);

  function abrirWizardNuevo() { setWizardContrato(undefined); setWizardStep0(undefined); setWizardOpen(true); }
  function abrirWizardContinuar(c: Contrato) { setWizardContrato(c); setWizardStep0(wizardStep(c)); setWizardOpen(true); }
  function cerrarWizard() { setWizardOpen(false); setWizardContrato(undefined); setWizardStep0(undefined); }

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

  const contratoSeleccionado = contratosFiltrados.find(c => c.id === selectedId) ?? (isMobile ? null : contratosFiltrados[0] ?? null);
  const clienteDetalle = contratoSeleccionado ? clientes.find(cl => cl.id === contratoSeleccionado.cliente_id) : null;
  const motoDetalle = contratoSeleccionado ? motos.find(m => m.id === contratoSeleccionado.moto_id) : null;

  const counts = useMemo(() => ({
    total:      contratos.length,
    enProceso:  contratos.filter(c => c.estado === "En proceso").length,
    activos:    contratos.filter(c => c.estado === "Activo").length,
    suspendidos:contratos.filter(c => c.estado === "Suspendido").length,
    finalizados:contratos.filter(c => c.estado === "Finalizado").length,
    cancelados: contratos.filter(c => c.estado === "Cancelado").length,
  }), [contratos]);

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando contratos...</div>;

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

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={card}>
          {isMobile && (
            <button onClick={() => setSelectedId(null)} style={{ ...secondaryBtn, marginBottom: 14, padding: "8px 14px", fontSize: 13 }}>
              ← Volver
            </button>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", color: "#0f172a" }}>{clienteDetalle.nombre}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>CC {clienteDetalle.cedula}{clienteDetalle.telefono && ` · 📞 ${clienteDetalle.telefono}`}</div>
              {motoDetalle && <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: "#0284c7" }}>🏍️ {motoDetalle.placa} — {motoDetalle.marca} {motoDetalle.modelo}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <ContractBadge estado={c.estado} />
              <VencimientoBadge contrato={c} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <InfoRow label="Modalidad" value={c.forma_pago} />
            <InfoRow label="Valor por período" value={`$ ${fmt(c.valor_semanal)}`} />
            <InfoRow label="Tarifa diaria" value={`$ ${fmt(c.tarifa_diaria ?? 27000)}/día`} />
            {c.ahorro_diario && c.ahorro_diario > 0 && <InfoRow label="Ahorro diario" value={`$ ${fmt(c.ahorro_diario)}/día`} />}
            {!esDiario && <InfoRow label="Día de pago" value={c.dia_pago} />}
            {c.meses && <InfoRow label="Duración" value={`${c.meses} meses · ~${Math.round(c.meses * 4.33)} semanas`} />}
            {c.fecha_entrega && <InfoRow label="Fecha entrega" value={new Date(c.fecha_entrega + "T00:00:00").toLocaleDateString("es-CO")} />}
          </div>

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
                  {alertaBase && <div style={{ marginTop: 6, fontSize: 12, color: "#92400e", fontWeight: 700 }}>⚠️ Falta poco — avisar al admin para tramitar cambio de contrato</div>}
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
              {c.estado === "En proceso" && (
                <button onClick={() => abrirWizardContinuar(c)} style={{
                  padding: "12px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(90deg,#0284c7,#10b981)", color: "white",
                  fontWeight: 800, fontSize: 14, cursor: "pointer", textAlign: "center",
                }}>
                  {!c.moto_id ? "🏍️ Continuar — asignar moto" : !c.firma_cliente ? "✍️ Continuar — firmar documentos" : "🚀 Continuar — entregar moto"}
                </button>
              )}
              {c.estado === "Activo" && (
                <button onClick={() => suspenderContrato(c.id, c.moto_id)} style={{ background: "#ede9fe", color: "#6d28d9", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ⏸️ Suspender contrato
                </button>
              )}
              {c.estado === "Activo" && (
                <button onClick={async () => {
                  if (!confirm("¿Finalizar este contrato? La moto quedará disponible.")) return;
                  const { error } = await finalizarContrato(c.id, c.moto_id);
                  if (error) setAccionError(error);
                }} style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
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

        {c.firma_cliente && (
          <div style={{ ...card, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>✅ Documentos firmados</div>
          </div>
        )}
      </div>
    );
  }

  if (isMobile && selectedId) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <PanelDetalle />
        {wizardOpen && (
          <WizardContrato
            clientes={clientes} motos={motos} contratos={contratos}
            contratoInicial={wizardContrato} stepInicial={wizardStep0}
            onClose={cerrarWizard} onCompletado={cerrarWizard}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0, fontWeight: 800 }}>Contratos</h2>
          <p style={{ marginTop: 4, color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>Solo clientes aprobados con visita domiciliaria.</p>
        </div>
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
          <button key={k.estado} onClick={() => { setFiltroEstado(k.estado); setSelectedId(null); }} style={{
            flex: "0 0 auto", padding: "10px 16px", borderRadius: 14,
            border: filtroEstado === k.estado ? `2px solid ${k.color}` : "2px solid transparent",
            background: filtroEstado === k.estado ? k.bg : "white",
            cursor: "pointer", boxShadow: "0 2px 10px rgba(15,23,42,0.06)", textAlign: "center", minWidth: 80,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{k.label}</div>
          </button>
        ))}
      </div>

      <input style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box", marginBottom: 16 }}
        placeholder="Buscar por nombre, cédula o placa..."
        value={busqueda} onChange={e => { setBusqueda(e.target.value); setSelectedId(null); }} />

      <div style={{ display: "flex", gap: 20, alignItems: "start" }}>
        {/* Lista */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {contratosFiltrados.length === 0 && contratos.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sin contratos</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Crea el primer contrato con el botón +</div>
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
              <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                ...card, cursor: "pointer",
                border: seleccionado ? "2px solid #0284c7" : c.base_completada ? "2px solid #10b981" : alertaBase ? "2px solid #f59e0b" : "2px solid transparent",
                background: seleccionado ? "#eff6ff" : "white", padding: "14px 16px",
              }}>
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

                {esDiario && !c.base_completada && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>
                      <span>Ahorro base</span><span>{pctAhorro}%</span>
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

                {c.estado === "En proceso" && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {!c.moto_id && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#eff6ff", color: "#0284c7", fontWeight: 700 }}>🏍️ Falta asignar moto</span>}
                    {c.moto_id && !c.firma_cliente && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>⏳ Falta firma</span>}
                    {c.moto_id && c.firma_cliente && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontWeight: 700 }}>🚀 Listo para entregar</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel detalle — desktop */}
        {!isMobile && (
          <div style={{ flex: "0 0 360px", maxWidth: 360 }}>
            <PanelDetalle />
          </div>
        )}
      </div>

      {/* Wizard */}
      {wizardOpen && (
        <WizardContrato
          clientes={clientes} motos={motos} contratos={contratos}
          contratoInicial={wizardContrato} stepInicial={wizardStep0}
          onClose={cerrarWizard} onCompletado={cerrarWizard}
        />
      )}

      {/* FAB */}
      {puedeCrear && (
        <button onClick={abrirWizardNuevo} style={{
          position: "fixed", bottom: isMobile ? 80 : 28, right: 20,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#0284c7 0%,#10b981 100%)",
          color: "white", border: "none", fontSize: 28, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(2,132,199,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }} title="Nuevo contrato">+</button>
      )}
    </div>
  );
}
