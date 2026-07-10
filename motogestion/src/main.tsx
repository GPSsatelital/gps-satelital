import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Red de seguridad: si una carga diferida (ej. el PDF del wizard) falla porque el archivo ya
// no existe —la pestaña quedó con una versión vieja tras un deploy nuevo— recargar una vez.
// El guard por tiempo evita bucles si el fallo es por otra causa (sin conexión, etc.).
window.addEventListener("vite:preloadError", () => {
  const ultima = Number(sessionStorage.getItem("preloadReloadAt") || 0);
  if (Date.now() - ultima < 10000) return;
  sessionStorage.setItem("preloadReloadAt", String(Date.now()));
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(<App />)
