/**
 * Export all custom hooks for the TrakNor CMMS system
 * This file ensures proper organization and easy imports
 */

export { useMobile } from './use-mobile';
export { useData } from './useData';
export { useDataNew } from './useDataNew';
export { useDataTemp } from './useDataTemp';

// Re-export GitHub Spark hooks if available
export { useKV } from '@github/spark/hooks';