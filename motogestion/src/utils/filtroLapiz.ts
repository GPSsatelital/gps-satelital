// Filtro de lápiz para tabletas digitalizadoras.
// Ignora los CLICS que vienen de un lápiz en todo el programa, MENOS mientras se está
// firmando (document.body.dataset.firmando === "1"). Así el lápiz solo sirve para DIBUJAR
// la firma (eso usa pointermove, no se bloquea) y los botones se tocan con el mouse — se
// evitan los clics involuntarios cuando el lápiz roza la tableta sin querer.
//
// Ojo: solo tiene efecto si Windows reporta la tableta como pointerType "pen". Las tabletas
// viejas que se reportan como "mouse" no se pueden distinguir del mouse real, así que en esas
// el filtro no hace nada (pero tampoco estorba).
export function instalarFiltroLapiz(): () => void {
  let ultimoTipo = "";
  const onDown = (e: PointerEvent) => { ultimoTipo = e.pointerType; };
  const onClick = (e: MouseEvent) => {
    if (ultimoTipo === "pen" && document.body.dataset.firmando !== "1") {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
  window.addEventListener("pointerdown", onDown, true);
  window.addEventListener("click", onClick, true);
  return () => {
    window.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("click", onClick, true);
  };
}
