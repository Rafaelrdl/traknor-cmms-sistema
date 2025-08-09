// Development utilities for the Procedures module

import { initializeStorage, createSampleFiles } from '@/data/proceduresStore';

/**
 * Initialize procedures data for development
 * This should be called once when the app starts
 */
export async function initializeProceduresForDev() {
  try {
    // Initialize localStorage with mock data
    initializeStorage();
    
    // Create sample files in IndexedDB
    await createSampleFiles();
    
    console.log('✅ Procedures module initialized successfully');
  } catch (error) {
    console.warn('⚠️ Error initializing procedures module:', error);
  }
}

/**
 * Clear all procedures data (useful for testing)
 */
export function clearProceduresData() {
  localStorage.removeItem('procedures:db');
  localStorage.removeItem('procedure_categories:db');
  
  // Clear IndexedDB
  const request = indexedDB.deleteDatabase('ProceduresDB');
  request.onsuccess = () => {
    console.log('🗑️ Procedures data cleared');
  };
  request.onerror = (error) => {
    console.warn('Error clearing procedures data:', error);
  };
}

/**
 * Development helper to log current procedures state
 */
export function debugProceduresState() {
  const procedures = JSON.parse(localStorage.getItem('procedures:db') || '[]');
  const categories = JSON.parse(localStorage.getItem('procedure_categories:db') || '[]');
  
  console.group('📋 Procedures Debug State');
  console.log('Procedures:', procedures);
  console.log('Categories:', categories);
  console.groupEnd();
}

// Make utilities available in development
if (import.meta.env.DEV) {
  (window as any).proceduresDevUtils = {
    initialize: initializeProceduresForDev,
    clear: clearProceduresData,
    debug: debugProceduresState,
  };
  
  console.log('🔧 Procedures dev utils available at window.proceduresDevUtils');
}