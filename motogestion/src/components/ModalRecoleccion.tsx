import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useUbicaciones, type UbicacionFisica, type CondicionVehiculo } from "../hooks/useUbicaciones";
import { useContratos } from "../hooks/useContratos";
import { useDeudas } from "../hooks/useDeudas";
import { useGestiones } from "../hooks/useGestiones";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import MoneyInput from "./MoneyInput";

// Formulario combinado de recolección por mora: UN solo guardado encadena todo —
// registra la recepción del vehículo (fotos, condición, km, destino), suspende el
// contrato, marca la moto Recuperada (o Mantenimiento si entra directo a taller),
// crea la multa de $20.000 y deja la gestión tipo "recoleccion" registrada.
// Reemplaza el confirm() simple que hacía todo sin evidencia.

interface Props {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  motoId: string | null;
  placa: string;
  onClose: () => void;
  onDone?: () => void;
}

const DESTINOS: { value: UbicacionFisica; label: string }[] = [
  { value: "bodega", label: "🏬 Bodega" },
  { value: "oficina", label: "🏢 Oficina" },
  { value: "taller", label: "🔧 Directo a taller (necesita ajuste)" },
];

export default function ModalRecoleccion({ contratoId, clienteId, clienteNombre, motoId, placa, onClose, onDone }: Props) {
  const { registrarRecepcion } = useUbicaciones();
  const { suspenderContrato } = useContratos();
  const { registrarDeuda } = useDeudas();
  const { registrarGestion } = useGestiones();
  const { profile } = useAuth();

  const [condicion, setCondicion] = useState<CondicionVehiculo>("buena");
  const [danos, setDanos] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [destino, setDestino] = useState<UbicacionFisica>("bodega");
  const [observaciones, setObservaciones] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function subirFotos(): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < fotos.length; i++) {
      const blob = await (await fetch(fotos[i])).blob();
      const path = `recepciones/${motoId ?? contratoId}/${Date.now()}_${i}.jpg`;
      const { error: up } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (!up) {
        const { data } = supabase.storage.from("documentos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    setError(null);
    setGuardando(true);
    try {
      // 1. Recepción del vehículo con evidencia
      if (motoId) {
        const fotosUrls = await subirFotos();
        const { error: errRec } = await registrarRecepcion({
          moto_id: motoId,
          contrato_id: contratoId,
          cliente_id: clienteId,
          motivo: "retencion_mora",
          condicion_general: condicion,
          descripcion_danos: danos || undefined,
          kilometros: kilometros ? Number(kilometros) : undefined,
          ubicacion_destino: destino,
          quien_recibe: profile.id,
          nombre_entrega: clienteNombre,
          fotos: fotosUrls,
          observaciones: observaciones || undefined,
        });
        if (errRec) { setError("Error al registrar la recepción: " + errRec); return; }
      }

      // 2. Gestión de recolección (historial)
      await registrarGestion(contratoId, "recoleccion", "Moto recolectada por mora — recepción registrada", profile.id);

      // 3. Contrato → Suspendido, moto → Recuperada
      const { error: errSusp } = await suspenderContrato(contratoId, motoId);
      if (errSusp) { setError("Error al suspender el contrato: " + errSusp); return; }

      // 3b. Si entra directo a taller, el estado físico manda sobre "Recuperada"
      if (motoId && destino === "taller") {
        await supabase.from("motos").update({ estado: "Mantenimiento" }).eq("id", motoId);
      }

      // 4. Multa de recolección (se cobra cada vez que se recolecta)
      const { error: errDeuda } = await registrarDeuda(
        contratoId, "multa_recoleccion", "Multa por recolección/inmovilización", 20000, profile.id,
      );
      if (errDeuda) { setError("Error al registrar la multa: " + errDeuda); return; }

      setExito(true);
      setTimeout(() => { onDone?.(); onClose(); }, 1200);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(520px, 96vw)", maxHeight: "calc(100dvh - 60px)", overflowY: "auto",
        background: "white", borderRadius: 20, padding: 24, zIndex: 401,
        boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>🚚 Registrar recolección</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, textTransform: "uppercase" }}>
              {placa} · {clienteNombre}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "#fef3c7", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
          Al guardar: el contrato queda Suspendido, la moto Recuperada, y se crea la multa de $20.000 — todo en un solo paso.
        </div>

        <div>
          <div style={labelStyle}>¿Dónde queda guardada la moto?</div>
          <select style={inputStyle} value={destino} onChange={e => setDestino(e.target.value as UbicacionFisica)}>
            {DESTINOS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div>
          <div style={labelStyle}>Condición general del vehículo</div>
          <select style={inputStyle} value={condicion} onChange={e => setCondicion(e.target.value as CondicionVehiculo)}>
            <option value="buena">Buena</option>
            <option value="regular">Regular</option>
            <option value="mala">Mala</option>
          </select>
        </div>

        <div>
          <div style={labelStyle}>Daños visibles (si aplica)</div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 50 }} value={danos} onChange={e => setDanos(e.target.value)} placeholder="Describe los daños si los hay..." />
        </div>

        <div>
          <div style={labelStyle}>Kilometraje actual</div>
          <MoneyInput label="" value={kilometros} onChange={setKilometros} />
        </div>

        <div>
          <div style={labelStyle}>Fotos del estado de la moto</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: fotos.length > 0 ? 8 : 0 }}>
            {fotos.map((f, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={f} alt={`Foto ${i + 1}`} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }} />
                <button type="button" onClick={() => setFotos(prev => prev.filter((_, j) => j !== i))}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", border: "none", background: "#dc2626", color: "white", fontSize: 11, cursor: "pointer", lineHeight: 1 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([["📷 Cámara", true], ["🖼 Galería", false]] as [string, boolean][]).map(([label, conCamara]) => (
              <label key={label} style={{ cursor: "pointer" }}>
                <div style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "white", fontWeight: 700, fontSize: 13, color: "#334155" }}>{label}</div>
                <input
                  type="file"
                  accept="image/*"
                  {...(conCamara ? { capture: "environment" as const } : {})}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setFotos(prev => [...prev, ev.target?.result as string]);
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={labelStyle}>Observaciones</div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 50 }} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
        </div>

        {error && <div style={{ color: "#991b1b", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "#166534", background: "#dcfce7", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✅ Recolección registrada — contrato suspendido, multa creada.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || exito} style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "Confirmar recolección"}
          </button>
        </div>
      </div>
    </>
  );
}
