import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import sparkVitePlugin from "@github/spark/spark-vite-plugin";

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...sparkVitePlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    host: true,
    port: 5000,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["*"],
      credentials: true
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress Spark-related warnings during build
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            (warning.source?.includes('curly-succotash') ||
             warning.source?.includes('app.github.dev'))) {
          return;
        }
        warn(warning);
      }
    }
  },
  optimizeDeps: {
    exclude: ['@github/spark'] // Don't try to optimize Spark dependencies
  }
});
