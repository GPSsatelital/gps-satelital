// POR GRUPO y POR COBRADOR (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md ·
// D-032/033/034/035).
//
// Una sola pantalla para las dos miradas: cada grupo es un portafolio del socio y cada cobrador uno
// del funcionario. Arriba todos lado a lado; abajo el detalle del elegido (o de todos): la plata,
// cuánto se cumplió, DÓNDE ESTÁN LAS MOTOS (motos de verdad, suman el total) y CÓMO VAN PAGANDO los
// que tienen la moto; para el cobrador, además, lo que hizo. Solo pinta: las cuentas las arma
// ReportesView con las mismas filas del Resumen. Todo número se toca (`onAbrir`).
import type { ReactNode } from "react";
import { ChevronRight, Download, List, ExternalLink } from "lucide-react";
import type { DesgloseRecaudo } from "../../utils/reportesResumen";
import { LUGARES, type LugarMoto } from "../../utils/reportesFlota";
import { Tarjeta, Delta, boton, plata, corto, pct } from "./ResumenReportes";

export type DatosPortafolio = {
  /** El grupo o el id del cobrador; null = todos juntos. */
  clave: string | null;
  nombre: string;
  color?: string;
  recaudo: DesgloseRecaudo;
  anterior: { total: number; delta: { txt: string; up: boolean | null } };
  /** Plata de sus motos que entró ANTES de que se las asignaran (D-035): no es suya, va aparte. */
  antes: number;
  cum: { pct: number | null; debia: number; cubrio: number; aAcuerdo: number; recupero: number; atrasoAAcuerdo: number };
  totalMotos: number;
  lugares: Record<LugarMoto, number>;
  clientes: { aldia: number; gabela: number; mora: number; recoleccion: number; liquidacion: number; sinAcuerdo: number; cerrados: number };
  /** Lo que le dejó a la empresa cada moto trabajando en el período; null si no hay motos trabajando. */
  porMoto: number | null;
  /** Solo cobradores: lo que registró él mismo en el período. */
  gestiones?: Array<{ clave: string; etiqueta: string; n: number }>;
};

export const COLOR_LUGAR: Record<LugarMoto, string> = {
  trabajando: "var(--ok)",
  tallerConCliente: "var(--warn)",
  retenida: "var(--bad)",
  tallerSinCliente: "var(--orange)",
  disponible: "var(--muted)",
};
// Las barras van con el color pleno; la LETRA con su tono oscuro (-ink), que sí se lee en modo claro.
export const colorPct = (p: number | null) => p === null ? "var(--muted2)" : p >= 85 ? "var(--ok)" : p >= 70 ? "var(--warn)" : "var(--bad)";
export const tintaPct = (p: number | null) => p === null ? "var(--muted2)" : p >= 85 ? "var(--ok-ink)" : p >= 70 ? "var(--warn-ink)" : "var(--bad-ink)";
const botonAccion: React.CSSProperties = { ...boton, width: "auto", flex: "1 1 140px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", fontSize: 13, fontWeight: 500 };

