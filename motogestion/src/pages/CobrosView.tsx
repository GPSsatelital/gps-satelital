import React, { useMemo, useState } from "react";
import { usePagos, calcularEstadoCobro, aplicarPagoAutomatico, type MetodoPago, type PagoEstado } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#334155" };
const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = { background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 14, padding: "10px 16px", fontWeight: 700, cursor: "pointer" };

function miniBtn(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, border: "none", borderRadius: 999, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer" };
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-CO");
}

function fmt(n: number) {
  return n.toLocaleString("es-CO");
}

function PagoBadge({ estado }: { estado: PagoEstado }) {
  const map: Record<PagoEstado, { bg: string; color: string }> = {
    Confirmado: { bg: "#dcfce7", color: "#166534" },
    Pendiente: { bg: "#fef3c7", color: "#92400e" },
    Rechazado: { bg: "#fee2e2", color: "#991b1b" },
  };
  const colors = map[estado];
  return <span style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: colors.bg, color: colors.color }}>{estado}</span>;
}

export default function CobrosView() {
  const { pagos, loading, error, registrarPago, confirmarPago, rechazarPago } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();

  const [contratoId, setContratoId] = useState("");
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [formError, setFormError] = useState<string | null>(null);

  const contratosActivos = contratos.filter((c) => c.estado === "Activo");
  const contratoSeleccionado = contratos.find((c) => c.id === contratoId) ?? null;

  function pagosConfirmadosDelContrato(id: string) {
    return pagos.filter((p) => p.contrato_id === id && p.estado === "Confirmado");
  }

  const resumenContrato = contratoSeleccionado
    ? calcularEstadoCobro(contratoSeleccionado, pagosConfirmadosDelContrato(contratoSeleccionado.id))
    : null;

  async function handleRegistrar() {
    if (!contratoId || !valor) {
      setFormError("Selecciona contrato e ingresa valor.");
      return;
    }

    const contrato = contratos.find((c) => c.id === contratoId);
    if (!contrato || contrato.estado !== "Activo") {
      setFormError("Solo se pueden registrar pagos a contratos activos.");
      return;
    }

    const monto = Number(valor);
    if (Number.isNaN(monto) || monto <= 0) {
      setFormError("Ingresa un valor válido.");
      return;
    }

    const aplicado = aplicarPagoAutomatico(monto, contrato, pagosConfirmadosDelContrato(contrato.id));
    const { error } = await registrarPago(contratoId, monto, metodo, aplicado);

    if (error) {
      setFormError(error);
      return;
    }

    setValor("");
    setFormError(null);
  }

  const resumenCartera = useMemo(() => {
    return contratos.map((contrato) => {
      const pagosContrato = pagos.filter((p) => p.contrato_id === contrato.id && p.estado === "Confirmado");
      const pagosPendientes = pagos.filter((p) => p.contrato_id === contrato.id && p.estado === "Pendiente");

      const totalPagado = pagosContrato.reduce((acc, p) => acc + p.valor, 0);
      const totalSemana = pagosContrato.reduce((acc, p) => acc + p.aplicado.semana, 0);
      const totalAhorro = pagosContrato.reduce((acc, p) => acc + p.aplicado.ahorro, 0);
      const totalSaldo = pagosContrato.reduce((acc, p) => acc + p.aplicado.saldo, 0);

      const semanaPendiente = Math.max(contrato.valor_semanal - totalSemana, 0);
      const enMora = contrato.estado === "Activo" && semanaPendiente > 0 && pagosContrato.length > 0;
      const enGabela = contrato.estado === "Activo" && pagosContrato.length === 0;
      const hoyPaga = contrato.estado === "Activo" && semanaPendiente > 0 && !enMora;

      return { ...contrato, totalPagado, totalSemana, totalAhorro, totalSaldo, semanaPendiente, pagosPendientes: pagosPendientes.length, enMora, enGabela, hoyPaga };
    });
  }, [contratos, pagos]);

  const hoy = resumenCartera.filter((r) => r.hoyPaga);
  const mora = resumenCartera.filter((r) => r.enMora);
  const gabela = resumenCartera.filter((r) => r.enGabela);
  const pendientesTotal = resumenCartera.reduce((acc, r) => acc + r.pagosPendientes, 0);

  if (loading) return <div style={{ padding: 24, color: "#64748b" }}>Cargando cobros...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 22, margin: 0 }}>Cobros y Cartera</h2>
      <p style={{ marginTop: 6, color: "#64748b" }}>Registro de pagos con aplicación automática y control de cartera.</p>

      {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginTop: 20 }}>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>Pagan hoy</div><div style={{ fontSize: 22, fontWeight: 800 }}>{hoy.length}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>En mora</div><div style={{ fontSize: 22, fontWeight: 800 }}>{mora.length}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>En gabela</div><div style={{ fontSize: 22, fontWeight: 800 }}>{gabela.length}</div></div>
        <div style={card}><div style={{ fontSize: 14, color: "#64748b" }}>Transferencias pendientes</div><div style={{ fontSize: 22, fontWeight: 800 }}>{pendientesTotal}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 0.95fr) minmax(0, 1.2fr)", gap: 20, marginTop: 24 }}>
        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Registrar pago</h3>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div>
              <div style={labelStyle}>Contrato activo</div>
              <select style={inputStyle} value={contratoId} onChange={(e) => setContratoId(e.target.value)}>
                <option value="">Seleccionar contrato</option>
                {contratosActivos.map((c) => {
                  const cliente = clientes.find((cl) => cl.id === c.cliente_id);
                  return <option key={c.id} value={c.id}>{cliente?.nombre || "Sin cliente"}</option>;
                })}
              </select>
            </div>

            <div>
              <div style={labelStyle}>Valor recibido</div>
              <input type="number" style={inputStyle} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ej. 120000" />
            </div>

            <div>
              <div style={labelStyle}>Método de pago</div>
              <select style={inputStyle} value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {formError && <div style={{ color: "#991b1b", fontWeight: 600 }}>{formError}</div>}

            <button onClick={handleRegistrar} style={primaryBtn}>Registrar pago</button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ margin: 0, fontSize: 20 }}>Aplicación automática</h3>

          {contratoSeleccionado && resumenContrato ? (
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <InfoBox label="Valor semanal" value={`$ ${fmt(contratoSeleccionado.valor_semanal)}`} />
              <InfoBox label="Deuda atrasada pendiente" value={`$ ${fmt(resumenContrato.deudaAtrasadaPendiente)}`} />
              <InfoBox label="Semana actual pendiente" value={`$ ${fmt(resumenContrato.semanaActualPendiente)}`} />
              <InfoBox label="Ahorro pendiente" value={`$ ${fmt(resumenContrato.ahorroPendiente)}`} />
              <div style={{ fontSize: 12, color: "#64748b" }}>Las transferencias quedan pendientes y no afectan cartera hasta confirmarse.</div>
            </div>
          ) : (
            <div style={{ marginTop: 16, color: "#64748b" }}>Selecciona un contrato activo para ver cómo se aplicará el pago.</div>
          )}
        </div>
      </div>

      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>Historial de pagos</h3>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {pagos.length === 0 && <div style={{ color: "#64748b" }}>Aún no hay pagos registrados.</div>}

          {pagos.map((p) => {
            const contrato = contratos.find((c) => c.id === p.contrato_id);
            const cliente = contrato ? clientes.find((cl) => cl.id === contrato.cliente_id) : null;

            return (
              <div key={p.id} style={{ padding: 14, borderRadius: 18, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{cliente?.nombre || "Sin cliente"}</div>
                  <PagoBadge estado={p.estado} />
                </div>

                <div style={{ marginTop: 8, display: "grid", gap: 6, fontSize: 14, color: "#334155" }}>
                  <div>Fecha: {formatDate(p.fecha)}</div>
                  <div>Método: {p.metodo}</div>
                  <div>Valor recibido: $ {fmt(p.valor)}</div>
                  <div>Aplicado a deuda: $ {fmt(p.aplicado.deuda)}</div>
                  <div>Aplicado a semana: $ {fmt(p.aplicado.semana)}</div>
                  <div>Aplicado a ahorro: $ {fmt(p.aplicado.ahorro)}</div>
                  <div>Saldo a favor: $ {fmt(p.aplicado.saldo)}</div>
                </div>

                {p.estado === "Pendiente" && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>Confirmar</button>
                    <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>Rechazar</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...card, marginTop: 20 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>Detalle de cartera</h3>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          {resumenCartera.length === 0 && <div style={{ color: "#64748b" }}>Aún no hay contratos.</div>}

          {resumenCartera.map((c) => {
            const cliente = clientes.find((cl) => cl.id === c.cliente_id);
            return (
              <div key={c.id} style={{ padding: 14, background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{cliente?.nombre || "Sin cliente"}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>Estado contrato: {c.estado}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {c.enMora && <span style={miniBtn("#fee2e2", "#991b1b")}>En mora</span>}
                    {c.enGabela && <span style={miniBtn("#fef3c7", "#92400e")}>En gabela</span>}
                    {c.hoyPaga && <span style={miniBtn("#dbeafe", "#1d4ed8")}>Paga hoy</span>}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 6, fontSize: 14, color: "#334155" }}>
                  <div>Total confirmado: $ {fmt(c.totalPagado)}</div>
                  <div>Aplicado a semana: $ {fmt(c.totalSemana)}</div>
                  <div>Aplicado a ahorro: $ {fmt(c.totalAhorro)}</div>
                  <div>Saldo a favor: $ {fmt(c.totalSaldo)}</div>
                  <div>Pendiente semana: $ {fmt(c.semanaPendiente)}</div>
                  <div>Transferencias pendientes: {c.pagosPendientes}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
