import { labelStyle } from "../styles/shared";
import { VALOR_LAVADA } from "../utils/inmovilizacion";

const fmt = (n: number) => n.toLocaleString("es-CO");

/**
 * Las DOS preguntas nuevas al recibir una moto (pedido del dueño, 2-sep-2026).
 *
 * Un solo componente para los tres formularios de novedad (recolección por mora, recepción desde
 * Motos, iniciar liquidación): si cada uno dibujara lo suyo, mañana uno cobraría la lavada y otro
 * no, y el resultado dependería de por cuál puerta entró el funcionario.
 *
 *  · Lavada: si se marca, el formulario crea sola la deuda `lavada` por VALOR_LAVADA.
 *  · Llave: NUNCA se pregunta por la tarjeta (esa no se le entrega al cliente). Lo que importa
 *    es el caso raro: no entregó su llave y hubo que ir con la copia de la empresa — entonces el
 *    cliente se quedó con una llave y hay que pedírsela al devolverle la moto.
 */
export type RespuestaLlave = boolean | null;   // true = entregó la suya · false = fuimos con la copia · null = sin responder

interface Props {
  lavado: boolean;
  onLavado: (v: boolean) => void;
  llave: RespuestaLlave;
  onLlave: (v: boolean) => void;
  /** Sin contrato activo la lavada se anota igual (rastro), pero no hay a quién cobrársela. */
  hayAQuienCobrar: boolean;
  /** La pregunta de la llave solo tiene sentido si la moto venía de un cliente. */
  preguntarLlave?: boolean;
}

export default function PreguntasRecepcion({ lavado, onLavado, llave, onLlave, hayAQuienCobrar, preguntarLlave = true }: Props) {
  const opcion = (activa: boolean) => ({
    textAlign: "left" as const, padding: "10px 12px", borderRadius: 10, cursor: "pointer", minWidth: 0,
    border: activa ? "2px solid var(--accent)" : "1px solid var(--line2)",
    background: activa ? "var(--accent-soft)" : "var(--card)",
  });

  return (
    <>
      <div>
        <div style={labelStyle}>🧼 ¿Hay que mandarla a lavar?</div>
        <div style={{ display: "grid", gap: 8 }}>
          <button type="button" onClick={() => onLavado(false)} style={opcion(!lavado)}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>No</div>
          </button>
          <button type="button" onClick={() => onLavado(true)} style={opcion(lavado)}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Sí — se le cobra $ {fmt(VALOR_LAVADA)}</div>
            <div style={{ fontSize: 12, color: lavado ? "var(--accent-ink)" : "var(--muted)" }}>
              {hayAQuienCobrar
                ? "Nace la deuda \"Lavada del vehículo\" y se le cobra con el resto de su cuenta."
                : "Queda anotado, pero esta moto no tiene contrato activo: no hay a quién cobrársela."}
            </div>
          </button>
        </div>
      </div>

      {preguntarLlave && (
        <div>
          <div style={labelStyle}>🔑 ¿Cómo llegó la llave?</div>
          <div style={{ display: "grid", gap: 8 }}>
            <button type="button" onClick={() => onLlave(true)} style={opcion(llave === true)}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>El cliente entregó la suya</div>
            </button>
            <button type="button" onClick={() => onLlave(false)} style={opcion(llave === false)}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Hubo que ir con la copia de la empresa</div>
              <div style={{ fontSize: 12, color: llave === false ? "var(--accent-ink)" : "var(--muted)" }}>
                El cliente se quedó con una llave. Queda marcado: al devolverle la moto hay que pedírsela.
              </div>
            </button>
          </div>
          {llave == null && (
            <div style={{ fontSize: 11.5, color: "var(--warn-ink)", marginTop: 6 }}>Sin responder — hay que elegir una para guardar.</div>
          )}
        </div>
      )}
    </>
  );
}
