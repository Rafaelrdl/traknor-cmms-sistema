// Simple mock API server for testing the frontend integration
// This demonstrates that the frontend can connect to the API with the correct data

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data - 7 work orders as mentioned in the problem statement
const mockWorkOrders = [
  {
    id: 'wo-001',
    code: 'OS001',
    title: 'Manutenção Preventiva HVAC',
    description: 'Limpeza e verificação do sistema HVAC principal',
    type: 'PREVENTIVE',
    status: 'PENDING',
    priority: 'MEDIUM',
    equipment_id: 'eq-001',
    assigned_to: 'João Silva',
    scheduled_date: '2024-01-25T09:00:00Z',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'wo-002',
    code: 'OS002', 
    title: 'Reparo Compressor',
    description: 'Substituição de peças do compressor central',
    type: 'CORRECTIVE',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    equipment_id: 'eq-002',
    assigned_to: 'Maria Santos',
    scheduled_date: '2024-01-24T14:00:00Z',
    created_at: '2024-01-22T08:30:00Z'
  },
  {
    id: 'wo-003',
    code: 'OS003',
    title: 'Inspeção Elétrica',
    description: 'Verificação completa do sistema elétrico',
    type: 'INSPECTION',
    status: 'PENDING',
    priority: 'LOW',
    equipment_id: 'eq-003',
    assigned_to: 'Carlos Oliveira',
    scheduled_date: '2024-01-26T11:00:00Z',
    created_at: '2024-01-21T15:20:00Z'
  },
  {
    id: 'wo-004',
    code: 'OS004',
    title: 'Lubrificação Equipamentos',
    description: 'Lubrificação de todos os equipamentos rotativos',
    type: 'PREVENTIVE',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    equipment_id: 'eq-004',
    assigned_to: 'Ana Costa',
    scheduled_date: '2024-01-23T08:00:00Z',
    created_at: '2024-01-18T12:00:00Z'
  },
  {
    id: 'wo-005',
    code: 'OS005',
    title: 'Calibração Sensores',
    description: 'Calibração dos sensores de temperatura e pressão',
    type: 'CALIBRATION',
    status: 'PENDING',
    priority: 'HIGH',
    equipment_id: 'eq-005',
    assigned_to: 'Pedro Lima',
    scheduled_date: '2024-01-27T10:00:00Z',
    created_at: '2024-01-23T09:15:00Z'
  },
  {
    id: 'wo-006',
    code: 'OS006',
    title: 'Troca de Filtros',
    description: 'Substituição de filtros do sistema de ar condicionado',
    type: 'PREVENTIVE',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    equipment_id: 'eq-006',
    assigned_to: 'Luciana Rodrigues',
    scheduled_date: '2024-01-25T16:00:00Z',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'wo-007',
    code: 'OS007',
    title: 'Teste de Backup',
    description: 'Teste do sistema de backup de energia',
    type: 'TESTING',
    status: 'SCHEDULED',
    priority: 'LOW',
    equipment_id: 'eq-007',
    assigned_to: 'Roberto Ferreira',
    scheduled_date: '2024-01-28T13:00:00Z',
    created_at: '2024-01-24T11:45:00Z'
  }
];

const mockEquipment = [
  { id: 'eq-001', name: 'HVAC Principal', status: 'OPERATIONAL' },
  { id: 'eq-002', name: 'Compressor Central', status: 'MAINTENANCE' },
  { id: 'eq-003', name: 'Painel Elétrico', status: 'OPERATIONAL' },
];

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email, password });
  
  // Check demo credentials
  if ((email === 'admin@traknor.com' && password === 'admin123') ||
      (email === 'tecnico@traknor.com' && password === 'tecnico123')) {
    
    const user = {
      id: email === 'admin@traknor.com' ? 'user-admin' : 'user-tech',
      name: email === 'admin@traknor.com' ? 'Admin User' : 'Técnico User',
      email,
      role: email === 'admin@traknor.com' ? 'ADMIN' : 'TECHNICIAN'
    };
    
    console.log('✅ Login successful for:', email);
    
    res.json({
      success: true,
      data: {
        user,
        tokens: {
          access_token: `mock-token-${Date.now()}`,
          refresh_token: `mock-refresh-${Date.now()}`
        }
      }
    });
  } else {
    console.log('❌ Login failed for:', email);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou senha inválidos'
      }
    });
  }
});

// Work Orders endpoint
app.get('/api/work-orders', (req, res) => {
  console.log('📋 Work orders requested');
  res.json({
    success: true,
    data: mockWorkOrders
  });
});

// Equipment endpoint
app.get('/api/equipment', (req, res) => {
  console.log('⚙️  Equipment requested');
  res.json({
    success: true,
    data: mockEquipment
  });
});

// Companies endpoint
app.get('/api/companies', (req, res) => {
  console.log('🏢 Companies requested');
  res.json({
    success: true,
    data: [
      { id: 'comp-001', name: 'TrakNor CMMS Demo', cnpj: '12.345.678/0001-90' }
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Mock API Server is running'
    }
  });
});

app.listen(port, () => {
  console.log('🚀 Mock API Server running on http://localhost:' + port);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/work-orders (7 work orders available)');
  console.log('  GET  /api/equipment');
  console.log('  GET  /api/companies');
  console.log('  GET  /api/health');
  console.log('');
  console.log('🔐 Demo credentials:');
  console.log('  Admin: admin@traknor.com / admin123');
  console.log('  Tech:  tecnico@traknor.com / tecnico123');
});