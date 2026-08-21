import { useEffect, useMemo, useState } from "react";
import CanvasFirma from "./CanvasFirma";
import LectorHuella from "./LectorHuella";
import { htmlLiquidacion, imprimirLiquidacion } from "../utils/generarDocumentoLiquidacion";
import type { Liquidacion } from "../hooks/useLiquidaciones";

// FIRMAR LA LIQUIDACIÓN EN PANTALLA.
//
// El orden importa y es el que pidió el dueño: PRIMERO el cliente ve el documento —en pantalla o
// impreso— y solo después firma. Antes se imprimía, él firmaba en papel y había que fotografiarlo;
// eso sigue disponible como respaldo (el lector de huella solo trabaja en el PC de la oficina).
//
// El borrador que se muestra sale del MISMO armador que el documento final. No puede decir una
// cosa acá y otra en lo que se firma.

type Cliente = { nombre: string; cedula?: string; telefono?: string };
type Moto = { marca?: string; modelo?: string; placa?: string };

export default function ModalFirmaLiquidacion({
  liq, cliente, moto, huellaRegistroUrl, onCerrar, onFirmar,
}: {
  liq: Liquidacion;
  cliente: Cliente;
  moto: Moto | null;
  /** URL de la huella que el cliente dio al registrarse. Si existe, no se le vuelve a pedir. */
  huellaRegistroUrl: string | null;
  onCerrar: () => void;
  onFirmar: (firma: string, huella: string | null, html: string) => Promise<{ error: string | null }>;
}) {
  const [firma, setFirma] = useState<string | null>(null);
  const [huellaNueva, setHuellaNueva] = useState<string | null>(null);
  const [huellaRegistro, setHuellaRegistro] = useState<string | null>(null);
  // Decisión del dueño (21-ago): usar la huella del registro. Ya la dio una vez y es la misma
  // persona; volver a pedírsela solo agrega un paso que depende de que el lector responda.
  // Si el cliente nunca la dio (migrados viejos), ahí sí se captura en el momento.
  const huella = huellaRegistro ?? huellaNueva;

  // Se baja a dataURL porque el PDF se arma con html2canvas, y una imagen traída de Storage por
  // URL le "ensucia" el canvas (CORS) y sale en blanco. Mismo tratamiento que ya usa regenerarDocs.
  useEffect(() => {
    let vivo = true;
    if (!huellaRegistroUrl) { setHuellaRegistro(null); return; }
    if (huellaRegistroUrl.startsWith("data:")) { setHuellaRegistro(huellaRegistroUrl); return; }
    import("../utils/pdf").then(({ urlADataUrl }) => urlADataUrl(huellaRegistroUrl))
      .then(d => { if (vivo) setHuellaRegistro(d); })
      .catch(() => { if (vivo) setHuellaRegistro(null); });
    return () => { vivo = false; };
  }, [huellaRegistroUrl]);
  const [revisado, setRevisado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borrador = useMemo(
    () => htmlLiquidacion(liq, cliente, moto, { borrador: true }),
    [liq, cliente, moto]
  );

  async function handleFirmar() {
    if (guardando || !firma) return;
    setGuardando(true);
    setError(null);
    try {
      const html = htmlLiquidacion(liq, cliente, moto, {
        firmaUrl: firma,
        huellaUrl: huella,
        fechaFirma: new Date().toISOString(),
      });
      const { error: err } = await onFirmar(firma, huella, html);
      if (err) setError(err);
      else onCerrar();
    } finally {
      setGuardando(false);
    }
  }

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", zIndex: 1200,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 8,
  };
  // minWidth:0 explícito: es hijo de un flex y a 375px se desbordaría por su propio contenido.
  const caja: React.CSSProperties = {
    background: "var(--card)", borderRadius: 16, width: "100%", maxWidth: 620, minWidth: 0,
    maxHeight: "96vh", boxSizing: "border-box",
    display: "flex", flexDirection: "column", overflow: "hidden",
  };
  const seccion: React.CSSProperties = {
    padding: "14px 16px", borderTop: "1px solid var(--line)",
  };

  return (
    <div style={overlay} onClick={onCerrar}>
      <div style={caja} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Firmar liquidación</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {liq.numero} · {cliente.nombre}{moto?.placa ? ` · ${moto.placa}` : ""}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {/* ① Que lo lea ANTES de firmar */}
          <div style={{ ...seccion, borderTop: "none" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>1. Muéstrele la cuenta al cliente</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
              Esta es una copia de revisión, marcada como borrador. Léala con él antes de pedirle la firma.
            </div>
            <iframe
              title="Borrador de la liquidación"
              srcDoc={borrador}
              style={{ width: "100%", height: 300, border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}
            />
            <button
              onClick={() => imprimirLiquidacion(liq, cliente, moto, { borrador: true })}
              style={{ marginTop: 10, padding: "9px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              🖨️ Imprimir borrador
            </button>
          </div>

          {/* ② Confirmar que ya lo revisó */}
          <div style={seccion}>
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              background: revisado ? "var(--accent-soft)" : "var(--soft2)",
              border: `1px solid ${revisado ? "var(--accent-line)" : "var(--line)"}`,
            }}>
              <input type="checkbox" checked={revisado} onChange={(e) => setRevisado(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                2. El cliente ya revisó la cuenta y está de acuerdo
              </span>
            </label>
          </div>

          {/* ③ Firma + huella */}
          {revisado && (
            <>
              <div style={seccion}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>3. Firma del cliente</div>
                <CanvasFirma label="Firma del cliente" modal opcional={false} onChange={setFirma} />
              </div>
              <div style={seccion}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>4. Huella del cliente</div>
                {/* Se decide con la URL, no con la imagen ya bajada: si no, mientras baja se vería
                    el lector por un instante y el funcionario le pediría el dedo sin necesidad. */}
                {huellaRegistroUrl ? (
                  <>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                      Se usa la que dio al registrarse. No hay que volver a pedírsela.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--line)" }}>
                      <img src={huellaRegistro ?? huellaRegistroUrl} alt="Huella del registro"
                        style={{ width: 64, height: 64, objectFit: "contain", background: "#fff", borderRadius: 8, border: "1px solid var(--line)", flexShrink: 0 }} />
                      <span style={{ minWidth: 0, fontSize: 13, color: "var(--ok-ink)", fontWeight: 600 }}>
                        {huellaRegistro ? "Huella en archivo — va en el documento" : "Cargando la huella..."}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                      Este cliente no tiene huella registrada. Tómasela ahora, o firma sin ella — la firma es la que vale.
                    </div>
                    <LectorHuella label="Huella del cliente" onChange={setHuellaNueva} />
                  </>
                )}
              </div>
            </>
          )}

          {error && (
            <div style={{ margin: "0 16px 14px", padding: "10px 12px", borderRadius: 10, background: "var(--bad-soft)", color: "var(--bad-ink)", fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
          <button onClick={onCerrar} disabled={guardando}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={handleFirmar} disabled={guardando || !firma}
            style={{
              flex: 2, padding: "12px", borderRadius: 12, border: "none",
              background: firma ? "var(--ok)" : "var(--muted3)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: firma && !guardando ? "pointer" : "not-allowed",
              opacity: guardando ? 0.6 : 1,
            }}>
            {guardando ? "Guardando..." : firma ? "Firmar y guardar" : "Falta la firma"}
          </button>
        </div>
      </div>
    </div>
  );
}
