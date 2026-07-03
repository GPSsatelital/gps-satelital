// Shim vacío para el `import 'WebSdk'` interno de @digitalpersona/devices.
// El código real de WebSdk se carga como script global en index.html
// (public/websdk/websdk.client.ui.js) — este archivo solo evita que Vite
// intente resolver ese import como módulo.
export {};
