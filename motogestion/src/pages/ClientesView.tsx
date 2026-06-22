import React, { useEffect, useMemo, useState } from "react";
import ClienteDetalleSheet from "../components/ClienteDetalleSheet";
import {
  useClientes,
  documentosListos,
  emptyDocs,
  type Cliente,
  type ClienteEstado,
  type DocumentoFlags,
  type NuevoCliente,
  type RutaContrato,
} from "../hooks/useClientes";
import { useVisitas, type Visita } from "../hooks/useVisitas";
import { useAuth } from "../contexts/AuthContext";


const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" };

function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

function formatDate(date: string | null) {
  if (!date) return "Sin registrar";
  return new Date(date).toLocaleDateString("es-CO");
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function ClienteBadge({ estado }: { estado: ClienteEstado }) {
  const map: Record<ClienteEstado, { bg: string; color: string }> = {
    "En proceso": { bg: "#e2e8f0", color: "#334155" },
    "Listo para visita": { bg: "#dbeafe", color: "#1d4ed8" },
    "Pendiente evaluación": { bg: "#fef3c7", color: "#92400e" },
    Aprobado: { bg: "#dcfce7", color: "#166534" },
    Rechazado: { bg: "#fee2e2", color: "#991b1b" },
    Activo: { bg: "#dcfce7", color: "#166534" },
    "En seguimiento": { bg: "#e0f2fe", color: "#0369a1" },
    "En riesgo": { bg: "#fef3c7", color: "#92400e" },
    "En mora": { bg: "#fee2e2", color: "#991b1b" },
    Retirado: { bg: "#ede9fe", color: "#6d28d9" },
    "Lista negra": { bg: "#1f2937", color: "#f9fafb" },
    "Inmovilización documentación incompleta": { bg: "#fee2e2", color: "#7f1d1d" },
  };
  const colors = map[estado];
  return (
    <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: colors.bg, color: colors.color, fontSize: 12, fontWeight: 700 }}>
      {estado}
    </span>
  );
}

function DocsSummary({ doc }: { doc: DocumentoFlags }) {
  const labels: Array<[keyof DocumentoFlags, string]> = [
    ["cedula", "Cédula"],
    ["licencia", "Licencia"],
    ["recibo1", "Recibo 1"],
    ["recibo2", "Recibo 2"],
    ["carta", "Carta"],
    ["antecedentes", "Antecedentes"],
    ["hojaVida", "Hoja de vida"],
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {labels.map(([key, label]) => (
        <span key={key} style={{ padding: "5px 8px", borderRadius: 999, background: doc[key].ok ? "#dcfce7" : "#fee2e2", color: doc[key].ok ? "#166534" : "#991b1b", fontSize: 12, fontWeight: 700 }}>
          {label}
        </span>
      ))}
    </div>
  );
}

function DocsChecklist({ doc, onChange }: { doc: DocumentoFlags; onChange: (next: DocumentoFlags) => void }) {
  const labels: Array<[keyof DocumentoFlags, string]> = [
    ["cedula", "Cédula"],
    ["licencia", "Licencia (opcional)"],
    ["recibo1", "Recibo 1"],
    ["recibo2", "Recibo 2"],
    ["carta", "Carta"],
    ["antecedentes", "Antecedentes"],
    ["hojaVida", "Hoja de vida"],
  ];

  function setDocumento(key: keyof DocumentoFlags, file: File | undefined) {
    onChange({ ...doc, [key]: { ok: !!file, file: file ? file.name : null } });
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {labels.map(([key, label]) => (
        <div key={key} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8 }}>{label}</div>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "grid", gap: 4, fontSize: 12, color: "#475569" }}>
              Tomar foto
              <input type="file" accept="image/*" capture="environment" onChange={(e) => setDocumento(key, e.target.files?.[0])} />
            </label>
            <label style={{ display: "grid", gap: 4, fontSize: 12, color: "#475569" }}>
              Subir archivo
              <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={(e) => setDocumento(key, e.target.files?.[0])} />
            </label>
          </div>
          {doc[key].ok ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#16a34a", fontWeight: 700 }}>✔ {doc[key].file}</div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 12, color: "#991b1b" }}>Documento pendiente</div>
          )}
        </div>
      ))}
    </div>
  );
}

function documentosFaltantes(cliente: Cliente) {
  const labels: Array<[keyof DocumentoFlags, string, "Cliente" | "Acompañante"]> = [
    ["cedula", "Cédula", "Cliente"],
    ["recibo1", "Recibo 1", "Cliente"],
    ["recibo2", "Recibo 2", "Cliente"],
    ["carta", "Carta", "Cliente"],
    ["antecedentes", "Antecedentes", "Cliente"],
    ["hojaVida", "Hoja de vida", "Cliente"],
    ["cedula", "Cédula", "Acompañante"],
    ["recibo1", "Recibo 1", "Acompañante"],
    ["recibo2", "Recibo 2", "Acompañante"],
    ["carta", "Carta", "Acompañante"],
    ["antecedentes", "Antecedentes", "Acompañante"],
    ["hojaVida", "Hoja de vida", "Acompañante"],
  ];
  return labels.filter(([key, , owner]) => {
    const doc = owner === "Cliente" ? cliente.documentos_cliente : cliente.documentos_acompanante;
    return !doc[key].ok;
  });
}

function plazoVencido(cliente: Cliente) {
  if (!cliente.excepcion_documental || !cliente.excepcion_plazo) return false;
  return cliente.excepcion_plazo < getToday();
}

function estadoVisual(cliente: Cliente): ClienteEstado {
  if (plazoVencido(cliente) && documentosFaltantes(cliente).length > 0) {
    return "Inmovilización documentación incompleta";
  }
  return cliente.estado;
}

