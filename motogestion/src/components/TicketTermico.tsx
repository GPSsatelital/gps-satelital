// Ticket térmico para impresora POS de 80mm (GA-E2001).
// Formato minimalista: negro puro, compacto, monoespaciado, separadores de guiones —
// pensado para que salga nítido y corto en papel térmico (no el diseño de pantalla,
// que salía borroso y muy largo). Se usa para el recibo de pago (CobrosView) y el
// recibo de base inicial (ClientesView), con el MISMO formato.
//
// modo="print"   → oculto en pantalla, es lo único que se imprime (ver index.css).
// modo="preview" → visible en pantalla como vista previa, NO se imprime.

import { hoyISO } from "../utils/fecha";

export type LineaTicket = { label: string; valor: string; fuerte?: boolean };

export type TicketData = {
  titulo: string;          // "COMPROBANTE DE PAGO" | "RECIBO DE BASE INICIAL"
  grupo?: string;
  folio: string;
  fecha: string;           // "YYYY-MM-DD"
  cliente: string;
  cedula?: string;
  placa?: string;
  montoLabel: string;      // "MONTO PAGADO" | "ENTREGÓ"
  monto: number;
  lineas?: LineaTicket[];  // detalle opcional (desglose de la cuenta)
  nota?: string;           // concepto / mensaje de pie
  recibidoPor?: string;
};

// Recibo de la base inicial que el cliente entrega al registrarse (mismo formato de ticket).
// fecha opcional: al reimprimir desde la ficha se usa la fecha de registro del cliente.
export function buildTicketBaseInicial(nombre: string, cedula: string, monto: number, recibidoPor: string, fecha?: string): TicketData {
  const f = fecha ?? hoyISO();
  return {
    titulo: "RECIBO DE BASE INICIAL",
    folio: `BASE-${f.slice(2).replace(/-/g, "")}-${cedula.slice(-4)}`,
    fecha: f,
    cliente: nombre,
    cedula,
    montoLabel: "ENTREGÓ",
    monto,
    nota: "Entrega de base inicial para inicio de proceso",
    recibidoPor,
  };
}

function money(n: number) {
  return "$ " + Math.round(n).toLocaleString("es-CO");
}
function fechaLarga(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const guion: React.CSSProperties = { borderTop: "1px dashed #000", margin: "6px 0" };
const fila: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, lineHeight: 1.45, color: "#000" };

export default function TicketTermico({ datos, modo }: { datos: TicketData; modo: "print" | "preview" }) {
  const claseRaiz = modo === "print" ? "ticket-termico" : "ticket-preview recibo-no-print";
  return (
    <div
      className={claseRaiz}
      style={{
        fontFamily: "'Courier New', ui-monospace, monospace",
        color: "#000",
        ...(modo === "preview"
          ? { width: 300, margin: "0 auto", padding: "14px 12px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff" }
          : {}),
      }}
    >
      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1, color: "#000" }}>CLUB DE MOTEROS</div>
        {datos.grupo && <div style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{datos.grupo}</div>}
        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, color: "#000" }}>{datos.titulo}</div>
      </div>

      <div style={guion} />

      {/* Datos básicos */}
      <div style={{ display: "grid", gap: 2 }}>
        <div style={fila}><span>Folio</span><span style={{ fontWeight: 700 }}>{datos.folio}</span></div>
        <div style={fila}><span>Fecha</span><span style={{ fontWeight: 700 }}>{fechaLarga(datos.fecha)}</span></div>
        <div style={{ ...fila, textTransform: "uppercase" }}><span style={{ textTransform: "none" }}>Cliente</span><span style={{ fontWeight: 700, textAlign: "right" }}>{datos.cliente}</span></div>
        {datos.cedula && <div style={fila}><span>Cédula</span><span style={{ fontWeight: 700 }}>{datos.cedula}</span></div>}
        {datos.placa && <div style={fila}><span>Placa</span><span style={{ fontWeight: 700 }}>{datos.placa}</span></div>}
      </div>

      <div style={guion} />

      {/* Monto destacado */}
      <div style={{ textAlign: "center", margin: "2px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>{datos.montoLabel}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#000" }}>{money(datos.monto)}</div>
      </div>

      {/* Detalle opcional (desglose de la cuenta) */}
      {datos.lineas && datos.lineas.length > 0 && (
        <>
          <div style={guion} />
          <div style={{ display: "grid", gap: 2 }}>
            {datos.lineas.map((l, i) => (
              <div key={i} style={{ ...fila, fontWeight: l.fuerte ? 700 : 400 }}>
                <span>{l.label}</span><span style={{ fontWeight: 700 }}>{l.valor}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={guion} />

      {/* Nota / concepto */}
      {datos.nota && <div style={{ fontSize: 12, textAlign: "center", color: "#000", margin: "4px 0" }}>{datos.nota}</div>}
      {datos.recibidoPor && <div style={{ fontSize: 12, textAlign: "center", color: "#000" }}>Recibido por: {datos.recibidoPor}</div>}

      <div style={{ fontSize: 11, textAlign: "center", marginTop: 6, color: "#000" }}>¡Gracias!</div>
    </div>
  );
}

// Modal reutilizable: vista previa en pantalla + botón imprimir (para el recibo de base inicial,
// desde el registro de cliente y desde la ficha).
export function ReciboBaseModal({ datos, onCerrar }: { datos: TicketData; onCerrar: () => void }) {
  const btn: React.CSSProperties = { border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" };
  return (
    <div onClick={onCerrar} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 95, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: "white", borderRadius: 20, padding: 20, maxHeight: "90dvh", overflowY: "auto" }}>
        <div className="recibo-no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>🧾 Recibo de base inicial</div>
          <button onClick={onCerrar} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>
        <TicketTermico modo="preview" datos={datos} />
        <TicketTermico modo="print" datos={datos} />
        <div className="recibo-no-print" style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <button onClick={() => window.print()} style={{ ...btn, background: "#0284c7", color: "white" }}>🖨️ Imprimir recibo</button>
          <button onClick={onCerrar} style={{ ...btn, background: "#f1f5f9", color: "#334155" }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
