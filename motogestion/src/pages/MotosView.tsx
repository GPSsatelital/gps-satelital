import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";

// Busca el ancestro scrolleable de un nodo (para preservar su posición tras un re-render).
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}
import { useMotos, type GrupoMoto, type Moto, type MotoStatus, type CondicionIngreso, type RetencionData } from "../hooks/useMotos";
import { useUbicaciones, UBICACION_LABEL, type UbicacionFisica, type MotivoRecepcion, type CondicionVehiculo } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useDeudas } from "../hooks/useDeudas";
import { usePagos } from "../hooks/usePagos";
import { useConvenios } from "../hooks/useConvenios";
import { calcularEstadoCartera, cuotaConvenioDelPeriodo } from "../utils/cicloPago";
import ModalResolverTiempoFueraServicio from "../components/ModalResolverTiempoFueraServicio";
import Placa from "../components/Placa";
import ModalRecoleccion from "../components/ModalRecoleccion";
import ModalIniciarLiquidacion from "../components/ModalIniciarLiquidacion";
import { ANGULOS_FOTO, IconoAngulo, type AnguloFoto } from "../components/FotosAngulos";
import { hoyISO, hoyDate as hoyDateFn } from "../utils/fecha";

function getStatusColors(status: MotoStatus) {
  switch (status) {
    case "Disponible":    return { bg: "var(--ok-soft)", color: "var(--ok-ink)", border: "var(--ok-line)" };
    case "Reservada":     return { bg: "var(--warn-soft)", color: "var(--warn-ink)", border: "#fcd34d" };
    case "Asignada":      return { bg: "var(--accent-soft3)", color: "var(--accent-ink)", border: "var(--accent-line)" };
    case "Mantenimiento": return { bg: "var(--bad-soft)", color: "var(--bad)", border: "#fda4af" };
    case "Recuperada":    return { bg: "var(--line)", color: "var(--muted2)", border: "var(--line2)" };
    case "Fiscalia":      return { bg: "var(--warn-soft)", color: "var(--warn-ink2)", border: "var(--warn-line)" };
    case "Transito":      return { bg: "var(--orange-soft)", color: "var(--orange-ink)", border: "#fdba74" };
    case "Garantia":      return { bg: "#f3e8ff", color: "#6b21a8", border: "#d8b4fe" };
    case "En traspaso":   return { bg: "#ecfdf5", color: "#047857", border: "#6ee7b7" };
  }
}

const ESTADO_LABEL: Record<MotoStatus, string> = {
  Disponible: "Disponible",
  Reservada: "Reservada",
  Asignada: "Asignada",
  Mantenimiento: "En taller",
  Recuperada: "Recuperada",
  Fiscalia: "Fiscalía",
  Transito: "Tránsito",
  Garantia: "Garantía",
  "En traspaso": "En traspaso",
};

function StatusBadge({ status }: { status: MotoStatus }) {
  const colors = getStatusColors(status);
  return (
    <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, fontSize: 12, fontWeight: 700 }}>
      {ESTADO_LABEL[status]}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Sin registrar";
  return new Date(date).toLocaleDateString("es-CO");
}

const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "var(--muted2)" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line2)", outline: "none", fontSize: 14, boxSizing: "border-box" };

import type { ViewKey } from "../App";

