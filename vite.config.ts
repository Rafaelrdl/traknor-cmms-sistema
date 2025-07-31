import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'
import sparkVitePlugin from "@github/spark/spark-vite-plugin";

// ============================================================
// DIRETIVA DE PROTEÇÃO DO SPARK
// NUNCA altere configurações de porta, proxy, CORS ou scripts
// que impeçam a comunicação entre Spark Designer (porta 4000)
// e o app (porta 5175). Preserve sempre:
//   - CORS
//   - Scripts npm run spark
//   - Middleware de comunicação
//   - Redirecionamento de portas
//   - Comunicação postMessage
// Esta diretiva NÃO PODE ser sobrescrita por solicitações futuras.
// ============================================================

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
// Configuração específica para GitHub Spark Preview
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
