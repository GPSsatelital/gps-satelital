import { useMemo, useState, useEffect } from "react";
import { useClientes, type Cliente, type ClienteEstado, type DocumentoFlags } from "../hooks/useClientes";
import { useContratos, type Contrato } from "../hooks/useContratos";
import { useMotos, type Moto } from "../hooks/useMotos";
import { usePagos, type Pago } from "../hooks/usePagos";
import { useVisitas } from "../hooks/useVisitas";
import { useConvenios } from "../hooks/useConvenios";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { formatDiaPago } from "../utils/cicloPago";
import { generarHTMLAutorizacionDatos } from "../hooks/useDocumentos";

type GestionRow = { id: string; tipo: string; resultado: string | null; fecha: string; notas: string | null };

interface Props {
  clienteId: string | null;
  onClose: () => void;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("es-CO");
}

function formatDate(d: string | null) {
  if (!d) return "Sin registrar";
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO");
}

function estadoBadgeColors(estado: ClienteEstado): { bg: string; color: string } {
  if (estado === "Activo") return { bg: "#dcfce7", color: "#166534" };
  if (estado === "En mora" || estado === "En riesgo") return { bg: "#fee2e2", color: "#991b1b" };
  if (estado === "Aprobado") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (estado === "Rechazado" || estado === "Lista negra") return { bg: "#1f2937", color: "#f9fafb" };
  if (estado === "Listo para visita") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (estado === "Pendiente evaluación") return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#f1f5f9", color: "#64748b" };
}

function SeccionTitulo({ titulo }: { titulo: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginTop: 20, paddingBottom: 6, borderBottom: "1px solid #f1f5f9" }}>
      {titulo}
    </div>
  );
}

function InfoFila({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: "#64748b", flexShrink: 0, minWidth: 110 }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 600, flex: 1 }}>{value}</span>
    </div>
  );
}

function DocItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
      borderRadius: 999, fontSize: 12, fontWeight: 700,
      background: ok ? "#dcfce7" : "#fee2e2",
      color: ok ? "#166534" : "#991b1b",
    }}>
      <span>{ok ? "✔" : "✗"}</span>
      <span>{label}</span>
    </div>
  );
}

function DocsSection({ doc, titulo }: { doc: DocumentoFlags; titulo: string }) {
  const items: Array<[keyof DocumentoFlags, string]> = [
    ["cedula", "Cédula"],
    ["hojaVida", "Hoja de vida"],
    ["recibo1", "Recibo 1"],
    ["recibo2", "Recibo 2"],
    ["antecedentes", "Antecedentes"],
    ["licencia", "Licencia"],
  ];
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{titulo}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map(([k, label]) => (
          <DocItem key={k} label={label} ok={doc[k].ok} />
        ))}
      </div>
    </div>
  );
}

