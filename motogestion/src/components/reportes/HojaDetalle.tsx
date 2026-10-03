// LA HOJA QUE SE ABRE AL TOCAR UN NÚMERO (rediseño de Reportes, 2-oct-2026).
//
// Pedido del dueño: "que todo sea clicleable y que cuando se le dé click salga la información
// solicitada, y las cosas en específico que se estén mostrando". Cada número del Resumen abre esta
// hoja con las MISMAS filas que contó: el total y su detalle salen del mismo dato.
// En el celular sube desde abajo; en el computador sale al centro. "Atrás" la cierra.
import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Download, ExternalLink } from "lucide-react";
import { ItemLista } from "../ListaEstandar";
import { Badge, type BadgeTone } from "../atomos";
import { useBackGuard } from "../../contexts/BackNav";
import { exportarCSV } from "../../utils/exportar";

export type FilaDetalle = {
  id: string;
  placa?: string;
  grupo?: string | null;
  titulo: string;
  subtitulo?: string;
  monto?: number | null;
  /** Color del monto: el del estado (mora en rojo, al día en verde…). */
  montoColor?: string;
  badge?: { texto: string; tono: BadgeTone };
  rielColor?: string;
  /** Clave del chip al que pertenece (tramos de días, grupos…). */
  filtro?: string;
  onClick?: () => void;
  /** Columnas para "Descargar lista". */
  csv?: Record<string, string | number>;
};

export type ContenidoDetalle = {
  titulo: string;
  subtitulo?: string;
  filas: FilaDetalle[];
  chips?: { clave: string; etiqueta: string }[];
  /** "Abrir en Cartera" (o donde corresponda), ya filtrado. */
  accion?: { texto: string; onClick: () => void };
  archivo?: string;
  vacio?: string;
  /** Lo que va debajo del título y antes de la lista (cifras, avisos). */
  encabezado?: ReactNode;
  /** Botones propios al pie, antes de "Descargar lista" (el desprendible y el pago de la nómina). */
  acciones?: ReactNode;
};

const EASE = [0.23, 1, 0.32, 1] as const;
const plata = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");

export default function HojaDetalle({ contenido, onCerrar, isMobile, puedeDescargar }: {
  contenido: ContenidoDetalle | null;
  onCerrar: () => void;
  isMobile: boolean;
  puedeDescargar: boolean;
}) {
  const reduce = useReducedMotion();
  useBackGuard(contenido !== null, onCerrar);
  const [chip, setChip] = useState<string>("todos");
  const filas = useMemo(
    () => (contenido?.filas ?? []).filter(f => chip === "todos" || f.filtro === chip),
    [contenido, chip],
  );
  const total = filas.reduce((s, f) => s + (f.monto ?? 0), 0);
  const conMonto = filas.some(f => f.monto != null);

  function descargar() {
    if (!contenido) return;
    const conCsv = filas.filter(f => f.csv);
    if (conCsv.length === 0) return;
    const cols = Object.keys(conCsv[0].csv!);
    exportarCSV(conCsv.map(f => cols.map(c => String(f.csv![c] ?? ""))), cols, (contenido.archivo ?? "lista") + ".csv");
  }

  return (
    <AnimatePresence onExitComplete={() => setChip("todos")}>
      {contenido && (
        <motion.div
          key="fondo"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCerrar}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(5,10,22,0.62)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={contenido.titulo}
            onClick={e => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : (isMobile ? { y: 40, opacity: 0 } : { scale: 0.97, opacity: 0 })}
            animate={reduce ? { opacity: 1 } : (isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 })}
            exit={reduce ? { opacity: 0 } : (isMobile ? { y: 40, opacity: 0 } : { scale: 0.97, opacity: 0 })}
            transition={{ duration: 0.22, ease: EASE }}
            style={{
              width: "100%", maxWidth: isMobile ? "100%" : 600, maxHeight: isMobile ? "88vh" : "82vh",
              background: "var(--card)", color: "var(--text)", border: "1px solid var(--line)", textAlign: "left",
              borderRadius: isMobile ? "20px 20px 0 0" : 20, boxSizing: "border-box",
              display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.25 }}>{contenido.titulo}</div>
                {contenido.subtitulo && <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.45 }}>{contenido.subtitulo}</div>}
                {contenido.encabezado && <div style={{ marginTop: 8 }}>{contenido.encabezado}</div>}
              </div>
              <button onClick={onCerrar} aria-label="Cerrar"
                style={{ width: 44, height: 44, marginTop: -8, marginRight: -8, flexShrink: 0, border: "none", borderRadius: 12, background: "transparent", color: "var(--muted2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {contenido.chips && contenido.chips.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 16px 12px" }}>
                {[{ clave: "todos", etiqueta: "Todos" }, ...contenido.chips].map(c => {
                  const n = c.clave === "todos" ? contenido.filas.length : contenido.filas.filter(f => f.filtro === c.clave).length;
                  const activo = chip === c.clave;
                  return (
                    <button key={c.clave} onClick={() => setChip(c.clave)}
                      style={{ height: 32, padding: "0 12px", borderRadius: 999, border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line)"), cursor: "pointer", fontSize: 12, fontWeight: activo ? 600 : 500, background: activo ? "var(--accent-soft)" : "var(--soft2)", color: "var(--text)" }}>
                      {c.etiqueta} <span style={{ color: "var(--muted2)", fontWeight: 500 }}>{n}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ padding: "0 16px", fontSize: 12, color: "var(--muted2)", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span>{filas.length} {filas.length === 1 ? "registro" : "registros"}</span>
              {conMonto && <span style={{ fontVariantNumeric: "tabular-nums" }}>Total {plata(total)}</span>}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 16px 12px", display: "grid", gap: 8, alignContent: "start" }}>
              {filas.length === 0 && (
                <div style={{ padding: "24px 8px", textAlign: "center", fontSize: 13, color: "var(--muted2)" }}>{contenido.vacio ?? "No hay nada que mostrar con este filtro."}</div>
              )}
              {filas.map(f => (
                <ItemLista
                  key={f.id}
                  placa={f.placa}
                  grupo={f.grupo}
                  titulo={f.titulo}
                  subtitulo={f.subtitulo}
                  rielColor={f.rielColor}
                  onClick={f.onClick}
                  right={(f.monto != null || f.badge) ? (
                    <>
                      {f.monto != null && <span style={{ fontSize: 13, fontWeight: 600, color: f.montoColor ?? "var(--text)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{plata(f.monto)}</span>}
                      {f.badge && <Badge tone={f.badge.tono}>{f.badge.texto}</Badge>}
                    </>
                  ) : undefined}
                />
              ))}
            </div>

            {(contenido.accion || contenido.acciones || puedeDescargar) && (
              <div style={{ padding: 12, borderTop: "1px solid var(--line)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {contenido.acciones}
                {contenido.accion && (
                  <button onClick={contenido.accion.onClick}
                    style={{ flex: 1, height: 44, border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 600, background: "var(--accent)", color: "var(--on-accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {contenido.accion.texto} <ExternalLink size={16} aria-hidden="true" />
                  </button>
                )}
                {puedeDescargar && filas.some(f => f.csv) && (
                  <button onClick={descargar}
                    style={{ flex: contenido.accion ? undefined : 1, height: 44, padding: "0 16px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500, background: "transparent", color: "var(--text)", border: "1px solid var(--line2)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Download size={16} aria-hidden="true" /> Descargar lista
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
