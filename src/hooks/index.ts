/**
 * Export all custom hooks for the TrakNor CMMS system
 * This file ensures proper organization and easy imports
 */

export { useIsMobile } from './use-mobile';
export { useApi } from './useApi';
export { useApiProxy } from './useApiProxy';

// Re-export GitHub Spark hooks if available
export { useKV } from '@github/spark/hooks';