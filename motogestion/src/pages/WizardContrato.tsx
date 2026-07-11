import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";
import type { Contrato, FormaPago } from "../hooks/useContratos";
import { calcularFechaFinContrato, useContratos } from "../hooks/useContratos";
import { generarHTMLContrato, generarHTMLPagare, generarHTMLCertificado, type FirmasDoc } from "../hooks/useDocumentos";
import { htmlAPdfBlob, urlADataUrl } from "../utils/pdf";
import MoneyInput from "../components/MoneyInput";
import CanvasFirma from "../components/CanvasFirma";
import LectorHuella from "../components/LectorHuella";
import ModalConvenio from "../components/ModalConvenio";
import { calcularProrrateoInicial, proximoDiaPago } from "../utils/cicloPago";
import { hoyISO } from "../utils/fecha";
import { ANGULOS_FOTO, IconoAngulo, type AnguloFoto } from "../components/FotosAngulos";

type Props = {
  clientes: Cliente[];
  motos: Moto[];
  contratos: Contrato[];
  contratoInicial?: Contrato;
  stepInicial?: number;
  onClose: () => void;
  onCompletado: () => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: 12, border: "1px solid #cbd5e1",
  outline: "none", fontSize: 14, boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = { marginBottom: 5, fontSize: 13, fontWeight: 700, color: "#334155", display: "block" };
const btnPrimary: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: 12, border: "none",
  background: "linear-gradient(90deg,#0284c7,#0369a1)", color: "white",
  fontWeight: 800, fontSize: 14, cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "12px 18px", borderRadius: 12, border: "1px solid #e2e8f0",
  background: "white", fontWeight: 700, cursor: "pointer", color: "#64748b", fontSize: 13,
};

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

const CHECKLIST = [
  "Luces delanteras funcionando",
  "Luces traseras funcionando",
  "Frenos funcionando correctamente",
  "Espejos completos",
  "Llantas en buen estado",
  "Tanque con combustible",
  "Prueba de sirena activada",
  "Prueba de apagado remoto",
  "Sin daños visibles",
];


// Prorrateo del primer pago: día entrega NO incluido, primer día de pago SÍ incluido.
// Usa el ciclo compartido (cicloPago.ts) — funciona igual para día de semana (Semanal)
// y fechas de calendario (Quincenal/Mensual).
function calcPrimerPago(
  fecha: string,
  contratoParcial: { forma_pago: FormaPago; dia_pago: string; dias_pago_mes: number[] },
  pagoDiaLS: number,
  pagoDiaDom: number,
) {
  const ctx = { ...contratoParcial, fecha_entrega: fecha, tarifa_diaria: pagoDiaLS, ahorro_diario: 0, tarifa_domingo: pagoDiaDom, ahorro_domingo: 0 };
  const valor = calcularProrrateoInicial(ctx);
  const base = new Date(fecha + "T00:00:00");
  const objetivo = proximoDiaPago(ctx, base);
  const dias = Math.round((objetivo.getTime() - base.getTime()) / 86400000);
  return { dias, fecha: objetivo.toISOString().slice(0, 10), valor };
}

const PASOS_LABELS = ["Datos", "Moto", "Contrato", "Pagaré", "Certificado", "Entrega"];

