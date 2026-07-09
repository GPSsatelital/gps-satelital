import { useState } from "react";
import { useLiquidaciones, type Liquidacion, type DetalleDano, type DetalleDeuda, type MotivoLiquidacion } from "../hooks/useLiquidaciones";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type Moto } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import { generarDocumentoLiquidacion } from "../utils/generarDocumentoLiquidacion";
import { generarHTMLPazYSalvo } from "../hooks/useDocumentos";
import MoneyInput from "../components/MoneyInput";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const btn = (bg: string, color = "white"): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: 12, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 });
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 13, outline: "none" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4, display: "block" };

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  iniciada: { label: "Iniciada", color: "#92400e", bg: "#fef3c7" },
  en_taller: { label: "En taller", color: "#3730a3", bg: "#e0e7ff" },
  calculada: { label: "Calculada", color: "#0369a1", bg: "#e0f2fe" },
  documento_generado: { label: "Doc. generado", color: "#6d28d9", bg: "#ede9fe" },
  firmada: { label: "Firmada", color: "#166534", bg: "#dcfce7" },
  cerrada: { label: "Cerrada", color: "#475569", bg: "#f1f5f9" },
};

const PASOS = ["iniciada", "en_taller", "calculada", "documento_generado", "firmada", "cerrada"];

const MOTIVO_LABEL: Record<MotivoLiquidacion, string> = {
  cumplimiento: "Cumplimiento de contrato",
  retiro_voluntario: "Retiro voluntario",
  incumplimiento: "Incumplimiento",
};

function Badge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: "#334155", bg: "#e2e8f0" };
  return <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>;
}

function Stepper({ estado }: { estado: string }) {
  const idx = PASOS.indexOf(estado);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", margin: "12px 0" }}>
      {PASOS.map((p, i) => {
        const cfg = ESTADO_CONFIG[p];
        const activo = i === idx;
        const pasado = i < idx;
        return (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              background: pasado ? "#10b981" : activo ? cfg.bg : "#e2e8f0",
              color: pasado ? "white" : activo ? cfg.color : "#94a3b8",
              border: activo ? `2px solid ${cfg.color}` : "2px solid transparent",
            }}>
              {pasado ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10, color: activo ? cfg.color : "#94a3b8", fontWeight: activo ? 700 : 400, display: "none" }}>{cfg.label}</span>
            {i < PASOS.length - 1 && <div style={{ width: 16, height: 2, background: pasado ? "#10b981" : "#e2e8f0" }} />}
          </div>
        );
      })}
      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: ESTADO_CONFIG[estado]?.color }}>{ESTADO_CONFIG[estado]?.label}</span>
    </div>
  );
}

