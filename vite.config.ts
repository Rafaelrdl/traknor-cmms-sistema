import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
// Configuração específica para GitHub Spark Preview
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    port: 5175,
    // Proxy para redirecionar chamadas API
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // CORS completo para Spark Preview
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Spark-Preview'],
      exposedHeaders: ['Content-Range', 'X-Content-Range']
    }
  },
  optimizeDeps: {
    exclude: ['@github/spark']
  }
});
