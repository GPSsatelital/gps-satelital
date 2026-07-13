import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import ModalVisita from "../components/ModalVisita";
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
import { useContratos } from "../hooks/useContratos";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";
import { hoyISO } from "../utils/fecha";
import { ReciboBaseModal, buildTicketBaseInicial, type TicketData } from "../components/TicketTermico";
import { useScope } from "../contexts/SubadminScopeContext";
import MoneyInput from "../components/MoneyInput";
import CanvasFirma from "../components/CanvasFirma";
import LectorHuella from "../components/LectorHuella";
import FotoPerfil from "../components/FotoPerfil";


const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer", color: "#334155" };


function formatDate(date: string | null) {
  if (!date) return "Sin registrar";
  return new Date(date).toLocaleDateString("es-CO");
}

function getToday() {
  return hoyISO();
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
    Egresado: { bg: "#dcfce7", color: "#15803d" },
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

// El acompañante solo aporta cédula y recibo (sin hoja de vida, licencia ni antecedentes)
// Si vive en la misma dirección que el cliente, no se le pide recibo aparte (usa el mismo).
const DOCS_ACOMPANANTE: Array<keyof DocumentoFlags> = ["cedula", "recibo1"];
const DOCS_ACOMPANANTE_MISMO_DOMICILIO: Array<keyof DocumentoFlags> = ["cedula"];

function docsAcompanante(mismoDomicilio: boolean): Array<keyof DocumentoFlags> {
  return mismoDomicilio ? DOCS_ACOMPANANTE_MISMO_DOMICILIO : DOCS_ACOMPANANTE;
}

function documentosAcompananteListos(doc: DocumentoFlags, mismoDomicilio: boolean) {
  return docsAcompanante(mismoDomicilio).every((k) => doc[k]?.ok);
}

function DocsSummary({ doc, only, role }: { doc: DocumentoFlags; only?: Array<keyof DocumentoFlags>; role?: string }) {
  const puedeVerArchivo = role !== "SECRETARIA";
  const todos: Array<[keyof DocumentoFlags, string]> = [
    ["cedula", "Cédula"],
    ["licencia", "Licencia"],
    ["recibo1", "Recibo público"],
    ["carta", "Carta"],
    ["antecedentes", "Antecedentes"],
    ["hojaVida", "Hoja de vida"],
  ];
  const labels = only ? todos.filter(([k]) => only.includes(k)) : todos;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {labels.map(([key, label]) => {
        // Los clientes migrados por SQL traen documentos_cliente = {} (sin las claves),
        // así que doc[key] puede ser undefined — tratarlo como "no cargado" sin romper.
        const item = doc[key] ?? { ok: false, file: null };
        const estilo: React.CSSProperties = { padding: "5px 8px", borderRadius: 999, background: item.ok ? "#dcfce7" : "#fee2e2", color: item.ok ? "#166534" : "#991b1b", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 };
        if (item.ok && esUrl(item.file) && puedeVerArchivo) {
          return (
            <a key={key} href={item.file!} target="_blank" rel="noreferrer" style={estilo} title="Ver documento">
              {label} 🔍
            </a>
          );
        }
        return <span key={key} style={estilo}>{label}</span>;
      })}
    </div>
  );
}

function esUrl(s: string | null): boolean {
  return !!s && /^https?:\/\//.test(s);
}

function DocsChecklist({ doc, onChange, only, carpeta, subir }: {
  doc: DocumentoFlags;
  onChange: (next: DocumentoFlags) => void;
  only?: Array<keyof DocumentoFlags>;
  carpeta: string;
  subir: (file: File, carpeta: string, docKey: string) => Promise<{ url: string | null; error: string | null }>;
}) {
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<{ key: string; msg: string } | null>(null);
  const todos: Array<[keyof DocumentoFlags, string]> = [
    ["cedula", "Cédula"],
    ["licencia", "Licencia (opcional)"],
    ["recibo1", "Recibo público"],
    ["carta", "Carta"],
    ["antecedentes", "Antecedentes"],
    ["hojaVida", "Hoja de vida"],
  ];
  const labels = only ? todos.filter(([k]) => only.includes(k)) : todos;

  async function setDocumento(key: keyof DocumentoFlags, file: File | undefined) {
    if (!file) return;
    setErrorKey(null);
    setSubiendo(key);
    const { url, error } = await subir(file, carpeta, key);
    setSubiendo(null);
    if (error || !url) { setErrorKey({ key, msg: error || "No se pudo subir" }); return; }
    onChange({ ...doc, [key]: { ok: true, file: url } });
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {labels.map(([key, label]) => (
        <div key={key} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8 }}>{label}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#0284c7", color: "#fff", fontWeight: 700, fontSize: 13 }}>
              📷 Cámara
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => setDocumento(key, e.target.files?.[0])} />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 13 }}>
              🖼 Galería
              <input type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => setDocumento(key, e.target.files?.[0])} />
            </label>
          </div>
          {subiendo === key ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#0284c7", fontWeight: 700 }}>Subiendo…</div>
          ) : errorKey?.key === key ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "#991b1b", fontWeight: 700 }}>⛔ {errorKey.msg}</div>
          ) : doc[key]?.ok ? (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {esUrl(doc[key]?.file ?? null) ? (
                  <a href={doc[key]!.file!} target="_blank" rel="noreferrer" style={{ color: "#0284c7" }}>✔ Ver documento cargado</a>
                ) : (
                  <span style={{ color: "#16a34a" }}>✔ Cargado</span>
                )}
              </div>
              <button
                onClick={() => onChange({ ...doc, [key]: { ok: false, file: null } })}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#991b1b", padding: 0 }}
              >
                🗑️ Quitar / volver a intentar
              </button>
            </div>
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
    ["recibo1", "Recibo público", "Cliente"],
    ["carta", "Carta", "Cliente"],
    ["antecedentes", "Antecedentes", "Cliente"],
    ["hojaVida", "Hoja de vida", "Cliente"],
    ["cedula", "Cédula", "Acompañante"],
    ...(cliente.mismo_domicilio_acompanante ? [] : [["recibo1", "Recibo público", "Acompañante"] as [keyof DocumentoFlags, string, "Cliente" | "Acompañante"]]),
  ];
  return labels.filter(([key, , owner]) => {
    const doc = owner === "Cliente" ? cliente.documentos_cliente : cliente.documentos_acompanante;
    // doc[key] puede faltar en clientes migrados (documentos = {}) → cuenta como faltante.
    return !doc[key]?.ok;
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

function calcularEstado(docCliente: DocumentoFlags, docAcompanante: DocumentoFlags, mismoDomicilioAcompanante: boolean): ClienteEstado {
  if (documentosListos(docCliente) && documentosAcompananteListos(docAcompanante, mismoDomicilioAcompanante)) return "Listo para visita";
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
    mismo_domicilio_acompanante: false,
    documentos_cliente: emptyDocs(),
    documentos_acompanante: emptyDocs(),
    estado: "En proceso",
    ruta_contrato: "diario",
    ingreso_inicial: null,
    referido_por_cedula: "",
    referido_por_nombre: "",
    autorizacion_datos_firma_url: null,
    autorizacion_datos_huella_url: null,
    acompanante_huella_url: null,
    autorizacion_datos_fecha: null,
    foto_perfil_url: null,
  };
}

const INGRESO_MINIMO = 100000;
const INGRESO_IDEAL = 280500; // 55% de la base inicial de $510.000

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
  { label: "Clientes en riesgo", filter: "mora" },
  { label: "Rechazados", filter: "Rechazado" },
];

