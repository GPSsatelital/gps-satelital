import React, { useState, useMemo } from "react";
import { useTaller, type TallerEstado, type TallerItem, type NuevoTallerItem } from "../hooks/useTaller";
import { useMotos } from "../hooks/useMotos";
import { useContratos, type Contrato } from "../hooks/useContratos";
import { supabase } from "../lib/supabase";
import { useScope } from "../contexts/SubadminScopeContext";
import { useAuth } from "../contexts/AuthContext";
import { hoyISO } from "../utils/fecha";
import { useClientes } from "../hooks/useClientes";
import ModalResolverTiempoFueraServicio from "../components/ModalResolverTiempoFueraServicio";
import MoneyInput from "../components/MoneyInput";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--line2)",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
  background: "var(--card)",
};
const labelStyle: React.CSSProperties = { marginBottom: 4, fontSize: 13, fontWeight: 600, color: "var(--muted2)", display: "block" };
const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)",
  color: "var(--card)",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};
const dangerBtn: React.CSSProperties = {
  background: "var(--bad-soft)",
  color: "var(--bad-ink)",
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
};
const ghostBtn: React.CSSProperties = {
  background: "var(--line)",
  color: "var(--muted2)",
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
  Pendiente: { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
  "En diagnóstico": { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  "En reparación": { bg: "var(--bad-soft)", color: "var(--bad-ink)" },
  "Listo para salida": { bg: "var(--ok-soft)", color: "var(--ok-ink)" },
  Finalizado: { bg: "var(--line)", color: "var(--muted2)" },
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
    <div style={{ ...card, borderLeft: `4px solid ${accent ?? "var(--accent)"}` }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{value}</div>
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
        background: selected ? "var(--accent-soft)" : "var(--soft2)",
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{motoLabel}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Ingreso: {formatDate(item.fecha_ingreso)} · {dias} día{dias !== 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
            {item.detalle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <TallerBadge estado={item.estado_tecnico} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatCOP(item.costo)}</div>
        </div>
      </div>
      {item.repuestos && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
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
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 80 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 520, maxHeight: "calc(100dvh - 160px)", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Repuestos Editor ──────────────────────────────────────────────────────────

type RepuestoItem = { nombre: string; cantidad: number; costo: number };

function RepuestosEditor({ items, onChange }: { items: RepuestoItem[]; onChange: (items: RepuestoItem[]) => void }) {
  function agregar() {
    onChange([...items, { nombre: "", cantidad: 1, costo: 0 }]);
  }
  function eliminar(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function actualizar(i: number, field: keyof RepuestoItem, value: string | number) {
    const copia = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item);
    onChange(copia);
  }
  const totalRepuestos = items.reduce((s, r) => s + r.costo * r.cantidad, 0);
  return (
    <div>
      <label style={labelStyle}>Repuestos utilizados</label>
      {items.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 6 }}>Sin repuestos agregados.</div>
      )}
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <input
            style={{ ...inputStyle, flex: 3 }}
            value={item.nombre}
            onChange={e => actualizar(i, "nombre", e.target.value)}
            placeholder="Nombre del repuesto"
          />
          <input
            type="number"
            style={{ ...inputStyle, flex: 1, minWidth: 50 }}
            value={item.cantidad}
            min={1}
            onChange={e => actualizar(i, "cantidad", Number(e.target.value) || 1)}
            title="Cantidad"
          />
          <MoneyInput
            style={{ flex: 2, minWidth: 70 }}
            value={item.costo ? String(item.costo) : ""}
            onChange={v => actualizar(i, "costo", Number(v) || 0)}
            placeholder="$ costo u."
          />
          <button onClick={() => eliminar(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)", fontSize: 18, padding: "0 2px", flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <button onClick={agregar} type="button" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "none", border: "1px dashed var(--accent-line)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>
          + Agregar repuesto
        </button>
        {items.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Total repuestos: <strong style={{ color: "var(--text)" }}>${items.reduce((s, r) => s + r.costo * r.cantidad, 0).toLocaleString("es-CO")}</strong>
          </span>
        )}
      </div>
      {totalRepuestos > 0 && <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>El costo de repuestos se suma al costo total de la orden.</div>}
    </div>
  );
}

function repuestosToText(items: RepuestoItem[]): string {
  return items.filter(r => r.nombre.trim()).map(r => r.cantidad > 1 ? `${r.nombre.trim()} (x${r.cantidad})` : r.nombre.trim()).join(", ");
}

function repuestosToTotal(items: RepuestoItem[]): number {
  return items.reduce((s, r) => s + r.costo * r.cantidad, 0);
}

// ─── Nueva Orden Modal ─────────────────────────────────────────────────────────

function NuevaOrdenModal({ motos, onClose, onRegistrar }: {
  motos: { id: string; label: string }[];
  onClose: () => void;
  onRegistrar: (data: NuevoTallerItem) => Promise<{ error: string | null }>;
}) {
  const [motoId, setMotoId] = useState("");
  const [estadoInicial, setEstadoInicial] = useState<TallerEstado>("Pendiente");
  const [fechaIngreso, setFechaIngreso] = useState(hoyISO());
  const [costoManoObra, setCostoManoObra] = useState("");
  const [detalle, setDetalle] = useState("");
  const [repuestosItems, setRepuestosItems] = useState<RepuestoItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const costoRepuestos = repuestosToTotal(repuestosItems);
  const costoTotal = (Number(costoManoObra) || 0) + costoRepuestos;

  async function handleSubmit() {
    if (!motoId) { setFormError("Selecciona la moto."); return; }
    if (!detalle.trim()) { setFormError("Ingresa el detalle técnico."); return; }
    setSaving(true);
    const { error } = await onRegistrar({
      moto_id: motoId,
      estado_tecnico: estadoInicial,
      detalle: detalle.trim(),
      costo: costoTotal,
      repuestos: repuestosToText(repuestosItems) || null,
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
        <RepuestosEditor items={repuestosItems} onChange={setRepuestosItems} />
        <MoneyInput label="Mano de obra" value={costoManoObra} onChange={setCostoManoObra} />
        {costoTotal > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", fontSize: 13 }}>
            <span style={{ color: "var(--muted)" }}>Repuestos: <strong>${costoRepuestos.toLocaleString("es-CO")}</strong></span>
            <span style={{ color: "var(--muted)", margin: "0 10px" }}>+</span>
            <span style={{ color: "var(--muted)" }}>Mano de obra: <strong>${(Number(costoManoObra) || 0).toLocaleString("es-CO")}</strong></span>
            <span style={{ color: "var(--muted)", margin: "0 10px" }}>=</span>
            <span style={{ color: "var(--accent)", fontWeight: 800 }}>Total: ${costoTotal.toLocaleString("es-CO")}</span>
          </div>
        )}
        {formError && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{formError}</div>}
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
  const [manoObraExtra, setManoObraExtra] = useState("");
  const [repuestosItems, setRepuestosItems] = useState<RepuestoItem[]>([]);
  const [saving, setSaving] = useState(false);

  const costoRepuestos = repuestosToTotal(repuestosItems);
  const costoExtra = (Number(manoObraExtra) || 0) + costoRepuestos;

  async function handleSubmit() {
    setSaving(true);
    await onActualizar(item.id, nuevoEstado, costoExtra, repuestosToText(repuestosItems));
    setSaving(false);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Actualizar orden">
      <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--soft2)", borderRadius: 10, fontSize: 14 }}>
        <strong>{motoLabel}</strong>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Ingresó: {formatDate(item.fecha_ingreso)} · Costo acumulado: {formatCOP(item.costo)}
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Nuevo estado</label>
          <select style={inputStyle} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as TallerEstado)}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <RepuestosEditor items={repuestosItems} onChange={setRepuestosItems} />
        <MoneyInput label="Mano de obra adicional" value={manoObraExtra} onChange={setManoObraExtra} />
        {costoExtra > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", fontSize: 13 }}>
            Nuevo total acumulado: <strong style={{ color: "var(--accent)" }}>{formatCOP(item.costo + costoExtra)}</strong>
            <span style={{ color: "var(--faint)", marginLeft: 8 }}>(+{formatCOP(costoExtra)})</span>
          </div>
        )}
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
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: accent ? 800 : 500, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
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
        <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Detalle técnico</div>
        <div style={{ fontSize: 14, color: "var(--text)", background: "var(--soft2)", borderRadius: 10, padding: "10px 14px" }}>{item.detalle}</div>
      </div>
      {item.repuestos && (
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Repuestos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.repuestos.split(",").map((r, i) => (
              <span key={i} style={{ background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 10px", fontSize: 12, color: "var(--muted2)" }}>
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {!finalizado && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <button onClick={onCambiarEstado} style={ghostBtn}>Cambiar estado</button>
          <button onClick={onActualizar} style={{ ...ghostBtn, background: "var(--accent-soft3)", color: "var(--accent-ink)" }}>+ Repuesto / costo</button>
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
  body { font-family: Arial, sans-serif; padding: 32px; color: var(--text); }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { margin-bottom: 16px; }
  .label { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 4px; }
  .value { font-size: 14px; font-weight: 500; }
  .detalle { background: var(--soft2); border-radius: 8px; padding: 12px; font-size: 14px; margin-top: 4px; }
  .footer { margin-top: 40px; border-top: 1px solid var(--line); padding-top: 16px; font-size: 12px; color: var(--faint); }
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
  const { motos: todasMotos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { filtrarMotos } = useScope();
  const motos = filtrarMotos(todasMotos);
  const { profile } = useAuth();
  const esAdminOSuperior = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";

  const [tab, setTab] = useState<"activas" | "historial">("activas");
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  const [showNueva, setShowNueva] = useState(false);
  const [showActualizar, setShowActualizar] = useState(false);
  const [showCambioEstado, setShowCambioEstado] = useState(false);
  const [tiempoFueraModal, setTiempoFueraModal] = useState<{ contrato: Contrato; motoPlaca: string; clienteNombre: string; fechaEntrada: string; fechaSalida: string } | null>(null);

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
    if (!confirm("¿Finalizar esta orden de taller? La moto saldrá del taller.")) return;
    const fechaSalida = hoyISO();
    await finalizarProceso(seleccionado.id, seleccionado.moto_id);
    // Solo ADMIN/AP deciden cobrar vs rodar (misma jerarquía que Editar contrato) — si otro
    // rol finaliza el taller, el tiempo queda pendiente de resolver manualmente después.
    if (esAdminOSuperior) {
      const contratoActivo = contratos.find(c => c.moto_id === seleccionado.moto_id && c.estado === "Activo");
      const dias = Math.round((new Date(fechaSalida + "T00:00:00").getTime() - new Date(seleccionado.fecha_ingreso + "T00:00:00").getTime()) / 86400000);
      if (contratoActivo && dias > 0) {
        const cliente = clientes.find(cl => cl.id === contratoActivo.cliente_id);
        const moto = motos.find(m => m.id === seleccionado.moto_id);
        setTiempoFueraModal({
          contrato: contratoActivo,
          motoPlaca: moto?.placa ?? "",
          clienteNombre: cliente?.nombre ?? "",
          fechaEntrada: seleccionado.fecha_ingreso,
          fechaSalida,
        });
      }
    }
    setSeleccionId(null);
  }

  if (loading) return <div style={{ padding: 32, color: "var(--muted)", fontSize: 15 }}>Cargando taller...</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0, color: "var(--text)" }}>Taller y Mantenimiento</h2>
          <p style={{ marginTop: 4, color: "var(--muted)", fontSize: 14, margin: "4px 0 0" }}>Control técnico de la flota.</p>
        </div>
        <button onClick={() => setShowNueva(true)} style={primaryBtn}>+ Nueva orden de taller</button>
      </div>

      {error && <div style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>Error: {error}</div>}

      {/* KPIs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En proceso" value={activas.length} accent="var(--accent)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En diagnóstico" value={enDiagnostico} accent="var(--accent-ink)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En reparación" value={enReparacion} accent="var(--bad-ink)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="Listo para salida" value={listoSalida} accent="var(--ok-ink)" /></div>
        <div style={{ flex: "1 1 180px" }}><KpiCard label="Costo total (este mes)" value={formatCOP(costoMes)} accent="var(--ok2)" /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--line)" }}>
        {(["activas", "historial"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSeleccionId(null); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -2,
              padding: "8px 16px",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "var(--accent)" : "var(--muted)",
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
              <div style={{ ...card, color: "var(--muted)", fontSize: 14, textAlign: "center", padding: 32 }}>
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
              <h3 style={{ margin: "0 0 16px", fontSize: 17, color: "var(--text)" }}>Detalle de la orden</h3>
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
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            {historial.length === 0
              ? "No hay órdenes finalizadas aún."
              : `${historial.length} orden${historial.length !== 1 ? "es" : ""} finalizada${historial.length !== 1 ? "s" : ""}`}
          </div>
          {historial.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--soft2)" }}>
                    {["Moto", "Detalle", "Repuestos", "Costo", "Ingreso", "Salida", "Días", ""].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--muted2)", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--soft)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text)" }}>{getMotoLabel(item.moto_id)}</td>
                      <td style={{ padding: "10px 12px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted2)" }}>{item.detalle}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.repuestos || "-"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--accent)" }}>{formatCOP(item.costo)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{formatDate(item.fecha_ingreso)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{formatDate(item.fecha_salida)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{diasEnTaller(item.fecha_ingreso, item.fecha_salida)}</td>
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
                    border: isActual ? "2px solid var(--accent)" : "2px solid transparent",
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

      {tiempoFueraModal && (
        <ModalResolverTiempoFueraServicio
          contrato={tiempoFueraModal.contrato}
          clienteNombre={tiempoFueraModal.clienteNombre}
          motoPlaca={tiempoFueraModal.motoPlaca}
          motivo="Taller"
          fechaEntrada={tiempoFueraModal.fechaEntrada}
          fechaSalida={tiempoFueraModal.fechaSalida}
          onClose={() => setTiempoFueraModal(null)}
        />
      )}
    </div>
  );
}
