// Convierte un HTML (el de useDocumentos.ts, con firma/huella ya incrustadas) a un PDF
// real de varias páginas y lo devuelve como Blob para subir a Storage.
// Usa html2pdf.js (html2canvas + jsPDF). Respeta `page-break-inside:avoid` de las cláusulas.
// La librería se importa de forma dinámica: es pesada y solo se necesita al firmar, así
// no infla la carga inicial de la app.
export async function htmlAPdfBlob(htmlEntrada: string): Promise<Blob> {
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
      let y = 0;
      let primera = true;
      while (y < canvas.height) {
        const hpx = Math.min(sliceHpx, canvas.height - y);
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
