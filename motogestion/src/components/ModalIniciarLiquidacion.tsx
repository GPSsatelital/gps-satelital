import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { useLiquidaciones, type MotivoLiquidacion } from "../hooks/useLiquidaciones";
import { useUbicaciones, type CondicionVehiculo } from "../hooks/useUbicaciones";
import { useContratos } from "../hooks/useContratos";
import { useDeudas } from "../hooks/useDeudas";
import { MULTA_RECOLECCION } from "../utils/inmovilizacion";
import { useAuth } from "../contexts/AuthContext";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn } from "../styles/shared";
import MoneyInput from "./MoneyInput";
import { ANGULOS_FOTO, GridFotosAngulos, type AnguloFoto } from "./FotosAngulos";

// Punto de entrada REAL al flujo de Liquidación (antes iniciarLiquidacion existía
// pero ningún botón la llamaba — código muerto). Se abre desde Contratos, Motos
// ("Registrar novedad") o Inmovilizaciones → Motos retenidas. El motivo define todo
// lo que pasa al cierre:
//   cumplimiento      → Paz y Salvo, moto En traspaso, cliente Egresado
//   retiro_voluntario → moto vuelve a la flota, cliente Retirado
//   incumplimiento    → contrato Cancelado, cliente Retirado
//
// RECIBIR Y LIQUIDAR EN UN SOLO PASO (5-ago-2026, decisión del dueño): si el contrato
// sigue Activo, la moto TODAVÍA figura con el cliente y liquidar sin recibirla dejaba
// dos agujeros: (1) sin las 6 fotos no hay prueba del estado en que llegó, y el taller
// va a descontarle daños de su ahorro; (2) el contrato quedaba Activo, así que el
// cliente seguía figurando en cobro mientras la liquidación pasaba por sus 6 etapas.
// Antes eso dependía de que el funcionario se acordara de hacer "Entrega voluntaria"
// PRIMERO. Ahora la recepción se pide aquí mismo y no se puede saltar.
// Si el contrato ya está Suspendido (recolección por mora o entrega previa), este
// bloque no aparece y la ventana funciona igual que siempre.

interface Props {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  motoId: string | null;
  placa: string;
  ahorroAcumulado: number;
  motivoInicial?: MotivoLiquidacion;
  onClose: () => void;
  onDone?: () => void;
}

const MOTIVOS: { value: MotivoLiquidacion; label: string; desc: string }[] = [
  { value: "cumplimiento", label: "✅ Cumplimiento de contrato", desc: "El cliente terminó su plazo — se genera Paz y Salvo y la moto pasa a ser suya." },
  { value: "retiro_voluntario", label: "🚪 Retiro voluntario", desc: "El cliente entregó la moto y no volvió en los 7 días — la moto vuelve a la flota." },
  { value: "incumplimiento", label: "❌ Incumplimiento (mora)", desc: "La moto fue recolectada por mora y el cliente no pagó en los 7 días." },
];

