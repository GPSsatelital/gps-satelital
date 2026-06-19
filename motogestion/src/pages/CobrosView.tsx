import React, { useMemo, useState } from "react";
import {
  usePagos,
  calcularAplicacion,
  type MetodoPago,
  type PagoEstado,
  type AplicadoPago,
} from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { useGestiones, type TipoGestion } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";

// ─── Styles ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};
const card: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};
const secondaryBtn: React.CSSProperties = {
  background: "#f1f5f9",
  color: "#334155",
  border: "none",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};

function miniBtn(bg: string, color: string): React.CSSProperties {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  };
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-CO");
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function PagoBadge({ estado }: { estado: PagoEstado }) {
  const map: Record<PagoEstado, { bg: string; color: string }> = {
    Confirmado: { bg: "#dcfce7", color: "#166534" },
    Pendiente: { bg: "#fef3c7", color: "#92400e" },
    Rechazado: { bg: "#fee2e2", color: "#991b1b" },
  };
  const colors = map[estado];
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: colors.bg,
        color: colors.color,
      }}
    >
      {estado}
    </span>
  );
}

type EstadoCartera = "al-dia" | "gabela" | "mora";

function EstadoBadge({ estado }: { estado: EstadoCartera }) {
  const map: Record<EstadoCartera, { bg: string; color: string; label: string }> = {
    "al-dia": { bg: "#dcfce7", color: "#166534", label: "Al dia" },
    gabela: { bg: "#fef3c7", color: "#92400e", label: "Gabela" },
    mora: { bg: "#fee2e2", color: "#991b1b", label: "Mora" },
  };
  const s = map[estado];
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? "#eff6ff" : "#f8fafc",
        borderRadius: 12,
        padding: "10px 14px",
        border: highlight ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: highlight ? "#1e40af" : "#0f172a" }}>{value}</div>
    </div>
  );
}

// ─── Day-of-week logic ────────────────────────────────────────────────────────
const DIAS: Record<string, number> = {
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sabado: 6,
  Sábado: 6,
  Domingo: 0,
};

/**
 * Returns the ISO day number (0=Sun, 1=Mon ... 6=Sat) for today.
 * Derives cartera status based on dia_pago of the contract.
 */
