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
  Activo:             { bg: "#dcfce7", color: "#166534" },
  "En proceso":       { bg: "#fef3c7", color: "#92400e" },
  "En mora":          { bg: "#fee2e2", color: "#991b1b" },
  "En riesgo":        { bg: "#ffedd5", color: "#9a3412" },
  Aprobado:           { bg: "#dbeafe", color: "#1d4ed8" },
  Disponible:         { bg: "#dcfce7", color: "#166534" },
  Asignada:           { bg: "#dbeafe", color: "#1d4ed8" },
  Mantenimiento:      { bg: "#ffe4e6", color: "#be123c" },
  Fiscalia:           { bg: "#fef9c3", color: "#713f12" },
  Transito:           { bg: "#ffedd5", color: "#9a3412" },
  Garantia:           { bg: "#f3e8ff", color: "#6b21a8" },
};

function Badge({ label }: { label: string }) {
  const s = ESTADO_COLOR[label] ?? { bg: "#f1f5f9", color: "#334155" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 999, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export default function BusquedaGlobal({ onClose, onNavegar, clientes, motos, contratos }: Props) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<{ tipo: "cliente" | "moto" | "contrato"; id: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim().toLowerCase();

  const clientesFiltrados = q.length < 2 ? [] : clientes.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.cedula.includes(q) || (c.telefono ?? "").includes(q)
  ).slice(0, 5);

  const motosFiltradas = q.length < 2 ? [] : motos.filter(m =>
    m.placa.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q)
  ).slice(0, 5);

  const contratosFiltrados = q.length < 2 ? [] : contratos.filter(c => {
    const moto = motos.find(m => m.id === c.moto_id);
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    return (moto && moto.placa.toLowerCase().includes(q)) || (cliente && cliente.nombre.toLowerCase().includes(q));
  }).slice(0, 4);

  const hayResultados = clientesFiltrados.length > 0 || motosFiltradas.length > 0 || contratosFiltrados.length > 0;

  // Objeto seleccionado en preview
  const previewCliente = preview?.tipo === "cliente" ? clientes.find(c => c.id === preview.id) : null;
  const previewMoto    = preview?.tipo === "moto"    ? motos.find(m => m.id === preview.id)    : null;
  const previewContrato = preview?.tipo === "contrato" ? contratos.find(c => c.id === preview.id) : null;
  const previewContratoCli = previewContrato ? clientes.find(c => c.id === previewContrato.cliente_id) : null;
  const previewContratoMoto = previewContrato ? motos.find(m => m.id === previewContrato.moto_id) : null;

  function Row({ icon, line1, line2, badge, onGo, onPreview, active }: {
    icon: string; line1: string; line2: string; badge?: string;
    onGo: () => void; onPreview: () => void; active: boolean;
  }) {
    return (
      <div
        onClick={onPreview}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", background: active ? "#eff6ff" : "transparent", borderLeft: active ? "3px solid #0284c7" : "3px solid transparent" }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: 17 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line1}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line2}</div>
        </div>
        {badge && <Badge label={badge} />}
        <button
          onClick={e => { e.stopPropagation(); onGo(); }}
          style={{ border: "none", background: "#0284c7", color: "white", borderRadius: 8, padding: "4px 10px", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Abrir →
        </button>
      </div>
    );
  }

  function GroupLabel({ label }: { label: string }) {
    return <div style={{ padding: "8px 16px 2px", fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>;
  }

  function InfoRow({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", textAlign: "right" }}>{value}</span>
      </div>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.7)" }} />
      <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", width: "min(700px, 96vw)", background: "white", borderRadius: 20, zIndex: 301, boxShadow: "0 24px 80px rgba(15,23,42,0.28)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 100px)" }}>

        {/* Barra de búsqueda */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <span style={{ fontSize: 18, color: "#94a3b8" }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setPreview(null); }}
            placeholder="Buscar cliente, cédula, placa..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "#0f172a", background: "transparent" }}
            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
          />
          {query && <button onClick={() => { setQuery(""); setPreview(null); inputRef.current?.focus(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8" }}>✕</button>}
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 13, color: "#334155", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>Cerrar</button>
        </div>

        {/* Cuerpo: resultados + preview en paralelo */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Lista de resultados */}
          <div style={{ flex: "0 0 auto", width: preview ? "55%" : "100%", overflowY: "auto", borderRight: preview ? "1px solid #f1f5f9" : "none" }}>
            {q.length < 2 && (
              <div style={{ padding: "28px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Escribe al menos 2 caracteres
              </div>
            )}
            {q.length >= 2 && !hayResultados && (
              <div style={{ padding: "28px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Sin resultados para "<strong>{query}</strong>"
              </div>
            )}

            {clientesFiltrados.length > 0 && (
              <div>
                <GroupLabel label={`Clientes (${clientesFiltrados.length})`} />
                {clientesFiltrados.map(c => (
                  <Row key={c.id}
                    icon="👤"
                    line1={c.nombre}
                    line2={`C.C. ${c.cedula}${c.telefono ? " · " + c.telefono : ""}`}
                    badge={c.estado}
                    active={preview?.id === c.id}
                    onPreview={() => setPreview({ tipo: "cliente", id: c.id })}
                    onGo={() => { onNavegar("ficha_cliente", c.id); onClose(); }}
                  />
                ))}
              </div>
            )}

            {motosFiltradas.length > 0 && (
              <div>
                <GroupLabel label={`Motos (${motosFiltradas.length})`} />
                {motosFiltradas.map(m => (
                  <Row key={m.id}
                    icon="🏍️"
                    line1={m.placa}
                    line2={`${m.marca} ${m.modelo} · ${m.grupo}`}
                    badge={m.estado === "Mantenimiento" ? "En taller" : m.estado}
                    active={preview?.id === m.id}
                    onPreview={() => setPreview({ tipo: "moto", id: m.id })}
                    onGo={() => { onNavegar("ficha_moto", m.id); onClose(); }}
                  />
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
                    <Row key={c.id}
                      icon="📄"
                      line1={cliente?.nombre ?? "Sin cliente"}
                      line2={`${moto?.placa ?? "Sin moto"} · ${c.forma_pago ?? c.tipo_ruta}`}
                      badge={c.estado}
                      active={preview?.id === c.id}
                      onPreview={() => setPreview({ tipo: "contrato", id: c.id })}
                      onGo={() => { onNavegar("contratos", c.id); onClose(); }}
                    />
                  );
                })}
              </div>
            )}

            {hayResultados && <div style={{ height: 8 }} />}
          </div>

          {/* Panel de preview */}
          {preview && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", background: "#fafbfc" }}>

              {previewCliente && (
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", textTransform: "uppercase", marginBottom: 4 }}>{previewCliente.nombre}</div>
                  <div style={{ marginBottom: 12 }}><Badge label={previewCliente.estado} /></div>
                  <InfoRow label="Cédula" value={previewCliente.cedula} />
                  <InfoRow label="Teléfono" value={previewCliente.telefono ?? "—"} />
                  <InfoRow label="WhatsApp" value={previewCliente.whatsapp ?? "—"} />
                  <InfoRow label="Dirección" value={previewCliente.direccion ?? "—"} />
                  <InfoRow label="Ruta" value={previewCliente.ruta_contrato ?? "—"} />
                  {previewCliente.acompanante_nombre && <InfoRow label="Acompañante" value={previewCliente.acompanante_nombre} />}
                  <button
                    onClick={() => { onNavegar("ficha_cliente", previewCliente.id); onClose(); }}
                    style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Ver ficha completa →
                  </button>
                  <button
                    onClick={() => { onNavegar("cobros", previewCliente.id); onClose(); }}
                    style={{ marginTop: 8, width: "100%", padding: "11px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    💳 Ir a cartera
                  </button>
                </div>
              )}

              {previewMoto && (
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>{previewMoto.placa}</div>
                  <div style={{ marginBottom: 12 }}><Badge label={previewMoto.estado === "Mantenimiento" ? "En taller" : previewMoto.estado} /></div>
                  <InfoRow label="Marca / Modelo" value={`${previewMoto.marca} ${previewMoto.modelo}`} />
                  <InfoRow label="Grupo" value={previewMoto.grupo} />
                  {(previewMoto as any).color && <InfoRow label="Color" value={(previewMoto as any).color} />}
                  {previewMoto.cilindraje && <InfoRow label="Cilindraje" value={previewMoto.cilindraje} />}
                  {previewMoto.numero_motor && <InfoRow label="N° Motor" value={previewMoto.numero_motor} />}
                  {previewMoto.fecha_seguro && <InfoRow label="Vence SOAT" value={new Date(previewMoto.fecha_seguro).toLocaleDateString("es-CO")} />}
                  {previewMoto.fecha_tecnomecanica && <InfoRow label="Vence Tecno" value={new Date(previewMoto.fecha_tecnomecanica).toLocaleDateString("es-CO")} />}
                  <button
                    onClick={() => { onNavegar("ficha_moto", previewMoto.id); onClose(); }}
                    style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Ver ficha completa →
                  </button>
                  <button
                    onClick={() => { onNavegar("motos", previewMoto.id); onClose(); }}
                    style={{ marginTop: 8, width: "100%", padding: "11px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    🏍️ Ir a Motos
                  </button>
                </div>
              )}

              {previewContrato && (
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a", textTransform: "uppercase", marginBottom: 4 }}>{previewContratoCli?.nombre ?? "Sin cliente"}</div>
                  <div style={{ marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge label={previewContrato.estado} />
                    {previewContrato.forma_pago && <Badge label={previewContrato.forma_pago} />}
                  </div>
                  <InfoRow label="Placa" value={previewContratoMoto?.placa ?? "—"} />
                  <InfoRow label="Moto" value={previewContratoMoto ? `${previewContratoMoto.marca} ${previewContratoMoto.modelo}` : "—"} />
                  <InfoRow label="Tipo ruta" value={previewContrato.tipo_ruta ?? "—"} />
                  <InfoRow label="Día de pago" value={(previewContrato as any).dia_pago ?? "—"} />
                  {(previewContrato as any).valor_periodo && <InfoRow label="Valor período" value={`$${Number((previewContrato as any).valor_periodo).toLocaleString("es-CO")}`} />}
                  {previewContratoCli && (
                    <button
                      onClick={() => { onNavegar("ficha_cliente", previewContratoCli.id); onClose(); }}
                      style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 12, border: "none", background: "#0284c7", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      Ver ficha del cliente →
                    </button>
                  )}
                  <button
                    onClick={() => { onNavegar("contratos", previewContrato.id); onClose(); }}
                    style={{ marginTop: 8, width: "100%", padding: "11px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", color: "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    📄 Ver contrato
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