function PanelAprobacion({ clientes, visitas, role, onAprobar, onRepetir, onRechazar, onAsignarVisita, subadmins }: {
  clientes: Cliente[];
  visitas: Visita[];
  role: string;
  onAprobar: (clienteId: string, visitaId: string) => Promise<void>;
  onRepetir: (clienteId: string, visitaId: string) => Promise<void>;
  onRechazar: (clienteId: string, visitaId: string, motivo: string) => Promise<void>;
  onAsignarVisita?: (visitaId: string, subadminId: string | null) => Promise<void>;
  subadmins?: { id: string; nombre: string }[];
}) {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesando, setProcesando] = useState<string | null>(null);

  // Aprobar/rechazar cliente = acción "aprobar_visita" (default ADMIN, igual que antes).
  const { puede } = useAuth();
  const esAdmin = puede("aprobar_visita");

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

                    {/* Fotos — solo ADMIN y ADMIN_PRINCIPAL tras completar la visita */}
                    {role !== "SUBADMIN" && (visita.fotos.clienteFuncionario || visita.fotos.fachada) && (
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

                {/* Documentos cargados — clic para verlos */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#334155", marginBottom: 8 }}>Documentos del cliente <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b" }}>(clic en 🔍 para ver)</span></div>
                  <DocsSummary doc={cliente.documentos_cliente} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#334155", margin: "12px 0 8px" }}>Documentos del acompañante</div>
                  <DocsSummary doc={cliente.documentos_acompanante} only={docsAcompanante(cliente.mismo_domicilio_acompanante)} />
                  {cliente.excepcion_documental && (
                    <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                      ⚠️ Excepción documental: {cliente.excepcion_motivo || "sin motivo"}{cliente.excepcion_plazo ? ` · plazo: ${cliente.excepcion_plazo}` : ""}
                    </div>
                  )}
                </div>

                {/* Asignación de visita a sub-admin */}
                {esAdmin && visita && onAsignarVisita && subadmins && subadmins.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Asignar visita a sub-admin</div>
                    <select
                      value={visita.asignada_a ?? ""}
                      onChange={e => onAsignarVisita(visita.id, e.target.value || null)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13 }}
                    >
                      <option value="">— Sin asignar —</option>
                      {subadmins.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
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
                          disabled={!!procesando}
                          onClick={async () => {
                            setProcesando(cliente.id);
                            await onRepetir(cliente.id, visita.id);
                            setProcesando(null);
                            setExpandido(null);
                          }}
                          style={{ background: "#fef3c7", color: "#92400e", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: procesando ? "not-allowed" : "pointer", opacity: procesando ? 0.6 : 1 }}
                        >
                          🔁 Repetir visita
                        </button>
                        <button
                          onClick={() => setRechazando(cliente.id)}
                          style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                        >
                          ❌ Rechazar definitivo
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

import type { ViewKey } from "../App";

export default function ClientesView({ initialFilter = "", initialOpenForm = false, onNavigate }: { initialFilter?: string; initialOpenForm?: boolean; onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const { clienteIdsPermitidos, filtrarVisitas, esSubadmin } = useScope();
  const esAdminOSuperior = role === "ADMIN" || role === "ADMIN_PRINCIPAL";
  const [subadmins, setSubadmins] = useState<{ id: string; nombre: string }[]>([]);
  useEffect(() => {
    if (!esAdminOSuperior) return;
    import("../lib/supabase").then(({ supabase }) => {
      supabase.from("profiles").select("id, nombre").eq("role", "SUBADMIN").then(({ data }) => {
        setSubadmins((data ?? []) as { id: string; nombre: string }[]);
      });
    });
  }, [esAdminOSuperior]);
  const { clientes: todosClientes, loading, error, crearCliente, actualizarCliente, cambiarEstadoCliente, aplicarExcepcion, subirDocumento, asignarVisitaCliente } = useClientes();
  const { visitas: todasVisitas, resolverVisita, asignarVisita } = useVisitas();
  const visitas = filtrarVisitas(todasVisitas);
  // Clientes con visita asignada a este SUBADMIN (embudo de ingreso) — considera tanto
  // visitas ya realizadas (asignada_a en visitas) como visitas pendientes por realizar
  // (visita_asignada_a en el cliente, antes de que exista el registro de visita).
  const clienteIdsConVisitaAsignada = esSubadmin
    ? new Set([
        ...visitas.map(v => v.cliente_id),
        ...todosClientes.filter(c => c.visita_asignada_a === profile?.id).map(c => c.id),
      ])
    : null;
  const clientes = esSubadmin && clienteIdsPermitidos
    ? todosClientes.filter(c => clienteIdsPermitidos.has(c.id) || !!(clienteIdsConVisitaAsignada?.has(c.id)))
    : todosClientes;

  const [clienteVisitaId, setClienteVisitaId] = useState<string | null>(null);
  const [clienteVisitaNombre, setClienteVisitaNombre] = useState("");
  const [open, setOpen] = useState(initialOpenForm);
  const [editOpen, setEditOpen] = useState(false);
  const [excepcionOpen, setExcepcionOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(initialFilter);
  useEffect(() => { setFiltroEstado(initialFilter); }, [initialFilter]);
  const { contratos: todosContratosGrupo } = useContratos();
  const { motos: todasMotosGrupo } = useMotos();
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | GrupoMoto>("todos");
  const grupoDelCliente = useMemo(() => {
    const map = new Map<string, GrupoMoto>();
    for (const c of todosContratosGrupo) {
      if (!c.moto_id) continue;
      const moto = todasMotosGrupo.find(m => m.id === c.moto_id);
      if (moto) map.set(c.cliente_id, moto.grupo);
    }
    return map;
  }, [todosContratosGrupo, todasMotosGrupo]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [excepcionMotivo, setExcepcionMotivo] = useState("");
  const [excepcionPlazo, setExcepcionPlazo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<NuevoCliente>(emptyForm());
  const [editForm, setEditForm] = useState<(NuevoCliente & { id: string }) | null>(null);
  // El lector DigitalPersona solo lee UNO a la vez — se muestra un solo LectorHuella por vez.
  const [huellaActiva, setHuellaActiva] = useState<"cliente" | "acompanante">("cliente");
  // Recibo de base inicial: se abre automático al registrar y también desde la ficha.
  const [reciboBase, setReciboBase] = useState<TicketData | null>(null);

  const filtered = useMemo(() => {
    let list = clientes.filter((c) => [c.nombre, c.cedula, c.telefono].join(" ").toLowerCase().includes(query.toLowerCase()));
    if (filtroEstado === "mora") list = list.filter(c => c.estado === "En mora" || c.estado === "En riesgo");
    else if (filtroEstado) list = list.filter(c => c.estado === filtroEstado);
    if (filtroGrupo !== "todos") list = list.filter(c => grupoDelCliente.get(c.id) === filtroGrupo);
    return list;
  }, [clientes, query, filtroEstado, filtroGrupo, grupoDelCliente]);

  const GRUPOS_FILTRO_CLIENTES: ("todos" | GrupoMoto)[] = ["todos", "COSTA", "PRADERA", "RASTREADOR", "USADAS"];
  function ChipsGrupo() {
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {GRUPOS_FILTRO_CLIENTES.map(g => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            style={{
              padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              background: filtroGrupo === g ? "#0284c7" : "#f1f5f9",
              color: filtroGrupo === g ? "white" : "#334155",
            }}
          >
            {g === "todos" ? "Todos" : g}
          </button>
        ))}
      </div>
    );
  }

  const selectedCliente: Cliente | null = clientes.find(c => c.id === selectedId) ?? (isMobile ? null : filtered[0] ?? null);

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

    if (!form.ingreso_inicial || form.ingreso_inicial < INGRESO_MINIMO) {
      setFormError(`El ingreso inicial mínimo es $${INGRESO_MINIMO.toLocaleString("es-CO")}.`);
      return;
    }

    setGuardando(true);
    setFormError(null);

    // La firma es opcional — si se capturó se sube a Storage al guardar.
    let firmaUrl = form.autorizacion_datos_firma_url;
    if (firmaUrl && firmaUrl.startsWith("data:")) {
      const blob = await (await fetch(firmaUrl)).blob();
      const archivo = new File([blob], "firma_autorizacion.png", { type: "image/png" });
      const { url, error: errSubida } = await subirDocumento(archivo, form.cedula.trim() || "sin-cedula", "autorizacion_datos");
      if (errSubida || !url) {
        setGuardando(false);
        setFormError(errSubida || "No se pudo subir la firma de autorización.");
        return;
      }
      firmaUrl = url;
    }

    // La huella es opcional (el lector puede fallar o no estar en ese PC) — si se capturó, se sube.
    let huellaUrl = form.autorizacion_datos_huella_url;
    if (huellaUrl && huellaUrl.startsWith("data:")) {
      const blob = await (await fetch(huellaUrl)).blob();
      const archivo = new File([blob], "huella_autorizacion.png", { type: "image/png" });
      const { url, error: errSubida } = await subirDocumento(archivo, form.cedula.trim() || "sin-cedula", "autorizacion_datos_huella");
      if (errSubida || !url) {
        setGuardando(false);
        setFormError(errSubida || "No se pudo subir la huella capturada.");
        return;
      }
      huellaUrl = url;
    }

    // Huella del acompañante (opcional al registrar; puede agregarse después editando).
    let acompHuellaUrl = form.acompanante_huella_url;
    if (acompHuellaUrl && acompHuellaUrl.startsWith("data:")) {
      const blob = await (await fetch(acompHuellaUrl)).blob();
      const archivo = new File([blob], "huella_acompanante.png", { type: "image/png" });
      const { url, error: errSubida } = await subirDocumento(archivo, form.cedula.trim() || "sin-cedula", "acompanante_huella");
      if (errSubida || !url) {
        setGuardando(false);
        setFormError(errSubida || "No se pudo subir la huella del acompañante.");
        return;
      }
      acompHuellaUrl = url;
    }

    // La foto de perfil es opcional — si se capturó, se sube.
    let fotoPerfilUrl = form.foto_perfil_url;
    if (fotoPerfilUrl && fotoPerfilUrl.startsWith("data:")) {
      const blob = await (await fetch(fotoPerfilUrl)).blob();
      const archivo = new File([blob], "foto_perfil.jpg", { type: "image/jpeg" });
      const { url, error: errSubida } = await subirDocumento(archivo, form.cedula.trim() || "sin-cedula", "foto_perfil");
      if (errSubida || !url) {
        setGuardando(false);
        setFormError(errSubida || "No se pudo subir la foto de perfil.");
        return;
      }
      fotoPerfilUrl = url;
    }

    const estado = calcularEstado(form.documentos_cliente, form.documentos_acompanante, form.mismo_domicilio_acompanante);

    const { error } = await crearCliente({
      ...form,
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      whatsapp: form.mismo_whatsapp ? form.telefono.trim() : (form.whatsapp ?? "").trim(),
      referido_por_cedula: form.referido_por_cedula?.trim() || null,
      referido_por_nombre: form.referido_por_nombre?.trim() || null,
      autorizacion_datos_firma_url: firmaUrl,
      autorizacion_datos_huella_url: huellaUrl,
      acompanante_huella_url: acompHuellaUrl,
      foto_perfil_url: fotoPerfilUrl,
      estado,
    });

    setGuardando(false);

    if (error) {
      setFormError(error);
      return;
    }

    // Recibo automático de la base inicial entregada (dinero que da para iniciar el proceso).
    if (form.ingreso_inicial && form.ingreso_inicial > 0) {
      setReciboBase(buildTicketBaseInicial(form.nombre.trim(), form.cedula.trim(), form.ingreso_inicial, profile?.nombre ?? ""));
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
      mismo_domicilio_acompanante: cliente.mismo_domicilio_acompanante,
      documentos_cliente: JSON.parse(JSON.stringify(cliente.documentos_cliente)),
      documentos_acompanante: JSON.parse(JSON.stringify(cliente.documentos_acompanante)),
      estado: cliente.estado,
      ruta_contrato: cliente.ruta_contrato ?? "diario",
      ingreso_inicial: cliente.ingreso_inicial ?? null,
      referido_por_cedula: cliente.referido_por_cedula,
      referido_por_nombre: cliente.referido_por_nombre,
      autorizacion_datos_firma_url: cliente.autorizacion_datos_firma_url,
      autorizacion_datos_huella_url: cliente.autorizacion_datos_huella_url,
      acompanante_huella_url: cliente.acompanante_huella_url,
      autorizacion_datos_fecha: cliente.autorizacion_datos_fecha,
      foto_perfil_url: cliente.foto_perfil_url,
    });
    setEditOpen(true);
  }

  async function guardarEdicion() {
    if (guardando) return;
    if (!editForm) return;

    if (!editForm.nombre.trim() || !editForm.cedula.trim() || !editForm.direccion.trim() || !editForm.telefono.trim()) {
      setFormError("Completa nombre, cédula, dirección y teléfono.");
      return;
    }

    const estadosFijos: ClienteEstado[] = ["Aprobado", "Rechazado", "Activo", "En seguimiento", "En riesgo", "En mora", "Retirado", "Lista negra"];
    const estadoFinal = estadosFijos.includes(editForm.estado)
      ? editForm.estado
      : calcularEstado(editForm.documentos_cliente, editForm.documentos_acompanante, editForm.mismo_domicilio_acompanante);

    setGuardando(true);
    try {
      // Firma, huella y foto de perfil son opcionales — si se capturaron de nuevo (dataURL), se suben a Storage.
      let firmaUrl = editForm.autorizacion_datos_firma_url;
      if (firmaUrl && firmaUrl.startsWith("data:")) {
        const blob = await (await fetch(firmaUrl)).blob();
        const archivo = new File([blob], "firma_autorizacion.png", { type: "image/png" });
        const { url, error: errSubida } = await subirDocumento(archivo, editForm.cedula.trim() || "sin-cedula", "autorizacion_datos");
        if (errSubida || !url) {
          setFormError(errSubida || "No se pudo subir la firma de autorización.");
          return;
        }
        firmaUrl = url;
      }

      let huellaUrl = editForm.autorizacion_datos_huella_url;
      if (huellaUrl && huellaUrl.startsWith("data:")) {
        const blob = await (await fetch(huellaUrl)).blob();
        const archivo = new File([blob], "huella_autorizacion.png", { type: "image/png" });
        const { url, error: errSubida } = await subirDocumento(archivo, editForm.cedula.trim() || "sin-cedula", "autorizacion_datos_huella");
        if (errSubida || !url) {
          setFormError(errSubida || "No se pudo subir la huella capturada.");
          return;
        }
        huellaUrl = url;
      }

      let acompHuellaUrl = editForm.acompanante_huella_url;
      if (acompHuellaUrl && acompHuellaUrl.startsWith("data:")) {
        const blob = await (await fetch(acompHuellaUrl)).blob();
        const archivo = new File([blob], "huella_acompanante.png", { type: "image/png" });
        const { url, error: errSubida } = await subirDocumento(archivo, editForm.cedula.trim() || "sin-cedula", "acompanante_huella");
        if (errSubida || !url) {
          setFormError(errSubida || "No se pudo subir la huella del acompañante.");
          return;
        }
        acompHuellaUrl = url;
      }

      let fotoPerfilUrl = editForm.foto_perfil_url;
      if (fotoPerfilUrl && fotoPerfilUrl.startsWith("data:")) {
        const blob = await (await fetch(fotoPerfilUrl)).blob();
        const archivo = new File([blob], "foto_perfil.jpg", { type: "image/jpeg" });
        const { url, error: errSubida } = await subirDocumento(archivo, editForm.cedula.trim() || "sin-cedula", "foto_perfil");
        if (errSubida || !url) {
          setFormError(errSubida || "No se pudo subir la foto de perfil.");
          return;
        }
        fotoPerfilUrl = url;
      }

      const { error } = await actualizarCliente(editForm.id, {
        ...editForm,
        whatsapp: editForm.mismo_whatsapp ? editForm.telefono : editForm.whatsapp,
        estado: estadoFinal,
        autorizacion_datos_firma_url: firmaUrl,
        autorizacion_datos_huella_url: huellaUrl,
        acompanante_huella_url: acompHuellaUrl,
        foto_perfil_url: fotoPerfilUrl,
      });

      if (error) {
        setFormError(error);
        return;
      }

      setEditOpen(false);
      setEditForm(null);
      setFormError(null);
    } finally {
      setGuardando(false);
    }
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
    if (guardando) return;
    if (!selectedCliente) return;
    if (!excepcionMotivo.trim()) {
      alert("Debes escribir la nota exacta de por qué se permite continuar sin todos los documentos.");
      return;
    }
    if (!excepcionPlazo) {
      alert("Debes definir un plazo máximo para ingresar los documentos faltantes.");
      return;
    }
    setGuardando(true);
    try {
      await aplicarExcepcion(selectedCliente.id, excepcionMotivo.trim(), excepcionPlazo);
      setExcepcionOpen(false);
    } finally {
      setGuardando(false);
    }
  }

  // "Aprobar visita" solo valida que la visita se hizo bien; el cliente queda en
  // "Pendiente evaluación" para la decisión final (Aprobar/Rechazar cliente).
  async function handleAprobarVisita(id: string, clienteId: string) {
    if (!confirm("¿Aprobar esta visita? El cliente pasará a evaluación para poder crear su contrato.")) return;
    await resolverVisita(id, "Aprobado");
    await cambiarEstadoCliente(clienteId, "Pendiente evaluación");
  }

  // "Repetir visita" devuelve al cliente a "Listo para visita" para una nueva visita.
  async function handleRepetirVisita(id: string, clienteId: string) {
    await resolverVisita(id, "Repetir");
    await cambiarEstadoCliente(clienteId, "Listo para visita");
  }

  async function handleEliminarCliente(clienteId: string) {
    if (!confirm("¿Eliminar este cliente por completo? Esta acción no se puede deshacer.")) return;
    const { data: contratos } = await supabase
      .from("contratos")
      .select("id")
      .eq("cliente_id", clienteId)
      .in("estado", ["Activo", "En proceso"])
      .limit(1);
    if (contratos && contratos.length > 0) {
      alert("No se puede eliminar: el cliente tiene contratos activos.");
      return;
    }
    const { error } = await supabase.from("clientes").delete().eq("id", clienteId);
    if (error) { alert("Error al eliminar: " + error.message); return; }
    setSelectedId(null);
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando clientes...</div>;

  const CHIPS_CLIENTES = [
    { label: "Todos", count: clientes.length, filter: "" },
    { label: "🔘 En proceso", count: clientes.filter(c => c.estado === "En proceso").length, filter: "En proceso" },
    { label: "🏠 Para visita", count: clientes.filter(c => c.estado === "Listo para visita").length, filter: "Listo para visita" },
    { label: "🟡 Pend. aprob.", count: clientes.filter(c => c.estado === "Pendiente evaluación").length, filter: "Pendiente evaluación" },
    { label: "🟢 Aprobados", count: clientes.filter(c => c.estado === "Aprobado").length, filter: "Aprobado" },
    { label: "✅ Activos", count: clientes.filter(c => c.estado === "Activo").length, filter: "Activo" },
    { label: "🔴 En riesgo", count: clientes.filter(c => c.estado === "En mora" || c.estado === "En riesgo").length, filter: "mora" },
  ];

  function renderClienteForm(data: NuevoCliente, update: (patch: Partial<NuevoCliente>) => void) {
    return (
      <div style={{ display: "grid", gap: 20, marginTop: 18 }}>

        {/* Foto de perfil */}
        <FotoPerfil
          label="Foto de perfil"
          valorInicial={data.foto_perfil_url}
          onChange={(dataUrl) => update({ foto_perfil_url: dataUrl })}
        />

        {/* Ruta del cliente */}
        <div style={{ padding: 16, borderRadius: 16, background: "#f0f9ff", border: "2px solid #0284c7" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7", marginBottom: 12 }}>Ruta del cliente</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {([
              { value: "diario", label: "Diario", desc: "Ahorrando base inicial ($510.000)", badge: { bg: "#dbeafe", color: "#1d4ed8" } },
              { value: "tiempo_definido", label: "Tiempo definido", desc: "Ya tiene la base, pago semanal/quincenal/mensual", badge: { bg: "#dcfce7", color: "#166534" } },
            ] as { value: RutaContrato; label: string; desc: string; badge: { bg: string; color: string } }[]).map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => update({ ruta_contrato: op.value })}
                style={{
                  flex: "1 1 220px", padding: 18, borderRadius: 16, cursor: "pointer", textAlign: "left",
                  border: data.ruta_contrato === op.value ? `2px solid ${op.badge.color}` : "2px solid #e2e8f0",
                  background: data.ruta_contrato === op.value ? op.badge.bg : "white",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 999, background: op.badge.bg, color: op.badge.color, fontSize: 13, fontWeight: 800, border: `1px solid ${op.badge.color}` }}>
                    {op.label}
                  </span>
                  {data.ruta_contrato === op.value && (
                    <span style={{ fontSize: 16, color: op.badge.color }}>✔</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>{op.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ingreso inicial */}
        <div style={{ padding: 16, borderRadius: 16, background: "#fffbeb", border: "2px solid #fbbf24" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 6 }}>Ingreso inicial</div>
          <div style={{ fontSize: 12, color: "#78716c", marginBottom: 10 }}>
            Mínimo ${INGRESO_MINIMO.toLocaleString("es-CO")} · Ideal ${INGRESO_IDEAL.toLocaleString("es-CO")} (55% de la base de $510.000)
          </div>
          <MoneyInput
            value={data.ingreso_inicial != null ? String(data.ingreso_inicial) : ""}
            onChange={(v) => update({ ingreso_inicial: v === "" ? null : Number(v) })}
          />
          {data.ingreso_inicial != null && data.ingreso_inicial > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: data.ingreso_inicial < INGRESO_MINIMO ? "#991b1b" : data.ingreso_inicial >= INGRESO_IDEAL ? "#166534" : "#92400e" }}>
              {data.ingreso_inicial < INGRESO_MINIMO
                ? `⛔ Por debajo del mínimo ($${INGRESO_MINIMO.toLocaleString("es-CO")})`
                : data.ingreso_inicial >= INGRESO_IDEAL
                ? "✔ Cumple el ideal"
                : "✓ Cumple el mínimo (por debajo del ideal)"}
            </div>
          )}
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
            <div>
              <div style={labelStyle}>¿Vive en la misma dirección que el cliente?</div>
              <select style={inputStyle} value={data.mismo_domicilio_acompanante ? "si" : "no"} onChange={(e) => update({ mismo_domicilio_acompanante: e.target.value === "si" })}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>
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
          <DocsChecklist doc={data.documentos_cliente} onChange={(next) => update({ documentos_cliente: next })} carpeta={data.cedula || "sin-cedula"} subir={subirDocumento} />
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#334155", marginBottom: 10 }}>Documentos acompañante <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b" }}>(sin hoja de vida ni licencia)</span></div>
          {data.mismo_domicilio_acompanante && (
            <div style={{ marginBottom: 10, padding: "8px 12px", borderRadius: 10, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 12, color: "#0369a1", fontWeight: 600 }}>
              ℹ️ Vive con el cliente — usa el mismo recibo público, no se pide uno aparte.
            </div>
          )}
          <DocsChecklist doc={data.documentos_acompanante} onChange={(next) => update({ documentos_acompanante: next })} only={docsAcompanante(data.mismo_domicilio_acompanante)} carpeta={`${data.cedula || "sin-cedula"}-acomp`} subir={subirDocumento} />
        </div>

        <div style={{ padding: 16, borderRadius: 16, background: "#fef9f2", border: "2px solid #f59e0b" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 8 }}>Autorización de tratamiento de datos personales</div>
          <div style={{ fontSize: 12, color: "#78716c", marginBottom: 12, lineHeight: 1.5 }}>
            De acuerdo con la Ley 1581 de 2012, el cliente autoriza a GPS Satelital Cartagena a recolectar, almacenar y tratar sus datos personales
            con fines de identificación, gestión del contrato de arrendamiento y cobro de cartera.
            La firma y huella son opcionales — pueden completarse después.
          </div>
          <CanvasFirma
            label="Firma del cliente"
            modal
            valorInicial={data.autorizacion_datos_firma_url ?? null}
            onChange={(dataUrl) => update({
              autorizacion_datos_firma_url: dataUrl,
              autorizacion_datos_fecha: dataUrl ? new Date().toISOString() : null,
            })}
          />
          <div style={{ marginTop: 12, borderTop: "1px dashed #e7d9c0", paddingTop: 12 }}>
            <div style={{ fontSize: 12, color: "#92400e", fontWeight: 700, marginBottom: 8 }}>
              Huellas (índice derecho) — el lector solo lee una a la vez, elija de quién capturar:
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {(["cliente", "acompanante"] as const).map(w => {
                const yaTiene = w === "cliente"
                  ? data.autorizacion_datos_huella_url
                  : data.acompanante_huella_url;
                return (
                  <button key={w} type="button" onClick={() => setHuellaActiva(w)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 10, border: `2px solid ${huellaActiva === w ? "#0284c7" : "#e2e8f0"}`, background: huellaActiva === w ? "#eff6ff" : "white", color: huellaActiva === w ? "#0284c7" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {w === "cliente" ? "Cliente" : "Acompañante"}{yaTiene && !yaTiene.startsWith("data:") ? " ✔" : ""}
                  </button>
                );
              })}
            </div>
            {huellaActiva === "cliente" ? (
              <>
                {data.autorizacion_datos_huella_url && !data.autorizacion_datos_huella_url.startsWith("data:") && (
                  <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", fontWeight: 600 }}>
                    ✔ Huella del cliente ya registrada — capture de nuevo solo si quiere reemplazarla
                  </div>
                )}
                <LectorHuella key="huella-cliente" label="Huella dactilar del cliente" onChange={(dataUrl) => update({ autorizacion_datos_huella_url: dataUrl })} />
              </>
            ) : (
              <>
                {data.acompanante_huella_url && !data.acompanante_huella_url.startsWith("data:") && (
                  <div style={{ marginBottom: 8, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", fontWeight: 600 }}>
                    ✔ Huella del acompañante ya registrada — capture de nuevo solo si quiere reemplazarla
                  </div>
                )}
                <LectorHuella key="huella-acompanante" label="Huella dactilar del acompañante" onChange={(dataUrl) => update({ acompanante_huella_url: dataUrl })} />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header compacto */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <h2 style={{ fontSize: 20, margin: 0, color: "#0f172a" }}>Clientes</h2>
      </div>

      {error && <div style={{ marginBottom: 10, color: "#991b1b", fontSize: 13 }}>Error: {error}</div>}

      {/* Chips de filtro */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {CHIPS_CLIENTES.map(chip => (
          <button
            key={chip.filter}
            onClick={() => { setFiltroEstado(chip.filter); setSelectedId(null); }}
            style={{
              border: "none", borderRadius: 999, padding: "5px 12px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
              background: filtroEstado === chip.filter ? "#0284c7" : "#f1f5f9",
              color: filtroEstado === chip.filter ? "white" : "#334155",
            }}
          >
            {chip.label}
            <span style={{
              marginLeft: 4,
              background: filtroEstado === chip.filter ? "rgba(255,255,255,0.3)" : "#e2e8f0",
              color: filtroEstado === chip.filter ? "white" : "#64748b",
              borderRadius: 999, padding: "1px 5px", fontSize: 11, fontWeight: 700,
            }}>{chip.count}</span>
          </button>
        ))}
      </div>

      {filtroEstado === "Pendiente evaluación" ? (
        <PanelAprobacion
          clientes={clientes.filter(c => c.estado === "Pendiente evaluación")}
          visitas={visitas}
          role={role}
          onAprobar={async (clienteId, visitaId) => {
            await resolverVisita(visitaId, "Aprobado");
            await cambiarEstadoCliente(clienteId, "Aprobado");
          }}
          onRepetir={async (clienteId, visitaId) => {
            await resolverVisita(visitaId, "Repetir");
            await cambiarEstadoCliente(clienteId, "Listo para visita");
          }}
          onRechazar={async (clienteId, visitaId, motivo) => {
            await resolverVisita(visitaId, "Rechazado");
            await cambiarEstadoCliente(clienteId, "Rechazado");
            if (motivo) await actualizarCliente(clienteId, { estado: "Rechazado" } as never);
          }}
          onAsignarVisita={async (visitaId, subadminId) => { await asignarVisita(visitaId, subadminId); }}
          subadmins={subadmins}
        />
      ) : (
        isMobile ? (
          /* ---- MOBILE LAYOUT ---- */
          selectedId && selectedCliente ? (
            <div>
              <button
                onClick={() => setSelectedId(null)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#0284c7", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 14, padding: 0 }}
              >
                ← Volver
              </button>
              <div style={{ ...card }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase", color: "#0f172a", flex: 1, minWidth: 0 }}>{selectedCliente.nombre}</span>
                  <ClienteBadge estado={estadoVisual(selectedCliente)} />
                  <span style={{
                    display: "inline-block", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: selectedCliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7",
                    color: selectedCliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534",
                  }}>
                    {selectedCliente.ruta_contrato === "diario" ? "Diario" : "Tiempo definido"}
                  </span>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("ficha_cliente", selectedCliente.id)}
                    style={{ marginBottom: 14, background: "#eff6ff", color: "#0284c7", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    Ver ficha completa →
                  </button>
                )}
                <DetalleClienteContenido
                  selectedCliente={selectedCliente}
                  role={role}
                  visitas={visitasDelCliente(selectedCliente.id)}
                  onEdit={() => abrirEdicion(selectedCliente)}
                  onVisita={() => { setClienteVisitaId(selectedCliente.id); setClienteVisitaNombre(selectedCliente.nombre); }}
                  onExcepcion={() => abrirExcepcion(selectedCliente)}
                  onEstado={cambiarEstadoCliente}
                  onAprobarVisita={handleAprobarVisita}
                  onRepetirVisita={handleRepetirVisita}
                  onEliminar={() => handleEliminarCliente(selectedCliente.id)}
                  subadmins={subadmins}
                  onAsignarVisitaCliente={async (clienteId, subadminId) => { await asignarVisitaCliente(clienteId, subadminId); }}
                />
              </div>
            </div>
          ) : (
            <div style={{ ...card }}>
              <div style={{ marginBottom: 10 }}>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Buscar por nombre, cédula o teléfono..." style={inputStyle} />
              </div>
              <ChipsGrupo />
              {filtered.length === 0 && clientes.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 24px" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sin clientes registrados</div>
                  <button onClick={() => setOpen(true)} style={{ background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Nuevo cliente</button>
                </div>
              )}
              {filtered.length === 0 && clientes.length > 0 && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>No hay clientes en este filtro.</div>}
              <div style={{ display: "grid", gap: 8, maxHeight: "62vh", overflowY: "auto" }}>
                {filtered.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => setSelectedId(cliente.id)}
                    style={{ width: "100%", minWidth: 0, boxSizing: "border-box", background: "#f8fafc", border: "none", borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, textTransform: "uppercase", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{cliente.cedula} · {cliente.telefono}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: cliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7",
                          color: cliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534",
                        }}>{cliente.ruta_contrato === "diario" ? "Diario" : "Tiempo definido"}</span>
                        <ClienteBadge estado={estadoVisual(cliente)} />
                        {(cliente.referidos_confirmados ?? 0) > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#166534" }}>👥 {cliente.referidos_confirmados} referidos</span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: 22, flexShrink: 0 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          /* ---- DESKTOP LAYOUT ---- */
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Left panel */}
            <div style={{ ...card, flex: "1 1 0", minWidth: 0 }}>
              <div style={{ marginBottom: 10 }}>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Buscar por nombre, cédula o teléfono..." style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
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
              <ChipsGrupo />
              <div style={{ display: "grid", gap: 6, maxHeight: "70vh", overflowY: "auto" }}>
                {filtered.length === 0 && clientes.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 24px" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Sin clientes registrados</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Registra el primer cliente</div>
                    <button onClick={() => setOpen(true)} style={{ background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Nuevo cliente</button>
                  </div>
                )}
                {filtered.length === 0 && clientes.length > 0 && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>No hay clientes en este filtro.</div>}
                {filtered.map((cliente) => {
                  const activo = selectedId === cliente.id || (!selectedId && filtered[0]?.id === cliente.id);
                  return (
                    <button
                      key={cliente.id}
                      onClick={() => setSelectedId(cliente.id)}
                      style={{
                        width: "100%", minWidth: 0, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10, border: "none",
                        background: activo ? "#eff6ff" : "#f8fafc",
                        cursor: "pointer", textAlign: "left",
                        outline: activo ? "2px solid #0284c7" : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente.nombre}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{cliente.cedula} · {cliente.telefono}</div>
                        <div style={{ marginTop: 4, display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{
                            display: "inline-block", padding: "2px 7px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                            background: cliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7",
                            color: cliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534",
                          }}>{cliente.ruta_contrato === "diario" ? "Diario" : "T. definido"}</span>
                          <ClienteBadge estado={estadoVisual(cliente)} />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        {cliente.estado === "Listo para visita" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setClienteVisitaId(cliente.id); setClienteVisitaNombre(cliente.nombre); }}
                            style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 999, padding: "4px 9px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}
                          >
                            🏠 Visita
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ ...card, flex: "0 0 360px" }}>
              {selectedCliente ? (
                <>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase", color: "#0f172a" }}>{selectedCliente.nombre}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        <ClienteBadge estado={estadoVisual(selectedCliente)} />
                        <span style={{
                          display: "inline-block", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                          background: selectedCliente.ruta_contrato === "diario" ? "#dbeafe" : "#dcfce7",
                          color: selectedCliente.ruta_contrato === "diario" ? "#1d4ed8" : "#166534",
                        }}>
                          {selectedCliente.ruta_contrato === "diario" ? "Diario" : "Tiempo definido"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate("ficha_cliente", selectedCliente.id)}
                      style={{ marginBottom: 14, background: "#eff6ff", color: "#0284c7", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Ver ficha completa →
                    </button>
                  )}
                  <DetalleClienteContenido
                    selectedCliente={selectedCliente}
                    role={role}
                    visitas={visitasDelCliente(selectedCliente.id)}
                    onEdit={() => abrirEdicion(selectedCliente)}
                    onVisita={() => { setClienteVisitaId(selectedCliente.id); setClienteVisitaNombre(selectedCliente.nombre); }}
                    onExcepcion={() => abrirExcepcion(selectedCliente)}
                    onEstado={cambiarEstadoCliente}
                    onAprobarVisita={handleAprobarVisita}
                    onRepetirVisita={handleRepetirVisita}
                    onEliminar={() => handleEliminarCliente(selectedCliente.id)}
                    subadmins={subadmins}
                    onAsignarVisitaCliente={async (clienteId, subadminId) => { await asignarVisitaCliente(clienteId, subadminId); }}
                  />
                </>
              ) : (
                <div style={{ color: "#64748b", fontSize: 14, padding: "20px 0" }}>Selecciona un cliente para ver su detalle.</div>
              )}
            </div>
          </div>
        )
      )}

      {/* FAB — Nuevo cliente */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: isMobile ? 80 : 28,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0284c7 0%, #10b981 100%)",
          color: "white",
          border: "none",
          fontSize: 28,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(2,132,199,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
        }}
        title="Nuevo cliente"
      >
        +
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 16, padding: 24, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
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
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, background: "white", borderRadius: 16, padding: 24, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Actualizar cliente</h3>
            {renderClienteForm(editForm, (patch) => setEditForm((p) => (p ? { ...p, ...patch } : p)))}
            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setEditOpen(false); setFormError(null); }} style={secondaryBtn}>Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Guardar cambios"}</button>
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
              <button onClick={confirmarExcepcion} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Confirmar excepción"}</button>
            </div>
          </div>
        </div>
      )}

      {clienteVisitaId && (
        <ModalVisita
          clienteId={clienteVisitaId}
          clienteNombre={clienteVisitaNombre}
          onClose={() => setClienteVisitaId(null)}
          onGuardada={() => { setClienteVisitaId(null); }}
        />
      )}

      {reciboBase && <ReciboBaseModal datos={reciboBase} onCerrar={() => setReciboBase(null)} />}

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
  onEstado: (id: string, estado: ClienteEstado) => Promise<{ error: string | null }> | void;
  onAprobarVisita: (id: string, clienteId: string) => void;
  onRepetirVisita: (id: string, clienteId: string) => void;
  onEliminar?: () => void;
  subadmins?: { id: string; nombre: string }[];
  onAsignarVisitaCliente?: (clienteId: string, subadminId: string | null) => Promise<void>;
};

function miniBtn2(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

function DetalleClienteContenido({ selectedCliente, role, visitas, onEdit, onVisita, onExcepcion, onEstado, onAprobarVisita, onRepetirVisita, onEliminar, subadmins, onAsignarVisitaCliente }: DetalleProps) {
  const esAdmin = role === "ADMIN" || role === "ADMIN_PRINCIPAL";
  const esPrincipal = role === "ADMIN_PRINCIPAL";
  // Cliente ya operando con contrato: la salida es por Liquidación (cierra contrato + libera
  // moto), no por cambiar el estado a mano — eso dejaría contrato/moto colgados. Por eso se
  // ocultan Rechazar/Retirar/Eliminar en estos estados.
  const conContrato = ["Activo", "En seguimiento", "En riesgo", "En mora"].includes(selectedCliente.estado);
  const { alcanzados, siguiente } = calcularPremioReferidos(selectedCliente.referidos_confirmados ?? 0);
  const [verAnteriores, setVerAnteriores] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const visitasVisibles = verAnteriores ? visitas : visitas.slice(0, 1);

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 12 }}>

      {selectedCliente.lista_negra && (
        <div style={{ padding: 14, borderRadius: 16, background: "#1f2937", color: "#f9fafb", fontWeight: 700, fontSize: 14 }}>
          ⛔ LISTA NEGRA{selectedCliente.lista_negra_reversible ? " (reversible)" : " (irreversible)"}
          {selectedCliente.motivo_lista_negra && <div style={{ marginTop: 6, fontSize: 13, fontWeight: 400, color: "#d1d5db" }}>{selectedCliente.motivo_lista_negra}</div>}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoBox label="Cédula" value={selectedCliente.cedula} />
        <InfoBox label="Teléfono" value={selectedCliente.telefono} />
        <InfoBox label="WhatsApp" value={selectedCliente.whatsapp || "Sin registrar"} />
        <InfoBox label="Fuente" value={selectedCliente.fuente_llegada || "Sin registrar"} />
        <InfoBox label="Ruta" value={selectedCliente.ruta_contrato === "tiempo_definido" ? "Tiempo definido" : "Diario (acumula base)"} full />
        <InfoBox label="Dirección" value={selectedCliente.direccion} full />
        <InfoBox label="Acompañante" value={`${selectedCliente.acompanante_nombre || "Sin registrar"} · Tel: ${selectedCliente.acompanante_telefono || "Sin teléfono"}`} full />
      </div>

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
            {visitasVisibles.map((v) => (
              <div key={v.id} style={{ padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0", display: "grid", gap: 6, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800 }}>{formatDate(v.fecha)}</span>
                  {v.resultado === "Repetir" && (
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700 }}>🔁 Repetir visita ordenada</span>
                  )}
                  {v.resultado === "Aprobado" && (
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700 }}>✔ Visita aprobada</span>
                  )}
                  {v.resultado === null && (
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: "#e2e8f0", color: "#475569", fontSize: 11, fontWeight: 700 }}>Pendiente de revisar</span>
                  )}
                </div>
                <div><b>Vive allí:</b> {v.entrevista.viveAlli || "Sin registrar"} {v.entrevista.tiempoResidencia ? `· ${v.entrevista.tiempoResidencia}` : ""}</div>
                <div><b>Tipo vivienda:</b> {v.entrevista.tipoVivienda || "Sin registrar"}</div>
                {v.entrevista.composicionFamiliar && <div><b>Familia:</b> {v.entrevista.composicionFamiliar}</div>}
                {v.entrevista.estabilidadLaboral && <div><b>Ingresos:</b> {v.entrevista.estabilidadLaboral}</div>}
                {v.entrevista.dudasCliente && <div><b>Dudas del cliente:</b> {v.entrevista.dudasCliente}</div>}
                <div><b>Recomendación:</b> {v.entrevista.recomendacion || "Sin definir"}</div>
                <div><b>Observaciones:</b> {v.entrevista.observaciones || "Sin observaciones"}</div>
                {(v.fotos.clienteFuncionario || v.fotos.fachada) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {v.fotos.clienteFuncionario && (
                      esUrl(v.fotos.clienteFuncionario) ? (
                        <a href={v.fotos.clienteFuncionario} target="_blank" rel="noreferrer" title="Funcionario + visitados">
                          <img src={v.fotos.clienteFuncionario} alt="Funcionario + visitados" style={{ height: 90, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                        </a>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b" }}>📎 Personas + funcionario: {v.fotos.clienteFuncionario}</div>
                      )
                    )}
                    {v.fotos.fachada && (
                      esUrl(v.fotos.fachada) ? (
                        <a href={v.fotos.fachada} target="_blank" rel="noreferrer" title="Fachada">
                          <img src={v.fotos.fachada} alt="Fachada" style={{ height: 90, borderRadius: 10, objectFit: "cover", border: "2px solid #e2e8f0" }} />
                        </a>
                      ) : (
                        <div style={{ fontSize: 12, color: "#64748b" }}>📎 Fachada: {v.fotos.fachada}</div>
                      )
                    )}
                  </div>
                )}
                {v.ubicacion && (
                  <div style={{ marginTop: 4 }}>
                    <a
                      href={`https://www.google.com/maps?q=${v.ubicacion.lat},${v.ubicacion.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "#e0f2fe", color: "#0369a1", fontWeight: 700, fontSize: 12, textDecoration: "none" }}
                    >
                      📍 Ver ubicación en mapa · {v.ubicacion.lat.toFixed(4)}, {v.ubicacion.lng.toFixed(4)}
                    </a>
                  </div>
                )}
                {esAdmin && v.resultado === null && (
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => onAprobarVisita(v.id, selectedCliente.id)} style={miniBtn2("#dcfce7", "#166534")}>✅ Aprobar visita</button>
                    <button onClick={() => onRepetirVisita(v.id, selectedCliente.id)} style={miniBtn2("#fef3c7", "#92400e")}>🔁 Repetir visita</button>
                  </div>
                )}
              </div>
            ))}
            {visitas.length > 1 && (
              <button
                onClick={() => setVerAnteriores((x) => !x)}
                style={{ background: "none", border: "none", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", padding: "4px 2px" }}
              >
                {verAnteriores ? "▾ Ocultar visitas anteriores" : `▸ Visitas anteriores (${visitas.length - 1})`}
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Documentos cliente</div>
        <DocsSummary doc={selectedCliente.documentos_cliente} role={role} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Documentos acompañante</div>
        <DocsSummary doc={selectedCliente.documentos_acompanante} only={docsAcompanante(selectedCliente.mismo_domicilio_acompanante)} role={role} />
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
        {esAdmin && selectedCliente.estado === "Listo para visita" && subadmins && subadmins.length > 0 && onAsignarVisitaCliente && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Asignar a:</span>
            <select
              value={selectedCliente.visita_asignada_a ?? ""}
              onChange={e => onAsignarVisitaCliente(selectedCliente.id, e.target.value || null)}
              style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 12 }}
            >
              <option value="">— Sin asignar —</option>
              {subadmins.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}
        {esAdmin && (
          <>
            {/* "Activar cliente" manual ELIMINADO (caso SERAFIN): ponía Activo a un cliente
                sin contrato — estado mentiroso que además bloqueaba el wizard (exige Aprobado).
                El ÚNICO camino a Activo es el wizard paso 6 (entrega de la moto). */}
            {selectedCliente.estado === "Aprobado" && (
              <>
                <button onClick={() => onEstado(selectedCliente.id, "En seguimiento")} style={miniBtn2("#e0f2fe", "#0369a1")}>En seguimiento</button>
                <button onClick={() => onEstado(selectedCliente.id, "En riesgo")} style={miniBtn2("#fef3c7", "#92400e")}>Marcar en riesgo</button>
                <button onClick={() => onEstado(selectedCliente.id, "En mora")} style={miniBtn2("#fee2e2", "#991b1b")}>En mora</button>
              </>
            )}
            {documentosFaltantes(selectedCliente).length > 0 && (
              <button onClick={onExcepcion} style={miniBtn2("#fef3c7", "#92400e")}>Permitir continuar por excepción</button>
            )}
            {!conContrato && (
              <>
                <button onClick={() => onEstado(selectedCliente.id, "Rechazado")} style={miniBtn2("#ffe4e6", "#be123c")}>Rechazar</button>
                <button onClick={() => onEstado(selectedCliente.id, "Retirado")} style={miniBtn2("#ede9fe", "#6d28d9")}>Retirar</button>
              </>
            )}
          </>
        )}
        {esPrincipal && onEliminar && !conContrato && (
          <button
            onClick={() => setEliminando(true)}
            style={miniBtn2("#fee2e2", "#991b1b")}
          >
            🗑 Eliminar cliente
          </button>
        )}
      </div>

      {eliminando && (
        <>
          <div onClick={() => setEliminando(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 90 }} />
          <div style={{
            position: "fixed", zIndex: 91, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "min(420px, calc(100vw - 32px))", background: "white", borderRadius: 18,
            padding: 22, boxShadow: "0 30px 80px rgba(15,23,42,0.35)",
          }}>
            <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🗑</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", textAlign: "center", marginBottom: 8 }}>¿Eliminar a {selectedCliente.nombre}?</div>
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 18 }}>Esta acción no se puede deshacer. Solo es posible si el cliente no tiene contratos activos.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEliminando(false)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#334155" }}>Cancelar</button>
              <button onClick={() => { setEliminando(false); onEliminar?.(); }} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "#991b1b", color: "white", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Sí, eliminar</button>
            </div>
          </div>
        </>
      )}

      {/* Decisión final — siempre al final del detalle */}
      {esAdmin && selectedCliente.estado === "Pendiente evaluación" && (
        <DecisionFinal clienteId={selectedCliente.id} onEstado={onEstado} />
      )}
    </div>
  );
}

function DecisionFinal({ clienteId, onEstado }: { clienteId: string; onEstado: (id: string, estado: ClienteEstado) => Promise<{ error: string | null }> | void }) {
  const [procesando, setProcesando] = useState<"Aprobado" | "Rechazado" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function decidir(estado: "Aprobado" | "Rechazado") {
    if (procesando) return;
    setProcesando(estado);
    setErrorMsg(null);
    try {
      const result = await onEstado(clienteId, estado);
      if (result && result.error) setErrorMsg(result.error);
    } catch (e) {
      setErrorMsg(String(e));
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div style={{ padding: 16, borderRadius: 16, background: "#f0f9ff", border: "2px solid #0284c7", marginTop: 4 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0284c7", marginBottom: 4 }}>Decisión final del cliente</div>
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>Tras revisar la visita y los documentos, decide si el cliente queda aprobado o rechazado definitivamente.</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => decidir("Aprobado")}
          disabled={!!procesando}
          style={{ flex: 1, padding: "12px 20px", background: procesando ? "#94a3b8" : "linear-gradient(90deg,#166534,#10b981)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: procesando ? "not-allowed" : "pointer", opacity: procesando ? 0.7 : 1 }}
        >
          {procesando === "Aprobado" ? "Aprobando..." : "✅ Aprobar cliente"}
        </button>
        <button
          onClick={() => decidir("Rechazado")}
          disabled={!!procesando}
          style={{ flex: 1, padding: "12px 20px", background: "#fee2e2", color: "#991b1b", border: "2px solid #fca5a5", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: procesando ? "not-allowed" : "pointer", opacity: procesando ? 0.7 : 1 }}
        >
          {procesando === "Rechazado" ? "Rechazando..." : "❌ Rechazar cliente"}
        </button>
      </div>
      {errorMsg && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 700, fontSize: 13 }}>
          ⚠️ Error: {errorMsg}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "5px 10px", gridColumn: full ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: 1, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{value}</div>
    </div>
  );
}
