import { useEffect, useState } from "react";
import { useLiquidaciones, type Liquidacion, type DetalleDano, type DetalleDeuda, type MotivoLiquidacion } from "../hooks/useLiquidaciones";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { usePagos, saldoAFavorDe } from "../hooks/usePagos";
import { useClientes } from "../hooks/useClientes";
import { useMotos, type Moto } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useTaller, type TallerItem } from "../hooks/useTaller";
import { useAuth } from "../contexts/AuthContext";
import { useScope } from "../contexts/SubadminScopeContext";
import { imprimirLiquidacion } from "../utils/generarDocumentoLiquidacion";
import { generarReciboEgresoLiquidacion } from "../utils/generarReciboEgresoLiquidacion";
import ModalFirmaLiquidacion from "../components/ModalFirmaLiquidacion";
import { ajusteSalidaLedger } from "../utils/cicloPago";
import { desgloseDeudas } from "../utils/desgloseLiquidacion";
import { plataQueEsDelCliente } from "../utils/cuentaLiquidacion";
import { hoyISO } from "../utils/fecha";
import { generarHTMLPazYSalvo } from "../hooks/useDocumentos";
import { recepcionDelContrato } from "../utils/recepcionDelContrato";
import MoneyInput from "../components/MoneyInput";

const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" };
const btn = (bg: string, color = "var(--card)"): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: 12, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 });
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line2)", fontSize: 13, outline: "none" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted2)", marginBottom: 4, display: "block" };

const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  iniciada: { label: "Iniciada", color: "var(--warn-ink)", bg: "var(--warn-soft)" },
  en_taller: { label: "En taller", color: "var(--indigo-ink)", bg: "var(--indigo-soft)" },
  calculada: { label: "Calculada", color: "var(--accent-ink)", bg: "var(--accent-soft)" },
  documento_generado: { label: "Doc. generado", color: "var(--violet)", bg: "var(--indigo-soft)" },
  firmada: { label: "Firmada", color: "var(--ok-ink)", bg: "var(--ok-soft)" },
  cerrada: { label: "Cerrada", color: "var(--muted3)", bg: "var(--soft)" },
};

const PASOS = ["iniciada", "en_taller", "calculada", "documento_generado", "firmada", "cerrada"];

const MOTIVO_LABEL: Record<MotivoLiquidacion, string> = {
  cumplimiento: "Cumplimiento de contrato",
  retiro_voluntario: "Retiro voluntario",
  incumplimiento: "Incumplimiento",
};

function Badge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: "var(--muted2)", bg: "var(--line)" };
  return <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700 }}>{cfg.label}</span>;
}

function Stepper({ estado }: { estado: string }) {
  const idx = PASOS.indexOf(estado);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", margin: "12px 0" }}>
      {PASOS.map((p, i) => {
        const cfg = ESTADO_CONFIG[p];
        const activo = i === idx;
        const pasado = i < idx;
        return (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              background: pasado ? "var(--ok2)" : activo ? cfg.bg : "var(--line)",
              color: pasado ? "var(--card)" : activo ? cfg.color : "var(--faint)",
              border: activo ? `2px solid ${cfg.color}` : "2px solid transparent",
            }}>
              {pasado ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 10, color: activo ? cfg.color : "var(--faint)", fontWeight: activo ? 700 : 400, display: "none" }}>{cfg.label}</span>
            {i < PASOS.length - 1 && <div style={{ width: 16, height: 2, background: pasado ? "var(--ok2)" : "var(--line)" }} />}
          </div>
        );
      })}
      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: ESTADO_CONFIG[estado]?.color }}>{ESTADO_CONFIG[estado]?.label}</span>
    </div>
  );
}

