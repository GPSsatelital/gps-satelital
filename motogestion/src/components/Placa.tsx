// ── Placa (firma visual del rediseño) ──
// Toda placa se muestra como mini placa de moto colombiana: fondo amarillo,
// letras negras, borde negro. Se escanea la lista por placa igual que en la
// calle. El amarillo es fijo (no cambia con el tema) — es el punto cálido
// que guía el ojo también en modo noche.

// `grupo`: el portafolio al que pertenece la moto (COSTA/PRADERA/RASTREADOR/USADAS). Va DEBAJO
// de la placa, chiquito, porque saber de qué bolsillo es la moto importa en casi toda pantalla y
// antes había que abrir la ficha para averiguarlo. Si no se pasa, la placa se ve igual que antes.
export default function Placa({ placa, size = "md", grupo }: { placa: string; size?: "sm" | "md" | "lg"; grupo?: string | null }) {
  // Letras grandes y gruesas que llenan el recuadro: font alto + padding chico
  // (el recuadro amarillo casi no crece, lo que crece son las letras).
  // minWidth = ancho fijo del recuadro por tamaño → las placas angostas (con I/1)
  // se emparejan con las anchas (D/Q/W/M) y la columna izquierda queda pareja.
  const s = size === "sm"
    ? { fontSize: 14, padding: "3px 7px 2px", letterSpacing: 0.8, borderRadius: 6, minWidth: 66 }
    : size === "lg"
      ? { fontSize: 19, padding: "5px 10px 4px", letterSpacing: 1.2, borderRadius: 8, minWidth: 92 }
      : { fontSize: 16, padding: "4px 8px 3px", letterSpacing: 1, borderRadius: 7, minWidth: 76 };
  const chapa = (
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
        textAlign: "center",
        boxSizing: "border-box",
        textTransform: "uppercase",
        ...s,
      }}
    >
      {placa}
    </span>
  );

  if (!grupo) return chapa;

  // Columna centrada del ancho de la chapa: el grupo no ensancha la fila ni descuadra las
  // listas, solo agrega una línea debajo.
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 1, verticalAlign: "middle" }}>
      {chapa}
      <span
        style={{
          fontSize: size === "lg" ? 10 : 9,
          fontWeight: 700,
          letterSpacing: 0.4,
          lineHeight: 1,
          color: "var(--muted)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {grupo}
      </span>
    </span>
  );
}
