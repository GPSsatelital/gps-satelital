// COBRANZA (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md · D-033/034).
//
// Cartera: cuánto nos deben hoy, de qué, qué tan cobrable es, quién lo tiene y quiénes deben más.
// Acuerdos: si los acuerdos de pago se están pagando, cuáles vencen pronto sin alcanzar y quién los
// lleva. Solo pinta: las cuentas las arma ReportesView con las mismas filas del resto de Reportes.
import { useState } from "react";
import { ChevronRight, Download, AlertTriangle, X } from "lucide-react";
import { Tarjeta, boton, plata, pct } from "./ResumenReportes";
import { ListBox, ItemLista } from "../ListaEstandar";
import type { ConvenioReporte } from "../../utils/reporteConvenios";

const fila: React.CSSProperties = { ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10 };
const flecha = <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" />;
const COLOR_PARTE = { semanas: "var(--bad)", acuerdo: "var(--violet)", deudas: "var(--warn)" } as const;

export type FilaReparto = { clave: string; nombre: string; color?: string; debe: number; clientes: number };

export function CobranzaCartera(p: {
  debe: { total: number; semanas: number; acuerdo: number; deudas: number; clientes: number };
  cobrable: { conMoto: number; retenidas: number };
  estados: { aldia: number; gabela: number; mora: number; recoleccion: number; taller: number; retenidas: number; liquidacion: number };
  porGrupo: FilaReparto[];
  porCobrador: FilaReparto[];
  mayores: Array<{ contratoId: string; placa: string; grupo: string; cliente: string; detalle: string; debe: number }>;
  saldoFavor: { total: number; clientes: number };
  modalidades: Array<[string, number]>;
  /** clave: "debe:<parte>" · "cobrable:<conmoto|retenidas>" · "hoy:<estado>" · "grupo:<g>" · "cobrador:<id>" · "mayores" · "favor" · "contrato:<id>" */
  onAbrir: (clave: string) => void;
  onCartera: () => void;
  /** Un día pasado del cuaderno (mig 190): "30 de septiembre". Sin él, es hoy. */
  dia?: string | null;
  /** Qué es lo que se está viendo ese día y qué no sabe. */
  aviso?: string | null;
  onVolverAHoy?: () => void;
}) {
  const [verPor, setVerPor] = useState<"grupo" | "cobrador">("grupo");
  const d = p.debe;
  const reparto = verPor === "grupo" ? p.porGrupo : p.porCobrador;
  const maxReparto = Math.max(...reparto.map(r => r.debe), 1);
  const totalCobrable = p.cobrable.conMoto + p.cobrable.retenidas;
  const conMoto = p.estados.aldia + p.estados.gabela + p.estados.mora;
  const pasado = !!p.dia;
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      {pasado && (
        <div role="note" style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 10, alignItems: "start", padding: 12, borderRadius: 12, border: "1px solid var(--accent-line)", background: "var(--accent-soft)" }}>
          <CalendarDays size={18} color="var(--accent-ink)" aria-hidden="true" style={{ marginTop: 1 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Así estaba la cartera el {p.dia}</div>
            {p.aviso && <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5, marginTop: 2 }}>{p.aviso}</div>}
            {p.onVolverAHoy && (
              <button onClick={p.onVolverAHoy} style={{ ...boton, boxSizing: "border-box", marginTop: 6, minHeight: 36, padding: "0 10px", borderRadius: 10, border: "1px solid var(--line2)", fontSize: 12, fontWeight: 500, width: "auto" }}>
                Volver a hoy
              </button>
            )}
          </div>
        </div>
      )}
      <Tarjeta titulo={pasado ? `Lo que se debía el ${p.dia}` : "Lo que se debe hoy"}
        ayuda={pasado
          ? "Lo que los clientes debían al final de ese día: las cuotas de su contrato que ya les tocaba pagar, las cuotas de sus acuerdos de pago y las deudas registradas. Es la misma cuenta de Cartera, anotada esa noche. Toca una parte para ver quiénes la debían."
          : "Todo lo que los clientes deben hoy: las cuotas de su contrato que ya les tocaba pagar (contando la que vence hoy), las cuotas de sus acuerdos de pago y las deudas registradas (multas, lavadas, daños y otras). Es la misma cuenta de Cartera, cliente por cliente. Toca una parte para ver quiénes la deben."}>
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(d.total)}</div>
        <div style={{ fontSize: 12, color: "var(--muted2)" }}>{d.clientes} {pasado ? (d.clientes === 1 ? "cliente debía" : "clientes debían") : (d.clientes === 1 ? "cliente debe" : "clientes deben")} algo</div>
        {d.total > 0 && (
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 10, background: "var(--soft)" }} aria-hidden="true">
            {(["semanas", "acuerdo", "deudas"] as const).map(k => <div key={k} style={{ width: `${pct(d[k], d.total)}%`, background: COLOR_PARTE[k] }} />)}
          </div>
        )}
        <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
          {([["semanas", "Cuotas del contrato"], ["acuerdo", "Cuotas de acuerdos"], ["deudas", "Deudas (multas, daños y otras)"]] as const).map(([k, t]) => (
            <button key={k} onClick={() => p.onAbrir("debe:" + k)} aria-label={`${t}: ${plata(d[k])}. Ver quiénes`} style={fila}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: COLOR_PARTE[k], flexShrink: 0 }} aria-hidden="true" />{t}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(d[k])}</span>
              {flecha}
            </button>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Qué tan cobrable es"
        ayuda="Lo que deben los clientes que siguen con su contrato se les cobra cada semana, en la calle. Lo que deben los que tienen la moto retenida o están en liquidación es más difícil de recoger: casi siempre se termina cobrando en la liquidación, contra su ahorro.">
        <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "var(--soft)" }} aria-hidden="true">
          <div style={{ width: `${pct(p.cobrable.conMoto, totalCobrable)}%`, background: "var(--ok)" }} />
          <div style={{ width: `${pct(p.cobrable.retenidas, totalCobrable)}%`, background: "var(--bad)" }} />
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
          {([["conmoto", "De clientes que siguen con su contrato", p.cobrable.conMoto, "var(--ok)"], ["retenidas", "De motos retenidas o en liquidación", p.cobrable.retenidas, "var(--bad)"]] as const).map(([k, t, v, c]) => (
            <button key={k} onClick={() => p.onAbrir("cobrable:" + k)} aria-label={`${t}: ${plata(v)}. Ver quiénes`} style={fila}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} aria-hidden="true" />{t}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(v)} <span style={{ fontSize: 11, color: "var(--muted2)", fontWeight: 400 }}>{pct(v, totalCobrable)}%</span></span>
              {flecha}
            </button>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo={pasado ? "Cómo iban pagando ese día" : "Cómo van pagando hoy"}
        ayuda="La misma cuenta del Resumen y de los portafolios. Al día, gabela (les venció ayer) o en mora; aparte, los que tienen la moto en el taller, las retenidas por no pagar y los que están en liquidación.">
        <div style={{ fontSize: 12, color: "var(--muted2)", marginBottom: 8 }}>{conMoto} clientes {pasado ? "tenían" : "tienen"} su moto trabajando</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {([["aldia", "Al día", p.estados.aldia, "var(--ok-ink)", "var(--ok-line)"], ["gabela", "Gabela", p.estados.gabela, "var(--warn-ink)", "var(--warn-line)"], ["mora", "En mora", p.estados.mora, "var(--bad-ink)", "var(--bad-line)"]] as const).map(([k, t, n, ink, borde]) => (
            <button key={k} onClick={() => p.onAbrir("hoy:" + k)} aria-label={`${t}: ${n}. Ver la lista`}
              style={{ ...boton, boxSizing: "border-box", padding: "8px 10px", borderRadius: 10, border: `1px solid ${borde}`, minHeight: 56 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: ink }}>{t}</span>
              <span style={{ display: "block", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
          {([["hoy:recoleccion", "De los que están en mora, para recoger la moto", p.estados.recoleccion], ["hoy:taller", "Con la moto en el taller", p.estados.taller], ["hoy:retenidas", "Retenidas por no pagar", p.estados.retenidas], ["hoy:liquidacion", "En liquidación", p.estados.liquidacion]] as const)
            .filter(([, , n]) => n > 0).map(([k, t, n]) => (
              <button key={k} onClick={() => p.onAbrir(k)} aria-label={`${t}: ${n}. Ver la lista`} style={fila}>
                <span style={{ fontSize: 13, color: "var(--muted2)" }}>{t}</span>
                <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>
                {flecha}
              </button>
            ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo={pasado ? "Quién tenía la deuda" : "Quién tiene la deuda"}
        ayuda={pasado ? "Lo que se debía ese día, partido por grupo o por el cobrador que tenía la moto. Toca uno para ver sus clientes." : "Lo que se debe hoy, partido por grupo o por el cobrador que tiene la moto. Toca uno para ver sus clientes."}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }} role="tablist">
          {(["grupo", "cobrador"] as const).map(k => (
            <button key={k} role="tab" aria-selected={verPor === k} onClick={() => setVerPor(k)}
              style={{ minHeight: 36, padding: "0 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: verPor === k ? 600 : 500,
                border: "1px solid " + (verPor === k ? "var(--accent-line)" : "var(--line2)"), background: verPor === k ? "var(--accent-soft)" : "transparent", color: verPor === k ? "var(--accent-ink)" : "var(--text)" }}>
              Por {k}
            </button>
          ))}
        </div>
        {reparto.map(r => (
          <button key={r.clave} onClick={() => p.onAbrir(`${verPor}:${r.clave}`)} aria-label={`${r.nombre}: ${plata(r.debe)}, ${r.clientes} clientes. Ver quiénes`}
            style={{ ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 4, padding: "6px 4px", borderRadius: 10, minHeight: 44 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0, textTransform: verPor === "cobrador" ? "uppercase" : "none", fontWeight: 500 }}>
              {r.color && <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, flexShrink: 0 }} aria-hidden="true" />}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nombre}</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{plata(r.debe)}</span>
            <span style={{ height: 6, borderRadius: 3, background: "var(--soft)", overflow: "hidden", gridColumn: "1 / -1" }} aria-hidden="true">
              <span style={{ display: "block", height: "100%", width: `${Math.max(Math.round((r.debe / maxReparto) * 100), r.debe > 0 ? 2 : 0)}%`, background: r.color ?? "var(--accent)" }} />
            </span>
            <span style={{ fontSize: 11, color: "var(--muted2)", gridColumn: "1 / -1" }}>{r.clientes} {r.clientes === 1 ? "cliente" : "clientes"}</span>
          </button>
        ))}
      </Tarjeta>

      <Tarjeta titulo="Los que más deben"
        ayuda="Los clientes con la cuenta más grande hoy, de mayor a menor. Toca uno para ver su ficha.">
        {p.mayores.map(m => (
          <button key={m.contratoId} onClick={() => p.onAbrir("contrato:" + m.contratoId)} aria-label={`${m.cliente}: debe ${plata(m.debe)}. Ver su ficha`}
            style={{ ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8, alignItems: "center", minHeight: 48, padding: "4px 4px", borderRadius: 10 }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 500, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.cliente}</span>
              <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{m.placa} · {m.grupo} · {m.detalle}</span>
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bad-ink)", fontVariantNumeric: "tabular-nums" }}>{plata(m.debe)}</span>
          </button>
        ))}
        <button onClick={() => p.onAbrir("mayores")} style={{ ...fila, color: "var(--accent-ink)", gridTemplateColumns: "minmax(0, 1fr) 16px" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Ver los {d.clientes} que deben</span>{flecha}
        </button>
      </Tarjeta>

      <Tarjeta titulo="Plata de los clientes a su favor"
        ayuda="Lo que algunos clientes pagaron de más y quedó guardado a su nombre. Se les muestra, nunca se les resta solo: se aplica a mano cuando el cliente lo decide.">
        <button onClick={() => p.onAbrir("favor")} aria-label={`${plata(p.saldoFavor.total)} a favor de ${p.saldoFavor.clientes} clientes. Ver quiénes`} style={fila}>
          <span style={{ fontSize: 13 }}>{p.saldoFavor.clientes} {p.saldoFavor.clientes === 1 ? "cliente tiene" : "clientes tienen"} plata a su favor</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ok-ink)", fontVariantNumeric: "tabular-nums" }}>{plata(p.saldoFavor.total)}</span>
          {flecha}
        </button>
      </Tarjeta>

      <Tarjeta titulo="Contratos por forma de pago" ayuda="Cuántos contratos andando hay de cada forma de pago (sin contar las motos retenidas ni las que están en liquidación). Toca una para ver los clientes.">
        {p.modalidades.map(([forma, n]) => (
          <button key={forma} onClick={() => p.onAbrir("modalidad:" + forma)} aria-label={`${forma}: ${n} contratos. Ver la lista`} style={fila}>
            <span style={{ fontSize: 13 }}>{forma}</span>
            <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>
            {flecha}
          </button>
        ))}
      </Tarjeta>

      <button onClick={p.onCartera} style={{ ...boton, boxSizing: "border-box", minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
        Abrir Cartera
      </button>
    </div>
  );
}

type FiltroAcuerdo = "todos" | "aldia" | "atrasados" | "vencidos" | "sinabono" | "vencenpronto";

export function CobranzaAcuerdos(p: {
  isMobile: boolean;
  /** Todos los acuerdos con los filtros de la barra (grupo y cobrador), cerrados incluidos. */
  lista: ConvenioReporte[];
  hoyISO: string;
  incluirCerrados: boolean;
  onIncluirCerrados: () => void;
  onAbonos: (c: ConvenioReporte) => void;
  onDescargar?: () => void;
}) {
  const [filtro, setFiltro] = useState<FiltroAcuerdo>("todos");
  const [cobrador, setCobrador] = useState<string | null>(null);
  const en14 = (() => { const d = new Date(p.hoyISO + "T12:00:00"); d.setDate(d.getDate() + 14); return d.toISOString().slice(0, 10); })();
  // Se están cobrando: los vigentes y los vencidos sin terminar (un acuerdo vencido se sigue cobrando).
  const porCobrar = p.lista.filter(c => c.estado === "activo" || c.estado === "incumplido");
  const pactado = porCobrar.reduce((s, c) => s + c.total, 0);
  const abonado = porCobrar.reduce((s, c) => s + c.abonado, 0);
  const saldo = porCobrar.reduce((s, c) => s + c.saldo, 0);
  const atrasado = porCobrar.reduce((s, c) => s + c.atrasado, 0);
  const vencenPronto = porCobrar.filter(c => c.estado === "activo" && c.fechaLimite >= p.hoyISO && c.fechaLimite <= en14 && c.saldo > 0)
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite));
  const cuenta: Record<FiltroAcuerdo, ConvenioReporte[]> = {
    todos: p.incluirCerrados ? p.lista : porCobrar,
    aldia: porCobrar.filter(c => c.estado === "activo" && c.alDia),
    atrasados: porCobrar.filter(c => c.estado === "activo" && !c.alDia),
    vencidos: porCobrar.filter(c => c.estado === "incumplido"),
    sinabono: porCobrar.filter(c => c.abonos.length === 0),
    vencenpronto: vencenPronto,
  };
  const quienes = [...new Set(porCobrar.map(c => c.encargado))].map(nombre => {
    const suyos = porCobrar.filter(c => c.encargado === nombre);
    return { nombre, n: suyos.length, atrasado: suyos.reduce((s, c) => s + c.atrasado, 0) };
  }).sort((a, b) => b.atrasado - a.atrasado || b.n - a.n);
  const visibles = cuenta[filtro].filter(c => cobrador === null || c.encargado === cobrador);
  const NOMBRE_FILTRO: Record<FiltroAcuerdo, string> = { todos: "", aldia: "Al día", atrasados: "Atrasados", vencidos: "Vencidos", sinabono: "Sin un peso", vencenpronto: "Vencen en 14 días" };
  const chip = (activo: boolean): React.CSSProperties => ({
    minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: activo ? 600 : 500,
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line2)"), background: activo ? "var(--accent-soft)" : "transparent", color: activo ? "var(--accent-ink)" : "var(--text)",
  });
  const fechaCorta = (iso: string) => new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  const elegir = (f: FiltroAcuerdo) => setFiltro(filtro === f ? "todos" : f);

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      <Tarjeta titulo="Acuerdos de pago"
        ayuda="Los acuerdos que todavía se están cobrando: los vigentes y los vencidos sin terminar de pagar (un acuerdo vencido se sigue cobrando). Se pactaron: lo que suman esos acuerdos. Se han pagado: la plata que de verdad les ha entrado. Atrasado: lo que ya se tenía que haber pagado y no se ha pagado.">
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{porCobrar.length} {porCobrar.length === 1 ? "acuerdo" : "acuerdos"}</div>
        <div style={{ fontSize: 12, color: "var(--muted2)" }}>Se pactaron {plata(pactado)} · se han pagado {plata(abonado)}</div>
        <div style={{ height: 8, borderRadius: 4, background: "var(--soft)", overflow: "hidden", marginTop: 8 }} aria-hidden="true">
          <div style={{ width: `${pct(abonado, pactado)}%`, height: "100%", background: "var(--ok)" }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4 }}>
          {pct(abonado, pactado)}% pagado · faltan {plata(saldo)} · atrasado <span style={{ color: "var(--bad-ink)", fontWeight: 600 }}>{plata(atrasado)}</span>
        </div>
      </Tarjeta>

      {vencenPronto.length > 0 && (
        <button onClick={() => elegir("vencenpronto")} aria-pressed={filtro === "vencenpronto"}
          style={{ ...boton, display: "grid", gridTemplateColumns: "20px minmax(0, 1fr) 16px", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 14, boxSizing: "border-box",
            background: "var(--warn-soft)", border: "1px solid " + (filtro === "vencenpronto" ? "var(--warn-ink)" : "var(--warn-line)"), color: "var(--warn-ink)" }}>
          <AlertTriangle size={18} aria-hidden="true" />
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{vencenPronto.length} {vencenPronto.length === 1 ? "acuerdo vence" : "acuerdos vencen"} en los próximos 14 días</span>
            <span style={{ display: "block", fontSize: 12 }}>Todavía les faltan {plata(vencenPronto.reduce((s, c) => s + c.saldo, 0))}. Si no terminan de pagar antes de su fecha, quedan vencidos.</span>
          </span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}

      <Tarjeta titulo="Cómo van"
        ayuda="Al día: han pagado todo lo que se les ha cobrado hasta hoy. Atrasados: deben cuotas. Vencidos: se les pasó la fecha sin terminar de pagar, y se les sigue cobrando. Las tres suman todos los acuerdos. Toca una para ver la lista.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {([["aldia", "Al día", "var(--ok-ink)", "var(--ok-line)"], ["atrasados", "Atrasados", "var(--warn-ink)", "var(--warn-line)"], ["vencidos", "Vencidos", "var(--bad-ink)", "var(--bad-line)"]] as const).map(([k, t, ink, borde]) => {
            const activo = filtro === k;
            return (
              <button key={k} onClick={() => elegir(k)} aria-pressed={activo} aria-label={`${t}: ${cuenta[k].length}. Ver la lista`}
                style={{ ...boton, padding: "8px 10px", borderRadius: 10, boxSizing: "border-box", border: `1px solid ${activo ? "var(--accent-line)" : borde}`, background: activo ? "var(--accent-soft)" : "transparent", minHeight: 56 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: ink }}>{t}</span>
                <span style={{ display: "block", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{cuenta[k].length}</span>
              </button>
            );
          })}
        </div>
        {cuenta.sinabono.length > 0 && (
          <button onClick={() => elegir("sinabono")} aria-pressed={filtro === "sinabono"} style={{ ...fila, marginTop: 8, background: filtro === "sinabono" ? "var(--accent-soft)" : "transparent" }}>
            <span style={{ fontSize: 13, color: "var(--muted2)" }}>De todos, los que no han pagado ni un peso desde que firmaron</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--bad-ink)", fontVariantNumeric: "tabular-nums" }}>{cuenta.sinabono.length}</span>
            {flecha}
          </button>
        )}
      </Tarjeta>

      {quienes.length > 0 && (
        <Tarjeta titulo="Quién los lleva" ayuda="Los acuerdos que se están cobrando, por el cobrador que tiene la moto, y cuánto tienen atrasado entre todos. Toca uno para ver solo los suyos.">
          {quienes.map(c => {
            const activo = cobrador === c.nombre;
            return (
              <button key={c.nombre} onClick={() => setCobrador(activo ? null : c.nombre)} aria-pressed={activo} aria-label={`${c.nombre}: ${c.n} acuerdos, ${plata(c.atrasado)} atrasado. Ver solo los suyos`}
                style={{ ...fila, background: activo ? "var(--accent-soft)" : "transparent" }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{c.n} {c.n === 1 ? "acuerdo" : "acuerdos"}</span>
                </span>
                <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: c.atrasado > 0 ? "var(--bad-ink)" : "var(--muted2)", fontWeight: 600 }}>{plata(c.atrasado)}</span>
                {flecha}
              </button>
            );
          })}
        </Tarjeta>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {(filtro !== "todos" || cobrador) && (
          <button onClick={() => { setFiltro("todos"); setCobrador(null); }} style={chip(true)} aria-label="Quitar el filtro de la lista">
            <span style={{ textTransform: cobrador ? "uppercase" : "none" }}>{[NOMBRE_FILTRO[filtro], cobrador ?? ""].filter(Boolean).join(" · ")}</span> <X size={14} aria-hidden="true" />
          </button>
        )}
        <button onClick={p.onIncluirCerrados} aria-pressed={p.incluirCerrados} style={chip(p.incluirCerrados)}>{p.incluirCerrados ? "Con los ya pagados" : "Ver también los ya pagados"}</button>
        {p.onDescargar && (
          <button onClick={p.onDescargar} style={chip(false)}><Download size={14} aria-hidden="true" /> Excel</button>
        )}
      </div>

      <div style={{ fontSize: 12, color: "var(--muted2)" }}>{visibles.length} {visibles.length === 1 ? "acuerdo" : "acuerdos"} · {filtro === "vencenpronto" ? "primero los que vencen antes" : "primero los más atrasados"}. Toca uno para ver sus pagos.</div>
      {visibles.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--muted2)", padding: 12 }}>No hay acuerdos con ese filtro.</div>
      ) : (
        <ListBox isMobile={p.isMobile}>
          {visibles.map(c => (
            <ItemLista key={c.convenioId} placa={c.placa} grupo={c.grupo} titulo={c.cliente}
              subtitulo={`${plata(c.total)} en ${c.numeroCuotas} ${c.numeroCuotas === 1 ? "cuota" : "cuotas"} · lleva ${plata(c.abonado)}${c.abonos.length === 0 ? ` · sin un peso en ${c.diasDesdeFirma} días` : ""} · ${c.estado === "incumplido" ? "venció" : "vence"} ${fechaCorta(c.fechaLimite)} · ${c.encargado}`}
              right={<span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", color: c.estado === "cumplido" ? "var(--ok-ink)" : c.estado === "incumplido" || c.atrasado > 0 ? "var(--bad-ink)" : c.estado === "activo" ? "var(--ok-ink)" : "var(--muted2)" }}>
                {c.estado === "cumplido" ? "Pagado" : c.estado === "incumplido" ? `falta ${plata(c.saldo)}` : c.estado !== "activo" ? c.estado : c.atrasado > 0 ? `debe ${plata(c.atrasado)}` : "al día"}
              </span>}
              rielColor={c.estado === "cumplido" ? "var(--ok)" : c.estado === "incumplido" || (c.estado === "activo" && c.abonos.length === 0) ? "var(--bad)" : c.atrasado > 0 ? "var(--warn)" : c.estado === "activo" ? "var(--ok)" : undefined}
              onClick={() => p.onAbonos(c)} />
          ))}
        </ListBox>
      )}
    </div>
  );
}
