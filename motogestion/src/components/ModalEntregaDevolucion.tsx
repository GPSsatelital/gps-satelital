import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import MoneyInput from "./MoneyInput";
import { ANGULOS_FOTO, IconoAngulo, type AnguloFoto } from "./FotosAngulos";

// Formulario de ENTREGA al devolver una moto retenida ya paga. Documenta el estado de
// la moto igual que la entrega original (6 fotos guiadas, incl. la persona que la recibe
// como respaldo legal) + km + condición. Un solo guardado encadena: sube la evidencia,
// deja constancia de la entrega (recepciones_vehiculo, destino con_cliente) y reactiva
// el contrato (vuelve a Activo, moto a Asignada).

interface Props {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  motoId: string | null;
  placa: string;
  onClose: () => void;
  onDone?: () => void;
}

export default function ModalEntregaDevolucion({ contratoId, clienteId, clienteNombre, motoId, placa, onClose, onDone }: Props) {
  const { registrarRecepcion } = useUbicaciones();
  const { reactivarContrato } = useContratos();
  const { profile } = useAuth();

  const [condicion, setCondicion] = useState<"buena" | "regular" | "mala">("buena");
  const [kilometros, setKilometros] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fotosAngulos, setFotosAngulos] = useState<Partial<Record<AnguloFoto, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function subirFotos(): Promise<string[]> {
    const urls: string[] = [];
    const stamp = Date.now();
    for (const { key } of ANGULOS_FOTO) {
      const dataUrl = fotosAngulos[key];
      if (!dataUrl) continue;
      const blob = await (await fetch(dataUrl)).blob();
      const path = `entregas/${contratoId}/devolucion_${stamp}_${key}.jpg`;
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
    const faltantes = ANGULOS_FOTO.filter(a => !fotosAngulos[a.key]);
    if (faltantes.length > 0) { setError(`Falta la foto: ${faltantes.map(a => a.label).join(", ")}.`); return; }
    setError(null);
    setGuardando(true);
    try {
      // 1. Evidencia de la entrega (fotos + km + condición)
      if (motoId) {
        const fotosUrls = await subirFotos();
        const { error: errRec } = await registrarRecepcion({
          moto_id: motoId,
          contrato_id: contratoId,
          cliente_id: clienteId,
          motivo: "otro",
          condicion_general: condicion,
          kilometros: kilometros ? Number(kilometros) : undefined,
          ubicacion_destino: "con_cliente",
          quien_recibe: profile.id,
          nombre_entrega: clienteNombre,
          fotos: fotosUrls,
          observaciones: `Entrega de moto al cliente tras pago de recuperación.${observaciones ? " " + observaciones : ""}`,
        });
        if (errRec) { setError("Error al registrar la evidencia de entrega: " + errRec); return; }
      }

      // 2. Reactivar el contrato → Activo, moto → Asignada
      const { error: errReact } = await reactivarContrato(contratoId, motoId);
      if (errReact) { setError("Error al reactivar el contrato: " + errReact); return; }

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
        background: "var(--card)", borderRadius: 20, padding: 24, zIndex: 401,
        boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>✓ Entregar moto al cliente</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>
              {placa} · {clienteNombre}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--ok-soft)", fontSize: 12, color: "var(--ok-ink)", fontWeight: 600 }}>
          Al guardar: se archiva la evidencia de cómo y a quién se devolvió la moto, y el contrato vuelve a Activo.
        </div>

        <div>
          <div style={labelStyle}>Condición general del vehículo</div>
          <select style={inputStyle} value={condicion} onChange={e => setCondicion(e.target.value as "buena" | "regular" | "mala")}>
            <option value="buena">Buena</option>
            <option value="regular">Regular</option>
            <option value="mala">Mala</option>
          </select>
        </div>

        <div>
          <div style={labelStyle}>Kilometraje actual</div>
          <MoneyInput label="" value={kilometros} onChange={setKilometros} />
        </div>

        <div>
          <div style={labelStyle}>Fotos del estado de la moto (6 obligatorias — la última con la persona que recibe)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
            {ANGULOS_FOTO.map(({ key, label }) => {
              const dataUrl = fotosAngulos[key];
              return (
                <div key={key} style={{ borderRadius: 12, border: `1px solid ${dataUrl ? "var(--ok-line)" : "var(--line)"}`, background: dataUrl ? "var(--ok-soft)" : "var(--soft2)", padding: 8, textAlign: "center" }}>
                  {dataUrl ? (
                    <div style={{ position: "relative" }}>
                      <img src={dataUrl} alt={label} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8 }} />
                      <button type="button" onClick={() => setFotosAngulos(p => { const n = { ...p }; delete n[key]; return n; })} style={{
                        position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
                        background: "var(--bad)", border: "none", color: "var(--card)", fontSize: 10, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                      <IconoAngulo angulo={key} />
                    </div>
                  )}
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", marginTop: 4, marginBottom: 6 }}>{label}</div>
                  {!dataUrl && (
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "var(--accent)" }} title="Cámara">
                        📷
                        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setFotosAngulos(p => ({ ...p, [key]: ev.target?.result as string }));
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                      </label>
                      <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "var(--accent-soft)" }} title="Galería">
                        🖼
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setFotosAngulos(p => ({ ...p, [key]: ev.target?.result as string }));
                            reader.readAsDataURL(file);
                            e.target.value = "";
                          }} />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div style={labelStyle}>Observaciones</div>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 50 }} value={observaciones} onChange={e => setObservaciones(e.target.value)} />
        </div>

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✅ Moto entregada — contrato reactivado.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || exito} style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "✓ Confirmar entrega"}
          </button>
        </div>
      </div>
    </>
  );
}
