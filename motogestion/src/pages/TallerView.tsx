import React, { useState, useMemo } from "react";
import { useTaller, type TallerEstado, type TallerItem, type NuevoTallerItem } from "../hooks/useTaller";
import { useMotos } from "../hooks/useMotos";
import { supabase } from "../lib/supabase";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
  background: "white",
};
const labelStyle: React.CSSProperties = { marginBottom: 4, fontSize: 13, fontWeight: 600, color: "#334155", display: "block" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};
const dangerBtn: React.CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};
const ghostBtn: React.CSSProperties = {
  background: "#e2e8f0",
  color: "#334155",
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADOS: TallerEstado[] = ["Pendiente", "En diagnóstico", "En reparación", "Listo para salida", "Finalizado"];

const ESTADO_COLORS: Record<TallerEstado, { bg: string; color: string }> = {
  Pendiente: { bg: "#fef3c7", color: "#92400e" },
  "En diagnóstico": { bg: "#dbeafe", color: "#1d4ed8" },
  "En reparación": { bg: "#fee2e2", color: "#991b1b" },
  "Listo para salida": { bg: "#dcfce7", color: "#166534" },
  Finalizado: { bg: "#e2e8f0", color: "#334155" },
};

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-CO");
}

function diasEnTaller(fechaIngreso: string | null, fechaSalida: string | null): number {
  if (!fechaIngreso) return 0;
  const fin = fechaSalida ? new Date(fechaSalida) : new Date();
  const ini = new Date(fechaIngreso);
  return Math.max(0, Math.floor((fin.getTime() - ini.getTime()) / 86400000));
}

function formatCOP(value: number) {
  return "$ " + value.toLocaleString("es-CO");
}

function TallerBadge({ estado }: { estado: TallerEstado }) {
  const { bg, color } = ESTADO_COLORS[estado];
  return (
    <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: bg, color, whiteSpace: "nowrap" }}>
      {estado}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ ...card, borderLeft: `4px solid ${accent ?? "#0284c7"}` }}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

// ─── Orden Card ────────────────────────────────────────────────────────────────

function OrdenCard({
  item,
  motoLabel,
  onSelect,
  selected,
}: {
  item: TallerItem;
  motoLabel: string;
  onSelect: () => void;
  selected: boolean;
}) {
  const dias = diasEnTaller(item.fecha_ingreso, item.fecha_salida);
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        background: selected ? "#e0f2fe" : "#f8fafc",
        border: `1.5px solid ${selected ? "#0284c7" : "#e2e8f0"}`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{motoLabel}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            Ingreso: {formatDate(item.fecha_ingreso)} · {dias} día{dias !== 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 13, color: "#334155", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
            {item.detalle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <TallerBadge estado={item.estado_tecnico} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{formatCOP(item.costo)}</div>
        </div>
      </div>
      {item.repuestos && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
          Repuestos: {item.repuestos}
        </div>
      )}
    </div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b", lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Nueva Orden Modal ─────────────────────────────────────────────────────────

function NuevaOrdenModal({ motos, onClose, onRegistrar }: {
  motos: { id: string; label: string }[];
  onClose: () => void;
  onRegistrar: (data: NuevoTallerItem) => Promise<{ error: string | null }>;
}) {
  const [motoId, setMotoId] = useState("");
  const [estadoInicial, setEstadoInicial] = useState<TallerEstado>("Pendiente");
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [costo, setCosto] = useState("");
  const [detalle, setDetalle] = useState("");
  const [repuestos, setRepuestos] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!motoId) { setFormError("Selecciona la moto."); return; }
    if (!detalle.trim()) { setFormError("Ingresa el detalle técnico."); return; }
    setSaving(true);
    const { error } = await onRegistrar({
      moto_id: motoId,
      estado_tecnico: estadoInicial,
      detalle: detalle.trim(),
      costo: Number(costo) || 0,
      repuestos: repuestos.trim() || null,
      fecha_ingreso: fechaIngreso,
    });
    setSaving(false);
    if (error) { setFormError(error); return; }
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Registrar ingreso a taller">
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Moto *</label>
          <select style={inputStyle} value={motoId} onChange={(e) => setMotoId(e.target.value)}>
            <option value="">Seleccionar moto...</option>
            {motos.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Estado técnico inicial</label>
          <select style={inputStyle} value={estadoInicial} onChange={(e) => setEstadoInicial(e.target.value as TallerEstado)}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Fecha ingreso</label>
          <input type="date" style={inputStyle} value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Detalle técnico *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Describe el problema o trabajo a realizar"
          />
        </div>
        <div>
          <label style={labelStyle}>Repuestos (separados por coma)</label>
          <input
            style={inputStyle}
            value={repuestos}
            onChange={(e) => setRepuestos(e.target.value)}
            placeholder="Ej. Pastillas de freno, aceite, filtro"
          />
        </div>
        <div>
          <label style={labelStyle}>Costo estimado ($)</label>
          <input type="number" style={inputStyle} value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0" />
        </div>
        {formError && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{formError}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button onClick={handleSubmit} style={primaryBtn} disabled={saving}>{saving ? "Guardando..." : "Registrar ingreso"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Actualización Modal ───────────────────────────────────────────────────────

function ActualizarModal({
  item,
  motoLabel,
  onClose,
  onActualizar,
}: {
  item: TallerItem;
  motoLabel: string;
  onClose: () => void;
  onActualizar: (id: string, estado: TallerEstado, costoExtra: number, repuestosExtra: string) => Promise<void>;
}) {
  const [nuevoEstado, setNuevoEstado] = useState<TallerEstado>(item.estado_tecnico);
  const [costoExtra, setCostoExtra] = useState("");
  const [repuestosExtra, setRepuestosExtra] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    await onActualizar(item.id, nuevoEstado, Number(costoExtra) || 0, repuestosExtra.trim());
    setSaving(false);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Actualizar orden">
      <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, fontSize: 14 }}>
        <strong>{motoLabel}</strong>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Ingresó: {formatDate(item.fecha_ingreso)}</div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Nuevo estado</label>
          <select style={inputStyle} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as TallerEstado)}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Costo adicional ($)</label>
          <input type="number" style={inputStyle} value={costoExtra} onChange={(e) => setCostoExtra(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={labelStyle}>Repuestos adicionales</label>
          <input
            style={inputStyle}
            value={repuestosExtra}
            onChange={(e) => setRepuestosExtra(e.target.value)}
            placeholder="Ej. Bujía, cadena"
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button onClick={handleSubmit} style={primaryBtn} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: accent ? 800 : 500, color: accent ? "#0284c7" : "#0f172a" }}>{value}</div>
    </div>
  );
}

