import { useMemo, useState } from "react";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";
import { usePagos } from "../hooks/usePagos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import ModalGestion from "../components/ModalGestion";
import ClienteDetalleSheet from "../components/ClienteDetalleSheet";

type FilterTab = "todos" | "al-dia" | "mora" | "suspendidos";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function fmtDate(d: string) { return new Date(d + "T00:00:00").toLocaleDateString("es-CO"); }

function calcDias(pagos: Array<{ contrato_id: string; estado: string; fecha: string }>, contratoId: string): number {
  const hoy = new Date().toISOString().slice(0, 10);
  const conf = pagos.filter(p => p.contrato_id === contratoId && p.estado === "Confirmado");
  const ultimo = conf.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (!ultimo) return 999;
  return Math.floor((new Date(hoy + "T00:00:00").getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000);
}

type ContratoRow = {
  id: string; clienteId: string; motoId: string | null;
  nombre: string; placa: string; marca: string; tel: string;
  tipoRuta: string; valorPactado: number; valorPeriodo: number; estado: string;
  diasSinPago: number; deudaEstimada: number;
};

export default function CobrosView() {
  const [filtro, setFiltro] = useState<FilterTab>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [gestionId, setGestionId] = useState<string | null>(null);
  const [gestionNombre, setGestionNombre] = useState("");
  const [clienteDetalleId, setClienteDetalleId] = useState<string | null>(null);

  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { pagos } = usePagos();
  const { deudas } = useDeudas();
  const { convenios } = useConvenios();

  const isMobile = window.innerWidth < 900;

  const filas: ContratoRow[] = useMemo(() => {
    return contratos
      .filter(c => c.estado === "Activo" || c.estado === "Suspendido")
      .map(c => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const moto = motos.find(m => m.id === c.moto_id);
        const dias = calcDias(pagos, c.id);
        const tarifa = c.tarifa_diaria ?? 27000;
        const ahorro = (c as { ahorro_diario?: number }).ahorro_diario ?? 4000;
        const valorPactado = tarifa + ahorro;
        const valorPeriodo = (c as { valor_periodo?: number }).valor_periodo ?? valorPactado * 7;
        const tipoRuta = (c as { tipo_ruta?: string }).tipo_ruta ?? "diario";
        const deudaCrono = dias > 0 && dias < 999 ? Math.min(dias, 30) * valorPactado : 0;
        const deudaExtra = deudas.filter(d => (d as { contrato_id?: string }).contrato_id === c.id && d.estado === "pendiente").reduce((s, d) => s + d.monto, 0);
        return {
          id: c.id, clienteId: c.cliente_id, motoId: c.moto_id ?? null,
          nombre: cliente?.nombre ?? "Sin nombre",
          placa: moto?.placa ?? "—",
          marca: moto ? `${moto.marca} ${moto.modelo}` : "",
          tel: cliente?.whatsapp ?? cliente?.telefono ?? "",
          tipoRuta, valorPactado, valorPeriodo, estado: c.estado,
          diasSinPago: dias,
          deudaEstimada: deudaCrono + deudaExtra,
        };
      })
      .sort((a, b) => b.diasSinPago - a.diasSinPago);
  }, [contratos, clientes, motos, pagos]);

  const kpis = useMemo(() => ({
    total: filas.filter(f => f.estado === "Activo").length,
    alDia: filas.filter(f => f.estado === "Activo" && f.diasSinPago === 0).length,
    mora: filas.filter(f => f.estado === "Activo" && f.diasSinPago > 0).length,
    deudaTotal: filas.reduce((s, f) => s + f.deudaEstimada, 0),
  }), [filas]);

  const filtradas = useMemo(() => {
    let lista = filas;
    if (filtro === "al-dia") lista = lista.filter(f => f.diasSinPago === 0 && f.estado === "Activo");
    else if (filtro === "mora") lista = lista.filter(f => f.diasSinPago > 0 && f.estado === "Activo");
    else if (filtro === "suspendidos") lista = lista.filter(f => f.estado === "Suspendido");
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(f => f.nombre.toLowerCase().includes(q) || f.placa.toLowerCase().includes(q));
    }
    return lista;
  }, [filas, filtro, busqueda]);

  const selected = selectedId ? filas.find(f => f.id === selectedId) : null;
  const pagosSelected = useMemo(() => selected ? pagos.filter(p => p.contrato_id === selected.id).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 10) : [], [pagos, selected]);
  const deudasSelected = useMemo(() => selected ? deudas.filter(d => (d as { contrato_id?: string }).contrato_id === selected.id && d.estado === "pendiente") : [], [deudas, selected]);
  const conveniosSelected = useMemo(() => selected ? convenios.filter(cv => cv.contrato_id === selected.id) : [], [convenios, selected]);

  function diasColor(dias: number) {
    if (dias === 0) return { color: "#166534", bg: "#dcfce7" };
    if (dias >= 10) return { color: "#991b1b", bg: "#fee2e2" };
    if (dias >= 5) return { color: "#92400e", bg: "#fef3c7" };
    if (dias >= 3) return { color: "#c2410c", bg: "#fff7ed" };
    return { color: "#1d4ed8", bg: "#dbeafe" };
  }

  function abrirWA(tel: string, nombre: string, dias: number) {
    if (!tel) return;
    const n = nombre.split(" ")[0];
    const msg = dias > 0
      ? `Hola ${n}, lleva ${dias} días sin pago. Por favor comuníquese urgente. GPS Satelital ⚠️`
      : `Hola ${n}, recuerde que hoy es su día de pago. GPS Satelital 🏍️`;
    const num = tel.replace(/\D/g, "");
    window.open(`https://wa.me/${num.startsWith("57") ? num : "57" + num}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const listaEl = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {filtradas.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748b" }}>Sin resultados</div>
      )}
      {filtradas.map(f => {
        const dc = diasColor(f.diasSinPago);
        const isSelected = selectedId === f.id;
        return (
          <div key={f.id} onClick={() => { if (isMobile) setClienteDetalleId(f.clienteId); else setSelectedId(isSelected ? null : f.id); }}
            style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0", background: isSelected ? "#f0f9ff" : "white", transition: "all 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.placa} · {f.nombre}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 6, background: "#f1f5f9", color: "#334155", fontWeight: 600 }}>{f.tipoRuta}</span>
                  <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 6, background: "#f1f5f9", color: "#334155" }}>
                    {f.tipoRuta === "diario" ? `$${fmt(f.valorPactado)}/día` : `$${fmt(f.valorPeriodo)}/${f.tipoRuta === "semanal" ? "sem" : f.tipoRuta === "quincenal" ? "quinc" : "mes"}`}
                  </span>
                </div>
              </div>
              <div style={{ background: dc.bg, color: dc.color, borderRadius: 10, padding: "4px 10px", textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>{f.diasSinPago === 0 ? "✅" : f.diasSinPago === 999 ? "∞" : f.diasSinPago}</div>
                {f.diasSinPago > 0 && <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>días</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const detalleEl = selected ? (
    <div style={{ background: "white", borderRadius: 16, padding: "20px", boxShadow: "0 4px 20px rgba(15,23,42,0.08)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, textTransform: "uppercase" }}>{selected.nombre}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{selected.placa} {selected.marca && `· ${selected.marca}`}</div>
        </div>
        <button onClick={() => setSelectedId(null)} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, color: "#64748b" }}>✕</button>
      </div>

      {/* Días sin pago */}
      {(() => { const dc = diasColor(selected.diasSinPago); return (
        <div style={{ background: dc.bg, borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: dc.color, lineHeight: 1 }}>{selected.diasSinPago === 999 ? "∞" : selected.diasSinPago}</div>
            <div style={{ fontSize: 10, color: dc.color, fontWeight: 700, textTransform: "uppercase" }}>días sin pago</div>
          </div>
          {selected.deudaEstimada > 0 && (
            <div style={{ borderLeft: `1px solid ${dc.bg === "#dcfce7" ? "#bbf7d0" : "#fecaca"}`, paddingLeft: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: dc.color }}>${fmt(selected.deudaEstimada)}</div>
              <div style={{ fontSize: 10, color: dc.color, fontWeight: 700, textTransform: "uppercase" }}>deuda estimada</div>
            </div>
          )}
        </div>
      ); })()}

      {/* Contrato info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Tipo ruta", value: selected.tipoRuta },
          { label: "Valor pactado", value: selected.tipoRuta === "diario" ? `$${fmt(selected.valorPactado)}/día` : `$${fmt(selected.valorPeriodo)}/${selected.tipoRuta === "semanal" ? "sem" : selected.tipoRuta === "quincenal" ? "quinc" : "mes"}` },
          { label: "Estado", value: selected.estado },
        ].map(r => (
          <div key={r.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{r.label}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{r.value}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {selected.tel && <>
          <button onClick={() => { const n = selected.tel.replace(/\D/g,""); window.open(`tel:+57${n}`); }} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#dbeafe", color: "#1d4ed8" }}>📞 Llamar</button>
          <button onClick={() => abrirWA(selected.tel, selected.nombre, selected.diasSinPago)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#dcfce7", color: "#166534" }}>💬 WhatsApp</button>
        </>}
        <button onClick={() => { setGestionId(selected.id); setGestionNombre(selected.nombre); }} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>📋 Gestión</button>
        <button onClick={() => setClienteDetalleId(selected.clienteId)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#f1f5f9", color: "#334155" }}>👤 Cliente</button>
      </div>

      {/* Pagos recientes */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#334155" }}>Últimos pagos</div>
        {pagosSelected.length === 0 ? (
          <div style={{ fontSize: 13, color: "#94a3b8", padding: "8px 0" }}>Sin pagos registrados</div>
        ) : pagosSelected.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>{fmtDate(p.fecha)}</span>
              <span style={{ padding: "2px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe", color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8" }}>{p.metodo}</span>
              <span style={{ padding: "2px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: p.estado === "Confirmado" ? "#dcfce7" : p.estado === "Pendiente" ? "#fef3c7" : "#fee2e2", color: p.estado === "Confirmado" ? "#166534" : p.estado === "Pendiente" ? "#92400e" : "#991b1b" }}>{p.estado}</span>
            </div>
            <div style={{ fontWeight: 800 }}>${fmt(p.valor)}</div>
          </div>
        ))}
      </div>

      {/* Deudas */}
      {deudasSelected.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#334155" }}>Deudas activas ({deudasSelected.length})</div>
          {deudasSelected.map(d => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", marginBottom: 6, background: "#fff5f5", borderRadius: 10, fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>{d.concepto}</span>
              <span style={{ fontWeight: 800, color: "#991b1b" }}>${fmt(d.monto)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Convenios */}
      {conveniosSelected.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#334155" }}>Convenios ({conveniosSelected.length}/3)</div>
          {conveniosSelected.map(cv => (
            <div key={cv.id} style={{ padding: "10px 12px", marginBottom: 6, background: "#f8fafc", borderRadius: 10, fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>{cv.concepto}</div>
              <div style={{ color: "#64748b", marginTop: 2 }}>${fmt(cv.cuota_por_periodo)} × {cv.numero_cuotas} cuotas — hasta {cv.fecha_limite ? fmtDate(cv.fecha_limite) : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div style={{ background: "white", borderRadius: 16, padding: "48px 24px", textAlign: "center", boxShadow: "0 4px 20px rgba(15,23,42,0.06)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
      <div style={{ fontWeight: 700, color: "#334155" }}>Selecciona un contrato</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>para ver el detalle completo</div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Contratos activos", value: kpis.total, bg: "white", color: "#0f172a" },
          { label: "Al día", value: kpis.alDia, bg: "#dcfce7", color: "#166534" },
          { label: "En mora", value: kpis.mora, bg: "#fee2e2", color: "#991b1b" },
          { label: "Deuda total", value: `$${fmt(kpis.deudaTotal)}`, bg: "#fff5f5", color: "#991b1b" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: "12px 14px", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{k.label}</div>
            <div style={{ fontSize: typeof k.value === "string" ? 16 : 26, fontWeight: 900, color: k.color, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtros + Búsqueda */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {([
          { key: "todos", label: "Todos" },
          { key: "al-dia", label: "Al día" },
          { key: "mora", label: "Mora" },
          { key: "suspendidos", label: "Suspendidos" },
        ] as { key: FilterTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setFiltro(t.key)} style={{ padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: filtro === t.key ? "#0f172a" : "#f1f5f9", color: filtro === t.key ? "white" : "#64748b" }}>{t.label}</button>
        ))}
      </div>
      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente o placa..."
        style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12 }} />

      {/* Layout */}
      {isMobile ? listaEl : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 360, flexShrink: 0, maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>{listaEl}</div>
          <div style={{ flex: 1, minWidth: 0 }}>{detalleEl}</div>
        </div>
      )}

      {gestionId && <ModalGestion contratoId={gestionId} clienteNombre={gestionNombre} onClose={() => setGestionId(null)} />}
      {clienteDetalleId && <ClienteDetalleSheet clienteId={clienteDetalleId} onClose={() => setClienteDetalleId(null)} />}
    </div>
  );
}
