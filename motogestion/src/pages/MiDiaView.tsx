import { useEffect, useMemo, useState } from "react";
import type { ViewKey } from "../App";
import { useAuth } from "../contexts/AuthContext";
import { useTareas, tareaVencida, EVIDENCIA_LABEL, type Tarea } from "../hooks/useTareas";
import { usePendientes, bloqueDe, BLOQUE_LABEL, type Bloque, type Pendiente } from "../hooks/usePendientes";
import { useMotos } from "../hooks/useMotos";
import { useClientes } from "../hooks/useClientes";
import { useSubadmins } from "../hooks/useSubadmins";
import { card, primaryBtn, secondaryBtn, listaConScroll } from "../styles/shared";
import ModalAsignarTarea from "../components/ModalAsignarTarea";
import ModalResolverTarea from "../components/ModalResolverTarea";
import PanelEquipo from "../components/PanelEquipo";
import PanelDelDia from "../components/PanelDelDia";
import Placa from "../components/Placa";
import { fmtFechaCorta } from "../utils/fecha";

// MI DÍA — lo que le toca hoy a esta persona. Dos cosas distintas, juntas por primera vez:
//
//   1. Los PENDIENTES que el servidor calcula solo (mora, gabela, papeles, taller…) — migs 142/144.
//      No se duplica el cálculo de Cartera: la vista los deduce de los mismos datos, así que no
//      pueden decir cosas distintas. Ese era el riesgo de las dos verdades que este proyecto ya
//      pagó caro, y por eso se calculan en UN solo lugar: el servidor.
//   2. Las TAREAS que alguien le montó a mano — mig 140.
//
// Ver docs/FLUJO-DIARIO.md: el día del subadmin arranca validando esta lista.
//
// 🔴 LA MISMA PANTALLA SE LEE DISTINTO SEGÚN EL PUESTO, porque el día de cada quien es distinto:
//   · Subadmin y secretaria: sus pendientes primero, después sus tareas.
//   · Sergio (ADMIN): arriba CÓMO VA EL EQUIPO — *"su trabajo principal es supervisar el trabajo
//     de los demás admins"*. Su lista propia queda debajo.
//   · El dueño: arriba EL DÍA — la plata, después lo que espera su decisión, después lo que va mal.
// No son tres pantallas: es una sola con los bloques en el orden que cada quien necesita.

const ORDEN_BLOQUES: Bloque[] = ["cobro", "plata", "motos", "contratos"];