function calcularEstadoCartera(
  diaPago: string,
  totalPagadoEstaSemana: number,
  valorSemanal: number,
): EstadoCartera {
  const hoyJS = new Date().getDay(); // 0=Sun..6=Sat
  const diaPagoNum = DIAS[diaPago] ?? 1;

  // Did client complete payment for this period?
  if (totalPagadoEstaSemana >= valorSemanal) return "al-dia";

  // How many days since the payment day?
  let diasDesde = (hoyJS - diaPagoNum + 7) % 7;
  // If 0 it's the actual payment day → al-dia if paid, otherwise start checking
  if (diasDesde === 0) {
    // They haven't paid yet today but it's the payment day → show as "pay today" (al-dia display)
    return "al-dia";
  }
  if (diasDesde === 1) return "gabela";
  return "mora";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CobrosView() {
  const { profile } = useAuth();

  const { pagos, loading: loadingPagos, error: errorPagos, registrarPago, confirmarPago, rechazarPago, pagosDelContrato } =
    usePagos();
  const { contratos, loading: loadingContratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { deudas } = useDeudas();
  const { convenios, convenioActivoDelContrato } = useConvenios();
  const { gestiones, registrarGestion } = useGestiones();

  // Panel state
  const [contratoSeleccionadoId, setContratoSeleccionadoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Payment form state
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [formError, setFormError] = useState<string | null>(null);
  const [formExito, setFormExito] = useState(false);

  // Gestion form state
  const [tipoGestion, setTipoGestion] = useState<TipoGestion>("llamada");
  const [resultadoGestion, setResultadoGestion] = useState("");
  const [gestionError, setGestionError] = useState<string | null>(null);
  const [gestionExito, setGestionExito] = useState(false);

  // Historial filter
  const [filtroPagos, setFiltroPagos] = useState<"todos" | "Pendiente" | "Confirmado" | "Rechazado">("todos");

  const contratosActivos = contratos.filter(c => c.estado === "Activo");

  // ── Resumen por contrato ──────────────────────────────────────────────────
  const resumenContratos = useMemo(() => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    // Set to Monday of current week
    const dayOfWeek = hoy.getDay(); // 0=Sun
    const daysFromMon = (dayOfWeek + 6) % 7;
    inicioSemana.setDate(hoy.getDate() - daysFromMon);
    inicioSemana.setHours(0, 0, 0, 0);

    return contratosActivos.map(contrato => {
      const todosPagos = pagos.filter(p => p.contrato_id === contrato.id);
      const confirmados = todosPagos.filter(p => p.estado === "Confirmado");
      const pendientes = todosPagos.filter(p => p.estado === "Pendiente");

      const pagadoEstaSemana = confirmados
        .filter(p => new Date(p.fecha + "T00:00:00") >= inicioSemana)
        .reduce((acc, p) => acc + p.valor, 0);

      const recaudadoHoy = confirmados
        .filter(p => p.fecha === hoy.toISOString().slice(0, 10))
        .reduce((acc, p) => acc + p.valor, 0);

      const estadoCartera = calcularEstadoCartera(contrato.dia_pago, pagadoEstaSemana, contrato.valor_semanal);

      const deudaContrato = deudas
        .filter(d => d.contrato_id === contrato.id && d.estado !== "pagada")
        .reduce((acc, d) => acc + d.monto_pendiente, 0);

      const convenioActivo = convenioActivoDelContrato(contrato.id);
      const cuotaConvenio = convenioActivo?.cuota_por_periodo ?? 0;

      return {
        ...contrato,
        pagadoEstaSemana,
        recaudadoHoy,
        estadoCartera,
        deudaContrato,
        convenioActivo,
        cuotaConvenio,
        pendientesCount: pendientes.length,
      };
    });
  }, [contratosActivos, pagos, deudas, convenios]);

  const enMora = resumenContratos.filter(r => r.estadoCartera === "mora");
  const enGabela = resumenContratos.filter(r => r.estadoCartera === "gabela");
  const alDia = resumenContratos.filter(r => r.estadoCartera === "al-dia");
  const recaudadoHoyTotal = resumenContratos.reduce((acc, r) => acc + r.recaudadoHoy, 0);
  const pagaronHoy = resumenContratos.filter(r => r.recaudadoHoy > 0).length;

  // ── Filtrar lista ─────────────────────────────────────────────────────────
  const listaFiltrada = useMemo(() => {
    const q = busqueda.toLowerCase();
    // Show mora + gabela + al-dia, sorted by status priority
    const ordenado = [
      ...enMora,
      ...enGabela,
      ...alDia,
    ];
    if (!q) return ordenado;
    return ordenado.filter(c => {
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      return (
        (cliente?.nombre ?? "").toLowerCase().includes(q) ||
        (moto?.placa ?? "").toLowerCase().includes(q)
      );
    });
  }, [enMora, enGabela, alDia, busqueda, clientes, motos]);

  // ── Contrato seleccionado ─────────────────────────────────────────────────
  const contratoDetalle = contratoSeleccionadoId
    ? resumenContratos.find(c => c.id === contratoSeleccionadoId) ?? null
    : null;

  const clienteDetalle = contratoDetalle ? clientes.find(cl => cl.id === contratoDetalle.cliente_id) : null;
  const motoDetalle = contratoDetalle ? motos.find(m => m.id === contratoDetalle.moto_id) : null;

  const pagosContrato = contratoSeleccionadoId
    ? pagosDelContrato(contratoSeleccionadoId).slice(0, 10)
    : [];

  const gestionesContrato = contratoSeleccionadoId
    ? gestiones.filter(g => g.contrato_id === contratoSeleccionadoId).slice(0, 5)
    : [];

  // ── Desglose en tiempo real ───────────────────────────────────────────────
  const montoIngresado = Number(valor) || 0;
  const tarifaDia = contratoDetalle
    ? (new Date().getDay() === 0
      ? (contratoDetalle.tarifa_domingo ?? 14000)
      : (contratoDetalle.tarifa_diaria ?? 27000))
    : 27000;

  const desglose: AplicadoPago = contratoDetalle
    ? calcularAplicacion(
        montoIngresado,
        tarifaDia,
        contratoDetalle.deudaContrato,
        contratoDetalle.cuotaConvenio,
        0,
      )
    : { tarifa: 0, deuda: 0, convenio: 0, ahorro: 0, saldo: 0 };

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleRegistrarPago() {
    if (!contratoSeleccionadoId) { setFormError("Selecciona un contrato."); return; }
    if (!valor || montoIngresado <= 0) { setFormError("Ingresa un valor valido."); return; }
    setFormError(null);
    setFormExito(false);

    const { error } = await registrarPago(
      contratoSeleccionadoId,
      montoIngresado,
      metodo,
      desglose,
      contratoDetalle?.convenioActivo?.id,
    );
    if (error) { setFormError(error); return; }
    setValor("");
    setFormExito(true);
    setTimeout(() => setFormExito(false), 3000);
  }

  async function handleRegistrarGestion() {
    if (!contratoSeleccionadoId || !profile) return;
    setGestionError(null);
    const { error } = await registrarGestion(contratoSeleccionadoId, tipoGestion, resultadoGestion, profile.id);
    if (error) { setGestionError(error); return; }
    setResultadoGestion("");
    setGestionExito(true);
    setTimeout(() => setGestionExito(false), 3000);
  }

  // ── Historial filtrado ────────────────────────────────────────────────────
  const pagosFiltrados = useMemo(() => {
    const base = filtroPagos === "todos" ? pagos : pagos.filter(p => p.estado === filtroPagos);
    // Pendientes first
    return [...base].sort((a, b) => {
      if (a.estado === "Pendiente" && b.estado !== "Pendiente") return -1;
      if (b.estado === "Pendiente" && a.estado !== "Pendiente") return 1;
      return 0;
    });
  }, [pagos, filtroPagos]);

  if (loadingPagos || loadingContratos) {
    return <div style={{ padding: 24, color: "#64748b" }}>Cargando cartera...</div>;
  }

  return (
    <div>
      {/* ── Header ── */}
      <h2 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>Cartera</h2>
      <p style={{ marginTop: 6, color: "#64748b", margin: "6px 0 0" }}>
        Control de cobros, deudas, convenios y gestiones de mora.
      </p>

      {errorPagos && (
        <div style={{ marginTop: 12, color: "#991b1b", background: "#fee2e2", padding: "10px 14px", borderRadius: 12 }}>
          Error: {errorPagos}
        </div>
      )}

      {/* ── Resumen del dia ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Recaudado hoy</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#166534" }}>$ {fmt(recaudadoHoyTotal)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Pagaron hoy</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{pagaronHoy}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>En gabela</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>{enGabela.length}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 13, color: "#64748b" }}>En mora</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#991b1b" }}>{enMora.length}</div>
        </div>
      </div>

      {/* ── Layout principal ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(0, 1.5fr)",
          gap: 20,
          marginTop: 24,
          alignItems: "start",
        }}
      >
        {/* ── Lista de cobros ── */}
        <div style={card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 18 }}>Cobros del dia</h3>
          <input
            style={{ ...inputStyle, marginBottom: 12 }}
            placeholder="Buscar placa o cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div style={{ display: "grid", gap: 8 }}>
            {listaFiltrada.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>No hay contratos activos.</div>
            )}
            {listaFiltrada.map(c => {
              const cliente = clientes.find(cl => cl.id === c.cliente_id);
              const moto = motos.find(m => m.id === c.moto_id);
              const seleccionado = c.id === contratoSeleccionadoId;
              return (
                <div
                  key={c.id}
                  onClick={() => setContratoSeleccionadoId(c.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: seleccionado ? "2px solid #0284c7" : "1px solid #e2e8f0",
                    background: seleccionado ? "#eff6ff" : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {moto ? `${moto.placa} · ` : ""}
                      {cliente?.nombre || "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      Paga {c.dia_pago} · $ {fmt(c.valor_semanal)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <EstadoBadge estado={c.estadoCartera} />
                    {c.pendientesCount > 0 && (
                      <span style={{ fontSize: 11, color: "#92400e" }}>{c.pendientesCount} pend.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Panel de detalle ── */}
        <div style={{ display: "grid", gap: 16 }}>
          {!contratoDetalle ? (
            <div style={{ ...card, color: "#64748b", textAlign: "center", padding: 40 }}>
              Selecciona un contrato de la lista para ver el detalle y registrar pagos.
            </div>
          ) : (
            <>
              {/* Info cliente */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>
                      {motoDetalle ? `${motoDetalle.placa} · ` : ""}
                      {clienteDetalle?.nombre || "Sin cliente"}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                      Contrato {contratoDetalle.tipo_contrato ?? "semanal"} · Paga {contratoDetalle.dia_pago}
                    </div>
                  </div>
                  <EstadoBadge estado={contratoDetalle.estadoCartera} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <InfoBox label="Tarifa del dia" value={`$ ${fmt(tarifaDia)}`} />
                  <InfoBox label="Pagado esta semana" value={`$ ${fmt(contratoDetalle.pagadoEstaSemana)}`} />
                  <InfoBox label="Deuda pendiente" value={`$ ${fmt(contratoDetalle.deudaContrato)}`} highlight={contratoDetalle.deudaContrato > 0} />
                  {contratoDetalle.convenioActivo ? (
                    <InfoBox
                      label={`Cuota convenio #${contratoDetalle.convenioActivo.numero_convenio}`}
                      value={`$ ${fmt(contratoDetalle.convenioActivo.cuota_por_periodo)}`}
                      highlight
                    />
                  ) : (
                    <InfoBox label="Sin convenio activo" value="—" />
                  )}
                </div>

                {contratoDetalle.convenioActivo && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 12px",
                      background: "#fffbeb",
                      borderRadius: 10,
                      border: "1px solid #fde68a",
                      fontSize: 13,
                      color: "#92400e",
                    }}
                  >
                    Convenio #{contratoDetalle.convenioActivo.numero_convenio}: {contratoDetalle.convenioActivo.cuotas_pagadas}/{contratoDetalle.convenioActivo.numero_cuotas} cuotas · Limite {formatDate(contratoDetalle.convenioActivo.fecha_limite)}
                  </div>
                )}
              </div>

              {/* Formulario de pago */}
              <div style={card}>
                <h3 style={{ margin: "0 0 14px", fontSize: 17 }}>Registrar pago</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={labelStyle}>Valor recibido</div>
                    <input
                      type="number"
                      style={inputStyle}
                      value={valor}
                      onChange={e => { setValor(e.target.value); setFormExito(false); }}
                      placeholder="Ej. 27000"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Metodo de pago</div>
                    <select
                      style={inputStyle}
                      value={metodo}
                      onChange={e => setMetodo(e.target.value as MetodoPago)}
                    >
                      <option value="Efectivo">Efectivo (confirma automatico)</option>
                      <option value="Nequi">Nequi (queda pendiente)</option>
                    </select>
                  </div>

                  {/* Desglose en tiempo real */}
                  {montoIngresado > 0 && (
                    <div
                      style={{
                        background: "#f0fdf4",
                        borderRadius: 12,
                        padding: 12,
                        border: "1px solid #bbf7d0",
                        display: "grid",
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                        Como se aplicara el pago:
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Tarifa del dia</span>
                        <span style={{ fontWeight: 700 }}>$ {fmt(desglose.tarifa)}</span>
                      </div>
                      {desglose.deuda > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Abono a deuda</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.deuda)}</span>
                        </div>
                      )}
                      {desglose.convenio > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Cuota convenio</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.convenio)}</span>
                        </div>
                      )}
                      {desglose.ahorro > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Ahorro</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.ahorro)}</span>
                        </div>
                      )}
                      {desglose.saldo > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#0284c7" }}>
                          <span>Saldo a favor</span>
                          <span style={{ fontWeight: 700 }}>$ {fmt(desglose.saldo)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {formError && (
                    <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{formError}</div>
                  )}
                  {formExito && (
                    <div
                      style={{
                        color: "#166534",
                        background: "#dcfce7",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      Pago registrado correctamente.
                    </div>
                  )}
                  <button onClick={handleRegistrarPago} style={primaryBtn}>
                    Registrar pago
                  </button>
                </div>
              </div>

              {/* Historial del contrato */}
              <div style={card}>
                <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Ultimos pagos del contrato</h3>
                {pagosContrato.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {pagosContrato.map(p => (
                      <div
                        key={p.id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>$ {fmt(p.valor)}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {formatDate(p.fecha)} · {p.metodo}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <PagoBadge estado={p.estado} />
                          {p.estado === "Pendiente" && (
                            <>
                              <button
                                onClick={() => confirmarPago(p.id)}
                                style={miniBtn("#dcfce7", "#166534")}
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => rechazarPago(p.id)}
                                style={miniBtn("#fee2e2", "#991b1b")}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gestiones de cobro — solo si en mora o gabela */}
              {(contratoDetalle.estadoCartera === "mora" || contratoDetalle.estadoCartera === "gabela") && (
                <div style={card}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Gestiones de cobro</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div style={labelStyle}>Tipo de gestion</div>
                      <select
                        style={inputStyle}
                        value={tipoGestion}
                        onChange={e => setTipoGestion(e.target.value as TipoGestion)}
                      >
                        <option value="llamada">Llamada</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="visita">Visita</option>
                        <option value="apagado_moto">Apagado de moto</option>
                        <option value="sirena">Sirena</option>
                        <option value="recuperacion">Recuperacion</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <div style={labelStyle}>Resultado / Nota</div>
                      <input
                        style={inputStyle}
                        value={resultadoGestion}
                        onChange={e => setResultadoGestion(e.target.value)}
                        placeholder="Descripcion breve del resultado..."
                      />
                    </div>
                    {gestionError && (
                      <div style={{ color: "#991b1b", fontSize: 13, fontWeight: 600 }}>{gestionError}</div>
                    )}
                    {gestionExito && (
                      <div style={{ color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                        Gestion registrada.
                      </div>
                    )}
                    <button onClick={handleRegistrarGestion} style={secondaryBtn}>
                      Registrar gestion
                    </button>

                    {gestionesContrato.length > 0 && (
                      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                        {gestionesContrato.map(g => (
                          <div
                            key={g.id}
                            style={{
                              padding: "8px 12px",
                              background: "#f8fafc",
                              borderRadius: 10,
                              border: "1px solid #e2e8f0",
                              fontSize: 13,
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{g.tipo}</span>
                            {g.resultado && <span style={{ color: "#64748b" }}> — {g.resultado}</span>}
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                              {formatDate(g.fecha)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Historial general de pagos ── */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Historial general de pagos</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["todos", "Pendiente", "Confirmado", "Rechazado"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroPagos(f)}
                style={{
                  ...miniBtn(
                    filtroPagos === f ? "#0284c7" : "#f1f5f9",
                    filtroPagos === f ? "white" : "#334155",
                  ),
                  padding: "7px 14px",
                }}
              >
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {pagosFiltrados.length === 0 && (
            <div style={{ color: "#64748b", fontSize: 14 }}>Sin pagos registrados.</div>
          )}
          {pagosFiltrados.map(p => {
            const contrato = contratos.find(c => c.id === p.contrato_id);
            const cliente = contrato ? clientes.find(cl => cl.id === contrato.cliente_id) : null;
            const moto = contrato ? motos.find(m => m.id === contrato.moto_id) : null;
            return (
              <div
                key={p.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: p.estado === "Pendiente" ? "#fffbeb" : "#f8fafc",
                  border: p.estado === "Pendiente" ? "1px solid #fde68a" : "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {moto ? `${moto.placa} · ` : ""}
                    {cliente?.nombre || "Sin cliente"}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                    {formatDate(p.fecha)} · {p.metodo} · $ {fmt(p.valor)}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Tarifa ${fmt(p.aplicado_tarifa ?? 0)} · Deuda ${fmt(p.aplicado_deuda ?? 0)} · Ahorro ${fmt(p.aplicado_ahorro ?? 0)} · Saldo ${fmt(p.aplicado_saldo_favor ?? 0)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <PagoBadge estado={p.estado} />
                  {p.estado === "Pendiente" && (
                    <>
                      <button onClick={() => confirmarPago(p.id)} style={miniBtn("#dcfce7", "#166534")}>
                        Confirmar
                      </button>
                      <button onClick={() => rechazarPago(p.id)} style={miniBtn("#fee2e2", "#991b1b")}>
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
