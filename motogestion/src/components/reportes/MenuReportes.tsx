// EL MENÚ DE REPORTES (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md).
//
// Antes: 11 pestañas sueltas con emojis en una grilla de 4. Ahora: 5 secciones por la pregunta que
// responden, y adentro de cada una sus partes. Las claves de pestaña no cambian (el resto de la
// pantalla las sigue usando igual): solo cambia cómo se agrupan y cómo se ven.
import type { ReactNode } from "react";
import { LayoutDashboard, Banknote, Briefcase, Users, Motorbike } from "lucide-react";

export type TabReportes = "resumen" | "admins" | "nomina" | "grupos" | "visitas" | "cartera" | "convenios" | "flota" | "guardadas" | "entregas";

export const SECCIONES: Array<{ clave: string; etiqueta: string; icono: ReactNode; partes: Array<{ tab: TabReportes; etiqueta: string }> }> = [
  { clave: "resumen", etiqueta: "Resumen", icono: <LayoutDashboard size={18} aria-hidden="true" />, partes: [{ tab: "resumen", etiqueta: "Resumen" }] },
  { clave: "cobranza", etiqueta: "Cobranza", icono: <Banknote size={18} aria-hidden="true" />, partes: [{ tab: "cartera", etiqueta: "Cartera" }, { tab: "convenios", etiqueta: "Acuerdos" }] },
  { clave: "portafolios", etiqueta: "Portafolios", icono: <Briefcase size={18} aria-hidden="true" />, partes: [{ tab: "grupos", etiqueta: "Por grupo" }, { tab: "admins", etiqueta: "Por cobrador" }] },
  { clave: "equipo", etiqueta: "Equipo", icono: <Users size={18} aria-hidden="true" />, partes: [{ tab: "nomina", etiqueta: "Nómina" }, { tab: "visitas", etiqueta: "Visitas" }] },
  { clave: "flota", etiqueta: "Flota", icono: <Motorbike size={18} aria-hidden="true" />, partes: [{ tab: "flota", etiqueta: "Motos" }, { tab: "guardadas", etiqueta: "Guardadas" }, { tab: "entregas", etiqueta: "Entregas" }] },
];

export default function MenuReportes({ tab, onTab }: { tab: TabReportes; onTab: (t: TabReportes) => void }) {
  const seccion = SECCIONES.find(s => s.partes.some(p => p.tab === tab)) ?? null;
  return (
    <nav aria-label="Secciones de Reportes" style={{ display: "grid", gap: 8, marginBottom: 12, textAlign: "left" }}>
      <div role="tablist" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 4, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: 4 }}>
        {SECCIONES.map(s => {
          const activa = seccion?.clave === s.clave;
          return (
            <button key={s.clave} role="tab" aria-selected={activa} onClick={() => onTab(s.partes[0].tab)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                minHeight: 52, minWidth: 0, padding: "6px 2px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activa ? "var(--accent-soft)" : "transparent", color: activa ? "var(--accent-ink)" : "var(--muted2)",
                fontSize: 11, fontWeight: activa ? 600 : 500, fontFamily: "inherit",
              }}>
              {s.icono}
              <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.etiqueta}</span>
            </button>
          );
        })}
      </div>
      {seccion && seccion.partes.length > 1 && (
        <div role="tablist" aria-label={`Partes de ${seccion.etiqueta}`} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {seccion.partes.map(p => {
            const activa = p.tab === tab;
            return (
              <button key={p.tab} role="tab" aria-selected={activa} onClick={() => onTab(p.tab)}
                style={{
                  minHeight: 36, padding: "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                  border: "1px solid " + (activa ? "var(--accent-line)" : "var(--line2)"),
                  background: activa ? "var(--accent-soft)" : "transparent", color: activa ? "var(--accent-ink)" : "var(--text)",
                  fontSize: 13, fontWeight: activa ? 600 : 500,
                }}>
                {p.etiqueta}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