function calcularEstado(docCliente: DocumentoFlags, docAcompanante: DocumentoFlags): ClienteEstado {
  if (documentosListos(docCliente) && documentosListos(docAcompanante)) return "Listo para visita";
  return "En proceso";
}

function emptyForm(): NuevoCliente {
  return {
    nombre: "",
    cedula: "",
    direccion: "",
    fuente_llegada: "",
    telefono: "",
    mismo_whatsapp: true,
    whatsapp: "",
    acompanante_nombre: "",
    acompanante_cedula: "",
    acompanante_telefono: "",
    documentos_cliente: emptyDocs(),
    documentos_acompanante: emptyDocs(),
    estado: "En proceso",
    ruta_contrato: "diario",
    referido_por_cedula: "",
    referido_por_nombre: "",
  };
}

const PREMIOS_REFERIDOS = [
  { hito: 2, premio: "Par de guantes de manejo" },
  { hito: 5, premio: "Intercomunicador" },
  { hito: 10, premio: "Casco" },
  { hito: 17, premio: "Combo completo" },
];

function calcularPremioReferidos(confirmados: number) {
  const alcanzados = PREMIOS_REFERIDOS.filter((p) => confirmados >= p.hito);
  const siguiente = PREMIOS_REFERIDOS.find((p) => confirmados < p.hito);
  return { alcanzados, siguiente };
}

function calcularSemaforo(cliente: Cliente, visitas: Visita[]) {
  const visita = visitas.filter((v) => v.cliente_id === cliente.id).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];

  if (!visita) return { icono: "🔴", texto: "Sin visita", color: "#991b1b", bg: "#fee2e2" };

  const viveAlli = visita.entrevista.viveAlli === "Sí";
  const tieneGps = !!visita.ubicacion;
  const tieneFoto = !!visita.fotos.clienteFuncionario || !!visita.fotos.fachada;

  if (!viveAlli || (!tieneGps && !tieneFoto)) return { icono: "🔴", texto: "Riesgo alto", color: "#991b1b", bg: "#fee2e2" };

  const score = [viveAlli, tieneGps, tieneFoto].filter(Boolean).length;
  if (score === 3) return { icono: "🟢", texto: "Riesgo bajo", color: "#166534", bg: "#dcfce7" };
  return { icono: "🟡", texto: "Revisar", color: "#92400e", bg: "#fef3c7" };
}

const FILTROS_CLIENTE = [
  { label: "Todos", filter: "" },
  { label: "En proceso", filter: "En proceso" },
  { label: "Listos visita", filter: "Listo para visita" },
  { label: "Pend. evaluación", filter: "Pendiente evaluación" },
  { label: "Aprobados", filter: "Aprobado" },
  { label: "Activos", filter: "Activo" },
  { label: "Mora / riesgo", filter: "mora" },
  { label: "Rechazados", filter: "Rechazado" },
];