// ─── Detalle Panel ─────────────────────────────────────────────────────────────

function DetallePanel({
  item,
  motoLabel,
  onActualizar,
  onFinalizar,
  onImprimir,
  onCambiarEstado,
}: {
  item: TallerItem;
  motoLabel: string;
  onActualizar: () => void;
  onFinalizar: () => void;
  onImprimir: () => void;
  onCambiarEstado: () => void;
}) {
  const dias = diasEnTaller(item.fecha_ingreso, item.fecha_salida);
  const finalizado = item.estado_tecnico === "Finalizado";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <TallerBadge estado={item.estado_tecnico} />
        <button onClick={onImprimir} style={{ ...ghostBtn, fontSize: 12 }}>Imprimir orden</button>
      </div>

      <Row label="Moto" value={motoLabel} />
      <Row label="Dias en taller" value={`${dias} dia${dias !== 1 ? "s" : ""}`} />
      <Row label="Fecha ingreso" value={formatDate(item.fecha_ingreso)} />
      {finalizado && <Row label="Fecha salida" value={formatDate(item.fecha_salida)} />}
      <Row label="Costo acumulado" value={formatCOP(item.costo)} accent />
      <div>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Detalle técnico</div>
        <div style={{ fontSize: 14, color: "#0f172a", background: "#f8fafc", borderRadius: 10, padding: "10px 14px" }}>{item.detalle}</div>
      </div>
      {item.repuestos && (
        <div>
          <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Repuestos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.repuestos.split(",").map((r, i) => (
              <span key={i} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, padding: "3px 10px", fontSize: 12, color: "#334155" }}>
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {!finalizado && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <button onClick={onCambiarEstado} style={ghostBtn}>Cambiar estado</button>
          <button onClick={onActualizar} style={{ ...ghostBtn, background: "#dbeafe", color: "#1d4ed8" }}>+ Repuesto / costo</button>
          <button onClick={onFinalizar} style={{ ...primaryBtn, fontSize: 13 }}>Finalizar y pasar a disponible</button>
        </div>
      )}
    </div>
  );
}

// ─── Print helper ──────────────────────────────────────────────────────────────

