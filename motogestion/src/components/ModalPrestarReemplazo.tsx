import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { usePrestamos } from "../hooks/usePrestamos";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";
import { card, secondaryBtn, primaryBtn, inputStyle, labelStyle } from "../styles/shared";
import { ANGULOS_FOTO, GridFotosAngulos, type AnguloFoto } from "./FotosAngulos";

// TEMA B F2: elegir una moto del pool para prestar como reemplazo a un cliente cuya moto
// está varada (taller, fiscalía, tránsito o garantía). Muestra tipo (diario/tiempo definido) +
// estado (mora/incapacidad/disponible) para prestar primero las seguras y no comprometer la
// de un cliente de tiempo definido que la querrá exacta de vuelta.
//
// 22-sep-2026 — PASO 2: LA EVIDENCIA. Lo vio el dueño: prestar era el ÚNICO momento del sistema
// en que una moto cambiaba de manos sin dejar nada — ni una foto, ni kilometraje, ni condición.
// Y es la moto de OTRO SOCIO: si el cliente la choca o la raya, esa foto es la única prueba de
// cómo salió. Ahora pide lo mismo que la entrega del wizard, la recolección y la devolución de
// una retenida: las 6 fotos guiadas (incluida la de la persona al lado de la moto, que es el
// respaldo legal de a quién se le entregó) + kilometraje + condición.
//
// EL ORDEN IMPORTA: primero se sube la evidencia y se registra la recepción; el swap de placa
// se hace AL FINAL. Si algo falla a mitad, el préstamo no queda hecho a medias — quien opera
// vuelve a intentar y no hay un contrato apuntando a una moto de la que no hay constancia.
interface Props {
  contratoId: string;      // contrato del que pide (su moto está varada)
  clienteId?: string | null;
  motivoVarada?: string;   // "en taller" | "en Fiscalía" | "en Tránsito" | "en Garantía"
  motoOriginalId: string | null; // la suya, varada
  clienteNombre: string;
  placaOriginal: string;
  onClose: () => void;
  onDone?: () => void;
}

