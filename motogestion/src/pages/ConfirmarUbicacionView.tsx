import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useSubadmins } from "../hooks/useSubadmins";
import {
  useConfirmacionesUbicacion, pasoDe, avisarCambio,
  type ConfirmacionUbicacion, type PasoConfirmacion,
} from "../hooks/useConfirmacionesUbicacion";
import { ListBox, ItemLista } from "../components/ListaEstandar";
import ModalRegistrarGuardado from "../components/ModalRegistrarGuardado";
import { card, fmtMoney } from "../styles/shared";
import { VALOR_VISITA, diaColombia, lunesDe } from "../utils/nominaCobradores";

// 📍 CONFIRMAR UBICACIÓN (D-094, regla del dueño, 19-nov-2026).
//
// Desde las motos entregadas el 19-nov, dónde duerme la moto lo confirma QUIEN HIZO LA VISITA: mira
// en el GPS dónde durmió y marca ✓, o ✗ y va a documentar el sitio real. De eso depende que le
// paguen los $40.000 de la visita, en la semana en que confirma (`nominaCobradores.ts`).
//
// La misma pantalla se lee distinto según el puesto:
//   · El que visitó (SUBADMIN): solo las suyas, con los botones.
//   · ADMIN y ADMIN_PRINCIPAL: las de todos, sin botones, para revisar que se estén haciendo y que
//     lo que ponen sea cierto. Y abajo, las viejas que le quedan a cada supervisor (mig 145).

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

  const conPaso = useMemo(() => filas.map(f => ({ f, paso: pasoDe(f) })), [filas]);
  const porHacer = conPaso.filter(x => x.paso !== "confirmada");
  const hechas = conPaso.filter(x => x.paso === "confirmada");
  const mias = porHacer.filter(x => x.f.visitador_id === profile?.id);
  const lista = ver === "por_hacer" ? porHacer : hechas;

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
    const pregunta = resultado === "coincide"
      ? `¿Revisaste en el GPS que la ${f.placa ?? "moto"} durmió donde dijo el cliente? Esto no se puede cambiar después.`
      : `¿La ${f.placa ?? "moto"} NO durmió donde dijo el cliente? Después tienes que ir al sitio real y documentarlo para que te paguen la visita.`;
    if (!window.confirm(pregunta)) return;
    setProcesando(f.contrato_id);
    try {
      const { error: e } = await confirmar(f.contrato_id, resultado);
      if (e) { aviso("No se pudo guardar: " + e); return; }
      if (resultado === "no_coincide") setDocumentar(f);
      else aviso(`Listo. Los ${fmtMoney(VALOR_VISITA)} de la visita van en tu nómina de esta semana.`);
    } finally {
      setProcesando(null);
    }
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

  function estado(f: ConfirmacionUbicacion, paso: PasoConfirmacion) {
    const base: React.CSSProperties = { fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 999, whiteSpace: "nowrap" };
    if (paso === "confirmada") {
      return <span style={{ ...base, background: "var(--ok-soft)", color: "var(--ok-ink)" }}>
        {f.resultado === "no_coincide" ? "✓ Sitio documentado" : "✓ Coincide"} · {diaCorto(f.confirmada_en)}
      </span>;
    }
    if (paso === "falta_sitio") return <span style={{ ...base, background: "var(--bad-soft)", color: "var(--bad-ink)" }}>✗ Falta ir al sitio</span>;
    return <span style={{ ...base, background: "var(--warn-soft)", color: "var(--warn-ink)" }}>{fmtMoney(VALOR_VISITA)} esperando</span>;
  }

  const plataEsperando = mias.length * VALOR_VISITA;

  return (
    <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
      <div style={{ ...card, display: "grid", gap: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📍 Confirmar ubicación</div>
        <div style={{ fontSize: 13, color: "var(--muted2)" }}>
          {esJefe
            ? "Las visitas de todo el equipo, de las motos entregadas desde el 19-nov. Cada quien confirma las suyas."
            : mias.length > 0
              ? <>Tienes <strong>{mias.length}</strong> por confirmar · <strong>{fmtMoney(plataEsperando)}</strong> esperando</>
              : "No tienes visitas por confirmar."}
        </div>
        {!esJefe && (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Mira en el GPS dónde durmió la moto y márcalo. Si no coincide, ve al sitio real y documéntalo:
            ese día ganas los {fmtMoney(VALOR_VISITA)} de la visita.
          </div>
        )}
      </div>

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
      ) : (
        <ListBox isMobile={isMobile}>
          {lista.map(({ f, paso }) => {
            const mia = f.visitador_id === profile?.id;
            const ocupado = procesando === f.contrato_id;
            return (
              <ItemLista
                key={f.contrato_id}
                placa={f.placa ?? undefined}
                grupo={f.grupo}
                titulo={f.cliente}
                rielColor={RIEL[paso]}
                subtitulo={<>
                  Visita del {diaCorto(f.visita_fecha)} · entregada el {diaCorto(f.fecha_entrega)}
                  {esJefe && <> · <span style={{ textTransform: "uppercase" }}>{f.visitador ?? "—"}</span></>}
                </>}
                right={estado(f, paso)}
                extra={
                  <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text)", minWidth: 0 }}>{declarado(f)}</div>
                    {sitioReal(f)}
                    {paso === "confirmada" && f.confirmada_en && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {fmtMoney(VALOR_VISITA)} en la nómina de {semanaDePago(f.confirmada_en)}
                      </div>
                    )}
                    {mia && paso === "por_confirmar" && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button disabled={ocupado} onClick={() => marcar(f, "coincide")} style={btn("var(--ok-ink)", ocupado)}>
                          {ocupado ? "Guardando..." : "✓ Coincide"}
                        </button>
                        <button disabled={ocupado} onClick={() => marcar(f, "no_coincide")} style={btn("var(--bad-ink)", ocupado)}>
                          {ocupado ? "Guardando..." : "✗ No coincide"}
                        </button>
                      </div>
                    )}
                    {mia && paso === "falta_sitio" && (
                      <div>
                        <button onClick={() => setDocumentar(f)} style={btn("var(--accent-ink)", false)}>📍 Documentar el sitio real</button>
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </ListBox>
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
