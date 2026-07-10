import { secondaryBtn, primaryBtn } from "../styles/shared";

// Ventana flotante de confirmación de pago, reutilizable en los 3 puntos de registro
// (detalle del contrato, ventana "Cobrar", Cobro Diario). Muestra el método (Efectivo o
// Transferencia) y avisa si hay un posible duplicado. Solo advierte — no bloquea.

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

interface Props {
  monto: number;
  metodo: "Efectivo" | "Transferencia";
  clienteNombre: string;
  placa?: string;
  duplicado?: boolean;
  procesando?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export default function ModalConfirmarPago({ monto, metodo, clienteNombre, placa, duplicado, procesando, onCancelar, onConfirmar }: Props) {
  const esTransf = metodo === "Transferencia";
  const acento = esTransf ? "#1d4ed8" : "#166534";
  const fondo = esTransf ? "#eff6ff" : "#f0fdf4";
  const borde = esTransf ? "#bfdbfe" : "#bbf7d0";
  return (
    <>
      <div onClick={() => !procesando && onCancelar()} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 500 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(420px,94vw)", background: "white", borderRadius: 18, padding: 22, zIndex: 501, boxShadow: "0 20px 60px rgba(15,23,42,0.28)", boxSizing: "border-box" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Confirmar pago</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14, textTransform: "uppercase" }}>{clienteNombre}{placa ? ` · ${placa}` : ""}</div>

        <div style={{ textAlign: "center", background: fondo, border: `1px solid ${borde}`, borderRadius: 12, padding: "14px 12px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: acento, fontWeight: 700 }}>Vas a registrar</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: acento }}>$ {fmt(monto)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: acento }}>{esTransf ? "🏦 Transferencia" : "💵 Efectivo"}</div>
        </div>

        {duplicado && (
          <div style={{ background: "#fef3c7", border: "1px solid #fde047", borderRadius: 12, padding: "10px 12px", marginBottom: 14, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
            ⚠️ Ya hay un pago de <strong>$ {fmt(monto)}</strong> registrado <strong>hoy</strong> para este cliente. ¿Seguro que quieres registrar otro igual?
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancelar} disabled={procesando} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={onConfirmar} disabled={procesando} style={{ ...primaryBtn, flex: 2, opacity: procesando ? 0.6 : 1 }}>
            {procesando ? "Registrando..." : "Confirmar y registrar"}
          </button>
        </div>
      </div>
    </>
  );
}
