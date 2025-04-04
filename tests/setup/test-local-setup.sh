#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

echo "🔍 Testing Local Setup..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing $test_name... "
    if eval "$test_command"; then
        echo -e "${GREEN}✓ Passed${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. Check required tools
echo -e "\n${YELLOW}Checking required tools:${NC}"
run_test "Node.js installation" "command_exists node"
run_test "npm installation" "command_exists npm"
run_test "PostgreSQL installation" "command_exists psql"

# 2. Check configuration files and symlinks
echo -e "\n${YELLOW}Checking configuration files and symlinks:${NC}"
run_test "package.json symlink" "[ -L package.json ] && [ -f package.json ]"
run_test "tsconfig.json symlink" "[ -L tsconfig.json ] && [ -f tsconfig.json ]"
run_test "vite.config.ts symlink" "[ -L vite.config.ts ] && [ -f vite.config.ts ]"

# 3. Check environment setup
echo -e "\n${YELLOW}Checking environment setup:${NC}"
run_test ".env file exists" "[ -f .env ]"
run_test "Required env variables" "grep -q 'DATABASE_URL' .env && grep -q 'PORT' .env"

# 4. Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL:${NC}"
run_test "PostgreSQL running" "pg_isready"
run_test "Database exists" "psql -lqt | cut -d \| -f 1 | grep -qw 'meta_assistant'"

# 5. Test npm dependencies
echo -e "\n${YELLOW}Checking npm dependencies:${NC}"
run_test "node_modules exists" "[ -d node_modules ]"
run_test "Required dependencies" "npm list express typescript vite > /dev/null 2>&1"

# Summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Local setup is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please check the output above.${NC}"
    exit 1
fi 