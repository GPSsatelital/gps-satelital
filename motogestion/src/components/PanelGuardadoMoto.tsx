import { useState } from "react";
import { useVisitas } from "../hooks/useVisitas";
import { useContratos, type Contrato } from "../hooks/useContratos";
import { useAuth } from "../contexts/AuthContext";
import ModalRegistrarGuardado from "./ModalRegistrarGuardado";

// Fase 2 — validación post-entrega de dónde se guarda la moto, en el detalle del contrato.
// Solo ADMIN/ADMIN_PRINCIPAL. La tarea persiste (alerta) hasta que el admin la marca. La app
// no tiene el GPS del vehículo: el admin compara en su plataforma externa y marca ✅/❌.
interface Props {
  contrato: Contrato;
  clienteNombre: string;
  placa: string;
}

export default function PanelGuardadoMoto({ contrato, clienteNombre, placa }: Props) {
  const { visitas } = useVisitas();
  const { validarUbicacionMoto } = useContratos();
  const { profile } = useAuth();
  const [procesando, setProcesando] = useState(false);
  const [modalReg, setModalReg] = useState(false);

  const esAdmin = profile?.role === "ADMIN" || profile?.role === "ADMIN_PRINCIPAL";
  // Solo para contratos activos (entregados) y para admin.
  if (!esAdmin || contrato.estado !== "Activo") return null;
  // No mostrar si el campo aún no existe (antes de correr la mig 060 = undefined) ni para los
  // contratos existentes backfilleados (validada=true SIN fecha real de validación): esos se
  // marcaron true solo para no inundar de alertas, nunca pasaron por este flujo.
  if (contrato.ubicacion_moto_validada == null) return null;
  if (contrato.ubicacion_moto_validada === true && !contrato.ubicacion_moto_validada_fecha) return null;

  // Declaración de la visita del cliente (la más reciente).
  const visita = visitas
    .filter(v => v.cliente_id === contrato.cliente_id)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""))[0] ?? null;
  const declaro = visita?.entrevista?.guardaMotoAqui as string | undefined;
  const dondeDeclarado = visita?.entrevista?.dondeGuardaMoto as string | undefined;
  const homeUbi = visita?.ubicacion ?? null;
  const g = contrato.guardado_lugar ?? null;
  const validada = contrato.ubicacion_moto_validada === true;

  async function marcar(resultado: "coincide" | "no_coincide") {
    if (procesando || !profile) return;
    setProcesando(true);
    try {
      const { error } = await validarUbicacionMoto(contrato.id, resultado, profile.id);
      if (error) { alert("Error al guardar la validación: " + error); return; }
      if (resultado === "no_coincide") setModalReg(true);
    } finally {
      setProcesando(false);
    }
  }

  const box: React.CSSProperties = {
    borderRadius: 14, padding: "12px 14px", marginTop: 12,
    background: validada ? "var(--ok-soft)" : "var(--warn-soft)",
    border: `1px solid ${validada ? "var(--ok-line)" : "var(--warn-line)"}`,
  };

  return (
    <div style={box}>
      <div style={{ fontWeight: 700, fontSize: 13, color: validada ? "var(--ok-ink)" : "var(--warn-ink)", marginBottom: 6 }}>
        {validada ? "✅ Guardado de la moto validado" : "📍 Validar dónde se guarda la moto"}
      </div>

      {/* Referencia de lo declarado en la visita */}
      <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 8 }}>
        {declaro === "Sí" && (
          <>El cliente declaró que la guarda <strong>en su casa</strong>.{" "}
            {homeUbi && <a href={`https://www.google.com/maps?q=${homeUbi.lat},${homeUbi.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 700 }}>Ver casa en el mapa →</a>}
          </>
        )}
        {declaro === "No" && <>El cliente declaró que la guarda en: <strong>{dondeDeclarado || "otro lugar (sin especificar)"}</strong>.</>}
        {!declaro && <span style={{ color: "var(--muted)" }}>Sin declaración de guardado en la visita — verifica en el GPS dónde duerme la moto.</span>}
      </div>

      {/* Lugar de guardado registrado (Fase 3), si existe */}
      {g && (g.lat || g.direccion) && (
        <div style={{ fontSize: 12, color: "var(--text)", background: "var(--card)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
          <strong>Lugar registrado:</strong> {g.direccion || "—"}{g.condiciones ? ` · ${g.condiciones}` : ""}
          {g.lat != null && g.lng != null && (
            <>{" · "}<a href={`https://www.google.com/maps?q=${g.lat},${g.lng}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 700 }}>Ver en mapa →</a></>
          )}
        </div>
      )}

      {validada ? (
        <div style={{ fontSize: 12, color: "var(--ok-ink)", fontWeight: 600 }}>
          {contrato.ubicacion_moto_resultado === "coincide" ? "Coincidía con lo declarado." : "NO coincidía — lugar registrado aparte."}
          <button onClick={() => setModalReg(true)} style={{ marginLeft: 10, padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
            📍 {g ? "Actualizar" : "Registrar"} lugar
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "var(--warn-ink)", marginBottom: 8 }}>
            Revisa en el GPS que la moto duerma ahí y márcalo (la tarea no se quita hasta hacerlo):
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => marcar("coincide")} disabled={procesando}
              style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: procesando ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: "var(--ok-ink)", color: "var(--card)", opacity: procesando ? 0.6 : 1 }}>
              ✅ Sí coincide
            </button>
            <button onClick={() => marcar("no_coincide")} disabled={procesando}
              style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: procesando ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, background: "var(--bad-ink)", color: "var(--card)", opacity: procesando ? 0.6 : 1 }}>
              ❌ No coincide — registrar lugar
            </button>
          </div>
        </>
      )}

      {modalReg && (
        <ModalRegistrarGuardado
          contratoId={contrato.id}
          clienteNombre={clienteNombre}
          placa={placa}
          onClose={() => setModalReg(false)}
          onDone={() => setModalReg(false)}
        />
      )}
    </div>
  );
}
