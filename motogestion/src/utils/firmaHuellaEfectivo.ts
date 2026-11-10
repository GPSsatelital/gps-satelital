// El efectivo de la oficina exige la firma, la huella y la foto del cliente (D-065, mig 215).
// La foto se sumó el 10-nov, por decisión del dueño: «no importa que haya que estar autorizando».
//
// Espejo de `public.falta_firma_huella()` y del candado `trg_enforce_registro_firma_huella`
// de la base: si se cambia la regla acá, se cambia allá, o la pantalla dejará pasar un pago que la
// base frena (o al revés). Las funciones conservan el nombre de cuando eran solo firma y huella.

type ConAutorizacion = {
  autorizacion_datos_firma_url?: string | null;
  autorizacion_datos_huella_url?: string | null;
  foto_perfil_url?: string | null;
};

export type FaltaFirmaHuella = {
  /** Le falta la firma de la autorización de datos. */
  firma: boolean;
  /** Le falta la huella. */
  huella: boolean;
  /** Le falta la foto de perfil. */
  foto: boolean;
  /** Cuántas de las tres le faltan (0 a 3). */
  cuantas: number;
  /** "la firma, la huella y la foto", "la huella y la foto", "la foto"…, o null si tiene las tres. */
  texto: string | null;
};

const NADA: FaltaFirmaHuella = { firma: false, huella: false, foto: false, cuantas: 0, texto: null };

function vacio(v: string | null | undefined): boolean {
  return !v || v.trim() === "";
}

/** "a", "a y b", "a, b y c": igual que la base. */
function enumerar(partes: string[]): string | null {
  if (partes.length === 0) return null;
  if (partes.length === 1) return partes[0];
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/**
 * Qué le falta al cliente para recibirle efectivo en la oficina.
 * Sin cliente no se puede saber: no se frena en la pantalla y decide la base.
 */
export function faltaFirmaHuella(cliente: ConAutorizacion | null | undefined): FaltaFirmaHuella {
  if (!cliente) return NADA;
  const firma = vacio(cliente.autorizacion_datos_firma_url);
  const huella = vacio(cliente.autorizacion_datos_huella_url);
  const foto = vacio(cliente.foto_perfil_url);
  const partes = [firma && "la firma", huella && "la huella", foto && "la foto"].filter((p): p is string => !!p);
  if (partes.length === 0) return NADA;
  return { firma, huella, foto, cuantas: partes.length, texto: enumerar(partes) };
}

/**
 * Qué pagos exigen la firma, la huella y la foto: solo el efectivo que se recibe en la oficina,
 * con el cliente presente. El cobro en campo, las transferencias, el saldo a favor y la semana
 * adelantada no. Sin tipo, se toma el mismo que pone `registrarPago`.
 */
export function exigeFirmaHuella(metodo: string, tipoRegistro?: string | null): boolean {
  const tipo = tipoRegistro ?? (metodo === "Efectivo" ? "normal" : "transferencia");
  return metodo === "Efectivo" && (tipo === "normal" || tipo === "alquiler_reemplazo");
}
