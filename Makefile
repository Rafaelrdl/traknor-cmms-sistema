.PHONY: help dev stop tedev:
	@echo "🚀 Starting TrakNor CMMS services..."
	@echo ""
	@echo "Execute em terminais separados:"
	@echo "  Terminal 1: cd backend_django && python manage.py runserver 0.0.0.0:3333"
	@echo "  Terminal 2: npm run dev"
	@echo ""
	@echo "URLs disponíveis:"
	@echo "  Backend API: http://localhost:3333"
	@echo "  Frontend: http://localhost:5173"ean logs shell check db-check db-status test-integration

help:
	@echo "TrakNor CMMS - Django Backend Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev            - Start all services (Django + React)"
	@echo "  make stop           - Stop all services"
	@echo "  make test           - Run tests"
	@echo "  make migrate        - Run Django migrations"
	@echo "  make seed           - Populate database with initial data"
	@echo "  make clean          - Clean temporary files"
	@echo "  make logs           - Show service logs"
	@echo "  make shell          - Django shell"
	@echo "  make check          - Health check all services"
	@echo ""
	@echo "Database commands (PostgreSQL Service Container):"
	@echo "  make db-check       - Check database connection"
	@echo "  make db-status      - Show PostgreSQL status"
	@echo "  make db-shell       - Connect to database"
	@echo ""
	@echo "Testing:"
	@echo "  make test-integration - Run complete integration tests"

dev:
	@echo "🚀 Starting TrakNor CMMS services..."
	@# Garantir que PostgreSQL está rodando
	@sudo service postgresql start 2>/dev/null || true
	@# Aguardar PostgreSQL ficar disponível
	@until pg_isready -h localhost -p 5432 -U postgres &>/dev/null; do \
		echo "Aguardando PostgreSQL..." ; \
		sleep 2 ; \
	done
	@echo "✅ PostgreSQL disponível"
	@# Executar script de setup se disponível
	@if [ -f ".devcontainer/post-start.sh" ]; then \
		echo "Executando setup completo..." ; \
		./.devcontainer/post-start.sh ; \
	else \
		echo "Executando setup básico..." ; \
		./scripts/setup_postgres_codespaces.sh 2>/dev/null || true ; \
	fi

stop:
	@echo "🛑 Stopping services..."
	@pkill -f "python manage.py runserver" 2>/dev/null || true
	@pkill -f "npm run dev" 2>/dev/null || true
	@echo "✅ Services stopped"

test:
	@echo "🧪 Running tests..."
	@cd backend_django && source venv/bin/activate && python manage.py test

migrate:
	@echo "🗄️ Running migrations..."
	@cd backend_django && source venv/bin/activate && python manage.py migrate

seed:
	@echo "📊 Seeding database..."
	@cd backend_django && source venv/bin/activate && python manage.py create_initial_data

shell:
	@echo "🐍 Opening Django shell..."
	@cd backend_django && source venv/bin/activate && python manage.py shell

clean:
	@echo "🧹 Cleaning temporary files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@rm -rf backend_django/staticfiles 2>/dev/null || true
	@rm -f /tmp/django.log /tmp/frontend.log 2>/dev/null || true
	@echo "✅ Cleanup completed"

logs:
	@echo "📜 Showing service logs..."
	@tail -f /tmp/django.log /tmp/frontend.log 2>/dev/null || echo "No log files found"

check:
	@echo "🔍 Health check..."
	@./test_integration_complete.sh

db-check:
	@echo "🔍 CHECKING DATABASE CONNECTION"
	@bash .devcontainer/scripts/wait-for-db.sh

db-status:
	@echo "📊 PostgreSQL Status:"
	@echo "────────────────────"
	@pg_isready -h db -p 5432 -U postgres || echo "PostgreSQL não está acessível"
	@echo ""
	@echo "Databases:"
	@psql -h db -U postgres -l 2>/dev/null || echo "Cannot list databases"

db-shell:
	@echo "🐘 Conectando ao PostgreSQL..."
	@psql -h db -U postgres -d traknor

test-integration:
	@echo "🧪 EXECUTANDO TESTES DE INTEGRAÇÃO COMPLETA"
	@./test_integration_complete.sh

db-reset:
	@echo "🔴 DESTRUCTIVE DATABASE RESET"
	@./scripts/reset_db_native.sh

db-reset-logical:
	@echo "⚠️  LOGICAL DATABASE RESET"
	@echo "This will reset database content but keep PostgreSQL cluster"
	@./scripts/reset_db_logical.sh
