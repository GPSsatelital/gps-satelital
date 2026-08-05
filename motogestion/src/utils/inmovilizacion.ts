// ¿Se le puede inmovilizar la moto a este contrato?
//
// POR QUÉ EXISTE ESTE ARCHIVO Y NO ESTÁ DENTRO DE cicloPago.ts:
// El candado antes era `calcularEstadoCartera(...) === "mora"`, y esa función a propósito NO
// conoce las deudas — solo mira si la caja del período está llena. Resultado: un cliente podía
// deber plata registrada y salir verde, con el botón de inmovilizar apagado. Meterle las deudas
// a `calcularEstadoCartera` habría movido de golpe los KPIs, los chips de Cartera, el Panel Hoy,
// la campana de alertas, los informes y las 27 pruebas de cicloPago. Por eso la regla de
// inmovilizar vive APARTE y compone las dos cosas: el estado del ciclo + la deuda registrada.
//
// LA REGLA (decisión del dueño, 28-jul-2026): se puede inmovilizar si está en MORA, en GABELA,
// o si debe CUALQUIER cosa. Sus palabras: "de aquí en adelante nadie tendría por qué tener deudas".
//
// Por qué gabela también: el motor de cajas necesita 2 días desde que exige la caja para llamarlo
// mora (0 días = al día, 1 = gabela, 2+ = mora). Con solo "mora", una flota recién migrada es
// inmovilizable en la calle pero imposible de registrar en la app durante sus primeros dos días —
// que fue exactamente lo que pasó con COSTA el 28-jul (~180 contratos).

import type { EstadoCartera } from "./cicloPago";

/**
 * Lo que se le cobra al cliente cuando hay que ir a buscar la moto (recolección o retención).
 * Es el costo del movimiento de personal, y se cobra CADA VEZ que se recoge — no una sola vez.
 *
 * Vive acá, en un solo lugar, porque antes estaba escrito a mano en dos inserciones y en tres
 * textos de pantalla: cambiar el valor obligaba a acordarse de los cinco, y el día que a alguien
 * se le escapara uno, la pantalla diría un precio y la deuda tendría otro.
 *
 * Subió de $20.000 a $30.000 el 5-ago-2026 (decisión del dueño). Las multas ya creadas conservan
 * el valor que tenían: esto solo aplica a las nuevas.
 */
export const MULTA_RECOLECCION = 30000;

export type RazonInmovilizar = "mora" | "gabela" | "deuda";

/** Rótulo corto para mostrar POR QUÉ se habilitó (queda en pantalla y en la gestión). */
export const RAZON_INMOVILIZAR_LABEL: Record<RazonInmovilizar, string> = {
  mora: "en mora",
  gabela: "en gabela (día de gracia vencido)",
  deuda: "con deuda pendiente",
};

/**
 * Devuelve la razón por la que se puede inmovilizar, o `null` si no se puede.
 *
 * Se devuelve la RAZÓN y no un booleano para que la pantalla pueda decir la causa real. Antes el
 * mensaje era siempre "El contrato no está en mora" por descarte, aunque el motivo fuera otro.
 *
 * `deudaPendiente` debe venir contando SOLO las deudas en estado `pendiente`. Las `en_convenio`
 * quedan fuera a propósito: quien financió su deuda en un convenio vigente y lo está cumpliendo no
 * debe quedar habilitado por esa misma deuda — se le cobra por la cuota del convenio, no
 * quitándole la moto. (Mismo criterio que ya usan Cartera e Inmovilizaciones para "cuánto debe".)
 */
export function razonParaInmovilizar(
  estadoCartera: EstadoCartera,
  deudaPendiente: number,
): RazonInmovilizar | null {
  if (estadoCartera === "mora") return "mora";
  if (estadoCartera === "gabela") return "gabela";
  if (deudaPendiente > 0) return "deuda";
  return null;
}

/** Frase para el usuario cuando NO se puede. Explica qué falta, no solo que está bloqueado. */
export function motivoNoInmovilizable(estadoCartera: EstadoCartera, deudaPendiente: number): string {
  if (razonParaInmovilizar(estadoCartera, deudaPendiente)) return "";
  return deudaPendiente > 0
    ? "El cliente está al día y su deuda ya está financiada en un convenio vigente."
    : "El cliente está al día con su cuota y no tiene deudas pendientes.";
}
