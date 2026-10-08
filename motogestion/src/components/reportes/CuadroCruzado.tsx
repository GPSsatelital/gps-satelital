// EL CUADRO CRUZADO (pedido del dueño, 8-oct-2026): cada cobrador en cada grupo. Una sola pieza para
// Portafolios › Cruzado (las 5 vistas) y Flota › Motos (Motos y Paradas), así las dos pantallas no
// pueden dar cifras distintas. Solo pinta: la cuenta vive en `utils/reportesCruzado.ts`. Cada número
// se toca y abre lo que contó.
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Tarjeta, boton, corto, plata } from "./ResumenReportes";
import { tintaPct } from "./PortafoliosReportes";
import { VISTAS_CRUZADO, SIN_COBRADOR, ANTES_DE_ASIGNAR, explicaVista, type CuadroCruzado as Cuadro, type VistaCruzado, type CeldaCruzado } from "../../utils/reportesCruzado";

const fondoPct = (p: number | null) => p === null ? "transparent" : p >= 85 ? "var(--ok-soft)" : p >= 70 ? "var(--warn-soft)" : "var(--bad-soft)";
/** "RASTREADOR" no cabe en una columna de celular: se acorta y el nombre completo va en la ayuda de lectura. */
const corta = (g: string) => g.length > 8 ? g.slice(0, 5) + "." : g;

