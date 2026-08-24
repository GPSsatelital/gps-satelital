import React, { useEffect, useMemo, useState } from "react";
import { useContratos, calcularFechaFinContrato, ahorroTotal, type ContratoEstado } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import { useBackGuard } from "../contexts/BackNav";
import WizardContrato from "./WizardContrato";
import ModalEditarContrato from "../components/ModalEditarContrato";
import ModalResolverTiempoFueraServicio from "../components/ModalResolverTiempoFueraServicio";
import { hoyISO } from "../utils/fecha";
import ModalDocumentosContrato from "../components/ModalDocumentosContrato";
import ModalIniciarLiquidacion from "../components/ModalIniciarLiquidacion";
import { useLiquidaciones } from "../hooks/useLiquidaciones";
import ModalProyeccionLiquidacion from "../components/ModalProyeccionLiquidacion";
import ModalCederContrato from "../components/ModalCederContrato";
import Placa from "../components/Placa";
import type { Contrato } from "../hooks/useContratos";
import { formatDiaPago } from "../utils/cicloPago";
import { usePagos } from "../hooks/usePagos";
import { imprimirLiquidacion } from "../utils/generarDocumentoLiquidacion";
import { ListBox, ItemLista } from "../components/ListaEstandar";
import { Chip, Badge, type BadgeTone } from "../components/atomos";

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const secondaryBtn: React.CSSProperties = { background: "var(--soft)", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", color: "var(--muted2)", fontSize: 13 };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "#0f172a", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// Cómo se llama cada etapa en palabras — la pantalla de Contratos no tiene por qué mostrarle al
// funcionario los nombres internos del módulo de Liquidaciones.
const ESTADO_LIQ: Record<string, string> = {
  iniciada: "iniciada",
  en_taller: "revisión de taller",
  calculada: "saldo calculado",
  documento_generado: "documento generado",
  firmada: "firmada por el cliente",
};

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
  const [tone, text]: [BadgeTone, string] = dias < 0
    ? ["bad", `Vencido hace ${Math.abs(dias)}d`]
    : dias === 0 ? ["warn", "Vence hoy"]
    : dias === 1 ? ["warn", "Vence mañana"]
    : ["warn", `Vence en ${dias}d`];
  return <Badge tone={tone}>{text}</Badge>;
}

const ESTADO_TONE: Record<ContratoEstado, BadgeTone> = {
  "En proceso": "warn",
  Activo:       "ok",
  Finalizado:   "accent",
  Cancelado:    "bad",
  Suspendido:   "indigo",
};

const ESTADO_RIEL: Record<ContratoEstado, string> = {
  "En proceso": "var(--warn2)",
  Activo:       "var(--ok2)",
  Finalizado:   "var(--accent)",
  Cancelado:    "var(--bad)",
  Suspendido:   "var(--violet)",
};

