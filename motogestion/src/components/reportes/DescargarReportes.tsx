// DESCARGAR (rediseño aprobado por el dueño el 2-oct-2026): el informe para los socios en PDF o
// impreso, con las 5 secciones de Reportes y sus mismas cifras, y las listas en Excel. Obedece a la
// barra de filtros (período, grupo y cobrador): ya no tiene filtros propios.
import { useState } from "react";
import { Check, Download, FileDown, Printer } from "lucide-react";
import { boton } from "./ResumenReportes";
import { SECCIONES_INFORME, type SeccionInforme } from "../../utils/informeSocios";

export type ListaExcel = { clave: string; etiqueta: string; cuenta: string; onDescargar: () => void };

export default function DescargarReportes(p: {
  generando: boolean;
  /** null = listo para descargar; si no, por qué todavía no (la nómina cargando, por ejemplo). */
  noListo: string | null;
  onPdf: (secciones: SeccionInforme[], detalle: boolean) => void;
  onImprimir: (secciones: SeccionInforme[], detalle: boolean) => void;
  listas: ListaExcel[];
}) {
  const [sel, setSel] = useState<SeccionInforme[]>(SECCIONES_INFORME.map(s => s.clave));
  const [detalle, setDetalle] = useState(false);
  const alternar = (k: SeccionInforme) => setSel(s => s.includes(k) ? s.filter(x => x !== k) : SECCIONES_INFORME.map(x => x.clave).filter(x => x === k || s.includes(x)));
  const puede = !p.generando && p.noListo === null;
  const tarjeta: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 16, boxSizing: "border-box", minWidth: 0, textAlign: "left" };
  const btn = (principal: boolean): React.CSSProperties => ({
    flex: "1 1 140px", minHeight: 44, borderRadius: 12, cursor: puede ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: puede ? 1 : 0.5,
    border: principal ? "none" : "1px solid var(--line2)", background: principal ? "var(--accent)" : "transparent", color: principal ? "var(--on-accent)" : "var(--text)",
  });
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <section style={tarjeta}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Informe para los socios</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>
          Lo mismo que ves en Reportes, con las mismas cifras y los filtros de arriba, listo para enviar o imprimir. Al final van tres anexos: lo recaudado por cobrador y grupo, efectivo y transferencias por cobrador, y los clientes que deben sin acuerdo.
        </p>
        <div style={{ fontSize: 12, color: "var(--muted2)", margin: "12px 0 6px" }}>Qué incluir</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SECCIONES_INFORME.map(s => {
            const on = sel.includes(s.clave);
            return (
              <button key={s.clave} onClick={() => alternar(s.clave)} aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: on ? 600 : 500,
                  border: "1px solid " + (on ? "var(--accent-line)" : "var(--line2)"), background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent-ink)" : "var(--text)" }}>
                {on && <Check size={14} aria-hidden="true" />}{s.etiqueta}
              </button>
            );
          })}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 13, color: "var(--text)", cursor: "pointer", minHeight: 44 }}>
          <input type="checkbox" checked={detalle} onChange={() => setDetalle(v => !v)} style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0 }} />
          <span>Con las listas completas <span style={{ color: "var(--muted2)" }}>(cliente por cliente: en mora, retenidas, acuerdos atrasados y motos guardadas)</span></span>
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button disabled={!puede} onClick={() => p.onPdf(sel, detalle)} style={btn(true)}>
            <FileDown size={16} aria-hidden="true" /> {p.generando ? "Generando el PDF…" : "Descargar PDF"}
          </button>
          <button disabled={!puede} onClick={() => p.onImprimir(sel, detalle)} style={btn(false)}>
            <Printer size={16} aria-hidden="true" /> Imprimir
          </button>
        </div>
        {p.noListo && <div role="status" style={{ fontSize: 12, color: "var(--muted2)", marginTop: 8 }}>{p.noListo}</div>}
      </section>

      <section style={tarjeta}>
        <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Listas en Excel</h2>
        {p.listas.map(l => (
          <button key={l.clave} onClick={l.onDescargar} aria-label={`Descargar ${l.etiqueta} en Excel`}
            style={{ ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) auto", gap: 10, alignItems: "center", minHeight: 48, padding: "4px 4px", borderTop: "1px solid var(--line)" }}>
            <Download size={16} aria-hidden="true" style={{ color: "var(--accent-ink)" }} />
            <span style={{ fontSize: 13 }}>{l.etiqueta}</span>
            <span style={{ fontSize: 12, color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>{l.cuenta}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
