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

export default function BusquedaGlobal({ onClose, onNavegar, clientes, motos, contratos }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  const clientesFiltrados = q.length < 2 ? [] : clientes.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.cedula.includes(q)
  ).slice(0, 4);

  const motosFiltradas = q.length < 2 ? [] : motos.filter(m =>
    m.placa.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q)
  ).slice(0, 4);

  const contratosFiltrados = q.length < 2 ? [] : contratos.filter(c => {
    const moto = motos.find(m => m.id === c.moto_id);
    const cliente = clientes.find(cl => cl.id === c.cliente_id);
    return (
      (moto && moto.placa.toLowerCase().includes(q)) ||
      (cliente && cliente.nombre.toLowerCase().includes(q))
    );
  }).slice(0, 4);

  const hayResultados = clientesFiltrados.length > 0 || motosFiltradas.length > 0 || contratosFiltrados.length > 0;

  function ResultItem({ icon, line1, line2, onClick }: { icon: string; line1: string; line2: string; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line1}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{line2}</div>
        </div>
        <span style={{ color: "#cbd5e1", fontSize: 16 }}>›</span>
      </button>
    );
  }

  function GroupLabel({ label }: { label: string }) {
    return (
      <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.7)" }} />
      <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", width: "min(560px, 95vw)", background: "white", borderRadius: 20, zIndex: 301, boxShadow: "0 24px 80px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 18, color: "#94a3b8" }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar cliente, placa, cédula..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "#0f172a", background: "transparent" }}
            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8", padding: 4 }}>✕</button>
        </div>

        {q.length < 2 && (
          <div style={{ padding: "24px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Escribe al menos 2 caracteres para buscar
          </div>
        )}

        {q.length >= 2 && !hayResultados && (
          <div style={{ padding: "24px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Sin resultados para "{query}"
          </div>
        )}

        {clientesFiltrados.length > 0 && (
          <div>
            <GroupLabel label="Clientes" />
            {clientesFiltrados.map(c => (
              <ResultItem
                key={c.id}
                icon="👤"
                line1={c.nombre}
                line2={`C.C. ${c.cedula} · ${c.estado}`}
                onClick={() => { onNavegar("clientes"); onClose(); }}
              />
            ))}
          </div>
        )}

        {motosFiltradas.length > 0 && (
          <div>
            <GroupLabel label="Motos" />
            {motosFiltradas.map(m => (
              <ResultItem
                key={m.id}
                icon="🏍️"
                line1={m.placa}
                line2={`${m.marca} ${m.modelo} · ${m.estado}`}
                onClick={() => { onNavegar("motos"); onClose(); }}
              />
            ))}
          </div>
        )}

        {contratosFiltrados.length > 0 && (
          <div>
            <GroupLabel label="Contratos" />
            {contratosFiltrados.map(c => {
              const moto = motos.find(m => m.id === c.moto_id);
              const cliente = clientes.find(cl => cl.id === c.cliente_id);
              return (
                <ResultItem
                  key={c.id}
                  icon="📄"
                  line1={`${moto?.placa ?? "Sin moto"} · ${cliente?.nombre ?? "Sin cliente"}`}
                  line2={`${c.forma_pago} · ${c.estado}`}
                  onClick={() => { onNavegar("contratos"); onClose(); }}
                />
              );
            })}
          </div>
        )}

        {hayResultados && <div style={{ height: 8 }} />}
      </div>
    </>
  );
}
