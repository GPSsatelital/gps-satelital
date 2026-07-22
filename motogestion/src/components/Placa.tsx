// ── Placa (firma visual del rediseño) ──
// Toda placa se muestra como mini placa de moto colombiana: fondo amarillo,
// letras negras, borde negro. Se escanea la lista por placa igual que en la
// calle. El amarillo es fijo (no cambia con el tema) — es el punto cálido
// que guía el ojo también en modo noche.

export default function Placa({ placa, size = "md" }: { placa: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm"
    ? { fontSize: 12, padding: "6px 8px 5px", letterSpacing: 1.1, borderRadius: 6 }
    : size === "lg"
      ? { fontSize: 16, padding: "9px 11px 8px", letterSpacing: 1.5, borderRadius: 8 }
      : { fontSize: 13, padding: "7px 9px 6px", letterSpacing: 1.3, borderRadius: 7 };
  return (
    <span
      style={{
        background: "#FFD100",
        color: "#111111",
        border: "2px solid #111111",
        fontWeight: 800,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.1,
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
