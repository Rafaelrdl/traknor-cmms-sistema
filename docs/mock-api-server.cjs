#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3333;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mock data
const mockUsers = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@traknor.com', 
    role: 'ADMIN',
    department: 'TI',
    created_at: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'João Silva', 
    email: 'joao@traknor.com', 
    role: 'TECHNICIAN',
    department: 'Manutenção',
    created_at: new Date().toISOString()
  }
];

const mockCompanies = [
  {
    id: '1',
    name: 'TrakNor Industrial',
    segment: 'Industrial',
    cnpj: '12.345.678/0001-90',
    address: {
      zip: '01310-100',
      city: 'São Paulo',
      state: 'SP',
      fullAddress: 'Av. Paulista, 1000'
    }
  }
];

const mockEquipment = [
  {
    id: '1',
    code: 'EQ001',
    name: 'Compressor Central',
    type: 'HVAC',
    manufacturer: 'Carrier',
    model: 'AQV12',
    company_id: '1',
    sector_id: '1',
    status: 'OPERATIONAL',
    criticality: 'HIGH'
  }
];

const mockWorkOrders = [
  {
    id: '1',
    code: 'OS001',
    title: 'Manutenção Preventiva Compressor',
    description: 'Revisão mensal do compressor central',
    type: 'PREVENTIVE',
    status: 'PENDING',
    priority: 'MEDIUM',
    company_id: '1',
    scheduled_date: new Date(Date.now() + 86400000).toISOString(),
    created_at: new Date().toISOString()
  }
];

const mockPlans = [
  {
    id: '1',
    name: 'Plano Preventivo HVAC',
    description: 'Manutenção preventiva mensal de equipamentos HVAC',
    frequency: 'MONTHLY',
    company_id: '1',
    status: 'ACTIVE',
    tasks: [
      {
        name: 'Verificar compressor',
        checklist: ['Inspecionar componentes', 'Verificar pressão']
      }
    ]
  }
];

// Helper function to create API response
const createResponse = (data, pagination = null) => ({
  success: true,
  data,
  ...(pagination && { pagination })
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json(createResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }));
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  const user = mockUsers.find(u => u.email === email);
  if (user && password === 'admin123') {
    res.json(createResponse({
      user,
      tokens: {
        access_token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now()
      }
    }));
  } else {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou senha inválidos'
      }
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json(createResponse(mockUsers[0]));
  } else {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de autorização necessário'
      }
    });
  }
});

// Users endpoints
app.get('/api/users', (req, res) => {
  res.json(createResponse(mockUsers));
});

// Companies endpoints
app.get('/api/companies', (req, res) => {
  res.json(createResponse(mockCompanies));
});

app.get('/api/companies/:id', (req, res) => {
  const company = mockCompanies.find(c => c.id === req.params.id);
  if (company) {
    res.json(createResponse(company));
  } else {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Empresa não encontrada'
      }
    });
  }
});

// Equipment endpoints
app.get('/api/equipment', (req, res) => {
  res.json(createResponse(mockEquipment));
});

// Work Orders endpoints
app.get('/api/work-orders', (req, res) => {
  res.json(createResponse(mockWorkOrders));
});

app.post('/api/work-orders', (req, res) => {
  const newWorkOrder = {
    id: (mockWorkOrders.length + 1).toString(),
    code: `OS${(mockWorkOrders.length + 1).toString().padStart(3, '0')}`,
    ...req.body,
    created_at: new Date().toISOString()
  };
  mockWorkOrders.push(newWorkOrder);
  res.status(201).json(createResponse(newWorkOrder));
});

// Maintenance Plans endpoints
app.get('/api/plans', (req, res) => {
  res.json(createResponse(mockPlans));
});

// Dashboard/Metrics endpoints
app.get('/api/metrics/summary', (req, res) => {
  res.json(createResponse({
    total_equipment: mockEquipment.length,
    total_work_orders: mockWorkOrders.length,
    pending_work_orders: mockWorkOrders.filter(wo => wo.status === 'PENDING').length,
    total_companies: mockCompanies.length
  }));
});

app.get('/api/metrics/kpis', (req, res) => {
  res.json(createResponse({
    totalWorkOrders: mockWorkOrders.length,
    completedWorkOrders: mockWorkOrders.filter(wo => wo.status === 'COMPLETED').length,
    pendingWorkOrders: mockWorkOrders.filter(wo => wo.status === 'PENDING').length,
    totalEquipment: mockEquipment.length,
    operationalEquipment: mockEquipment.filter(eq => eq.status === 'OPERATIONAL').length,
    maintenanceEquipment: mockEquipment.filter(eq => eq.status === 'MAINTENANCE').length,
    totalCompanies: mockCompanies.length,
    activePlans: mockPlans.filter(p => p.status === 'ACTIVE').length
  }));
});

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.baseUrl} não encontrado`
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 TrakNor CMMS Mock API Server running on port ${port}`);
  console.log(`📍 API Base URL: http://localhost:${port}/api`);
  console.log(`🔍 Health check: http://localhost:${port}/api/health`);
  console.log(`\n📧 Test credentials:`);
  console.log(`   Email: admin@traknor.com`);
  console.log(`   Password: admin123`);
  console.log(`\n🛠️  Available endpoints:`);
  console.log(`   POST /api/auth/login - Authentication`);
  console.log(`   GET  /api/auth/me - Current user`);
  console.log(`   GET  /api/users - List users`);
  console.log(`   GET  /api/companies - List companies`);
  console.log(`   GET  /api/equipment - List equipment`);
  console.log(`   GET  /api/work-orders - List work orders`);
  console.log(`   GET  /api/plans - List maintenance plans`);
  console.log(`   GET  /api/metrics/kpis - Dashboard KPIs`);
});