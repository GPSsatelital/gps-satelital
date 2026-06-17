import React, { useState } from "react";
import { useTaller, type TallerEstado, type NuevoTallerItem } from "../hooks/useTaller";
import { useMotos } from "../hooks/useMotos";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };

function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

const ESTADOS: TallerEstado[] = ["Pendiente", "En diagnóstico", "En reparación", "Listo para salida", "Finalizado"];

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-CO");
}

function TallerBadge({ estado }: { estado: TallerEstado }) {
  const map: Record<TallerEstado, { bg: string; color: string }> = {
    Pendiente: { bg: "#fef3c7", color: "#92400e" },
    "En diagnóstico": { bg: "#dbeafe", color: "#1d4ed8" },
    "En reparación": { bg: "#fee2e2", color: "#991b1b" },
    "Listo para salida": { bg: "#dcfce7", color: "#166534" },
    Finalizado: { bg: "#e2e8f0", color: "#334155" },
  };
  const colors = map[estado];
  return <span style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: colors.bg, color: colors.color }}>{estado}</span>;
}

export default function TallerView() {
  const { taller, loading, error, registrarIngreso, actualizarEstadoTaller, finalizarProceso } = useTaller();
  const { motos } = useMotos();

  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [motoId, setMotoId] = useState("");
  const [estadoInicial, setEstadoInicial] = useState<TallerEstado>("Pendiente");
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [costo, setCosto] = useState("");
  const [detalle, setDetalle] = useState("");
  const [repuestos, setRepuestos] = useState("");

  const enProceso = taller.filter((t) => t.estado_tecnico !== "Finalizado");
  const enMantenimiento = enProceso.length;
  const enDiagnostico = enProceso.filter((t) => t.estado_tecnico === "En diagnóstico").length;
  const enReparacion = enProceso.filter((t) => t.estado_tecnico === "En reparación").length;
  const listoSalida = enProceso.filter((t) => t.estado_tecnico === "Listo para salida").length;

  const seleccionado = taller.find((t) => t.id === seleccionId) ?? null;

  const motosDisponiblesParaTaller = motos.filter((m) => ["Disponible", "Mantenimiento", "Recuperada"].includes(m.estado));

  function motoDe(id: string) {
    return motos.find((m) => m.id === id);
  }

  function resetForm() {
    setMotoId("");
    setEstadoInicial("Pendiente");
    setFechaIngreso(new Date().toISOString().slice(0, 10));
    setCosto("");
    setDetalle("");
    setRepuestos("");
    setFormError(null);
  }

  async function handleRegistrar() {
    if (!motoId || !detalle) {
      setFormError("Selecciona la moto e ingresa el detalle técnico.");
      return;
    }

    const nuevo: NuevoTallerItem = {
      moto_id: motoId,
      estado_tecnico: estadoInicial,
      detalle,
      costo: Number(costo) || 0,
      repuestos: repuestos || null,
      fecha_ingreso: fechaIngreso,
    };

    const { error } = await registrarIngreso(nuevo);
    if (error) {
      setFormError(error);
      return;
    }

    setShowModal(false);
    resetForm();
  }

  async function handleCambiarEstado(estado: TallerEstado) {
    if (!seleccionado) return;
    await actualizarEstadoTaller(seleccionado.id, estado);
  }

  async function handleFinalizar() {
    if (!seleccionado) return;
    await finalizarProceso(seleccionado.id, seleccionado.moto_id);
    setSeleccionId(null);
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando taller...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Taller y Mantenimiento</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Control del proceso técnico de las motos en taller.</p>
        </div>
        <button onClick={() => setShowModal(true)} style={primaryBtn}>Registrar ingreso a taller</button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 20 }}>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>En mantenimiento</div><div style={{ fontSize: 22, fontWeight: 800 }}>{enMantenimiento}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>En diagnóstico</div><div style={{ fontSize: 22, fontWeight: 800 }}>{enDiagnostico}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>En reparación</div><div style={{ fontSize: 22, fontWeight: 800 }}>{enReparacion}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>Listo para salida</div><div style={{ fontSize: 22, fontWeight: 800 }}>{listoSalida}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1.2fr) minmax(280px, 0.9fr)", gap: 20, marginTop: 24 }}>
        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Motos en proceso técnico</h3>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {taller.length === 0 && <div style={{ color: "#64748b" }}>No hay registros de taller todavía.</div>}

            {taller.map((t) => {
              const moto = motoDe(t.moto_id);
              return (
                <div
                  key={t.id}
                  onClick={() => setSeleccionId(t.id)}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: seleccionId === t.id ? "#e0f2fe" : "#f8fafc",
                    border: seleccionId === t.id ? "1px solid #0284c7" : "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{moto ? `${moto.placa} · ${moto.marca} ${moto.modelo}` : "Moto no encontrada"}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>Ingreso: {formatDate(t.fecha_ingreso)}</div>
                    </div>
                    <TallerBadge estado={t.estado_tecnico} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Detalle</h3>

          {seleccionado ? (
            (() => {
              const moto = motoDe(seleccionado.moto_id);
              return (
                <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Moto</div>
                    <div style={{ fontWeight: 700 }}>{moto ? `${moto.placa} · ${moto.marca} ${moto.modelo}` : "-"}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Fecha ingreso</div>
                    <div>{formatDate(seleccionado.fecha_ingreso)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Fecha salida</div>
                    <div>{formatDate(seleccionado.fecha_salida)}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Costo</div>
                    <div>$ {seleccionado.costo.toLocaleString("es-CO")}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Detalle técnico</div>
                    <div>{seleccionado.detalle}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Repuestos</div>
                    <div>{seleccionado.repuestos || "-"}</div>
                  </div>

                  {seleccionado.estado_tecnico !== "Finalizado" && (
                    <>
                      <div>
                        <div style={labelStyle}>Estado técnico</div>
                        <select
                          style={inputStyle}
                          value={seleccionado.estado_tecnico}
                          onChange={(e) => handleCambiarEstado(e.target.value as TallerEstado)}
                        >
                          {ESTADOS.filter((e) => e !== "Finalizado").map((e) => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      </div>

                      <button onClick={handleFinalizar} style={primaryBtn}>Finalizar y pasar a disponible</button>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div style={{ marginTop: 16, color: "#64748b" }}>Selecciona un registro de la lista para ver el detalle.</div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Registrar ingreso a taller</h3>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <div>
                <div style={labelStyle}>Moto</div>
                <select style={inputStyle} value={motoId} onChange={(e) => setMotoId(e.target.value)}>
                  <option value="">Seleccionar moto</option>
                  {motosDisponiblesParaTaller.map((m) => (
                    <option key={m.id} value={m.id}>{m.placa} · {m.marca} {m.modelo}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={labelStyle}>Estado técnico inicial</div>
                <select style={inputStyle} value={estadoInicial} onChange={(e) => setEstadoInicial(e.target.value as TallerEstado)}>
                  {ESTADOS.filter((e) => e !== "Finalizado").map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={labelStyle}>Fecha ingreso</div>
                <input type="date" style={inputStyle} value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
              </div>

              <div>
                <div style={labelStyle}>Costo</div>
                <input type="number" style={inputStyle} value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="Ej. 80000" />
              </div>

              <div>
                <div style={labelStyle}>Detalle técnico</div>
                <textarea style={{ ...inputStyle, minHeight: 80 }} value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Describe el problema o trabajo a realizar" />
              </div>

              <div>
                <div style={labelStyle}>Repuestos</div>
                <input style={inputStyle} value={repuestos} onChange={(e) => setRepuestos(e.target.value)} placeholder="Ej. Pastillas de freno, aceite" />
              </div>

              {formError && <div style={{ color: "#991b1b", fontWeight: 600 }}>{formError}</div>}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setShowModal(false); resetForm(); }} style={miniBtn("#e2e8f0", "#334155")}>Cancelar</button>
                <button onClick={handleRegistrar} style={primaryBtn}>Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
