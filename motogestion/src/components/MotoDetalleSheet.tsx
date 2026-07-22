import React, { useEffect, useState } from "react";
import { useMotos, type MotoStatus } from "../hooks/useMotos";
import { useContratos } from "../hooks/useContratos";
import { useClientes } from "../hooks/useClientes";
import { usePagos } from "../hooks/usePagos";
import { supabase } from "../lib/supabase";

interface Props {
  motoId: string | null;
  onClose: () => void;
}

interface TallerRow {
  id: string;
  fecha_ingreso: string;
  estado_tecnico: string | null;
  detalle: string | null;
  costo: number | null;
}

function diasEntre(a: string, b: string): number {
  return Math.floor((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
}

function diasHastaFecha(fecha: string): number {
  const hoy = new Date().toISOString().slice(0, 10);
  return diasEntre(hoy, fecha);
}

function fmtFecha(d: string | null) {
  if (!d) return "Sin registrar";
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO");
}

function fmtVal(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function getBadgeEstado(status: MotoStatus): { bg: string; color: string; label: string } {
  switch (status) {
    case "Asignada":      return { bg: "var(--ok-soft)", color: "var(--ok-ink)", label: "Asignada" };
    case "Disponible":    return { bg: "var(--accent-soft3)", color: "var(--accent-ink)", label: "Disponible" };
    case "Mantenimiento": return { bg: "var(--orange-soft)", color: "var(--orange-ink)", label: "En taller" };
    case "Recuperada":    return { bg: "var(--accent-soft)", color: "var(--accent-ink)", label: "Recuperada" };
    case "Reservada":     return { bg: "var(--warn-soft)", color: "var(--warn-ink)", label: "Reservada" };
    case "Fiscalia":      return { bg: "var(--bad-soft)", color: "var(--bad-ink)", label: "Fiscalía" };
    case "Transito":      return { bg: "var(--bad-soft)", color: "var(--bad)", label: "Tránsito" };
    case "Garantia":      return { bg: "#f3f4f6", color: "#6b7280", label: "Garantía" };
    case "En traspaso":   return { bg: "#ecfdf5", color: "#047857", label: "En traspaso" };
  }
}

function FechaBadge({ fecha }: { fecha: string | null }) {
  if (!fecha) return <span style={{ color: "var(--faint)", fontSize: 12 }}>Sin registrar</span>;
  const dias = diasHastaFecha(fecha);
  const vencido = dias < 0;
  const urgente = dias >= 0 && dias <= 30;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: vencido ? "var(--bad-soft)" : urgente ? "var(--warn-soft)" : "var(--ok-soft)", color: vencido ? "var(--bad-ink)" : urgente ? "var(--warn-ink)" : "var(--ok-ink)" }}>
      {fmtFecha(fecha)} — {vencido ? `VENCIDO hace ${Math.abs(dias)}d` : `Vence en ${dias}d`}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--soft)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

export default function MotoDetalleSheet({ motoId, onClose }: Props) {
  const { motos } = useMotos();
  const { contratos } = useContratos();
  const { clientes } = useClientes();
  const { pagos } = usePagos();
  const [tallerRows, setTallerRows] = useState<TallerRow[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    if (!motoId) return;
    supabase.from("taller").select("*").eq("moto_id", motoId).order("fecha_ingreso", { ascending: false }).limit(5).then(({ data }) => {
      setTallerRows((data ?? []) as TallerRow[]);
    });
    setMostrarTodos(false);
  }, [motoId]);

  if (!motoId) return null;

  const moto = motos.find(m => m.id === motoId);
  if (!moto) return null;

  const badgeEstado = getBadgeEstado(moto.estado);

  const contratosDelaMoto = contratos
    .filter(c => c.moto_id === motoId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const contratoActivo = contratosDelaMoto.find(c => c.estado === "Activo");
  const clienteActivo = contratoActivo ? clientes.find(cl => cl.id === contratoActivo.cliente_id) : null;

  const pagosContrato = contratoActivo
    ? pagos.filter(p => p.contrato_id === contratoActivo.id && p.estado === "Confirmado").sort((a, b) => b.fecha.localeCompare(a.fecha))
    : [];
  const ultimoPago = pagosContrato[0] ?? null;

  const historial = mostrarTodos ? contratosDelaMoto : contratosDelaMoto.slice(0, 5);
  const hayMas = contratosDelaMoto.length > 5;

  const isMobile = window.innerWidth < 900;
  const drawerWidth = isMobile ? "100%" : 420;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200 }} />
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: drawerWidth,
        background: "var(--card)",
        zIndex: 201,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
        overflowY: "auto",
      }}>
        <div style={{ background: "linear-gradient(135deg, var(--text) 0%, var(--text) 100%)", padding: "20px 20px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--accent), var(--ok2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🏍️</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--card)", letterSpacing: "0.05em" }}>{moto.placa}</div>
                <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 2 }}>{moto.marca} · {moto.modelo}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 10, padding: "6px 10px", color: "var(--card)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ padding: "5px 12px", borderRadius: 999, background: badgeEstado.bg, color: badgeEstado.color, fontSize: 12, fontWeight: 700 }}>
              {badgeEstado.label}
            </span>
            <span style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "var(--faint)", fontSize: 12, fontWeight: 700 }}>
              {moto.grupo}
            </span>
          </div>
        </div>

        <div style={{ padding: 20, flex: 1 }}>
          <Section title="Datos del vehículo">
            <Row label="Cilindraje" value={moto.cilindraje ?? "—"} />
            <Row label="N° Motor" value={moto.numero_motor ?? "—"} />
            <Row label="N° Chasis" value={moto.numero_chasis ?? "—"} />
            <Row label="Condición ingreso" value={moto.condicion_ingreso ?? "—"} />
            <Row label="Propietario" value={moto.propietario ?? "—"} />
            <Row label="Ubicación física" value={(moto as any).ubicacion_fisica ?? "—"} />
            <div style={{ padding: "8px 0", borderBottom: "1px solid var(--soft)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>SOAT</div>
              <FechaBadge fecha={moto.fecha_seguro} />
            </div>
            <div style={{ padding: "8px 0", borderBottom: "1px solid var(--soft)" }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Tecnomecánica</div>
              <FechaBadge fecha={moto.fecha_tecnomecanica} />
            </div>
          </Section>

          {contratoActivo && clienteActivo && (
            <Section title="Contrato activo">
              <div style={{ padding: "12px 14px", borderRadius: 14, background: "var(--ok-soft)", border: "1px solid var(--ok-line)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text)" }}>{clienteActivo.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>C.C. {clienteActivo.cedula} · {clienteActivo.telefono}</div>
                <div style={{ marginTop: 10 }}>
                  <Row label="Tipo contrato" value={contratoActivo.forma_pago} />
                  <Row label="Tarifa diaria" value={contratoActivo.tarifa_diaria != null ? `$ ${fmtVal(contratoActivo.tarifa_diaria)}` : "—"} />
                  <Row label="Fecha entrega" value={contratoActivo.fecha_entrega ? fmtFecha(contratoActivo.fecha_entrega) : "—"} />
                  <Row label="Días activo" value={contratoActivo.fecha_entrega ? `${diasEntre(contratoActivo.fecha_entrega, new Date().toISOString().slice(0, 10))}d` : "—"} />
                  <Row label="Último pago" value={ultimoPago ? `${fmtFecha(ultimoPago.fecha)} · $ ${fmtVal(ultimoPago.valor)}` : "Sin pagos"} />
                </div>
              </div>
            </Section>
          )}

          {contratosDelaMoto.length > 0 && (
            <Section title={`Historial de contratos (${contratosDelaMoto.length})`}>
              <div style={{ display: "grid", gap: 8 }}>
                {historial.map(c => {
                  const cl = clientes.find(x => x.id === c.cliente_id);
                  const total = pagos.filter(p => p.contrato_id === c.id && p.estado === "Confirmado").reduce((a, p) => a + p.valor, 0);
                  return (
                    <div key={c.id} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--soft2)", border: "1px solid var(--line)" }}>
                      <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 13 }}>{cl?.nombre ?? "Sin cliente"}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                        {c.forma_pago} · {c.fecha_entrega ? fmtFecha(c.fecha_entrega) : "—"} · <span style={{ fontWeight: 700, color: c.estado === "Activo" ? "var(--ok-ink)" : "var(--muted)" }}>{c.estado}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 2, fontWeight: 600 }}>Recaudado: $ {fmtVal(total)}</div>
                    </div>
                  );
                })}
              </div>
              {hayMas && !mostrarTodos && (
                <button onClick={() => setMostrarTodos(true)} style={{ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--card)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                  Ver todos ({contratosDelaMoto.length})
                </button>
              )}
            </Section>
          )}

          {tallerRows.length > 0 && (
            <Section title="Taller">
              <div style={{ display: "grid", gap: 8 }}>
                {tallerRows.map(t => (
                  <div key={t.id} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--warn-soft)", border: "1px solid #fcd34d" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtFecha(t.fecha_ingreso)} · {t.estado_tecnico ?? "—"}</div>
                    {t.detalle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{t.detalle}</div>}
                    {t.costo != null && <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warn-ink)", marginTop: 2 }}>Costo: $ {fmtVal(t.costo)}</div>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
