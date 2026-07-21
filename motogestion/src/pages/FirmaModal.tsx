import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { generarHTMLContrato, generarHTMLCertificado, generarHTMLPagare, type TipoDocumento } from "../hooks/useDocumentos";
import type { Contrato } from "../hooks/useContratos";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";

type Props = {
  contrato: Contrato;
  cliente: Cliente;
  moto: Moto | null;
  onClose: () => void;
  onCompletado: () => void;
};

const PASOS: { key: TipoDocumento; titulo: string; sub: string }[] = [
  { key: "contrato", titulo: "Contrato de arrendamiento", sub: "El cliente lee y firma el contrato de arriendo del vehículo." },
  { key: "certificado", titulo: "Certificado de conocimiento", sub: "El cliente demuestra que entendió las condiciones." },
  { key: "pagare", titulo: "Pagaré + Carta de instrucciones", sub: "Título valor en blanco como garantía legal." },
];

function fmt(n: number) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
}

type SubStep = "documento" | "firma" | "confirmacion";

export default function FirmaModal({ contrato, cliente, moto, onClose, onCompletado }: Props) {
  const [docIndex, setDocIndex] = useState(0);
  const [subStep, setSubStep] = useState<SubStep>("documento");
  const [leido, setLeido] = useState(false);
  const [firmas, setFirmas] = useState<Record<TipoDocumento, string | null>>({ contrato: null, certificado: null, pagare: null });
  const [cedulaFoto, setCedularFoto] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Canvas drawing setup
  useEffect(() => {
    if (subStep !== "firma") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "var(--text)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    hasDrawn.current = false;

    let drawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const pt = "touches" in e ? e.touches[0] : e;
      return {
        x: (pt.clientX - rect.left) * scaleX,
        y: (pt.clientY - rect.top) * scaleY,
      };
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      drawing = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      e.preventDefault();
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      hasDrawn.current = true;
      e.preventDefault();
    };
    const onUp = () => { drawing = false; };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp);

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [subStep, docIndex]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  }

  function captureSignature(): string | null {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn.current) return null;
    return canvas.toDataURL("image/png");
  }

  const pasoActual = PASOS[docIndex];

  function getHTML() {
    if (pasoActual.key === "contrato") return generarHTMLContrato(contrato, cliente, moto);
    if (pasoActual.key === "certificado") return generarHTMLCertificado(contrato, cliente);
    return generarHTMLPagare(contrato, cliente);
  }

  function handleImprimir() {
    const html = getHTML();
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${pasoActual.titulo}</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  }

  function goToFirma() {
    if (!leido) {
      setError("Debes confirmar que has leído el documento antes de continuar.");
      return;
    }
    setError(null);
    setSubStep("firma");
  }

  function goToConfirmacion() {
    const sig = captureSignature();
    if (!sig) {
      setError("Por favor dibuja tu firma en el recuadro antes de continuar.");
      return;
    }
    setFirmas(prev => ({ ...prev, [pasoActual.key]: sig }));
    setError(null);
    setSubStep("confirmacion");
  }

  function volverAFirmar() {
    setFirmas(prev => ({ ...prev, [pasoActual.key]: null }));
    setSubStep("firma");
  }

  function siguienteDocumento() {
    if (docIndex < PASOS.length - 1) {
      setDocIndex(i => i + 1);
      setSubStep("documento");
      setLeido(false);
      setError(null);
    }
  }

  async function subirFirma(tipo: TipoDocumento, dataUrl: string): Promise<string | null> {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `firmas/${contrato.id}/${tipo}_${Date.now()}.png`;
    const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function confirmarYGuardar() {
    setGuardando(true);
    setError(null);
    try {
      const urls: Record<string, string | null> = {};
      for (const p of PASOS) {
        const f = firmas[p.key];
        if (f) urls[p.key] = await subirFirma(p.key, f);
      }
      await supabase.from("contratos").update({
        firma_cliente: true,
        ...(urls.contrato ? { contrato_pdf_url: urls.contrato } : {}),
        ...(urls.certificado ? { certificado_pdf_url: urls.certificado } : {}),
        ...(urls.pagare ? { pagare_pdf_url: urls.pagare } : {}),
      }).eq("id", contrato.id);
      onCompletado();
    } catch {
      setError("No se pudieron guardar las firmas. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const isLastDoc = docIndex === PASOS.length - 1;
  const allSigned = PASOS.every(p => firmas[p.key]);

  // Sub-step labels for visual indicator
  const subStepLabels: SubStep[] = ["documento", "firma", "confirmacion"];
  const subStepNames = ["Documento", "Firma", "Confirmación"];

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 0 : 16, zIndex: 100, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 700,
          background: "var(--card)",
          borderRadius: isMobile ? 0 : 22,
          display: "flex",
          flexDirection: "column",
          maxHeight: isMobile ? "100dvh" : "96vh",
          height: isMobile ? "100dvh" : undefined,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(15,23,42,0.3)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", background: "var(--ink)", borderRadius: isMobile ? 0 : "22px 22px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hi)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Firma digital · Documento {docIndex + 1} de {PASOS.length}
              </div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 900, color: "var(--card)" }}>
                {cliente.nombre.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{pasoActual.titulo}</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.1)", border: "none", width: 32, height: 32,
              borderRadius: "50%", fontSize: 18, cursor: "pointer", color: "var(--card)",
              display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}>×</button>
          </div>

          {/* Doc stepper */}
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {PASOS.map((p, i) => (
              <div key={p.key} style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  background: i < docIndex ? "var(--ok)" : i === docIndex ? "var(--accent)" : "rgba(255,255,255,0.1)",
                  color: "var(--card)",
                }}>
                  {i < docIndex ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 10, fontWeight: i === docIndex ? 700 : 400, color: i === docIndex ? "var(--card)" : "var(--muted)", lineHeight: 1.3 }}>
                  {p.titulo}
                </div>
                {i < PASOS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i < docIndex ? "var(--ok)" : "rgba(255,255,255,0.1)", minWidth: 8 }} />
                )}
              </div>
            ))}
          </div>

          {/* Sub-step pill */}
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {subStepLabels.map((s, i) => (
              <div key={s} style={{
                flex: 1, textAlign: "center", padding: "5px 8px",
                borderRadius: 8, fontSize: 10, fontWeight: 700,
                background: subStep === s ? "rgba(2,132,199,0.35)" : subStepLabels.indexOf(subStep) > i ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
                color: subStep === s ? "var(--accent-hi)" : subStepLabels.indexOf(subStep) > i ? "var(--ok-line)" : "var(--muted3)",
                border: subStep === s ? "1px solid rgba(2,132,199,0.5)" : "1px solid transparent",
              }}>
                {subStepLabels.indexOf(subStep) > i ? "✓ " : ""}{subStepNames[i]}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* STEP: DOCUMENTO */}
          {subStep === "documento" && (
            <div style={{ padding: 0, display: "flex", flexDirection: "column", flex: 1 }}>

              {/* Resumen del contrato */}
              <div style={{ padding: "16px 20px", background: "var(--soft2)", borderBottom: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Resumen del contrato
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: "1 1 140px", background: "var(--card)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", fontWeight: 700 }}>Cliente</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 2, textTransform: "uppercase" }}>{cliente.nombre}</div>
                  </div>
                  {moto && (
                    <div style={{ flex: "1 1 120px", background: "var(--card)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--line)" }}>
                      <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", fontWeight: 700 }}>Moto</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 2 }}>{moto.placa}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{moto.marca} {moto.modelo}</div>
                    </div>
                  )}
                  <div style={{ flex: "1 1 120px", background: "var(--card)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10, color: "var(--faint)", textTransform: "uppercase", fontWeight: 700 }}>Tipo</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", marginTop: 2, textTransform: "uppercase" }}>{contrato.tipo_ruta}</div>
                  </div>
                  {contrato.valor_semanal != null && (
                    <div style={{ flex: "1 1 120px", background: "var(--accent-soft2)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--accent)" }}>
                      <div style={{ fontSize: 10, color: "var(--accent-ink)", textTransform: "uppercase", fontWeight: 700 }}>Valor semana</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)", marginTop: 2 }}>{fmt(contrato.valor_semanal)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contrato HTML */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: "var(--muted2)" }} dangerouslySetInnerHTML={{ __html: getHTML() }} />
              </div>

              {/* Checkbox + botón */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)", background: "var(--soft2)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 14 }}>
                  <input
                    type="checkbox"
                    checked={leido}
                    onChange={e => setLeido(e.target.checked)}
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted2)" }}>
                    He leído y entiendo el contenido de este documento
                  </span>
                </label>

                {error && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", background: "var(--bad-soft)", borderRadius: 10, fontSize: 12, color: "var(--bad-ink)", fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleImprimir} style={{
                    padding: "11px 16px", borderRadius: 12, border: "1px solid var(--line)",
                    background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 12, color: "var(--muted2)",
                  }}>
                    Imprimir
                  </button>
                  <button onClick={goToFirma} style={{
                    flex: 1, padding: "12px", borderRadius: 12, border: "none",
                    background: leido ? "linear-gradient(90deg, var(--accent), var(--accent-ink))" : "var(--faint)",
                    color: "var(--card)", fontWeight: 800, fontSize: 14, cursor: leido ? "pointer" : "not-allowed",
                    transition: "background 0.2s",
                  }}>
                    Proceder a firmar →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: FIRMA */}
          {subStep === "firma" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ padding: "20px 20px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Captura de firma</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Firma con el dedo o el ratón en el recuadro de abajo</div>
                </div>

                {/* Canvas */}
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>
                    Firma del cliente — {pasoActual.titulo}
                  </div>
                  <div style={{
                    borderRadius: 16, border: "2px dashed var(--line2)", background: "var(--soft2)",
                    overflow: "hidden", position: "relative",
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={200}
                      style={{ width: "100%", height: 200, display: "block", touchAction: "none", cursor: "crosshair" }}
                    />
                    <div style={{
                      position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                      fontSize: 11, color: "var(--line2)", pointerEvents: "none", userSelect: "none",
                      background: "var(--card)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--soft)",
                    }}>
                      Firme aquí con el dedo
                    </div>
                  </div>
                  <button onClick={clearCanvas} style={{
                    marginTop: 10, padding: "8px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", background: "var(--card)",
                    fontWeight: 700, cursor: "pointer", fontSize: 12, color: "var(--muted)",
                  }}>
                    Borrar firma
                  </button>
                </div>

                {/* Foto cédula — solo en primer documento */}
                {docIndex === 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>Foto de cédula (opcional)</div>
                    <label style={{ display: "inline-block", cursor: "pointer" }}>
                      <div style={{
                        padding: "10px 18px", borderRadius: 12,
                        border: `2px solid ${cedulaFoto ? "var(--ok)" : "var(--line2)"}`,
                        background: cedulaFoto ? "var(--ok-soft)" : "var(--soft2)",
                        fontSize: 13, fontWeight: 700,
                        color: cedulaFoto ? "var(--ok-ink)" : "var(--muted2)",
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                        <span style={{ fontSize: 18 }}>{cedulaFoto ? "✅" : "📷"}</span>
                        {cedulaFoto ? "Foto capturada — toca para cambiar" : "Tomar foto de la cédula"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => setCedularFoto(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {cedulaFoto && (
                      <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", maxWidth: 200, border: "1px solid var(--line)" }}>
                        <img src={cedulaFoto} alt="Cédula" style={{ width: "100%", display: "block" }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", background: "var(--soft2)" }}>
                {error && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", background: "var(--bad-soft)", borderRadius: 10, fontSize: 12, color: "var(--bad-ink)", fontWeight: 600 }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setSubStep("documento"); setError(null); }} style={{
                    padding: "12px 18px", borderRadius: 12, border: "1px solid var(--line)",
                    background: "var(--card)", fontWeight: 700, cursor: "pointer", color: "var(--muted)",
                  }}>← Atrás</button>
                  <button onClick={goToConfirmacion} style={{
                    flex: 1, padding: "12px", borderRadius: 12, border: "none",
                    background: "linear-gradient(90deg, var(--accent), var(--accent-ink))",
                    color: "var(--card)", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  }}>
                    Ver confirmación →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: CONFIRMACION */}
          {subStep === "confirmacion" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Confirmar y guardar</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Verifica la firma antes de guardar. Si algo no está bien, puedes volver a firmar.</div>
                </div>

                {/* Vista previa firma */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>Firma capturada</div>
                  {firmas[pasoActual.key] ? (
                    <div style={{ borderRadius: 14, border: "2px solid var(--line)", overflow: "hidden", background: "var(--soft2)", maxWidth: 400 }}>
                      <img src={firmas[pasoActual.key]!} alt="Firma" style={{ width: "100%", display: "block" }} />
                    </div>
                  ) : (
                    <div style={{ padding: "20px", borderRadius: 14, border: "2px dashed var(--soft)", textAlign: "center", color: "var(--faint)", fontSize: 13 }}>
                      Sin firma
                    </div>
                  )}
                </div>

                {/* Foto cédula preview */}
                {docIndex === 0 && cedulaFoto && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>Foto de cédula</div>
                    <div style={{ borderRadius: 14, overflow: "hidden", maxWidth: 200, border: "1px solid var(--line)" }}>
                      <img src={cedulaFoto} alt="Cédula" style={{ width: "100%", display: "block" }} />
                    </div>
                  </div>
                )}

                {/* Documentos firmados */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>Estado de documentos</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {PASOS.map((p, i) => {
                      const signed = !!firmas[p.key];
                      const current = i === docIndex;
                      return (
                        <div key={p.key} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 14px", borderRadius: 10,
                          background: signed ? "var(--ok-soft)" : current ? "var(--accent-soft2)" : "var(--soft2)",
                          border: `1px solid ${signed ? "var(--ok-line)" : current ? "var(--accent-line)" : "var(--line)"}`,
                        }}>
                          <span style={{ fontSize: 16 }}>{signed ? "✅" : current ? "✍️" : "⬜"}</span>
                          <span style={{ fontSize: 13, fontWeight: signed || current ? 700 : 400, color: signed ? "var(--ok-ink)" : current ? "var(--accent-ink)" : "var(--faint)" }}>
                            {p.titulo}
                          </span>
                          {current && !signed && (
                            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft2)", padding: "2px 8px", borderRadius: 20, border: "1px solid var(--accent-line)" }}>
                              ACTUAL
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", background: "var(--soft2)" }}>
                {error && (
                  <div style={{ marginBottom: 10, padding: "8px 12px", background: "var(--bad-soft)", borderRadius: 10, fontSize: 12, color: "var(--bad-ink)", fontWeight: 600 }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={volverAFirmar} style={{
                    padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)",
                    background: "var(--card)", fontWeight: 700, cursor: "pointer", color: "var(--muted)", fontSize: 13,
                  }}>
                    Volver a firmar
                  </button>

                  {!isLastDoc ? (
                    <button onClick={siguienteDocumento} style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "none",
                      background: "linear-gradient(90deg, var(--accent), var(--accent-ink))",
                      color: "var(--card)", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    }}>
                      Siguiente documento →
                    </button>
                  ) : (
                    <button
                      onClick={confirmarYGuardar}
                      disabled={guardando || !allSigned}
                      style={{
                        flex: 1, padding: "12px", borderRadius: 12, border: "none",
                        background: guardando || !allSigned ? "var(--faint)" : "linear-gradient(90deg, var(--ok-ink), var(--ok))",
                        color: "var(--card)", fontWeight: 800, fontSize: 14,
                        cursor: guardando || !allSigned ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>
                      {guardando ? (
                        <>
                          <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--card)", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                          Guardando...
                        </>
                      ) : (
                        "Confirmar y guardar"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
