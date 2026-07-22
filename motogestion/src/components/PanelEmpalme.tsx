import { useState } from "react";
import type { Contrato } from "../hooks/useContratos";
import type { Cliente } from "../hooks/useClientes";
import { primaryBtn } from "../styles/shared";

// Panel de empalme de un contrato migrado — vive en el detalle del contrato en Cartera.
// Checklist aprobada (10-jul-2026): ① deuda de apertura revisada ② ahorro de apertura
// revisado ③ teléfono/cédula verificados ④ autorización de datos completa (firma+huella).
// Los puntos 1-3 los confirma el funcionario CON el cliente presente (checkboxes);
// el 4 se verifica solo desde los datos del cliente. "Confirmar migración" llama a la
// función de BD cerrar_empalme (consolida apertura→acumulado + auditoría) y el badge
// desaparece. El convenio NO es requisito para cerrar (queda como marca aparte).

function fmt(n: number) { return Math.round(n).toLocaleString("es-CO"); }

interface Props {
  contrato: Contrato;
  cliente: Cliente | null;
  deudaApertura: number; // total de deudas pendientes del contrato (referencia visual)
  puedeCerrar: boolean;  // ADMIN / ADMIN_PRINCIPAL / SECRETARIA
  onConfirmar: () => Promise<{ error: string | null }>;
}

export default function PanelEmpalme({ contrato, cliente, deudaApertura, puedeCerrar, onConfirmar }: Props) {
  const [deudaOk, setDeudaOk] = useState(false);
  const [ahorroOk, setAhorroOk] = useState(false);
  const [datosOk, setDatosOk] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tieneDatos = !!(cliente?.telefono?.trim() && cliente?.cedula?.trim());
  const tieneAutorizacion = !!(cliente?.autorizacion_datos_firma_url && cliente?.autorizacion_datos_huella_url);
  const todoListo = deudaOk && ahorroOk && datosOk && tieneAutorizacion;

  async function handleConfirmar() {
    if (guardando || !todoListo) return;
    if (!confirm(`¿Confirmar la migración de ${cliente?.nombre ?? "este cliente"}? El ahorro de apertura ($${fmt(contrato.ahorro_apertura ?? 0)}) se consolidará y las cifras viejas quedarán selladas. No se puede deshacer.`)) return;
    setGuardando(true);
    setError(null);
    try {
      const { error: err } = await onConfirmar();
      if (err) setError(err);
    } finally {
      setGuardando(false);
    }
  }

  const filaCheck = (
    checked: boolean,
    onToggle: (() => void) | null,
    titulo: string,
    detalle: string,
    auto = false,
  ) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: onToggle ? "pointer" : "default" }}>
      {auto ? (
        <span style={{ fontSize: 16, lineHeight: "20px" }}>{checked ? "✅" : "❌"}</span>
      ) : (
        <input type="checkbox" checked={checked} onChange={() => onToggle?.()} style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--warn-ink)", cursor: "pointer" }} />
      )}
      <span style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", display: "block" }}>{titulo}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{detalle}</span>
      </span>
    </label>
  );

  return (
    <div style={{ background: "var(--warn-soft2)", border: "2px solid var(--warn2)", borderRadius: 16, padding: 16, display: "grid", gap: 12, boxSizing: "border-box" }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--warn-ink)" }}>⚠️ Empalme pendiente — cliente migrado sin revisar</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Revisa cada punto CON el cliente presente. Al confirmar, sus cifras viejas quedan selladas.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 140px", background: "var(--card)", borderRadius: 10, padding: "8px 12px", border: "1px solid var(--warn-line)", minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--warn-ink)", fontWeight: 700 }}>AHORRO QUE TRAÍA</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>$ {fmt(contrato.ahorro_apertura ?? 0)}</div>
          <div style={{ fontSize: 10, color: "var(--faint)" }}>editable en Editar contrato</div>
        </div>
        <div style={{ flex: "1 1 140px", background: "var(--card)", borderRadius: 10, padding: "8px 12px", border: "1px solid var(--warn-line)", minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--warn-ink)", fontWeight: 700 }}>DEUDA QUE TRAE</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: deudaApertura > 0 ? "var(--bad-ink)" : "var(--ok-ink)" }}>$ {fmt(deudaApertura)}</div>
          <div style={{ fontSize: 10, color: "var(--faint)" }}>editable en la pestaña Deudas</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {filaCheck(deudaOk, () => setDeudaOk(v => !v), "Deuda de apertura revisada", "El monto es correcto (o quedó en $0 si no debía) — revisado con el cliente.")}
        {filaCheck(ahorroOk, () => setAhorroOk(v => !v), "Ahorro de apertura revisado", "El cliente está de acuerdo con el ahorro que trae.")}
        {filaCheck(
          datosOk,
          tieneDatos ? () => setDatosOk(v => !v) : null,
          "Teléfono/WhatsApp y cédula verificados",
          tieneDatos
            ? `📞 ${cliente?.telefono} · CC ${cliente?.cedula} — confirmados con el cliente.`
            : "Faltan teléfono o cédula — complétalos en Clientes → Actualizar datos.",
        )}
        {filaCheck(
          tieneAutorizacion,
          null,
          "Autorización de datos: firma + huella",
          tieneAutorizacion
            ? "Firma y huella registradas."
            : "Falta la firma y/o la huella — captúralas en Clientes → Actualizar datos / documentos.",
          true,
        )}
      </div>

      {error && <div style={{ color: "var(--bad-ink)", fontWeight: 600, fontSize: 13 }}>{error}</div>}

      {puedeCerrar ? (
        <button
          onClick={handleConfirmar}
          disabled={!todoListo || guardando}
          style={{
            ...primaryBtn,
            background: todoListo ? "var(--ok-ink)" : "var(--faint)",
            cursor: todoListo ? "pointer" : "not-allowed",
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? "Confirmando..." : todoListo ? "✅ Confirmar migración" : "Completa la lista para confirmar"}
        </button>
      ) : (
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          La confirmación la hace ADMIN, ADMIN PRINCIPAL o SECRETARIA.
        </div>
      )}
    </div>
  );
}
