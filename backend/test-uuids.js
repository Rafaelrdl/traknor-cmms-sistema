#!/usr/bin/env node

// Vou gerar UUIDs válidos para testar a API
const { randomUUID } = require('crypto');

const fakeUUIDs = {
  company: randomUUID(),
  sector: randomUUID(), 
  user: randomUUID(),
  equipment: randomUUID()
};

console.log('UUIDs gerados para teste:');
console.log('Company ID:', fakeUUIDs.company);
console.log('Sector ID:', fakeUUIDs.sector);
console.log('User ID:', fakeUUIDs.user);  
console.log('Equipment ID:', fakeUUIDs.equipment);

// Criar dados de teste com UUIDs válidos
const testWorkOrder = {
  code: `OS-TEST-${Date.now()}`,
  title: 'Teste com UUIDs Válidos',
  description: 'Teste de criação com UUIDs formatados corretamente',
  type: 'CORRECTIVE',
  priority: 'MEDIUM',
  company_id: fakeUUIDs.company,
  sector_id: fakeUUIDs.sector,
  equipment_ids: [fakeUUIDs.equipment],
  assigned_to: fakeUUIDs.user,
  scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  estimated_hours: 2,
  tasks: [
    {
      name: 'Tarefa de teste',
      checklist: ['Item 1', 'Item 2']
    }
  ]
};

console.log('\nDados de teste:', JSON.stringify(testWorkOrder, null, 2));

const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api';

async function testWithValidUUIDs() {
  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@traknor.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.tokens.access_token;
    console.log('\n✅ Login realizado!');
    
    // Tentar criar a ordem de serviço
    try {
      const createResponse = await axios.post(`${BASE_URL}/work-orders`, testWorkOrder, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('\n✅ Ordem de serviço criada!');
      console.log('Resposta:', createResponse.data);
      
    } catch (error) {
      console.log('\n❌ Erro ao criar OS (esperado, pois IDs não existem no banco):');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data?.error?.message);
      
      if (error.response?.status === 400) {
        // Se passou na validação mas falhou na criação, é progresso!
        const validationErrors = error.response.data.error?.details;
        if (!validationErrors || validationErrors.length === 0) {
          console.log('🎉 Validação passou! O problema é que os IDs não existem no banco.');
        } else {
          console.log('Ainda há erros de validação:', validationErrors);
        }
      }
    }
    
  } catch (error) {
    console.log('\n❌ Erro no login:', error.message);
  }
}

testWithValidUUIDs();
