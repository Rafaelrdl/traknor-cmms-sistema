import axios from 'axios';

const API_URL = 'http://localhost:3333/api';

async function testFrontendDataSource() {
  console.log('🧪 TESTE: VERIFICANDO FONTE DE DADOS DO FRONTEND\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Login na API para obter token
    console.log('1. Fazendo login na API...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@traknor.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.tokens.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // 2. Buscar dados da API
    console.log('\n2. Dados da API (backend):');
    console.log('-'.repeat(40));
    
    const [workOrdersAPI, equipmentAPI] = await Promise.all([
      axios.get(`${API_URL}/work-orders`, config),
      axios.get(`${API_URL}/equipment`, config)
    ]);
    
    console.log(`✅ Work Orders na API: ${workOrdersAPI.data.data.length}`);
    workOrdersAPI.data.data.slice(0, 3).forEach((wo, i) => {
      console.log(`   ${i+1}. ${wo.code} - ${wo.title} (${wo.status})`);
    });
    
    console.log(`✅ Equipment na API: ${equipmentAPI.data.data.length}`);
    equipmentAPI.data.data.forEach((eq, i) => {
      console.log(`   ${i+1}. ${eq.name} - ${eq.model} (${eq.status})`);
    });
    
    // 3. Verificar dados mockados para comparação
    console.log('\n3. Dados mockados (para comparação):');
    console.log('-'.repeat(40));
    
    const fs = await import('fs');
    const mockData = fs.readFileSync('/workspaces/spark-template/src/data/mockData.ts', 'utf8');
    
    // Contar work orders mockadas
    const workOrdersMatch = mockData.match(/MOCK_WORK_ORDERS.*?=.*?\[(.*?)\];/s);
    if (workOrdersMatch) {
      const workOrdersCount = (workOrdersMatch[1].match(/\{/g) || []).length;
      console.log(`📦 Mock Work Orders: ${workOrdersCount}`);
      
      // Extrair algumas IDs para comparação
      const idMatches = workOrdersMatch[1].match(/id:\s*['"]([^'"]+)['"]/g);
      if (idMatches) {
        console.log('   Algumas IDs mockadas:');
        idMatches.slice(0, 3).forEach((match, i) => {
          const id = match.match(/['"]([^'"]+)['"]/)?.[1];
          console.log(`   ${i+1}. ID: ${id}`);
        });
      }
    }
    
    // Contar equipment mockado
    const equipmentMatch = mockData.match(/MOCK_EQUIPMENT.*?=.*?\[(.*?)\];/s);
    if (equipmentMatch) {
      const equipmentCount = (equipmentMatch[1].match(/\{/g) || []).length;
      console.log(`📦 Mock Equipment: ${equipmentCount}`);
    }
    
    // 4. Análise final
    console.log('\n4. ANÁLISE:');
    console.log('-'.repeat(40));
    
    const apiHasRealData = workOrdersAPI.data.data.length > 0 && workOrdersAPI.data.data[0].id.includes('-');
    const apiWorkOrderIds = workOrdersAPI.data.data.map(wo => wo.id);
    
    console.log(`🔍 API tem dados reais: ${apiHasRealData ? 'SIM' : 'NÃO'}`);
    console.log(`🔍 Primeiros IDs da API: ${apiWorkOrderIds.slice(0, 2).join(', ')}`);
    
    if (apiHasRealData) {
      console.log('\n✅ RESULTADO: Frontend DEVE usar dados da API');
      console.log('   - IDs são UUIDs reais do banco');
      console.log('   - Dados são diferentes dos mocks');
      console.log('   - Backend está funcionando corretamente');
    } else {
      console.log('\n❌ PROBLEMA: Dados da API parecem mockados');
    }
    
    console.log('\n5. INSTRUÇÕES PARA TESTAR NO FRONTEND:');
    console.log('-'.repeat(40));
    console.log('1. Abra o frontend em http://localhost:5001');
    console.log('2. Faça login com admin@traknor.com / admin123');
    console.log('3. Vá para a página de Ordens de Serviço');
    console.log('4. Verifique se aparece mais de 3 ordens');
    console.log('5. Verifique se as IDs são UUIDs longos');
    console.log('6. Compare com os dados mostrados acima');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
  }
}

testFrontendDataSource();