export default function LiquidacionesView() {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";
  const esAdmin = role === "ADMIN" || role === "ADMIN_PRINCIPAL";

  const { filtrarMotos } = useScope();
  const { liquidaciones, loading, registrarRevisionTaller, calcularSaldo, marcarDocumentoGenerado, subirDocumentoFirmado, confirmarCierre } = useLiquidaciones();
  const { clientes } = useClientes();
  const { motos: todasMotos } = useMotos();
  const { contratos } = useContratos();
  const motos = filtrarMotos(todasMotos);

  const [sel, setSel] = useState<Liquidacion | null>(null);

  // Estados formulario taller
  const [obsT, setObsT] = useState("");
  const [danos, setDanos] = useState<DetalleDano[]>([{ concepto: "", monto: 0 }]);
  const [deudas, setDeudas] = useState<DetalleDeuda[]>([{ concepto: "", monto: 0 }]);
  const [nombreResp, setNombreResp] = useState("");
  const [cargoResp, setCargoResp] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const activas = liquidaciones.filter((l) => l.estado !== "cerrada");
  const cerradas = liquidaciones.filter((l) => l.estado === "cerrada");

  function seleccionar(l: Liquidacion) {
    setSel(l);
    setMsg(null);
    setObsT(l.observaciones_taller ?? "");
    setDanos(l.detalle_danos.length > 0 ? l.detalle_danos : [{ concepto: "", monto: 0 }]);
    setDeudas(l.detalle_deudas.length > 0 ? l.detalle_deudas : [{ concepto: "", monto: 0 }]);
    setNombreResp(l.nombre_responsable ?? "");
    setCargoResp(l.cargo_responsable ?? "");
  }

  function clienteDe(liq: Liquidacion) {
    return clientes.find((c) => c.id === liq.cliente_id);
  }

  function motoDe(liq: Liquidacion) {
    return motos.find((m) => m.id === liq.moto_id) ?? null;
  }

  async function handleRegistrarTaller() {
    if (!sel) return;
    if (!confirm("¿Registrar la revisión de taller con estos daños y deudas? Se recalculará el saldo de la liquidación.")) return;
    setGuardando(true);
    const danosValidos = danos.filter((d) => d.concepto.trim());
    const deudasValidas = deudas.filter((d) => d.concepto.trim());
    const totalDanos = danosValidos.reduce((s, d) => s + Number(d.monto), 0);
    const totalDeudas = deudasValidas.reduce((s, d) => s + Number(d.monto), 0);
    const { error } = await registrarRevisionTaller(sel.id, obsT, danosValidos, totalDanos, deudasValidas, totalDeudas);
    await calcularSaldo(sel.id, sel.ahorro_acumulado, totalDeudas, totalDanos);
    setGuardando(false);
    if (error) setMsg(error);
    else setMsg("Revisión registrada correctamente.");
  }

  async function handleGenerarDoc() {
    if (!sel || !nombreResp.trim()) { setMsg("Ingresa el nombre del responsable."); return; }
    if (!confirm("¿Generar el documento de liquidación con estos datos?")) return;
    setGuardando(true);
    const { error } = await marcarDocumentoGenerado(sel.id, nombreResp, cargoResp);
    setGuardando(false);
    if (error) { setMsg(error); return; }
    const cliente = clienteDe(sel);
    const moto = motoDe(sel);
    generarDocumentoLiquidacion(sel, { nombre: cliente?.nombre ?? "", cedula: (cliente as any)?.cedula, telefono: cliente?.telefono }, moto ? { marca: (moto as any).marca, modelo: (moto as any).modelo, placa: moto.placa } : null);
  }

  async function handleSubirFirmado(file: File) {
    if (!sel) return;
    if (!confirm("¿Subir este documento firmado a la liquidación?")) return;
    setGuardando(true);
    const { error } = await subirDocumentoFirmado(sel.id, file);
    setGuardando(false);
    if (error) setMsg(error);
    else setMsg("Documento firmado subido correctamente.");
  }

  async function handleCerrar() {
    if (!sel || !profile) return;
    if (!confirm("¿Cerrar definitivamente esta liquidación? Esta acción define el saldo final, el estado del contrato y de la moto, y no se puede deshacer.")) return;
    setGuardando(true);
    const { error } = await confirmarCierre(sel.id, profile.id);
    setGuardando(false);
    if (error) setMsg(error);
    else { setMsg("Liquidación cerrada."); setSel(null); }
  }

  // Paz y Salvo — constancia de cumplimiento y transferencia de la moto al cliente.
  function handlePazYSalvo() {
    if (!sel) return;
    const cliente = clienteDe(sel);
    const contrato = contratos.find(ct => ct.id === sel.contrato_id);
    if (!cliente || !contrato) { setMsg("No se encontró el cliente o el contrato."); return; }
    const moto = motoDe(sel);
    const html = generarHTMLPazYSalvo(contrato, cliente, (moto as Moto | null));
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Paz y Salvo</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  }

  if (!esAdmin) {
    return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Acceso restringido a administradores.</div>;
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: sel ? "320px 1fr" : "1fr", gap: 16 }}>
      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {activas.length === 0 && cerradas.length === 0 && (
          <div style={{ ...card, color: "#64748b", textAlign: "center" }}>No hay liquidaciones registradas.</div>
        )}

        {activas.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>En proceso ({activas.length})</div>
            {activas.map((l) => {
              const cliente = clienteDe(l);
              return (
                <div key={l.id} onClick={() => seleccionar(l)} style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: sel?.id === l.id ? "#f0f9ff" : "#f8fafc", marginBottom: 8, border: sel?.id === l.id ? "2px solid #0284c7" : "2px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{l.numero}</span>
                    <Badge estado={l.estado} />
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"} · {MOTIVO_LABEL[l.motivo]}</div>
                </div>
              );
            })}
          </div>
        )}

        {cerradas.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: "#64748b" }}>Cerradas ({cerradas.length})</div>
            {cerradas.map((l) => {
              const cliente = clienteDe(l);
              return (
                <div key={l.id} onClick={() => seleccionar(l)} style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: sel?.id === l.id ? "#f8fafc" : "transparent", marginBottom: 6, border: sel?.id === l.id ? "2px solid #e2e8f0" : "2px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#64748b" }}>{l.numero}</span>
                    <Badge estado={l.estado} />
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detalle */}
      {sel && (() => {
        const cliente = clienteDe(sel);
        motoDe(sel);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{sel.numero}</div>
                  <div style={{ fontSize: 13, color: "#64748b", textTransform: "uppercase" }}>{cliente?.nombre ?? "—"} · {MOTIVO_LABEL[sel.motivo]}</div>
                </div>
                <button onClick={() => setSel(null)} style={btn("#e2e8f0", "#334155")}>✕</button>
              </div>
              <Stepper estado={sel.estado} />

              {/* Resumen financiero */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, marginTop: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#64748b" }}>Ahorro acumulado</span><span style={{ fontWeight: 600, color: "#16a34a" }}>${sel.ahorro_acumulado.toLocaleString("es-CO")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#64748b" }}>Total deudas</span><span style={{ fontWeight: 600, color: "#dc2626" }}>- ${sel.total_deudas.toLocaleString("es-CO")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "#64748b" }}>Costo daños</span><span style={{ fontWeight: 600, color: "#dc2626" }}>- ${sel.costo_danos.toLocaleString("es-CO")}</span></div>
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Saldo final</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: sel.saldo_final >= 0 ? "#16a34a" : "#dc2626" }}>
                    {sel.saldo_final >= 0 ? `$${sel.saldo_final.toLocaleString("es-CO")} a favor` : `$${Math.abs(sel.saldo_final).toLocaleString("es-CO")} pendiente`}
                  </span>
                </div>
              </div>
            </div>

            {msg && <div style={{ ...card, background: msg.includes("error") || msg.includes("Error") ? "#fef2f2" : "#f0fdf4", color: msg.includes("error") || msg.includes("Error") ? "#dc2626" : "#16a34a", fontSize: 13 }}>{msg}</div>}

            {/* Paso: registrar revisión taller */}
            {(sel.estado === "iniciada" || sel.estado === "en_taller") && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Revisión de taller</div>

                <label style={label}>Observaciones</label>
                <textarea value={obsT} onChange={(e) => setObsT(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} placeholder="Estado del vehículo, observaciones..." />

                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Daños (si aplica)</div>
                {danos.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Concepto" value={d.concepto} onChange={(e) => setDanos(danos.map((x, j) => j === i ? { ...x, concepto: e.target.value } : x))} />
                    <MoneyInput style={{ flex: 1 }} value={d.monto ? String(d.monto) : ""} onChange={v => setDanos(danos.map((x, j) => j === i ? { ...x, monto: Number(v) || 0 } : x))} />
                    {danos.length > 1 && <button style={btn("#fef2f2", "#dc2626")} onClick={() => setDanos(danos.filter((_, j) => j !== i))}>✕</button>}
                  </div>
                ))}
                <button style={{ ...btn("#f1f5f9", "#334155"), marginBottom: 14, fontSize: 12 }} onClick={() => setDanos([...danos, { concepto: "", monto: 0 }])}>+ Agregar daño</button>

                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Deudas pendientes</div>
                {deudas.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Concepto" value={d.concepto} onChange={(e) => setDeudas(deudas.map((x, j) => j === i ? { ...x, concepto: e.target.value } : x))} />
                    <MoneyInput style={{ flex: 1 }} value={d.monto ? String(d.monto) : ""} onChange={v => setDeudas(deudas.map((x, j) => j === i ? { ...x, monto: Number(v) || 0 } : x))} />
                    {deudas.length > 1 && <button style={btn("#fef2f2", "#dc2626")} onClick={() => setDeudas(deudas.filter((_, j) => j !== i))}>✕</button>}
                  </div>
                ))}
                <button style={{ ...btn("#f1f5f9", "#334155"), marginBottom: 14, fontSize: 12 }} onClick={() => setDeudas([...deudas, { concepto: "", monto: 0 }])}>+ Agregar deuda</button>

                <button style={btn("#0284c7")} onClick={handleRegistrarTaller} disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar revisión y calcular"}
                </button>
              </div>
            )}

            {/* Paso: generar documento */}
            {sel.estado === "calculada" && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Generar documento de liquidación</div>
                <label style={label}>Nombre del responsable (empresa)</label>
                <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Ej: Carlos Martínez" value={nombreResp} onChange={(e) => setNombreResp(e.target.value)} />
                <label style={label}>Cargo</label>
                <input style={{ ...inputStyle, marginBottom: 14 }} placeholder="Ej: Gerente" value={cargoResp} onChange={(e) => setCargoResp(e.target.value)} />
                <button style={btn("#7c3aed")} onClick={handleGenerarDoc} disabled={guardando}>
                  {guardando ? "Generando..." : "Generar e imprimir documento"}
                </button>
              </div>
            )}

            {/* Paso: subir documento firmado */}
            {sel.estado === "documento_generado" && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Subir documento firmado por el cliente</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Fotografía o escaneo del documento con la firma del cliente.</div>
                {sel.documento_firmado_url && (
                  <div style={{ marginBottom: 10 }}>
                    <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", fontSize: 13 }}>Ver documento actual</a>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ ...btn("#0284c7"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirFirmado(f); }} />
                  </label>
                  <label style={{ ...btn("#475569"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    🖼 Galería / PDF
                    <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirFirmado(f); }} />
                  </label>
                </div>
              </div>
            )}

            {/* Paso: confirmar cierre */}
            {sel.estado === "firmada" && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Confirmar cierre de liquidación</div>
                {sel.documento_firmado_url && (
                  <div style={{ marginBottom: 12 }}>
                    <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", fontSize: 13 }}>Ver documento firmado</a>
                  </div>
                )}
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                  Al confirmar: el contrato quedará <strong>{sel.motivo === "incumplimiento" ? "Cancelado" : "Finalizado"}</strong>
                  {sel.motivo === "cumplimiento" ? ", la moto pasará a En traspaso (propiedad del cliente) y el cliente quedará Egresado" : ""}
                  {sel.saldo_final < 0 ? " y el cliente será marcado en lista negra por saldo pendiente" : ""}.
                </div>
                <button style={btn(sel.saldo_final < 0 ? "#dc2626" : "#16a34a")} onClick={handleCerrar} disabled={guardando}>
                  {guardando ? "Cerrando..." : "Confirmar y cerrar liquidación"}
                </button>
              </div>
            )}

            {sel.estado === "cerrada" && (
              <div style={{ ...card, background: "#f0fdf4", color: "#166534", fontWeight: 700, textAlign: "center" }}>
                Liquidación cerrada
                {sel.documento_firmado_url && (
                  <div style={{ marginTop: 8 }}>
                    <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", fontSize: 13, fontWeight: 400 }}>Descargar documento firmado</a>
                  </div>
                )}
                {sel.motivo === "cumplimiento" && (
                  <div style={{ marginTop: 10 }}>
                    <button style={btn("#0284c7")} onClick={handlePazYSalvo}>🖨️ Imprimir Paz y Salvo</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