export default function MiDiaView({ onNavigate }: { onNavigate?: (v: ViewKey) => void }) {
  const { profile, puede } = useAuth();
  // Mismo criterio que el resto de las vistas: 900px es el punto de quiebre de la app.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  const { tareas, loading, cancelarTarea } = useTareas();
  const { motos } = useMotos();
  const { clientes } = useClientes();
  const { nombreSubadmin } = useSubadmins();

  const [asignando, setAsignando] = useState(false);
  const [resolviendo, setResolviendo] = useState<Tarea | null>(null);
  const [verMandadas, setVerMandadas] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const uid = profile?.id ?? "";
  const puedeAsignar = puede("asignar_tarea");

  // Los pendientes que el servidor calculó y que le tocan a esta persona (mig 142). Los ya
  // atendidos se quedan a la vista, tachados: al final del día vale ver lo que se hizo.
  const { pendientes, atendidos, error: errorPend, marcarAtendido, estaAtendido, mios } = usePendientes();
  const misPendientes = useMemo(() => mios(uid, profile?.role), [mios, uid, profile?.role]);
  const porHacer = misPendientes.filter(p => !estaAtendido(p.clave));

  // Los cuatro frentes del día, en orden. Con 19 tipos distintos una sola pila se vuelve ilegible:
  // el cobro (lo primero de la mañana) quedaba revuelto con un SOAT por vencer.
  const grupos = useMemo(() => {
    const m = new Map<Bloque, Pendiente[]>();
    for (const p of misPendientes) {
      const b = bloqueDe(p.tipo);
      if (!m.has(b)) m.set(b, []);
      m.get(b)!.push(p);
    }
    return ORDEN_BLOQUES.filter(b => m.has(b)).map(b => ({ bloque: b, items: m.get(b)! }));
  }, [misPendientes]);

  const esJefe = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";

  async function handleAtender(clave: string) {
    if (!profile) return;
    const { error } = await marcarAtendido(clave, profile.id);
    if (error) { setMsg("No se pudo marcar: " + error); setTimeout(() => setMsg(null), 5000); }
  }

  const { mias, resueltasHoy, mandadas } = useMemo(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const deUno = tareas.filter(t => t.asignada_a === uid);
    return {
      // Las vencidas primero, y dentro de eso la más vieja arriba: la que lleva más esperando.
      mias: deUno.filter(t => t.estado === "pendiente").sort((a, b) => {
        const va = tareaVencida(a) ? 0 : 1, vb = tareaVencida(b) ? 0 : 1;
        return va - vb || a.created_at.localeCompare(b.created_at);
      }),
      resueltasHoy: deUno.filter(t => t.estado !== "pendiente" && (t.resuelta_el ?? "").slice(0, 10) === hoy),
      mandadas: tareas.filter(t => t.asignada_por === uid && t.estado !== "cancelada")
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    };
  }, [tareas, uid]);

  function contexto(t: Tarea) {
    const moto = t.moto_id ? motos.find(m => m.id === t.moto_id) : null;
    const cliente = t.cliente_id ? clientes.find(c => c.id === t.cliente_id) : null;
    return { moto, cliente };
  }

  async function handleCancelar(t: Tarea) {
    if (!profile) return;
    if (!confirm(`¿Cancelar la tarea "${t.titulo}"? Queda el rastro de que se pidió.`)) return;
    const { error } = await cancelarTarea(t.id, profile.id);
    setMsg(error ? "No se pudo cancelar: " + error : "Tarea cancelada.");
    setTimeout(() => setMsg(null), 4000);
  }

  function Tarjeta({ t, mostrarQuien }: { t: Tarea; mostrarQuien: "de" | "para" }) {
    const { moto, cliente } = contexto(t);
    const vencida = tareaVencida(t);
    const resuelta = t.estado !== "pendiente";
    const tono = t.estado === "cumplida" ? "ok" : t.estado === "no_se_pudo" ? "bad" : vencida ? "bad" : "muted";
    return (
      <div style={{
        padding: "11px 12px", borderBottom: "1px solid var(--line)",
        opacity: resuelta ? 0.62 : 1,
        borderLeft: `3px solid ${vencida && !resuelta ? "var(--bad)" : "transparent"}`,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", textDecoration: t.estado === "cumplida" ? "line-through" : "none" }}>
              {t.titulo}
            </div>
            {t.detalle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.45 }}>{t.detalle}</div>}
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {moto && <Placa placa={moto.placa} grupo={moto.grupo} size="sm" />}
              {cliente && <span style={{ textTransform: "uppercase" }}>{cliente.nombre}</span>}
              <span>
                {mostrarQuien === "de"
                  ? `lo pidió ${nombreSubadmin(t.asignada_por) ?? "—"}`
                  : `para ${nombreSubadmin(t.asignada_a) ?? "—"}`}
              </span>
              {t.fecha_limite && (
                <span style={{ color: vencida && !resuelta ? "var(--bad-ink)" : "var(--muted)", fontWeight: vencida && !resuelta ? 700 : 400 }}>
                  · {vencida && !resuelta ? "venció el" : "para el"} {fmtFechaCorta(t.fecha_limite)}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
            {!resuelta && t.evidencias_requeridas.length > 0 && (
              <span style={{ fontSize: 10, background: "var(--warn-soft)", color: "var(--warn-ink)", borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap" }}>
                Pide {t.evidencias_requeridas.map(e => EVIDENCIA_LABEL[e].toLowerCase()).join(" + ")}
              </span>
            )}
            {resuelta && (
              <span style={{
                fontSize: 10, borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap",
                background: tono === "ok" ? "var(--ok-soft)" : "var(--bad-soft)",
                color: tono === "ok" ? "var(--ok-ink)" : "var(--bad-ink)",
              }}>
                {t.estado === "cumplida" ? "Lista" : t.estado === "no_se_pudo" ? "No se pudo" : "Cancelada"}
              </span>
            )}
          </div>
        </div>

        {/* Lo que dejó al resolverla. Se muestra siempre: es la prueba de que se hizo. */}
        {t.estado === "no_se_pudo" && t.motivo_no_se_pudo && (
          <div style={{ marginTop: 7, fontSize: 12, color: "var(--bad-ink)", background: "var(--bad-soft)", borderRadius: 8, padding: "7px 9px", lineHeight: 1.45 }}>
            No se pudo: {t.motivo_no_se_pudo}
          </div>
        )}
        {t.estado === "cumplida" && (t.resultado_comentario || t.resultado_fotos.length > 0 || t.resultado_ubicacion || t.resultado_firma_url) && (
          <div style={{ marginTop: 7, fontSize: 11.5, color: "var(--muted)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {t.resultado_comentario && <span style={{ flex: "1 1 100%", lineHeight: 1.45 }}>“{t.resultado_comentario}”</span>}
            {t.resultado_fotos.map((f, i) => (
              <a key={i} href={f} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>Foto {i + 1}</a>
            ))}
            {t.resultado_ubicacion && (
              <a href={`https://maps.google.com/?q=${t.resultado_ubicacion.lat},${t.resultado_ubicacion.lng}`}
                 target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>Ver ubicación</a>
            )}
            {t.resultado_firma_url && (
              <a href={t.resultado_firma_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>Firma</a>
            )}
          </div>
        )}

        {!resuelta && (
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
            {t.asignada_a === uid && (
              <button onClick={() => setResolviendo(t)} style={{ ...primaryBtn, fontSize: 12, padding: "7px 14px" }}>
                Resolver
              </button>
            )}
            {t.asignada_por === uid && (
              <button onClick={() => handleCancelar(t)} style={{ ...secondaryBtn, fontSize: 12, padding: "7px 14px" }}>
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const lista = verMandadas ? mandadas : mias;

  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Mi día</h2>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, marginBottom: 14 }}>
        {profile?.nombre ?? ""} · {mias.length === 0 ? "sin tareas pendientes" : `${mias.length} ${mias.length === 1 ? "tarea pendiente" : "tareas pendientes"}`}
      </div>

      {msg && (
        <div style={{ ...card, padding: "10px 12px", marginBottom: 12, background: "var(--ok-soft)", color: "var(--ok-ink)", fontSize: 13, fontWeight: 600 }}>{msg}</div>
      )}

      {/* EL DUEÑO LEE PRIMERO LA PLATA. Va antes que su propia lista de pendientes a propósito:
          es el orden que él pidió (plata → decisiones → alarmas). */}
      {profile?.role === "ADMIN_PRINCIPAL" && <PanelDelDia pendientes={pendientes} onNavegar={onNavigate} />}

      {/* SERGIO LEE PRIMERO AL EQUIPO. Su lista propia queda debajo. */}
      <PanelEquipo pendientes={pendientes} atendidos={atendidos} tareas={tareas} activo={esJefe} />

      {/* LO PRIMERO DEL DÍA: los pendientes que el servidor calculó (migs 142/144). Ya no es un
          enlace a Cartera: la lista existe de verdad, con dueño, y se puede marcar atendida. */}
      <div style={{ ...card, padding: 0, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: misPendientes.length ? "1px solid var(--line)" : "none" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              Pendientes de hoy {porHacer.length > 0 && <span style={{ color: "var(--bad-ink)" }}>({porHacer.length})</span>}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
              {errorPend
                ? "No se pudieron cargar."
                : porHacer.length === 0
                  ? "Nada pendiente por ahora."
                  : "Lo que te toca hoy. Al marcarlo atendido desaparece hasta mañana."}
            </div>
          </div>
          <button onClick={() => onNavigate?.("cobros")} style={{ ...secondaryBtn, fontSize: 12, padding: "8px 14px", whiteSpace: "nowrap" }}>
            Ir a Cartera
          </button>
        </div>

        {errorPend && (
          <div role="alert" style={{ padding: "10px 12px", background: "var(--bad-soft)", color: "var(--bad-ink)", fontSize: 12.5, lineHeight: 1.45 }}>
            {errorPend}
          </div>
        )}

        {misPendientes.length > 0 && (
          <div style={listaConScroll(isMobile)}>
            {grupos.map(({ bloque, items }) => (
              <div key={bloque}>
                <div style={{
                  padding: "7px 12px", fontSize: 11, fontWeight: 700, letterSpacing: .4,
                  textTransform: "uppercase", color: "var(--muted2)", background: "var(--soft2)",
                  position: "sticky", top: 0, zIndex: 1,
                }}>
                  {BLOQUE_LABEL[bloque]} ({items.filter(p => !estaAtendido(p.clave)).length})
                </div>
                {items.map(p => {
                  const hecho = estaAtendido(p.clave);
                  const color = p.nivel === "critico" ? "var(--bad)" : p.nivel === "alerta" ? "var(--warn2)" : "var(--accent)";
                  return (
                    <div key={p.clave} style={{
                      padding: "10px 12px", borderBottom: "1px solid var(--line)",
                      borderLeft: `3px solid ${hecho ? "transparent" : color}`,
                      opacity: hecho ? 0.55 : 1,
                      display: "flex", gap: 8, alignItems: "flex-start",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textDecoration: hecho ? "line-through" : "none" }}>
                          {p.titulo}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.45 }}>{p.detalle}</div>
                      </div>
                      <button
                        onClick={() => handleAtender(p.clave)}
                        disabled={hecho}
                        style={{
                          ...secondaryBtn, fontSize: 11, padding: "6px 11px", whiteSpace: "nowrap", flexShrink: 0,
                          opacity: hecho ? 0.6 : 1, cursor: hecho ? "default" : "pointer",
                        }}>
                        {hecho ? "✓ Atendido" : "Marcar atendido"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setVerMandadas(false)} style={{ ...(verMandadas ? secondaryBtn : primaryBtn), fontSize: 12, padding: "7px 14px" }}>
          Mis tareas {mias.length > 0 && `(${mias.length})`}
        </button>
        {puedeAsignar && (
          <button onClick={() => setVerMandadas(true)} style={{ ...(verMandadas ? primaryBtn : secondaryBtn), fontSize: 12, padding: "7px 14px" }}>
            Las que mandé {mandadas.filter(t => t.estado === "pendiente").length > 0 && `(${mandadas.filter(t => t.estado === "pendiente").length})`}
          </button>
        )}
        <div style={{ flex: 1 }} />
        {puedeAsignar && (
          <button onClick={() => setAsignando(true)} style={{ ...primaryBtn, fontSize: 12, padding: "8px 14px" }}>
            + Montar una tarea
          </button>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={listaConScroll(isMobile)}>
          {loading && <div style={{ padding: 18, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Cargando...</div>}
          {!loading && lista.length === 0 && (
            <div style={{ padding: 22, textAlign: "center", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>
              {verMandadas
                ? "No has montado ninguna tarea todavía."
                : "No tienes tareas asignadas. Tus cobros del día están en Cartera."}
            </div>
          )}
          {lista.map(t => <Tarjeta key={t.id} t={t} mostrarQuien={verMandadas ? "para" : "de"} />)}

          {/* Lo que resolviste hoy se queda a la vista: al final del día vale ver lo que hiciste,
              no solo lo que falta. */}
          {!verMandadas && resueltasHoy.length > 0 && (
            <>
              <div style={{ padding: "9px 12px", fontSize: 11, fontWeight: 700, letterSpacing: .4, textTransform: "uppercase", color: "var(--muted2)", background: "var(--soft2)" }}>
                Resueltas hoy
              </div>
              {resueltasHoy.map(t => <Tarjeta key={t.id} t={t} mostrarQuien="de" />)}
            </>
          )}
        </div>
      </div>

      {asignando && <ModalAsignarTarea onClose={() => setAsignando(false)} onHecho={() => { setAsignando(false); setMsg("Tarea asignada."); setTimeout(() => setMsg(null), 4000); }} />}
      {resolviendo && <ModalResolverTarea tarea={resolviendo} onClose={() => setResolviendo(null)} onHecho={(t) => { setResolviendo(null); setMsg(t); setTimeout(() => setMsg(null), 4000); }} />}
    </div>
  );
}
