// LA PUERTA ÚNICA PARA METER UNA MOTO AL TALLER.
//
// Antes este formulario vivía encerrado dentro de TallerView, así que desde Motos no había forma
// de abrir una orden: el funcionario le cambiaba el estado a mano ("En taller") y la moto quedaba
// invisible para el mecánico, sin diagnóstico, sin costo y sin rastro del arreglo. Ahora el mismo
// formulario se abre desde los dos lados (Taller → "Nueva orden" y Motos → "Registrar novedad" →
// "Ingresar a taller"), para que no existan dos maneras distintas de hacer lo mismo.
//
// Al guardar: crea la orden, sube las 6 fotos guiadas de cómo entró (obligatorias — decisión del
// dueño, 12-sep-2026), las fotos libres del daño, y deja anotada la primera petición si la hay.
// useTaller deja la moto "En taller" sola.

import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { hoyISO } from "../utils/fecha";
import { inputStyle, labelStyle } from "../styles/shared";
import MoneyInput from "./MoneyInput";
import { ANGULOS_FOTO, GridFotosAngulos, type AnguloFoto } from "./FotosAngulos";
import { GridFotosLibres, type FotoLibreLocal } from "./FotosLibres";
import { agregarPeticion, type FotoLibreTaller, type PeticionTaller } from "../utils/taller";
import type { TallerEstado, NuevoTallerItem } from "../hooks/useTaller";

// ─── Piezas compartidas (vivían en TallerView; se mudaron para que las use también Motos) ──────

export function ModalTaller({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      // zIndex 1100: estas ventanas se abren DESDE el detalle de la orden, que flota con 1000.
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 520, maxHeight: "calc(100dvh - 160px)", overflowY: "auto", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, color: "var(--text)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export type RepuestoItem = { nombre: string; cantidad: number; costo: number };

export function RepuestosEditor({ items, onChange }: { items: RepuestoItem[]; onChange: (items: RepuestoItem[]) => void }) {
  function actualizar(i: number, field: keyof RepuestoItem, value: string | number) {
    onChange(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }
  const totalRepuestos = repuestosToTotal(items);
  return (
    <div>
      <label style={{ ...labelStyle, display: "block" }}>Repuestos utilizados</label>
      {items.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--faint)", marginBottom: 6 }}>Sin repuestos agregados.</div>
      )}
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
          <input style={{ ...inputStyle, flex: 3, minWidth: 0 }} value={item.nombre}
            onChange={e => actualizar(i, "nombre", e.target.value)} placeholder="Nombre del repuesto" />
          <input type="number" style={{ ...inputStyle, flex: 1, minWidth: 50 }} value={item.cantidad} min={1}
            onChange={e => actualizar(i, "cantidad", Number(e.target.value) || 1)} title="Cantidad" />
          <MoneyInput style={{ flex: 2, minWidth: 70 }} value={item.costo ? String(item.costo) : ""}
            onChange={v => actualizar(i, "costo", Number(v) || 0)} placeholder="$ costo u." />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--faint)", fontSize: 18, padding: "0 2px", flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onChange([...items, { nombre: "", cantidad: 1, costo: 0 }])} type="button"
          style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "none", border: "1px dashed var(--accent-line)", borderRadius: 8, padding: "5px 12px", cursor: "pointer" }}>
          + Agregar repuesto
        </button>
        {items.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Total repuestos: <strong style={{ color: "var(--text)" }}>${totalRepuestos.toLocaleString("es-CO")}</strong>
          </span>
        )}
      </div>
      {totalRepuestos > 0 && <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>El costo de repuestos se suma al costo total de la orden.</div>}
    </div>
  );
}

export function repuestosToText(items: RepuestoItem[]): string {
  return items.filter(r => r.nombre.trim()).map(r => r.cantidad > 1 ? `${r.nombre.trim()} (x${r.cantidad})` : r.nombre.trim()).join(", ");
}

export function repuestosToTotal(items: RepuestoItem[]): number {
  return items.reduce((s, r) => s + r.costo * r.cantidad, 0);
}

// ─── Subida de fotos al bucket `documentos` (el mismo de recepciones y documentos) ─────────────

