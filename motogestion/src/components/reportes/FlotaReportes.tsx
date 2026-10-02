// FLOTA (rediseño aprobado por el dueño el 2-oct-2026, docs/REDISENO-REPORTES.md · D-033/034).
//
// Motos: dónde está cada una (la misma cuenta del Resumen y de los portafolios), cuántas trabajan por
// grupo, los clientes, los papeles y lo que hay que corregir en los datos. Guardadas: las que están en
// la empresa sin trabajar, de la que más días lleva a la que menos. Solo pinta: las cuentas las arma
// ReportesView. Todo número se toca (`onAbrir`).
import { useState } from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";
import type { LugarMoto } from "../../utils/reportesFlota";
import { Tarjeta, boton, pct } from "./ResumenReportes";
import { DondeEstanLasMotos } from "./PortafoliosReportes";
import { ListBox, ItemLista } from "../ListaEstandar";

const fila: React.CSSProperties = { ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 16px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10 };

export function FlotaMotos(p: {
  total: number;
  lugares: Record<LugarMoto, number>;
  grupos: Array<{ grupo: string; color: string; total: number; trabajando: number }>;
  clientes: { conContrato: number; enTramite: number; nuevosMes: number };
  papeles: { vencidos: number; porVencer: number; sinSoat: number };
  activosSinContrato: number;
  estadosSistema: Array<[string, number]>;
  /** clave: "lugar:<lugar>" · "grupo:<grupo>" · "clientes:<con|tramite|nuevos>" · "papeles:<vencidos|porvencer|sinsoat>" · "activos-sin-contrato" */
  onAbrir: (clave: string) => void;
}) {
  const [verEstados, setVerEstados] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      <DondeEstanLasMotos titulo={`Dónde están las ${p.total} motos · hoy`} total={p.total} lugares={p.lugares} onAbrir={p.onAbrir} />

      <Tarjeta titulo="Por grupo"
        ayuda="Cuántas motos tiene cada portafolio y cuántas están trabajando con un cliente. Sin trabajar: retenidas, en el taller o disponibles sin cliente. Toca un grupo para ver sus motos.">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 48px 72px 64px", gap: 8, padding: "0 4px 4px", fontSize: 11, color: "var(--muted2)" }} aria-hidden="true">
          <span>Grupo</span><span style={{ textAlign: "right" }}>Motos</span><span style={{ textAlign: "right" }}>Trabajando</span><span style={{ textAlign: "right" }}>Sin trabajar</span>
        </div>
        {p.grupos.map(g => (
          <button key={g.grupo} onClick={() => p.onAbrir("grupo:" + g.grupo)} aria-label={`${g.grupo}: ${g.total} motos, ${g.trabajando} trabajando. Ver sus motos`}
            style={{ ...boton, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 48px 72px 64px", gap: 8, alignItems: "center", minHeight: 44, padding: "0 4px", borderRadius: 10, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} aria-hidden="true" />{g.grupo}
            </span>
            <span style={{ textAlign: "right" }}>{g.total}</span>
            <span style={{ textAlign: "right" }}>{g.trabajando} <span style={{ fontSize: 11, color: "var(--muted2)" }}>{pct(g.trabajando, g.total)}%</span></span>
            <span style={{ textAlign: "right", color: g.total - g.trabajando > 0 ? "var(--warn-ink)" : "var(--muted2)" }}>{g.total - g.trabajando}</span>
          </button>
        ))}
      </Tarjeta>

      <Tarjeta titulo="Clientes"
        ayuda="Con contrato: tienen un contrato activo o con la moto retenida. En trámite: registrados o aprobados que todavía no tienen moto. Nuevos en el mes: registrados desde el día 1 de este mes.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {([["con", "con contrato", p.clientes.conContrato], ["tramite", "en trámite", p.clientes.enTramite], ["nuevos", "nuevos en el mes", p.clientes.nuevosMes]] as const).map(([k, t, n]) => (
            <button key={k} onClick={() => p.onAbrir("clientes:" + k)} aria-label={`${n} ${t}. Ver la lista`}
              style={{ ...boton, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--line)", minHeight: 56 }}>
              <span style={{ display: "block", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}</span>
              <span style={{ display: "block", fontSize: 11, color: "var(--muted2)" }}>{t}</span>
            </button>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Papeles de las motos"
        ayuda="SOAT y tecnomecánica vencidos o que vencen en los próximos 30 días, y las motos que no tienen fecha de SOAT anotada. Una moto sin papeles al día no puede circular.">
        {[
          { k: "papeles:vencidos", t: "Con SOAT o tecnomecánica vencidos", n: p.papeles.vencidos, color: "var(--bad-ink)" },
          { k: "papeles:porvencer", t: "Vencen en los próximos 30 días", n: p.papeles.porVencer, color: "var(--warn-ink)" },
          { k: "papeles:sinsoat", t: "Sin fecha de SOAT anotada", n: p.papeles.sinSoat, color: "var(--warn-ink)" },
        ].map(x => (
          <button key={x.k} onClick={() => p.onAbrir(x.k)} aria-label={`${x.t}: ${x.n}. Ver cuáles`} style={fila}>
            <span style={{ fontSize: 13 }}>{x.t}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: x.n > 0 ? x.color : "var(--muted2)", fontVariantNumeric: "tabular-nums" }}>{x.n}</span>
            <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" />
          </button>
        ))}
      </Tarjeta>

      {p.activosSinContrato > 0 && (
        <section style={{ background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--warn-ink)", marginBottom: 4 }}>
            <AlertTriangle size={16} aria-hidden="true" /> Para corregir en los datos
          </div>
          <button onClick={() => p.onAbrir("activos-sin-contrato")} style={{ ...fila, color: "var(--warn-ink)" }}>
            <span style={{ fontSize: 13 }}>Clientes marcados "activos" sin ningún contrato vigente</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{p.activosSinContrato}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>
      )}

      {/* El estado tal como lo guarda el sistema: para la oficina, no para el directivo. Se conserva
          (estaba en la pantalla vieja) pero plegado. */}
      <section style={{ border: "1px solid var(--line)", borderRadius: 16, padding: "4px 16px" }}>
        <button onClick={() => setVerEstados(v => !v)} aria-expanded={verEstados} style={{ ...fila, gridTemplateColumns: "minmax(0, 1fr) 16px" }}>
          <span style={{ fontSize: 12, color: "var(--muted2)" }}>Estado de cada moto tal como lo guarda el sistema</span>
          <ChevronRight size={16} color="var(--muted2)" aria-hidden="true" style={{ transform: verEstados ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        </button>
        {verEstados && (
          <div style={{ display: "grid", gap: 2, paddingBottom: 8 }}>
            {p.estadosSistema.map(([estado, n]) => (
              <div key={estado} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 4px" }}>
                <span style={{ color: "var(--muted2)" }}>{estado}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{n} <span style={{ fontSize: 11, color: "var(--muted2)" }}>{pct(n, p.total)}%</span></span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export type MotoQuieta = {
  motoId: string; placa: string; grupo: string; lugar: LugarMoto;
  donde: string; motivo: string; clienteNombre: string; contratoId: string | null;
  subadminNombre: string; desde: string | null; dias: number | null;
};

const ETIQUETA_LUGAR_CORTA: Partial<Record<LugarMoto, string>> = {
  retenida: "Por no pagar", tallerConCliente: "Taller con cliente", tallerSinCliente: "Taller sin cliente",
};

export function FlotaGuardadas(p: {
  isMobile: boolean;
  lista: MotoQuieta[];
  onFicha: (m: MotoQuieta) => void;
  onInmovilizaciones?: () => void;
  onDescargar?: () => void;
}) {
  const [filtro, setFiltro] = useState<LugarMoto | null>(null);
  const [tramo, setTramo] = useState<string | null>(null);
  const tramoDe = (d: number | null) => d === null ? "sin" : d <= 7 ? "1-7" : d <= 30 ? "8-30" : "31+";
  const conDias = p.lista.filter(m => m.dias !== null);
  const totalDias = conDias.reduce((s, m) => s + (m.dias ?? 0), 0);
  const porLugar = (l: LugarMoto) => p.lista.filter(m => m.lugar === l).length;
  const TRAMOS: Array<[string, string]> = [["1-7", "1 a 7 días"], ["8-30", "8 a 30 días"], ["31+", "más de 30 días"], ["sin", "sin fecha de entrada"]];
  const visibles = p.lista
    .filter(m => (!filtro || m.lugar === filtro) && (!tramo || tramoDe(m.dias) === tramo))
    .slice().sort((a, b) => (b.dias ?? -1) - (a.dias ?? -1));
  const chip = (activo: boolean): React.CSSProperties => ({
    minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: activo ? 600 : 500,
    border: "1px solid " + (activo ? "var(--accent-line)" : "var(--line2)"), background: activo ? "var(--accent-soft)" : "transparent", color: activo ? "var(--accent-ink)" : "var(--text)",
  });

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)", textAlign: "left" }}>
      <Tarjeta titulo="Motos guardadas en la empresa · hoy"
        ayuda="Las motos que están en la empresa sin trabajar: retenidas por no pagar (en el parqueadero o en el taller) y las que están en el taller con o sin cliente. Los días se cuentan desde que entraron, según la recepción registrada; si no hay recepción, no se inventa la fecha. Toca un recuadro o un tramo para filtrar la lista.">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.lista.length} motos</span>
          <span style={{ fontSize: 12, color: "var(--muted2)" }}>{totalDias.toLocaleString("es-CO")} días acumulados sin trabajar</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
          {(["retenida", "tallerConCliente", "tallerSinCliente"] as LugarMoto[]).map(l => {
            const activo = filtro === l;
            const tono = l === "retenida" ? { ink: "var(--bad-ink)", borde: "var(--bad-line)" } : l === "tallerConCliente" ? { ink: "var(--warn-ink)", borde: "var(--warn-line)" } : { ink: "var(--muted2)", borde: "var(--line2)" };
            return (
              <button key={l} onClick={() => setFiltro(activo ? null : l)} aria-pressed={activo}
                style={{ ...boton, padding: "8px 10px", borderRadius: 10, border: `1px solid ${activo ? "var(--accent-line)" : tono.borde}`, background: activo ? "var(--accent-soft)" : "transparent", minHeight: 56 }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: tono.ink }}>{ETIQUETA_LUGAR_CORTA[l]}</span>
                <span style={{ display: "block", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{porLugar(l)}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {TRAMOS.map(([k, t]) => {
            const n = p.lista.filter(m => tramoDe(m.dias) === k).length;
            if (n === 0) return null;
            return <button key={k} onClick={() => setTramo(tramo === k ? null : k)} aria-pressed={tramo === k} style={chip(tramo === k)}>{t} · {n}</button>;
          })}
        </div>
      </Tarjeta>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {p.onInmovilizaciones && (
          <button onClick={p.onInmovilizaciones} style={{ ...boton, width: "auto", flex: "1 1 160px", minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            Abrir Inmovilizaciones
          </button>
        )}
        {p.onDescargar && (
          <button onClick={p.onDescargar} style={{ ...boton, width: "auto", flex: "1 1 160px", minHeight: 44, borderRadius: 10, border: "1px solid var(--line2)", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            Descargar Excel
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--muted2)", padding: 12 }}>No hay motos guardadas con ese filtro.</div>
      ) : (
        <ListBox isMobile={p.isMobile}>
          {visibles.map(m => (
            <ItemLista key={m.motoId} placa={m.placa} grupo={m.grupo}
              titulo={m.clienteNombre}
              subtitulo={`${m.motivo || ETIQUETA_LUGAR_CORTA[m.lugar]} · ${m.donde}${m.desde ? ` · desde el ${new Date(m.desde.slice(0, 10) + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}` : ""} · ${m.subadminNombre}`}
              right={<span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", color: m.dias === null ? "var(--muted2)" : m.dias > 30 ? "var(--bad-ink)" : "var(--text)" }}>{m.dias === null ? "sin fecha" : `${m.dias} días`}</span>}
              rielColor={m.lugar === "retenida" ? "var(--bad)" : m.lugar === "tallerConCliente" ? "var(--warn)" : "var(--orange)"}
              onClick={() => p.onFicha(m)} />
          ))}
        </ListBox>
      )}
    </div>
  );
}
