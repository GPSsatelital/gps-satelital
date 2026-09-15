import React, { useState, useMemo } from "react";
import { useTaller, type TallerEstado, type TallerItem } from "../hooks/useTaller";
import { useMotos } from "../hooks/useMotos";
import { useContratos, type Contrato } from "../hooks/useContratos";
import { supabase } from "../lib/supabase";
import { useScope } from "../contexts/SubadminScopeContext";
import { useAuth } from "../contexts/AuthContext";
import { hoyISO, fmtFechaCorta } from "../utils/fecha";
import { useClientes } from "../hooks/useClientes";
import ModalResolverTiempoFueraServicio from "../components/ModalResolverTiempoFueraServicio";
import MoneyInput from "../components/MoneyInput";
import { Badge, type BadgeTone } from "../components/atomos";
import { useBackGuard } from "../contexts/BackNav";
import { useBloquearScrollFondo } from "../hooks/useBloquearScrollFondo";
import { usePrestamos } from "../hooks/usePrestamos";
import { useDeudas } from "../hooks/useDeudas";
import ModalDeuda from "../components/ModalDeuda";
import { MULTA_RECOLECCION } from "../utils/inmovilizacion";
import { contratoDeLaMoto, prestamoActivoDeOriginal, diasEnTaller as diasEnTallerUtil,
         agregarPeticion, resolverPeticion, peticionesPendientes,
         type FotoLibreTaller } from "../utils/taller";
import ModalIngresoTaller, {
  ModalTaller, RepuestosEditor, repuestosToText, repuestosToTotal, type RepuestoItem,
  subirAngulosTaller, subirLibresTaller, nuevoId,
} from "../components/ModalIngresoTaller";
import { GridFotosLibres, GaleriaFotos, type FotoLibreLocal } from "../components/FotosLibres";
import { ANGULOS_FOTO, GridFotosAngulos, type AnguloFoto } from "../components/FotosAngulos";
import type { ViewKey } from "../App";

// Quién puede cobrarle el arreglo al cliente desde el taller: los mismos cuatro roles a los que la
// base les deja registrar deudas (mig 026). El mecánico anota el trabajo; cobrar es de la oficina.
// Decisión del dueño, 7-sep-2026.
const ROLES_COBRAN = ["ADMIN", "ADMIN_PRINCIPAL", "SECRETARIA", "SUBADMIN"];

const TALLER_TONE: Record<TallerEstado, BadgeTone> = {
  Pendiente: "warn",
  "En diagnóstico": "accent",
  "En reparación": "bad",
  "Listo para salida": "ok",
  Finalizado: "neutral",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--line2)",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
  background: "var(--card)",
};
const labelStyle: React.CSSProperties = { marginBottom: 4, fontSize: 13, fontWeight: 600, color: "var(--muted2)", display: "block" };
const card: React.CSSProperties = { background: "var(--card)", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(15,23,42,0.08)" };
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)",
  color: "#0f172a",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};
const dangerBtn: React.CSSProperties = {
  background: "var(--bad-soft)",
  color: "var(--bad-ink)",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};
const ghostBtn: React.CSSProperties = {
  background: "var(--line)",
  color: "var(--muted2)",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 13,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADOS: TallerEstado[] = ["Pendiente", "En diagnóstico", "En reparación", "Listo para salida", "Finalizado"];

const ESTADO_COLORS: Record<TallerEstado, { bg: string; color: string }> = {
  Pendiente: { bg: "var(--warn-soft)", color: "var(--warn-ink)" },
  "En diagnóstico": { bg: "var(--accent-soft3)", color: "var(--accent-ink)" },
  "En reparación": { bg: "var(--bad-soft)", color: "var(--bad-ink)" },
  "Listo para salida": { bg: "var(--ok-soft)", color: "var(--ok-ink)" },
  Finalizado: { bg: "var(--line)", color: "var(--muted2)" },
};

// Las dos leen la fecha como día local (ver `fmtFechaCorta` en utils/fecha.ts): con el parse
// UTC de antes, la orden del 4 salía "3/9/2026" y con un día de menos en taller.
const formatDate = (date: string | null) => fmtFechaCorta(date);
const diasEnTaller = (fechaIngreso: string | null, fechaSalida: string | null) => diasEnTallerUtil(fechaIngreso, fechaSalida, hoyISO());

function formatCOP(value: number) {
  return "$ " + value.toLocaleString("es-CO");
}

function TallerBadge({ estado }: { estado: TallerEstado }) {
  return <Badge tone={TALLER_TONE[estado] ?? "neutral"}>{estado}</Badge>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ ...card, borderLeft: `4px solid ${accent ?? "var(--accent)"}` }}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>{value}</div>
    </div>
  );
}

// ─── Orden Card ────────────────────────────────────────────────────────────────

function OrdenCard({
  item,
  motoLabel,
  onSelect,
  selected,
}: {
  item: TallerItem;
  motoLabel: string;
  onSelect: () => void;
  selected: boolean;
}) {
  const dias = diasEnTaller(item.fecha_ingreso, item.fecha_salida);
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        background: selected ? "var(--accent-soft)" : "var(--soft2)",
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--line)"}`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{motoLabel}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            Ingreso: {formatDate(item.fecha_ingreso)} · {dias} día{dias !== 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted2)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
            {item.detalle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <TallerBadge estado={item.estado_tecnico} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{formatCOP(item.costo)}</div>
        </div>
      </div>
      {item.repuestos && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          Repuestos: {item.repuestos}
        </div>
      )}
    </div>
  );
}

// El wrapper de ventana, el editor de repuestos y el formulario de ingreso se mudaron a
// `components/ModalIngresoTaller.tsx` (12-sep-2026): desde Motos → "Registrar novedad" →
// "Ingresar a taller" se abre EL MISMO formulario, para que no haya dos maneras de meter una
// moto al taller. Se importan arriba.

