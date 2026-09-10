import { useState } from "react";
import { usePush } from "../hooks/usePush";
import { card, primaryBtn, secondaryBtn } from "../styles/shared";

// EL INTERRUPTOR DE LOS AVISOS — va arriba de Mi Día.
//
// Está acá y no enterrado en Configuración por dos razones: Mi Día es la pantalla que todos abren
// en la mañana, y Configuración no la ve todo el mundo. Un interruptor que la gente no encuentra
// es un interruptor apagado.
//
// La franja solo se muestra cuando hay algo que hacer: si los avisos ya están prendidos desaparece
// sola. No se le repite a nadie todos los días algo que ya resolvió.

export default function AvisosCelular() {
  const { estado, trabajando, error, activar, desactivar, probar } = usePush();
  const [aviso, setAviso] = useState<string | null>(null);
  const [probando, setProbando] = useState(false);
  const [verDetalle, setVerDetalle] = useState(false);

  if (estado === "cargando") return null;

  async function handleProbar() {
    if (probando) return;
    setProbando(true);
    try {
      setAviso(await probar());
      setTimeout(() => setAviso(null), 6000);
    } finally {
      setProbando(false);
    }
  }

  const caja = (fondo: string, linea: string): React.CSSProperties => ({
    ...card, padding: "11px 13px", marginBottom: 12, textAlign: "left",
    background: fondo, border: `1px solid ${linea}`,
  });

  // Ya está prendido: una línea discreta, con la opción de probarlo o apagarlo.
  if (estado === "prendido") {
    return (
      <div style={caja("var(--ok-soft)", "var(--ok-line)")}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok-ink)" }}>
              Avisos activados en este celular
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
              Cada mañana te llega tu resumen, aunque tengas la app cerrada.
            </div>
          </div>
          <button onClick={handleProbar} disabled={probando}
            style={{ ...secondaryBtn, fontSize: 11.5, padding: "6px 12px", opacity: probando ? 0.6 : 1 }}>
            {probando ? "Enviando..." : "Probar"}
          </button>
          <button onClick={() => setVerDetalle(v => !v)}
            style={{ ...secondaryBtn, fontSize: 11.5, padding: "6px 12px" }}>
            {verDetalle ? "Cerrar" : "Apagar"}
          </button>
        </div>

        {verDetalle && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
            Si lo apagas, dejas de recibir avisos <b>en este celular</b>. En los otros aparatos
            donde lo hayas prendido siguen llegando.
            <div style={{ marginTop: 8 }}>
              <button onClick={() => { void desactivar(); setVerDetalle(false); }} disabled={trabajando}
                style={{ ...secondaryBtn, fontSize: 11.5, padding: "6px 12px", color: "var(--bad-ink)" }}>
                {trabajando ? "Apagando..." : "Sí, apagar en este celular"}
              </button>
            </div>
          </div>
        )}

        {aviso && <div style={{ marginTop: 8, fontSize: 12, color: "var(--ok-ink)" }}>{aviso}</div>}
        {error && <div role="alert" style={{ marginTop: 8, fontSize: 12, color: "var(--bad-ink)" }}>{error}</div>}
      </div>
    );
  }

  // Le dio "Bloquear": desde la app ya no se puede volver a preguntar, hay que ir a los ajustes.
  if (estado === "bloqueado") {
    return (
      <div style={caja("var(--warn-soft)", "var(--warn-line)")}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)" }}>
          Los avisos están bloqueados en este celular
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
          Alguna vez se tocó «Bloquear» y el celular ya no deja volver a preguntar desde acá.
          Para arreglarlo: abre los <b>ajustes del navegador</b> → <b>Configuración del sitio</b> →
          <b> Notificaciones</b>, busca MotoGestión y ponlo en <b>Permitir</b>. Después vuelve
          a esta pantalla.
        </div>
      </div>
    );
  }

  if (estado === "no-soportado") {
    return (
      <div style={caja("var(--soft2)", "var(--line)")}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          Este aparato no puede recibir avisos
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
          Si es un iPhone, primero hay que <b>agregar la app a la pantalla de inicio</b>.
          Dentro del navegador no llegan.
        </div>
      </div>
    );
  }

  // Apagado: la invitación.
  return (
    <div style={caja("var(--accent-soft4)", "var(--accent-line)")}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-ink)" }}>
            Activa los avisos en este celular
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
            Cada mañana te llega tu lista de pendientes, sin tener que abrir la app.
          </div>
        </div>
        <button onClick={() => void activar()} disabled={trabajando}
          style={{ ...primaryBtn, fontSize: 12, padding: "8px 14px", opacity: trabajando ? 0.6 : 1 }}>
          {trabajando ? "Activando..." : "Activar"}
        </button>
      </div>
      <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--muted)", lineHeight: 1.45 }}>
        El celular te va a preguntar si permites los avisos. Hay que decir que <b>sí</b>.
      </div>
      {error && <div role="alert" style={{ marginTop: 8, fontSize: 12, color: "var(--bad-ink)" }}>{error}</div>}
    </div>
  );
}
