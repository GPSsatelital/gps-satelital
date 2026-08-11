import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useCesiones, type SnapshotCesion } from "../hooks/useCesiones";
import { useClientes, documentosListos } from "../hooks/useClientes";
import { useContratos, ahorroTotal, empalmePendiente } from "../hooks/useContratos";
import { useDeudas } from "../hooks/useDeudas";
import { useConvenios } from "../hooks/useConvenios";
import { usePagos } from "../hooks/usePagos";
import { useMotos } from "../hooks/useMotos";
import { useVisitas } from "../hooks/useVisitas";
import { usePrestamos } from "../hooks/usePrestamos";
import { useAuth } from "../contexts/AuthContext";
import { valorPeriodoReal, formatDiaPago } from "../utils/cicloPago";
import { hoyISO } from "../utils/fecha";
import { labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import CanvasFirma from "./CanvasFirma";
import LectorHuella from "./LectorHuella";
import Placa from "./Placa";
import { generarHTMLCesion } from "../hooks/useDocumentos";
import type { Contrato } from "../hooks/useContratos";

// CEDER EL CONTRATO A OTRA PERSONA (mig 094).
//
// El cliente ya no puede seguir y le entrega a otro su contrato completo: los ahorros, las semanas
// pagadas y también lo que debe. Legalmente es una cesión de posición contractual, NO una novación
// — el contrato sigue vivo con las mismas tarifas y el mismo plazo. Acá solo cambia quién responde.
//
// LO QUE ESTA VENTANA **NO** HACE (regla del dueño, 11-ago-2026): no entrega la moto. Si está
// retenida, sale después por Inmovilizaciones → "✓ Entregar", con las reglas que ese flujo ya
// tiene. Un contrato Suspendido sigue Suspendido al terminar acá.
//
// EL RETRATO DE LAS CUENTAS se calcula UNA sola vez y el MISMO objeto va a la pantalla y al acta
// impresa, para que el papel nunca diga una cifra distinta a la que vieron las dos personas.

interface Props {
  contrato: Contrato;
  onClose: () => void;
  onDone?: (msg: string) => void;
}

const fmt = (n: number) => "$ " + Math.round(n).toLocaleString("es-CO");

export default function ModalCederContrato({ contrato, onClose, onDone }: Props) {
  useBloquearScrollFondo();
  // Mismo criterio local que el resto de pantallas: `useIsMobile` vive dentro de App.tsx
  // y no se exporta.
  const [isMobile] = useState(window.innerWidth < 900);
  const { profile } = useAuth();
  const { cederContrato } = useCesiones();
  const { clientes } = useClientes();
  const { contratos } = useContratos();
  const { deudas } = useDeudas();
  const { convenios } = useConvenios();
  const { pagos } = usePagos();
  const { motos } = useMotos();
  const { visitas } = useVisitas();
  const { prestamoActivoDeContrato } = usePrestamos();

  const [cesionarioId, setCesionarioId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [firmaCedente, setFirmaCedente] = useState<string | null>(null);
  const [firmaCesionario, setFirmaCesionario] = useState<string | null>(null);
  const [huellaCedente, setHuellaCedente] = useState<string | null>(null);
  const [huellaCesionario, setHuellaCesionario] = useState<string | null>(null);
  const [acta, setActa] = useState<File | null>(null);
  const [pagare, setPagare] = useState<File | null>(null);
  const [certificado, setCertificado] = useState<File | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const cedente = clientes.find(c => c.id === contrato.cliente_id);
  const cesionario = clientes.find(c => c.id === cesionarioId);
  const moto = motos.find(m => m.id === contrato.moto_id) ?? null;

  // ── El retrato de las cuentas al día de hoy ────────────────────────────────
  const snapshot: SnapshotCesion = useMemo(() => {
    const misDeudas = deudas.filter(d => d.contrato_id === contrato.id && d.estado === "pendiente");
    const conv = convenios.find(c => c.contrato_id === contrato.id && c.estado === "activo") as
      undefined | { deuda_total?: number; cuota_por_periodo?: number; numero_cuotas?: number; cuotas_pagadas?: number };
    const confirmados = pagos.filter(p => p.contrato_id === contrato.id && p.estado === "Confirmado");
    const saldoFavor = (contrato.saldo_favor_apertura ?? 0)
      + confirmados.reduce((a, p) => a + (p.aplicado_saldo_favor ?? 0), 0);
    const cuotasRest = conv ? Math.max((conv.numero_cuotas ?? 0) - (conv.cuotas_pagadas ?? 0), 0) : null;
    return {
      ahorro_acumulado: contrato.ahorro_acumulado ?? 0,
      ahorro_apertura: contrato.ahorro_apertura ?? 0,
      saldo_favor: Math.max(saldoFavor, 0),
      deuda_total: misDeudas.reduce((a, d) => a + d.monto_pendiente, 0),
      deuda_detalle: misDeudas.map(d => ({ concepto: d.descripcion || d.concepto.replace(/_/g, " "), pendiente: d.monto_pendiente })),
      convenio_saldo: conv ? Math.max((conv.deuda_total ?? 0) - (conv.cuotas_pagadas ?? 0) * (conv.cuota_por_periodo ?? 0), 0) : null,
      convenio_cuota: conv?.cuota_por_periodo ?? null,
      convenio_cuotas_restantes: cuotasRest,
      cajas_pagadas: contrato.cajas_pagadas ?? null,
      total_cajas: contrato.total_cajas ?? null,
      caja_actual_pagado: contrato.caja_actual_pagado ?? null,
      valor_periodo: valorPeriodoReal(contrato),
      forma_pago: contrato.forma_pago ?? null,
      dia_pago_label: formatDiaPago(contrato),
      moto_placa: moto?.placa ?? null,
    };
  }, [contrato, deudas, convenios, pagos, moto]);

  const ahorro = ahorroTotal(contrato);

  // ── Lo que impide ceder ────────────────────────────────────────────────────
  // Se ordena de lo más barato a lo más caro de explicar, y cada uno dice qué hacer.
  const bloqueos = useMemo(() => {
    const b: string[] = [];
    if (!["Activo", "Suspendido"].includes(contrato.estado)) {
      b.push(`Solo se puede ceder un contrato Activo o Suspendido (este está ${contrato.estado}).`);
    }
    if (prestamoActivoDeContrato(contrato.id)) {
      b.push("Este contrato tiene una moto de reemplazo prestada. Devuélvela primero — si no, la placa cambiaría después y el acta diría una moto que no es.");
    }
    if (empalmePendiente(contrato)) {
      b.push("Este contrato tiene el empalme abierto: su ahorro y su deuda todavía se pueden editar. Ciérralo en Cartera antes de ceder, o el acta congelaría cifras sin confirmar.");
    }
    const pend = pagos.filter(p => p.contrato_id === contrato.id && p.estado === "Pendiente");
    if (pend.length > 0) {
      b.push(`Hay ${pend.length} pago(s) sin confirmar en este contrato. Confírmalos o recházalos primero: si se confirman después de la cesión, esa plata le llenaría las semanas al cliente nuevo.`);
    }
    return b;
  }, [contrato, pagos, prestamoActivoDeContrato]);

  // ── Requisitos del que recibe ──────────────────────────────────────────────
  // "Aprobado" es el requisito duro: ese estado solo se alcanza tras papeles, acompañante y
  // visita, así que cubre todo el embudo sin duplicar reglas (igual que exige el wizard).
  // Los renglones sueltos son informativos: sirven para que el funcionario sepa QUÉ le falta.
  const requisitos = useMemo(() => {
    if (!cesionario) return [];
    const tieneOtro = contratos.some(c => c.cliente_id === cesionario.id && ["Activo", "En proceso", "Suspendido"].includes(c.estado));
    return [
      { ok: cesionario.estado === "Aprobado", t: "Está Aprobado", ayuda: "Se aprueba en Clientes, tras la visita." },
      { ok: !!documentosListos(cesionario.documentos_cliente), t: "Documentos completos", ayuda: "Súbelos en su ficha → Documentos." },
      { ok: !!cesionario.acompanante_nombre, t: "Tiene acompañante registrada", ayuda: "Se registra en su ficha." },
      { ok: visitas.some(v => v.cliente_id === cesionario.id && (v.resultado ?? "").toLowerCase().includes("aprob")), t: "Visita domiciliaria aprobada", ayuda: "Se aprueba en Clientes." },
      { ok: !cesionario.lista_negra, t: "No está en lista negra", ayuda: "" },
      { ok: !tieneOtro, t: "No tiene otro contrato vivo", ayuda: "Un cliente no puede llevar dos motos." },
    ];
  }, [cesionario, contratos, visitas]);

  const faltan = requisitos.filter(r => !r.ok);
  const puedeSeguir = bloqueos.length === 0 && !!cesionario && faltan.length === 0
    && !!firmaCedente && !!firmaCesionario && !!acta && !!pagare && !!certificado;

  function imprimirActa() {
    if (!cedente) return;
    const html = generarHTMLCesion(contrato, cedente, cesionario ?? null, moto, {
      fecha: hoyISO(), ahorroTotal: ahorro, snapshot,
    });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  async function subir(file: File, nombre: string): Promise<string | null> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `cesiones/${contrato.id}/${nombre}-${Date.now()}.${ext}`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (up) return null;
    return supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
  }

  async function subirDataUrl(dataUrl: string, nombre: string): Promise<string | null> {
    const blob = await (await fetch(dataUrl)).blob();
    const path = `cesiones/${contrato.id}/${nombre}-${Date.now()}.png`;
    const { error: up } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (up) return null;
    return supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
  }

  async function handleGuardar() {
    if (guardando) return;
    if (!profile || !cedente || !cesionario) { setError("Falta información de las personas."); return; }
    setError(null);
    setGuardando(true);
    try {
      // 1. LA EVIDENCIA PRIMERO. Si algo no sube, no se registra nada: una cesión sin el acta ni
      //    las firmas es justo lo que este flujo viene a evitar.
      const fCed = await subirDataUrl(firmaCedente!, "firma-cedente");
      if (!fCed) { setError("No se pudo guardar la firma de quien cede. Intenta de nuevo."); return; }
      const fCes = await subirDataUrl(firmaCesionario!, "firma-cesionario");
      if (!fCes) { setError("No se pudo guardar la firma de quien recibe. Intenta de nuevo."); return; }
      const uActa = await subir(acta!, "acta");
      if (!uActa) { setError("No se pudo subir el acta firmada. Intenta de nuevo."); return; }
      const uPagare = await subir(pagare!, "pagare");
      if (!uPagare) { setError("No se pudo subir el pagaré. Intenta de nuevo."); return; }
      const uCert = await subir(certificado!, "certificado");
      if (!uCert) { setError("No se pudo subir el certificado. Intenta de nuevo."); return; }
      // Las huellas son opcionales: el lector no siempre está y bloquear por eso dejaría a las
      // dos personas esperando con el acta ya firmada en la mano.
      const hCed = huellaCedente ? await subirDataUrl(huellaCedente, "huella-cedente") : null;
      const hCes = huellaCesionario ? await subirDataUrl(huellaCesionario, "huella-cesionario") : null;

      const { error: errCes } = await cederContrato({
        contratoId: contrato.id,
        cedenteId: contrato.cliente_id,
        cesionarioId: cesionario.id,
        fecha: hoyISO(),
        snapshot,
        evidencia: {
          firmaCedente: fCed, firmaCesionario: fCes,
          huellaCedente: hCed, huellaCesionario: hCes,
          documentoFirmado: uActa, pagare: uPagare, certificado: uCert,
        },
        motivo: motivo.trim() || null,
        registradoPor: profile.id,
      });
      if (errCes) { setError(errCes); return; }
      setListo(true);
    } finally {
      setGuardando(false);
      setConfirmando(false);
    }
  }

  const BotonesArchivo = ({ valor, onPick, rotulo }: { valor: File | null; onPick: (f: File | null) => void; rotulo: string }) => (
    <div>
      <div style={{ ...labelStyle, marginBottom: 6 }}>{rotulo} *</div>
      {valor ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ok-soft)", padding: "8px 10px", borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: "var(--ok-ink)", fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✔ {valor.name}</span>
          <button type="button" onClick={() => onPick(null)} style={{ ...secondaryBtn, padding: "6px 10px", fontSize: 12 }}>Quitar</button>
        </div>
      ) : (
        // Dos botones separados: Android no permite cámara y galería en un solo input.
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ ...secondaryBtn, flex: 1, textAlign: "center", cursor: "pointer", padding: "9px 10px", fontSize: 13 }}>
            📷 Cámara
            <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => onPick(e.target.files?.[0] ?? null)} />
          </label>
          <label style={{ ...secondaryBtn, flex: 1, textAlign: "center", cursor: "pointer", padding: "9px 10px", fontSize: 13 }}>
            🖼 Galería
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => onPick(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      )}
    </div>
  );

  if (listo) {
    return (
      <>
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "min(460px, 96vw)", background: "var(--card)", borderRadius: 20, padding: 24, zIndex: 401,
          display: "grid", gap: 14, boxSizing: "border-box",
        }}>
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "12px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14, lineHeight: 1.55 }}>
            ✅ El contrato de {snapshot.moto_placa} quedó a nombre de <strong>{cesionario?.nombre.toUpperCase()}</strong>.
            Sigue con las mismas condiciones y en la misma cuota — no se movió ni un peso.
          </div>
          {contrato.estado === "Suspendido" && (
            <div style={{ fontSize: 12.5, color: "var(--warn-ink)", background: "var(--warn-soft)", padding: "10px 12px", borderRadius: 10, lineHeight: 1.55 }}>
              La moto sigue guardada. Para entregársela, ve a <strong>Inmovilizaciones → ✓ Entregar</strong>, como con cualquier retenida.
            </div>
          )}
          <button onClick={imprimirActa} style={{ ...primaryBtn }}>🖨️ Imprimir acta de cesión</button>
          <button onClick={() => { onDone?.(`Contrato cedido a ${cesionario?.nombre ?? ""}`); onClose(); }} style={{ ...secondaryBtn }}>Cerrar</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "min(560px, 96vw)", background: "var(--card)", borderRadius: 20, padding: isMobile ? 16 : 24, zIndex: 401,
        boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>🔁 Ceder el contrato</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{cedente?.nombre ?? "—"}</div>
          </div>
          {moto && <Placa placa={moto.placa} size="sm" />}
        </div>

        {bloqueos.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {bloqueos.map((b, i) => (
              <div key={i} style={{ color: "var(--bad-ink)", background: "var(--bad-soft)", padding: "11px 13px", borderRadius: 12, fontSize: 13, lineHeight: 1.55 }}>⛔ {b}</div>
            ))}
            <button onClick={onClose} style={{ ...secondaryBtn }}>Entendido</button>
          </div>
        ) : (
          <>
            {/* ── 1. Lo que se traspasa ── */}
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--soft2)", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", marginBottom: 8 }}>Lo que se traspasa</div>
              {[
                snapshot.total_cajas ? { k: "Va en la cuota", v: `${snapshot.cajas_pagadas ?? 0} de ${snapshot.total_cajas}` } : null,
                { k: "Cuota", v: `${fmt(snapshot.valor_periodo ?? 0)} · ${snapshot.dia_pago_label}` },
                { k: "Ahorro que pasa", v: fmt(ahorro), tono: "var(--ok-ink)" },
                snapshot.saldo_favor > 0 ? { k: "Saldo a favor", v: fmt(snapshot.saldo_favor), tono: "var(--ok-ink)" } : null,
                { k: "Deuda que pasa", v: fmt(snapshot.deuda_total), tono: snapshot.deuda_total > 0 ? "var(--bad-ink)" : undefined },
                snapshot.convenio_saldo ? { k: "Acuerdo de pago", v: `${fmt(snapshot.convenio_saldo)} · ${snapshot.convenio_cuotas_restantes} cuotas` } : null,
              ].filter(Boolean).map((r, i) => {
                const x = r as { k: string; v: string; tono?: string };
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "3px 0", fontSize: 13.5 }}>
                    <span style={{ color: "var(--muted2)", minWidth: 0 }}>{x.k}</span>
                    <strong style={{ color: x.tono ?? "var(--text)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{x.v}</strong>
                  </div>
                );
              })}
              {snapshot.deuda_total > 0 && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--warn-ink)", background: "var(--warn-soft2)", padding: "9px 11px", borderRadius: 10, lineHeight: 1.5 }}>
                  Esta deuda de <strong>{fmt(snapshot.deuda_total)}</strong> pasa completa a quien recibe. Que los dos la vean antes de firmar.
                </div>
              )}
              <button type="button" onClick={imprimirActa} style={{ ...secondaryBtn, width: "100%", marginTop: 12 }}>🖨️ Imprimir acta para firmar</button>
            </div>

            {/* ── 2. Quién recibe ── */}
            <div>
              <div style={labelStyle}>¿Quién recibe el contrato?</div>
              <select
                value={cesionarioId}
                onChange={e => setCesionarioId(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 14, textTransform: "uppercase" }}
              >
                <option value="">— Elegir cliente —</option>
                {clientes
                  .filter(c => c.id !== contrato.cliente_id)
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.cedula}</option>)}
              </select>
              {cesionario && (
                <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
                  {requisitos.map((r, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: r.ok ? "var(--ok-ink)" : "var(--bad-ink)", lineHeight: 1.45 }}>
                      {r.ok ? "✅" : "❌"} {r.t}
                      {!r.ok && r.ayuda && <span style={{ color: "var(--muted)" }}> — {r.ayuda}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cesionario && faltan.length === 0 && (
              <>
                <div>
                  <div style={labelStyle}>Motivo de la cesión (opcional)</div>
                  <input
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Ej: se va de la ciudad"
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 14 }}
                  />
                </div>

                {/* ── 3. Firmas ── */}
                <div>
                  <div style={{ ...labelStyle, marginBottom: 2 }}>Firma de quien ENTREGA *</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>{cedente?.nombre.toUpperCase()}</div>
                  <CanvasFirma label="" modal onChange={setFirmaCedente} opcional={false} />
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: 2 }}>Huella de quien entrega (opcional)</div>
                  <LectorHuella label="" onChange={setHuellaCedente} />
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: 2 }}>Firma de quien RECIBE *</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 6 }}>{cesionario.nombre.toUpperCase()}</div>
                  <CanvasFirma label="" modal onChange={setFirmaCesionario} opcional={false} />
                </div>
                <div>
                  <div style={{ ...labelStyle, marginBottom: 2 }}>Huella de quien recibe (opcional)</div>
                  <LectorHuella label="" onChange={setHuellaCesionario} />
                </div>

                {/* ── 4. Los papeles ── */}
                <BotonesArchivo valor={acta} onPick={setActa} rotulo="Acta de cesión firmada por los tres" />
                <BotonesArchivo valor={pagare} onPick={setPagare} rotulo="Pagaré con carta de instrucciones (del que recibe)" />
                <BotonesArchivo valor={certificado} onPick={setCertificado} rotulo="Certificado firmado (del que recibe)" />
              </>
            )}

            {error && <div style={{ color: "var(--bad-ink)", background: "var(--bad-soft)", padding: "10px 12px", borderRadius: 10, fontWeight: 600, fontSize: 13, lineHeight: 1.55 }}>{error}</div>}

            {confirmando ? (
              <div style={{ display: "grid", gap: 10, padding: "12px 14px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.6 }}>
                  ¿Confirmas que el contrato de la placa <strong>{snapshot.moto_placa}</strong> pasa de{" "}
                  <strong>{cedente?.nombre.toUpperCase()}</strong> a <strong>{cesionario?.nombre.toUpperCase()}</strong>?
                  <br /><br />
                  {cesionario?.nombre.split(" ")[0]} asume <strong>{fmt(snapshot.deuda_total)}</strong> de deuda,
                  recibe <strong>{fmt(ahorro)}</strong> de ahorro
                  {snapshot.total_cajas ? <> y continúa en la <strong>cuota {snapshot.cajas_pagadas ?? 0} de {snapshot.total_cajas}</strong></> : null},
                  con las mismas condiciones.
                  <br /><br />
                  {cedente?.nombre.split(" ")[0]} queda como <strong>Retirado</strong> y podrá volver más adelante desde cero.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmando(false)} disabled={guardando} style={{ ...secondaryBtn, flex: 1 }}>Volver</button>
                  <button onClick={handleGuardar} disabled={guardando} style={{ ...primaryBtn, flex: 2, opacity: guardando ? 0.6 : 1 }}>
                    {guardando ? "Cediendo..." : "Sí, ceder el contrato"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
                <button
                  onClick={() => { setError(null); setConfirmando(true); }}
                  disabled={!puedeSeguir}
                  style={{ ...primaryBtn, flex: 2, opacity: puedeSeguir ? 1 : 0.5, cursor: puedeSeguir ? "pointer" : "not-allowed" }}
                >
                  Ceder el contrato
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
