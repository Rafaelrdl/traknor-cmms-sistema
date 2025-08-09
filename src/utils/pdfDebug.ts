// Debug utility for PDF.js configuration
import { pdfjs } from 'react-pdf';

export function debugPDFConfig() {
  console.log('=== PDF.js Configuration Debug ===');
  console.log('Version:', pdfjs.version);
  console.log('Worker Source:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('Is Worker Configured:', !!pdfjs.GlobalWorkerOptions.workerSrc);
  
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    console.log('Worker URL looks valid:', 
      pdfjs.GlobalWorkerOptions.workerSrc.includes('pdf.worker'));
  }
  
  console.log('=== End Debug ===');
}

// Add to window for browser console access
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).debugPDFConfig = debugPDFConfig;
}