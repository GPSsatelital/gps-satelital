import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";
import type { Contrato, FormaPago } from "../hooks/useContratos";
import { generarHTMLContrato, generarHTMLPagare, generarHTMLCertificado } from "../hooks/useDocumentos";

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

function MoneyInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  const num = Number(value) || 0;
  const display = focused ? value : (num > 0 ? "$ " + num.toLocaleString("es-CO") : "");
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={display}
        onFocus={e => { setFocused(true); e.target.select(); }}
        onBlur={() => setFocused(false)}
        onChange={e => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder ?? "$ 0"}
      />
    </div>
  );
}
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


// Prorrateo: día entrega NO incluido, primer día de pago SÍ incluido.
// Itera día a día detectando domingos para usar tarifa correcta.
function calcPrimerPago(fecha: string, dia: "Lunes" | "Miércoles", pagoDiaLS: number, pagoDiaDom: number) {
  const base = new Date(fecha + "T00:00:00");
  const dow = base.getDay();
  const target = dia === "Lunes" ? 1 : 3;
  const dias = ((target - dow + 7) % 7) || 7;
  let total = 0;
  for (let i = 1; i <= dias; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    total += d.getDay() === 0 ? pagoDiaDom : pagoDiaLS;
  }
  const proxima = new Date(base);
  proxima.setDate(proxima.getDate() + dias);
  return { dias, fecha: proxima.toISOString().slice(0, 10), valor: total };
}

function CanvasFirma({ label, onChange }: { label: string; onChange: (data: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDrawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    hasDrawn.current = false;
    let drawing = false;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pt = "touches" in e ? e.touches[0] : e;
      return { x: (pt.clientX - rect.left) * (canvas.width / rect.width), y: (pt.clientY - rect.top) * (canvas.height / rect.height) };
    };
    const onDown = (e: MouseEvent | TouchEvent) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); hasDrawn.current = true;
      onChange(canvas.toDataURL("image/png")); e.preventDefault();
    };
    const onUp = () => { drawing = false; };
    canvas.addEventListener("mousedown", onDown); canvas.addEventListener("mousemove", onMove); canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false }); canvas.addEventListener("touchmove", onMove, { passive: false }); canvas.addEventListener("touchend", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("touchstart", onDown); canvas.removeEventListener("touchmove", onMove); canvas.removeEventListener("touchend", onUp);
    };
  }, [onChange]);

  function clear() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false; onChange(null);
  }

  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ borderRadius: 14, border: "2px dashed #cbd5e1", background: "#fafafa", overflow: "hidden", position: "relative" }}>
        <canvas ref={canvasRef} width={640} height={180}
          style={{ width: "100%", height: 180, display: "block", touchAction: "none", cursor: "crosshair" }} />
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#cbd5e1", pointerEvents: "none", background: "white", padding: "2px 10px", borderRadius: 20, border: "1px solid #f1f5f9" }}>
          Firme aquí con el dedo
        </div>
      </div>
      <button onClick={clear} style={{ marginTop: 8, padding: "7px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", fontSize: 12, color: "#64748b" }}>
        Borrar firma
      </button>
    </div>
  );
}

const PASOS_LABELS = ["Datos", "Moto", "Contrato", "Pagaré", "Certificado", "Entrega"];

