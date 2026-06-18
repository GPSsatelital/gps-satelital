import React, { useMemo, useState } from "react";
import { useMotos, type GrupoMoto, type Moto, type MotoStatus } from "../hooks/useMotos";

function getStatusColors(status: MotoStatus) {
  switch (status) {
    case "Disponible":
      return { bg: "#dcfce7", color: "#166534", border: "#86efac" };
    case "Reservada":
      return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    case "Asignada":
      return { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" };
    case "Mantenimiento":
      return { bg: "#ffe4e6", color: "#be123c", border: "#fda4af" };
    case "Recuperada":
      return { bg: "#e2e8f0", color: "#334155", border: "#cbd5e1" };
  }
}

function StatusBadge({ status }: { status: MotoStatus }) {
  const colors = getStatusColors(status);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {status}
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
  const { motos, loading, error, crearMoto, cambiarEstadoMoto } = useMotos();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      observaciones: form.observaciones.trim() || null,
    });

    setGuardando(false);

    if (error) {
      setFormError(error.includes("duplicate") ? "Ya existe una moto con esa placa." : error);
      return;
    }

    setForm({
      placa: "", grupo: "CLUB", marca: "", modelo: "", numero_motor: "", numero_chasis: "",
      lugar_matricula: "", cilindraje: "", fecha_seguro: "", fecha_tecnomecanica: "",
      propietario: "", numero_serie: "", estado: "Disponible", observaciones: "",
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
              <InfoBox label="Vence seguro" value={formatDate(selectedMoto.fecha_seguro)} />
              <InfoBox label="Vence tecnomecánica" value={formatDate(selectedMoto.fecha_tecnomecanica)} />
              <InfoBox label="Observaciones" value={selectedMoto.observaciones || "Sin observaciones"} />

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
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Recuperada">Recuperada</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 16, color: "#64748b" }}>Selecciona una moto para ver su detalle.</div>
          )}
        </div>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Registrar nueva moto</h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <Field label="Placa"><input style={inputStyle} value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))} /></Field>
              <Field label="Grupo operativo">
                <select style={inputStyle} value={form.grupo} onChange={(e) => setForm((p) => ({ ...p, grupo: e.target.value as GrupoMoto }))}>
                  <option value="CLUB">Moteros CLUB</option>
                  <option value="PRADERA">Moteros Club PRADERA</option>
                  <option value="COSTA">Moteros Club COSTA</option>
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
