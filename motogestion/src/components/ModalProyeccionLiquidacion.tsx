import { useEffect, useMemo, useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { usePagos, saldoAFavorDe } from "../hooks/usePagos";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { useContratos, type Contrato } from "../hooks/useContratos";
import { cuentaLiquidacion } from "../utils/cuentaLiquidacion";
import { recepcionDelContrato } from "../utils/recepcionDelContrato";
import { hoyISO } from "../utils/fecha";
import { inputStyle, labelStyle, secondaryBtn } from "../styles/shared";

// "¿CUÁNTO SALE SI LO LIQUIDO?" — la cuenta SIN liquidar nada.
//
// Sirve para decidir antes de tocar el contrato: ver si al cliente se le devuelve plata o si queda
// debiendo, y cuánto cambia según el día en que se guardó la moto. No escribe absolutamente nada.
//
// Usa la MISMA función que la liquidación de verdad (`cuentaLiquidacion`), así que lo que se ve
// acá es lo que va a salir. Si fueran dos cuentas distintas, esto no serviría para decidir.

const fmt = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

interface Props {
  contrato: Contrato;
  clienteNombre: string;
  placa: string;
  onClose: () => void;
}

export default function ModalProyeccionLiquidacion({ contrato, clienteNombre, placa, onClose }: Props) {
  useBloquearScrollFondo();
  const { deudas } = useDeudas();
  const { convenios } = useConvenios();
  const { pagos } = usePagos();
  const { recepciones } = useUbicaciones();
  const { contratos } = useContratos();

  // Arranca en el día que se guardó la moto si está registrado; si no, en hoy. Editable: el punto
  // de esta pantalla es poder mover esa fecha y ver cómo cambia la cuenta.
  const fechaSugerida = useMemo(() => {
    const rec = recepcionDelContrato(recepciones, contrato, contratos.filter(x => x.moto_id === contrato.moto_id));
    return rec ? rec.created_at.slice(0, 10) : null;
  }, [recepciones, contrato, contratos]);
  const [fecha, setFecha] = useState(hoyISO());
  const [fechaTocada, setFechaTocada] = useState(false);

  // La ventana se abre ANTES de que terminen de cargar las recepciones, así que la fecha sugerida
  // llega tarde. `useState(valor)` solo usa el valor de la PRIMERA vez, así que la fecha se
  // quedaba en "hoy" para siempre — y eso le cobraba al cliente todos los días que la moto lleva
  // en la bodega. Caso real: ANTONIO MONTERROZA (IEW65I) entregó el 30-jul y la pantalla contaba
  // hasta el 21-ago: 22 días de más, y le decía que debía $613.000.
  // Se sincroniza cuando llega, pero NO si el funcionario ya la movió a mano.
  useEffect(() => {
    if (fechaSugerida && !fechaTocada) setFecha(fechaSugerida);
  }, [fechaSugerida, fechaTocada]);

  const cuenta = useMemo(() => cuentaLiquidacion({
    contrato,
    fechaCorte: fecha || hoyISO(),
    saldoFavor: saldoAFavorDe(contrato, pagos.filter(p => p.contrato_id === contrato.id && p.estado === "Confirmado")),
    deudas: deudas.filter(d => d.contrato_id === contrato.id),
    convenios: convenios.filter(cv => cv.contrato_id === contrato.id),
  }), [contrato, fecha, pagos, deudas, convenios]);

  const leDevuelven = cuenta.saldoFinal >= 0;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(520px, 96vw)", background: "var(--card)", borderRadius: 20, padding: 24,
        zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14,
        boxSizing: "border-box", maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Si lo liquido hoy, ¿cuánto sale?</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{placa} · {clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)", fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}>
          Esto es un <strong>cálculo, no una liquidación</strong>. No cambia nada del contrato ni de la moto.
          Los daños no están incluidos: esos salen de la revisión de taller.
        </div>

        <div>
          <div style={labelStyle}>Contando hasta el día en que se guardó la moto</div>
          <input type="date" value={fecha} max={hoyISO()} onChange={e => { setFecha(e.target.value); setFechaTocada(true); }} style={inputStyle} />
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 5, lineHeight: 1.45 }}>
            Muévela y mira cómo cambia la cuenta. Entre más tarde, más días se le cobran.
          </div>
        </div>

        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", background: "var(--ok-soft)", fontSize: 11, fontWeight: 700, color: "var(--ok-ink)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Plata del cliente
          </div>
          <div style={{ padding: "10px 14px", display: "grid", gap: 6 }}>
            {cuenta.aFavor.renglones.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No tiene ahorro ni saldo a favor.</div>
              : cuenta.aFavor.renglones.map(r => (
                  <div key={r.concepto} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                    <span style={{ color: "var(--muted2)", minWidth: 0 }}>{r.concepto}</span>
                    <strong style={{ whiteSpace: "nowrap", color: "var(--ok-ink)" }}>{fmt(r.monto)}</strong>
                  </div>
                ))}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <strong>Total a favor</strong><strong style={{ color: "var(--ok-ink)" }}>{fmt(cuenta.aFavor.total)}</strong>
            </div>
          </div>
        </div>

        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", background: "var(--bad-soft)", fontSize: 11, fontWeight: 700, color: "var(--bad-ink)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            Lo que se le descuenta
          </div>
          <div style={{ padding: "10px 14px", display: "grid", gap: 6 }}>
            {cuenta.enContra.renglones.length === 0
              ? <div style={{ fontSize: 12.5, color: "var(--muted)" }}>No debe nada.</div>
              : cuenta.enContra.renglones.map((r, i) => (
                  <div key={`${r.concepto}-${i}`} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                    <span style={{ color: "var(--muted2)", minWidth: 0 }}>{r.concepto}</span>
                    <strong style={{ whiteSpace: "nowrap", color: "var(--bad-ink)" }}>− {fmt(r.monto)}</strong>
                  </div>
                ))}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <strong>Total a descontar</strong><strong style={{ color: "var(--bad-ink)" }}>− {fmt(cuenta.enContra.total)}</strong>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px", borderRadius: 14, textAlign: "center", background: leDevuelven ? "var(--ok-soft)" : "var(--bad-soft)", border: `1px solid ${leDevuelven ? "var(--ok-line)" : "var(--bad-line)"}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: leDevuelven ? "var(--ok-ink)" : "var(--bad-ink)" }}>
            {leDevuelven ? "Se le devuelve" : "Queda debiendo"}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 4, color: leDevuelven ? "var(--ok-ink)" : "var(--bad-ink)" }}>
            {fmt(Math.abs(cuenta.saldoFinal))}
          </div>
          {!leDevuelven && (
            <div style={{ fontSize: 12, color: "var(--bad-ink)", marginTop: 6, lineHeight: 1.45 }}>
              Al cerrar la liquidación entraría a lista negra, y esa deuda queda viva para cobrársela si vuelve.
            </div>
          )}
        </div>

        <button onClick={onClose} style={{ ...secondaryBtn }}>Cerrar</button>
      </div>
    </>
  );
}
