// ── Placa (firma visual del rediseño) ──
// Toda placa se muestra como mini placa de moto colombiana: fondo amarillo,
// letras negras, borde negro. Se escanea la lista por placa igual que en la
// calle. El amarillo es fijo (no cambia con el tema) — es el punto cálido
// que guía el ojo también en modo noche.

export default function Placa({ placa, size = "md" }: { placa: string; size?: "sm" | "md" | "lg" }) {
  // Letras grandes y gruesas que llenan el recuadro: font alto + padding chico
  // (el recuadro amarillo casi no crece, lo que crece son las letras).
  const s = size === "sm"
    ? { fontSize: 14, padding: "3px 7px 2px", letterSpacing: 0.8, borderRadius: 6 }
    : size === "lg"
      ? { fontSize: 19, padding: "5px 10px 4px", letterSpacing: 1.2, borderRadius: 8 }
      : { fontSize: 16, padding: "4px 8px 3px", letterSpacing: 1, borderRadius: 7 };
  return (
    <span
      style={{
        background: "#FFD100",
        color: "#111111",
        border: "2px solid #111111",
        fontWeight: 900,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.08,
        whiteSpace: "nowrap",
        boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.22)",
        display: "inline-block",
        textTransform: "uppercase",
        ...s,
      }}
    >
      {placa}
    </span>
  );
}
