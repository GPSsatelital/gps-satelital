// LA BARRA DE FILTROS DE REPORTES (rediseño, 2-oct-2026): período, grupo y cobrador en un solo lugar,
// siempre a la vista, y mandan sobre todo lo que sale debajo. El período y la modalidad usan el
// selector nativo (en el celular abre el del sistema). Grupo y cobrador dejan marcar VARIOS a la vez
// (pedido del dueño, 5-oct): se combinan — COSTA + LUMAR = solo las motos de LUMAR en COSTA.
import { CalendarDays, Users, User, ChevronDown, X, Repeat, Check } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type OpcionFiltro = { valor: string; etiqueta: string; deshabilitada?: boolean };

const cajaSelector = (activo: boolean): React.CSSProperties => ({
  position: "relative", display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 30px 0 10px",
  borderRadius: 10, border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line)"),
  background: activo ? "var(--accent-soft)" : "var(--soft2)", color: "var(--text)", minWidth: 0, flex: "1 1 120px", boxSizing: "border-box",
});

function Selector({ icono, etiqueta, valor, opciones, onCambio, activo }: {
  icono: ReactNode; etiqueta: string; valor: string; opciones: OpcionFiltro[]; onCambio: (v: string) => void; activo: boolean;
}) {
  return (
    <label style={cajaSelector(activo)}>
      <span style={{ display: "flex", color: activo ? "var(--accent-ink)" : "var(--muted2)", flexShrink: 0 }} aria-hidden="true">{icono}</span>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{etiqueta}</span>
      <select value={valor} onChange={e => onCambio(e.target.value)}
        style={{ appearance: "none", WebkitAppearance: "none", border: "none", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 500, width: "100%", minWidth: 0, height: "100%", cursor: "pointer", outline: "none", fontFamily: "inherit", textOverflow: "ellipsis" }}>
        {opciones.map(o => <option key={o.valor} value={o.valor} disabled={o.deshabilitada} style={{ background: "var(--card)", color: "var(--text)" }}>{o.etiqueta}</option>)}
      </select>
      <ChevronDown size={16} aria-hidden="true" style={{ position: "absolute", right: 10, color: "var(--muted2)", pointerEvents: "none" }} />
    </label>
  );
}

/** "Todos los grupos" · "COSTA" · "COSTA, PRADERA" · "3 grupos" */
function textoVarios(sel: string[], opciones: OpcionFiltro[], todos: string, plural: string): string {
  if (sel.length === 0) return todos;
  const nombres = sel.map(v => opciones.find(o => o.valor === v)?.etiqueta ?? v);
  return nombres.length <= 2 ? nombres.join(", ") : `${nombres.length} ${plural}`;
}

