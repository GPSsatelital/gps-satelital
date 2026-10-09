// EL LIBRO DE SEMANAS (9-oct-2026) — cada semana del contrato, en lista o en calendario.
// Pedido del dueño: "no saben identificar las cuentas". La cuenta la hace utils/libroSemanas.ts
// (medida contra los 345 contratos: las semanas pagadas, la de a medias, las que debe con su fecha y
// los días de mora dan lo mismo que Cartera). Este componente solo la pinta.
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, List, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown } from "lucide-react";
import { ListBox, ItemLista } from "./ListaEstandar";
import { card } from "../styles/shared";
import { construirLibro, type ContratoLibro, type FilaLibro, type PeriodoCalendario, type SemanaDelLibro } from "../utils/libroSemanas";
import { diaPagoFrase } from "../utils/cicloPago";
import { desglosarPago } from "../utils/lineaTiempo";
import { hoyDate } from "../utils/fecha";
import { useDatosLibro } from "../hooks/useDatosLibro";
import type { Pago } from "../hooks/usePagos";

type Tono = { fondo: string; tinta: string; riel: string; etiqueta: string };
const TONO: Record<string, Tono> = {
  pagada: { fondo: "var(--ok-soft)", tinta: "var(--ok-ink)", riel: "var(--ok)", etiqueta: "Pagada" },
  a_medias: { fondo: "var(--warn-soft)", tinta: "var(--warn-ink)", riel: "var(--warn)", etiqueta: "A medias" },
  debe: { fondo: "var(--bad-soft)", tinta: "var(--bad-ink)", riel: "var(--bad)", etiqueta: "Sin pagar" },
  proxima: { fondo: "var(--accent-soft)", tinta: "var(--accent-ink)", riel: "var(--accent)", etiqueta: "Próxima" },
  falta: { fondo: "var(--soft)", tinta: "var(--muted2)", riel: "var(--line2)", etiqueta: "Falta" },
  // El morado solo no llega a 4,5:1 sobre su fondo en modo día (3,95): se mezcla con el color del texto.
  rodada: { fondo: "color-mix(in srgb, var(--violet) 14%, transparent)", tinta: "color-mix(in srgb, var(--violet) 72%, var(--text))", riel: "var(--violet)", etiqueta: "Rodada" },
  sin_dato: { fondo: "var(--soft2)", tinta: "var(--muted2)", riel: "var(--line)", etiqueta: "Sin fecha" },
  dias_iniciales: { fondo: "var(--accent-soft2)", tinta: "var(--accent-ink)", riel: "var(--accent)", etiqueta: "Días iniciales" },
};

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const d12 = (f: string) => new Date(f + "T12:00:00");
const corta = (f: string) => { const d = d12(f); return `${d.getDate()} ${MES[d.getMonth()]}`; };
const conAnio = (f: string) => { const d = d12(f); return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`; };
const rango = (a: string, b: string) => {
  const x = d12(a), y = d12(b);
  return x.getMonth() === y.getMonth() ? `${x.getDate()} al ${y.getDate()} ${MES[y.getMonth()]}` : `${corta(a)} al ${corta(b)}`;
};
const larga = (f: string) => { const d = d12(f); return `${DIA[d.getDay()]} ${d.getDate()} de ${MES_LARGO[d.getMonth()]}`; };
const plata = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Etiqueta({ tono, texto }: { tono: Tono; texto?: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999, background: tono.fondo, color: tono.tinta, whiteSpace: "nowrap" }}>
      {texto ?? tono.etiqueta}
    </span>
  );
}

/** Lo que dice la línea de abajo de cada semana. */
function subtituloSemana(s: SemanaDelLibro, hoyISO: string, unidad: string): string {
  if (s.estado === "pagada") {
    if (s.adelantada) return "Pagada por adelantado";
    if (s.pagos && s.pagos.length > 0) {
      return s.pagos.map(p => `${corta(p.fecha)} · ${plata(p.monto)} ${p.origen.toLowerCase()}`).join(" + ");
    }
    return s.completadaEl ? `Pagada el ${corta(s.completadaEl)}` : "";
  }
  const vence = s.seExige
    ? (s.seExige === hoyISO ? "le toca hoy" : s.seExige < hoyISO ? `venció el ${corta(s.seExige)} (${s.diasVencida} ${s.diasVencida === 1 ? "día" : "días"})` : `le toca el ${larga(s.seExige)}`)
    : "";
  if (s.estado === "a_medias") return `Lleva ${plata(s.pagado)}, le faltan ${plata(s.valor - s.pagado)}${vence ? ` · ${vence}` : ""}`;
  if (s.estado === "debe") return `Nada pagado${vence ? ` · ${vence}` : ""}`;
  if (s.estado === "proxima") return s.seExige ? `${unidad} que viene · le toca el ${larga(s.seExige)}` : `${unidad} que viene`;
  return "";
}

export default function LibroSemanas({ contrato, pagos, isMobile }: {
  contrato: ContratoLibro & { id: string };
  pagos: Pago[];
  isMobile: boolean;
}) {
  const extra = useDatosLibro(contrato.id);
  const hoy = hoyDate();
  const hoyISO = isoLocal(hoy);
  const pagosDelContrato = useMemo(() => pagos.filter(p => p.contrato_id === contrato.id), [pagos, contrato.id]);
  const libro = useMemo(
    () => (extra ? construirLibro(contrato, pagosDelContrato, hoy, extra) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [contrato, pagosDelContrato, extra, hoyISO],
  );
  const [vista, setVista] = useState<"lista" | "calendario">("lista");
  const [abierta, setAbierta] = useState<number | null>(null);
  const cajaRef = useRef<HTMLDivElement | null>(null);

  // Al abrir la lista se para en la semana de hoy (o la más vieja que debe).
  useEffect(() => {
    if (vista !== "lista" || !libro) return;
    const c = cajaRef.current;
    const t = c?.querySelector('[data-foco="1"]') as HTMLElement | null;
    if (!c || !t) return;
    const r = t.getBoundingClientRect(), rc = c.getBoundingClientRect();
    c.scrollTop += (r.top - rc.top) - rc.height / 2 + r.height / 2;
  }, [vista, libro]);

  if (contrato.forma_pago === "Diario" || !contrato.motor_v2) {
    return (
      <div style={{ ...card, fontSize: 13, color: "var(--muted2)" }}>
        Este contrato no lleva la cuenta por semanas en la app ({contrato.forma_pago === "Diario" ? "es diario" : "es de antes del libro de semanas"}).
      </div>
    );
  }
  if (!libro) return <div role="status" style={{ ...card, fontSize: 13, color: "var(--muted2)" }}>Armando el libro de semanas…</div>;

  const u = libro.unidad;
  const uMin = u.toLowerCase();
  const plural = (n: number) => (u === "Mes" ? (n === 1 ? "mes" : "meses") : n === 1 ? uMin : uMin + "s");
  const semanas = libro.filas.filter((f): f is SemanaDelLibro => f.tipo === "semana");
  const nPagadas = libro.pagadas;
  const nMedias = semanas.filter(s => s.estado === "a_medias").length;
  const nDebe = semanas.filter(s => s.estado === "debe").length + semanas.filter(s => s.estado === "a_medias" && s.seExige && s.seExige <= hoyISO).length;
  const foco = semanas.find(s => s.actual) ?? semanas.find(s => s.estado === "debe" || s.estado === "a_medias") ?? semanas[semanas.length - 1];

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      {/* El resumen: desde cuándo, en qué semana va y cómo va */}
      <div style={{ ...card, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {libro.vaEn && libro.totalCajas ? `Va en la ${uMin} ${Math.min(libro.vaEn, libro.totalCajas)} de ${libro.totalCajas}` : `${u} por ${uMin}`}
          </div>
          <div role="tablist" aria-label="Cómo ver el libro" style={{ display: "flex", gap: 4, background: "var(--soft)", borderRadius: 10, padding: 3 }}>
            {([["lista", "Lista", List], ["calendario", "Calendario", CalendarDays]] as const).map(([k, t, Icono]) => (
              <button key={k} role="tab" aria-selected={vista === k} onClick={() => setVista(k)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: vista === k ? 600 : 500,
                  background: vista === k ? "var(--card)" : "transparent", color: vista === k ? "var(--text)" : "var(--muted2)", boxShadow: vista === k ? "0 1px 3px rgba(15,23,42,0.12)" : "none" }}>
                <Icono size={16} aria-hidden="true" /> {t}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.55 }}>
          Paga {diaPagoFrase(contrato)} · {plata(libro.valorCaja)} {u === "Mes" ? "el mes" : `la ${uMin}`}
          <br />
          {libro.esMigrado
            ? <>Entregada el {libro.entregada ? conAnio(libro.entregada) : "—"} · en la app desde el {libro.enAppDesde ? conAnio(libro.enAppDesde) : "—"}{libro.previas > 0 ? ` (traía ${libro.previas} ${plural(libro.previas)} del cuaderno)` : ""}</>
            : <>Contrato hecho en la app · entregada el {libro.entregada ? conAnio(libro.entregada) : "—"}</>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Etiqueta tono={TONO.pagada} texto={`${nPagadas} ${nPagadas === 1 ? "pagada" : "pagadas"}`} />
          {nMedias > 0 && <Etiqueta tono={TONO.a_medias} texto={`${nMedias} a medias`} />}
          {nDebe > 0 && <Etiqueta tono={TONO.debe} texto={`${nDebe} sin pagar`} />}
          {libro.rodadas > 0 && <Etiqueta tono={TONO.rodada} texto={`${libro.rodadas} ${libro.rodadas === 1 ? "rodada" : "rodadas"} al final`} />}
        </div>
        {libro.avisos.map((a, i) => (
          <div key={i} role="note" style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: "var(--warn-soft)", color: "var(--warn-ink)", border: "1px solid var(--warn-line)" }}>
            <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ minWidth: 0 }}>{a}</span>
          </div>
        ))}
      </div>

      {vista === "lista" ? (
        <ListBox isMobile={isMobile} scrollRef={el => { cajaRef.current = el; }}>
          {libro.filas.map((f, i) => (
            <FilaDelLibro key={i} f={f} hoyISO={hoyISO} unidad={u} plural={plural}
              foco={f.tipo === "semana" && foco?.numero === f.numero}
              abierta={f.tipo === "semana" && abierta === f.numero}
              onAbrir={f.tipo === "semana" && f.pagos && f.pagos.length > 0 ? () => setAbierta(abierta === f.numero ? null : f.numero) : undefined} />
          ))}
        </ListBox>
      ) : (
        <Calendario periodos={libro.periodos} pagosPorDia={libro.pagosPorDia} pagos={pagosDelContrato} semanas={semanas}
          hoyISO={hoyISO} unidad={u} entregada={libro.entregada} />
      )}
    </div>
  );
}

function FilaDelLibro({ f, hoyISO, unidad, plural, foco, abierta, onAbrir }: {
  f: FilaLibro; hoyISO: string; unidad: string; plural: (n: number) => string;
  foco: boolean; abierta: boolean; onAbrir?: () => void;
}) {
  if (f.tipo === "antes") {
    return (
      <ItemLista titulo={`${unidad}s ${f.desdeNumero} a ${f.hastaNumero}`} tituloCompleto
        subtitulo="Antes de la app: vienen pagadas del cuaderno"
        right={<Etiqueta tono={TONO.falta} texto={`${f.semanas} ${f.semanas === 1 ? "pagada" : "pagadas"}`} />} rielColor={TONO.falta.riel} />
    );
  }
  if (f.tipo === "prorrateo") {
    const listo = f.pagado >= f.total;
    return (
      <ItemLista titulo="Días iniciales" tituloCompleto
        subtitulo={`${f.desde ? `Del ${corta(f.desde)}` : "Desde la entrega"} hasta el primer día de pago${f.hasta ? ` (${corta(f.hasta)})` : ""} · ${listo ? `pagados ${plata(f.total)}` : `lleva ${plata(f.pagado)} de ${plata(f.total)}`}`}
        right={<Etiqueta tono={listo ? TONO.pagada : TONO.a_medias} texto={listo ? "Pagados" : "Le falta"} />} rielColor={TONO.dias_iniciales.riel} />
    );
  }
  if (f.tipo === "rodada") {
    return (
      <ItemLista titulo={f.motivo === "deuda" ? f.texto : `Moto guardada · ${rango(f.desde, f.hasta)}`} tituloCompleto
        subtitulo={`${f.semanas} ${plural(f.semanas)} ${f.semanas === 1 ? "rodada" : "rodadas"} al final: no se cobran ahora, se pagan al final del contrato`}
        right={<Etiqueta tono={TONO.rodada} />} rielColor={TONO.rodada.riel} />
    );
  }
  if (f.tipo === "resto") {
    return (
      <ItemLista titulo={`${unidad}s ${f.desdeNumero} a ${f.hastaNumero}`} tituloCompleto
        subtitulo={`Faltan ${f.semanas} ${plural(f.semanas)}${f.hasta ? ` · la última termina aprox. el ${conAnio(f.hasta)}` : ""}`}
        right={<Etiqueta tono={TONO.falta} />} rielColor={TONO.falta.riel} />
    );
  }
  const tono = TONO[f.estado];
  const titulo = `${unidad} ${f.numero}${f.desde && f.hasta ? ` · ${rango(f.desde, f.hasta)}` : ""}`;
  const etiqueta = f.estado === "debe" && f.seExige === hoyISO ? "Le toca hoy" : f.actual && f.estado === "pagada" ? "Pagada · esta" : undefined;
  return (
    <div data-foco={foco ? "1" : undefined}>
      <ItemLista titulo={titulo} tituloCompleto
        // La semana de hoy va resaltada: su texto gris no alcanzaba 4,5:1 sobre ese fondo en modo noche.
        subtitulo={f.actual ? <span style={{ color: "var(--text)" }}>{subtituloSemana(f, hoyISO, unidad)}</span> : subtituloSemana(f, hoyISO, unidad) || undefined}
        right={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Etiqueta tono={tono} texto={etiqueta} />
          {onAbrir && <ChevronDown size={16} aria-hidden="true" style={{ color: "var(--muted2)", transform: abierta ? "rotate(180deg)" : "none" }} />}
        </span>}
        rielColor={tono.riel} seleccionado={f.actual} onClick={onAbrir}
        extra={abierta && f.pagos ? (
          <div style={{ display: "grid", gap: 4, marginTop: 6, paddingTop: 6, borderTop: "1px dashed var(--line2)" }}>
            {f.pagos.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                <span style={{ color: "var(--muted2)", minWidth: 0 }}>{larga(p.fecha)} · {p.origen}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{plata(p.monto)}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "var(--muted2)" }}>
              {f.estado === "pagada" ? `Con eso completó los ${plata(f.valor)} de la ${unidad.toLowerCase()}.` : `Le faltan ${plata(f.valor - f.pagado)} para completarla.`}
            </div>
          </div>
        ) : undefined} />
    </div>
  );
}

function Calendario({ periodos, pagosPorDia, pagos, semanas, hoyISO, unidad, entregada }: {
  periodos: PeriodoCalendario[];
  pagosPorDia: Record<string, Array<{ id: string }>>;
  pagos: Pago[];
  semanas: SemanaDelLibro[];
  hoyISO: string;
  unidad: string;
  entregada: string | null;
}) {
  const primero = periodos[0]?.desde ?? entregada ?? hoyISO;
  const ultimo = periodos[periodos.length - 1]?.hasta ?? hoyISO;
  const [mes, setMes] = useState(() => { const d = d12(hoyISO); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [dia, setDia] = useState<string | null>(hoyISO);
  const minMes = (() => { const d = d12(primero); return new Date(d.getFullYear(), d.getMonth(), 1); })();
  const maxMes = (() => { const d = d12(ultimo); return new Date(d.getFullYear(), d.getMonth(), 1); })();

  const periodoDe = (f: string) => periodos.find(p => p.desde <= f && p.hasta >= f) ?? null;
  // A qué semana fue cada pago (cuando se sabe).
  const semanasDePago = useMemo(() => {
    const m = new Map<string, Array<{ numero: number; monto: number }>>();
    for (const s of semanas) for (const p of s.pagos ?? []) {
      const arr = m.get(p.pagoId) ?? [];
      arr.push({ numero: s.numero, monto: p.monto });
      m.set(p.pagoId, arr);
    }
    return m;
  }, [semanas]);

  const celdas: Array<string | null> = [];
  const lead = (mes.getDay() + 6) % 7; // la semana arranca el lunes
  for (let i = 0; i < lead; i++) celdas.push(null);
  const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= diasMes; d++) celdas.push(isoLocal(new Date(mes.getFullYear(), mes.getMonth(), d)));

  const puedeAtras = mes > minMes;
  const puedeAdelante = mes < maxMes;
  const mover = (n: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1));

  const pDia = dia ? periodoDe(dia) : null;
  const pagosDia = dia ? pagos.filter(p => p.fecha === dia && p.estado === "Confirmado") : [];
  // Solo lo que aparece en ESTE contrato: "Rodada" y "Sin fecha" no salen si no hay.
  const leyenda = ["pagada", "a_medias", "debe", "proxima", "falta", "rodada", "sin_dato", "dias_iniciales"]
    .filter(k => ["pagada", "a_medias", "debe", "proxima", "falta"].includes(k) || periodos.some(p => p.estado === k));

  return (
    <div style={{ ...card, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => mover(-1)} disabled={!puedeAtras} aria-label="Mes anterior"
          style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", color: "var(--text)", cursor: puedeAtras ? "pointer" : "not-allowed", opacity: puedeAtras ? 1 : 0.4 }}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", textTransform: "capitalize" }}>{MES_LARGO[mes.getMonth()]} {mes.getFullYear()}</div>
        <button onClick={() => mover(1)} disabled={!puedeAdelante} aria-label="Mes siguiente"
          style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", color: "var(--text)", cursor: puedeAdelante ? "pointer" : "not-allowed", opacity: puedeAdelante ? 1 : 0.4 }}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div role="grid" aria-label={`Calendario de ${MES_LARGO[mes.getMonth()]}`} style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--muted2)", paddingBottom: 2 }}>{d}</div>
        ))}
        {celdas.map((f, i) => {
          if (!f) return <div key={i} />;
          const p = periodoDe(f);
          const tono = p ? TONO[p.estado] : null;
          const pago = !!pagosPorDia[f];
          const sel = dia === f;
          return (
            <button key={i} onClick={() => setDia(f)} aria-pressed={sel}
              aria-label={`${larga(f)}${p ? `, ${tono!.etiqueta.toLowerCase()}` : ""}${pago ? ", hubo pago" : ""}`}
              style={{ aspectRatio: "1", minHeight: 36, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: f === hoyISO ? 700 : 500, fontVariantNumeric: "tabular-nums",
                background: tono?.fondo ?? "transparent", color: tono?.tinta ?? "var(--muted2)",
                border: sel ? "2px solid var(--text)" : f === hoyISO ? "2px solid var(--accent)" : "1px solid transparent", padding: 0 }}>
              {d12(f).getDate()}
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: pago ? "currentColor" : "transparent" }} />
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {leyenda.map(k => <Etiqueta key={k} tono={TONO[k]} />)}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--muted2)" }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text)" }} /> hubo pago ese día
        </span>
      </div>

      {dia && (
        <div style={{ borderRadius: 12, padding: 12, background: "var(--soft2)", border: "1px solid var(--line)", display: "grid", gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", textTransform: "capitalize" }}>{larga(dia)}</div>
          <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>
            {pDia
              ? pDia.estado === "rodada" ? `Moto guardada: esta ${unidad.toLowerCase()} se rodó al final del contrato.`
              : pDia.estado === "dias_iniciales" ? "Días iniciales: desde la entrega hasta el primer día de pago."
              : pDia.estado === "sin_dato" ? "No se sabe con certeza a qué semana corresponde este día."
              : `Este día es de la ${unidad.toLowerCase()} ${pDia.numero} (${rango(pDia.desde, pDia.hasta)}) · ${TONO[pDia.estado].etiqueta.toLowerCase()}.`
              : "Fuera del contrato."}
          </div>
          {pagosDia.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--muted2)" }}>Ese día no hubo pagos.</div>
          ) : pagosDia.map(p => {
            const fue = semanasDePago.get(p.id) ?? [];
            const otras = desglosarPago(p).filter(l => !l.interno && (fue.length === 0 || l.k !== "Cubrió cuota del período"));
            return (
              <div key={p.id} style={{ display: "grid", gap: 3, paddingTop: 6, borderTop: "1px dashed var(--line2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>Pagó {plata(p.valor)}</span>
                  <span style={{ color: "var(--muted2)" }}>{p.tipo_registro === "adelanto_base" ? "Semana adelantada de la base" : p.tipo_registro === "saldo_favor" ? "Saldo a favor" : p.metodo}</span>
                </div>
                {fue.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                    <span style={{ color: "var(--muted2)" }}>Fue a la {unidad.toLowerCase()} {s.numero}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{plata(s.monto)}</span>
                  </div>
                ))}
                {otras.map((l, i) => (
                  <div key={`o${i}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                    <span style={{ color: "var(--muted2)" }}>{l.k}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{l.v}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
