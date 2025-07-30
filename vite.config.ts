import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path';

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    port: 4000,
    host: '0.0.0.0', // Importante para Codespaces
    hmr: {
      clientPort: 443, // Para funcionar com o port forwarding do GitHub Codespaces
      host: 'localhost'
    },
    cors: {
      origin: '*' // Permitir acesso de qualquer origem em desenvolvimento
    },
  },
  preview: {
    port: 4000,
    host: '0.0.0.0'
  }
});