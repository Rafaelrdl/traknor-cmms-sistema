#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api';
let authToken = '';

const log = (message, color = '\x1b[0m') => {
  console.log(`${color}${message}\x1b[0m`);
};

const logSuccess = (message) => log(`✅ ${message}`, '\x1b[32m');
const logError = (message) => log(`❌ ${message}`, '\x1b[31m');
const logInfo = (message) => log(`ℹ️  ${message}`, '\x1b[34m');

// Fazer login
async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@traknor.com',
      password: 'admin123'
    });
    
    authToken = response.data.data.tokens.access_token;
    logSuccess('Login realizado com sucesso!');
    return true;
  } catch (error) {
    logError(`Erro no login: ${error.message}`);
    return false;
  }
}

// Consultar dados
async function fetchData() {
  try {
    // Buscar empresas
    const companies = await axios.get(`${BASE_URL}/companies`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('\n=== EMPRESAS ===');
    companies.data.data.forEach(company => {
      console.log(`ID: ${company.id}`);
      console.log(`Nome: ${company.name}`);
      console.log(`---`);
    });

    // Buscar setores
    if (companies.data.data.length > 0) {
      const companyId = companies.data.data[0].id;
      try {
        const sectors = await axios.get(`${BASE_URL}/companies/${companyId}/sectors`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('\n=== SETORES ===');
        sectors.data.data.forEach(sector => {
          console.log(`ID: ${sector.id}`);
          console.log(`Nome: ${sector.name}`);
          console.log(`---`);
        });
      } catch (error) {
        logInfo('Tentando buscar setores diretamente...');
        // Tentar endpoint direto de setores se existir
        try {
          const sectors = await axios.get(`${BASE_URL}/sectors`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          console.log('\n=== SETORES ===');
          sectors.data.data.forEach(sector => {
            console.log(`ID: ${sector.id}`);
            console.log(`Nome: ${sector.name}`);
            console.log(`---`);
          });
        } catch (e) {
          logError('Não conseguiu buscar setores');
        }
      }
    }

    // Buscar usuários
    const users = await axios.get(`${BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('\n=== USUÁRIOS ===');
    users.data.data.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Nome: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`---`);
    });

    // Buscar equipamentos
    const equipment = await axios.get(`${BASE_URL}/equipment`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('\n=== EQUIPAMENTOS ===');
    equipment.data.data.forEach(equip => {
      console.log(`ID: ${equip.id}`);
      console.log(`Código: ${equip.code}`);
      console.log(`Nome: ${equip.name}`);
      console.log(`---`);
    });

    return {
      companies: companies.data.data,
      users: users.data.data,
      equipment: equipment.data.data
    };

  } catch (error) {
    logError(`Erro ao buscar dados: ${error.message}`);
    return null;
  }
}

async function main() {
  log('\n=== CONSULTANDO DADOS EXISTENTES ===\n', '\x1b[36m');
  
  const loginSuccess = await authenticate();
  if (!loginSuccess) {
    process.exit(1);
  }

  await fetchData();
}

main().catch(error => {
  logError(`Erro fatal: ${error.message}`);
  process.exit(1);
});
