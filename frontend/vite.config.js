import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ AQUÍ ESTÁ EL PUENTE QUE HABÍAMOS PERDIDO
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <-- Cambia el 5000 si tu servidor Node usa otro puerto
        changeOrigin: true,
      }
    }
  },

  // ✅ AQUÍ ESTÁ LA CURA DEL CALENDARIO
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react-big-calendar']
  }
})