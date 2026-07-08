import { useRef } from "react";
import { inputStyle, labelStyle } from "../styles/shared";

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

// Input de dinero con signo $ y separador de miles que se aplica MIENTRAS se escribe
// (no solo al salir del campo). Guarda solo dígitos en el estado (value/onChange siguen
// siendo string numérico puro) — el formato "$ 195.000" es únicamente visual.
// Preserva la posición del cursor al reformatear para que no salte al final.
export default function MoneyInput({ label, value, onChange, placeholder, style, autoFocus }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const display = value ? "$ " + Number(value).toLocaleString("es-CO") : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    // Cuántos dígitos hay a la izquierda del cursor (para reubicarlo tras formatear).
    const digitosIzq = el.value.slice(0, caret).replace(/\D/g, "").length;
    const digitos = el.value.replace(/\D/g, "");
    onChange(digitos);

    // Tras el re-render, reubicar el cursor después de la misma cantidad de dígitos.
    requestAnimationFrame(() => {
      const nuevo = digitos ? "$ " + Number(digitos).toLocaleString("es-CO") : "";
      let count = 0;
      let pos = 0;
      for (; pos < nuevo.length && count < digitosIzq; pos++) {
        if (/\d/.test(nuevo[pos])) count++;
      }
      ref.current?.setSelectionRange(pos, pos);
    });
  }

  const input = (
    <input
      ref={ref}
      style={{ ...inputStyle, ...style }}
      type="text"
      inputMode="numeric"
      value={display}
      autoFocus={autoFocus}
      onFocus={e => e.target.select()}
      onChange={handleChange}
      placeholder={placeholder ?? "$ 0"}
    />
  );
  if (!label) return input;
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {input}
    </div>
  );
}
