// Convierte un HTML (el de useDocumentos.ts, con firma/huella ya incrustadas) a un PDF
// real de varias páginas y lo devuelve como Blob para subir a Storage.
// Usa html2canvas + jsPDF. La librería se importa de forma dinámica: es pesada y solo se necesita
// al firmar, así no infla la carga inicial de la app.
//
// OJO: por defecto la imagen se parte en franjas del alto exacto de la hoja, sin mirar qué queda
// en el corte (puede partir una línea en dos). Con `cortesSeguros` corta entre filas y bloques y
// respeta `page-break-before:always`. Por ahora solo lo usa el informe de Reportes (5-oct): los
// contratos, pagarés y liquidaciones siguen como estaban hasta revisarlos aparte.
export async function htmlAPdfBlob(htmlEntrada: string, opciones: { cortesSeguros?: boolean } = {}): Promise<Blob> {
  let html = htmlEntrada;
  // Se captura DIRECTO con html2canvas sobre el elemento montado en pantalla y se arma el PDF
  // con jsPDF a mano. Antes se usaba html2pdf.js, que internamente RE-CLONA el contenido a un
  // contenedor fuera de pantalla para procesarlo — y esa copia salía SIEMPRE en blanco (PDFs
  // de 3 KB, una hoja A4 vacía). Capturando el elemento real evitamos ese clon.
  const [{ default: html2canvas }, jspdfMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const JsPDF = jspdfMod.jsPDF;

  // 21-sep-2026: por acá pasan TODOS los PDF que genera la app, así que es el punto donde se
  // firman sus imágenes. Las firmas y huellas que vienen de `urlADataUrl` ya son dataURL y no
  // se tocan; esto cubre las que quedaron como URL pública guardada.
  const { firmarImagenesHtml } = await import("../lib/storagePrivado");
  html = await firmarImagenesHtml(html);

  // Montar el HTML en pantalla, realmente renderizado (html2canvas captura en blanco si el
  // elemento no está visible o está en position:fixed). Ancho A4 @ 96dpi = 794px.
  const cont = document.createElement("div");
  cont.style.position = "absolute";
  cont.style.left = "0";
  cont.style.top = "0";
  cont.style.width = "794px";
  // Papel blanco SIEMPRE. No usar var(--card): en modo noche es navy y, además,
  // html2canvas no resuelve var() en su parser de color y lanza
  // "unsupported color function var" (backgroundColor abajo).
  cont.style.background = "#ffffff";
  cont.style.color = "#000000";
  cont.style.zIndex = "2147483647";
  cont.innerHTML = html;
  document.body.appendChild(cont);

  try {
    // Esperar a que carguen las imágenes (firma/huella) + un frame antes de capturar.
    const imgs = Array.from(cont.querySelectorAll("img"));
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); })));
    await new Promise((r) => setTimeout(r, 150));

    // Los bloques que no se deben partir se miden ANTES de capturar, sobre el elemento montado.
    const zonas = opciones.cortesSeguros ? medirZonas(cont) : null;

    const canvas = await html2canvas(cont, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();   // 210mm
    const pageH = pdf.internal.pageSize.getHeight();   // 297mm
    const margin = 8;                                  // mm
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;
    const imgH = (canvas.height * usableW) / canvas.width; // alto total escalado al ancho útil

    if (imgH <= usableH) {
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin, usableW, imgH);
    } else {
      // Multipágina: recortar el canvas en franjas del alto de una página A4.
      const pxPerMm = canvas.width / usableW;               // misma escala px/mm en vertical
      const sliceHpx = Math.floor(usableH * pxPerMm);
      // Con cortes seguros, dónde termina cada página (en px del canvas); si no, franjas parejas.
      const escala = canvas.width / cont.offsetWidth;
      const finales = zonas
        ? [...calcularCortes(canvas.height / escala, sliceHpx / escala, zonas.bloques, zonas.forzados).map(c => Math.round(c * escala)), canvas.height]
        : null;
      let y = 0;
      let primera = true;
      while (y < canvas.height) {
        const hpx = finales ? (finales.find(f => f > y) ?? canvas.height) - y : Math.min(sliceHpx, canvas.height - y);
        const franja = document.createElement("canvas");
        franja.width = canvas.width;
        franja.height = hpx;
        const ctx = franja.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, franja.width, franja.height);
        ctx.drawImage(canvas, 0, y, canvas.width, hpx, 0, 0, canvas.width, hpx);
        if (!primera) pdf.addPage();
        pdf.addImage(franja.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin, usableW, hpx / pxPerMm);
        primera = false;
        y += hpx;
      }
    }

    return pdf.output("blob");
  } finally {
    document.body.removeChild(cont);
  }
}

