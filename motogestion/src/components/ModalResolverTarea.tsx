import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTareas, EVIDENCIA_LABEL, type Tarea } from "../hooks/useTareas";
import CanvasFirma from "./CanvasFirma";
import { card, inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

// Resolver una tarea: por los DOS caminos.
//
// "No se pudo" es un camino de primera clase, no un rincón escondido — es la decisión del dueño
// (10-sep): si la única salida visible fuera "cumplida", la gente marcaría cumplido lo que no hizo
// y nadie se enteraría. El motivo es obligatorio acá y también en la base (CHECK de la mig 140).

export default function ModalResolverTarea({ tarea, onClose, onHecho }: {
  tarea: Tarea;
  onClose: () => void;
  onHecho: (mensaje: string) => void;
}) {
  const { profile } = useAuth();
  const { cumplirTarea, noSePudo, subirEvidencia } = useTareas();

  const [camino, setCamino] = useState<"cumplida" | "no_se_pudo">("cumplida");
  const [comentario, setComentario] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [firma, setFirma] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pide = (e: string) => tarea.evidencias_requeridas.includes(e as never);

  function tomarFoto(file: File) {
    const reader = new FileReader();
    reader.onload = ev => setFotos(p => [...p, ev.target?.result as string]);
    reader.readAsDataURL(file);
  }

  function tomarUbicacion() {
    if (!navigator.geolocation) { setError("Este equipo no puede tomar la ubicación."); return; }
    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setBuscandoGps(false); },
      err => { setError("No se pudo tomar la ubicación: " + err.message); setBuscandoGps(false); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function handleGuardar() {
    if (guardando || !profile) return;
    setError(null);
    setGuardando(true);
    try {
      if (camino === "no_se_pudo") {
        const { error: err } = await noSePudo(tarea.id, motivo, profile.id);
        if (err) { setError(err); return; }
        onHecho("Quedó como “no se pudo”. Le avisamos a quien la mandó.");
        return;
      }

      // Las fotos y la firma se suben a Storage ANTES de cerrar la tarea: si la subida falla, la
      // tarea no se cierra a medias sin su evidencia.
      const urls: string[] = [];
      for (const f of fotos) {
        const url = await subirEvidencia(tarea.id, f, "foto");
        if (!url) { setError("No se pudo subir una de las fotos. Intenta otra vez."); return; }
        urls.push(url);
      }
      let firmaUrl: string | null = null;
      if (firma) {
        firmaUrl = await subirEvidencia(tarea.id, firma, "firma");
        if (!firmaUrl) { setError("No se pudo subir la firma. Intenta otra vez."); return; }
      }

      const { error: err } = await cumplirTarea(tarea, profile.id, { comentario, fotos: urls, ubicacion, firmaUrl });
      if (err) { setError(err); return; }
      onHecho("Tarea cumplida.");
    } finally {
      setGuardando(false);
    }
  }

  const tab = (activo: boolean, tono: "ok" | "bad") => ({
    flex: 1, padding: "10px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 10,
    border: `1px solid ${activo ? (tono === "ok" ? "var(--ok-line)" : "var(--bad-line)") : "var(--line)"}`,
    background: activo ? (tono === "ok" ? "var(--ok-soft)" : "var(--bad-soft)") : "var(--soft2)",
    color: activo ? (tono === "ok" ? "var(--ok-ink)" : "var(--bad-ink)") : "var(--muted)",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 460, maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{tarea.titulo}</h3>
        {tarea.detalle && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>{tarea.detalle}</div>}

        <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 14 }}>
          <button onClick={() => setCamino("cumplida")} style={tab(camino === "cumplida", "ok")}>La cumplí</button>
          <button onClick={() => setCamino("no_se_pudo")} style={tab(camino === "no_se_pudo", "bad")}>No se pudo</button>
        </div>

        {camino === "no_se_pudo" ? (
          <div>
            <div style={labelStyle}>¿Por qué no se pudo?</div>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={motivo} onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: no estaba, la vecina dice que salió a trabajar" />
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.45 }}>
              Esto le llega a quien te la mandó para que decida: insistir, pasarla a otro, o cerrarla.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {tarea.evidencias_requeridas.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
                Esta tarea no pide evidencia. Puedes agregar un comentario si quieres dejar constancia.
              </div>
            )}

            {(pide("comentario") || tarea.evidencias_requeridas.length === 0) && (
              <div>
                <div style={labelStyle}>Comentario{pide("comentario") ? "" : " (opcional)"}</div>
                <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={comentario} onChange={e => setComentario(e.target.value)}
                  placeholder="Qué pasó, en tus palabras" />
              </div>
            )}

            {pide("foto") && (
              <div>
                <div style={labelStyle}>{EVIDENCIA_LABEL.foto} {fotos.length > 0 && `(${fotos.length})`}</div>
                {/* Dos botones separados: Android no permite cámara y galería en un solo input. */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  <label style={{ ...secondaryBtn, cursor: "pointer", fontSize: 12, padding: "8px 14px" }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) tomarFoto(f); e.target.value = ""; }} />
                  </label>
                  <label style={{ ...secondaryBtn, cursor: "pointer", fontSize: 12, padding: "8px 14px" }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) tomarFoto(f); e.target.value = ""; }} />
                  </label>
                </div>
                {fotos.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 9 }}>
                    {fotos.map((f, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={f} alt={`Foto ${i + 1}`} style={{ width: 68, height: 68, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }} />
                        <button type="button" onClick={() => setFotos(p => p.filter((_, j) => j !== i))} style={{
                          position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                          background: "var(--bad)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer",
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pide("ubicacion") && (
              <div>
                <div style={labelStyle}>{EVIDENCIA_LABEL.ubicacion}</div>
                {ubicacion ? (
                  <div style={{ fontSize: 12.5, color: "var(--ok-ink)", background: "var(--ok-soft)", borderRadius: 8, padding: "8px 10px", marginTop: 4 }}>
                    ✓ Ubicación tomada ·{" "}
                    <a href={`https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>ver en el mapa</a>
                  </div>
                ) : (
                  <button onClick={tomarUbicacion} disabled={buscandoGps} style={{ ...secondaryBtn, fontSize: 12, padding: "8px 14px", marginTop: 4 }}>
                    {buscandoGps ? "Buscando..." : "📍 Tomar mi ubicación"}
                  </button>
                )}
              </div>
            )}

            {pide("firma") && (
              <div>
                <div style={labelStyle}>{EVIDENCIA_LABEL.firma}</div>
                <CanvasFirma label="Firma del cliente" modal onChange={setFirma} />
              </div>
            )}
          </div>
        )}

        {error && (
          <div role="alert" style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={secondaryBtn}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : camino === "cumplida" ? "Marcar cumplida" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
