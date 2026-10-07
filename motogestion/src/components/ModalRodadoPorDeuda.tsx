// RODAR POR DEUDA (D-044, mig 191) — la ventana de 4 pasos: la cuenta → el documento firmado → el
// video del cliente → guardar. La CUENTA la hace la base (la misma de Cartera y ZALA); esta ventana
// solo la muestra, junta la evidencia y llama a `aplicar_rodado_por_deuda`, que vuelve a hacer la
// cuenta con candado y no guarda nada si cambió.
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Circle, FileText, Video, Upload, Camera, RotateCcw, AlertTriangle, X, Printer } from "lucide-react";
import CanvasFirma from "./CanvasFirma";
import { primaryBtn, secondaryBtn } from "../styles/shared";
import { calcularRodado, aplicarRodado, subirArchivoRodado } from "../hooks/useRodadosPorDeuda";
import { htmlRodadoPorDeuda, textoDeclaracion, pesos, fechaLarga, type CalculoRodado, type RodadoPorDeuda } from "../utils/rodadoPorDeuda";
import { hoyISO } from "../utils/fecha";

type Paso = 1 | 2 | 3 | 4;
const MAX_SEG = 60;

const caja: React.CSSProperties = { border: "1px solid var(--line)", borderRadius: 12, padding: 12, background: "var(--soft2)", minWidth: 0, boxSizing: "border-box" };
const fila: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "4px 0", minWidth: 0 };
const titulo: React.CSSProperties = { fontSize: 13, fontWeight: 600, margin: "0 0 6px" };

function Fila({ l, v, fuerte, color }: { l: string; v: string; fuerte?: boolean; color?: string }) {
  return (
    <div style={fila}>
      <span style={{ color: "var(--muted2)", minWidth: 0 }}>{l}</span>
      <span style={{ fontWeight: fuerte ? 700 : 600, color: color ?? "var(--text)", fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 0, maxWidth: "62%", overflowWrap: "anywhere" }}>{v}</span>
    </div>
  );
}

function Aviso({ tono, children }: { tono: "warn" | "bad"; children: React.ReactNode }) {
  return (
    <div role="note" style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.5,
      border: `1px solid var(--${tono}-line)`, background: `var(--${tono}-soft)`, color: `var(--${tono}-ink)` }}>
      <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ minWidth: 0 }}>{children}</span>
    </div>
  );
}

const sem = (n: number | undefined) => `${n ?? 0} ${(n ?? 0) === 1 ? "semana" : "semanas"}`;

