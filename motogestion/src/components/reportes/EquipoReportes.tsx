// EQUIPO (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md).
//
// Nómina: lo que se paga en la semana (cobros · visitas · referidos), si quedó registrada como
// pagada en la app, cada cobrador con las motos que le generaron pago, las semanas de cada cobrador
// juntas y lo que pone cada portafolio. Visitas: cuántas, con qué resultado, quién las hizo, cuántas
// terminaron en moto entregada, con GPS y foto, y cuánto tardó la entrega. Solo pinta: las cuentas
// las arma ReportesView con la función de siempre (`nominaSemanaDetallada`).
import { ChevronLeft, ChevronRight, AlertTriangle, Info, Download } from "lucide-react";
import type { ReactNode } from "react";
import { Tarjeta, boton, plata, pct } from "./ResumenReportes";

const fila: React.CSSProperties = { ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10 };
const flecha = <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" />;
const COLOR_PARTE = { cobros: "var(--accent)", visitas: "var(--ok)", referidos: "var(--warn)" } as const;
const muted: React.CSSProperties = { fontSize: 12, color: "var(--muted2)" };

function Aviso({ tono, children, accion }: { tono: "warn" | "info" | "bad"; children: ReactNode; accion?: ReactNode }) {
  const c = tono === "warn" ? ["var(--warn-soft)", "var(--warn-line)", "var(--warn-ink)"] : tono === "bad" ? ["var(--bad-soft)", "var(--bad-line)", "var(--bad-ink)"] : ["var(--accent-soft2)", "var(--accent-line)", "var(--accent-ink)"];
  const Icono = tono === "info" ? Info : AlertTriangle;
  return (
    <div role={tono === "info" ? undefined : "status"} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap", padding: "12px 14px", borderRadius: 14, background: c[0], border: `1px solid ${c[1]}`, color: c[2], fontSize: 13, lineHeight: 1.5, textAlign: "left" }}>
      <Icono size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: "1 1 200px", minWidth: 0 }}>{children}</span>
      {accion}
    </div>
  );
}

// ── NÓMINA ─────────────────────────────────────────────────────────────────────────────────────

/** Motos que el cobrador ya tenía esa semana y cuántas de ellas le generaron pago. */
export type CeldaSemana = { tenia: number; generaron: number } | null;
export type FilaCobradorNomina = {
  id: string;
  nombre: string;
  total: number;
  partes: { cobros: number; visitas: number; referidos: number };
  /** null en una semana ya pagada (mandan las cifras congeladas) o si no tiene motos. */
  motos: CeldaSemana;
  /** Día en que se registró el pago en la app; null si no se registró. */
  pagada: string | null;
};
export type DatosNomina = {
  textoSemana: string;
  puedeSiguiente: boolean;
  cargando: boolean;
  error: boolean;
  /** false = semana anterior al registro exacto de ciclos (22-ago): se calcula releyendo pagos. */
  vigia: boolean;
  /** Motos con gestión esta semana que hoy son de un cobrador que entonces todavía no las tenía. */
  motosDeOtro: number;
  sinCobrador: { n: number; total: number; placas: string[] } | null;
  grupoFiltrado: string | null;
  total: number;
  partes: { cobros: number; visitas: number; nVisitas: number; referidos: number; nReferidos: number };
  cobradores: FilaCobradorNomina[];
  portafolios: Array<{ grupo: string; color: string; total: number }>;
  tendencia: {
    semanas: Array<{ lunes: string; texto: string; enCurso: boolean; pagadas: number; cobradores: number }>;
    filas: Array<{ id: string; nombre: string; celdas: CeldaSemana[] }>;
    cargando: boolean;
  };
  valores: { ciclo: number; atrasado: number; retencion: number; visita: number; referido: number; pctAtrasado: number };
};

function BarraMotos({ c }: { c: NonNullable<CeldaSemana> }) {
  return (
    <span style={{ display: "block", height: 6, borderRadius: 3, background: "var(--soft)", overflow: "hidden" }} aria-hidden="true">
      <span style={{ display: "block", height: "100%", width: `${pct(c.generaron, c.tenia)}%`, background: "var(--ok)" }} />
    </span>
  );
}