export default function PortafoliosReportes(p: {
  modo: "grupo" | "cobrador";
  textoAnterior: string;
  lista: DatosPortafolio[];
  /** Una fila más al pie de la lista, para que sume el total (p. ej. lo cobrado antes de asignar). */
  pieLista?: { etiqueta: string; total: number; clave: string };
  /** El detalle de abajo: el elegido, o todos juntos. */
  detalle: DatosPortafolio;
  seleccionado: string | null;
  onElegir: (clave: string) => void;
  /** clave: "recaudo" · "antes" · "cumplimiento" · "lugar:<lugar>" · "hoy:<estado>" · "sinacuerdo" · "cerrados" · "motos" · "gestion:<tipo>" */
  onAbrir: (clave: string) => void;
  onCartera: () => void;
  onDescargar?: () => void;
  /** Botones propios de la mirada (p. ej. "Ver su nómina"). */
  extraBotones?: ReactNode;
}) {
  const d = p.detalle;
  const esCobrador = p.modo === "cobrador";
  const conMoto = d.clientes.aldia + d.clientes.gabela + d.clientes.mora;
  const total = p.lista.reduce((s, g) => s + g.recaudo.total, 0) + (p.pieLista?.total ?? 0);
  const nombreFila: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, textTransform: esCobrador ? "uppercase" : "none", overflowWrap: "anywhere" };

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      {/* Todos lado a lado: tocar uno muestra su detalle abajo; tocarlo otra vez vuelve a todos. */}
      <Tarjeta titulo={esCobrador ? "Los cobradores lado a lado" : "Los grupos lado a lado"}
        ayuda={esCobrador
          ? "Cada cobrador con las motos que tiene a cargo. Entró: lo que pagaron esas motos desde que son suyas. Cumplió: de lo que se les vencía a sus clientes desde que los tiene, cuánto se pagó con plata. Ordenados del que más cumplió al que menos. Toca uno para ver su detalle abajo; tócalo otra vez para volver a todos."
          : "Cada grupo es un portafolio. Entró: toda la plata que pagaron sus clientes en el período. Cumplió: de lo que se les vencía en el período, cuánto se pagó con plata. Toca un grupo para ver su detalle abajo; tócalo otra vez para volver a todos."}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 76px 56px", gap: 8, padding: "0 8px 4px", fontSize: 11, color: "var(--muted2)" }} aria-hidden="true">
          <span>{esCobrador ? "Cobrador" : "Grupo"}</span><span style={{ textAlign: "right" }}>Entró</span><span style={{ textAlign: "right" }}>Cumplió</span>
        </div>
        <div style={{ display: "grid", gap: 2 }}>
          {p.lista.map(g => {
            const activo = p.seleccionado === g.clave;
            return (
              <button key={g.clave ?? "-"} onClick={() => g.clave && p.onElegir(g.clave)} aria-pressed={activo}
                aria-label={`${g.nombre}: ${g.lugares.trabajando} motos trabajando, entró ${plata(g.recaudo.total)}, cumplió ${g.cum.pct === null ? "sin cobros vencidos" : g.cum.pct + "%"}`}
                style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 76px 56px", gap: 8, alignItems: "center", minHeight: 48, padding: "4px 8px", borderRadius: 10, background: activo ? "var(--accent-soft)" : "transparent" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {g.color && <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} aria-hidden="true" />}
                  <span style={{ minWidth: 0 }}>
                    <span style={nombreFila}>{g.nombre}</span>
                    <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{g.totalMotos} motos · {g.lugares.trabajando} trabajando</span>
                  </span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{corto(g.recaudo.total)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right", color: tintaPct(g.cum.pct), fontVariantNumeric: "tabular-nums" }}>{g.cum.pct === null ? "—" : `${g.cum.pct}%`}</span>
              </button>
            );
          })}
          {p.pieLista && p.pieLista.total > 0 && (
            <button onClick={() => p.onAbrir(p.pieLista!.clave)} aria-label={`${p.pieLista.etiqueta}: ${plata(p.pieLista.total)}. Ver los pagos`}
              style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 76px 56px", gap: 8, alignItems: "center", minHeight: 44, padding: "4px 8px", borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: "var(--muted2)" }}>{p.pieLista.etiqueta}</span>
              <span style={{ fontSize: 13, textAlign: "right", color: "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>{corto(p.pieLista.total)}</span>
              <span />
            </button>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 76px 56px", gap: 8, padding: "8px 8px 0", borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--muted2)" }}>
            <span>Total</span>
            <span style={{ textAlign: "right", color: "var(--text)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{corto(total)}</span>
            <span />
          </div>
        </div>
      </Tarjeta>

      {/* El detalle del elegido (o de todos): un encabezado y los bloques sueltos. */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, padding: "8px 4px 0" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, fontFamily: "inherit", color: "var(--text)", display: "flex", alignItems: "center", gap: 8, textTransform: esCobrador && d.clave ? "uppercase" : "none", minWidth: 0, overflowWrap: "anywhere" }}>
          {d.clave && d.color && <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} aria-hidden="true" />}{d.nombre}
        </h2>
        <span style={{ fontSize: 12, color: "var(--muted2)", flexShrink: 0 }}>{d.totalMotos} motos{esCobrador ? " a cargo" : ""}</span>
      </div>

      {/* Para el cobrador, primero cuánto cumplió: es por lo que se le mide. Para el grupo, la plata. */}
      {esCobrador ? <><Cumplimiento d={d} esCobrador onAbrir={p.onAbrir} /><Plata d={d} esCobrador textoAnterior={p.textoAnterior} onAbrir={p.onAbrir} /></>
        : <><Plata d={d} esCobrador={false} textoAnterior={p.textoAnterior} onAbrir={p.onAbrir} /><Cumplimiento d={d} esCobrador={false} onAbrir={p.onAbrir} /></>}

      {/* Dónde están las motos: motos de verdad, suman el total. */}
      <DondeEstanLasMotos titulo={`Dónde están ${esCobrador && d.clave ? "sus" : "las"} ${d.totalMotos} motos · hoy`} total={d.totalMotos} lugares={d.lugares} onAbrir={p.onAbrir} />

      {/* Cómo van pagando los que tienen la moto. */}
      <Tarjeta titulo={`Cómo van pagando los ${conMoto} que tienen la moto · hoy`}
        ayuda="Solo los clientes que tienen la moto trabajando: al día, en su día de gracia (gabela: les venció ayer) o en mora. Es la misma cuenta de Cartera. Para recoger la moto: más de 3 días en mora, sin plazo extra.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {([
            { k: "aldia", t: "Al día", n: d.clientes.aldia, ink: "var(--ok-ink)", borde: "var(--ok-line)" },
            { k: "gabela", t: "Gabela", n: d.clientes.gabela, ink: "var(--warn-ink)", borde: "var(--warn-line)" },
            { k: "mora", t: "En mora", n: d.clientes.mora, ink: "var(--bad-ink)", borde: "var(--bad-line)" },
          ]).map(x => (
            <button key={x.k} onClick={() => p.onAbrir("hoy:" + x.k)} aria-label={`${x.t}: ${x.n}. Ver la lista`}
              style={{ ...boton, padding: "8px 10px", borderRadius: 10, border: `1px solid ${x.borde}`, minHeight: 56 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: x.ink }}>{x.t}</span>
              <span style={{ display: "block", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{x.n}</span>
              <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{pct(x.n, conMoto)}%</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
          {[
            { k: "hoy:recoleccion", t: "De los que están en mora, para recoger la moto", n: d.clientes.recoleccion },
            { k: "sinacuerdo", t: "Deben y no tienen acuerdo", n: d.clientes.sinAcuerdo },
            { k: "hoy:liquidacion", t: "En liquidación (la moto ya la tiene otro)", n: d.clientes.liquidacion },
            { k: "cerrados", t: "Contratos cerrados que pagaron en el período", n: d.clientes.cerrados },
          ].filter(x => x.n > 0).map(x => (
            <button key={x.k} onClick={() => p.onAbrir(x.k)} aria-label={`${x.t}: ${x.n}. Ver la lista`}
              style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: "var(--muted2)" }}>{x.t}</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{x.n}</span>
              <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" />
            </button>
          ))}
        </div>
      </Tarjeta>

      {/* Lo que hizo el cobrador: lo que él mismo registró en el período. */}
      {d.gestiones && (
        <Tarjeta titulo="Lo que hizo en el período"
          ayuda="Lo que registró en la app en el período, sobre cualquier cliente: mensajes de cobro, llamadas, WhatsApp, sirenas, recolecciones, plazos extra y cobros en la calle. Toca uno para ver a quiénes.">
          {d.gestiones.every(g => g.n === 0)
            ? <div style={{ fontSize: 13, color: "var(--muted2)" }}>No registró gestiones en este período.</div>
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                {d.gestiones.filter(g => g.n > 0).map(g => (
                  <button key={g.clave} onClick={() => p.onAbrir("gestion:" + g.clave)} aria-label={`${g.etiqueta}: ${g.n}. Ver la lista`}
                    style={{ ...boton, padding: "6px 8px", borderRadius: 10, border: "1px solid var(--line)", minHeight: 52 }}>
                    <span style={{ display: "block", fontSize: 17, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{g.n}</span>
                    <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{g.etiqueta}</span>
                  </button>
                ))}
              </div>
            )}
        </Tarjeta>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => p.onAbrir("motos")} style={botonAccion}><List size={16} aria-hidden="true" /> Ver {esCobrador && d.clave ? "sus" : "los"} contratos</button>
        {p.extraBotones}
        <button onClick={p.onCartera} style={botonAccion}><ExternalLink size={16} aria-hidden="true" /> Abrir en Cartera</button>
        {p.onDescargar && <button onClick={p.onDescargar} style={botonAccion}><Download size={16} aria-hidden="true" /> Descargar Excel</button>}
      </div>
    </div>
  );
}

/** Dónde está cada moto: barra + una fila tocable por lugar (Por grupo, Por cobrador y Flota). */
export function DondeEstanLasMotos({ titulo, total, lugares, onAbrir }: { titulo: string; total: number; lugares: Record<LugarMoto, number>; onAbrir: (clave: string) => void }) {
  return (
    <Tarjeta titulo={titulo}
      ayuda="Cada moto está en un solo lugar, así que los números suman el total. Retenidas por no pagar: el contrato está detenido y la moto no tiene otro cliente, esté en el parqueadero o en el taller. Con la moto en el taller: el contrato sigue corriendo pero el cliente no tiene la moto.">
      {total > 0 && (
        <div style={{ display: "flex", height: 12, borderRadius: 4, overflow: "hidden", gap: 1, background: "var(--soft)" }} aria-hidden="true">
          {LUGARES.map(l => lugares[l.clave] > 0 && (
            <div key={l.clave} style={{ width: `${(lugares[l.clave] / total) * 100}%`, background: COLOR_LUGAR[l.clave] }} />
          ))}
        </div>
      )}
      <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
        {LUGARES.filter(l => l.clave === "trabajando" || lugares[l.clave] > 0).map(l => (
          <button key={l.clave} onClick={() => onAbrir("lugar:" + l.clave)} aria-label={`${l.etiqueta}: ${lugares[l.clave]}. Ver cuáles`}
            style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: COLOR_LUGAR[l.clave], flexShrink: 0 }} aria-hidden="true" />{l.etiqueta}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{lugares[l.clave]}</span>
            <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" />
          </button>
        ))}
      </div>
    </Tarjeta>
  );
}

function Plata({ d, esCobrador, textoAnterior, onAbrir }: { d: DatosPortafolio; esCobrador: boolean; textoAnterior: string; onAbrir: (c: string) => void }) {
  const r = d.recaudo;
  return (
    <Tarjeta titulo={esCobrador && d.clave ? "Plata que entró de sus motos" : "Plata que entró"}
      ayuda={esCobrador
        ? "Lo que pagaron las motos de este cobrador desde que son suyas. Lo que esas motos pagaron antes de que se las asignaran va aparte: el sistema no guarda quién las tenía antes. No se compara con el período anterior porque las motos de cada cobrador cambian de un mes a otro; para comparar cobradores, mira cuánto cumplió. Empresa: tarifa de las semanas, acuerdos de deudas, multas y demás. Ahorro y base: plata de los clientes, guardada."
        : "Todo lo que pagaron los clientes en el período. Empresa: tarifa de las semanas, acuerdos de deudas, multas y demás. Ahorro y base: plata de los clientes, guardada. La plata de cada moto va a su grupo; si el cliente anda en una moto prestada, cuenta en el grupo de su moto."}>
      <button onClick={() => onAbrir("recaudo")} style={boton} aria-label={`Ver los pagos: ${plata(r.total)}`}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(r.total)}</span>
          <ChevronRight size={18} color="var(--muted2)" aria-hidden="true" />
        </div>
        {/* Al cobrador no se le compara la plata con el período anterior: sus motos cambian de un mes a
            otro (en septiembre a 200 se les asignó cobrador) y la comparación diría más de lo que es. */}
        {!esCobrador && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap", fontSize: 12, color: "var(--muted2)" }}>
            <Delta txt={d.anterior.delta.txt} up={d.anterior.delta.up} />
            <span>vs {textoAnterior} ({plata(d.anterior.total)})</span>
          </div>
        )}
        {r.total > 0 && (
          <>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 12, background: "var(--soft)" }} aria-hidden="true">
              <div style={{ width: `${pct(r.empresa, r.total)}%`, background: "var(--accent)" }} />
              <div style={{ width: `${pct(r.ahorro, r.total)}%`, background: "var(--violet)" }} />
              <div style={{ width: `${pct(r.baseYSaldo, r.total)}%`, background: "var(--muted)" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 6, lineHeight: 1.5 }}>
              Empresa <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(r.empresa)}</b> · ahorro de clientes {plata(r.ahorro)} · base y saldo a favor {plata(r.baseYSaldo)}
            </div>
          </>
        )}
      </button>
      {d.antes > 0 && (
        <button onClick={() => onAbrir("antes")} style={{ ...boton, fontSize: 12, marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn-ink)", lineHeight: 1.5 }}>
          {d.clave ? <>Además entraron {plata(d.antes)} de motos que se le pasaron en el período, de antes de que fueran suyas</> : <>Además entraron {plata(d.antes)} de motos que cambiaron de cobrador en el período, de antes del cambio</>}
        </button>
      )}
      {d.porMoto !== null && (
        <div style={{ fontSize: 12, marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "var(--soft2)", color: "var(--muted2)", lineHeight: 1.5 }}>
          Cada moto trabajando le dejó a la empresa unos <b style={{ color: "var(--text)", fontWeight: 600 }}>{plata(d.porMoto)}</b> en el período
        </div>
      )}
    </Tarjeta>
  );
}

