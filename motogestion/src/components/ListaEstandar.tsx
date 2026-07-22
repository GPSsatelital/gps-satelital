// ── Formato ESTÁNDAR de listas para TODO el sistema ──
// Cualquier lista (Motos, Clientes, Contratos, Cartera, y las que se agreguen a
// futuro) DEBE usar estos dos componentes. Así el formato (recuadro, scroll,
// padding, riel, tipografía) es FIJO y solo cambia el contenido — imposible que
// una lista nueva elija su propia apariencia y se desincronice.
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { card, listaConScroll } from "../styles/shared";
import Placa from "./Placa";

const EASE = [0.23, 1, 0.32, 1] as const;

// Recuadro de lista con scroll propio. Envuelve las filas para que la lista nunca
// ocupe toda la pantalla; tiene el mismo tamaño/borde/sombra en toda la app.
export function ListBox({ isMobile, children, maxHeightVh, scrollRef }: {
  isMobile: boolean;
  children: ReactNode;
  maxHeightVh?: number; // opcional: sobrescribe el alto (por defecto 58/64vh)
  scrollRef?: (el: HTMLDivElement | null) => void; // preservar posición de scroll
}) {
  const scroll = listaConScroll(isMobile);
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{ ...card, padding: 10 }}
    >
      <div ref={scrollRef} style={{ ...scroll, ...(maxHeightVh ? { maxHeight: `${maxHeightVh}vh` } : {}) }}>
        {children}
      </div>
    </motion.div>
  );
}

// Fila estándar de lista. La ESTRUCTURA es fija; el contenido entra por props:
//  · placa    → mini placa amarilla a la izquierda (opcional)
//  · titulo   → texto principal (uppercase, negrita)
//  · subtitulo→ línea secundaria muted (texto o nodo)
//  · right    → esquina derecha: badge de estado, monto, etc. (apilado)
//  · extra    → contenido debajo, a todo el ancho (barra de progreso, botones…)
//  · rielColor→ color del riel izquierdo (estado); si no, transparente
export function ItemLista({
  placa, titulo, subtitulo, right, extra, rielColor, seleccionado, onClick,
}: {
  placa?: string;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  right?: ReactNode;
  extra?: ReactNode;
  rielColor?: string;
  seleccionado?: boolean;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      onClick={onClick}
      whileTap={reduce || !onClick ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.12, ease: EASE }}
      style={{
        background: seleccionado ? "var(--accent-soft2)" : "var(--soft2)",
        borderRadius: 10,
        padding: "9px 11px",
        cursor: onClick ? "pointer" : "default",
        borderLeft: `3px solid ${rielColor ?? "transparent"}`,
        outline: seleccionado ? "1.5px solid var(--accent)" : "1px solid var(--line)",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {placa && <Placa placa={placa} size="sm" />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {titulo}
          </div>
          {subtitulo != null && subtitulo !== false && (
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2, minWidth: 0 }}>
              {subtitulo}
            </div>
          )}
        </div>
        {right != null && right !== false && (
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {right}
          </div>
        )}
      </div>
      {extra != null && extra !== false && <div style={{ marginTop: 8 }}>{extra}</div>}
    </motion.div>
  );
}
