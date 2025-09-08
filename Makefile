.PHONY: help dev stop test migrate seed clean logs shell check db-check db-setup db-reset db-reset-logical db-status

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
	@echo "Database commands (PostgreSQL Native):"
	@echo "  make db-check       - Check PostgreSQL prerequisites"
	@echo "  make db-setup       - Setup PostgreSQL for first time"
	@echo "  make db-status      - Show PostgreSQL status"
	@echo "  make db-reset       - 🔴 DESTRUCTIVE: Complete database reset"
	@echo "  make db-reset-logical - ⚠️  Reset only database content"

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
	@curl -s http://localhost:3333/api/health | python3 -m json.tool || echo "Backend not responding"
	@echo "✅ Health check completed"

db-check:
	@echo "🔍 CHECKING DATABASE PREREQUISITES"
	@./scripts/check_db_prerequisites_native.sh

db-setup:
	@echo "🐘 SETTING UP POSTGRESQL"
	@./scripts/setup_postgres_codespaces.sh

db-status:
	@echo "📊 PostgreSQL Status:"
	@echo "────────────────────"
	@sudo service postgresql status || echo "PostgreSQL not running"
	@echo ""
	@echo "Databases:"
	@sudo -u postgres psql -l 2>/dev/null || echo "Cannot list databases"

db-reset:
	@echo "🔴 DESTRUCTIVE DATABASE RESET"
	@./scripts/reset_db_native.sh

db-reset-logical:
	@echo "⚠️  LOGICAL DATABASE RESET"
	@echo "This will reset database content but keep PostgreSQL cluster"
	@./scripts/reset_db_logical.sh
