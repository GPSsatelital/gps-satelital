// Convierte un número a su valor en letras (español), para los documentos legales
// (contrato/pagaré) que exigen "valor en letras". Ej: 202000 → "DOSCIENTOS DOS MIL PESOS".

const UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const ESPECIALES: Record<number, string> = {
  10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
  16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
  20: "VEINTE", 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
  25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE",
};
const DECENAS = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function menorDe100(n: number): string {
  if (n < 10) return UNIDADES[n];
  if (ESPECIALES[n]) return ESPECIALES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} Y ${UNIDADES[u]}`;
}

function menorDe1000(n: number): string {
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const centena = CENTENAS[c];
  if (resto === 0) return centena;
  return `${centena} ${menorDe100(resto)}`;
}

function seccion(n: number, singular: string, plural: string): string {
  if (n === 0) return "";
  if (n === 1) return singular;
  return `${menorDe1000(n)} ${plural}`;
}

// Devuelve el número en letras SIN la palabra "PESOS" (para poder anexar la moneda que se quiera).
export function numeroALetras(num: number): string {
  const n = Math.round(Math.abs(num));
  if (n === 0) return "CERO";

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes: string[] = [];
  if (millones > 0) partes.push(seccion(millones, "UN MILLÓN", "MILLONES"));
  if (miles > 0) partes.push(seccion(miles, "MIL", "MIL"));
  if (resto > 0) partes.push(menorDe1000(resto));

  return partes.join(" ").replace(/\s+/g, " ").trim();
}

// Valor en pesos colombianos en letras. Ej: 202000 → "DOSCIENTOS DOS MIL PESOS M/CTE".
export function pesosALetras(num: number): string {
  return `${numeroALetras(num)} PESOS M/CTE`;
}
