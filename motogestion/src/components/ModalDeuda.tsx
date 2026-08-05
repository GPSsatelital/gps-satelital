import { useState } from "react";
import MoneyInput from "./MoneyInput";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useDeudas } from "../hooks/useDeudas";
import { useContratos } from "../hooks/useContratos";
import { huecoCuotasHoy } from "../utils/cicloPago";
import { hoyDate } from "../utils/fecha";
import { useAuth } from "../contexts/AuthContext";

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

type TipoDeuda = "daño_vehiculo" | "prestamo_repuesto" | "prestamo_eventualidad" | "fotomulta" | "tarifa_atrasada";

interface Props {
  contratoId: string;
  clienteNombre: string;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid var(--line2)",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
  color: "var(--muted2)",
};

const TIPOS: { value: TipoDeuda; label: string }[] = [
  { value: "daño_vehiculo", label: "🔧 Daño al vehículo" },
  { value: "prestamo_repuesto", label: "🔩 Préstamo de repuesto" },
  { value: "prestamo_eventualidad", label: "💸 Préstamo por eventualidad" },
  { value: "fotomulta", label: "📸 Fotomulta" },
  { value: "tarifa_atrasada", label: "📅 Tarifa atrasada" },
];

export default function ModalDeuda({ contratoId, clienteNombre, onClose }: Props) {
  useBloquearScrollFondo();
  const { registrarDeuda } = useDeudas();
  const { contratos } = useContratos();
  const { profile } = useAuth();
  // Cuánto le exige HOY el motor de cajas por cuotas de arriendo sin llenar. Si es > 0, registrar
  // esa misma plata como deuda la cobraría dos veces.
  const contrato = contratos.find(c => c.id === contratoId) ?? null;
  const huecoCuotas = contrato ? huecoCuotasHoy(contrato, hoyDate()) : 0;
  const [tipo, setTipo] = useState<TipoDeuda>("daño_vehiculo");
  const [valor, setValor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  async function handleGuardar() {
    if (guardando) return;   // anti-doble-clic: esto inserta una deuda real
    if (!valor || Number(valor) <= 0) {
      setError("Ingresa un valor válido.");
      return;
    }
    // La columna es NOT NULL en la BD: sin esto se mandaba null y reventaba con un error
    // crudo de Postgres (23502) delante del cliente, sin decir qué faltaba.
    if (!descripcion.trim()) {
      setError("Escribe de qué es la deuda — queda en el estado de cuenta del cliente.");
      return;
    }
    if (!profile) {
      setError("No se pudo identificar tu usuario. Vuelve a entrar y reintenta.");
      return;
    }
    setError(null);
    setGuardando(true);
    // Mismo hook que usa Cartera (useDeudas): una sola puerta para crear deudas, y así
    // esta queda con su autor — antes se insertaba directo con registrado_por en null,
    // dejando sin rastro quién le cargó la deuda al cliente.
    const { error: err } = await registrarDeuda(contratoId, tipo, descripcion.trim(), Number(valor), profile.id);
    setGuardando(false);
    if (err) {
      setError(err);
      return;
    }
    setExito(true);
    setTimeout(() => onClose(), 1500);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16,
          maxHeight: "calc(100dvh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📋 Nueva deuda</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 13, color: "var(--warn-ink)", fontWeight: 600 }}>
          ⚠️ Esta deuda requiere autorización del administrador. Se registrará como pendiente.
        </div>

        <div>
          <div style={labelStyle}>Tipo de deuda</div>
          <select style={inputStyle} value={tipo} onChange={e => setTipo(e.target.value as TipoDeuda)}>
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <MoneyInput label="Valor" value={valor} onChange={setValor} />

        {/* EL ERROR QUE ESTO EVITA (4-ago-2026): la cuota atrasada NO es una deuda — es una caja
            sin llenar, otro cuaderno. Como en Cartera no aparece bajo "deudas", el funcionario la
            registraba acá a mano para poder meterla en un convenio... y desde ese momento se
            cobraba dos veces: el motor la seguía exigiendo como cuota Y la deuda también.
            Caso real: JORGE BELLO (RLT88H), $190.000 cobrados doble. */}
        {huecoCuotas > 0 && (
          <div style={{ padding: "11px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 12.5, color: "var(--bad-ink)", fontWeight: 600, lineHeight: 1.5 }}>
            ⚠️ El sistema ya le está cobrando <strong>$ {fmt(huecoCuotas)}</strong> de cuotas de
            arriendo atrasadas. Eso no es una deuda aparte: es su arriendo, y ya aparece en
            «Debe pagar ahora».
            <div style={{ marginTop: 6 }}>
              Si lo registras también acá, <strong>se le cobra dos veces</strong>. Para financiarle
              esas semanas, usa el convenio y su opción «¿cuántas semanas de cuota le financias?»
              — ahí el sistema deja de exigirlas por separado.
            </div>
            {tipo === "tarifa_atrasada" && (
              <div style={{ marginTop: 6 }}>
                Registra «Tarifa atrasada» solo si es de un tiempo que el sistema NO está contando
                (por ejemplo, lo que quedó debiendo antes de entrar al sistema).
              </div>
            )}
          </div>
        )}

        <div>
          <div style={labelStyle}>¿De qué es la deuda?</div>
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: farol delantero roto, repuesto prestado el 12 de julio..."
          />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Esto es lo que el cliente va a leer en su estado de cuenta.
          </div>
        </div>

        {error && (
          <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>
        )}

        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            Deuda registrada correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "var(--soft)", color: "var(--muted2)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || exito}
            style={{ background: "var(--warn-soft)", color: "var(--warn-ink)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: guardando ? 0.7 : 1 }}
          >
            {guardando ? "Guardando..." : "Registrar deuda"}
          </button>
        </div>
      </div>
    </div>
  );
}
