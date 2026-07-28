// Ventana de descarga reutilizable: el usuario marca QUÉ columnas quiere y baja un Excel con eso
// y nada más. Nació de un reclamo concreto del dueño sobre el Excel viejo de informes: "coloca casi
// todo si se quiere solo un par de cosas" — ese sacaba 12 columnas fijas y le pegaba 5 hojas extra
// por su cuenta, sin forma de pedir menos.
//
// Reglas de diseño que NO se negocian acá:
//  · Por defecto baja lo que está filtrado EN PANTALLA. Bajar todo es una casilla que hay que
//    marcar a mano — nunca el comportamiento por defecto (evita el "bajé 40 y me trajo 350").
//  · Los datos personales (cédula, teléfono) van en su propio bloque y arrancan DESMARCADOS.
//  · Nunca se ofrecen enlaces a documentos de Storage: un link dentro de un Excel que se reenvía
//    por WhatsApp abre sin sesión para quien lo reciba.

import { useMemo, useState } from "react";
import { descargarExcel, GRUPO_HEX, type CeldaX, type SeccionX } from "../utils/exportar";
import { primaryBtn, secondaryBtn } from "../styles/shared";
import { hoyISO } from "../utils/fecha";

/**
 * Filtro desplegable DENTRO de la ventana de descarga. Sirve para afinar sin tener que salir a
 * cambiar la pantalla: "quiero solo COSTA", "solo las que están en taller", "solo efectivo".
 * Arranca con todo marcado (= lo que se ve) y el conteo de arriba se actualiza en vivo.
 */
export type FiltroDescarga<T> = {
  titulo: string;
  /** Se calculan solas a partir de las filas si no se pasan. */
  opciones?: { valor: string; etiqueta: string }[];
  de: (fila: T) => string;
};

export type ColumnaDescarga<T> = {
  key: string;
  rotulo: string;
  /** Marcada al abrir la ventana. Las demás arrancan vacías. */
  porDefecto?: boolean;
  /** Dato personal: va en el bloque aparte y jamás se marca sola. */
  sensible?: boolean;
  align?: "left" | "center" | "right";
  ancho?: number;
  valor: (fila: T) => string | number | null | undefined;
};

type Props<T> = {
  titulo: string;
  /** Nombre del archivo sin extensión. */
  nombreArchivo: string;
  /** Título que va impreso ARRIBA dentro de la hoja. */
  tituloDocumento: string;
  periodo: string;
  /** Frase corta que le recuerda al usuario qué está filtrado. */
  resumenFiltro: string;
  columnas: ColumnaDescarga<T>[];
  /** Lo que se ve en pantalla ahora mismo. Es lo que se baja por defecto. */
  filas: T[];
  /** Bloques desplegables para afinar sin salir de la ventana (grupo, estado, método...). */
  filtros?: FiltroDescarga<T>[];
  /** Todo, sin los filtros de pantalla. Si no se pasa, no aparece la casilla. */
  filasTodas?: T[];
  etiquetaTodas?: string;
  /** Nombre de la sección (bloque con título de color) de cada fila. */
  agrupar?: (fila: T) => string;
  onCerrar: () => void;
};

// Por encima de esto el navegador de un celular de gama baja puede sufrir armando el archivo:
// se avisa antes en vez de dejar la pestaña colgada sin explicación.
const FILAS_PESADO = 2000;

