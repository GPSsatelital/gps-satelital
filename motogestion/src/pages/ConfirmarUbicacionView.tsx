import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useSubadmins } from "../hooks/useSubadmins";
import {
  useConfirmacionesUbicacion, pasoDe, tareaDe, avisarCambio,
  type ConfirmacionUbicacion, type PasoConfirmacion, type TareaConfirmacion,
} from "../hooks/useConfirmacionesUbicacion";
import { ListBox, ItemLista } from "../components/ListaEstandar";
import ModalRegistrarGuardado from "../components/ModalRegistrarGuardado";
import { card, fmtMoney } from "../styles/shared";
import { VALOR_VISITA, diaColombia, lunesDe } from "../utils/nominaCobradores";
import { diasEsperando, textoPedirConfirmacion } from "../utils/confirmacionUbicacion";
import { normalizarWhatsapp, urlWaMe, nombreCorto } from "../utils/mensajeria";
import { hoyISO } from "../utils/fecha";

// 📍 CONFIRMAR UBICACIÓN (D-094, regla del dueño, 19-nov-2026).
//
// Desde las motos entregadas el 19-nov, dónde duerme la moto lo confirma QUIEN HIZO LA VISITA: mira
// en el GPS dónde durmió y marca ✓, o ✗ y va a documentar el sitio real. De eso depende que le
// paguen los $40.000 de la visita, en la semana en que confirma (`nominaCobradores.ts`).
//
// La excepción es el auxiliar administrativo (D-095, mig 226): no tiene el GPS de la moto, así que
// sus visitas las confirma el SUPERVISOR DE ESA MOTO, en un recuadro aparte de las suyas para que no
// se confundan («se le pagan a él»). Si el supervisor marca ✗, se le devuelve al auxiliar para que
// vaya al sitio real y lo documente. El auxiliar ve a quién esperar y puede pedírsela por WhatsApp.
//
// La misma pantalla se lee distinto según el puesto:
//   · El que visitó (SUBADMIN): las suyas, con los botones; y aparte, las del auxiliar que le toca
//     confirmar porque la moto es suya.
//   · El auxiliar: las suyas, sin ✓/✗: quién la confirma, desde cuándo espera, y su botón de pedir.
//   · ADMIN y ADMIN_PRINCIPAL: las de todos, sin botones (salvo las del auxiliar en una moto sin
//     supervisor), para revisar que se estén haciendo y que lo que ponen sea cierto. Y abajo, las
//     viejas que le quedan a cada supervisor (mig 145).

