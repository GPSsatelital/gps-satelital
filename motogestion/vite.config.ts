import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite no lee PORT por su cuenta: si el entorno asigna un puerto (la vista previa de la app
  // lo hace cuando el 5173 está ocupado) hay que pasárselo, o levanta en otro y nadie lo
  // encuentra. Sin PORT definido se comporta como siempre (5173, o el siguiente libre).
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  resolve: {
    alias: {
      // @digitalpersona/devices hace `import 'WebSdk'` — el código real viene
      // del script global en index.html; aquí solo se apunta a un shim vacío.
      WebSdk: fileURLToPath(new URL('./src/types/websdk-shim.ts', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendors compartidos y estables en su propio chunk → se cachean entre
        // despliegues y no se re-descargan al cambiar código de la app.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'framer';
            if (id.includes('@supabase')) return 'supabase';
          }
        },
      },
    },
  },
})
