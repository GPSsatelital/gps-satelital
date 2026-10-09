// La lista "Referidos por fecha" y el bloque "Los trajo el equipo" de la pantalla de Referidos
// (pedido del dueño, 9-oct-2026). La cuenta vive en `utils/referidosPorFecha.ts`.
import { useMemo, useState, type ReactNode } from "react";
import { CalendarDays, UserRound, UsersRound } from "lucide-react";
import { ListBox, ItemLista } from "./ListaEstandar";
import { inputStyle } from "../styles/shared";
import { fechaISO, hoyISO } from "../utils/fecha";
import { useSubadmins } from "../hooks/useSubadmins";
import {
  filasReferidos, filtrarReferidos, resumenReferidos, equipoPorPersona, rangoDelPeriodo,
  type ContarPor, type PeriodoReferidos, type QuienLoTrajo, type FilaReferido,
  type ClienteReferido, type ContratoReferido,
} from "../utils/referidosPorFecha";

const PERIODOS: { valor: PeriodoReferidos; etiqueta: string }[] = [
  { valor: "mes", etiqueta: "Este mes" },
  { valor: "mes_anterior", etiqueta: "Mes pasado" },
  { valor: "ult30", etiqueta: "Últimos 30 días" },
  { valor: "anio", etiqueta: "Este año" },
  { valor: "personalizado", etiqueta: "Escoger fechas" },
];

