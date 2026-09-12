// LA VENTANA PARA MOVER LA PLATA DEL CLIENTE ENTRE SUS DOS BOLSAS (12-sep-2026).
//
// El dueño pidió "un punto más neutro donde todos los casos puedan ser posibles" en vez de decidir
// de una vez qué pasa con lo que el cliente entrega de más en la base. Así que no se pregunta al
// crear el contrato: se puede mover cuando haga falta, en las dos direcciones, con motivo escrito
// y rastro de quién lo hizo.
//
// El piso del ahorro ($308.000, o $305.000 en los viejos) lo cuida `utils/moverPlata.ts`.

import { useState } from "react";
import { card, inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import MoneyInput from "./MoneyInput";
import {
  calcularMovimiento, movibleDelAhorro, movibleDeLaBase, movibleGanadoPagando,
  pisoAhorro,
  type ContratoPlata, type Direccion,
} from "../utils/moverPlata";

const fmt = (n: number) => Math.round(n).toLocaleString("es-CO");

export default function ModalMoverPlata({
  contrato,
  clienteNombre,
  saldoDisponible,
  onClose,
  onMover,
}: {
  contrato: ContratoPlata;
  clienteNombre: string;
  /** La bolsa REAL de saldo a favor: la de apertura más lo que dejaron los pagos. */
  saldoDisponible: number;
  onClose: () => void;
  onMover: (
    campos: { ahorro_apertura: number; ahorro_acumulado: number; saldo_favor_apertura: number },
    motivo: string,
    resumen: string,
  ) => Promise<{ error: string | null }>;
}) {
  const [direccion, setDireccion] = useState<Direccion>("ahorro_a_saldo");
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const piso = pisoAhorro(contrato);
  const deLaBase = movibleDeLaBase(contrato);
  const ganado = movibleGanadoPagando(contrato);
  const movible = movibleDelAhorro(contrato);
  const tope = direccion === "ahorro_a_saldo" ? movible : saldoDisponible;
  const valor = Number(monto) || 0;

  async function guardar() {
    if (guardando) return;
    if (!motivo.trim()) { setError("Escribe por qué se mueve. Queda en el historial del contrato."); return; }
    const r = calcularMovimiento(contrato, valor, direccion, saldoDisponible);
    if (!r.ok) { setError(r.error); return; }
    setError(null);
    setGuardando(true);
    try {
      const { error: err } = await onMover(
        { ahorro_apertura: r.ahorro_apertura, ahorro_acumulado: r.ahorro_acumulado, saldo_favor_apertura: r.saldo_favor_apertura },
        motivo.trim(),
        r.resumen,
      );
      if (err) { setError(err); return; }
      onClose();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1100 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ ...card, width: "min(460px, 96vw)", maxHeight: "calc(100dvh - 80px)", overflowY: "auto", display: "grid", gap: 14, textAlign: "left" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>⇄ Mover plata</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
        </div>

        {/* Las dos clases de ahorro, SEPARADAS: la base tiene piso, lo ganado pagando no. */}
        <div style={{ display: "grid", gap: 8 }}>
          <Bolsa titulo="Base inicial" valor={contrato.ahorro_apertura ?? 0} nota={piso !== null ? `No puede bajar de $ ${fmt(piso)}` : "La base que está juntando"} />
          <Bolsa titulo="Ahorro ganado pagando" valor={contrato.ahorro_acumulado ?? 0} nota="Es suyo entero, sin piso" />
          <Bolsa titulo="Saldo a favor" valor={saldoDisponible} nota="Lo puede usar ya para pagar" />
        </div>

        {piso !== null && (
          <div style={{ fontSize: 12, color: "var(--muted2)", background: "var(--soft2)", borderRadius: 10, padding: "8px 12px", lineHeight: 1.5 }}>
            Se pueden mover <strong style={{ color: movible > 0 ? "var(--ok-ink)" : "var(--muted)" }}>$ {fmt(movible)}</strong>
            {movible > 0 && (
              <>: <strong>$ {fmt(ganado)}</strong> que ganó pagando{deLaBase > 0 ? <> y <strong>$ {fmt(deLaBase)}</strong> que le sobran de la base</> : null}</>
            )}
            {movible === 0 && <> — no ha ganado ahorro pagando y su base ya está en el mínimo.</>}
            {movible > 0 && <>. Su base tiene que conservar <strong>$ {fmt(piso)}</strong>.</>}
          </div>
        )}

        <div>
          <div style={{ ...labelStyle, display: "block" }}>¿Para dónde?</div>
          <div style={{ display: "grid", gap: 8 }}>
            {([
              ["ahorro_a_saldo", "Del ahorro → al saldo a favor", "Para que pueda usarlo en una semana, una deuda o el acuerdo"],
              ["saldo_a_ahorro", "Del saldo a favor → al ahorro", "Para que se le guarde y se lo lleve al final"],
            ] as [Direccion, string, string][]).map(([val, titulo, nota]) => (
              <button
                key={val}
                type="button"
                onClick={() => { setDireccion(val); setError(null); }}
                style={{
                  textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: direccion === val ? "2px solid var(--accent)" : "1px solid var(--line2)",
                  background: direccion === val ? "var(--accent-soft)" : "var(--card)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{titulo}</div>
                <div style={{ fontSize: 12, color: direccion === val ? "var(--accent-ink)" : "var(--muted)" }}>{nota}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...labelStyle, display: "block" }}>¿Cuánto?</div>
          <MoneyInput value={monto} onChange={setMonto} placeholder="$ 0" />
          {tope > 0 && (
            <button
              type="button"
              onClick={() => setMonto(String(tope))}
              style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "none", border: "1px dashed var(--accent-line)", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}
            >
              Mover todo lo que se puede: $ {fmt(tope)}
            </button>
          )}
        </div>

        <div>
          <div style={{ ...labelStyle, display: "block" }}>¿Por qué? *</div>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: entregó $90.000 de más en la base y pidió usarlos para completar la semana."
            style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "inherit" }}
          />
          <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>
            Queda en el historial del contrato, con tu nombre y la fecha.
          </div>
        </div>

        {error && (
          <div style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={onClose} disabled={guardando} style={{ ...secondaryBtn, opacity: guardando ? 0.6 : 1 }}>Cancelar</button>
          <button
            onClick={guardar}
            disabled={guardando || valor <= 0 || !motivo.trim()}
            style={{ ...primaryBtn, opacity: (guardando || valor <= 0 || !motivo.trim()) ? 0.6 : 1 }}
          >
            {guardando ? "Moviendo..." : "Mover"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Bolsa({ titulo, valor, nota }: { titulo: string; valor: number; nota: string }) {
  return (
    <div style={{ background: "var(--soft2)", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{titulo}</div>
        <div style={{ fontSize: 11, color: "var(--muted)" }}>{nota}</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>$ {fmt(valor)}</div>
    </div>
  );
}
