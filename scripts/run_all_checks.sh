#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}=== $1 ===${NC}"
}

# Function to run a command and check its exit code
run_check() {
    echo -e "\n${GREEN}Running: $1${NC}"
    if $1; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        exit 1
    fi
}

# 1. Code Quality Checks
print_section "Running Code Quality Checks"
run_check "npm run lint:strict"
run_check "npm run type-check"
run_check "npm run format:check"

# 2. Testing
print_section "Running Tests"
run_check "npm run test:unit"
run_check "npm run test:integration"
run_check "npm run test:e2e"

# 3. Coverage
print_section "Checking Test Coverage"
run_check "npm run test:coverage"

# 4. SonarQube Analysis
print_section "Running SonarQube Analysis"
run_check "npm run sonar"

# 5. CodeClimate Analysis
print_section "Running CodeClimate Analysis"
run_check "npm run codeclimate"

# 6. Build Verification
print_section "Verifying Build"
run_check "npm run build"

# 7. Security Checks
print_section "Running Security Checks"
run_check "npm audit"
run_check "npm run security:check"

# 8. Documentation Checks
print_section "Checking Documentation"
run_check "npm run docs:check"

echo -e "\n${GREEN}All checks completed successfully!${NC}" 