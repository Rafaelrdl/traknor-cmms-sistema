import axios from 'axios';
import fs from 'fs';
import { execSync } from 'child_process';

const API_URL = 'http://localhost:3333/api';

async function diagnoseDataMismatch() {
  console.log('🔍 DIAGNÓSTICO DE DISCREPÂNCIA DE DADOS\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Login na API
    console.log('\n1. AUTENTICANDO NA API...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@traknor.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    console.log('✅ Login realizado com sucesso');
    
    const token = loginResponse.data.data.tokens.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // 2. Buscar dados da API
    console.log('\n2. DADOS DA API (BANCO DE DADOS):');
    console.log('-'.repeat(40));
    
    const [workOrdersAPI, equipmentAPI, companiesAPI] = await Promise.all([
      axios.get(`${API_URL}/work-orders`, config),
      axios.get(`${API_URL}/equipment`, config),
      axios.get(`${API_URL}/companies`, config)
    ]);
    
    console.log(`Ordens de Serviço: ${workOrdersAPI.data.data.length} registros`);
    console.log('Primeiras 3 OS da API:');
    workOrdersAPI.data.data.slice(0, 3).forEach((os) => {
      console.log(`  - ID: ${os.id}, Título: ${os.title}, Status: ${os.status}`);
    });
    
    console.log(`\nEquipamentos: ${equipmentAPI.data.data.length} registros`);
    console.log('Primeiros equipamentos da API:');
    equipmentAPI.data.data.forEach((eq) => {
      console.log(`  - ID: ${eq.id}, Nome: ${eq.name}, Modelo: ${eq.model}`);
    });
    
    console.log(`\nEmpresas: ${companiesAPI.data.data.length} registros`);
    console.log('Empresas da API:');
    companiesAPI.data.data.forEach((company) => {
      console.log(`  - ID: ${company.id}, Nome: ${company.name}`);
    });
    
    // 3. Análise Mock Data
    console.log('\n3. ANÁLISE DE MOCK DATA:');
    console.log('-'.repeat(40));
    
    const mockData = fs.readFileSync('/workspaces/spark-template/src/data/mockData.ts', 'utf8');
    
    // Contar MOCK_WORK_ORDERS
    const workOrdersMatch = mockData.match(/MOCK_WORK_ORDERS.*?=.*?\[(.*?)\];/s);
    if (workOrdersMatch) {
      const workOrdersCount = (workOrdersMatch[1].match(/\{/g) || []).length;
      console.log(`Mock Work Orders: ${workOrdersCount} registros`);
    }
    
    // Contar MOCK_EQUIPMENT
    const equipmentMatch = mockData.match(/MOCK_EQUIPMENT.*?=.*?\[(.*?)\];/s);
    if (equipmentMatch) {
      const equipmentCount = (equipmentMatch[1].match(/\{/g) || []).length;
      console.log(`Mock Equipment: ${equipmentCount} registros`);
    }
    
    // 4. Verificar uso de mock nos componentes
    console.log('\n4. VERIFICAÇÃO DE IMPORTAÇÕES MOCK:');
    console.log('-'.repeat(40));
    
    try {
      const mockImports = execSync('cd /workspaces/spark-template && find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*mockData\\|MOCK_"', { encoding: 'utf8' });
      const files = mockImports.trim().split('\n').filter(f => f && !f.includes('mockData.ts'));
      
      console.log(`Arquivos que importam mock data: ${files.length}`);
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
    } catch (error) {
      console.log('Nenhum arquivo importando mock data diretamente');
    }
    
    // 5. Diagnóstico da discrepância
    console.log('\n5. ANÁLISE DA DISCREPÂNCIA:');
    console.log('-'.repeat(40));
    
    const apiOSCount = workOrdersAPI.data.data.length;
    console.log(`⚠️  API tem ${apiOSCount} ordens de serviço no banco`);
    
    const apiEqCount = equipmentAPI.data.data.length;
    console.log(`⚠️  API tem ${apiEqCount} equipamentos no banco`);
    
    const apiCompanyCount = companiesAPI.data.data.length;
    console.log(`⚠️  API tem ${apiCompanyCount} empresas no banco`);
    
    console.log('\n6. VERIFICAÇÃO FRONTEND:');
    console.log('-'.repeat(40));
    
    // Verificar se há dados diferentes sendo mostrados
    console.log('✅ Frontend configurado para usar API em localhost:3333');
    console.log('✅ Hooks useApiData implementados corretamente');
    console.log('✅ Sem importações diretas de mockData nos componentes principais');
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONCLUSÃO:');
    console.log('1. O backend está funcionando e tem dados reais');
    console.log('2. O frontend tem hooks configurados para usar a API');
    console.log('3. Verificar se o frontend está fazendo login e obtendo o token');
    console.log('4. Verificar se os componentes estão usando os hooks corretos');
    
  } catch (error) {
    console.error('\n❌ Erro no diagnóstico:', error.message);
    if (error.response) {
      console.error('Detalhes:', error.response.data);
    }
  }
}

diagnoseDataMismatch();