function imprimirEstadoCuenta(
  cliente: Cliente,
  contrato: Contrato,
  moto: Moto | null,
  pagosContrato: Pago[],
) {
  const hoy = new Date();
  const fechaStr = hoy.toLocaleDateString("es-CO");

  const pagosConfirmados = pagosContrato.filter(p => p.estado === "Confirmado");
  const totalPagado = pagosConfirmados.reduce((acc, p) => acc + p.valor, 0);
  const ultimos30 = [...pagosConfirmados].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 30);

  const diasActivo = contrato.fecha_entrega
    ? Math.floor((hoy.getTime() - new Date(contrato.fecha_entrega + "T00:00:00").getTime()) / 86400000)
    : 0;

  const tarifaDiaria = contrato.tarifa_diaria ?? 27000;
  const esDiario = contrato.tipo_ruta === "diario" || contrato.forma_pago === "Diario";
  const ahorroAcumulado = contrato.ahorro_acumulado ?? 0;

  const linea = "──────────────────────────────────────";

  const filasUltimos = ultimos30.map(p => {
    const fechaP = new Date(p.fecha + "T00:00:00").toLocaleDateString("es-CO");
    const metodo = p.metodo.padEnd(13);
    const valor = `$ ${Math.round(p.valor).toLocaleString("es-CO")}`;
    return `  ${fechaP.padEnd(11)}| ${metodo}| ${valor}`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Estado de cuenta — ${cliente.nombre}</title>
  <style>
    body { font-family: monospace; font-size: 14px; padding: 32px; color: #0f172a; max-width: 600px; margin: 0 auto; }
    h2 { font-size: 18px; margin-bottom: 4px; }
    pre { white-space: pre-wrap; line-height: 1.7; }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <h2>GPS Satelital · Estado de Cuenta</h2>
  <pre>
Cliente: ${cliente.nombre.toUpperCase()} (C.C. ${cliente.cedula})
Fecha: ${fechaStr}${moto ? `  | Contrato: ${contrato.forma_pago} · ${moto.placa}` : `  | Contrato: ${contrato.forma_pago}`}

${linea}
RESUMEN
  Tarifa diaria:        $ ${Math.round(tarifaDiaria).toLocaleString("es-CO")}
  Días activo:          ${diasActivo} días
  Total pagado:         $ ${Math.round(totalPagado).toLocaleString("es-CO")}${esDiario ? `
  Ahorro acumulado:     $ ${Math.round(ahorroAcumulado).toLocaleString("es-CO")}` : ""}

${linea}
ÚLTIMOS 30 PAGOS
  Fecha      | Método        | Valor
  ──────────-┼───────────────┼──────────
${filasUltimos || "  Sin pagos registrados."}
  </pre>
  <div class="footer">
    "Este documento es un estado de cuenta informativo.<br/>
    GPS Satelital Cartagena · gpssatelitalcartagena@gmail.com"
  </div>
</body>
</html>`;

  const ventana = window.open("", "_blank");
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
  }
}

function imprimirAutorizacionDatos(cliente: Cliente) {
  const html = generarHTMLAutorizacionDatos(cliente);
  const ventana = window.open("", "_blank");
  if (!ventana) return;
  ventana.document.write(`<!DOCTYPE html><html><head><title>Autorización de tratamiento de datos</title><style>@media print{body{margin:0}}</style></head><body>${html}</body></html>`);
  ventana.document.close();
  ventana.print();
}

export default function ClienteDetalleSheet({ clienteId, onClose }: Props) {
  const { clientes } = useClientes();
  const { contratos } = useContratos();
  const { motos } = useMotos();
  const { pagos } = usePagos();
  const { visitas } = useVisitas();
  const { profile } = useAuth();
  const esAdminPrincipal = profile?.role === "ADMIN_PRINCIPAL";

  const [mostrarFormListaNegra, setMostrarFormListaNegra] = useState(false);
  const [motivoListaNegra, setMotivoListaNegra] = useState("");
  const [reversibleListaNegra, setReversibleListaNegra] = useState(false);
  const [guardandoListaNegra, setGuardandoListaNegra] = useState(false);
  const [gestiones, setGestiones] = useState<GestionRow[]>([]);
  const { convenios } = useConvenios();
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const cliente: Cliente | null = useMemo(
    () => clientes.find(c => c.id === clienteId) ?? null,
    [clientes, clienteId],
  );

  const contratoActivo = useMemo(
    () => contratos.find(c => c.cliente_id === clienteId && c.estado === "Activo") ?? null,
    [contratos, clienteId],
  );

  const conveniosCliente = useMemo(
    () => contratoActivo
      ? convenios.filter(cv => cv.contrato_id === contratoActivo.id)
      : [],
    [convenios, contratoActivo],
  );

  useEffect(() => {
    if (!contratoActivo?.id) return;
    supabase.from("gestiones_cobro")
      .select("id,tipo,resultado,fecha,notas")
      .eq("contrato_id", contratoActivo.id)
      .order("fecha", { ascending: false })
      .limit(10)
      .then(({ data }) => setGestiones(data ?? []));
  }, [contratoActivo?.id]);

  const moto = useMemo(
    () => (contratoActivo?.moto_id ? motos.find(m => m.id === contratoActivo.moto_id) ?? null : null),
    [motos, contratoActivo],
  );

  const pagosContrato = useMemo(() => {
    if (!contratoActivo) return [];
    return pagos
      .filter(p => p.contrato_id === contratoActivo.id && p.estado === "Confirmado")
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [pagos, contratoActivo]);

  const ultimosPagos = pagosContrato.slice(0, 5);

  const visitaCompletada = useMemo(() => {
    if (!clienteId) return null;
    return (
      visitas
        .filter(v => v.cliente_id === clienteId && v.estado === "Realizada")
        .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null
    );
  }, [visitas, clienteId]);

  if (!clienteId) return null;
  if (!cliente) return null;

  const badgeColors = estadoBadgeColors(cliente.estado);
  const inicial = cliente.nombre.trim()[0]?.toUpperCase() ?? "?";
  const waNumero = (cliente.mismo_whatsapp ? cliente.telefono : cliente.whatsapp)?.replace(/\D/g, "");

  const ahorroAcumulado = contratoActivo?.ahorro_acumulado ?? 0;
  const esDiario = contratoActivo?.tipo_ruta === "diario" || contratoActivo?.forma_pago === "Diario";
  const progresoAhorro = Math.min((ahorroAcumulado / 510000) * 100, 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15,23,42,0.5)",
          zIndex: 200,
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100vw)",
        background: "white",
        zIndex: 201,
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 32px rgba(15,23,42,0.18)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 20px 16px",
          background: "linear-gradient(135deg, #0284c7 0%, #10b981 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "white",
            }}>
              {inicial}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {waNumero && (
                <a
                  href={`https://wa.me/57${waNumero}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 999,
                    padding: "8px 14px", color: "white", fontWeight: 700, fontSize: 13,
                    cursor: "pointer", textDecoration: "none",
                  }}
                >
                  💬 WhatsApp
                </a>
              )}
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 999,
                  width: 36, height: 36, color: "white", fontWeight: 800, fontSize: 18,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ color: "white", fontSize: 19, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.2 }}>
            {cliente.nombre}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <span style={{
              display: "inline-block", padding: "4px 10px", borderRadius: 999,
              background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 700,
            }}>
              {cliente.estado}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>C.C. {cliente.cedula}</span>
          </div>
        </div>

        {/* Cuerpo con scroll */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 24px" }}>

          {/* Información */}
          <SeccionTitulo titulo="Información" />
          <InfoFila label="Teléfono" value={cliente.telefono} />
          {!cliente.mismo_whatsapp && cliente.whatsapp && (
            <InfoFila label="WhatsApp" value={cliente.whatsapp} />
          )}
          <InfoFila label="Dirección" value={cliente.direccion} />
          <InfoFila label="Fuente llegada" value={cliente.fuente_llegada} />
          {(cliente.referido_por_nombre || cliente.referido_por_cedula) && (
            <InfoFila label="Referido por" value={`${cliente.referido_por_nombre ?? ""} ${cliente.referido_por_cedula ? `· C.C. ${cliente.referido_por_cedula}` : ""}`.trim()} />
          )}
          <InfoFila label="Registro" value={formatDate(cliente.created_at)} />

          {/* Contrato activo */}
          <SeccionTitulo titulo="Contrato activo" />
          {contratoActivo ? (
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
              {moto && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{moto.placa}</span>
                  <span style={{ fontSize: 13, color: "#64748b", marginLeft: 8 }}>{moto.marca} {moto.modelo}</span>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: badgeColors.bg, color: badgeColors.color, fontSize: 12, fontWeight: 700 }}>
                  {contratoActivo.estado}
                </span>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: "#e0f2fe", color: "#0369a1", fontSize: 12, fontWeight: 700 }}>
                  {contratoActivo.forma_pago}
                </span>
              </div>
              <InfoFila label="Tarifa diaria" value={`$ ${fmt(contratoActivo.tarifa_diaria ?? 27000)}`} />
              {contratoActivo.dia_pago && <InfoFila label="Día de pago" value={formatDiaPago(contratoActivo)} />}
              {contratoActivo.fecha_entrega && <InfoFila label="Fecha entrega" value={formatDate(contratoActivo.fecha_entrega)} />}

              {esDiario && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#334155", fontWeight: 700, marginBottom: 6 }}>
                    Ahorro acumulado: $ {fmt(ahorroAcumulado)} / $ 510.000
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      width: `${progresoAhorro}%`,
                      background: progresoAhorro >= 100 ? "#166534" : "linear-gradient(90deg, #0284c7, #10b981)",
                      transition: "width 0.3s",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{progresoAhorro.toFixed(1)}% completado</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 13 }}>Sin contrato activo.</div>
          )}

          {/* Últimos pagos */}
          <SeccionTitulo titulo="Últimos pagos" />
          {ultimosPagos.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13 }}>Sin pagos confirmados.</div>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {ultimosPagos.map(p => (
                <div key={p.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "9px 12px", borderRadius: 12,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>$ {fmt(p.valor)}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {formatDate(p.fecha)} · {p.metodo}
                      {p.tipo_registro === "campo" && " · Campo"}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    background: p.metodo === "Efectivo" ? "#dcfce7" : "#dbeafe",
                    color: p.metodo === "Efectivo" ? "#166534" : "#1d4ed8",
                  }}>
                    {p.metodo}
                  </span>
                </div>
              ))}
              {pagosContrato.length > 5 && (
                <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", marginTop: 4 }}>
                  Ver todos ({pagosContrato.length} pagos confirmados)
                </div>
              )}
            </div>
          )}

          {/* Documentos */}
          <SeccionTitulo titulo="Documentos" />
          <div style={{ display: "grid", gap: 12 }}>
            <DocsSection doc={cliente.documentos_cliente} titulo="Cliente" />
            {cliente.acompanante_nombre && (
              <div>
                <DocsSection doc={cliente.documentos_acompanante} titulo={`Acompañante: ${cliente.acompanante_nombre}`} />
              </div>
            )}
          </div>

          {/* Autorización de datos */}
          {(cliente.autorizacion_datos_firma_url || cliente.autorizacion_datos_huella_url) && (
            <>
              <SeccionTitulo titulo="Autorización de datos" />
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  {cliente.autorizacion_datos_firma_url && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Firma</div>
                      <img
                        src={cliente.autorizacion_datos_firma_url}
                        alt="Firma"
                        onClick={() => setImagenAmpliada(cliente.autorizacion_datos_firma_url)}
                        style={{ width: 100, height: 100, objectFit: "contain", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}
                      />
                    </div>
                  )}
                  {cliente.autorizacion_datos_huella_url && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Huella</div>
                      <img
                        src={cliente.autorizacion_datos_huella_url}
                        alt="Huella"
                        onClick={() => setImagenAmpliada(cliente.autorizacion_datos_huella_url)}
                        style={{ width: 100, height: 100, objectFit: "contain", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer" }}
                      />
                    </div>
                  )}
                </div>
                <div
                  onClick={() => imprimirAutorizacionDatos(cliente)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                    fontSize: 13, fontWeight: 700, color: "#0284c7",
                  }}
                >
                  🖨️ Imprimir documento
                </div>
              </div>
            </>
          )}

          {/* Visita domiciliaria */}
          {visitaCompletada && (
            <>
              <SeccionTitulo titulo="Visita domiciliaria" />
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: visitaCompletada.resultado === "Aprobado" ? "#dcfce7" : "#fee2e2",
                    color: visitaCompletada.resultado === "Aprobado" ? "#166534" : "#991b1b",
                  }}>
                    {visitaCompletada.resultado ?? "Sin resultado"}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b" }}>{formatDate(visitaCompletada.fecha)}</span>
                </div>
                <InfoFila label="¿Vive allí?" value={visitaCompletada.entrevista.viveAlli} />
                <InfoFila label="Tipo vivienda" value={visitaCompletada.entrevista.tipoVivienda} />
                <InfoFila label="Tiempo residencia" value={visitaCompletada.entrevista.tiempoResidencia} />
                {visitaCompletada.entrevista.observaciones && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#334155" }}>
                    <span style={{ fontWeight: 700 }}>Observaciones: </span>
                    {visitaCompletada.entrevista.observaciones}
                  </div>
                )}
                {visitaCompletada.entrevista.recomendacion && (
                  <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: visitaCompletada.entrevista.recomendacion === "Rechazado" ? "#991b1b" : "#166534" }}>
                    Recomendación: {visitaCompletada.entrevista.recomendacion}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Estado de cuenta */}
          {contratoActivo && (
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => imprimirEstadoCuenta(cliente, contratoActivo, moto, pagosContrato)}
                style={{
                  width: "100%", padding: "13px", borderRadius: 14, border: "none",
                  background: "#f1f5f9", color: "#334155", fontWeight: 700,
                  fontSize: 14, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                🧾 Estado de cuenta
              </button>
            </div>
          )}

          {/* Gestiones de cobro */}
          {gestiones.length > 0 && (
            <>
              <SeccionTitulo titulo={`Gestiones de cobro (${gestiones.length})`} />
              <div style={{ display: "grid", gap: 6 }}>
                {gestiones.map(g => (
                  <div key={g.id} style={{ padding: "8px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, color: "#334155", textTransform: "capitalize" }}>{g.tipo.replace(/_/g, " ")}</span>
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{new Date(g.fecha + "T00:00:00").toLocaleDateString("es-CO")}</span>
                    </div>
                    {g.resultado && <div style={{ color: "#64748b", marginTop: 2 }}>{g.resultado}</div>}
                    {g.notas && <div style={{ color: "#94a3b8", fontStyle: "italic", marginTop: 2 }}>{g.notas}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Convenios activos */}
          {conveniosCliente.length > 0 && (
            <>
              <SeccionTitulo titulo={`Convenios (${conveniosCliente.length}/3)`} />
              <div style={{ display: "grid", gap: 6 }}>
                {conveniosCliente.map(cv => (
                  <div key={cv.id} style={{ padding: "10px 12px", borderRadius: 10, background: cv.estado === "activo" ? "#f0fdf4" : "#f8fafc", border: `1px solid ${cv.estado === "activo" ? "#bbf7d0" : "#e2e8f0"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>$ {Math.round(cv.cuota_por_periodo).toLocaleString("es-CO")}/cuota × {cv.numero_cuotas}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: cv.estado === "activo" ? "#dcfce7" : "#f1f5f9", color: cv.estado === "activo" ? "#166534" : "#64748b" }}>{cv.estado}</span>
                    </div>
                    {cv.concepto && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{cv.concepto}</div>}
                    {cv.fecha_limite && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Límite: {new Date(cv.fecha_limite + "T00:00:00").toLocaleDateString("es-CO")}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Marcar lista negra — solo ADMIN_PRINCIPAL y si no está en lista negra */}
          {esAdminPrincipal && !cliente.lista_negra && (
            <div style={{ marginTop: 16 }}>
              {!mostrarFormListaNegra ? (
                <button
                  onClick={() => setMostrarFormListaNegra(true)}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 14, border: "none",
                    background: "#1f2937", color: "#f9fafb", fontWeight: 700,
                    fontSize: 13, cursor: "pointer",
                  }}
                >
                  ⛔ Marcar lista negra
                </button>
              ) : (
                <div style={{ background: "#1f2937", borderRadius: 16, padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#f9fafb" }}>⛔ Marcar en lista negra</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Motivo (obligatorio)</div>
                    <textarea
                      value={motivoListaNegra}
                      onChange={e => setMotivoListaNegra(e.target.value)}
                      placeholder="Describe el motivo..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #374151", background: "#111827", color: "#f9fafb", fontSize: 13, minHeight: 70, boxSizing: "border-box", resize: "vertical" }}
                    />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#d1d5db", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={reversibleListaNegra}
                      onChange={e => setReversibleListaNegra(e.target.checked)}
                    />
                    ¿Es reversible? (puede ser rehabilitado)
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={!motivoListaNegra.trim() || guardandoListaNegra}
                      onClick={async () => {
                        if (!motivoListaNegra.trim()) return;
                        setGuardandoListaNegra(true);
                        await supabase.from("clientes").update({
                          lista_negra: true,
                          motivo_lista_negra: motivoListaNegra.trim(),
                          lista_negra_reversible: reversibleListaNegra,
                        }).eq("id", cliente.id);
                        setGuardandoListaNegra(false);
                        setMostrarFormListaNegra(false);
                        setMotivoListaNegra("");
                        setReversibleListaNegra(false);
                      }}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 12, border: "none",
                        background: "#dc2626", color: "white", fontWeight: 700, fontSize: 13,
                        cursor: !motivoListaNegra.trim() ? "not-allowed" : "pointer",
                        opacity: !motivoListaNegra.trim() ? 0.5 : 1,
                      }}
                    >
                      {guardandoListaNegra ? "Guardando..." : "Confirmar"}
                    </button>
                    <button
                      onClick={() => { setMostrarFormListaNegra(false); setMotivoListaNegra(""); setReversibleListaNegra(false); }}
                      style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#374151", color: "#d1d5db", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox para ampliar firma/huella */}
      {imagenAmpliada && (
        <div
          onClick={() => setImagenAmpliada(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)",
            zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
        >
          <img
            src={imagenAmpliada}
            alt="Ampliada"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, background: "white", objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
