# TrakNor CMMS API Documentation

## Base URL
```
http://localhost:3333/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": <response_data>,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": <optional_error_details>
  }
}
```

## Endpoints

### Authentication & Users

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@traknor.com",
  "password": "admin123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### List Users (Admin/Manager only)
```http
GET /api/users?page=1&limit=20
Authorization: Bearer <token>
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@traknor.com",
  "role": "TECHNICIAN",
  "phone": "(11) 99999-9999",
  "department": "Manutenção"
}
```

### Companies & Sectors

#### List Companies
```http
GET /api/companies?page=1&limit=20
Authorization: Bearer <token>
```

#### Create Company (Admin only)
```http
POST /api/companies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Empresa Exemplo",
  "segment": "Industrial",
  "cnpj": "12.345.678/0001-90",
  "address": {
    "zip": "01310-100",
    "city": "São Paulo",
    "state": "SP",
    "fullAddress": "Av. Paulista, 1000"
  }
}
```

#### Get Company Sectors
```http
GET /api/companies/:id/sectors
Authorization: Bearer <token>
```

#### Create Sector (Admin/Manager only)
```http
POST /api/companies/:id/sectors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Setor Produção",
  "description": "Área de produção industrial"
}
```

### Equipment Management

#### List Equipment
```http
GET /api/equipment?company_id=<uuid>&status=OPERATIONAL&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Equipment (Admin/Manager only)
```http
POST /api/equipment
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chiller Central 001",
  "code": "EQ-001",
  "type": "Chiller",
  "manufacturer": "Carrier",
  "model": "AquaForce 30XA",
  "serial_number": "CF2023001",
  "company_id": "<uuid>",
  "sector_id": "<uuid>",
  "status": "OPERATIONAL",
  "criticality": "HIGH"
}
```

#### Get Equipment History
```http
GET /api/equipment/:id/history?page=1&limit=20
Authorization: Bearer <token>
```

### Maintenance Plans

#### List Plans
```http
GET /api/plans?company_id=<uuid>&status=ACTIVE&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Plan (Admin/Manager only)
```http
POST /api/plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Manutenção Preventiva Mensal",
  "description": "Manutenção preventiva dos chillers",
  "frequency": "MONTHLY",
  "company_id": "<uuid>",
  "sector_id": "<uuid>",
  "equipment_ids": ["<uuid1>", "<uuid2>"],
  "tasks": [
    {
      "name": "Verificar níveis de óleo",
      "checklist": [
        "Verificar nível do óleo",
        "Verificar qualidade do óleo"
      ]
    }
  ],
  "auto_generate": true
}
```

#### Generate Work Orders from Plan
```http
POST /api/plans/:id/generate-work-orders
Authorization: Bearer <token>
```

### Work Orders

#### List Work Orders
```http
GET /api/work-orders?status=PENDING&assigned_to=<uuid>&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Work Order
```http
POST /api/work-orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Manutenção Corretiva Urgente",
  "description": "Problema no compressor",
  "type": "CORRECTIVE",
  "priority": "HIGH",
  "company_id": "<uuid>",
  "equipment_ids": ["<uuid>"],
  "assigned_to": "<uuid>",
  "scheduled_date": "2024-02-01T09:00:00Z",
  "tasks": [
    {
      "name": "Verificar compressor",
      "checklist": ["Inspecionar componentes"]
    }
  ]
}
```

#### Update Work Order Status
```http
PUT /api/work-orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

#### Assign Work Order (Admin/Manager only)
```http
PUT /api/work-orders/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "assignee_id": "<uuid>"
}
```

### Dashboard & Metrics

#### Get Dashboard Summary
```http
GET /api/metrics/summary
Authorization: Bearer <token>
```

#### Get KPIs
```http
GET /api/metrics/kpis?company_id=<uuid>
Authorization: Bearer <token>
```

#### Get Technician Performance
```http
GET /api/metrics/technician-performance?company_id=<uuid>
Authorization: Bearer <token>
```

#### Get Equipment Availability
```http
GET /api/metrics/equipment-availability?company_id=<uuid>
Authorization: Bearer <token>
```

#### Get Work Order Trends
```http
GET /api/metrics/work-order-trends?company_id=<uuid>&days=30
Authorization: Bearer <token>
```

#### Get Work Order Statistics
```http
GET /api/work-orders/stats
Authorization: Bearer <token>
```

## User Roles & Permissions

### ADMIN
- Full access to all endpoints
- Can manage users, companies, sectors, equipment
- Can create, edit, and delete all resources

### MANAGER
- Can manage maintenance plans and work orders
- Can create/edit equipment and sectors
- Cannot manage users or delete companies

### TECHNICIAN
- Can view and update assigned work orders
- Can create work orders and solicitations
- Read-only access to equipment and plans

### OPERATOR
- Can view work orders and equipment
- Can create solicitations
- Read-only access to most resources

## Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_ERROR` - Invalid or missing token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND_ERROR` - Resource not found
- `CONFLICT_ERROR` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Pagination

Use `page` and `limit` query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

## Filtering

Most list endpoints support filtering:
- `company_id`: Filter by company
- `sector_id`: Filter by sector
- `status`: Filter by status
- `type`: Filter by type
- `priority`: Filter by priority
- `assigned_to`: Filter by assignee

## Date Formats

All dates use ISO 8601 format:
```
2024-02-01T09:00:00Z
```