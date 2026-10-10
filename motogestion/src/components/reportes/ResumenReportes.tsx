// EL RESUMEN DE REPORTES (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md).
//
// Solo pinta: las cuentas viven en `reportesResumen.ts` y en ReportesView. Cada número se puede tocar
// y abre la lista de lo mismo que contó (`onAbrir`). Cada tarjeta explica qué cuenta (botón de ayuda).
// La plata manda: el recaudo es lo más grande de la pantalla.
import { useState, type ReactNode } from "react";
import { ChevronRight, Info, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight, Lock, Circle, Triangle, X, Wrench, FileText } from "lucide-react";
import type { DesgloseRecaudo, Verificacion, PuntoSerie } from "../../utils/reportesResumen";

export const plata = (n: number) => "$" + Math.round(n).toLocaleString("es-CO");
export const corto = (n: number) => n >= 1_000_000 ? `${(Math.round(n / 100_000) / 10).toLocaleString("es-CO")}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n));
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/** `parcial`, `nopago` y `recoleccion` son partes de `mora`: van con sangría, debajo de ella. */
export type FilaEstado = { clave: "aldia" | "gabela" | "mora" | "parcial" | "nopago" | "recoleccion" | "taller" | "retenidas" | "liquidacion"; etiqueta: string; hoy: number; cierre: number | null };
const PARTE_DE_MORA: ReadonlySet<FilaEstado["clave"]> = new Set(["parcial", "nopago", "recoleccion"]);
export type GrupoResumen = { grupo: string; color: string; recaudo: number; pctCum: number | null; enMora: number; motosAsignadas: number; contratosActivos: number; activo: boolean };

export const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, boxSizing: "border-box", minWidth: 0 };
export const boton: React.CSSProperties = { display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "inherit", font: "inherit", padding: 0, cursor: "pointer" };
export const etiqueta: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "var(--muted2)" };

export function Tarjeta({ titulo, ayuda, children, extra }: { titulo: string; ayuda: string; children: ReactNode; extra?: ReactNode }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <section style={{ ...card, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, minHeight: 28 }}>
        <h3 style={{ ...etiqueta, margin: 0, flex: 1, textAlign: "left" }}>{titulo}</h3>
        {extra}
        <button onClick={() => setAbierta(v => !v)} aria-label={abierta ? "Ocultar explicación" : "Qué cuenta este número"} aria-expanded={abierta}
          style={{ width: 36, height: 36, margin: "-6px -8px -6px 0", border: "none", borderRadius: 10, background: abierta ? "var(--soft)" : "transparent", color: "var(--muted2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {abierta ? <X size={16} aria-hidden="true" /> : <Info size={16} aria-hidden="true" />}
        </button>
      </div>
      {abierta && <p style={{ margin: "0 0 12px", padding: "10px 12px", borderRadius: 10, background: "var(--soft2)", fontSize: 12, lineHeight: 1.5, color: "var(--muted2)" }}>{ayuda}</p>}
      {children}
    </section>
  );
}

export function Delta({ txt, up }: { txt: string; up: boolean | null }) {
  if (up === null) return <span style={{ fontSize: 12, color: "var(--muted2)" }}>{txt}</span>;
  const Icono = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: up ? "var(--ok-ink)" : "var(--bad-ink)", whiteSpace: "nowrap" }}>
      <Icono size={14} aria-hidden="true" />{txt.replace(/[▲▼]\s?/, "")}
    </span>
  );
}

const MARCA_ESTADO: Record<FilaEstado["clave"], ReactNode> = {
  aldia: <Circle size={10} fill="var(--ok)" color="var(--ok)" aria-hidden="true" />,
  gabela: <Triangle size={10} fill="var(--warn)" color="var(--warn)" aria-hidden="true" />,
  mora: <X size={12} color="var(--bad)" strokeWidth={3} aria-hidden="true" />,
  parcial: null,
  nopago: null,
  recoleccion: null,
  taller: <Wrench size={12} color="var(--warn)" aria-hidden="true" />,
  retenidas: <Lock size={12} color="var(--muted2)" aria-hidden="true" />,
  liquidacion: <FileText size={12} color="var(--muted2)" aria-hidden="true" />,
};

export default function ResumenReportes(p: {
  isMobile: boolean;
  textoPeriodo: string;
  verificaciones: Verificacion[];
  recaudo: DesgloseRecaudo;
  /** Con un cobrador filtrado: lo que sus motos pagaron antes de que se las asignaran (D-035). */
  antes?: number;
  /** null = no se compara (con un cobrador filtrado: sus motos cambian de un mes a otro). */
  anterior: { total: number; texto: string; delta: { txt: string; up: boolean | null } } | null;
  cumplimiento: { pct: number | null; debia: number; cubrio: number; aAcuerdo: number };
  estados: FilaEstado[];
  /** "30-sep" si el período cerró antes de hoy; null si el período llega a hoy (no hay qué comparar). */
  cierreTexto: string | null;
  tramos: { clave: string; etiqueta: string; n: number; debe: number }[];
  serie: { modo: "dia" | "semana" | "mes"; puntos: PuntoSerie[] };
  grupos: GrupoResumen[];
  sinProducir: { motos: number; dias: number; estimado: number; sinFecha: number };
  /** Los que más pagaron en el período (lo que ya mostraba el Resumen viejo: no se quita). */
  mejores: { clienteId: string; nombre: string; total: number }[];
  onAbrir: (clave: string) => void;
  onGrupo: (grupo: string) => void;
  onFicha: (clienteId: string) => void;
}) {
  const [verVerif, setVerVerif] = useState(false);
  const todoOk = p.verificaciones.every(v => v.ok);
  const r = p.recaudo;
  const totalMora = p.tramos.reduce((s, t) => s + t.debe, 0);
  const maxTramo = Math.max(...p.tramos.map(t => t.debe), 1);
  const maxSerie = Math.max(...p.serie.puntos.map(x => x.total), 1);
  const hoyISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      {/* El sello: el reporte se revisa solo y lo dice. */}
      <div>
        <button onClick={() => setVerVerif(v => !v)} aria-expanded={verVerif}
          style={{ ...boton, display: "flex", alignItems: "center", gap: 8, minHeight: 36, fontSize: 12, fontWeight: 500, color: todoOk ? "var(--ok-ink)" : "var(--warn-ink)" }}>
          {todoOk ? <ShieldCheck size={16} aria-hidden="true" /> : <ShieldAlert size={16} aria-hidden="true" />}
          <span style={{ flex: 1 }}>{todoOk ? "Cifras verificadas: todo cuadra" : "Hay cifras que no cuadran — toca para ver"}</span>
          <ChevronRight size={16} aria-hidden="true" style={{ transform: verVerif ? "rotate(90deg)" : "none", transition: "transform .15s", color: "var(--muted2)" }} />
        </button>
        {verVerif && (
          <ul style={{ margin: "4px 0 0", padding: "8px 12px", listStyle: "none", ...card, display: "grid", gap: 6 }}>
            {p.verificaciones.map((v, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: v.ok ? "var(--muted2)" : "var(--warn-ink)" }}>
                {v.ok ? <ShieldCheck size={14} color="var(--ok)" aria-hidden="true" /> : <ShieldAlert size={14} color="var(--warn)" aria-hidden="true" />}{v.texto}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lo que entró: el número más grande de la pantalla. */}
      <Tarjeta titulo={`Recaudado · ${p.textoPeriodo}`}
        ayuda="Todo lo que entró en el período: las transferencias por la fecha del banco y el efectivo por el día en que se recibió en la oficina. Empresa: tarifa de las semanas, acuerdos de deudas, multas y demás. Ahorro: lo que el cliente ahorra cada semana; si termina su contrato, con eso paga la moto, y si se va antes, se le devuelve. Base y saldo a favor: también plata del cliente, guardada, incluido lo que va pagando de su acuerdo de base.">
        <button onClick={() => p.onAbrir("recaudo")} style={boton} aria-label={`Ver los pagos del período: ${plata(r.total)}`}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, fontVariantNumeric: "tabular-nums" }}>{plata(r.total)}</span>
            <ChevronRight size={18} color="var(--muted2)" aria-hidden="true" />
          </div>
          {p.anterior && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap", fontSize: 12, color: "var(--muted2)" }}>
              <Delta txt={p.anterior.delta.txt} up={p.anterior.delta.up} />
              <span>vs {p.anterior.texto} ({plata(p.anterior.total)})</span>
            </div>
          )}
          {r.total > 0 && (
            <>
              <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginTop: 12, background: "var(--soft)" }} aria-hidden="true">
                <div style={{ width: `${pct(r.empresa, r.total)}%`, background: "var(--accent)" }} />
                <div style={{ width: `${pct(r.ahorro, r.total)}%`, background: "var(--violet)" }} />
                <div style={{ width: `${pct(r.baseYSaldo, r.total)}%`, background: "var(--muted)" }} />
              </div>
              {(p.antes ?? 0) > 0 && (
                <div style={{ fontSize: 12, marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn-ink)", lineHeight: 1.5 }}>
                  Además entraron {plata(p.antes!)} de motos que se le pasaron en el período, de antes de que fueran suyas. No cuentan aquí.
                </div>
              )}
              <div style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 12 }}>
                {[
                  { c: "var(--accent)", l: "Empresa", v: r.empresa },
                  { c: "var(--violet)", l: "Ahorro de los clientes", v: r.ahorro },
                  { c: "var(--muted)", l: "Base y saldo a favor", v: r.baseYSaldo },
                ].filter(x => x.v > 0 || x.l === "Empresa").map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: x.c, flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ flex: 1, color: "var(--muted2)" }}>{x.l}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{plata(x.v)}</span>
                    <span style={{ width: 36, textAlign: "right", color: "var(--muted2)" }}>{pct(x.v, r.total)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--muted2)" }}>
                <span>Efectivo <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(r.efectivo)}</b></span>
                <span>Transferencias <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(r.transferencia)}</b></span>
                {r.campo > 0 && <span>Cobrado en la calle <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(r.campo)}</b></span>}
              </div>
            </>
          )}
        </button>
      </Tarjeta>

      {/* Cumplimiento: de lo que se vencía, cuánto quedó pagado. */}
      <Tarjeta titulo="Cumplimiento del período"
        ayuda="De lo que se le vencía a cada cliente en el período (semanas y cuotas de acuerdo), cuánto quedó pagado con plata. Las semanas que pasaron a un acuerdo no cuentan como pagadas: se muestran aparte. Lo que pagaron de atrasos viejos tampoco cuenta aquí, para que un cliente que se pone al día no tape a otro que no pagó. No entran los que tienen la moto retenida o en el taller.">
        <button onClick={() => p.onAbrir("cumplimiento")} style={boton} aria-label="Ver quiénes no completaron lo del período">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: p.cumplimiento.pct === null ? "var(--muted2)" : p.cumplimiento.pct >= 85 ? "var(--ok-ink)" : p.cumplimiento.pct >= 70 ? "var(--warn-ink)" : "var(--bad-ink)" }}>
              {p.cumplimiento.pct === null ? "—" : `${p.cumplimiento.pct}%`}
            </span>
            <ChevronRight size={18} color="var(--muted2)" aria-hidden="true" />
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "var(--soft)", marginTop: 8, overflow: "hidden" }} aria-hidden="true">
            <div style={{ width: `${p.cumplimiento.pct ?? 0}%`, height: "100%", background: (p.cumplimiento.pct ?? 0) >= 85 ? "var(--ok)" : (p.cumplimiento.pct ?? 0) >= 70 ? "var(--warn)" : "var(--bad)" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 8, lineHeight: 1.5 }}>
            {p.cumplimiento.debia > 0
              ? <>Se debía <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(p.cumplimiento.debia)}</b> · se pagó <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(p.cumplimiento.cubrio)}</b>{p.cumplimiento.aAcuerdo > 0 && <> · pasó a acuerdo <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(p.cumplimiento.aAcuerdo)}</b></>} · faltó <b style={{ color: "var(--bad-ink)", fontWeight: 500 }}>{plata(p.cumplimiento.debia - p.cumplimiento.cubrio - p.cumplimiento.aAcuerdo)}</b></>
              : "En este período no se le vencía nada a nadie."}
          </div>
        </button>
      </Tarjeta>

      {/* Cómo están: hoy y al cierre del período, para comparar. */}
      <Tarjeta titulo="Cómo están los clientes"
        ayuda={p.cierreTexto
          ? `Hoy: la misma cuenta de Cartera. ${p.cierreTexto}: reconstruido con la fecha de cada pago; puede variar un poco de lo que decía la pantalla ese día, casi siempre por pagos registrados antes y confirmados después. No incluye los contratos que se cerraron después ni los Diarios.`
          : "La misma cuenta de Cartera, hoy. Si eliges un período que ya terminó, aparece al lado cómo estaban al cierre."}>
        <div style={{ display: "grid", gap: 2 }}>
          <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: p.cierreTexto ? "minmax(0, 1fr) 64px 72px" : "minmax(0, 1fr) 64px", gap: 8, padding: "0 8px 4px", fontSize: 11, color: "var(--muted2)" }}>
            <span />
            <span style={{ textAlign: "right" }}>Hoy</span>
            {p.cierreTexto && <span style={{ textAlign: "right" }}>{`${p.cierreTexto}*`}</span>}
          </div>
          {p.estados.map(e => (
            <div key={e.clave} style={{ display: "grid", gridTemplateColumns: p.cierreTexto ? "minmax(0, 1fr) 64px 72px" : "minmax(0, 1fr) 64px", gap: 8, alignItems: "center" }}>
              <button onClick={() => p.onAbrir("hoy:" + e.clave)} style={{ ...boton, gridColumn: "1 / 3", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 64px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 8px", borderRadius: 10 }}
                aria-label={`${PARTE_DE_MORA.has(e.clave) ? `En mora, ${e.etiqueta.toLowerCase()}` : e.etiqueta}: ${e.hoy} hoy. Ver la lista`}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, paddingLeft: PARTE_DE_MORA.has(e.clave) ? 18 : 0, color: PARTE_DE_MORA.has(e.clave) || e.clave === "liquidacion" ? "var(--muted2)" : "var(--text)" }}>
                  {MARCA_ESTADO[e.clave]}{e.etiqueta}
                </span>
                <span style={{ textAlign: "right", fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: e.clave === "mora" ? "var(--bad-ink)" : "var(--text)" }}>{e.hoy}</span>
              </button>
              {p.cierreTexto && e.cierre !== null ? (
                <button onClick={() => p.onAbrir("cierre:" + e.clave)} style={{ ...boton, minHeight: 44, textAlign: "right", padding: "0 8px", borderRadius: 10, fontSize: 13, color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}
                  aria-label={`${e.etiqueta} al ${p.cierreTexto}: ${e.cierre}. Ver la lista`}>
                  {e.cierre}
                </button>
              ) : p.cierreTexto ? <span /> : null}
            </div>
          ))}
          {p.cierreTexto && <div style={{ fontSize: 11, color: "var(--muted2)", marginTop: 6, padding: "0 8px" }}>* Reconstruido con la fecha de cada pago.</div>}
        </div>
      </Tarjeta>

      {/* Antigüedad de la mora: dónde está el riesgo de verdad. */}
      <Tarjeta titulo="Antigüedad de la mora · hoy"
        extra={<span style={{ fontSize: 12, color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>{plata(totalMora)}</span>}
        ayuda="Los clientes en mora hoy, según hace cuántos días venció lo más viejo que deben, y cuánto deben en total (semanas, acuerdo y deudas). Entre más vieja la deuda, más difícil de cobrar.">
        <div style={{ display: "grid", gap: 2 }}>
          {p.tramos.map((t, i) => (
            <button key={t.clave} onClick={() => p.onAbrir("tramo:" + t.clave)} style={{ ...boton, display: "grid", gridTemplateColumns: "92px minmax(0, 1fr) 80px", gap: 8, alignItems: "center", minHeight: 40, padding: "0 4px", borderRadius: 10 }}
              aria-label={`${t.etiqueta}: ${t.n} clientes, deben ${plata(t.debe)}`}>
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>{t.etiqueta}<span style={{ display: "block", fontSize: 11 }}>{t.n} {t.n === 1 ? "cliente" : "clientes"}</span></span>
              <span style={{ height: 10, borderRadius: 5, background: "var(--soft)", overflow: "hidden" }} aria-hidden="true">
                <span style={{ display: "block", height: "100%", width: `${Math.max(Math.round((t.debe / maxTramo) * 100), t.debe > 0 ? 3 : 0)}%`, background: ["var(--warn)", "var(--orange)", "var(--bad)", "var(--bad)"][i] }} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{corto(t.debe)}</span>
            </button>
          ))}
        </div>
      </Tarjeta>

      {/* El recaudo en el tiempo, dentro del período elegido. */}
      <Tarjeta titulo={`Recaudo por ${p.serie.modo === "dia" ? "día" : p.serie.modo === "semana" ? "semana" : "mes"}`}
        ayuda="Lo que entró en cada día, semana o mes del período que elegiste arriba. Toca una barra para ver los pagos de ese momento.">
        <div style={{ display: "flex", alignItems: "flex-end", gap: p.serie.puntos.length > 16 ? 2 : 6, height: 132, overflowX: "auto" }}>
          {p.serie.puntos.map(x => {
            const h = x.total === 0 ? 2 : Math.max(6, Math.round((x.total / maxSerie) * 100));
            const esHoy = x.desde <= hoyISO && x.hasta >= hoyISO;
            return (
              <button key={x.clave} onClick={() => x.total > 0 && p.onAbrir("serie:" + x.desde + ":" + x.hasta)} disabled={x.total === 0}
                aria-label={`${x.etiqueta}: ${plata(x.total)}`}
                style={{ ...boton, flex: "1 0 10px", minWidth: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, height: "100%", cursor: x.total > 0 ? "pointer" : "default" }}>
                {p.serie.puntos.length <= 16 && x.total > 0 && <span style={{ fontSize: 11, color: "var(--muted2)", whiteSpace: "nowrap" }}>{corto(x.total)}</span>}
                <span style={{ width: "100%", height: h, borderRadius: "4px 4px 0 0", background: esHoy ? "var(--accent)" : x.total === 0 ? "var(--line)" : "var(--accent-line)" }} />
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--muted2)" }}>
          <span>{p.serie.puntos[0]?.etiqueta}</span>
          {p.serie.puntos.length > 2 && <span>{p.serie.puntos[Math.floor(p.serie.puntos.length / 2)]?.etiqueta}</span>}
          <span>{p.serie.puntos[p.serie.puntos.length - 1]?.etiqueta}</span>
        </div>
      </Tarjeta>

      {/* Por grupo: tocar uno filtra todo el reporte a ese grupo. */}
      <Tarjeta titulo="Por grupo"
        ayuda="Recaudo y cumplimiento de cada portafolio en el período, y cuántos de sus clientes están en mora hoy. Toca un grupo para ver todo el reporte solo de ese grupo; tócalo otra vez para volver a todos.">
        <div style={{ display: "grid", gap: 2 }}>
          {p.grupos.map(g => (
            <button key={g.grupo} onClick={() => p.onGrupo(g.grupo)} aria-pressed={g.activo}
              style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8, alignItems: "center", minHeight: 48, padding: "4px 8px", borderRadius: 10, background: g.activo ? "var(--accent-soft)" : "transparent" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{g.grupo}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>
                    {g.motosAsignadas} motos trabajando · cumplió {g.pctCum === null ? "—" : `${g.pctCum}%`} · {g.enMora} en mora hoy
                  </span>
                </span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{plata(g.recaudo)}</span>
            </button>
          ))}
        </div>
      </Tarjeta>

      {/* Los que más pagaron: lo que ya mostraba el Resumen, ahora tocable. */}
      {p.mejores.length > 0 && (
        <Tarjeta titulo="Los que más pagaron"
          ayuda="Los clientes que más plata entregaron en el período, contando al dueño del contrato en la fecha de cada pago. Toca uno para ver su ficha.">
          <div style={{ display: "grid", gap: 2 }}>
            {p.mejores.map((m, i) => (
              <button key={m.clienteId} onClick={() => p.onFicha(m.clienteId)}
                style={{ ...boton, display: "grid", gridTemplateColumns: "24px minmax(0, 1fr) auto", gap: 8, alignItems: "center", minHeight: 44, padding: "0 8px", borderRadius: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nombre}</span>
                <span style={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ok-ink)" }}>{plata(m.total)}</span>
              </button>
            ))}
          </div>
        </Tarjeta>
      )}

      {/* Plata sin producir: la moto nunca debe dejar de producir. */}
      <Tarjeta titulo="Plata sin producir · hoy"
        ayuda="Motos guardadas en la empresa hoy (taller, bodega, garantía, fiscalía, tránsito): los días que llevan quietas por la tarifa diaria de su contrato. Es un cálculo aproximado de lo que dejaron de facturar.">
        <button onClick={() => p.onAbrir("sinproducir")} style={boton} aria-label="Ver las motos guardadas">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: "var(--orange-ink)", fontVariantNumeric: "tabular-nums" }}>≈ {plata(p.sinProducir.estimado)}</span>
            <ChevronRight size={18} color="var(--muted2)" aria-hidden="true" />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
            {p.sinProducir.motos} motos guardadas · {p.sinProducir.dias.toLocaleString("es-CO")} días sin trabajar
            {p.sinProducir.sinFecha > 0 && ` · ${p.sinProducir.sinFecha} sin fecha de entrada`}
          </div>
        </button>
      </Tarjeta>
    </div>
  );
}
