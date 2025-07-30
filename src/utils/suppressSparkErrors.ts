/**
 * Utility to suppress GitHub Spark internal errors that don't affect functionality
 */
export function suppressSparkErrors() {
  if (typeof window !== 'undefined') {
    // Override console.error to filter out Spark-specific errors
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Filter out specific Spark-related errors
      const sparkErrors = [
        'fetch-patch.ts',
        'curly-succotash',
        'app.github.dev',
        'WorkbenchPreviewContext',
        'CORS policy',
        '401 (Unauthorized)'
      ];
      
      // Only suppress if it's a Spark-related error
      const isSparkError = sparkErrors.some(error => message.includes(error));
      
      if (!isSparkError) {
        originalError.apply(console, args);
      }
    };
    
    // Handle unhandled rejections related to Spark
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || event.reason || '';
      
      if (message.includes('fetch-patch') || 
          message.includes('curly-succotash') || 
          message.includes('app.github.dev')) {
        event.preventDefault();
      }
    });
  }
}