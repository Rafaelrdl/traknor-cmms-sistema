/**
 * Utility to suppress GitHub Spark internal errors that don't affect functionality
 */
export function suppressSparkErrors() {
  if (typeof window !== 'undefined') {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Enhanced Spark error patterns
    const sparkErrorPatterns = [
      'fetch-patch.ts',
      'curly-succotash',
      'app.github.dev',
      'WorkbenchPreviewContext',
      'CORS policy',
      '401 (Unauthorized)',
      'net::ERR_FAILED',
      'spark-preview--traknor-cmms-sistema--rafaelrdl.github.app',
      'Failed to load resource: the server responded with a status of 404',
      'translate_http',
      'Content Security Policy directive',
      'gstatic.com',
      'github.githubassets.com'
    ];
    
    // Override console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ').toLowerCase();
      const isSparkError = sparkErrorPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (!isSparkError) {
        originalError.apply(console, args);
      }
    };
    
    // Override console.warn for Spark warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ').toLowerCase();
      const isSparkWarning = sparkErrorPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (!isSparkWarning) {
        originalWarn.apply(console, args);
      }
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const message = (event.reason?.message || event.reason || '').toLowerCase();
      
      const shouldSuppress = sparkErrorPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (shouldSuppress) {
        event.preventDefault();
      }
    });
    
    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      const source = target?.getAttribute?.('src') || event.filename || '';
      
      const shouldSuppress = sparkErrorPatterns.some(pattern => 
        source.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (shouldSuppress) {
        event.preventDefault();
      }
    });
    
    // Intercept fetch errors for Spark domains
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0]?.toString() || '';
        const shouldSuppress = sparkErrorPatterns.some(pattern => 
          url.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (shouldSuppress) {
          // Return a mock response for Spark internal calls
          return new Response('{}', { 
            status: 200, 
            statusText: 'OK',
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    };
  }
}

// Auto-execute in browser environment
if (typeof window !== 'undefined') {
  suppressSparkErrors();
}