function useIsMobile() {
  const [v, setV] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setV(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

/** «lun 16 nov» */
function diaCorto(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Bogota" })
    .replace(/[.,]/g, "");
}

/** «la semana del 23 al 29 nov» */
function semanaDePago(ts: string): string {
  const lunes = lunesDe(diaColombia(ts));
  const dom = new Date(lunes + "T12:00:00");
  dom.setDate(dom.getDate() + 6);
  const mes = (d: Date) => d.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
  const l = new Date(lunes + "T12:00:00");
  return mes(l) === mes(dom)
    ? `la semana del ${l.getDate()} al ${dom.getDate()} ${mes(dom)}`
    : `la semana del ${l.getDate()} ${mes(l)} al ${dom.getDate()} ${mes(dom)}`;
}

const RIEL: Record<PasoConfirmacion, string> = {
  por_confirmar: "var(--warn-ink)",
  falta_sitio: "var(--bad-ink)",
  confirmada: "var(--ok-ink)",
};

const chip = (activo: boolean): React.CSSProperties => ({
  padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
  border: `1px solid ${activo ? "var(--accent)" : "var(--line2)"}`,
  background: activo ? "var(--accent-soft)" : "var(--card)",
  color: activo ? "var(--accent-ink)" : "var(--muted2)",
});

const btn = (fondo: string, procesando: boolean): React.CSSProperties => ({
  padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600,
  background: fondo, color: "var(--card)", cursor: procesando ? "not-allowed" : "pointer",
  opacity: procesando ? 0.6 : 1,
});

const enlace: React.CSSProperties = { color: "var(--accent)", fontWeight: 600 };

export default function ConfirmarUbicacionView() {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const esJefe = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  const { filas, cargando, error, confirmar } = useConfirmacionesUbicacion();
  const { nombreSubadmin } = useSubadmins();

  const [ver, setVer] = useState<"por_hacer" | "hechas">("por_hacer");
  const [procesando, setProcesando] = useState<string | null>(null);
  const [documentar, setDocumentar] = useState<ConfirmacionUbicacion | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const yo = profile?.id ?? null;
  const esAuxiliar = profile?.role === "AUXILIAR";
  const hoy = hoyISO();
  const conPaso = useMemo(
    () => filas.map(f => ({ f, paso: pasoDe(f), tarea: tareaDe(f, yo, esJefe) })),
    [filas, yo, esJefe],
  );
  // Al jefe, «Por hacer» es todo lo que no está confirmado. A los demás, lo que les toca a ellos o
  // lo suyo que espera a otro: la visita del auxiliar que el supervisor ya marcó ✗ pasa a sus
  // «Hechas» (lo que falta es de él, ir al sitio).
  const porHacer = conPaso.filter(x => esJefe ? x.paso !== "confirmada" : x.tarea !== null);
  const hechas = conPaso.filter(x => esJefe ? x.paso === "confirmada" : x.tarea === null);
  const tareas = porHacer.filter(x => x.tarea === "confirmar" || x.tarea === "documentar");
  const mias = conPaso.filter(x => x.paso !== "confirmada" && x.f.visitador_id === yo);
  const lista = ver === "por_hacer" ? porHacer : hechas;
  // Lo del auxiliar va aparte de lo propio, para que no se confunda de quién es la plata.
  const deOtros = esJefe ? [] : lista.filter(x => x.f.visitador_id !== yo);
  const propias = esJefe ? lista : lista.filter(x => x.f.visitador_id === yo);
  const nombresDeOtros = [...new Set(deOtros.map(x => (x.f.visitador ?? "").toUpperCase()).filter(Boolean))];

  // Para el jefe: las visitas del auxiliar que siguen sin confirmar, por quién las tiene que confirmar.
  const delAuxiliar = useMemo(() => {
    const m = new Map<string, { quien: string; de: Set<string>; n: number; masVieja: number }>();
    for (const { f, paso } of conPaso) {
      if (!f.lo_confirma_supervisor || paso !== "por_confirmar") continue;
      const k = f.confirma_id ?? "";
      if (!m.has(k)) m.set(k, { quien: f.confirma ?? "Sin supervisor: la confirman ustedes", de: new Set(), n: 0, masVieja: 0 });
      const r = m.get(k)!;
      r.n++;
      r.de.add((f.visitador ?? "—").toUpperCase());
      r.masVieja = Math.max(r.masVieja, diasEsperando(f.fecha_entrega, hoy));
    }
    return [...m.values()].sort((a, b) => b.n - a.n || b.masVieja - a.masVieja);
  }, [conPaso, hoy]);

  // Lo de cada persona, para el jefe: cuánto confirmó, cuánto le falta.
  const porPersona = useMemo(() => {
    const m = new Map<string, { nombre: string; confirmadas: number; porConfirmar: number; faltaSitio: number }>();
    for (const { f, paso } of conPaso) {
      const k = f.visitador_id;
      if (!m.has(k)) m.set(k, { nombre: f.visitador ?? "—", confirmadas: 0, porConfirmar: 0, faltaSitio: 0 });
      const r = m.get(k)!;
      if (paso === "confirmada") r.confirmadas++;
      else if (paso === "falta_sitio") r.faltaSitio++;
      else r.porConfirmar++;
    }
    return [...m.values()].sort((a, b) => (b.porConfirmar + b.faltaSitio) - (a.porConfirmar + a.faltaSitio) || a.nombre.localeCompare(b.nombre));
  }, [conPaso]);

  // Las viejas (entregadas antes del 19-nov) que le quedan a cada supervisor: siguen en su cupo de
  // 5 por día. Solo para el jefe, que es quien revisa que se estén moviendo.
  const [viejas, setViejas] = useState<{ subadmin_id: string | null; n: number }[]>([]);
  useEffect(() => {
    if (!esJefe) return;
    let vivo = true;
    (async () => {
      const { data } = await supabase.from("validar_ubicacion_cola").select("subadmin_id").range(0, 1999);
      if (!vivo || !data) return;
      const m = new Map<string | null, number>();
      for (const r of data as { subadmin_id: string | null }[]) m.set(r.subadmin_id, (m.get(r.subadmin_id) ?? 0) + 1);
      setViejas([...m.entries()].map(([subadmin_id, n]) => ({ subadmin_id, n })).sort((a, b) => b.n - a.n));
    })();
    return () => { vivo = false; };
  }, [esJefe]);

  function aviso(t: string) { setMsg(t); setTimeout(() => setMsg(null), 5000); }

  async function marcar(f: ConfirmacionUbicacion, resultado: "coincide" | "no_coincide") {
    if (procesando) return;
    // La visita de otro (el auxiliar): la plata es de él, y si no coincide va él al sitio (D-095).
    const deOtro = f.visitador_id !== yo;
    const quien = (f.visitador ?? "quien hizo la visita").toUpperCase();
    const pregunta = resultado === "coincide"
      ? `¿Revisaste en el GPS que la ${f.placa ?? "moto"} durmió donde dijo el cliente? Esto no se puede cambiar después.`
        + (deOtro ? ` Los ${fmtMoney(VALOR_VISITA)} de la visita son de ${quien}.` : "")
      : deOtro
        ? `¿La ${f.placa ?? "moto"} NO durmió donde dijo el cliente? Se le devuelve a ${quien} para que vaya al sitio real y lo documente. Esto no se puede cambiar después.`
        : `¿La ${f.placa ?? "moto"} NO durmió donde dijo el cliente? Después tienes que ir al sitio real y documentarlo para que te paguen la visita.`;
    if (!window.confirm(pregunta)) return;
    setProcesando(f.contrato_id);
    try {
      const { error: e } = await confirmar(f.contrato_id, resultado);
      if (e) { aviso("No se pudo guardar: " + e); return; }
      if (resultado === "no_coincide") {
        if (deOtro) aviso(`Listo. Se le devolvió a ${quien} para que vaya al sitio real y lo documente.`);
        else setDocumentar(f);
      } else {
        aviso(deOtro
          ? `Listo. Los ${fmtMoney(VALOR_VISITA)} de la visita van en la nómina de ${quien} de esta semana.`
          : `Listo. Los ${fmtMoney(VALOR_VISITA)} de la visita van en tu nómina de esta semana.`);
      }
    } finally {
      setProcesando(null);
    }
  }

  // El auxiliar le pide al supervisor que la confirme: se abre SU WhatsApp con el mensaje escrito y
  // lo manda él. No guarda nada: la tarea ya le salió sola al supervisor al entregarse la moto.
  function pedir(f: ConfirmacionUbicacion) {
    const numero = normalizarWhatsapp(f.confirma_whatsapp);
    const aQuien = nombreCorto(f.confirma) || "supervisor";
    if (!numero) { aviso(`${aQuien.toUpperCase()} no tiene un WhatsApp válido en su usuario: pídesela en persona.`); return; }
    if (!window.confirm(`¿Le escribes a ${aQuien.toUpperCase()} por WhatsApp para pedirle que confirme la ${f.placa ?? "moto"}?`)) return;
    window.open(urlWaMe(numero, textoPedirConfirmacion(f, aQuien)), "_blank", "noopener");
  }

  function declarado(f: ConfirmacionUbicacion) {
    if (f.declaro_casa === "Sí") {
      return (
        <>Declaró que la guarda <strong>en su casa</strong>
          {f.casa && <>{" · "}<a href={`https://www.google.com/maps?q=${f.casa.lat},${f.casa.lng}`} target="_blank" rel="noreferrer" style={enlace}>Ver la casa en el mapa →</a></>}
        </>
      );
    }
    if (f.declaro_casa === "No") return <>Declaró que la guarda en: <strong>{f.donde_declarado || "otro lugar (sin especificar)"}</strong></>;
    return <span style={{ color: "var(--muted)" }}>La visita no dice dónde la guarda: mira en el GPS dónde duerme.</span>;
  }

  function sitioReal(f: ConfirmacionUbicacion) {
    const s = f.sitio;
    if (!s || (!s.direccion && s.lat == null)) return null;
    return (
      <div style={{ fontSize: 12, color: "var(--text)", background: "var(--card)", borderRadius: 8, padding: "8px 12px", minWidth: 0 }}>
        <strong>Sitio real:</strong> {s.direccion || "—"}{s.condiciones ? ` · ${s.condiciones}` : ""}
        {s.lat != null && s.lng != null && <>{" · "}<a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" style={enlace}>Ver en el mapa →</a></>}
        {s.encargado_nombre && <> · Encargado: <span style={{ textTransform: "uppercase" }}>{s.encargado_nombre}</span></>}
      </div>
    );
  }

  function estado(f: ConfirmacionUbicacion, paso: PasoConfirmacion, tarea: TareaConfirmacion) {
    const base: React.CSSProperties = { fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" };
    if (paso === "confirmada") {
      return <span style={{ ...base, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>
        {f.resultado === "no_coincide" ? "✓ Sitio documentado" : "✓ Coincide"} · {diaCorto(f.confirmada_en)}
      </span>;
    }
    const deOtro = f.visitador_id !== yo;
    if (paso === "falta_sitio") {
      return <span style={{ ...base, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>
        {!esJefe && deOtro ? "✗ Se le devolvió" : "✗ Falta ir al sitio"}
      </span>;
    }
    const texto = tarea === "confirmar" && deOtro ? "⏳ Por confirmar"
      : tarea === "esperar" ? "⏳ Esperando"
      : `${fmtMoney(VALOR_VISITA)} esperando`;
    return <span style={{ ...base, background: "var(--warn-soft)", color: "var(--warn-ink)" }}>{texto}</span>;
  }

  const hace = (n: number) => n === 0 ? "desde hoy" : n === 1 ? "hace 1 día" : `hace ${n} días`;

  // Quién la confirma, cuánto lleva esperando, y quién marcó qué: en las del auxiliar, para que se
  // sepa siempre de dónde viene cada paso.
  function rastroAuxiliar(f: ConfirmacionUbicacion, paso: PasoConfirmacion, tarea: TareaConfirmacion) {
    if (!f.lo_confirma_supervisor) return null;
    const visitador = (f.visitador ?? "—").toUpperCase();
    const marco = (f.marco ?? "").toUpperCase();
    const estilo: React.CSSProperties = { fontSize: 12, color: "var(--muted2)", minWidth: 0 };
    if (paso === "por_confirmar") {
      const n = diasEsperando(f.fecha_entrega, hoy);
      if (tarea === "confirmar" && f.visitador_id !== yo) {
        return <div style={estilo}>
          {f.confirma_id ? "La moto es tuya: mírala en el GPS." : "La moto no tiene supervisor: la confirman ustedes en el GPS."}
          {" "}Esperando {hace(n)}.
        </div>;
      }
      return <div style={estilo}>
        {f.confirma_id
          ? <>La confirma: <strong style={{ textTransform: "uppercase" }}>{f.confirma ?? "—"}</strong> (supervisor de la moto)</>
          : <>La confirma la administración (la moto no tiene supervisor)</>}
        {" · "}esperando {hace(n)}
      </div>;
    }
    if (paso === "falta_sitio") {
      return <div style={{ ...estilo, color: "var(--bad-ink)" }}>
        <strong style={{ textTransform: "uppercase" }}>{marco || "El supervisor"}</strong> marcó que NO duerme donde dijo el cliente
        {f.visitador_id === yo ? ": ve al sitio real y documéntalo." : <>: le toca a <strong>{visitador}</strong> ir al sitio real.</>}
      </div>;
    }
    if (f.resultado === "no_coincide") {
      return <div style={estilo}>
        <span style={{ textTransform: "uppercase" }}>{marco || "El supervisor"}</span> marcó ✗ y <span style={{ textTransform: "uppercase" }}>{visitador}</span> documentó el sitio real
      </div>;
    }
    return marco ? <div style={estilo}>La confirmó <span style={{ textTransform: "uppercase" }}>{marco}</span></div> : null;
  }

  function botones(f: ConfirmacionUbicacion, tarea: TareaConfirmacion) {
    const ocupado = procesando === f.contrato_id;
    if (tarea === "confirmar") {
      return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button disabled={ocupado} onClick={() => marcar(f, "coincide")} style={btn("var(--ok-ink)", ocupado)}>
            {ocupado ? "Guardando..." : "✓ Coincide"}
          </button>
          <button disabled={ocupado} onClick={() => marcar(f, "no_coincide")} style={btn("var(--bad-ink)", ocupado)}>
            {ocupado ? "Guardando..." : "✗ No coincide"}
          </button>
        </div>
      );
    }
    if (tarea === "documentar") {
      return (
        <div>
          <button onClick={() => setDocumentar(f)} style={btn("var(--accent-ink)", false)}>📍 Documentar el sitio real</button>
        </div>
      );
    }
    if (tarea === "esperar") {
      const aQuien = (nombreCorto(f.confirma) || "").toUpperCase();
      if (!f.confirma_id) return <div style={{ fontSize: 12, color: "var(--muted)" }}>Pídesela al administrador en persona.</div>;
      if (!normalizarWhatsapp(f.confirma_whatsapp)) {
        return <div style={{ fontSize: 12, color: "var(--muted)" }}>{aQuien || "El supervisor"} no tiene WhatsApp en su usuario: pídesela en persona.</div>;
      }
      return (
        <div>
          <button onClick={() => pedir(f)} style={btn("var(--accent-ink)", false)}>📲 Pedírsela a {aQuien}</button>
        </div>
      );
    }
    return null;
  }

  function fila({ f, paso, tarea }: { f: ConfirmacionUbicacion; paso: PasoConfirmacion; tarea: TareaConfirmacion }) {
    const deOtro = f.visitador_id !== yo;
    return (
      <ItemLista
        key={f.contrato_id}
        placa={f.placa ?? undefined}
        grupo={f.grupo}
        titulo={f.cliente}
        // En el celular la etiqueta de estado baja a su propio renglón: a la derecha se comía el
        // ancho y el nombre del cliente salía «CLIEN…» (visto al hacer el manual, 24-nov).
        tituloCompleto={isMobile}
        rielColor={RIEL[paso]}
        subtitulo={<>
          Visita del {diaCorto(f.visita_fecha)} · entregada el {diaCorto(f.fecha_entrega)}
          {/* Al supervisor, el título del recuadro ya dice de quién son; el nombre se repite solo si
              hay más de un auxiliar y hace falta saber cuál. */}
          {(esJefe || (deOtro && nombresDeOtros.length > 1)) && <> · <span style={{ textTransform: "uppercase" }}>{f.visitador ?? "—"}</span></>}
        </>}
        right={isMobile ? undefined : estado(f, paso, tarea)}
        extra={
          <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
            {isMobile && <div style={{ minWidth: 0 }}>{estado(f, paso, tarea)}</div>}
            <div style={{ fontSize: 12, color: "var(--text)", minWidth: 0 }}>{declarado(f)}</div>
            {sitioReal(f)}
            {rastroAuxiliar(f, paso, tarea)}
            {paso === "confirmada" && f.confirmada_en && (
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {fmtMoney(VALOR_VISITA)} en la nómina{deOtro ? <> de <span style={{ textTransform: "uppercase" }}>{f.visitador ?? "—"}</span></> : null} de {semanaDePago(f.confirmada_en)}
              </div>
            )}
            {botones(f, tarea)}
          </div>
        }
      />
    );
  }

  const plataEsperando = mias.length * VALOR_VISITA;
  // Las del auxiliar que le toca confirmar a este supervisor (para el encabezado, sin importar la pestaña).
  const otrasPorConfirmar = esJefe ? [] : tareas.filter(x => x.f.visitador_id !== yo);
  const nombresPorConfirmar = [...new Set(otrasPorConfirmar.map(x => (x.f.visitador ?? "").toUpperCase()).filter(Boolean))];
  const tituloCaja: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--muted2)", letterSpacing: 0.4, textTransform: "uppercase" };

  return (
    // minmax(0, 1fr): sin esto, el nombre largo de un cliente (va en una sola línea) ensancha la
    // columna y todas las tarjetas se salen del celular.
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16, minWidth: 0 }}>
      <div style={{ ...card, display: "grid", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📍 Confirmar ubicación</div>
        <div style={{ fontSize: 13, color: "var(--muted2)" }}>
          {esJefe
            ? "Las visitas de todo el equipo, de las motos entregadas desde el 19-nov. Cada quien confirma las suyas; las del auxiliar, el supervisor de la moto."
            : tareas.length > 0
              ? <>Tienes <strong>{tareas.length}</strong> por hacer{mias.length > 0 && <> · <strong>{fmtMoney(plataEsperando)}</strong> tuyos esperando</>}</>
              : mias.length > 0
                ? <>No tienes nada por hacer · <strong>{fmtMoney(plataEsperando)}</strong> esperando a que el supervisor confirme</>
                : "No tienes visitas por confirmar."}
        </div>
        {!esJefe && (esAuxiliar ? (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Tus visitas las confirma en el GPS el supervisor de cada moto: tú no marcas nada. Si se demora,
            pídesela con el botón. Si marca que no coincide, te vuelve a salir para que vayas al sitio real
            y lo documentes: ese día ganas los {fmtMoney(VALOR_VISITA)} de la visita.
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Mira en el GPS dónde durmió la moto y márcalo. Si no coincide, ve al sitio real y documéntalo:
            ese día ganas los {fmtMoney(VALOR_VISITA)} de la visita.
            {nombresPorConfirmar.length > 0 && <>
              {" "}Las de <strong>{nombresPorConfirmar.join(", ")}</strong> van aparte: las miras tú porque la moto
              es tuya, pero la plata es de él, y si no coincide va él al sitio.
            </>}
          </div>
        ))}
      </div>

      {esJefe && delAuxiliar.length > 0 && (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Las del auxiliar que esperan confirmación</div>
          {delAuxiliar.map(d => (
            <div key={d.quien} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12, minWidth: 0 }}>
              <span style={{ fontWeight: 600, textTransform: "uppercase", color: "var(--text)", flex: "1 1 140px", minWidth: 0 }}>{d.quien}</span>
              <span style={{ color: "var(--warn-ink)" }}>⏳ {d.n} de {[...d.de].join(", ")}</span>
              <span style={{ color: "var(--muted2)" }}>la más vieja {hace(d.masVieja)}</span>
            </div>
          ))}
        </div>
      )}

      {esJefe && porPersona.length > 0 && (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Cómo va cada uno</div>
          {porPersona.map(p => (
            <div key={p.nombre} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 12, minWidth: 0 }}>
              <span style={{ fontWeight: 600, textTransform: "uppercase", color: "var(--text)", flex: "1 1 140px", minWidth: 0 }}>{p.nombre}</span>
              <span style={{ color: "var(--ok-ink)" }}>✓ {p.confirmadas} confirmadas</span>
              <span style={{ color: "var(--warn-ink)" }}>⏳ {p.porConfirmar} por confirmar</span>
              {p.faltaSitio > 0 && <span style={{ color: "var(--bad-ink)" }}>✗ {p.faltaSitio} falta el sitio</span>}
            </div>
          ))}
        </div>
      )}

      {msg && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 13, fontWeight: 600 }}>{msg}</div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={chip(ver === "por_hacer")} onClick={() => setVer("por_hacer")}>Por hacer ({porHacer.length})</button>
        <button style={chip(ver === "hechas")} onClick={() => setVer("hechas")}>Hechas ({hechas.length})</button>
      </div>

      {error ? (
        <div style={{ ...card, color: "var(--bad-ink)", fontSize: 13 }}>No se pudo cargar la lista: {error}</div>
      ) : cargando ? (
        <div style={{ ...card, color: "var(--muted)", fontSize: 13 }}>Cargando…</div>
      ) : lista.length === 0 ? (
        <div style={{ ...card, color: "var(--muted)", fontSize: 13 }}>
          {ver === "por_hacer" ? "Nada por confirmar." : "Todavía no hay confirmaciones."}
        </div>
      ) : deOtros.length === 0 ? (
        <ListBox isMobile={isMobile}>{lista.map(fila)}</ListBox>
      ) : (
        <>
          {/* minmax(0, 1fr) también acá: cada recuadro es su propia cuadrícula y sin esto el nombre
              largo del cliente la estiraba a 451 px en un celular de 375 (vista del supervisor, 24-nov). */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8, minWidth: 0 }}>
            <div style={tituloCaja}>
              De {nombresDeOtros.join(", ")} · {ver === "por_hacer" ? "te toca confirmarlas" : "ya las marcaste"} · se le pagan a él
            </div>
            <ListBox isMobile={isMobile}>{deOtros.map(fila)}</ListBox>
          </div>
          {propias.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8, minWidth: 0 }}>
              <div style={tituloCaja}>Tus visitas</div>
              <ListBox isMobile={isMobile}>{propias.map(fila)}</ListBox>
            </div>
          )}
        </>
      )}

      {esJefe && viejas.length > 0 && (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            Las de antes del 19-nov: las valida el supervisor de la moto, 5 por día
          </div>
          {viejas.map(v => (
            <div key={v.subadmin_id ?? "sin"} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, minWidth: 0 }}>
              <span style={{ textTransform: "uppercase", color: "var(--text)", minWidth: 0 }}>{v.subadmin_id ? nombreSubadmin(v.subadmin_id) : "Sin supervisor"}</span>
              <span style={{ color: "var(--muted2)", fontWeight: 600 }}>{v.n} por validar</span>
            </div>
          ))}
        </div>
      )}

      {documentar && (
        <ModalRegistrarGuardado
          contratoId={documentar.contrato_id}
          clienteNombre={documentar.cliente}
          placa={documentar.placa ?? ""}
          comoVisitador
          onClose={() => setDocumentar(null)}
          onDone={() => { setDocumentar(null); avisarCambio(); aviso(`Listo. Los ${fmtMoney(VALOR_VISITA)} de la visita van en tu nómina de esta semana.`); }}
        />
      )}
    </div>
  );
}
