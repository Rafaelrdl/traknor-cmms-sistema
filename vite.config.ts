import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  server: {
    port: 5000,
    host: '0.0.0.0', // Escuta em todas as interfaces (IPv4 e IPv6)
    strictPort: true, // Garante que use sempre a porta 5000
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5000
    }
  },
  preview: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist']
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Don't bundle PDF worker files
        if (id.includes('pdf.worker')) {
          return true;
        }
        return false;
      }
    }
  }
});