export default function ModalRodadoPorDeuda({ contratoId, acompanante, onCerrar, onHecho }: {
  contratoId: string;
  /** Nombre del acompañante del cliente, si tiene: firma también. */
  acompanante?: string | null;
  onCerrar: () => void;
  onHecho?: (r: RodadoPorDeuda) => void;
}) {
  const [paso, setPaso] = useState<Paso>(1);
  const [calc, setCalc] = useState<CalculoRodado | null>(null);
  const [errorCalc, setErrorCalc] = useState<string | null>(null);
  const [leido, setLeido] = useState(false);
  const [firmaCliente, setFirmaCliente] = useState<string | null>(null);
  const [firmaAcomp, setFirmaAcomp] = useState<string | null>(null);
  const [video, setVideo] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<RodadoPorDeuda | null>(null);
  const hoy = hoyISO();

  useEffect(() => {
    let vivo = true;
    calcularRodado(contratoId).then(r => { if (!vivo) return; setCalc(r.calculo); setErrorCalc(r.error); });
    return () => { vivo = false; };
  }, [contratoId]);

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);

  const borrador = useMemo(() => calc ? htmlRodadoPorDeuda(calc, { borrador: true, acompanante }) : "", [calc, acompanante]);

  function ponerVideo(b: Blob) {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideo(b);
    setVideoUrl(URL.createObjectURL(b));
  }

  async function guardar() {
    if (procesando || !calc || !firmaCliente || !video) return;
    setError(null);
    try {
      setProcesando("Subiendo el video…");
      const ext = (video.type.includes("mp4") ? "mp4" : video.type.includes("quicktime") ? "mov" : "webm");
      const v = await subirArchivoRodado(contratoId, `video.${ext}`, video, video.type || "video/webm");
      if (v.error || !v.url) throw new Error(`No se pudo subir el video: ${v.error ?? ""}`);

      setProcesando("Guardando las firmas…");
      const aBlob = async (d: string) => (await fetch(d)).blob();
      const fc = await subirArchivoRodado(contratoId, "firma-cliente.png", await aBlob(firmaCliente), "image/png");
      if (fc.error || !fc.url) throw new Error(`No se pudo guardar la firma: ${fc.error ?? ""}`);
      let faUrl: string | null = null;
      if (firmaAcomp) {
        const fa = await subirArchivoRodado(contratoId, "firma-acompanante.png", await aBlob(firmaAcomp), "image/png");
        if (fa.error || !fa.url) throw new Error(`No se pudo guardar la firma del acompañante: ${fa.error ?? ""}`);
        faUrl = fa.url;
      }

      setProcesando("Armando el documento firmado…");
      const html = htmlRodadoPorDeuda(calc, { firmaCliente, firmaAcompanante: firmaAcomp, acompanante, fechaFirma: hoy });
      const { htmlAPdfBlob } = await import("../utils/pdf");
      const pdf = await htmlAPdfBlob(html);
      const doc = await subirArchivoRodado(contratoId, "acuerdo-rodado.pdf", pdf, "application/pdf");
      if (doc.error || !doc.url) throw new Error(`No se pudo guardar el documento: ${doc.error ?? ""}`);

      setProcesando("Rodando…");
      const r = await aplicarRodado({
        contratoId, videoUrl: v.url, documentoUrl: doc.url, firmaClienteUrl: fc.url, firmaAcompananteUrl: faUrl,
        semanasEsperadas: calc.semanas_rodadas ?? 0,
      });
      if (r.error || !r.rodado) throw new Error(r.error ?? "No se pudo guardar el rodado.");
      setHecho(r.rodado);
      onHecho?.(r.rodado);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el rodado.");
    } finally {
      setProcesando(null);
    }
  }

  async function imprimir() {
    if (!hecho) return;
    const { abrirDocumento } = await import("../lib/storagePrivado");
    abrirDocumento(hecho.documento_url);
  }

  const puedeSeguir = paso === 1 ? !!calc?.puede : paso === 2 ? leido && !!firmaCliente : paso === 3 ? !!video : false;
  const pasos = [
    { n: 1, t: "La cuenta" }, { n: 2, t: "Documento" }, { n: 3, t: "Video" }, { n: 4, t: "Guardar" },
  ] as const;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}
      onClick={() => { if (!procesando) onCerrar(); }}>
      <div role="dialog" aria-modal="true" aria-label="Rodar por deuda" onClick={e => e.stopPropagation()}
        style={{ background: "var(--card)", borderRadius: 16, width: "100%", maxWidth: 620, minWidth: 0, maxHeight: "96vh", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden", color: "var(--text)", textAlign: "left" }}>
        {/* Encabezado */}
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Rodar por deuda</div>
            <div style={{ fontSize: 12, color: "var(--muted2)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {calc?.cliente ?? "…"} {calc?.placa ? `· ${calc.placa}` : ""}
            </div>
          </div>
          <button onClick={onCerrar} disabled={!!procesando} aria-label="Cerrar"
            style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--muted2)" }}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {/* Los pasos */}
        {!hecho && (
          <ol aria-label="Pasos" style={{ display: "flex", gap: 4, listStyle: "none", margin: 0, padding: "10px 16px 0" }}>
            {pasos.map(p => (
              <li key={p.n} aria-current={paso === p.n ? "step" : undefined} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: paso >= p.n ? "var(--accent)" : "var(--line)" }} />
                <div style={{ fontSize: 11, marginTop: 4, color: paso === p.n ? "var(--text)" : "var(--muted2)", fontWeight: paso === p.n ? 600 : 400 }}>{p.n}. {p.t}</div>
              </li>
            ))}
          </ol>
        )}

        <div style={{ overflowY: "auto", overflowX: "hidden", flex: 1, minHeight: 0, padding: "12px 16px", display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12, alignContent: "start" }}>
          {hecho ? (
            <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: "var(--ok-ink)" }}>
                <Check size={20} aria-hidden="true" /> Rodado guardado: {hecho.numero}
              </div>
              <div style={{ ...caja, width: "100%" }}>
                <Fila l="Se rodaron" v={`${sem(hecho.semanas_rodadas)} (${pesos(hecho.monto_rodado)})`} />
                <Fila l="Al final paga" v={`${sem(hecho.semanas_a_cobrar)} (${pesos(hecho.monto_a_cobrar)})`} />
                <Fila l="Hoy queda debiendo" v={pesos(hecho.queda_debiendo)} fuerte />
                <Fila l="Fin aproximado" v={fechaLarga(hecho.fecha_fin_aprox)} />
              </div>
              {hecho.queda_debiendo > 0 && (
                <Aviso tono="warn">Cóbrele ahora los <strong>{pesos(hecho.queda_debiendo)}</strong> que le quedan. Si no los paga hoy, sigue en mora por ese valor.</Aviso>
              )}
              <button onClick={imprimir} style={{ ...secondaryBtn, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                <Printer size={16} aria-hidden="true" /> Ver / imprimir el documento firmado
              </button>
            </div>
          ) : errorCalc ? (
            <Aviso tono="bad">{errorCalc.includes("permiso") ? "No tiene permiso para rodar por deuda. Lo da el dueño desde Usuarios." : errorCalc.includes("calcular_rodado") ? "Falta correr la migración 191 en Supabase." : errorCalc}</Aviso>
          ) : !calc ? (
            <div role="status" style={{ fontSize: 13, color: "var(--muted2)" }}>Haciendo la cuenta…</div>
          ) : paso === 1 ? (
            <>
              {calc.razones.map((r, i) => <Aviso key={i} tono="bad">{r}</Aviso>)}
              {calc.avisos.map((r, i) => <Aviso key={i} tono="warn">{r}</Aviso>)}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                <div style={caja}>
                  <p style={{ ...titulo, color: "var(--muted2)" }}>Hoy debe</p>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--bad-ink)", fontVariantNumeric: "tabular-nums" }}>{pesos(calc.antes?.total)}</div>
                </div>
                <div style={{ ...caja, borderColor: "var(--ok-line)" }}>
                  <p style={{ ...titulo, color: "var(--muted2)" }}>Después de rodar debe</p>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ok-ink)", fontVariantNumeric: "tabular-nums" }}>{pesos(calc.despues?.total)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted2)" }}>lo paga ahora</div>
                </div>
              </div>
              <div style={caja}>
                <p style={titulo}>Se rueda al final del contrato (es tiempo)</p>
                <Fila l="Semanas atrasadas que se corren" v={sem(calc.cajas_corridas)} />
                {(calc.deudas_rodadas ?? []).map(d => (
                  <Fila key={d.deuda_id} l={`${d.concepto === "migracion" ? "Deuda de migración" : "Tarifa atrasada"}${d.completa ? "" : " (una parte)"}`} v={pesos(d.monto)} />
                ))}
                <Fila l="Semanas completas rodadas" v={`${sem(calc.semanas_rodadas)} · ${pesos(calc.monto_rodado)}`} fuerte />
                <Fila l="Al final paga (con el recargo)" v={`${sem(calc.semanas_a_cobrar)} · ${pesos(calc.monto_a_cobrar)}`} fuerte color="var(--accent-ink)" />
                <Fila l="Fin del contrato" v={`${fechaLarga(calc.fecha_fin_antes)} pasa al ${fechaLarga(calc.fecha_fin_aprox)}`} />
              </div>
              {(calc.sobrante ?? 0) > 0 || (calc.deudas_no_rodables ?? []).length > 0 ? (
                <div style={caja}>
                  <p style={titulo}>No se rueda: lo sigue debiendo</p>
                  {(calc.sobrante ?? 0) > 0 && <Fila l="Lo de tiempo que no alcanza a una semana" v={pesos(calc.sobrante)} />}
                  {(calc.deudas_no_rodables ?? []).map(d => (
                    <Fila key={d.deuda_id} l={`${d.que_es ?? d.concepto}${d.descripcion ? ` · ${d.descripcion}` : ""}`} v={pesos(d.pendiente)} />
                  ))}
                </div>
              ) : null}
              {calc.acuerdo && calc.acuerdo.periodos_corridos > 0 && (
                <div style={caja}>
                  <p style={titulo}>Su acuerdo de pago #{calc.acuerdo.numero} sigue</p>
                  <div style={{ fontSize: 12.5, color: "var(--muted2)", lineHeight: 1.5 }}>
                    Lo atrasado ({pesos(calc.acuerdo.monto_corrido)}) se corre al final del mismo acuerdo. Sigue pagando su cuota de {pesos(calc.acuerdo.cuota)}; el acuerdo vence el {fechaLarga(calc.acuerdo.fecha_limite_despues)}.
                  </div>
                </div>
              )}
              <Aviso tono="warn">La empresa no cubre el SOAT ni la tecnomecánica durante el tiempo extra. Dígaselo al cliente: va en el documento y en el video.</Aviso>
            </>
          ) : paso === 2 ? (
            <>
              <p style={{ fontSize: 13, margin: 0, color: "var(--muted2)" }}>Que el cliente lea el documento completo antes de firmar.</p>
              <iframe title="Documento del rodado" srcDoc={borrador}
                style={{ width: "100%", height: 360, border: "1px solid var(--line)", borderRadius: 10, background: "#ffffff" }} />
              <label style={{ display: "flex", gap: 10, alignItems: "center", minHeight: 44, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={leido} onChange={e => setLeido(e.target.checked)} style={{ width: 20, height: 20 }} />
                El cliente leyó el documento y está de acuerdo
              </label>
              <CanvasFirma label="Firma del cliente" onChange={setFirmaCliente} modal opcional={false} valorInicial={firmaCliente} />
              {acompanante && <CanvasFirma label={`Firma del acompañante (${acompanante})`} onChange={setFirmaAcomp} modal valorInicial={firmaAcomp} />}
            </>
          ) : paso === 3 ? (
            <GrabarVideo texto={textoDeclaracion(calc, hoy)} videoUrl={videoUrl} onVideo={ponerVideo} />
          ) : (
            <>
              <div style={caja}>
                <Fila l="Semanas que se ruedan" v={sem(calc.semanas_rodadas)} />
                <Fila l="Al final paga" v={sem(calc.semanas_a_cobrar)} />
                <Fila l="Hoy queda debiendo" v={pesos(calc.despues?.total)} fuerte />
                <Fila l="Documento firmado" v={firmaCliente ? "listo" : "falta"} />
                <Fila l="Video del cliente" v={video ? "listo" : "falta"} />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--muted2)", margin: 0, lineHeight: 1.5 }}>
                Al guardar, la app vuelve a hacer la cuenta. Si algo cambió mientras tanto (por ejemplo, entró un pago), no guarda nada y le avisa.
              </p>
              {error && <Aviso tono="bad">{error}</Aviso>}
            </>
          )}
        </div>

        {/* Botones */}
        {!hecho && !errorCalc && calc && (
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
            {paso > 1 && (
              <button onClick={() => setPaso(p => (p - 1) as Paso)} disabled={!!procesando}
                style={{ ...secondaryBtn, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 44, flex: "0 0 auto" }}>
                <ArrowLeft size={16} aria-hidden="true" /> Atrás
              </button>
            )}
            {paso < 4 ? (
              <button onClick={() => setPaso(p => (p + 1) as Paso)} disabled={!puedeSeguir}
                style={{ ...primaryBtn, flex: 1, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: puedeSeguir ? 1 : 0.5, cursor: puedeSeguir ? "pointer" : "not-allowed" }}>
                {paso === 1 ? <><FileText size={16} aria-hidden="true" /> Siguiente: el documento</> : paso === 2 ? <><Video size={16} aria-hidden="true" /> Siguiente: el video</> : <>Siguiente: guardar <ArrowRight size={16} aria-hidden="true" /></>}
              </button>
            ) : (
              <button onClick={guardar} disabled={!!procesando}
                style={{ ...primaryBtn, flex: 1, minHeight: 44, opacity: procesando ? 0.6 : 1 }}>
                {procesando ?? "Rodar y guardar"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** El video: se graba dentro de la app (cámara de adelante, con el texto en pantalla para leerlo),
 *  o se sube uno grabado con el celular. Máximo un minuto. */
function GrabarVideo({ texto, videoUrl, onVideo }: { texto: string; videoUrl: string | null; onVideo: (b: Blob) => void }) {
  const vivoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const [estado, setEstado] = useState<"quieto" | "camara" | "grabando">("quieto");
  const [seg, setSeg] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const camaraRef = useRef<HTMLInputElement | null>(null);
  const galeriaRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);
  useEffect(() => {
    if (estado !== "grabando") return;
    const t = setInterval(() => setSeg(s => {
      if (s + 1 >= MAX_SEG) recRef.current?.stop();
      return s + 1;
    }), 1000);
    return () => clearInterval(t);
  }, [estado]);

  async function abrirCamara() {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: true });
      streamRef.current = s;
      setEstado("camara");
      setTimeout(() => { if (vivoRef.current) { vivoRef.current.srcObject = s; vivoRef.current.play().catch(() => {}); } }, 0);
    } catch {
      setError("No se pudo abrir la cámara. Dele permiso a la app, o grabe con los botones Cámara o Galería.");
    }
  }

  function grabar() {
    const s = streamRef.current;
    if (!s) return;
    const tipos = ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm"];
    const mime = tipos.find(t => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) ?? "";
    const rec = new MediaRecorder(s, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 900_000 });
    const partes: Blob[] = [];
    rec.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
    rec.onstop = () => {
      onVideo(new Blob(partes, { type: mime || "video/webm" }));
      s.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setEstado("quieto");
    };
    recRef.current = rec;
    setSeg(0);
    rec.start(1000);
    setEstado("grabando");
  }

  function desdeArchivo(f: File | undefined) {
    if (!f) return;
    setError(null);
    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (isFinite(v.duration) && v.duration > MAX_SEG + 5) { setError(`El video dura ${Math.round(v.duration)} segundos: máximo un minuto. Grábelo más corto.`); return; }
      if (f.size > 45 * 1024 * 1024) { setError("El video pesa demasiado. Grábelo más corto o con menos calidad."); return; }
      onVideo(f);
    };
    v.onerror = () => { URL.revokeObjectURL(url); onVideo(f); };
    v.src = url;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ ...caja, background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
        <p style={{ ...titulo, color: "var(--accent-ink)" }}>Lo que el cliente dice, mirando a la cámara:</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{texto}</p>
      </div>
      {estado !== "quieto" ? (
        <div style={{ display: "grid", gap: 8 }}>
          <video ref={vivoRef} muted playsInline style={{ width: "100%", maxHeight: 300, borderRadius: 10, background: "#000", transform: "scaleX(-1)" }} />
          {estado === "camara" ? (
            <button onClick={grabar} style={{ ...primaryBtn, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Circle size={16} aria-hidden="true" fill="currentColor" /> Empezar a grabar
            </button>
          ) : (
            <button onClick={() => recRef.current?.stop()} style={{ ...primaryBtn, minHeight: 44, background: "var(--bad)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Terminar ({MAX_SEG - seg} s)
            </button>
          )}
        </div>
      ) : videoUrl ? (
        <div style={{ display: "grid", gap: 8 }}>
          <video src={videoUrl} controls playsInline style={{ width: "100%", maxHeight: 300, borderRadius: 10, background: "#000" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ok-ink)", fontWeight: 600 }}><Check size={16} aria-hidden="true" /> Video listo. Mírelo: que se oiga la fecha y las cifras.</div>
          <button onClick={abrirCamara} style={{ ...secondaryBtn, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <RotateCcw size={16} aria-hidden="true" /> Grabar otra vez
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={abrirCamara} style={{ ...primaryBtn, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Video size={16} aria-hidden="true" /> Grabar aquí (con el texto en pantalla)
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => camaraRef.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Camera size={16} aria-hidden="true" /> Cámara
            </button>
            <button onClick={() => galeriaRef.current?.click()} style={{ ...secondaryBtn, flex: 1, minWidth: 0, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Upload size={16} aria-hidden="true" /> Galería
            </button>
          </div>
          <input ref={camaraRef} type="file" accept="video/*" capture="user" hidden onChange={e => desdeArchivo(e.target.files?.[0])} />
          <input ref={galeriaRef} type="file" accept="video/*" hidden onChange={e => desdeArchivo(e.target.files?.[0])} />
        </div>
      )}
      {error && <Aviso tono="bad">{error}</Aviso>}
    </div>
  );
}
