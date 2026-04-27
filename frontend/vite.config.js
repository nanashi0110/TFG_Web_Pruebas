import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ✅ CONFIGURACIÓN DEL SERVIDOR PARA DOCKER
  server: {
    host: true, // Permite que Vite exponga la red fuera del contenedor
    proxy: {
      '/api': {
        // En Docker, apuntamos al nombre del contenedor del servidor Node
        target: 'http://backend:3000', 
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // ✅ AQUÍ ESTÁ LA CURA DEL CALENDARIO (¡Intacta!)
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react-big-calendar']
  }
})