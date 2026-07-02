import { useState } from "react";
import { inputStyle, labelStyle } from "../styles/shared";

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

// Input de dinero con separador de miles y signo $ mientras se escribe.
// Guarda solo dígitos en el estado (value/onChange siguen siendo string numérico
// puro) — el formato "$ 195.000" es únicamente visual.
export default function MoneyInput({ label, value, onChange, placeholder, style, autoFocus }: Props) {
  const [focused, setFocused] = useState(false);
  const num = Number(value) || 0;
  const display = focused ? value : (num > 0 ? "$ " + num.toLocaleString("es-CO") : "");
  const input = (
    <input
      style={{ ...inputStyle, ...style }}
      type="text"
      inputMode="numeric"
      value={display}
      autoFocus={autoFocus}
      onFocus={e => { setFocused(true); e.target.select(); }}
      onBlur={() => setFocused(false)}
      onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
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
