import React, { useEffect, useMemo, useState } from "react";
import { useContratos, type ContratoEstado, type FormaPago, diasHastaProximoDiaPago } from "../hooks/useContratos";
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

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

const ESTADO_COLORS: Record<ContratoEstado, { bg: string; color: string }> = {
  "En proceso": { bg: "#fef3c7", color: "#92400e" },
  Activo: { bg: "#dcfce7", color: "#166534" },
  Finalizado: { bg: "#dbeafe", color: "#1d4ed8" },
  Cancelado: { bg: "#ffe4e6", color: "#be123c" },
  Suspendido: { bg: "#ede9fe", color: "#6d28d9" },
};

function ContractBadge({ estado }: { estado: ContratoEstado }) {
  const c = ESTADO_COLORS[estado] ?? { bg: "#f1f5f9", color: "#334155" };
  return (
    <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 999, background: c.bg, color: c.color, fontSize: 12, fontWeight: 700 }}>
      {estado}
    </span>
  );
}

const TARIFAS_DIARIAS = [26000, 27000, 28000, 30000, 32000, 35000, 40000];
const VALORES_SEMANAL = [195000, 202000, 210000, 220000, 250000, 300000];
const VALORES_QUINCENAL = [390000, 404000, 420000, 440000, 500000];
const VALORES_MENSUAL = [780000, 808000, 840000, 880000, 1000000];

function getValoresPorForma(forma: string) {
  if (forma === "Semanal") return VALORES_SEMANAL;
  if (forma === "Quincenal") return VALORES_QUINCENAL;
  if (forma === "Mensual") return VALORES_MENSUAL;
  return [];
}

function emptyForm() {
  return {
    cliente_id: "",
    forma_pago: "Semanal",
    dia_pago: "Lunes",
    valor_semanal: "",
    tarifa_diaria: "27000",
    meses: "",
    ahorro_inicial: "",
    fecha_entrega: new Date().toISOString().slice(0, 10),
  };
}

const FILTROS = [
  { label: "Todos", value: "" },
  { label: "En proceso", value: "En proceso" },
  { label: "Activos", value: "Activo" },
  { label: "Suspendidos", value: "Suspendido" },
  { label: "Finalizados", value: "Finalizado" },
  { label: "Cancelados", value: "Cancelado" },
];

