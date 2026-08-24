import { useState } from "react";
import type { Contrato } from "../hooks/useContratos";
import { useContratos, calcularFechaFinContrato } from "../hooks/useContratos";
import { useDeudas } from "../hooks/useDeudas";
import { useUbicaciones, type DecisionTiempo } from "../hooks/useUbicaciones";
import { useAuth } from "../contexts/AuthContext";
import { useClientes } from "../hooks/useClientes";
import { useConvenios } from "../hooks/useConvenios";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import ModalFirmaAcuerdoTiempo from "./ModalFirmaAcuerdoTiempo";
import { imprimirAcuerdoTiempo, type DatosAcuerdoTiempo } from "../utils/generarDocumentoAcuerdoTiempo";

interface Props {
  contrato: Contrato;
  clienteNombre: string;
  motoPlaca: string;
  motivo: string; // "Taller" | "Fiscalía" | "Tránsito" | "Garantía"
  fechaEntrada: string;
  fechaSalida: string;
  onClose: () => void;
}

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

export default function ModalResolverTiempoFueraServicio({ contrato, clienteNombre, motoPlaca, motivo, fechaEntrada, fechaSalida, onClose }: Props) {
  const { profile } = useAuth();
  const { editarContrato } = useContratos();
  const { registrarDeuda } = useDeudas();
  const { crearAcuerdoTiempo, subirDocumentoAcuerdo } = useUbicaciones();
  // RODAR EL PAQUETE (regla del dueño, 24-ago): si el cliente tiene convenio, las semanas
  // guardadas se corren COMPLETAS — su semana normal Y su cuota del convenio. Ninguna se
  // perdona: ambas se pagan al final. "Se le rueda al final también."
  const { convenioActivoDelContrato, rodarPeriodosConvenio } = useConvenios();
  const convenioActivo = convenioActivoDelContrato(contrato.id);

  const dias = Math.max(1, Math.round((new Date(fechaSalida + "T00:00:00").getTime() - new Date(fechaEntrada + "T00:00:00").getTime()) / 86400000));
  const tarifa = contrato.tarifa_diaria ?? 27000;
  const valorTotal = dias * tarifa;

  // RODAR SOLO POR PERÍODOS COMPLETOS (regla del dueño, 30-jul-2026): "rodar 3 días de una semana
  // descuadra muchas lógicas y cuentas". Antes se rodaban los días crudos.
  const DIAS_PERIODO: Record<string, number> = { Semanal: 7, Quincenal: 15, Mensual: 30 };
  const diasPeriodo = DIAS_PERIODO[contrato.forma_pago ?? ""] ?? 0;
  const periodosCompletos = diasPeriodo > 0 ? Math.floor(dias / diasPeriodo) : 0;
  const diasARodar = periodosCompletos * diasPeriodo;

  // Con el motor de cajas el contrato NUNCA se pausa: esas cajas ya se le exigieron por el ledger.
  //   · "Cobrar ahora" crearía una deuda de días × tarifa ENCIMA de eso → cobra dos veces.
  //   · "Rodar" solo mueve `fecha_fin_contrato`, que es informativa (el contrato termina al llenar
  //     la caja N, no por fecha) → no le quita ni una caja exigida, no hace nada real.
  // Mientras la exoneración de cajas del spec (punto 7) no exista, lo honesto es no ofrecer
  // botones que hacen daño o nada. Los contratos v1 (sin motor) conservan el flujo de siempre.
  const motorV2 = contrato.motor_v2 === true && contrato.forma_pago !== "Diario";

  const [decision, setDecision] = useState<DecisionTiempo | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [firmando, setFirmando] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // El cliente completo (cédula + huella del registro) para el documento firmable en pantalla.
  const { clientes } = useClientes();
  const clienteFull = clientes.find(cl => cl.id === contrato.cliente_id) ?? null;

  // Fecha base real del contrato hoy (guardada o calculada) + los días fuera de servicio.
  // Arriba del handler a propósito: el DOCUMENTO que el cliente lee y firma dice la fecha nueva,
  // y tiene que ser exactamente la misma que después se guarda — no dos cálculos separados.
  const baseActual = contrato.fecha_fin_contrato
    ?? (contrato.fecha_entrega && contrato.meses ? calcularFechaFinContrato(contrato.fecha_entrega, contrato.meses) : fechaSalida);
  const fechaFinExtendida = (() => {
    const d = new Date(baseActual + "T00:00:00");
    d.setDate(d.getDate() + diasARodar);   // períodos COMPLETOS, no los días crudos
    return d.toISOString().slice(0, 10);
  })();

  const datosDocumento: DatosAcuerdoTiempo = {
    cliente: { nombre: clienteNombre, cedula: clienteFull?.cedula },
    placa: motoPlaca,
    motivo,
    fechaEntrada,
    fechaSalida,
    dias,
    decision: (decision ?? "rodar_al_final") as DatosAcuerdoTiempo["decision"],
    periodosCompletos,
    diasARodar,
    fechaFinAnterior: baseActual,
    fechaFinNueva: fechaFinExtendida,
    valorCobrar: valorTotal,
    convenioCorrido: convenioActivo && periodosCompletos >= 1
      ? { cuotas: periodosCompletos, valorCuota: convenioActivo.cuota_por_periodo ?? 0 }
      : null,
    observaciones: observaciones || undefined,
  };

  async function handleConfirmar() {
    if (guardando || !profile || !decision) return;
    if (!archivo) { setError("Firma en pantalla o sube el documento firmado antes de continuar."); return; }
    setError(null);
    setGuardando(true);
    try {

      const { error: errAcuerdo, id: acuerdoId } = await crearAcuerdoTiempo({
        contrato_id: contrato.id,
        cliente_id: contrato.cliente_id,
        moto_id: contrato.moto_id!,
        dias_en_empresa: dias,
        valor_por_dia: tarifa,
        decision,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        nueva_fecha_fin_contrato: decision === "rodar_al_final" ? fechaFinExtendida : undefined,
        observaciones: `${motivo}${observaciones ? " — " + observaciones : ""}`,
        creado_por: profile.id,
      });
      if (errAcuerdo) { setError(errAcuerdo); return; }
      if (acuerdoId) await subirDocumentoAcuerdo(acuerdoId, archivo);

      if (decision === "cobrar_ahora") {
        await registrarDeuda(contrato.id, "tarifa_atrasada", `${motivo} — ${dias} días sin producir (${fechaEntrada} a ${fechaSalida})`, valorTotal, profile.id);
      } else {
        // RODAR DE VERDAD (mig 078): se exoneran N cajas de la EXIGENCIA. No se perdonan — la
        // curva de exigencia se corre N períodos y el cliente las paga al final. Antes esto solo
        // movía `fecha_fin_contrato`, que es informativa: las cajas se le seguían exigiendo igual
        // y el admin creía tener una herramienta que no existía.
        // La fecha de fin igual se mueve, para que los documentos impresos digan lo mismo.
        const { error: errRodar } = await editarContrato(contrato, {
          cajas_exoneradas: (contrato.cajas_exoneradas ?? 0) + periodosCompletos,
          fecha_fin_contrato: fechaFinExtendida,
        }, profile.id);
        if (errRodar) {
          setError(
            errRodar.includes("cajas_exoneradas")
              ? "Falta correr la migración 078 en Supabase: sin ella no se puede rodar tiempo."
              : errRodar,
          );
          return;
        }
        // El PAQUETE completo: las cuotas del convenio de esas semanas se corren también
        // (se cobran en las siguientes — el total del convenio no cambia ni un peso).
        if (convenioActivo && periodosCompletos >= 1) {
          const { error: errConv } = await rodarPeriodosConvenio(
            convenioActivo, periodosCompletos, diasARodar, profile.id,
            `moto guardada por ${motivo} del ${fechaEntrada} al ${fechaSalida} (acuerdo de tiempo firmado)`,
          );
          if (errConv) { setError(errConv); return; }
        }
      }

      setExito(true);
      setTimeout(() => onClose(), 1500);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 400 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "var(--card)", borderRadius: 20, padding: 24, display: "grid", gap: 16, boxSizing: "border-box" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>⏱️ Tiempo fuera de servicio</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{clienteNombre} · {motoPlaca}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, padding: "6px 12px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--accent-soft2)", border: "1px solid var(--accent-line)" }}>
          <div style={{ fontSize: 13, color: "var(--accent-ink)" }}>
            La moto estuvo <strong>{dias} día{dias !== 1 ? "s" : ""}</strong> por <strong>{motivo}</strong> ({fechaEntrada} → {fechaSalida}).
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>$ {fmt(valorTotal)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{dias} días × $ {fmt(tarifa)}/día (tarifa diaria)</div>
        </div>

        {motorV2 ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line, var(--line))" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ok-ink)", marginBottom: 6 }}>
                ✅ Estos días ya están cobrados
              </div>
              <div style={{ fontSize: 13, color: "var(--ok-ink)", lineHeight: 1.5 }}>
                El contrato de {clienteNombre} <strong>nunca se detuvo</strong>: sus cuotas siguieron
                corriendo mientras la moto estaba por {motivo}. Esas semanas ya están en su cuenta.
                <br /><br />
                <strong>No hay que cobrarle nada aparte por estos {dias} día{dias !== 1 ? "s" : ""}.</strong> Si
                se le carga además ${fmt(valorTotal)}, se le estaría cobrando dos veces lo mismo.
              </div>
            </div>
            {periodosCompletos >= 1 ? (
              <button
                onClick={() => setDecision("rodar_al_final")}
                style={{
                  padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer", width: "100%",
                  border: decision === "rodar_al_final" ? "2px solid var(--accent)" : "1px solid var(--line)",
                  background: decision === "rodar_al_final" ? "var(--accent-soft2)" : "var(--card)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-ink)" }}>
                  📅 Rodar {periodosCompletos} período{periodosCompletos !== 1 ? "s" : ""} al final
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>
                  Esa{periodosCompletos !== 1 ? "s" : ""} {periodosCompletos} cuota{periodosCompletos !== 1 ? "s" : ""} dejan
                  de exigírsele <strong>ahora</strong> y las paga <strong>al final</strong>. No se le perdonan:
                  el contrato termina {diasARodar} días más tarde.
                  {convenioActivo && (
                    <>
                      <br />
                      <strong>También se corren {periodosCompletos} cuota{periodosCompletos !== 1 ? "s" : ""} de su
                      convenio ($ {fmt((convenioActivo.cuota_por_periodo ?? 0) * periodosCompletos)})</strong> — el
                      paquete completo de esas semanas. El total del convenio no cambia.
                    </>
                  )}
                  <br />
                  Es la excepción — la prioridad de la empresa siempre es cobrar de una.
                </div>
              </button>
            ) : (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--soft)", border: "1px dashed var(--line)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted2)" }}>📅 Rodar al final — no se puede</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
                  Estuvo {dias} día{dias !== 1 ? "s" : ""} y no alcanza a completar un período
                  de {diasPeriodo || "—"} días. Rodar días sueltos descuadra las cuentas.
                </div>
              </div>
            )}
            {!decision && <button onClick={onClose} style={{ ...secondaryBtn, width: "100%" }}>Cerrar sin rodar</button>}
          </div>
        ) : (
        <div>
          <div style={labelStyle}>¿Cómo se resuelve?</div>
          <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => setDecision("cobrar_ahora")}
              style={{
                padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                border: decision === "cobrar_ahora" ? "2px solid var(--bad-ink)" : "1px solid var(--line)",
                background: decision === "cobrar_ahora" ? "var(--bad-soft)" : "var(--card)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bad-ink)" }}>💰 Cobrar ahora</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Se registra como deuda de $ {fmt(valorTotal)}. El contrato NO se extiende.</div>
            </button>
            {/* Rodar solo si el tiempo guardado completa al menos UN período entero. */}
            {periodosCompletos >= 1 ? (
              <button
                onClick={() => setDecision("rodar_al_final")}
                style={{
                  padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                  border: decision === "rodar_al_final" ? "2px solid var(--ok-ink)" : "1px solid var(--line)",
                  background: decision === "rodar_al_final" ? "var(--ok-soft)" : "var(--card)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ok-ink)" }}>📅 Rodar al final</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  No se cobra nada. El contrato termina {diasARodar} días más tarde
                  ({periodosCompletos} período{periodosCompletos !== 1 ? "s" : ""} completo{periodosCompletos !== 1 ? "s" : ""}).
                  {convenioActivo && (
                    <> También se corren {periodosCompletos} cuota{periodosCompletos !== 1 ? "s" : ""} de su convenio — el total no cambia.</>
                  )}
                </div>
              </button>
            ) : (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--soft)", border: "1px dashed var(--line)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--muted2)" }}>📅 Rodar al final — no disponible</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Estuvo {dias} día{dias !== 1 ? "s" : ""} y no completa un período de {diasPeriodo || "—"}.
                  Rodar días sueltos descuadra las cuentas.
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {decision && (
          <>
            <div>
              <div style={labelStyle}>Observaciones (opcional)</div>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Detalle adicional..." />
            </div>

            <div style={{ padding: 14, borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)", marginBottom: 8 }}>
                📄 Documento firmado por el cliente (obligatorio)
              </div>
              <div style={{ fontSize: 12, color: "var(--warn-ink)", marginBottom: 10 }}>
                Debe quedar claro que el cliente entiende que su contrato {decision === "rodar_al_final" ? `termina ${diasARodar} día(s) después de lo previsto` : `debe $${fmt(valorTotal)} adicionales`}.
              </div>
              {/* Firma en pantalla (pedido del dueño, 22-ago: "como los de liquidación"): genera
                  el documento, el cliente lo lee, firma con el canvas y la huella sale del
                  registro. El PDF cae en este mismo casillero — el resto del flujo no cambia. */}
              <button onClick={() => setFirmando(true)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "none", background: "var(--ok)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 10 }}>
                ✍️ Generar y firmar en pantalla (firma + huella)
              </button>
              <div style={{ fontSize: 11.5, color: "var(--warn-ink)", marginBottom: 8 }}>
                ¿Prefieren papel? Imprime el acuerdo, que lo firme a mano, y sube la foto:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => imprimirAcuerdoTiempo(datosDocumento, { borrador: true })}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--soft2)", border: "1px solid var(--line)", color: "var(--text)", fontWeight: 700, fontSize: 13 }}>
                  🖨️ Imprimir
                </button>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent)", color: "var(--card)", fontWeight: 700, fontSize: 13 }}>
                  📷 Cámara
                  <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "7px 14px", borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-ink)", fontWeight: 700, fontSize: 13 }}>
                  🖼 Galería
                  <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
                </label>
              </div>
              {archivo && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--ok-ink)", fontWeight: 700 }}>
                  ✅ {archivo.name === "acuerdo-tiempo-firmado.pdf" ? "Firmado en pantalla — documento listo" : archivo.name}
                </div>
              )}
            </div>
          </>
        )}

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
            Registrado correctamente.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...secondaryBtn, padding: "10px 18px", fontSize: 14 }}>
            {decision ? "Cancelar" : "Resolver después"}
          </button>
          {decision && (
            <button
              onClick={handleConfirmar}
              disabled={guardando || exito || !archivo}
              style={{ ...primaryBtn, padding: "10px 18px", fontSize: 14, opacity: guardando || exito || !archivo ? 0.6 : 1 }}
            >
              {guardando ? "Guardando..." : "Confirmar"}
            </button>
          )}
        </div>
      </div>

      {firmando && decision && (
        <ModalFirmaAcuerdoTiempo
          datos={datosDocumento}
          huellaRegistroUrl={clienteFull?.autorizacion_datos_huella_url ?? null}
          onCerrar={() => setFirmando(false)}
          onFirmado={(pdf) => setArchivo(pdf)}
        />
      )}
    </div>
  );
}
