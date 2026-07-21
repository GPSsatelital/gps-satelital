import React, { useEffect, useMemo, useState } from "react";
import { useContratos, calcularFechaFinContrato, ahorroTotal, type ContratoEstado } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import WizardContrato from "./WizardContrato";
import ModalEditarContrato from "../components/ModalEditarContrato";
import ModalDocumentosContrato from "../components/ModalDocumentosContrato";
import ModalIniciarLiquidacion from "../components/ModalIniciarLiquidacion";
import type { Contrato } from "../hooks/useContratos";
import { formatDiaPago } from "../utils/cicloPago";

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const secondaryBtn: React.CSSProperties = { background: "var(--soft)", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer", color: "var(--muted2)", fontSize: 14 };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// Días hasta la fecha real de fin del contrato (fecha_fin_contrato, guardada — no un
// solo período de pago). Antes se recalculaba siempre desde fecha_entrega + meses,
// ignorando cualquier corrección o extensión ya registrada por "tiempo rodado".
function calcularDiasHastaVencimiento(contrato: Contrato): number | null {
  if (contrato.forma_pago === "Diario") return null;
  let fechaFin = contrato.fecha_fin_contrato;
  if (!fechaFin) {
    if (!contrato.fecha_entrega || !contrato.meses) return null;
    fechaFin = calcularFechaFinContrato(contrato.fecha_entrega, contrato.meses);
  }
  const vencimiento = new Date(fechaFin + "T00:00:00");
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  return Math.round((vencimiento.getTime() - hoy.getTime()) / 86400000);
}

function VencimientoBadge({ contrato }: { contrato: Contrato }) {
  if (contrato.estado !== "Activo") return null;
  const dias = calcularDiasHastaVencimiento(contrato);
  if (dias === null || dias > 7) return null;
  const [bg, color, text] = dias < 0
    ? ["var(--bad-soft)", "var(--bad-ink)", `Vencido hace ${Math.abs(dias)}d`]
    : dias === 0 ? ["var(--warn-soft)", "var(--warn-ink)", "Vence hoy"]
    : dias === 1 ? ["var(--warn-soft)", "var(--warn-ink)", "Vence mañana"]
    : ["var(--warn-soft)", "var(--warn-ink)", `Vence en ${dias}d`];
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

const ESTADO_COLORS: Record<ContratoEstado, { bg: string; color: string }> = {
  "En proceso": { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
  Activo:       { bg: "var(--ok-soft)", color: "var(--ok-ink)" },
  Finalizado:   { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  Cancelado:    { bg: "var(--bad-soft)", color: "var(--bad)" },
  Suspendido:   { bg: "var(--indigo-soft)", color: "var(--violet)" },
};

function ContractBadge({ estado }: { estado: ContratoEstado }) {
  const c = ESTADO_COLORS[estado] ?? { bg: "var(--soft)", color: "var(--muted2)" };
  return <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontWeight: 700 }}>{estado}</span>;
}

function wizardStep(c: Contrato): number {
  if (!c.moto_id) return 2;
  if (!c.firma_cliente) return 3;
  return 6;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--soft)" }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function ContratosView({ initialFilter = "", initialOpenForm = false }: { initialFilter?: string; initialOpenForm?: boolean }) {
  const { profile, puede } = useAuth();
  const role = profile?.role ?? "SECRETARIA";
  // Permiso por persona (rol como techo). Defaults calzan con lo actual: crear/editar = ADMIN(+AP).
  const puedeCrear = puede("crear_contrato");
  const puedeEditar = puede("editar_contrato");
  const puedeLiquidar = puede("iniciar_liquidacion");
  const puedeDocumentos = puedeCrear || role === "SECRETARIA";

  const { filtrarContratos } = useScope();
  const { contratos: todosContratos, loading, error, eliminarContratoEnProceso, suspenderContrato, reactivarContrato } = useContratos();
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
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | GrupoMoto>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(initialOpenForm && puedeCrear);
  const [wizardContrato, setWizardContrato] = useState<Contrato | undefined>(undefined);
  const [wizardStep0, setWizardStep0] = useState<number | undefined>(undefined);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDocumentosAbierto, setModalDocumentosAbierto] = useState(false);
  const [modalLiquidacionAbierto, setModalLiquidacionAbierto] = useState(false);

  useEffect(() => { if (initialOpenForm && puedeCrear) setWizardOpen(true); }, [initialOpenForm, puedeCrear]);

  function abrirWizardNuevo() { setWizardContrato(undefined); setWizardStep0(undefined); setWizardOpen(true); }
  function abrirWizardContinuar(c: Contrato) { setWizardContrato(c); setWizardStep0(wizardStep(c)); setWizardOpen(true); }
  function cerrarWizard() { setWizardOpen(false); setWizardContrato(undefined); setWizardStep0(undefined); }

  const contratosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return contratos.filter(c => {
      if (filtroEstado && c.estado !== filtroEstado) return false;
      if (filtroGrupo !== "todos") {
        const moto = motos.find(m => m.id === c.moto_id);
        if (moto?.grupo !== filtroGrupo) return false;
      }
      if (!q) return true;
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return (
        (cliente?.nombre ?? "").toLowerCase().includes(q) ||
        (moto?.placa ?? "").toLowerCase().includes(q) ||
        (cliente?.cedula ?? "").includes(q)
      );
    });
  }, [contratos, filtroEstado, filtroGrupo, busqueda, clientes, motos]);

  const GRUPOS_FILTRO: ("todos" | GrupoMoto)[] = ["todos", "COSTA", "PRADERA", "RASTREADOR", "USADAS"];
  function ChipsGrupo() {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {GRUPOS_FILTRO.map(g => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            style={{
              padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              background: filtroGrupo === g ? "var(--accent)" : "var(--soft)",
              color: filtroGrupo === g ? "var(--card)" : "var(--muted2)",
            }}
          >
            {g === "todos" ? "Todos" : g}
          </button>
        ))}
      </div>
    );
  }

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

  if (loading) return <div style={{ padding: 24, color: "var(--muted)" }}>Cargando contratos...</div>;

  function PanelDetalle() {
    if (!contratoSeleccionado || !clienteDetalle) {
      return (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "var(--muted)" }}>
          Selecciona un contrato para ver el detalle.
        </div>
      );
    }

    const c = contratoSeleccionado;
    const esDiario = c.forma_pago === "Diario";
    const ahorro = ahorroTotal(c);
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
              <div style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", color: "var(--text)" }}>{clienteDetalle.nombre}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>CC {clienteDetalle.cedula}{clienteDetalle.telefono && ` · 📞 ${clienteDetalle.telefono}`}</div>
              {motoDetalle && <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>🏍️ {motoDetalle.placa} — {motoDetalle.marca} {motoDetalle.modelo}</div>}
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
            {!esDiario && <InfoRow label="Día de pago" value={formatDiaPago(c)} />}
            {c.meses && <InfoRow label="Duración" value={`${c.meses} meses · ~${Math.round(c.meses * 4.33)} semanas`} />}
            {c.fecha_entrega && <InfoRow label="Fecha entrega" value={new Date(c.fecha_entrega + "T00:00:00").toLocaleDateString("es-CO")} />}
            {!esDiario && (c.fecha_fin_contrato ?? (c.fecha_entrega && c.meses ? calcularFechaFinContrato(c.fecha_entrega, c.meses) : null)) && (
              <InfoRow label="Fecha fin de contrato" value={new Date((c.fecha_fin_contrato ?? calcularFechaFinContrato(c.fecha_entrega!, c.meses!)) + "T00:00:00").toLocaleDateString("es-CO")} />
            )}
          </div>

          {esDiario && (
            <div style={{ marginTop: 14 }}>
              {c.base_completada ? (
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--ok-soft)", color: "var(--ok-ink)", fontWeight: 700, fontSize: 13 }}>
                  ✅ Base completada — listo para cambio de contrato
                </div>
              ) : (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: alertaBase ? "var(--warn-soft)" : "var(--soft2)", border: `1px solid ${alertaBase ? "var(--warn-line)" : "var(--line)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                    <span>Ahorro acumulado</span>
                    <span style={{ fontWeight: 700 }}>$ {fmt(ahorro)} / $ {fmt(ahorroMeta)} ({pctAhorro}%)</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "var(--warn2)" : "var(--accent)", transition: "width 0.3s" }} />
                  </div>
                  {alertaBase && <div style={{ marginTop: 6, fontSize: 12, color: "var(--warn-ink)", fontWeight: 700 }}>⚠️ Falta poco — avisar al admin para tramitar cambio de contrato</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        {puedeCrear && c.estado !== "Finalizado" && (
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--muted2)" }}>Acciones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.estado === "Cancelado" && (
                <button onClick={async () => {
                  if (!confirm("¿Reactivar este contrato? Quedará Activo otra vez y la moto pasará a Asignada.")) return;
                  const { error } = await reactivarContrato(c.id, c.moto_id);
                  if (error) setAccionError(error);
                }} style={{ background: "var(--ok-soft)", color: "var(--ok-ink)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ↩️ Reactivar contrato
                </button>
              )}
              {c.estado === "En proceso" && (
                <button onClick={() => abrirWizardContinuar(c)} style={{
                  padding: "12px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(90deg,var(--accent),var(--ok2))", color: "var(--card)",
                  fontWeight: 800, fontSize: 14, cursor: "pointer", textAlign: "center",
                }}>
                  {!c.moto_id ? "🏍️ Continuar — asignar moto" : !c.firma_cliente ? "✍️ Continuar — firmar documentos" : "🚀 Continuar — entregar moto"}
                </button>
              )}
              {c.estado === "Activo" && (
                <button onClick={() => {
                  if (!confirm("¿Suspender este contrato? La moto quedará como Recuperada (retenida por la empresa).")) return;
                  suspenderContrato(c.id, c.moto_id);
                }} style={{ background: "var(--indigo-soft)", color: "var(--violet)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ⏸️ Suspender contrato
                </button>
              )}
              {(c.estado === "Activo" || c.estado === "Suspendido") && puedeLiquidar && (
                // Todo cierre REAL (con moto entregada, ahorro, posible deuda) pasa por
                // Liquidación — calcula el saldo, trae deudas automáticas, deja documento
                // firmado. Los botones rápidos de antes cerraban sin calcular nada.
                <button onClick={() => setModalLiquidacionAbierto(true)} style={{ background: "var(--accent-soft3)", color: "var(--accent-ink)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  📄 Iniciar liquidación
                </button>
              )}
              {c.estado === "En proceso" && (
                // Un contrato "En proceso" nunca se activó — es un intento abortado.
                // Cancelarlo lo ELIMINA por completo (fila, fotos/firmas, libera la moto),
                // no lo deja como "Cancelado" (ese estado se reserva para contratos que
                // sí se activaron y se cerraron por liquidación).
                <button onClick={async () => {
                  if (!confirm("¿Eliminar este contrato En proceso? Se borra por completo (fotos/firmas y libera la moto). No se puede deshacer.")) return;
                  const { error } = await eliminarContratoEnProceso(c);
                  if (error) setAccionError(error);
                }} style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  🗑️ Cancelar y eliminar
                </button>
              )}
            </div>
            {accionError && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                <span>⚠️ {accionError}</span>
                <button onClick={() => setAccionError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bad-ink)" }}>✕</button>
              </div>
            )}
          </div>
        )}

        {(puedeCrear || puedeDocumentos) && (
          <div style={{ ...card, display: "grid", gap: 8 }}>
            {/* Migrados: entraron por SQL sin sus documentos físicos — recordatorio no
                bloqueante hasta que se suban con el botón de abajo. Los del wizard nunca
                lo muestran (sus PDF se generan al firmar). */}
            {c.es_migrado && (!c.contrato_pdf_url || !c.pagare_pdf_url) && (
              <div style={{ background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--warn-ink)", fontWeight: 700 }}>
                📎 Faltan documentos del contrato: {[!c.contrato_pdf_url && "contrato firmado", !c.pagare_pdf_url && "pagaré"].filter(Boolean).join(" y ")} — súbelos con el botón de abajo.
              </div>
            )}
            {puedeEditar && (
              <button
                onClick={() => setModalEditarAbierto(true)}
                style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14, textAlign: "center" }}
              >
                ✏️ Editar contrato
              </button>
            )}
            {puedeDocumentos && (
              <button
                onClick={() => setModalDocumentosAbierto(true)}
                style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14, textAlign: "center" }}
              >
                📎 Documentos del contrato
              </button>
            )}
          </div>
        )}

        {c.firma_cliente && (
          <div style={{ ...card, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>✅ Documentos firmados</div>
          </div>
        )}

        {modalEditarAbierto && (
          <ModalEditarContrato
            contrato={c}
            clienteNombre={clienteDetalle.nombre}
            onClose={() => setModalEditarAbierto(false)}
          />
        )}

        {modalDocumentosAbierto && (
          <ModalDocumentosContrato
            contrato={c}
            clienteNombre={clienteDetalle.nombre}
            onClose={() => setModalDocumentosAbierto(false)}
          />
        )}

        {modalLiquidacionAbierto && (
          <ModalIniciarLiquidacion
            contratoId={c.id}
            clienteId={c.cliente_id}
            clienteNombre={clienteDetalle.nombre}
            motoId={c.moto_id}
            placa={motoDetalle?.placa ?? "Sin placa"}
            ahorroAcumulado={ahorroTotal(c)}
            motivoInicial={c.estado === "Suspendido" ? "incumplimiento" : "cumplimiento"}
            onClose={() => setModalLiquidacionAbierto(false)}
          />
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
          <p style={{ marginTop: 4, color: "var(--muted)", margin: "4px 0 0", fontSize: 14 }}>Solo clientes aprobados con visita domiciliaria.</p>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: "var(--bad-ink)" }}>Error: {error}</div>}

      {/* KPI pills */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {[
          { label: "Total",       value: counts.total,       estado: "",            color: "var(--muted2)", bg: "var(--soft)" },
          { label: "Activos",     value: counts.activos,     estado: "Activo",      color: "var(--ok-ink)", bg: "var(--ok-soft)" },
          { label: "En proceso",  value: counts.enProceso,   estado: "En proceso",  color: "var(--warn-ink)", bg: "var(--warn-soft)" },
          { label: "Suspendidos", value: counts.suspendidos, estado: "Suspendido",  color: "var(--violet)", bg: "var(--indigo-soft)" },
          { label: "Finalizados", value: counts.finalizados, estado: "Finalizado",  color: "var(--accent-ink)", bg: "var(--accent-soft3)" },
          { label: "Cancelados",  value: counts.cancelados,  estado: "Cancelado",   color: "var(--bad)", bg: "var(--bad-soft)" },
        ].map(k => (
          <button key={k.estado} onClick={() => { setFiltroEstado(k.estado); setSelectedId(null); }} style={{
            flex: "0 0 auto", padding: "10px 16px", borderRadius: 14,
            border: filtroEstado === k.estado ? `2px solid ${k.color}` : "2px solid transparent",
            background: filtroEstado === k.estado ? k.bg : "var(--card)",
            cursor: "pointer", boxShadow: "0 2px 10px rgba(15,23,42,0.06)", textAlign: "center", minWidth: 80,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontWeight: 600 }}>{k.label}</div>
          </button>
        ))}
      </div>

      <input style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line2)", outline: "none", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }}
        placeholder="Buscar por nombre, cédula o placa..."
        value={busqueda} onChange={e => { setBusqueda(e.target.value); setSelectedId(null); }} />

      <ChipsGrupo />

      <div style={{ display: "flex", gap: 20, alignItems: "start" }}>
        {/* Lista */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {contratosFiltrados.length === 0 && contratos.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>Sin contratos</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Crea el primer contrato con el botón +</div>
            </div>
          )}
          {contratosFiltrados.length === 0 && contratos.length > 0 && (
            <div style={{ ...card, color: "var(--muted)", textAlign: "center", padding: 24 }}>No hay contratos con ese filtro.</div>
          )}

          {contratosFiltrados.map(c => {
            const cliente = clientes.find(cl => cl.id === c.cliente_id);
            const moto = motos.find(m => m.id === c.moto_id);
            const esDiario = c.forma_pago === "Diario";
            const ahorro = ahorroTotal(c);
            const ahorroMeta = c.base_inicial ?? 510000;
            const pctAhorro = Math.min(100, Math.round((ahorro / ahorroMeta) * 100));
            const alertaBase = esDiario && !c.base_completada && ahorro >= ahorroMeta * 0.9;
            const seleccionado = c.id === (contratoSeleccionado?.id ?? null);

            return (
              <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                ...card, cursor: "pointer",
                border: seleccionado ? "2px solid var(--accent)" : c.base_completada ? "2px solid var(--ok2)" : alertaBase ? "2px solid var(--warn2)" : "2px solid transparent",
                background: seleccionado ? "var(--accent-soft2)" : "var(--card)", padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cliente?.nombre ?? "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                      {moto ? `🏍️ ${moto.placa} · ` : "Sin moto · "}
                      {esDiario ? "Diario" : `${c.forma_pago} · Paga ${formatDiaPago(c)}`}
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
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginBottom: 3 }}>
                      <span>Ahorro base</span><span>{pctAhorro}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "var(--warn2)" : "var(--accent)" }} />
                    </div>
                  </div>
                )}
                {esDiario && c.base_completada && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "var(--ok-soft)", borderRadius: 8, fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>
                    🎯 Base completada — listo para nuevo contrato
                  </div>
                )}

                {c.estado === "En proceso" && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {!c.moto_id && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--accent-soft2)", color: "var(--accent)", fontWeight: 700 }}>🏍️ Falta asignar moto</span>}
                    {c.moto_id && !c.firma_cliente && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--warn-soft)", color: "var(--warn-ink)", fontWeight: 700 }}>⏳ Falta firma</span>}
                    {c.moto_id && c.firma_cliente && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok-ink)", fontWeight: 700 }}>🚀 Listo para entregar</span>}
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
          background: "linear-gradient(135deg,var(--accent) 0%,var(--ok2) 100%)",
          color: "var(--card)", border: "none", fontSize: 28, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(2,132,199,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
        }} title="Nuevo contrato">+</button>
      )}
    </div>
  );
}
