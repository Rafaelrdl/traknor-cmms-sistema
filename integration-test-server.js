#!/usr/bin/env node

/**
 * TrakNor CMMS - Backend Integration Test
 * Tests API endpoints and permission system validation
 */

import express from 'express';
import cors from 'cors';

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
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'João Silva', 
    email: 'joao@traknor.com', 
    role: 'TECHNICIAN',
    department: 'Manutenção',
    status: 'ACTIVE',
    created_at: new Date().toISOString()
  },
  { 
    id: '3', 
    name: 'Maria Santos', 
    email: 'maria@traknor.com', 
    role: 'REQUESTER',
    department: 'Produção',
    status: 'ACTIVE',
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
    code: 'EQ-001',
    name: 'Bomba Centrífuga #1',
    type: 'Bomba',
    manufacturer: 'KSB',
    model: 'ETANORM',
    company_id: '1',
    sector_id: '1',
    status: 'operational'
  },
  {
    id: '2',
    code: 'EQ-002',
    name: 'Motor Elétrico #2',
    type: 'Motor',
    manufacturer: 'WEG',
    model: 'W22',
    company_id: '1',
    sector_id: '1',
    status: 'operational'
  }
];

const mockWorkOrders = [
  {
    id: '1',
    code: 'OS-2024-001',
    title: 'Manutenção preventiva - Bomba #1',
    description: 'Verificar lubrificação e pressão',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    status: 'PENDING',
    company_id: '1',
    sector_id: '1',
    created_by: '2',
    scheduled_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    created_at: new Date().toISOString()
  }
];

const mockPlans = [
  {
    id: '1',
    name: 'Manutenção Mensal - Bombas',
    description: 'Plano de manutenção preventiva para bombas',
    frequency: 'MONTHLY',
    company_id: '1',
    status: 'ACTIVE',
    auto_generate: true,
    next_execution_date: new Date(Date.now() + 86400000).toISOString(),
    created_by: '1',
    created_at: new Date().toISOString()
  }
];

// Authentication token storage
let currentToken = null;
let currentUser = null;

// Helper function to verify authorization
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Access token required'
      }
    });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== currentToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid or expired token'
      }
    });
  }
  
  req.user = currentUser;
  next();
}

// Routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'TrakNor CMMS API Mock Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'User not found'
      }
    });
  }
  
  // Simple mock password check (in real app, use bcrypt)
  if (password !== 'admin123') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid password'
      }
    });
  }
  
  // Generate mock token
  const token = `mock-token-${user.id}-${Date.now()}`;
  currentToken = token;
  currentUser = user;
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        department: user.department,
        status: user.status
      },
      tokens: {
        access_token: token,
        refresh_token: `refresh-${token}`
      }
    }
  });
});

app.get('/api/auth/me', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role.toLowerCase(),
      department: req.user.department,
      status: req.user.status
    }
  });
});

// Protected routes
app.get('/api/companies', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: mockCompanies
  });
});

app.get('/api/users', verifyAuth, (req, res) => {
  // Check permissions - only admins and managers can see all users
  if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: 'Insufficient permissions to view users'
      }
    });
  }
  
  res.json({
    success: true,
    data: mockUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.toLowerCase(),
      department: u.department,
      status: u.status
    }))
  });
});

app.get('/api/equipment', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: mockEquipment
  });
});

app.get('/api/work-orders', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: mockWorkOrders
  });
});

app.get('/api/plans', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: mockPlans
  });
});

app.get('/api/metrics/kpis', verifyAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      totalWorkOrders: mockWorkOrders.length,
      pendingWorkOrders: mockWorkOrders.filter(wo => wo.status === 'PENDING').length,
      completedWorkOrders: mockWorkOrders.filter(wo => wo.status === 'COMPLETED').length,
      totalEquipment: mockEquipment.length,
      operationalEquipment: mockEquipment.filter(eq => eq.status === 'operational').length,
      maintenanceEquipment: mockEquipment.filter(eq => eq.status === 'maintenance').length,
      activePlans: mockPlans.filter(p => p.status === 'ACTIVE').length,
      // Performance metrics
      mttr: 2.5, // Mean Time To Repair (hours)
      mtbf: 720, // Mean Time Between Failures (hours)
      availability: 95.8, // Equipment availability percentage
      overallEfficiency: 89.2
    }
  });
});

// Permission test endpoints
app.get('/api/test/permissions/:role', verifyAuth, (req, res) => {
  const { role } = req.params;
  
  // Simulate role-based access
  const permissions = {
    admin: {
      can: {
        view: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        create: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        edit: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        delete: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        manage: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user']
      }
    },
    technician: {
      can: {
        view: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        create: ['workorder', 'solicitation'],
        edit: ['workorder', 'inventory', 'procedure'],
        move: ['workorder', 'inventory', 'procedure'],
        convert: ['solicitation']
      },
      cannot: {
        delete: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        manage: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user']
      }
    },
    requester: {
      can: {
        view: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        create: ['solicitation'],
        edit: ['solicitation']
      },
      cannot: {
        delete: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        manage: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user'],
        convert: ['workorder', 'asset', 'plan', 'inventory', 'procedure', 'solicitation', 'report', 'user']
      }
    }
  };
  
  const rolePermissions = permissions[role.toLowerCase()];
  
  if (!rolePermissions) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'Invalid role specified'
      }
    });
  }
  
  res.json({
    success: true,
    data: {
      role: role.toLowerCase(),
      permissions: rolePermissions,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Start server
app.listen(port, () => {
  console.log('🚀 TrakNor CMMS Mock API Server');
  console.log('='.repeat(40));
  console.log(`🌐 Server running on http://localhost:${port}`);
  console.log(`📋 API Base URL: http://localhost:${port}/api`);
  console.log('');
  console.log('🔑 Test Users:');
  console.log('   Admin:      admin@traknor.com / admin123');
  console.log('   Technician: joao@traknor.com / admin123');
  console.log('   Requester:  maria@traknor.com / admin123');
  console.log('');
  console.log('🧪 Test Endpoints:');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET  /api/auth/me - Current user');
  console.log('   GET  /api/companies - Companies');
  console.log('   GET  /api/users - Users (admin only)');
  console.log('   GET  /api/equipment - Equipment');
  console.log('   GET  /api/work-orders - Work orders');
  console.log('   GET  /api/plans - Maintenance plans');
  console.log('   GET  /api/metrics/kpis - Dashboard KPIs');
  console.log('   GET  /api/test/permissions/:role - Permission test');
  console.log('='.repeat(40));
});

export default app;