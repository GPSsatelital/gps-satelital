import type { CSSProperties } from "react";
import { useGrupos } from "../hooks/useGrupos";

/**
 * El selector de grupo para ESCOGER (moto nueva, socio, edición): ofrece solo los grupos prendidos.
 * Si el registro ya tiene un grupo apagado, ese también sale, para no cambiárselo sin que nadie lo
 * pida. Arranca vacío a propósito: antes la app escogía RASTREADOR sola y una moto o un socio podía
 * quedar en el portafolio equivocado sin que nadie lo notara.
 */
export default function SelectGrupo({ value, onChange, style, vacio = "— Escoja el grupo —", disabled, title }: {
  value: string | null | undefined;
  onChange: (grupo: string) => void;
  style?: CSSProperties;
  vacio?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { prendidos, grupos, loading } = useGrupos();
  const opciones = prendidos.map(g => ({ codigo: g.codigo, apagado: false }));
  if (value && !opciones.some(o => o.codigo === value)) {
    opciones.unshift({ codigo: value, apagado: grupos.some(g => g.codigo === value && !g.activo) });
  }
  return (
    <select style={style} value={value ?? ""} disabled={disabled} title={title} onChange={e => onChange(e.target.value)}>
      <option value="" disabled>{loading ? "Cargando grupos…" : vacio}</option>
      {opciones.map(o => (
        <option key={o.codigo} value={o.codigo}>{o.codigo}{o.apagado ? " (apagado)" : ""}</option>
      ))}
    </select>
  );
}
