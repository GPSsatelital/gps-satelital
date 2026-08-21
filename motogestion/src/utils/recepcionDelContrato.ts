// ¿CUÁL RECEPCIÓN ES DE ESTE CONTRATO? — decide la fecha de corte de una liquidación.
//
// Suena trivial y no lo es: muchas recepciones quedaron guardadas SOLO con la moto, sin contrato
// ni cliente. Caso real: IEW65I (ANTONIO MONTERROZA), recibida el 30-jul con sus 6 fotos y con
// `contrato_id` y `cliente_id` en null. La ficha de la moto la mostraba (busca por moto) y la
// pantalla de Inmovilizaciones no (buscaba por contrato) — así que decía "sin fecha registrada"
// aunque la fecha existía, y con eso el reloj de los 7 días marcaba 0 y no dejaba liquidar.
//
// ⚠️ POR QUÉ NO BASTA CON BUSCAR POR MOTO: hay 4 motos que se le quitaron a un cliente y se le
// entregaron a otro (IEW57I, IGC39I, RLT70H, RNG53H). Una misma placa tiene recepciones de dueños
// DISTINTOS. Colgarle a un contrato la recepción del otro corre la fecha de corte, y eso es
// cobrarle de más a uno o de menos al otro. Por eso, cuando la recepción no dice de quién es, se
// le asigna al contrato que TENÍA la moto ese día — el de fecha_entrega más reciente que ya había
// ocurrido cuando se registró la recepción.

export type RecepcionMin = {
  contrato_id: string | null;
  cliente_id: string | null;
  moto_id: string;
  created_at: string;
};

export type ContratoMin = {
  id: string;
  cliente_id: string;
  moto_id: string | null;
  fecha_entrega: string | null;
};

/**
 * La recepción más reciente que le corresponde a este contrato, o null si no hay ninguna.
 *
 * @param recepciones  todas las recepciones del sistema
 * @param contrato     el contrato que se está liquidando / mostrando
 * @param contratosDeLaMoto  TODOS los contratos que han tenido esa moto (para desempatar cuando
 *                           la recepción no dice de quién es)
 */
export function recepcionDelContrato<T extends RecepcionMin>(
  recepciones: T[],
  contrato: ContratoMin,
  contratosDeLaMoto: ContratoMin[],
): T | null {
  const candidatas = recepciones.filter(r => {
    // 1. Enlazada a ESTE contrato: no hay duda.
    if (r.contrato_id === contrato.id) return true;
    // 2. Enlazada a OTRO contrato: es del otro dueño, no se toca.
    if (r.contrato_id != null) return false;
    if (contrato.moto_id == null || r.moto_id !== contrato.moto_id) return false;
    // 3. Sin contrato pero CON cliente: alcanza para saber de quién es.
    if (r.cliente_id != null) return r.cliente_id === contrato.cliente_id;
    // 4. Sin contrato NI cliente (el caso de IEW65I): se le asigna al contrato que tenía la moto
    //    el día en que se registró.
    return contratoQueTeniaLaMoto(contratosDeLaMoto, r.created_at.slice(0, 10)) === contrato.id;
  });

  if (candidatas.length === 0) return null;
  return candidatas.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

/**
 * De todos los contratos que han tenido esa moto, cuál la tenía en una fecha dada: el de
 * `fecha_entrega` más reciente que ya había ocurrido. Si ninguno la tenía todavía, devuelve null
 * (una recepción anterior a la primera entrega no es de nadie).
 */
function contratoQueTeniaLaMoto(contratos: ContratoMin[], fechaISO: string): string | null {
  const yaEntregados = contratos
    .filter(c => c.fecha_entrega != null && c.fecha_entrega <= fechaISO)
    .sort((a, b) => (b.fecha_entrega ?? "").localeCompare(a.fecha_entrega ?? ""));
  return yaEntregados[0]?.id ?? null;
}
