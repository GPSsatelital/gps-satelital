import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTareas, EVIDENCIA_LABEL, type TipoEvidencia } from "../hooks/useTareas";
import { useSubadmins } from "../hooks/useSubadmins";
import { useMotos } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { card, inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import { hoyISO } from "../utils/fecha";

// Montarle una tarea a alguien. Solo lo ve quien tiene el permiso `asignar_tarea` (hoy ADMIN y
// ADMIN_PRINCIPAL); la base lo vuelve a verificar al guardar, así que esconder el botón no es la
// única defensa.

const EVIDENCIAS: TipoEvidencia[] = ["foto", "ubicacion", "comentario", "firma"];

export default function ModalAsignarTarea({ onClose, onHecho }: { onClose: () => void; onHecho: () => void }) {
  const { profile } = useAuth();
  const { crearTarea } = useTareas();
  const { subadmins } = useSubadmins();
  const { motos } = useMotos();
  const { contratos } = useContratos();

  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [asignadaA, setAsignadaA] = useState("");
  const [fechaLimite, setFechaLimite] = useState(hoyISO());
  const [placa, setPlaca] = useState("");
  const [evidencias, setEvidencias] = useState<TipoEvidencia[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function alternar(e: TipoEvidencia) {
    setEvidencias(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);
  }

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) return;
    setError(null);
    if (!titulo.trim()) { setError("Escribe qué hay que hacer."); return; }
    if (!asignadaA) { setError("Elige a quién se la vas a asignar."); return; }

    // Si escribió una placa, la tarea queda amarrada a esa moto y —si tiene contrato vivo— también
    // a su cliente. Así desde la tarea se puede abrir la ficha sin buscar a mano.
    const moto = placa.trim() ? motos.find(m => m.placa.toUpperCase() === placa.trim().toUpperCase()) : null;
    if (placa.trim() && !moto) { setError(`No existe ninguna moto con la placa ${placa.trim().toUpperCase()}.`); return; }
    const contrato = moto ? contratos.find(c => c.moto_id === moto.id && (c.estado === "Activo" || c.estado === "Suspendido")) : null;

    setGuardando(true);
    try {
      const { error: err } = await crearTarea({
        titulo, detalle,
        asignada_a: asignadaA,
        fecha_limite: fechaLimite || null,
        evidencias_requeridas: evidencias,
        moto_id: moto?.id ?? null,
        contrato_id: contrato?.id ?? null,
        cliente_id: contrato?.cliente_id ?? null,
      }, profile.id);
      if (err) { setError(err); return; }
      onHecho();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 480, maxHeight: "calc(100dvh - 120px)", overflowY: "auto" }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text)" }}>Montar una tarea</h3>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, marginBottom: 16, lineHeight: 1.45 }}>
          Trabajo puntual, distinto de los cobros del día. Le va a aparecer en su “Mi día”.
        </div>

        <div style={{ display: "grid", gap: 13 }}>
          <div>
            <div style={labelStyle}>¿Qué hay que hacer?</div>
            <input style={inputStyle} value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Recoger la tarjeta de propiedad" />
          </div>

          <div>
            <div style={labelStyle}>Instrucciones (opcional)</div>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={2} value={detalle} onChange={e => setDetalle(e.target.value)}
              placeholder="Lo que necesite saber para hacerla" />
          </div>

          <div>
            <div style={labelStyle}>¿A quién?</div>
            <select style={inputStyle} value={asignadaA} onChange={e => setAsignadaA(e.target.value)}>
              <option value="">Elegir persona...</option>
              {subadmins.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={labelStyle}>¿Para cuándo?</div>
              <input type="date" style={inputStyle} value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={labelStyle}>Placa (opcional)</div>
              <input style={inputStyle} list="placas-tarea" value={placa}
                onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="Si es sobre una moto" />
              <datalist id="placas-tarea">
                {motos.map(m => <option key={m.id} value={m.placa} />)}
              </datalist>
            </div>
          </div>

          <div>
            <div style={labelStyle}>¿Qué evidencia debe dejar?</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 4 }}>
              {EVIDENCIAS.map(e => {
                const on = evidencias.includes(e);
                return (
                  <button key={e} type="button" onClick={() => alternar(e)} style={{
                    fontSize: 12, fontWeight: 600, padding: "7px 13px", borderRadius: 999, cursor: "pointer",
                    background: on ? "var(--accent-soft)" : "var(--soft2)",
                    color: on ? "var(--accent-ink)" : "var(--muted)",
                    border: `1px solid ${on ? "var(--accent-line)" : "var(--line)"}`,
                  }}>
                    {on ? "✓ " : ""}{EVIDENCIA_LABEL[e]}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.45 }}>
              Si no marcas ninguna, le basta con decir que la cumplió. Lo que marques, se lo va a
              pedir el sistema antes de dejarla cerrar.
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", color: "var(--bad-ink)", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={secondaryBtn}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando} style={{ ...primaryBtn, opacity: guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "Asignar tarea"}
          </button>
        </div>
      </div>
    </div>
  );
}
