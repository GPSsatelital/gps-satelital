import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MoneyInput from "./MoneyInput";
import CanvasFirma from "./CanvasFirma";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useClientes } from "../hooks/useClientes";
import { useContratos } from "../hooks/useContratos";

interface Props {
  contratoId: string;
  clienteNombre: string;
  onClose: () => void;
  // Monto fijo que el convenio debe cubrir (ej. base inicial incompleta al crear el
  // contrato) — si no viene, la meta se precarga con la deuda pendiente del contrato.
  metaFija?: number;
  motivoInicial?: string;
  // Oculta cerrar/cancelar — obliga a guardar el convenio antes de continuar.
  obligatorio?: boolean;
  // Cuota del período actual (para poder ofrecer meterla dentro del convenio como alivio).
  cuotaPeriodo?: number;
  // Fecha hasta la que quedaría cubierto el período si se incluye la cuota de esta semana.
  finPeriodoISO?: string;
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

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

// Tope de cuotas de un convenio. Si no se paga en 12, el cliente necesita otra cosa (liquidación),
// no un plazo más largo. Sirve además de red contra el error de dedo de escribir el VALOR de la
// cuota en la casilla del NÚMERO de cuotas — que ya pasó (ver la validación en handleGuardar).
const MAX_CUOTAS = 12;

export default function ModalConvenio({ contratoId, clienteNombre, onClose, metaFija, motivoInicial, obligatorio, cuotaPeriodo, finPeriodoISO }: Props) {
  useBloquearScrollFondo();
  const [motivo, setMotivo] = useState(motivoInicial ?? "");
  const [incluirSemana, setIncluirSemana] = useState(false);
  const [metaManual, setMetaManual] = useState("");
  const [metaCargada, setMetaCargada] = useState(false);
  const [modoFijar, setModoFijar] = useState<"cuotas" | "cuota">("cuotas");
  const [cuotasInput, setCuotasInput] = useState("");
  const [cuotaInput, setCuotaInput] = useState("");
  const [primerPago, setPrimerPago] = useState("");
  const [firma, setFirma] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [totalConvenios, setTotalConvenios] = useState<number | null>(null);

  // Un convenio es un compromiso de pago: sin firma y sin huella no sirve como respaldo si el
  // cliente después dice que nunca lo aceptó. La huella se captura al registrar el cliente
  // (ClientesView), donde es OPCIONAL — por eso hay clientes sin ella y hay que exigirla acá.
  // Decisión del dueño, 28-jul-2026: las dos, en las cinco puertas que crean convenios.
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const clienteDelContrato = (() => {
    const c = contratos.find(x => x.id === contratoId);
    return c ? clientes.find(cl => cl.id === c.cliente_id) ?? null : null;
  })();
  const tieneHuella = !!clienteDelContrato?.autorizacion_datos_huella_url;
  // Mientras los hooks cargan no se sabe: no se bloquea por un dato que aún no llegó.
  const huellaResuelta = !!clienteDelContrato;
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase
        .from("convenios")
        .select("id")
        .eq("contrato_id", contratoId)
        .neq("estado", "renovado");
      setTotalConvenios((data ?? []).length);
      setVerificando(false);
    }
    verificar();
  }, [contratoId]);

  // Si no hay meta fija (caso general, no el de base inicial), se precarga con la
  // deuda pendiente ya registrada del contrato — el funcionario puede ajustarla.
  useEffect(() => {
    if (metaFija != null) return;
    async function cargarDeuda() {
      // Solo deuda EXIGIBLE. Con `neq('pagada')` entraban también las 'en_convenio': un
      // convenio NUEVO nacía cubriendo plata que un convenio ANTERIOR ya financiaba, y el
      // cliente terminaba pagándola dos veces. Es el mismo error que corrigió la mig 070,
      // por otra puerta.
      const { data } = await supabase
        .from("deudas")
        .select("monto_pendiente")
        .eq("contrato_id", contratoId)
        .eq("estado", "pendiente");
      const total = (data ?? []).reduce((acc, d) => acc + (d.monto_pendiente ?? 0), 0);
      setMetaManual(String(total));
      setMetaCargada(true);
    }
    cargarDeuda();
  }, [contratoId, metaFija]);

  // Opción de meter la cuota del período actual dentro del convenio (alivio único).
  const puedeIncluirSemana = metaFija == null && !!cuotaPeriodo && cuotaPeriodo > 0 && !!finPeriodoISO;
  const cuotaSemana = incluirSemana && puedeIncluirSemana ? (cuotaPeriodo ?? 0) : 0;
  const metaBase = metaFija ?? (Number(metaManual) || 0);
  const meta = metaBase + cuotaSemana;
  const cuotasCalc = modoFijar === "cuotas"
    ? Number(cuotasInput) || 0
    : (meta > 0 && Number(cuotaInput) > 0 ? Math.ceil(meta / Number(cuotaInput)) : 0);
  const cuotaCalc = cuotasCalc > 0 ? Math.ceil(meta / cuotasCalc) : 0;
  const totalCalculado = cuotaCalc * cuotasCalc;

  async function handleGuardar() {
    if (guardando) return;
    if (!motivo.trim()) { setError("Escribe el motivo del convenio."); return; }
    if (meta <= 0) { setError("La meta a pagar debe ser mayor a cero."); return; }
    if (cuotasCalc <= 0) { setError(modoFijar === "cuotas" ? "Ingresa el número de cuotas." : "Ingresa una cuota válida."); return; }
    // Tope de cuotas (decisión del dueño, 28-jul-2026): un convenio que no se paga en 12 cuotas
    // ya no es un convenio, es otra conversación (liquidación).
    // Esto además ataja el error de dedo que sí pasó: en el convenio de XZN20H alguien escribió
    // 60000 en la casilla del NÚMERO DE CUOTAS pensando que era el valor, y el sistema obedeció:
    // $505.000 ÷ 60.000 = cuotas de $9 durante 60.000 semanas, con fecha límite en el año 3176.
    if (cuotasCalc > MAX_CUOTAS) {
      setError(
        modoFijar === "cuotas"
          ? `${cuotasCalc} cuotas es demasiado (el máximo es ${MAX_CUOTAS}). ¿Escribiste ahí el VALOR de la cuota? Para eso usa el botón "Fijar por valor de cuota".`
          : `Con una cuota de $${fmt(Number(cuotaInput))} saldrían ${cuotasCalc} cuotas, y el máximo es ${MAX_CUOTAS}. Sube el valor de la cuota.`,
      );
      return;
    }
    if (!primerPago) { setError("Selecciona la fecha del primer pago."); return; }
    if (huellaResuelta && !tieneHuella) {
      setError(`${clienteNombre.toUpperCase()} no tiene la huella registrada. Regístrasela primero en su ficha (Clientes → el cliente → Editar) y vuelve a intentar.`);
      return;
    }
    if (!firma) { setError("Falta la firma del acuerdo. El cliente debe firmar antes de crear el convenio."); return; }
    if (totalConvenios !== null && totalConvenios >= 3) { setError("Este contrato ya tiene 3 convenios (máximo permitido)."); return; }

    setError(null);
    setGuardando(true);

    // ¿Ya hay un convenio activo? Sin .single() — reventaba con >1 fila (dejaba pasar el 3º).
    const { data: activos } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .eq("estado", "activo")
      .limit(1);

    if (activos && activos.length > 0) {
      setError("Ya existe un convenio activo para este contrato.");
      setGuardando(false);
      return;
    }

    const { data: countData } = await supabase
      .from("convenios")
      .select("id")
      .eq("contrato_id", contratoId)
      .neq("estado", "renovado");

    const count = (countData ?? []).length;

    // La firma va a Storage antes del insert: si falla la subida, el convenio no se crea —
    // preferible a dejar un convenio sin su respaldo. Mismo bucket y ruta que usa Cartera.
    const path = `convenios/${contratoId}/acuerdo_${Date.now()}.png`;
    const blob = await (await fetch(firma)).blob();
    const { error: errSub } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (errSub) { setError("No se pudo subir la firma: " + errSub.message); setGuardando(false); return; }
    const firmaUrl = supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;

    const { error: err } = await supabase.from("convenios").insert({
      contrato_id: contratoId,
      numero_convenio: count + 1,
      deuda_total: meta,
      cuota_por_periodo: cuotaCalc,
      numero_cuotas: cuotasCalc,
      cuotas_pagadas: 0,
      fecha_limite: primerPago,
      estado: "activo",
      concepto: motivo.trim(),
      aprobado_por: null,
      cubre_periodo_hasta: cuotaSemana > 0 ? (finPeriodoISO ?? null) : null,
      firma_url: firmaUrl,
    });

    setGuardando(false);

    if (err) {
      // 23505 = el candado único de la BD rechazó un 2º convenio activo (doble-clic/carrera).
      setError(err.code === "23505" ? "Ya existe un convenio activo para este contrato." : err.message);
      return;
    }

    setExito(true);
    setTimeout(() => onClose(), 1500);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 300 }}
      onClick={obligatorio ? undefined : onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 500, background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16,
          // La ventana debe scrollear POR DENTRO. Sin esto se salía de la pantalla y el gesto se
          // lo llevaba la página de atrás: la ventana quedaba quieta y el fondo corría por debajo.
          maxHeight: "calc(100dvh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>🤝 {obligatorio ? "Convenio obligatorio" : "Nuevo convenio"}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre}</div>
          </div>
          {!obligatorio && (
            <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 13, color: "var(--warn-ink)", fontWeight: 600 }}>
          {obligatorio
            ? "⚠️ Falta base inicial. Debes registrar el convenio para poder continuar."
            : "⚠️ El convenio se paga ENCIMA del pago normal. No reemplaza la cuota."}
        </div>

        {verificando || (metaFija == null && !metaCargada) ? (
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Cargando datos del contrato...</div>
        ) : totalConvenios !== null && totalConvenios >= 3 ? (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 14, color: "var(--bad-ink)", fontWeight: 700 }}>
            Este contrato ya tiene 3 convenios (máximo permitido). No se pueden crear más.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Convenios usados: <strong>{totalConvenios} / 3</strong>
            </div>

            <div>
              <div style={labelStyle}>Motivo del convenio</div>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                placeholder="Describe el motivo del convenio..."
              />
            </div>

            <div>
              <div style={labelStyle}>Meta a pagar (total del convenio)</div>
              {metaFija != null ? (
                <div style={{ ...inputStyle, background: "var(--soft)", fontWeight: 700, color: "var(--text)" }}>
                  $ {fmt(metaFija)}
                </div>
              ) : (
                <MoneyInput label="" value={metaManual} onChange={setMetaManual} placeholder="$ 0" />
              )}
            </div>

            {puedeIncluirSemana && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 12, background: incluirSemana ? "var(--accent-soft2)" : "var(--soft2)", border: `1px solid ${incluirSemana ? "var(--accent-line)" : "var(--line)"}`, cursor: "pointer" }}>
                <input type="checkbox" checked={incluirSemana} onChange={e => setIncluirSemana(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--accent)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--muted2)", fontWeight: 600 }}>
                  Incluir la cuota de esta semana (<strong>$ {fmt(cuotaPeriodo ?? 0)}</strong>) dentro del convenio.
                  <span style={{ display: "block", fontWeight: 400, color: "var(--muted)", marginTop: 2 }}>
                    Esta semana no la paga aparte ni cuenta mora; queda financiada en el convenio y arranca normal la próxima.
                  </span>
                </span>
              </label>
            )}

            <div>
              <div style={labelStyle}>Fijar por</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setModoFijar("cuotas")} style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10, border: `2px solid ${modoFijar === "cuotas" ? "var(--accent)" : "var(--line)"}`,
                  background: modoFijar === "cuotas" ? "var(--accent-soft2)" : "var(--card)", color: modoFijar === "cuotas" ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  Número de cuotas
                </button>
                <button onClick={() => setModoFijar("cuota")} style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10, border: `2px solid ${modoFijar === "cuota" ? "var(--accent)" : "var(--line)"}`,
                  background: modoFijar === "cuota" ? "var(--accent-soft2)" : "var(--card)", color: modoFijar === "cuota" ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  Valor de la cuota
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {modoFijar === "cuotas" ? (
                <div>
                  <div style={labelStyle}>Número de cuotas</div>
                  <input type="number" min="1" style={inputStyle} value={cuotasInput} onChange={e => setCuotasInput(e.target.value)} placeholder="Ej. 4" />
                </div>
              ) : (
                <MoneyInput label="Valor de la cuota" value={cuotaInput} onChange={setCuotaInput} placeholder="$ 100.000" />
              )}
              <div>
                <div style={labelStyle}>{modoFijar === "cuotas" ? "Cuota (calculada)" : "N° de cuotas (calculado)"}</div>
                <div style={{ ...inputStyle, background: "var(--soft)", color: "var(--muted)", fontWeight: 700 }}>
                  {modoFijar === "cuotas" ? (cuotaCalc > 0 ? `$ ${fmt(cuotaCalc)}` : "—") : (cuotasCalc > 0 ? cuotasCalc : "—")}
                </div>
              </div>
            </div>

            {totalCalculado > 0 && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft3)", border: "1px solid var(--accent-line)", fontSize: 14, fontWeight: 700, color: "var(--accent-ink)" }}>
                Total del convenio: $ {fmt(totalCalculado)}
                {meta > 0 && totalCalculado > meta && (
                  <span style={{ fontWeight: 400, fontSize: 12 }}> (redondeado, meta $ {fmt(meta)})</span>
                )}
                {/* La frase en cristiano es la que de verdad ataja el error: leer "$9 cada semana
                    durante 60.000 semanas" salta a la vista mucho antes que ver un 60000 en una
                    casilla. Va debajo del total, que es donde el ojo ya está mirando. */}
                <div style={{ fontWeight: 400, fontSize: 13, marginTop: 4, color: "var(--accent-ink)" }}>
                  El cliente paga <strong>$ {fmt(cuotaCalc)}</strong> cada período, <strong>{cuotasCalc}</strong> {cuotasCalc === 1 ? "vez" : "veces"}.
                </div>
              </div>
            )}

            {/* Aviso ANTES de intentar guardar: el error de handleGuardar solo aparece al tocar el
                botón, y para entonces ya se escribió todo. */}
            {cuotasCalc > MAX_CUOTAS && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 13, fontWeight: 600, color: "var(--bad-ink)" }}>
                ⛔ Son <strong>{fmt(cuotasCalc)} cuotas</strong> y el máximo es {MAX_CUOTAS}.
                {modoFijar === "cuotas"
                  ? <> ¿Querías escribir el <strong>valor</strong> de la cuota? Usa el botón “Fijar por valor de cuota”.</>
                  : <> Sube el valor de la cuota para que quepan en {MAX_CUOTAS} o menos.</>}
              </div>
            )}

            <div>
              <div style={labelStyle}>Fecha del primer pago</div>
              <input
                type="date"
                style={inputStyle}
                value={primerPago}
                onChange={e => setPrimerPago(e.target.value)}
              />
            </div>

            {/* La huella no se puede capturar desde acá (necesita el lector conectado y el
                formulario del cliente): se avisa temprano y se dice a dónde ir, en vez de dejar
                que llene todo el formulario y descubra el bloqueo al final. */}
            {huellaResuelta && !tieneHuella && (
              <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 13, fontWeight: 600, color: "var(--bad-ink)" }}>
                ⛔ <strong>{clienteNombre.toUpperCase()} no tiene la huella registrada.</strong> Sin huella no se puede
                crear el convenio. Regístrasela en Clientes → el cliente → Editar, y vuelve acá.
              </div>
            )}

            <div>
              <div style={labelStyle}>Firma del cliente</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                El cliente firma aceptando el acuerdo de pago. Sin firma no se crea el convenio.
              </div>
              <CanvasFirma key="firma-convenio" label="Firma del cliente" modal opcional={false} onChange={setFirma} />
            </div>

            {error && (
              <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>
            )}

            {exito && (
              <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                Convenio creado correctamente.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {!obligatorio && (
                <button onClick={onClose} style={{ background: "var(--soft)", color: "var(--muted2)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                  Cancelar
                </button>
              )}
              <button
                onClick={handleGuardar}
                disabled={guardando || exito || !firma || (huellaResuelta && !tieneHuella)}
                style={{ background: "var(--accent-soft3)", color: "var(--accent-ink)", border: "none", borderRadius: 14, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: (guardando || !firma || (huellaResuelta && !tieneHuella)) ? 0.6 : 1 }}
              >
                {guardando ? "Guardando..." : "Crear convenio"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
