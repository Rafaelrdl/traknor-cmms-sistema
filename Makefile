# TrakNor CMMS - Makefile para Service Containers APENAS
# NUNCA usar localhost/127.0.0.1 - SEMPRE db:5432

DB_HOST ?= db
DB_USER ?= $(POSTGRES_USER)
DB_NAME ?= $(POSTGRES_DB)
DB_PASSWORD ?= $(POSTGRES_PASSWORD)

.PHONY: help dev db-check db-shell run-backend run-frontend migrate seed test-db validate-env

help:
	@echo "🎯 TrakNor CMMS - Service Container Commands"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev         - Show development workflow"
	@echo "  make run-backend - Run Django backend (port 3333)"
	@echo "  make run-frontend- Run React frontend (port 5173)"
	@echo ""
	@echo "🗄️  Database (PostgreSQL Service Container):"
	@echo "  make db-check    - Check PostgreSQL service container"
	@echo "  make db-shell    - Connect to PostgreSQL"
	@echo "  make test-db     - Test database operations"
	@echo "  make migrate     - Run Django migrations"
	@echo ""
	@echo "🔍 Validation:"
	@echo "  make validate-env- Check service container configuration"
	@echo "  make validate-all- Run all validations"

dev:
	@echo "🔄 Development Workflow:"
	@echo "1. Rebuild Codespace: Ctrl+Shift+P → 'Codespaces: Rebuild Container'"
	@echo "2. Check database: make db-check"
	@echo "3. Run migrations: make migrate" 
	@echo "4. Start backend: make run-backend (Terminal 1)"
	@echo "5. Start frontend: make run-frontend (Terminal 2)"

validate-env:
	@echo "🔍 Validating service container configuration..."
	@./scripts/assert_no_native_pg.sh
	@./scripts/check_db_service.sh

validate-all: validate-env
	@echo "🧪 Running complete validation..."
	@make db-check
	@echo "✅ All validations passed!"
	@echo "  make test-db     - Test database operations"
	@echo ""
	@echo "Django:"
	@echo "  make migrate     - Run Django migrations"
	@echo "  make seed        - Create initial data"

dev:
	@echo "🚀 TrakNor CMMS - Service Containers Mode"
	@echo ""
	@echo "Execute in separate terminals:"
	@echo "  Terminal 1: make run-backend"
	@echo "  Terminal 2: make run-frontend"
	@echo ""
	@echo "URLs:"
	@echo "  Backend API: http://localhost:3333"
	@echo "  Frontend: http://localhost:5173"
	@echo "  API Docs: http://localhost:3333/api/docs"

db-check:
	@echo "🔍 Checking PostgreSQL connection..."
	@pg_isready -h $(DB_HOST) -p 5432 -U $(DB_USER) && echo "✅ PostgreSQL is ready!"

db-shell:
	@echo "🐘 Connecting to PostgreSQL..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME)

test-db:
	@echo "🧪 Testing database operations..."
	@echo "Testing connection..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME) -c "SELECT 'Connection OK' as status;"
	@echo ""
	@echo "Testing healthcheck table..."
	@psql -h $(DB_HOST) -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM healthcheck ORDER BY created_at DESC LIMIT 1;" || echo "⚠️ Healthcheck table not found"

run-backend:
	@echo "🐍 Starting Django backend..."
	@cd backend_django && python manage.py runserver 0.0.0.0:3333

run-frontend:
	@echo "⚛️ Starting React frontend..."
	@npm run dev

migrate:
	@echo "🗄️ Running Django migrations..."
	@cd backend_django && python manage.py migrate

seed:
	@echo "📊 Creating initial data..."
	@cd backend_django && python manage.py create_initial_data
