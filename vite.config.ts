import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const isDev = process.env.NODE_ENV !== 'production'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize SWC for development
      devTarget: 'es2022',
      // Skip transform for known safe libraries
      exclude: /node_modules/,
    }),
    tailwindcss(),
    // DO NOT REMOVE - Required for GitHub Spark compatibility
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'react-pdf', 
      'pdfjs-dist',
      'framer-motion',
      'zustand',
      'd3',
      'three',
      'lucide-react',
      '@phosphor-icons/react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority'
    ],
    // Force optimize these commonly used dependencies
    force: true,
    // Exclude problematic dependencies from optimization
    exclude: [
      'react-pdf/dist/esm/entry.vite',
      'pdfjs-dist/build/pdf.worker.min.js'
    ]
  },
  // Enhanced build configuration
  build: {
    // Increase chunk size limit to reduce bundle splitting overhead
    chunkSizeWarningLimit: 1000,
    // Use modern target for better tree-shaking and smaller bundles
    target: 'es2022',
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Optimize source maps for production
    sourcemap: !isDev ? 'hidden' : true,
    // Minify configuration
    minify: 'esbuild',
    rollupOptions: {
      external: (id) => {
        // Don't bundle PDF worker files
        if (id.includes('pdf.worker')) {
          return true;
        }
        return false;
      },
      output: {
        // Enhanced chunk splitting strategy
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // Data fetching and state
          'data-vendor': ['@tanstack/react-query', 'zustand'],
          // PDF processing (keep separate to avoid loading issues)
          'pdf-vendor': ['react-pdf'],
          // 3D and visualization
          'viz-vendor': ['d3', 'three', 'recharts'],
          // Animation and motion
          'motion-vendor': ['framer-motion'],
          // Utilities
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns']
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: `js/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  // Development server optimizations
  server: {
    // Enable file system caching
    fs: {
      cachedChecks: false
    },
    // Optimize HMR
    hmr: {
      overlay: isDev
    }
  },
  // Enhanced esbuild configuration
  esbuild: {
    // Drop console and debugger in production
    drop: isDev ? [] : ['console', 'debugger'],
    // Use target for better performance
    target: 'es2022',
    // Optimize for size in production
    minifyIdentifiers: !isDev,
    minifySyntax: !isDev,
    minifyWhitespace: !isDev
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    open: false
  }
});
