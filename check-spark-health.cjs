const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verificando integridade do projeto Spark\n');
console.log('='.repeat(60));

// 1. Verificar arquivos Cypress
console.log('\n1. ARQUIVOS CYPRESS:');
const cypressFiles = [
  'cypress/e2e/acl/admin.cy.ts',
  'cypress/e2e/acl/technician.cy.ts', 
  'cypress/e2e/acl/requester.cy.ts',
  'cypress/e2e/acl/a11y.cy.ts', // Arquivo corrigido
  'cypress/support/commands.ts',
  'cypress/support/e2e.ts',
  'cypress/tsconfig.json'
];

cypressFiles.forEach(file => {
  const exists = fs.existsSync(path.join('/workspaces/spark-template', file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 2. Verificar servidores
console.log('\n2. STATUS DOS SERVIDORES:');
try {
  execSync('curl -s http://localhost:5000', { timeout: 2000 });
  console.log('✅ Frontend respondendo na porta 5000');
} catch {
  console.log('❌ Frontend não está respondendo');
}

try {
  execSync('curl -s http://localhost:3333/api/health', { timeout: 2000 });
  console.log('✅ Backend respondendo na porta 3333');
} catch {
  console.log('❌ Backend não está respondendo');
}

// 3. Verificar dependências
console.log('\n3. DEPENDÊNCIAS PRINCIPAIS:');
const deps = ['cypress', '@types/cypress', 'vite', 'react', 'typescript'];
deps.forEach(dep => {
  try {
    const version = execSync(`npm list ${dep} --depth=0 2>/dev/null | grep ${dep}`, { encoding: 'utf8' });
    console.log(`✅ ${dep}: instalado`);
  } catch {
    console.log(`❌ ${dep}: não encontrado`);
  }
});

// 4. Verificar configurações
console.log('\n4. ARQUIVOS DE CONFIGURAÇÃO:');
const configs = [
  'cypress.config.ts',
  'vite.config.ts',
  'tsconfig.json',
  'backend/tsconfig.json',
  '.env'
];

configs.forEach(file => {
  const exists = fs.existsSync(path.join('/workspaces/spark-template', file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMO:');

// Contar problemas
let problems = 0;
if (!fs.existsSync('/workspaces/spark-template/cypress/e2e/acl/a11y.cy.ts')) {
  problems++;
  console.log('⚠️  Arquivo a11y.cy.ts precisa ser criado/renomeado');
}

try {
  execSync('curl -s http://localhost:5000', { timeout: 1000 });
} catch {
  problems++;
  console.log('⚠️  Frontend precisa ser reiniciado');
}

try {
  execSync('curl -s http://localhost:3333/api/health', { timeout: 1000 });
} catch {
  problems++;
  console.log('⚠️  Backend precisa ser reiniciado');
}

if (problems === 0) {
  console.log('✅ Sistema está íntegro e funcionando!');
} else {
  console.log(`❌ ${problems} problema(s) encontrado(s) - execute as correções sugeridas`);
}
