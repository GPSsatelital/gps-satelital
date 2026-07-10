import { useEffect, useRef, useState } from "react";
import {
  FingerprintReader,
  SampleFormat,
  type SamplesAcquired,
  type QualityReported,
} from "@digitalpersona/devices";
import { labelStyle } from "../styles/shared";

interface Props {
  label: string;
  onChange: (dataUrl: string | null) => void;
}

type EstadoLector =
  | "conectando"
  | "sin-agente" // la app de HID no está instalada/corriendo en este PC
  | "sin-lector" // agente ok pero no hay lector USB conectado
  | "esperando" // listo, esperando el dedo
  | "capturada";

function base64UrlADataUrl(sample: unknown): string | null {
  // Con SampleFormat.PngImage cada muestra llega como string base64url del PNG.
  // Algunas versiones la envían como objeto { Data: "..." }.
  let b64url: string | null = null;
  if (typeof sample === "string") b64url = sample;
  else if (sample && typeof sample === "object" && "Data" in sample) {
    const d = (sample as { Data: unknown }).Data;
    if (typeof d === "string") b64url = d;
  }
  if (!b64url) return null;
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  return `data:image/png;base64,${b64}`;
}

export default function LectorHuella({ label, onChange }: Props) {
  const [estado, setEstado] = useState<EstadoLector>("conectando");
  const [huella, setHuella] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ultimaCalidad, setUltimaCalidad] = useState<number | null>(null); // 0 = buena; distinto de 0 = baja
  const readerRef = useRef<FingerprintReader | null>(null);
  const capturadaRef = useRef(false);
  const [reintentos, setReintentos] = useState(0); // fuerza re-crear la conexión completa

  // Reinicia la conexión con el agente HID desde cero (destruye y recrea el reader).
  // Es lo que destraba el lector cuando quedó "reservado" por una sesión anterior
  // (otro formulario/usuario que no soltó la adquisición) — el síntoma es: recuadro
  // verde "Lector listo" pero el dedo no captura nada.
  function reiniciarConexion() {
    setHuella(null);
    setAviso(null);
    setUltimaCalidad(null);
    capturadaRef.current = false;
    onChange(null);
    setEstado("conectando");
    setReintentos(n => n + 1);
  }

  useEffect(() => {
    let activo = true;
    const reader = new FingerprintReader();
    readerRef.current = reader;

    reader.on("DeviceConnected", () => {
      if (!activo) return;
      setEstado((e) => (e === "capturada" ? e : "esperando"));
      setAviso(null);
    });
    reader.on("DeviceDisconnected", () => {
      if (!activo) return;
      if (!capturadaRef.current) setEstado("sin-lector");
    });
    reader.on("CommunicationFailed", () => {
      if (!activo) return;
      if (!capturadaRef.current) setEstado("sin-agente");
    });
    reader.on("QualityReported", (ev: QualityReported) => {
      if (!activo) return;
      setUltimaCalidad(ev.quality);
      if (ev.quality !== 0) setAviso("Lectura de baja calidad — ponga el dedo firme y centrado, e intente de nuevo.");
      else setAviso(null);
    });
    reader.on("SamplesAcquired", (ev: SamplesAcquired) => {
      if (!activo) return;
      const dataUrl = base64UrlADataUrl(ev.samples?.[0]);
      if (dataUrl) {
        capturadaRef.current = true;
        setHuella(dataUrl);
        setEstado("capturada");
        setAviso(null);
        onChange(dataUrl);
        reader.stopAcquisition().catch(() => {});
      } else {
        setAviso("No se pudo leer la huella — intente de nuevo.");
      }
    });
    reader.on("ErrorOccurred", () => {
      if (!activo) return;
      setAviso("Error del lector — retire el dedo e intente de nuevo.");
    });

    reader
      .enumerateDevices()
      .then(async (devices) => {
        if (!activo) return;
        if (devices.length === 0) {
          setEstado("sin-lector");
          return;
        }
        // Suelta cualquier adquisición que haya quedado colgada de una sesión anterior
        // (el agente HID solo permite UNA lectura activa en todo el PC — si otro formulario
        // no la soltó, el recuadro queda verde pero el dedo nunca captura).
        await reader.stopAcquisition().catch(() => {});
        if (!activo) return;
        setEstado("esperando");
        return reader.startAcquisition(SampleFormat.PngImage);
      })
      .catch(() => {
        if (activo) setEstado("sin-agente");
      });

    return () => {
      activo = false;
      reader.stopAcquisition().catch(() => {});
      reader.off();
      readerRef.current = null;
    };
    // Se re-ejecuta completo al pulsar "Reintentar lectura" (reintentos++): destruye la
    // conexión con el agente HID y la crea de cero — mismo efecto que recargar la página,
    // sin perder el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reintentos]);

  async function repetir() {
    capturadaRef.current = false;
    setHuella(null);
    setAviso(null);
    setUltimaCalidad(null);
    onChange(null);
    setEstado("esperando");
    const r = readerRef.current;
    if (!r) { reiniciarConexion(); return; }
    try {
      // Igual que al montar: soltar la adquisición anterior antes de arrancar la nueva.
      await r.stopAcquisition().catch(() => {});
      await r.startAcquisition(SampleFormat.PngImage);
    } catch {
      setEstado("sin-agente");
    }
  }

  // La huella salió bien si la última calidad reportada fue 0 (buena) o si no hubo
  // reporte de baja calidad. Distinto de 0 = baja → conviene repetir.
  const calidadBaja = ultimaCalidad !== null && ultimaCalidad !== 0;

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ margin: "2px 0 8px", fontSize: 12, fontWeight: 700, color: "#0369a1" }}>
        👉 Dedo a usar: <span style={{ textTransform: "uppercase" }}>índice derecho</span>
      </div>
      {estado === "capturada" && huella ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <img
            src={huella}
            alt="Huella capturada"
            style={{ width: 90, height: 110, objectFit: "contain", background: "#fff", border: `2px solid ${calidadBaja ? "#d97706" : "#16a34a"}`, borderRadius: 10 }}
          />
          <div style={{ minWidth: 0 }}>
            {calidadBaja ? (
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>⚠ Huella capturada, pero de BAJA calidad — se recomienda repetir</div>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 800, color: "#166534" }}>✔ Huella capturada con buena calidad</div>
            )}
            <button
              type="button"
              onClick={repetir}
              style={{ marginTop: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: 12, cursor: "pointer" }}
            >
              🔄 Repetir captura
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background:
                estado === "esperando" ? "#dcfce7" : estado === "conectando" ? "#f1f5f9" : "#fee2e2",
              color:
                estado === "esperando" ? "#166534" : estado === "conectando" ? "#64748b" : "#991b1b",
            }}
          >
            {estado === "conectando" && "Conectando con el lector de huellas..."}
            {estado === "esperando" && "👆 Lector listo — coloque el ÍNDICE DERECHO en el lector."}
            {estado === "sin-lector" && "Lector de huellas no detectado — conecte el DigitalPersona 4500 por USB y toque Reintentar."}
            {estado === "sin-agente" &&
              "No se pudo conectar con el software del lector en este PC. Verifique que la app de HID DigitalPersona esté corriendo y toque Reintentar."}
          </div>
          {estado !== "conectando" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={reiniciarConexion}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#334155" }}
              >
                🔄 Reintentar lectura
              </button>
              {estado === "esperando" && (
                <span style={{ fontSize: 11, color: "#64748b" }}>¿Puso el dedo y no lee? Toque Reintentar.</span>
              )}
            </div>
          )}
        </>
      )}
      {aviso && (
        <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, background: "#fef3c7", color: "#92400e", fontSize: 12 }}>
          ⚠ {aviso}
        </div>
      )}
    </div>
  );
}
