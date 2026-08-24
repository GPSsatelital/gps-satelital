import { useState } from "react";
import type { Convenio } from "../hooks/useConvenios";
import type { RenglonPartitura } from "../utils/partituraConvenio";
import { descuadrePartitura } from "../utils/partituraConvenio";
import MoneyInput from "./MoneyInput";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";

// EL EDITOR DE LA PARTITURA — para los ~50 convenios viejos que nacieron como bolsa (sin lista
// de qué financian) y para corregir una lista torcida. Regla del dueño: se escribe CONTRA EL
// ACUERDO FIRMADO, uno por uno, nunca de memoria. La suma DEBE cuadrar con el total pactado
// del convenio — si no cuadra, no se guarda: un desglose inventado es peor que ninguno.

type DeudaOpcion = { id: string; concepto: string; monto_pendiente: number; estado: string };

// El monto vive como string de dígitos (formato de MoneyInput); se convierte al guardar.
type RenglonForm = { tipo: RenglonPartitura["tipo"]; ref?: string | number; etiqueta: string; monto: string };

const fmt = (n: number) => n.toLocaleString("es-CO");

export default function ModalPartituraConvenio({ convenio, deudas, valorCaja, guardando, onGuardar, onClose }: {
  convenio: Convenio;
  /** Las deudas del contrato (en_convenio primero): para enganchar renglones a su deuda real. */
  deudas: DeudaOpcion[];
  /** El valor del período del contrato — para que la propuesta automática derive las semanas. */
  valorCaja: number;
  guardando: boolean;
  onGuardar: (partitura: RenglonPartitura[]) => void;
  onClose: () => void;
}) {
  const esPropuesta = !convenio.partitura?.length;
  const [renglones, setRenglones] = useState<RenglonForm[]>(() => {
    if (convenio.partitura?.length) {
      return convenio.partitura.map(r => ({ tipo: r.tipo, ref: r.ref, etiqueta: r.etiqueta, monto: String(r.monto) }));
    }
    // LA PROPUESTA AUTOMÁTICA (pedida por el dueño, 23-ago): el sistema saca la cuenta completa
    // — lo que el total del convenio no explica con deudas fueron semanas atrasadas al firmar —
    // y al humano solo le queda CONFIRMARLA contra el acuerdo firmado. Nunca se guarda sola.
    const deudasProp = deudas.filter(d => d.estado === "en_convenio" && d.monto_pendiente > 0);
    const sumaDeudas = deudasProp.reduce((s, d) => s + d.monto_pendiente, 0);
    const resto = convenio.deuda_total - sumaDeudas;
    const semanas: RenglonForm[] = [];
    let sobrante = resto;
    if (resto > 0 && valorCaja > 0) {
      const n = Math.floor(resto / valorCaja);
      for (let k = 1; k <= n; k++) {
        semanas.push({ tipo: "semana", etiqueta: `Semana atrasada al firmar (${k} de ${n})`, monto: String(valorCaja) });
      }
      sobrante = resto - n * valorCaja;
    }
    return [
      ...semanas,
      ...deudasProp.map(d => ({ tipo: "deuda" as const, ref: d.id, etiqueta: `Deuda: ${d.concepto}`, monto: String(d.monto_pendiente) })),
      ...(sobrante > 0
        ? [{ tipo: "ajuste" as const, etiqueta: "Por confirmar contra el acuerdo (sobrante)", monto: String(sobrante) }]
        : []),
    ];
  });

  const parseados: RenglonPartitura[] = renglones.map(r => ({
    tipo: r.tipo, ref: r.ref, etiqueta: r.etiqueta.trim(), monto: Number(r.monto) || 0,
  }));
  const descuadre = descuadrePartitura(parseados, convenio.deuda_total);
  const incompleto = parseados.some(r => !r.etiqueta || r.monto <= 0) || parseados.length === 0;

  const set = (i: number, cambio: Partial<RenglonForm>) =>
    setRenglones(rs => rs.map((r, k) => (k === i ? { ...r, ...cambio } : r)));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>La lista del convenio #{convenio.numero_convenio}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 }}>
          Qué financia este convenio, en pesos y en orden (semanas viejas primero, deudas después,
          ajuste al final). La suma debe cuadrar con el total pactado:{" "}
          <strong>$ {fmt(convenio.deuda_total)}</strong>.
        </div>
        {esPropuesta && (
          <div style={{ fontSize: 13, background: "var(--warn-soft2)", border: "1px solid var(--warn-line)", color: "var(--warn-ink)", borderRadius: 10, padding: "8px 12px", marginTop: 8, lineHeight: 1.5 }}>
            Esta es <strong>la cuenta que sacó el sistema</strong> con los datos del convenio.
            Compárala contra el <strong>acuerdo firmado</strong> antes de guardar — ajusta lo que
            el papel diga distinto.
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {renglones.map((r, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 10, display: "grid", gap: 8, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={r.tipo}
                  onChange={e => set(i, { tipo: e.target.value as RenglonPartitura["tipo"], ref: undefined })}
                  style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                >
                  <option value="semana">Semana atrasada</option>
                  <option value="deuda">Deuda registrada</option>
                  <option value="ajuste">Ajuste / redondeo</option>
                </select>
                <button onClick={() => setRenglones(rs => rs.filter((_, k) => k !== i))}
                  style={{ ...secondaryBtn, padding: "8px 12px", color: "var(--bad-ink)" }}>✕</button>
              </div>
              {r.tipo === "deuda" && (
                <select
                  value={typeof r.ref === "string" ? r.ref : ""}
                  onChange={e => {
                    const d = deudas.find(x => x.id === e.target.value);
                    if (d) set(i, { ref: d.id, etiqueta: `Deuda: ${d.concepto}`, monto: r.monto || String(d.monto_pendiente) });
                    else set(i, { ref: undefined });
                  }}
                  style={{ ...inputStyle, minWidth: 0 }}
                >
                  <option value="">¿Cuál deuda del sistema es? (para que se cierre sola al pagarse)</option>
                  {deudas.map(d => (
                    <option key={d.id} value={d.id}>{d.concepto} — $ {fmt(d.monto_pendiente)} ({d.estado})</option>
                  ))}
                </select>
              )}
              <div>
                <div style={labelStyle}>Descripción (como en el acuerdo)</div>
                <input value={r.etiqueta} onChange={e => set(i, { etiqueta: e.target.value })}
                  placeholder={r.tipo === "semana" ? "Ej: Semana del lun 3 de agosto" : r.tipo === "deuda" ? "Ej: Deuda de migración" : "Ej: Redondeo de cuotas"}
                  style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
              </div>
              <MoneyInput label="Monto" value={r.monto} onChange={v => set(i, { monto: v })} />
            </div>
          ))}
        </div>

        <button onClick={() => setRenglones(rs => [...rs, { tipo: "semana", etiqueta: "", monto: "" }])}
          style={{ ...secondaryBtn, width: "100%", marginTop: 10 }}>
          + Agregar renglón
        </button>

        <div style={{
          marginTop: 12, padding: "10px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
          background: descuadre === 0 && !incompleto ? "var(--ok-soft)" : "var(--warn-soft2)",
          color: descuadre === 0 && !incompleto ? "var(--ok-ink)" : "var(--warn-ink)",
        }}>
          {incompleto
            ? "Falta completar renglones (descripción y monto en todos)."
            : descuadre === 0
              ? `✓ Cuadra: $ ${fmt(convenio.deuda_total)} en ${parseados.length} renglones.`
              : descuadre > 0
                ? `Faltan $ ${fmt(descuadre)} por explicar para llegar al total del convenio.`
                : `Sobran $ ${fmt(-descuadre)} — la lista suma más que el total del convenio.`}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button
            onClick={() => { if (!guardando && descuadre === 0 && !incompleto) onGuardar(parseados); }}
            disabled={guardando || descuadre !== 0 || incompleto}
            style={{ ...primaryBtn, flex: 1, opacity: guardando || descuadre !== 0 || incompleto ? 0.5 : 1 }}
          >
            {guardando ? "Guardando..." : "Guardar la lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
