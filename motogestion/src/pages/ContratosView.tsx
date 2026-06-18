import React, { useState } from "react";
import { useContratos, type ContratoEstado } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useAuth } from "../contexts/AuthContext";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };
const secondaryBtn: React.CSSProperties = { background: "white", border: "1px solid #cbd5e1", borderRadius: 14, padding: "10px 16px", fontWeight: 600, cursor: "pointer" };

function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

function ContractBadge({ estado }: { estado: ContratoEstado }) {
  const map: Record<ContratoEstado, { bg: string; color: string }> = {
    "En proceso": { bg: "#fef3c7", color: "#92400e" },
    Activo: { bg: "#dcfce7", color: "#166534" },
    Finalizado: { bg: "#dbeafe", color: "#1d4ed8" },
    Cancelado: { bg: "#ffe4e6", color: "#be123c" },
  };
  const colors = map[estado];
  return <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: colors.bg, color: colors.color, fontSize: 12, fontWeight: 700 }}>{estado}</span>;
}

const VALORES_SEMANALES = [50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000];

function emptyForm() {
  return { cliente_id: "", dia_pago: "Lunes", valor_semanal: "", meses: "", ahorro_inicial: "", fecha_entrega: "", forma_pago: "Semanal", valor_diario: "" };
}

export default function ContratosView() {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";

  const { contratos, loading, error, crearContrato, firmarCliente, asignarMoto, activarContrato, cancelarContrato } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const clientesAprobados = clientes.filter((c) => c.estado === "Aprobado");
  const motosDisponibles = motos.filter((m) => m.estado === "Disponible");

  function clienteYaTieneContrato(clienteId: string) {
    return contratos.some((c) => c.cliente_id === clienteId && (c.estado === "Activo" || c.estado === "En proceso"));
  }

  async function handleCrear() {
    if (role !== "ADMIN") {
      setFormError("Solo ADMIN puede crear contratos.");
      return;
    }

    if (!form.cliente_id || !form.valor_semanal || !form.meses || !form.fecha_entrega) {
      setFormError("Completa cliente, valor semanal, meses y fecha de entrega.");
      return;
    }

    const cliente = clientes.find((c) => c.id === form.cliente_id);
    if (!cliente || cliente.estado !== "Aprobado") {
      setFormError("El cliente debe estar aprobado desde Pendientes de aprobación.");
      return;
    }

    if (clienteYaTieneContrato(form.cliente_id)) {
      setFormError("Este cliente ya tiene un contrato activo o en proceso.");
      return;
    }

    setGuardando(true);
    const { error } = await crearContrato({
      cliente_id: form.cliente_id,
      dia_pago: form.dia_pago,
      valor_semanal: Number(form.valor_semanal),
      meses: Number(form.meses),
      ahorro_inicial: Number(form.ahorro_inicial || 0),
      fecha_entrega: form.fecha_entrega,
    });
    setGuardando(false);

    if (error) {
      setFormError(error);
      return;
    }

    setForm(emptyForm());
    setFormError(null);
    setOpen(false);
  }

  async function handleAsignarMoto(contratoId: string, motoId: string, firmaCliente: boolean) {
    if (!motoId) return;
    if (!firmaCliente) {
      alert("Primero debe firmar el cliente.");
      return;
    }
    const enUso = contratos.some((c) => c.moto_id === motoId && c.id !== contratoId && c.estado !== "Cancelado");
    if (enUso) {
      alert("Esta moto ya está asignada a otro contrato.");
      return;
    }
    await asignarMoto(contratoId, motoId);
  }

  async function handleActivar(contratoId: string, motoId: string | null, clienteId: string) {
    if (!motoId) {
      alert("Debe tener moto asignada.");
      return;
    }
    await activarContrato(contratoId, motoId, clienteId);
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando contratos...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Contratos</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Contratos solo para clientes aprobados desde visita domiciliaria.</p>
        </div>
        {role === "ADMIN" && <button onClick={() => setOpen(true)} style={primaryBtn}>+ Crear contrato</button>}
      </div>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error cargando contratos: {error}</div>}

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {contratos.length === 0 && (
          <div style={card}><div style={{ color: "#64748b" }}>Aún no hay contratos registrados.</div></div>
        )}

        {contratos.map((c) => {
          const cliente = clientes.find((cl) => cl.id === c.cliente_id);
          const moto = motos.find((m) => m.id === c.moto_id);

          return (
            <div key={c.id} style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 16, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{cliente?.nombre || "Sin cliente"}</div>
                <ContractBadge estado={c.estado} />
              </div>

              <div style={{ marginTop: 8, display: "grid", gap: 4, fontSize: 14 }}>
                <div>Firma cliente: {c.firma_cliente ? "Sí" : "No"}</div>
                <div>Moto: {moto ? `${moto.placa} · ${moto.marca} ${moto.modelo}` : "Sin asignar"}</div>
                <div>Valor semanal: $ {c.valor_semanal.toLocaleString("es-CO")}</div>
                <div>Meses: {c.meses}</div>
                <div>Ahorro inicial: $ {c.ahorro_inicial.toLocaleString("es-CO")}</div>
                <div>Día de pago: {c.dia_pago}</div>
                <div>Fecha entrega: {c.fecha_entrega || "No definida"}</div>
              </div>

              {role === "ADMIN" && c.estado !== "Cancelado" && c.estado !== "Finalizado" && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {!c.firma_cliente && (
                    <button onClick={() => firmarCliente(c.id)} style={miniBtn("#dbeafe", "#1d4ed8")}>Firmar cliente</button>
                  )}

                  {c.firma_cliente && !c.moto_id && (
                    <div style={{ minWidth: 220 }}>
                      <select style={inputStyle} defaultValue="" onChange={(e) => handleAsignarMoto(c.id, e.target.value, c.firma_cliente)}>
                        <option value="">Asignar moto disponible</option>
                        {motosDisponibles.map((m) => (
                          <option key={m.id} value={m.id}>{m.placa} - {m.marca} {m.modelo}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {c.moto_id && c.estado !== "Activo" && (
                    <button onClick={() => handleActivar(c.id, c.moto_id, c.cliente_id)} style={miniBtn("#dcfce7", "#166534")}>Activar contrato</button>
                  )}

                  <button onClick={() => cancelarContrato(c.id, c.moto_id)} style={miniBtn("#fee2e2", "#991b1b")}>Cancelar</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "white", borderRadius: 16, padding: 24, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0 }}>Nuevo contrato</h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <div>
                <div style={labelStyle}>Seleccionar cliente</div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
                  <select style={{ ...inputStyle, paddingLeft: 36 }} value={form.cliente_id} onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value }))}>
                    <option value="">Seleccionar cliente aprobado</option>
                    {clientesAprobados.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.cedula}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div style={labelStyle}>Forma de pago</div>
                <select style={inputStyle} value={form.forma_pago} onChange={(e) => setForm((p) => ({ ...p, forma_pago: e.target.value }))}>
                  <option value="Semanal">Semanal</option>
                  <option value="Diario">Diario</option>
                </select>
              </div>

              {form.forma_pago === "Diario" && (
                <div>
                  <div style={labelStyle}>Valor diario</div>
                  <select style={inputStyle} value={form.valor_diario} onChange={(e) => setForm((p) => ({ ...p, valor_diario: e.target.value }))}>
                    <option value="">Seleccionar valor diario</option>
                    {[8000, 10000, 12000, 15000, 18000, 20000].map((v) => (
                      <option key={v} value={String(v)}>$ {v.toLocaleString("es-CO")}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div style={labelStyle}>Valor semanal</div>
                <select style={inputStyle} value={form.valor_semanal} onChange={(e) => setForm((p) => ({ ...p, valor_semanal: e.target.value }))}>
                  <option value="">Seleccionar valor semanal</option>
                  {VALORES_SEMANALES.map((v) => (
                    <option key={v} value={String(v)}>$ {v.toLocaleString("es-CO")}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={labelStyle}>Día de pago</div>
                <select style={inputStyle} value={form.dia_pago} onChange={(e) => setForm((p) => ({ ...p, dia_pago: e.target.value }))}>
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div><div style={labelStyle}>Meses</div><input type="number" style={inputStyle} value={form.meses} onChange={(e) => setForm((p) => ({ ...p, meses: e.target.value }))} /></div>
              <div><div style={labelStyle}>Ahorro inicial</div><input type="number" style={inputStyle} value={form.ahorro_inicial} onChange={(e) => setForm((p) => ({ ...p, ahorro_inicial: e.target.value }))} /></div>
              <div><div style={labelStyle}>Fecha de entrega</div><input type="date" style={inputStyle} value={form.fecha_entrega} onChange={(e) => setForm((p) => ({ ...p, fecha_entrega: e.target.value }))} /></div>
            </div>

            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleCrear} disabled={guardando} style={primaryBtn}>{guardando ? "Guardando..." : "Guardar contrato"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
