import type { CSSProperties } from "react";

// Estilos compartidos — una sola fuente de verdad para toda la app.
// Antes cada pantalla redefinía su propia versión (ligeramente distinta),
// esto asegura que cualquier lista/tarjeta/input nuevo se vea igual.

export const card: CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  boxSizing: "border-box",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

export const primaryBtn: CSSProperties = {
  background: "linear-gradient(90deg, #0284c7 0%, #10b981 100%)",
  color: "white",
  border: "none",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

export const secondaryBtn: CSSProperties = {
  background: "white",
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  color: "#334155",
};

// Formato de dinero — una sola fuente de verdad ($ + separador de miles).
// Usar en cualquier lugar que muestre un monto: fmtMoney(195000) => "$ 195.000"
export function fmtMoney(n: number): string {
  return `$ ${Math.round(n).toLocaleString("es-CO")}`;
}

// Recuadro con scroll propio para listas — mismo tamaño en toda la app,
// para que ninguna lista nueva ocupe toda la pantalla.
// Usar: <div style={listaConScroll(isMobile)}>...</div>
export function listaConScroll(isMobile: boolean): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: isMobile ? "58vh" : "64vh",
    overflowY: "auto",
    paddingRight: 2,
  };
}
