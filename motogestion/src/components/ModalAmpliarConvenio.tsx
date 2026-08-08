import { useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useConvenios, type Convenio } from "../hooks/useConvenios";
import { useDeudas } from "../hooks/useDeudas";
import { useContratos } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import { proximoDiaPago } from "../utils/cicloPago";
import { hoyDate, fechaISO } from "../utils/fecha";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import { repartirConvenio } from "./ModalConvenio";
import MoneyInput from "./MoneyInput";

// Agregar una deuda NUEVA a un convenio que ya está corriendo.
//
// EL CASO (8-ago-2026): las multas de recolección se crean solas ($30.000) al inmovilizar. Un
// cliente que ya tiene convenio no tenía dónde ponerlas: Cartera no ofrece crear un segundo,
// la deuda `en_convenio` se excluye a propósito (mig 070), y borrar el viejo para rehacerlo
// PIERDE los abonos. Son 37 clientes con convenio activo — al primero que le recojan la moto se
// queda sin salida.
//
// REGLA DEL DUEÑO: *"los convenios que están hechos deberían quedar así, y mejor sería buscar la
// forma de arreglarlos sin robarle y sin perder nada"*. Por eso esto AMPLÍA, no rehace:
//   · la cuota que el cliente firmó NO se toca — sigue pagando lo mismo por período
//   · lo ya abonado NO se toca — `cuotas_pagadas` queda igual
//   · solo se extiende cuántas cuotas faltan, y queda el rastro en la auditoría

interface Props {
  convenio: Convenio;
  clienteNombre: string;
  onClose: () => void;
  onDone?: (msg: string) => void;
}

export default function ModalAmpliarConvenio({ convenio, clienteNombre, onClose, onDone }: Props) {
  useBloquearScrollFondo();
  const { ampliarConvenio } = useConvenios();
  const { deudas } = useDeudas();
  const { contratos } = useContratos();
  const { profile } = useAuth();

  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");
  const contrato = contratos.find(c => c.id === convenio.contrato_id) ?? null;

  // Deudas del contrato que NO están dentro de este convenio: son las candidatas a agregar.
  const sueltas = deudas.filter(d => d.contrato_id === convenio.contrato_id && d.estado === "pendiente" && d.monto_pendiente > 0);
  const totalSueltas = sueltas.reduce((s, d) => s + d.monto_pendiente, 0);

  const extra = Number(monto) || 0;
  const abonado = convenio.cuotas_pagadas * convenio.cuota_por_periodo;
  const nuevoTotal = convenio.deuda_total + extra;
  // Se mantiene la cuota firmada y se recalcula cuántas hacen falta. La última absorbe el resto,
  // igual que en el convenio original.
  const { cuotas: nuevasCuotas, ultima } = repartirConvenio(nuevoTotal, "cuota", convenio.cuota_por_periodo);
  const cuotasQueFaltan = Math.max(nuevasCuotas - convenio.cuotas_pagadas, 0);

  // La fecha límite se corre: es el día de pago de la última cuota que queda.
  const nuevaFechaLimite = (() => {
    if (!contrato || cuotasQueFaltan <= 0) return convenio.fecha_limite;
    let d = hoyDate();
    for (let i = 0; i < cuotasQueFaltan; i++) d = proximoDiaPago(contrato, d);
    return fechaISO(d);
  })();

  const pasaTope = nuevasCuotas > 24;

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    if (extra <= 0) { setError("Escribe cuánto vas a agregar al convenio."); return; }
    if (!motivo.trim()) { setError("Escribe de qué es la deuda que estás agregando."); return; }
    if (pasaTope) { setError(`Quedaría en ${nuevasCuotas} cuotas y el máximo son 24. Si no alcanza a pagarlo, esto ya no es un convenio — procede liquidación.`); return; }
    setError(null);
    setGuardando(true);
    try {
      const { error: err } = await ampliarConvenio(convenio, extra, nuevasCuotas, nuevaFechaLimite, motivo.trim(), profile.id);
      if (err) { setError(err); return; }
      onDone?.(`Convenio ampliado a $ ${fmt(nuevoTotal)} — ahora son ${nuevasCuotas} cuotas.`);
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(480px, 96vw)", background: "var(--card)", borderRadius: 20, padding: 24, zIndex: 401,
        boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>➕ Agregar deuda al convenio</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", fontSize: 12.5, color: "var(--ok-ink)", lineHeight: 1.5 }}>
          Lo que el cliente ya pagó <strong>no se toca</strong>, y su cuota de <strong>$ {fmt(convenio.cuota_por_periodo)}</strong> tampoco.
          Solo se extiende cuántas le faltan.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Dato label="Convenio hoy" valor={`$ ${fmt(convenio.deuda_total)}`} />
          <Dato label="Ya abonó" valor={`$ ${fmt(abonado)} (${convenio.cuotas_pagadas}/${convenio.numero_cuotas})`} />
        </div>

        {sueltas.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 10, padding: "9px 11px", lineHeight: 1.5 }}>
            Tiene <strong>$ {fmt(totalSueltas)}</strong> de deuda por fuera del convenio:
            <span style={{ display: "block", marginTop: 2 }}>
              {sueltas.map(d => `${d.descripcion || d.concepto} $${fmt(d.monto_pendiente)}`).join(" · ")}
            </span>
            <button type="button" onClick={() => { setMonto(String(Math.round(totalSueltas))); if (!motivo.trim()) setMotivo(sueltas.map(d => d.descripcion || d.concepto).join(", ")); }}
              style={{ background: "none", border: "none", padding: 0, marginTop: 4, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--accent-ink)", textAlign: "left" }}>
              Usar ese monto
            </button>
          </div>
        )}

        <div>
          <div style={labelStyle}>¿Cuánto le agregas?</div>
          <MoneyInput value={monto} onChange={setMonto} />
        </div>

        <div>
          <div style={labelStyle}>¿De qué es? *</div>
          <input style={inputStyle} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: multa por recolección del 8 de agosto" />
        </div>

        {extra > 0 && (
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-ink)", textTransform: "uppercase" }}>Cómo queda</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-ink)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>$ {fmt(nuevoTotal)}</div>
            <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.5 }}>
              Sigue pagando <strong>$ {fmt(convenio.cuota_por_periodo)}</strong> por período.
              De <strong>{convenio.numero_cuotas}</strong> cuotas pasa a <strong>{nuevasCuotas}</strong> —
              le faltan <strong>{cuotasQueFaltan}</strong>{ultima !== convenio.cuota_por_periodo && nuevasCuotas > 1 ? <>, y la última es de <strong>$ {fmt(ultima)}</strong></> : null}.
              <span style={{ display: "block", marginTop: 2 }}>Nueva fecha límite: <strong>{nuevaFechaLimite}</strong></span>
            </div>
          </div>
        )}

        {pasaTope && (
          <div style={{ fontSize: 12.5, color: "var(--bad-ink)", background: "var(--bad-soft)", border: "1px solid var(--bad-line)", borderRadius: 10, padding: "9px 11px", lineHeight: 1.5 }}>
            ⛔ Quedaría en <strong>{nuevasCuotas} cuotas</strong> y el máximo son 24. Si no alcanza a pagarlo en ese plazo,
            esto ya no es un convenio: procede <strong>liquidación</strong>.
          </div>
        )}

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={guardando || pasaTope} style={{ ...primaryBtn, flex: 2, opacity: guardando || pasaTope ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : "Agregar al convenio"}
          </button>
        </div>
      </div>
    </>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ background: "var(--soft2)", borderRadius: 10, padding: "9px 11px" }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{valor}</div>
    </div>
  );
}
