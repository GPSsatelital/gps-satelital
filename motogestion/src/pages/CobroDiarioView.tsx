import React, { useMemo, useState } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";

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
};

export default function CobroDiarioView() {
  const hoy = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoy);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "pagados" | "mora">("todos");
  const [busqueda, setBusqueda] = useState("");

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos } = usePagos();

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
    recaudado: filas.reduce((a, f) => a + f.pagadoHoy, 0),
    esperado: filas.filter(f => f.estado !== "mora").reduce((a, f) => a + f.cuota, 0),
  }), [filas]);

  const filtradas = useMemo(() => {
    let lista = filas;
    if (filtro === "pendientes") lista = lista.filter(f => f.estado === "pendiente" || f.estado === "parcial" || f.estado === "gabela");
    else if (filtro === "pagados") lista = lista.filter(f => f.estado === "pagado");
    else if (filtro === "mora") lista = lista.filter(f => f.estado === "mora");
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
                {f.clienteTel && f.estado !== "pagado" && (
                  <button onClick={() => abrirWA(f.clienteTel, f.clienteNombre, f.cuota, f.estado)}
                    style={{ marginTop: 4, padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>
                    💬 WA
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
