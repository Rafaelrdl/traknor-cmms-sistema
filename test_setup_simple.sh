#!/bin/bash

# TrakNor CMMS - Simple Integration Test

echo "🧪 Testing TrakNor CMMS PostgreSQL Setup"
echo "========================================"
echo ""

failed_tests=0

test_postgresql() {
    echo -n "PostgreSQL connection: "
    if PGPASSWORD=postgres psql -h localhost -U postgres -c "SELECT 1;" &>/dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
        ((failed_tests++))
    fi
}

test_django() {
    echo -n "Django database: "
    cd backend_django
    if source venv/bin/activate && python manage.py check --database default &>/dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED" 
        ((failed_tests++))
    fi
    cd ..
}

test_migrations() {
    echo -n "Django migrations: "
    cd backend_django
    if source venv/bin/activate && python manage.py showmigrations | grep -q "accounts" &>/dev/null; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
        ((failed_tests++))
    fi
    cd ..
}

test_scripts() {
    echo -n "Setup scripts: "
    if [[ -x "scripts/setup_postgres_codespaces.sh" && -x ".devcontainer/post-start.sh" ]]; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
        ((failed_tests++))
    fi
}

# Run tests
test_postgresql
test_django  
test_migrations
test_scripts

echo ""
if [ $failed_tests -eq 0 ]; then
    echo "🎉 All tests passed! Setup is working correctly."
    echo ""
    echo "Next steps:"
    echo "  • make dev           - Start all services"
    echo "  • make db-status     - Check database status"
    exit 0
else
    echo "❌ $failed_tests test(s) failed."
    exit 1
fi