function imprimirOrden(item: TallerItem, motoLabel: string) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Orden de Taller - ${motoLabel}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { font-size: 14px; color: #64748b; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { margin-bottom: 16px; }
  .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
  .value { font-size: 14px; font-weight: 500; }
  .detalle { background: #f8fafc; border-radius: 8px; padding: 12px; font-size: 14px; margin-top: 4px; }
  .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<h1>Orden de Taller</h1>
<div class="sub">GPS Satelital Cartagena - ${new Date().toLocaleDateString("es-CO")}</div>
<div class="grid">
  <div class="field"><div class="label">Moto</div><div class="value">${motoLabel}</div></div>
  <div class="field"><div class="label">Estado</div><div class="value">${item.estado_tecnico}</div></div>
  <div class="field"><div class="label">Fecha ingreso</div><div class="value">${formatDate(item.fecha_ingreso)}</div></div>
  <div class="field"><div class="label">Fecha salida</div><div class="value">${formatDate(item.fecha_salida)}</div></div>
  <div class="field"><div class="label">Dias en taller</div><div class="value">${diasEnTaller(item.fecha_ingreso, item.fecha_salida)}</div></div>
  <div class="field"><div class="label">Costo acumulado</div><div class="value"><strong>${formatCOP(item.costo)}</strong></div></div>
</div>
<div class="field"><div class="label">Detalle tecnico</div><div class="detalle">${item.detalle}</div></div>
${item.repuestos ? `<div class="field" style="margin-top:16px"><div class="label">Repuestos utilizados</div><div class="detalle">${item.repuestos}</div></div>` : ""}
<div class="footer">Generado automaticamente por MotoGestion</div>
<script>window.print();</script>
</body>
</html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TallerView() {
  const { taller, loading, error, registrarIngreso, actualizarEstadoTaller, finalizarProceso } = useTaller();
  const { motos } = useMotos();

  const [tab, setTab] = useState<"activas" | "historial">("activas");
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [showNueva, setShowNueva] = useState(false);
  const [showActualizar, setShowActualizar] = useState(false);
  const [showCambioEstado, setShowCambioEstado] = useState(false);

  const activas = useMemo(() => taller.filter((t) => t.estado_tecnico !== "Finalizado"), [taller]);
  const historial = useMemo(() => taller.filter((t) => t.estado_tecnico === "Finalizado"), [taller]);

  const enDiagnostico = activas.filter((t) => t.estado_tecnico === "En diagnóstico").length;
  const enReparacion = activas.filter((t) => t.estado_tecnico === "En reparación").length;
  const listoSalida = activas.filter((t) => t.estado_tecnico === "Listo para salida").length;

  const costoMes = useMemo(() => {
    const now = new Date();
    return taller
      .filter((t) => {
        const d = new Date(t.fecha_ingreso);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + (t.costo ?? 0), 0);
  }, [taller]);

  const seleccionado = taller.find((t) => t.id === seleccionId) ?? null;

  function getMotoLabel(motoId: string) {
    const m = motos.find((x) => x.id === motoId);
    return m ? `${m.placa} - ${m.marca} ${m.modelo}` : "Moto desconocida";
  }

  const motosParaTaller = motos
    .filter((m) => ["Disponible", "Mantenimiento", "Recuperada", "Garantia"].includes(m.estado))
    .map((m) => ({ id: m.id, label: `${m.placa} - ${m.marca} ${m.modelo} (${m.estado})` }));

  async function handleActualizarOrden(id: string, estado: TallerEstado, costoExtra: number, repuestosExtra: string) {
    await actualizarEstadoTaller(id, estado);
    if (costoExtra > 0 || repuestosExtra) {
      const found = taller.find((t) => t.id === id);
      if (found) {
        const newCosto = found.costo + costoExtra;
        const newRepuestos = [found.repuestos, repuestosExtra].filter(Boolean).join(", ");
        await supabase.from("taller").update({ costo: newCosto, repuestos: newRepuestos }).eq("id", id);
      }
    }
  }

  async function handleFinalizar() {
    if (!seleccionado) return;
    await finalizarProceso(seleccionado.id, seleccionado.moto_id);
    setSeleccionId(null);
  }

  if (loading) return <div style={{ padding: 32, color: "#64748b", fontSize: 15 }}>Cargando taller...</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0, color: "#0f172a" }}>Taller y Mantenimiento</h2>
          <p style={{ marginTop: 4, color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>Control técnico de la flota.</p>
        </div>
        <button onClick={() => setShowNueva(true)} style={primaryBtn}>+ Nueva orden de taller</button>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>Error: {error}</div>}

      {/* KPIs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En proceso" value={activas.length} accent="#0284c7" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En diagnóstico" value={enDiagnostico} accent="#1d4ed8" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En reparación" value={enReparacion} accent="#991b1b" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="Listo para salida" value={listoSalida} accent="#166534" /></div>
        <div style={{ flex: "1 1 180px" }}><KpiCard label="Costo total (este mes)" value={formatCOP(costoMes)} accent="#10b981" /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0" }}>
        {(["activas", "historial"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSeleccionId(null); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid #0284c7" : "2px solid transparent",
              marginBottom: -2,
              padding: "8px 16px",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#0284c7" : "#64748b",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t === "activas" ? `Órdenes activas (${activas.length})` : `Historial (${historial.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "activas" ? (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Lista */}
          <div style={{ flex: "1 1 320px", display: "grid", gap: 10 }}>
            {activas.length === 0 ? (
              <div style={{ ...card, color: "#64748b", fontSize: 14, textAlign: "center", padding: 32 }}>
                No hay órdenes activas.
                <br />
                <button onClick={() => setShowNueva(true)} style={{ ...primaryBtn, marginTop: 14, fontSize: 13 }}>Registrar primera orden</button>
              </div>
            ) : (
              activas.map((item) => (
                <OrdenCard
                  key={item.id}
                  item={item}
                  motoLabel={getMotoLabel(item.moto_id)}
                  selected={seleccionId === item.id}
                  onSelect={() => setSeleccionId(seleccionId === item.id ? null : item.id)}
                />
              ))
            )}
          </div>

          {/* Panel detalle */}
          {seleccionado && seleccionado.estado_tecnico !== "Finalizado" && (
            <div style={{ flex: "0 1 340px", ...card, minWidth: 280 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 17, color: "#0f172a" }}>Detalle de la orden</h3>
              <DetallePanel
                item={seleccionado}
                motoLabel={getMotoLabel(seleccionado.moto_id)}
                onCambiarEstado={() => setShowCambioEstado(true)}
                onActualizar={() => setShowActualizar(true)}
                onFinalizar={handleFinalizar}
                onImprimir={() => imprimirOrden(seleccionado, getMotoLabel(seleccionado.moto_id))}
              />
            </div>
          )}
        </div>
      ) : (
        /* Historial */
        <div style={card}>
          <div style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
            {historial.length === 0
              ? "No hay órdenes finalizadas aún."
              : `${historial.length} orden${historial.length !== 1 ? "es" : ""} finalizada${historial.length !== 1 ? "s" : ""}`}
          </div>
          {historial.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Moto", "Detalle", "Repuestos", "Costo", "Ingreso", "Salida", "Días", ""].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#334155", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0f172a" }}>{getMotoLabel(item.moto_id)}</td>
                      <td style={{ padding: "10px 12px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#334155" }}>{item.detalle}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.repuestos || "-"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#0284c7" }}>{formatCOP(item.costo)}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b" }}>{formatDate(item.fecha_ingreso)}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b" }}>{formatDate(item.fecha_salida)}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b" }}>{diasEnTaller(item.fecha_ingreso, item.fecha_salida)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          onClick={() => imprimirOrden(item, getMotoLabel(item.moto_id))}
                          style={{ ...ghostBtn, fontSize: 12, padding: "4px 10px" }}
                        >
                          Imprimir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNueva && (
        <NuevaOrdenModal
          motos={motosParaTaller}
          onClose={() => setShowNueva(false)}
          onRegistrar={registrarIngreso}
        />
      )}

      {showActualizar && seleccionado && (
        <ActualizarModal
          item={seleccionado}
          motoLabel={getMotoLabel(seleccionado.moto_id)}
          onClose={() => setShowActualizar(false)}
          onActualizar={handleActualizarOrden}
        />
      )}

      {showCambioEstado && seleccionado && (
        <Modal onClose={() => setShowCambioEstado(false)} title="Cambiar estado">
          <div style={{ display: "grid", gap: 10 }}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => {
              const { bg, color } = ESTADO_COLORS[e];
              const isActual = seleccionado.estado_tecnico === e;
              return (
                <button
                  key={e}
                  onClick={async () => {
                    await actualizarEstadoTaller(seleccionado.id, e);
                    setShowCambioEstado(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: isActual ? "2px solid #0284c7" : "2px solid transparent",
                    background: bg,
                    color,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {isActual ? "Actual: " : ""}{e}
                </button>
              );
            })}
            <button onClick={() => setShowCambioEstado(false)} style={{ ...dangerBtn, marginTop: 4 }}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