export async function subirFotoTaller(ordenId: string, nombre: string, dataUrl: string): Promise<string | null> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `taller/${ordenId}/${nombre}_${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("documentos").upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) return null;
  return supabase.storage.from("documentos").getPublicUrl(path).data.publicUrl;
}

/** Sube las 6 guiadas y devuelve {angulo: url} con las que sí subieron. */
export async function subirAngulosTaller(ordenId: string, prefijo: string, fotos: Partial<Record<AnguloFoto, string>>) {
  const out: Record<string, string> = {};
  let fallidas = 0;
  for (const { key } of ANGULOS_FOTO) {
    const dataUrl = fotos[key];
    if (!dataUrl) continue;
    const url = await subirFotoTaller(ordenId, `${prefijo}_${key}`, dataUrl);
    if (url) out[key] = url; else fallidas++;
  }
  return { fotos: out, fallidas };
}

export async function subirLibresTaller(ordenId: string, fotos: FotoLibreLocal[], porNombre: string) {
  const out: FotoLibreTaller[] = [];
  let fallidas = 0;
  for (const f of fotos) {
    const url = await subirFotoTaller(ordenId, "libre", f.src);
    if (url) out.push({ url, nota: f.nota.trim(), fecha: hoyISO(), por: porNombre });
    else fallidas++;
  }
  return { fotos: out, fallidas };
}

// ─── El formulario ─────────────────────────────────────────────────────────────────────────────

export default function ModalIngresoTaller({
  motos,
  motoFija,
  quienRegistra,
  onClose,
  onRegistrar,
  onCreada,
}: {
  /** Motos entre las que se puede elegir. Se ignora si viene `motoFija`. */
  motos: { id: string; label: string }[];
  /** Cuando se abre desde la ficha de una moto: ya se sabe cuál es, no se pregunta. */
  motoFija?: { id: string; label: string };
  quienRegistra: string;
  onClose: () => void;
  onRegistrar: (data: NuevoTallerItem) => Promise<{ error: string | null; id?: string | null }>;
  /** Se llama con la orden ya creada y sus fotos subidas. */
  onCreada?: (ordenId: string | null) => void;
}) {
  const [motoId, setMotoId] = useState(motoFija?.id ?? "");
  const [estadoInicial, setEstadoInicial] = useState<TallerEstado>("Pendiente");
  const [fechaIngreso, setFechaIngreso] = useState(hoyISO());
  const [costoManoObra, setCostoManoObra] = useState("");
  const [detalle, setDetalle] = useState("");
  const [repuestosItems, setRepuestosItems] = useState<RepuestoItem[]>([]);
  const [fotosEntrada, setFotosEntrada] = useState<Partial<Record<AnguloFoto, string>>>({});
  const [fotosLibres, setFotosLibres] = useState<FotoLibreLocal[]>([]);
  const [peticion, setPeticion] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paso, setPaso] = useState<string>("");

  const costoRepuestos = repuestosToTotal(repuestosItems);
  const costoTotal = (Number(costoManoObra) || 0) + costoRepuestos;
  const faltanFotos = ANGULOS_FOTO.filter(a => !fotosEntrada[a.key]);

  async function handleSubmit() {
    if (saving) return;
    if (!motoId) { setFormError("Selecciona la moto."); return; }
    if (!detalle.trim()) { setFormError("Escribe con qué entró la moto."); return; }
    if (faltanFotos.length > 0) { setFormError(`Falta la foto: ${faltanFotos.map(a => a.label).join(", ")}.`); return; }
    setFormError(null);
    setSaving(true);
    setPaso("Creando la orden...");
    try {
      const { error, id } = await onRegistrar({
        moto_id: motoId,
        estado_tecnico: estadoInicial,
        detalle: detalle.trim(),
        costo: costoTotal,
        repuestos: repuestosToText(repuestosItems) || null,
        fecha_ingreso: fechaIngreso,
      });
      if (error) { setFormError(error); return; }
      if (!id) {
        // La orden quedó creada pero no se pudo leer su id (RLS): mejor avisar que perder las fotos.
        setFormError("La orden se creó, pero no se pudieron guardar las fotos. Ábrela en Taller y agrégalas desde el detalle.");
        return;
      }

      setPaso("Subiendo las fotos de cómo entró...");
      const ang = await subirAngulosTaller(id, "entrada", fotosEntrada);
      setPaso("Subiendo las fotos del daño...");
      const lib = await subirLibresTaller(id, fotosLibres, quienRegistra);
      const peticiones: PeticionTaller[] = agregarPeticion([], {
        id: nuevoId(), texto: peticion, pedidaPor: quienRegistra, fechaISO: hoyISO(),
      });

      setPaso("Guardando...");
      const { error: errUp } = await supabase.from("taller").update({
        fotos_entrada: ang.fotos,
        fotos_libres: lib.fotos,
        peticiones,
      }).eq("id", id);

      if (errUp || ang.fallidas > 0 || lib.fallidas > 0) {
        setFormError(errUp
          ? `La orden quedó creada, pero las fotos no se guardaron: ${errUp.message}`
          : `La orden quedó creada, pero ${ang.fallidas + lib.fallidas} foto(s) no subieron. Agrégalas desde el detalle.`);
        return;
      }
      onCreada?.(id);
      onClose();
    } finally {
      setSaving(false);
      setPaso("");
    }
  }

  return (
    <ModalTaller onClose={onClose} title="Registrar ingreso a taller">
      {/* textAlign izquierda: el #root de la plantilla de Vite centra todo el texto de la app. */}
      <div style={{ display: "grid", gap: 14, textAlign: "left" }}>
        <div>
          <label style={{ ...labelStyle, display: "block" }}>Moto *</label>
          {motoFija ? (
            <div style={{ ...inputStyle, background: "var(--soft2)", fontWeight: 700 }}>{motoFija.label}</div>
          ) : (
            <select style={inputStyle} value={motoId} onChange={(e) => setMotoId(e.target.value)}>
              <option value="">Seleccionar moto...</option>
              {motos.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ ...labelStyle, display: "block" }}>Estado inicial</label>
            <select style={inputStyle} value={estadoInicial} onChange={(e) => setEstadoInicial(e.target.value as TallerEstado)}>
              <option value="Pendiente">Pendiente</option>
              <option value="En diagnóstico">En diagnóstico</option>
              <option value="En reparación">En reparación</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ ...labelStyle, display: "block" }}>Fecha de ingreso</label>
            <input type="date" style={inputStyle} value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Con qué entró *</label>
          <textarea
            style={{ ...inputStyle, minHeight: 74, resize: "vertical", fontFamily: "inherit" }}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="El problema o lo que pidió el cliente. Ej: ruido en el motor, no enciende, cambio de aceite."
          />
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Cómo entró — las 6 fotos *</label>
          <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 6 }}>
            Las mismas de la entrega: prueba del estado en que la recibió el taller.
          </div>
          <GridFotosAngulos fotos={fotosEntrada} onChange={setFotosEntrada} />
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Fotos del daño (opcional)</label>
          <GridFotosLibres fotos={fotosLibres} onChange={setFotosLibres} vacio="Si hay un daño visible, tómale foto: queda pegada a esta orden." />
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Petición o autorización (opcional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 56, resize: "vertical", fontFamily: "inherit" }}
            value={peticion}
            onChange={(e) => setPeticion(e.target.value)}
            placeholder="Ej: hay que cambiar la cadena, vale $85.000. Queda pendiente de autorizar."
          />
        </div>

        <div>
          <label style={{ ...labelStyle, display: "block" }}>Mano de obra</label>
          <MoneyInput value={costoManoObra} onChange={setCostoManoObra} placeholder="$ 0" />
        </div>

        <RepuestosEditor items={repuestosItems} onChange={setRepuestosItems} />

        {costoTotal > 0 && (
          <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "right" }}>
            Costo total: <strong style={{ color: "var(--text)" }}>${costoTotal.toLocaleString("es-CO")}</strong>
          </div>
        )}

        {formError && (
          <div style={{ background: "var(--bad-soft)", color: "var(--bad-ink)", borderRadius: 10, padding: "10px 12px", fontSize: 13 }}>{formError}</div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button onClick={onClose} disabled={saving} style={{ background: "var(--card)", border: "1px solid var(--line2)", color: "var(--muted2)", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{
            background: "linear-gradient(90deg, var(--accent) 0%, var(--ok2) 100%)", color: "#0f172a", border: "none",
            borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1,
          }}>
            {saving ? (paso || "Guardando...") : "Registrar ingreso"}
          </button>
        </div>
      </div>
    </ModalTaller>
  );
}

/** Id corto para las peticiones. `crypto.randomUUID` no existe en contextos sin https. */
export function nuevoId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `p${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
