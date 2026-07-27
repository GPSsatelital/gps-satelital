import { useMemo, useState } from "react";
import { construirLineaTiempo, agruparPorMes, type CategoriaEvento, type EventoLT, type FuentesLT } from "../utils/lineaTiempo";

const CATS: { key: CategoriaEvento | "todo"; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "pago", label: "💵 Pagos" },
  { key: "cobranza", label: "📞 Cobranza" },
  { key: "moto", label: "🏍️ Moto" },
  { key: "contrato", label: "📄 Contrato" },
];

const TONO_COLOR: Record<string, string> = {
  ok: "var(--ok-ink)", bad: "var(--bad-ink)", warn: "var(--warn-ink)",
  accent: "var(--accent)", neutral: "var(--muted)", muted: "var(--muted)",
};

function fmtFechaLarga(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function LineaTiempo({
  objetivo, fuentes, titulo, subtitulo, resumen,
}: {
  objetivo: { clienteId?: string; motoId?: string };
  fuentes: FuentesLT;
  titulo: string;
  subtitulo?: string;
  resumen?: { k: string; v: string; tono?: string }[];
}) {
  const [cat, setCat] = useState<CategoriaEvento | "todo">("todo");
  const eventos = useMemo(() => construirLineaTiempo(objetivo, fuentes), [objetivo, fuentes]);
  const filtrados = useMemo(() => (cat === "todo" ? eventos : eventos.filter(e => e.categoria === cat)), [eventos, cat]);
  const grupos = useMemo(() => agruparPorMes(filtrados), [filtrados]);

  // El impreso se le ENTREGA AL CLIENTE, así que sale una versión depurada: sin el ahorro
  // (misma decisión que el estado de cuenta) y sin las gestiones internas de cobranza
  // (sirena, recolección, plazos, notas del funcionario). Todo texto va escapado: son campos
  // libres escritos por funcionarios y romperían el documento.
  function imprimir() {
    const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, c => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
    ));
    const paraCliente = filtrados.filter(e => !e.interno);
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) { alert("El navegador bloqueó la ventana de impresión. Habilita las ventanas emergentes para este sitio."); return; }
    const filas = paraCliente.map(e => {
      const des = (e.desglose ?? []).filter(d => !d.interno);
      return `
      <tr>
        <td style="white-space:nowrap;vertical-align:top;padding:4px 8px 4px 0;color:#555">${esc(fmtFechaLarga(e.fecha))}</td>
        <td style="padding:4px 0 8px;border-bottom:1px solid #eee">
          <div style="font-weight:700">${esc(e.titulo)}</div>
          ${e.detalle ? `<div style="color:#555;font-size:11px">${esc(e.detalle)}</div>` : ""}
          ${des.map(d => `<div style="font-size:11px;color:#333">· ${esc(d.k)}: <b>${esc(d.v)}</b></div>`).join("")}
        </td>
      </tr>`;
    }).join("");
    const filtroTxt = cat === "todo" ? "todos los movimientos" : `filtro: ${CATS.find(c => c.key === cat)?.label ?? ""}`;
    w.document.write(`<!DOCTYPE html><html><head><title>Historial — ${esc(titulo)}</title>
      <style>@page{margin:12mm}body{font-family:Arial,sans-serif;font-size:12px;color:#111}
      h2{margin:0 0 2px;font-size:16px}.sub{color:#555;font-size:11px;margin-bottom:10px}
      table{width:100%;border-collapse:collapse}</style></head><body>
      <h2>Historial — ${esc(titulo)}</h2>
      <div class="sub">${esc(subtitulo ?? "")} · ${esc(filtroTxt)} · Generado el ${esc(new Date().toLocaleDateString("es-CO"))}</div>
      <table>${filas}</table>
      <div class="sub" style="margin-top:12px">Documento informativo · CLUB MOTEROS CARTAGENA</div>
      </body></html>`);
    w.document.close(); w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <div>
      {/* Resumen de "cómo se ha portado" */}
      {resumen && resumen.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {resumen.map(r => (
            <div key={r.k} style={{ background: "var(--soft2)", borderRadius: 10, padding: "8px 12px", minWidth: 0, flex: "1 1 120px" }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>{r.k}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: r.tono ? TONO_COLOR[r.tono] ?? "var(--text)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{r.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros + imprimir */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        {CATS.map(c => (
          <button key={c.key} onClick={() => setCat(c.key)} style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "none",
            background: cat === c.key ? "var(--accent)" : "var(--soft)", color: cat === c.key ? "var(--card)" : "var(--muted2)",
          }}>{c.label}</button>
        ))}
        <button onClick={imprimir} title="Imprimir para revisarlo con el cliente" style={{
          marginLeft: "auto", padding: "6px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          border: "1px solid var(--line)", background: "var(--card)", color: "var(--muted2)",
        }}>🖨️ Imprimir</button>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--faint)" }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🕘</div>
          <div style={{ fontWeight: 700 }}>Todavía no hay nada registrado aquí</div>
        </div>
      ) : (
        grupos.map(g => (
          <div key={g.mes} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{g.label}</div>
            <div style={{ position: "relative", paddingLeft: 26 }}>
              <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: "var(--line)" }} />
              {g.eventos.map(e => <Fila key={e.id} e={e} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Fila({ e }: { e: EventoLT }) {
  const color = TONO_COLOR[e.tono ?? "neutral"] ?? "var(--muted)";
  return (
    <div style={{ position: "relative", paddingBottom: 14 }}>
      <div style={{
        position: "absolute", left: -22, top: 2, width: 18, height: 18, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
        background: "var(--card)", border: `2px solid ${color}`,
      }}>{e.icono}</div>
      <div style={{ fontSize: 11, color: "var(--faint)", fontVariantNumeric: "tabular-nums" }}>{fmtFechaLarga(e.fecha)}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginTop: 1 }}>{e.titulo}</div>
      {e.detalle && <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2, lineHeight: 1.45 }}>{e.detalle}</div>}
      {e.desglose && e.desglose.length > 0 && (
        <div style={{ marginTop: 6, background: "var(--soft2)", borderRadius: 8, padding: "8px 10px", display: "grid", gap: 3 }}>
          {e.desglose.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11.5 }}>
              <span style={{ color: "var(--muted)", minWidth: 0 }}>{d.k}</span>
              <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: d.tono ? TONO_COLOR[d.tono] : "var(--text)" }}>{d.v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
