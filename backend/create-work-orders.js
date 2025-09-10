#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api';
let authToken = '';

// Helper functions
const log = (message, color = '\x1b[0m') => {
  console.log(`${color}${message}\x1b[0m`);
};

const logSuccess = (message) => log(`✅ ${message}`, '\x1b[32m');
const logError = (message) => log(`❌ ${message}`, '\x1b[31m');
const logInfo = (message) => log(`ℹ️  ${message}`, '\x1b[34m');

// Função para fazer login e obter token
async function authenticate() {
  try {
    logInfo('Fazendo login para obter token...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@traknor.com',
      password: 'admin123'
    });
    
    console.log('Response completa:', JSON.stringify(response.data, null, 2));
    authToken = response.data.data.access_token || response.data.data.tokens?.access_token;
    logSuccess('Login realizado com sucesso!');
    console.log('Token:', authToken);
    return true;
  } catch (error) {
    logError(`Erro no login: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Função para criar ordens de serviço
async function createWorkOrder(workOrderData) {
  try {
    const response = await axios.post(`${BASE_URL}/work-orders`, workOrderData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    logSuccess(`Ordem de Serviço criada: ${response.data.data.code} - ${response.data.data.title}`);
    return response.data.data;
  } catch (error) {
    logError(`Erro ao criar OS: ${error.response?.data?.error?.message || error.message}`);
    if (error.response?.data) {
      console.log('Resposta completa do erro:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('Dados enviados:', JSON.stringify(workOrderData, null, 2));
    return null;
  }
}

// Dados das ordens de serviço para criar (usando UUIDs reais do banco)
const workOrders = [
  {
    code: `OS-${Date.now()}-001`,
    title: 'Manutenção Preventiva - Ar Condicionado Central',
    description: 'Limpeza e verificação do sistema de ar condicionado central do prédio administrativo',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    company_id: '62ed183d-f7c2-479c-b385-ab8ca7c6d068',  // UUID real da empresa
    sector_id: 'b73af9b2-c27a-4d33-b36e-3c70caee9780',   // UUID real do setor
    assigned_to: '89256d78-d078-43ca-bb87-3305f77b3972', // UUID real do técnico
    equipment_ids: ['68764a5a-4e02-435f-8147-ea1a2c80029c'], // UUID real do equipamento
    scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 4,
    tasks: [
      {
        name: 'Limpeza dos filtros',
        checklist: [
          'Remover filtros antigos',
          'Limpar estrutura dos filtros', 
          'Instalar filtros novos'
        ]
      },
      {
        name: 'Verificação do sistema',
        checklist: [
          'Verificar pressão do sistema',
          'Testar funcionamento dos controles',
          'Verificar vazamentos'
        ]
      }
    ]
  },
  {
    code: `OS-${Date.now()}-002`,
    title: 'Reparo - Sistema Hidráulico',
    description: 'Correção de vazamento na tubulação principal do 2º andar',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    company_id: '62ed183d-f7c2-479c-b385-ab8ca7c6d068',
    sector_id: 'b73af9b2-c27a-4d33-b36e-3c70caee9780',
    assigned_to: '89256d78-d078-43ca-bb87-3305f77b3972',
    equipment_ids: ['68764a5a-4e02-435f-8147-ea1a2c80029c'],
    scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 6,
    tasks: [
      {
        name: 'Identificar ponto de vazamento',
        checklist: [
          'Inspeção visual da tubulação',
          'Teste de pressão',
          'Marcar pontos críticos'
        ]
      },
      {
        name: 'Execução do reparo',
        checklist: [
          'Fechar registro principal',
          'Substituir seção danificada',
          'Testar reparo'
        ]
      }
    ]
  },
  {
    code: `OS-${Date.now()}-003`,
    title: 'Manutenção Preditiva - Elevadores',
    description: 'Análise preditiva dos sistemas de elevadores para prevenir falhas',
    type: 'PREDICTIVE',
    priority: 'MEDIUM',
    company_id: '62ed183d-f7c2-479c-b385-ab8ca7c6d068',
    sector_id: 'b73af9b2-c27a-4d33-b36e-3c70caee9780',
    assigned_to: '89256d78-d078-43ca-bb87-3305f77b3972',
    equipment_ids: ['68764a5a-4e02-435f-8147-ea1a2c80029c'],
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    tasks: [
      {
        name: 'Análise de vibrações',
        checklist: [
          'Instalar sensores de vibração',
          'Coletar dados por 24h',
          'Analisar padrões anormais'
        ]
      },
      {
        name: 'Inspeção dos cabos',
        checklist: [
          'Verificar desgaste dos cabos',
          'Medir tensão dos cabos',
          'Documentar estado atual'
        ]
      }
    ]
  },
  {
    code: `OS-${Date.now()}-004`,
    title: 'Manutenção Preventiva - Iluminação LED',
    description: 'Substituição programada de luminárias LED no estacionamento',
    type: 'PREVENTIVE',
    priority: 'LOW',
    company_id: '62ed183d-f7c2-479c-b385-ab8ca7c6d068',
    sector_id: 'b73af9b2-c27a-4d33-b36e-3c70caee9780',
    assigned_to: '89256d78-d078-43ca-bb87-3305f77b3972',
    equipment_ids: ['68764a5a-4e02-435f-8147-ea1a2c80029c'],
    scheduled_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 3,
    tasks: [
      {
        name: 'Inventário das luminárias',
        checklist: [
          'Contar luminárias funcionais',
          'Identificar luminárias queimadas',
          'Listar peças necessárias'
        ]
      },
      {
        name: 'Substituição das luminárias',
        checklist: [
          'Desligar disjuntor principal',
          'Substituir luminárias queimadas',
          'Testar funcionamento'
        ]
      }
    ]
  },
  {
    code: `OS-${Date.now()}-005`,
    title: 'Reparo Urgente - Sistema de Segurança',
    description: 'Correção do sistema de câmeras de segurança do portão principal',
    type: 'CORRECTIVE',
    priority: 'CRITICAL',
    company_id: '62ed183d-f7c2-479c-b385-ab8ca7c6d068',
    sector_id: 'b73af9b2-c27a-4d33-b36e-3c70caee9780',
    assigned_to: '89256d78-d078-43ca-bb87-3305f77b3972',
    equipment_ids: ['68764a5a-4e02-435f-8147-ea1a2c80029c'],
    scheduled_date: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 2,
    tasks: [
      {
        name: 'Diagnóstico do problema',
        checklist: [
          'Verificar alimentação elétrica',
          'Testar conexões de rede',
          'Verificar configurações do sistema'
        ]
      },
      {
        name: 'Reparo do sistema',
        checklist: [
          'Substituir componentes defeituosos',
          'Reconfigurar sistema',
          'Testar funcionamento completo'
        ]
      }
    ]
  }
];

// Função principal
async function main() {
  log('\n=== CRIADOR DE ORDENS DE SERVIÇO ===\n', '\x1b[36m');
  
  // Fazer login
  const loginSuccess = await authenticate();
  if (!loginSuccess) {
    logError('Falha na autenticação. Encerrando...');
    process.exit(1);
  }
  
  log('\n--- Criando Ordens de Serviço ---\n', '\x1b[33m');
  
  let created = 0;
  let failed = 0;
  
  // Criar cada ordem de serviço
  for (const workOrder of workOrders) {
    const result = await createWorkOrder(workOrder);
    if (result) {
      created++;
      console.log(`   ID: ${result.id}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Data agendada: ${new Date(result.scheduled_date).toLocaleDateString('pt-BR')}\n`);
    } else {
      failed++;
    }
    
    // Pequena pausa entre as criações
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumo
  log('\n=== RESUMO ===', '\x1b[36m');
  logSuccess(`Ordens criadas com sucesso: ${created}`);
  if (failed > 0) {
    logError(`Falhas na criação: ${failed}`);
  }
  log(`Total processado: ${created + failed}`, '\x1b[34m');
  
  // Verificar se as ordens foram criadas consultando a API
  log('\n--- Verificando ordens criadas ---\n', '\x1b[33m');
  try {
    const response = await axios.get(`${BASE_URL}/work-orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const allOrders = response.data.data;
    logInfo(`Total de ordens de serviço no sistema: ${allOrders.length}`);
    
    // Mostrar as últimas 5 ordens criadas
    const recentOrders = allOrders.slice(-5);
    log('\nÚltimas 5 ordens de serviço:', '\x1b[33m');
    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.code} - ${order.title}`);
      console.log(`   Status: ${order.status} | Prioridade: ${order.priority}`);
      console.log(`   Tipo: ${order.type} | Técnico: ${order.assignee?.name || 'Não atribuído'}\n`);
    });
    
  } catch (error) {
    logError(`Erro ao verificar ordens criadas: ${error.message}`);
  }
  
  logSuccess('\nProcesso concluído!');
}

// Verificar se axios está disponível
try {
  require.resolve('axios');
} catch (error) {
  logError('axios não está instalado. Execute: npm install axios');
  process.exit(1);
}

// Executar
main().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
