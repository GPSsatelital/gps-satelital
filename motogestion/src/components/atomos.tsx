// ── Átomos del sistema de diseño — ÚNICA fuente (ver .interface-design/system.md) ──
// Un solo Btn, un solo Badge, un solo Chip. Toda UI nueva los usa; NO redefinir
// botones/badges/chips a mano en cada vista. Bindeados a tokens (día/noche), grilla
// de 4px, radios en escala, targets 44px, estados, Inter (heredada).
import type { ButtonHTMLAttributes, ReactNode } from "react";

// ── Btn ──────────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md";

const BTN_VARIANT: Record<BtnVariant, React.CSSProperties> = {
  primary:   { background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "#0f172a", border: "none" },
  secondary: { background: "var(--soft2)", color: "var(--muted2)", border: "1px solid var(--line)" },
  ghost:     { background: "transparent", color: "var(--accent)", border: "none" },
  danger:    { background: "var(--bad-soft)", color: "var(--bad-ink)", border: "1px solid var(--bad-line)" },
};

export function Btn({
  variant = "secondary", size = "md", full, children, style, ...rest
}: {
  variant?: BtnVariant; size?: BtnSize; full?: boolean; children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const dims = size === "sm"
    ? { height: 32, padding: "0 12px", fontSize: 12 }
    : { height: 40, padding: "0 16px", fontSize: 13 };
  return (
    <button
      {...rest}
      style={{
        ...BTN_VARIANT[variant],
        ...dims,
        width: full ? "100%" : undefined,
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: 8, fontWeight: 600, cursor: rest.disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap", boxSizing: "border-box",
        opacity: rest.disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
// Estado no interactivo. Tono por token; forma opcional (● al día ▲ gabela ✕ mora).
export type BadgeTone = "ok" | "warn" | "bad" | "accent" | "neutral" | "indigo";

const BADGE_TONE: Record<BadgeTone, { bg: string; color: string }> = {
  ok:      { bg: "var(--ok-soft)",      color: "var(--ok-ink)" },
  warn:    { bg: "var(--warn-soft)",    color: "var(--warn-ink)" },
  bad:     { bg: "var(--bad-soft)",     color: "var(--bad-ink)" },
  accent:  { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  neutral: { bg: "var(--soft2)",        color: "var(--muted2)" },
  indigo:  { bg: "var(--indigo-soft)",  color: "var(--violet)" },
};

export function Badge({ tone = "neutral", children, style }: {
  tone?: BadgeTone; children: ReactNode; style?: React.CSSProperties;
}) {
  const c = BADGE_TONE[tone];
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: 6,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
      background: c.bg, color: c.color, ...style,
    }}>
      {children}
    </span>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────────
// Filtro interactivo (toggle). Activo = acento. Cuenta opcional en muted.
export function Chip({ activo, count, children, onClick, style }: {
  activo?: boolean; count?: number; children: ReactNode;
  onClick?: () => void; style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32, padding: "0 12px", borderRadius: 999, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: activo ? 600 : 500, whiteSpace: "nowrap",
        background: activo ? "var(--accent)" : "var(--soft)",
        color: activo ? "var(--card)" : "var(--muted2)",
        display: "inline-flex", alignItems: "center", gap: 6, boxSizing: "border-box",
        ...style,
      }}
    >
      <span>{children}</span>
      {count != null && <span style={{ color: activo ? "var(--card)" : "var(--faint)", fontWeight: 600 }}>{count}</span>}
    </button>
  );
}
