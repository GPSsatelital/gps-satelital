// Regenera el contrato/pagaré en PDF de contratos cuyo PDF salió en blanco (bug histórico,
// ver 055 + fix de pdf.ts). Usa las FIRMAS reales guardadas en el Storage (cliente y
// acompañante) + las HUELLAS de la ficha del cliente — no se re-firma nada. Solo aplica a
// contratos que tengan esas firmas guardadas; los que no, no se pueden regenerar.
import { supabase } from "../lib/supabase";
import { htmlAPdfBlob, urlADataUrl } from "./pdf";
import { generarHTMLContrato, generarHTMLPagare, type FirmasDoc } from "../hooks/useDocumentos";
import type { Contrato } from "../hooks/useContratos";
import type { Cliente } from "../hooks/useClientes";
import type { Moto } from "../hooks/useMotos";

const BUCKET = "documentos";

function pub(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function subirPdf(blob: Blob, path: string): Promise<string | null> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "application/pdf", upsert: true });
  if (error) return null;
  return pub(path);
}

// ¿Este contrato tiene firmas guardadas pero su PDF de contrato falta o está en blanco (~3 KB)?
export async function necesitaRegenerar(contratoId: string): Promise<boolean> {
  const { data: firmas } = await supabase.storage.from(BUCKET).list(`firmas/${contratoId}`);
  if (!(firmas ?? []).some(f => f.name === "contrato.png")) return false; // sin firma → no se puede
  const { data: docs } = await supabase.storage.from(BUCKET).list(`contratos/${contratoId}`);
  const pdf = (docs ?? []).find(d => d.name === "contrato.pdf");
  const size = (pdf?.metadata as { size?: number } | null)?.size ?? 0;
  return !pdf || size < 5000; // 3058 bytes = hoja en blanco
}

// Regenera contrato.pdf y pagare.pdf de UN contrato con sus firmas/huellas reales. Devuelve
// true si ambos quedaron subidos y guardados.
export async function regenerarDocsContrato(contrato: Contrato, cliente: Cliente, moto: Moto | null): Promise<boolean> {
  const id = contrato.id;
  const [fContrato, fContratoAc, fPagare, fPagareAc, hCli, hAc] = await Promise.all([
    urlADataUrl(pub(`firmas/${id}/contrato.png`)),
    urlADataUrl(pub(`firmas/${id}/contrato_acompanante.png`)),
    urlADataUrl(pub(`firmas/${id}/pagare.png`)),
    urlADataUrl(pub(`firmas/${id}/pagare_acompanante.png`)),
    cliente.autorizacion_datos_huella_url ? urlADataUrl(cliente.autorizacion_datos_huella_url) : Promise.resolve(null),
    cliente.acompanante_huella_url ? urlADataUrl(cliente.acompanante_huella_url) : Promise.resolve(null),
  ]);
  if (!fContrato || !fPagare) return false; // sin la firma del cliente no se regenera

  const selloFecha = contrato.fecha_entrega ? `Firmado el ${contrato.fecha_entrega}` : null;
  const firmasContrato: FirmasDoc = { firmaCliente: fContrato, firmaAcompanante: fContratoAc, huellaCliente: hCli, huellaAcompanante: hAc, selloFecha };
  const firmasPagare: FirmasDoc = { firmaCliente: fPagare, firmaAcompanante: fPagareAc, huellaCliente: hCli, huellaAcompanante: hAc, selloFecha };

  const urlContrato = await subirPdf(await htmlAPdfBlob(generarHTMLContrato(contrato, cliente, moto, firmasContrato)), `contratos/${id}/contrato.pdf`);
  const urlPagare = await subirPdf(await htmlAPdfBlob(generarHTMLPagare(contrato, cliente, firmasPagare)), `contratos/${id}/pagare.pdf`);

  const upd: Record<string, string> = {};
  if (urlContrato) upd.contrato_pdf_url = urlContrato;
  if (urlPagare) upd.pagare_pdf_url = urlPagare;
  if (Object.keys(upd).length > 0) await supabase.from("contratos").update(upd).eq("id", id);
  return !!(urlContrato && urlPagare);
}
