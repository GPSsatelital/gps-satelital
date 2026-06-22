import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";

function fmt(n: number) { return n.toLocaleString("es-CO"); }

type TipoImport = "motos" | "clientes" | "pagos";
type Paso = 1 | 2 | 3;

type ColMap = Record<string, string>; // campo_sistema → columna_excel

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
};

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    // Excel serial date
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

export default function ImportacionView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paso, setPaso] = useState<Paso>(1);
  const [tipo, setTipo] = useState<TipoImport>("motos");
  const [hojas, setHojas] = useState<string[]>([]);
  const [hojaSeleccionada, setHojaSeleccionada] = useState("");
  const [columnas, setColumnas] = useState<string[]>([]);
  const [filas, setFilas] = useState<Record<string, unknown>[]>([]);
  const [colMap, setColMap] = useState<ColMap>({});
  const [fechaMin, setFechaMin] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [progreso, setProgreso] = useState<{ actual: number; total: number; errores: string[] } | null>(null);
  const [importDone, setImportDone] = useState(false);

  const camposActivos = tipo === "motos" ? CAMPOS_MOTOS : tipo === "clientes" ? CAMPOS_CLIENTES : CAMPOS_PAGOS;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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

  function cargarHoja(wb: XLSX.WorkBook, nombre: string) {
    const ws = wb.Sheets[nombre];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
    if (data.length === 0) return;
    const cols = Object.keys(data[0]);
    setColumnas(cols);
    setFilas(data);
    // Auto-mapeo por similitud de nombre
    const autoMap: ColMap = {};
    for (const campo of camposActivos) {
      const match = cols.find(c => c.toLowerCase().replace(/[^a-z]/g, "").includes(campo.key.replace(/_/g, "").toLowerCase())
        || campo.key.replace(/_/g, "").toLowerCase().includes(c.toLowerCase().replace(/[^a-z]/g, "")));
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
      // Para pagos: buscar contratos activos para cada identificador (placa o cédula)
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
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Importación de Datos Excel</h2>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Solo para ADMIN PRINCIPAL — importa motos, clientes o pagos históricos desde Excel</div>
      </div>

      {/* Pasos */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([1, 2, 3] as Paso[]).map(p => (
          <div key={p} style={{ flex: 1, textAlign: "center", padding: "10px 8px", borderRadius: 12, fontWeight: 700, fontSize: 13,
            background: paso === p ? "#0f172a" : paso > p ? "#dcfce7" : "#f1f5f9",
            color: paso === p ? "white" : paso > p ? "#166534" : "#94a3b8" }}>
            {paso > p ? "✓ " : ""}{p === 1 ? "1. Cargar archivo" : p === 2 ? "2. Mapear columnas" : "3. Importar"}
          </div>
        ))}
      </div>

      {/* PASO 1 */}
      {paso === 1 && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>¿Qué tipo de datos contiene el archivo?</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {([
                { key: "motos", label: "🏍️ Motos" },
                { key: "clientes", label: "👥 Clientes" },
                { key: "pagos", label: "💵 Pagos históricos" },
              ] as { key: TipoImport; label: string }[]).map(t => (
                <button key={t.key} onClick={() => setTipo(t.key)} style={{
                  padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  background: tipo === t.key ? "#0f172a" : "#f1f5f9",
                  color: tipo === t.key ? "white" : "#64748b",
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: "2px dashed #cbd5e1", borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#334155" }}>Haz clic para seleccionar el archivo</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Formatos aceptados: .xlsx, .xls, .csv</div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={onFile} />
          </div>

          {hojas.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Hojas encontradas — selecciona la que contiene los datos:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {hojas.map(h => (
                  <button key={h} onClick={() => onHojaChange(h)} style={{
                    padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: hojaSeleccionada === h ? "#0284c7" : "#f1f5f9",
                    color: hojaSeleccionada === h ? "white" : "#334155",
                  }}>{h}</button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#f1f5f9", fontSize: 13, color: "#334155" }}>
                ✅ <strong>{fmt(filas.length)}</strong> filas cargadas — <strong>{columnas.length}</strong> columnas detectadas
              </div>
              {/* Preview primeras 3 filas */}
              {filas.length > 0 && (
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr>{columnas.slice(0, 8).map(c => <th key={c} style={{ padding: "6px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filas.slice(0, 3).map((f, i) => (
                        <tr key={i}>{columnas.slice(0, 8).map(c => <td key={c} style={{ padding: "5px 8px", border: "1px solid #f1f5f9", color: "#64748b" }}>{String(f[c] ?? "")}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button onClick={() => setPaso(2)} disabled={filas.length === 0}
                style={{ marginTop: 16, padding: "12px 24px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Continuar → Mapear columnas
              </button>
            </div>
          )}
        </div>
      )}

      {/* PASO 2 */}
      {paso === 2 && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Mapeo de columnas</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Indica qué columna de tu Excel corresponde a cada campo del sistema</div>

          {tipo === "pagos" && (
            <div style={{ marginBottom: 20, padding: "12px 16px", background: "#fef3c7", borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>⚠️ Fecha mínima de pagos a importar</div>
              <input type="date" value={fechaMin} onChange={e => setFechaMin(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <div style={{ fontSize: 11, color: "#92400e", marginTop: 4 }}>Pagos anteriores a esta fecha serán ignorados</div>
            </div>
          )}

          <div style={{ display: "grid", gap: 12 }}>
            {camposActivos.map(campo => (
              <div key={campo.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{campo.label}</span>
                  {campo.req && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                </div>
                <select value={colMap[campo.key] ?? ""} onChange={e => setColMap(prev => ({ ...prev, [campo.key]: e.target.value }))}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "white" }}>
                  <option value="">— Sin mapear —</option>
                  {columnas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button onClick={() => setPaso(1)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", color: "#64748b" }}>← Atrás</button>
            <button onClick={() => setPaso(3)} style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Continuar → Ver preview
            </button>
          </div>
        </div>
      )}

      {/* PASO 3 */}
      {paso === 3 && (
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Preview y confirmación</div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: "#dcfce7", borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Registros válidos</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#166534" }}>{fmt(validos.length)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: "#fee2e2", borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Con errores</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#991b1b" }}>{fmt(invalidos.length)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: "12px 16px", background: "#f1f5f9", borderRadius: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase" }}>Total en archivo</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>{fmt(filas.length)}</div>
            </div>
          </div>

          {invalidos.length > 0 && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fff5f5", borderRadius: 12, border: "1px solid #fecaca" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#991b1b", marginBottom: 8 }}>Errores encontrados (se omitirán al importar):</div>
              <div style={{ maxHeight: 120, overflowY: "auto" }}>
                {invalidos.slice(0, 20).map((e, i) => <div key={i} style={{ fontSize: 12, color: "#991b1b", padding: "2px 0" }}>• {e}</div>)}
                {invalidos.length > 20 && <div style={{ fontSize: 12, color: "#94a3b8" }}>... y {invalidos.length - 20} más</div>}
              </div>
            </div>
          )}

          {/* Preview tabla */}
          <div style={{ overflowX: "auto", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{camposActivos.filter(c => colMap[c.key]).map(c => <th key={c.key} style={{ padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {validos.slice(0, 15).map(({ r }, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                    {camposActivos.filter(c => colMap[c.key]).map(c => <td key={c.key} style={{ padding: "6px 10px", border: "1px solid #f1f5f9", color: "#334155" }}>{String(r[c.key] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {validos.length > 15 && <div style={{ fontSize: 12, color: "#94a3b8", padding: "8px 0" }}>... y {validos.length - 15} registros más</div>}
          </div>

          {/* Progreso */}
          {progreso && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span>{importDone ? "✅ Importación completa" : `Importando... ${fmt(progreso.actual)} / ${fmt(progreso.total)}`}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: importDone ? "#166534" : "#0284c7", transition: "width 0.3s" }} />
              </div>
              {progreso.errores.length > 0 && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#fff5f5", borderRadius: 10, fontSize: 12, color: "#991b1b" }}>
                  {progreso.errores.map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}
              {importDone && progreso.errores.length === 0 && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#dcfce7", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#166534" }}>
                  ✅ {fmt(progreso.actual)} registros importados correctamente
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setPaso(2)} disabled={!!progreso && !importDone}
              style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", fontWeight: 700, cursor: "pointer", color: "#64748b" }}>← Atrás</button>
            {!importDone ? (
              <button onClick={importar} disabled={validos.length === 0 || (!!progreso && !importDone)}
                style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: validos.length === 0 ? "#94a3b8" : "#166534", color: "white", fontWeight: 700, fontSize: 14, cursor: validos.length === 0 ? "not-allowed" : "pointer" }}>
                {progreso && !importDone ? "Importando..." : `✅ Importar ${fmt(validos.length)} registros válidos`}
              </button>
            ) : (
              <button onClick={() => { setPaso(1); setProgreso(null); setImportDone(false); setFilas([]); setColumnas([]); setHojas([]); setWorkbook(null); }}
                style={{ flex: 1, padding: "12px 20px", borderRadius: 12, border: "none", background: "#0f172a", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Importar otro archivo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
