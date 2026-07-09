import { useEffect, useMemo, useState } from "react";
import { usePagos } from "../hooks/usePagos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type GrupoMoto } from "../hooks/useMotos";
import { useCaja } from "../hooks/useCaja";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const GRUPOS: GrupoMoto[] = ["COSTA", "PRADERA", "RASTREADOR", "USADAS"];
const COLOR_GRUPO: Record<GrupoMoto, string> = { COSTA: "#0369a1", PRADERA: "#166534", RASTREADOR: "#92400e", USADAS: "#6d28d9", OTRO: "#334155" };

export default function CajaView() {
  const hoyDefault = hoyISO();
  const [fecha, setFecha] = useState(hoyDefault);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);
  const [notas, setNotas] = useState("");
  const [msgCierre, setMsgCierre] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState<"todos" | GrupoMoto>("todos");
  const [grupoACerrar, setGrupoACerrar] = useState<GrupoMoto | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { profile } = useAuth();
  const esSecretaria = profile?.role === "SECRETARIA" || profile?.role === "ADMIN_PRINCIPAL";

  const { pagos, confirmarPago } = usePagos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { motos } = useMotos();
  const { cerrarCaja, cajaDia } = useCaja();

  const pagosDia = useMemo(() =>
    pagos.filter(p => p.fecha === fecha).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [pagos, fecha]
  );

  function getInfo(contratoId: string) {
    const c = contratos.find(ct => ct.id === contratoId);
    const cl = clientes.find(cl => cl.id === c?.cliente_id);
    const m = motos.find(m => m.id === c?.moto_id);
    return { nombre: cl?.nombre ?? "—", placa: m?.placa ?? "—" };
  }

  // Grupo de un pago: pago → contrato → moto → grupo (portafolio del que entra la plata).
  function grupoDePago(contratoId: string): GrupoMoto | null {
    const c = contratos.find(ct => ct.id === contratoId);
    const m = c ? motos.find(mo => mo.id === c.moto_id) : null;
    return (m?.grupo as GrupoMoto) ?? null;
  }

  // Vista filtrada por el chip de grupo (para los KPIs y las listas). El CIERRE siempre
  // usa el día completo, sin importar el filtro (ver resumenDia más abajo).
  const pagosDiaVista = useMemo(() =>
    filtroGrupo === "todos" ? pagosDia : pagosDia.filter(p => grupoDePago(p.contrato_id) === filtroGrupo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagosDia, filtroGrupo, contratos, motos]
  );

  function calcResumen(lista: typeof pagosDia) {
    const conf = lista.filter(p => p.estado === "Confirmado");
    const efectivo = conf.filter(p => p.metodo === "Efectivo").reduce((s, p) => s + p.valor, 0);
    const transfer = conf.filter(p => p.metodo === "Transferencia").reduce((s, p) => s + p.valor, 0);
    const pend = lista.filter(p => p.estado === "Pendiente");
    return { efectivo, transfer, total: efectivo + transfer, pendientes: pend, totalPendiente: pend.reduce((s, p) => s + p.valor, 0), confirmados: conf.length };
  }

  // resumen = lo que se muestra (filtrado por grupo). resumenDia = día completo (referencia).
  const resumen = useMemo(() => calcResumen(pagosDiaVista), [pagosDiaVista]);
  const resumenDia = useMemo(() => calcResumen(pagosDia), [pagosDia]);

  function resumenDeGrupo(grupo: GrupoMoto) {
    return calcResumen(pagosDia.filter(p => grupoDePago(p.contrato_id) === grupo));
  }
  // Cuántos grupos (con dinero) ya están cerrados hoy.
  const gruposConDinero = resumenPorGrupoSafe();
  function resumenPorGrupoSafe() { return GRUPOS.filter(g => pagosDia.some(p => grupoDePago(p.contrato_id) === g && p.estado === "Confirmado")); }
  const gruposCerrados = gruposConDinero.filter(g => cajaDia(fecha, g));

  // Desglose por cada grupo (siempre del día completo — es el cuadro nuevo por portafolio).
  const resumenPorGrupo = useMemo(() => {
    return GRUPOS.map(g => {
      const lista = pagosDia.filter(p => grupoDePago(p.contrato_id) === g);
      const r = calcResumen(lista);
      return { grupo: g, ...r, count: r.confirmados };
    }).filter(x => x.total > 0 || x.pendientes.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagosDia, contratos, motos]);

  const pagosEfectivo = useMemo(() => pagosDiaVista.filter(p => p.estado === "Confirmado" && p.metodo === "Efectivo"), [pagosDiaVista]);
  const pagosTransfer = useMemo(() => pagosDiaVista.filter(p => p.estado === "Confirmado" && p.metodo === "Transferencia"), [pagosDiaVista]);

  // Nombres de los funcionarios (para la conciliación de cobros en campo)
  const [nombresPorId, setNombresPorId] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from("profiles").select("id, nombre").then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: { id: string; nombre: string }) => { map[p.id] = p.nombre; });
      setNombresPorId(map);
    });
  }, []);

  // Conciliación: efectivo cobrado en campo, agrupado por funcionario
  const conciliacionCampo = useMemo(() => {
    const campo = pagosDiaVista.filter(p => p.tipo_registro === "campo");
    const porPersona: Record<string, { nombre: string; total: number; count: number; pendienteEntregar: number; pendienteConfirmar: number }> = {};
    campo.forEach(p => {
      const id = p.registrado_por ?? "—";
      if (!porPersona[id]) porPersona[id] = { nombre: nombresPorId[id] ?? "Funcionario", total: 0, count: 0, pendienteEntregar: 0, pendienteConfirmar: 0 };
      porPersona[id].total += p.valor;
      porPersona[id].count += 1;
      if (!p.entregado_caja) porPersona[id].pendienteEntregar += p.valor;
      if (p.estado === "Pendiente") porPersona[id].pendienteConfirmar += p.valor;
    });
    return Object.values(porPersona).sort((a, b) => b.total - a.total);
  }, [pagosDiaVista, nombresPorId]);

  const fechaObj = new Date(fecha + "T00:00:00");
  const fechaDisplay = `${DIAS[fechaObj.getDay()]} ${fechaObj.getDate()} de ${MESES[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;

  async function handleConfirmar(id: string) {
    if (!confirm("¿Confirmar este pago? Quedará registrado como confirmado en la caja.")) return;
    setConfirmando(id);
    await confirmarPago(id);
    setConfirmando(null);
  }

  function abrirCierre(grupo: GrupoMoto) {
    setGrupoACerrar(grupo);
    setMsgCierre(null);
    setShowModal(true);
  }

  async function handleCerrarCaja() {
    if (!esSecretaria || !grupoACerrar) return;
    const g = grupoACerrar;
    setCerrando(true);
    setMsgCierre(null);
    // Cada grupo se cierra por aparte: solo los pagos de ese portafolio.
    const r = resumenDeGrupo(g);
    const detalle = pagosDia
      .filter(p => p.estado === "Confirmado" && grupoDePago(p.contrato_id) === g)
      .map(p => {
        const { nombre, placa } = getInfo(p.contrato_id);
        return { placa, nombre, valor: p.valor, metodo: p.metodo, grupo: g };
      });
    const { error } = await cerrarCaja({
      fecha,
      grupo: g,
      efectivo: r.efectivo,
      transferencias: r.transfer,
      total: r.total,
      detalle,
      cerradoPor: profile?.id ?? null,
      notas: notas.trim() || undefined,
    });
    setCerrando(false);
    setShowModal(false);
    if (error) {
      setMsgCierre(`Error: ${error}`);
    } else {
      setMsgCierre(`Caja de ${g} cerrada — $${fmt(r.total)}`);
      setNotas("");
      setGrupoACerrar(null);
    }
  }

  function PagoCard({ p, showConfirm }: { p: typeof pagosDia[0]; showConfirm?: boolean }) {
    const { nombre, placa } = getInfo(p.contrato_id);
    const hora = p.created_at ? new Date(p.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "—";
    return (
      <div style={{
        background: "white",
        borderRadius: 12,
        padding: "12px 16px",
        border: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, textTransform: "uppercase", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nombre}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{placa} · {hora}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>${fmt(p.valor)}</div>
          {showConfirm && (
            <button onClick={() => handleConfirmar(p.id)} disabled={confirmando === p.id}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#0284c7", color: "white", opacity: confirmando === p.id ? 0.7 : 1, whiteSpace: "nowrap" }}>
              {confirmando === p.id ? "..." : "Confirmar"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const seccionEfectivo = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#166534", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Efectivo recibido
        </div>
        <span style={{ background: "#dcfce7", color: "#166534", fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          {pagosEfectivo.length} pagos
        </span>
      </div>
      {pagosEfectivo.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "white", borderRadius: 12, color: "#94a3b8", fontSize: 13 }}>
          Sin pagos en efectivo
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagosEfectivo.map(p => <PagoCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );

  const seccionTransfer = (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Transferencias confirmadas
        </div>
        <span style={{ background: "#dbeafe", color: "#1d4ed8", fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          {pagosTransfer.length} pagos
        </span>
      </div>
      {pagosTransfer.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "white", borderRadius: 12, color: "#94a3b8", fontSize: 13 }}>
          Sin transferencias confirmadas
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pagosTransfer.map(p => <PagoCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );

  const seccionPendientes = resumen.pendientes.length > 0 && (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 16, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Pendientes de confirmar
        </div>
        <span style={{ background: "#fef3c7", color: "#92400e", fontWeight: 800, fontSize: 12, padding: "3px 10px", borderRadius: 999 }}>
          ${fmt(resumen.totalPendiente)}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {resumen.pendientes.map(p => <PagoCard key={p.id} p={p} showConfirm={esSecretaria} />)}
      </div>
    </div>
  );

  const seccionConciliacionCampo = conciliacionCampo.length > 0 && (
    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "16px 20px" }}>
      <div style={{ fontWeight: 800, fontSize: 13, color: "#166534", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
        💵 Cobros en campo — efectivo a recibir por funcionario
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {conciliacionCampo.map((p, i) => (
          <div key={i} style={{ background: "white", borderRadius: 12, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", color: "#0f172a" }}>{p.nombre}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#166534" }}>${fmt(p.total)}</div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {p.count} cobro(s)
              {p.pendienteEntregar > 0 && <span style={{ color: "#92400e", fontWeight: 700 }}> · Pendiente entregar: ${fmt(p.pendienteEntregar)}</span>}
              {p.pendienteConfirmar > 0 && <span style={{ color: "#0369a1", fontWeight: 700 }}> · Sin confirmar: ${fmt(p.pendienteConfirmar)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const resumenFooter = (
    <div style={{ background: "#0f172a", borderRadius: 16, padding: "20px 24px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 }}>
        Resumen del día
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Efectivo</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80", marginTop: 2 }}>${fmt(resumen.efectivo)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Transferencias</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#93c5fd", marginTop: 2 }}>${fmt(resumen.transfer)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Total general</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginTop: 2 }}>${fmt(resumen.total)}</div>
        </div>
      </div>
      {resumen.pendientes.length > 0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>
            {resumen.pendientes.length} transferencia{resumen.pendientes.length > 1 ? "s" : ""} pendiente{resumen.pendientes.length > 1 ? "s" : ""} de confirmar — ${fmt(resumen.totalPendiente)}
          </span>
        </div>
      )}
    </div>
  );

  // Cada grupo se cierra por aparte. En la vista "Todos" el cierre se hace desde la
  // tarjeta de cada grupo; en una vista filtrada, este botón cierra ese grupo.
  const grupoEnVista = filtroGrupo === "todos" ? null : filtroGrupo;
  const cajaGrupoVista = grupoEnVista ? cajaDia(fecha, grupoEnVista) : null;
  const botonCerrar = esSecretaria && (
    <div>
      {msgCierre && (
        <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: msgCierre.startsWith("Error") ? "#fee2e2" : "#dcfce7", color: msgCierre.startsWith("Error") ? "#991b1b" : "#166534" }}>
          {msgCierre}
        </div>
      )}
      {grupoEnVista ? (
        cajaGrupoVista ? (
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 700, color: "#166534", textAlign: "center" }}>
            ✓ Caja de {grupoEnVista} cerrada — ${fmt(cajaGrupoVista.total)}
          </div>
        ) : (
          <button
            onClick={() => abrirCierre(grupoEnVista)}
            disabled={resumen.total === 0}
            style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: "none", background: resumen.total === 0 ? "#e2e8f0" : COLOR_GRUPO[grupoEnVista], color: resumen.total === 0 ? "#94a3b8" : "white", fontSize: 14, fontWeight: 800, cursor: resumen.total === 0 ? "not-allowed" : "pointer" }}
          >
            Cerrar caja de {grupoEnVista} — ${fmt(resumen.total)}
          </button>
        )
      ) : (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f1f5f9", fontSize: 12, color: "#475569", fontWeight: 600, textAlign: "center" }}>
          Cada grupo se cierra por aparte desde su tarjeta de arriba.
          {gruposConDinero.length > 0 && (
            <div style={{ marginTop: 4, fontWeight: 800, color: "#0f172a" }}>
              {gruposCerrados.length} de {gruposConDinero.length} grupos cerrados
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Hero */}
      <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Caja del
            </div>
            <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0f172a" }}>{fechaDisplay}</h2>
            {grupoEnVista ? (
              cajaGrupoVista && (
                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "#dcfce7", border: "1px solid #86efac" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>Caja de {grupoEnVista} cerrada</span>
                </div>
              )
            ) : gruposConDinero.length > 0 && (
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: gruposCerrados.length === gruposConDinero.length ? "#dcfce7" : "#fef3c7", border: `1px solid ${gruposCerrados.length === gruposConDinero.length ? "#86efac" : "#fde68a"}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: gruposCerrados.length === gruposConDinero.length ? "#166534" : "#92400e" }}>
                  {gruposCerrados.length} de {gruposConDinero.length} grupos cerrados
                </span>
              </div>
            )}
          </div>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a" }} />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 100, background: "#dcfce7", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Efectivo</div>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#166534", marginTop: 4 }}>${fmt(resumen.efectivo)}</div>
            <div style={{ fontSize: 11, color: "#166534", opacity: 0.7, marginTop: 2 }}>{pagosEfectivo.length} pagos</div>
          </div>
          <div style={{ flex: 1, minWidth: 100, background: "#dbeafe", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>Transferencias</div>
            <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#1d4ed8", marginTop: 4 }}>${fmt(resumen.transfer)}</div>
            <div style={{ fontSize: 11, color: "#1d4ed8", opacity: 0.7, marginTop: 2 }}>{pagosTransfer.length} pagos</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, background: "#0f172a", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Total general</div>
            <div style={{ fontSize: isMobile ? 22 : 30, fontWeight: 900, color: "white", marginTop: 4 }}>${fmt(resumen.total)}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{resumen.confirmados} confirmados{filtroGrupo !== "todos" ? ` · ${filtroGrupo}` : ""}</div>
          </div>
        </div>
      </div>

      {/* Chips de filtro por grupo (portafolio) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["todos", ...GRUPOS] as const).map(g => (
          <button
            key={g}
            onClick={() => setFiltroGrupo(g)}
            style={{
              border: "none", borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              background: filtroGrupo === g ? (g === "todos" ? "#0f172a" : COLOR_GRUPO[g as GrupoMoto]) : "#f1f5f9",
              color: filtroGrupo === g ? "white" : "#334155",
            }}
          >
            {g === "todos" ? "Todos" : g}
          </button>
        ))}
      </div>

      {/* Resumen por grupo (portafolios) — solo en la vista "Todos" */}
      {filtroGrupo === "todos" && resumenPorGrupo.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            📊 Recaudo por grupo
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {resumenPorGrupo.map(g => {
              const cerrada = cajaDia(fecha, g.grupo);
              return (
                <div
                  key={g.grupo}
                  style={{ border: `1px solid ${COLOR_GRUPO[g.grupo]}33`, borderLeft: `4px solid ${COLOR_GRUPO[g.grupo]}`, borderRadius: 12, padding: "12px 14px", background: "#f8fafc" }}
                >
                  <div onClick={() => setFiltroGrupo(g.grupo)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: COLOR_GRUPO[g.grupo], textTransform: "uppercase" }}>{g.grupo}</span>
                      {cerrada && <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 999 }}>✓ Cerrada</span>}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>${fmt(g.total)}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      Efectivo ${fmt(g.efectivo)} · Transf. ${fmt(g.transfer)}
                      <br />{g.count} pago{g.count !== 1 ? "s" : ""}{g.pendientes.length > 0 ? ` · ${g.pendientes.length} pend.` : ""}
                    </div>
                  </div>
                  {esSecretaria && !cerrada && g.total > 0 && (
                    <button
                      onClick={() => abrirCierre(g.grupo)}
                      style={{ marginTop: 10, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: COLOR_GRUPO[g.grupo], color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cerrar caja de {g.grupo}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Total general del día</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>${fmt(resumenDia.total)}</span>
          </div>
        </div>
      )}

      {/* Aviso cuando se está viendo un grupo filtrado */}
      {filtroGrupo !== "todos" && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: `${COLOR_GRUPO[filtroGrupo]}14`, border: `1px solid ${COLOR_GRUPO[filtroGrupo]}33`, fontSize: 13, color: COLOR_GRUPO[filtroGrupo], fontWeight: 700 }}>
          Viendo solo el grupo {filtroGrupo}. Cada grupo se cierra por aparte.
        </div>
      )}

      {/* Conciliación de cobros en campo por funcionario */}
      {seccionConciliacionCampo && (
        <div style={{ marginBottom: 20 }}>
          {seccionConciliacionCampo}
        </div>
      )}

      {/* Pendientes */}
      {resumen.pendientes.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {seccionPendientes}
        </div>
      )}

      {/* Two-column on desktop */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#f0fdf4", borderRadius: 16, padding: "16px 20px" }}>{seccionEfectivo}</div>
          <div style={{ background: "#eff6ff", borderRadius: 16, padding: "16px 20px" }}>{seccionTransfer}</div>
          {resumenFooter}
          <div style={{ marginTop: 4 }}>{botonCerrar}</div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#f0fdf4", borderRadius: 16, padding: "16px 20px" }}>{seccionEfectivo}</div>
            <div style={{ background: "#eff6ff", borderRadius: 16, padding: "16px 20px" }}>{seccionTransfer}</div>
          </div>
          <div style={{ width: 300, flexShrink: 0, position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {resumenFooter}
            {botonCerrar}
            {!esSecretaria && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fef3c7", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                Solo la secretaria puede cerrar la caja.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal confirmación cierre — por grupo */}
      {showModal && grupoACerrar && (() => {
        const rc = resumenDeGrupo(grupoACerrar);
        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 420, width: "100%" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 900, color: COLOR_GRUPO[grupoACerrar] }}>Cerrar caja de {grupoACerrar}</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>{fechaDisplay}</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "#dcfce7", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Efectivo</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#166534" }}>${fmt(rc.efectivo)}</div>
              </div>
              <div style={{ flex: 1, background: "#dbeafe", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>Transferencias</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#1d4ed8" }}>${fmt(rc.transfer)}</div>
              </div>
            </div>
            <div style={{ background: COLOR_GRUPO[grupoACerrar], borderRadius: 12, padding: "12px 14px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Total a cerrar — {grupoACerrar}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "white" }}>${fmt(rc.total)}</div>
            </div>
            {rc.pendientes.length > 0 && (
              <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                Ojo: {grupoACerrar} tiene {rc.pendientes.length} pago(s) pendiente(s) sin confirmar (${fmt(rc.totalPendiente)}) que no entran en este cierre.
              </div>
            )}
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Notas del cierre (opcional)..."
              rows={2}
              style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "vertical", marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleCerrarCaja} disabled={cerrando}
                style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#166534", color: "white", fontWeight: 800, fontSize: 13, cursor: cerrando ? "not-allowed" : "pointer", opacity: cerrando ? 0.7 : 1 }}>
                {cerrando ? "Cerrando..." : "Confirmar cierre"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
