import { useState } from "react";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useAbonosBase, COSTO_VISITA_DOMICILIARIA } from "../hooks/useAbonosBase";
import { useClientes } from "../hooks/useClientes";
import { useVisitas, visitaFueHecha } from "../hooks/useVisitas";
import { useAuth } from "../contexts/AuthContext";
import { hoyISO } from "../utils/fecha";
import { labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import CanvasFirma from "./CanvasFirma";
import LectorHuella from "./LectorHuella";
import TicketTermico, { buildTicketDevolucionBase, type TicketData } from "./TicketTermico";

// Devolver la base inicial a un cliente que se retira ANTES de recibir moto (mig 091).
//
// Antes esto no existía en ninguna parte: la liquidación exige un contrato, y este cliente nunca
// llegó a tener moto. La plata se devolvía a mano y no quedaba rastro de nada — si el cliente
// volvía diciendo "nunca me devolvieron", lo único que existía era el recibo de cuando PAGÓ.
//
// REGLAS DEL DUEÑO (6-ago-2026): se le descuenta lo que la empresa ya le pagó al visitador que
// fue a su casa — monto FIJO, una sola vez aunque le hayan hecho varias visitas. Y si se retira
// ANTES de la visita se le devuelve TODO: si nadie fue, la empresa no gastó nada.
// Por eso el monto no se teclea: lo calcula el sistema, que es quien sabe si la visita se hizo.
//
// LA FIRMA ES OBLIGATORIA: es el motivo entero de este flujo. Sin ella se repetiría el problema
// que lo originó — plata que sale sin prueba de que llegó a su dueño. La huella es opcional
// porque el lector no siempre está disponible y bloquear por eso dejaría al cliente esperando.

interface Props {
  clienteId: string;
  nombre: string;
  cedula: string;
  montoEntregado: number;
  onClose: () => void;
  onDone?: (msg: string) => void;
}

export default function ModalDevolucionBase({ clienteId, nombre, cedula, montoEntregado, onClose, onDone }: Props) {
  useBloquearScrollFondo();
  const { registrar, subirEvidencia } = useAbonosBase();
  const { actualizarCliente } = useClientes();
  const { visitas } = useVisitas();
  const { profile } = useAuth();

  // El descuento sale de un hecho, no de una opinión: ¿alguien fue de verdad a visitarlo?
  // OJO: "hecha" ≠ "aprobada". Una visita puede estar hecha y figurar "Pendiente de revisar"
  // (falta que el admin la apruebe) — al visitador ya se le pagó igual.
  const tieneVisitaRealizada = visitas.some(v => v.cliente_id === clienteId && visitaFueHecha(v));
  // Nunca se retiene más de lo que entregó: si dejó menos que el costo de la visita, se queda
  // en cero y no sale un "recibe -$5.000" que nadie sabría cómo entregar.
  const retencion = tieneVisitaRealizada ? Math.min(COSTO_VISITA_DOMICILIARIA, montoEntregado) : 0;
  const aDevolver = montoEntregado - retencion;

  const [firma, setFirma] = useState<string | null>(null);
  const [huella, setHuella] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<TicketData | null>(null);

  const fmt = (n: number) => "$ " + Math.round(n).toLocaleString("es-CO");

  async function handleGuardar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    if (montoEntregado <= 0) { setError("Este cliente no tiene base registrada para devolver."); return; }
    if (!firma) { setError("Falta la firma del cliente — es la prueba de que recibió su dinero."); return; }
    setError(null);
    setGuardando(true);
    try {
      // 1. La evidencia primero: si la firma no sube, no se registra nada. Al revés quedaría una
      //    devolución sin prueba, que es exactamente lo que este flujo viene a evitar.
      const { url: firmaUrl, error: errFirma } = await subirEvidencia(firma, cedula, "firma");
      if (errFirma || !firmaUrl) { setError("No se pudo guardar la firma: " + (errFirma ?? "desconocido") + ". Intenta de nuevo."); return; }

      let huellaUrl: string | null = null;
      if (huella) {
        const r = await subirEvidencia(huella, cedula, "huella");
        huellaUrl = r.url;   // si falla, se sigue: la huella es opcional y la firma ya quedó
      }

      // 2. Los movimientos de plata. Son DOS hechos distintos y por eso van separados: lo que
      //    sale a las manos del cliente, y lo que se queda la empresa por la visita ya pagada.
      //    Si fuera una sola devolución neta, el saldo del cliente quedaría en $40.000 y
      //    parecería que todavía tiene plata adentro cuando no tiene nada.
      const base = {
        cliente_id: clienteId,
        metodo: "Efectivo" as const,
        fecha: hoyISO(),
        fecha_registro: hoyISO(),
        registrado_por: profile.id,
      };
      if (aDevolver > 0) {
        const { error: errMov } = await registrar({
          ...base, tipo: "devolucion", monto: aDevolver,
          firma_url: firmaUrl, huella_url: huellaUrl,
          nota: nota.trim() || "El cliente se retira del proceso",
        });
        if (errMov) { setError("Error al registrar la devolución: " + errMov); return; }
      }
      if (retencion > 0) {
        const { error: errRet } = await registrar({
          ...base, tipo: "retencion", monto: retencion,
          nota: "Visita domiciliaria ya realizada — pago al visitador",
        });
        // La devolución ya quedó y el cliente ya tiene su plata: no se aborta por esto, pero
        // hay que avisar, porque sin la retención su saldo de base no cierra en cero.
        if (errRet) { setError(`El dinero YA se registró como entregado — NO lo repitas. Falló solo anotar los ${fmt(retencion)} de la visita: ${errRet}. Avísame para corregirlo.`); return; }
      }

      // 3. El cliente queda Retirado y sin base entregada. Si esto falla, la devolución YA quedó
      //    registrada — hay que decirlo así para que nadie la vuelva a hacer creyendo que se perdió.
      const { error: errCli } = await actualizarCliente(clienteId, { ingreso_inicial: 0, estado: "Retirado" } as never);
      if (errCli) {
        setError(`La devolución YA quedó registrada — NO la repitas. Lo que falló fue marcar al cliente como Retirado: ${errCli}. Cámbialo a mano desde su ficha.`);
        return;
      }

      // El recibo muestra la cuenta desglosada: el cliente tiene que poder ver POR QUÉ recibe
      // menos de lo que entregó, sin que nadie se lo tenga que explicar de palabra.
      const ticket = buildTicketDevolucionBase(nombre, cedula, aDevolver, profile.nombre ?? "", firmaUrl);
      setRecibo(retencion > 0
        ? { ...ticket, lineas: [
            { label: "Entregó de base", valor: fmt(montoEntregado) },
            { label: "Visita domiciliaria", valor: "- " + fmt(retencion) },
          ] }
        : ticket);
    } finally {
      setGuardando(false);
      setConfirmando(false);
    }
  }

  // Con el recibo en pantalla el movimiento ya está hecho: solo queda imprimirlo y cerrar.
  if (recibo) {
    return (
      <>
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
        <div className="recibo-no-print" style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "min(420px, 96vw)", background: "var(--card)", borderRadius: 20, padding: 24, zIndex: 401,
          display: "grid", gap: 14, boxSizing: "border-box", maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
        }}>
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "12px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
            ✅ Entrégale <strong>{fmt(aDevolver)}</strong> al cliente.
            {retencion > 0 && <> De sus {fmt(montoEntregado)} se descontaron {fmt(retencion)} de la visita domiciliaria.</>}
            {" "}Quedó como <strong>Retirado</strong> y su firma quedó guardada como respaldo.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
            Imprime el recibo y entrégaselo junto con el dinero. El papel es para él; la prueba que queda
            en la empresa es su firma en el sistema.
          </div>
          <button onClick={() => window.print()} style={{ ...primaryBtn }}>🖨️ Imprimir recibo</button>
          <button onClick={() => { onDone?.(`Devolución registrada — ${fmt(montoEntregado)} a ${nombre}`); onClose(); }} style={{ ...secondaryBtn }}>Cerrar</button>
        </div>
        {/* Lo único que se imprime: oculto en pantalla, revelado por .ticket-termico en index.css */}
        <TicketTermico modo="print" datos={recibo} />
      </>
    );
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
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>↩️ Devolver la base inicial</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{nombre}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</button>
        </div>

        <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--warn-soft)", border: "1px solid var(--warn-line)" }}>
          {retencion > 0 && (
            <div style={{ display: "grid", gap: 4, marginBottom: 8, fontSize: 13, color: "var(--muted2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>Entregó de base</span><strong style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(montoEntregado)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>Visita domiciliaria</span><strong style={{ fontVariantNumeric: "tabular-nums" }}>− {fmt(retencion)}</strong>
              </div>
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--warn-ink)", textTransform: "uppercase" }}>Se le entrega</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "var(--warn-ink)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{fmt(aDevolver)}</div>
          <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 4, lineHeight: 1.5 }}>
            {retencion > 0
              ? <>Se descuenta lo que ya se le pagó al visitador que fue a su casa. Al confirmar, el cliente queda como <strong>Retirado</strong>.</>
              : <>No se le hizo visita, así que se le devuelve todo lo que entregó. Al confirmar, queda como <strong>Retirado</strong>.</>}
          </div>
        </div>

        <div>
          <div style={labelStyle}>Motivo (opcional)</div>
          <input
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Ej: no consiguió los documentos"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 14 }}
          />
        </div>

        <div>
          <div style={{ ...labelStyle, marginBottom: 2 }}>Firma del cliente *</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6, lineHeight: 1.45 }}>
            Que firme al recibir el dinero. Es la prueba de que se le entregó — sin esto no se puede continuar.
          </div>
          <CanvasFirma label="" modal onChange={setFirma} opcional={false} />
        </div>

        <div>
          <div style={{ ...labelStyle, marginBottom: 2 }}>Huella (opcional)</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6, lineHeight: 1.45 }}>
            Si el lector está conectado. Se guarda en el sistema — no sale en el recibo impreso porque
            en papel térmico no se alcanza a distinguir.
          </div>
          <LectorHuella label="" onChange={setHuella} />
        </div>

        {error && <div style={{ color: "var(--bad-ink)", background: "var(--bad-soft)", padding: "10px 12px", borderRadius: 10, fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>{error}</div>}

        {confirmando ? (
          <div style={{ display: "grid", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.5 }}>
              ¿Confirmas que le entregas <strong>{fmt(aDevolver)}</strong> en efectivo a {nombre.toUpperCase()}?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmando(false)} disabled={guardando} style={{ ...secondaryBtn, flex: 1 }}>Volver</button>
              <button onClick={handleGuardar} disabled={guardando} style={{ ...primaryBtn, flex: 2, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Registrando..." : "Sí, entregar y registrar"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
            <button
              onClick={() => { if (!firma) { setError("Falta la firma del cliente."); return; } setError(null); setConfirmando(true); }}
              style={{ ...primaryBtn, flex: 2 }}
            >
              Entregar {fmt(aDevolver)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
