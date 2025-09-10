import { useRef, useEffect, useState } from 'react';

/**
 * Hook to safely check if React hooks are working properly
 * This helps prevent the "Cannot read properties of null (reading 'useRef')" error
 */
export function useReactSafe() {
  const [isReactReady, setIsReactReady] = useState(false);
  
  useEffect(() => {
    try {
      // Test if React hooks are working properly
      const testRef = { current: null };
      setIsReactReady(true);
    } catch (error) {
      console.error('React hooks not properly initialized:', error);
      setIsReactReady(false);
    }
  }, []);
  
  return isReactReady;
}

/**
 * Safe version of useRef that checks for React availability
 */
export function useSafeRef<T>(initialValue: T | null = null): React.MutableRefObject<T | null> {
  try {
    return useRef<T | null>(initialValue);
  } catch (error) {
    console.error('useRef failed, falling back to object ref:', error);
    return { current: initialValue };
  }
}

/**
 * Safe version of useEffect that checks for React availability
 */
export function useSafeEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
  try {
    return useEffect(effect, deps);
  } catch (error) {
    console.error('useEffect failed:', error);
    // Try to run the effect immediately as fallback
    try {
      const cleanup = effect();
      if (cleanup && typeof cleanup === 'function') {
        // Store cleanup for potential later use
        (window as any).__reactSafeCleanups = (window as any).__reactSafeCleanups || [];
        (window as any).__reactSafeCleanups.push(cleanup);
      }
    } catch (effectError) {
      console.error('Effect execution also failed:', effectError);
    }
  }
}