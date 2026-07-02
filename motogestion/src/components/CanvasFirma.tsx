import { useEffect, useRef } from "react";
import { labelStyle } from "../styles/shared";

interface Props {
  label: string;
  onChange: (data: string | null) => void;
}

// Captura de firma a mano (dedo o lápiz digital) — funciona con cualquier
// puntero táctil/mouse, un stylus no necesita código aparte.
export default function CanvasFirma({ label, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
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
      onChange(canvas.toDataURL("image/png")); e.preventDefault();
    };
    const onUp = () => { drawing = false; };
    canvas.addEventListener("mousedown", onDown); canvas.addEventListener("mousemove", onMove); canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false }); canvas.addEventListener("touchmove", onMove, { passive: false }); canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown); canvas.removeEventListener("touchmove", onMove); canvas.removeEventListener("touchend", onUp);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false; onChange(null);
  }

  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ borderRadius: 14, border: "2px dashed #cbd5e1", background: "#fafafa", overflow: "hidden", position: "relative" }}>
        <canvas ref={canvasRef} width={640} height={180}
          style={{ width: "100%", height: 180, display: "block", touchAction: "none", cursor: "crosshair" }} />
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#cbd5e1", pointerEvents: "none", background: "white", padding: "2px 10px", borderRadius: 20, border: "1px solid #f1f5f9" }}>
          Firme aquí con el dedo o el lápiz digital
        </div>
      </div>
      <button onClick={clear} style={{ marginTop: 8, padding: "7px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
        Borrar firma
      </button>
    </div>
  );
}
