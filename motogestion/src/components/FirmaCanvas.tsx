import React, { useRef, useEffect, useState, useCallback } from "react";

type Props = {
  onFirma: (dataUrl: string) => void;
  onLimpiar?: () => void;
  label?: string;
};

export default function FirmaCanvas({ onFirma, onLimpiar, label = "Firma aquí" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [tieneFirma, setTieneFirma] = useState(false);

  function getCtx() {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = "var(--text)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return ctx;
  }

  function coords(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function iniciar(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    dibujando.current = true;
    const { x, y } = coords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function trazar(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!dibujando.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = coords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setTieneFirma(true);
  }

  function terminar(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!dibujando.current) return;
    dibujando.current = false;
    const c = canvasRef.current;
    if (c) onFirma(c.toDataURL("image/png"));
  }

  const limpiar = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setTieneFirma(false);
    onLimpiar?.();
  }, [onLimpiar]);

  // Ajustar resolución al tamaño real del elemento
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * window.devicePixelRatio;
    c.height = rect.height * window.devicePixelRatio;
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--muted2)" }}>{label}</div>
      <div style={{ position: "relative", borderRadius: 12, border: "2px dashed var(--line2)", background: "var(--soft2)", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: 140, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={iniciar}
          onMouseMove={trazar}
          onMouseUp={terminar}
          onMouseLeave={terminar}
          onTouchStart={iniciar}
          onTouchMove={trazar}
          onTouchEnd={terminar}
        />
        {!tieneFirma && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", color: "var(--faint)", fontSize: 13 }}>
            ✍️ Dibuja tu firma aquí
          </div>
        )}
      </div>
      {tieneFirma && (
        <button onClick={limpiar} style={{ marginTop: 6, background: "none", border: "none", color: "var(--faint)", fontSize: 12, cursor: "pointer", padding: 0 }}>
          Limpiar y volver a firmar
        </button>
      )}
    </div>
  );
}
