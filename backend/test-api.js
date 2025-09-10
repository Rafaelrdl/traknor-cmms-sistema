#!/usr/bin/env node

const axios = require('axios');
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const BASE_URL = 'http://localhost:3333/api';
let authToken = '';

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');

const makeRequest = async (method, endpoint, data = null, useAuth = false) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (useAuth && authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 0
    };
  }
};

// Test functions
async function testHealthCheck() {
  logInfo('Testando Health Check...');
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    logSuccess(`Health Check OK - Status: ${result.status}`);
    console.log('  Resposta:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    logError(`Health Check falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testAuthentication() {
  logInfo('Testando autenticação...');
  
  // Test login with admin credentials
  const loginData = {
    email: 'admin@traknor.com',
    password: 'admin123'
  };

  const result = await makeRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    authToken = result.data.data.access_token;
    logSuccess(`Login realizado com sucesso`);
    console.log('  Token obtido:', authToken ? 'Sim' : 'Não');
    return true;
  } else {
    logError(`Login falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testUsersList() {
  logInfo('Testando listagem de usuários...');
  const result = await makeRequest('GET', '/users', null, true);
  
  if (result.success) {
    logSuccess(`Usuários listados com sucesso - ${result.data.data.length} usuários encontrados`);
    result.data.data.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    return true;
  } else {
    logError(`Listagem de usuários falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testCompaniesEndpoint() {
  logInfo('Testando endpoint de empresas...');
  const result = await makeRequest('GET', '/companies', null, true);
  
  if (result.success) {
    logSuccess(`Empresas listadas com sucesso - ${result.data.data.length} empresa(s) encontrada(s)`);
    result.data.data.forEach(company => {
      console.log(`  - ${company.name} (${company.cnpj || 'Sem CNPJ'})`);
    });
    return true;
  } else {
    logError(`Listagem de empresas falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testEquipmentEndpoint() {
  logInfo('Testando endpoint de equipamentos...');
  const result = await makeRequest('GET', '/equipment', null, true);
  
  if (result.success) {
    logSuccess(`Equipamentos listados com sucesso - ${result.data.data.length} equipamento(s) encontrado(s)`);
    result.data.data.forEach(equipment => {
      console.log(`  - ${equipment.name} (${equipment.code}) - Status: ${equipment.status}`);
    });
    return true;
  } else {
    logError(`Listagem de equipamentos falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testWorkOrdersEndpoint() {
  logInfo('Testando endpoint de ordens de serviço...');
  const result = await makeRequest('GET', '/work-orders', null, true);
  
  if (result.success) {
    logSuccess(`Ordens de serviço listadas com sucesso - ${result.data.data.length} OS encontrada(s)`);
    result.data.data.forEach(workOrder => {
      console.log(`  - ${workOrder.title} (${workOrder.code}) - Status: ${workOrder.status}`);
    });
    return true;
  } else {
    logError(`Listagem de ordens de serviço falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testPlansEndpoint() {
  logInfo('Testando endpoint de planos de manutenção...');
  const result = await makeRequest('GET', '/plans', null, true);
  
  if (result.success) {
    logSuccess(`Planos de manutenção listados com sucesso - ${result.data.data.length} plano(s) encontrado(s)`);
    result.data.data.forEach(plan => {
      console.log(`  - ${plan.name} - Frequência: ${plan.frequency} - Status: ${plan.status}`);
    });
    return true;
  } else {
    logError(`Listagem de planos falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

async function testCreateEquipment() {
  logInfo('Testando criação de equipamento...');
  
  const equipmentData = {
    code: `EQ-TEST-${Date.now()}`,
    name: 'Equipamento de Teste',
    type: 'Teste',
    manufacturer: 'Fabricante Teste',
    model: 'Modelo Teste',
    company_id: '1',
    sector_id: '1',
    status: 'OPERATIONAL',
    criticality: 'MEDIUM'
  };

  const result = await makeRequest('POST', '/equipment', equipmentData, true);
  
  if (result.success) {
    logSuccess(`Equipamento criado com sucesso - ID: ${result.data.data.id}`);
    console.log('  Equipamento:', JSON.stringify(result.data.data, null, 2));
    return result.data.data.id;
  } else {
    logError(`Criação de equipamento falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return null;
  }
}

async function testCreateWorkOrder() {
  logInfo('Testando criação de ordem de serviço...');
  
  const workOrderData = {
    code: `OS-TEST-${Date.now()}`,
    title: 'OS de Teste',
    description: 'Ordem de serviço criada para teste da API',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    company_id: '1',
    sector_id: '1',
    assigned_to: 'user-tech-002',
    scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 2,
    tasks: [
      {
        id: '1',
        name: 'Verificar problema',
        completed: false,
        checklist: [
          { id: '1', description: 'Identificar causa', completed: false },
          { id: '2', description: 'Documentar problema', completed: false }
        ]
      }
    ]
  };

  const result = await makeRequest('POST', '/work-orders', workOrderData, true);
  
  if (result.success) {
    logSuccess(`Ordem de serviço criada com sucesso - ID: ${result.data.data.id}`);
    console.log('  OS:', JSON.stringify(result.data.data, null, 2));
    return result.data.data.id;
  } else {
    logError(`Criação de OS falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return null;
  }
}

async function testMetricsEndpoint() {
  logInfo('Testando endpoint de métricas...');
  const result = await makeRequest('GET', '/metrics/dashboard', null, true);
  
  if (result.success) {
    logSuccess(`Métricas obtidas com sucesso`);
    console.log('  Métricas:', JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    logError(`Obtenção de métricas falhou - Status: ${result.status}`);
    console.log('  Erro:', result.error);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🚀 INICIANDO TESTES DA API TRAKNOR CMMS', 'cyan');
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Autenticação', fn: testAuthentication },
    { name: 'Listagem de Usuários', fn: testUsersList },
    { name: 'Listagem de Empresas', fn: testCompaniesEndpoint },
    { name: 'Listagem de Equipamentos', fn: testEquipmentEndpoint },
    { name: 'Listagem de Ordens de Serviço', fn: testWorkOrdersEndpoint },
    { name: 'Listagem de Planos', fn: testPlansEndpoint },
    { name: 'Criação de Equipamento', fn: testCreateEquipment },
    { name: 'Criação de Ordem de Serviço', fn: testCreateWorkOrder },
    { name: 'Métricas do Dashboard', fn: testMetricsEndpoint }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log('\n' + '-'.repeat(40));
    try {
      const result = await test.fn();
      if (result !== false) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Erro inesperado no teste ${test.name}: ${error.message}`);
      failed++;
    }
    console.log('-'.repeat(40));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('📊 RESUMO DOS TESTES', 'cyan');
  console.log('='.repeat(60));
  logSuccess(`Testes aprovados: ${passed}`);
  if (failed > 0) {
    logError(`Testes falharam: ${failed}`);
  }
  log(`Total de testes: ${passed + failed}`, 'blue');
  
  const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
  log(`Taxa de sucesso: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
  
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (error) {
  logError('axios não está instalado. Execute: npm install axios');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  process.exit(1);
});