function ContractBadge({ estado }: { estado: ContratoEstado }) {
  return <Badge tone={ESTADO_TONE[estado] ?? "neutral"}>{estado}</Badge>;
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
  const { liquidaciones } = useLiquidaciones();
  const { pagos } = usePagos();
  const [histAbierto, setHistAbierto] = useState<string | null>(null);   // historial del contrato cerrado
  const puedeCeder = puede("ceder_contrato");
  // RESOLVER EL TIEMPO GUARDADO DESPUÉS (24-ago): cuando la entrega la hace un SUBADMIN o
  // SECRETARIA, el modal de cobrar/rodar no les sale (la decisión es del admin) y el caso se
  // evaporaba para siempre — pasó dos veces el mismo fin de semana (WILLINGTON DQW26I y JUAN
  // CARLOS YAL68H, ajustados por SQL). Este botón lo deja RE-ABRIBLE: el admin pone las fechas
  // reales del guardado y sigue el flujo de siempre, con documento firmado. Nada queda en el aire.
  const esAdminRol = role === "ADMIN" || role === "ADMIN_PRINCIPAL";
  const [rtFechas, setRtFechas] = useState<{ desde: string; hasta: string } | null>(null);
  const [rtFormAbierto, setRtFormAbierto] = useState(false);
  const [rtDesde, setRtDesde] = useState("");
  const [rtHasta, setRtHasta] = useState(hoyISO());
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
  const [proyeccionAbierta, setProyeccionAbierta] = useState(false);
  const [modalCesionAbierto, setModalCesionAbierto] = useState(false);
  // Atrás cierra el modal abierto antes de cambiar de módulo.
  useBackGuard(modalEditarAbierto, () => setModalEditarAbierto(false));
  useBackGuard(modalDocumentosAbierto, () => setModalDocumentosAbierto(false));
  useBackGuard(modalLiquidacionAbierto, () => setModalLiquidacionAbierto(false));

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
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {GRUPOS_FILTRO.map(g => (
          <Chip key={g} activo={filtroGrupo === g} onClick={() => setFiltroGrupo(g)}>
            {g === "todos" ? "Todos" : g}
          </Chip>
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

  if (loading) return (
    <div style={{ padding: "16px 12px", maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[72, 60, 88, 66].map((w, i) => <div key={i} style={{ width: w, height: 30, borderRadius: 999, background: "var(--line)", animation: "mgPulsa 1.5s ease-in-out infinite" }} />)}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 78, borderRadius: 16, background: "var(--line)", animation: "mgPulsa 1.5s ease-in-out infinite" }} />)}
      </div>
    </div>
  );

  function PanelDetalle() {
    if (!contratoSeleccionado || !clienteDetalle) {
      return (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "var(--muted)" }}>
          Selecciona un contrato para ver el detalle.
        </div>
      );
    }

    const c = contratoSeleccionado;
    // La liquidación abierta de ESTE contrato (si la hay). "Cerrada" no cuenta: esa ya terminó.
    const liqAbierta = liquidaciones.find(l => l.contrato_id === c.id && l.estado !== "cerrada") ?? null;
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
              <div style={{ fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: "var(--text)" }}>{clienteDetalle.nombre}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>CC {clienteDetalle.cedula}{clienteDetalle.telefono && ` · 📞 ${clienteDetalle.telefono}`}</div>
              {motoDetalle && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Placa placa={motoDetalle.placa} grupo={motoDetalle.grupo} size="lg" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)" }}>{motoDetalle.marca} {motoDetalle.modelo}</span>
                </div>
              )}
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginTop: 6 }}>
                    <span>De inicio: $ {fmt(c.ahorro_apertura ?? 0)}</span>
                    <span>Por pagos: $ {fmt(c.ahorro_acumulado ?? 0)}</span>
                  </div>
                  {alertaBase && <div style={{ marginTop: 6, fontSize: 12, color: "var(--warn-ink)", fontWeight: 700 }}>⚠️ Falta poco — avisar al admin para tramitar cambio de contrato</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones. OJO al contenedor: antes estaba gateado SOLO por puedeCrear y le escondía a
            ANGELA (SECRETARIA) la proyección y el iniciar liquidación, que sí son suyos desde la
            mig 110 — el mismo error de contenedor contra el que advierte el comentario de más
            abajo. Ahora el contenedor abre si tiene CUALQUIER acción; cada botón exigente
            (reactivar, suspender, continuar wizard, eliminar) lleva su puedeCrear propio. */}
        {(puedeCrear || puedeLiquidar) && c.estado !== "Finalizado" && (
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: "var(--muted2)" }}>Acciones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {puedeCrear && c.estado === "Cancelado" && (
                <button onClick={async () => {
                  if (!confirm("¿Reactivar este contrato? Quedará Activo otra vez y la moto pasará a Asignada.")) return;
                  const { error } = await reactivarContrato(c.id, c.moto_id);
                  if (error) setAccionError(error);
                }} style={{ background: "var(--ok-soft)", color: "var(--ok-ink)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ↩️ Reactivar contrato
                </button>
              )}
              {puedeCrear && c.estado === "En proceso" && (
                <button onClick={() => abrirWizardContinuar(c)} style={{
                  padding: "12px 16px", borderRadius: 14, border: "none",
                  background: "linear-gradient(90deg,var(--accent),var(--ok2))", color: "var(--card)",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center",
                }}>
                  {!c.moto_id ? "🏍️ Continuar — asignar moto" : !c.firma_cliente ? "✍️ Continuar — firmar documentos" : "🚀 Continuar — entregar moto"}
                </button>
              )}
              {puedeCrear && c.estado === "Activo" && (
                <button onClick={() => {
                  if (!confirm("¿Suspender este contrato? La moto quedará como Recuperada (retenida por la empresa).")) return;
                  suspenderContrato(c.id, c.moto_id);
                }} style={{ background: "var(--indigo-soft)", color: "var(--violet)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  ⏸️ Suspender contrato
                </button>
              )}
              {/* Si YA hay una liquidación abierta, la pantalla lo dice. Antes se le daba a
                  "Iniciar liquidación", se creaba, y aquí no cambiaba absolutamente nada: el
                  botón seguía igual y no había forma de saber que ya existía ni dónde seguirla.
                  El único aviso llegaba al volver a darle, cuando el candado anti-doble decía
                  "ya existe una". Hay 11 liquidaciones atascadas en la primera etapa, y esto
                  explica buena parte: se abren y nadie sabe que quedaron a medias. */}
              {liqAbierta && (
                <div style={{ background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 14, padding: "12px 16px", fontSize: 13, color: "var(--warn-ink)", lineHeight: 1.5 }}>
                  📄 <strong>Liquidación {liqAbierta.numero} en curso</strong> — va en «{ESTADO_LIQ[liqAbierta.estado] ?? liqAbierta.estado}».
                  <div style={{ marginTop: 2, fontWeight: 400 }}>Continúala en el módulo <strong>Liquidaciones</strong> para calcular el saldo y cerrarla.</div>
                </div>
              )}
              {/* Ver la cuenta ANTES de decidir. No escribe nada — sirve para saber si al cliente
                  se le devuelve plata o queda debiendo, y cuánto cambia según el día en que se
                  guardó la moto. Sale también con liquidación abierta: ahí ayuda a revisar. */}
              {(c.estado === "Activo" || c.estado === "Suspendido") && (
                <button onClick={() => setProyeccionAbierta(true)} style={{ background: "var(--soft2)", color: "var(--text)", border: "1px solid var(--line2)", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  🧮 Si lo liquido, ¿cuánto sale?
                </button>
              )}
              {(c.estado === "Activo" || c.estado === "Suspendido") && puedeLiquidar && !liqAbierta && (
                // Todo cierre REAL (con moto entregada, ahorro, posible deuda) pasa por
                // Liquidación — calcula el saldo, trae deudas automáticas, deja documento
                // firmado. Los botones rápidos de antes cerraban sin calcular nada.
                <button onClick={() => setModalLiquidacionAbierto(true)} style={{ background: "var(--accent-soft3)", color: "var(--accent-ink)", border: "none", borderRadius: 14, padding: "12px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  📄 Iniciar liquidación
                </button>
              )}
              {puedeCrear && c.estado === "En proceso" && (
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

        {/* CONTRATO CERRADO: el resumen del cierre y su historial. Antes un Finalizado quedaba
            MUDO — se seleccionaba y no decía ni qué se le liquidó ni qué pasó mientras vivió
            (reporte del dueño, 22-ago, con el contrato de ANTONIO recién cerrado). */}
        {(c.estado === "Finalizado" || c.estado === "Cancelado") && (() => {
          const liq = liquidaciones.find(l => l.contrato_id === c.id && l.estado === "cerrada") ?? null;
          const pagosC = pagos
            .filter(p => p.contrato_id === c.id && p.estado === "Confirmado")
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
          const totalPagado = pagosC.reduce((s, p) => s + p.valor, 0);
          const primero = pagosC.length > 0 ? pagosC[pagosC.length - 1].fecha : null;
          const ultimo = pagosC.length > 0 ? pagosC[0].fecha : null;
          const cli = clientes.find(x => x.id === c.cliente_id);
          const moto = motos.find(m => m.id === c.moto_id);
          const MOTIVO_TXT: Record<string, string> = { cumplimiento: "Cumplimiento", retiro_voluntario: "Retiro voluntario", incumplimiento: "Incumplimiento" };
          const abierto = histAbierto === c.id;
          return (
            <>
              <div style={card}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: "var(--muted2)" }}>📄 Así cerró este contrato</div>
                {liq ? (
                  <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Liquidación</span><strong>{liq.numero}</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Motivo</span><strong>{MOTIVO_TXT[liq.motivo] ?? liq.motivo}</strong></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--muted)" }}>{liq.saldo_final >= 0 ? "Se le devolvió" : "Quedó debiendo"}</span>
                      <strong style={{ color: liq.saldo_final >= 0 ? "var(--ok-ink)" : "var(--bad-ink)", fontSize: 15 }}>$ {fmt(Math.abs(liq.saldo_final))}</strong>
                    </div>
                    {(liq.base_trasladada ?? 0) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Quedó como base de su moto nueva</span><strong>$ {fmt(liq.base_trasladada ?? 0)}</strong></div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--muted)" }}>Firma del cliente</span><strong style={{ color: liq.documento_firmado_url ? "var(--ok-ink)" : "var(--warn-ink)" }}>{liq.documento_firmado_url ? "✓ Firmada" : "Sin firma"}</strong></div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      {liq.documento_firmado_url && (
                        <a href={liq.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ ...secondaryBtn, textDecoration: "none", textAlign: "center" }}>📄 Ver documento firmado</a>
                      )}
                      <button
                        onClick={() => imprimirLiquidacion(liq,
                          { nombre: cli?.nombre ?? "", cedula: cli?.cedula, telefono: cli?.telefono },
                          moto ? { marca: moto.marca, modelo: moto.modelo, placa: moto.placa } : null,
                          { borrador: !liq.firma_cliente_url, firmaUrl: liq.firma_cliente_url, huellaUrl: liq.huella_cliente_url, fechaFirma: liq.fecha_firma })}
                        style={{ ...secondaryBtn }}>
                        🖨️ Reimprimir liquidación
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                    Cerró sin liquidación registrada en el sistema (contratos viejos o cierres manuales).
                  </div>
                )}
              </div>

              <div style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--muted2)" }}>🧾 Lo que pasó mientras estuvo activo</div>
                  {pagosC.length > 0 && (
                    <button onClick={() => setHistAbierto(abierto ? null : c.id)} style={{ ...secondaryBtn, padding: "7px 12px", fontSize: 12.5 }}>
                      {abierto ? "Ocultar pagos" : `Ver los ${pagosC.length} pagos`}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--text)" }}>{pagosC.length}</strong> pagos confirmados ·
                  total <strong style={{ color: "var(--text)" }}>$ {fmt(totalPagado)}</strong>
                  {primero && ultimo && <> · del <strong>{primero}</strong> al <strong>{ultimo}</strong></>}
                  {c.motor_v2 && c.total_cajas != null && <> · llegó a la semana <strong>{c.cajas_pagadas ?? 0} de {c.total_cajas}</strong></>}
                </div>
                {abierto && (
                  <div style={{ marginTop: 10, borderTop: "1px solid var(--line)", maxHeight: "40vh", overflowY: "auto" }}>
                    {pagosC.map((p, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: "1px solid var(--line)", fontSize: 12.5, minWidth: 0 }}>
                        <span style={{ color: "var(--muted)", flexShrink: 0 }}>{p.fecha}</span>
                        <span style={{ flex: 1, minWidth: 0, textAlign: "center", color: "var(--faint)", fontSize: 11.5 }}>{p.metodo}</span>
                        <strong style={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>$ {fmt(p.valor)}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>
                  El detalle completo (a qué se aplicó cada pago, deudas, convenios, gestiones) vive en la ficha del cliente.
                </div>
              </div>
            </>
          );
        })()}

        {/* Cada botón depende de SU permiso (no de puedeCrear): así "Editar contrato"
            funciona para quien tenga esa acción activada, sin importar el rol.
            OJO: un contrato FINALIZADO no se edita — ya se liquidó y sus cifras respaldan un
            documento firmado (reporte del dueño, 22-ago: el botón seguía saliendo). */}
        {((puedeEditar && c.estado !== "Finalizado") || puedeDocumentos) && (
          <div style={{ ...card, display: "grid", gap: 8 }}>
            {/* Migrados: entraron por SQL sin sus documentos físicos — recordatorio no
                bloqueante hasta que se suban con el botón de abajo. Los del wizard nunca
                lo muestran (sus PDF se generan al firmar). */}
            {c.es_migrado && (!c.contrato_pdf_url || !c.pagare_pdf_url) && (
              <div style={{ background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--warn-ink)", fontWeight: 700 }}>
                📎 Faltan documentos del contrato: {[!c.contrato_pdf_url && "contrato firmado", !c.pagare_pdf_url && "pagaré"].filter(Boolean).join(" y ")} — súbelos con el botón de abajo.
              </div>
            )}
            {puedeEditar && c.estado !== "Finalizado" && (
              <button
                onClick={() => setModalEditarAbierto(true)}
                style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14, textAlign: "center" }}
              >
                ✏️ Editar contrato
              </button>
            )}
            {esAdminRol && c.estado === "Activo" && (
              <button
                onClick={() => { setRtDesde(""); setRtHasta(hoyISO()); setRtFormAbierto(true); }}
                style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14, textAlign: "center" }}
              >
                ⏱️ Resolver tiempo guardado (cobrar / rodar)
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

        {/* En su PROPIO bloque, no dentro del gateado por `puedeCrear`: ese fue exactamente el
            defecto que documenta la mig 058 — el botón existía y no se mostraba nunca.
            Suspendido SÍ entra: la moto guardada por falta de pago es el caso más frecuente,
            y la cesión es lo que permite que salga a nombre de otro. */}
        {puedeCeder && ["Activo", "Suspendido"].includes(c.estado) && (
          <div style={{ ...card }}>
            <button
              onClick={() => setModalCesionAbierto(true)}
              style={{ ...secondaryBtn, width: "100%", padding: "12px 16px", fontSize: 14, textAlign: "center" }}
            >
              🔁 Ceder contrato a otro cliente
            </button>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
              Pasa el contrato completo —ahorros, semanas pagadas y deudas— a otra persona, con las
              mismas condiciones. La moto se entrega aparte, por Inmovilizaciones.
            </div>
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

        {/* Mini-paso del tiempo guardado: el admin pone las fechas REALES (de cuándo a cuándo
            estuvo la moto en la empresa) y sigue el flujo de siempre con documento firmado. */}
        {rtFormAbierto && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setRtFormAbierto(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderRadius: 16, padding: 20, width: "100%", maxWidth: 420, boxSizing: "border-box", display: "grid", gap: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>⏱️ ¿De qué fecha a qué fecha estuvo guardada?</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                Con las fechas, el sistema calcula los períodos COMPLETOS que se pueden rodar
                (los días sueltos se quedan en su semana). Si el cliente tiene convenio, sus
                cuotas de esas semanas se corren también.
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>Se guardó el</div>
                <input type="date" value={rtDesde} onChange={e => setRtDesde(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--soft)", color: "var(--text)", fontSize: 14 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>Se devolvió el</div>
                <input type="date" value={rtHasta} onChange={e => setRtHasta(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--soft)", color: "var(--text)", fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRtFormAbierto(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
                <button
                  disabled={!rtDesde || !rtHasta || rtDesde >= rtHasta}
                  onClick={() => { setRtFormAbierto(false); setRtFechas({ desde: rtDesde, hasta: rtHasta }); }}
                  style={{ ...primaryBtn, flex: 1, opacity: !rtDesde || !rtHasta || rtDesde >= rtHasta ? 0.5 : 1 }}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {rtFechas && (
          <ModalResolverTiempoFueraServicio
            contrato={c}
            clienteNombre={clienteDetalle.nombre}
            motoPlaca={motoDetalle?.placa ?? "Sin placa"}
            motivo="Moto guardada en la empresa"
            fechaEntrada={rtFechas.desde}
            fechaSalida={rtFechas.hasta}
            onClose={() => setRtFechas(null)}
          />
        )}

        {modalDocumentosAbierto && (
          <ModalDocumentosContrato
            contrato={c}
            clienteNombre={clienteDetalle.nombre}
            onClose={() => setModalDocumentosAbierto(false)}
          />
        )}

        {modalCesionAbierto && (
          <ModalCederContrato
            contrato={c}
            onClose={() => setModalCesionAbierto(false)}
            onDone={(m) => { setModalCesionAbierto(false); alert(m); }}
          />
        )}

        {proyeccionAbierta && (
          <ModalProyeccionLiquidacion
            contrato={c}
            clienteNombre={clienteDetalle.nombre}
            placa={motoDetalle?.placa ?? "Sin placa"}
            onClose={() => setProyeccionAbierta(false)}
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
            // Nunca "cumplimiento" por defecto: ese motivo le ENTREGA la moto al cliente. Venía
            // preseleccionado para todo contrato Activo, así que bastaba no cambiarlo para regalar
            // una moto. Ahora hay que elegirlo a propósito, y el modal solo lo ofrece si el
            // cliente terminó de pagar todas sus cuotas.
            motivoInicial={c.estado === "Suspendido" ? "incumplimiento" : "retiro_voluntario"}
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
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>Contratos</h2>
            <p style={{ marginTop: 4, color: "var(--muted)", margin: "4px 0 0", fontSize: 14 }}>Solo clientes aprobados con visita domiciliaria.</p>
          </div>
        </div>
      )}

      {error && <div style={{ marginBottom: 12, color: "var(--bad-ink)" }}>Error: {error}</div>}

      {/* KPI pills */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginTop: isMobile ? 4 : 0, marginBottom: isMobile ? 10 : 16 }}>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</div>
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
        <div style={{ flex: 1, minWidth: 0 }}>
          {contratosFiltrados.length === 0 && contratos.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Sin contratos</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Crea el primer contrato con el botón +</div>
            </div>
          )}
          {contratosFiltrados.length === 0 && contratos.length > 0 && (
            <div style={{ ...card, color: "var(--muted)", textAlign: "center", padding: 24 }}>No hay contratos con ese filtro.</div>
          )}

          {contratosFiltrados.length > 0 && (
            <ListBox isMobile>
              {contratosFiltrados.map((c) => {
                const cliente = clientes.find(cl => cl.id === c.cliente_id);
                const moto = motos.find(m => m.id === c.moto_id);
                const esDiario = c.forma_pago === "Diario";
                const ahorro = ahorroTotal(c);
                const ahorroMeta = c.base_inicial ?? 510000;
                const pctAhorro = Math.min(100, Math.round((ahorro / ahorroMeta) * 100));
                const alertaBase = esDiario && !c.base_completada && ahorro >= ahorroMeta * 0.9;
                const seleccionado = c.id === (contratoSeleccionado?.id ?? null);
                const tieneExtra = esDiario || c.estado === "En proceso";
                return (
                  <ItemLista
                    key={c.id}
                    placa={moto?.placa}
                    grupo={moto?.grupo}
                    titulo={cliente?.nombre ?? "Sin cliente"}
                    subtitulo={`${moto ? "" : "Sin moto · "}${esDiario ? "Diario" : `${c.forma_pago} · Paga ${formatDiaPago(c)}`} · $ ${fmt(c.valor_semanal)}`}
                    right={<><ContractBadge estado={c.estado} /><VencimientoBadge contrato={c} /></>}
                    rielColor={c.base_completada ? "var(--ok2)" : alertaBase ? "var(--warn2)" : (ESTADO_RIEL[c.estado] ?? "var(--muted)")}
                    seleccionado={seleccionado}
                    onClick={() => setSelectedId(c.id)}
                    extra={tieneExtra ? <>
                      {esDiario && !c.base_completada && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", marginBottom: 3 }}>
                            <span>Ahorro base</span><span>{pctAhorro}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "var(--warn2)" : "var(--accent)" }} />
                          </div>
                        </div>
                      )}
                      {esDiario && c.base_completada && (
                        <div style={{ padding: "6px 10px", background: "var(--ok-soft)", borderRadius: 8, fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>
                          🎯 Base completada — listo para nuevo contrato
                        </div>
                      )}
                      {c.estado === "En proceso" && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {!c.moto_id && <Badge tone="accent">🏍️ Falta asignar moto</Badge>}
                          {c.moto_id && !c.firma_cliente && <Badge tone="warn">⏳ Falta firma</Badge>}
                          {c.moto_id && c.firma_cliente && <Badge tone="ok">🚀 Listo para entregar</Badge>}
                        </div>
                      )}
                    </> : undefined}
                  />
                );
              })}
            </ListBox>
          )}
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
