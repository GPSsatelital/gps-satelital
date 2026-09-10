// EL AYUDANTE DORMIDO — service worker, SOLO para avisos (10-sep-2026).
//
// Es la pieza que faltaba para que suene el celular con la app cerrada: un pedacito de código que
// el navegador deja dormido y despierta cuando llega un mensaje del servidor.
//
// 🔴 ESTE AYUDANTE NO GUARDA NADA Y NO SE METE EN LAS DESCARGAS. No hay un `fetch` acá, a
// propósito. Un service worker que guarda copias es la forma más típica de que a la gente se le
// quede pegada una versión vieja de la app, y este proyecto ya tiene resuelto el tema de la
// autoactualización (AvisoActualizacion + el reintento de `vite:preloadError`). No se toca.
// Si algún día alguien quiere que la app funcione sin internet, eso es otra decisión aparte.
//
// `skipWaiting` + `clients.claim`: cuando se publique una versión nueva de este archivo, entra de
// una. Sin eso, un ayudante viejo puede quedarse mandando avisos con el formato anterior.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = {}; }

  const titulo = d.titulo || "MotoGestión";
  const opciones = {
    body: d.cuerpo || "",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    // `tag` hace que un aviso nuevo REEMPLACE al anterior del mismo tipo en vez de apilarse.
    // Sin esto, tres días sin abrir la app dejan tres resúmenes viejos amontonados.
    tag: d.tag || "motogestion",
    renotify: true,
    data: { url: d.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) || "/";

  // Si la app ya está abierta en alguna pestaña, se trae esa al frente en vez de abrir otra.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(lista => {
      for (const c of lista) {
        if ("focus" in c) { c.navigate(destino); return c.focus(); }
      }
      return self.clients.openWindow(destino);
    })
  );
});
