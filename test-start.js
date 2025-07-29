#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting Vite development server...');

const vite = spawn('npx', ['vite'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

vite.on('error', (error) => {
  console.error('❌ Error starting Vite:', error);
});

vite.on('exit', (code) => {
  console.log(`📊 Vite exited with code ${code}`);
});

// Timeout after 30 seconds for testing
setTimeout(() => {
  console.log('⏰ Test timeout reached, stopping server...');
  vite.kill();
}, 30000);