# TrakNor CMMS - Makefile para Service Containers
# Configuração otimizada para PostgreSQL via Codespaces

DB_HOST ?= db
DB_USER ?= $(POSTGRES_USER)
DB_NAME ?= $(POSTGRES_DB)

.PHONY: help dev db-check db-shell run-backend run-frontend migrate seed test-db

help:
	@echo "TrakNor CMMS - Service Container Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Show how to start services"
	@echo "  make run-backend - Run Django backend"
	@echo "  make run-frontend- Run React frontend"
	@echo ""
	@echo "Database:"
	@echo "  make db-check    - Check PostgreSQL connection"
	@echo "  make db-shell    - Connect to PostgreSQL"
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
