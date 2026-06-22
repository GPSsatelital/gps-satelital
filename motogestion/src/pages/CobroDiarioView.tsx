import React, { useMemo, useState } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos, type MetodoPago } from "../hooks/usePagos";
import ModalGestion from "../components/ModalGestion";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

function diaSemana(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { weekday: "long" });
}

type Fila = {
  contratoId: string;
  clienteNombre: string;
  clienteTel: string;
  placa: string;
  formaPago: string;
  diaPago: string;
  cuota: number;
  pagadoHoy: number;
  pagadoPeriodo: number;
  diasSinPago: number;
  estado: "pagado" | "parcial" | "pendiente" | "mora" | "gabela";
  pagaHoy: boolean;
};

export default function CobroDiarioView() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoy);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "pagados" | "mora" | "paga_hoy">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagarContratoId, setPagarContratoId] = useState<string | null>(null);
  const [pagarValor, setPagarValor] = useState<number>(0);
  const [pagarMetodo, setPagarMetodo] = useState<MetodoPago>("Efectivo");
  const [pagarLabel, setPagarLabel] = useState("");
  const [pagarCuota, setPagarCuota] = useState<number>(0);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [gestionContratoId, setGestionContratoId] = useState<string | null>(null);
  const [gestionClienteNombre, setGestionClienteNombre] = useState("");

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos, registrarPago } = usePagos();

  const diaSem = diaSemana(fecha);
  const esDomingo = new Date(fecha + "T00:00:00").getDay() === 0;

  const inicioPeriodo = useMemo(() => {
    const d = new Date(fecha + "T00:00:00");
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  }, [fecha]);

  const filas: Fila[] = useMemo(() => {
    const contratosActivos = contratos.filter(c => c.estado === "Activo");
    return contratosActivos.map(c => {
      const cliente = clientes.find(cl => cl.id === c.cliente_id);
      const moto = motos.find(m => m.id === c.moto_id);
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");

      const pagadoHoy = pagosC.filter(p => p.fecha === fecha).reduce((a, p) => a + p.valor, 0);
      const pagadoPeriodo = pagosC.filter(p => p.fecha >= inicioPeriodo && p.fecha <= fecha).reduce((a, p) => a + p.valor, 0);

      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const diasSinPago = ultimo
        ? Math.floor((new Date(fecha + "T00:00:00").getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;

      const cuota = esDomingo
        ? (c.tarifa_domingo ?? Math.round((c.tarifa_diaria ?? 27000) / 2))
        : (c.tarifa_diaria ?? 27000);

      let estado: Fila["estado"] = "pendiente";
      if (pagadoHoy >= cuota) estado = "pagado";
      else if (pagadoHoy > 0) estado = "parcial";
      else if (diasSinPago > 2) estado = "mora";
      else if (diasSinPago === 2) estado = "gabela";

      // ¿Es el día de pago programado para este contrato?
      const diaSemFecha = new Date(fecha + "T00:00:00").getDay(); // 0=Dom, 1=Lun, 3=Mie
      const esLunes = diaSemFecha === 1;
      const esMiercoles = diaSemFecha === 3;
      const pagaHoy = c.forma_pago !== "Diario" && (
        (c.dia_pago === "Lunes" && esLunes) ||
        (c.dia_pago === "Miércoles" && esMiercoles)
      );

      return {
        contratoId: c.id,
        clienteNombre: cliente?.nombre ?? "Sin nombre",
        clienteTel: cliente?.whatsapp ?? cliente?.telefono ?? "",
        placa: moto?.placa ?? "—",
        formaPago: c.forma_pago ?? "Diario",
        diaPago: c.dia_pago ?? "—",
        cuota,
        pagadoHoy,
        pagadoPeriodo,
        diasSinPago,
        estado,
        pagaHoy,
      };
    });
  }, [contratos, clientes, motos, pagos, fecha, inicioPeriodo, esDomingo]);

  const resumen = useMemo(() => ({
    total: filas.length,
    pagados: filas.filter(f => f.estado === "pagado").length,
    parcial: filas.filter(f => f.estado === "parcial").length,
    pendientes: filas.filter(f => f.estado === "pendiente").length,
    mora: filas.filter(f => f.estado === "mora").length,
    gabela: filas.filter(f => f.estado === "gabela").length,
    pagaHoy: filas.filter(f => f.pagaHoy).length,
    recaudado: filas.reduce((a, f) => a + f.pagadoHoy, 0),
    esperado: filas.filter(f => f.estado !== "mora").reduce((a, f) => a + f.cuota, 0),
  }), [filas]);

  const filtradas = useMemo(() => {
    let lista = filas;
    if (filtro === "pendientes") lista = lista.filter(f => f.estado === "pendiente" || f.estado === "parcial" || f.estado === "gabela");
    else if (filtro === "pagados") lista = lista.filter(f => f.estado === "pagado");
    else if (filtro === "mora") lista = lista.filter(f => f.estado === "mora");
    else if (filtro === "paga_hoy") lista = lista.filter(f => f.pagaHoy);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(f => f.clienteNombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
    }
    // Ordenar: mora > gabela > pendiente > parcial > pagado
    const orden = { mora: 0, gabela: 1, pendiente: 2, parcial: 3, pagado: 4 };
    return [...lista].sort((a, b) => orden[a.estado] - orden[b.estado]);
  }, [filas, filtro, busqueda]);

  const ESTADO_STYLE: Record<Fila["estado"], { bg: string; color: string; label: string }> = {
    pagado:   { bg: "#dcfce7", color: "#166534", label: "Pagó" },
    parcial:  { bg: "#fef3c7", color: "#92400e", label: "Parcial" },
    pendiente:{ bg: "#f1f5f9", color: "#334155", label: "Pendiente" },
    mora:     { bg: "#fee2e2", color: "#991b1b", label: "Mora" },
    gabela:   { bg: "#fef9c3", color: "#854d0e", label: "Gabela" },
  };

  function abrirWA(tel: string, nombre: string, cuota: number, estado: string) {
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const v = `$ ${fmt(cuota)}`;
    const msg = estado === "mora"
      ? `Hola ${n}, su moto lleva varios días sin pago de ${v}. Es urgente que se comunique con nosotros. GPS Satelital ⚠️`
      : estado === "gabela"
      ? `Hola ${n}, hoy es su día de gabela. Por favor realice su pago de ${v} lo antes posible. GPS Satelital 🏍️`
      : `Hola ${n}, le recordamos que su pago de ${v} vence hoy. Gracias. GPS Satelital 🙏`;
    const num = tel.replace(/\D/g, "");
    const full = num.startsWith("57") ? num : `57${num}`;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Cobro diario</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>
            {diaSem.charAt(0).toUpperCase() + diaSem.slice(1)}, {new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            {esDomingo && <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 700 }}>Domingo — tarifa reducida</span>}
          </p>
        </div>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14 }} />
      </div>

      {/* KPIs del día */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginTop: 20 }}>
        {[
          { label: "Recaudado", value: `$ ${fmt(resumen.recaudado)}`, color: "#166534", bg: "#f0fdf4" },
          { label: "Esperado", value: `$ ${fmt(resumen.esperado)}`, color: "#0284c7" },
          { label: "Pagaron", value: `${resumen.pagados}/${resumen.total}`, color: "#166534" },
          { label: "Pendientes", value: String(resumen.pendientes + resumen.parcial), color: "#92400e" },
          { label: "Gabela", value: String(resumen.gabela), color: "#854d0e" },
          { label: "Mora", value: String(resumen.mora), color: resumen.mora > 0 ? "#991b1b" : "#94a3b8" },
          { label: "Vence hoy", value: String(resumen.pagaHoy), color: resumen.pagaHoy > 0 ? "#0284c7" : "#94a3b8", bg: resumen.pagaHoy > 0 ? "#e0f2fe" : undefined },
        ].map(k => (
          <div key={k.label} style={{ ...card, background: k.bg ?? "white", padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Barra de progreso del día */}
      <div style={{ ...card, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 6 }}>
          <span>Recaudado: <strong>$ {fmt(resumen.recaudado)}</strong></span>
          <span>{resumen.esperado > 0 ? Math.round((resumen.recaudado / resumen.esperado) * 100) : 0}% del esperado</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${resumen.esperado > 0 ? Math.min(100, Math.round((resumen.recaudado / resumen.esperado) * 100)) : 0}%`, background: "linear-gradient(90deg, #0284c7, #10b981)", transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
        {([
          { key: "todos", label: `Todos (${resumen.total})` },
          { key: "pendientes", label: `Sin pagar (${resumen.pendientes + resumen.parcial + resumen.gabela})` },
          { key: "mora", label: `Mora (${resumen.mora})` },
          { key: "pagados", label: `Pagaron (${resumen.pagados})` },
          { key: "paga_hoy", label: `Vence hoy (${resumen.pagaHoy})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: filtro === f.key ? 700 : 500, background: filtro === f.key ? "#0284c7" : "#f1f5f9", color: filtro === f.key ? "white" : "#64748b" }}>
            {f.label}
          </button>
        ))}
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente o placa..." style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, flex: "1 1 180px" }} />
      </div>

      {/* Lista */}
      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {filtradas.length === 0 && (
          <div style={{ ...card, textAlign: "center", color: "#64748b", padding: 32 }}>Sin contratos en este filtro.</div>
        )}
        {filtradas.map(f => {
          const s = ESTADO_STYLE[f.estado];
          return (
            <div key={f.contratoId} style={{ ...card, padding: "12px 16px", borderLeft: `4px solid ${s.color}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800, textTransform: "uppercase", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.placa !== "—" ? `${f.placa} · ` : ""}{f.clienteNombre}
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                  {f.pagaHoy && f.estado !== "pagado" && (
                    <span style={{ padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: "#0284c7", color: "white", flexShrink: 0, animation: "pulse 1.5s infinite" }}>
                      🔔 PAGA HOY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                  {f.formaPago} · Paga {f.diaPago}
                  {f.diasSinPago < 999 && f.estado !== "pagado" ? ` · ${f.diasSinPago}d sin pago` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: f.pagadoHoy > 0 ? "#166534" : "#334155" }}>
                  {f.pagadoHoy > 0 ? `$ ${fmt(f.pagadoHoy)}` : "—"}
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}> / $ {fmt(f.cuota)}</span>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 4, flexWrap: "wrap" }}>
                  {f.estado !== "pagado" && (
                    <button
                      onClick={() => {
                        setPagarContratoId(f.contratoId);
                        setPagarValor(f.cuota);
                        setPagarCuota(f.cuota);
                        setPagarMetodo("Efectivo");
                        setPagarLabel(`${f.placa !== "—" ? f.placa + " · " : ""}${f.clienteNombre}`);
                      }}
                      style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}
                    >
                      💵 Pagar
                    </button>
                  )}
                  {f.clienteTel && f.estado !== "pagado" && (
                    <>
                      <button onClick={() => { const n = f.clienteTel.replace(/\D/g,""); window.open(`tel:+57${n}`); }}
                        style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>
                        📞
                      </button>
                      <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.cuota, f.estado)}
                        style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                        💬 WA
                      </button>
                    </>
                  )}
                  {(f.estado === "mora" || f.estado === "gabela") && (
                    <button onClick={() => { setGestionContratoId(f.contratoId); setGestionClienteNombre(f.clienteNombre); }}
                      style={{ padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                      📋
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {pagarContratoId && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 90 }}
          onClick={() => setPagarContratoId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 380, background: "white", borderRadius: 20, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Registrar pago</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3, textTransform: "uppercase", fontWeight: 600 }}>{pagarLabel}</div>
              </div>
              <button onClick={() => setPagarContratoId(null)} style={{ border: "none", background: "#f1f5f9", borderRadius: 999, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 16, color: "#334155" }}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={{ marginBottom: 5, fontSize: 13, fontWeight: 600, color: "#334155" }}>Valor</div>
                <input
                  type="number"
                  value={pagarValor}
                  onChange={(e) => setPagarValor(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                />
                <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>Cuota esperada: $ {fmt(pagarCuota)}</div>
              </div>

              <div>
                <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#334155" }}>Método de pago</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {(["Efectivo", "Transferencia"] as const).map((op) => (
                    <label key={op} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, border: `2px solid ${pagarMetodo === op ? "#0284c7" : "#e2e8f0"}`, background: pagarMetodo === op ? "#e0f2fe" : "white", fontSize: 13, fontWeight: 600, color: pagarMetodo === op ? "#0284c7" : "#334155", flex: 1, justifyContent: "center" }}>
                      <input type="radio" name="metodo" value={op} checked={pagarMetodo === op} onChange={() => setPagarMetodo(op)} style={{ display: "none" }} />
                      {op}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setPagarContratoId(null)} style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Cancelar
              </button>
              <button
                disabled={guardandoPago || pagarValor <= 0}
                onClick={async () => {
                  if (!pagarContratoId || pagarValor <= 0) return;
                  setGuardandoPago(true);
                  const aplicado = {
                    tarifa: Math.min(pagarValor, pagarCuota),
                    deuda: 0,
                    convenio: 0,
                    ahorro: 0,
                    saldo: Math.max(pagarValor - pagarCuota, 0),
                  };
                  await registrarPago(pagarContratoId, pagarValor, pagarMetodo, aplicado);
                  setGuardandoPago(false);
                  setPagarContratoId(null);
                }}
                style={{ background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)", color: "white", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, cursor: guardandoPago || pagarValor <= 0 ? "not-allowed" : "pointer", fontSize: 14, opacity: guardandoPago || pagarValor <= 0 ? 0.7 : 1 }}
              >
                {guardandoPago ? "Registrando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {gestionContratoId && (
        <ModalGestion
          contratoId={gestionContratoId}
          clienteNombre={gestionClienteNombre}
          onClose={() => setGestionContratoId(null)}
        />
      )}
    </div>
  );
}
