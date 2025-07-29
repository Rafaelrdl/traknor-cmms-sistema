#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🧹 Cleaning project and testing build...');

try {
  console.log('1. Clearing Vite cache...');
  execSync('rm -rf node_modules/.vite', { stdio: 'inherit' });
  
  console.log('2. Testing TypeScript compilation...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  console.log('3. Testing build process...');
  execSync('npx vite build --mode development', { stdio: 'inherit' });
  
  console.log('✅ All tests passed! Project should run correctly.');
  
} catch (error) {
  console.error('❌ Build failed with error:', error.message);
  process.exit(1);
}