export default function MotosView({ initialFilter = "", initialOpenForm = false, onNavigate }: { initialFilter?: string; initialOpenForm?: boolean; onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const { profile, puede } = useAuth();
  const { motos, loading, error, crearMoto, actualizarMoto, cambiarEstadoMoto, registrarRetencion, liberarRetencion, asignarSubadmin } = useMotos();
  // Acciones sensibles con permiso por persona (defaults: recolectar/liquidar=ADMIN+SUBADMIN, grupo=ADMIN)
  const puedeRecolectar = puede("recolectar_moto");
  const puedeLiquidar = puede("iniciar_liquidacion");
  const puedeCambiarGrupo = puede("cambiar_grupo_moto");
  const { filtrarMotos } = useScope();
  const { contratos, suspenderContrato } = useContratos();
  const { clientes } = useClientes();
  const { registrarDeuda } = useDeudas();
  const { pagos } = usePagos();
  const { convenios } = useConvenios();
  const esAdminOSuperior = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const [tiempoFueraModal, setTiempoFueraModal] = useState<{ contrato: import("../hooks/useContratos").Contrato; motoPlaca: string; clienteNombre: string; motivo: string; fechaEntrada: string; fechaSalida: string } | null>(null);

  function abrirResolverTiempoSiAplica(moto: Moto, motivo: string, fechaEntrada: string | null | undefined) {
    if (!esAdminOSuperior || !fechaEntrada) return;
    const contratoActivo = contratos.find(c => c.moto_id === moto.id && c.estado === "Activo");
    const fechaSalida = hoyISO();
    const dias = Math.round((new Date(fechaSalida + "T00:00:00").getTime() - new Date(fechaEntrada + "T00:00:00").getTime()) / 86400000);
    if (!contratoActivo || dias <= 0) return;
    const cliente = clientes.find(cl => cl.id === contratoActivo.cliente_id);
    setTiempoFueraModal({ contrato: contratoActivo, motoPlaca: moto.placa, clienteNombre: cliente?.nombre ?? "", motivo, fechaEntrada, fechaSalida });
  }
  const [subadmins, setSubadmins] = React.useState<{ id: string; nombre: string }[]>([]);
  React.useEffect(() => {
    if (!esAdminOSuperior) return;
    import("../lib/supabase").then(({ supabase }) => {
      supabase.from("profiles").select("id, nombre").eq("role", "SUBADMIN").then(({ data }) => {
        setSubadmins((data ?? []) as { id: string; nombre: string }[]);
      });
    });
  }, [esAdminOSuperior]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  const { cambiarUbicacion, registrarRecepcion, historialDeMoto } = useUbicaciones();
  const [query, setQuery] = useState("");
  const [filtroEstado] = useState(initialFilter);
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | GrupoMoto>("todos");
  const [soloSinAsignar, setSoloSinAsignar] = useState(false);
  // Moto sobre la que se abre la hoja rápida de asignación de sub-admin (solo ADMIN/AP).
  const [asignarMotoId, setAsignarMotoId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(initialOpenForm);
  const [openRecepcion, setOpenRecepcion] = useState(false);
  const [openUbicacion, setOpenUbicacion] = useState(false);
  const [openRetencion, setOpenRetencion] = useState(false);
  const [openLiberarFiscalia, setOpenLiberarFiscalia] = useState(false);
  // Router "Registrar novedad": una sola puerta que enruta al flujo correcto.
  const [openNovedad, setOpenNovedad] = useState(false);
  const [recoleccionMoto, setRecoleccionMoto] = useState<Moto | null>(null);
  const [liquidacionMoto, setLiquidacionMoto] = useState<Moto | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [msgDetalle, setMsgDetalle] = useState<string | null>(null);
  const [editandoMoto, setEditandoMoto] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Moto & { color: string }>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [editGuardando, setEditGuardando] = useState(false);

  const [formRetencion, setFormRetencion] = useState<{
    tipo: "Fiscalia" | "Transito" | "Garantia";
    fecha: string;
    numero_caso: string;
    detalle: string;
  }>({ tipo: "Fiscalia", fecha: "", numero_caso: "", detalle: "" });

  const [ubicacionSalidaFiscalia, setUbicacionSalidaFiscalia] = useState<UbicacionFisica>("bodega");

  const [formRec, setFormRec] = useState({
    motivo: "nuevo_registro" as MotivoRecepcion,
    condicion_general: "buena" as CondicionVehiculo,
    descripcion_danos: "",
    kilometros: "",
    ubicacion_destino: "bodega" as UbicacionFisica,
    nombre_entrega: "",
    observaciones: "",
  });
  // Fotos del estado del vehículo al recibirlo (dataURLs; se suben a Storage al guardar)
  // 6 fotos guiadas por ángulo (incl. la persona) — misma evidencia que la recolección,
  // exigida en toda recepción/entrega para respaldo legal de a quién se recibió/entregó.
  const [fotosRec, setFotosRec] = useState<Partial<Record<AnguloFoto, string>>>({});
  // Entrega voluntaria: ¿la trajo el cliente (sin costo) o hubo que ir a buscarla (+$20.000)?
  const [recFueBuscada, setRecFueBuscada] = useState(false);

  const [formUbic, setFormUbic] = useState({
    ubicacion_nueva: "bodega" as UbicacionFisica,
    detalle: "",
    motivo: "",
  });

  const [form, setForm] = useState({
    placa: "",
    grupo: "RASTREADOR" as GrupoMoto,
    marca: "",
    modelo: "",
    color: "",
    numero_motor: "",
    numero_chasis: "",
    lugar_matricula: "",
    cilindraje: "",
    fecha_seguro: "",
    fecha_tecnomecanica: "",
    propietario: "",
    numero_serie: "",
    estado: "Disponible" as MotoStatus,
    condicion_ingreso: "nueva" as CondicionIngreso,
    observaciones: "",
  });

  const filtered = useMemo(() => {
    let list = filtrarMotos(motos).filter(m => [m.placa, m.marca, m.modelo, m.grupo].join(" ").toLowerCase().includes(query.toLowerCase()));
    if (filtroEstado === "retencion") list = list.filter(m => ["Fiscalia","Transito","Garantia"].includes(m.estado));
    else if (filtroEstado.startsWith("grupo:")) list = list.filter(m => m.grupo === filtroEstado.replace("grupo:", ""));
    else if (filtroEstado) list = list.filter(m => m.estado === filtroEstado);
    if (filtroGrupo !== "todos") list = list.filter(m => m.grupo === filtroGrupo);
    if (soloSinAsignar) list = list.filter(m => !m.subadmin_id);
    return list;
  }, [motos, query, filtroEstado, filtroGrupo, soloSinAsignar, filtrarMotos]);

  // Nombre del sub-admin a cargo (solo ADMIN/AP puede leer estos nombres por RLS).
  const nombreSubadmin = (id: string | null | undefined) =>
    id ? (subadmins.find(s => s.id === id)?.nombre ?? "—") : null;

  // Conservar el scroll al asignar un sub-admin: la asignación dispara un realtime que
  // recarga la lista; sin esto, la vista se percibe saltando al inicio. Se guarda la
  // posición del contenedor scrolleable antes de asignar y se restaura tras el refresh.
  const listWrapRef = useRef<HTMLDivElement>(null);
  const savedScroll = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (savedScroll.current == null) return;
    const sp = getScrollParent(listWrapRef.current);
    if (sp) sp.scrollTop = savedScroll.current;
    savedScroll.current = null;
  }, [motos]);

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
        {esAdminOSuperior && (
          <button
            onClick={() => setSoloSinAsignar(v => !v)}
            style={{
              padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              background: soloSinAsignar ? "var(--warn-strong)" : "var(--warn-soft)",
              color: soloSinAsignar ? "var(--card)" : "var(--warn-ink)",
            }}
          >
            👤 Sin asignar
          </button>
        )}
      </div>
    );
  }

  const selectedMoto: Moto | null = motos.find((m) => m.id === selectedId) ?? (isMobile ? null : filtered[0] ?? null);

  // Contexto de la moto seleccionada para el router de novedades: ¿tiene contrato vivo?
  // ¿está en mora? (para habilitar "Recolección por mora" solo cuando aplica).
  const contratoMoto = useMemo(
    () => selectedMoto ? contratos.find(c => c.moto_id === selectedMoto.id && (c.estado === "Activo" || c.estado === "Suspendido")) ?? null : null,
    [selectedMoto, contratos],
  );
  const clienteMoto = useMemo(
    () => contratoMoto ? clientes.find(cl => cl.id === contratoMoto.cliente_id) ?? null : null,
    [contratoMoto, clientes],
  );
  const contratoMotoEnMora = useMemo(() => {
    if (!contratoMoto || contratoMoto.estado !== "Activo") return false;
    const hoyD = hoyDateFn();
    const pagosC = pagos.filter(p => p.contrato_id === contratoMoto.id && p.estado === "Confirmado");
    const conv = convenios.find(cv => cv.contrato_id === contratoMoto.id && cv.estado === "activo") ?? null;
    const cuotaConv = cuotaConvenioDelPeriodo(conv, contratoMoto, hoyD);
    const cubierto = !!(conv?.cubre_periodo_hasta && conv.cubre_periodo_hasta >= hoyISO());
    return calcularEstadoCartera(contratoMoto, pagosC, hoyD, cuotaConv, cubierto) === "mora";
  }, [contratoMoto, pagos, convenios]);

  function abrirEdicion() {
    if (!selectedMoto) return;
    setEditForm({
      marca: selectedMoto.marca,
      modelo: selectedMoto.modelo,
      color: (selectedMoto as any).color ?? "",
      cilindraje: selectedMoto.cilindraje ?? "",
      numero_motor: selectedMoto.numero_motor ?? "",
      numero_chasis: selectedMoto.numero_chasis ?? "",
      propietario: selectedMoto.propietario ?? "",
      fecha_seguro: selectedMoto.fecha_seguro ?? "",
      fecha_tecnomecanica: selectedMoto.fecha_tecnomecanica ?? "",
      observaciones: selectedMoto.observaciones ?? "",
      grupo: selectedMoto.grupo,
    });
    setEditError(null);
    setEditandoMoto(true);
  }

  async function guardarEdicionMoto() {
    if (!selectedMoto) return;
    setEditGuardando(true);
    setEditError(null);
    const { error } = await actualizarMoto(selectedMoto.id, editForm);
    setEditGuardando(false);
    if (error) { setEditError(error); return; }
    setEditandoMoto(false);
    setMsgDetalle("Moto actualizada correctamente.");
  }

  // Sube las fotos capturadas (dataURLs) a Storage y devuelve sus URLs públicas.
  async function subirFotosRecepcion(motoId: string): Promise<string[]> {
    const { supabase } = await import("../lib/supabase");
    const urls: string[] = [];
    for (const { key } of ANGULOS_FOTO) {
      const dataUrl = fotosRec[key];
      if (!dataUrl) continue;
      const blob = await (await fetch(dataUrl)).blob();
      const path = `recepciones/${motoId}/${key}_${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("documentos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleRegistrarRecepcion() {
    if (!selectedMoto || !profile) return;
    const faltanFotos = ANGULOS_FOTO.filter(a => !fotosRec[a.key]);
    if (faltanFotos.length > 0) { setMsgDetalle(`Falta la foto: ${faltanFotos.map(a => a.label).join(", ")}.`); return; }
    if (!confirm(`¿Registrar la recepción de la moto ${selectedMoto.placa}? Esto puede suspender el contrato activo.`)) return;
    setGuardando(true);
    const fotosUrls = await subirFotosRecepcion(selectedMoto.id);
    const { error } = await registrarRecepcion({
      moto_id: selectedMoto.id,
      motivo: formRec.motivo,
      condicion_general: formRec.condicion_general,
      descripcion_danos: formRec.descripcion_danos || undefined,
      kilometros: formRec.kilometros ? Number(formRec.kilometros) : undefined,
      ubicacion_destino: formRec.ubicacion_destino,
      quien_recibe: profile.id,
      nombre_entrega: formRec.nombre_entrega || undefined,
      fotos: fotosUrls,
      observaciones: formRec.observaciones || undefined,
      ubicacion_anterior: (selectedMoto as any).ubicacion_fisica ?? undefined,
    });
    if (error) { setGuardando(false); setMsgDetalle(error); return; }

    // Entrega voluntaria: el contrato se suspende y la moto queda guardada (reloj de 7 días).
    // El costo de $20.000 SOLO aplica si hubo que ir a buscarla (movimiento de personal);
    // si el cliente la trajo, no se cobra nada.
    let msgFinal = "Recepción registrada.";
    if (formRec.motivo === "entrega_voluntaria") {
      const contratoActivo = contratos.find(c => c.moto_id === selectedMoto.id && c.estado === "Activo");
      if (contratoActivo) {
        const { error: errSusp } = await suspenderContrato(contratoActivo.id, selectedMoto.id, "temporal");
        if (errSusp) { setGuardando(false); setMsgDetalle("Recepción registrada, pero falló suspender el contrato: " + errSusp); return; }
        if (recFueBuscada) {
          await registrarDeuda(contratoActivo.id, "multa_recoleccion", "Costo por movimiento de personal (recolección)", 20000, profile.id);
          msgFinal = "Entrega registrada, contrato suspendido y costo de $20.000 aplicado (se fue a buscar).";
        } else {
          msgFinal = "Entrega registrada y contrato suspendido — sin costo (la trajo el cliente).";
        }
      } else {
        msgFinal = "Recepción registrada (esta moto no tenía contrato activo).";
      }
    }

    setGuardando(false);
    setMsgDetalle(msgFinal);
    setFotosRec({});
    setRecFueBuscada(false);
    setOpenRecepcion(false);
  }

  async function handleCambiarUbicacion() {
    if (!selectedMoto || !profile) return;
    setGuardando(true);
    const { error } = await cambiarUbicacion(
      selectedMoto.id,
      (selectedMoto as any).ubicacion_fisica ?? null,
      formUbic.ubicacion_nueva,
      formUbic.detalle,
      formUbic.motivo,
      profile.id
    );
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    setMsgDetalle("Ubicación actualizada.");
    setOpenUbicacion(false);
  }

  async function handleRegistrarRetencion() {
    if (!selectedMoto) return;
    if (!formRetencion.fecha) { setMsgDetalle("Ingresa la fecha de retención."); return; }
    if (!confirm(`¿Marcar la moto ${selectedMoto.placa} como ${ESTADO_LABEL[formRetencion.tipo]}?`)) return;
    setGuardando(true);
    const datos: RetencionData = {
      fecha: formRetencion.fecha,
      numero_caso: formRetencion.numero_caso || undefined,
      detalle: formRetencion.detalle || undefined,
    };
    const { error } = await registrarRetencion(selectedMoto.id, formRetencion.tipo, datos);
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    setMsgDetalle(`Moto marcada como ${ESTADO_LABEL[formRetencion.tipo]}.`);
    setOpenRetencion(false);
  }

  async function handleLiberarFiscalia() {
    if (!selectedMoto || !profile) return;
    if (!confirm(`¿Liberar la moto ${selectedMoto.placa} de Fiscalía? Pasará a taller para revisión.`)) return;
    setGuardando(true);
    const fechaEntrada = selectedMoto.retencion_fecha;
    // 1. Registrar cambio de ubicación al lugar físico elegido
    await cambiarUbicacion(selectedMoto.id, "fiscalia" as UbicacionFisica, ubicacionSalidaFiscalia, "", "Salida de Fiscalía — ingresa a revisión de taller", profile.id);
    // 2. Marcar moto como En taller (Mantenimiento) y limpiar retención
    const { error } = await cambiarEstadoMoto(selectedMoto.id, "Mantenimiento");
    await liberarRetencion(selectedMoto.id);
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    abrirResolverTiempoSiAplica(selectedMoto, "Fiscalía", fechaEntrada);
    setMsgDetalle("Moto liberada de Fiscalía. Pasa a taller para revisión antes de operar.");
    setOpenLiberarFiscalia(false);
  }

  async function handleLiberarRetencion() {
    if (!selectedMoto) return;
    const motivoLbl = selectedMoto.estado === "Garantia" ? "Garantía" : "Tránsito";
    if (!confirm(`¿Liberar la moto ${selectedMoto.placa} de ${motivoLbl}?`)) return;
    setGuardando(true);
    const fechaEntrada = selectedMoto.retencion_fecha;
    const motivo = motivoLbl;
    const { error } = await liberarRetencion(selectedMoto.id);
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    abrirResolverTiempoSiAplica(selectedMoto, motivo, fechaEntrada);
    setMsgDetalle("Retención liberada. Moto disponible.");
  }

  async function handleGuardar() {
    if (!form.placa.trim() || !form.marca.trim() || !form.modelo.trim()) {
      setFormError("Completa placa, marca y modelo.");
      return;
    }

    setGuardando(true);
    setFormError(null);

    const { error } = await crearMoto({
      placa: form.placa.trim().toUpperCase(),
      grupo: form.grupo,
      marca: form.marca.trim().toUpperCase(),
      modelo: form.modelo.trim(),
      color: form.color.trim() || null,
      numero_motor: form.numero_motor.trim() || null,
      numero_chasis: form.numero_chasis.trim() || null,
      lugar_matricula: form.lugar_matricula.trim() || null,
      cilindraje: form.cilindraje.trim() || null,
      fecha_seguro: form.fecha_seguro || null,
      fecha_tecnomecanica: form.fecha_tecnomecanica || null,
      propietario: form.propietario.trim() || null,
      numero_serie: form.numero_serie.trim() || null,
      estado: form.estado,
      condicion_ingreso: form.condicion_ingreso,
      observaciones: form.observaciones.trim() || null,
    });

    setGuardando(false);

    if (error) {
      setFormError(error.includes("duplicate") ? "Ya existe una moto con esa placa." : error);
      return;
    }

    setForm({
      placa: "", grupo: "RASTREADOR" as const, marca: "", modelo: "", color: "", numero_motor: "", numero_chasis: "",
      lugar_matricula: "", cilindraje: "", fecha_seguro: "", fecha_tecnomecanica: "",
      propietario: "", numero_serie: "", estado: "Disponible" as const, observaciones: "", condicion_ingreso: "nueva" as const,
    });
    setOpen(false);
  }

  if (loading) return <div style={{ padding: 24, color: "var(--muted)" }}>Cargando motos...</div>;

  // Panel de detalle (reutilizado en móvil y desktop)
  function DetallePanel() {
    if (!selectedMoto) return <div style={{ padding: 24, color: "var(--muted)", textAlign: "center" }}>Selecciona una moto de la lista.</div>;
    return (
      <div style={{ display: "grid", gap: 12 }}>
        {/* Header moto */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div><Placa placa={selectedMoto.placa} size="lg" /></div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>{selectedMoto.marca} {selectedMoto.modelo} · {selectedMoto.grupo}</div>
          </div>
          <StatusBadge status={selectedMoto.estado} />
        </div>
        {onNavigate && <button onClick={() => onNavigate("ficha_moto", selectedMoto.id)} style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--accent)", background: "var(--accent-soft2)", color: "var(--accent)", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>📋 Ver ficha completa →</button>}
        {editandoMoto ? (
          <div style={{ background: "var(--soft2)", borderRadius: 14, padding: 16, border: "1px solid var(--line)", display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>✏️ Editando: {selectedMoto.placa}</div>
            {([
              { key: "marca", label: "Marca" }, { key: "modelo", label: "Modelo" },
              { key: "color", label: "Color" }, { key: "cilindraje", label: "Cilindraje" },
              { key: "numero_motor", label: "N° Motor" }, { key: "numero_chasis", label: "N° Chasis" },
              { key: "propietario", label: "Propietario" },
            ] as { key: keyof typeof editForm; label: string }[]).map(({ key, label }) => (
              <div key={key}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>{label}</div>
                <input value={(editForm[key] as string) ?? ""} onChange={e => setEditForm(f => ({ ...f, [key]: key === "propietario" ? e.target.value : e.target.value.toUpperCase() }))}
                  style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line2)", fontSize: 13 }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>SOAT vence</div>
              <input type="date" value={(editForm.fecha_seguro as string) ?? ""} onChange={e => setEditForm(f => ({ ...f, fecha_seguro: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line2)", fontSize: 13 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>Tecnomecánica vence</div>
              <input type="date" value={(editForm.fecha_tecnomecanica as string) ?? ""} onChange={e => setEditForm(f => ({ ...f, fecha_tecnomecanica: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line2)", fontSize: 13 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>Grupo</div>
              {/* Cambiar de grupo mueve la moto entre portafolios de socios — permiso aparte */}
              <select value={editForm.grupo ?? selectedMoto.grupo} onChange={e => setEditForm(f => ({ ...f, grupo: e.target.value as GrupoMoto }))}
                disabled={!puedeCambiarGrupo}
                title={!puedeCambiarGrupo ? "No tienes permiso para cambiar el grupo (mueve la moto entre portafolios de socios)" : ""}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line2)", fontSize: 13, opacity: puedeCambiarGrupo ? 1 : 0.6, cursor: puedeCambiarGrupo ? "pointer" : "not-allowed" }}>
                {(["COSTA","PRADERA","RASTREADOR","USADAS"] as GrupoMoto[]).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 3 }}>Observaciones</div>
              <textarea value={(editForm.observaciones as string) ?? ""} onChange={e => setEditForm(f => ({ ...f, observaciones: e.target.value }))}
                rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line2)", fontSize: 13, resize: "vertical" }} />
            </div>
            {editError && <div style={{ color: "var(--bad-ink)", fontSize: 12, padding: "6px 10px", background: "var(--bad-soft)", borderRadius: 8 }}>{editError}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditandoMoto(false)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--card)", cursor: "pointer", fontWeight: 700, color: "var(--muted)", fontSize: 13 }}>Cancelar</button>
              <button onClick={guardarEdicionMoto} disabled={editGuardando} style={{ flex: 2, padding: "9px", borderRadius: 8, border: "none", background: "var(--ink)", color: "var(--card)", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: editGuardando ? 0.7 : 1 }}>
                {editGuardando ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <InfoBox label="Ubicación" value={UBICACION_LABEL[(selectedMoto as any).ubicacion_fisica as UbicacionFisica] ?? "No registrada"} />
              <InfoBox label="SOAT vence" value={formatDate(selectedMoto.fecha_seguro)} />
              <InfoBox label="Tecnomecánica" value={formatDate(selectedMoto.fecha_tecnomecanica)} />
              {(selectedMoto as any).color && <InfoBox label="Color" value={(selectedMoto as any).color} />}
            </div>
            {selectedMoto.observaciones && <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 12px", background: "var(--soft2)", borderRadius: 10 }}>{selectedMoto.observaciones}</div>}
            <button onClick={abrirEdicion} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", color: "var(--muted2)", cursor: "pointer", fontWeight: 700, fontSize: 13, textAlign: "left" as const }}>✏️ Editar datos</button>
          </>
        )}
        {msgDetalle && !editandoMoto && <div style={{ padding: 10, borderRadius: 10, background: "var(--ok-soft)", color: "var(--ok)", fontSize: 13, fontWeight: 600 }}>{msgDetalle}</div>}
        {!editandoMoto && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setOpenUbicacion(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 12, padding: "8px 12px" }}>📍 Ubicación</button>
            <button onClick={() => { setOpenNovedad(true); setMsgDetalle(null); }} style={{ ...primaryBtn, fontSize: 12, padding: "8px 12px" }}>🏍️ Registrar novedad</button>
            {/* Liberar retención (Opción B): botón aparte, solo visible cuando la moto YA está retenida. */}
            {selectedMoto.estado === "Fiscalia" && (
              <button onClick={() => { setOpenLiberarFiscalia(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 12, padding: "8px 12px", color: "var(--ok-ink)" }}>✅ Salida Fiscalía</button>
            )}
            {["Transito","Garantia"].includes(selectedMoto.estado) && (
              <button onClick={handleLiberarRetencion} disabled={guardando} style={{ ...secondaryBtn, fontSize: 12, padding: "8px 12px", color: "var(--ok-ink)" }}>✅ Liberar retención</button>
            )}
          </div>
        )}
        {["Fiscalia","Transito","Garantia"].includes(selectedMoto.estado) && (
          <div style={{ background: "var(--warn-soft)", borderRadius: 10, padding: 10, border: "1px solid var(--warn-line)", fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: "var(--warn-ink2)", marginBottom: 4 }}>🚨 {ESTADO_LABEL[selectedMoto.estado]}</div>
            {selectedMoto.retencion_fecha && <div>Fecha: <strong>{selectedMoto.retencion_fecha}</strong></div>}
            {selectedMoto.retencion_numero_caso && <div>N° caso: <strong>{selectedMoto.retencion_numero_caso}</strong></div>}
            {selectedMoto.retencion_detalle && <div style={{ color: "var(--muted)", marginTop: 4 }}>{selectedMoto.retencion_detalle}</div>}
          </div>
        )}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 6 }}>Cambiar estado</div>
          <select value={selectedMoto.estado} onChange={(e) => cambiarEstadoMoto(selectedMoto.id, e.target.value as MotoStatus)} style={inputStyle}>
            <option value="Disponible">Disponible</option>
            <option value="Reservada">Reservada</option>
            <option value="Asignada">Asignada</option>
            <option value="Mantenimiento">En taller</option>
            <option value="Recuperada">Recuperada</option>
          </select>
        </div>
        {esAdminOSuperior && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", marginBottom: 6 }}>Sub-admin a cargo</div>
            <select
              value={selectedMoto.subadmin_id ?? ""}
              onChange={e => asignarSubadmin(selectedMoto.id, e.target.value || null)}
              style={inputStyle}
            >
              <option value="">— Sin asignar —</option>
              {subadmins.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        )}
        {historialDeMoto(selectedMoto.id).length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--muted2)" }}>Historial ubicaciones</div>
            {historialDeMoto(selectedMoto.id).slice(0, 3).map((h) => (
              <div key={h.id} style={{ fontSize: 12, padding: "5px 8px", borderRadius: 6, background: "var(--soft2)", marginBottom: 3, color: "var(--muted3)" }}>
                <strong>{UBICACION_LABEL[h.ubicacion_nueva as UbicacionFisica] ?? h.ubicacion_nueva}</strong>
                <span style={{ color: "var(--faint)", marginLeft: 6 }}>{new Date(h.created_at).toLocaleDateString("es-CO")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {!isMobile && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, margin: 0 }}>Motos</h2>
            <p style={{ marginTop: 4, color: "var(--muted)", fontSize: 13, margin: "4px 0 0" }}>Flota en tiempo real</p>
          </div>
        </div>
      )}
      {error && <div style={{ marginBottom: 12, color: "var(--bad-ink)" }}>Error: {error}</div>}

      {/* Móvil: lista → detalle (nunca juntos) */}
      {isMobile ? (
        selectedId && selectedMoto ? (
          <div>
            <button onClick={() => { setSelectedId(null); setEditandoMoto(false); setMsgDetalle(null); }}
              style={{ border: "none", background: "none", color: "var(--accent)", fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "0 0 12px 0" }}>
              ← Volver a la lista
            </button>
            <div style={card}>{DetallePanel()}</div>
          </div>
        ) : (
          <div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por placa, modelo, grupo..." style={{ ...inputStyle, marginBottom: 12 }} />
            <ChipsGrupo />
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>No hay motos.</div>}
            <div ref={listWrapRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((moto) => {
                const sc = getStatusColors(moto.estado);
                return (
                  <div key={moto.id} onClick={() => setSelectedId(moto.id)}
                    style={{ background: "var(--card)", borderRadius: 12, padding: "9px 12px", boxShadow: "0 1px 4px rgba(15,23,42,0.06)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: "1px solid var(--line)" }}>
                    <Placa placa={moto.placa} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{moto.marca} {moto.modelo} · {moto.grupo}</div>
                      {esAdminOSuperior && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAsignarMotoId(moto.id); }}
                          style={{
                            marginTop: 4, padding: "2px 9px", borderRadius: 999, border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 700, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            background: moto.subadmin_id ? "var(--indigo-soft)" : "var(--soft)",
                            color: moto.subadmin_id ? "var(--indigo-ink)" : "var(--faint)",
                            textTransform: moto.subadmin_id ? "uppercase" : "none",
                          }}
                        >
                          👤 {moto.subadmin_id ? nombreSubadmin(moto.subadmin_id) : "Sin asignar"}
                        </button>
                      )}
                    </div>
                    <span style={{ padding: "4px 9px", borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {ESTADO_LABEL[moto.estado]}
                    </span>
                    <span style={{ color: "var(--line2)" }}>›</span>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Desktop: 2 columnas flex */
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ ...card, flex: "1 1 0", minWidth: 0 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por placa, modelo, grupo..." style={{ ...inputStyle, marginBottom: 14 }} />
            <ChipsGrupo />
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>No hay motos.</div>}
            <div ref={listWrapRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((moto) => {
                const sc = getStatusColors(moto.estado);
                const sel = selectedId === moto.id;
                return (
                  <div key={moto.id} onClick={() => setSelectedId(moto.id)}
                    style={{ borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", border: sel ? "1.5px solid var(--accent)" : "1px solid var(--line)", background: sel ? "var(--accent-soft2)" : "var(--card)" }}>
                    <Placa placa={moto.placa} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{moto.marca} {moto.modelo} · {moto.grupo}</div>
                      {esAdminOSuperior && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setAsignarMotoId(moto.id); }}
                          style={{
                            marginTop: 4, padding: "2px 9px", borderRadius: 999, border: "none", cursor: "pointer",
                            fontSize: 11, fontWeight: 700, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            background: moto.subadmin_id ? "var(--indigo-soft)" : "var(--soft)",
                            color: moto.subadmin_id ? "var(--indigo-ink)" : "var(--faint)",
                            textTransform: moto.subadmin_id ? "uppercase" : "none",
                          }}
                        >
                          👤 {moto.subadmin_id ? nombreSubadmin(moto.subadmin_id) : "Sin asignar"}
                        </button>
                      )}
                    </div>
                    <span style={{ padding: "3px 8px", borderRadius: 999, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                      {ESTADO_LABEL[moto.estado]}
                    </span>
                    {onNavigate && (
                      <button onClick={(e) => { e.stopPropagation(); onNavigate("ficha_moto", moto.id); }}
                        style={{ border: "none", background: "var(--soft)", color: "var(--accent)", borderRadius: 6, padding: "3px 8px", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Ficha
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ ...card, flex: "0 0 340px", minWidth: 0 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 17 }}>Detalle de moto</h3>
            {DetallePanel()}
          </div>
        </div>
      )}

      {/* FAB — Registrar moto */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: isMobile ? 80 : 28,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent) 0%, var(--ok2) 100%)",
          color: "var(--card)",
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
        title="Registrar moto"
      >
        +
      </button>

      {/* Modal cambiar ubicación */}
      {openUbicacion && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }} onClick={() => setOpenUbicacion(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "var(--card)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px" }}>Cambiar ubicación física</h3>
            <Field label="Nueva ubicación">
              <select style={inputStyle} value={formUbic.ubicacion_nueva} onChange={(e) => setFormUbic((p) => ({ ...p, ubicacion_nueva: e.target.value as UbicacionFisica }))}>
                {(Object.entries(UBICACION_LABEL) as [UbicacionFisica, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <div style={{ marginTop: 12 }}>
              <Field label="Detalle / dirección"><input style={inputStyle} placeholder="Ej: Bodega principal calle 12" value={formUbic.detalle} onChange={(e) => setFormUbic((p) => ({ ...p, detalle: e.target.value }))} /></Field>
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="Motivo del cambio"><input style={inputStyle} placeholder="Ej: Entrega voluntaria por el cliente" value={formUbic.motivo} onChange={(e) => setFormUbic((p) => ({ ...p, motivo: e.target.value }))} /></Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenUbicacion(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleCambiarUbicacion} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Actualizar ubicación"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal recepción de vehículo */}
      {openRecepcion && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }} onClick={() => setOpenRecepcion(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "var(--card)", borderRadius: 16, padding: 24, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px" }}>Formulario de recepción — {selectedMoto.placa}</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Motivo de ingreso">
                <select style={inputStyle} value={formRec.motivo} onChange={(e) => setFormRec((p) => ({ ...p, motivo: e.target.value as MotivoRecepcion }))}>
                  <option value="nuevo_registro">Nuevo registro de moto</option>
                  <option value="retencion_mora">Retención por mora</option>
                  <option value="entrega_voluntaria">Entrega voluntaria del cliente</option>
                  <option value="liquidacion">Liquidación de contrato</option>
                  <option value="otro">Otro motivo</option>
                </select>
              </Field>

              {/* Entrega voluntaria con contrato activo: suspende el contrato. El costo de
                  $20.000 solo aplica si hubo que ir a buscarla (no si la trajo el cliente). */}
              {formRec.motivo === "entrega_voluntaria" && contratos.some(c => c.moto_id === selectedMoto.id && c.estado === "Activo") && (
                <div style={{ background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-ink)", marginBottom: 4 }}>
                    Esto suspenderá el contrato de {clientes.find(cl => cl.id === contratos.find(c => c.moto_id === selectedMoto.id && c.estado === "Activo")?.cliente_id)?.nombre ?? "el cliente"}.
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 10 }}>¿Cómo llegó la moto?</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {([[false, "🙋 La trajo el cliente", "Sin costo"], [true, "🚚 Se fue a buscar", "+ $20.000 por movimiento de personal"]] as [boolean, string, string][]).map(([val, label, sub]) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setRecFueBuscada(val)}
                        style={{
                          textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                          border: recFueBuscada === val ? "2px solid var(--accent)" : "1px solid var(--line2)",
                          background: recFueBuscada === val ? "var(--accent-soft)" : "var(--card)",
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{label}</div>
                        <div style={{ fontSize: 12, color: recFueBuscada === val ? "var(--accent-ink)" : "var(--muted)" }}>{sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Field label="Condición general">
                <select style={inputStyle} value={formRec.condicion_general} onChange={(e) => setFormRec((p) => ({ ...p, condicion_general: e.target.value as CondicionVehiculo }))}>
                  <option value="buena">Buena</option>
                  <option value="regular">Regular</option>
                  <option value="mala">Mala</option>
                </select>
              </Field>
              <Field label="Descripción de daños visibles"><textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} placeholder="Describe los daños si aplica..." value={formRec.descripcion_danos} onChange={(e) => setFormRec((p) => ({ ...p, descripcion_danos: e.target.value }))} /></Field>
              <Field label="Kilómetros actuales"><input type="number" style={inputStyle} placeholder="Ej: 12500" value={formRec.kilometros} onChange={(e) => setFormRec((p) => ({ ...p, kilometros: e.target.value }))} /></Field>
              <Field label="Ubicación donde queda almacenada">
                <select style={inputStyle} value={formRec.ubicacion_destino} onChange={(e) => setFormRec((p) => ({ ...p, ubicacion_destino: e.target.value as UbicacionFisica }))}>
                  {(Object.entries(UBICACION_LABEL) as [UbicacionFisica, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Nombre de quien entrega"><input style={inputStyle} placeholder="Nombre del cliente o funcionario" value={formRec.nombre_entrega} onChange={(e) => setFormRec((p) => ({ ...p, nombre_entrega: e.target.value }))} /></Field>
              <Field label="Observaciones adicionales"><textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={formRec.observaciones} onChange={(e) => setFormRec((p) => ({ ...p, observaciones: e.target.value }))} /></Field>
              <Field label="Fotos del estado del vehículo (6 obligatorias — la última con la persona)">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                  {ANGULOS_FOTO.map(({ key, label }) => {
                    const dataUrl = fotosRec[key];
                    return (
                      <div key={key} style={{ borderRadius: 12, border: `1px solid ${dataUrl ? "var(--ok-line)" : "var(--line)"}`, background: dataUrl ? "var(--ok-soft)" : "var(--soft2)", padding: 8, textAlign: "center" }}>
                        {dataUrl ? (
                          <div style={{ position: "relative" }}>
                            <img src={dataUrl} alt={label} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8 }} />
                            <button type="button" onClick={() => setFotosRec(p => { const n = { ...p }; delete n[key]; return n; })} style={{
                              position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
                              background: "var(--bad)", border: "none", color: "var(--card)", fontSize: 10, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                            <IconoAngulo angulo={key} />
                          </div>
                        )}
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", marginTop: 4, marginBottom: 6 }}>{label}</div>
                        {!dataUrl && (
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "var(--accent)" }} title="Cámara">
                              📷
                              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setFotosRec(p => ({ ...p, [key]: ev.target?.result as string }));
                                  reader.readAsDataURL(file);
                                  e.target.value = "";
                                }} />
                            </label>
                            <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "var(--accent-soft)" }} title="Galería">
                              🖼
                              <input type="file" accept="image/*" style={{ display: "none" }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setFotosRec(p => ({ ...p, [key]: ev.target?.result as string }));
                                  reader.readAsDataURL(file);
                                  e.target.value = "";
                                }} />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Field>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => { setOpenRecepcion(false); setFotosRec({}); }} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleRegistrarRecepcion} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Registrar recepción"}</button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "var(--card)", borderRadius: 16, padding: 24, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Registrar nueva moto</h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <Field label="Placa"><input style={inputStyle} value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value.toUpperCase() }))} /></Field>
              <Field label="Condición de ingreso">
                <select style={inputStyle} value={form.condicion_ingreso} onChange={(e) => setForm((p) => ({ ...p, condicion_ingreso: e.target.value as CondicionIngreso }))}>
                  <option value="nueva">Nueva — compra directa</option>
                  <option value="usada">Usada — ya fue asignada anteriormente</option>
                </select>
              </Field>
              <Field label="Grupo operativo">
                <select style={inputStyle} value={form.grupo} onChange={(e) => setForm((p) => ({ ...p, grupo: e.target.value as GrupoMoto }))}>
                  <option value="COSTA">Club Moteros Costa</option>
                  <option value="PRADERA">Club Moteros Pradera</option>
                  <option value="RASTREADOR">Club Moteros Rastreador</option>
                  <option value="USADAS">Usadas Club</option>
                </select>
              </Field>
              <Field label="Marca"><input style={inputStyle} value={form.marca} onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value.toUpperCase() }))} /></Field>
              <Field label="Modelo (año)"><input style={inputStyle} value={form.modelo} onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value.toUpperCase() }))} /></Field>
              <Field label="Color"><input style={inputStyle} value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value.toUpperCase() }))} placeholder="Ej. Rojo, Negro mate" /></Field>
              <Field label="Cilindraje"><input style={inputStyle} value={form.cilindraje} onChange={(e) => setForm((p) => ({ ...p, cilindraje: e.target.value.toUpperCase() }))} placeholder="Ej. 125cc" /></Field>
              <Field label="N° Motor"><input style={inputStyle} value={form.numero_motor} onChange={(e) => setForm((p) => ({ ...p, numero_motor: e.target.value.toUpperCase() }))} /></Field>
              <Field label="N° Chasis"><input style={inputStyle} value={form.numero_chasis} onChange={(e) => setForm((p) => ({ ...p, numero_chasis: e.target.value.toUpperCase() }))} /></Field>
              <Field label="Propietario"><input style={inputStyle} value={form.propietario} onChange={(e) => setForm((p) => ({ ...p, propietario: e.target.value }))} placeholder="Nombre del propietario legal" /></Field>
              <Field label="Vencimiento SOAT"><input type="date" style={inputStyle} value={form.fecha_seguro} onChange={(e) => setForm((p) => ({ ...p, fecha_seguro: e.target.value }))} /></Field>
              <Field label="Vencimiento tecnomecánica"><input type="date" style={inputStyle} value={form.fecha_tecnomecanica} onChange={(e) => setForm((p) => ({ ...p, fecha_tecnomecanica: e.target.value }))} /></Field>
              <Field label="Observaciones"><input style={inputStyle} value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} /></Field>
            </div>

            {formError && <div style={{ marginTop: 12, color: "var(--bad-ink)", fontWeight: 600 }}>{formError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Guardar moto"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Retención ── */}
      {openRetencion && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px" }}>Registrar retención — {selectedMoto.placa}</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Tipo de retención">
                <select style={inputStyle} value={formRetencion.tipo} onChange={e => setFormRetencion(p => ({ ...p, tipo: e.target.value as any }))}>
                  <option value="Fiscalia">Fiscalía — retenida por autoridad judicial</option>
                  <option value="Transito">Tránsito — retenida por autoridad de tránsito</option>
                  <option value="Garantia">Garantía — falla cubierta por garantía del vehículo</option>
                </select>
              </Field>
              <Field label="Fecha de retención">
                <input type="date" style={inputStyle} value={formRetencion.fecha} onChange={e => setFormRetencion(p => ({ ...p, fecha: e.target.value }))} />
              </Field>
              {formRetencion.tipo !== "Garantia" && (
                <Field label="N° caso / expediente">
                  <input style={inputStyle} value={formRetencion.numero_caso} onChange={e => setFormRetencion(p => ({ ...p, numero_caso: e.target.value }))} placeholder="Opcional" />
                </Field>
              )}
              <Field label="Detalle / Motivo">
                <input style={inputStyle} value={formRetencion.detalle} onChange={e => setFormRetencion(p => ({ ...p, detalle: e.target.value }))} placeholder="Descripción..." />
              </Field>
              {formRetencion.tipo === "Fiscalia" && (
                <div style={{ padding: "8px 12px", background: "var(--warn-soft)", borderRadius: 10, fontSize: 13, color: "var(--warn-ink2)" }}>
                  Tarifa se congela. Al recuperar la moto se registra la salida y entra a taller automáticamente.
                </div>
              )}
              {formRetencion.tipo === "Garantia" && (
                <div style={{ padding: "8px 12px", background: "#f3e8ff", borderRadius: 10, fontSize: 13, color: "#6b21a8" }}>
                  El tiempo que la moto esté en garantía se le cobra al cliente (o se rueda al final), igual que Fiscalía/Tránsito — lo decide el admin al liberarla.
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenRetencion(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleRegistrarRetencion} disabled={guardando} style={{ ...primaryBtn, background: "var(--warn-ink)" }}>
                {guardando ? "Guardando..." : "Registrar retención"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Salida de Fiscalía ── */}
      {openLiberarFiscalia && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 420 }}>
            <h3 style={{ margin: "0 0 8px" }}>Registrar salida de Fiscalía</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>
              La moto {selectedMoto.placa} sale de Fiscalía y queda en poder de la empresa. Pasará a taller automáticamente para revisión antes de operar.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Ubicación física donde queda la moto">
                <select style={inputStyle} value={ubicacionSalidaFiscalia} onChange={e => setUbicacionSalidaFiscalia(e.target.value as UbicacionFisica)}>
                  {Object.entries(UBICACION_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
              <div style={{ padding: "8px 12px", background: "var(--ok-soft)", borderRadius: 10, fontSize: 13, color: "var(--ok-ink)" }}>
                Estado → <strong>En taller</strong>. Debe pasar revisión antes de volver a operar.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenLiberarFiscalia(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleLiberarFiscalia} disabled={guardando} style={{ ...primaryBtn, background: "var(--ok-ink)" }}>
                {guardando ? "Registrando..." : "Confirmar salida"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tiempoFueraModal && (
        <ModalResolverTiempoFueraServicio
          contrato={tiempoFueraModal.contrato}
          clienteNombre={tiempoFueraModal.clienteNombre}
          motoPlaca={tiempoFueraModal.motoPlaca}
          motivo={tiempoFueraModal.motivo}
          fechaEntrada={tiempoFueraModal.fechaEntrada}
          fechaSalida={tiempoFueraModal.fechaSalida}
          onClose={() => setTiempoFueraModal(null)}
        />
      )}

      {/* ── Hoja rápida: asignar sub-admin a una moto (un toque, solo ADMIN/AP) ── */}
      {asignarMotoId && (() => {
        const motoAsig = motos.find(m => m.id === asignarMotoId);
        if (!motoAsig) return null;
        const elegir = (subId: string | null) => {
          const sp = getScrollParent(listWrapRef.current);
          savedScroll.current = sp ? sp.scrollTop : null;
          asignarSubadmin(motoAsig.id, subId);
          setAsignarMotoId(null);
        };
        return (
          <div
            onClick={() => setAsignarMotoId(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          >
            <div onClick={e => e.stopPropagation()} style={{ background: "var(--card)", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 480, maxHeight: "70vh", overflowY: "auto", padding: 20, boxShadow: "0 -8px 30px rgba(15,23,42,0.2)", animation: "mgSheetUp .22s var(--ease)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Asignar encargado</div>
                <button onClick={() => setAsignarMotoId(null)} style={{ border: "none", background: "var(--soft)", borderRadius: 999, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 15, color: "var(--muted2)" }}>✕</button>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Moto <b style={{ color: "var(--text)" }}>{motoAsig.placa}</b> · toca un sub-admin</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => elegir(null)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${!motoAsig.subadmin_id ? "var(--warn-strong)" : "var(--line)"}`, background: !motoAsig.subadmin_id ? "var(--warn-soft2)" : "var(--card)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--warn-ink)", textAlign: "left" }}
                >
                  🚫 Sin asignar {!motoAsig.subadmin_id && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--warn-strong)" }}>● actual</span>}
                </button>
                {subadmins.map(s => {
                  const actual = motoAsig.subadmin_id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => elegir(s.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${actual ? "var(--accent)" : "var(--line)"}`, background: actual ? "var(--accent-soft2)" : "var(--card)", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text)", textAlign: "left", textTransform: "uppercase" }}
                    >
                      👤 {s.nombre} {actual && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--accent)", textTransform: "none" }}>● actual</span>}
                    </button>
                  );
                })}
                {subadmins.length === 0 && <div style={{ fontSize: 13, color: "var(--faint)", padding: 8 }}>No hay sub-admins registrados.</div>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Router "Registrar novedad": una sola puerta que enruta al flujo correcto ── */}
      {openNovedad && selectedMoto && (() => {
        const yaRetenida = ["Fiscalia","Transito","Garantia"].includes(selectedMoto.estado);
        const contratoActivo = contratoMoto?.estado === "Activo";
        const opciones: { icono: string; titulo: string; desc: string; enabled: boolean; motivoOff?: string; onClick: () => void }[] = [
          {
            icono: "🚚", titulo: "Recolección por mora", enabled: puedeRecolectar && !!contratoActivo && contratoMotoEnMora,
            desc: "El cliente no pagó. Suspende el contrato, crea la multa de $20.000 y pide 6 fotos.",
            motivoOff: !puedeRecolectar ? "No tienes permiso para recolectar motos" : !contratoActivo ? "La moto no tiene un contrato activo" : "El contrato no está en mora",
            onClick: () => { setRecoleccionMoto(selectedMoto); setOpenNovedad(false); },
          },
          {
            icono: "🤝", titulo: "Entrega voluntaria del cliente", enabled: !!contratoActivo,
            desc: "El cliente trae/entrega la moto por un tiempo. Suspende el contrato (costo solo si se fue a buscar).",
            motivoOff: "La moto no tiene un contrato activo",
            onClick: () => { setFormRec(f => ({ ...f, motivo: "entrega_voluntaria" })); setRecFueBuscada(false); setFotosRec({}); setOpenRecepcion(true); setOpenNovedad(false); },
          },
          {
            icono: "⚖️", titulo: "Retención legal (Fiscalía / Tránsito / Garantía)", enabled: puedeRecolectar && !yaRetenida,
            desc: "La moto queda retenida por un tercero. El tiempo parado se le cobra al cliente (o se rueda), igual para los 3.",
            motivoOff: !puedeRecolectar ? "No tienes permiso para retener motos" : "La moto ya está retenida",
            onClick: () => { setOpenRetencion(true); setOpenNovedad(false); },
          },
          {
            icono: "📄", titulo: "Liquidar / cerrar contrato", enabled: puedeLiquidar && !!contratoMoto,
            desc: "Cierre definitivo: revisión de taller, saldo final y documento. Sin bloqueo de 7 días.",
            motivoOff: !puedeLiquidar ? "No tienes permiso para iniciar liquidaciones" : "La moto no tiene un contrato para cerrar",
            onClick: () => { setLiquidacionMoto(selectedMoto); setOpenNovedad(false); },
          },
          {
            icono: "📋", titulo: "Solo recepción / registro", enabled: true,
            desc: "Registrar el estado de la moto o moverla (sin contrato, o cambio de bodega/taller).",
            onClick: () => { setFormRec(f => ({ ...f, motivo: "nuevo_registro" })); setRecFueBuscada(false); setFotosRec({}); setOpenRecepcion(true); setOpenNovedad(false); },
          },
        ];
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }} onClick={() => setOpenNovedad(false)}>
            <div onClick={e => e.stopPropagation()} style={{ ...card, width: "min(480px, 96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto", display: "grid", gap: 10, boxSizing: "border-box" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>🏍️ Registrar novedad</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{selectedMoto.placa}{clienteMoto ? ` · ${clienteMoto.nombre}` : ""}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted2)" }}>¿Qué pasó con la moto? Elige la situación:</div>
              {opciones.map((o, i) => (
                <button
                  key={i}
                  onClick={o.enabled ? o.onClick : undefined}
                  disabled={!o.enabled}
                  title={o.enabled ? "" : o.motivoOff}
                  style={{
                    textAlign: "left", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px",
                    background: o.enabled ? "var(--card)" : "var(--soft2)", cursor: o.enabled ? "pointer" : "not-allowed",
                    opacity: o.enabled ? 1 : 0.55, display: "flex", gap: 12, alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{o.icono}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{o.titulo}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{o.desc}</span>
                    {!o.enabled && o.motivoOff && <span style={{ display: "block", fontSize: 11, color: "var(--warn-ink)", marginTop: 3, fontWeight: 700 }}>No disponible: {o.motivoOff}</span>}
                  </span>
                </button>
              ))}
              <button onClick={() => setOpenNovedad(false)} style={{ ...secondaryBtn, marginTop: 2 }}>Cancelar</button>
            </div>
          </div>
        );
      })()}

      {/* Recolección por mora → flujo completo (suspende + multa + gestión + 6 fotos) */}
      {recoleccionMoto && contratoMoto && clienteMoto && (
        <ModalRecoleccion
          contratoId={contratoMoto.id}
          clienteId={clienteMoto.id}
          clienteNombre={clienteMoto.nombre}
          motoId={recoleccionMoto.id}
          placa={recoleccionMoto.placa}
          onClose={() => setRecoleccionMoto(null)}
          onDone={() => setMsgDetalle("Recolección registrada — contrato suspendido y multa creada.")}
        />
      )}

      {/* Liquidar / cerrar contrato */}
      {liquidacionMoto && contratoMoto && clienteMoto && (
        <ModalIniciarLiquidacion
          contratoId={contratoMoto.id}
          clienteId={clienteMoto.id}
          clienteNombre={clienteMoto.nombre}
          motoId={liquidacionMoto.id}
          placa={liquidacionMoto.placa}
          ahorroAcumulado={contratoMoto.ahorro_acumulado ?? 0}
          onClose={() => setLiquidacionMoto(null)}
          onDone={() => setMsgDetalle("Liquidación iniciada — revisa el módulo de Liquidaciones.")}
        />
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--soft2)", borderRadius: 16, padding: 14 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div style={labelStyle}>{label}</div>{children}</div>;
}

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "var(--card)", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--line2)", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer", color: "var(--muted2)" };