export default function ContratosView({ initialFilter = "" }: { initialFilter?: string }) {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";
  const puedeCrear = role === "ADMIN" || role === "ADMIN_PRINCIPAL";

  const { contratos, loading, error, crearContrato, firmarCliente, asignarMoto, activarContrato, cancelarContrato, suspenderContrato } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const [filtroEstado, setFiltroEstado] = useState(initialFilter);
  useEffect(() => { setFiltroEstado(initialFilter); }, [initialFilter]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const clientesAprobados = clientes.filter((c) => c.estado === "Aprobado");
  const motosDisponibles = motos.filter((m) => m.estado === "Disponible");

  // Prorrateo: días hasta próximo lunes o miércoles
  const prorrateo = useMemo(() => {
    if (form.forma_pago === "Diario" || !form.fecha_entrega) return null;
    const info = diasHastaProximoDiaPago(form.fecha_entrega);
    if (info.diasHasta === 0) return null;
    const tarifa = Number(form.tarifa_diaria || 27000);
    const cuotaDiaria = form.valor_semanal ? Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)) : tarifa;
    return { ...info, valorProrrateo: cuotaDiaria * info.diasHasta };
  }, [form.fecha_entrega, form.forma_pago, form.valor_semanal, form.tarifa_diaria]);

  const clienteSeleccionado = useMemo(() => clientes.find(c => c.id === form.cliente_id), [clientes, form.cliente_id]);

  function handleClienteChange(clienteId: string) {
    const cliente = clientes.find(c => c.id === clienteId);
    setForm(p => ({
      ...p,
      cliente_id: clienteId,
      forma_pago: cliente?.ruta_contrato === "diario" ? "Diario" : "Semanal",
    }));
  }

  async function handleCrear() {
    if (!form.cliente_id || (!form.valor_semanal && form.forma_pago !== "Diario") || !form.fecha_entrega) {
      setFormError("Completa cliente, valor por período y fecha de entrega.");
      return;
    }
    if (form.forma_pago !== "Diario" && !form.meses) {
      setFormError("Ingresa la duración en meses.");
      return;
    }

    const cliente = clientes.find((c) => c.id === form.cliente_id);
    if (!cliente || cliente.estado !== "Aprobado") {
      setFormError("El cliente debe estar aprobado.");
      return;
    }

    const yaActivo = contratos.some(c => c.cliente_id === form.cliente_id && (c.estado === "Activo" || c.estado === "En proceso"));
    if (yaActivo) {
      setFormError("Este cliente ya tiene un contrato activo o en proceso.");
      return;
    }

    const tarifa = Number(form.tarifa_diaria || 27000);
    const valor = form.forma_pago === "Diario" ? tarifa : Number(form.valor_semanal);
    const diasPeriodo = form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30;
    const cuotaDiaria = form.forma_pago === "Diario" ? tarifa : Math.round(valor / diasPeriodo);
    const ahorroDiario = Math.max(cuotaDiaria - tarifa, 0);
    const diaPago = form.forma_pago === "Diario" ? "Diario" : form.dia_pago;

    setGuardando(true);
    const { error } = await crearContrato({
      cliente_id: form.cliente_id,
      dia_pago: diaPago,
      forma_pago: form.forma_pago as FormaPago,
      valor_semanal: valor,
      meses: form.forma_pago === "Diario" ? null : Number(form.meses),
      ahorro_inicial: Number(form.ahorro_inicial || 0),
      fecha_entrega: form.fecha_entrega,
      tipo_ruta: cliente?.ruta_contrato ?? "tiempo_definido",
      tarifa_diaria: tarifa,
      tarifa_domingo: Math.round(tarifa / 2),
      ahorro_diario: ahorroDiario,
      base_inicial: 510000,
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
    if (!firmaCliente) { alert("Primero debe firmar el cliente."); return; }
    const enUso = contratos.some(c => c.moto_id === motoId && c.id !== contratoId && c.estado !== "Cancelado" && c.estado !== "Suspendido");
    if (enUso) { alert("Esta moto ya está asignada a otro contrato."); return; }
    await asignarMoto(contratoId, motoId);
  }

  async function handleActivar(contratoId: string, motoId: string | null, clienteId: string) {
    if (!motoId) { alert("Debe tener moto asignada."); return; }
    await activarContrato(contratoId, motoId, clienteId);
  }

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando contratos...</div>;

  const contratosFiltrados = contratos.filter(c => filtroEstado ? c.estado === filtroEstado : true);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Contratos</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Solo clientes aprobados con visita domiciliaria.</p>
        </div>
        {puedeCrear && <button onClick={() => setOpen(true)} style={primaryBtn}>+ Nuevo contrato</button>}
      </div>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {error}</div>}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
        {FILTROS.map(f => (
          <button key={f.value} onClick={() => setFiltroEstado(f.value)} style={{ padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filtroEstado === f.value ? 700 : 500, background: filtroEstado === f.value ? "#0284c7" : "#f1f5f9", color: filtroEstado === f.value ? "white" : "#64748b", whiteSpace: "nowrap" }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {contratosFiltrados.length === 0 && (
          <div style={card}><div style={{ color: "#64748b" }}>No hay contratos en este estado.</div></div>
        )}

        {contratosFiltrados.map((c) => {
          const cliente = clientes.find(cl => cl.id === c.cliente_id);
          const moto = motos.find(m => m.id === c.moto_id);
          const esDiario = c.forma_pago === "Diario" || c.tipo_ruta === "diario";
          const ahorro = c.ahorro_acumulado ?? 0;
          const ahorroMeta = c.base_inicial ?? 510000;
          const pctAhorro = Math.min(100, Math.round((ahorro / ahorroMeta) * 100));
          const alertaBase = esDiario && !c.base_completada && ahorro >= ahorroMeta * 0.9;

          return (
            <div key={c.id} style={{ ...card, borderLeft: c.base_completada ? "4px solid #10b981" : alertaBase ? "4px solid #f59e0b" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 15 }}>{cliente?.nombre ?? "Sin cliente"}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {esDiario ? "Ruta diario" : `Ruta ${c.forma_pago?.toLowerCase()}`}
                    {moto ? ` · ${moto.placa}` : " · Sin moto"}
                    {c.dia_pago && !esDiario ? ` · Paga ${c.dia_pago}` : ""}
                  </div>
                </div>
                <ContractBadge estado={c.estado} />
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
                <div><span style={{ color: "#64748b" }}>Valor: </span><strong>$ {fmt(c.valor_semanal)}</strong>{!esDiario ? `/${c.forma_pago?.toLowerCase()}` : "/día"}</div>
                <div><span style={{ color: "#64748b" }}>Tarifa: </span><strong>$ {fmt(c.tarifa_diaria ?? 27000)}/día</strong></div>
                {!esDiario && c.meses && <div><span style={{ color: "#64748b" }}>Duración: </span><strong>{c.meses} meses</strong></div>}
                {c.fecha_entrega && <div><span style={{ color: "#64748b" }}>Entrega: </span><strong>{new Date(c.fecha_entrega + "T00:00:00").toLocaleDateString("es-CO")}</strong></div>}
              </div>

              {esDiario && (
                <div style={{ marginTop: 10 }}>
                  {c.base_completada ? (
                    <div style={{ padding: "8px 12px", borderRadius: 10, background: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 13 }}>
                      ✅ Base completada — listo para cambio de contrato
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                        <span>Ahorro acumulado: $ {fmt(ahorro)}</span>
                        <span>{pctAhorro}% de $ {fmt(ahorroMeta)}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, width: `${pctAhorro}%`, background: alertaBase ? "#f59e0b" : "#0284c7", transition: "width 0.3s" }} />
                      </div>
                      {alertaBase && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#92400e", fontWeight: 700 }}>
                          ⚠️ Casi completa — avisar al admin para tramitar cambio
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {puedeCrear && c.estado !== "Cancelado" && c.estado !== "Finalizado" && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!c.firma_cliente && (
                    <button onClick={() => firmarCliente(c.id)} style={miniBtn("#dbeafe", "#1d4ed8")}>Firmar cliente</button>
                  )}
                  {c.firma_cliente && !c.moto_id && (
                    <select style={{ ...inputStyle, maxWidth: 260, padding: "8px 12px" }} defaultValue="" onChange={(e) => handleAsignarMoto(c.id, e.target.value, c.firma_cliente)}>
                      <option value="">Asignar moto disponible</option>
                      {motosDisponibles.map(m => <option key={m.id} value={m.id}>{m.placa} - {m.marca} {m.modelo}</option>)}
                    </select>
                  )}
                  {c.moto_id && c.estado === "En proceso" && (
                    <button onClick={() => handleActivar(c.id, c.moto_id, c.cliente_id)} style={miniBtn("#dcfce7", "#166534")}>Activar contrato</button>
                  )}
                  {c.estado === "Activo" && (
                    <button onClick={() => suspenderContrato(c.id, c.moto_id)} style={miniBtn("#ede9fe", "#6d28d9")}>Suspender</button>
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
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "white", borderRadius: 20, padding: 24, maxHeight: "92vh", overflowY: "auto" }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Nuevo contrato</h3>

            <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
              <div>
                <div style={labelStyle}>Cliente</div>
                <select style={inputStyle} value={form.cliente_id} onChange={e => handleClienteChange(e.target.value)}>
                  <option value="">Seleccionar cliente aprobado</option>
                  {clientesAprobados.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.cedula}</option>)}
                </select>
                {clienteSeleccionado?.ruta_contrato && (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#0284c7", fontWeight: 600 }}>
                    Ruta del cliente: {clienteSeleccionado.ruta_contrato === "diario" ? "Diario (ahorrando base)" : "Tiempo definido"}
                  </div>
                )}
              </div>

              <div>
                <div style={labelStyle}>Modalidad de pago</div>
                <select style={inputStyle} value={form.forma_pago} onChange={e => setForm(p => ({ ...p, forma_pago: e.target.value, valor_semanal: "" }))}>
                  <option value="Diario">Diario — pago cada día, ahorrando base</option>
                  <option value="Semanal">Semanal — pago cada semana</option>
                  <option value="Quincenal">Quincenal — pago cada 15 días</option>
                  <option value="Mensual">Mensual — pago cada mes</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>Tarifa diaria empresa</div>
                <select style={inputStyle} value={form.tarifa_diaria} onChange={e => setForm(p => ({ ...p, tarifa_diaria: e.target.value }))}>
                  {TARIFAS_DIARIAS.map(v => <option key={v} value={String(v)}>$ {fmt(v)}/día</option>)}
                </select>
              </div>

              {form.forma_pago !== "Diario" && (
                <>
                  <div>
                    <div style={labelStyle}>Valor por período</div>
                    <select style={inputStyle} value={form.valor_semanal} onChange={e => setForm(p => ({ ...p, valor_semanal: e.target.value }))}>
                      <option value="">Seleccionar valor</option>
                      {getValoresPorForma(form.forma_pago).map(v => (
                        <option key={v} value={String(v)}>$ {fmt(v)}</option>
                      ))}
                    </select>
                    {form.valor_semanal && form.tarifa_diaria && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                        ≈ $ {fmt(Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)))}/día
                        · Ahorro: $ {fmt(Math.max(Math.round(Number(form.valor_semanal) / (form.forma_pago === "Semanal" ? 7 : form.forma_pago === "Quincenal" ? 15 : 30)) - Number(form.tarifa_diaria), 0))}/día
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={labelStyle}>Día de pago (solo Lunes o Miércoles)</div>
                    <select style={inputStyle} value={form.dia_pago} onChange={e => setForm(p => ({ ...p, dia_pago: e.target.value }))}>
                      <option value="Lunes">Lunes</option>
                      <option value="Miércoles">Miércoles</option>
                    </select>
                  </div>

                  <div>
                    <div style={labelStyle}>Duración (meses)</div>
                    <input type="number" min="1" max="36" style={inputStyle} value={form.meses} onChange={e => setForm(p => ({ ...p, meses: e.target.value }))} placeholder="Ej. 12" />
                  </div>
                </>
              )}

              <div>
                <div style={labelStyle}>Ahorro inicial entregado</div>
                <input type="number" style={inputStyle} value={form.ahorro_inicial} onChange={e => setForm(p => ({ ...p, ahorro_inicial: e.target.value }))} placeholder="$ 0" />
              </div>

              <div>
                <div style={labelStyle}>Fecha de entrega</div>
                <input type="date" style={inputStyle} value={form.fecha_entrega} onChange={e => setForm(p => ({ ...p, fecha_entrega: e.target.value }))} />
              </div>

              {prorrateo && prorrateo.diasHasta > 0 && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1" }}>Prorrateo hasta primer día de pago</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    {prorrateo.diasHasta} días hasta el próximo {prorrateo.diaSemana} ({new Date(prorrateo.proximaFecha + "T00:00:00").toLocaleDateString("es-CO")})
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0284c7", marginTop: 4 }}>
                    Cobrar al firmar: $ {fmt(prorrateo.valorProrrateo)}
                  </div>
                </div>
              )}
            </div>

            {formError && <div style={{ marginTop: 12, color: "#991b1b", fontWeight: 600 }}>{formError}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setOpen(false)} style={secondaryBtn}>Cancelar</button>
              <button onClick={handleCrear} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.7 : 1 }}>
                {guardando ? "Guardando..." : "Crear contrato"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
