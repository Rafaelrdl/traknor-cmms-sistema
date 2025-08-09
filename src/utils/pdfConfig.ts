// PDF.js worker configuration utility
import { pdfjs } from 'react-pdf';

let isConfigured = false;

export function configurePDFWorker() {
  if (isConfigured) return;

  try {
    // For development/local environments, disable worker to avoid CORS issues
    if (import.meta.env.DEV) {
      pdfjs.GlobalWorkerOptions.workerSrc = '';
      console.log('PDF.js worker disabled for development environment');
    } else {
      // For production, try to use CDN worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log('PDF.js worker configured for production');
    }
    
    isConfigured = true;
  } catch (error) {
    console.warn('Failed to configure PDF.js worker:', error);
    // Fallback to no worker (main thread processing)
    pdfjs.GlobalWorkerOptions.workerSrc = '';
    isConfigured = true;
  }
}

// Auto-configure when module is imported
configurePDFWorker();