const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const corta = (f: string) => { const d = new Date(f + "T12:00:00"); return `${d.getDate()} ${MES[d.getMonth()]}`; };
const conAnio = (f: string) => { const d = new Date(f + "T12:00:00"); return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`; };
/** El año solo si no es el de hoy. */
const fechaCorta = (f: string, hoy: string) => (f.slice(0, 4) === hoy.slice(0, 4) ? corta(f) : conAnio(f));

// El morado solo no alcanza 4,5:1 sobre su fondo en modo día: se mezcla con el color del texto
// (mismo arreglo que "Rodada" en el libro de semanas).
const TONO = {
  equipo: { fondo: "color-mix(in srgb, var(--violet) 14%, transparent)", tinta: "color-mix(in srgb, var(--violet) 72%, var(--text))", riel: "var(--violet)" },
  cliente: { fondo: "var(--ok-soft)", tinta: "var(--ok-ink)", riel: "var(--ok)" },
};

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, minHeight: 32, padding: "4px 12px", borderRadius: 999,
        border: `1px solid ${activo ? "var(--accent-line)" : "var(--line2)"}`,
        background: activo ? "var(--accent-soft)" : "var(--card)", color: activo ? "var(--accent-ink)" : "var(--muted2)",
        fontSize: 12, fontWeight: activo ? 700 : 500, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );
}

function Fila({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={titulo} style={{ display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{titulo}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div style={{ flex: "1 1 96px", minWidth: 0, background: "var(--soft2)", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 12px", boxSizing: "border-box" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>{etiqueta}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{valor}</div>
    </div>
  );
}

function Etiqueta({ origen }: { origen: FilaReferido["origen"] }) {
  const t = TONO[origen];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, background: t.fondo, color: t.tinta, whiteSpace: "nowrap" }}>
      {origen === "equipo" ? "Equipo" : "Cliente"}
    </span>
  );
}

// textAlign: #root centra el texto de toda la app (index.css); una lista se lee alineada a la izquierda.
const tarjeta = { background: "var(--card)", borderRadius: 16, padding: "16px 20px", border: "1px solid var(--line)", marginBottom: 20, display: "grid", gap: 12, textAlign: "left" } as const;

export default function ReferidosPorFecha({ clientes, contratos, isMobile }: {
  clientes: ClienteReferido[];
  contratos: ContratoReferido[];
  isMobile: boolean;
}) {
  const { subadmins } = useSubadmins();
  const hoy = hoyISO();
  const [contarPor, setContarPor] = useState<ContarPor>("moto");
  const [periodo, setPeriodo] = useState<PeriodoReferidos>("mes");
  const [propio, setPropio] = useState({ desde: hoy.slice(0, 8) + "01", hasta: hoy });
  const [quien, setQuien] = useState<QuienLoTrajo>("todos");

  const filas = useMemo(
    () => filasReferidos(clientes, contratos, id => subadmins.find(s => s.id === id)?.nombre ?? null, ts => fechaISO(new Date(ts))),
    [clientes, contratos, subadmins],
  );
  const equipo = useMemo(() => equipoPorPersona(filas), [filas]);
  const { desde, hasta } = rangoDelPeriodo(periodo, hoy, propio);
  const lista = useMemo(() => filtrarReferidos(filas, { contarPor, desde, hasta, quien }), [filas, contarPor, desde, hasta, quien]);
  const resumen = resumenReferidos(lista);

  const textoVacio = contarPor === "moto"
    ? "Nadie recibió la moto como referido en estas fechas. Pruebe con otro período o con «Se registró»."
    : "Nadie se registró como referido en estas fechas. Pruebe con otro período.";

  return (
    <>
      <section aria-labelledby="ref-fecha-titulo" style={tarjeta}>
        <div>
          {/* scrollMarginTop: al llegar desde "Los trajo el equipo", que no quede debajo de la barra de arriba. */}
          <h3 id="ref-fecha-titulo" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)", scrollMarginTop: 96 }}>Referidos por fecha</h3>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Del {conAnio(desde)} al {conAnio(hasta)}
          </div>
        </div>

        <Fila titulo="Contar por">
          <Chip activo={contarPor === "moto"} onClick={() => setContarPor("moto")}>Recibió la moto</Chip>
          <Chip activo={contarPor === "registro"} onClick={() => setContarPor("registro")}>Se registró</Chip>
        </Fila>

        <Fila titulo="Período">
          {PERIODOS.map(p => (
            <Chip key={p.valor} activo={periodo === p.valor} onClick={() => setPeriodo(p.valor)}>
              {p.valor === "personalizado" && <CalendarDays size={14} aria-hidden="true" />}{p.etiqueta}
            </Chip>
          ))}
        </Fila>
        {periodo === "personalizado" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label style={{ flex: "1 1 140px", minWidth: 0, display: "grid", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
              Desde
              <input type="date" value={propio.desde} max={hoy} onChange={e => e.target.value && setPropio(p => ({ ...p, desde: e.target.value }))} style={{ ...inputStyle, boxSizing: "border-box", width: "100%" }} />
            </label>
            <label style={{ flex: "1 1 140px", minWidth: 0, display: "grid", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
              Hasta
              <input type="date" value={propio.hasta} max={hoy} onChange={e => e.target.value && setPropio(p => ({ ...p, hasta: e.target.value }))} style={{ ...inputStyle, boxSizing: "border-box", width: "100%" }} />
            </label>
          </div>
        )}

        <Fila titulo="Quién lo trajo">
          <Chip activo={quien === "todos"} onClick={() => setQuien("todos")}>Todos</Chip>
          <Chip activo={quien === "clientes"} onClick={() => setQuien("clientes")}><UserRound size={14} aria-hidden="true" />Clientes</Chip>
          <Chip activo={quien === "equipo"} onClick={() => setQuien("equipo")}><UsersRound size={14} aria-hidden="true" />Equipo</Chip>
          {equipo.map(p => (
            <Chip key={p.id} activo={quien === p.id} onClick={() => setQuien(p.id)}>
              <span style={{ textTransform: "uppercase" }}>{p.nombre}</span>
            </Chip>
          ))}
        </Fila>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Cifra etiqueta="Referidos" valor={resumen.total} />
          <Cifra etiqueta="Del equipo" valor={resumen.equipo} />
          <Cifra etiqueta="De clientes" valor={resumen.clientes} />
        </div>

        {lista.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)", fontSize: 13, lineHeight: 1.5 }}>{textoVacio}</div>
        ) : (
          <ListBox isMobile={isMobile}>
            {lista.map(f => (
              <ItemLista key={f.clienteId} titulo={f.nombre} tituloCompleto rielColor={TONO[f.origen].riel}
                subtitulo={
                  <>
                    <span style={{ display: "block" }}>
                      {f.origen === "equipo" ? "Lo trajo " : "Lo refirió "}
                      <span style={{ textTransform: "uppercase" }}>{f.quien}</span>
                      {f.origen === "equipo" ? " · se paga en la nómina" : ""}
                    </span>
                    <span style={{ display: "block" }}>
                      Se registró el {fechaCorta(f.registro, hoy)} · {f.recibioMoto
                        ? `recibió la moto el ${fechaCorta(f.recibioMoto, hoy)}`
                        : f.conMoto ? "recibió la moto (sin fecha anotada)" : "todavía sin moto"}
                    </span>
                  </>
                }
                right={<Etiqueta origen={f.origen} />} />
            ))}
          </ListBox>
        )}
      </section>

      {equipo.length > 0 && (
        <section aria-labelledby="ref-equipo-titulo" style={tarjeta}>
          <div>
            <h3 id="ref-equipo-titulo" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Los trajo el equipo</h3>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
              No cuentan para premios: se pagan en la nómina, como las visitas. Desde siempre.
            </div>
          </div>
          <ListBox isMobile={isMobile}>
            {equipo.map(p => (
              <ItemLista key={p.id} titulo={p.nombre} tituloCompleto rielColor={TONO.equipo.riel}
                subtitulo={`${p.conMoto} ya con moto`}
                onClick={() => { setQuien(p.id); document.getElementById("ref-fecha-titulo")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                right={<span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{p.traidos} {p.traidos === 1 ? "traído" : "traídos"}</span>} />
            ))}
          </ListBox>
        </section>
      )}
    </>
  );
}
