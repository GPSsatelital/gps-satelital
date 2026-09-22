import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";
import { card, secondaryBtn, primaryBtn, inputStyle, labelStyle } from "../styles/shared";
import { ANGULOS_FOTO, GridFotosAngulos, type AnguloFoto } from "./FotosAngulos";

// LA OTRA MITAD DE LA EVIDENCIA (22-sep-2026). Devolver un reemplazo era un botón que cerraba el
// préstamo y ya: ni una foto de cómo volvió la moto, ni kilometraje. Si volvía rayada, chocada o
// con 3.000 km encima, no quedaba dicho en ningún lado — y la moto es de otro socio.
//
// Pide lo mismo que la salida, para poder comparar: las 6 fotos + kilometraje + condición.
// Con el km de salida y el de vuelta, por primera vez se sabe cuánto rodó la prestada.
//
// EL ORDEN: la evidencia se guarda ANTES de cerrar el préstamo. Si falla la subida, el préstamo
// sigue activo y se reintenta — nunca queda cerrado sin constancia.
interface Props {
  prestamoId: string;
  motoPrestadaId: string;
  placaPrestada: string;
  placaOriginal: string;
  contratoId: string;
  clienteId?: string | null;
  clienteNombre: string;
  /** Km con el que salió, para comparar acá mismo. null si el préstamo es viejo y no lo tiene. */
  kmSalida?: number | null;
  onClose: () => void;
  /** Cierra el préstamo. Lo hace quien llama (InmovilizacionesView), que además cobra el alquiler. */
  onConfirmar: () => Promise<void>;
}

export default function ModalDevolverReemplazo({
  prestamoId, motoPrestadaId, placaPrestada, placaOriginal, contratoId, clienteId = null,
  clienteNombre, kmSalida = null, onClose, onConfirmar,
}: Props) {
  const { registrarRecepcion } = useUbicaciones();
  const { profile } = useAuth();
  const [fotos, setFotos] = useState<Partial<Record<AnguloFoto, string>>>({});
  const [kilometros, setKilometros] = useState("");
  const [condicion, setCondicion] = useState<"buena" | "regular" | "mala">("buena");
  const [danos, setDanos] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faltanFotos = ANGULOS_FOTO.filter(a => !fotos[a.key]).length;
  const kmNum = kilometros ? Number(kilometros) : null;
  const recorrido = kmSalida != null && kmNum != null ? kmNum - kmSalida : null;

  async function subirFotos(): Promise<{ urls: string[]; fallidas: number }> {
    const urls: string[] = [];
    let fallidas = 0;
    const stamp = Date.now();
    for (const { key } of ANGULOS_FOTO) {
      const dataUrl = fotos[key];
      if (!dataUrl) continue;
      const blob = await (await fetch(dataUrl)).blob();
      const path = `prestamos/${motoPrestadaId}/devolucion_${stamp}_${key}.jpg`;
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

  async function handleDevolver() {
    if (guardando || !profile) return;
    const faltantes = ANGULOS_FOTO.filter(a => !fotos[a.key]);
    if (faltantes.length > 0) { setError(`Falta la foto: ${faltantes.map(a => a.label).join(", ")}.`); return; }
    if (recorrido != null && recorrido < 0 && !confirm(`El kilometraje de vuelta (${kmNum}) es MENOR que el de salida (${kmSalida}).\n\n¿Seguro que está bien escrito?`)) return;
    setGuardando(true); setError(null);
    try {
      // 1. La evidencia PRIMERO
      const { urls, fallidas } = await subirFotos();
      if (fallidas > 0) { setError(`No se pudieron subir ${fallidas} foto(s). Revisa la conexión e intenta de nuevo — la devolución necesita las 6 fotos.`); return; }
      const { error: errRec } = await registrarRecepcion({
        moto_id: motoPrestadaId,
        contrato_id: contratoId,
        cliente_id: clienteId ?? undefined,
        motivo: "prestamo_devolucion",
        condicion_general: condicion,
        descripcion_danos: danos || undefined,
        kilometros: kmNum ?? undefined,
        ubicacion_destino: "bodega",
        quien_recibe: profile.id,
        nombre_entrega: clienteNombre,
        fotos: urls,
        observaciones: `Devolución de la moto PRESTADA ${placaPrestada} (reemplazo de su ${placaOriginal}).${
          recorrido != null ? ` Rodó ${recorrido.toLocaleString("es-CO")} km durante el préstamo (salió con ${kmSalida?.toLocaleString("es-CO")}).` : ""
        }${observaciones ? " " + observaciones : ""}`,
      });
      if (errRec) { setError("No se pudo registrar la evidencia de devolución: " + errRec); return; }

      // 2. Recién ahora se cierra el préstamo (y quien llama cobra el alquiler pendiente).
      await onConfirmar();
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{ ...card, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(500px,96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto", zIndex: 401, display: "grid", gap: 12, boxSizing: "border-box" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>↩️ Devolver la moto prestada</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>
            {placaPrestada} · la devuelve {clienteNombre}
          </div>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft)", fontSize: 12, color: "var(--accent-ink)", lineHeight: 1.5 }}>
          Deja constancia de <strong>cómo vuelve</strong>. Es la moto del grupo dueño de la{" "}
          <strong>{placaPrestada}</strong>: si volvió rayada o chocada, la comparación con las fotos
          de salida es la prueba. Al confirmar, {clienteNombre.split(" ")[0]} recupera su{" "}
          <strong>{placaOriginal}</strong>.
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Las 6 fotos de cómo vuelve {faltanFotos > 0 && <span style={{ color: "var(--warn-ink)" }}>— faltan {faltanFotos}</span>}</label>
          <GridFotosAngulos fotos={fotos} onChange={setFotos} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 140px", minWidth: 0 }}>
            <label style={{ ...labelStyle, display: "block" }}>Kilometraje de vuelta</label>
            <input value={kilometros} onChange={e => setKilometros(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={kmSalida != null ? `Salió con ${kmSalida}` : "Ej. 18900"} style={{ ...inputStyle, boxSizing: "border-box" }} />
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
        {recorrido != null && (
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: -6, color: recorrido < 0 ? "var(--bad-ink)" : "var(--muted2)" }}>
            {recorrido < 0
              ? `⚠️ Da ${recorrido.toLocaleString("es-CO")} km — el de vuelta no puede ser menor que el de salida (${kmSalida?.toLocaleString("es-CO")}).`
              : `Rodó ${recorrido.toLocaleString("es-CO")} km durante el préstamo.`}
          </div>
        )}
        {kmSalida == null && (
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: -6 }}>
            Este préstamo se hizo antes de que se pidiera el kilometraje de salida, así que no hay con qué comparar.
          </div>
        )}

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Daños que trae (opcional)</label>
          <input value={danos} onChange={e => setDanos(e.target.value)} placeholder="Ej. espejo derecho roto" style={{ ...inputStyle, boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ ...labelStyle, display: "block" }}>Observaciones (opcional)</label>
          <input value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Lo que haga falta dejar dicho" style={{ ...inputStyle, boxSizing: "border-box" }} />
        </div>

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={guardando} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleDevolver} disabled={guardando || faltanFotos > 0} style={{ ...primaryBtn, flex: 2, opacity: (guardando || faltanFotos > 0) ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "↩️ Devolver y cerrar el préstamo"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)" }} key={prestamoId}>
          Si quedó alquiler sin pagar, al confirmar se convierte en deuda para hacerle el convenio.
        </div>
      </div>
    </>
  );
}
