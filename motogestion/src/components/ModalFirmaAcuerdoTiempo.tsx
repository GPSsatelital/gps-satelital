import { useEffect, useMemo, useState } from "react";
import CanvasFirma from "./CanvasFirma";
import LectorHuella from "./LectorHuella";
import { htmlAcuerdoTiempo, imprimirAcuerdoTiempo, type DatosAcuerdoTiempo } from "../utils/generarDocumentoAcuerdoTiempo";

// FIRMAR EL ACUERDO DE TIEMPO EN PANTALLA — mismo orden que la firma de liquidaciones (pedido del
// dueño, 22-ago: "que se pueda generar, firmar e imprimir como los de liquidación"):
// PRIMERO el cliente lee el borrador, DESPUÉS firma. La huella sale de la del registro.
//
// Este modal NO sube nada: arma el PDF final con firma+huella incrustadas y se lo devuelve al
// modal de tiempo fuera de servicio, que lo mete en su casillero de "documento firmado" y sigue
// su flujo de siempre (crearAcuerdoTiempo + subirDocumentoAcuerdo intactos). El camino de papel
// (imprimir → firmar a mano → foto) sigue disponible en el modal padre.

export default function ModalFirmaAcuerdoTiempo({
  datos, huellaRegistroUrl, onCerrar, onFirmado,
}: {
  datos: DatosAcuerdoTiempo;
  /** URL de la huella que el cliente dio al registrarse. Si existe, no se le vuelve a pedir. */
  huellaRegistroUrl: string | null;
  onCerrar: () => void;
  /** Recibe el PDF firmado listo para el casillero de "documento firmado". */
  onFirmado: (pdf: File) => void;
}) {
  const [firma, setFirma] = useState<string | null>(null);
  const [huellaNueva, setHuellaNueva] = useState<string | null>(null);
  const [huellaRegistro, setHuellaRegistro] = useState<string | null>(null);
  const huella = huellaRegistro ?? huellaNueva;
  const [revisado, setRevisado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A dataURL porque el PDF se arma con html2canvas, y una imagen por URL le "ensucia" el canvas
  // (CORS) y sale en blanco. Mismo tratamiento que la firma de liquidaciones.
  useEffect(() => {
    let vivo = true;
    if (!huellaRegistroUrl) { setHuellaRegistro(null); return; }
    if (huellaRegistroUrl.startsWith("data:")) { setHuellaRegistro(huellaRegistroUrl); return; }
    import("../utils/pdf").then(({ urlADataUrl }) => urlADataUrl(huellaRegistroUrl))
      .then(d => { if (vivo) setHuellaRegistro(d); })
      .catch(() => { if (vivo) setHuellaRegistro(null); });
    return () => { vivo = false; };
  }, [huellaRegistroUrl]);

  const borrador = useMemo(() => htmlAcuerdoTiempo(datos, { borrador: true }), [datos]);

  async function handleFirmar() {
    if (guardando || !firma) return;
    setGuardando(true);
    setError(null);
    try {
      const html = htmlAcuerdoTiempo(datos, { firmaUrl: firma, huellaUrl: huella, fechaFirma: new Date().toISOString() });
      const { htmlAPdfBlob } = await import("../utils/pdf");
      const pdf = await htmlAPdfBlob(html);
      onFirmado(new File([pdf], "acuerdo-tiempo-firmado.pdf", { type: "application/pdf" }));
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo armar el documento firmado.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "var(--card)", borderRadius: 16, width: "100%", maxWidth: 620, minWidth: 0, maxHeight: "96vh", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Firmar acuerdo de tiempo</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {datos.cliente.nombre} · {datos.placa}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>1. Muéstrele el acuerdo al cliente</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
              Copia de revisión, marcada como borrador. Léala con él antes de pedirle la firma.
            </div>
            <iframe title="Borrador del acuerdo" srcDoc={borrador}
              style={{ width: "100%", height: 280, border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }} />
            <button onClick={() => imprimirAcuerdoTiempo(datos, { borrador: true })}
              style={{ marginTop: 10, padding: "9px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--soft2)", color: "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              🖨️ Imprimir borrador
            </button>
          </div>

          <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)" }}>
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              background: revisado ? "var(--accent-soft)" : "var(--soft2)",
              border: `1px solid ${revisado ? "var(--accent-line)" : "var(--line)"}`,
            }}>
              <input type="checkbox" checked={revisado} onChange={e => setRevisado(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                2. El cliente ya lo leyó y está de acuerdo
              </span>
            </label>
          </div>

          {revisado && (
            <>
              <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>3. Firma del cliente</div>
                <CanvasFirma label="Firma del cliente" modal opcional={false} onChange={setFirma} />
              </div>
              <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 2 }}>4. Huella del cliente</div>
                {huellaRegistroUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--line)", marginTop: 8 }}>
                    <img src={huellaRegistro ?? huellaRegistroUrl} alt="Huella del registro"
                      style={{ width: 64, height: 64, objectFit: "contain", background: "#fff", borderRadius: 8, border: "1px solid var(--line)", flexShrink: 0 }} />
                    <span style={{ minWidth: 0, fontSize: 13, color: "var(--ok-ink)", fontWeight: 600 }}>
                      {huellaRegistro ? "Se usa la del registro — va en el documento" : "Cargando la huella..."}
                    </span>
                  </div>
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
            {guardando ? "Armando el documento..." : firma ? "Firmar" : "Falta la firma"}
          </button>
        </div>
      </div>
    </div>
  );
}
