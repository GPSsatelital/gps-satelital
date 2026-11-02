// LA TARJETA «REFERIDO POR» CUANDO LO TRAJO ALGUIEN DEL EQUIPO (pedido del dueño, 2-nov-2026, D-062).
//
// Al escoger a la persona en «¿Alguien del equipo lo trajo?», la tarjeta se llena sola con su nombre
// y con la cédula que el dueño le guardó en Usuarios (mig 212), y no se puede cambiar a mano. Si
// todavía no tiene cédula guardada, se escribe a mano como antes. «Nadie» la deja vacía.
//
// Una tarjeta vieja que no coincide con lo guardado (se escribió a mano con otra cédula) queda como
// estaba y se puede tocar a mano: la app no cambia sola ninguna tarjeta de un cliente ya registrado.

export type PersonaEquipo = { id: string; nombre: string };

export type TarjetaReferido = {
  referido_por_funcionario: string | null;
  referido_por_nombre: string;
  referido_por_cedula: string;
};

/** Quiénes leen las cédulas del equipo: espejo de la regla de lectura de la mig 212. */
export const ROLES_QUE_VEN_CEDULAS_EQUIPO: ReadonlySet<string> = new Set(["ADMIN_PRINCIPAL", "ADMIN", "SECRETARIA"]);

const soloDigitos = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");
const nombreTarjeta = (s: string | null | undefined) => (s ?? "").trim().toUpperCase();

/** Lo que queda en la tarjeta al escoger a alguien del equipo (o a nadie: `null`). */
export function alEscogerDelEquipo(
  id: string | null,
  equipo: ReadonlyArray<PersonaEquipo>,
  cedulas: ReadonlyMap<string, string>,
): TarjetaReferido {
  if (!id) return { referido_por_funcionario: null, referido_por_nombre: "", referido_por_cedula: "" };
  return {
    referido_por_funcionario: id,
    referido_por_nombre: nombreTarjeta(equipo.find(p => p.id === id)?.nombre),
    referido_por_cedula: cedulas.get(id) ?? "",
  };
}

/** ¿La tarjeta es la que llenó la app con lo guardado en Usuarios? Entonces no se toca a mano. */
export function tarjetaLlenadaPorLaApp(
  tarjeta: { referido_por_funcionario?: string | null; referido_por_nombre?: string | null; referido_por_cedula?: string | null },
  equipo: ReadonlyArray<PersonaEquipo>,
  cedulas: ReadonlyMap<string, string>,
): boolean {
  const id = tarjeta.referido_por_funcionario;
  if (!id) return false;
  const cedula = cedulas.get(id);
  const persona = equipo.find(p => p.id === id);
  if (!cedula || !persona) return false;
  return soloDigitos(tarjeta.referido_por_cedula) === cedula
    && nombreTarjeta(tarjeta.referido_por_nombre) === nombreTarjeta(persona.nombre);
}