function ActualizarModal({
  item,
  motoLabel,
  onClose,
  onActualizar,
}: {
  item: TallerItem;
  motoLabel: string;
  onClose: () => void;
  onActualizar: (id: string, estado: TallerEstado, costoExtra: number, repuestosExtra: string, trabajo: string) => Promise<void>;
}) {
  const [nuevoEstado, setNuevoEstado] = useState<TallerEstado>(item.estado_tecnico);
  const [trabajo, setTrabajo] = useState("");
  const [manoObraExtra, setManoObraExtra] = useState("");
  const [repuestosItems, setRepuestosItems] = useState<RepuestoItem[]>([]);
  const [saving, setSaving] = useState(false);

  const costoRepuestos = repuestosToTotal(repuestosItems);
  const costoExtra = (Number(manoObraExtra) || 0) + costoRepuestos;

  async function handleSubmit() {
    if (saving) return;
    setSaving(true);
    await onActualizar(item.id, nuevoEstado, costoExtra, repuestosToText(repuestosItems), trabajo);
    setSaving(false);
    onClose();
  }

  return (
    <ModalTaller onClose={onClose} title="Registrar trabajo / repuestos">
      <div style={{ marginBottom: 16, padding: "10px 14px", background: "var(--soft2)", borderRadius: 10, fontSize: 14 }}>
        <strong>{motoLabel}</strong>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Ingresó: {formatDate(item.fecha_ingreso)} · Costo acumulado: {formatCOP(item.costo)}
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>¿Qué se le hizo?</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={trabajo}
            onChange={(e) => setTrabajo(e.target.value)}
            placeholder="Ej: cambio de rodamientos del motor, ajuste de cadena, prueba de ruta"
          />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Queda anotado con la fecha de hoy, debajo de lo anterior. Es lo que sale en la orden impresa y en la ficha de la moto.
          </div>
        </div>
        <div>
          <label style={labelStyle}>Nuevo estado</label>
          <select style={inputStyle} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value as TallerEstado)}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <RepuestosEditor items={repuestosItems} onChange={setRepuestosItems} />
        <MoneyInput label="Mano de obra adicional" value={manoObraExtra} onChange={setManoObraExtra} />
        {costoExtra > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--accent-soft4)", border: "1px solid var(--accent-line)", fontSize: 13 }}>
            Nuevo total acumulado: <strong style={{ color: "var(--accent)" }}>{formatCOP(item.costo + costoExtra)}</strong>
            <span style={{ color: "var(--faint)", marginLeft: 8 }}>(+{formatCOP(costoExtra)})</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button onClick={handleSubmit} style={primaryBtn} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      </div>
    </ModalTaller>
  );
}

// ─── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: accent ? 800 : 500, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</div>
    </div>
  );
}

// ─── Detalle Panel ─────────────────────────────────────────────────────────────

// ─── Evidencias y peticiones (mig 150) ─────────────────────────────────────────────────────────

/** Agregar fotos sueltas del arreglo a una orden que ya existe. */
function ModalFotosLibres({ onClose, onGuardar }: { onClose: () => void; onGuardar: (fotos: FotoLibreLocal[]) => Promise<void> }) {
  const [fotos, setFotos] = useState<FotoLibreLocal[]>([]);
  const [guardando, setGuardando] = useState(false);
  return (
    <ModalTaller onClose={onClose} title="Fotos del arreglo">
      <div style={{ display: "grid", gap: 14, textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.45 }}>
          El daño, el repuesto viejo, cómo quedó. Quedan pegadas a esta orden.
        </div>
        <GridFotosLibres fotos={fotos} onChange={setFotos} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={guardando} style={ghostBtn}>Cancelar</button>
          <button
            onClick={async () => { if (guardando) return; setGuardando(true); try { await onGuardar(fotos); } finally { setGuardando(false); } }}
            disabled={guardando || fotos.length === 0}
            style={{ ...primaryBtn, fontSize: 13, opacity: guardando || fotos.length === 0 ? 0.6 : 1 }}
          >
            {guardando ? "Subiendo..." : `Guardar ${fotos.length || ""}`.trim()}
          </button>
        </div>
      </div>
    </ModalTaller>
  );
}

/** Escribir una petición: lo que hay que autorizar para poder seguir. */
function ModalPeticion({ onClose, onGuardar }: { onClose: () => void; onGuardar: (texto: string) => Promise<void> }) {
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  return (
    <ModalTaller onClose={onClose} title="Nueva petición">
      <div style={{ display: "grid", gap: 14, textAlign: "left" }}>
        <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.45 }}>
          Lo que se necesita para seguir con el arreglo, o lo que pidió el cliente. Queda con tu
          nombre y la fecha, esperando respuesta de la oficina.
        </div>
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Ej: hay que cambiar la cadena, vale $85.000."
          style={{ ...inputStyle, minHeight: 90, resize: "vertical", fontFamily: "inherit" }}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={guardando} style={ghostBtn}>Cancelar</button>
          <button
            onClick={async () => { if (guardando || !texto.trim()) return; setGuardando(true); try { await onGuardar(texto); } finally { setGuardando(false); } }}
            disabled={guardando || !texto.trim()}
            style={{ ...primaryBtn, fontSize: 13, opacity: guardando || !texto.trim() ? 0.6 : 1 }}
          >
            {guardando ? "Guardando..." : "Guardar petición"}
          </button>
        </div>
      </div>
    </ModalTaller>
  );
}

/**
 * Cerrar la orden. Las 6 fotos de cómo salió se piden AQUÍ, no después: es la última vez que la
 * moto está en el taller para fotografiarla, y son la prueba del estado en que se entregó.
 */