export default function LiquidacionesView() {
  const { profile } = useAuth();
  const role = profile?.role ?? "SECRETARIA";
  // SECRETARIA entra con el flujo COMPLETO, cierre incluido (decisión del dueño, 22-ago): ella
  // maneja la plata de oficina, el lector de huella está en su PC, y sin ella el cliente firmado
  // quedaba esperando a que un admin diera el clic del cierre. La RLS ya la dejaba desde la mig
  // 026 — solo esta pantalla la rebotaba (hallazgo de la auditoría del 12-ago).
  const esAdmin = role === "ADMIN" || role === "ADMIN_PRINCIPAL" || role === "SECRETARIA";

  const { filtrarMotos } = useScope();
  const { liquidaciones, loading, registrarRevisionTaller, calcularSaldo, marcarDocumentoGenerado, subirDocumentoFirmado, adjuntarFirmaACerrada, firmarDigital, volverACalcular, cambiarMotivo, confirmarCierre } = useLiquidaciones();
  const [firmando, setFirmando] = useState(false);
  const { clientes } = useClientes();
  const { motos: todasMotos } = useMotos();
  const { contratos } = useContratos();
  const { taller } = useTaller();
  const { recepciones } = useUbicaciones();
  const { pagos } = usePagos();
  const motos = filtrarMotos(todasMotos);

  // Se guarda el ID, NO el objeto. Guardar el objeto era una FOTOCOPIA: al seleccionar se copiaba
  // una vez y esa copia ya no cambiaba nunca. Entonces se le daba a "Registrar revisión y
  // calcular", la base se actualizaba de verdad... y la pantalla seguía mostrando el mismo paso,
  // como congelada. Es lo que reportó el dueño al intentar su primera liquidación.
  // Derivándolo de la lista, cada refresco se ve solo.
  const [selId, setSelId] = useState<string | null>(null);
  const sel = selId ? (liquidaciones.find(l => l.id === selId) ?? null) : null;
  const setSel = (l: Liquidacion | null) => setSelId(l?.id ?? null);

  // Estados formulario taller
  const [obsT, setObsT] = useState("");
  const [danos, setDanos] = useState<DetalleDano[]>([{ concepto: "", monto: 0 }]);
  const [deudas, setDeudas] = useState<DetalleDeuda[]>([{ concepto: "", monto: 0 }]);
  const [nombreResp, setNombreResp] = useState("");
  const [cargoResp, setCargoResp] = useState("");
  const [guardando, setGuardando] = useState(false);
  // El aviso lleva su tipo EXPLÍCITO. Antes se pintaba verde salvo que el texto contuviera la
  // palabra "error" — un fallo de red o de la BD salía en verde y el funcionario seguía como si
  // todo hubiera quedado guardado.
  const [msgState, setMsgState] = useState<{ texto: string; esError: boolean } | null>(null);
  const msg = msgState;
  const setMsg = (texto: string | null, esError = false) =>
    setMsgState(texto === null ? null : { texto, esError: esError || /^error|error:/i.test(texto) });
  // A 375px las dos columnas fijas (320px + detalle) partían la pantalla: mismo patrón de
  // isMobile que usan las demás vistas.
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // EL DÍA EN QUE SE GUARDÓ LA MOTO. Regla del dueño (19-ago): «se liquida hasta el día en que se
  // guardó o se retuvo el vehículo» — regla 9 del libro de cajas. Antes acá iba `hoyDate()`, así
  // que al cliente se le cobraban los días que la moto llevaba en la BODEGA DE LA EMPRESA, y la
  // cifra CAMBIABA según el día en que alguien abriera la pantalla: dos personas revisando la
  // misma liquidación veían números distintos.
  // Caso real (DANIEL DIAZ, RNG53H): contando hasta hoy le salían 8 semanas ($1.560.000) y
  // quedaba debiendo $662.000; contando hasta el día que se guardó, se le DEVUELVEN $313.000.
  const [fechaEntregaMoto, setFechaEntregaMoto] = useState("");
  // ¿La persona sigue con la empresa? Decide si al cerrar queda "Aprobado" (listo para otra moto)
  // o "Retirado". Se pregunta al cerrar, que es el momento en que se sabe con certeza.
  const [sigueConEmpresa, setSigueConEmpresa] = useState(false);

  // Se precarga con la recepción del vehículo, que es donde SÍ queda esa fecha cuando el
  // funcionario pasó por el formulario de las 6 fotos. Si no hay recepción —hoy 20 de las 44
  // retenidas no la tienen— el campo nace vacío y el ADMIN la escribe. Decisión del dueño:
  // sin fecha NO se deja calcular, porque cualquier otra cosa es adivinar con la plata del cliente.
  useEffect(() => {
    if (!sel) { setFechaEntregaMoto(""); return; }
    // La MISMA función que usa Inmovilizaciones, para que las dos pantallas no digan fechas
    // distintas de la misma moto. Está en un solo sitio y con pruebas porque decide la fecha de
    // corte: equivocarse es cobrarle semanas de más a uno o de menos a otro.
    const contratoLiq = contratos.find(ct => ct.id === sel.contrato_id);
    const rec = contratoLiq
      ? recepcionDelContrato(recepciones, contratoLiq, contratos.filter(x => x.moto_id === contratoLiq.moto_id))
      : null;
    setFechaEntregaMoto(rec ? rec.created_at.slice(0, 10) : "");
  }, [sel, recepciones, contratos]);

  // TRAER SOLA LA REVISIÓN DEL MECÁNICO. Antes él la escribía en su orden de Taller y aquí había
  // que RE-TECLEARLA: dos formularios para lo mismo. Nadie sabía que tenía que volver a copiarla,
  // y por eso hay 11 liquidaciones atascadas en "En taller" desde la LIQ-0001.
  // Se trae lo que él escribió (el detalle y los repuestos) y se deja EDITABLE.
  // OJO: el COSTO del taller NO se copia a los daños. Ese es lo que gastó la EMPRESA; los daños
  // son lo que se le cobra AL CLIENTE, y son dos decisiones distintas. Confundirlas sería
  // descontarle del ahorro el aceite y los frenos que la empresa asume.
  // Los daños y las deudas ya guardados se vuelven a cargar en el formulario. Sin esto, volver a
  // calcular arrancaba en blanco y se perdía lo que el funcionario ya había escrito.
  useEffect(() => {
    if (!sel) {
      setDanos([{ concepto: "", monto: 0 }]);
      setDeudas([{ concepto: "", monto: 0 }]);
      return;
    }
    setDanos(sel.detalle_danos?.length ? sel.detalle_danos : [{ concepto: "", monto: 0 }]);
    setDeudas(deudasEditables(sel));
  }, [selId]);

  useEffect(() => {
    if (!sel) { setObsT(""); return; }
    if (sel.observaciones_taller) { setObsT(sel.observaciones_taller); return; }
    const orden = sel.taller_id ? taller.find(t => t.id === sel.taller_id) : null;
    if (orden && orden.estado_tecnico === "Finalizado") {
      const partes = [orden.detalle?.trim(), orden.repuestos?.trim() ? `Repuestos: ${orden.repuestos.trim()}` : ""]
        .filter(Boolean);
      setObsT(partes.join("\n"));
    } else {
      setObsT("");
    }
  }, [sel, taller]);

  const activas = liquidaciones.filter((l) => l.estado !== "cerrada");
  const cerradas = liquidaciones.filter((l) => l.estado === "cerrada");

  /** Pagos confirmados del contrato — la base del saldo a favor. */
  function pagosDelContrato(contratoId: string) {
    return pagos.filter(p => p.contrato_id === contratoId && p.estado === "Confirmado");
  }

  /** La orden de taller que creó ESTA liquidación (se vincula en `taller_id` al iniciarla). */
  function ordenDe(l: Liquidacion): TallerItem | null {
    return l.taller_id ? (taller.find(t => t.id === l.taller_id) ?? null) : null;
  }

  function seleccionar(l: Liquidacion) {
    setSel(l);
    setMsg(null);
    // Si la liquidación aún no tiene revisión escrita, se PRECARGA con lo que puso el mecánico
    // en su orden de taller. Antes había que reescribir a mano lo mismo que él ya había
    // registrado, y la liquidación se quedaba en "en taller" aunque la orden estuviera
    // Finalizado — nadie entendía por qué. Se precarga, NO se da por hecho: el costo de daños
    // se descuenta del ahorro del cliente, así que alguien lo confirma antes de calcular.
    const orden = ordenDe(l);
    setObsT(l.observaciones_taller ?? (orden ? textoRevisionDe(orden) : ""));
    // Los DAÑOS se dejan en blanco a propósito. NO son lo que gastó el taller: son lo que se
    // le COBRA AL CLIENTE, y eso se le resta del ahorro (saldo = ahorro − deudas − daños).
    // Un cambio de frenos o de aceite lo gasta el taller pero NO se le cobra: es desgaste
    // normal del negocio. Solo se cobra lo que el cliente dañó (farol roto, abolladura).
    // Precargar el costo del taller aquí le habría cobrado al cliente hasta el mantenimiento.
    setDanos(l.detalle_danos.length > 0 ? l.detalle_danos : [{ concepto: "", monto: 0 }]);
    setDeudas(deudasEditables(l));
    setNombreResp(l.nombre_responsable ?? "");
    setCargoResp(l.cargo_responsable ?? "");
  }

  /** Arma el texto de observaciones a partir de lo que registró el mecánico. */
  function textoRevisionDe(o: TallerItem): string {
    const partes = [o.detalle?.trim()];
    if (o.repuestos?.trim()) partes.push(`Repuestos: ${o.repuestos.trim()}`);
    if (o.costo > 0) partes.push(`Costo de taller: $${o.costo.toLocaleString("es-CO")}`);
    return partes.filter(Boolean).join(" · ");
  }

  function clienteDe(liq: Liquidacion) {
    return clientes.find((c) => c.id === liq.cliente_id);
  }

  function motoDe(liq: Liquidacion) {
    return motos.find((m) => m.id === liq.moto_id) ?? null;
  }

  /**
   * Las deudas que el funcionario puede EDITAR: las que escribió una persona.
   *
   * Deja fuera las que pone el sistema al calcular (los días que rodó, su ahorro de esos días,
   * lo prepagado). Si se precargaran en el formulario, al volver a calcular se sumarían encima
   * de las que el cálculo genera de nuevo — se le cobraría dos veces.
   */
  function deudasEditables(l: Liquidacion): DetalleDeuda[] {
    const manuales = (l.detalle_deudas ?? []).filter(d => !d.auto);
    return manuales.length > 0 ? manuales : [{ concepto: "", monto: 0 }];
  }

  async function handleRegistrarTaller() {
    if (!sel) return;
    // Sin la fecha de entrega no se calcula. Es la decisión del dueño y no tiene atajo: el ajuste
    // de salida ES una función de esa fecha, así que "calcular sin ella" significa inventarla.
    if (!fechaEntregaMoto) {
      setMsg("Falta el día en que se guardó la moto. Sin esa fecha no se puede calcular: es hasta ahí que se le cobra.", true);
      return;
    }
    if (fechaEntregaMoto > hoyISO()) {
      setMsg("El día en que se guardó la moto no puede ser una fecha futura.", true);
      return;
    }
    // Un daño o una deuda con MONTO pero sin nombre antes se descartaba en silencio: el
    // funcionario digitaba $85.000 del farol, se le olvidaba el concepto, y esos $85.000
    // desaparecían de la cuenta sin ningún aviso.
    const sinNombre = [...danos, ...deudas].filter(d => Number(d.monto) > 0 && !d.concepto.trim());
    if (sinNombre.length > 0) {
      setMsg(`Hay ${sinNombre.length === 1 ? "un renglón" : sinNombre.length + " renglones"} con monto pero sin concepto (${sinNombre.map(d => `$${Number(d.monto).toLocaleString("es-CO")}`).join(", ")}). Escríbele qué es, o bórrale el monto — si se deja así, esa plata NO entra a la cuenta.`, true);
      return;
    }
    if (!confirm(`¿Registrar la revisión de taller y calcular el saldo?\n\nSe le va a cobrar hasta el ${new Date(fechaEntregaMoto + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}, que es el día en que se guardó la moto.`)) return;
    setGuardando(true);
    const danosValidos = danos.filter((d) => d.concepto.trim());
    const deudasValidas = deudas.filter((d) => d.concepto.trim());
    const totalDanos = danosValidos.reduce((s, d) => s + Number(d.monto), 0);
    // AJUSTE DE SALIDA (libro de cajas, regla 9): se cobra hasta el día en que ENTREGÓ la moto
    // —no hasta hoy— y lo prepagado no consumido se devuelve (porCobrar suma, aFavor resta).
    const contratoLiq = contratos.find(ct => ct.id === sel.contrato_id);
    const ajuste = contratoLiq ? ajusteSalidaLedger(contratoLiq, new Date(fechaEntregaMoto + "T12:00:00")) : { pagado: 0, consumido: 0, aFavor: 0, porCobrar: 0, ahorroPorCobrar: 0 };
    // El saldo a favor es plata que el cliente YA entregó: se le devuelve igual que el ahorro
    // (regla del dueño). Va en su propio renglón, no sumado al ahorro, para que la pantalla no
    // diga "ahorro" de un dinero que no es ahorro.
    const saldoFavor = contratoLiq ? saldoAFavorDe(contratoLiq, pagosDelContrato(sel.contrato_id)) : 0;
    // El ahorro que le corresponde de los días que se le cobran: de cada $31.000 diarios, $4.000
    // son suyos. Va sumado a lo que se le devuelve, no restado por dentro del cobro.
    const ahorroDeLosDias = ajuste.ahorroPorCobrar;
    // Los días que rodó sin pagar se cobran completos (porCobrar) y su parte de ahorro se le
    // devuelve (ahorroDeLosDias): el efecto neto es que la empresa cobra solo su tarifa.
    // El total y su explicación salen del MISMO sitio (desgloseDeudas), con prueba propia. Antes
    // el total llevaba el ajuste y el detalle no, así que el documento que el cliente FIRMA
    // mostraba renglones que no sumaban — a ANTONIO le faltaban $108.000 sin explicar.
    const desglose = desgloseDeudas({
      manuales: deudasValidas,
      porCobrar: ajuste.porCobrar,
      ahorroDeLosDias,
      prepagadoNoUsado: ajuste.aFavor,
    });
    const deudasAjustadas = desglose.total;
    const { error } = await registrarRevisionTaller(sel.id, obsT, danosValidos, totalDanos, desglose.renglones, deudasAjustadas);
    // Lo que le pertenece sale de `plataQueEsDelCliente` — la MISMA función que usa la ventana de
    // proyección. Antes esta pantalla hacía su propia suma aparte, y leía `ahorro_inicial`: un
    // campo revuelto que la migración de COSTA dejó en CERO en 64 contratos (a esos no se les
    // contaba NADA de base) y que en otros no coincide con el arqueo. El bueno es `base_inicial`.
    const renglonesFavor = contratoLiq ? plataQueEsDelCliente(contratoLiq) : [];
    const ahorroDelCliente = renglonesFavor.reduce((s, r) => s + r.monto, 0);
    await calcularSaldo(sel.id, ahorroDelCliente, deudasAjustadas, totalDanos, saldoFavor, renglonesFavor);
    setGuardando(false);
    if (error) setMsg(error, true);
    else if (ajuste.aFavor > 0 || ajuste.porCobrar > 0) {
      setMsg(`Revisión registrada. Ajuste de salida por cajas: ${ajuste.aFavor > 0 ? `$${ajuste.aFavor.toLocaleString("es-CO")} a favor del cliente (prepagado no consumido)` : ""}${ajuste.porCobrar > 0 ? `$${ajuste.porCobrar.toLocaleString("es-CO")} por cobrar (días consumidos sin pagar)` : ""} — ya incluido en el saldo.`);
    }
    else setMsg("Revisión registrada correctamente.");
  }

  async function handleGenerarDoc() {
    if (!sel || !nombreResp.trim()) { setMsg("Ingresa el nombre del responsable.", true); return; }
    if (!confirm("¿Generar el documento de liquidación con estos datos?")) return;
    setGuardando(true);
    const { error } = await marcarDocumentoGenerado(sel.id, nombreResp, cargoResp);
    setGuardando(false);
    if (error) { setMsg(error, true); return; }
    imprimirLiquidacion(sel, datosCliente(sel), datosMoto(sel));
  }

  // Los mismos datos, armados igual, para el documento / el borrador / el recibo de egreso.
  // Si cada llamada los armara por su lado, el borrador que el cliente lee podría traer un dato
  // distinto del que termina firmando.
  function datosCliente(l: Liquidacion) {
    const c = clienteDe(l);
    return { nombre: c?.nombre ?? "", cedula: (c as any)?.cedula, telefono: c?.telefono };
  }
  function datosMoto(l: Liquidacion) {
    const m = motoDe(l);
    return m ? { marca: (m as any).marca, modelo: (m as any).modelo, placa: m.placa } : null;
  }

  /** Reimprimir. Si ya firmó, sale CON su firma y su huella; si no, sale como borrador. */
  function handleReimprimir(l: Liquidacion) {
    const yaFirmo = !!l.firma_cliente_url;
    imprimirLiquidacion(l, datosCliente(l), datosMoto(l), {
      borrador: !yaFirmo,
      firmaUrl: l.firma_cliente_url,
      huellaUrl: l.huella_cliente_url,
      fechaFirma: l.fecha_firma,
    });
  }

  function handleReciboEgreso(l: Liquidacion) {
    const m = motoDe(l);
    const c = clienteDe(l);
    generarReciboEgresoLiquidacion(
      l,
      { nombre: c?.nombre ?? "", cedula: (c as any)?.cedula },
      m ? { placa: m.placa, grupo: (m as any).grupo } : null,
      profile?.nombre ?? "",
    );
  }

  async function handleSubirFirmado(file: File) {
    if (!sel) return;
    if (!confirm("¿Subir este documento firmado a la liquidación?")) return;
    setGuardando(true);
    const { error } = await subirDocumentoFirmado(sel.id, file);
    setGuardando(false);
    if (error) setMsg(error, true);
    else setMsg("Documento firmado subido correctamente.");
  }

  async function handleCambiarMotivo(motivo: MotivoLiquidacion) {
    if (!sel || guardando || motivo === sel.motivo) return;
    if (!confirm(`¿Cambiar el motivo a "${MOTIVO_LABEL[motivo]}"?\n\nEsto define qué pasa al cerrar: el estado del contrato, el destino de la moto y cómo queda el cliente.`)) return;
    setGuardando(true);
    const { error } = await cambiarMotivo(sel.id, motivo);
    setGuardando(false);
    setMsg(error ? "Error: " + error : `Motivo cambiado a "${MOTIVO_LABEL[motivo]}".`);
  }

  async function handleVolverACalcular() {
    if (!sel || guardando) return;
    if (!confirm("¿Volver al paso del cálculo para corregir la cuenta?\n\nEl documento que ya imprimiste queda sin valor: hay que generarlo de nuevo con las cifras corregidas.")) return;
    setGuardando(true);
    const { error } = await volverACalcular(sel.id);
    setGuardando(false);
    setMsg(error ? "Error: " + error : "Puedes corregir la cuenta. Al terminar, genera el documento otra vez.");
  }

  async function handleFirmaTardia(file: File) {
    if (!sel || guardando) return;
    if (!confirm("¿Adjuntar este documento firmado a la liquidación ya cerrada?")) return;
    setGuardando(true);
    const { error } = await adjuntarFirmaACerrada(sel.id, file);
    setGuardando(false);
    if (error) setMsg("Error al subir el documento: " + error);
    else {
      setMsg("Documento firmado adjuntado. La liquidación queda completa.");
      setSel(liquidaciones.find(l => l.id === sel.id) ?? null);
    }
  }

  async function handleCerrar() {
    if (!sel || !profile) return;
    if (!confirm(
      "¿Cerrar definitivamente esta liquidación?\n\n"
      + "Se define el saldo final, se cierra el contrato, se saldan sus deudas y su convenio, y se decide el destino de la moto. No se puede deshacer.\n\n"
      + (sigueConEmpresa
          ? "Marcaste que el cliente SIGUE con la empresa: va a quedar listo para su contrato nuevo."
          : "El cliente va a quedar Retirado. Si le vas a entregar otra moto, cancela y marca la casilla antes de cerrar.")
    )) return;
    setGuardando(true);
    const { error, avisoDeuda } = await confirmarCierre(sel.id, profile.id, sigueConEmpresa);
    setGuardando(false);
    if (error) setMsg(error, true);
    else {
      // Si el ahorro no alcanzó, se dice cuánto quedó debiendo y que esa plata sigue viva. Antes
      // solo decía "Liquidación cerrada" y nadie sabía que el cliente quedaba con una deuda.
      setMsg(avisoDeuda
        ? `Liquidación cerrada. ${avisoDeuda}`
        : "Liquidación cerrada. Sus deudas y su convenio quedaron saldados.");
      setSel(null);
    }
  }

  // Paz y Salvo — constancia de cumplimiento y transferencia de la moto al cliente.
  function handlePazYSalvo() {
    if (!sel) return;
    // Doble candado con el del render: el papel dice "no debe nada" y tiene que ser verdad.
    if (sel.saldo_final < 0) { setMsg("No se puede imprimir el Paz y Salvo: el cliente quedó debiendo.", true); return; }
    const cliente = clienteDe(sel);
    const contrato = contratos.find(ct => ct.id === sel.contrato_id);
    if (!cliente || !contrato) { setMsg("No se encontró el cliente o el contrato.", true); return; }
    const moto = motoDe(sel);
    const html = generarHTMLPazYSalvo(contrato, cliente, (moto as Moto | null));
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Paz y Salvo</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
    w.document.close();
    w.print();
  }

  if (!esAdmin) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Acceso restringido a administradores.</div>;
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Cargando...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : (sel ? "320px 1fr" : "1fr"), gap: 16 }}>
      {/* En el celular no caben las dos columnas: con un detalle abierto se muestra SOLO el
          detalle, con su botón de volver — el mismo patrón lista→detalle del resto de la app. */}
      {isMobile && sel && (
        <button onClick={() => setSel(null)}
          style={{ ...btn("var(--soft2)", "var(--text)"), border: "1px solid var(--line)", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
          ← Volver a la lista
        </button>
      )}
      {/* Lista */}
      {!(isMobile && sel) && (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {activas.length === 0 && cerradas.length === 0 && (
          <div style={{ ...card, color: "var(--muted)", textAlign: "center" }}>No hay liquidaciones registradas.</div>
        )}

        {activas.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>En proceso ({activas.length})</div>
            {activas.map((l) => {
              const cliente = clienteDe(l);
              return (
                <div key={l.id} onClick={() => seleccionar(l)} style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: sel?.id === l.id ? "var(--accent-soft4)" : "var(--soft2)", marginBottom: 8, border: sel?.id === l.id ? "2px solid var(--accent)" : "2px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{l.numero}</span>
                    <Badge estado={l.estado} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"} · {MOTIVO_LABEL[l.motivo]}</div>
                </div>
              );
            })}
          </div>
        )}

        {cerradas.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: "var(--muted)" }}>Cerradas ({cerradas.length})</div>
            {cerradas.map((l) => {
              const cliente = clienteDe(l);
              return (
                <div key={l.id} onClick={() => seleccionar(l)} style={{ padding: "10px 12px", borderRadius: 12, cursor: "pointer", background: sel?.id === l.id ? "var(--soft2)" : "transparent", marginBottom: 6, border: sel?.id === l.id ? "2px solid var(--line)" : "2px solid transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--muted)" }}>{l.numero}</span>
                    <Badge estado={l.estado} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2, textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Detalle */}
      {sel && (() => {
        const cliente = clienteDe(sel);
        // "Cumplimiento" le ENTREGA la moto al cliente: solo se ofrece si el ledger dice que llenó
        // todas sus cajas. Sin ledger (Diario, o migrado v1) no se puede verificar y se deja pasar.
        const ctoSel = contratos.find(ct => ct.id === sel.contrato_id);
        const termino = !ctoSel?.motor_v2 || ctoSel?.total_cajas == null
          || (ctoSel.cajas_pagadas ?? 0) >= ctoSel.total_cajas;
        motoDe(sel);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{sel.numero}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>{cliente?.nombre ?? "—"}</div>
                  {/* El motivo se puede CORREGIR mientras el cliente no haya firmado. Decide todo
                      lo que pasa al cerrar —si el contrato queda Finalizado o Cancelado, si la moto
                      vuelve a la flota o pasa a ser del cliente, y cómo queda él—, y elegirlo mal
                      obligaba a anular la liquidación entera... que tampoco se puede.
                      "Cumplimiento" solo aparece si terminó de pagar: es el que le entrega la moto. */}
                  {(sel.estado === "iniciada" || sel.estado === "en_taller" || sel.estado === "calculada" || sel.estado === "documento_generado") ? (
                    <div style={{ marginTop: 6 }}>
                      <select value={sel.motivo} onChange={e => handleCambiarMotivo(e.target.value as MotivoLiquidacion)}
                        disabled={guardando}
                        style={{ ...inputStyle, padding: "6px 10px", fontSize: 12.5, width: "auto", minWidth: 210 }}>
                        {(["retiro_voluntario", "incumplimiento", "cumplimiento"] as MotivoLiquidacion[])
                          .filter(mv => mv !== "cumplimiento" || termino)
                          .map(mv => <option key={mv} value={mv}>{MOTIVO_LABEL[mv]}</option>)}
                      </select>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                        {sel.motivo === "cumplimiento"
                          ? "La moto pasa a ser del cliente · Paz y Salvo · queda Egresado"
                          : sel.motivo === "incumplimiento"
                            ? "Contrato Cancelado · la moto vuelve a la flota"
                            : "Contrato Finalizado · la moto vuelve a la flota"}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "uppercase" }}>{MOTIVO_LABEL[sel.motivo]}</div>
                  )}
                </div>
                <button onClick={() => setSel(null)} style={btn("var(--line)", "var(--muted2)")}>✕</button>
              </div>
              <Stepper estado={sel.estado} />

              {/* Resumen financiero */}
              <div style={{ background: "var(--soft2)", borderRadius: 12, padding: 12, marginTop: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--muted)" }}>Ahorro acumulado</span><span style={{ fontWeight: 600, color: "var(--ok)" }}>${sel.ahorro_acumulado.toLocaleString("es-CO")}</span></div>
                {/* Renglón propio, no sumado al ahorro: es plata del cliente pero NO es su ahorro,
                    y una cifra correcta con la etiqueta equivocada ya nos costó caro antes. */}
                {(sel.saldo_favor ?? 0) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "var(--muted)" }}>Saldo a favor</span>
                    <span style={{ fontWeight: 600, color: "var(--ok)" }}>+ ${(sel.saldo_favor ?? 0).toLocaleString("es-CO")}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--muted)" }}>Total deudas</span><span style={{ fontWeight: 600, color: "var(--bad)" }}>- ${sel.total_deudas.toLocaleString("es-CO")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: "var(--muted)" }}>Costo daños</span><span style={{ fontWeight: 600, color: "var(--bad)" }}>- ${sel.costo_danos.toLocaleString("es-CO")}</span></div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Saldo final</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: sel.saldo_final >= 0 ? "var(--ok)" : "var(--bad)" }}>
                    {sel.saldo_final >= 0 ? `$${sel.saldo_final.toLocaleString("es-CO")} a favor` : `$${Math.abs(sel.saldo_final).toLocaleString("es-CO")} pendiente`}
                  </span>
                </div>
              </div>
            </div>

            {msg && <div style={{ ...card, background: msg.esError ? "var(--bad-soft)" : "var(--ok-soft)", color: msg.esError ? "var(--bad)" : "var(--ok)", fontSize: 13 }}>{msg.esError ? "⚠️ " : ""}{msg.texto}</div>}

            {/* Paso: registrar revisión taller */}
            {/* La cuenta se puede rehacer mientras el cliente NO haya firmado. Antes, apenas se
                calculaba una vez, el formulario desaparecía y no había forma de corregir: ni si el
                mecánico encontraba algo más, ni si el funcionario se equivocó en un daño. Después
                de "firmada" ya no se toca — ahí el cliente firmó un número. */}
            {(sel.estado === "iniciada" || sel.estado === "en_taller" || sel.estado === "calculada") && (
              <div style={card}>
                {/* PRIMERO la fecha: es lo que decide toda la cuenta. Va arriba de la revisión
                    porque si se pone abajo, el funcionario llena los daños y se estrella al final. */}
                <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: fechaEntregaMoto ? "var(--accent-soft4)" : "var(--warn-soft)", border: `1px solid ${fechaEntregaMoto ? "var(--accent-line)" : "var(--warn-line)"}` }}>
                  <label style={{ ...label, color: fechaEntregaMoto ? "var(--accent-ink)" : "var(--warn-ink)" }}>
                    ¿Qué día se guardó la moto?
                  </label>
                  <input type="date" value={fechaEntregaMoto} max={hoyISO()}
                    onChange={e => setFechaEntregaMoto(e.target.value)}
                    style={{ ...inputStyle, marginBottom: 6 }} />
                  <div style={{ fontSize: 12, color: fechaEntregaMoto ? "var(--accent-ink)" : "var(--warn-ink)", lineHeight: 1.5 }}>
                    {fechaEntregaMoto
                      ? <>Se le cobra <strong>hasta ese día</strong>. Los días que la moto lleva en la bodega no se le cobran.</>
                      : <>No hay recepción registrada para esta moto, así que <strong>hay que escribir la fecha</strong>. Sin ella no se puede calcular: es hasta ahí que se le cobra.</>}
                  </div>
                </div>

                <div style={{ fontWeight: 700, marginBottom: 12 }}>Revisión de taller</div>

                {/* Estado REAL de la orden del mecánico. Sin esto, la liquidación decía
                    "En taller" aunque él ya hubiera terminado, y nadie sabía qué faltaba. */}
                {(() => {
                  const o = ordenDe(sel);
                  if (!o) return (
                    <div style={{ fontSize: 12.5, background: "var(--soft)", color: "var(--muted2)", borderRadius: 10, padding: "9px 11px", marginBottom: 12 }}>
                      Esta liquidación no tiene orden de taller vinculada. Escribe abajo lo que se revisó.
                    </div>
                  );
                  const listo = o.estado_tecnico === "Finalizado";
                  return (
                    <div style={{ fontSize: 12.5, borderRadius: 10, padding: "9px 11px", marginBottom: 12,
                      background: listo ? "var(--ok-soft)" : "var(--warn-soft)",
                      color: listo ? "var(--ok-ink)" : "var(--warn-ink)" }}>
                      {listo ? (
                        <>✓ <strong>El mecánico ya terminó la revisión.</strong> Lo que él escribió ya está abajo — revísalo y complétalo si hace falta.</>
                      ) : (
                        <>⏳ <strong>El mecánico aún no termina</strong> (va en «{o.estado_tecnico}»).
                        Puedes esperar a que cierre su orden en Taller, o escribir la revisión aquí si ya la tienes.</>
                      )}
                      {o.costo > 0 && (
                        <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid currentColor", opacity: 0.9 }}>
                          El taller gastó <strong>${o.costo.toLocaleString("es-CO")}</strong>
                          {o.repuestos?.trim() ? ` (${o.repuestos.trim()})` : ""}. Eso es lo que le costó a la
                          empresa — <strong>no</strong> es lo que se le cobra al cliente.
                        </div>
                      )}
                    </div>
                  );
                })()}

                <label style={label}>Observaciones</label>
                <textarea value={obsT} onChange={(e) => setObsT(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} placeholder="Estado del vehículo, observaciones..." />

                <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 13 }}>Daños que se le cobran al cliente</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginBottom: 8 }}>
                  Solo lo que el cliente dañó (farol roto, abolladura). El desgaste normal —frenos,
                  aceite, llantas— lo asume la empresa y va aquí en <strong>$0</strong>.
                  Esto <strong>se le resta de su ahorro</strong>.
                </div>
                {danos.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Concepto" value={d.concepto} onChange={(e) => setDanos(danos.map((x, j) => j === i ? { ...x, concepto: e.target.value } : x))} />
                    <MoneyInput style={{ flex: 1 }} value={d.monto ? String(d.monto) : ""} onChange={v => setDanos(danos.map((x, j) => j === i ? { ...x, monto: Number(v) || 0 } : x))} />
                    {danos.length > 1 && <button style={btn("var(--bad-soft)", "var(--bad)")} onClick={() => setDanos(danos.filter((_, j) => j !== i))}>✕</button>}
                  </div>
                ))}
                <button style={{ ...btn("var(--soft)", "var(--muted2)"), marginBottom: 14, fontSize: 12 }} onClick={() => setDanos([...danos, { concepto: "", monto: 0 }])}>+ Agregar daño</button>

                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Deudas pendientes</div>
                {deudas.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...inputStyle, flex: 2 }} placeholder="Concepto" value={d.concepto} onChange={(e) => setDeudas(deudas.map((x, j) => j === i ? { ...x, concepto: e.target.value } : x))} />
                    <MoneyInput style={{ flex: 1 }} value={d.monto ? String(d.monto) : ""} onChange={v => setDeudas(deudas.map((x, j) => j === i ? { ...x, monto: Number(v) || 0 } : x))} />
                    {deudas.length > 1 && <button style={btn("var(--bad-soft)", "var(--bad)")} onClick={() => setDeudas(deudas.filter((_, j) => j !== i))}>✕</button>}
                  </div>
                ))}
                <button style={{ ...btn("var(--soft)", "var(--muted2)"), marginBottom: 14, fontSize: 12 }} onClick={() => setDeudas([...deudas, { concepto: "", monto: 0 }])}>+ Agregar deuda</button>

                {/* Lo que pone el sistema al calcular. Va aparte y sin poder editarse: si el
                    funcionario ve "Total deudas $108.000" con su formulario vacío, la pantalla le
                    está escondiendo de dónde sale la cifra que el cliente va a firmar. */}
                {(() => {
                  const auto = (sel.detalle_deudas ?? []).filter(d => d.auto);
                  if (auto.length === 0) return null;
                  return (
                    <div style={{ padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)", marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 6 }}>
                        Lo que calculó el sistema por los días de la moto
                      </div>
                      {auto.map((d, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, marginBottom: 3 }}>
                          <span style={{ minWidth: 0, color: "var(--muted)" }}>{d.concepto}</span>
                          <span style={{ fontWeight: 700, flexShrink: 0, color: d.monto < 0 ? "var(--ok-ink)" : "var(--text)" }}>
                            {d.monto < 0 ? "+" : "−"} ${Math.abs(d.monto).toLocaleString("es-CO")}
                          </span>
                        </div>
                      ))}
                      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>
                        Sale del día que pusiste arriba. Estos renglones no se escriben a mano — se recalculan solos y aparecen en el documento del cliente.
                      </div>
                    </div>
                  );
                })()}

                <button style={btn("var(--accent)")} onClick={handleRegistrarTaller} disabled={guardando}>
                  {guardando ? "Guardando..." : "Registrar revisión y calcular"}
                </button>
              </div>
            )}

            {/* Paso: generar documento */}
            {sel.estado === "calculada" && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>Generar documento de liquidación</div>
                <label style={label}>Nombre del responsable (empresa)</label>
                <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Ej: Carlos Martínez" value={nombreResp} onChange={(e) => setNombreResp(e.target.value)} />
                <label style={label}>Cargo</label>
                <input style={{ ...inputStyle, marginBottom: 14 }} placeholder="Ej: Gerente" value={cargoResp} onChange={(e) => setCargoResp(e.target.value)} />
                <button style={btn("var(--violet)")} onClick={handleGenerarDoc} disabled={guardando}>
                  {guardando ? "Generando..." : "Generar e imprimir documento"}
                </button>
              </div>
            )}

            {/* Paso: subir documento firmado */}
            {sel.estado === "documento_generado" && (
              <div style={card}>
                {/* Salida de emergencia: el documento ya se imprimió pero el cliente NO ha firmado.
                    Si al revisarlo con él aparece un error, hay que poder devolverse — antes esto
                    era un callejón sin salida. */}
                <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "var(--soft2)", border: "1px solid var(--line)", fontSize: 12.5, color: "var(--muted2)", lineHeight: 1.5 }}>
                  ¿Al revisarlo con el cliente encontraste un error en la cuenta?{" "}
                  <button onClick={handleVolverACalcular} disabled={guardando}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", fontWeight: 700, color: "var(--accent)", textDecoration: "underline" }}>
                    Corregir la cuenta
                  </button>
                  {" "}— vuelve al paso del cálculo. Todavía puedes, porque aún no ha firmado.
                </div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Firma del cliente</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
                  Primero le muestras la cuenta —en pantalla o impresa— y solo cuando esté de acuerdo firma.
                </div>
                <button style={{ ...btn("var(--ok)"), width: "100%", padding: "12px 16px", fontSize: 14 }} onClick={() => setFirmando(true)}>
                  ✍️ Firmar en pantalla (firma + huella)
                </button>

                {/* El papel sigue disponible a propósito: el lector de huella solo trabaja en el PC
                    de la oficina y ya ha fallado antes. Si falla, no se puede quedar trancada una
                    liquidación con el cliente ahí parado. */}
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                    ¿El lector no responde o el cliente prefiere el papel? Imprime, que firme a mano y sube la foto.
                  </div>
                  {sel.documento_firmado_url && (
                    <div style={{ marginBottom: 10 }}>
                      <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13 }}>Ver documento actual</a>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button style={{ ...btn("var(--soft2)", "var(--text)"), border: "1px solid var(--line)" }} onClick={() => handleReimprimir(sel)}>
                      🖨️ Imprimir
                    </button>
                    <label style={{ ...btn("var(--accent)"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      📷 Cámara
                      <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirFirmado(f); }} />
                    </label>
                    <label style={{ ...btn("var(--muted3)"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      🖼 Galería / PDF
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubirFirmado(f); }} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Reimprimir y recibo de egreso — disponibles desde que hay cuenta calculada, y
                sobre todo cuando ya está CERRADA: antes una liquidación cerrada no se podía
                volver a imprimir, así que el cliente que perdía su copia se quedaba sin ella. */}
            {sel.estado !== "iniciada" && sel.estado !== "en_taller" && (
              <div style={{ ...card, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button style={{ ...btn("var(--soft2)", "var(--text)"), border: "1px solid var(--line)" }} onClick={() => handleReimprimir(sel)}>
                  🖨️ {sel.firma_cliente_url ? "Reimprimir documento firmado" : "Imprimir documento"}
                </button>
                {sel.saldo_final > 0 && (
                  <button style={{ ...btn("var(--soft2)", "var(--text)"), border: "1px solid var(--line)" }} onClick={() => handleReciboEgreso(sel)}>
                    🧾 Recibo de egreso ({motoDe(sel)?.grupo ?? "sin portafolio"})
                  </button>
                )}
              </div>
            )}

            {/* Paso: confirmar cierre */}
            {sel.estado === "firmada" && (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Confirmar cierre de liquidación</div>
                {sel.documento_firmado_url && (
                  <div style={{ marginBottom: 12 }}>
                    <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13 }}>Ver documento firmado</a>
                  </div>
                )}
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
                  Al confirmar: el contrato quedará <strong>{sel.motivo === "incumplimiento" ? "Cancelado" : "Finalizado"}</strong>
                  {sel.motivo === "cumplimiento" ? ", la moto pasará a En traspaso (propiedad del cliente) y el cliente quedará Egresado" : ""}
                  {sel.saldo_final < 0 ? " y el cliente será marcado en lista negra por saldo pendiente" : ""}.
                </div>
                {/* Sin esto, el cliente quedaba "Retirado" y el wizard dejaba de ofrecerlo — así
                    que liquidar para pasarlo a otra moto lo dejaba trancado. Regla del dueño: la
                    liquidación ES el camino para cambiar de moto, no un rodeo. */}
                {sel.motivo !== "cumplimiento" && (
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, marginBottom: 14, cursor: "pointer",
                    background: sigueConEmpresa ? "var(--accent-soft)" : "var(--soft2)",
                    border: `1px solid ${sigueConEmpresa ? "var(--accent-line)" : "var(--line)"}` }}>
                    <input type="checkbox" checked={sigueConEmpresa} onChange={e => setSigueConEmpresa(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", display: "block" }}>
                        Este cliente sigue con la empresa
                      </span>
                      <span style={{ fontSize: 12, color: sigueConEmpresa ? "var(--accent-ink)" : "var(--muted)", lineHeight: 1.45 }}>
                        Márcalo si se le va a entregar otra moto. Queda listo para su contrato nuevo.
                        Si no lo marcas queda Retirado y el wizard no lo va a ofrecer.
                      </span>
                    </span>
                  </label>
                )}
                <button style={btn(sel.saldo_final < 0 ? "var(--bad)" : "var(--ok)")} onClick={handleCerrar} disabled={guardando}>
                  {guardando ? "Cerrando..." : "Confirmar y cerrar liquidación"}
                </button>
              </div>
            )}

            {sel.estado === "cerrada" && (
              <div style={{ ...card, background: sel.documento_firmado_url ? "var(--ok-soft)" : "var(--warn-soft)", color: sel.documento_firmado_url ? "var(--ok-ink)" : "var(--warn-ink)", fontWeight: 700, textAlign: "center" }}>
                {sel.documento_firmado_url ? "Liquidación cerrada" : "Liquidación cerrada — SIN FIRMA del cliente"}
                {sel.documento_firmado_url && (
                  <div style={{ marginTop: 8 }}>
                    <a href={sel.documento_firmado_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: 13, fontWeight: 400 }}>Descargar documento firmado</a>
                  </div>
                )}
                {/* Si se cerró sin firma y el cliente aparece después, aquí se completa. Pasa de
                    verdad: hay que cerrar un día porque la moto se necesita, y él llega al
                    siguiente. Antes no había puerta y quedaba "sin firma" para siempre. */}
                {!sel.documento_firmado_url && (
                  <div style={{ marginTop: 10, fontWeight: 400 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 10 }}>
                      El cierre ya se aplicó. Si el cliente aparece y firma, súbelo acá y queda completa —
                      el documento es el respaldo de la cuenta que se le hizo.
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <label style={{ ...btn("var(--accent)"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        📷 Cámara
                        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFirmaTardia(f); }} />
                      </label>
                      <label style={{ ...btn("var(--muted3)"), display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        🖼 Galería / PDF
                        <input type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleFirmaTardia(f); }} />
                      </label>
                    </div>
                  </div>
                )}
                {/* El Paz y Salvo dice que el cliente NO debe nada. Si el saldo quedó negativo
                    (debe y quizás hasta en lista negra), imprimirlo sería darle un papel firmado
                    que contradice su propia liquidación. */}
                {sel.motivo === "cumplimiento" && (sel.saldo_final >= 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <button style={btn("var(--accent)")} onClick={handlePazYSalvo}>🖨️ Imprimir Paz y Salvo</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 10, background: "var(--warn-soft)", color: "var(--warn-ink)", fontSize: 12.5, lineHeight: 1.5 }}>
                    Quedó debiendo ${Math.abs(sel.saldo_final).toLocaleString("es-CO")} — no hay Paz y Salvo hasta que esa deuda se pague. El Paz y Salvo declara que no debe nada, y no es cierto.
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {firmando && sel && (
        <ModalFirmaLiquidacion
          liq={sel}
          cliente={datosCliente(sel)}
          moto={datosMoto(sel)}
          huellaRegistroUrl={clienteDe(sel)?.autorizacion_datos_huella_url ?? null}
          onCerrar={() => setFirmando(false)}
          onFirmar={(firma, huella, html) => firmarDigital(sel.id, firma, huella, html)}
        />
      )}
    </div>
  );
}
