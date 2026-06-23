import { useEffect, useRef, useState } from "react";
import type { ViewKey } from "../App";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";
import type { Contrato } from "../hooks/useContratos";

interface Props {
  onClose: () => void;
  onNavegar: (view: ViewKey, filter?: string) => void;
  clientes: Cliente[];
  motos: Moto[];
  contratos: Contrato[];
}

const ESTADO_COLOR: Record<string, { bg: string; color: string }> = {
  Activo:        { bg: "#dcfce7", color: "#166534" },
  "En proceso":  { bg: "#fef3c7", color: "#92400e" },
  "En mora":     { bg: "#fee2e2", color: "#991b1b" },
  "En riesgo":   { bg: "#ffedd5", color: "#9a3412" },
  Aprobado:      { bg: "#dbeafe", color: "#1d4ed8" },
  Disponible:    { bg: "#dcfce7", color: "#166534" },
  Asignada:      { bg: "#dbeafe", color: "#1d4ed8" },
  Mantenimiento: { bg: "#ffe4e6", color: "#be123c" },
  Fiscalia:      { bg: "#fef9c3", color: "#713f12" },
  Transito:      { bg: "#ffedd5", color: "#9a3412" },
  Garantia:      { bg: "#f3e8ff", color: "#6b21a8" },
};

function Badge({ label }: { label: string }) {
  const s = ESTADO_COLOR[label] ?? { bg: "#f1f5f9", color: "#334155" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", textAlign: "right" }}>{value}</span>
    </div>
  );
}

type PreviewItem = { tipo: "cliente"; id: string } | { tipo: "moto"; id: string } | { tipo: "contrato"; id: string };

