// Diagrama chico de la moto vista desde arriba, con una flecha que marca desde
// dónde tomar la foto — para que el funcionario no confunda un ángulo con otro.
// Compartido entre la entrega de moto (WizardContrato), la recolección
// (ModalRecoleccion) y la devolución de retenidas — mismos ángulos, misma
// exigencia de evidencia completa.
// La 6ª foto ("persona") NO es un ángulo del vehículo: es la persona que recibe/
// entrega la moto al lado de ella (cara visible) — respaldo legal de a quién se
// le dio o de quién se recibió físicamente. Va SEPARADA de la trasera para que
// la placa de la trasera quede legible sin competir con la persona.

export type AnguloFoto = "lateral_derecho" | "lateral_izquierdo" | "delantera" | "trasera" | "arriba" | "persona";

export const ANGULOS_FOTO: { key: AnguloFoto; label: string }[] = [
  { key: "delantera", label: "Delantera" },
  { key: "lateral_izquierdo", label: "Lateral izq." },
  { key: "arriba", label: "Arriba" },
  { key: "lateral_derecho", label: "Lateral der." },
  { key: "trasera", label: "Trasera (placa)" },
  { key: "persona", label: "Persona + moto" },
];

export function IconoAngulo({ angulo }: { angulo: AnguloFoto }) {
  // La persona lleva su propio glifo (persona junto a la moto), no la flecha de ángulo.
  if (angulo === "persona") {
    return (
      <svg viewBox="0 0 60 40" width="34" height="24">
        {/* moto */}
        <rect x="30" y="18" width="22" height="7" rx="3" fill="var(--faint)" />
        <circle cx="32" cy="26" r="5" fill="var(--muted2)" />
        <circle cx="50" cy="26" r="5" fill="var(--muted2)" />
        {/* persona al lado */}
        <circle cx="14" cy="12" r="4" fill="var(--accent)" />
        <rect x="10" y="17" width="8" height="14" rx="3" fill="var(--accent)" />
      </svg>
    );
  }
  const moto = (
    <>
      <rect x="18" y="16" width="24" height="8" rx="3" fill="var(--faint)" />
      <circle cx="18" cy="20" r="6" fill="var(--muted2)" />
      <circle cx="42" cy="20" r="6" fill="var(--muted2)" />
    </>
  );
  const flecha = {
    delantera: <polygon points="42,2 38,8 46,8" fill="var(--accent)" />,
    trasera: <polygon points="18,2 14,8 22,8" fill="var(--accent)" />,
    lateral_izquierdo: <polygon points="2,20 8,16 8,24" fill="var(--accent)" />,
    lateral_derecho: <polygon points="58,20 52,16 52,24" fill="var(--accent)" />,
    arriba: <polygon points="30,2 25,10 35,10" fill="var(--accent)" />,
    persona: null,
  }[angulo];
  return (
    <svg viewBox="0 0 60 40" width="34" height="24">
      {moto}
      {flecha}
      {angulo === "arriba" && <circle cx="30" cy="20" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2,2" />}
    </svg>
  );
}
