import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // @digitalpersona/devices hace `import 'WebSdk'` — el código real viene
      // del script global en index.html; aquí solo se apunta a un shim vacío.
      WebSdk: fileURLToPath(new URL('./src/types/websdk-shim.ts', import.meta.url)),
    },
  },
})