export default function ModalDescargar<T>({
  titulo, nombreArchivo, tituloDocumento, periodo, resumenFiltro,
  columnas, filas, filtros, filasTodas, etiquetaTodas, agrupar, onCerrar,
}: Props<T>) {
  const [marcadas, setMarcadas] = useState<Set<string>>(
    () => new Set(columnas.filter(c => c.porDefecto && !c.sensible).map(c => c.key)),
  );
  const [todas, setTodas] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [desplegado, setDesplegado] = useState<string | null>(null);

  const normales = columnas.filter(c => !c.sensible);
  const sensibles = columnas.filter(c => c.sensible);
  const base = todas && filasTodas ? filasTodas : filas;

  // Opciones reales de cada filtro: se calculan de las filas para no ofrecer nunca un valor que
  // no existe (ej. "Fiscalía" cuando ninguna moto está retenida — marcarlo daría cero filas).
  const opcionesPorFiltro = useMemo(() => {
    const m = new Map<string, { valor: string; etiqueta: string }[]>();
    for (const f of filtros ?? []) {
      if (f.opciones) { m.set(f.titulo, f.opciones); continue; }
      const vistos = new Set<string>();
      for (const fila of base) vistos.add(f.de(fila) || "—");
      m.set(f.titulo, [...vistos].sort().map(v => ({ valor: v, etiqueta: v })));
    }
    return m;
  }, [filtros, base]);

  // Arranca todo marcado = exactamente lo que se ve. Afinar es una decisión del usuario.
  const [selFiltros, setSelFiltros] = useState<Record<string, Set<string>>>({});
  const activos = (titulo: string) => selFiltros[titulo] ?? new Set((opcionesPorFiltro.get(titulo) ?? []).map(o => o.valor));

  const aBajar = useMemo(() => {
    if (!filtros || filtros.length === 0) return base;
    return base.filter(fila => filtros.every(f => activos(f.titulo).has(f.de(fila) || "—")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, filtros, selFiltros, opcionesPorFiltro]);

  const elegidas = columnas.filter(c => marcadas.has(c.key));

  const secciones = useMemo<SeccionX[]>(() => {
    const celda = (c: ColumnaDescarga<T>, f: T): CeldaX => {
      const v = c.valor(f);
      if (v === null || v === undefined || v === "") return "";
      return typeof v === "number" ? { num: v } : String(v);
    };
    const fila = (f: T) => elegidas.map(c => celda(c, f));
    if (!agrupar) return [{ titulo: `${aBajar.length} registro${aBajar.length !== 1 ? "s" : ""}`, filas: aBajar.map(fila) }];

    const porGrupo = new Map<string, T[]>();
    for (const f of aBajar) {
      const g = agrupar(f);
      if (!porGrupo.has(g)) porGrupo.set(g, []);
      porGrupo.get(g)!.push(f);
    }
    return [...porGrupo.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([g, lista]) => ({
        titulo: `${g} — ${lista.length} registro${lista.length !== 1 ? "s" : ""}`,
        color: GRUPO_HEX[g] ?? GRUPO_HEX.OTRO,
        filas: lista.map(fila),
      }));
  }, [aBajar, elegidas, agrupar]);

  function alternar(key: string) {
    setMarcadas(prev => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key); else s.add(key);
      return s;
    });
  }

  function descargar() {
    if (generando) return;
    if (elegidas.length === 0) { setError("Marca al menos un dato."); return; }
    if (aBajar.length === 0) { setError("No hay nada que descargar con esos filtros."); return; }
    setError(null);
    setGenerando(true);
    try {
      descargarExcel({
        // hoyISO() y no toISOString(): este último da la fecha de MAÑANA después de las 7pm,
        // porque Colombia es UTC−5. El archivo salía fechado un día adelante (error ya conocido,
        // ver CLAUDE.md → "Fecha de hoy en hora de Colombia").
        archivo: `${nombreArchivo}-${hoyISO()}`,
        titulo: tituloDocumento,
        periodo,
        // La leyenda tiene que describir lo que REALMENTE trae el archivo, incluidos los filtros
        // que se marcaron acá dentro. Si dijera "toda la flota" trayendo solo USADAS, quien lo
        // reciba sacaría conclusiones equivocadas de un archivo incompleto.
        leyenda: [
          todas ? "Todos los registros, sin los filtros de pantalla" : `Filtrado: ${resumenFiltro}`,
          ...(filtros ?? []).map(f => {
            const ops = opcionesPorFiltro.get(f.titulo) ?? [];
            const sel = activos(f.titulo);
            return sel.size === ops.length ? null : `${f.titulo}: ${[...sel].join(", ") || "ninguno"}`;
          }).filter(Boolean),
        ].join(" · "),
        columnas: elegidas.map(c => ({ label: c.rotulo, align: c.align, ancho: c.ancho })),
        secciones,
      });
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el archivo.");
    } finally {
      setGenerando(false);
    }
  }

  const casilla = (c: ColumnaDescarga<T>) => (
    <label key={c.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text)", cursor: "pointer", minWidth: 0 }}>
      <input type="checkbox" checked={marcadas.has(c.key)} onChange={() => alternar(c.key)} style={{ flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.rotulo}</span>
    </label>
  );

  return (
    <div onClick={onCerrar} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--card)", borderRadius: 20, padding: 20, maxHeight: "90dvh", overflowY: "auto", boxSizing: "border-box" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>⬇️ {titulo}</div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          Se baja lo que tienes filtrado en pantalla.
        </div>

        <div style={{ background: "var(--accent-soft3)", borderRadius: 12, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "var(--accent-ink)" }}>
          <strong>{aBajar.length}</strong> registro{aBajar.length !== 1 ? "s" : ""}
          {!todas && resumenFiltro ? ` · ${resumenFiltro}` : ""}
        </div>

        {filasTodas && filasTodas.length !== filas.length && (
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--muted2)", marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={todas} onChange={e => setTodas(e.target.checked)} style={{ flexShrink: 0 }} />
            <span>Bajar {etiquetaTodas ?? "todo"} ({filasTodas.length})</span>
          </label>
        )}

        {aBajar.length > FILAS_PESADO && (
          <div style={{ background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--warn-ink)", marginBottom: 12 }}>
            Son {aBajar.length} filas. En un celular puede demorarse un rato — si puedes, hazlo desde el computador.
          </div>
        )}

        {/* Filtros desplegables: cada uno arranca cerrado mostrando qué está seleccionado, y se
            abre para marcar/desmarcar. El conteo de arriba se mueve en vivo. */}
        {(filtros ?? []).map(f => {
          const ops = opcionesPorFiltro.get(f.titulo) ?? [];
          const sel = activos(f.titulo);
          const abierto = desplegado === f.titulo;
          const resumen = sel.size === ops.length ? "Todos" : sel.size === 0 ? "Ninguno" : [...sel].join(", ");
          const poner = (nuevo: Set<string>) => setSelFiltros(prev => ({ ...prev, [f.titulo]: nuevo }));
          return (
            <div key={f.titulo} style={{ border: "1px solid var(--line)", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              <button
                onClick={() => setDesplegado(abierto ? null : f.titulo)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: "10px 12px", cursor: "pointer", textAlign: "left", minWidth: 0 }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>{f.titulo}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1, textAlign: "right" }}>{resumen}</span>
                <span style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}>{abierto ? "▲" : "▼"}</span>
              </button>
              {abierto && (
                <div style={{ padding: "0 12px 10px" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <button onClick={() => poner(new Set(ops.map(o => o.valor)))} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--accent-ink)" }}>Marcar todos</button>
                    <button onClick={() => poner(new Set())} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Ninguno</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: "7px 12px" }}>
                    {ops.map(o => (
                      <label key={o.valor} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text)", cursor: "pointer", minWidth: 0 }}>
                        <input
                          type="checkbox"
                          checked={sel.has(o.valor)}
                          onChange={() => { const n = new Set(sel); if (n.has(o.valor)) n.delete(o.valor); else n.add(o.valor); poner(n); }}
                          style={{ flexShrink: 0 }}
                        />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.etiqueta}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8, marginTop: 12 }}>¿Qué datos quieres?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: "7px 12px", marginBottom: 12 }}>
          {normales.map(casilla)}
        </div>

        {sensibles.length > 0 && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--warn-ink)", marginBottom: 6 }}>
              🔒 Datos personales — solo si de verdad los necesitas
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))", gap: "7px 12px" }}>
              {sensibles.map(casilla)}
            </div>
          </div>
        )}

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCerrar} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={descargar} disabled={generando} style={{ ...primaryBtn, flex: 2, opacity: generando ? 0.6 : 1 }}>
            {generando ? "Generando..." : `Descargar Excel (${elegidas.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
