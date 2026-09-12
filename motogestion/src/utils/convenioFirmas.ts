// QUIÉN FIRMÓ EL ACUERDO DE PAGO.
//
// Desde el 12-sep-2026 el acuerdo lo puede firmar el titular, la acompañante (como codeudora
// solidaria) o los dos: "si uno no está, el otro también puede hacer el proceso por él" — y para
// la firma y la huella "ambos es como si fueran lo mismo" (palabras del dueño).
//
// No hace falta guardar quién firmó: se sabe por cuál de las dos firmas quedó guardada. Pero SÍ
// hay que decirlo en pantalla y en el papel, que fue la otra mitad de lo que pidió: "hay que
// marcarlo para que se sepa".

export type QuienFirmo = "titular" | "acompanante" | "ambos" | "ninguno";

export function quienFirmoConvenio(cv: { firma_url?: string | null; firma_acompanante_url?: string | null } | null | undefined): QuienFirmo {
  const t = !!cv?.firma_url;
  const a = !!cv?.firma_acompanante_url;
  if (t && a) return "ambos";
  if (a) return "acompanante";
  if (t) return "titular";
  return "ninguno";
}

/** Etiqueta corta para la pantalla. `null` = no hay nada que aclarar (lo firmó el titular). */
export function marcaDeFirma(
  cv: { firma_url?: string | null; firma_acompanante_url?: string | null; acompanante_nombre?: string | null } | null | undefined,
): string | null {
  const quien = quienFirmoConvenio(cv);
  const nombre = (cv?.acompanante_nombre ?? "").trim().toUpperCase();
  if (quien === "acompanante") return `Firmado por ${nombre || "la acompañante"} (codeudora, en representación del titular)`;
  if (quien === "ambos") return `Firmado por el titular y ${nombre || "la acompañante"} (codeudora)`;
  return null;
}
