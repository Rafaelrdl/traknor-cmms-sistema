.PHONY: help dev stop test migrate seed clean logs

help:
	@echo "TrakNor CMMS - Django Backend Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make dev      - Start all services (Django + React)"
	@echo "  make stop     - Stop all services"
	@echo "  make test     - Run tests"
	@echo "  make migrate  - Run Django migrations"
	@echo "  make seed     - Populate database with initial data"
	@echo "  make clean    - Clean temporary files"
	@echo "  make logs     - Show service logs"
	@echo "  make shell    - Django shell"
	@echo "  make check    - Health check all services"

dev:
	@echo "🚀 Starting TrakNor CMMS services..."
	@./.devcontainer/post-start.sh

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
	@echo "📋 Service logs:"
	@echo "━━━ Django Backend ━━━"
	@tail -20 /tmp/django.log 2>/dev/null || echo "No Django logs"
	@echo ""
	@echo "━━━ React Frontend ━━━"
	@tail -20 /tmp/frontend.log 2>/dev/null || echo "No frontend logs"

check:
	@echo "🔍 Health checking services..."
	@curl -s http://localhost:3333/api/health | python -m json.tool 2>/dev/null || echo "❌ Backend not responding"
	@curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend responding" || echo "❌ Frontend not responding"

# Database commands
reset-db:
	@echo "⚠️  Resetting database..."
	@sudo -u postgres dropdb traknor 2>/dev/null || true
	@sudo -u postgres createdb traknor
	@cd backend_django && source venv/bin/activate && python manage.py migrate
	@cd backend_django && source venv/bin/activate && python manage.py create_initial_data
	@echo "✅ Database reset completed"

# Backup/restore
backup:
	@echo "💾 Creating database backup..."
	@sudo -u postgres pg_dump traknor > backup_traknor_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created"

# API testing
test-api:
	@echo "🧪 Testing API endpoints..."
	@cd backend_django && source venv/bin/activate && python -c "
import requests
import json

base_url = 'http://localhost:3333/api'

# Test health
response = requests.get(f'{base_url}/health')
print(f'Health: {response.status_code} - {response.json()}')

# Test login  
login_data = {'email': 'admin@traknor.com', 'password': 'admin123'}
response = requests.post(f'{base_url}/auth/login', json=login_data)
if response.status_code == 200:
    token = response.json()['data']['tokens']['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test work orders
    response = requests.get(f'{base_url}/work-orders', headers=headers)
    print(f'Work Orders: {response.status_code} - {len(response.json().get(\"data\", []))} orders')
    
    # Test companies
    response = requests.get(f'{base_url}/companies', headers=headers)
    print(f'Companies: {response.status_code} - {len(response.json().get(\"data\", []))} companies')
    
    # Test equipment
    response = requests.get(f'{base_url}/equipment', headers=headers)
    print(f'Equipment: {response.status_code} - {len(response.json().get(\"data\", []))} equipment')
else:
    print(f'Login failed: {response.status_code} - {response.text}')
"