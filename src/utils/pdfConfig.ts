// PDF.js worker configuration utility
let pdfjs: any = null;

// Safely import pdfjs to avoid initialization errors
try {
  const reactPdf = require('react-pdf');
  pdfjs = reactPdf.pdfjs;
} catch (error) {
  console.warn('react-pdf not available:', error);
}

// Configure PDF.js worker for react-pdf version 10.x
export function configurePDFWorker() {
  if (typeof window === 'undefined' || !pdfjs) return;
  
  try {
    // For react-pdf v10.x with pdfjs-dist@5.3.31
    const pdfjsVersion = '5.3.31';
    
    // Try jsdelivr first as it's more reliable in cloud environments
    const primaryWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;
    
    // Set the worker source
    pdfjs.GlobalWorkerOptions.workerSrc = primaryWorkerUrl;
    
    console.log(`PDF.js worker configured with URL: ${primaryWorkerUrl}`);
    console.log('PDF.js version detected:', pdfjs.version || 'unknown');
    
    return pdfjs.GlobalWorkerOptions.workerSrc;
  } catch (error) {
    console.warn('Failed to configure PDF.js worker:', error);
  }
}

// Enhanced error handling and fallback configuration
export function configurePDFWorkerWithFallback() {
  if (typeof window === 'undefined' || !pdfjs) return;
  
  try {
    const pdfjsVersion = '5.3.31';
    
    // Multiple fallback URLs in order of preference
    const workerUrls = [
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
      `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.js`,
      `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.js`,
      // Latest versions as last resort
      'https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js',
      'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js',
    ];
    
    // Try to set the primary URL
    let selectedUrl = workerUrls[0];
    pdfjs.GlobalWorkerOptions.workerSrc = selectedUrl;
    
    console.log(`PDF.js worker initially configured with: ${selectedUrl}`);
    
    // Test worker availability asynchronously
    testWorkerUrls(workerUrls).then(workingUrl => {
      if (workingUrl && workingUrl !== selectedUrl && pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = workingUrl;
        console.log(`PDF.js worker switched to working URL: ${workingUrl}`);
      }
    }).catch(error => {
      console.warn('PDF.js worker URL testing failed:', error);
      // Use the original primary URL as fallback
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrls[0];
      }
    });
    
    return pdfjs.GlobalWorkerOptions.workerSrc;
  } catch (error) {
    console.warn('Failed to configure PDF.js worker with fallback:', error);
  }
}

// Test which worker URLs are accessible
async function testWorkerUrls(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    try {
      // Use a lightweight HEAD request to test accessibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Avoid CORS issues
      });
      
      clearTimeout(timeoutId);
      
      // For no-cors mode, we can't check response status, so assume success
      console.log(`PDF.js worker URL test passed: ${url}`);
      return url;
    } catch (error) {
      console.warn(`PDF.js worker URL test failed for ${url}:`, error);
      continue;
    }
  }
  
  return null;
}

// Initialize only if everything is available
if (typeof window !== 'undefined' && pdfjs) {
  // Use the simple version first, fallback can be called if needed
  configurePDFWorker();
}

// Debugging helper
export function checkPDFWorkerStatus() {
  if (!pdfjs) {
    console.log('PDF.js not available');
    return { available: false };
  }
  
  console.log('=== PDF.js Configuration Status ===');
  console.log('PDF.js version:', pdfjs.version);
  console.log('Worker source:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('Worker configured:', !!pdfjs.GlobalWorkerOptions.workerSrc);
  
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    console.log('Worker URL format valid:', 
      pdfjs.GlobalWorkerOptions.workerSrc.includes('pdf.worker'));
  }
  
  console.log('=== End Status ===');
  return {
    available: true,
    version: pdfjs.version,
    workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
    isConfigured: !!pdfjs.GlobalWorkerOptions.workerSrc,
  };
}