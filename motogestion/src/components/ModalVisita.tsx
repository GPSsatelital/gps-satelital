import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useClientes } from "../hooks/useClientes";
import { useVisitas } from "../hooks/useVisitas";
import { hoyISO } from "../utils/fecha";

interface Props {
  clienteId: string;
  clienteNombre: string;
  onClose: () => void;
  onGuardada: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line2)",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  marginBottom: 5,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--muted2)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text)",
  marginBottom: 12,
  paddingBottom: 6,
  borderBottom: "1px solid var(--line)",
};

export default function ModalVisita({ clienteId, clienteNombre, onClose, onGuardada }: Props) {
  const { actualizarCliente, clientes } = useClientes();
  const { subirFotoVisita } = useVisitas();

  const [fotoCliente, setFotoCliente] = useState<File | null>(null);
  const [fotoFachada, setFotoFachada] = useState<File | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [viveAlli, setViveAlli] = useState<"Sí" | "No" | "No encontrado" | "">("");
  const [tiempoResidencia, setTiempoResidencia] = useState("");
  const [tipoVivienda, setTipoVivienda] = useState("");
  const [composicionFamiliar, setComposicionFamiliar] = useState("");
  const [estabilidadLaboral, setEstabilidadLaboral] = useState("");
  const [dudasCliente, setDudasCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [recomendacion, setRecomendacion] = useState("");
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [capturandoGPS, setCapturandoGPS] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function capturarUbicacion() {
    if (!navigator.geolocation) {
      setError("GPS no disponible en este dispositivo o navegador.");
      return;
    }
    setCapturandoGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCapturandoGPS(false);
      },
      () => {
        setError("No se pudo capturar la ubicación. Revisa permisos de GPS.");
        setCapturandoGPS(false);
      }
    );
  }

  async function handleGuardar() {
    if (!observaciones.trim()) {
      setError("Las observaciones del visitador son obligatorias.");
      return;
    }
    if (!viveAlli) {
      setError("Indica si el cliente vive en esa dirección.");
      return;
    }

    setGuardando(true);
    setSubiendoFoto(true);
    setError(null);

    let urlCliente: string | null = null;
    let urlFachada: string | null = null;

    if (fotoCliente) {
      const r = await subirFotoVisita(fotoCliente, clienteId, "funcionario");
      if (r.url) urlCliente = r.url;
    }
    if (fotoFachada) {
      const r = await subirFotoVisita(fotoFachada, clienteId, "fachada");
      if (r.url) urlFachada = r.url;
    }
    setSubiendoFoto(false);

    const entrevista = {
      viveAlli,
      tiempoResidencia,
      tipoVivienda,
      composicionFamiliar,
      estabilidadLaboral,
      dudasCliente,
      observaciones,
      recomendacion,
    };

    const clienteActual = clientes.find(c => c.id === clienteId);

    const { error: insErr } = await supabase.from("visitas").insert({
      cliente_id: clienteId,
      estado: "Completada",
      resultado: recomendacion || null,
      entrevista,
      ubicacion: ubicacion ?? null,
      fecha: hoyISO(),
      fotos: { clienteFuncionario: urlCliente, fachada: urlFachada },
      asignada_a: clienteActual?.visita_asignada_a ?? null,
    });

    if (insErr) {
      setError(insErr.message);
      setGuardando(false);
      return;
    }

    // El trigger de BD (mig 042) mueve el cliente a "Pendiente evaluación" de forma atómica
    // al insertar la visita. Esta llamada queda como respaldo; si la RLS la bloquea (el subadmin
    // que registra no es el asignado a la visita), no importa: el trigger ya lo hizo. Antes esto
    // fallaba en silencio y dejaba clientes atascados en "Listo para visita".
    const { error: updErr } = await actualizarCliente(clienteId, { estado: "Pendiente evaluación" } as never);
    if (updErr) console.warn("El update de estado del frontend fue rechazado (el trigger de BD ya movió el cliente):", updErr);

    setGuardando(false);
    onGuardada();
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 90,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 540,
          background: "var(--card)",
          borderRadius: 20,
          padding: 24,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(15,23,42,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, color: "var(--text)" }}>Registrar visita domiciliaria</h3>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", fontWeight: 600 }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "var(--soft)", borderRadius: 999, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 16, color: "var(--muted2)" }}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 20 }}>

          {/* Sección 1: Verificación de domicilio */}
          <div>
            <div style={sectionTitle}>Verificación de domicilio</div>
            <div style={{ display: "grid", gap: 14 }}>

              <div>
                <div style={labelStyle}>¿El cliente vive allí?</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {(["Sí", "No", "No encontrado"] as const).map((op) => (
                    <label key={op} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, border: `2px solid ${viveAlli === op ? "var(--accent)" : "var(--line)"}`, background: viveAlli === op ? "var(--accent-soft)" : "var(--card)", fontSize: 13, fontWeight: 600, color: viveAlli === op ? "var(--accent)" : "var(--muted2)" }}>
                      <input
                        type="radio"
                        name="viveAlli"
                        value={op}
                        checked={viveAlli === op}
                        onChange={() => setViveAlli(op)}
                        style={{ display: "none" }}
                      />
                      {op}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Tiempo de residencia</div>
                <input style={inputStyle} placeholder='Ej. "3 años", "6 meses"' value={tiempoResidencia} onChange={(e) => setTiempoResidencia(e.target.value)} />
              </div>

              <div>
                <div style={labelStyle}>Tipo de vivienda</div>
                <select style={inputStyle} value={tipoVivienda} onChange={(e) => setTipoVivienda(e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="Propia">Propia</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Alquilada">Alquilada</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <div style={labelStyle}>Composición familiar</div>
                <input style={inputStyle} placeholder="Ej. Esposa e hijo de 3 años" value={composicionFamiliar} onChange={(e) => setComposicionFamiliar(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Sección 2: Evaluación */}
          <div>
            <div style={sectionTitle}>Evaluación</div>
            <div style={{ display: "grid", gap: 14 }}>

              <div>
                <div style={labelStyle}>Estabilidad laboral</div>
                <input style={inputStyle} placeholder="Ej. Mototaxista independiente" value={estabilidadLaboral} onChange={(e) => setEstabilidadLaboral(e.target.value)} />
              </div>

              <div>
                <div style={labelStyle}>Dudas del cliente</div>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="¿Qué preguntas hizo el cliente?" value={dudasCliente} onChange={(e) => setDudasCliente(e.target.value)} />
              </div>

              <div>
                <div style={labelStyle}>Observaciones del visitador <span style={{ color: "var(--bad-ink)" }}>*</span></div>
                <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="Describe lo que observaste en la visita..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>

              <div>
                <div style={labelStyle}>Recomendación</div>
                <select style={inputStyle} value={recomendacion} onChange={(e) => setRecomendacion(e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Aprobado con reservas">Aprobado con reservas</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección 3: Fotos */}
          <div>
            <div style={sectionTitle}>Fotos de la visita</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <div style={labelStyle}>Foto cliente + funcionario</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setFotoCliente(e.target.files?.[0] ?? null)} />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--soft)", color: "var(--muted2)", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setFotoCliente(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {fotoCliente && <div style={{ fontSize: 12, color: "var(--ok-ink)", marginTop: 4 }}>✔ {fotoCliente.name}</div>}
              </div>
              <div>
                <div style={labelStyle}>Foto fachada</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setFotoFachada(e.target.files?.[0] ?? null)} />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "var(--soft)", color: "var(--muted2)", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setFotoFachada(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {fotoFachada && <div style={{ fontSize: 12, color: "var(--ok-ink)", marginTop: 4 }}>✔ {fotoFachada.name}</div>}
              </div>
            </div>
          </div>

          {/* Sección 4: Ubicación GPS */}
          <div>
            <div style={sectionTitle}>Ubicación GPS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={capturarUbicacion}
                disabled={capturandoGPS}
                style={{ padding: "9px 16px", borderRadius: 10, border: "none", cursor: capturandoGPS ? "not-allowed" : "pointer", background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13, opacity: capturandoGPS ? 0.7 : 1 }}
              >
                {capturandoGPS ? "Capturando..." : "📍 Capturar ubicación"}
              </button>
              {ubicacion ? (
                <div style={{ fontSize: 13, color: "var(--ok-ink)", fontWeight: 600 }}>
                  ✔ {ubicacion.lat.toFixed(5)}, {ubicacion.lng.toFixed(5)}
                  {" · "}
                  <a href={`https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                    Ver en mapa →
                  </a>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: "var(--faint)" }}>No capturada</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ background: "var(--card)", border: "1px solid var(--line2)", borderRadius: 12, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{ background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "var(--card)", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer", fontSize: 14, opacity: guardando ? 0.7 : 1 }}
          >
            {subiendoFoto ? "Subiendo fotos..." : guardando ? "Guardando..." : "Guardar visita"}
          </button>
        </div>
      </div>
    </div>
  );
}
