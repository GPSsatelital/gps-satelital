import { useEffect, useRef, useState } from "react";
import { labelStyle } from "../styles/shared";

interface Props {
  label: string;
  onChange: (data: string | null) => void;
  modal?: boolean;
  valorInicial?: string | null;
  opcional?: boolean; // muestra el aviso "(opcional)" en modo modal — false cuando es obligatoria (wizard)
}

// La firma se exporta RECORTADA a su trazo real (con margen). Sin esto, el lienzo completo
// (480×680 en el modal, casi todo aire) llegaba a los documentos y el trazo se veía diminuto
// al encogerse al espacio de la firma — el reclamo del dueño (24-ago): "siempre la colocas
// pequeña". Recortada, la firma llena su espacio en TODOS los documentos sin tocar ninguno.
function recortarAlTrazo(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return canvas.toDataURL("image/png");   // lienzo vacío: no debería pasar
  const M = 14;
  minX = Math.max(0, minX - M); minY = Math.max(0, minY - M);
  maxX = Math.min(width - 1, maxX + M); maxY = Math.min(height - 1, maxY + M);
  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  out.getContext("2d")!.drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL("image/png");
}

// Componente del modal de firma — declarado fuera de CanvasFirma para que React lo trate
// como un tipo de componente estable y no lo remonte al re-render del padre.
function ModalFirma({ label, onAceptar, onCerrar }: {
  label: string;
  onAceptar: (dataUrl: string) => void;
  onCerrar: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);

  // Marca "modo firma" mientras el modal está abierto: aquí SÍ se permiten los clics del
  // lápiz (para tocar Aceptar/Repetir); fuera de aquí el filtro de lápiz los ignora.
  useEffect(() => {
    document.body.dataset.firmando = "1";
    return () => { delete document.body.dataset.firmando; };
  }, []);

  useEffect(() => {
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
      const pt = "touches" in e ? e.touches[0] : e;
      return {
        x: (pt.clientX - rect.left) * (canvas.width / rect.width),
        y: (pt.clientY - rect.top) * (canvas.height / rect.height),
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
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  }

  function aceptar() {
    if (!hasDrawn.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onAceptar(recortarAlTrazo(canvas));
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--ink)", zIndex: 9999, display: "flex", flexDirection: "column" }}>
      {/* Header compacto para dejar el máximo de espacio al canvas */}
      <div style={{ padding: "12px 16px", background: "var(--text)", borderBottom: "1px solid var(--muted2)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-hi)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Firma digital
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--card)", marginTop: 1 }}>{label}</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>Firme con el dedo</div>
      </div>

      {/* Canvas ocupa todo el espacio vertical disponible */}
      <div style={{ flex: 1, padding: 12, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, background: "var(--card)", borderRadius: 14, overflow: "hidden", position: "relative", minHeight: 0 }}>
          <canvas
            ref={canvasRef}
            width={480}
            height={680}
            style={{ width: "100%", height: "100%", display: "block", touchAction: "none", cursor: "crosshair" }}
          />
          <div style={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            fontSize: 11, color: "var(--line)", pointerEvents: "none", userSelect: "none",
            background: "rgba(15,23,42,0.35)", padding: "3px 12px", borderRadius: 20,
          }}>
            Firme aquí
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 16px", background: "var(--text)", borderTop: "1px solid var(--muted2)", display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCerrar}
          style={{
            padding: "13px 18px", borderRadius: 12, border: "1px solid var(--muted3)",
            background: "transparent", color: "var(--faint)", fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}
        >
          ← Atrás
        </button>
        <button
          type="button"
          onClick={clear}
          style={{
            padding: "13px 18px", borderRadius: 12, border: "1px solid var(--accent)",
            background: "transparent", color: "var(--accent-hi)", fontWeight: 700, cursor: "pointer", fontSize: 14,
          }}
        >
          Repetir
        </button>
        <button
          type="button"
          onClick={aceptar}
          style={{
            flex: 1, padding: "13px", borderRadius: 12, border: "none",
            background: "var(--accent)", color: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}
        >
          ✓ Aceptar
        </button>
      </div>
    </div>
  );
}

export default function CanvasFirma({ label, onChange, modal = false, valorInicial = null, opcional = true }: Props) {
  const [firmaSaved, setFirmaSaved] = useState<string | null>(valorInicial);
  const [modalOpen, setModalOpen] = useState(false);

  // Refs para el modo inline (cuando modal=false)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (modal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "var(--text)"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    hasDrawn.current = false;
    let drawing = false;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pt = "touches" in e ? e.touches[0] : e;
      return { x: (pt.clientX - rect.left) * (canvas.width / rect.width), y: (pt.clientY - rect.top) * (canvas.height / rect.height) };
    };
    const onDown = (e: MouseEvent | TouchEvent) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); hasDrawn.current = true;
      onChangeRef.current(canvas.toDataURL("image/png")); e.preventDefault();
    };
    const onUp = () => { drawing = false; };
    canvas.addEventListener("mousedown", onDown); canvas.addEventListener("mousemove", onMove); canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false }); canvas.addEventListener("touchmove", onMove, { passive: false }); canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown); canvas.removeEventListener("touchmove", onMove); canvas.removeEventListener("touchend", onUp);
    };
  }, [modal]);

  function clearInline() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false; onChange(null);
  }

  // ── MODO MODAL ──
  if (modal) {
    return (
      <>
        <div style={{ ...labelStyle, display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          {label}
          {opcional && <span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 400 }}>(opcional — puede completarse después)</span>}
        </div>
        <div
          onClick={() => setModalOpen(true)}
          style={{
            cursor: "pointer",
            borderRadius: 14,
            border: firmaSaved ? "2px solid var(--ok)" : "2px dashed var(--line2)",
            background: firmaSaved ? "var(--ok-soft)" : "var(--soft2)",
            overflow: "hidden",
            position: "relative",
            minHeight: firmaSaved ? undefined : 72,
            display: "flex",
            alignItems: "center",
            justifyContent: firmaSaved ? undefined : "center",
          }}
        >
          {firmaSaved ? (
            <img src={firmaSaved} alt="Firma guardada" style={{ width: "100%", display: "block", maxHeight: 110, objectFit: "contain" }} />
          ) : (
            <div style={{ padding: "18px 20px", textAlign: "center", color: "var(--faint)", fontSize: 14, fontWeight: 600 }}>
              Toque aquí para firmar
            </div>
          )}
        </div>
        {firmaSaved && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
            >
              ✏️ Editar firma
            </button>
            <button
              type="button"
              onClick={() => { setFirmaSaved(null); onChange(null); }}
              style={{ padding: "7px 14px", borderRadius: 10, border: "1px solid var(--bad-line)", background: "var(--card)", fontSize: 12, cursor: "pointer", color: "var(--bad)", fontWeight: 700 }}
            >
              Borrar
            </button>
          </div>
        )}
        {modalOpen && (
          <ModalFirma
            label={label}
            onAceptar={(dataUrl) => {
              setFirmaSaved(dataUrl);
              onChange(dataUrl);
              setModalOpen(false);
            }}
            onCerrar={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  // ── MODO INLINE (default) ──
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ borderRadius: 14, border: "2px dashed var(--line2)", background: "var(--soft2)", overflow: "hidden", position: "relative" }}>
        <canvas ref={canvasRef} width={640} height={180}
          style={{ width: "100%", height: 180, display: "block", touchAction: "none", cursor: "crosshair" }} />
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "var(--line2)", pointerEvents: "none", background: "var(--card)", padding: "2px 10px", borderRadius: 20, border: "1px solid var(--soft)" }}>
          Firme aquí con el dedo o el lápiz digital
        </div>
      </div>
      <button onClick={clearInline} style={{ marginTop: 8, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 12, color: "var(--muted)" }}>
        Borrar firma
      </button>
    </div>
  );
}