function ModalCerrarOrden({ finLabel, motoLabel, onClose, onCerrar }: {
  finLabel: string;
  motoLabel: string;
  onClose: () => void;
  onCerrar: (fotos: Partial<Record<AnguloFoto, string>>) => Promise<void>;
}) {
  const [fotos, setFotos] = useState<Partial<Record<AnguloFoto, string>>>({});
  const [guardando, setGuardando] = useState(false);
  const faltan = ANGULOS_FOTO.filter(a => !fotos[a.key]);
  return (
    <ModalTaller onClose={onClose} title="Cerrar la orden">
      <div style={{ display: "grid", gap: 14, textAlign: "left" }}>
        <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.45 }}>
          <strong>{motoLabel}</strong><br />{finLabel.replace("Finalizar: ", "")}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted2)", marginBottom: 4 }}>Cómo salió — las 6 fotos</div>
          <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 6 }}>
            La prueba del estado en que se entrega. Sin ellas no se puede cerrar.
          </div>
          <GridFotosAngulos fotos={fotos} onChange={setFotos} />
        </div>
        {faltan.length > 0 && (
          <div style={{ fontSize: 12, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px" }}>
            Falta: {faltan.map(a => a.label).join(", ")}.
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={onClose} disabled={guardando} style={ghostBtn}>Cancelar</button>
          <button
            onClick={async () => { if (guardando || faltan.length > 0) return; setGuardando(true); try { await onCerrar(fotos); } finally { setGuardando(false); } }}
            disabled={guardando || faltan.length > 0}
            style={{ ...primaryBtn, fontSize: 13, opacity: guardando || faltan.length > 0 ? 0.6 : 1 }}
          >
            {guardando ? "Cerrando..." : "Cerrar orden"}
          </button>
        </div>
      </div>
    </ModalTaller>
  );
}

function DetallePanel({
  item,
  motoLabel,
  clienteNombre,
  enPrestamo,
  cobro,
  finLabel,
  puedeAutorizar,
  onActualizar,
  onCobrar,
  onFinalizar,
  onImprimir,
  onCambiarEstado,
  onAgregarFotos,
  onNuevaPeticion,
  onResolverPeticion,
}: {
  item: TallerItem;
  motoLabel: string;
  /** Dueño de la moto (por contrato vivo o por préstamo de reemplazo). null = sin cliente. */
  clienteNombre: string | null;
  /** Su cliente anda en una moto prestada mientras esta se arregla. */
  enPrestamo: boolean;
  /** Si este usuario puede cobrar y, si ya se cobró, cuánto quedó registrado. */
  cobro: { puede: boolean; montoCobrado: number | null };
  finLabel: string;
  /** Quién puede responder una petición: la oficina, no el mecánico. */
  puedeAutorizar: boolean;
  onActualizar: () => void;
  onCobrar: () => void;
  onFinalizar: () => void;
  onImprimir: () => void;
  onCambiarEstado: () => void;
  onAgregarFotos: () => void;
  onNuevaPeticion: () => void;
  onResolverPeticion: (peticionId: string, estado: "autorizada" | "rechazada") => void;
}) {
  const dias = diasEnTaller(item.fecha_ingreso, item.fecha_salida);
  const finalizado = item.estado_tecnico === "Finalizado";
  const rotulo: React.CSSProperties = { fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <TallerBadge estado={item.estado_tecnico} />
        <button onClick={onImprimir} style={{ ...ghostBtn, fontSize: 12 }}>Imprimir orden</button>
      </div>

      <Row label="Moto" value={motoLabel} />
      <Row label="Cliente" value={clienteNombre ? clienteNombre.toUpperCase() : "Sin cliente (moto de la flota)"} />
      {enPrestamo && (
        <div style={{ fontSize: 12.5, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px", lineHeight: 1.45 }}>
          Su cliente anda en una moto prestada. Al finalizar, esta queda esperando que se la devuelvan; no vuelve al pool.
        </div>
      )}
      <Row label="Dias en taller" value={`${dias} dia${dias !== 1 ? "s" : ""}`} />
      <Row label="Fecha ingreso" value={formatDate(item.fecha_ingreso)} />
      {item.llegada && (
        <Row
          label="Cómo llegó"
          value={item.llegada === "fue_buscada"
            ? `Se fue a buscar (se le cobró $${MULTA_RECOLECCION.toLocaleString("es-CO")})`
            : "La trajo el cliente"}
        />
      )}
      {finalizado && <Row label="Fecha salida" value={formatDate(item.fecha_salida)} />}
      <Row label="Costo acumulado" value={formatCOP(item.costo)} accent />
      <div>
        <div style={rotulo}>Con qué entró</div>
        <div style={{ fontSize: 14, color: "var(--text)", background: "var(--soft2)", borderRadius: 10, padding: "10px 14px" }}>{item.detalle}</div>
      </div>
      <div>
        <div style={rotulo}>Cómo entró</div>
        <GaleriaFotos fotos={anguloAFotos(item.fotos_entrada)} vacio="Esta orden se abrió antes de que se pidieran fotos." />
      </div>

      <div>
        <div style={{ ...rotulo, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span>Fotos del arreglo</span>
          {!finalizado && <button onClick={onAgregarFotos} style={{ ...ghostBtn, fontSize: 11, padding: "4px 10px" }}>+ Agregar foto</button>}
        </div>
        <GaleriaFotos fotos={(item.fotos_libres ?? []).map(f => ({ url: f.url, nota: f.nota }))} vacio="Sin fotos del daño ni de los repuestos." />
      </div>

      <div>
        <div style={{ ...rotulo, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span>Peticiones y autorizaciones</span>
          {!finalizado && <button onClick={onNuevaPeticion} style={{ ...ghostBtn, fontSize: 11, padding: "4px 10px" }}>+ Nueva petición</button>}
        </div>
        {(item.peticiones ?? []).length === 0
          ? <div style={{ fontSize: 13, color: "var(--faint)", fontStyle: "italic" }}>Nadie ha pedido nada en esta orden.</div>
          : (
            <div style={{ display: "grid", gap: 8 }}>
              {(item.peticiones ?? []).map(pt => (
                <div key={pt.id} style={{
                  background: "var(--soft2)", borderRadius: 10, padding: "10px 12px",
                  borderLeft: `3px solid ${pt.estado === "autorizada" ? "var(--ok)" : pt.estado === "rechazada" ? "var(--bad)" : "var(--warn)"}`,
                }}>
                  <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.45 }}>{pt.texto}</div>
                  <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>
                    {pt.pedida_por.toUpperCase()} · {formatDate(pt.fecha)}
                  </div>
                  {pt.estado === "pendiente" ? (
                    puedeAutorizar && !finalizado ? (
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        <button onClick={() => onResolverPeticion(pt.id, "autorizada")} style={{ ...ghostBtn, fontSize: 11, padding: "5px 12px", background: "var(--ok-soft)", color: "var(--ok-ink)" }}>Autorizar</button>
                        <button onClick={() => onResolverPeticion(pt.id, "rechazada")} style={{ ...ghostBtn, fontSize: 11, padding: "5px 12px", background: "var(--bad-soft)", color: "var(--bad-ink)" }}>No autorizar</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--warn-ink)", marginTop: 5 }}>Esperando respuesta</div>
                    )
                  ) : (
                    <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5, color: pt.estado === "autorizada" ? "var(--ok-ink)" : "var(--bad-ink)" }}>
                      {pt.estado === "autorizada" ? "Autorizada" : "No autorizada"} por {(pt.resuelta_por ?? "").toUpperCase()} · {formatDate(pt.resuelta_fecha ?? null)}
                      {pt.nota ? ` — ${pt.nota}` : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      <div>
        <div style={rotulo}>Qué se le hizo</div>
        {item.trabajo_realizado
          ? <div style={{ fontSize: 14, color: "var(--text)", background: "var(--soft2)", borderRadius: 10, padding: "10px 14px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{item.trabajo_realizado}</div>
          : <div style={{ fontSize: 13, color: "var(--faint)", fontStyle: "italic" }}>Todavía no se ha anotado nada. Usa "Registrar trabajo / repuestos".</div>}
      </div>
      {item.repuestos && (
        <div>
          <div style={rotulo}>Repuestos</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.repuestos.split(",").map((r, i) => (
              <span key={i} style={{ background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 10px", fontSize: 12, color: "var(--muted2)" }}>
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      {finalizado && (
        <div>
          <div style={rotulo}>Cómo salió</div>
          <GaleriaFotos fotos={anguloAFotos(item.fotos_salida)} vacio="Esta orden se cerró antes de que se pidieran fotos de salida." />
        </div>
      )}
      {cobro.montoCobrado !== null && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-ink)", background: "var(--warn-soft)", border: "1px solid var(--warn-line)", borderRadius: 10, padding: "8px 12px" }}>
          Cobrado al cliente: {formatCOP(cobro.montoCobrado)} (quedó como deuda en su cuenta)
        </div>
      )}

      {!finalizado && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          <button onClick={onCambiarEstado} style={ghostBtn}>Cambiar estado</button>
          <button onClick={onActualizar} style={{ ...ghostBtn, background: "var(--accent-soft3)", color: "var(--accent-ink)" }}>Registrar trabajo / repuestos</button>
          {cobro.puede && clienteNombre && cobro.montoCobrado === null && (
            <button onClick={onCobrar} style={{ ...ghostBtn, background: "var(--warn-soft)", color: "var(--warn-ink)" }}>
              Cobrarle a {clienteNombre.split(" ")[0].toUpperCase()}
            </button>
          )}
          <button onClick={onFinalizar} style={{ ...primaryBtn, fontSize: 13 }}>{finLabel}</button>
        </div>
      )}
    </div>
  );
}

/** Las 6 guiadas se guardan como {angulo: url}; la galería las quiere en orden y con su nombre. */
function anguloAFotos(fotos: Record<string, string> | null | undefined): { url: string; nota: string }[] {
  if (!fotos) return [];
  return ANGULOS_FOTO.filter(a => fotos[a.key]).map(a => ({ url: fotos[a.key], nota: a.label }));
}

// ─── Print helper ──────────────────────────────────────────────────────────────

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function imprimirOrden(item: TallerItem, motoLabel: string, extra: { clienteNombre?: string | null; montoCobrado?: number | null } = {}) {
  const trabajoHtml = item.trabajo_realizado ? escapeHtml(item.trabajo_realizado).replace(/\n/g, "<br>") : "";
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Orden de Taller - ${motoLabel}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: var(--text); }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { margin-bottom: 16px; }
  .label { font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-bottom: 4px; }
  .value { font-size: 14px; font-weight: 500; }
  .detalle { background: var(--soft2); border-radius: 8px; padding: 12px; font-size: 14px; margin-top: 4px; }
  .footer { margin-top: 40px; border-top: 1px solid var(--line); padding-top: 16px; font-size: 12px; color: var(--faint); }
</style>
</head>
<body>
<h1>Orden de Taller</h1>
<div class="sub">Club Moteros Cartagena - ${fmtFechaCorta(hoyISO())}</div>
<div class="grid">
  <div class="field"><div class="label">Moto</div><div class="value">${motoLabel}</div></div>
  <div class="field"><div class="label">Cliente</div><div class="value">${extra.clienteNombre ? escapeHtml(extra.clienteNombre).toUpperCase() : "Sin cliente"}</div></div>
  <div class="field"><div class="label">Estado</div><div class="value">${item.estado_tecnico}</div></div>
<div class="field"><div class="label">Como llego</div><div class="value">${item.llegada === "fue_buscada" ? "Se fue a buscar (se le cobro el movimiento de personal)" : item.llegada === "la_trajo" ? "La trajo el cliente" : "-"}</div></div>
  <div class="field"><div class="label">Fecha ingreso</div><div class="value">${formatDate(item.fecha_ingreso)}</div></div>
  <div class="field"><div class="label">Fecha salida</div><div class="value">${formatDate(item.fecha_salida)}</div></div>
  <div class="field"><div class="label">Dias en taller</div><div class="value">${diasEnTaller(item.fecha_ingreso, item.fecha_salida)}</div></div>
  <div class="field"><div class="label">Costo acumulado</div><div class="value"><strong>${formatCOP(item.costo)}</strong></div></div>
</div>
<div class="field"><div class="label">Con que entro</div><div class="detalle">${escapeHtml(item.detalle)}</div></div>
<div class="field" style="margin-top:16px"><div class="label">Que se le hizo</div><div class="detalle">${trabajoHtml || "Sin anotar"}</div></div>
${item.repuestos ? `<div class="field" style="margin-top:16px"><div class="label">Repuestos utilizados</div><div class="detalle">${escapeHtml(item.repuestos)}</div></div>` : ""}
${(item.peticiones ?? []).length > 0 ? `<div class="field" style="margin-top:16px"><div class="label">Peticiones y autorizaciones</div><div class="detalle">${(item.peticiones ?? []).map(pt => {
  const resp = pt.estado === "pendiente" ? "SIN RESPONDER"
    : `${pt.estado === "autorizada" ? "AUTORIZADA" : "NO AUTORIZADA"} por ${escapeHtml((pt.resuelta_por ?? "").toUpperCase())} el ${fmtFechaCorta(pt.resuelta_fecha ?? null)}`;
  return `&bull; ${escapeHtml(pt.texto)}<br><span style="font-size:11px;color:#555">${escapeHtml(pt.pedida_por.toUpperCase())} &middot; ${fmtFechaCorta(pt.fecha)} &mdash; ${resp}${pt.nota ? " &mdash; " + escapeHtml(pt.nota) : ""}</span>`;
}).join("<br>")}</div></div>` : ""}
${((item.fotos_entrada && Object.keys(item.fotos_entrada).length) || (item.fotos_salida && Object.keys(item.fotos_salida).length) || (item.fotos_libres ?? []).length) ? `<div class="field" style="margin-top:16px"><div class="label">Evidencias</div><div class="detalle">${Object.keys(item.fotos_entrada ?? {}).length} foto(s) de como entro &middot; ${Object.keys(item.fotos_salida ?? {}).length} de como salio &middot; ${(item.fotos_libres ?? []).length} del arreglo (se ven en el sistema)</div></div>` : ""}
${extra.montoCobrado != null ? `<div class="field" style="margin-top:16px"><div class="label">Cobrado al cliente</div><div class="value"><strong>${formatCOP(extra.montoCobrado)}</strong> (registrado como deuda en su cuenta)</div></div>` : ""}
<div class="footer">Generado automaticamente por MotoGestion</div>
<script>window.print();</script>
</body>
</html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TallerView({ onNavigate }: { onNavigate?: (view: ViewKey, filter?: string) => void }) {
  const { taller, loading, error, registrarIngreso, actualizarEstadoTaller, finalizarProceso, anotarTrabajoOrden, guardarEnOrden, vincularDeuda } = useTaller();
  const { motos: todasMotos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { prestamos } = usePrestamos();
  const { deudas } = useDeudas();
  const { filtrarMotos } = useScope();
  const motos = filtrarMotos(todasMotos);
  const { profile, puede } = useAuth();
  const puedeCobrar = ROLES_COBRAN.includes(profile?.role ?? "");
  const puedeRodarTiempo = puede("rodar_tiempo");
  // Quien autoriza una petición es la oficina — los mismos que pueden cobrarle el arreglo al
  // cliente. El mecánico pide y anota; no se autoriza a sí mismo el repuesto.
  const puedeAutorizar = puedeCobrar;
  const quienSoy = profile?.nombre ?? "SISTEMA";
  const [showCobrar, setShowCobrar] = useState(false);
  // Al cerrar la orden de una moto cuyo cliente anda en una prestada: la moto quedó lista pero
  // todavía hay que devolvérsela (eso vive en Inmovilizaciones). Este aviso lo dice y lleva allá.
  const [avisoDevolucion, setAvisoDevolucion] = useState<{ clienteNombre: string; placa: string } | null>(null);

  const [tab, setTab] = useState<"activas" | "historial">("activas");
  const [seleccionId, setSeleccionId] = useState<string | null>(null);
  // El detalle es una ventana flotante: el botón atrás del celular la cierra (y NO se sale del
  // módulo), igual que el resto de capas de la app. Y el fondo se congela mientras está abierta,
  // para que el dedo mueva la ventana y no la lista de atrás.
  useBackGuard(seleccionId !== null, () => setSeleccionId(null));
  useBloquearScrollFondo(seleccionId !== null);
  const [showNueva, setShowNueva] = useState(false);
  const [showActualizar, setShowActualizar] = useState(false);
  // Evidencias y peticiones (mig 150): fotos sueltas del arreglo, una petición nueva, y las 6
  // fotos de cómo salió — que se piden AL CERRAR, no después: es la última vez que la moto está
  // ahí para fotografiarla.
  const [showFotos, setShowFotos] = useState(false);
  const [showPeticion, setShowPeticion] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showCambioEstado, setShowCambioEstado] = useState(false);
  const [tiempoFueraModal, setTiempoFueraModal] = useState<{ contrato: Contrato; motoPlaca: string; clienteNombre: string; fechaEntrada: string; fechaSalida: string } | null>(null);

  const activas = useMemo(() => taller.filter((t) => t.estado_tecnico !== "Finalizado"), [taller]);
  const historial = useMemo(() => taller.filter((t) => t.estado_tecnico === "Finalizado"), [taller]);

  const enDiagnostico = activas.filter((t) => t.estado_tecnico === "En diagnóstico").length;
  const enReparacion = activas.filter((t) => t.estado_tecnico === "En reparación").length;
  const listoSalida = activas.filter((t) => t.estado_tecnico === "Listo para salida").length;

  // Mes de ingreso comparado como texto "YYYY-MM": sin pasar por Date (el parse UTC corría al
  // mes anterior una orden del día 1 vista de noche).
  const costoMes = useMemo(() => {
    const mesActual = hoyISO().slice(0, 7);
    return taller
      .filter((t) => (t.fecha_ingreso ?? "").slice(0, 7) === mesActual)
      .reduce((sum, t) => sum + (t.costo ?? 0), 0);
  }, [taller]);

  const seleccionado = taller.find((t) => t.id === seleccionId) ?? null;

  function getMotoLabel(motoId: string) {
    const m = motos.find((x) => x.id === motoId);
    return m ? `${m.placa} - ${m.marca} ${m.modelo}` : "Moto desconocida";
  }

  // "Asignada" va incluida a propósito: el caso más común es que se dañe la moto de un cliente
  // que la tiene en la calle. Sin esto no se le podía abrir orden de taller (había que cambiarle
  // el estado a mano en Motos, sin dejar diagnóstico ni costo) y, como el préstamo de reemplazo
  // exige que la moto esté en taller, todo ese flujo quedaba bloqueado desde el primer paso.
  // Al crear la orden, useTaller la pasa a Mantenimiento; al cerrarla vuelve a Asignada sola.
  //
  // Las RETENIDAS (Fiscalía / Tránsito / Garantía) quedan FUERA a propósito. Si se le pudiera abrir
  // orden directa a una moto retenida, pasaban dos cosas malas: se quedaba marcada como retenida
  // para siempre (la ficha la mostraría en rojo aunque ya estuviera rodando), y los días entre que
  // la retuvieron y que se abrió la orden no se le cobraban ni se le rodaban a nadie — el taller
  // cuenta desde su fecha de ingreso, no desde la retención. Para llevarla a taller hay que darle
  // primero a "✅ Salida de …" en Motos y elegir ahí "pasa a taller": eso la deja en Mantenimiento,
  // resuelve el tiempo parado y entonces sí aparece en esta lista. Decisión del dueño, 27-jul-2026.
  // Una moto con orden ABIERTA no se ofrece otra vez: se le agrega a la orden que ya tiene
  // ("Registrar trabajo / repuestos"), no se le abre una segunda.
  const motosParaTaller = motos
    .filter((m) => ["Asignada", "Disponible", "Mantenimiento", "Recuperada"].includes(m.estado))
    .filter((m) => !activas.some((t) => t.moto_id === m.id))
    .map((m) => ({ id: m.id, label: `${m.placa} - ${m.marca} ${m.modelo} (${m.estado})` }));

  // De quién es la moto de la orden seleccionada. Pasa por el préstamo de reemplazo: mientras
  // dura, el contrato del cliente apunta a la PRESTADA y no a esta.
  const contratoSel = seleccionado ? contratoDeLaMoto(seleccionado.moto_id, contratos, prestamos) : null;
  const clienteSel = contratoSel ? clientes.find((cl) => cl.id === contratoSel.cliente_id) ?? null : null;
  const prestamoSel = seleccionado ? prestamoActivoDeOriginal(seleccionado.moto_id, prestamos) : null;
  const deudaSel = seleccionado?.deuda_id ? deudas.find((d) => d.id === seleccionado.deuda_id) ?? null : null;
  const motoSel = seleccionado ? motos.find((m) => m.id === seleccionado.moto_id) ?? null : null;
  // Nombre y apellido para los botones: "JOSE SANMARTIN", no "JOSE DEL CARMEN SANMARTIN".
  const nombreCorto = (() => {
    if (!clienteSel) return "";
    const partes = clienteSel.nombre.trim().split(/\s+/);
    return (partes.length >= 2 ? `${partes[0]} ${partes[partes.length - 1]}` : partes[0]).toUpperCase();
  })();
  // El botón dice lo que de verdad va a pasar con la moto (antes decía siempre "pasar a disponible").
  const finLabel = prestamoSel
    ? `Finalizar: lista para devolvérsela a ${nombreCorto}`
    : motoSel?.estado === "En traspaso"
      ? "Finalizar (moto en traspaso)"
      : contratoSel?.estado === "Activo" && contratoSel.moto_id === seleccionado?.moto_id
        ? `Finalizar: vuelve con ${nombreCorto}`
        : "Finalizar: queda disponible";

  async function handleActualizarOrden(id: string, estado: TallerEstado, costoExtra: number, repuestosExtra: string, trabajo: string) {
    await actualizarEstadoTaller(id, estado);
    const found = taller.find((t) => t.id === id);
    if (found && (costoExtra > 0 || repuestosExtra)) {
      const newCosto = found.costo + costoExtra;
      const newRepuestos = [found.repuestos, repuestosExtra].filter(Boolean).join(", ");
      await supabase.from("taller").update({ costo: newCosto, repuestos: newRepuestos }).eq("id", id);
    }
    if (found && trabajo.trim()) {
      const { error: errT } = await anotarTrabajoOrden(id, found.trabajo_realizado, trabajo);
      if (errT) alert("No se pudo guardar la anotación del trabajo: " + errT);
    }
  }

  /** Guarda fotos libres nuevas encima de las que ya tenía la orden (nunca las reemplaza). */
  async function handleAgregarFotos(nuevas: FotoLibreLocal[]) {
    if (!seleccionado || nuevas.length === 0) { setShowFotos(false); return; }
    const { fotos, fallidas } = await subirLibresTaller(seleccionado.id, nuevas, quienSoy);
    const previas: FotoLibreTaller[] = seleccionado.fotos_libres ?? [];
    const { error: err } = await guardarEnOrden(seleccionado.id, { fotos_libres: [...previas, ...fotos] });
    if (err) alert("No se pudieron guardar las fotos: " + err);
    else if (fallidas > 0) alert(`${fallidas} foto(s) no subieron. Intenta de nuevo con esas.`);
    setShowFotos(false);
  }

  async function handleNuevaPeticion(texto: string) {
    if (!seleccionado) return;
    const lista = agregarPeticion(seleccionado.peticiones, { id: nuevoId(), texto, pedidaPor: quienSoy, fechaISO: hoyISO() });
    const { error: err } = await guardarEnOrden(seleccionado.id, { peticiones: lista });
    if (err) alert("No se pudo guardar la petición: " + err);
    setShowPeticion(false);
  }

  async function handleResolverPeticion(peticionId: string, estado: "autorizada" | "rechazada") {
    if (!seleccionado) return;
    const nota = estado === "rechazada" ? (prompt("¿Por qué no se autoriza? (opcional)") ?? "") : "";
    const lista = resolverPeticion(seleccionado.peticiones, peticionId, estado, quienSoy, hoyISO(), nota);
    const { error: err } = await guardarEnOrden(seleccionado.id, { peticiones: lista });
    if (err) alert("No se pudo guardar la respuesta: " + err);
  }

  /** El botón de finalizar abre la ventana de cierre: ahí se toman las 6 fotos de cómo salió. */
  function handleFinalizar() {
    if (!seleccionado) return;
    if (!seleccionado.trabajo_realizado?.trim() && !confirm("No has anotado qué se le hizo a la moto. ¿Cerrar igual?")) return;
    const pendientes = peticionesPendientes(seleccionado.peticiones);
    if (pendientes > 0 && !confirm(`Hay ${pendientes} petición(es) sin responder. ¿Cerrar igual?`)) return;
    setShowCerrar(true);
  }

  async function cerrarOrden(fotosSalida: Partial<Record<AnguloFoto, string>>) {
    if (!seleccionado) return;
    const fechaSalida = hoyISO();
    const sal = await subirAngulosTaller(seleccionado.id, "salida", fotosSalida);
    const { error: errFotos } = await guardarEnOrden(seleccionado.id, { fotos_salida: sal.fotos });
    if (errFotos || sal.fallidas > 0) {
      alert(errFotos
        ? "No se pudieron guardar las fotos de salida: " + errFotos
        : `${sal.fallidas} foto(s) de salida no subieron. La orden NO se cerró: intenta de nuevo.`);
      return;
    }
    setShowCerrar(false);
    const { error: errFin, destino } = await finalizarProceso(seleccionado.id, seleccionado.moto_id);
    if (errFin) { alert("No se pudo finalizar la orden: " + errFin); return; }
    if (destino === "espera_devolucion") {
      setAvisoDevolucion({ clienteNombre: nombreCorto, placa: motoSel?.placa ?? "" });
      setSeleccionId(null);
      return;
    }
    // Quien tenga el permiso `rodar_tiempo` decide cobrar vs rodar (15-sep-2026: antes era la
    // jerarquia de Editar contrato, quemada en el codigo). Si quien finaliza no lo tiene, el
    // tiempo queda pendiente de resolver despues, igual que antes.
    if (puedeRodarTiempo) {
      const contratoActivo = contratos.find(c => c.moto_id === seleccionado.moto_id && c.estado === "Activo");
      const dias = Math.round((new Date(fechaSalida + "T00:00:00").getTime() - new Date(seleccionado.fecha_ingreso + "T00:00:00").getTime()) / 86400000);
      if (contratoActivo && dias > 0) {
        const cliente = clientes.find(cl => cl.id === contratoActivo.cliente_id);
        const moto = motos.find(m => m.id === seleccionado.moto_id);
        setTiempoFueraModal({
          contrato: contratoActivo,
          motoPlaca: moto?.placa ?? "",
          clienteNombre: cliente?.nombre ?? "",
          fechaEntrada: seleccionado.fecha_ingreso,
          fechaSalida,
        });
      }
    }
    setSeleccionId(null);
  }

  if (loading) return <div style={{ padding: 32, color: "var(--muted)", fontSize: 15 }}>Cargando taller...</div>;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0, color: "var(--text)" }}>Taller y Mantenimiento</h2>
          <p style={{ marginTop: 4, color: "var(--muted)", fontSize: 14, margin: "4px 0 0" }}>Control técnico de la flota.</p>
        </div>
        <button onClick={() => setShowNueva(true)} style={primaryBtn}>+ Nueva orden de taller</button>
      </div>

      {error && <div style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>Error: {error}</div>}

      {/* KPIs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En proceso" value={activas.length} accent="var(--accent)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En diagnóstico" value={enDiagnostico} accent="var(--accent-ink)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="En reparación" value={enReparacion} accent="var(--bad-ink)" /></div>
        <div style={{ flex: "1 1 140px" }}><KpiCard label="Listo para salida" value={listoSalida} accent="var(--ok-ink)" /></div>
        <div style={{ flex: "1 1 180px" }}><KpiCard label="Costo total (este mes)" value={formatCOP(costoMes)} accent="var(--ok2)" /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--line)" }}>
        {(["activas", "historial"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSeleccionId(null); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -2,
              padding: "8px 16px",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "var(--accent)" : "var(--muted)",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t === "activas" ? `Órdenes activas (${activas.length})` : `Historial (${historial.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "activas" ? (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Lista */}
          <div style={{ flex: "1 1 320px", display: "grid", gap: 10 }}>
            {activas.length === 0 ? (
              <div style={{ ...card, color: "var(--muted)", fontSize: 14, textAlign: "center", padding: 32 }}>
                No hay órdenes activas.
                <br />
                <button onClick={() => setShowNueva(true)} style={{ ...primaryBtn, marginTop: 14, fontSize: 13 }}>Registrar primera orden</button>
              </div>
            ) : (
              activas.map((item) => (
                <OrdenCard
                  key={item.id}
                  item={item}
                  motoLabel={getMotoLabel(item.moto_id)}
                  selected={seleccionId === item.id}
                  onSelect={() => setSeleccionId(seleccionId === item.id ? null : item.id)}
                />
              ))
            )}
          </div>

        </div>
      ) : (
        /* Historial */
        <div style={card}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            {historial.length === 0
              ? "No hay órdenes finalizadas aún."
              : `${historial.length} orden${historial.length !== 1 ? "es" : ""} finalizada${historial.length !== 1 ? "s" : ""}`}
          </div>
          {historial.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--soft2)" }}>
                    {["Moto", "Con qué entró", "Qué se le hizo", "Repuestos", "Costo", "Ingreso", "Salida", "Días", ""].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--muted2)", borderBottom: "1px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--soft)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text)" }}>{getMotoLabel(item.moto_id)}</td>
                      <td style={{ padding: "10px 12px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted2)" }}>{item.detalle}</td>
                      <td style={{ padding: "10px 12px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted2)" }} title={item.trabajo_realizado ?? ""}>
                        {item.trabajo_realizado ? item.trabajo_realizado.replace(/\n/g, " · ") : "-"}
                        {item.deuda_id && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "var(--warn-ink)" }}>cobrado</span>}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.repuestos || "-"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--accent)" }}>{formatCOP(item.costo)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{formatDate(item.fecha_ingreso)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{formatDate(item.fecha_salida)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--muted)" }}>{diasEnTaller(item.fecha_ingreso, item.fecha_salida)}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          onClick={() => {
                            const c = contratoDeLaMoto(item.moto_id, contratos, prestamos);
                            const cl = c ? clientes.find((x) => x.id === c.cliente_id) : null;
                            const d = item.deuda_id ? deudas.find((x) => x.id === item.deuda_id) : null;
                            imprimirOrden(item, getMotoLabel(item.moto_id), { clienteNombre: cl?.nombre ?? null, montoCobrado: d?.monto ?? null });
                          }}
                          style={{ ...ghostBtn, fontSize: 12, padding: "4px 10px" }}
                        >
                          Imprimir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETALLE DE LA ORDEN — ventana flotante (pedido del dueño, 25-ago): antes era una
          columna al lado que en el celular caía DEBAJO de la lista, y había que bajar toda la
          página para verla y volver a subir para elegir otra orden. Ahora se sobrepone y se
          cierra con la X, tocando el fondo o con el botón atrás del celular. */}
      {seleccionado && seleccionado.estado_tecnico !== "Finalizado" && (
        <div
          onClick={() => setSeleccionId(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.62)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--card)", borderRadius: 16, width: "100%", maxWidth: 460, maxHeight: "92vh", boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 50px rgba(2,6,23,0.45)" }}
          >
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Detalle de la orden</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {getMotoLabel(seleccionado.moto_id)}
                </div>
              </div>
              <button
                onClick={() => setSeleccionId(null)}
                style={{ background: "var(--soft)", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 18, lineHeight: 1, cursor: "pointer", color: "var(--muted2)", flexShrink: 0 }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div style={{ padding: "14px 16px", overflowY: "auto", flex: 1, minHeight: 0 }}>
              <DetallePanel
                item={seleccionado}
                motoLabel={getMotoLabel(seleccionado.moto_id)}
                clienteNombre={clienteSel?.nombre ?? null}
                enPrestamo={prestamoSel !== null}
                cobro={{ puede: puedeCobrar, montoCobrado: deudaSel ? deudaSel.monto : null }}
                finLabel={finLabel}
                onCambiarEstado={() => setShowCambioEstado(true)}
                onActualizar={() => setShowActualizar(true)}
                onCobrar={() => setShowCobrar(true)}
                puedeAutorizar={puedeAutorizar}
                onAgregarFotos={() => setShowFotos(true)}
                onNuevaPeticion={() => setShowPeticion(true)}
                onResolverPeticion={handleResolverPeticion}
                onFinalizar={handleFinalizar}
                onImprimir={() => imprimirOrden(seleccionado, getMotoLabel(seleccionado.moto_id), { clienteNombre: clienteSel?.nombre ?? null, montoCobrado: deudaSel?.monto ?? null })}
              />
            </div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line)" }}>
              <button
                onClick={() => setSeleccionId(null)}
                style={{ ...ghostBtn, width: "100%", padding: "11px 16px", fontSize: 14 }}
              >
                ← Volver a las órdenes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNueva && (
        <ModalIngresoTaller
          motos={motosParaTaller}
          quienRegistra={quienSoy}
          onClose={() => setShowNueva(false)}
          onRegistrar={registrarIngreso}
        />
      )}

      {/* Fotos sueltas del arreglo: el daño, el repuesto viejo, cómo quedó. */}
      {showFotos && seleccionado && (
        <ModalFotosLibres onClose={() => setShowFotos(false)} onGuardar={handleAgregarFotos} />
      )}

      {/* Una petición nueva. El mecánico la escribe; la oficina la responde. */}
      {showPeticion && seleccionado && (
        <ModalPeticion onClose={() => setShowPeticion(false)} onGuardar={handleNuevaPeticion} />
      )}

      {/* Cierre de la orden: las 6 fotos de cómo salió son la prueba de en qué estado se entregó. */}
      {showCerrar && seleccionado && (
        <ModalCerrarOrden
          finLabel={finLabel}
          motoLabel={getMotoLabel(seleccionado.moto_id)}
          onClose={() => setShowCerrar(false)}
          onCerrar={cerrarOrden}
        />
      )}

      {showActualizar && seleccionado && (
        <ActualizarModal
          item={seleccionado}
          motoLabel={getMotoLabel(seleccionado.moto_id)}
          onClose={() => setShowActualizar(false)}
          onActualizar={handleActualizarOrden}
        />
      )}

      {/* Cobrarle el arreglo al cliente: la MISMA ventana de deuda de Cartera, precargada con el
          costo de la orden y lo que se le hizo. La orden queda ligada a la deuda (taller.deuda_id)
          para que no se cobre dos veces y para que el rastro quede en los dos lados. */}
      {showCobrar && seleccionado && contratoSel && clienteSel && (
        <ModalDeuda
          contratoId={contratoSel.id}
          clienteNombre={clienteSel.nombre}
          tipoInicial="daño_vehiculo"
          valorInicial={seleccionado.costo}
          descripcionInicial={
            `Taller ${motoSel?.placa ?? ""} (${formatDate(seleccionado.fecha_ingreso)}): ${seleccionado.detalle}` +
            (seleccionado.trabajo_realizado ? ` — ${seleccionado.trabajo_realizado.replace(/\n/g, " · ")}` : "")
          }
          onRegistrada={async (deudaId) => {
            if (!deudaId) { alert("La deuda quedó registrada, pero no se pudo ligar a la orden. Revísala en Cartera."); return; }
            const { error: errV } = await vincularDeuda(seleccionado.id, deudaId);
            if (errV) alert("La deuda quedó registrada, pero no se pudo ligar a la orden: " + errV);
          }}
          onClose={() => setShowCobrar(false)}
          zIndex={1100}
        />
      )}

      {avisoDevolucion && (
        <ModalTaller onClose={() => setAvisoDevolucion(null)} title="Orden cerrada">
          <div style={{ display: "grid", gap: 14, fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
            <div>
              La <strong>{avisoDevolucion.placa}</strong> quedó lista, pero <strong>{avisoDevolucion.clienteNombre}</strong> todavía anda en la moto prestada.
            </div>
            <div style={{ fontSize: 13, color: "var(--muted2)", background: "var(--soft2)", borderRadius: 10, padding: "10px 14px" }}>
              Para entregársela: <strong>Inmovilizaciones → Préstamos activos → Devolver</strong>. Ahí el contrato vuelve a su placa, la prestada regresa al pool, el alquiler que falte queda como deuda y se decide qué pasa con los días de taller.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setAvisoDevolucion(null)} style={ghostBtn}>Después</button>
              {onNavigate && (
                <button onClick={() => { setAvisoDevolucion(null); onNavigate("inmovilizaciones"); }} style={primaryBtn}>Ir a devolverla</button>
              )}
            </div>
          </div>
        </ModalTaller>
      )}

      {showCambioEstado && seleccionado && (
        <ModalTaller onClose={() => setShowCambioEstado(false)} title="Cambiar estado">
          <div style={{ display: "grid", gap: 10 }}>
            {ESTADOS.filter((e) => e !== "Finalizado").map((e) => {
              const { bg, color } = ESTADO_COLORS[e];
              const isActual = seleccionado.estado_tecnico === e;
              return (
                <button
                  key={e}
                  onClick={async () => {
                    await actualizarEstadoTaller(seleccionado.id, e);
                    setShowCambioEstado(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: isActual ? "2px solid var(--accent)" : "2px solid transparent",
                    background: bg,
                    color,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {isActual ? "Actual: " : ""}{e}
                </button>
              );
            })}
            <button onClick={() => setShowCambioEstado(false)} style={{ ...dangerBtn, marginTop: 4 }}>Cancelar</button>
          </div>
        </ModalTaller>
      )}

      {tiempoFueraModal && (
        <ModalResolverTiempoFueraServicio
          contrato={tiempoFueraModal.contrato}
          clienteNombre={tiempoFueraModal.clienteNombre}
          motoPlaca={tiempoFueraModal.motoPlaca}
          motivo="Taller"
          fechaEntrada={tiempoFueraModal.fechaEntrada}
          fechaSalida={tiempoFueraModal.fechaSalida}
          onClose={() => setTiempoFueraModal(null)}
        />
      )}
    </div>
  );
}
