import React, { useMemo, useState } from "react";
import {
  useClientes,
  documentosListos,
  emptyDocs,
  type Cliente,
  type ClienteEstado,
  type DocumentoFlags,
  type NuevoCliente,
} from "../hooks/useClientes";
import { useVisitas, type Visita } from "../hooks/useVisitas";
import { useAuth } from "../contexts/AuthContext";

const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 10px", fontSize: 13, color: "#475569", borderBottom: "1px solid #e2e8f0" };
const tdStyle: React.CSSProperties = { padding: "12px 10px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #f1f5f9" };
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
  };
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

export default function ClientesView() {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";

  const { clientes, loading, error, crearCliente, actualizarCliente, cambiarEstadoCliente, aplicarExcepcion } = useClientes();
  const { visitas, crearVisita, resolverVisita } = useVisitas();

  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [excepcionOpen, setExcepcionOpen] = useState(false);
  const [visitaOpen, setVisitaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modoVista, setModoVista] = useState<"todos" | "pendientes">("todos");
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
    estabilidadLaboral: "",
    tipoVivienda: "",
    recomendacion: "",
    observaciones: "",
  });
  const [fotoCliente, setFotoCliente] = useState<File | null>(null);
  const [fotoFachada, setFotoFachada] = useState<File | null>(null);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);

  const baseClientes = modoVista === "pendientes" ? clientes.filter((c) => c.estado === "Pendiente evaluación") : clientes;

  const filtered = useMemo(
    () => baseClientes.filter((c) => [c.nombre, c.cedula, c.telefono].join(" ").toLowerCase().includes(query.toLowerCase())),
    [baseClientes, query]
  );

  const selectedCliente: Cliente | null = clientes.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  function visitasDelCliente(clienteId: string) {
    return visitas.filter((v) => v.cliente_id === clienteId).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  async function handleGuardar() {
    if (!form.nombre.trim() || !form.cedula.trim() || !form.direccion.trim() || !form.telefono.trim()) {
      setFormError("Completa nombre, cédula, dirección y teléfono.");
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

    setEntrevista({ viveAlli: "", tiempoResidencia: "", estabilidadLaboral: "", tipoVivienda: "", recomendacion: "", observaciones: "" });
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
        <div>
          <div style={labelStyle}>Datos</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Nombre</div><input style={{ ...inputStyle, textTransform: "uppercase" }} value={data.nombre} onChange={(e) => update({ nombre: e.target.value.toUpperCase() })} /></div>
            <div><div style={labelStyle}>Cédula</div><input style={inputStyle} value={data.cedula} onChange={(e) => update({ cedula: e.target.value })} /></div>
            <div><div style={labelStyle}>Dirección</div><input style={inputStyle} value={data.direccion} onChange={(e) => update({ direccion: e.target.value })} /></div>
            <div><div style={labelStyle}>Fuente de llegada</div><input style={inputStyle} value={data.fuente_llegada ?? ""} onChange={(e) => update({ fuente_llegada: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Contacto</div>
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
          <div style={labelStyle}>Acompañante</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><div style={labelStyle}>Nombre</div><input style={{ ...inputStyle, textTransform: "uppercase" }} value={data.acompanante_nombre ?? ""} onChange={(e) => update({ acompanante_nombre: e.target.value.toUpperCase() })} /></div>
            <div><div style={labelStyle}>Cédula</div><input style={inputStyle} value={data.acompanante_cedula ?? ""} onChange={(e) => update({ acompanante_cedula: e.target.value })} /></div>
            <div><div style={labelStyle}>Teléfono</div><input style={inputStyle} value={data.acompanante_telefono ?? ""} onChange={(e) => update({ acompanante_telefono: e.target.value })} /></div>
          </div>
        </div>

        <div>
          <div style={labelStyle}>Documentos cliente</div>
          <DocsChecklist doc={data.documentos_cliente} onChange={(next) => update({ documentos_cliente: next })} />
        </div>

        <div>
          <div style={labelStyle}>Documentos acompañante</div>
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

      <style>{`@media (max-width: 768px) { .clientes-grid { display: block !important; } .clientes-detalle-desktop { display: none !important; } }`}</style>

      <div className="clientes-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.9fr)", gap: 20, marginTop: 24 }}>
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar cliente" style={inputStyle} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 480, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Nombre</th>
                  {modoVista === "pendientes" && <th style={thStyle}>Riesgo</th>}
                  <th style={thStyle}>Teléfono</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cliente) => (
                  <tr key={cliente.id} style={{ background: selectedId === cliente.id ? "#eff6ff" : "white" }}>
                    <td style={{ ...tdStyle, textTransform: "uppercase" }}>{cliente.nombre}</td>
                    {modoVista === "pendientes" && (
                      <td style={tdStyle}>
                        {(() => {
                          const riesgo = calcularSemaforo(cliente, visitas);
                          return <span style={{ ...miniBtn(riesgo.bg, riesgo.color), display: "inline-block" }}>{riesgo.icono} {riesgo.texto}</span>;
                        })()}
                      </td>
                    )}
                    <td style={tdStyle}>{cliente.telefono}</td>
                    <td style={tdStyle}><ClienteBadge estado={estadoVisual(cliente)} /></td>
                    <td style={tdStyle}>
                      <button onClick={() => { setSelectedId(cliente.id); setDetalleModalOpen(true); }} style={{ border: "none", background: "transparent", color: "#0284c7", fontWeight: 700, cursor: "pointer" }}>
                        {modoVista === "pendientes" ? "Evaluar" : "Ver detalle"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>No hay clientes registrados todavía.</div>}
          </div>
        </div>

        <div className="clientes-detalle-desktop" style={card}>
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
                <div style={labelStyle}>Estabilidad laboral / fuente de ingresos</div>
                <input style={inputStyle} value={entrevista.estabilidadLaboral} onChange={(e) => setEntrevista((p) => ({ ...p, estabilidadLaboral: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Tipo de vivienda</div>
                <input style={inputStyle} value={entrevista.tipoVivienda} onChange={(e) => setEntrevista((p) => ({ ...p, tipoVivienda: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Recomendación</div>
                <input style={inputStyle} value={entrevista.recomendacion} onChange={(e) => setEntrevista((p) => ({ ...p, recomendacion: e.target.value }))} />
              </div>
              <div>
                <div style={labelStyle}>Observaciones</div>
                <textarea style={{ ...inputStyle, minHeight: 70 }} value={entrevista.observaciones} onChange={(e) => setEntrevista((p) => ({ ...p, observaciones: e.target.value }))} />
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
                <button onClick={capturarUbicacion} style={miniBtn("#e0f2fe", "#0369a1")}>Capturar ubicación GPS</button>
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
  return (
    <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
      <InfoBox label="Nombre" value={selectedCliente.nombre} />
      <InfoBox label="Cédula" value={selectedCliente.cedula} />
      <InfoBox label="Dirección" value={selectedCliente.direccion} />
      <InfoBox label="Fuente de llegada" value={selectedCliente.fuente_llegada || "Sin registrar"} />
      <InfoBox label="Teléfono" value={selectedCliente.telefono} />
      <InfoBox label="WhatsApp" value={selectedCliente.whatsapp || "Sin registrar"} />
      <InfoBox label="Acompañante" value={`${selectedCliente.acompanante_nombre || "Sin registrar"} · Tel: ${selectedCliente.acompanante_telefono || "Sin teléfono"}`} />

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Historial de visitas</div>
        {visitas.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 14 }}>Sin visitas registradas.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {visitas.map((v) => (
              <div key={v.id} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 6, fontSize: 13 }}>
                <div style={{ fontWeight: 800 }}>{formatDate(v.fecha)}</div>
                <div>Estado visita: {v.estado}</div>
                <div>Resultado: {v.resultado || "Pendiente decisión"}</div>
                <div><b>Vive allí:</b> {v.entrevista.viveAlli || "Sin registrar"}</div>
                <div><b>Tipo vivienda:</b> {v.entrevista.tipoVivienda || "Sin registrar"}</div>
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