export default function CuadroCruzado(p: {
  cuadro: Cuadro;
  /** Las vistas que se ofrecen aquí (Flota solo Motos y Paradas). */
  vistas: VistaCruzado[];
  onVista: (v: VistaCruzado) => void;
  nombre: (cobrador: string) => string;
  colorGrupo: (grupo: string) => string;
  /** "del 1 al 7 de oct": el período de arriba, para las vistas que dependen de él. */
  textoPeriodo: string;
  /** Tocar un número: cobrador y grupo (null = todos). */
  onCelda: (cobrador: string | null, grupo: string | null) => void;
  /** Diferencias contra "Por grupo" / "Por cobrador" (vacío = cuadra). */
  diferencias?: string[];
  enlace?: { texto: string; onClick: () => void };
  /** En el celular los nombres largos de grupo se acortan ("RASTR."); en el computador caben enteros. */
  compacto?: boolean;
}) {
  const { cuadro } = p;
  const vista = VISTAS_CRUZADO.find(v => v.clave === cuadro.vista)!;
  const cuando = vista.delPeriodo ? `del ${p.textoPeriodo}` : "hoy";
  const n = cuadro.grupos.length;
  const columnas = `minmax(64px, 1.6fr) repeat(${n}, minmax(${n > 3 ? 44 : 50}px, 1fr)) minmax(52px, 1fr)`;
  const esPct = cuadro.vista === "cumplimiento";
  const esPlata = cuadro.vista === "debe" || cuadro.vista === "recaudado";
  const texto = (c: CeldaCruzado) => esPct ? (c.valor === null ? "—" : `${c.valor}%`) : !c.valor ? "·" : esPlata ? corto(c.valor) : String(c.valor);
  const leido = (c: CeldaCruzado) => esPct ? (c.valor === null ? "sin cobros vencidos" : `cumplió ${c.valor} %`)
    : esPlata ? plata(c.valor ?? 0) : `${c.valor ?? 0} ${cuadro.vista === "paradas" ? "motos paradas" : "motos"}`;
  const nombreFila = (k: string) => k === SIN_COBRADOR ? "Sin cobrador" : k === ANTES_DE_ASIGNAR ? "Antes de asignar" : p.nombre(k);

  // Se llama como función (no como <Casilla />): definida aquí adentro, como etiqueta React la vería
  // como un componente nuevo en cada render y rearmaría los botones (regla del proyecto).
  function casilla(key: string, c: CeldaCruzado, cobrador: string | null, grupo: string | null, fuerte = false) {
    const vacia = esPct ? c.valor === null : !c.valor;
    const estilo: React.CSSProperties = {
      textAlign: "right", fontSize: 13, fontWeight: fuerte ? 600 : 500, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
      color: vacia ? "var(--muted2)" : esPct ? tintaPct(c.valor) : "var(--text)",
    };
    if (vacia) return <span key={key} style={{ ...estilo, padding: "0 6px" }} aria-hidden="true">{texto(c)}</span>;
    const quien = cobrador === null ? "todos los cobradores" : nombreFila(cobrador);
    return (
      <button key={key} onClick={() => p.onCelda(cobrador, grupo)}
        aria-label={`${quien}${grupo ? ` en ${grupo}` : ""}: ${leido(c)}. Ver ${cuadro.vista === "recaudado" ? "los pagos" : cuadro.vista === "debe" ? "quiénes deben" : cuadro.vista === "cumplimiento" ? "cada contrato" : "cuáles"}`}
        style={{ ...boton, ...estilo, minHeight: 40, padding: "0 6px", borderRadius: 8, background: esPct ? fondoPct(c.valor) : "transparent",
          textDecoration: esPct ? "none" : "underline", textDecorationColor: "var(--line2)", textUnderlineOffset: 3 }}>
        {texto(c)}
      </button>
    );
  }

  return (
    <Tarjeta titulo={`Cada cobrador en cada grupo · ${cuando}`} ayuda={explicaVista(cuadro.vista, p.textoPeriodo) + (esPlata ? " M = millones, k = miles." : "")}>
      <div style={{ textAlign: "left" }}>
      {p.vistas.length > 1 && (
        <div role="group" aria-label="Qué quiere ver" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {p.vistas.map(v => {
            const on = v === cuadro.vista;
            return (
              <button key={v} onClick={() => p.onVista(v)} aria-pressed={on}
                style={{ minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: on ? 600 : 500,
                  border: "1px solid " + (on ? "var(--accent-line)" : "var(--line2)"), background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent-ink)" : "var(--text)" }}>
                {VISTAS_CRUZADO.find(x => x.clave === v)!.etiqueta}
              </button>
            );
          })}
        </div>
      )}
      <p style={{ margin: "0 0 8px", fontSize: 12, lineHeight: 1.45, color: "var(--muted2)" }}>
        {cuadro.vista === "cumplimiento" ? `Verde 85 % o más · amarillo 70 a 84 % · rojo menos de 70 %. ${vista.delPeriodo ? `Período: del ${p.textoPeriodo}.` : ""}`
          : `Toque un número para ver ${cuadro.vista === "recaudado" ? "los pagos" : cuadro.vista === "debe" ? "quiénes deben" : "esas motos"}.${vista.delPeriodo ? ` Período: del ${p.textoPeriodo}.` : ""}`}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: columnas, gap: 4, padding: "0 2px 6px", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--muted2)", alignItems: "end" }} aria-hidden="true">
        <span>Cobrador</span>
        {cuadro.grupos.map(g => (
          // El cuadrito de color encima del nombre: así "PRADERA" cabe en una columna de celular.
          <span key={g} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, whiteSpace: "nowrap", padding: "0 6px" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.colorGrupo(g), flexShrink: 0 }} />{p.compacto === false ? g : corta(g)}
          </span>
        ))}
        <span style={{ textAlign: "right", padding: "0 6px" }}>Total</span>
      </div>

      {cuadro.filas.map(f => {
        const sin = f.clave === SIN_COBRADOR, antes = f.clave === ANTES_DE_ASIGNAR;
        return (
          <div key={f.clave} style={{ display: "grid", gridTemplateColumns: columnas, gap: 4, alignItems: "center", minHeight: 48, padding: "0 2px", borderBottom: "1px solid var(--line)" }}>
            <span style={{ minWidth: 0, fontSize: 12, lineHeight: 1.3, fontWeight: antes ? 400 : 600, overflowWrap: "anywhere",
              textTransform: sin || antes ? "none" : "uppercase", color: sin ? "var(--warn-ink)" : antes ? "var(--muted2)" : "var(--text)" }}>
              {nombreFila(f.clave)}
            </span>
            {cuadro.grupos.map(g => casilla(g, f.celdas[g], f.clave, g))}
            {casilla("total", f.total, f.clave, null, true)}
          </div>
        );
      })}

      <div style={{ display: "grid", gridTemplateColumns: columnas, gap: 4, alignItems: "center", minHeight: 48, padding: "0 2px", borderTop: "1px solid var(--line2)" }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Total</span>
        {cuadro.grupos.map(g => casilla(g, cuadro.totalGrupo[g], null, g, true))}
        {casilla("total", cuadro.total, null, null, true)}
      </div>

      {(p.diferencias?.length ?? 0) > 0 && (
        <div role="alert" style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", color: "var(--warn-ink)", fontSize: 12, lineHeight: 1.45 }}>
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Este cuadro no da lo mismo que las otras pantallas: {p.diferencias!.join(" · ")}. Mientras se revisa, confíe en «Por grupo» y «Por cobrador».</span>
        </div>
      )}

      {p.enlace && (
        <button onClick={p.enlace.onClick}
          style={{ ...boton, marginTop: 10, minHeight: 44, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "var(--accent-ink)" }}>
          {p.enlace.texto} <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
      </div>
    </Tarjeta>
  );
}