function Cumplimiento({ d, esCobrador, onAbrir }: { d: DatosPortafolio; esCobrador: boolean; onAbrir: (c: string) => void }) {
  return (
    <Tarjeta titulo="De lo que se vencía, cuánto se pagó"
      ayuda={`De las semanas y cuotas de acuerdo que se les vencían a los clientes${esCobrador ? " desde que el cobrador los tiene" : " en el período"}, cuánto quedó pagado con plata. Lo que pasó a un acuerdo no cuenta como pagado: va aparte. Los atrasos viejos van en su propia línea, para que un cliente que se pone al día no tape a otro que no pagó. No entran las motos retenidas ni las que están en el taller.`}>
      <button onClick={() => onAbrir("cumplimiento")} style={boton} aria-label="Ver quiénes no completaron lo del período">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: tintaPct(d.cum.pct), fontVariantNumeric: "tabular-nums" }}>{d.cum.pct === null ? "—" : `${d.cum.pct}%`}</span>
          <ChevronRight size={18} color="var(--muted2)" aria-hidden="true" />
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "var(--soft)", marginTop: 8, overflow: "hidden" }} aria-hidden="true">
          <div style={{ width: `${d.cum.pct ?? 0}%`, height: "100%", background: colorPct(d.cum.pct) }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 8, lineHeight: 1.5 }}>
          {d.cum.debia > 0
            ? <>Vencía <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(d.cum.debia)}</b> · se pagó <b style={{ color: "var(--text)", fontWeight: 500 }}>{plata(d.cum.cubrio)}</b>{d.cum.aAcuerdo > 0 && <> · pasó a acuerdo {plata(d.cum.aAcuerdo)}</>} · faltó <b style={{ color: "var(--bad-ink)", fontWeight: 500 }}>{plata(d.cum.debia - d.cum.cubrio - d.cum.aAcuerdo)}</b></>
            : "En este período no se les vencía nada a sus clientes."}
        </div>
        {(d.cum.recupero > 0 || d.cum.atrasoAAcuerdo > 0) && (
          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.5 }}>
            De atrasos viejos: se pagaron {plata(d.cum.recupero)}{d.cum.atrasoAAcuerdo > 0 && <> · pasaron a acuerdo {plata(d.cum.atrasoAAcuerdo)}</>}
          </div>
        )}
      </button>
    </Tarjeta>
  );
}
