import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";

function fmt(n: number) { return n.toLocaleString("es-CO"); }

type TipoImport = "motos" | "clientes" | "pagos";
type Paso = 1 | 2 | 3;
type ColMap = Record<string, string>;

const CAMPOS_MOTOS = [
  { key: "placa", label: "Placa", req: true },
  { key: "marca", label: "Marca", req: true },
  { key: "modelo", label: "Modelo", req: false },
  { key: "grupo", label: "Grupo (COSTA/PRADERA/RASTREADOR)", req: true },
  { key: "color", label: "Color", req: false },
  { key: "numero_motor", label: "N° Motor", req: false },
  { key: "numero_chasis", label: "N° Chasis", req: false },
  { key: "cilindraje", label: "Cilindraje", req: false },
  { key: "propietario", label: "Propietario", req: false },
];

const CAMPOS_CLIENTES = [
  { key: "nombre", label: "Nombre", req: true },
  { key: "cedula", label: "Cédula", req: true },
  { key: "telefono", label: "Teléfono", req: false },
  { key: "whatsapp", label: "WhatsApp", req: false },
  { key: "direccion", label: "Dirección", req: false },
];

const CAMPOS_PAGOS = [
  { key: "identificador", label: "Placa o cédula del cliente", req: true },
  { key: "valor", label: "Valor del pago", req: true },
  { key: "fecha", label: "Fecha (YYYY-MM-DD o DD/MM/YYYY)", req: true },
  { key: "metodo", label: "Método (Efectivo / Transferencia)", req: false },
  { key: "estado", label: "Estado (Confirmado / Pendiente)", req: false },
];

