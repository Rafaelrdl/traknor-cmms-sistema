import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import sparkVitePlugin from "@github/spark/spark-vite-plugin";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
// Configuração específica para GitHub Spark Preview
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    sparkVitePlugin(),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5002,
    host: true,
    cors: {
      origin: [
        'https://github.com',
        'https://*.github.com',
        'https://*.github.app',
        'https://*.app.github.dev'
      ],
      credentials: true
    }
  },
  preview: {
    port: 4173,
    host: true,
    cors: {
      origin: [
        'https://github.com',
        'https://*.github.com',
        'https://*.github.app',
        'https://*.app.github.dev'
      ],
      credentials: true
    }
  }
});
