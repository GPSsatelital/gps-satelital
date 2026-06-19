import type { Liquidacion } from "../hooks/useLiquidaciones";

type Cliente = { nombre: string; cedula?: string; telefono?: string };
type Moto = { marca?: string; modelo?: string; placa?: string };

const MOTIVO_LABEL: Record<string, string> = {
  cumplimiento: "Cumplimiento de contrato",
  retiro_voluntario: "Retiro voluntario del cliente",
  incumplimiento: "Retiro por incumplimiento",
};

function cop(n: number) {
  return `$${Math.abs(n).toLocaleString("es-CO")}`;
}

export function generarDocumentoLiquidacion(
  liq: Liquidacion,
  cliente: Cliente,
  moto: Moto | null
) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Liquidación ${liq.numero}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 40px; }
  h1 { font-size: 22px; text-align: center; margin-bottom: 4px; }
  .subtitulo { text-align: center; font-size: 13px; color: #64748b; margin-bottom: 24px; }
  .seccion { margin-bottom: 20px; }
  .seccion h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 10px; }
  .fila { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .fila span:first-child { color: #64748b; }
  .fila span:last-child { font-weight: 600; }
  .tabla { width: 100%; border-collapse: collapse; margin-top: 6px; }
  .tabla th, .tabla td { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: left; font-size: 12px; }
  .tabla th { background: #f8fafc; font-weight: 700; }
  .total-row td { font-weight: 700; background: #f1f5f9; }
  .saldo-positivo { color: #16a34a; font-size: 18px; font-weight: 800; }
  .saldo-negativo { color: #dc2626; font-size: 18px; font-weight: 800; }
  .firmas { display: flex; gap: 40px; margin-top: 60px; }
  .firma-box { flex: 1; border-top: 1px solid #334155; padding-top: 8px; text-align: center; font-size: 12px; }
  .numero-liq { position: absolute; top: 40px; right: 40px; font-size: 12px; color: #64748b; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="numero-liq">${liq.numero} · ${new Date(liq.created_at).toLocaleDateString("es-CO")}</div>
<h1>GPS Satelital</h1>
<p class="subtitulo">DOCUMENTO DE LIQUIDACIÓN DE CONTRATO</p>

<div class="seccion">
  <h2>Datos del cliente</h2>
  <div class="fila"><span>Nombre</span><span>${cliente.nombre}</span></div>
  ${cliente.cedula ? `<div class="fila"><span>Cédula</span><span>${cliente.cedula}</span></div>` : ""}
  ${cliente.telefono ? `<div class="fila"><span>Teléfono</span><span>${cliente.telefono}</span></div>` : ""}
</div>

${moto ? `<div class="seccion">
  <h2>Vehículo</h2>
  ${moto.marca ? `<div class="fila"><span>Marca</span><span>${moto.marca}</span></div>` : ""}
  ${moto.modelo ? `<div class="fila"><span>Modelo</span><span>${moto.modelo}</span></div>` : ""}
  ${moto.placa ? `<div class="fila"><span>Placa</span><span>${moto.placa}</span></div>` : ""}
</div>` : ""}

<div class="seccion">
  <h2>Motivo de liquidación</h2>
  <div class="fila"><span>Motivo</span><span>${MOTIVO_LABEL[liq.motivo] ?? liq.motivo}</span></div>
  ${liq.observaciones_taller ? `<div class="fila"><span>Observaciones taller</span><span>${liq.observaciones_taller}</span></div>` : ""}
</div>

<div class="seccion">
  <h2>Liquidación financiera</h2>
  <table class="tabla">
    <thead><tr><th>Concepto</th><th>Valor</th></tr></thead>
    <tbody>
      <tr><td>Ahorro acumulado</td><td>${cop(liq.ahorro_acumulado)}</td></tr>
      ${liq.detalle_deudas.map((d) => `<tr><td>Deuda: ${d.concepto}</td><td>- ${cop(d.monto)}</td></tr>`).join("")}
      ${liq.detalle_danos.map((d) => `<tr><td>Daño: ${d.concepto}</td><td>- ${cop(d.monto)}</td></tr>`).join("")}
      <tr class="total-row"><td>SALDO FINAL</td><td class="${liq.saldo_final >= 0 ? "saldo-positivo" : "saldo-negativo"}">${liq.saldo_final >= 0 ? cop(liq.saldo_final) : `(${cop(liq.saldo_final)}) — CLIENTE DEBE`}</td></tr>
    </tbody>
  </table>
</div>

<div class="firmas">
  <div class="firma-box">
    <p>${liq.nombre_responsable ?? "________________________"}</p>
    <p>${liq.cargo_responsable ?? "Responsable GPS Satelital"}</p>
    <p style="margin-top:4px;color:#64748b">Por la empresa</p>
  </div>
  <div class="firma-box">
    <p>________________________</p>
    <p>${cliente.nombre}</p>
    <p style="margin-top:4px;color:#64748b">El cliente</p>
  </div>
</div>
</body>
</html>`;

  const ventana = window.open("", "_blank", "width=800,height=900");
  if (!ventana) return;
  ventana.document.write(html);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
