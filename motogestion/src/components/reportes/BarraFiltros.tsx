// LA BARRA DE FILTROS DE REPORTES (rediseño, 2-oct-2026): período, grupo y cobrador en un solo lugar,
// siempre a la vista, y mandan sobre todo lo que sale debajo. Selectores nativos a propósito: en el
// celular abren el selector del sistema, que es el más cómodo y accesible.
import { CalendarDays, Users, User, ChevronDown, X, Repeat } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type OpcionFiltro = { valor: string; etiqueta: string };

function Selector({ icono, etiqueta, valor, opciones, onCambio, activo }: {
  icono: ReactNode; etiqueta: string; valor: string; opciones: OpcionFiltro[]; onCambio: (v: string) => void; activo: boolean;
}) {
  return (
    <label style={{
      position: "relative", display: "flex", alignItems: "center", gap: 6, height: 40, padding: "0 30px 0 10px",
      borderRadius: 10, border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line)"),
      background: activo ? "var(--accent-soft)" : "var(--soft2)", color: "var(--text)", minWidth: 0, flex: "1 1 120px", boxSizing: "border-box",
    }}>
      <span style={{ display: "flex", color: activo ? "var(--accent-ink)" : "var(--muted2)", flexShrink: 0 }} aria-hidden="true">{icono}</span>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{etiqueta}</span>
      <select value={valor} onChange={e => onCambio(e.target.value)}
        style={{ appearance: "none", WebkitAppearance: "none", border: "none", background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 500, width: "100%", minWidth: 0, height: "100%", cursor: "pointer", outline: "none", fontFamily: "inherit", textOverflow: "ellipsis" }}>
        {opciones.map(o => <option key={o.valor} value={o.valor} style={{ background: "var(--card)", color: "var(--text)" }}>{o.etiqueta}</option>)}
      </select>
      <ChevronDown size={16} aria-hidden="true" style={{ position: "absolute", right: 10, color: "var(--muted2)", pointerEvents: "none" }} />
    </label>
  );
}

export default function BarraFiltros({
  periodo, opcionesPeriodo, onPeriodo, textoPeriodo,
  grupo, opcionesGrupo, onGrupo,
  cobrador, opcionesCobrador, onCobrador,
  mostrarGrupoCobrador, personalizado, isMobile,
  modalidad = "", opcionesModalidad, onModalidad,
}: {
  periodo: string; opcionesPeriodo: OpcionFiltro[]; onPeriodo: (v: string) => void;
  /** "1 al 30 de septiembre de 2026" */
  textoPeriodo: string;
  grupo: string; opcionesGrupo: OpcionFiltro[]; onGrupo: (v: string) => void;
  cobrador: string; opcionesCobrador: OpcionFiltro[]; onCobrador: (v: string) => void;
  /** En las pestañas que todavía no filtran por grupo y cobrador, esos selectores no se muestran:
   *  un filtro que no filtra hace creer que el número cambió cuando no. */
  mostrarGrupoCobrador: boolean;
  /** Los campos de fecha del rango personalizado, cuando se elige. */
  personalizado?: ReactNode;
  isMobile: boolean;
  /** Semanal, quincenal, mensual o diario: solo en las pestañas que lo usan (si no llega, no se muestra). */
  modalidad?: string; opcionesModalidad?: OpcionFiltro[]; onModalidad?: (v: string) => void;
}) {
  const conModalidad = !!onModalidad && !!opcionesModalidad;
  const hayFiltro = mostrarGrupoCobrador && (grupo !== "" || cobrador !== "" || (conModalidad && modalidad !== ""));
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
    opcionesPeriodo.find(o => o.valor === periodo)?.etiqueta,
    mostrarGrupoCobrador && grupo !== "" ? opcionesGrupo.find(o => o.valor === grupo)?.etiqueta : null,
    mostrarGrupoCobrador && cobrador !== "" ? opcionesCobrador.find(o => o.valor === cobrador)?.etiqueta : null,
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
        <Selector icono={<CalendarDays size={16} />} etiqueta="Período" valor={periodo} opciones={opcionesPeriodo} onCambio={onPeriodo} activo={false} />
        {mostrarGrupoCobrador && (
          <>
            <Selector icono={<Users size={16} />} etiqueta="Grupo" valor={grupo} opciones={opcionesGrupo} onCambio={onGrupo} activo={grupo !== ""} />
            <Selector icono={<User size={16} />} etiqueta="Cobrador" valor={cobrador} opciones={opcionesCobrador} onCambio={onCobrador} activo={cobrador !== ""} />
            {conModalidad && <Selector icono={<Repeat size={16} />} etiqueta="Modalidad" valor={modalidad} opciones={opcionesModalidad!} onCambio={onModalidad!} activo={modalidad !== ""} />}
          </>
        )}
      </div>
      {personalizado}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, minHeight: 20, fontSize: 12, color: "var(--muted2)" }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          Viendo: <span style={{ color: "var(--text)", fontWeight: 500 }}>{textoPeriodo}</span>
          {mostrarGrupoCobrador && grupo !== "" && <> · <span style={{ color: "var(--text)", fontWeight: 500 }}>{opcionesGrupo.find(o => o.valor === grupo)?.etiqueta}</span></>}
          {mostrarGrupoCobrador && cobrador !== "" && <> · <span style={{ color: "var(--text)", fontWeight: 500, textTransform: "uppercase" }}>{opcionesCobrador.find(o => o.valor === cobrador)?.etiqueta}</span></>}
          {conModalidad && modalidad !== "" && <> · <span style={{ color: "var(--text)", fontWeight: 500 }}>{modalidad}</span></>}
        </span>
        {hayFiltro && (
          <button onClick={() => { onGrupo(""); onCobrador(""); onModalidad?.(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, height: 32, padding: "0 8px", border: "none", borderRadius: 8, background: "transparent", color: "var(--accent-ink)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            <X size={14} aria-hidden="true" /> Quitar filtros
          </button>
        )}
      </div>
    </div>
    </>
  );
}
