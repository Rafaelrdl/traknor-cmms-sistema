#!/bin/bash

# TrakNor CMMS - Test Complete Codespaces Setup
# This script tests that all components of the native PostgreSQL setup work correctly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 TrakNor CMMS - Test Setup Completo${NC}"
echo "==========================================="
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" &> /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: PostgreSQL is installed
run_test "PostgreSQL Installation" "command -v psql"

# Test 2: PostgreSQL service can start
run_test "PostgreSQL Service" "sudo service postgresql start"

# Test 3: PostgreSQL connection
run_test "PostgreSQL Connection" "PGPASSWORD=postgres psql -h localhost -U postgres -c 'SELECT 1;'"

# Test 4: traknor database exists
run_test "TrakNor Database" "PGPASSWORD=postgres psql -h localhost -U postgres -lqt | cut -d '|' -f 1 | grep -qw traknor"

# Test 5: Python virtual environment
run_test "Python Virtual Environment" "[ -d 'backend_django/venv' ]"

# Test 6: Django dependencies
run_test "Django Dependencies" "cd backend_django && source venv/bin/activate && python -c 'import django'"

# Test 7: Django database connection
run_test "Django DB Connection" "cd backend_django && source venv/bin/activate && python manage.py check --database default"

# Test 8: Django migrations  
run_test "Django Migrations" "cd backend_django && source venv/bin/activate && python manage.py showmigrations --plan | grep -q 'accounts.0001_initial'"

# Test 9: Scripts exist and are executable
run_test "Setup Scripts" "test -x 'scripts/setup_postgres_codespaces.sh' && test -x '.devcontainer/post-start.sh'"

# Test 10: Makefile commands
run_test "Makefile Commands" "make db-status >/dev/null 2>&1"

# Summary
echo ""
echo "==========================================="
echo -e "${BLUE}Test Summary:${NC}"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Setup is working correctly.${NC}"
    echo ""
    echo "Ready to use:"
    echo "  • make dev           - Start all services"
    echo "  • make db-status     - Check database status"  
    echo "  • make db-setup      - Setup PostgreSQL"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the setup.${NC}"
    exit 1
fi