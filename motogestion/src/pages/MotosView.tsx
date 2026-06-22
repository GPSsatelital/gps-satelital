import React, { useMemo, useState } from "react";
import { useMotos, type GrupoMoto, type Moto, type MotoStatus, type CondicionIngreso, type RetencionData } from "../hooks/useMotos";
import { useUbicaciones, UBICACION_LABEL, type UbicacionFisica, type MotivoRecepcion, type CondicionVehiculo } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";

function getStatusColors(status: MotoStatus) {
  switch (status) {
    case "Disponible":    return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    case "Reservada":     return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    case "Asignada":      return { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
    case "Mantenimiento": return { bg: "#ffe4e6", color: "#be123c", border: "#fda4af" };
    case "Recuperada":    return { bg: "#e2e8f0", color: "#334155", border: "#cbd5e1" };
    case "Fiscalia":      return { bg: "#fef9c3", color: "#713f12", border: "#fde047" };
    case "Transito":      return { bg: "#ffedd5", color: "#9a3412", border: "#fdba74" };
    case "Garantia":      return { bg: "#f3e8ff", color: "#6b21a8", border: "#d8b4fe" };
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

const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 10px", fontSize: 13, color: "#475569", borderBottom: "1px solid #e2e8f0" };
const tdStyle: React.CSSProperties = { padding: "12px 10px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #f1f5f9" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };

export default function MotosView() {
  const { profile } = useAuth();
  const { motos, loading, error, crearMoto, cambiarEstadoMoto, registrarRetencion, liberarRetencion } = useMotos();
  const { cambiarUbicacion, registrarRecepcion, historialDeMoto, recepcionesDeMoto } = useUbicaciones();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [openRecepcion, setOpenRecepcion] = useState(false);
  const [openUbicacion, setOpenUbicacion] = useState(false);
  const [openRetencion, setOpenRetencion] = useState(false);
  const [openLiberarFiscalia, setOpenLiberarFiscalia] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [msgDetalle, setMsgDetalle] = useState<string | null>(null);

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

  const [formUbic, setFormUbic] = useState({
    ubicacion_nueva: "bodega" as UbicacionFisica,
    detalle: "",
    motivo: "",
  });

  const [form, setForm] = useState({
    placa: "",
    grupo: "CLUB" as GrupoMoto,
    marca: "",
    modelo: "",
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

  const filtered = useMemo(
    () =>
      motos.filter((m) =>
        [m.placa, m.marca, m.modelo, m.grupo].join(" ").toLowerCase().includes(query.toLowerCase())
      ),
    [motos, query]
  );

  const selectedMoto: Moto | null = motos.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  async function handleRegistrarRecepcion() {
    if (!selectedMoto || !profile) return;
    setGuardando(true);
    const { error } = await registrarRecepcion({
      moto_id: selectedMoto.id,
      motivo: formRec.motivo,
      condicion_general: formRec.condicion_general,
      descripcion_danos: formRec.descripcion_danos || undefined,
      kilometros: formRec.kilometros ? Number(formRec.kilometros) : undefined,
      ubicacion_destino: formRec.ubicacion_destino,
      quien_recibe: profile.id,
      nombre_entrega: formRec.nombre_entrega || undefined,
      observaciones: formRec.observaciones || undefined,
      ubicacion_anterior: (selectedMoto as any).ubicacion_fisica ?? undefined,
    });
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    setMsgDetalle("Recepción registrada.");
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
    setGuardando(true);
    // 1. Registrar cambio de ubicación al lugar físico elegido
    await cambiarUbicacion(selectedMoto.id, "fiscalia" as UbicacionFisica, ubicacionSalidaFiscalia, "", "Salida de Fiscalía — ingresa a revisión de taller", profile.id);
    // 2. Marcar moto como En taller (Mantenimiento) y limpiar retención
    const { error } = await cambiarEstadoMoto(selectedMoto.id, "Mantenimiento");
    await liberarRetencion(selectedMoto.id);
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
    setMsgDetalle("Moto liberada de Fiscalía. Pasa a taller para revisión antes de operar.");
    setOpenLiberarFiscalia(false);
  }

  async function handleLiberarRetencion() {
    if (!selectedMoto) return;
    setGuardando(true);
    const { error } = await liberarRetencion(selectedMoto.id);
    setGuardando(false);
    if (error) { setMsgDetalle(error); return; }
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
      retencion_fecha: null,
      retencion_numero_caso: null,
      retencion_fecha_salida: null,
      retencion_detalle: null,
    });

    setGuardando(false);

    if (error) {
      setFormError(error.includes("duplicate") ? "Ya existe una moto con esa placa." : error);
      return;
    }

    setForm({
      placa: "", grupo: "RASTREADOR" as const, marca: "", modelo: "", numero_motor: "", numero_chasis: "",
      lugar_matricula: "", cilindraje: "", fecha_seguro: "", fecha_tecnomecanica: "",
      propietario: "", numero_serie: "", estado: "Disponible" as const, observaciones: "", condicion_ingreso: "nueva" as const,
    });
    setOpen(false);
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando motos...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Módulo de Motos</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Conectado en tiempo real a la base de datos.</p>
        </div>
        <button onClick={() => setOpen(true)} style={primaryBtn}>+ Registrar moto</button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error cargando motos: {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.9fr)", gap: 20, marginTop: 24 }}>
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por placa o modelo" style={inputStyle} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Placa</th>
                  <th style={thStyle}>Grupo</th>
                  <th style={thStyle}>Moto</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((moto) => (
                  <tr key={moto.id} style={{ background: selectedId === moto.id ? "#eff6ff" : "white" }}>
                    <td style={tdStyle}>{moto.placa}</td>
                    <td style={tdStyle}>{moto.grupo}</td>
                    <td style={tdStyle}>{moto.marca} {moto.modelo}</td>
                    <td style={tdStyle}><StatusBadge status={moto.estado} /></td>
                    <td style={tdStyle}>
                      <button onClick={() => setSelectedId(moto.id)} style={{ border: "none", background: "transparent", color: "#0284c7", fontWeight: 700, cursor: "pointer" }}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#64748b" }}>No hay motos registradas todavía.</div>}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Detalle de moto</h3>

          {selectedMoto ? (
            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <InfoBox label="Placa" value={selectedMoto.placa} />
              <InfoBox label="Grupo" value={selectedMoto.grupo} />
              <InfoBox label="Marca" value={selectedMoto.marca} />
              <InfoBox label="Modelo" value={selectedMoto.modelo} />
              <InfoBox label="Ubicación física" value={UBICACION_LABEL[(selectedMoto as any).ubicacion_fisica as UbicacionFisica] ?? "No registrada"} />
              <InfoBox label="Vence seguro" value={formatDate(selectedMoto.fecha_seguro)} />
              <InfoBox label="Vence tecnomecánica" value={formatDate(selectedMoto.fecha_tecnomecanica)} />
              <InfoBox label="Observaciones" value={selectedMoto.observaciones || "Sin observaciones"} />

              {msgDetalle && <div style={{ padding: 10, borderRadius: 10, background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 600 }}>{msgDetalle}</div>}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => { setOpenUbicacion(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 13 }}>📍 Cambiar ubicación</button>
                <button onClick={() => { setOpenRecepcion(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 13 }}>📋 Registrar recepción</button>
                {selectedMoto.estado === "Fiscalia"
                  ? <button onClick={() => { setOpenLiberarFiscalia(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 13, color: "#166534" }}>✅ Registrar salida de Fiscalía</button>
                  : ["Transito","Garantia"].includes(selectedMoto.estado)
                    ? <button onClick={handleLiberarRetencion} disabled={guardando} style={{ ...secondaryBtn, fontSize: 13, color: "#166534" }}>✅ Liberar retención</button>
                    : <button onClick={() => { setOpenRetencion(true); setMsgDetalle(null); }} style={{ ...secondaryBtn, fontSize: 13, color: "#92400e" }}>🚨 Registrar retención</button>
                }
              </div>

              {/* Datos de retención activa */}
              {["Fiscalia","Transito","Garantia"].includes(selectedMoto.estado) && (
                <div style={{ background: "#fef9c3", borderRadius: 12, padding: 12, border: "1px solid #fde047" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#713f12", marginBottom: 6 }}>
                    🚨 Moto en {ESTADO_LABEL[selectedMoto.estado]}
                  </div>
                  {selectedMoto.retencion_fecha && <div style={{ fontSize: 13 }}>Fecha retención: <strong>{selectedMoto.retencion_fecha}</strong></div>}
                  {selectedMoto.retencion_numero_caso && <div style={{ fontSize: 13 }}>N° caso: <strong>{selectedMoto.retencion_numero_caso}</strong></div>}
                  {selectedMoto.retencion_detalle && <div style={{ fontSize: 13, marginTop: 4, color: "#64748b" }}>{selectedMoto.retencion_detalle}</div>}
                  {selectedMoto.estado === "Fiscalia" && (
                    <div style={{ fontSize: 12, marginTop: 6, color: "#92400e", fontWeight: 600 }}>
                      Sale cuando la empresa la reciba físicamente. Al registrar salida pasa a taller automáticamente.
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={labelStyle}>Cambiar estado</div>
                <select
                  value={selectedMoto.estado}
                  onChange={(e) => cambiarEstadoMoto(selectedMoto.id, e.target.value as MotoStatus)}
                  style={inputStyle}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Asignada">Asignada</option>
                  <option value="Mantenimiento">En taller</option>
                  <option value="Recuperada">Recuperada</option>
                </select>
              </div>

              {/* Historial de ubicaciones */}
              {historialDeMoto(selectedMoto.id).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#334155" }}>Historial de ubicaciones</div>
                  {historialDeMoto(selectedMoto.id).slice(0, 5).map((h) => (
                    <div key={h.id} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, background: "#f8fafc", marginBottom: 4, color: "#475569" }}>
                      <span style={{ fontWeight: 600 }}>{UBICACION_LABEL[h.ubicacion_nueva as UbicacionFisica] ?? h.ubicacion_nueva}</span>
                      {h.ubicacion_anterior && <span> ← {UBICACION_LABEL[h.ubicacion_anterior as UbicacionFisica] ?? h.ubicacion_anterior}</span>}
                      <span style={{ color: "#94a3b8", marginLeft: 6 }}>{new Date(h.created_at).toLocaleDateString("es-CO")}</span>
                      {h.motivo && <div style={{ color: "#64748b" }}>{h.motivo}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Recepciones */}
              {recepcionesDeMoto(selectedMoto.id).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#334155" }}>Recepciones registradas</div>
                  {recepcionesDeMoto(selectedMoto.id).slice(0, 3).map((r) => (
                    <div key={r.id} style={{ fontSize: 12, padding: "8px 10px", borderRadius: 8, background: "#f8fafc", marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{new Date(r.created_at).toLocaleDateString("es-CO")} · {r.condicion_general}</div>
                      {r.descripcion_danos && <div style={{ color: "#dc2626" }}>{r.descripcion_danos}</div>}
                      {r.kilometros && <div style={{ color: "#64748b" }}>Km: {r.kilometros.toLocaleString("es-CO")}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 16, color: "#64748b" }}>Selecciona una moto para ver su detalle.</div>
          )}
        </div>
      </div>

      {/* Modal cambiar ubicación */}
      {openUbicacion && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpenUbicacion(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: "white", borderRadius: 16, padding: 24 }}>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpenRecepcion(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
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
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenRecepcion(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleRegistrarRecepcion} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Registrar recepción"}</button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Registrar nueva moto</h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <Field label="Placa"><input style={inputStyle} value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))} /></Field>
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
                  <option value="OTRO">Otro</option>
                </select>
              </Field>
              <Field label="Marca"><input style={inputStyle} value={form.marca} onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))} /></Field>
              <Field label="Modelo"><input style={inputStyle} value={form.modelo} onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))} /></Field>
              <Field label="Vencimiento seguro"><input type="date" style={inputStyle} value={form.fecha_seguro} onChange={(e) => setForm((p) => ({ ...p, fecha_seguro: e.target.value }))} /></Field>
              <Field label="Vencimiento tecnomecánica"><input type="date" style={inputStyle} value={form.fecha_tecnomecanica} onChange={(e) => setForm((p) => ({ ...p, fecha_tecnomecanica: e.target.value }))} /></Field>
              <Field label="Observaciones"><input style={inputStyle} value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} /></Field>
            </div>

            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}

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
          <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px" }}>Registrar retención — {selectedMoto.placa}</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="Tipo de retención">
                <select style={inputStyle} value={formRetencion.tipo} onChange={e => setFormRetencion(p => ({ ...p, tipo: e.target.value as any }))}>
                  <option value="Fiscalia">Fiscalía — retenida por autoridad judicial</option>
                  <option value="Transito">Tránsito — retenida por autoridad de tránsito</option>
                  <option value="Garantia">Garantía — defecto cubierto por empresa/fabricante</option>
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
                <div style={{ padding: "8px 12px", background: "#fef9c3", borderRadius: 10, fontSize: 13, color: "#713f12" }}>
                  Tarifa se congela. Al recuperar la moto se registra la salida y entra a taller automáticamente.
                </div>
              )}
              {formRetencion.tipo === "Garantia" && (
                <div style={{ padding: "8px 12px", background: "#f3e8ff", borderRadius: 10, fontSize: 13, color: "#6b21a8" }}>
                  Garantía cubierta por la empresa o el fabricante del vehículo. No genera deuda para el cliente.
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenRetencion(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleRegistrarRetencion} disabled={guardando} style={{ ...primaryBtn, background: "#92400e" }}>
                {guardando ? "Guardando..." : "Registrar retención"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Salida de Fiscalía ── */}
      {openLiberarFiscalia && selectedMoto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 420 }}>
            <h3 style={{ margin: "0 0 8px" }}>Registrar salida de Fiscalía</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
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
              <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: 10, fontSize: 13, color: "#166534" }}>
                Estado → <strong>En taller</strong>. Debe pasar revisión antes de volver a operar.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpenLiberarFiscalia(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleLiberarFiscalia} disabled={guardando} style={{ ...primaryBtn, background: "#166534" }}>
                {guardando ? "Registrando..." : "Confirmar salida"}
              </button>
            </div>
          </div>
        </div>
      )}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div style={labelStyle}>{label}</div>{children}</div>;
}

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" };