const GRUPO_MAP: Record<string, string> = {
  "costa": "COSTA", "pradera": "PRADERA", "rastreador": "RASTREADOR",
  "COSTA": "COSTA", "PRADERA": "PRADERA", "RASTREADOR": "RASTREADOR",
  "usadas": "USADAS", "usadas club": "USADAS", "USADAS": "USADAS", "USADAS CLUB": "USADAS",
};

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    const d = new Date((val - 25569) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y.length === 2 ? "20" + y : y;
    return `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function parseMonto(val: unknown): number {
  if (typeof val === "number") return Math.round(val);
  const s = String(val).replace(/[^\d.,]/g, "").replace(",", ".");
  return Math.round(parseFloat(s)) || 0;
}

const TIPOS = [
  { key: "motos" as TipoImport, label: "Motos", icon: "🏍️", desc: "Placa, marca, grupo, color" },
  { key: "clientes" as TipoImport, label: "Clientes", icon: "👥", desc: "Nombre, cédula, teléfono" },
  { key: "pagos" as TipoImport, label: "Pagos históricos", icon: "💵", desc: "Placa o cédula, valor, fecha" },
];

const STEP_LABELS = ["Preparar Excel", "Mapear columnas", "Revisar y confirmar"];

export default function ImportacionView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [paso, setPaso] = useState<Paso>(1);
  const [tipo, setTipo] = useState<TipoImport>("motos");
  const [hojas, setHojas] = useState<string[]>([]);
  const [hojaSeleccionada, setHojaSeleccionada] = useState("");
  const [columnas, setColumnas] = useState<string[]>([]);
  const [filas, setFilas] = useState<Record<string, unknown>[]>([]);
  const [colMap, setColMap] = useState<ColMap>({});
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fechaMin, setFechaMin] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [progreso, setProgreso] = useState<{ actual: number; total: number; errores: string[] } | null>(null);
  const [importDone, setImportDone] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const camposActivos = tipo === "motos" ? CAMPOS_MOTOS : tipo === "clientes" ? CAMPOS_CLIENTES : CAMPOS_PAGOS;

  function processFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target?.result, { type: "binary" });
      setWorkbook(wb);
      setHojas(wb.SheetNames);
      setHojaSeleccionada(wb.SheetNames[0]);
      cargarHoja(wb, wb.SheetNames[0]);
    };
    reader.readAsBinaryString(file);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function cargarHoja(wb: XLSX.WorkBook, nombre: string) {
    const ws = wb.Sheets[nombre];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
    if (data.length === 0) return;
    const cols = Object.keys(data[0]);
    setColumnas(cols);
    setFilas(data);
    const autoMap: ColMap = {};
    for (const campo of camposActivos) {
      const match = cols.find(c =>
        c.toLowerCase().replace(/[^a-z]/g, "").includes(campo.key.replace(/_/g, "").toLowerCase()) ||
        campo.key.replace(/_/g, "").toLowerCase().includes(c.toLowerCase().replace(/[^a-z]/g, ""))
      );
      if (match) autoMap[campo.key] = match;
    }
    setColMap(autoMap);
  }

  function onHojaChange(nombre: string) {
    setHojaSeleccionada(nombre);
    if (workbook) cargarHoja(workbook, nombre);
  }

  function registroMapeado(fila: Record<string, unknown>) {
    const r: Record<string, unknown> = {};
    for (const [k, col] of Object.entries(colMap)) {
      if (col) r[k] = fila[col];
    }
    return r;
  }

  function validarFila(r: Record<string, unknown>, idx: number): string | null {
    if (tipo === "motos") {
      if (!r.placa) return `Fila ${idx + 1}: placa vacía`;
      if (!r.marca) return `Fila ${idx + 1}: marca vacía`;
      if (r.grupo && !GRUPO_MAP[String(r.grupo)]) return `Fila ${idx + 1}: grupo inválido "${r.grupo}"`;
    }
    if (tipo === "clientes") {
      if (!r.nombre) return `Fila ${idx + 1}: nombre vacío`;
      if (!r.cedula) return `Fila ${idx + 1}: cédula vacía`;
    }
    if (tipo === "pagos") {
      if (!r.identificador) return `Fila ${idx + 1}: identificador vacío`;
      if (!parseMonto(r.valor)) return `Fila ${idx + 1}: valor inválido`;
      if (!parseDate(r.fecha)) return `Fila ${idx + 1}: fecha inválida`;
    }
    return null;
  }

  const registrosMapeados = filas.map((f, i) => ({ r: registroMapeado(f), i }));
  const validos = registrosMapeados.filter(({ r, i }) => !validarFila(r, i));
  const invalidos = registrosMapeados.map(({ r, i }) => validarFila(r, i)).filter(Boolean) as string[];

  async function importar() {
    setProgreso({ actual: 0, total: validos.length, errores: [] });
    setImportDone(false);
    const errores: string[] = [];
    const batch = 100;

    if (tipo === "motos") {
      const rows = validos.map(({ r }) => ({
        placa: String(r.placa ?? "").toUpperCase().trim(),
        marca: String(r.marca ?? "").trim(),
        modelo: String(r.modelo ?? "").trim() || null,
        grupo: GRUPO_MAP[String(r.grupo ?? "")] ?? "RASTREADOR",
        color: String(r.color ?? "").trim() || null,
        numero_motor: String(r.numero_motor ?? "").trim() || null,
        numero_chasis: String(r.numero_chasis ?? "").trim() || null,
        cilindraje: String(r.cilindraje ?? "").trim() || null,
        propietario: String(r.propietario ?? "").trim() || null,
        estado: "Disponible",
        condicion_ingreso: "usada",
      }));
      for (let i = 0; i < rows.length; i += batch) {
        const chunk = rows.slice(i, i + batch);
        const { error } = await supabase.from("motos").upsert(chunk, { onConflict: "placa" });
        if (error) errores.push(`Batch ${Math.floor(i / batch) + 1}: ${error.message}`);
        setProgreso({ actual: Math.min(i + batch, rows.length), total: rows.length, errores: [...errores] });
      }
    }

    if (tipo === "clientes") {
      const rows = validos.map(({ r }) => ({
        nombre: String(r.nombre ?? "").toUpperCase().trim(),
        cedula: String(r.cedula ?? "").replace(/\D/g, ""),
        telefono: String(r.telefono ?? "").trim() || null,
        whatsapp: String(r.whatsapp ?? "").trim() || null,
        direccion: String(r.direccion ?? "").trim() || null,
        estado: "Activo",
      }));
      for (let i = 0; i < rows.length; i += batch) {
        const chunk = rows.slice(i, i + batch);
        const { error } = await supabase.from("clientes").upsert(chunk, { onConflict: "cedula" });
        if (error) errores.push(`Batch ${Math.floor(i / batch) + 1}: ${error.message}`);
        setProgreso({ actual: Math.min(i + batch, rows.length), total: rows.length, errores: [...errores] });
      }
    }

    if (tipo === "pagos") {
      const { data: contratos } = await supabase.from("contratos").select("id, moto_id, cliente_id, estado").eq("estado", "Activo");
      const { data: motos } = await supabase.from("motos").select("id, placa");
      const { data: clientes } = await supabase.from("clientes").select("id, cedula");

      const filasValidas = validos
        .map(({ r }) => {
          const fecha = parseDate(r.fecha);
          if (!fecha || fecha < fechaMin) return null;
          const idStr = String(r.identificador ?? "").trim();
          const moto = motos?.find(m => m.placa?.toLowerCase() === idStr.toLowerCase());
          const cliente = clientes?.find(c => c.cedula === idStr.replace(/\D/g, ""));
          const contrato = contratos?.find(c =>
            (moto && c.moto_id === moto.id) || (cliente && c.cliente_id === cliente.id)
          );
          if (!contrato) return null;
          const valor = parseMonto(r.valor);
          if (!valor) return null;
          const metodoRaw = String(r.metodo ?? "").toLowerCase();
          const metodo = metodoRaw.includes("transfer") ? "Transferencia" : "Efectivo";
          const estadoRaw = String(r.estado ?? "").toLowerCase();
          const estado = estadoRaw.includes("pend") ? "Pendiente" : "Confirmado";
          return { contrato_id: contrato.id, valor, metodo, estado, fecha, aplicado: { semana: valor, deuda: 0, ahorro: 0, convenio: 0, saldo: 0 }, tipo_registro: "normal" };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      for (let i = 0; i < filasValidas.length; i += batch) {
        const chunk = filasValidas.slice(i, i + batch);
        const { error } = await supabase.from("pagos").insert(chunk);
        if (error) errores.push(`Batch ${Math.floor(i / batch) + 1}: ${error.message}`);
        setProgreso({ actual: Math.min(i + batch, filasValidas.length), total: filasValidas.length, errores: [...errores] });
      }
    }

    setImportDone(true);
  }

  const pct = progreso && progreso.total > 0 ? Math.round((progreso.actual / progreso.total) * 100) : 0;

  return (
    <div style={{ paddingBottom: 48, background: "var(--soft)", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--text) 0%, var(--accent-ink2) 100%)",
        padding: isMobile ? "28px 20px 32px" : "36px 40px 40px",
        marginBottom: 28,
        borderRadius: isMobile ? 0 : "0 0 24px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(2,132,199,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            📊
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "var(--card)" }}>
              Importación de Datos
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--faint)", marginTop: 2 }}>
              Carga tus clientes, motos y contratos desde Excel
            </p>
          </div>
        </div>

        {/* Guía de 3 pasos */}
        <div style={{
          display: "flex",
          gap: isMobile ? 8 : 16,
          marginTop: 24,
          flexDirection: isMobile ? "column" : "row",
        }}>
          {STEP_LABELS.map((label, i) => {
            const done = paso > i + 1;
            const active = paso === i + 1;
            return (
              <div key={i} style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                background: active ? "rgba(2,132,199,0.2)" : done ? "rgba(22,101,52,0.2)" : "rgba(255,255,255,0.06)",
                border: active ? "1px solid rgba(2,132,199,0.5)" : done ? "1px solid rgba(22,101,52,0.4)" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: done ? 16 : 14, fontWeight: 800,
                  background: active ? "var(--accent)" : done ? "var(--ok-ink)" : "rgba(255,255,255,0.1)",
                  color: "var(--card)",
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: active ? "var(--accent-hi)" : done ? "var(--ok-line)" : "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Paso {i + 1}
                  </div>
                  <div style={{ fontSize: 13, color: active ? "var(--card)" : done ? "var(--ok-line)" : "var(--faint)", fontWeight: active ? 700 : 400 }}>
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: isMobile ? "0 16px" : "0 32px" }}>

        {/* PASO 1 */}
        {paso === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Tipo de datos */}
            <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>¿Qué tipo de datos contiene el archivo?</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Selecciona el tipo antes de subir el archivo</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {TIPOS.map(t => (
                  <button key={t.key} onClick={() => setTipo(t.key)} style={{
                    flex: "1 1 140px",
                    padding: "14px 12px",
                    borderRadius: 14,
                    border: tipo === t.key ? "2px solid var(--accent)" : "2px solid var(--line)",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "left",
                    background: tipo === t.key ? "var(--accent-soft2)" : "var(--card)",
                    color: tipo === t.key ? "var(--accent)" : "var(--muted2)",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                    <div>{t.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 400, color: tipo === t.key ? "var(--accent-ink)" : "var(--faint)", marginTop: 2 }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Columnas esperadas */}
            <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                Columnas esperadas para {TIPOS.find(t => t.key === tipo)?.label}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {camposActivos.map(c => (
                  <div key={c.key} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 20,
                    background: c.req ? "var(--accent-soft2)" : "var(--soft2)",
                    border: `1px solid ${c.req ? "var(--accent-line)" : "var(--line)"}`,
                  }}>
                    {c.req && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, fontWeight: c.req ? 700 : 400, color: c.req ? "var(--accent-ink)" : "var(--muted)" }}>{c.label}</span>
                    {c.req && <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700 }}>REQ</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Drag and drop */}
            <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 16 }}>Subir archivo Excel</div>
              <div
                ref={dropRef}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                style={{
                  border: `2px dashed ${dragging ? "var(--accent)" : fileName ? "var(--ok-ink)" : "var(--line2)"}`,
                  borderRadius: 16,
                  padding: isMobile ? "32px 16px" : "52px 32px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: dragging ? "var(--accent-soft2)" : fileName ? "var(--ok-soft)" : "var(--soft2)",
                  transition: "all 0.2s",
                }}>
                <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 12 }}>
                  {fileName ? "✅" : dragging ? "📂" : "📁"}
                </div>
                {fileName ? (
                  <>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ok-ink)" }}>{fileName}</div>
                    <div style={{ fontSize: 12, color: "var(--ok)", marginTop: 4 }}>Archivo cargado — haz clic para cambiar</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--muted2)" }}>
                      {dragging ? "Suelta el archivo aquí" : "Arrastra tu archivo Excel aquí"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>o haz clic para buscar</div>
                    <div style={{ fontSize: 11, color: "var(--line2)", marginTop: 8 }}>Formatos: .xlsx · .xls · .csv</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={onFile} />
              </div>

              {hojas.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  {hojas.length > 1 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted2)", marginBottom: 8 }}>Selecciona la hoja con los datos:</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {hojas.map(h => (
                          <button key={h} onClick={() => onHojaChange(h)} style={{
                            padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                            background: hojaSeleccionada === h ? "var(--accent)" : "var(--soft)",
                            color: hojaSeleccionada === h ? "var(--card)" : "var(--muted2)",
                          }}>{h}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--ok-soft)", border: "1px solid var(--ok-line)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ok-ink)" }}>{fmt(filas.length)} filas · {columnas.length} columnas detectadas</div>
                      <div style={{ fontSize: 11, color: "var(--ok)" }}>Vista previa de las primeras filas a continuación</div>
                    </div>
                  </div>

                  {filas.length > 0 && (
                    <div style={{ marginTop: 14, overflowX: "auto", borderRadius: 12, border: "1px solid var(--line)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                          <tr style={{ background: "var(--soft2)" }}>
                            {columnas.slice(0, 8).map(c => (
                              <th key={c} style={{ padding: "8px 10px", borderBottom: "2px solid var(--line)", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap", color: "var(--muted2)" }}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filas.slice(0, 5).map((f, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--soft2)" }}>
                              {columnas.slice(0, 8).map(c => (
                                <td key={c} style={{ padding: "7px 10px", borderBottom: "1px solid var(--soft)", color: "var(--muted)" }}>{String(f[c] ?? "")}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button onClick={() => setPaso(2)} disabled={filas.length === 0} style={{
                    marginTop: 18,
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: "none",
                    background: filas.length === 0 ? "var(--faint)" : "linear-gradient(90deg, var(--text) 0%, var(--accent-ink2) 100%)",
                    color: "var(--card)",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: filas.length === 0 ? "not-allowed" : "pointer",
                    letterSpacing: "0.02em",
                  }}>
                    Continuar — Mapear columnas →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 28, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Mapeo de columnas</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                Indica qué columna de tu Excel corresponde a cada campo del sistema.
                Las sugerencias automáticas están marcadas en azul.
              </div>
            </div>

            {tipo === "pagos" && (
              <div style={{ marginBottom: 20, padding: "14px 18px", background: "var(--warn-soft)", borderRadius: 14, border: "1px solid var(--warn-line)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)", marginBottom: 8 }}>Fecha mínima de pagos a importar</div>
                <input type="date" value={fechaMin} onChange={e => setFechaMin(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #fbbf24", fontSize: 13, background: "var(--card)" }} />
                <div style={{ fontSize: 11, color: "var(--warn-strong)", marginTop: 6 }}>Pagos anteriores a esta fecha serán ignorados</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {camposActivos.map(campo => {
                const mapped = colMap[campo.key];
                return (
                  <div key={campo.key} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    background: mapped ? "var(--ok-soft)" : "var(--soft2)",
                    borderRadius: 12,
                    border: `1px solid ${mapped ? "var(--ok-line)" : "var(--line)"}`,
                    flexWrap: isMobile ? "wrap" : "nowrap",
                  }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{campo.label}</span>
                        {campo.req && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--card)", background: "var(--accent)", borderRadius: 4, padding: "1px 5px" }}>REQ</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>campo: {campo.key}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
                      <span style={{ fontSize: 18, color: mapped ? "var(--ok)" : "var(--line2)" }}>{mapped ? "→" : "→"}</span>
                      <select
                        value={mapped ?? ""}
                        onChange={e => setColMap(prev => ({ ...prev, [campo.key]: e.target.value }))}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: `1px solid ${mapped ? "var(--ok-line)" : "var(--line)"}`,
                          fontSize: 13,
                          background: "var(--card)",
                          color: mapped ? "var(--ok-ink)" : "var(--muted)",
                          fontWeight: mapped ? 700 : 400,
                        }}>
                        <option value="">— Sin mapear —</option>
                        {columnas.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setPaso(1)} style={{
                padding: "12px 20px", borderRadius: 12, border: "1px solid var(--line)",
                background: "var(--card)", fontWeight: 700, cursor: "pointer", color: "var(--muted)",
              }}>← Atrás</button>
              <button onClick={() => setPaso(3)} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(90deg, var(--text) 0%, var(--accent-ink2) 100%)",
                color: "var(--card)", fontWeight: 800, fontSize: 15, cursor: "pointer",
              }}>
                Continuar — Ver preview →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* KPIs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 140px", padding: "16px 18px", background: "var(--card)", borderRadius: 16, boxShadow: "0 2px 12px rgba(15,23,42,0.06)", borderLeft: "4px solid var(--ok)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ok-ink)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Registros válidos</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "var(--ok-ink)", marginTop: 4 }}>{fmt(validos.length)}</div>
                <div style={{ fontSize: 11, color: "var(--ok)" }}>Listos para importar</div>
              </div>
              <div style={{ flex: "1 1 140px", padding: "16px 18px", background: "var(--card)", borderRadius: 16, boxShadow: "0 2px 12px rgba(15,23,42,0.06)", borderLeft: "4px solid #f87171" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--bad-ink)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Con errores</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "var(--bad-ink)", marginTop: 4 }}>{fmt(invalidos.length)}</div>
                <div style={{ fontSize: 11, color: "var(--bad-line)" }}>Se omitirán</div>
              </div>
              <div style={{ flex: "1 1 140px", padding: "16px 18px", background: "var(--card)", borderRadius: 16, boxShadow: "0 2px 12px rgba(15,23,42,0.06)", borderLeft: "4px solid var(--faint)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total en archivo</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", marginTop: 4 }}>{fmt(filas.length)}</div>
                <div style={{ fontSize: 11, color: "var(--faint)" }}>Filas leídas</div>
              </div>
            </div>

            {/* Errores */}
            {invalidos.length > 0 && (
              <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)", border: "1px solid var(--bad-line)" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bad-ink)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span> Filas con errores (se omitirán al importar)
                </div>
                <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                  {invalidos.slice(0, 20).map((e, i) => (
                    <div key={i} style={{ fontSize: 12, color: "var(--bad-ink)", padding: "5px 10px", background: "var(--bad-soft)", borderRadius: 8 }}>• {e}</div>
                  ))}
                  {invalidos.length > 20 && <div style={{ fontSize: 12, color: "var(--faint)", padding: "4px 10px" }}>... y {invalidos.length - 20} más</div>}
                </div>
              </div>
            )}

            {/* Preview */}
            <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 14 }}>
                Vista previa — primeras {Math.min(validos.length, 15)} filas válidas
              </div>
              <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--line)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--soft2)" }}>
                      {camposActivos.filter(c => colMap[c.key]).map(c => (
                        <th key={c.key} style={{ padding: "9px 12px", borderBottom: "2px solid var(--line)", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap", color: "var(--muted2)" }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validos.slice(0, 15).map(({ r }, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "var(--card)" : "var(--soft2)" }}>
                        {camposActivos.filter(c => colMap[c.key]).map(c => (
                          <td key={c.key} style={{ padding: "7px 12px", borderBottom: "1px solid var(--soft)", color: "var(--muted2)" }}>{String(r[c.key] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validos.length > 15 && (
                <div style={{ fontSize: 12, color: "var(--faint)", padding: "8px 4px" }}>... y {validos.length - 15} registros más no mostrados</div>
              )}
            </div>

            {/* Progreso */}
            {progreso && (
              <div style={{ background: "var(--card)", borderRadius: 18, padding: isMobile ? 18 : 24, boxShadow: "0 2px 16px rgba(15,23,42,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>
                  <span>{importDone ? "Importación completa" : `Importando... ${fmt(progreso.actual)} / ${fmt(progreso.total)}`}</span>
                  <span style={{ color: importDone ? "var(--ok-ink)" : "var(--accent)" }}>{pct}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "var(--soft)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 999,
                    width: `${pct}%`,
                    background: importDone ? "linear-gradient(90deg, var(--ok-ink), var(--ok))" : "linear-gradient(90deg, var(--accent), var(--accent-hi))",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                {progreso.errores.length > 0 && (
                  <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--bad-soft)", borderRadius: 12, fontSize: 12, color: "var(--bad-ink)", border: "1px solid var(--bad-line)" }}>
                    {progreso.errores.map((e, i) => <div key={i} style={{ marginBottom: 4 }}>• {e}</div>)}
                  </div>
                )}
                {importDone && progreso.errores.length === 0 && (
                  <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--ok-soft)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "var(--ok-ink)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    {fmt(progreso.actual)} registros importados correctamente
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setPaso(2)} disabled={!!progreso && !importDone} style={{
                padding: "13px 20px", borderRadius: 14, border: "1px solid var(--line)",
                background: "var(--card)", fontWeight: 700, cursor: !!progreso && !importDone ? "not-allowed" : "pointer", color: "var(--muted)",
                opacity: !!progreso && !importDone ? 0.5 : 1,
              }}>← Atrás</button>
              {!importDone ? (
                <button
                  onClick={importar}
                  disabled={validos.length === 0 || (!!progreso && !importDone)}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 14, border: "none",
                    background: validos.length === 0 ? "var(--faint)" : "linear-gradient(90deg, var(--ok-ink), var(--ok))",
                    color: "var(--card)", fontWeight: 800, fontSize: 15,
                    cursor: validos.length === 0 || (!!progreso && !importDone) ? "not-allowed" : "pointer",
                    opacity: !!progreso && !importDone ? 0.7 : 1,
                  }}>
                  {progreso && !importDone ? "Importando..." : `Importar ${fmt(validos.length)} registros válidos`}
                </button>
              ) : (
                <button
                  onClick={() => { setPaso(1); setProgreso(null); setImportDone(false); setFilas([]); setColumnas([]); setHojas([]); setWorkbook(null); setFileName(""); }}
                  style={{ flex: 1, padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(90deg, var(--text) 0%, var(--accent-ink2) 100%)", color: "var(--card)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                  Importar otro archivo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