export default function WizardContrato({ clientes, motos, contratos, contratoInicial, stepInicial, onClose, onCompletado }: Props) {
  const [step, setStep] = useState(stepInicial ?? 1);
  const [contratoId, setContratoId] = useState<string | null>(contratoInicial?.id ?? null);
  const [contratoData, setContratoData] = useState<Contrato | null>(contratoInicial ?? null);
  const [motoId, setMotoId] = useState<string | null>(contratoInicial?.moto_id ?? null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Step 1 form
  const hoy = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    cliente_id: contratoInicial?.cliente_id ?? "",
    forma_pago: (contratoInicial?.forma_pago ?? "Semanal") as FormaPago,
    tarifa_ls: String(contratoInicial?.tarifa_diaria ?? 27000),
    tarifa_dom: String(contratoInicial?.tarifa_domingo ?? 14000),
    ahorro_ls: String(contratoInicial?.ahorro_diario ?? 4000),
    ahorro_dom: String(contratoInicial?.ahorro_domingo ?? 2000),
    dia_pago: contratoInicial?.dia_pago ?? "Lunes",
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

  // Step 5 certificado
  const [fotoCert, setFotoCert] = useState<File | null>(null);
  const inputCertCamRef = useRef<HTMLInputElement>(null);
  const inputCertGalRef = useRef<HTMLInputElement>(null);

  // Step 6 entrega
  const [kmInicial, setKmInicial] = useState("");
  const [fotosEntrega, setFotosEntrega] = useState<File[]>([]);
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST.map(() => false));
  const inputEntCamRef = useRef<HTMLInputElement>(null);
  const inputEntGalRef = useRef<HTMLInputElement>(null);

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

  const primerLunes = form.forma_pago !== "Diario" && valorSemanal > 0 ? calcPrimerPago(form.fecha_entrega, "Lunes", pagoDiaLS, pagoDiaDom) : null;
  const primerMiercoles = form.forma_pago !== "Diario" && valorSemanal > 0 ? calcPrimerPago(form.fecha_entrega, "Miércoles", pagoDiaLS, pagoDiaDom) : null;

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

  // ── STEP 1: Guardar contrato ──────────────────────────────────────────────
  async function handleStep1() {
    if (!form.cliente_id) { setError("Selecciona un cliente."); return; }
    if (!form.tarifa_ls || !form.tarifa_dom) { setError("Ingresa la tarifa diaria y la tarifa del domingo."); return; }
    if (form.forma_pago !== "Diario" && !form.meses) { setError("Ingresa la duración en meses."); return; }
    const cliente = clientes.find(c => c.id === form.cliente_id);
    if (!cliente) { setError("Cliente no encontrado."); return; }
    if (cliente.estado !== "Aprobado") { setError("El cliente debe estar en estado 'Aprobado' para crear un contrato."); return; }

    const diaPago = form.forma_pago === "Diario" ? "Diario" : form.dia_pago;

    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const { data, error: err } = await supabase.from("contratos").insert({
        cliente_id: form.cliente_id,
        forma_pago: form.forma_pago,
        dia_pago: diaPago,
        valor_semanal: form.forma_pago === "Diario" ? tarifaDiaria : valorSemanal,
        meses: form.forma_pago === "Diario" ? null : Number(form.meses),
        ahorro_inicial: ahorroEntregado,
        fecha_entrega: form.fecha_entrega,
        tipo_ruta: cliente.ruta_contrato ?? "tiempo_definido",
        tarifa_diaria: tarifaDiaria,
        tarifa_domingo: tarifaDomingo,
        ahorro_diario: ahorroLS,
        ahorro_domingo: ahorroDom,
        base_inicial: baseRequerida || 510000,
        estado: "En proceso",
        ahorro_acumulado: ahorroEntregado,
        base_completada: false,
      }).select("*").single();
      if (err) { setError(err.message); return; }
      setContratoId(data.id);
      setContratoData(data as Contrato);
      setStep(2);
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
    if (!contratoId) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const url = await subirFirmaCanvas(firmaContrato, `firmas/${contratoId}/contrato.png`);
      await subirFirmaCanvas(firmaContratoAcomp, `firmas/${contratoId}/contrato_acompanante.png`);
      if (url) await supabase.from("contratos").update({ contrato_pdf_url: url }).eq("id", contratoId);
      setStep(4);
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 4: Guardar firma pagaré ─────────────────────────────────────────
  async function handleStep4() {
    if (!leido4) { setError("Confirma que has leído el documento."); return; }
    if (!firmaPagare) { setError("Dibuja la firma del cliente antes de continuar."); return; }
    if (!firmaPagareAcomp) { setError("Dibuja la firma del acompañante antes de continuar."); return; }
    if (!contratoId) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const url = await subirFirmaCanvas(firmaPagare, `firmas/${contratoId}/pagare.png`);
      await subirFirmaCanvas(firmaPagareAcomp, `firmas/${contratoId}/pagare_acompanante.png`);
      if (url) await supabase.from("contratos").update({ pagare_pdf_url: url }).eq("id", contratoId);
      setStep(5);
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
    } finally {
      setGuardando(false);
    }
  }

  // ── STEP 6: Entregar moto y activar ─────────────────────────────────────
  async function handleStep6() {
    if (!kmInicial) { setError("Ingresa el kilometraje inicial."); return; }
    if (!motoId || !contratoId || !clienteActual) return;
    if (guardando) return;
    setGuardando(true); setError(null);
    try {
      const urls: string[] = [];
      for (let i = 0; i < fotosEntrega.length; i++) {
        const url = await subirArchivo(fotosEntrega[i], `entregas/${contratoId}/foto_${i}.${fotosEntrega[i].name.split(".").pop()}`);
        if (url) urls.push(url);
      }
      await supabase.from("motos").update({ kilometraje_inicial: Number(kmInicial), fotos_entrega: urls }).eq("id", motoId);
      await supabase.from("contratos").update({ estado: "Activo", firma_responsable: true }).eq("id", contratoId);
      await supabase.from("motos").update({ estado: "Asignada" }).eq("id", motoId);
      await supabase.from("clientes").update({ estado: "Activo" }).eq("id", clienteActual.id);
      onCompletado();
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
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
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
                    ahorro_inicial: c?.ingreso_inicial ? String(c.ingreso_inicial) : p.ahorro_inicial,
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

                  <div>
                    <label style={labelStyle}>Duración (meses)</label>
                    <input type="number" min="1" max="24" style={inputStyle} value={form.meses}
                      onChange={e => setForm(p => ({ ...p, meses: e.target.value }))} placeholder="Máx. 24 meses" />
                    {form.meses && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      ≈ {Math.round(Number(form.meses) * 4.33)} semanas
                    </div>}
                  </div>

                  <div>
                    <MoneyInput label="Base inicial entregada" value={form.ahorro_inicial} onChange={v => setForm(p => ({ ...p, ahorro_inicial: v }))} placeholder="$ 0" />
                    {form.cliente_id && valorSemanal > 0 && baseRequerida > 0 && (() => {
                      const clienteSeleccionado = clientes.find(c => c.id === form.cliente_id);
                      const ingresoRegistro = clienteSeleccionado?.ingreso_inicial ?? 0;
                      const falta = baseRequerida - ahorroEntregado;
                      return (
                        <div style={{
                          marginTop: 8, padding: "10px 12px", borderRadius: 10,
                          background: baseSuficiente ? "#dcfce7" : "#fef3c7",
                          border: `1px solid ${baseSuficiente ? "#bbf7d0" : "#fde68a"}`,
                          display: "flex", flexDirection: "column", gap: 4,
                        }}>
                          {ingresoRegistro > 0 && (
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              Pagó al registrarse: <strong>$ {fmt(ingresoRegistro)}</strong>
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            Requerido ({form.forma_pago}): <strong>$ {fmt(baseRequerida)}</strong>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: baseSuficiente ? "#166534" : "#92400e" }}>
                            {baseSuficiente ? "✅ Base suficiente" : `⚠️ Falta: $ ${fmt(falta)}`}
                          </div>
                        </div>
                      );
                    })()}
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
                  <button key={m.id} onClick={() => handleStep2(m.id)} disabled={guardando} style={{
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
              <CanvasFirma key="firma-contrato-cliente" label="Firma del cliente" onChange={setFirmaContrato} />
              <CanvasFirma key="firma-contrato-acomp" label="Firma del acompañante" onChange={setFirmaContratoAcomp} />
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
              <CanvasFirma key="firma-pagare-cliente" label="Firma del cliente" onChange={setFirmaPagare} />
              <CanvasFirma key="firma-pagare-acomp" label="Firma del acompañante" onChange={setFirmaPagareAcomp} />
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
                <div style={labelStyle}>Fotos del estado de la moto</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    📷 Cámara
                    <input ref={inputEntCamRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setFotosEntrega(p => [...p, f]); }} />
                  </label>
                  <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", borderRadius: 12, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    🖼 Galería
                    <input ref={inputEntGalRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setFotosEntrega(p => [...p, f]); }} />
                  </label>
                </div>
                {fotosEntrega.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {fotosEntrega.map((f, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={URL.createObjectURL(f)} alt={`foto ${i}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                        <button onClick={() => setFotosEntrega(p => p.filter((_, j) => j !== i))} style={{
                          position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                          background: "#ef4444", border: "none", color: "white", fontSize: 11, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  );
}
