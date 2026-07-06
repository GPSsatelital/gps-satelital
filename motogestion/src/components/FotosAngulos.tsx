// Diagrama chico de la moto vista desde arriba, con una flecha que marca desde
// dónde tomar la foto — para que el funcionario no confunda un ángulo con otro.
// Compartido entre la entrega de moto (WizardContrato) y la recolección
// (ModalRecoleccion) — mismos 5 ángulos, misma exigencia de evidencia completa.

export type AnguloFoto = "lateral_derecho" | "lateral_izquierdo" | "delantera" | "trasera" | "arriba";

export const ANGULOS_FOTO: { key: AnguloFoto; label: string }[] = [
  { key: "delantera", label: "Delantera" },
  { key: "lateral_izquierdo", label: "Lateral izq." },
  { key: "arriba", label: "Arriba" },
  { key: "lateral_derecho", label: "Lateral der." },
  { key: "trasera", label: "Trasera" },
];

export function IconoAngulo({ angulo }: { angulo: AnguloFoto }) {
  const moto = (
    <>
      <rect x="18" y="16" width="24" height="8" rx="3" fill="#94a3b8" />
      <circle cx="18" cy="20" r="6" fill="#334155" />
      <circle cx="42" cy="20" r="6" fill="#334155" />
    </>
  );
  const flecha = {
    delantera: <polygon points="42,2 38,8 46,8" fill="#0284c7" />,
    trasera: <polygon points="18,2 14,8 22,8" fill="#0284c7" />,
    lateral_izquierdo: <polygon points="2,20 8,16 8,24" fill="#0284c7" />,
    lateral_derecho: <polygon points="58,20 52,16 52,24" fill="#0284c7" />,
    arriba: <polygon points="30,2 25,10 35,10" fill="#0284c7" />,
  }[angulo];
  return (
    <svg viewBox="0 0 60 40" width="34" height="24">
      {moto}
      {flecha}
      {angulo === "arriba" && <circle cx="30" cy="20" r="12" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2,2" />}
    </svg>
  );
}
