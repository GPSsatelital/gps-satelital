import { useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useEnvioMensaje } from "../hooks/useEnvioMensaje";
import type { ClaveMensaje } from "../hooks/useMensajesWhatsapp";
import { resumirTanda, type ResultadoEnvio, type MensajeEstado } from "../utils/mensajeria";

// ENVÍO MASIVO (Fase 2 de la integración con ZALA, 8-sep-2026).
// El grupo lo define el chip del panel Hoy (Recolección / Mora / Gabela / Pagan hoy) más el
// buscador; aquí solo se ve a quiénes les va a llegar, con qué mensaje y por cuánto, y se confirma.
// Cada envío pasa por la MISMA tubería que el botón individual (`useEnvioMensaje.enviar`): plantilla
// + variables, gestión con estado real. Va uno por uno con una pausa corta: ZALA encola y aplica
// sus frenos (horario legal, cupo, aprobación).
//
// Solo funciona con el canal oficial conectado: por WhatsApp normal no se pueden abrir 40 chats, y
// ese era justamente el camino que bloqueó el número. Sin ZALA, el botón se ve pero no manda.

export type DestinatarioMasivo = {
  contratoId: string;
  nombre: string;
  placa: string;
  telefono: string | null | undefined;
  clave: ClaveMensaje;
  vars: Record<string, string | number>;
  /** Lo que se le va a cobrar, ya escrito ("$202.000"), para que quien confirma lo vea. */
  valorTexto: string;
};

type Fila = DestinatarioMasivo & { resultado?: ResultadoEnvio };

const CLAVE_LABEL: Record<string, string> = {
  dia_pago: "Día de pago", gabela: "Gabela", mora: "Mora", recoleccion: "Aviso de recolección", moto_retenida: "Moto retenida",
};

const ESTADO_LABEL: Record<MensajeEstado, { texto: string; color: string; bg: string }> = {
  en_cola:          { texto: "en cola",        color: "var(--accent-ink)", bg: "var(--accent-soft)" },
  enviado:          { texto: "enviado",        color: "var(--ok-ink)",     bg: "var(--ok-soft)" },
  entregado:        { texto: "entregado",      color: "var(--ok-ink)",     bg: "var(--ok-soft)" },
  leido:            { texto: "leído",          color: "var(--ok-ink)",     bg: "var(--ok-soft)" },
  fallo:            { texto: "falló",          color: "var(--bad-ink)",    bg: "var(--bad-soft)" },
  sin_conexion:     { texto: "sin conexión",   color: "var(--bad-ink)",    bg: "var(--bad-soft)" },
  sin_numero:       { texto: "sin número",     color: "var(--warn-ink)",   bg: "var(--warn-soft)" },
  sin_permiso:      { texto: "sin permiso",    color: "var(--warn-ink)",   bg: "var(--warn-soft)" },
  sin_plantilla:    { texto: "desactivado",    color: "var(--warn-ink)",   bg: "var(--warn-soft)" },
  abierto_whatsapp: { texto: "abrió WhatsApp", color: "var(--warn-ink)",   bg: "var(--warn-soft)" },
};