export default function ModalPrestarReemplazo({ contratoId, clienteId = null, motivoVarada = "en taller", motoOriginalId, clienteNombre, placaOriginal, onClose, onDone }: Props) {
  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { prestarReemplazo, prestamoActivoDeMoto } = usePrestamos();
  const { registrarRecepcion } = useUbicaciones();
  const { profile } = useAuth();
  const [sel, setSel] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busq, setBusq] = useState("");

  // Paso 2 — cómo sale la moto prestada
  const [paso, setPaso] = useState<1 | 2>(1);
  const [fotos, setFotos] = useState<Partial<Record<AnguloFoto, string>>>({});
  const [kilometros, setKilometros] = useState("");
  const [condicion, setCondicion] = useState<"buena" | "regular" | "mala">("buena");
  const [danos, setDanos] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const motoSel = motos.find(m => m.id === sel) ?? null;

  // Pool: motos Disponibles o Recuperadas (guardadas), que no estén ya prestadas.
  const pool = motos
    .filter(m => (m.estado === "Disponible" || m.estado === "Recuperada") && m.id !== motoOriginalId && !prestamoActivoDeMoto(m.id))
    .map(m => {
      const contSusp = contratos.find(c => c.moto_id === m.id && c.estado === "Suspendido");
      const cat = m.estado === "Disponible"
        ? { label: "Disponible", color: "var(--ok-ink)", bg: "var(--ok-soft)" }
        : contSusp?.motivo_suspension === "temporal"
          ? { label: "Incapacidad", color: "var(--accent-ink)", bg: "var(--accent-soft)" }
          : { label: "Mora", color: "var(--bad-ink)", bg: "var(--bad-soft)" };
      const tipo = contSusp ? (contSusp.forma_pago === "Diario" ? "Diario" : "Tiempo definido") : "—";
      // Orden de preferencia: primero las libres de verdad (Disponible, sin dueño esperando).
      // Las de mora tienen dueño con 7 días para recuperarlas pagando, así que van después;
      // las de incapacidad de tiempo definido son las peores (el dueño quiere ESA placa).
      const seguro = m.estado === "Disponible";
      return { m, cat, tipo, seguro };
    })
    .filter(x => !busq.trim() || x.m.placa.toLowerCase().includes(busq.toLowerCase()))
    .sort((a, b) => Number(b.seguro) - Number(a.seguro)); // seguras primero

  async function subirFotos(motoId: string): Promise<{ urls: string[]; fallidas: number }> {
    const urls: string[] = [];
    let fallidas = 0;
    const stamp = Date.now();
    for (const { key } of ANGULOS_FOTO) {
      const dataUrl = fotos[key];
      if (!dataUrl) continue;
      const blob = await (await fetch(dataUrl)).blob();
      const path = `prestamos/${motoId}/salida_${stamp}_${key}.jpg`;
      const { error: up } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (!up) {
        const { data } = supabase.storage.from("documentos").getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        fallidas++;
      }
    }
    return { urls, fallidas };
  }

  async function handlePrestar() {
    if (guardando || !sel || !profile || !motoSel) return;
    const faltantes = ANGULOS_FOTO.filter(a => !fotos[a.key]);
    if (faltantes.length > 0) { setError(`Falta la foto: ${faltantes.map(a => a.label).join(", ")}.`); return; }
    if (!confirm(`¿Prestar la moto ${motoSel.placa} a ${clienteNombre} mientras su moto ${placaOriginal} está ${motivoVarada}?`)) return;
    setGuardando(true); setError(null);
    try {
      // 1. La evidencia PRIMERO. Si no sube, no se presta: sin foto no hay prueba de cómo salió.
      const { urls, fallidas } = await subirFotos(sel);
      if (fallidas > 0) { setError(`No se pudieron subir ${fallidas} foto(s). Revisa la conexión e intenta de nuevo — el préstamo necesita las 6 fotos como respaldo.`); return; }
      const { error: errRec } = await registrarRecepcion({
        moto_id: sel,
        contrato_id: contratoId,
        cliente_id: clienteId ?? undefined,
        motivo: "prestamo_entrega",
        condicion_general: condicion,
        descripcion_danos: danos || undefined,
        kilometros: kilometros ? Number(kilometros) : undefined,
        ubicacion_destino: "con_cliente",
        quien_recibe: profile.id,
        nombre_entrega: clienteNombre,
        fotos: urls,
        observaciones: `Moto PRESTADA como reemplazo mientras su ${placaOriginal} está ${motivoVarada}.${observaciones ? " " + observaciones : ""}`,
      });
      if (errRec) { setError("No se pudo registrar la evidencia de entrega: " + errRec); return; }

      // 2. Recién ahora el swap de placa.
      const { error } = await prestarReemplazo(contratoId, sel, motoOriginalId, profile.id);
      if (error) { setError(error); return; }
      onDone?.(); onClose();
    } finally {
      setGuardando(false);
    }
  }

  const faltanFotos = ANGULOS_FOTO.filter(a => !fotos[a.key]).length;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{ ...card, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(500px,96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto", zIndex: 401, display: "grid", gap: 12, boxSizing: "border-box" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>🔄 Prestar moto de reemplazo</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{clienteNombre} · su moto {placaOriginal} {motivoVarada}</div>
        </div>

        {/* Dos pasos, para que se vea que falta uno y no se crea que ya terminó al elegir la placa */}
        <div style={{ display: "flex", gap: 6, fontSize: 11.5, fontWeight: 700 }}>
          <span style={{ flex: 1, textAlign: "center", padding: "5px 8px", borderRadius: 999, background: paso === 1 ? "var(--accent-soft2)" : "var(--soft2)", color: paso === 1 ? "var(--accent-ink)" : "var(--muted)" }}>
            1 · Elegir la moto{motoSel ? ` (${motoSel.placa})` : ""}
          </span>
          <span style={{ flex: 1, textAlign: "center", padding: "5px 8px", borderRadius: 999, background: paso === 2 ? "var(--accent-soft2)" : "var(--soft2)", color: paso === 2 ? "var(--accent-ink)" : "var(--muted)" }}>
            2 · Cómo sale
          </span>
        </div>

        {paso === 1 ? (
          <>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Elige una moto del pool. Presta primero las <strong>disponibles</strong>. Las de{" "}
              <strong>mora</strong> sirven, pero su dueño tiene 7 días para pagar y recuperarla: si
              paga mientras está prestada, quedas comprometido con dos personas. Evita las de
              incapacidad de tiempo definido (el dueño las querrá exactas de vuelta).
            </div>
            <input value={busq} onChange={e => setBusq(e.target.value)} placeholder="Buscar placa..." style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13 }} />

            <div style={{ display: "grid", gap: 6, maxHeight: "44vh", overflowY: "auto" }}>
              {pool.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: 16 }}>No hay motos disponibles para prestar.</div>}
              {pool.map(({ m, cat, tipo, seguro }) => (
                <button key={m.id} onClick={() => setSel(m.id)} style={{
                  textAlign: "left", border: `2px solid ${sel === m.id ? "var(--accent)" : "var(--line)"}`, borderRadius: 12, padding: "10px 12px",
                  background: sel === m.id ? "var(--accent-soft2)" : "var(--card)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8,
                }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", textTransform: "uppercase" }}>{m.placa}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{m.marca} {m.modelo} · {m.grupo}</span>
                    <span style={{ display: "block", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{tipo !== "—" ? tipo : "Sin contrato"}</span>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: cat.bg, color: cat.color }}>{cat.label}</span>
                    {!seguro && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--warn-strong)" }}>⚠️ la querrá de vuelta</span>}
                  </span>
                </button>
              ))}
            </div>

            {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
              <button onClick={() => { setError(null); setPaso(2); }} disabled={!sel} style={{ ...primaryBtn, flex: 2, opacity: !sel ? 0.6 : 1 }}>
                Siguiente — cómo sale →
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", fontSize: 12, color: "var(--warn-ink2)", lineHeight: 1.5 }}>
              Estás sacando la <strong>{motoSel?.placa}</strong> del grupo <strong>{motoSel?.grupo}</strong>.
              Deja constancia de cómo sale: si vuelve rayada o chocada, <strong>estas fotos son la única prueba</strong>.
            </div>

            <div>
              <label style={{ ...labelStyle, display: "block" }}>Las 6 fotos de cómo sale {faltanFotos > 0 && <span style={{ color: "var(--warn-ink)" }}>— faltan {faltanFotos}</span>}</label>
              <GridFotosAngulos fotos={fotos} onChange={setFotos} />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                <label style={{ ...labelStyle, display: "block" }}>Kilometraje de salida</label>
                <input value={kilometros} onChange={e => setKilometros(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Ej. 18400" style={{ ...inputStyle, boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                <label style={{ ...labelStyle, display: "block" }}>Condición</label>
                <select value={condicion} onChange={e => setCondicion(e.target.value as "buena" | "regular" | "mala")} style={{ ...inputStyle, boxSizing: "border-box" }}>
                  <option value="buena">Buena</option>
                  <option value="regular">Regular</option>
                  <option value="mala">Mala</option>
                </select>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: -6 }}>
              El kilometraje es lo que después dice cuánto rodó la moto prestada.
            </div>

            <div>
              <label style={{ ...labelStyle, display: "block" }}>Daños visibles (opcional)</label>
              <input value={danos} onChange={e => setDanos(e.target.value)} placeholder="Ej. rayón en el guardabarros derecho" style={{ ...inputStyle, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ ...labelStyle, display: "block" }}>Observaciones (opcional)</label>
              <input value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Lo que haga falta dejar dicho" style={{ ...inputStyle, boxSizing: "border-box" }} />
            </div>

            {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setError(null); setPaso(1); }} disabled={guardando} style={{ ...secondaryBtn, flex: 1 }}>← Atrás</button>
              <button onClick={handlePrestar} disabled={guardando || faltanFotos > 0} style={{ ...primaryBtn, flex: 2, opacity: (guardando || faltanFotos > 0) ? 0.6 : 1 }}>
                {guardando ? "Prestando..." : "🔄 Prestar esta moto"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
