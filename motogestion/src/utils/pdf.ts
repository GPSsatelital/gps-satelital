// Convierte un HTML (el de useDocumentos.ts, con firma/huella ya incrustadas) a un PDF
// real de varias páginas y lo devuelve como Blob para subir a Storage.
// Usa html2pdf.js (html2canvas + jsPDF). Respeta `page-break-inside:avoid` de las cláusulas.
// La librería se importa de forma dinámica: es pesada y solo se necesita al firmar, así
// no infla la carga inicial de la app.
export async function htmlAPdfBlob(html: string): Promise<Blob> {
  const { default: html2pdf } = await import("html2pdf.js");
  // html2canvas necesita el contenido montado y medible en el DOM. Lo ponemos en un
  // contenedor fuera de pantalla con ancho de página para que renderice como una hoja.
  const cont = document.createElement("div");
  cont.style.position = "fixed";
  cont.style.left = "-10000px";
  cont.style.top = "0";
  cont.style.width = "800px";
  cont.style.background = "white";
  cont.innerHTML = html;
  document.body.appendChild(cont);

  // Se define como variable (no literal en línea) para que TS no marque `pagebreak`
  // como propiedad extra — su type.d.ts no la lista aunque la librería sí la soporta.
  const opt = {
    margin: [10, 8, 12, 8] as [number, number, number, number],
    image: { type: "jpeg" as const, quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  try {
    const blob: Blob = await html2pdf().set(opt).from(cont).outputPdf("blob");
    return blob;
  } finally {
    document.body.removeChild(cont);
  }
}

// Descarga una imagen remota (ej. huella del registro en Storage) y la convierte a
// dataURL, para incrustarla en el PDF sin problemas de CORS/taint de html2canvas.
export async function urlADataUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