export function EquipoNomina({ d, onMover, onReintentar, onAbrir }: {
  d: DatosNomina;
  onMover: (dir: -1 | 1) => void;
  onReintentar: () => void;
  /** "parte:cobros|visitas|referidos" · "cobrador:<id>" · "grupo:<grupo>" */
  onAbrir: (clave: string) => void;
}) {
  const v = d.valores;
  const pagadas = d.cobradores.filter(c => c.pagada).length;
  const btnSemana: React.CSSProperties = { width: 44, height: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: "1px solid var(--line2)", background: "transparent", color: "var(--text)", cursor: "pointer", flexShrink: 0 };
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, borderRadius: 16, background: "var(--card)", border: "1px solid var(--line)" }}>
        <button onClick={() => onMover(-1)} aria-label="Semana anterior" style={btnSemana}><ChevronLeft size={18} aria-hidden="true" /></button>
        <div style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{d.textoSemana}</div>
        <button onClick={() => onMover(1)} disabled={!d.puedeSiguiente} aria-label="Semana siguiente"
          style={{ ...btnSemana, cursor: d.puedeSiguiente ? "pointer" : "not-allowed", opacity: d.puedeSiguiente ? 1 : 0.4 }}><ChevronRight size={18} aria-hidden="true" /></button>
      </div>

      {(d.cargando || d.error) && (
        <Aviso tono={d.error ? "bad" : "info"} accion={d.error ? (
          <button onClick={onReintentar} style={{ minHeight: 44, padding: "0 16px", borderRadius: 12, border: "none", background: "var(--accent)", color: "var(--on-accent)", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Volver a intentar</button>
        ) : undefined}>
          {d.error ? <>No se pudo traer toda la información de esta semana. <b>No pagues ni imprimas con estas cifras.</b></> : "Cargando la nómina completa de esta semana. Espera a que termine antes de pagar o imprimir."}
        </Aviso>
      )}
      {!d.vigia && (
        <Aviso tono="warn">Esta semana es de antes del registro exacto de ciclos (existe desde el 22 de agosto). Las cifras se calculan releyendo los pagos: <b>revisa el desprendible antes de pagar.</b></Aviso>
      )}
      {d.motosDeOtro > 0 && (
        <Aviso tono="info">Esta semana se le paga a cada cobrador según las motos que tiene <b>hoy</b>. {d.motosDeOtro} {d.motosDeOtro === 1 ? "moto con gestión todavía no era" : "motos con gestión todavía no eran"} de su cobrador de hoy cuando empezó esa semana, y el sistema no guarda quién las tenía antes.</Aviso>
      )}
      {d.grupoFiltrado && (
        <Aviso tono="info">Estás viendo solo lo que paga <b>{d.grupoFiltrado}</b>. Para cerrar y pagar o imprimir un desprendible, quita el filtro de grupo: así nunca se paga una nómina recortada.</Aviso>
      )}

      <Tarjeta titulo="Lo que se paga esta semana"
        ayuda="La nómina de los cobradores en la semana, de lunes a domingo, partida en lo que se paga por cobrar las cuotas, por las visitas domiciliarias y por los referidos (clientes que trajo el mismo cobrador). Toca una parte para ver cada pago.">
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(d.total)}</div>
        <div style={muted}>{d.cobradores.length} {d.cobradores.length === 1 ? "cobrador" : "cobradores"} · pago registrado en la app: {pagadas === 0 ? "ninguno" : `${pagadas} de ${d.cobradores.length}`}</div>
        {d.total > 0 && (
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 10, background: "var(--soft)" }} aria-hidden="true">
            {(["cobros", "visitas", "referidos"] as const).map(k => <div key={k} style={{ width: `${pct(d.partes[k], d.total)}%`, background: COLOR_PARTE[k] }} />)}
          </div>
        )}
        <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
          {([["cobros", "Cobro de cuotas", d.partes.cobros], ["visitas", `${d.partes.nVisitas} ${d.partes.nVisitas === 1 ? "visita" : "visitas"}`, d.partes.visitas], ["referidos", `${d.partes.nReferidos} ${d.partes.nReferidos === 1 ? "referido" : "referidos"}`, d.partes.referidos]] as const).map(([k, t, val]) => (
            <button key={k} onClick={() => onAbrir("parte:" + k)} aria-label={`${t}: ${plata(val)}. Ver cada pago`} style={fila}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: COLOR_PARTE[k], flexShrink: 0 }} aria-hidden="true" />{t}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(val)}</span>
              {flecha}
            </button>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Cuánto vale cada cosa"
        ayuda={`Se paga por moto gestionada. Semana cobrada a tiempo: ${plata(v.ciclo)}, una vez por cada semana del cliente (el primer pago de un contrato nuevo, el prorrateo, vale lo mismo). Semana atrasada que entra después: ${plata(v.atrasado)} (el ${v.pctAtrasado}%). Retención: ${plata(v.retencion)}, una sola vez, la semana en que se retiene; esa semana no se paga nada más por esa moto. En mora sin pagar y sin retener: $0. Los contratos diarios no entran. Con acuerdo, la semana y la cuota del acuerdo son un solo paquete: se paga cuando el paquete queda completo, nunca por cuota suelta; la única excepción es la moto retenida, que paga ${plata(v.atrasado)} por cada semana en que abone a su acuerdo. La visita vale ${plata(v.visita)} y la cobra quien la hizo, en la semana en que se entrega la moto; si después se ve que la moto no duerme donde el cliente dijo, no se paga. El referido vale ${plata(v.referido)} y lo cobra quien trajo al cliente, en la semana en que se entrega la moto.`}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "6px 12px", fontSize: 13 }}>
          {([["Semana cobrada a tiempo", v.ciclo], ["Semana atrasada", v.atrasado], ["Retención", v.retencion], ["Visita domiciliaria", v.visita], ["Referido", v.referido]] as const).map(([t, val]) => (
            <div key={t} style={{ display: "contents" }}>
              <span>{t}</span><span style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(val)}</span>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Por cobrador"
        ayuda="Lo que se le paga a cada cobrador esta semana y, de las motos que ya tenía esa semana, cuántas le generaron pago (una semana cobrada, una retención o la cuota de una retenida). Toca uno para ver cada pago, las motos que no le generaron pago y por qué, imprimir el desprendible o registrar el pago.">
        {d.cobradores.length === 0 ? (
          <div style={{ ...muted, fontSize: 13, padding: "8px 4px" }}>Esta semana no hay nada que pagar.</div>
        ) : d.cobradores.map(c => (
          <button key={c.id} onClick={() => onAbrir("cobrador:" + c.id)} aria-label={`${c.nombre}: ${plata(c.total)}. Ver su semana`}
            style={{ ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: "4px 8px", alignItems: "center", padding: "8px 4px", borderRadius: 10, minHeight: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{c.nombre}</span>
            <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(c.total)}</span>
            {flecha}
            {c.motos && <span style={{ gridColumn: "1 / -1" }}><BarraMotos c={c.motos} /></span>}
            <span style={{ ...muted, fontSize: 11, gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "2px 8px" }}>
              {c.motos && <span>{c.motos.generaron} de {c.motos.tenia} motos le generaron pago</span>}
              <span style={{ color: c.pagada ? "var(--ok-ink)" : "var(--muted2)", fontWeight: c.pagada ? 600 : 400 }}>{c.pagada ? `Pagada en la app el ${c.pagada}` : "Pago no registrado en la app"}</span>
            </span>
          </button>
        ))}
      </Tarjeta>

      <Tarjeta titulo="Cada cobrador, semana a semana"
        ayuda="De las motos que cada cobrador ya tenía esa semana, cuántas le generaron pago. Empieza el 14 de septiembre: entre el 7 y el 13 se les puso fecha nueva a 176 motos, y antes de eso no se sabe con certeza quién tenía cada una. Cada lunes se suma una semana. Debajo de cada semana, si quedó pagada en la app.">
        {d.tendencia.cargando ? (
          <div style={{ ...muted, fontSize: 13, padding: "8px 4px" }}>Cargando las semanas…</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${d.tendencia.semanas.length}, minmax(0, 1fr))`, gap: 8 }}>
              {d.tendencia.semanas.map(s => (
                <div key={s.lunes} style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 1.35 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>{s.texto}</div>
                  <div>{s.enCurso ? "va corriendo" : s.pagadas === 0 ? "sin pago registrado" : `pagada ${s.pagadas} de ${s.cobradores}`}</div>
                </div>
              ))}
            </div>
            {d.tendencia.filas.map(f => (
              <div key={f.id} style={{ display: "grid", gap: 4, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre}</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${f.celdas.length}, minmax(0, 1fr))`, gap: 8 }}>
                  {f.celdas.map((c, i) => (
                    <div key={i} style={{ display: "grid", gap: 4 }}>
                      {c && c.tenia > 0 ? (
                        <>
                          <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}><b>{pct(c.generaron, c.tenia)}%</b> <span style={{ fontSize: 11, color: "var(--muted2)" }}>{c.generaron}/{c.tenia}</span></span>
                          <BarraMotos c={c} />
                        </>
                      ) : <span style={{ fontSize: 12, color: "var(--muted2)" }}>sin motos</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>

      {d.portafolios.length > 0 && (
        <Tarjeta titulo="Lo que pone cada portafolio" ayuda="Cada grupo paga la gestión de sus propias motos. Las visitas y los referidos los paga el portafolio de la moto que se entregó. Toca uno para ver cada pago.">
          {d.portafolios.map(g => (
            <button key={g.grupo} onClick={() => onAbrir("grupo:" + g.grupo)} aria-label={`${g.grupo}: ${plata(g.total)}. Ver cada pago`} style={fila}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} aria-hidden="true" />{g.grupo}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{plata(g.total)}</span>
              {flecha}
            </button>
          ))}
        </Tarjeta>
      )}

      {d.sinCobrador && (
        <Aviso tono="warn">{d.sinCobrador.n} {d.sinCobrador.n === 1 ? "gestión es de una moto" : "gestiones son de motos"} sin cobrador (valdrían {plata(d.sinCobrador.total)}). No se le pagan a nadie: asígnales el cobrador en Motos. {d.sinCobrador.placas.join(" · ")}</Aviso>
      )}
    </div>
  );
}

// ── VISITAS ────────────────────────────────────────────────────────────────────────────────────

export type DatosVisitas = {
  total: number;
  resultados: { aprobadas: number; esperando: number; repetir: number; rechazadas: number; sinResultado: number; pendientes: number };
  entregas: { conMoto: number; esperando: number; mediana: number | null; maximo: number | null };
  evidencia: { hechas: number; conGps: number; conFoto: number };
  estimadas: number;
  /** Aprobadas porque se aprobó el cliente, sin que la visita quedara marcada. */
  aprobadasPorCliente: number;
  personas: Array<{ id: string; nombre: string; total: number; aprobadas: number }>;
};

const dias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

export function EquipoVisitas({ d, onAbrir, onDescargar }: {
  d: DatosVisitas;
  /** "res:<resultado>" · "entregas" · "esperando" · "singps" · "sinfoto" · "persona:<id>" */
  onAbrir: (clave: string) => void;
  onDescargar?: () => void;
}) {
  const r = d.resultados;
  const maxPersona = Math.max(...d.personas.map(p => p.total), 1);
  const partes = ([
    ["aprobadas", "Aprobadas", r.aprobadas, "var(--ok)"],
    ["esperando", "Esperando tu decisión", r.esperando, "var(--violet)"],
    ["repetir", "Para repetir", r.repetir, "var(--warn)"],
    ["rechazadas", "Rechazadas", r.rechazadas, "var(--bad)"],
    ["sinResultado", "Sin anotar el resultado", r.sinResultado, "var(--muted2)"],
    ["pendientes", "Pendientes por hacer", r.pendientes, "var(--accent)"],
  ] as const).filter(([k, , n]) => k === "aprobadas" || n > 0);
  if (d.total === 0) {
    return <div style={{ ...muted, fontSize: 13, padding: 12, textAlign: "left" }}>No hay visitas en este período.</div>;
  }
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      <Tarjeta titulo="Visitas domiciliarias"
        ayuda="Las visitas a la casa de los clientes nuevos en el período, por la fecha de la visita, con su resultado. Toca uno para ver la lista.">
        <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{d.total} {d.total === 1 ? "visita" : "visitas"}</div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 10, background: "var(--soft)" }} aria-hidden="true">
          {partes.map(([k, , n, c]) => <div key={k} style={{ width: `${pct(n, d.total)}%`, background: c }} />)}
        </div>
        <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
          {partes.map(([k, t, n, c]) => (
            <button key={k} onClick={() => onAbrir("res:" + k)} aria-label={`${t}: ${n}. Ver la lista`} style={fila}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} aria-hidden="true" />{t}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>
              {flecha}
            </button>
          ))}
        </div>
        {d.aprobadasPorCliente > 0 && (
          <div style={{ ...muted, fontSize: 11, padding: "6px 4px 0", lineHeight: 1.5 }}>
            {d.aprobadasPorCliente} de las aprobadas no quedaron marcadas en la visita: se aprobó al cliente directamente. Se cuentan como aprobadas.
          </div>
        )}
      </Tarjeta>

      {r.aprobadas > 0 && (
        <Tarjeta titulo="Terminaron en moto entregada"
          ayuda="De los clientes con la visita aprobada, cuántos ya recibieron su moto, y cuántos días pasaron entre la visita y la entrega.">
          <button onClick={() => onAbrir("entregas")} aria-label={`${d.entregas.conMoto} de ${r.aprobadas} ya recibieron su moto. Ver la lista`} style={fila}>
            <span style={{ fontSize: 13 }}>De las {r.aprobadas} aprobadas, ya recibieron su moto</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ok-ink)", fontVariantNumeric: "tabular-nums" }}>{d.entregas.conMoto}</span>
            {flecha}
          </button>
          {d.entregas.esperando > 0 && (
            <button onClick={() => onAbrir("esperando")} aria-label={`${d.entregas.esperando} aprobados todavía sin moto. Ver la lista`} style={fila}>
              <span style={{ fontSize: 13 }}>Aprobados que todavía no tienen su moto</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--warn-ink)", fontVariantNumeric: "tabular-nums" }}>{d.entregas.esperando}</span>
              {flecha}
            </button>
          )}
          {d.entregas.mediana !== null && d.entregas.maximo !== null && (
            <div style={{ ...muted, fontSize: 13, padding: "6px 4px 0", lineHeight: 1.5 }}>
              {d.entregas.maximo === 0 ? <>Todas se entregaron <b style={{ color: "var(--text)" }}>el mismo día de la visita</b>.</> : (
                <>La mitad de las motos se entregó <b style={{ color: "var(--text)" }}>{d.entregas.mediana === 0 ? "el mismo día de la visita" : `${dias(d.entregas.mediana)} o menos después de la visita`}</b>; la que más se demoró, {dias(d.entregas.maximo)}.</>
              )}
            </div>
          )}
        </Tarjeta>
      )}

      {d.evidencia.hechas > 0 && (
        <Tarjeta titulo="Con su evidencia"
          ayuda="Cada visita debe quedar con la ubicación del GPS tomada en la casa del cliente y con fotos. Sin eso no hay cómo comprobar que se hizo.">
          {([["singps", "Con la ubicación del GPS", d.evidencia.conGps], ["sinfoto", "Con fotos", d.evidencia.conFoto]] as const).map(([k, t, n]) => {
            const faltan = d.evidencia.hechas - n;
            const contenido = (
              <>
                <span style={{ fontSize: 13 }}>{t}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: faltan > 0 ? "var(--warn-ink)" : "var(--ok-ink)" }}>{n} de {d.evidencia.hechas}</span>
              </>
            );
            return faltan > 0 ? (
              <button key={k} onClick={() => onAbrir(k)} aria-label={`${t}: ${n} de ${d.evidencia.hechas}. Ver las que no`} style={fila}>{contenido}{flecha}</button>
            ) : (
              <div key={k} style={{ ...fila, cursor: "default", gridTemplateColumns: "minmax(0, 1fr) auto" }}>{contenido}</div>
            );
          })}
        </Tarjeta>
      )}

      <Tarjeta titulo="Quién las hizo" ayuda="Las visitas de cada persona en el período y cuántas salieron aprobadas. Toca una para ver sus visitas.">
        {d.personas.map(p => (
          <button key={p.id} onClick={() => onAbrir("persona:" + p.id)} aria-label={`${p.nombre}: ${p.total} visitas, ${p.aprobadas} aprobadas. Ver sus visitas`}
            style={{ ...boton, boxSizing: "border-box", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: "4px 8px", alignItems: "center", padding: "6px 4px", borderRadius: 10, minHeight: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{p.nombre}</span>
            <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}><b>{p.total}</b> <span style={{ fontSize: 11, color: "var(--muted2)" }}>· {p.aprobadas} aprob.</span></span>
            {flecha}
            <span style={{ height: 6, borderRadius: 3, background: "var(--soft)", overflow: "hidden", gridColumn: "1 / -1" }} aria-hidden="true">
              <span style={{ display: "block", height: "100%", width: `${Math.round((p.total / maxPersona) * 100)}%`, background: "var(--accent)" }} />
            </span>
          </button>
        ))}
        {d.estimadas > 0 && (
          <div style={{ ...muted, fontSize: 11, padding: "6px 4px 0", lineHeight: 1.5 }}>
            {d.estimadas} {d.estimadas === 1 ? "visita no tiene" : "visitas no tienen"} anotado quién la hizo (son de antes de que se registrara): se cuentan a quien se le encargó.
          </div>
        )}
      </Tarjeta>

      {onDescargar && (
        <button onClick={onDescargar} style={{ ...boton, boxSizing: "border-box", minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Download size={16} aria-hidden="true" /> Descargar en Excel
        </button>
      )}
    </div>
  );
}
