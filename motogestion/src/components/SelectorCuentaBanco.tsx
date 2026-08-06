import { useEffect, useRef, useState } from "react";
import { useCuentasBancarias, cuentasDelGrupo, type CuentaBancaria } from "../hooks/useCuentasBancarias";
import { labelStyle } from "../styles/shared";

// ¿A cuál cuenta de la empresa entró esta transferencia? (mig 087)
//
// POR QUÉ EXISTE: COSTA recibe en dos cuentas. Sin este dato la caja da un solo total y la
// secretaria, que tiene dos extractos, cuadra a mano y a ciegas. Con el dato, el arqueo pasa
// a ser por cuenta.
//
// FRICCIÓN SOLO DONDE HACE FALTA — la regla se calcula sola, no está escrita a mano, así que
// el día que el dueño agregue o quite cuentas desde Configuración esto se acomoda sin tocar código:
//   · el grupo tiene UNA cuenta  → se elige sola y no se pregunta nada (PRADERA, RASTREADOR hoy)
//   · el grupo tiene VARIAS      → hay que escoger (COSTA hoy)
//   · el grupo no tiene ninguna  → se ofrecen todas, avisando que ese grupo no tiene cuenta
//
// LA CUENTA EQUIVOCADA SE PUEDE REGISTRAR (decisión del dueño, 6-ago-2026): un cliente de COSTA
// puede transferirle por error al Nequi de PRADERA. Si solo se ofrecieran las cuentas del grupo,
// el funcionario tendría que marcar una cuenta falsa o dejarlo vacío, y el arqueo de la cuenta
// que sí recibió la plata quedaría descuadrado para siempre. Mismo principio que la partida sin
// grupo: preferimos registrar la verdad incómoda antes que una mentira cómoda.

function etiqueta(c: CuentaBancaria): string {
  return `${c.banco}${c.tipo ? ` ${c.tipo}` : ""} · ${c.numero}${c.titular ? ` — ${c.titular}` : ""}`;
}

export default function SelectorCuentaBanco({
  grupo,
  value,
  onChange,
}: {
  /** Grupo de la moto del cliente — define cuáles cuentas son "las suyas". */
  grupo: string | null | undefined;
  value: string | null;
  onChange: (cuentaId: string | null) => void;
}) {
  const { activas } = useCuentasBancarias();
  const delGrupo = cuentasDelGrupo(activas, grupo);
  const otras = activas.filter(c => !delGrupo.some(d => d.id === c.id));
  const [verOtras, setVerOtras] = useState(false);

  // `onChange` se recrea en cada render del padre; si fuera dependencia del efecto, este se
  // volvería a disparar sin parar. Se lee desde un ref — misma lección de CanvasFirma.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Una sola cuenta posible = no hay nada que preguntar, se elige sola.
  const unica = delGrupo.length === 1 ? delGrupo[0].id : null;
  useEffect(() => {
    if (unica && !value) onChangeRef.current(unica);
  }, [unica, value]);

  if (activas.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", borderRadius: 10, padding: "8px 11px", lineHeight: 1.5 }}>
        No hay cuentas bancarias registradas. El pago se guarda igual, pero no se va a poder cuadrar
        contra el extracto. Regístralas en <strong>Configuración → 🏦 Cuentas bancarias</strong>.
      </div>
    );
  }

  const seleccionada = activas.find(c => c.id === value) ?? null;
  const esDeOtroGrupo = !!seleccionada && !delGrupo.some(d => d.id === seleccionada.id);
  // Con una sola cuenta del grupo y sin haber pedido ver las demás, basta con mostrarla.
  const modoCompacto = delGrupo.length === 1 && !verOtras && !esDeOtroGrupo;

  function Opcion({ c, deOtroGrupo }: { c: CuentaBancaria; deOtroGrupo?: boolean }) {
    const sel = value === c.id;
    return (
      <button
        type="button"
        onClick={() => onChange(c.id)}
        style={{
          textAlign: "left", padding: "9px 11px", borderRadius: 10, cursor: "pointer", width: "100%",
          boxSizing: "border-box", minWidth: 0,
          border: sel ? "2px solid var(--accent)" : "1px solid var(--line2)",
          background: sel ? "var(--accent-soft)" : "var(--card)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          {c.banco}{c.tipo ? ` ${c.tipo}` : ""} · {c.numero}
        </div>
        <div style={{ fontSize: 11.5, color: sel ? "var(--accent-ink)" : "var(--muted)" }}>
          {c.titular ?? "—"}{deOtroGrupo ? ` · recibe de ${c.grupos.join(", ") || "ningún grupo"}` : ""}
        </div>
      </button>
    );
  }

  return (
    <div>
      <div style={labelStyle}>¿A cuál cuenta entró?</div>

      {modoCompacto ? (
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ padding: "9px 11px", borderRadius: 10, border: "1px solid var(--ok-line)", background: "var(--ok-soft)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{etiqueta(delGrupo[0])}</div>
            <div style={{ fontSize: 11.5, color: "var(--ok-ink)" }}>Es la única cuenta de {grupo}.</div>
          </div>
          {otras.length > 0 && (
            <button type="button" onClick={() => setVerOtras(true)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--accent-ink)", textAlign: "left" }}>
              ¿Entró a otra cuenta?
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {delGrupo.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase" }}>
                Cuentas de {grupo}
              </div>
              {delGrupo.map(c => <Opcion key={c.id} c={c} />)}
            </>
          )}
          {otras.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", marginTop: 2 }}>
                {delGrupo.length > 0 ? "Otras cuentas" : `${grupo ?? "Este grupo"} no tiene cuenta propia — otras cuentas`}
              </div>
              {otras.map(c => <Opcion key={c.id} c={c} deOtroGrupo />)}
            </>
          )}
        </div>
      )}

      {esDeOtroGrupo && (
        <div style={{ marginTop: 7, fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 11px", lineHeight: 1.5 }}>
          ⚠️ Esa cuenta no es de <strong>{grupo}</strong>. El pago igual es de este cliente, pero la
          plata quedó en la cuenta de <strong>{seleccionada!.grupos.join(", ") || "otro portafolio"}</strong> —
          queda registrado así para que el arqueo de esa cuenta cuadre y se sepa qué hay que trasladar.
        </div>
      )}
    </div>
  );
}
