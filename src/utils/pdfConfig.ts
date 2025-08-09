// PDF.js worker configuration utility
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker for react-pdf version 10.x
if (typeof window !== 'undefined') {
  // For react-pdf v10.x, we need to set the worker source explicitly
  const pdfjsVersion = pdfjs.version || '3.11.174';
  
  // Try multiple CDN sources for reliability
  const workerUrls = [
    `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
    'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js',
  ];
  
  let workerConfigured = false;
  
  for (const url of workerUrls) {
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = url;
      console.log(`PDF.js worker configured with URL: ${url}`);
      workerConfigured = true;
      break;
    } catch (error) {
      console.warn(`Failed to configure PDF.js worker with URL: ${url}`, error);
    }
  }
  
  if (!workerConfigured) {
    console.warn('Could not configure PDF.js worker with any URL, PDF functionality may be impaired');
  }
}

export function configurePDFWorker() {
  // Function for manual configuration if needed
  if (typeof window === 'undefined') return;
  
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const pdfjsVersion = pdfjs.version || '3.11.174';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
    console.log('PDF.js worker manually configured');
  }
  
  return pdfjs.GlobalWorkerOptions.workerSrc;
}

// Debugging helper
export function checkPDFWorkerStatus() {
  console.log('PDF.js version:', pdfjs.version);
  console.log('Worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('Worker configured:', !!pdfjs.GlobalWorkerOptions.workerSrc);
}