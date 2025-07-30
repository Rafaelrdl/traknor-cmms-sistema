#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const validatePostCSSConfig = () => {
  const configFiles = [
    'postcss.config.js',
    'postcss.config.cjs',
    'packages/spark-tools/postcss.config.js'
  ];

  console.log('🔍 Validando configurações PostCSS...\n');

  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      console.log(`✅ ${file} - Encontrado`);
      
      if (content.includes("'tailwindcss':") || content.includes('"tailwindcss":')) {
        console.error(`❌ ${file} está usando tailwindcss diretamente!`);
        console.log('   Deve usar @tailwindcss/postcss em vez disso\n');
        return false;
      }
      
      if (content.includes("@tailwindcss/postcss")) {
        console.log(`   ✅ Usando @tailwindcss/postcss corretamente\n`);
      }
    } else {
      console.log(`⚠️  ${file} - Não encontrado\n`);
    }
  });
  
  // Verificar vite.config.ts
  if (fs.existsSync('vite.config.ts')) {
    const content = fs.readFileSync('vite.config.ts', 'utf8');
    console.log('✅ vite.config.ts - Encontrado');
    
    if (content.includes('@tailwindcss/vite')) {
      console.log('   ✅ Usando @tailwindcss/vite corretamente\n');
    } else {
      console.log('   ⚠️  @tailwindcss/vite não encontrado\n');
    }
  }
  
  console.log('✅ Validação das configurações PostCSS concluída!\n');
  return true;
};

validatePostCSSConfig();
