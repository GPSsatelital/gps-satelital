import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { card, inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

// Fase 3 — registro del lugar donde SÍ se guarda la moto, con su propio GPS. Se usa yendo
// físicamente al sitio (cliente declaró que no la guarda en casa, o el admin vio que no
// coincide). Captura GPS obligatorio (prueba de que se fue al lugar) + condiciones + foto.
// Guarda en contratos.guardado_lugar (jsonb) — NO en visitas (evita el trigger de estado).
interface Props {
  contratoId: string;
  clienteNombre: string;
  placa: string;
  onClose: () => void;
  onDone?: () => void;
}

export default function ModalRegistrarGuardado({ contratoId, clienteNombre, placa, onClose, onDone }: Props) {
  const { registrarGuardadoMoto } = useContratos();
  const { profile } = useAuth();

  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [capturandoGPS, setCapturandoGPS] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [condiciones, setCondiciones] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  function capturarUbicacion() {
    if (!navigator.geolocation) { setError("GPS no disponible en este dispositivo o navegador."); return; }
    setCapturandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setCapturandoGPS(false); },
      () => { setError("No se pudo capturar la ubicación. Permite el GPS y toca 'Reintentar ubicación'."); setCapturandoGPS(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // El GPS es la prueba de que se fue al lugar → se captura solo al abrir.
  useEffect(() => {
    capturarUbicacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    if (!ubicacion) { setError("Falta la ubicación GPS del lugar de guardado. Toca 'Reintentar ubicación'."); return; }
    if (!direccion.trim()) { setError("Indica la dirección o referencia del lugar."); return; }
    setError(null);
    setGuardando(true);
    try {
      let fotoUrl: string | null = null;
      if (foto) {
        const ext = foto.name.split(".").pop() || "jpg";
        const path = `guardados/${contratoId}/${Date.now()}.${ext}`;
        const { error: up } = await supabase.storage.from("documentos").upload(path, foto, { upsert: true });
        if (up) { setError("No se pudo subir la foto: " + up.message); return; }
        fotoUrl = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
      }
      const { error: errGuardar } = await registrarGuardadoMoto(
        contratoId,
        { lat: ubicacion.lat, lng: ubicacion.lng, direccion: direccion.trim(), condiciones: condiciones.trim(), foto_url: fotoUrl },
        profile.id,
      );
      if (errGuardar) { setError("Error al guardar: " + errGuardar); return; }
      setExito(true);
      setTimeout(() => { onDone?.(); onClose(); }, 1100);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{ ...card, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(500px, 96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto", zIndex: 401, display: "grid", gap: 14, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📍 Registrar lugar de guardado</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{placa} · {clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", fontSize: 12, color: "var(--warn-ink)", fontWeight: 600 }}>
          Regístralo estando EN el lugar donde se guarda la moto — el GPS es la prueba de que se verificó.
        </div>

        <div>
          <div style={labelStyle}>Ubicación GPS del lugar</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={capturarUbicacion} disabled={capturandoGPS}
              style={{ padding: "9px 16px", borderRadius: 10, border: "none", cursor: capturandoGPS ? "not-allowed" : "pointer", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13, opacity: capturandoGPS ? 0.7 : 1 }}>
              {capturandoGPS ? "Capturando ubicación…" : ubicacion ? "📍 Volver a capturar" : "🔄 Reintentar ubicación"}
            </button>
            {ubicacion ? (
              <div style={{ fontSize: 13, color: "var(--ok-ink)", fontWeight: 600 }}>
                ✔ {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}{" · "}
                <a href={`https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Ver en mapa →</a>
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "var(--warn-ink)", fontWeight: 600 }}>
                {capturandoGPS ? "Obteniendo ubicación…" : "⚠️ Obligatoria — permite el GPS y reintenta"}
              </span>
            )}
          </div>
        </div>

        <div>
          <div style={labelStyle}>Dirección / referencia del lugar</div>
          <input style={inputStyle} placeholder="Ej. Casa de la mamá, barrio Olaya, calle 30 #..." value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>

        <div>
          <div style={labelStyle}>Condiciones del lugar</div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 50 }} placeholder="Ej. patio cerrado con techo, portón con candado…" value={condiciones} onChange={(e) => setCondiciones(e.target.value)} />
        </div>

        <div>
          <div style={labelStyle}>Foto del lugar (opcional)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
              📷 Cámara
              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--soft)", color: "var(--muted2)", fontWeight: 700, fontSize: 13 }}>
              🖼 Galería
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          {foto && <div style={{ fontSize: 12, color: "var(--ok-ink)", marginTop: 4 }}>✔ {foto.name}</div>}
        </div>

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>✅ Lugar de guardado registrado.</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || exito} style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Guardando…" : "Guardar lugar"}
          </button>
        </div>
      </div>
    </>
  );
}
