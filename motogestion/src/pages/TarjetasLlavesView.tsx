import { useEffect, useMemo, useState } from "react";
import { useMotos, type Moto } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { usePrestamosDoc, type TipoDoc } from "../hooks/usePrestamosDoc";
import { useScope } from "../contexts/SubadminScopeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBackGuard } from "../contexts/BackNav";
import { card, inputStyle, labelStyle, primaryBtn, secondaryBtn, listaConScroll } from "../styles/shared";
import Placa from "../components/Placa";

const MOTIVOS = ["Copia de llave (perdió la suya)", "Trámite legal", "Otro"];

function fmtFecha(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO");
}
function tipoInfo(t: TipoDoc) {
  return t === "tarjeta"
    ? { emoji: "🪪", label: "Tarjeta de propiedad" }
    : { emoji: "🔑", label: "Llave" };
}

export default function TarjetasLlavesView() {
  const { profile } = useAuth();
  const { filtrarMotos } = useScope();
  const { motos: todasMotos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { prestamos, prestar, devolver } = usePrestamosDoc();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const motos = filtrarMotos(todasMotos);
  const motoIds = useMemo(() => new Set(motos.map(m => m.id)), [motos]);
  const prestamosScope = useMemo(
    () => prestamos.filter(p => motoIds.has(p.moto_id)),
    [prestamos, motoIds],
  );

  const [tab, setTab] = useState<"prestadas" | "historial">("prestadas");
  const [mostrarForm, setMostrarForm] = useState(false);
  useBackGuard(mostrarForm, () => setMostrarForm(false));

  // ── Formulario de préstamo ──────────────────────────────────────────────
  const [buscaMoto, setBuscaMoto] = useState("");
  const [motoSel, setMotoSel] = useState<Moto | null>(null);
  const [tipo, setTipo] = useState<TipoDoc>("tarjeta");
  const [prestadoA, setPrestadoA] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [motivoOtro, setMotivoOtro] = useState("");
  const [detalles, setDetalles] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devolviendoId, setDevolviendoId] = useState<string | null>(null);

  function clienteDeMoto(motoId: string): string {
    const c = contratos.find(ct => ct.moto_id === motoId && ct.estado === "Activo")
      ?? contratos.find(ct => ct.moto_id === motoId);
    const cl = c ? clientes.find(x => x.id === c.cliente_id) : null;
    return cl?.nombre ?? "";
  }
  function placaDe(motoId: string) { return motos.find(m => m.id === motoId)?.placa ?? "—"; }

  const motosFiltradas = useMemo(() => {
    const q = buscaMoto.toLowerCase().trim();
    if (!q) return [];
    return motos.filter(m => m.placa.toLowerCase().includes(q)).slice(0, 8);
  }, [buscaMoto, motos]);

  function elegirMoto(m: Moto) {
    setMotoSel(m);
    setBuscaMoto("");
    setPrestadoA(clienteDeMoto(m.id));
  }

  function resetForm() {
    setMotoSel(null); setBuscaMoto(""); setTipo("tarjeta");
    setPrestadoA(""); setMotivo(MOTIVOS[0]); setMotivoOtro("");
    setDetalles(""); setFoto(null); setFechaDevolucion(""); setError(null);
  }

  async function guardar() {
    if (procesando) return;
    if (!motoSel) { setError("Elige la moto (busca por placa)."); return; }
    if (!prestadoA.trim()) { setError("Esta moto no tiene un cliente asignado; no se puede prestar."); return; }
    if (!fechaDevolucion) { setError("Indica el día en que debe devolverla — el sistema te avisará si no la trae."); return; }
    const mot = motivo === "Otro" ? motivoOtro.trim() : motivo;
    setProcesando(true); setError(null);
    try {
      const { error } = await prestar({
        moto_id: motoSel.id, tipo, prestado_a: prestadoA.trim().toUpperCase(),
        motivo: mot, detalles: detalles.trim() || undefined, foto,
        fecha_devolucion_esperada: fechaDevolucion,
        registrado_por: profile?.id ?? null,
      });
      if (error) { setError(error); return; }
      resetForm();
      setMostrarForm(false);
      setTab("prestadas");
    } finally { setProcesando(false); }
  }

  async function marcarDevuelta(id: string) {
    if (devolviendoId) return;
    if (!window.confirm("¿Confirmas que la tarjeta/llave ya fue devuelta a la empresa?")) return;
    setDevolviendoId(id);
    try { await devolver(id); } finally { setDevolviendoId(null); }
  }

  const prestadas = prestamosScope.filter(p => p.estado === "prestado")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const historial = [...prestamosScope].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const lista = tab === "prestadas" ? prestadas : historial;

  return (
    <div style={{ paddingBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Tarjetas y Llaves</h2>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Control de tarjetas de propiedad y copias de llaves prestadas — para que se devuelvan a la empresa.</div>
        </div>
        {!mostrarForm && (
          <button onClick={() => { resetForm(); setMostrarForm(true); }} style={{ ...primaryBtn, minWidth: 0 }}>📤 Prestar</button>
        )}
      </div>

      {/* Formulario de préstamo */}
      {mostrarForm && (
        <div style={{ ...card, marginBottom: 16, borderColor: "var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Prestar tarjeta o llave</div>
            <button onClick={() => setMostrarForm(false)} style={{ background: "none", border: "none", fontSize: 20, color: "var(--faint)", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          {/* Moto */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Moto</label>
            {motoSel ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--soft2)", borderRadius: 10, padding: "8px 12px", boxSizing: "border-box" }}>
                <Placa placa={motoSel.placa} size="sm" />
                <span style={{ fontSize: 13, color: "var(--muted2)", flex: 1, minWidth: 0 }}>{clienteDeMoto(motoSel.id) || "sin cliente"}</span>
                <button onClick={() => { setMotoSel(null); setPrestadoA(""); }} style={{ ...secondaryBtn, fontSize: 12, padding: "4px 10px" }}>Cambiar</button>
              </div>
            ) : (
              <>
                <input value={buscaMoto} onChange={e => setBuscaMoto(e.target.value.toUpperCase())} placeholder="Buscar placa..." style={{ ...inputStyle, background: "var(--card)" }} />
                {motosFiltradas.length > 0 && (
                  <div style={{ marginTop: 6, ...listaConScroll(isMobile), maxHeight: "30vh" }}>
                    {motosFiltradas.map(m => (
                      <div key={m.id} onClick={() => elegirMoto(m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", cursor: "pointer", borderRadius: 8 }}>
                        <Placa placa={m.placa} size="sm" />
                        <span style={{ fontSize: 13, color: "var(--muted2)" }}>{clienteDeMoto(m.id) || "sin cliente"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tipo */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>¿Qué se presta?</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["tarjeta", "llave"] as TipoDoc[]).map(t => (
                <button key={t} onClick={() => setTipo(t)} style={{
                  flex: 1, minWidth: 0, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${tipo === t ? "var(--accent)" : "var(--line)"}`,
                  background: tipo === t ? "var(--accent-soft2)" : "var(--soft2)",
                  color: tipo === t ? "var(--accent-ink)" : "var(--muted2)",
                }}>{tipoInfo(t).emoji} {tipoInfo(t).label}</button>
              ))}
            </div>
          </div>

          {/* A quién — SIEMPRE el cliente de la moto (automático) */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Se le presta al cliente</label>
            {motoSel ? (
              prestadoA ? (
                <div style={{ ...inputStyle, background: "var(--soft2)", color: "var(--text)", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center" }}>{prestadoA}</div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 8, padding: "8px 12px" }}>⚠️ Esta moto no tiene un contrato con cliente. Verifica antes de prestar.</div>
              )
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Elige primero la moto — se toma su cliente automáticamente.</div>
            )}
          </div>

          {/* Motivo */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Motivo</label>
            <select value={motivo} onChange={e => setMotivo(e.target.value)} style={{ ...inputStyle, background: "var(--card)" }}>
              {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {motivo === "Otro" && (
              <input value={motivoOtro} onChange={e => setMotivoOtro(e.target.value)} placeholder="Escribe el motivo..." style={{ ...inputStyle, background: "var(--card)", marginTop: 8 }} />
            )}
          </div>

          {/* Detalles */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Detalles</label>
            <textarea value={detalles} onChange={e => setDetalles(e.target.value)} placeholder="Ej. se llevó la tarjeta para el trámite del traspaso en Tránsito..." rows={2}
              style={{ ...inputStyle, background: "var(--card)", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          {/* Fecha de devolución — obligatoria: dispara la alerta si no la trae */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>¿Qué día debe devolverla?</label>
            <input type="date" value={fechaDevolucion} min={new Date().toISOString().slice(0, 10)} onChange={e => setFechaDevolucion(e.target.value)}
              style={{ ...inputStyle, background: "var(--card)" }} />
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Si no la trae ese día, el sistema te avisará para que se la pidas.</div>
          </div>

          {/* Evidencia fotográfica */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Evidencia fotográfica</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13 }}>
                📷 Cámara
                <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setFoto(e.target.files?.[0] ?? null)} />
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                🖼 Galería
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setFoto(e.target.files?.[0] ?? null)} />
              </label>
              {foto && (
                <span style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  ✅ {foto.name.slice(0, 18)}
                  <button onClick={() => setFoto(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bad-ink)", fontWeight: 700 }}>✕</button>
                </span>
              )}
            </div>
          </div>

          {error && <div style={{ fontSize: 13, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>{error}</div>}

          <button onClick={guardar} disabled={procesando} style={{ ...primaryBtn, width: "100%", opacity: procesando ? 0.6 : 1 }}>
            {procesando ? "Guardando..." : "📤 Registrar préstamo"}
          </button>
        </div>
      )}

      {/* Chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={() => setTab("prestadas")} style={chip(tab === "prestadas")}>📋 Prestadas ahora {prestadas.length > 0 ? `(${prestadas.length})` : ""}</button>
        <button onClick={() => setTab("historial")} style={chip(tab === "historial")}>🕘 Historial</button>
      </div>

      {/* Lista */}
      <div style={listaConScroll(isMobile)}>
        {lista.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--faint)" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🪪</div>
            <div style={{ fontWeight: 700 }}>{tab === "prestadas" ? "No hay tarjetas ni llaves prestadas" : "Sin registros"}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {lista.map(p => {
              const ti = tipoInfo(p.tipo);
              const devuelta = p.estado === "devuelto";
              return (
                <div key={p.id} style={{
                  background: devuelta ? "var(--soft2)" : "var(--card)", borderRadius: 14, padding: "12px 14px",
                  border: `1px solid ${devuelta ? "var(--line)" : "var(--warn-line)"}`,
                  borderLeft: `4px solid ${devuelta ? "var(--ok)" : "var(--warn2)"}`,
                  opacity: devuelta ? 0.7 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
                      <Placa placa={placaDe(p.moto_id)} size="sm" />
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{ti.emoji} {ti.label}</span>
                    </div>
                    {devuelta ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "3px 8px" }}>✓ Devuelta {fmtFecha(p.fecha_devolucion)}</span>
                    ) : (
                      <button onClick={() => marcarDevuelta(p.id)} disabled={devolviendoId === p.id} style={{ ...primaryBtn, fontSize: 12, padding: "6px 12px", minWidth: 0, opacity: devolviendoId === p.id ? 0.6 : 1 }}>
                        {devolviendoId === p.id ? "..." : "✅ Devolver"}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 6, textTransform: "uppercase" }}>Prestada a: <strong>{p.prestado_a}</strong></div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {p.motivo ? `${p.motivo} · ` : ""}Desde {fmtFecha(p.fecha_prestamo)}
                    {p.foto_url && <> · <a href={p.foto_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 700 }}>📷 Ver foto</a></>}
                  </div>
                  {p.detalles && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.detalles}</div>}
                  {!devuelta && p.fecha_devolucion_esperada && (
                    p.fecha_devolucion_esperada <= new Date().toISOString().slice(0, 10)
                      ? <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bad-ink)", marginTop: 4 }}>⚠️ Debía devolverla el {fmtFecha(p.fecha_devolucion_esperada)} — pedírsela</div>
                      : <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>Debe devolverla el <strong>{fmtFecha(p.fecha_devolucion_esperada)}</strong></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function chip(activo: boolean): React.CSSProperties {
  return {
    padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: "none", background: activo ? "var(--accent)" : "var(--soft)", color: activo ? "var(--card)" : "var(--muted2)",
  };
}