export default function ModalIniciarLiquidacion({ contratoId, clienteId, clienteNombre, motoId, placa, ahorroAcumulado, motivoInicial, onClose, onDone }: Props) {
  useBloquearScrollFondo();
  const { iniciarLiquidacion } = useLiquidaciones();
  const { registrarRecepcion } = useUbicaciones();
  const { contratos, suspenderContrato } = useContratos();
  const { registrarDeuda } = useDeudas();
  const { profile } = useAuth();

  // Nunca arranca en "cumplimiento" si el que llama no lo pidió: ese motivo regala la moto.
  const [motivo, setMotivo] = useState<MotivoLiquidacion>(motivoInicial ?? "incumplimiento");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Estado del bloque de recepción (solo se usa si la moto sigue con el cliente)
  const [fueBuscada, setFueBuscada] = useState(false);
  const [condicion, setCondicion] = useState<CondicionVehiculo>("buena");
  const [danos, setDanos] = useState("");
  const [kilometros, setKilometros] = useState("");
  const [fotos, setFotos] = useState<Partial<Record<AnguloFoto, string>>>({});

  const contrato = contratos.find(c => c.id === contratoId);

  // 🔒 CANDADO DE LA MOTO REGALADA. "Cumplimiento" pone la moto En traspaso e imprime Paz y Salvo:
  // la moto pasa a ser del cliente. Ese motivo venía PRESELECCIONADO para cualquier contrato
  // Activo, así que un cliente en la caja 12 de 52 que se retira, con el funcionario que no cambia
  // el motivo, se llevaba la moto. Decisión del dueño (19-ago): bloquearlo del todo — no aparece.
  // Solo se ofrece cuando el ledger dice que ya llenó todas sus cajas.
  const cajasPagadas = contrato?.cajas_pagadas ?? 0;
  const totalCajas = contrato?.total_cajas ?? null;
  const terminoDePagar = totalCajas != null && cajasPagadas >= totalCajas;
  // Un contrato sin motor de cajas (Diario, o v1 sin inicializar) no se puede verificar: se deja
  // pasar para no bloquear una operación legítima, pero el aviso de abajo lo dice.
  const sinLedger = !contrato?.motor_v2 || totalCajas == null;
  const puedeCumplimiento = terminoDePagar || sinLedger;
  const MOTIVOS_VISIBLES = puedeCumplimiento ? MOTIVOS : MOTIVOS.filter(m => m.value !== "cumplimiento");

  // El empalme abierto significa que sus cifras viejas —ahorro y deuda que traía— NUNCA se
  // revisaron con él. La liquidación se FIRMA, así que firmar sobre números sin confirmar es un
  // problema. Se avisa fuerte y se deja seguir: la decisión es del que está con el cliente enfrente.
  const empalmeAbierto = !!contrato?.es_migrado && !contrato?.empalme_cerrado;

  // Quitar "cumplimiento" de la LISTA no basta: quien abre la ventana puede mandarlo como valor
  // inicial (ContratosView lo hacía para todo contrato Activo), y entonces el select se ve en otra
  // cosa mientras por dentro sigue en "cumplimiento" — y liquidaría regalando la moto igual.
  // Se corrige el valor, no solo lo que se ve.
  useEffect(() => {
    if (!puedeCumplimiento && motivo === "cumplimiento") setMotivo("retiro_voluntario");
  }, [puedeCumplimiento, motivo]);

  const motivoSel = MOTIVOS.find(m => m.value === motivo)!;
  // Contrato Activo = la moto todavía figura entregada al cliente. Hay que recibirla.
  const necesitaRecepcion = !!motoId && contrato?.estado === "Activo";

  async function subirFotos(): Promise<{ urls: string[]; fallidas: number }> {
    const urls: string[] = [];
    let fallidas = 0;
    for (const { key } of ANGULOS_FOTO) {
      const dataUrl = fotos[key];
      if (!dataUrl) continue;
      const blob = await (await fetch(dataUrl)).blob();
      const path = `recepciones/${motoId ?? contratoId}/${key}_${Date.now()}.jpg`;
      const { error: up } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (!up) {
        const { data } = supabase.storage.from("documentos").getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        fallidas++;
      }
    }
    return { urls, fallidas };
  }

  async function handleIniciar() {
    if (guardando) return;
    if (!profile) { setError("Sesión no válida."); return; }
    if (necesitaRecepcion) {
      const faltantes = ANGULOS_FOTO.filter(a => !fotos[a.key]);
      if (faltantes.length > 0) { setError(`Falta la foto: ${faltantes.map(a => a.label).join(", ")}.`); return; }
    }
    setError(null);
    setGuardando(true);
    try {
      if (necesitaRecepcion && motoId) {
        // 1. Evidencia primero: sin las 6 fotos la liquidación no tiene con qué sostener
        //    los daños que el taller reporte más adelante.
        const { urls, fallidas } = await subirFotos();
        if (fallidas > 0) { setError(`No se pudieron subir ${fallidas} foto(s). Revisa la conexión e intenta de nuevo — la recepción necesita las 6 fotos como respaldo.`); return; }

        // 2. Recepción del vehículo. Destino "taller" porque la liquidación manda la moto
        //    a revisión obligatoria; poner otra cosa diría lo contrario de lo que va a pasar.
        const { error: errRec } = await registrarRecepcion({
          moto_id: motoId,
          contrato_id: contratoId,
          cliente_id: clienteId,
          motivo: "liquidacion",
          condicion_general: condicion,
          descripcion_danos: danos || undefined,
          kilometros: kilometros ? Number(kilometros) : undefined,
          ubicacion_destino: "taller",
          quien_recibe: profile.id,
          nombre_entrega: clienteNombre,
          fotos: urls,
          observaciones: "Recibida para liquidar el contrato.",
        });
        if (errRec) { setError("Error al registrar la recepción: " + errRec); return; }

        // 3. El contrato deja de exigir cobro diario mientras corre la liquidación.
        const { error: errSusp } = await suspenderContrato(contratoId, motoId, "temporal");
        if (errSusp) { setError("La recepción quedó registrada, pero falló suspender el contrato: " + errSusp); return; }

        // 4. Mismo criterio que la entrega voluntaria: solo se cobra si hubo que ir a
        //    buscarla. Va ANTES de iniciar la liquidación para que entre en su detalle
        //    de deudas (iniciarLiquidacion lee las deudas pendientes al arrancar).
        if (fueBuscada) {
          const { error: errDeuda } = await registrarDeuda(
            contratoId, "multa_recoleccion", "Costo por movimiento de personal (recolección)", MULTA_RECOLECCION, profile.id,
          );
          if (errDeuda) { setError("La moto quedó recibida y el contrato suspendido, pero falló crear el costo de recolección: " + errDeuda); return; }
        }
      }

      const { error: err } = await iniciarLiquidacion(contratoId, clienteId, motoId, motivo, profile.id, ahorroAcumulado);
      if (err) {
        setError(necesitaRecepcion
          ? `La moto YA quedó recibida y el contrato suspendido — no lo repitas. Lo que falló fue abrir la liquidación: ${err}. Ábrela de nuevo desde este mismo botón.`
          : err);
        return;
      }
      setExito(true);
      setTimeout(() => { onDone?.(); onClose(); }, 1400);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 400 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: `min(${necesitaRecepcion ? 520 : 480}px, 96vw)`, background: "var(--card)", borderRadius: 20, padding: 24,
        zIndex: 401, boxShadow: "0 20px 60px rgba(15,23,42,0.22)", display: "grid", gap: 14, boxSizing: "border-box",
        maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>📄 Iniciar liquidación</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>
              {placa} · {clienteNombre}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "var(--muted)" }}>✕</button>
        </div>

        {necesitaRecepcion && (
          <>
            <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12.5, color: "var(--warn-ink)", fontWeight: 600, lineHeight: 1.5 }}>
              ⚠️ Esta moto todavía figura entregada al cliente. <strong>Primero recibámosla</strong> — con esto queda
              la prueba del estado en que llegó (el taller va a descontar daños del ahorro) y el contrato deja de
              cobrarle mientras corre la liquidación.
            </div>

            <div>
              <div style={labelStyle}>¿Cómo llegó la moto?</div>
              <div style={{ display: "grid", gap: 8 }}>
                {([[false, "🙋 La trajo el cliente", "Sin costo"], [true, "🚚 Se fue a buscar", `+ $${MULTA_RECOLECCION.toLocaleString("es-CO")} por movimiento de personal`]] as [boolean, string, string][]).map(([val, label, sub]) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setFueBuscada(val)}
                    style={{
                      textAlign: "left", padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                      border: fueBuscada === val ? "2px solid var(--accent)" : "1px solid var(--line2)",
                      background: fueBuscada === val ? "var(--accent-soft)" : "var(--card)",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: fueBuscada === val ? "var(--accent-ink)" : "var(--muted)" }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={labelStyle}>Condición general del vehículo</div>
              <select style={inputStyle} value={condicion} onChange={e => setCondicion(e.target.value as CondicionVehiculo)}>
                <option value="buena">Buena</option>
                <option value="regular">Regular</option>
                <option value="mala">Mala</option>
              </select>
            </div>

            <div>
              <div style={labelStyle}>Daños visibles (si aplica)</div>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 50 }} value={danos} onChange={e => setDanos(e.target.value)} placeholder="Describe los daños si los hay..." />
            </div>

            <div>
              <div style={labelStyle}>Kilometraje actual</div>
              <MoneyInput label="" value={kilometros} onChange={setKilometros} />
            </div>

            <div>
              <div style={labelStyle}>Fotos del estado de la moto (6 obligatorias — la última con la persona que entrega)</div>
              <GridFotosAngulos fotos={fotos} onChange={setFotos} />
            </div>
          </>
        )}

        {empalmeAbierto && (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bad-soft)", border: "1px solid var(--bad-line)", fontSize: 12.5, color: "var(--bad-ink)", fontWeight: 600, lineHeight: 1.5 }}>
            ⚠️ Este cliente <strong>nunca revisó sus cifras viejas</strong>: traía
            {" "}${(contrato?.ahorro_apertura ?? 0).toLocaleString("es-CO")} de ahorro de la migración,
            y su deuda de apertura tampoco se ha confirmado con él. Si liquidas ahora,
            <strong> cierras su cuenta sobre números que él nunca aceptó</strong> — y la liquidación se firma.
            Lo ideal es cerrarle el empalme primero, en Cartera.
          </div>
        )}

        <div>
          <div style={labelStyle}>Motivo de la liquidación</div>
          <select style={inputStyle} value={motivo} onChange={e => setMotivo(e.target.value as MotivoLiquidacion)}>
            {MOTIVOS_VISIBLES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{motivoSel.desc}</div>
          {!puedeCumplimiento && (
            <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 10, background: "var(--warn-soft)", border: "1px solid var(--warn-line)", fontSize: 12, color: "var(--warn-ink)", lineHeight: 1.5 }}>
              🔒 <strong>"Cumplimiento" no está disponible</strong>: va en la cuota {cajasPagadas} de {totalCajas}.
              Ese motivo le entrega la moto al cliente, y solo se puede usar cuando terminó de pagarlas todas.
            </div>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", fontSize: 12, color: "var(--accent-ink)" }}>
          Al {necesitaRecepcion ? "guardar: se registra la recepción de hoy, el contrato queda suspendido, " : "iniciar: "}
          las deudas pendientes y el convenio se traen automáticamente del sistema,
          {motoId ? " la moto entra a revisión de taller obligatoria (el mecánico la ve en su lista)," : ""} y el proceso
          sigue las 6 etapas hasta el documento firmado. El cálculo final del saldo y el cierre los hace ADMIN.
        </div>

        {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>{error}</div>}
        {exito && (
          <div style={{ color: "var(--ok-ink)", background: "var(--ok-soft)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
            ✅ {necesitaRecepcion ? "Moto recibida y liquidación iniciada" : "Liquidación iniciada"} — continúa en el módulo Liquidaciones.
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn, flex: 1 }}>Cancelar</button>
          <button onClick={handleIniciar} disabled={guardando || exito} style={{ ...primaryBtn, flex: 2, opacity: guardando || exito ? 0.6 : 1 }}>
            {guardando ? "Guardando..." : necesitaRecepcion ? "Recibir y liquidar" : "Iniciar liquidación"}
          </button>
        </div>
      </div>
    </>
  );
}