function PanelAprobacion({ clientes, visitas, role, onAprobar, onRechazar }: {
  clientes: Cliente[];
  visitas: Visita[];
  role: string;
  onAprobar: (clienteId: string, visitaId: string) => Promise<void>;
  onRechazar: (clienteId: string, visitaId: string, motivo: string) => Promise<void>;
}) {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  const esAdmin = role === "ADMIN" || role === "ADMIN_PRINCIPAL";

  if (clientes.length === 0) {
    return (
      <div style={{ marginTop: 20, padding: "32px 24px", background: "white", borderRadius: 16, textAlign: "center", boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
        <div style={{ fontWeight: 700, color: "#166534" }}>No hay clientes pendientes de evaluación</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Todos los clientes han sido evaluados.</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
      {clientes.map(cliente => {
        const visitasCliente = visitas.filter(v => v.cliente_id === cliente.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
        const visita = visitasCliente[0] ?? null;
        const semaforo = calcularSemaforo(cliente, visitas);
        const abierto = expandido === cliente.id;
        const esteRechazando = rechazando === cliente.id;

        return (
          <div key={cliente.id} style={{ background: "white", borderRadius: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)", overflow: "hidden", borderLeft: `4px solid ${semaforo.color}` }}>

            {/* Header de la tarjeta */}
            <button onClick={() => setExpandido(abierto ? null : cliente.id)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: semaforo.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {semaforo.icono}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente.nombre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    C.C. {cliente.cedula} · {semaforo.texto}
                    {visita ? ` · Visita: ${new Date(visita.fecha + "T00:00:00").toLocaleDateString("es-CO")}` : " · Sin visita registrada"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: semaforo.bg, color: semaforo.color, fontSize: 11, fontWeight: 700 }}>{semaforo.texto}</span>
                <span style={{ color: "#94a3b8", fontSize: 18 }}>{abierto ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Detalle expandido */}
            {abierto && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid #f1f5f9" }}>

                {/* Datos básicos del cliente */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 16 }}>
                  {[
                    { label: "Teléfono", value: cliente.telefono },
                    { label: "Dirección", value: cliente.direccion },
                    { label: "Ruta contrato", value: cliente.ruta_contrato === "diario" ? "Diario (ahorrando base)" : "Tiempo definido" },
                    { label: "Fuente", value: cliente.fuente_llegada || "—" },
                    { label: "Acompañante", value: cliente.acompanante_nombre || "—" },
                    { label: "C.C. acompañante", value: cliente.acompanante_cedula || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 3 }}>{value || "—"}</div>
                    </div>
                  ))}
                </div>

                {/* Entrevista de visita */}
                {visita ? (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#334155", marginBottom: 10 }}>Resultado de la visita domiciliaria</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                      {[
                        { label: "¿Vive allí?", value: visita.entrevista.viveAlli, alerta: visita.entrevista.viveAlli !== "Sí" },
                        { label: "Tiempo de residencia", value: visita.entrevista.tiempoResidencia },
                        { label: "Tipo de vivienda", value: visita.entrevista.tipoVivienda },
                        { label: "Composición familiar", value: visita.entrevista.composicionFamiliar },
                        { label: "Estabilidad laboral", value: visita.entrevista.estabilidadLaboral },
                        { label: "Dudas del cliente", value: visita.entrevista.dudasCliente || "Ninguna" },
                        { label: "Observaciones", value: visita.entrevista.observaciones || "—" },
                        { label: "Recomendación del visitador", value: visita.entrevista.recomendacion, alerta: visita.entrevista.recomendacion === "Rechazado" },
                      ].map(({ label, value, alerta }) => (
                        <div key={label} style={{ padding: "10px 12px", borderRadius: 10, background: alerta ? "#fff5f5" : "#f0f9ff", border: `1px solid ${alerta ? "#fecaca" : "#bae6fd"}` }}>
                          <div style={{ fontSize: 11, color: alerta ? "#991b1b" : "#0369a1", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: alerta ? "#991b1b" : "#0f172a", marginTop: 3 }}>{value || "—"}</div>
                        </div>
                      ))}
                    </div>

                    {/* Fotos */}
                    {(visita.fotos.clienteFuncionario || visita.fotos.fachada) && (
                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {visita.fotos.clienteFuncionario && (
                          <a href={visita.fotos.clienteFuncionario} target="_blank" rel="noreferrer">
                            <img src={visita.fotos.clienteFuncionario} alt="Cliente + funcionario" style={{ height: 100, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                          </a>
                        )}
                        {visita.fotos.fachada && (
                          <a href={visita.fotos.fachada} target="_blank" rel="noreferrer">
                            <img src={visita.fotos.fachada} alt="Fachada" style={{ height: 100, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* GPS */}
                    {visita.ubicacion && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                        📍 Ubicación registrada: {visita.ubicacion.lat.toFixed(5)}, {visita.ubicacion.lng.toFixed(5)}
                        {" · "}
                        <a href={`https://maps.google.com/?q=${visita.ubicacion.lat},${visita.ubicacion.lng}`} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>Ver en mapa</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "#fff5f5", border: "1px solid #fecaca", fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                    ⚠️ Sin visita domiciliaria registrada — no se puede aprobar sin visita
                  </div>
                )}

                {/* Acciones */}
                {esAdmin && visita && (
                  <div style={{ marginTop: 16 }}>
                    {!esteRechazando ? (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          disabled={!!procesando}
                          onClick={async () => {
                            setProcesando(cliente.id);
                            await onAprobar(cliente.id, visita.id);
                            setProcesando(null);
                            setExpandido(null);
                          }}
                          style={{ background: "linear-gradient(90deg,#166534,#10b981)", color: "white", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: procesando ? "not-allowed" : "pointer", opacity: procesando ? 0.6 : 1 }}
                        >
                          {procesando === cliente.id ? "Procesando..." : "✅ Aprobar cliente"}
                        </button>
                        <button
                          onClick={() => setRechazando(cliente.id)}
                          style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 8 }}>Motivo del rechazo (obligatorio)</div>
                        <textarea
                          value={motivoRechazo}
                          onChange={e => setMotivoRechazo(e.target.value)}
                          placeholder="Describe el motivo del rechazo..."
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #fecaca", fontSize: 13, minHeight: 70, boxSizing: "border-box", resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button
                            disabled={!motivoRechazo.trim() || !!procesando}
                            onClick={async () => {
                              if (!motivoRechazo.trim()) return;
                              setProcesando(cliente.id);
                              await onRechazar(cliente.id, visita.id, motivoRechazo);
                              setProcesando(null);
                              setRechazando(null);
                              setMotivoRechazo("");
                              setExpandido(null);
                            }}
                            style={{ background: "#991b1b", color: "white", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: !motivoRechazo.trim() ? "not-allowed" : "pointer", opacity: !motivoRechazo.trim() ? 0.5 : 1 }}
                          >
                            Confirmar rechazo
                          </button>
                          <button onClick={() => { setRechazando(null); setMotivoRechazo(""); }} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!esAdmin && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", fontSize: 13, color: "#64748b" }}>
                    Solo ADMIN o ADMIN_PRINCIPAL puede aprobar o rechazar clientes.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClientesView({ initialFilter = "" }: { initialFilter?: string }) {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";

  const { clientes, loading, error, crearCliente, actualizarCliente, cambiarEstadoCliente, aplicarExcepcion } = useClientes();
  const { visitas, crearVisita, resolverVisita } = useVisitas();

  const [clienteDetalleId, setClienteDetalleId] = useState<string | null>(null);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [excepcionOpen, setExcepcionOpen] = useState(false);
  const [visitaOpen, setVisitaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modoVista, setModoVista] = useState<"todos" | "pendientes">("todos");
  const [filtroEstado, setFiltroEstado] = useState(initialFilter);
  useEffect(() => { setFiltroEstado(initialFilter); }, [initialFilter]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [excepcionMotivo, setExcepcionMotivo] = useState("");
  const [excepcionPlazo, setExcepcionPlazo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<NuevoCliente>(emptyForm());
  const [editForm, setEditForm] = useState<(NuevoCliente & { id: string }) | null>(null);

  const [entrevista, setEntrevista] = useState({
    viveAlli: "",
    tiempoResidencia: "",
    tipoVivienda: "",
    composicionFamiliar: "",
    estabilidadLaboral: "",
    dudasCliente: "",
    observaciones: "",
    recomendacion: "",
  });
  const [fotoCliente, setFotoCliente] = useState<File | null>(null);
  const [fotoFachada, setFotoFachada] = useState<File | null>(null);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);

  const baseClientes = modoVista === "pendientes" ? clientes.filter((c) => c.estado === "Pendiente evaluación") : clientes;

  const filtered = useMemo(() => {
    let list = baseClientes.filter((c) => [c.nombre, c.cedula, c.telefono].join(" ").toLowerCase().includes(query.toLowerCase()));
    if (filtroEstado === "mora") list = list.filter(c => c.estado === "En mora" || c.estado === "En riesgo");
    else if (filtroEstado) list = list.filter(c => c.estado === filtroEstado);
    return list;
  }, [baseClientes, query, filtroEstado]);

  const selectedCliente: Cliente | null = clientes.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  function visitasDelCliente(clienteId: string) {
    return visitas.filter((v) => v.cliente_id === clienteId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  async function handleGuardar() {
    if (!form.nombre.trim() || !form.cedula.trim() || !form.direccion.trim() || !form.telefono.trim()) {
      setFormError("Completa nombre, cédula, dirección y teléfono.");
      return;
    }

    const enListaNegra = clientes.find((c) => c.cedula.trim() === form.cedula.trim() && c.lista_negra);
    if (enListaNegra) {
      setFormError(`⛔ Esta cédula está en lista negra${enListaNegra.lista_negra_reversible ? " (reversible — contacta al admin principal)" : " (irreversible)"}.`);
      return;
    }

    setGuardando(true);
    setFormError(null);

    const estado = calcularEstado(form.documentos_cliente, form.documentos_acompanante);

    const { error } = await crearCliente({
      ...form,
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      whatsapp: form.mismo_whatsapp ? form.telefono.trim() : (form.whatsapp ?? "").trim(),
      referido_por_cedula: form.referido_por_cedula?.trim() || null,
      referido_por_nombre: form.referido_por_nombre?.trim() || null,
      estado,
    });

    setGuardando(false);

    if (error) {
      setFormError(error);
      return;
    }

    setForm(emptyForm());
    setOpen(false);
  }

  function abrirEdicion(cliente: Cliente) {
    setEditForm({
      id: cliente.id,
      nombre: cliente.nombre,
      cedula: cliente.cedula,
      direccion: cliente.direccion,
      fuente_llegada: cliente.fuente_llegada,
      telefono: cliente.telefono,
      mismo_whatsapp: cliente.mismo_whatsapp,
      whatsapp: cliente.whatsapp,
      acompanante_nombre: cliente.acompanante_nombre,
      acompanante_cedula: cliente.acompanante_cedula,
      acompanante_telefono: cliente.acompanante_telefono,
      documentos_cliente: JSON.parse(JSON.stringify(cliente.documentos_cliente)),
      documentos_acompanante: JSON.parse(JSON.stringify(cliente.documentos_acompanante)),
      estado: cliente.estado,
      ruta_contrato: cliente.ruta_contrato ?? "diario",
      referido_por_cedula: cliente.referido_por_cedula,
      referido_por_nombre: cliente.referido_por_nombre,
    });
    setEditOpen(true);
  }

  async function guardarEdicion() {
    if (!editForm) return;

    if (!editForm.nombre.trim() || !editForm.cedula.trim() || !editForm.direccion.trim() || !editForm.telefono.trim()) {
      setFormError("Completa nombre, cédula, dirección y teléfono.");
      return;
    }

    const estadosFijos: ClienteEstado[] = ["Aprobado", "Rechazado", "Activo", "En seguimiento", "En riesgo", "En mora", "Retirado", "Lista negra"];
    const estadoFinal = estadosFijos.includes(editForm.estado)
      ? editForm.estado
      : calcularEstado(editForm.documentos_cliente, editForm.documentos_acompanante);

    const { error } = await actualizarCliente(editForm.id, {
      ...editForm,
      whatsapp: editForm.mismo_whatsapp ? editForm.telefono : editForm.whatsapp,
      estado: estadoFinal,
    });

    if (error) {
      setFormError(error);
      return;
    }

    setEditOpen(false);
    setEditForm(null);
    setFormError(null);
  }

  function abrirExcepcion(cliente: Cliente) {
    if (documentosFaltantes(cliente).length === 0) {
      alert("Este cliente ya tiene los documentos obligatorios completos.");
      return;
    }
    setExcepcionMotivo(cliente.excepcion_motivo || "");
    setExcepcionPlazo(cliente.excepcion_plazo || "");
    setExcepcionOpen(true);
  }

  async function confirmarExcepcion() {
    if (!selectedCliente) return;
    if (!excepcionMotivo.trim()) {
      alert("Debes escribir la nota exacta de por qué se permite continuar sin todos los documentos.");
      return;
    }
    if (!excepcionPlazo) {
      alert("Debes definir un plazo máximo para ingresar los documentos faltantes.");
      return;
    }
    await aplicarExcepcion(selectedCliente.id, excepcionMotivo.trim(), excepcionPlazo);
    setExcepcionOpen(false);
  }

  function capturarUbicacion() {
    if (!navigator.geolocation) {
      alert("GPS no disponible en este dispositivo o navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("No se pudo capturar la ubicación. Revisa permisos de GPS.")
    );
  }

  async function registrarVisita() {
    if (!selectedCliente) return;
    if (!entrevista.viveAlli || !entrevista.tiempoResidencia || !entrevista.tipoVivienda) {
      alert("Completa mínimo: vive allí, tiempo de residencia y tipo de vivienda.");
      return;
    }

    const { error } = await crearVisita({
      cliente_id: selectedCliente.id,
      entrevista,
      fotos: { clienteFuncionario: fotoCliente?.name ?? null, fachada: fotoFachada?.name ?? null },
      ubicacion,
    });

    if (error) {
      alert(error);
      return;
    }

    await cambiarEstadoCliente(selectedCliente.id, "Pendiente evaluación");

    setEntrevista({ viveAlli: "", tiempoResidencia: "", tipoVivienda: "", composicionFamiliar: "", estabilidadLaboral: "", dudasCliente: "", observaciones: "", recomendacion: "" });
    setFotoCliente(null);
    setFotoFachada(null);
    setUbicacion(null);
    setVisitaOpen(false);
  }

  async function handleResolverVisita(id: string, clienteId: string, resultado: "Aprobado" | "Rechazado") {
    await resolverVisita(id, resultado);
    await cambiarEstadoCliente(clienteId, resultado === "Aprobado" ? "Aprobado" : "Rechazado");
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando clientes...</div>;

  function renderClienteForm(data: NuevoCliente, update: (patch: Partial<NuevoCliente>) => void) {
    return (
      <div style={{ display: "grid", gap: 20, marginTop: 18 }}>

        {/* Ruta del cliente */}
        <div style={{ padding: 16, borderRadius: 16, background: "#f0f9ff", border: "2px solid #0284c7" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7", marginBottom: 12 }}>Ruta del cliente</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {([
              { value: "diario", label: "Pago diario", desc: "Acumula ahorro hasta completar $510.000 de base inicial" },
              { value: "tiempo_definido", label: "Tiempo definido", desc: "Ya tiene la base — pago semanal, quincenal o mensual" },
            ] as { value: RutaContrato; label: string; desc: string }[]).map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => update({ ruta_contrato: op.value })}
                style={{
                  flex: "1 1 200px", padding: 14, borderRadius: 14, cursor: "pointer", textAlign: "left",
                  border: data.ruta_contrato === op.value ? "2px solid #0284c7" : "2px solid #e2e8f0",
                  background: data.ruta_contrato === op.value ? "#e0f2fe" : "white",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14, color: data.ruta_contrato === op.value ? "#0284c7" : "#334155" }}>{op.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{op.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Datos personales</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Nombre</div><input style={{ ...inputStyle, textTransform: "uppercase" }} value={data.nombre} onChange={(e) => update({ nombre: e.target.value.toUpperCase() })} /></div>
            <div><div style={labelStyle}>Cédula</div><input style={inputStyle} value={data.cedula} onChange={(e) => update({ cedula: e.target.value })} /></div>
            <div><div style={labelStyle}>Dirección</div><input style={inputStyle} value={data.direccion} onChange={(e) => update({ direccion: e.target.value })} /></div>
            <div><div style={labelStyle}>Fuente de llegada</div><input style={inputStyle} value={data.fuente_llegada ?? ""} onChange={(e) => update({ fuente_llegada: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Contacto</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Teléfono principal</div><input style={inputStyle} value={data.telefono} onChange={(e) => update({ telefono: e.target.value })} /></div>
            <div>
              <div style={labelStyle}>¿Tiene WhatsApp en este número?</div>
              <select style={inputStyle} value={data.mismo_whatsapp ? "si" : "no"} onChange={(e) => update({ mismo_whatsapp: e.target.value === "si" })}>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
            {!data.mismo_whatsapp && (
              <div><div style={labelStyle}>WhatsApp</div><input style={inputStyle} value={data.whatsapp ?? ""} onChange={(e) => update({ whatsapp: e.target.value })} /></div>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Acompañante <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b" }}>(debe ser mujer — obligatorio)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Nombre</div><input style={{ ...inputStyle, textTransform: "uppercase" }} value={data.acompanante_nombre ?? ""} onChange={(e) => update({ acompanante_nombre: e.target.value.toUpperCase() })} /></div>
            <div><div style={labelStyle}>Cédula</div><input style={inputStyle} value={data.acompanante_cedula ?? ""} onChange={(e) => update({ acompanante_cedula: e.target.value })} /></div>
            <div><div style={labelStyle}>Teléfono</div><input style={inputStyle} value={data.acompanante_telefono ?? ""} onChange={(e) => update({ acompanante_telefono: e.target.value })} /></div>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 16, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", marginBottom: 10 }}>Referido por (opcional)</div>
          <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 12 }}>Solo se valida cuando al nuevo cliente se le entrega la moto.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Nombre de quien refirió</div><input style={{ ...inputStyle, textTransform: "uppercase" }} value={data.referido_por_nombre ?? ""} onChange={(e) => update({ referido_por_nombre: e.target.value.toUpperCase() })} /></div>
            <div><div style={labelStyle}>Cédula de quien refirió</div><input style={inputStyle} value={data.referido_por_cedula ?? ""} onChange={(e) => update({ referido_por_cedula: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Documentos cliente</div>
          <DocsChecklist doc={data.documentos_cliente} onChange={(next) => update({ documentos_cliente: next })} />
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Documentos acompañante <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b" }}>(sin hoja de vida ni licencia)</span></div>
          <DocsChecklist doc={data.documentos_acompanante} onChange={(next) => update({ documentos_acompanante: next })} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Clientes</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Registro, documentos, estados y aprobación. Conectado en tiempo real.</p>
        </div>
        <button onClick={() => setOpen(true)} style={primaryBtn}>+ Ingresar cliente nuevo</button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error cargando clientes: {error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <button onClick={() => setModoVista("todos")} style={miniBtn(modoVista === "todos" ? "#dbeafe" : "#e2e8f0", modoVista === "todos" ? "#1d4ed8" : "#334155")}>
          Todos los clientes
        </button>
        <button onClick={() => setModoVista("pendientes")} style={miniBtn(modoVista === "pendientes" ? "#fef3c7" : "#e2e8f0", modoVista === "pendientes" ? "#92400e" : "#334155")}>
          Pendientes de aprobación ({clientes.filter((c) => c.estado === "Pendiente evaluación").length})
        </button>
      </div>

      {modoVista === "pendientes" && (
        <PanelAprobacion
          clientes={clientes.filter(c => c.estado === "Pendiente evaluación")}
          visitas={visitas}
          role={role}
          onAprobar={async (clienteId, visitaId) => {
            await resolverVisita(visitaId, "Aprobado");
            await cambiarEstadoCliente(clienteId, "Aprobado");
          }}
          onRechazar={async (clienteId, visitaId, motivo) => {
            await resolverVisita(visitaId, "Rechazado");
            await cambiarEstadoCliente(clienteId, "Rechazado");
            if (motivo) await actualizarCliente(clienteId, { estado: "Rechazado" } as never);
          }}
        />
      )}

      <style>{`@media (max-width: 768px) { .clientes-grid { display: block !important; } .clientes-detalle-desktop { display: none !important; } }`}</style>

      <div style={{ display: modoVista === "pendientes" ? "none" : "flex", flexWrap: "wrap", gap: 16, marginTop: 20, alignItems: "flex-start" }}>
        <div style={{ ...card, flex: "1 1 340px", minWidth: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍  Buscar por nombre, cédula o teléfono..." style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {FILTROS_CLIENTE.map(f => (
              <button
                key={f.filter}
                onClick={() => setFiltroEstado(f.filter)}
                style={{
                  padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: filtroEstado === f.filter ? 700 : 500,
                  background: filtroEstado === f.filter ? "#0284c7" : "#f1f5f9",
                  color: filtroEstado === f.filter ? "white" : "#64748b",
                  whiteSpace: "nowrap",
                }}
              >{f.label}</button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 8, maxHeight: "70vh", overflowY: "auto" }}>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>No hay clientes en este filtro.</div>}
            {filtered.map((cliente) => {
              const riesgo = modoVista === "pendientes" ? calcularSemaforo(cliente, visitas) : null;
              const activo = selectedId === cliente.id;
              return (
                <button
                  key={cliente.id}
                  onClick={() => { setSelectedId(cliente.id); setDetalleModalOpen(true); setClienteDetalleId(cliente.id); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12, border: "none",
                    background: activo ? "#eff6ff" : "#f8fafc",
                    cursor: "pointer", textAlign: "left",
                    outline: activo ? "2px solid #0284c7" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente.nombre}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{cliente.telefono}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <ClienteBadge estado={estadoVisual(cliente)} />
                    {riesgo && <span style={{ fontSize: 11 }}>{riesgo.icono}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, flex: "1 1 280px", minWidth: 0, maxWidth: 440 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Detalle del cliente</h3>

          {selectedCliente ? (
            <DetalleClienteContenido
              selectedCliente={selectedCliente}
              role={role}
              visitas={visitasDelCliente(selectedCliente.id)}
              onEdit={() => abrirEdicion(selectedCliente)}
              onVisita={() => setVisitaOpen(true)}
              onExcepcion={() => abrirExcepcion(selectedCliente)}
              onEstado={cambiarEstadoCliente}
              onResolverVisita={handleResolverVisita}
            />
          ) : (
            <div style={{ marginTop: 16, color: "#64748b" }}>Selecciona un cliente para ver su detalle.</div>
          )}
        </div>
      </div>

      {/* Modal de detalle para móvil */}
      {detalleModalOpen && selectedCliente && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 80, padding: 0 }} onClick={() => setDetalleModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 600, background: "white", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, textTransform: "uppercase" }}>{selectedCliente.nombre}</h3>
              <button onClick={() => setDetalleModalOpen(false)} style={{ border: "none", background: "#f1f5f9", borderRadius: 999, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <DetalleClienteContenido
              selectedCliente={selectedCliente}
              role={role}
              visitas={visitasDelCliente(selectedCliente.id)}
              onEdit={() => abrirEdicion(selectedCliente)}
              onVisita={() => setVisitaOpen(true)}
              onExcepcion={() => abrirExcepcion(selectedCliente)}
              onEstado={cambiarEstadoCliente}
              onResolverVisita={handleResolverVisita}
            />
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Ingresar cliente nuevo</h3>
            {renderClienteForm(form, (patch) => setForm((p) => ({ ...p, ...patch })))}
            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Guardar cliente"}</button>
            </div>
          </div>
        </div>
      )}

      {editOpen && editForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60 }} onClick={() => setEditOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Actualizar cliente</h3>
            {renderClienteForm(editForm, (patch) => setEditForm((p) => (p ? { ...p, ...patch } : p)))}
            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setEditOpen(false); setFormError(null); }} style={secondaryBtn}>Cancelar</button>
              <button onClick={guardarEdicion} style={primaryBtn}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {excepcionOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }} onClick={() => setExcepcionOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: 0 }}>Permitir continuar por excepción</h3>
            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <div>
                <div style={labelStyle}>Motivo de la excepción</div>
                <textarea style={{ ...inputStyle, minHeight: 80 }} value={excepcionMotivo} onChange={(e) => setExcepcionMotivo(e.target.value)} />
              </div>
              <div>
                <div style={labelStyle}>Plazo máximo</div>
                <input type="date" style={inputStyle} value={excepcionPlazo} onChange={(e) => setExcepcionPlazo(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setExcepcionOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={confirmarExcepcion} style={primaryBtn}>Confirmar excepción</button>
            </div>
          </div>
        </div>
      )}

      <ClienteDetalleSheet clienteId={clienteDetalleId} onClose={() => setClienteDetalleId(null)} />

      {visitaOpen && selectedCliente && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }} onClick={() => setVisitaOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 600, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Registrar visita · <span style={{ textTransform: "uppercase" }}>{selectedCliente.nombre}</span></h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <div>
                <div style={labelStyle}>¿El cliente vive en la dirección registrada?</div>
                <select style={inputStyle} value={entrevista.viveAlli} onChange={(e) => setEntrevista((p) => ({ ...p, viveAlli: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No fue posible confirmar">No fue posible confirmar</option>
                </select>
              </div>
              <div>
                <div style={labelStyle}>¿Cuánto tiempo lleva viviendo allí?</div>
                <input style={inputStyle} placeholder="Ej. 2 años" value={entrevista.tiempoResidencia} onChange={(e) => setEntrevista((p) => ({ ...p, tiempoResidencia: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Tipo de vivienda</div>
                <select style={inputStyle} value={entrevista.tipoVivienda} onChange={(e) => setEntrevista((p) => ({ ...p, tipoVivienda: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  <option value="Propia">Propia</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Alquilada">Alquilada</option>
                </select>
              </div>
              <div>
                <div style={labelStyle}>Composición familiar</div>
                <input style={inputStyle} placeholder="Ej. Esposa e hijo de 3 años" value={entrevista.composicionFamiliar} onChange={(e) => setEntrevista((p) => ({ ...p, composicionFamiliar: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Estabilidad laboral / fuente de ingresos</div>
                <input style={inputStyle} placeholder="Ej. Mototaxista independiente, estable" value={entrevista.estabilidadLaboral} onChange={(e) => setEntrevista((p) => ({ ...p, estabilidadLaboral: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Dudas o preguntas del cliente</div>
                <input style={inputStyle} placeholder="¿Qué preguntas hizo el cliente?" value={entrevista.dudasCliente} onChange={(e) => setEntrevista((p) => ({ ...p, dudasCliente: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Observaciones del visitador</div>
                <textarea style={{ ...inputStyle, minHeight: 70 }} value={entrevista.observaciones} onChange={(e) => setEntrevista((p) => ({ ...p, observaciones: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Recomendación</div>
                <select style={inputStyle} value={entrevista.recomendacion} onChange={(e) => setEntrevista((p) => ({ ...p, recomendacion: e.target.value }))}>
                  <option value="">Seleccionar</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Pendiente">Pendiente — requiere más información</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>Foto personas + funcionario</div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => setFotoCliente(e.target.files?.[0] ?? null)} />
              </div>
              <div>
                <div style={labelStyle}>Foto fachada</div>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => setFotoFachada(e.target.files?.[0] ?? null)} />
              </div>

              <div>
                <button type="button" onClick={capturarUbicacion} style={miniBtn("#e0f2fe", "#0369a1")}>Capturar ubicación GPS</button>
                {ubicacion && <span style={{ marginLeft: 10, fontSize: 13, color: "#166534" }}>✔ Ubicación capturada</span>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setVisitaOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={registrarVisita} style={primaryBtn}>Guardar visita</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type DetalleProps = {
  selectedCliente: Cliente;
  role: string;
  visitas: Visita[];
  onEdit: () => void;
  onVisita: () => void;
  onExcepcion: () => void;
  onEstado: (id: string, estado: ClienteEstado) => void;
  onResolverVisita: (id: string, clienteId: string, resultado: "Aprobado" | "Rechazado") => void;
};

function miniBtn2(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

function DetalleClienteContenido({ selectedCliente, role, visitas, onEdit, onVisita, onExcepcion, onEstado, onResolverVisita }: DetalleProps) {
  const esAdmin = role === "ADMIN" || role === "ADMIN_PRINCIPAL";
  const { alcanzados, siguiente } = calcularPremioReferidos(selectedCliente.referidos_confirmados ?? 0);

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 12 }}>

      {selectedCliente.lista_negra && (
        <div style={{ padding: 14, borderRadius: 16, background: "#1f2937", color: "#f9fafb", fontWeight: 700, fontSize: 14 }}>
          ⛔ LISTA NEGRA{selectedCliente.lista_negra_reversible ? " (reversible)" : " (irreversible)"}
          {selectedCliente.motivo_lista_negra && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 400, color: "#d1d5db" }}>{selectedCliente.motivo_lista_negra}</div>}
        </div>
      )}

      <InfoBox label="Nombre" value={selectedCliente.nombre} />
      <InfoBox label="Cédula" value={selectedCliente.cedula} />
      <InfoBox label="Dirección" value={selectedCliente.direccion} />
      <InfoBox label="Ruta" value={selectedCliente.ruta_contrato === "tiempo_definido" ? "Tiempo definido (semanal/quincenal/mensual)" : "Pago diario (acumula base)"} />
      <InfoBox label="Fuente de llegada" value={selectedCliente.fuente_llegada || "Sin registrar"} />
      <InfoBox label="Teléfono" value={selectedCliente.telefono} />
      <InfoBox label="WhatsApp" value={selectedCliente.whatsapp || "Sin registrar"} />
      <InfoBox label="Acompañante" value={`${selectedCliente.acompanante_nombre || "Sin registrar"} · Tel: ${selectedCliente.acompanante_telefono || "Sin teléfono"}`} />

      {(selectedCliente.referido_por_nombre || selectedCliente.referido_por_cedula) && (
        <div style={{ background: "#f0fdf4", borderRadius: 16, padding: 14, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 12, color: "#166534", fontWeight: 700, marginBottom: 4 }}>REFERIDO POR</div>
          <div style={{ fontSize: 14 }}>{selectedCliente.referido_por_nombre || "Sin nombre"} — {selectedCliente.referido_por_cedula || "Sin cédula"}</div>
        </div>
      )}

      {/* Contador de referidos con premios */}
      {(selectedCliente.referidos_confirmados ?? 0) > 0 || alcanzados.length > 0 ? (
        <div style={{ background: "#fefce8", borderRadius: 16, padding: 14, border: "1px solid #fde047" }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 8 }}>REFERIDOS CONFIRMADOS: {selectedCliente.referidos_confirmados ?? 0}</div>
          {alcanzados.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {alcanzados.map((p) => (
                <div key={p.hito} style={{ fontSize: 13, color: "#166534" }}>
                  ✔ {p.hito} referidos — {p.premio} {(selectedCliente.premio_referidos_entregado ?? 0) >= p.hito ? "(entregado)" : "⚠ pendiente de entrega"}
                </div>
              ))}
            </div>
          )}
          {siguiente && (
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Siguiente premio: {siguiente.premio} con {siguiente.hito} referidos ({siguiente.hito - (selectedCliente.referidos_confirmados ?? 0)} pendientes)
            </div>
          )}
        </div>
      ) : null}

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Historial de visitas</div>
        {visitas.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>Sin visitas registradas.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {visitas.map((v) => (
              <div key={v.id} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 6, fontSize: 13 }}>
                <div style={{ fontWeight: 800 }}>{formatDate(v.fecha)}</div>
                <div>Estado: {v.estado} · Resultado: {v.resultado || "Pendiente decisión"}</div>
                <div><b>Vive allí:</b> {v.entrevista.viveAlli || "Sin registrar"} {v.entrevista.tiempoResidencia ? `· ${v.entrevista.tiempoResidencia}` : ""}</div>
                <div><b>Tipo vivienda:</b> {v.entrevista.tipoVivienda || "Sin registrar"}</div>
                {v.entrevista.composicionFamiliar && <div><b>Familia:</b> {v.entrevista.composicionFamiliar}</div>}
                {v.entrevista.estabilidadLaboral && <div><b>Ingresos:</b> {v.entrevista.estabilidadLaboral}</div>}
                {v.entrevista.dudasCliente && <div><b>Dudas del cliente:</b> {v.entrevista.dudasCliente}</div>}
                <div><b>Recomendación:</b> {v.entrevista.recomendacion || "Sin definir"}</div>
                <div><b>Observaciones:</b> {v.entrevista.observaciones || "Sin observaciones"}</div>
                {v.fotos.clienteFuncionario && <div>📎 Personas + funcionario: {v.fotos.clienteFuncionario}</div>}
                {v.fotos.fachada && <div>📎 Fachada: {v.fotos.fachada}</div>}
                {v.ubicacion && (
                  <button onClick={() => window.open(`https://www.google.com/maps?q=${v.ubicacion?.lat},${v.ubicacion?.lng}`, "_blank")} style={miniBtn2("#e0f2fe", "#0369a1")}>
                    Ver ubicación de residencia
                  </button>
                )}
                {esAdmin && v.resultado === null && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => onResolverVisita(v.id, selectedCliente.id, "Aprobado")} style={miniBtn2("#dcfce7", "#166534")}>Aprobar</button>
                    <button onClick={() => onResolverVisita(v.id, selectedCliente.id, "Rechazado")} style={miniBtn2("#fee2e2", "#991b1b")}>Rechazar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Documentos cliente</div>
        <DocsSummary doc={selectedCliente.documentos_cliente} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Documentos acompañante</div>
        <DocsSummary doc={selectedCliente.documentos_acompanante} />
      </div>

      {documentosFaltantes(selectedCliente).length > 0 && (
        <div style={{ padding: 14, borderRadius: 16, background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412" }}>
          <div style={{ fontWeight: 900 }}>Documentos obligatorios pendientes</div>
          <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 13 }}>
            {documentosFaltantes(selectedCliente).map(([key, label, owner]) => (
              <div key={`${owner}-${key}`}>• {owner}: {label}</div>
            ))}
          </div>
          {selectedCliente.excepcion_documental && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #fed7aa" }}>
              <div><b>Excepción activa:</b> Sí</div>
              <div><b>Motivo:</b> {selectedCliente.excepcion_motivo}</div>
              <div><b>Plazo máximo:</b> {selectedCliente.excepcion_plazo ? formatDate(selectedCliente.excepcion_plazo) : "Sin plazo"}</div>
              {plazoVencido(selectedCliente) && (
                <div style={{ marginTop: 6, fontWeight: 900, color: "#991b1b" }}>Plazo vencido: inmovilización por documentación incompleta.</div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <ClienteBadge estado={estadoVisual(selectedCliente)} />
        <button onClick={onEdit} style={miniBtn2("#e0f2fe", "#0369a1")}>Actualizar datos / documentos</button>
        {selectedCliente.estado === "Listo para visita" && (
          <button onClick={onVisita} style={miniBtn2("#dbeafe", "#1d4ed8")}>Registrar visita</button>
        )}
        {esAdmin && (
          <>
            {selectedCliente.estado === "Aprobado" && (
              <>
                <button onClick={() => onEstado(selectedCliente.id, "Activo")} style={miniBtn2("#dcfce7", "#166534")}>Activar cliente</button>
                <button onClick={() => onEstado(selectedCliente.id, "En seguimiento")} style={miniBtn2("#e0f2fe", "#0369a1")}>En seguimiento</button>
                <button onClick={() => onEstado(selectedCliente.id, "En riesgo")} style={miniBtn2("#fef3c7", "#92400e")}>Marcar en riesgo</button>
                <button onClick={() => onEstado(selectedCliente.id, "En mora")} style={miniBtn2("#fee2e2", "#991b1b")}>En mora</button>
              </>
            )}
            {documentosFaltantes(selectedCliente).length > 0 && (
              <button onClick={onExcepcion} style={miniBtn2("#fef3c7", "#92400e")}>Permitir continuar por excepción</button>
            )}
            <button onClick={() => onEstado(selectedCliente.id, "Rechazado")} style={miniBtn2("#ffe4e6", "#be123c")}>Rechazar</button>
            <button onClick={() => onEstado(selectedCliente.id, "Retirado")} style={miniBtn2("#ede9fe", "#6d28d9")}>Retirar</button>
          </>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
