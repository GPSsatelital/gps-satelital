import { useRef, useState } from "react";
import { labelStyle } from "../styles/shared";

interface Props {
  label: string;
  valorInicial?: string | null;
  onChange: (dataUrl: string | null) => void;
}

const TAMANO_RECORTE = 320; // px de salida, cuadrado (se muestra circular con CSS)

// Recorta la imagen cargada a un cuadrado centrado y la reescala a TAMANO_RECORTE.
function recortarCentrado(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = TAMANO_RECORTE;
  canvas.height = TAMANO_RECORTE;
  const ctx = canvas.getContext("2d")!;
  const lado = Math.min(img.width, img.height);
  const sx = (img.width - lado) / 2;
  const sy = (img.height - lado) / 2;
  ctx.drawImage(img, sx, sy, lado, lado, 0, 0, TAMANO_RECORTE, TAMANO_RECORTE);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function FotoPerfil({ label, valorInicial = null, onChange }: Props) {
  const [foto, setFoto] = useState<string | null>(valorInicial);
  const [previa, setPrevia] = useState<string | null>(null);
  const inputCamaraRef = useRef<HTMLInputElement>(null);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setPrevia(recortarCentrado(img));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function confirmar() {
    if (!previa) return;
    setFoto(previa);
    onChange(previa);
    setPrevia(null);
  }

  function repetir() {
    setPrevia(null);
  }

  function quitar() {
    setFoto(null);
    onChange(null);
  }

  // Vista previa antes de confirmar
  if (previa) {
    return (
      <div>
        <div style={labelStyle}>{label}</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <img
            src={previa}
            alt="Vista previa"
            style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--accent)" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={repetir}
              style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "var(--muted)" }}
            >
              🔄 Elegir otra
            </button>
            <button
              type="button"
              onClick={confirmar}
              style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--accent)", color: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              ✓ Usar esta foto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...labelStyle, display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
        {label}
        <span style={{ fontSize: 12, color: "var(--faint)", fontWeight: 400 }}>(opcional)</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
          background: "var(--soft)", border: "2px dashed var(--line2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {foto ? (
            <img src={foto} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 32, color: "var(--line2)" }}>👤</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <label style={{ cursor: "pointer" }}>
            <div style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "var(--muted2)" }}>
              📷 Cámara
            </div>
            <input
              ref={inputCamaraRef}
              type="file"
              accept="image/*"
              capture="user"
              style={{ display: "none" }}
              onChange={handleArchivo}
            />
          </label>
          <label style={{ cursor: "pointer" }}>
            <div style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "var(--muted2)" }}>
              🖼 Galería
            </div>
            <input
              ref={inputGaleriaRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleArchivo}
            />
          </label>
          {foto && (
            <button
              type="button"
              onClick={quitar}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--bad-line)", background: "var(--card)", fontWeight: 700, cursor: "pointer", fontSize: 13, color: "var(--bad)" }}
            >
              Quitar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
