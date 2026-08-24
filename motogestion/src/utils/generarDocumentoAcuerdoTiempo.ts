// EL ACUERDO DE TIEMPO FUERA DE SERVICIO — el papel que respalda rodar (o cobrar) el tiempo que
// la moto estuvo guardada. Regla del dueño: esa decisión SIEMPRE queda firmada por el cliente,
// porque su contrato termina en una fecha distinta de la que él creía.
//
// Mismo molde de tres modos del documento de liquidación, desde UN solo armador:
//   · borrador  → marca "BORRADOR", firmas en blanco: lo que el cliente LEE antes (o se imprime
//                 para firmar en papel, que sigue siendo el respaldo).
//   · firmado   → firma y huella incrustadas: lo que se convierte en PDF y queda guardado.
//
// Colores en hex a propósito, NUNCA var(--…): ventana aparte sin el CSS de la app + html2canvas
// revienta con "unsupported color function var".

export type DatosAcuerdoTiempo = {
  cliente: { nombre: string; cedula?: string | null };
  placa: string;
  motivo: string;                      // Taller · Fiscalía · Entrega temporal...
  fechaEntrada: string;
  fechaSalida: string;
  dias: number;
  decision: "rodar_al_final" | "cobrar_ahora";
  /** Solo rodar: cuántos períodos completos se corren y de cuántos días. */
  periodosCompletos?: number;
  diasARodar?: number;
  fechaFinAnterior?: string | null;
  fechaFinNueva?: string | null;
  /** Solo rodar, cliente CON convenio: las cuotas del convenio de esas semanas se corren
   *  también (el paquete completo). El papel lo dice — nada queda en el aire. */
  convenioCorrido?: { cuotas: number; valorCuota: number } | null;
  /** Solo cobrar: el valor que queda como deuda. */
  valorCobrar?: number;
  observaciones?: string;
};

export type OpcionesAcuerdo = {
  borrador?: boolean;
  firmaUrl?: string | null;
  huellaUrl?: string | null;
  fechaFirma?: string | null;
};

function cop(n: number) {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}

