/**
 * Utility to detect and handle GitHub Spark environment specifics
 */

export const isSparkEnvironment = () => {
  return typeof window !== 'undefined' && (
    window.location.hostname.includes('github.com') ||
    window.location.hostname.includes('app.github.dev') ||
    window.location.hostname.includes('github.app') ||
    process.env.SPARK_ENVIRONMENT === 'true'
  );
};

export const getSparkWorkbenchId = () => {
  if (typeof window !== 'undefined') {
    // Try to extract workbench ID from hostname patterns
    const hostname = window.location.hostname;
    const match = hostname.match(/([a-z]+-[a-z]+-[a-z0-9]+)/);
    return match ? match[1] : null;
  }
  return null;
};

export const setupSparkEnvironment = () => {
  if (!isSparkEnvironment()) return;

  // Suppress console methods for Spark-specific patterns
  const originalMethods = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };

  const sparkPatterns = [
    'fetch-patch',
    'curly-succotash',
    'app.github.dev',
    'spark-preview',
    'gstatic.com',
    'translate_http',
    'WorkbenchPreviewContext',
    'CORS policy',
    '401 (Unauthorized)',
    'net::ERR_FAILED',
    'Content Security Policy'
  ];

  const shouldSuppress = (message: string) => {
    return sparkPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Override console methods
  Object.keys(originalMethods).forEach(method => {
    (console as any)[method] = (...args: any[]) => {
      const message = args.join(' ');
      if (!shouldSuppress(message)) {
        (originalMethods as any)[method].apply(console, args);
      }
    };
  });

  // Return cleanup function
  return () => {
    Object.assign(console, originalMethods);
  };
};