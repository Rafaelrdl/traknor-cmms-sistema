# 🚀 TrakNor CMMS Backend - Quick Start Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker (optional but recommended)

## 🏁 Quick Setup (5 minutes)

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start PostgreSQL with Docker
```bash
docker-compose up -d postgres
```

### 4. Setup environment
```bash
cp .env.example .env
# Edit .env if needed (default values work for development)
```

### 5. Setup database
```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

### 6. Start the server
```bash
npm run dev
```

🎉 **Backend is now running at http://localhost:3333**

## 🧪 Test the API

### Check if it's running
```bash
curl http://localhost:3333/api/health
```

### Login with demo credentials
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@traknor.com",
    "password": "admin123"
  }'
```

### Test authenticated endpoint
```bash
# Replace <TOKEN> with the access_token from login response
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3333/api/auth/me
```

## 🔑 Demo Credentials

- **Admin**: admin@traknor.com / admin123
- **Technician**: tecnico@traknor.com / tecnico123

## 📊 Available Endpoints

The backend provides **47 endpoints** across 7 main areas:

1. **Authentication & Users** (7 endpoints)
2. **Companies & Sectors** (9 endpoints)
3. **Equipment Management** (7 endpoints)
4. **Maintenance Plans** (6 endpoints)
5. **Work Orders** (8 endpoints)
6. **Dashboard & Metrics** (5 endpoints)
7. **Health Check** (1 endpoint)

See [API_DOCS.md](./API_DOCS.md) for complete documentation.

## 🐳 Docker Development

### Start all services
```bash
npm run docker:up
```

### View logs
```bash
npm run docker:logs
```

### Stop all services
```bash
npm run docker:down
```

## 🗄️ Database Management

### Reset database
```bash
# Drop all tables and recreate
npm run migrate -- --reset

# Reseed data
npm run seed
```

### View database
```bash
npm run studio
```

### Create new migration
```bash
# After modifying schema.prisma
npm run migrate -- --name add_new_feature
```

## 🔧 Development Commands

```bash
# Development server with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/          # Database, logger, environment
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── middlewares/     # Auth, validation, error handling
│   ├── validators/      # Input validation schemas
│   ├── utils/          # Helper functions
│   ├── routes/         # API route definitions
│   └── app.ts          # Express app setup
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding
└── tests/              # Unit and integration tests
```

## 🚨 Troubleshooting

### Port already in use
```bash
# Kill process using port 3333
fuser -k 3333/tcp

# Or change port in .env
PORT=3334
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Migration issues
```bash
# Reset database completely
npm run migrate -- --reset
```

### Permission denied errors
```bash
# Make sure you have write permissions
mkdir -p logs uploads
chmod 755 logs uploads
```

## 🌐 Frontend Integration

The backend is designed to work seamlessly with the existing React frontend:

1. **Same data models**: All TypeScript interfaces match the frontend
2. **Same API patterns**: Consistent with frontend expectations
3. **Role-based auth**: Supports existing ACL system
4. **Compatible responses**: Matches frontend store patterns

To integrate:

1. Update frontend API base URL to `http://localhost:3333/api`
2. Replace localStorage calls with actual API calls
3. Update authentication to use JWT tokens
4. Use the same data structures and validation

## 📈 Performance Tips

- Use pagination on all list endpoints
- Enable Redis caching for better performance
- Use database indexes for filtering
- Monitor with `npm run docker:logs`

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based authorization (Admin, Manager, Technician, Operator)
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- SQL injection prevention with Prisma
- Password hashing with bcrypt
- CORS protection
- Security headers with Helmet

## 📝 Next Steps

1. **API Documentation**: Complete OpenAPI/Swagger setup
2. **Testing**: Add comprehensive unit and integration tests
3. **Monitoring**: Add logging and monitoring tools
4. **Deployment**: Setup production deployment
5. **Caching**: Implement Redis caching
6. **File Upload**: Add file upload functionality
7. **Notifications**: Implement email/SMS notifications

---

Need help? Check the [API documentation](./API_DOCS.md) or [create an issue](https://github.com/Rafaelrdl/traknor-cmms-sistema/issues).