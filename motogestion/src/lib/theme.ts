// ── Tema día/noche (F1 del rediseño) ──
// El modo se elige en Configuración → Apariencia y se guarda por dispositivo.
// "system" sigue la preferencia del celular/PC. index.html aplica el atributo
// ANTES de cargar React (sin parpadeo); este módulo lo mantiene en caliente.

export type ThemeMode = "light" | "dark" | "system";

const KEY = "mg_theme";

export function getThemeMode(): ThemeMode {
  const v = localStorage.getItem(KEY);
  return v === "light" || v === "dark" ? v : "system";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", resolveTheme(mode));
}

export function setThemeMode(mode: ThemeMode) {
  if (mode === "system") localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, mode);
  applyTheme(mode);
}

// Si está en "system", reacciona en vivo cuando el dispositivo cambia de modo.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (getThemeMode() === "system") applyTheme("system");
});
