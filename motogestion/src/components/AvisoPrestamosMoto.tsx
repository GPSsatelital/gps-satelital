import { usePrestamosDoc } from "../hooks/usePrestamosDoc";
import { hoyISO } from "../utils/fecha";

// Aviso de "dónde están los documentos de ESTA moto": si su tarjeta física o una copia de
// llave está prestada, se ve aquí mismo (a quién, desde cuándo y para cuándo debe volver)
// sin tener que ir al módulo Tarjetas y Llaves. En rojo si ya pasó la fecha de devolución.
export default function AvisoPrestamosMoto({ motoId, compacto = false }: { motoId: string; compacto?: boolean }) {
  const { prestamos } = usePrestamosDoc();
  const activos = prestamos.filter(p => p.moto_id === motoId && p.estado === "prestado");
  if (activos.length === 0) return null;

  const hoy = hoyISO();
  const fmt = (iso: string | null) => (iso ? new Date(iso + "T00:00:00").toLocaleDateString("es-CO") : "—");

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {activos.map(p => {
        const vencido = !!(p.fecha_devolucion_esperada && p.fecha_devolucion_esperada < hoy);
        const tipoLabel = p.tipo === "tarjeta" ? "🪪 Tarjeta de propiedad" : "🔑 Copia de llave";
        return (
          <div key={p.id} style={{
            padding: compacto ? "7px 10px" : "10px 12px",
            borderRadius: 10,
            background: vencido ? "var(--bad-soft)" : "var(--warn-soft)",
            border: `1px solid ${vencido ? "var(--bad-line)" : "var(--warn-line)"}`,
            boxSizing: "border-box",
          }}>
            <div style={{ fontSize: compacto ? 12 : 13, fontWeight: 700, color: vencido ? "var(--bad-ink)" : "var(--warn-ink)" }}>
              {tipoLabel} — PRESTADA
            </div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2, textTransform: "uppercase" }}>
              A: <strong>{p.prestado_a}</strong>
            </div>
            <div style={{ fontSize: 11, color: vencido ? "var(--bad-ink)" : "var(--muted)", marginTop: 2, textTransform: "none" }}>
              Desde {fmt(p.fecha_prestamo)}
              {p.fecha_devolucion_esperada && (vencido
                ? ` · ⚠️ debía devolverla el ${fmt(p.fecha_devolucion_esperada)}`
                : ` · debe devolverla el ${fmt(p.fecha_devolucion_esperada)}`)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