/** Lo que no se debe partir entre dos páginas, en px del documento (0 = arriba del todo):
 *  cada fila de tabla, lo marcado `data-no-cortar`, lo que pide `page-break-inside:avoid` (si cabe
 *  en una hoja) y cada título `data-con-siguiente` junto con lo que lo sigue (para que no quede
 *  solo al pie de una hoja). `forzados` = donde una sección pide empezar en hoja nueva. */
function medirZonas(cont: HTMLElement): { bloques: Array<[number, number]>; forzados: number[] } {
  const y0 = cont.getBoundingClientRect().top;
  const caja = (el: Element): [number, number] => { const r = el.getBoundingClientRect(); return [r.top - y0, r.bottom - y0]; };
  const hoja = cont.offsetWidth * (281 / 194); // alto útil de una hoja A4 con 8 mm de margen, en px
  const estilo = (el: Element) => el.getAttribute("style") ?? "";
  const bloques: Array<[number, number]> = [];
  cont.querySelectorAll("tr, [data-no-cortar]").forEach(el => bloques.push(caja(el)));
  cont.querySelectorAll("[style*='page-break-inside']").forEach(el => {
    const [a, b] = caja(el);
    if (/page-break-inside:\s*avoid/.test(estilo(el)) && b - a <= hoja * 0.6) bloques.push([a, b]);
  });
  cont.querySelectorAll("[data-con-siguiente]").forEach(el => {
    const [a, b] = caja(el);
    const sig = el.nextElementSibling;
    if (!sig) return;
    const filas = sig.tagName === "TABLE" ? sig.querySelectorAll("tr") : null;
    const fin = filas && filas.length > 0 ? caja(filas[Math.min(1, filas.length - 1)])[1] : caja(sig)[1];
    bloques.push([a, fin - a <= hoja * 0.5 ? fin : b]);
  });
  const forzados = [...cont.querySelectorAll("[style*='page-break-before']")]
    .filter(el => /page-break-before:\s*always/.test(estilo(el)))
    .map(el => caja(el)[0]);
  return { bloques: bloques.filter(([a, b]) => b > a), forzados };
}

/**
 * Dónde termina cada página para no partir nada por la mitad. Arranca con la hoja llena y, si el
 * corte cae dentro de un bloque, lo sube al comienzo de ese bloque (sin dejar la hoja con menos de
 * un cuarto de contenido: un bloque más alto que una hoja sí se parte). Una sección que pide hoja
 * nueva corta ahí. Devuelve los cortes intermedios (sin el final del documento).
 */
export function calcularCortes(total: number, hoja: number, bloques: Array<[number, number]>, forzados: number[]): number[] {
  const cortes: number[] = [];
  let y = 0;
  for (let vueltas = 0; vueltas < 1000; vueltas++) {
    const forzado = forzados.filter(f => f > y + 1 && f < Math.min(y + hoja, total)).sort((a, b) => a - b)[0];
    if (forzado === undefined && total - y <= hoja) break;
    let fin = forzado ?? y + hoja;
    if (forzado === undefined) {
      let movio = true;
      while (movio) {
        movio = false;
        for (const [a, b] of bloques) {
          if (a < fin - 0.5 && b > fin + 0.5 && a > y + hoja * 0.25) { fin = a; movio = true; }
        }
      }
    }
    cortes.push(fin);
    y = fin;
  }
  return cortes;
}

// Descarga una imagen remota (ej. huella del registro en Storage) y la convierte a
// dataURL, para incrustarla en el PDF sin problemas de CORS/taint de html2canvas.
//
// 21-sep-2026: ES EL EMBUDO de las imágenes de TODOS los documentos — contrato, pagaré,
// liquidación, acuerdo de tiempo y las huellas del registro (11 puntos de llamada). Antes hacía
// `fetch` sobre la URL pública guardada; el día que los buckets se cierren eso devolvería 400 y
// el documento saldría SIN FIRMA. Ahora pide el enlace firmado primero (`urlFirmada` devuelve la
// URL original si no es de Storage, así que un dataURL recién capturado sigue funcionando).
//
// OJO — sigue devolviendo `null` cuando falla, y quien la llama pinta el recuadro vacío sin
// avisar: un documento puede salir impreso sin firma y nadie se enteraría. Avisarle al
// funcionario es un cambio de comportamiento en los 11 puntos; queda anotado en PENDIENTES.
export async function urlADataUrl(url: string): Promise<string | null> {
  try {
    const { urlFirmada } = await import("../lib/storagePrivado");
    const firmada = await urlFirmada(url);
    if (!firmada) return null;
    const resp = await fetch(firmada);
    if (!resp.ok) {
      console.warn(`[pdf] no se pudo bajar la imagen del documento (${resp.status}):`, url);
      return null;
    }
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("[pdf] falló la imagen del documento:", url, e);
    return null;
  }
}
