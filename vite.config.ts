import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

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
    port: 5175,
    host: true,
    cors: {
      origin: [
        'https://github.com',
        'https://*.github.com',
        'https://*.github.app',
        'https://*.app.github.dev'
      ],
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    },
    proxy: {
      // Proxy para requisições do Spark
      '/api': {
        target: 'https://api.github.com',
        changeOrigin: true,
        secure: false
      },
      // Proxy para assets
      '/css': {
        target: 'http://localhost:5175',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['@github/spark']
  },
  build: {
    rollupOptions: {
      external: ['@github/spark']
    }
  }
});
