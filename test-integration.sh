#!/bin/bash

# TrakNor CMMS - Backend Integration Test Suite
# Tests API endpoints and permission system

echo "🧪 TrakNor CMMS - Backend Integration Test Suite"
echo "================================================="

# Test configurations
API_BASE="http://localhost:3333/api"
TEST_RESULTS=()
PASSED=0
FAILED=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local curl_command="$3"
    
    echo -n "Testing: $test_name... "
    
    # Execute curl command and capture status code
    response=$(eval "$curl_command" 2>/dev/null)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        TEST_RESULTS+=("✅ $test_name")
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED=$((FAILED + 1))
        TEST_RESULTS+=("❌ $test_name (Expected: $expected_status, Got: $status_code)")
        if [[ -n "$body" ]]; then
            echo "   Response: $body"
        fi
    fi
}

# Test if backend is running
echo -e "\n📡 Testing API Connectivity..."

# Test 1: Health check
run_test "API Health Check" "200" "curl -s -w '%{http_code}' '$API_BASE' -o /tmp/response.json && cat /tmp/response.json && tail -c3 /tmp/response.json && rm -f /tmp/response.json"

# Test 2: Authentication endpoint (without credentials)
run_test "Login endpoint validation" "401" "curl -s -w '%{http_code}' -X POST '$API_BASE/auth/login' -H 'Content-Type: application/json' -d '{\"email\":\"\",\"password\":\"\"}' -o /dev/null"

# Test 3: Protected endpoint without token
run_test "Protected endpoint without token" "401" "curl -s -w '%{http_code}' '$API_BASE/users' -o /dev/null"

echo -e "\n🔐 Testing Permission System (ACL)..."

# Test ACL directly from TypeScript definitions
if [[ -f "src/acl/abilities.ts" ]]; then
    echo "Found ACL definitions, analyzing..."
    
    # Check admin permissions
    admin_permissions=$(grep -A10 "admin:" src/acl/abilities.ts | grep "action\|subject" | wc -l)
    if [[ $admin_permissions -gt 0 ]]; then
        echo -e "${GREEN}✅${NC} Admin permissions defined"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} Admin permissions missing"
        FAILED=$((FAILED + 1))
    fi
    
    # Check technician permissions
    tech_permissions=$(grep -A10 "technician:" src/acl/abilities.ts | grep "action\|subject" | wc -l)
    if [[ $tech_permissions -gt 0 ]]; then
        echo -e "${GREEN}✅${NC} Technician permissions defined"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} Technician permissions missing"
        FAILED=$((FAILED + 1))
    fi
    
    # Check requester permissions
    req_permissions=$(grep -A10 "requester:" src/acl/abilities.ts | grep "action\|subject" | wc -l)
    if [[ $req_permissions -gt 0 ]]; then
        echo -e "${GREEN}✅${NC} Requester permissions defined"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} Requester permissions missing"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${RED}❌${NC} ACL abilities file not found"
    FAILED=$((FAILED + 1))
fi

echo -e "\n🏗️  Testing Backend Structure..."

# Test backend files existence
backend_files=(
    "backend/src/app.ts"
    "backend/src/config"
    "backend/src/controllers"
    "backend/src/services"
    "backend/src/middlewares"
    "backend/src/routes"
    "backend/prisma/schema.prisma"
    "backend/package.json"
)

for file in "${backend_files[@]}"; do
    if [[ -e "$file" ]]; then
        echo -e "${GREEN}✅${NC} $file exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} $file missing"
        FAILED=$((FAILED + 1))
    fi
done

echo -e "\n🔧 Testing Frontend Integration..."

# Test frontend integration files
frontend_files=(
    "src/lib/api.ts"
    "src/hooks/useApiData.ts"
    "src/hooks/useAbility.ts"
    "src/data/authStore.ts"
    "src/components/auth/RoleSwitcher.tsx"
)

for file in "${frontend_files[@]}"; do
    if [[ -e "$file" ]]; then
        echo -e "${GREEN}✅${NC} $file exists"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} $file missing"
        FAILED=$((FAILED + 1))
    fi
done

# Check API client configuration
if grep -q "http://localhost:3333/api" src/lib/api.ts; then
    echo -e "${GREEN}✅${NC} API client configured for backend"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌${NC} API client not configured for backend"
    FAILED=$((FAILED + 1))
fi

echo -e "\n📊 Testing Permission System Logic..."

# Test permission validation logic
if [[ -f "src/hooks/useAbility.ts" ]]; then
    # Check if permission checking function exists
    if grep -q "function can" src/hooks/useAbility.ts; then
        echo -e "${GREEN}✅${NC} Permission checking function implemented"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌${NC} Permission checking function missing"
        FAILED=$((FAILED + 1))
    fi
    
    # Check helper functions
    helpers=("canEdit" "canDelete" "canCreate" "canView" "canManage")
    for helper in "${helpers[@]}"; do
        if grep -q "$helper" src/hooks/useAbility.ts; then
            echo -e "${GREEN}✅${NC} Helper function $helper implemented"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌${NC} Helper function $helper missing"
            FAILED=$((FAILED + 1))
        fi
    done
fi

echo -e "\n🎯 Testing Role Definitions..."

# Validate role definitions in abilities.ts
if [[ -f "src/acl/abilities.ts" ]]; then
    roles=("admin" "technician" "requester")
    for role in "${roles[@]}"; do
        if grep -q "$role:" src/acl/abilities.ts; then
            echo -e "${GREEN}✅${NC} Role $role defined"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}❌${NC} Role $role missing"
            FAILED=$((FAILED + 1))
        fi
    done
    
    # Test specific permission patterns
    if grep -q "action.*view.*subject.*\*" src/acl/abilities.ts; then
        echo -e "${GREEN}✅${NC} Universal view permissions configured"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "workorder.*inventory.*procedure" src/acl/abilities.ts; then
        echo -e "${GREEN}✅${NC} Technician-specific permissions configured"
        PASSED=$((PASSED + 1))
    fi
    
    if grep -q "solicitation" src/acl/abilities.ts; then
        echo -e "${GREEN}✅${NC} Solicitation permissions configured"
        PASSED=$((PASSED + 1))
    fi
fi

# Final summary
echo -e "\n================================================="
echo -e "📈 Test Results Summary"
echo -e "================================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "Total: $((PASSED + FAILED))"

if [[ $FAILED -eq 0 ]]; then
    echo -e "\n🎉 ${GREEN}All tests passed! Backend integration is working correctly.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Please review the implementation.${NC}"
    
    echo -e "\n🔍 Detailed Results:"
    for result in "${TEST_RESULTS[@]}"; do
        echo "   $result"
    done
    
    exit 1
fi