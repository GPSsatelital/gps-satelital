// DESCARGAR EN CADA SECCIÓN (pedido del dueño, 5-oct-2026): "que el botón descargar salga donde se
// esté viendo cada sección y que no quede separado". Dos botones al lado del "Viendo:" de la barra:
//   · Excel — la lista de esa sección con los filtros puestos, separada por cobrador o por grupo.
//   · PDF   — el informe para los socios con ESTA sección ya marcada; las demás a un toque.
// Lo que baja es lo que se ve: mismos filtros, mismas cifras.
import { useState } from "react";
import { Check, FileDown, Printer, Table2 } from "lucide-react";
import { SECCIONES_INFORME, type SeccionInforme } from "../../utils/informeSocios";

export type SepararPor = "cobrador" | "grupo";
type Pieza = SeccionInforme | "anexos";

const boton = (activo: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer",
  fontFamily: "inherit", fontSize: 12, fontWeight: 600, flexShrink: 0,
  border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line2)"), background: activo ? "var(--accent-soft)" : "var(--card)", color: activo ? "var(--accent-ink)" : "var(--text)",
});
const chip = (on: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
  fontSize: 12, fontWeight: on ? 600 : 500, border: "1px solid " + (on ? "var(--accent-line)" : "var(--line2)"),
  background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent-ink)" : "var(--text)",
});
const principal = (puede: boolean): React.CSSProperties => ({
  flex: "1 1 130px", minHeight: 44, borderRadius: 12, border: "none", cursor: puede ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", color: "var(--on-accent)", opacity: puede ? 1 : 0.5,
});
const secundario: React.CSSProperties = {
  flex: "1 1 130px", minHeight: 44, borderRadius: 12, border: "1px solid var(--line2)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: "var(--text)",
};

export default function DescargarSeccion(p: {
  /** Qué baja el Excel de esta sección ("Lo que debe cada cliente"). Sin esto, solo PDF. */
  excel?: { etiqueta: string; separable: boolean; separarInicial: SepararPor; onDescargar: (separar: SepararPor) => void };
  /** La sección donde se está: llega marcada en el PDF. */
  seccion: SeccionInforme;
  /** Sin el permiso de exportar solo queda el Excel que ya se podía bajar (Acuerdos). */
  sinPdf?: boolean;
  generando: boolean;
  /** Por qué el PDF todavía no se puede (la nómina cargando, por ejemplo); null = listo. */
  noListo: (piezas: Pieza[]) => string | null;
  onAbrirPdf: () => void;
  onPdf: (secciones: SeccionInforme[], detalle: boolean, anexos: boolean) => void;
  onImprimir: (secciones: SeccionInforme[], detalle: boolean, anexos: boolean) => void;
}) {
  const [abierto, setAbierto] = useState<"excel" | "pdf" | null>(null);
  const [separar, setSeparar] = useState<SepararPor>(p.excel?.separarInicial ?? "cobrador");
  const [piezas, setPiezas] = useState<Pieza[]>([p.seccion]);
  const [detalle, setDetalle] = useState(false);
  const abrir = (que: "excel" | "pdf") => {
    if (que === "excel" && p.excel && !p.excel.separable) { p.excel.onDescargar(separar); return; }
    if (que === "excel") setSeparar(p.excel?.separarInicial ?? "cobrador");
    if (que === "pdf") { setPiezas([p.seccion]); p.onAbrirPdf(); }
    setAbierto(a => a === que ? null : que);
  };
  const alternar = (k: Pieza) => setPiezas(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);
  const todas: Pieza[] = [...SECCIONES_INFORME.map(s => s.clave), "anexos"];
  const secciones = SECCIONES_INFORME.map(s => s.clave).filter(k => piezas.includes(k));
  const conAnexos = piezas.includes("anexos");
  const motivo = p.noListo(piezas);
  const puede = !p.generando && motivo === null && piezas.length > 0;
  return (
    <>
      <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
        {p.excel && (
          <button onClick={() => abrir("excel")} aria-expanded={p.excel.separable ? abierto === "excel" : undefined} aria-label={`Descargar en Excel: ${p.excel.etiqueta}`} style={boton(abierto === "excel")}>
            <Table2 size={15} aria-hidden="true" /> Excel
          </button>
        )}
        {!p.sinPdf && (
          <button onClick={() => abrir("pdf")} aria-expanded={abierto === "pdf"} aria-label="Descargar en PDF" style={boton(abierto === "pdf")}>
            <FileDown size={15} aria-hidden="true" /> PDF
          </button>
        )}
      </div>

      {abierto === "excel" && p.excel && (
        <div style={{ flexBasis: "100%", marginTop: 6, padding: 10, borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft2)", display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{p.excel.etiqueta}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", fontSize: 12, color: "var(--muted2)" }}>
            Separar por:
            {(["cobrador", "grupo"] as const).map(k => (
              <button key={k} onClick={() => setSeparar(k)} aria-pressed={separar === k} style={chip(separar === k)}>{separar === k && <Check size={14} aria-hidden="true" />}{k}</button>
            ))}
          </div>
          <button onClick={() => { p.excel!.onDescargar(separar); setAbierto(null); }} style={principal(true)}>
            <Table2 size={16} aria-hidden="true" /> Descargar Excel
          </button>
        </div>
      )}

      {abierto === "pdf" && (
        <div style={{ flexBasis: "100%", marginTop: 6, padding: 10, borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft2)", display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>Informe para los socios en PDF</div>
          <div style={{ fontSize: 12, color: "var(--muted2)" }}>Qué incluir (con los filtros de arriba)</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SECCIONES_INFORME.map(s => (
              <button key={s.clave} onClick={() => alternar(s.clave)} aria-pressed={piezas.includes(s.clave)} style={chip(piezas.includes(s.clave))}>
                {piezas.includes(s.clave) && <Check size={14} aria-hidden="true" />}{s.etiqueta}
              </button>
            ))}
            <button onClick={() => alternar("anexos")} aria-pressed={conAnexos} style={chip(conAnexos)}>{conAnexos && <Check size={14} aria-hidden="true" />}Anexos</button>
            <button onClick={() => setPiezas(piezas.length === todas.length ? [p.seccion] : todas)} style={{ ...chip(false), border: "1px dashed var(--line2)" }}>
              {piezas.length === todas.length ? "Solo esta sección" : "Todo el informe"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer", minHeight: 40 }}>
            <input type="checkbox" checked={detalle} onChange={() => setDetalle(v => !v)} style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0 }} />
            Con las listas completas, cliente por cliente
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button disabled={!puede} onClick={() => p.onPdf(secciones, detalle, conAnexos)} style={principal(puede)}>
              <FileDown size={16} aria-hidden="true" /> {p.generando ? "Generando…" : "Descargar PDF"}
            </button>
            <button disabled={!puede} onClick={() => p.onImprimir(secciones, detalle, conAnexos)} style={{ ...secundario, opacity: puede ? 1 : 0.5, cursor: puede ? "pointer" : "not-allowed" }}>
              <Printer size={16} aria-hidden="true" /> Imprimir
            </button>
          </div>
          {(motivo || piezas.length === 0) && <div role="status" style={{ fontSize: 12, color: "var(--muted2)" }}>{piezas.length === 0 ? "Marca al menos una parte." : motivo}</div>}
        </div>
      )}
    </>
  );
}