export default function BusquedaGlobal({ onClose, onNavegar, clientes, motos, contratos }: Props) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PreviewItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = window.innerWidth < 700;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim().toLowerCase();

  const clientesFiltrados = q.length < 2 ? [] : clientes.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || (c.telefono ?? "").includes(q)
  ).slice(0, 6);

  const motosFiltradas = q.length < 2 ? [] : motos.filter(m =>
    m.placa.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q)
  ).slice(0, 6);

  const contratosFiltrados = q.length < 2 ? [] : contratos.filter(c => {
    const moto = motos.find(m => m.id === c.moto_id);
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    return (moto && moto.placa.toLowerCase().includes(q)) || (cliente && cliente.nombre.toLowerCase().includes(q));
  }).slice(0, 4);

  const hayResultados = clientesFiltrados.length > 0 || motosFiltradas.length > 0 || contratosFiltrados.length > 0;

  const previewCliente  = preview?.tipo === "cliente"  ? clientes.find(c => c.id === preview.id)  : null;
  const previewMoto     = preview?.tipo === "moto"     ? motos.find(m => m.id === preview.id)     : null;
  const previewContrato = preview?.tipo === "contrato" ? contratos.find(c => c.id === preview.id) : null;
  const previewContratoCli  = previewContrato ? clientes.find(c => c.id === previewContrato.cliente_id) : null;
  const previewContratoMoto = previewContrato ? motos.find(m => m.id === previewContrato.moto_id)       : null;

  function GroupLabel({ label }: { label: string }) {
    return <div style={{ padding: "10px 16px 4px", fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>;
  }

  // Panel de detalle — se muestra en la derecha (desktop) o encima (móvil)
  function DetailPanel() {
    if (!preview) return null;

    return (
      <div style={{ padding: "18px 18px 8px" }}>
        {previewCliente && (
          <>
            <div style={{ fontWeight: 900, fontSize: 19, color: "#0f172a", textTransform: "uppercase", marginBottom: 8 }}>{previewCliente.nombre}</div>
            <div style={{ marginBottom: 14 }}><Badge label={previewCliente.estado} /></div>
            <InfoRow label="Cédula"      value={previewCliente.cedula} />
            <InfoRow label="Teléfono"    value={previewCliente.telefono ?? "—"} />
            <InfoRow label="WhatsApp"    value={previewCliente.whatsapp ?? "—"} />
            <InfoRow label="Dirección"   value={previewCliente.direccion ?? "—"} />
            <InfoRow label="Ruta"        value={previewCliente.ruta_contrato ?? "—"} />
            {previewCliente.acompanante_nombre && <InfoRow label="Acompañante" value={previewCliente.acompanante_nombre} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <button onClick={() => { onNavegar("ficha_cliente", previewCliente.id); onClose(); }}
                style={{ padding: "12px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Ver ficha completa →
              </button>
              <button onClick={() => { onNavegar("cobros", previewCliente.id); onClose(); }}
                style={{ padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                💳 Ir a cartera
              </button>
            </div>
          </>
        )}

        {previewMoto && (
          <>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a", marginBottom: 8 }}>{previewMoto.placa}</div>
            <div style={{ marginBottom: 14 }}><Badge label={previewMoto.estado === "Mantenimiento" ? "En taller" : previewMoto.estado} /></div>
            <InfoRow label="Marca / Modelo" value={`${previewMoto.marca} ${previewMoto.modelo}`} />
            <InfoRow label="Grupo"          value={previewMoto.grupo} />
            {(previewMoto as any).color      && <InfoRow label="Color"      value={(previewMoto as any).color} />}
            {previewMoto.cilindraje          && <InfoRow label="Cilindraje" value={previewMoto.cilindraje} />}
            {previewMoto.numero_motor        && <InfoRow label="N° Motor"   value={previewMoto.numero_motor} />}
            {previewMoto.fecha_seguro        && <InfoRow label="Vence SOAT" value={new Date(previewMoto.fecha_seguro).toLocaleDateString("es-CO")} />}
            {previewMoto.fecha_tecnomecanica && <InfoRow label="Vence Tecno" value={new Date(previewMoto.fecha_tecnomecanica).toLocaleDateString("es-CO")} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <button onClick={() => { onNavegar("ficha_moto", previewMoto.id); onClose(); }}
                style={{ padding: "12px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Ver ficha completa →
              </button>
              <button onClick={() => { onNavegar("motos", previewMoto.id); onClose(); }}
                style={{ padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                🏍️ Ir a Motos
              </button>
            </div>
          </>
        )}

        {previewContrato && (
          <>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a", textTransform: "uppercase", marginBottom: 8 }}>{previewContratoCli?.nombre ?? "Sin cliente"}</div>
            <div style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Badge label={previewContrato.estado} />
              {previewContrato.forma_pago && <Badge label={previewContrato.forma_pago} />}
            </div>
            <InfoRow label="Placa"      value={previewContratoMoto?.placa ?? "—"} />
            <InfoRow label="Moto"       value={previewContratoMoto ? `${previewContratoMoto.marca} ${previewContratoMoto.modelo}` : "—"} />
            <InfoRow label="Tipo ruta"  value={previewContrato.tipo_ruta ?? "—"} />
            <InfoRow label="Día de pago" value={(previewContrato as any).dia_pago ?? "—"} />
            {(previewContrato as any).valor_periodo && <InfoRow label="Valor período" value={`$${Number((previewContrato as any).valor_periodo).toLocaleString("es-CO")}`} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              {previewContratoCli && (
                <button onClick={() => { onNavegar("ficha_cliente", previewContratoCli.id); onClose(); }}
                  style={{ padding: "12px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Ver ficha del cliente →
                </button>
              )}
              <button onClick={() => { onNavegar("contratos", previewContrato.id); onClose(); }}
                style={{ padding: "12px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                📄 Ver contrato
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // En móvil: si hay preview activo, mostrar solo el detalle
  if (isMobile && preview) {
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.7)" }} />
        <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", width: "94vw", background: "white", borderRadius: 20, zIndex: 301, boxShadow: "0 24px 80px rgba(15,23,42,0.28)", overflow: "hidden", maxHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
            <button onClick={() => setPreview(null)} style={{ border: "none", background: "none", color: "#0284c7", fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}>
              ← Volver
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", color: "#334155", borderRadius: 8, padding: "4px 10px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Cerrar</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <DetailPanel />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.7)" }} />
      <div style={{ position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", width: isMobile ? "94vw" : "min(700px, 96vw)", background: "white", borderRadius: 20, zIndex: 301, boxShadow: "0 24px 80px rgba(15,23,42,0.28)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 80px)" }}>

        {/* Barra de búsqueda */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <span style={{ fontSize: 17, color: "#94a3b8" }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setPreview(null); }}
            placeholder="Buscar cliente, cédula, placa..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "#0f172a", background: "transparent" }}
            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setPreview(null); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#94a3b8", padding: 4 }}>✕</button>
          )}
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, color: "#334155", padding: "5px 12px", borderRadius: 8, fontWeight: 600 }}>Cerrar</button>
        </div>

        {/* Cuerpo */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Lista */}
          <div style={{ flex: preview && !isMobile ? "0 0 52%" : "1 1 auto", overflowY: "auto", borderRight: preview && !isMobile ? "1px solid #f1f5f9" : "none" }}>
            {q.length < 2 && (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Escribe al menos 2 caracteres
              </div>
            )}
            {q.length >= 2 && !hayResultados && (
              <div style={{ padding: "28px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Sin resultados para "<strong>{query}</strong>"
              </div>
            )}

            {clientesFiltrados.length > 0 && (
              <div>
                <GroupLabel label={`Clientes (${clientesFiltrados.length})`} />
                {clientesFiltrados.map(c => (
                  <div key={c.id} onClick={() => setPreview({ tipo: "cliente", id: c.id })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: preview?.id === c.id ? "#eff6ff" : "transparent", borderLeft: preview?.id === c.id ? "3px solid #0284c7" : "3px solid transparent" }}>
                    <span style={{ fontSize: 20 }}>👤</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>C.C. {c.cedula}{c.telefono ? " · " + c.telefono : ""}</div>
                    </div>
                    <Badge label={c.estado} />
                    <span style={{ color: "#cbd5e1", fontSize: 18, marginLeft: 4 }}>›</span>
                  </div>
                ))}
              </div>
            )}

            {motosFiltradas.length > 0 && (
              <div>
                <GroupLabel label={`Motos (${motosFiltradas.length})`} />
                {motosFiltradas.map(m => (
                  <div key={m.id} onClick={() => setPreview({ tipo: "moto", id: m.id })}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: preview?.id === m.id ? "#eff6ff" : "transparent", borderLeft: preview?.id === m.id ? "3px solid #0284c7" : "3px solid transparent" }}>
                    <span style={{ fontSize: 20 }}>🏍️</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.placa}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{m.marca} {m.modelo} · {m.grupo}</div>
                    </div>
                    <Badge label={m.estado === "Mantenimiento" ? "En taller" : m.estado} />
                    <span style={{ color: "#cbd5e1", fontSize: 18, marginLeft: 4 }}>›</span>
                  </div>
                ))}
              </div>
            )}

            {contratosFiltrados.length > 0 && (
              <div>
                <GroupLabel label={`Contratos (${contratosFiltrados.length})`} />
                {contratosFiltrados.map(c => {
                  const moto = motos.find(m => m.id === c.moto_id);
                  const cliente = clientes.find(cl => cl.id === c.cliente_id);
                  return (
                    <div key={c.id} onClick={() => setPreview({ tipo: "contrato", id: c.id })}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", background: preview?.id === c.id ? "#eff6ff" : "transparent", borderLeft: preview?.id === c.id ? "3px solid #0284c7" : "3px solid transparent" }}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cliente?.nombre ?? "Sin cliente"}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{moto?.placa ?? "—"} · {c.forma_pago ?? c.tipo_ruta}</div>
                      </div>
                      <Badge label={c.estado} />
                      <span style={{ color: "#cbd5e1", fontSize: 18, marginLeft: 4 }}>›</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>

          {/* Panel detalle — solo desktop */}
          {preview && !isMobile && (
            <div style={{ flex: "1 1 auto", overflowY: "auto", background: "#fafbfc" }}>
              <DetailPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