function SelectorVarios({ icono, etiqueta, texto, activo, abierto, onAbrir }: {
  icono: ReactNode; etiqueta: string; texto: string; activo: boolean; abierto: boolean; onAbrir: () => void;
}) {
  return (
    <button type="button" onClick={onAbrir} aria-expanded={abierto} aria-label={`${etiqueta}: ${texto}`}
      style={{ ...cajaSelector(activo), cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
      <span style={{ display: "flex", color: activo ? "var(--accent-ink)" : "var(--muted2)", flexShrink: 0 }} aria-hidden="true">{icono}</span>
      <span style={{ fontSize: 13, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{texto}</span>
      <ChevronDown size={16} aria-hidden="true" style={{ position: "absolute", right: 10, color: "var(--muted2)", transform: abierto ? "rotate(180deg)" : "none" }} />
    </button>
  );
}

/** La lista para marcar varios. Va dentro de la barra (no flotando): en el celular no se sale ni tapa nada. */
function ListaVarios({ titulo, opciones, sel, onCambio, onCerrar, mayusculas }: {
  titulo: string; opciones: OpcionFiltro[]; sel: string[]; onCambio: (v: string[]) => void; onCerrar: () => void; mayusculas: boolean;
}) {
  const alternar = (v: string) => onCambio(sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v]);
  return (
    <div role="group" aria-label={titulo} style={{ marginTop: 8, padding: 8, borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 4 }}>
        {opciones.map(o => {
          const on = sel.includes(o.valor);
          return (
            <button key={o.valor} type="button" onClick={() => alternar(o.valor)} aria-pressed={on}
              style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 10px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                border: "1px solid " + (on ? "var(--accent-line)" : "transparent"), background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent-ink)" : "var(--text)" }}>
              <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: "1.5px solid " + (on ? "var(--accent-ink)" : "var(--muted2)"), background: on ? "var(--accent-ink)" : "transparent", color: "var(--card)" }}>
                {on && <Check size={13} strokeWidth={3} />}
              </span>
              <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: mayusculas ? "uppercase" : "none" }}>{o.etiqueta}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
        <button type="button" onClick={() => onCambio([])} disabled={sel.length === 0}
          style={{ minHeight: 40, padding: "0 12px", border: "none", borderRadius: 10, background: "transparent", color: sel.length ? "var(--accent-ink)" : "var(--muted2)", fontSize: 13, fontWeight: 500, cursor: sel.length ? "pointer" : "default", fontFamily: "inherit" }}>
          Todos
        </button>
        <button type="button" onClick={onCerrar}
          style={{ minHeight: 40, padding: "0 16px", border: "none", borderRadius: 10, background: "var(--accent)", color: "var(--on-accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Listo
        </button>
      </div>
    </div>
  );
}

export default function BarraFiltros({
  periodo, opcionesPeriodo, onPeriodo, textoPeriodo,
  grupos, opcionesGrupo, onGrupos,
  cobradores, opcionesCobrador, onCobradores,
  mostrarGrupoCobrador, personalizado, isMobile,
  modalidad = "", opcionesModalidad, onModalidad, soloHoy = false, textoFijo, sinGrupo = false, accion, dia,
}: {
  periodo: string; opcionesPeriodo: OpcionFiltro[]; onPeriodo: (v: string) => void;
  /** "1 al 30 de septiembre de 2026" */
  textoPeriodo: string;
  /** Los grupos marcados ([] = todos) y los que se pueden marcar. */
  grupos: string[]; opcionesGrupo: OpcionFiltro[]; onGrupos: (v: string[]) => void;
  /** Los cobradores marcados ([] = todos) y los que se pueden marcar ("__none__" = sin asignar). */
  cobradores: string[]; opcionesCobrador: OpcionFiltro[]; onCobradores: (v: string[]) => void;
  /** En las pestañas que todavía no filtran por grupo y cobrador, esos selectores no se muestran:
   *  un filtro que no filtra hace creer que el número cambió cuando no. */
  mostrarGrupoCobrador: boolean;
  /** Los campos de fecha del rango personalizado, cuando se elige. */
  personalizado?: ReactNode;
  isMobile: boolean;
  /** Semanal, quincenal, mensual o diario: solo en las pestañas que lo usan (si no llega, no se muestra). */
  modalidad?: string; opcionesModalidad?: OpcionFiltro[]; onModalidad?: (v: string) => void;
  /** Pestañas que son "foto de hoy" (Flota, Guardadas): sin selector de período, pero con grupo y cobrador. */
  soloHoy?: boolean;
  /** Pestañas con su propio selector de fecha (Nómina, por semana): sin el período de la barra, y
   *  "Viendo:" dice esto ("semana del 21 al 27 de sept"). */
  textoFijo?: string;
  /** Pestañas donde el grupo no aplica (Visitas: cuando se visita todavía no hay moto). */
  sinGrupo?: boolean;
  /** Lo que va al lado del "Viendo:" (el botón Descargar de la sección). */
  accion?: ReactNode;
  /** Cartera (mig 190): escoger un día pasado del cuaderno. "" = hoy. */
  dia?: { valor: string; opciones: OpcionFiltro[]; onCambio: (v: string) => void };
}) {
  const sinPeriodo = soloHoy || !!textoFijo;
  const conGrupo = mostrarGrupoCobrador && !sinGrupo;
  const conModalidad = !!onModalidad && !!opcionesModalidad;
  const hayFiltro = mostrarGrupoCobrador && ((conGrupo && grupos.length > 0) || cobradores.length > 0 || (conModalidad && modalidad !== ""));
  const [abierto, setAbierto] = useState<"grupo" | "cobrador" | null>(null);
  useEffect(() => {
    if (!abierto) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [abierto]);
  const textoGrupo = textoVarios(grupos, opcionesGrupo, "Todos los grupos", "grupos");
  // Los nombres de personas, en mayúscula (convención): en el botón, en "Viendo:" y en la etiqueta que flota.
  const textoCobrador = textoVarios(cobradores, opcionesCobrador.map(o => ({ ...o, etiqueta: o.etiqueta.toUpperCase() })), "Todos los cobradores", "cobradores");
  // Cuando la barra sale de la pantalla, una franja delgada fija arriba dice qué se está viendo y lleva
  // de vuelta a los filtros. (Un `sticky` no funciona acá: el marco de la app envuelve el contenido en
  // un contenedor con scroll propio que no es el que se mueve.)
  const ref = useRef<HTMLDivElement | null>(null);
  const [fuera, setFuera] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setFuera(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const resumen = [
    textoFijo ?? (soloHoy ? "Hoy" : opcionesPeriodo.find(o => o.valor === periodo)?.etiqueta),
    conGrupo && grupos.length > 0 ? textoGrupo : null,
    mostrarGrupoCobrador && cobradores.length > 0 ? textoCobrador : null,
    conModalidad && modalidad !== "" ? modalidad : null,
  ].filter(Boolean).join(" · ");
  return (
    <>
    {fuera && (
      <button onClick={() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        aria-label={`Viendo ${resumen}. Ir a los filtros`}
        style={{
          position: "fixed", top: isMobile ? 61 : 56, left: "50%", transform: "translateX(-50%)", zIndex: 45,
          display: "inline-flex", alignItems: "center", gap: 6, maxWidth: "calc(100% - 24px)", height: 36, padding: "0 12px",
          borderRadius: 999, border: "1px solid var(--accent-line)", background: "var(--card)", color: "var(--text)",
          fontSize: 12, fontWeight: 500, cursor: "pointer", boxShadow: "0 4px 16px rgba(5,10,22,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
        <CalendarDays size={14} aria-hidden="true" style={{ color: "var(--accent-ink)", flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{resumen}</span>
        <ChevronDown size={14} aria-hidden="true" style={{ transform: "rotate(180deg)", color: "var(--muted2)", flexShrink: 0 }} />
      </button>
    )}
    <div ref={ref} style={{
      background: "var(--card)", borderRadius: 14, border: "1px solid var(--line)",
      margin: "0 0 12px", padding: 8, textAlign: "left",
    }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!sinPeriodo && <Selector icono={<CalendarDays size={16} />} etiqueta="Período" valor={periodo} opciones={opcionesPeriodo} onCambio={onPeriodo} activo={false} />}
        {dia && <Selector icono={<CalendarDays size={16} />} etiqueta="Día" valor={dia.valor} opciones={dia.opciones} onCambio={dia.onCambio} activo={dia.valor !== ""} />}
        {mostrarGrupoCobrador && (
          <>
            {conGrupo && <SelectorVarios icono={<Users size={16} />} etiqueta="Grupo" texto={textoGrupo} activo={grupos.length > 0} abierto={abierto === "grupo"} onAbrir={() => setAbierto(a => a === "grupo" ? null : "grupo")} />}
            <SelectorVarios icono={<User size={16} />} etiqueta="Cobrador" texto={textoCobrador} activo={cobradores.length > 0} abierto={abierto === "cobrador"} onAbrir={() => setAbierto(a => a === "cobrador" ? null : "cobrador")} />
            {conModalidad && <Selector icono={<Repeat size={16} />} etiqueta="Modalidad" valor={modalidad} opciones={opcionesModalidad!} onCambio={onModalidad!} activo={modalidad !== ""} />}
          </>
        )}
      </div>
      {mostrarGrupoCobrador && abierto === "grupo" && conGrupo && (
        <ListaVarios titulo="Grupos" opciones={opcionesGrupo} sel={grupos} onCambio={onGrupos} onCerrar={() => setAbierto(null)} mayusculas={false} />
      )}
      {mostrarGrupoCobrador && abierto === "cobrador" && (
        <ListaVarios titulo="Cobradores" opciones={opcionesCobrador} sel={cobradores} onCambio={onCobradores} onCerrar={() => setAbierto(null)} mayusculas />
      )}
      {personalizado}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, minHeight: 20, fontSize: 12, color: "var(--muted2)", flexWrap: "wrap" }}>
        <span style={{ flex: "1 1 180px", minWidth: 0 }}>
          Viendo: <span style={{ color: "var(--text)", fontWeight: 500 }}>{textoFijo ?? (soloHoy ? "cómo está hoy (no depende de fechas)" : textoPeriodo)}</span>
          {conGrupo && grupos.length > 0 && <> · <span style={{ color: "var(--text)", fontWeight: 500 }}>{textoGrupo}</span></>}
          {mostrarGrupoCobrador && cobradores.length > 0 && <> · <span style={{ color: "var(--text)", fontWeight: 500, textTransform: "uppercase" }}>{textoCobrador}</span></>}
          {conModalidad && modalidad !== "" && <> · <span style={{ color: "var(--text)", fontWeight: 500 }}>{modalidad}</span></>}
        </span>
        {hayFiltro && (
          <button onClick={() => { onGrupos([]); onCobradores([]); onModalidad?.(""); setAbierto(null); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 32, padding: "0 8px", border: "none", borderRadius: 8, background: "transparent", color: "var(--accent-ink)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <X size={14} aria-hidden="true" /> Quitar filtros
          </button>
        )}
        {accion}
      </div>
    </div>
    </>
  );
}
