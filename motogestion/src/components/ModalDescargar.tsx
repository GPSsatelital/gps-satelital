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
  columnas, filas, filasTodas, etiquetaTodas, agrupar, onCerrar,
}: Props<T>) {
  const [marcadas, setMarcadas] = useState<Set<string>>(
    () => new Set(columnas.filter(c => c.porDefecto && !c.sensible).map(c => c.key)),
  );
  const [todas, setTodas] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normales = columnas.filter(c => !c.sensible);
  const sensibles = columnas.filter(c => c.sensible);
  const aBajar = todas && filasTodas ? filasTodas : filas;
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
        leyenda: todas ? "Todos los registros, sin los filtros de pantalla" : `Filtrado: ${resumenFiltro}`,
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

        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>¿Qué datos quieres?</div>
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