export default function ModalEnvioMasivo({ destinatarios, titulo, omitidos, onClose }: {
  destinatarios: DestinatarioMasivo[];
  /** El chip activo ("🔴 Mora", "Todos"…), para que se lea qué grupo es. */
  titulo: string;
  /** Cuántos del filtro ya recibieron mensaje hoy y por eso no están en la lista. */
  omitidos: number;
  onClose: () => void;
}) {
  useBloquearScrollFondo();
  const { enviar, zalaConectada } = useEnvioMensaje();
  const [filas, setFilas] = useState<Fila[]>(destinatarios);
  const [enviando, setEnviando] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [progreso, setProgreso] = useState(0);

  async function handleEnviar() {
    if (enviando || terminado) return;   // anti-doble-clic: esto manda mensajes reales
    if (!zalaConectada) return;
    setEnviando(true);
    try {
      for (let i = 0; i < destinatarios.length; i++) {
        const d = destinatarios[i];
        const r = await enviar({
          contratoId: d.contratoId,
          telefono: d.telefono,
          clave: d.clave,
          vars: d.vars,
          tipoGestion: "mensaje_recordatorio",
          resultado: `Mensaje masivo (${CLAVE_LABEL[d.clave] ?? d.clave})`,
          // La tanda entra a la cola de aprobación del dueño; los botones sueltos salen directo.
          origen: "masivo",
        });
        setFilas(prev => prev.map((f, j) => (j === i ? { ...f, resultado: r } : f)));
        setProgreso(i + 1);
        await new Promise(res => setTimeout(res, 250));
      }
      setTerminado(true);
    } finally {
      setEnviando(false);
    }
  }

  const resumen = resumirTanda(filas.map(f => f.resultado).filter((r): r is ResultadoEnvio => !!r));
  const sinNumero = destinatarios.filter(d => !d.telefono).length;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1100 }}
      onClick={enviando ? undefined : onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, background: "var(--card)", borderRadius: 20, padding: 20, display: "grid", gap: 14,
          maxHeight: "calc(100dvh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📨 Envío masivo · {titulo}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {destinatarios.length} cliente{destinatarios.length !== 1 ? "s" : ""}, cada uno con el mensaje que le toca hoy.
              {omitidos > 0 && <> {omitidos} ya recibieron mensaje hoy y no se repiten.</>}
            </div>
          </div>
          {!enviando && (
            <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer", flexShrink: 0 }}>✕</button>
          )}
        </div>

        {!zalaConectada && (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 13, color: "var(--warn-ink)", fontWeight: 600, lineHeight: 1.5 }}>
            El envío masivo solo funciona con el canal oficial (ZALA) conectado. Por WhatsApp normal no
            se pueden abrir tantos chats, y ese fue el camino que bloqueó el número. Mientras tanto, los
            mensajes van uno por uno desde cada tarjeta.
          </div>
        )}

        {sinNumero > 0 && (
          <div style={{ fontSize: 12, color: "var(--warn-ink)", fontWeight: 600 }}>
            {sinNumero} sin número de WhatsApp registrado: a esos no les llega.
          </div>
        )}

        <div style={{ border: "1px solid var(--line)", borderRadius: 14, maxHeight: "42vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {filas.map((f, i) => {
            const est = f.resultado ? ESTADO_LABEL[f.resultado.estado] : null;
            return (
              <div key={f.contratoId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: i === 0 ? "none" : "1px solid var(--line)", fontSize: 13 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, textTransform: "uppercase", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre || "Sin nombre"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{f.placa || "—"}</span>
                    {" · "}{CLAVE_LABEL[f.clave] ?? f.clave}{" · "}{f.valorTexto}
                    {f.resultado?.motivo && <> · <span style={{ color: "var(--bad-ink)" }}>{f.resultado.motivo}</span></>}
                  </div>
                </div>
                {est ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: est.color, background: est.bg, borderRadius: 999, padding: "3px 9px", flexShrink: 0 }}>{est.texto}</span>
                ) : !f.telefono ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 999, padding: "3px 9px", flexShrink: 0 }}>sin número</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {terminado && (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", fontSize: 13, color: "var(--ok-ink)", fontWeight: 700 }}>
            Listo: {resumen.salieron} salieron · {resumen.enCola} en cola · {resumen.fallaron} fallaron
            {resumen.noSalieron > 0 && <> · {resumen.noSalieron} no salieron</>}. Cada uno quedó anotado en su historial.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
          {enviando && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Enviando {progreso} de {destinatarios.length}…</span>}
          <button onClick={onClose} disabled={enviando}
            style={{ background: "var(--soft)", color: "var(--muted2)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: enviando ? "not-allowed" : "pointer", fontSize: 14, opacity: enviando ? 0.6 : 1 }}>
            {terminado ? "Cerrar" : "Cancelar"}
          </button>
          {!terminado && (
            <button onClick={handleEnviar} disabled={enviando || !zalaConectada || destinatarios.length === 0}
              style={{ background: "var(--accent-ink)", color: "var(--card)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: (enviando || !zalaConectada) ? "not-allowed" : "pointer", fontSize: 14, opacity: (enviando || !zalaConectada) ? 0.6 : 1 }}>
              {enviando ? "Enviando..." : `Enviar ${destinatarios.length} mensaje${destinatarios.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
