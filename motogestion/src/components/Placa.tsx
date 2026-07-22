// ── Placa (firma visual del rediseño) ──
// Toda placa se muestra como mini placa de moto colombiana: fondo amarillo,
// letras negras, borde negro. Se escanea la lista por placa igual que en la
// calle. El amarillo es fijo (no cambia con el tema) — es el punto cálido
// que guía el ojo también en modo noche.

export default function Placa({ placa, size = "md" }: { placa: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm"
    ? { fontSize: 10.5, padding: "2px 6px 1px", letterSpacing: 1 }
    : size === "lg"
      ? { fontSize: 15, padding: "4px 10px 3px", letterSpacing: 1.6 }
      : { fontSize: 11.5, padding: "3px 7px 2px", letterSpacing: 1.2 };
  return (
    <span
      style={{
        background: "#FFD100",
        color: "#111111",
        border: "1.6px solid #111111",
        borderRadius: 6,
        fontWeight: 800,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.25,
        whiteSpace: "nowrap",
        boxShadow: "inset 0 -1.5px 0 rgba(0,0,0,0.22)",
        display: "inline-block",
        textTransform: "uppercase",
        ...s,
      }}
    >
      {placa}
    </span>
  );
}