function fechaLarga(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

export function htmlAcuerdoTiempo(d: DatosAcuerdoTiempo, opts: OpcionesAcuerdo = {}) {
  const { borrador = false, firmaUrl = null, huellaUrl = null, fechaFirma = null } = opts;
  const rodar = d.decision === "rodar_al_final";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>Acuerdo de tiempo fuera de servicio — ${d.placa}</title>
<style>
  @page { size: letter; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #0f172a; padding: 26px; position: relative; }
  @media print { body { padding: 0; } }
  h1 { font-size: 19px; text-align: center; margin-bottom: 2px; }
  .subtitulo { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 18px; }
  .datos { display: flex; flex-wrap: wrap; gap: 2px 28px; margin-bottom: 16px; }
  .fila { display: flex; justify-content: space-between; gap: 14px; flex: 1 1 44%; min-width: 0; margin-bottom: 4px; }
  .fila span:first-child { color: #64748b; }
  .fila span:last-child { font-weight: 600; text-align: right; }
  .clausulas { line-height: 1.65; font-size: 12.5px; }
  .clausulas li { margin: 0 0 10px 18px; }
  .destacado { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 12px 0; font-size: 13px; }
  .destacado strong { font-size: 15px; }
  .cierre { page-break-inside: avoid; break-inside: avoid; }
  .firmas { display: flex; gap: 26px; margin-top: 34px; align-items: flex-end; }
  .firma-box { flex: 1; text-align: center; font-size: 12px; }
  .firma-trazo { height: 104px; display: flex; align-items: flex-end; justify-content: center; }
  .firma-trazo img { max-height: 100px; max-width: 100%; }
  .firma-linea { border-top: 1px solid #334155; padding-top: 8px; }
  .huella-box { width: 110px; text-align: center; font-size: 11px; color: #64748b; }
  .huella-cuadro { width: 92px; height: 92px; margin: 0 auto 5px; border: 1px solid #334155; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .huella-cuadro img { max-width: 100%; max-height: 100%; }
  .constancia { margin-top: 16px; font-size: 11px; color: #475569; line-height: 1.55; text-align: justify; }
  .marca-borrador { position: absolute; top: 42%; left: 0; width: 100%; text-align: center; font-size: 90px; font-weight: 800; color: #e2e8f0; letter-spacing: 14px; transform: rotate(-22deg); z-index: 0; }
  .aviso-borrador { border: 2px dashed #b45309; background: #fef3c7; color: #92400e; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; font-weight: 700; text-align: center; }
  .contenido { position: relative; z-index: 1; }
</style>
</head>
<body>
${borrador ? `<div class="marca-borrador">BORRADOR</div>` : ""}
<div class="contenido">
<h1>Club Moteros Cartagena</h1>
<p class="subtitulo">ACUERDO POR TIEMPO FUERA DE SERVICIO DEL VEHÍCULO</p>

${borrador ? `<div class="aviso-borrador">
  Esta es una copia de revisión. Todavía NO está firmada y no tiene valor.<br/>
  Léala con calma: si algo no le cuadra, dígalo antes de firmar.
</div>` : ""}

<div class="datos">
  <div class="fila"><span>Cliente</span><span style="text-transform:uppercase">${d.cliente.nombre}</span></div>
  ${d.cliente.cedula ? `<div class="fila"><span>Cédula</span><span>${d.cliente.cedula}</span></div>` : ""}
  <div class="fila"><span>Placa</span><span>${d.placa}</span></div>
  <div class="fila"><span>Motivo</span><span>${d.motivo}</span></div>
</div>

<div class="clausulas">
  <ol>
    <li>La moto de placa <strong>${d.placa}</strong> estuvo fuera de servicio en poder de la empresa
      <strong>${d.dias} día${d.dias === 1 ? "" : "s"}</strong>, desde el <strong>${fechaLarga(d.fechaEntrada)}</strong>
      hasta el <strong>${fechaLarga(d.fechaSalida)}</strong>.</li>
    ${rodar ? `
    <li>De común acuerdo, ese tiempo (<strong>${d.periodosCompletos} período${d.periodosCompletos === 1 ? "" : "s"} completo${d.periodosCompletos === 1 ? "" : "s"} = ${d.diasARodar} días</strong>)
      <strong>SE RUEDA AL FINAL del contrato</strong>: esa${d.periodosCompletos === 1 ? "" : "s"} cuota${d.periodosCompletos === 1 ? "" : "s"} no se
      exige${d.periodosCompletos === 1 ? "" : "n"} ahora ni queda${d.periodosCompletos === 1 ? "" : "n"} como deuda, y el cliente la${d.periodosCompletos === 1 ? "" : "s"} pagará al final,
      cuando le corresponda.</li>
    ${d.convenioCorrido ? `
    <li>Su <strong>acuerdo de pago (convenio)</strong> también se corre: la${d.convenioCorrido.cuotas === 1 ? "" : "s"}
      <strong>${d.convenioCorrido.cuotas} cuota${d.convenioCorrido.cuotas === 1 ? "" : "s"} de ${cop(d.convenioCorrido.valorCuota)}</strong> de
      esa${d.convenioCorrido.cuotas === 1 ? "" : "s"} semana${d.convenioCorrido.cuotas === 1 ? "" : "s"} se pagará${d.convenioCorrido.cuotas === 1 ? "" : "n"} en las
      semanas siguientes. <strong>El total del convenio no cambia ni un peso.</strong></li>` : ""}
    <li>El cliente entiende y acepta que la cuota <strong>no se perdona — se corre</strong>, y que su contrato
      termina <strong>${d.diasARodar} días más tarde</strong> de lo previsto${d.fechaFinNueva ? `:
      pasa del <strong>${d.fechaFinAnterior ? fechaLarga(d.fechaFinAnterior) : "—"}</strong> al
      <strong>${fechaLarga(d.fechaFinNueva)}</strong> (fecha aproximada — el contrato termina al completar
      todos sus pagos)` : ""}.</li>` : `
    <li>De común acuerdo, ese tiempo <strong>SE COBRA</strong>: queda registrada una deuda de
      <strong>${cop(d.valorCobrar ?? 0)}</strong> a cargo del cliente (${d.dias} día${d.dias === 1 ? "" : "s"} × tarifa diaria).
      El contrato NO se extiende.</li>`}
    ${d.observaciones ? `<li>Observaciones: ${d.observaciones}</li>` : ""}
  </ol>
</div>

<div class="destacado">
  ${rodar
    ? `En resumen: <strong>no se cobra nada hoy</strong> por esos días, y el contrato termina <strong>${d.diasARodar} días más tarde</strong>.`
    : `En resumen: el cliente queda debiendo <strong>${cop(d.valorCobrar ?? 0)}</strong> por esos días, y su fecha de fin no cambia.`}
</div>

<div class="cierre">
<div class="firmas">
  <div class="firma-box">
    <div class="firma-trazo"></div>
    <div class="firma-linea">
      <p style="font-weight:700">________________________</p>
      <p style="margin-top:4px;color:#64748b">Por la empresa</p>
    </div>
  </div>
  <div class="firma-box">
    <div class="firma-trazo">${firmaUrl ? `<img src="${firmaUrl}" alt="Firma del cliente"/>` : ""}</div>
    <div class="firma-linea">
      <p style="font-weight:700;text-transform:uppercase">${d.cliente.nombre}</p>
      ${d.cliente.cedula ? `<p style="color:#64748b">C.C. ${d.cliente.cedula}</p>` : ""}
      <p style="margin-top:4px;color:#64748b">El cliente</p>
    </div>
  </div>
  <div class="huella-box">
    <div class="huella-cuadro">${huellaUrl ? `<img src="${huellaUrl}" alt="Huella del cliente"/>` : ""}</div>
    <p>Huella del cliente</p>
  </div>
</div>

<p class="constancia">
  Con su firma y su huella el cliente declara que leyó este acuerdo, que entiende
  ${rodar ? "que su contrato termina en la nueva fecha aquí indicada" : "la deuda aquí registrada"}
  y que está de acuerdo con lo pactado.
  ${fechaFirma ? `Firmado el ${new Date(fechaFirma).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}.` : ""}
</p>
</div>
</div>
</body>
</html>`;
}

/** Abre el acuerdo en una ventana aparte y manda a imprimir (para el camino de papel). */
export function imprimirAcuerdoTiempo(d: DatosAcuerdoTiempo, opts: OpcionesAcuerdo = {}) {
  const ventana = window.open("", "_blank", "width=800,height=900");
  if (!ventana) return;
  ventana.document.write(htmlAcuerdoTiempo(d, opts));
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