export default function WizardContrato({ clientes, motos, contratos, contratoInicial, stepInicial, onClose, onCompletado }: Props) {
  const { eliminarContratoEnProceso } = useContratos();
  const [step, setStep] = useState(stepInicial ?? 1);
  const [contratoId, setContratoId] = useState<string | null>(contratoInicial?.id ?? null);
  const [contratoData, setContratoData] = useState<Contrato | null>(contratoInicial ?? null);
  const [motoId, setMotoId] = useState<string | null>(contratoInicial?.moto_id ?? null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  // Convenio obligatorio cuando la base inicial quedó incompleta al crear el contrato.
  const [convenioPendiente, setConvenioPendiente] = useState<{ contratoId: string; falta: number } | null>(null);

  async function handleCancelarYEliminar() {
    if (!contratoId || !contratoData || eliminando) return;
    if (!confirm("¿Eliminar este intento de contrato? Se borrará por completo (moto liberada, fotos/firmas eliminadas). No se puede deshacer.")) return;
    setEliminando(true);
    try {
      const { error: err } = await eliminarContratoEnProceso({ ...contratoData, moto_id: motoId });
      if (err) { setError(err); return; }
      onClose();
    } finally {
      setEliminando(false);
    }
  }
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Step 1 form
  const hoy = hoyISO();
  const [form, setForm] = useState({
    cliente_id: contratoInicial?.cliente_id ?? "",
    forma_pago: (contratoInicial?.forma_pago ?? "Semanal") as FormaPago,
    tarifa_ls: String(contratoInicial?.tarifa_diaria ?? 27000),
    tarifa_dom: String(contratoInicial?.tarifa_domingo ?? 14000),
    ahorro_ls: String(contratoInicial?.ahorro_diario ?? 4000),
    ahorro_dom: String(contratoInicial?.ahorro_domingo ?? 2000),
    dia_pago: contratoInicial?.dia_pago ?? "Lunes",
    dias_pago_mes: contratoInicial?.dias_pago_mes ?? ([] as number[]),
    meses: String(contratoInicial?.meses ?? ""),
    ahorro_inicial: String(contratoInicial?.ahorro_inicial ?? ""),
    fecha_entrega: contratoInicial?.fecha_entrega ?? hoy,
  });

  // Step 2 moto
  const [motoBusqueda, setMotoBusqueda] = useState("");

  // Steps 3-4 firmas
  const [firmaContrato, setFirmaContrato] = useState<string | null>(null);
  const [firmaContratoAcomp, setFirmaContratoAcomp] = useState<string | null>(null);
  const [leido3, setLeido3] = useState(false);
  const [firmaPagare, setFirmaPagare] = useState<string | null>(null);
  const [firmaPagareAcomp, setFirmaPagareAcomp] = useState<string | null>(null);
  const [leido4, setLeido4] = useState(false);
  // Huellas (se comparten entre contrato y pagaré — misma persona, mismo dedo).
  // Cliente: se reutiliza la del registro; solo si falta se captura fresca aquí.
  // Acompañante: se captura en el momento de firmar.
  const [huellaClienteFresh, setHuellaClienteFresh] = useState<string | null>(null);
  const [huellaAcompanante, setHuellaAcompanante] = useState<string | null>(null);

  // Step 5 certificado
  const [fotoCert, setFotoCert] = useState<File | null>(null);
  const inputCertCamRef = useRef<HTMLInputElement>(null);
  const inputCertGalRef = useRef<HTMLInputElement>(null);

  // Step 6 entrega
  const [kmInicial, setKmInicial] = useState("");
  const [fotosEntrega, setFotosEntrega] = useState<Partial<Record<AnguloFoto, File>>>({});
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST.map(() => false));

  const clienteActual = clientes.find(c => c.id === (contratoData?.cliente_id ?? form.cliente_id));
  const motoActual = motos.find(m => m.id === motoId);
  const clientesAprobados = clientes.filter(c => {
    if (c.estado !== "Aprobado") return false;
    const tieneContrato = contratos.some(ct => ct.cliente_id === c.id && (ct.estado === "Activo" || ct.estado === "En proceso") && ct.id !== contratoId);
    return !tieneContrato;
  });
  const motosDisponibles = motos.filter(m => {
    if (motoBusqueda) {
      const q = motoBusqueda.toLowerCase();
      return (m.estado === "Disponible") && (m.placa.toLowerCase().includes(q) || m.marca.toLowerCase().includes(q) || m.modelo.toLowerCase().includes(q));
    }
    return m.estado === "Disponible";
  });

  const tarifaDiaria = Number(form.tarifa_ls) || 0;
  const tarifaDomingo = Number(form.tarifa_dom) || 0;
  const ahorroLS = Number(form.ahorro_ls) || 0;
  const ahorroDom = Number(form.ahorro_dom) || 0;
  const pagoDiaLS = tarifaDiaria + ahorroLS;
  const pagoDiaDom = tarifaDomingo + ahorroDom;
  const valorSemanal = tarifaDiaria > 0 && tarifaDomingo > 0 ? 6 * pagoDiaLS + pagoDiaDom : 0;
  const valorQuincenal = valorSemanal > 0 ? 2 * valorSemanal + pagoDiaLS : 0;
  const valorMensual = valorSemanal > 0 ? 4 * valorSemanal + 2 * pagoDiaLS : 0;
  const valorPeriodo = form.forma_pago === "Semanal" ? valorSemanal
    : form.forma_pago === "Quincenal" ? valorQuincenal
    : form.forma_pago === "Mensual" ? valorMensual : 0;
  const tarifaSemana = 6 * tarifaDiaria + tarifaDomingo;
  const ahorroSemana = valorSemanal > 0 ? valorSemanal - tarifaSemana : 0;
  const baseRequerida = form.forma_pago === "Diario" ? 0
    : form.forma_pago === "Semanal" ? 308000 + valorSemanal
    : form.forma_pago === "Quincenal" ? 308000 + valorQuincenal
    : 308000 + valorMensual;
  const ahorroEntregado = Number(form.ahorro_inicial) || 0;
  const baseSuficiente = ahorroEntregado >= baseRequerida;
  // Ahorro con el que ARRANCA el contrato (regla 11-jul): de la base entregada, el período
  // adelantado se reparte como cualquier período (tarifa empresa + ahorro) — la parte de la
  // empresa NO es ahorro del cliente. Ej: $510.000 − $176.000 = $334.000 (= $308.000 + $26.000).
  // Vive en ahorro_apertura (separado); ahorro_acumulado arranca en 0 y solo crece pagando.
  // Diario NO usa apertura: todo lo entregado va a ahorro_acumulado como siempre, porque
  // el trigger de base_completada (>= $510.000) mira esa columna.
  const ahorroPeriodo = form.forma_pago === "Semanal" ? ahorroSemana
    : form.forma_pago === "Quincenal" ? 2 * ahorroSemana + ahorroLS
    : form.forma_pago === "Mensual" ? 4 * ahorroSemana + 2 * ahorroLS : 0;
  const aperturaInicial = form.forma_pago === "Diario"
    ? 0
    : Math.max(ahorroEntregado - (valorPeriodo - ahorroPeriodo), 0);

  const primerLunes = form.forma_pago === "Semanal" && valorSemanal > 0
    ? calcPrimerPago(form.fecha_entrega, { forma_pago: form.forma_pago, dia_pago: "Lunes", dias_pago_mes: [] }, pagoDiaLS, pagoDiaDom) : null;
  const primerMiercoles = form.forma_pago === "Semanal" && valorSemanal > 0
    ? calcPrimerPago(form.fecha_entrega, { forma_pago: form.forma_pago, dia_pago: "Miércoles", dias_pago_mes: [] }, pagoDiaLS, pagoDiaDom) : null;

  // Vista previa del primer pago para Quincenal/Mensual — según las fechas de calendario elegidas.
  const diasCalendarioCompletos = form.forma_pago === "Quincenal"
    ? form.dias_pago_mes.length === 2
    : form.forma_pago === "Mensual"
      ? form.dias_pago_mes.length === 1
      : false;
  const previewCalendario = diasCalendarioCompletos && valorSemanal > 0
    ? calcPrimerPago(form.fecha_entrega, { forma_pago: form.forma_pago, dia_pago: "Lunes", dias_pago_mes: form.dias_pago_mes }, pagoDiaLS, pagoDiaDom)
    : null;

  async function subirArchivo(file: File, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function subirFirmaCanvas(dataUrl: string, path: string): Promise<string | null> {
    const blob = await (await fetch(dataUrl)).blob();
    const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return data.publicUrl;
  }

  async function subirBlob(blob: Blob, path: string, contentType: string): Promise<string | null> {
    const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType, upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("documentos").getPublicUrl(path);
    return data.publicUrl;
  }

  // Arma el objeto de firmas/huellas para incrustar en el PDF. La huella del cliente se
  // reutiliza de su registro (autorizacion_datos_huella_url); si no existe, la fresca
  // capturada aquí. La huella se convierte a dataURL para que html2canvas no la pierda.
  async function construirFirmas(firmaCliente: string, firmaAcomp: string): Promise<FirmasDoc> {
    // Huellas: se reutilizan las capturadas en la oficina (registro/edición). Solo si
    // faltan se usa la fresca capturada aquí como respaldo.
    const huellaRegistroCli = clienteActual?.autorizacion_datos_huella_url
      ? await urlADataUrl(clienteActual.autorizacion_datos_huella_url)
      : null;
    const huellaRegistroAcomp = clienteActual?.acompanante_huella_url
      ? await urlADataUrl(clienteActual.acompanante_huella_url)
      : null;
    const selloFecha = `Firmado digitalmente el ${new Date().toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}`;
    return {
      firmaCliente,
      huellaCliente: huellaRegistroCli ?? huellaClienteFresh,
      firmaAcompanante: firmaAcomp,
      huellaAcompanante: huellaRegistroAcomp ?? huellaAcompanante,
      folio: (contratoId ?? "").slice(0, 8).toUpperCase(),
      selloFecha,
    };
  }

  // Las dos huellas deben existir (registradas en oficina o capturadas aquí) antes de firmar.
  function faltaHuella(): string | null {
    if (!(clienteActual?.autorizacion_datos_huella_url || huellaClienteFresh))
      return "Falta la huella del cliente. Captúrala en la oficina (ficha del cliente) antes de firmar.";
    if (!(clienteActual?.acompanante_huella_url || huellaAcompanante))
      return "Falta la huella del acompañante. Captúrala en la oficina (ficha del cliente) antes de firmar.";
    return null;
  }

  // ── STEP 1: Guardar contrato ──────────────────────────────────────────────
  async function handleStep1() {
    if (!form.cliente_id) { setError("Selecciona un cliente."); return; }
    if (!form.tarifa_ls || !form.tarifa_dom) { setError("Ingresa la tarifa diaria y la tarifa del domingo."); return; }
    if (form.forma_pago !== "Diario" && !form.meses) { setError("Ingresa la duración en meses."); return; }
    if (form.forma_pago === "Quincenal" && form.dias_pago_mes.length !== 2) { setError("Elige las 2 fechas del mes en que paga."); return; }
    if (form.forma_pago === "Mensual" && form.dias_pago_mes.length !== 1) { setError("Elige la fecha del mes en que paga."); return; }
    const cliente = clientes.find(c => c.id === form.cliente_id);
    if (!cliente) { setError("Cliente no encontrado."); return; }
    if (cliente.estado !== "Aprobado") { setError("El cliente debe estar en estado 'Aprobado' para crear un contrato."); return; }

    const diaPago = form.forma_pago === "Diario" ? "Diario" : form.forma_pago === "Semanal" ? form.dia_pago : form.forma_pago;
    const diasPagoMes = form.forma_pago === "Quincenal" || form.forma_pago === "Mensual" ? form.dias_pago_mes : null;

    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const { data, error: err } = await supabase.from("contratos").insert({
        cliente_id: form.cliente_id,
        forma_pago: form.forma_pago,
        dia_pago: diaPago,
        dias_pago_mes: diasPagoMes,
        valor_semanal: form.forma_pago === "Diario" ? tarifaDiaria : valorSemanal,
        meses: form.forma_pago === "Diario" ? null : Number(form.meses),
        ahorro_inicial: ahorroEntregado,
        fecha_entrega: form.fecha_entrega,
        fecha_fin_contrato: form.forma_pago === "Diario" ? null : calcularFechaFinContrato(form.fecha_entrega, Number(form.meses)),
        tipo_ruta: cliente.ruta_contrato ?? "tiempo_definido",
        tarifa_diaria: tarifaDiaria,
        tarifa_domingo: tarifaDomingo,
        ahorro_diario: ahorroLS,
        ahorro_domingo: ahorroDom,
        base_inicial: baseRequerida || 510000,
        estado: "En proceso",
        // Tiempo definido: el ahorro con el que arranca vive SEPARADO en ahorro_apertura
        // (entregado − tarifa empresa del período adelantado) y acumulado empieza en 0.
        // Diario: sin apertura — todo a acumulado (el trigger de base mira esa columna).
        ahorro_apertura: aperturaInicial,
        ahorro_acumulado: form.forma_pago === "Diario" ? ahorroEntregado : 0,
        base_completada: false,
      }).select("*").single();
      if (err) { setError(err.message); return; }
      setContratoId(data.id);
      setContratoData(data as Contrato);
      if (form.forma_pago !== "Diario" && !baseSuficiente) {
        setConvenioPendiente({ contratoId: data.id, falta: baseRequerida - ahorroEntregado });
      } else {
        setStep(2);
      }
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 2: Asignar moto ─────────────────────────────────────────────────
  async function handleStep2(mId: string) {
    if (!contratoId) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const { error: e1 } = await supabase.from("contratos").update({ moto_id: mId }).eq("id", contratoId);
      if (e1) { setError(e1.message); return; }
      const { error: e2 } = await supabase.from("motos").update({ estado: "Reservada" }).eq("id", mId);
      if (e2) { setError(e2.message); return; }
      setMotoId(mId);
      setContratoData(prev => prev ? { ...prev, moto_id: mId } : prev);
      setStep(3);
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 3: Guardar firma contrato ────────────────────────────────────────
  async function handleStep3() {
    if (!leido3) { setError("Confirma que has leído el documento."); return; }
    if (!firmaContrato) { setError("Dibuja la firma del cliente antes de continuar."); return; }
    if (!firmaContratoAcomp) { setError("Dibuja la firma del acompañante antes de continuar."); return; }
    { const fh = faltaHuella(); if (fh) { setError(fh); return; } }
    if (!contratoId || !contratoData || !clienteActual) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      // Se guarda la firma cruda (auditoría) y se genera el PDF congelado del contrato
      // con firma + huella de ambos incrustadas.
      await subirFirmaCanvas(firmaContrato, `firmas/${contratoId}/contrato.png`);
      await subirFirmaCanvas(firmaContratoAcomp, `firmas/${contratoId}/contrato_acompanante.png`);
      const firmas = await construirFirmas(firmaContrato, firmaContratoAcomp);
      const html = generarHTMLContrato(contratoData, clienteActual, motoActual ?? null, firmas);
      const pdf = await htmlAPdfBlob(html);
      const url = await subirBlob(pdf, `contratos/${contratoId}/contrato.pdf`, "application/pdf");
      if (url) await supabase.from("contratos").update({ contrato_pdf_url: url }).eq("id", contratoId);
      else { setError("No se pudo generar el PDF del contrato. Intenta de nuevo."); return; }
      setStep(4);
    } catch (e) {
      setError("Error al generar el PDF del contrato: " + ((e as Error)?.message ?? String(e)));
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 4: Guardar firma pagaré ─────────────────────────────────────────
  async function handleStep4() {
    if (!leido4) { setError("Confirma que has leído el documento."); return; }
    if (!firmaPagare) { setError("Dibuja la firma del cliente antes de continuar."); return; }
    if (!firmaPagareAcomp) { setError("Dibuja la firma del acompañante antes de continuar."); return; }
    { const fh = faltaHuella(); if (fh) { setError(fh); return; } }
    if (!contratoId || !contratoData || !clienteActual) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      await subirFirmaCanvas(firmaPagare, `firmas/${contratoId}/pagare.png`);
      await subirFirmaCanvas(firmaPagareAcomp, `firmas/${contratoId}/pagare_acompanante.png`);
      const firmas = await construirFirmas(firmaPagare, firmaPagareAcomp);
      const html = generarHTMLPagare(contratoData, clienteActual, firmas);
      const pdf = await htmlAPdfBlob(html);
      const url = await subirBlob(pdf, `contratos/${contratoId}/pagare.pdf`, "application/pdf");
      if (url) await supabase.from("contratos").update({ pagare_pdf_url: url }).eq("id", contratoId);
      else { setError("No se pudo generar el PDF del pagaré. Intenta de nuevo."); return; }
      setStep(5);
    } catch (e) {
      setError("Error al generar el PDF del pagaré: " + ((e as Error)?.message ?? String(e)));
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 5: Subir foto certificado ───────────────────────────────────────
  async function handleStep5() {
    if (!fotoCert) { setError("Sube la foto del certificado de conocimiento."); return; }
    if (!contratoId) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const url = await subirArchivo(fotoCert, `certificados/${contratoId}/certificado.${fotoCert.name.split(".").pop()}`);
      await supabase.from("contratos").update({ certificado_pdf_url: url, firma_cliente: true }).eq("id", contratoId);
      setStep(6);
    } catch (e) {
      setError("Error al subir el certificado: " + ((e as Error)?.message ?? String(e)));
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 6: Entregar moto y activar ─────────────────────────────────────
  async function handleStep6() {
    if (!kmInicial) { setError("Ingresa el kilometraje inicial."); return; }
    const faltantes = ANGULOS_FOTO.filter(a => !fotosEntrega[a.key]);
    if (faltantes.length > 0) { setError(`Falta la foto: ${faltantes.map(a => a.label).join(", ")}.`); return; }
    if (!motoId || !contratoId || !clienteActual) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const urls: Record<string, string> = {};
      for (const { key } of ANGULOS_FOTO) {
        const file = fotosEntrega[key]!;
        const url = await subirArchivo(file, `entregas/${contratoId}/${key}.${file.name.split(".").pop()}`);
        if (url) urls[key] = url;
      }
      await supabase.from("motos").update({ kilometraje_inicial: Number(kmInicial), fotos_entrega: urls }).eq("id", motoId);
      await supabase.from("contratos").update({ estado: "Activo", firma_responsable: true }).eq("id", contratoId);
      await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoId);
      await supabase.from("clientes").update({ estado: "Activo" }).eq("id", clienteActual.id);
      onCompletado();
    } catch (e) {
      setError("Error al activar el contrato: " + ((e as Error)?.message ?? String(e)));
    } finally {
      setGuardando(false);
    }
  }

  const pasoTitulos = ["Datos del contrato", "Asignar moto", "Firma — Contrato de arrendamiento", "Firma — Pagaré y carta", "Certificado de conocimiento", "Entrega de la moto"];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? 0 : 16, zIndex: 100, backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 600, background: "white",
        borderRadius: isMobile ? 0 : 22, display: "flex", flexDirection: "column",
        maxHeight: isMobile ? "100dvh" : "96vh", height: isMobile ? "100dvh" : undefined,
        overflow: "hidden", boxShadow: "0 24px 80px rgba(15,23,42,0.3)",
      }}>

        {/* Header */}
        <div style={{ padding: "16px 20px 12px", background: "#0f172a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                Paso {step} de 6
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "white" }}>{pasoTitulos[step - 1]}</div>
              {clienteActual && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, textTransform: "uppercase" }}>{clienteActual.nombre}</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {contratoId && (
                <button
                  onClick={handleCancelarYEliminar}
                  disabled={eliminando}
                  title="Eliminar este intento de contrato por completo"
                  style={{ background: "rgba(248,113,113,0.15)", border: "none", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#fca5a5", opacity: eliminando ? 0.6 : 1 }}
                >
                  {eliminando ? "Eliminando..." : "🗑️ Cancelar y eliminar"}
                </button>
              )}
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>
          {/* Stepper */}
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {PASOS_LABELS.map((lbl, i) => (
              <div key={lbl} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800,
                  background: i + 1 < step ? "#22c55e" : i + 1 === step ? "#0284c7" : "rgba(255,255,255,0.1)",
                  color: "white",
                }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <div style={{ fontSize: 9, color: i + 1 === step ? "white" : "#475569", fontWeight: i + 1 === step ? 700 : 400, textAlign: "center" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* ── PASO 1: Datos ── */}
          {step === 1 && (
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Cliente</label>
                <select style={inputStyle} value={form.cliente_id} onChange={e => {
                  const c = clientes.find(cl => cl.id === e.target.value);
                  setForm(p => ({
                    ...p,
                    cliente_id: e.target.value,
                    forma_pago: c?.ruta_contrato === "diario" ? "Diario" : p.forma_pago,
                    // Siempre refleja lo pagado al registrarse — el campo no es editable en el wizard.
                    ahorro_inicial: c ? String(c.ingreso_inicial ?? 0) : "",
                  }));
                }}>
                  <option value="">Seleccionar cliente aprobado</option>
                  {clientesAprobados.map(c => <option key={c.id} value={c.id}>{c.nombre.toUpperCase()} · {c.cedula}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Modalidad</label>
                <select style={inputStyle} value={form.forma_pago} onChange={e => setForm(p => ({ ...p, forma_pago: e.target.value as FormaPago }))}>
                  <option value="Diario">Diario — ahorrando base inicial</option>
                  <option value="Semanal">Semanal — pago cada semana</option>
                  <option value="Quincenal">Quincenal — pago cada 15 días</option>
                  <option value="Mensual">Mensual — pago cada mes</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <MoneyInput label="Tarifa L-S / día" value={form.tarifa_ls} onChange={v => setForm(p => ({ ...p, tarifa_ls: v }))} placeholder="$ 27.000" />
                <MoneyInput label="Tarifa domingo" value={form.tarifa_dom} onChange={v => setForm(p => ({ ...p, tarifa_dom: v }))} placeholder="$ 14.000" />
              </div>

              {form.forma_pago !== "Diario" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <MoneyInput label="Ahorro L-S / día" value={form.ahorro_ls} onChange={v => setForm(p => ({ ...p, ahorro_ls: v }))} placeholder="$ 4.000" />
                    <MoneyInput label="Ahorro domingo" value={form.ahorro_dom} onChange={v => setForm(p => ({ ...p, ahorro_dom: v }))} placeholder="$ 2.000" />
                  </div>

                  {valorSemanal > 0 && (
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: 13 }}>
                      <div style={{ fontWeight: 800, color: "#0369a1", marginBottom: 8 }}>Desglose del período</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, fontSize: 12, color: "#334155", marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, color: "#64748b" }}>Día</div>
                        <div style={{ fontWeight: 700, color: "#64748b" }}>Tarifa empresa</div>
                        <div style={{ fontWeight: 700, color: "#166534" }}>Ahorro cliente</div>
                        <div style={{ fontWeight: 700, color: "#64748b" }}>Pago día</div>
                        <div>L–S (×6)</div>
                        <div>$ {fmt(tarifaDiaria)}</div>
                        <div style={{ color: "#166534", fontWeight: 700 }}>$ {fmt(ahorroLS)}</div>
                        <div style={{ fontWeight: 800 }}>$ {fmt(pagoDiaLS)}</div>
                        <div>Domingo</div>
                        <div>$ {fmt(tarifaDomingo)}</div>
                        <div style={{ color: "#166534", fontWeight: 700 }}>$ {fmt(ahorroDom)}</div>
                        <div style={{ fontWeight: 800 }}>$ {fmt(pagoDiaDom)}</div>
                      </div>
                      <div style={{ borderTop: "1px solid #bae6fd", paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                          <span style={{ color: "#64748b", fontSize: 12 }}>Empresa/sem: <strong>$ {fmt(tarifaSemana)}</strong></span>
                          <span style={{ color: "#166534", fontSize: 12 }}>Ahorro/sem: <strong>$ {fmt(ahorroSemana)}</strong></span>
                          <span style={{ color: "#64748b", fontSize: 12 }}>Total/sem: <strong>$ {fmt(valorSemanal)}</strong></span>
                        </div>
                        {form.forma_pago !== "Semanal" && (
                          <div style={{ background: "#0284c7", color: "white", borderRadius: 8, padding: "6px 10px", fontWeight: 800, fontSize: 13, textAlign: "center" }}>
                            Total {form.forma_pago}: $ {fmt(valorPeriodo)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {form.forma_pago === "Semanal" && (
                    <div>
                      <label style={labelStyle}>Día de pago</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {(["Lunes", "Miércoles"] as const).map(dia => {
                          const p = dia === "Lunes" ? primerLunes : primerMiercoles;
                          const active = form.dia_pago === dia;
                          return (
                            <button key={dia} onClick={() => setForm(prev => ({ ...prev, dia_pago: dia }))} style={{
                              flex: 1, padding: "10px 12px", borderRadius: 12, border: `2px solid ${active ? "#0284c7" : "#e2e8f0"}`,
                              background: active ? "#eff6ff" : "white", cursor: "pointer", textAlign: "left",
                            }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: active ? "#0284c7" : "#334155" }}>{dia}</div>
                              {p && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                Primer pago: {new Date(p.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}<br />
                                <span style={{ fontWeight: 700, color: active ? "#0284c7" : "#334155" }}>$ {fmt(p.valor)}</span> ({p.dias} días)
                              </div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(form.forma_pago === "Quincenal" || form.forma_pago === "Mensual") && (
                    <div>
                      <label style={labelStyle}>
                        {form.forma_pago === "Quincenal" ? "Fechas de pago del mes (2)" : "Fecha de pago del mes"}
                      </label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        {(form.forma_pago === "Quincenal"
                          ? [[5, 20], [10, 25], [15, 30]]
                          : [[5], [10], [15], [20], [25], [30]]
                        ).map(preset => {
                          const active = form.dias_pago_mes.length === preset.length && preset.every(d => form.dias_pago_mes.includes(d));
                          return (
                            <button key={preset.join("-")} onClick={() => setForm(p => ({ ...p, dias_pago_mes: preset }))} style={{
                              padding: "6px 12px", borderRadius: 10, border: `1px solid ${active ? "#0284c7" : "#e2e8f0"}`,
                              background: active ? "#eff6ff" : "white", color: active ? "#0284c7" : "#64748b",
                              fontWeight: 700, fontSize: 12, cursor: "pointer",
                            }}>
                              {preset.join(" y ")}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <input type="number" min="1" max="31" style={inputStyle}
                            value={form.dias_pago_mes[0] ?? ""}
                            placeholder="Día 1 (1-31)"
                            onChange={e => {
                              const v = Math.min(31, Math.max(1, Number(e.target.value) || 1));
                              setForm(p => ({ ...p, dias_pago_mes: form.forma_pago === "Mensual" ? [v] : [v, p.dias_pago_mes[1] ?? v] }));
                            }} />
                        </div>
                        {form.forma_pago === "Quincenal" && (
                          <div style={{ flex: 1 }}>
                            <input type="number" min="1" max="31" style={inputStyle}
                              value={form.dias_pago_mes[1] ?? ""}
                              placeholder="Día 2 (1-31)"
                              onChange={e => {
                                const v = Math.min(31, Math.max(1, Number(e.target.value) || 1));
                                setForm(p => ({ ...p, dias_pago_mes: [p.dias_pago_mes[0] ?? v, v] }));
                              }} />
                          </div>
                        )}
                      </div>
                      {form.forma_pago === "Quincenal" && form.dias_pago_mes.length === 2 && form.dias_pago_mes[0] === form.dias_pago_mes[1] && (
                        <div style={{ fontSize: 12, color: "#991b1b", marginTop: 4 }}>Las 2 fechas deben ser distintas.</div>
                      )}
                      {previewCalendario && (
                        <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 12, border: "2px solid #0284c7", background: "#eff6ff" }}>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            Primer pago: {new Date(previewCalendario.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#0284c7" }}>$ {fmt(previewCalendario.valor)}</span>
                          <span style={{ fontSize: 12, color: "#64748b" }}> ({previewCalendario.dias} días)</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Duración (meses)</label>
                    <input type="number" min="1" max="24" style={inputStyle} value={form.meses}
                      onChange={e => setForm(p => ({ ...p, meses: e.target.value }))} placeholder="Máx. 24 meses" />
                    {form.meses && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      ≈ {Math.round(Number(form.meses) * 4.33)} semanas
                    </div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Base inicial entregada <span style={{ fontWeight: 400, fontSize: 11, color: "#94a3b8" }}>(del registro del cliente)</span></label>
                    <div style={{
                      padding: "6px 10px", borderRadius: 10, fontSize: 12, lineHeight: 1.4, textAlign: "center",
                      background: form.cliente_id && baseRequerida > 0 ? (baseSuficiente ? "#dcfce7" : "#fef3c7") : "#f1f5f9",
                      border: `1px solid ${form.cliente_id && baseRequerida > 0 ? (baseSuficiente ? "#bbf7d0" : "#fde68a") : "#e2e8f0"}`,
                    }}>
                      <div>
                        <span style={{ fontWeight: 800, color: "#0f172a" }}>$ {fmt(ahorroEntregado)}</span>
                        {form.cliente_id && valorSemanal > 0 && baseRequerida > 0 && (
                          <span style={{ color: "#64748b" }}> de $ {fmt(baseRequerida)}</span>
                        )}
                      </div>
                      {form.cliente_id && valorSemanal > 0 && baseRequerida > 0 && (
                        <div style={{ fontWeight: 700, color: baseSuficiente ? "#166534" : "#92400e" }}>
                          {baseSuficiente ? "✅ suficiente" : `falta $ ${fmt(baseRequerida - ahorroEntregado)}`}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={labelStyle}>Fecha de entrega</label>
                <input type="date" style={inputStyle} value={form.fecha_entrega}
                  onChange={e => setForm(p => ({ ...p, fecha_entrega: e.target.value }))} />
              </div>
            </div>
          )}

          {/* ── PASO 2: Moto ── */}
          {step === 2 && (
            <div>
              <input style={{ ...inputStyle, marginBottom: 12 }} placeholder="Buscar por placa, marca o modelo..."
                value={motoBusqueda} onChange={e => setMotoBusqueda(e.target.value)} />
              {motosDisponibles.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748b", fontSize: 14 }}>
                  No hay motos disponibles{motoBusqueda ? " con ese filtro" : ""}.
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {motosDisponibles.slice(0, 30).map(m => (
                  <button key={m.id} onClick={() => {
                    if (!confirm(`¿Confirmas la moto ${m.placa} (${m.marca} ${m.modelo}) para ${(clienteActual?.nombre ?? "").toUpperCase()}?`)) return;
                    handleStep2(m.id);
                  }} disabled={guardando} style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0",
                    background: "white", cursor: "pointer", textAlign: "left", opacity: guardando ? 0.6 : 1,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#0284c7" }}>{m.placa}</div>
                        <div style={{ fontSize: 13, color: "#334155" }}>{m.marca} {m.modelo} · {m.color}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.grupo} · {m.cilindraje}</div>
                      </div>
                      <div style={{ fontSize: 22, color: "#0284c7" }}>→</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PASO 3: Firma contrato ── */}
          {step === 3 && clienteActual && contratoData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", maxHeight: 280, overflowY: "auto", padding: "12px 16px" }}>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: "#334155" }}
                  dangerouslySetInnerHTML={{ __html: generarHTMLContrato(contratoData, clienteActual, motoActual ?? null) }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={leido3} onChange={e => setLeido3(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#0284c7" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>He leído y acepto el contrato de arrendamiento</span>
              </label>
              <CanvasFirma key="firma-contrato-cliente" label="Firma del cliente" modal opcional={false} onChange={setFirmaContrato} />
              <CanvasFirma key="firma-contrato-acomp" label="Firma del acompañante" modal opcional={false} onChange={setFirmaContratoAcomp} />
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Huellas</div>
                {clienteActual.autorizacion_datos_huella_url ? (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 600, color: "#166534" }}>
                    ✔ Se usará la huella registrada del cliente
                  </div>
                ) : (
                  <LectorHuella label="Huella del cliente (no está registrada)" onChange={setHuellaClienteFresh} />
                )}
                {clienteActual.acompanante_huella_url ? (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 600, color: "#166534" }}>
                    ✔ Se usará la huella registrada del acompañante
                  </div>
                ) : huellaAcompanante ? (
                  <LectorHuella label="Huella del acompañante" onChange={setHuellaAcompanante} />
                ) : (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                    ⚠ Falta la huella del acompañante — captúrala en la oficina (ficha del cliente → Editar) antes de firmar.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PASO 4: Firma pagaré ── */}
          {step === 4 && clienteActual && contratoData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", maxHeight: 280, overflowY: "auto", padding: "12px 16px" }}>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: "#334155" }}
                  dangerouslySetInnerHTML={{ __html: generarHTMLPagare(contratoData, clienteActual) }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={leido4} onChange={e => setLeido4(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#0284c7" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>He leído y acepto el pagaré y carta de instrucciones</span>
              </label>
              <CanvasFirma key="firma-pagare-cliente" label="Firma del cliente" modal opcional={false} onChange={setFirmaPagare} />
              <CanvasFirma key="firma-pagare-acomp" label="Firma del acompañante" modal opcional={false} onChange={setFirmaPagareAcomp} />
              <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>Huellas</div>
                {(clienteActual.autorizacion_datos_huella_url || huellaClienteFresh) && (clienteActual.acompanante_huella_url || huellaAcompanante) ? (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: "#dcfce7", border: "1px solid #86efac", fontSize: 13, fontWeight: 600, color: "#166534" }}>
                    ✔ Se usarán las huellas registradas (cliente y acompañante)
                  </div>
                ) : (
                  <>
                    {!clienteActual.autorizacion_datos_huella_url && !huellaClienteFresh && (
                      <LectorHuella label="Huella del cliente (no está registrada)" onChange={setHuellaClienteFresh} />
                    )}
                    {!clienteActual.acompanante_huella_url && !huellaAcompanante && (
                      <div style={{ padding: "8px 12px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
                        ⚠ Falta la huella del acompañante — captúrala en la oficina (ficha del cliente → Editar) antes de firmar.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── PASO 5: Foto certificado ── */}
          {step === 5 && clienteActual && contratoData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0369a1", marginBottom: 6 }}>📋 Certificado de conocimiento</div>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                  Verifica que el cliente haya leído y firmado el documento físico. El contenido del certificado es:
                </div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", maxHeight: 300, overflowY: "auto", padding: "12px 16px" }}>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: "#334155" }}
                  dangerouslySetInnerHTML={{ __html: generarHTMLCertificado(contratoData, clienteActual) }} />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
                Ahora toma una foto al documento físico firmado y súbela como evidencia.
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  📷 Cámara
                  <input ref={inputCertCamRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFotoCert(f); }} />
                </label>
                <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  🖼 Galería
                  <input ref={inputCertGalRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setFotoCert(f); }} />
                </label>
              </div>

              {fotoCert && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 6 }}>✅ {fotoCert.name}</div>
                  {fotoCert.type.startsWith("image/") && (
                    <div style={{ borderRadius: 12, overflow: "hidden", maxWidth: 320, border: "1px solid #e2e8f0" }}>
                      <img src={URL.createObjectURL(fotoCert)} alt="Certificado" style={{ width: "100%", display: "block" }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 6: Entrega ── */}
          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {motoActual && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0284c7" }}>🏍️ {motoActual.placa}</div>
                  <div style={{ fontSize: 13, color: "#334155" }}>{motoActual.marca} {motoActual.modelo} · {motoActual.color}</div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Kilometraje inicial</label>
                <input type="number" style={inputStyle} value={kmInicial}
                  onChange={e => setKmInicial(e.target.value)} placeholder="Ej. 12400" />
              </div>

              <div>
                <div style={labelStyle}>Fotos del estado de la moto (5 obligatorias)</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                  {ANGULOS_FOTO.map(({ key, label }) => {
                    const file = fotosEntrega[key];
                    return (
                      <div key={key} style={{ borderRadius: 12, border: `1px solid ${file ? "#bbf7d0" : "#e2e8f0"}`, background: file ? "#f0fdf4" : "#f8fafc", padding: 8, textAlign: "center" }}>
                        {file ? (
                          <div style={{ position: "relative" }}>
                            <img src={URL.createObjectURL(file)} alt={label} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8 }} />
                            <button onClick={() => setFotosEntrega(p => { const n = { ...p }; delete n[key]; return n; })} style={{
                              position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%",
                              background: "#ef4444", border: "none", color: "white", fontSize: 10, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
                            <IconoAngulo angulo={key} />
                          </div>
                        )}
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", marginTop: 4, marginBottom: 6 }}>{label}</div>
                        {!file && (
                          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "#0284c7" }} title="Cámara">
                              📷
                              <input type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) setFotosEntrega(p => ({ ...p, [key]: f })); }} />
                            </label>
                            <label style={{ cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 6, background: "#e0f2fe" }} title="Galería">
                              🖼
                              <input type="file" accept="image/*" style={{ display: "none" }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) setFotosEntrega(p => ({ ...p, [key]: f })); }} />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Checklist de condición</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {CHECKLIST.map((item, i) => (
                    <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: checklist[i] ? "#dcfce7" : "#f8fafc", border: `1px solid ${checklist[i] ? "#bbf7d0" : "#e2e8f0"}`, cursor: "pointer" }}>
                      <input type="checkbox" checked={checklist[i]} onChange={e => setChecklist(p => p.map((v, j) => j === i ? e.target.checked : v))}
                        style={{ width: 16, height: 16, accentColor: "#166534" }} />
                      <span style={{ fontSize: 13, fontWeight: checklist[i] ? 700 : 400, color: checklist[i] ? "#166534" : "#334155" }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#fee2e2", color: "#991b1b", fontWeight: 600, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && step !== 2 && (
              <button onClick={() => { setError(null); setStep(s => s - 1); }} style={btnSecondary}>← Atrás</button>
            )}
            {step === 1 && (
              <button onClick={handleStep1} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : "Guardar y continuar →"}
              </button>
            )}
            {step === 3 && (
              <button onClick={handleStep3} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : "Confirmar firma →"}
              </button>
            )}
            {step === 4 && (
              <button onClick={handleStep4} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : "Confirmar firma →"}
              </button>
            )}
            {step === 5 && (
              <button onClick={handleStep5} disabled={guardando} style={{ ...btnPrimary, opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Subiendo..." : "Subir y continuar →"}
              </button>
            )}
            {step === 6 && (
              <button onClick={handleStep6} disabled={guardando} style={{ ...btnPrimary, background: guardando ? "#94a3b8" : "linear-gradient(90deg,#166534,#15803d)", opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Activando contrato..." : "✅ Activar contrato"}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {convenioPendiente && (
        <ModalConvenio
          contratoId={convenioPendiente.contratoId}
          clienteNombre={clienteActual?.nombre ?? ""}
          metaFija={convenioPendiente.falta}
          motivoInicial="Base inicial incompleta al crear el contrato"
          obligatorio
          onClose={() => { setConvenioPendiente(null); setStep(2); }}
        />
      )}
    </div>
  );
}
