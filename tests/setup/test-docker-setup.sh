#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

echo "🔍 Testing Docker Setup..."

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
run_test "Docker installation" "command_exists docker"
run_test "Docker Compose installation" "command_exists docker-compose"

# 2. Check Docker configuration files
echo -e "\n${YELLOW}Checking Docker configuration files:${NC}"
run_test "Dockerfile exists" "[ -f config/docker/Dockerfile ]"
run_test "docker-compose.yml exists" "[ -f config/docker/docker-compose.yml ]"

# 3. Check Docker daemon
echo -e "\n${YELLOW}Checking Docker daemon:${NC}"
run_test "Docker daemon running" "docker info > /dev/null 2>&1"

# 4. Check Docker containers
echo -e "\n${YELLOW}Checking Docker containers:${NC}"
run_test "App container running" "docker ps --format '{{.Names}}' | grep -q 'docker-app-1'"
run_test "DB container running" "docker ps --format '{{.Names}}' | grep -q 'docker-db-1'"

# 5. Check container health
echo -e "\n${YELLOW}Checking container health:${NC}"
run_test "App container healthy" "docker inspect -f '{{.State.Health.Status}}' docker-app-1 2>/dev/null | grep -q 'healthy'"
run_test "DB container healthy" "docker inspect -f '{{.State.Health.Status}}' docker-db-1 2>/dev/null | grep -q 'healthy'"

# 6. Check application accessibility
echo -e "\n${YELLOW}Checking application accessibility:${NC}"
run_test "API health endpoint" "curl -s http://localhost:3000/health > /dev/null"
run_test "Database connection" "docker exec docker-db-1 pg_isready -U postgres"

# 7. Check environment setup
echo -e "\n${YELLOW}Checking environment setup:${NC}"
run_test "Environment variables set" "docker exec docker-app-1 printenv | grep -q 'DATABASE_URL'"

# Summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Docker setup is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please check the output above.${NC}"
    exit 1
fi 