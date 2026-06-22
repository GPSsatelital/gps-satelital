import React, { useMemo, useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos } from "../hooks/useMotos";

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }
function pct(a: number, b: number) { return b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`; }

type Rango = "hoy" | "semana" | "mes" | "mes_anterior" | "anio";

const RANGOS: { key: Rango; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Esta semana" },
  { key: "mes", label: "Este mes" },
  { key: "mes_anterior", label: "Mes anterior" },
  { key: "anio", label: "Este año" },
];

function getRango(rango: Rango): { desde: string; hasta: string } {
  const hoy = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  if (rango === "hoy") {
    const s = iso(hoy);
    return { desde: s, hasta: s };
  }
  if (rango === "semana") {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return { desde: iso(lunes), hasta: iso(hoy) };
  }
  if (rango === "mes") {
    return { desde: iso(hoy).slice(0, 7) + "-01", hasta: iso(hoy) };
  }
  if (rango === "mes_anterior") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { desde: iso(inicio), hasta: iso(fin) };
  }
  // anio
  return { desde: `${hoy.getFullYear()}-01-01`, hasta: iso(hoy) };
}

function KPI({ label, value, sub, color, bg }: { label: string; value: string; sub?: string; color?: string; bg?: string }) {
  return (
    <div style={{ ...card, background: bg ?? "white" }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? "#0f172a", marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function BarraHorizontal({ label, valor, total, color }: { label: string; valor: number; total: number; color: string }) {
  const p = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#64748b" }}>$ {fmt(valor)} <span style={{ color: "#94a3b8" }}>({p}%)</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${p}%`, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

const GRUPOS = ["RASTREADOR", "COSTA", "PRADERA"] as const;
const GRUPO_COLORS: Record<string, string> = {
  RASTREADOR: "#0284c7",
  COSTA: "#10b981",
  PRADERA: "#f59e0b",
};

export default function ReportesView() {
  const [rango, setRango] = useState<Rango>("mes");
  const { pagos } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();

  const { desde, hasta } = getRango(rango);

  // ── PAGOS EN RANGO ──
  const pagosRango = useMemo(() =>
    pagos.filter(p => p.estado === "Confirmado" && p.fecha >= desde && p.fecha <= hasta),
    [pagos, desde, hasta]
  );

  const totalRecaudado = pagosRango.reduce((a, p) => a + p.valor, 0);
  const totalEfectivo = pagosRango.filter(p => p.metodo === "Efectivo").reduce((a, p) => a + p.valor, 0);
  const totalTransferencia = pagosRango.filter(p => p.metodo === "Transferencia").reduce((a, p) => a + p.valor, 0);
  const totalCampo = pagosRango.filter(p => p.tipo_registro === "campo").reduce((a, p) => a + p.valor, 0);

  // ── RECAUDO POR GRUPO ──
  const recaudoPorGrupo = useMemo(() => {
    return GRUPOS.map(grupo => {
      const motosGrupo = new Set(motos.filter(m => m.grupo === grupo).map(m => m.id));
      const contratosGrupo = new Set(contratos.filter(c => c.moto_id && motosGrupo.has(c.moto_id)).map(c => c.id));
      const total = pagosRango.filter(p => contratosGrupo.has(p.contrato_id)).reduce((a, p) => a + p.valor, 0);
      return { grupo, total };
    });
  }, [pagosRango, contratos, motos]);

  // ── RECAUDO DIARIO (últimos 14 días) ──
  const recaudoDiario = useMemo(() => {
    const dias: { fecha: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fecha = d.toISOString().slice(0, 10);
      const total = pagos.filter(p => p.estado === "Confirmado" && p.fecha === fecha).reduce((a, p) => a + p.valor, 0);
      dias.push({ fecha, total });
    }
    return dias;
  }, [pagos]);

  const maxDiario = Math.max(...recaudoDiario.map(d => d.total), 1);

  // ── CONTRATOS ──
  const contratosActivos = contratos.filter(c => c.estado === "Activo");
  const contratosPorForma = useMemo(() => {
    const map: Record<string, number> = {};
    contratosActivos.forEach(c => {
      const k = c.forma_pago ?? "Sin definir";
      map[k] = (map[k] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [contratosActivos]);

  // ── MORA ──
  const hoyStr = new Date().toISOString().slice(0, 10);
  const enMora = useMemo(() => {
    return contratosActivos.map(c => {
      const pagosC = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado");
      const ultimo = pagosC.sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      const dias = ultimo
        ? Math.floor((new Date().getTime() - new Date(ultimo.fecha + "T00:00:00").getTime()) / 86400000)
        : 999;
      return { contrato: c, diasSinPago: dias };
    }).filter(e => e.diasSinPago > 2);
  }, [contratosActivos, pagos]);

  const enMoraCritica = enMora.filter(e => e.diasSinPago > 7).length;
  const enMoraNormal = enMora.filter(e => e.diasSinPago <= 7).length;

  // ── MOTOS POR ESTADO ──
  const motosPorEstado = useMemo(() => {
    const map: Record<string, number> = {};
    motos.forEach(m => { map[m.estado] = (map[m.estado] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [motos]);

  const ESTADO_MOTO_COLOR: Record<string, string> = {
    Asignada: "#166534", Disponible: "#1e40af", "En taller": "#92400e",
    Recuperada: "#0369a1", Suspendida: "#6d28d9", Fiscalia: "#991b1b",
    Transito: "#be123c", Garantia: "#6b7280",
  };

  // ── CLIENTES ──
  const clientesActivos = clientes.filter(c => c.estado === "Activo").length;
  const clientesEnProceso = clientes.filter(c => c.estado === "En proceso" || c.estado === "Aprobado").length;
  const inicioMes = hoyStr.slice(0, 7) + "-01";
  const clientesNuevosMes = clientes.filter(c => c.created_at >= inicioMes).length;

  // ── PROYECCIÓN ──
  const tarifaPromedio = contratosActivos.length > 0
    ? contratosActivos.reduce((a, c) => a + (c.tarifa_diaria ?? 27000), 0) / contratosActivos.length
    : 27000;
  const proyeccionMensual = tarifaPromedio * contratosActivos.length * 26;

  // ── ALERTAS ──
  const alertasVencimiento = useMemo(() => {
    const hoy = new Date();
    const en30 = new Date(); en30.setDate(hoy.getDate() + 30);
    const iso30 = en30.toISOString().slice(0, 10);
    return motos.filter(m =>
      (m.fecha_seguro && m.fecha_seguro <= iso30) ||
      (m.fecha_tecnomecanica && m.fecha_tecnomecanica <= iso30)
    ).map(m => ({
      placa: m.placa,
      seguro: m.fecha_seguro,
      tecno: m.fecha_tecnomecanica,
    }));
  }, [motos]);

  const diasBase = useMemo(() =>
    contratos.filter(c => c.estado === "Activo" && c.tipo_ruta === "diario" && !c.base_completada && (c.ahorro_acumulado ?? 0) >= 450000),
    [contratos]
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, margin: 0 }}>Reportes</h2>
          <p style={{ marginTop: 6, color: "#64748b" }}>Resumen operativo y financiero en tiempo real.</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {RANGOS.map(r => (
            <button key={r.key} onClick={() => setRango(r.key)} style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: rango === r.key ? 700 : 500, background: rango === r.key ? "#0284c7" : "#f1f5f9", color: rango === r.key ? "white" : "#64748b" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {(alertasVencimiento.length > 0 || diasBase.length > 0 || enMoraCritica > 0) && (
        <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
          {enMoraCritica > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fee2e2", borderLeft: "4px solid #ef4444", fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
              🚨 {enMoraCritica} contrato{enMoraCritica > 1 ? "s" : ""} en mora crítica (+7 días sin pago) — requieren recolección
            </div>
          )}
          {diasBase.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", borderLeft: "4px solid #f59e0b", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              ⚠️ {diasBase.length} cliente{diasBase.length > 1 ? "s" : ""} cerca de completar la base ($510.000) — gestionar cambio de contrato
            </div>
          )}
          {alertasVencimiento.length > 0 && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fef3c7", borderLeft: "4px solid #f59e0b", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              ⚠️ {alertasVencimiento.length} moto{alertasVencimiento.length > 1 ? "s" : ""} con SOAT o tecnomecánica venciendo en los próximos 30 días
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {alertasVencimiento.slice(0, 6).map(a => (
                  <span key={a.placa} style={{ padding: "2px 8px", borderRadius: 999, background: "white", fontSize: 12 }}>{a.placa}</span>
                ))}
                {alertasVencimiento.length > 6 && <span style={{ fontSize: 12, color: "#92400e" }}>+{alertasVencimiento.length - 6} más</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPIs recaudo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginTop: 20 }}>
        <KPI label="Total recaudado" value={`$ ${fmt(totalRecaudado)}`} color="#166534" />
        <KPI label="Efectivo" value={`$ ${fmt(totalEfectivo)}`} sub={pct(totalEfectivo, totalRecaudado)} color="#0284c7" />
        <KPI label="Transferencias" value={`$ ${fmt(totalTransferencia)}`} sub={pct(totalTransferencia, totalRecaudado)} color="#6d28d9" />
        <KPI label="Cobro en campo" value={`$ ${fmt(totalCampo)}`} sub={pct(totalCampo, totalRecaudado)} color="#0369a1" />
        <KPI label="Proyección mensual" value={`$ ${fmt(proyeccionMensual)}`} sub="~26 días L-S" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Recaudo por grupo */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recaudo por grupo</div>
          {recaudoPorGrupo.map(({ grupo, total }) => (
            <BarraHorizontal key={grupo} label={grupo} valor={total} total={totalRecaudado} color={GRUPO_COLORS[grupo] ?? "#94a3b8"} />
          ))}
          {totalRecaudado === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Sin pagos en el período.</div>}
        </div>

        {/* Recaudo diario — últimos 14 días */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recaudo diario — últimos 14 días</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {recaudoDiario.map(({ fecha, total }) => {
              const h = total === 0 ? 2 : Math.max(4, Math.round((total / maxDiario) * 80));
              const isHoy = fecha === hoyStr;
              return (
                <div key={fecha} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div title={`$ ${fmt(total)}`} style={{ width: "100%", height: h, borderRadius: 4, background: isHoy ? "#0284c7" : total === 0 ? "#e2e8f0" : "#93c5fd", transition: "height 0.3s" }} />
                  <div style={{ fontSize: 9, color: isHoy ? "#0284c7" : "#94a3b8", fontWeight: isHoy ? 700 : 400 }}>
                    {new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" }).split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>Pasa el cursor sobre cada barra para ver el valor</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Cartera / Mora */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Cartera y mora</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
            <div style={{ padding: 12, borderRadius: 12, background: "#dcfce7" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#166534" }}>{contratosActivos.length - enMora.length}</div>
              <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 4 }}>Al día</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#fef3c7" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#92400e" }}>{enMoraNormal}</div>
              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, marginTop: 4 }}>En mora</div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "#fee2e2" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#991b1b" }}>{enMoraCritica}</div>
              <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 700, marginTop: 4 }}>Crítico +7d</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <BarraHorizontal label="Al día" valor={contratosActivos.length - enMora.length} total={contratosActivos.length} color="#10b981" />
            <BarraHorizontal label="En mora" valor={enMora.length} total={contratosActivos.length} color="#ef4444" />
          </div>
        </div>

        {/* Contratos por modalidad */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Contratos activos por modalidad</div>
          {contratosPorForma.map(([forma, count]) => (
            <BarraHorizontal key={forma} label={forma} valor={count} total={contratosActivos.length} color="#0284c7" />
          ))}
          {contratosActivos.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13 }}>Sin contratos activos.</div>}
          <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
            Total activos: <strong>{contratosActivos.length}</strong> · En proceso: <strong>{contratos.filter(c => c.estado === "En proceso").length}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 }}>

        {/* Flota por estado */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Flota — {motos.length} motos en total</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
            {motosPorEstado.map(([estado, count]) => {
              const color = ESTADO_MOTO_COLOR[estado] ?? "#334155";
              return (
                <div key={estado} style={{ padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>{estado}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{pct(count, motos.length)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clientes */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Clientes</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#dcfce7", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#166534" }}>{clientesActivos}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginTop: 4 }}>Activos</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#fef3c7", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#92400e" }}>{clientesEnProceso}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginTop: 4 }}>En proceso</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f0f9ff", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>{clientesNuevosMes}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0284c7", marginTop: 4 }}>Nuevos este mes</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "#f8fafc", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#334155" }}>{clientes.length}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginTop: 4 }}>Total registrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contratos diarios cerca de completar base */}
      {diasBase.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#92400e" }}>
            ⚠️ Contratos diarios — base casi completada
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {diasBase.map(c => {
              const cliente = clientes.find(cl => cl.id === c.cliente_id);
              const ahorro = c.ahorro_acumulado ?? 0;
              const pctAhorro = Math.min(100, Math.round((ahorro / 510000) * 100));
              return (
                <div key={c.id} style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", border: "1px solid #fcd34d", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 700, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                  <div style={{ fontSize: 13 }}>Ahorro: <strong>$ {fmt(ahorro)}</strong> ({pctAhorro}% de $510.000)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vencimientos próximos detalle */}
      {alertasVencimiento.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#92400e" }}>
            📋 Documentos por vencer — próximos 30 días
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Placa</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>SOAT vence</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#64748b", fontWeight: 700 }}>Tecnomecánica vence</th>
                </tr>
              </thead>
              <tbody>
                {alertasVencimiento.map(a => (
                  <tr key={a.placa} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{a.placa}</td>
                    <td style={{ padding: "8px 10px", color: a.seguro ? "#991b1b" : "#94a3b8" }}>
                      {a.seguro ? new Date(a.seguro + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: a.tecno ? "#991b1b" : "#94a3b8" }}>
                      {a.tecno ? new Date(a.tecno + "T00:00:00").toLocaleDateString("es-CO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
